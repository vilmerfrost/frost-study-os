import { spawn } from "child_process";
import path from "path";

interface StudyFlowOptions {
  topic: string;
  phase: number;
  energy: number;
  timeBlock: number;
}

/**
 * Kör study_flow.py som ett separat Python-script och returnerar dess utskrift.
 * Scriptet måste finnas i projektroten och Python ska vara installerat i PATH.
 */
export async function runStudyFlowPlan({
  topic,
  phase,
  energy,
  timeBlock,
}: StudyFlowOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    // Find study_flow.py - it's in the parent directory (project root)
    // When running from study-os/, go up one level to find study_flow.py
    const projectRoot = path.resolve(process.cwd(), "..");
    const scriptPath = path.join(projectRoot, "study_flow.py");

    const args = [
      scriptPath,
      "--topic",
      topic,
      "--phase",
      String(phase),
      "--energy",
      String(energy),
      "--time",
      String(timeBlock),
    ];

    const child = spawn("python", args, {
      cwd: projectRoot,
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `study_flow.py exited with code ${code}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}


