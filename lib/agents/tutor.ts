import { BaseAgent } from "./base";
import { AgentContext, AgentRole } from "./types";

export class TutorAgent extends BaseAgent {
    name = "Tutor";
    role: AgentRole = "tutor";

    async execute(context: AgentContext): Promise<AgentContext> {
        this.log(context, "Reviewing analysis and formulating pedagogical strategy...");

        const { yearDay, energyStatus, timeConstraints, userMode } = context.analysis;

        // 1. Determine Block Mix based on YearDay type and Energy
        let recommendedBlocks: string[] = [];

        if (yearDay.type === "deep_dive") {
            if (energyStatus === "low" || userMode === "recovery") {
                recommendedBlocks = ["warmup", "review", "light_practice"];
            } else {
                recommendedBlocks = ["warmup", "deep_work", "practice", "reflection"];
            }
        } else if (yearDay.type === "integration") {
            recommendedBlocks = ["review", "synthesis", "planning"];
        } else {
            recommendedBlocks = ["light_reading", "reflection"];
        }

        // 2. Adjust for time
        if (timeConstraints.isShortSession) {
            // Keep only essential blocks
            recommendedBlocks = recommendedBlocks.filter(b => b !== "warmup" && b !== "reflection");
            if (recommendedBlocks.length === 0) recommendedBlocks = ["quick_review"];
        }

        context.tutorRecommendations = {
            recommendedBlocks,
            focusTopic: context.input.topicOverride || yearDay.focusArea,
            difficulty: energyStatus === "high" ? "challenging" : "standard",
        };

        this.log(context, "Tutor strategy ready", context.tutorRecommendations);
        return context;
    }
}
