import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Get job status and result.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: job, error } = await supabaseServer
      .from("plan_generation_jobs")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: job.id,
        status: job.status,
        progress: job.progress,
        result: job.status === "completed" ? job.result : null,
        error: job.status === "failed" ? job.error : null,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in plan-jobs/[id] route:", err);
    return NextResponse.json(
      { error: "Något gick fel" },
      { status: 500 }
    );
  }
}

