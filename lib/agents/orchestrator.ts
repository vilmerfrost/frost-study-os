import { BaseAgent } from "./base";
import { AgentContext, BuildPlanInput, StudyPlan } from "./types";
import { AnalyzerAgent } from "./analyzer";
import { TutorAgent } from "./tutor";
import { PlannerAgent } from "./planner";
import { TaskGeneratorAgent } from "./taskGenerator";

export class AgentOrchestrator {
    private agents: BaseAgent[];

    constructor() {
        // Initialize agents in order
        this.agents = [
            new AnalyzerAgent(),
            new TutorAgent(),
            new PlannerAgent(),
            new TaskGeneratorAgent(),
        ];
    }

    async executePlan(input: BuildPlanInput): Promise<{ plan: StudyPlan; logs: any[] }> {
        let context: AgentContext = {
            input,
            logs: [],
        };

        try {
            for (const agent of this.agents) {
                context = await agent.execute(context);
            }
        } catch (error) {
            console.error("Agent pipeline failed:", error);
            context.logs.push({
                agentName: "Orchestrator",
                timestamp: new Date().toISOString(),
                message: "Pipeline failed",
                data: error,
            });
            throw error;
        }

        if (!context.draftPlan) {
            throw new Error("Pipeline completed but no plan was generated.");
        }

        return {
            plan: context.draftPlan,
            logs: context.logs,
        };
    }
}
