// lib/services/agentStorage.ts

import { Agent, CreateAgentInput, AgentType } from '@/lib/types/agent';

const STORAGE_KEY = 'personal_agents';

export const agentStorage = {

    // Get all agents
    getAllAgents: (): Agent[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to retrieve agents:', error);
            return [];
        }
    },

    // Get single agent by ID
    getAgentById: (id: string): Agent | null => {
        const agents = agentStorage.getAllAgents();
        return agents.find((agent) => agent.id === id) || null;
    },

    // Create new agent
    createAgent: (input: CreateAgentInput): Agent => {
        const agents = agentStorage.getAllAgents();
        const newAgent: Agent = {
            id: `agent_${Date.now()}`,
            name: input.name,
            description: input.description,
            systemPrompt: input.systemPrompt,
            agentTypes: input.agentTypes,
            tools: input.tools,
            created: new Date().toLocaleString(),
            status: 'active',
            lastModified: new Date().toLocaleString(),
        };

        agents.unshift(newAgent);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
        } catch (error) {
            console.error('Failed to save agent:', error);
        }

        return newAgent;
    },

    // Update agent
    updateAgent: (id: string, updates: Partial<CreateAgentInput>): Agent | null => {
        const agents = agentStorage.getAllAgents();
        const index = agents.findIndex((agent) => agent.id === id);

        if (index === -1) return null;

        agents[index] = {
            ...agents[index],
            ...(updates.name && { name: updates.name }),
            ...(updates.description && { description: updates.description }),
            ...(updates.systemPrompt && { systemPrompt: updates.systemPrompt }),
            ...(updates.agentTypes && { agentTypes: updates.agentTypes }),
            ...(updates.tools && { tools: updates.tools }),
            lastModified: new Date().toLocaleString(),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
        } catch (error) {
            console.error('Failed to update agent:', error);
        }

        return agents[index];
    },

    // Delete agent
    deleteAgent: (id: string): boolean => {
        const agents = agentStorage.getAllAgents();
        const filtered = agents.filter((agent) => agent.id !== id);

        if (filtered.length === agents.length) return false;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Failed to delete agent:', error);
        }

        return true;
    },

    // Toggle agent status
    toggleAgentStatus: (id: string): Agent | null => {
        const agents = agentStorage.getAllAgents();
        const agent = agents.find((a) => a.id === id);

        if (!agent) return null;

        agent.status = agent.status === 'active' ? 'idle' : 'active';
        agent.lastModified = new Date().toLocaleString();

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
        } catch (error) {
            console.error('Failed to update agent status:', error);
        }

        return agent;
    },

    // Clear all agents
    clearAllAgents: (): void => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear agents:', error);
        }
    },

};