// lib/yearbrain/parser.ts
import { supabaseServer } from '@/lib/supabaseServer';

interface ParsedYearBrain {
  phases: Phase[];
  projects: FlagshipProject[];
}

interface Phase {
  phase_number: number;
  name: string;
  description: string;
  start_month: number;
  end_month: number;
  duration_weeks: number;
  flagship_project: string;
  modules: Module[];
  checkpoints: Checkpoint[];
}

interface Module {
  name: string;
  description: string;
  order_index: number;
  week_start: number;
  week_end: number;
  topics: Topic[];
}

interface Topic {
  name: string;
  description: string;
  order_index: number;
  prerequisites: string[];
  estimated_hours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Checkpoint {
  name: string;
  description: string;
  week_number: number;
  criteria: string[];
}

interface FlagshipProject {
  name: string;
  description: string;
  tier: number;
  phase_number: number;
}

export async function parseYearBrainFile(fileContent: string): Promise<ParsedYearBrain> {
  console.log('📄 Parsing YearBrain file, length:', fileContent.length);

  // Simple markdown parser
  const lines = fileContent.split('\n');
  console.log('📝 Total lines:', lines.length);

  const phases: Phase[] = [];
  const projects: FlagshipProject[] = [];

  let currentPhase: Phase | null = null;
  let currentModule: Module | null = null;

  // More flexible patterns - handle actual YearBrain format
  const phasePatterns = [
    /^##\s+PHASE\s+(\d+)\s*[–\-]\s*(.+?)(?:\s*\(Månad|$)/i,  // ## PHASE 1 – FOUNDATIONS + ML FOUNDRY (Månad 1–3)
    /^##\s+PHASE\s+(\d+)\s+[–\-]\s+(.+)/i,                   // ## PHASE 1 – FOUNDATIONS (alternative)
    /^##\s+Phase\s+(\d+)[:\.]\s*(.+)/i,                      // ## Phase 1: Name
    /^##\s+Phase\s+(\d+)\s*(.+)/i,                           // ## Phase 1 Name
    /^#\s+Phase\s+(\d+)[:\.]\s*(.+)/i,                       // # Phase 1: Name
  ];

  const modulePatterns = [
    /^###\s+(\d+\.\d+)\s+(.+)/i,                             // ### 1.1 Vem du är
    /^###\s+Module[:\s]+(.+)/i,                               // ### Module: Name
    /^###\s+(.+?)\s+Module/i,                                 // ### Name Module
    /^##\s+Module[:\s]+(.+)/i,                                // ## Module: Name
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect Phase headers - try multiple patterns
    let phaseMatch = null;
    for (const pattern of phasePatterns) {
      phaseMatch = line.match(pattern);
      if (phaseMatch) {
        console.log(`  🔍 Matched pattern for: ${line.substring(0, 80)}`);
        break;
      }
    }

    if (phaseMatch) {
      // Save previous phase
      if (currentPhase) {
        if (currentModule) {
          currentPhase.modules.push(currentModule);
          currentModule = null;
        }
        phases.push(currentPhase);
        console.log(`  ✅ Saved Phase ${currentPhase.phase_number}: ${currentPhase.name} with ${currentPhase.modules?.length || 0} modules`);
      }

      const phaseNum = parseInt(phaseMatch[1]);
      let phaseName = phaseMatch[2]?.trim() || `Phase ${phaseNum}`;

      // Clean up phase name (remove extra spaces, etc.)
      phaseName = phaseName.replace(/\s+/g, ' ').trim();

      // Extract month range if present (e.g., "Månad 1–3" or "0,5–1 månad")
      let startMonth = (phaseNum - 1) * 2 + 1;
      let endMonth = phaseNum * 2;

      // Try different month formats
      const monthMatch1 = line.match(/\(Månad\s+(\d+)[–\-](\d+)\)/i);  // (Månad 1–3)
      const monthMatch2 = line.match(/\((\d+)[,\.]?(\d*)[–\-](\d+)\s+månad\)/i);  // (0,5–1 månad)

      if (monthMatch1) {
        startMonth = parseInt(monthMatch1[1]);
        endMonth = parseInt(monthMatch1[2]);
      } else if (monthMatch2) {
        // Handle Phase 0 format: (0,5–1 månad)
        startMonth = Math.ceil(parseFloat(monthMatch2[1] + '.' + (monthMatch2[2] || '0')));
        endMonth = parseInt(monthMatch2[3]);
      } else if (phaseNum === 0) {
        // Phase 0 defaults
        startMonth = 0;
        endMonth = 1;
      }

      // Extract flagship project from phase name if mentioned
      let flagshipProject = '';
      if (phaseName.includes('ML Foundry')) flagshipProject = 'ML Foundry';
      else if (phaseName.includes('NF') || phaseName.includes('Night Factory')) flagshipProject = 'Night Factory';
      else if (phaseName.includes('Frost')) flagshipProject = 'Frost';

      currentPhase = {
        phase_number: phaseNum,
        name: phaseName,
        description: '',
        start_month: startMonth,
        end_month: endMonth,
        duration_weeks: (endMonth - startMonth + 1) * 4, // Approximate weeks
        flagship_project: flagshipProject,
        modules: [],
        checkpoints: [],
      };

      console.log(`  📍 Found Phase ${phaseNum}: ${phaseName} (Månad ${startMonth}-${endMonth})`);
      continue;
    }

    // Detect Module headers - try multiple patterns
    if (currentPhase) {
      let moduleMatch = null;
      for (const pattern of modulePatterns) {
        moduleMatch = line.match(pattern);
        if (moduleMatch) break;
      }

      if (moduleMatch) {
        // Save previous module
        if (currentModule) {
          currentPhase.modules.push(currentModule);
          console.log(`    ✅ Saved Module: ${currentModule.name} with ${currentModule.topics.length} topics`);
        }

        // Handle different match formats
        let moduleName = '';
        if (moduleMatch[2]) {
          // Pattern like "### 1.1 Vem du är"
          moduleName = `${moduleMatch[1]} ${moduleMatch[2]}`.trim();
        } else {
          moduleName = moduleMatch[1]?.trim() || 'Unnamed Module';
        }

        currentModule = {
          name: moduleName,
          description: '',
          order_index: (currentPhase.modules.length) + 1,
          week_start: 1,
          week_end: 6,
          topics: [],
        };

        console.log(`    📦 Found Module: ${moduleName}`);
        continue;
      }
    }

    // Detect Topics - more flexible patterns
    if (currentModule) {
      // Skip if line is a header or section marker
      if (line.startsWith('#') || line.startsWith('**') || line.match(/^[A-Z][^:]*:$/)) {
        // Not a topic
      } else {
        const topicPatterns = [
          /^[-*]\s+(.+)/,           // - Topic
          /^\d+[\.\)]\s+(.+)/,      // 1. Topic
          /^-\s+(.+)/,              // - Topic (alternative)
        ];

        for (const pattern of topicPatterns) {
          const topicMatch = line.match(pattern);
          if (topicMatch) {
            let topicName = topicMatch[1].trim();

            // Clean up topic name (remove markdown formatting)
            topicName = topicName
              .replace(/\*\*/g, '')  // Remove bold
              .replace(/_/g, '')     // Remove italic
              .replace(/`/g, '')     // Remove code
              .trim();

            // Skip if it looks like a header, section, or is too short
            if (
              topicName &&
              !topicName.startsWith('#') &&
              topicName.length > 3 &&
              !topicName.match(/^(V\d+|Block|Månad|Tech|Frontend|Backend|UI|Functions?):/i) &&
              !topicName.match(/^[A-Z][^:]*:$/) // Skip lines like "Tech:"
            ) {
              // Determine difficulty based on context
              let difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
              const lowerName = topicName.toLowerCase();
              if (lowerName.includes('grund') || lowerName.includes('intro') || lowerName.includes('basic')) {
                difficulty = 'beginner';
              } else if (lowerName.includes('advanced') || lowerName.includes('deep') || lowerName.includes('expert')) {
                difficulty = 'advanced';
              }

              currentModule.topics.push({
                name: topicName,
                description: '',
                order_index: (currentModule.topics.length) + 1,
                prerequisites: [],
                estimated_hours: 4,
                difficulty,
              });
              break;
            }
          }
        }
      }
    }
  }

  // Add last phase/module
  if (currentModule && currentPhase) {
    currentPhase.modules.push(currentModule);
    console.log(`    ✅ Saved final Module: ${currentModule.name} with ${currentModule.topics.length} topics`);
  }
  if (currentPhase) {
    phases.push(currentPhase);
    console.log(`  ✅ Saved final Phase ${currentPhase.phase_number}: ${currentPhase.name} with ${currentPhase.modules.length} modules`);
  }

  // Extract checkpoints from section 8
  console.log('🔍 Extracting checkpoints from section 8...');
  let inCheckpointSection = false;
  let currentCheckpointPhase = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect checkpoint section
    if (line.match(/^##\s+8\.?\s+Checkpoints/i)) {
      inCheckpointSection = true;
      continue;
    }

    if (inCheckpointSection && line.match(/^##/)) {
      // New section, stop
      break;
    }

    // Detect phase checkpoints (e.g., "**Phase 1 (Foundations):**")
    const phaseCheckpointMatch = line.match(/\*\*Phase\s+(\d+)\s*\([^)]+\):\*\*/i);
    if (phaseCheckpointMatch) {
      currentCheckpointPhase = parseInt(phaseCheckpointMatch[1]);
      continue;
    }

    // Extract checkpoint items (e.g., "- LA–checkpoint:")
    if (currentCheckpointPhase > 0 && line.match(/^[-*]\s+([^:]+)[–\-]?checkpoint:/i)) {
      const checkpointMatch = line.match(/^[-*]\s+([^:]+)[–\-]?checkpoint:\s*(.+)/i);
      if (checkpointMatch) {
        const checkpointName = checkpointMatch[1].trim();
        const checkpointDesc = checkpointMatch[2]?.trim() || '';

        // Find the phase
        const phase = phases.find(p => p.phase_number === currentCheckpointPhase);
        if (phase) {
          // Determine week (usually week 6 or 12)
          const weekNumber = phase.checkpoints.length === 0 ? 6 : 12;

          // Extract criteria from following lines
          const criteria: string[] = [];
          for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
            const nextLine = lines[j].trim();
            if (nextLine.match(/^[-*]\s+/)) {
              criteria.push(nextLine.replace(/^[-*]\s+/, '').trim());
            } else if (nextLine.match(/^##|\*\*Phase/)) {
              break;
            }
          }

          phase.checkpoints.push({
            name: `${checkpointName} Checkpoint`,
            description: checkpointDesc || `Checkpoint for ${checkpointName}`,
            week_number: weekNumber,
            criteria: criteria.length > 0 ? criteria : [checkpointDesc],
          });

          console.log(`    ✅ Added checkpoint for Phase ${currentCheckpointPhase}: ${checkpointName}`);
        }
      }
    }
  }

  // Extract flagship projects
  console.log('🚀 Extracting flagship projects...');
  for (const phase of phases) {
    if (phase.flagship_project) {
      // Determine tier based on phase
      let tier = 2;
      if (phase.flagship_project === 'ML Foundry' || phase.flagship_project === 'Night Factory') {
        tier = 1;
      }

      projects.push({
        name: phase.flagship_project,
        description: `Flagship project for ${phase.name}`,
        tier,
        phase_number: phase.phase_number,
      });

      console.log(`    ✅ Added project: ${phase.flagship_project} (Tier ${tier})`);
    }
  }

  console.log(`📊 Parse complete: ${phases.length} phases, ${projects.length} projects`);
  console.log(`   Total modules: ${phases.reduce((sum, p) => sum + p.modules.length, 0)}`);
  console.log(`   Total topics: ${phases.reduce((sum, p) => sum + p.modules.reduce((s, m) => s + m.topics.length, 0), 0)}`);
  console.log(`   Total checkpoints: ${phases.reduce((sum, p) => sum + p.checkpoints.length, 0)}`);

  if (phases.length === 0) {
    console.warn('⚠️ No phases found! Check your markdown format.');
    console.log('First 20 lines of file:');
    lines.slice(0, 20).forEach((line, idx) => {
      console.log(`  ${idx + 1}: ${line.substring(0, 80)}`);
    });
  }

  return { phases, projects };
}

export async function syncYearBrainToDatabase(
  userId: string,
  parsedData: ParsedYearBrain,
) {
  console.log(`📊 Syncing ${parsedData.phases.length} phases for user ${userId}`);

  if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
    throw new Error('Invalid user_id provided');
  }

  // 1. Insert Phases
  for (const phaseData of parsedData.phases) {
    console.log(`  → Processing Phase ${phaseData.phase_number}: ${phaseData.name}`);

    // First, try to get existing phase
    const { data: existingPhase, error: fetchError } = await supabaseServer
      .from('phases')
      .select('id')
      .eq('user_id', userId)
      .eq('phase_number', phaseData.phase_number)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found, which is OK
      console.error(`  ❌ Error fetching existing phase:`, fetchError);
    }

    let phase;
    if (existingPhase) {
      // Update existing
      console.log(`    🔄 Updating existing phase (ID: ${existingPhase.id})`);
      const { data: updatedPhase, error: updateError } = await supabaseServer
        .from('phases')
        .update({
          name: phaseData.name,
          description: phaseData.description || '',
          start_month: phaseData.start_month,
          end_month: phaseData.end_month,
          duration_weeks: phaseData.duration_weeks,
          flagship_project: phaseData.flagship_project || null,
          status: phaseData.phase_number === 1 ? 'active' : 'upcoming',
        })
        .eq('id', existingPhase.id)
        .select()
        .single();

      if (updateError) {
        console.error(`  ❌ Error updating phase:`, updateError);
        throw new Error(`Failed to update phase ${phaseData.phase_number}: ${updateError.message}`);
      }
      phase = updatedPhase;
      console.log(`    ✅ Phase updated successfully`);
    } else {
      // Insert new
      console.log(`    ➕ Inserting new phase`);
      const insertData = {
        user_id: userId,
        phase_number: phaseData.phase_number,
        name: phaseData.name,
        description: phaseData.description || '',
        start_month: phaseData.start_month,
        end_month: phaseData.end_month,
        duration_weeks: phaseData.duration_weeks,
        flagship_project: phaseData.flagship_project || null,
        status: phaseData.phase_number === 1 ? 'active' : 'upcoming',
      };
      console.log(`    📝 Insert data:`, JSON.stringify(insertData, null, 2));

      const { data: newPhase, error: insertError } = await supabaseServer
        .from('phases')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error(`  ❌ Error inserting phase:`, insertError);
        console.error(`    Details:`, JSON.stringify(insertError, null, 2));
        throw new Error(`Failed to insert phase ${phaseData.phase_number}: ${insertError.message}`);
      }
      phase = newPhase;
      console.log(`    ✅ Phase inserted successfully (ID: ${phase.id})`);
    }

    if (!phase || !phase.id) {
      console.error(`  ❌ Failed to get phase after insert/update`);
      throw new Error(`Phase ${phaseData.phase_number} was not created/updated properly`);
    }

    console.log(`  ✅ Phase ${phaseData.phase_number} synced (ID: ${phase.id})`);

    // 2. Delete existing modules for this phase (to avoid duplicates)
    await supabaseServer
      .from('modules')
      .delete()
      .eq('phase_id', phase.id);

    // 3. Insert Modules
    for (const moduleData of phaseData.modules) {
      console.log(`    → Processing Module: ${moduleData.name}`);

      const { data: module, error: moduleError } = await supabaseServer
        .from('modules')
        .insert({
          phase_id: phase.id,
          name: moduleData.name,
          description: moduleData.description || '',
          order_index: moduleData.order_index,
          week_start: moduleData.week_start,
          week_end: moduleData.week_end,
        })
        .select()
        .single();

      if (moduleError) {
        console.error(`    ❌ Error inserting module:`, moduleError);
        continue;
      }

      if (!module) {
        console.error(`    ❌ Failed to get module after insert`);
        continue;
      }

      // 4. Delete existing topics for this module
      await supabaseServer
        .from('topics')
        .delete()
        .eq('module_id', module.id);

      // 5. Insert Topics
      for (const topicData of moduleData.topics) {
        const { error: topicError } = await supabaseServer.from('topics').insert({
          module_id: module.id,
          name: topicData.name,
          description: topicData.description || '',
          order_index: topicData.order_index,
          prerequisites: topicData.prerequisites || [],
          estimated_hours: topicData.estimated_hours || 4,
          difficulty: topicData.difficulty || 'intermediate',
        });

        if (topicError) {
          console.error(`      ❌ Error inserting topic ${topicData.name}:`, topicError);
        }
      }

      console.log(`    ✅ Module synced with ${moduleData.topics.length} topics`);
    }

    // 6. Delete existing checkpoints for this phase
    console.log(`    🗑️  Deleting existing checkpoints for phase ${phase.id}`);
    const { error: deleteCheckpointsError } = await supabaseServer
      .from('checkpoints')
      .delete()
      .eq('phase_id', phase.id);

    if (deleteCheckpointsError) {
      console.warn(`    ⚠️  Warning deleting checkpoints:`, deleteCheckpointsError);
    }

    // 7. Insert Checkpoints
    for (const checkpointData of phaseData.checkpoints) {
      const { error: checkpointError } = await supabaseServer.from('checkpoints').insert({
        phase_id: phase.id,
        name: checkpointData.name,
        description: checkpointData.description || '',
        week_number: checkpointData.week_number,
        criteria: checkpointData.criteria || [],
      });

      if (checkpointError) {
        console.error(`    ❌ Error inserting checkpoint:`, checkpointError);
      }
    }

    if (phaseData.checkpoints.length > 0) {
      console.log(`  ✅ ${phaseData.checkpoints.length} checkpoints synced`);
    }
  }

  // 8. Insert Flagship Projects
  for (const projectData of parsedData.projects) {
    console.log(`  → Processing Project: ${projectData.name}`);

    const { data: phase } = await supabaseServer
      .from('phases')
      .select('id')
      .eq('user_id', userId)
      .eq('phase_number', projectData.phase_number)
      .maybeSingle();

    if (phase) {
      // Check if project exists
      const { data: existingProject } = await supabaseServer
        .from('flagship_projects')
        .select('id')
        .eq('user_id', userId)
        .eq('name', projectData.name)
        .maybeSingle();

      if (existingProject) {
        // Update existing
        const { error: updateError } = await supabaseServer
          .from('flagship_projects')
          .update({
            phase_id: phase.id,
            description: projectData.description || '',
            tier: projectData.tier,
            status: projectData.phase_number === 1 ? 'active' : 'conceptual',
          })
          .eq('id', existingProject.id);

        if (updateError) {
          console.error(`    ❌ Error updating project:`, updateError);
        } else {
          console.log(`    ✅ Project updated`);
        }
      } else {
        // Insert new
        const { error: insertError } = await supabaseServer.from('flagship_projects').insert({
          user_id: userId,
          phase_id: phase.id,
          name: projectData.name,
          description: projectData.description || '',
          tier: projectData.tier,
          status: projectData.phase_number === 1 ? 'active' : 'conceptual',
        });

        if (insertError) {
          console.error(`    ❌ Error inserting project:`, insertError);
        } else {
          console.log(`    ✅ Project inserted`);
        }
      }
    } else {
      console.error(`    ❌ Phase ${projectData.phase_number} not found for project`);
    }
  }

  // Verify data was saved
  console.log('🔍 Verifying saved data...');
  const { data: verifyPhases, error: verifyError } = await supabaseServer
    .from('phases')
    .select('id, phase_number, name')
    .eq('user_id', userId)
    .order('phase_number', { ascending: true });

  if (verifyError) {
    console.error('❌ Error verifying phases:', verifyError);
    throw new Error(`Failed to verify saved data: ${verifyError.message}`);
  } else {
    console.log(`✅ Verification: ${verifyPhases?.length || 0} phases found in database`);
    if (verifyPhases && verifyPhases.length > 0) {
      verifyPhases.forEach(p => {
        console.log(`   - Phase ${p.phase_number}: ${p.name} (ID: ${p.id})`);
      });
    } else {
      console.warn('⚠️  WARNING: No phases found after sync! Data may not have been saved.');
    }
  }

  console.log('✅ YearBrain synced to database successfully!');
}

