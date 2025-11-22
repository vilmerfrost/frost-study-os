import { AgentContext, AgentLog, AgentRole } from "./types";

export abstract class BaseAgent {
    abstract name: string;
    abstract role: AgentRole;

    protected log(context: AgentContext, message: string, data?: any) {
        const logEntry: AgentLog = {
            agentName: this.name,
            timestamp: new Date().toISOString(),
            message,
            data,
        };
        context.logs.push(logEntry);
        // In a real system, we might stream this log via SSE immediately
    }

    abstract execute(context: AgentContext): Promise<AgentContext>;
}
