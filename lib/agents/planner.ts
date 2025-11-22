import { BaseAgent } from "./base";
import { AgentContext, AgentRole, StudyBlock, StudyPlan } from "./types";

export class PlannerAgent extends BaseAgent {
    name = "Planner";
    role: AgentRole = "planner";

    async execute(context: AgentContext): Promise<AgentContext> {
        this.log(context, "Constructing study plan...");

        const { recommendedBlocks, focusTopic } = context.tutorRecommendations;
        const totalMinutes = context.input.availableMinutes;

        // Simple heuristic allocation
        const blocks: StudyBlock[] = [];
        let remainingMinutes = totalMinutes;

        // Allocate time roughly
        const blockCount = recommendedBlocks.length;
        const avgTime = Math.floor(totalMinutes / blockCount);

        recommendedBlocks.forEach((type: string, index: number) => {
            let duration = avgTime;
            // Adjust last block to fit exact time
            if (index === blockCount - 1) {
                duration = remainingMinutes;
            }

            blocks.push({
                id: `block-${index}`,
                type: this.mapTypeToBlockType(type),
                durationMinutes: duration,
                topic: focusTopic,
                description: `Focus on ${type} for ${focusTopic}`,
            });

            remainingMinutes -= duration;
        });

        const plan: StudyPlan = {
            id: crypto.randomUUID(),
            date: context.input.date,
            totalDuration: totalMinutes,
            blocks,
            reasoning: `Plan based on ${context.analysis.energyStatus} energy and ${context.analysis.yearDay.type} day.`,
            confidence: 0.9,
        };

        context.draftPlan = plan;
        this.log(context, "Plan constructed", plan);
        return context;
    }

    private mapTypeToBlockType(type: string): "deep_dive" | "review" | "practice" | "reflection" {
        if (type.includes("deep")) return "deep_dive";
        if (type.includes("review")) return "review";
        if (type.includes("practice")) return "practice";
        return "reflection";
    }
}
