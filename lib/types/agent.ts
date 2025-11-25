// lib/types/agent.ts

export type AgentType = 'search' | 'travel' | 'chat';

export interface Agent {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    agentTypes: AgentType[];
    tools: string[];
    created: string;
    status: 'active' | 'idle';
    lastModified: string;
}

export interface CreateAgentInput {
    name: string;
    description: string;
    systemPrompt: string;
    agentTypes: AgentType[];
    tools: string[];
}