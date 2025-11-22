import { BaseAgent } from "./base";
import { AgentContext, AgentRole } from "./types";
import { getAdaptiveYearDay } from "../yearBrain/state";

export class AnalyzerAgent extends BaseAgent {
    name = "Analyzer";
    role: AgentRole = "analyzer";

    async execute(context: AgentContext): Promise<AgentContext> {
        this.log(context, "Starting analysis...");

        // 1. Get Adaptive YearDay context
        const yearDay = await getAdaptiveYearDay(context.input.userId);
        this.log(context, `Fetched YearDay: ${yearDay.title}`, yearDay);

        // 2. Analyze energy vs requirements
        const energy = context.input.energyLevel;
        let energyStatus = "optimal";
        if (energy < 4) energyStatus = "low";
        else if (energy > 8) energyStatus = "high";

        // 3. Determine constraints
        const timeConstraints = {
            totalMinutes: context.input.availableMinutes,
            isShortSession: context.input.availableMinutes < 45,
        };

        context.analysis = {
            yearDay,
            energyStatus,
            timeConstraints,
            userMode: context.input.mode,
        };

        this.log(context, "Analysis complete", context.analysis);
        return context;
    }
}
