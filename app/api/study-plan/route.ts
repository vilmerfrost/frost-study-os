import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { AgentOrchestrator } from "@/lib/agents/orchestrator";
import { BuildPlanInput } from "@/lib/agents/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...input } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Create job
    const { data: job, error } = await supabase
      .from("plan_generation_jobs")
      .insert({
        user_id: userId,
        input: input,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger async processing (simulated for now by running immediately but not awaiting result for the response)
    // In a real serverless env, this would be a separate function or queue.
    processJob(job.id, { userId, ...input });

    return NextResponse.json({ jobId: job.id, status: "pending" });
  } catch (error) {
    console.error("Error creating plan job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const { data: job, error } = await supabase
    .from("plan_generation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

// Helper to process job (in-memory for now)
async function processJob(jobId: string, input: BuildPlanInput) {
  try {
    await supabase
      .from("plan_generation_jobs")
      .update({ status: "processing", progress: 10 })
      .eq("id", jobId);

    const orchestrator = new AgentOrchestrator();
    const { plan, logs } = await orchestrator.executePlan(input);

    await supabase
      .from("plan_generation_jobs")
      .update({
        status: "completed",
        progress: 100,
        result: plan as any,
        agent_logs: logs as any,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } catch (error: any) {
    console.error("Job processing failed:", error);
    await supabase
      .from("plan_generation_jobs")
      .update({
        status: "failed",
        error: error.message,
      })
      .eq("id", jobId);
  }
}
