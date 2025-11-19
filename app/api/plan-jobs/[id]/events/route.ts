import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * SSE endpoint for streaming plan generation progress.
 * Clients connect to this endpoint to receive real-time updates.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastProgress: any = null;

      // Poll for updates every 500ms
      const interval = setInterval(async () => {
        try {
          const { data: job, error } = await supabaseServer
            .from("plan_generation_jobs")
            .select("*")
            .eq("id", jobId)
            .single();

          if (error || !job) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Job not found" })}\n\n`)
            );
            clearInterval(interval);
            controller.close();
            return;
          }

          // Check if progress changed
          const progressStr = JSON.stringify(job.progress);
          if (progressStr !== JSON.stringify(lastProgress)) {
            lastProgress = job.progress;

            // Send progress update
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  progress: job.progress,
                  status: job.status,
                })}\n\n`
              )
            );
          }

          // Check if job is complete
          if (job.status === "completed") {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "complete",
                  result: job.result,
                })}\n\n`
              )
            );
            clearInterval(interval);
            controller.close();
            return;
          }

          // Check if job failed
          if (job.status === "failed") {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: job.error || "Job failed",
                })}\n\n`
              )
            );
            clearInterval(interval);
            controller.close();
            return;
          }
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: error.message || "Unknown error",
              })}\n\n`
            )
          );
          clearInterval(interval);
          controller.close();
        }
      }, 500);

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

