// lib/llm/groq.ts — Centralized LLM configuration
import { ChatGroq } from "@langchain/groq";


/**
 * Default LLM (Llama 3.3-70B) — used by Chat, Email, Interview, Custom agents
 * Good for: general conversation, tool calling, structured output
 */
export const llmDefault = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.3,
    maxTokens: 1500,
});


/**
 * Scout LLM (Llama 4 Scout 17B) — used by News, Travel agents
 * Good for: fast responses, search-augmented tasks
 */
export const llmScout = new ChatGroq({
    model: process.env.GROQ_MODEL_3,
    temperature: 0.2,
    maxTokens: 2000,
});


/**
 * Creative LLM — for tasks needing more creativity (interview questions, study plans)
 */
export const llmCreative = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.4,
    maxTokens: 2000,
});
