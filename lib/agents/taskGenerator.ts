import { BaseAgent } from "./base";
import { AgentContext, AgentRole } from "./types";

export class TaskGeneratorAgent extends BaseAgent {
    name = "TaskGenerator";
    role: AgentRole = "task_generator";

    async execute(context: AgentContext): Promise<AgentContext> {
        this.log(context, "Generating specific tasks for blocks...");

        if (!context.draftPlan) return context;

        // In a real implementation, this would call Ollama/LLM to generate specific tasks
        // based on the topic and block type.
        // For now, we will enrich the description with simulated LLM output.

        for (const block of context.draftPlan.blocks) {
            const tasks = [
                `Review core concepts of ${block.topic}`,
                `Solve 2 practice problems related to ${block.topic}`,
                `Summarize key takeaways`,
            ];

            // Append tasks to description
            block.description += "\n\nTasks:\n" + tasks.map(t => "- " + t).join("\n");
        }

        this.log(context, "Tasks generated and appended to blocks.");
        return context;
    }
}
