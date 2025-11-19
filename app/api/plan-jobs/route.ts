import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { buildStudyPlan } from "@/lib/plan/engine";
import { buildMarkdownChecklist } from "@/lib/plan/markdown";
import type { BuildPlanInput } from "@/lib/plan/types";

/**
 * Create a plan generation job.
 * Returns jobId immediately, processing happens asynchronously.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BuildPlanInput & { userId?: string };
    const userId = body.userId || "00000000-0000-0000-0000-000000000000";

    // Create job
    const { data: job, error } = await supabaseServer
      .from("plan_generation_jobs")
      .insert({
        user_id: userId,
        status: "pending",
        payload: body,
        progress: { analyzer: "queued", tutor: "queued", planner: "queued" },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return NextResponse.json(
        { error: "Kunde inte skapa job" },
        { status: 500 }
      );
    }

    // Start processing in background (non-blocking)
    processPlanGenerationJob(job.id, body).catch((err) => {
      console.error("Error processing job:", err);
    });

    return NextResponse.json({ jobId: job.id, status: "pending" }, { status: 200 });
  } catch (err) {
    console.error("Error in plan-jobs route:", err);
    return NextResponse.json(
      { error: "Något gick fel" },
      { status: 500 }
    );
  }
}

/**
 * Process a plan generation job.
 * Updates progress as it goes through analyzer → tutor → planner phases.
 */
async function processPlanGenerationJob(jobId: string, input: BuildPlanInput & { userId?: string }) {
  try {
    // Update status to running
    await supabaseServer
      .from("plan_generation_jobs")
      .update({
        status: "running",
        progress: { analyzer: "running", tutor: "queued", planner: "queued" },
      })
      .eq("id", jobId);

    // Simulate analyzer phase (in real implementation, this would call analyzer agent)
    await new Promise((resolve) => setTimeout(resolve, 500));
    await supabaseServer
      .from("plan_generation_jobs")
      .update({
        progress: { analyzer: "done", tutor: "running", planner: "queued" },
      })
      .eq("id", jobId);

    // Simulate tutor phase
    await new Promise((resolve) => setTimeout(resolve, 500));
    await supabaseServer
      .from("plan_generation_jobs")
      .update({
        progress: { analyzer: "done", tutor: "done", planner: "running" },
      })
      .eq("id", jobId);

    // Generate plan (planner phase)
    const plan = await buildStudyPlan(input);
    const markdown = buildMarkdownChecklist(plan);

    // Save result
    await supabaseServer
      .from("plan_generation_jobs")
      .update({
        status: "completed",
        result: { plan, markdown },
        progress: { analyzer: "done", tutor: "done", planner: "done" },
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } catch (error: any) {
    console.error("Error processing job:", error);
    await supabaseServer
      .from("plan_generation_jobs")
      .update({
        status: "failed",
        error: error.message || "Unknown error",
      })
      .eq("id", jobId);
  }
}

