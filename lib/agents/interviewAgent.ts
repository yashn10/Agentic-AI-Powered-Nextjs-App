// lib/agents/interviewAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { generateInterviewQuestionsTool, analyzeResponseTool, searchInterviewTipsTool, createStudyPlanTool } from "@/app/api/tools/interview";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.4,
    maxTokens: 2000,
});


export async function getInterviewAgent() {
    const agent = createAgent({
        model: llm,
        tools: [
            generateInterviewQuestionsTool,
            analyzeResponseTool,
            searchInterviewTipsTool,
            createStudyPlanTool,
        ],
        systemPrompt: `
You are Live Interview Coach. Help users prepare for interviews.

IMPORTANT: When tools return JSON data, ALWAYS include the full JSON in your response for UI display.
Do NOT summarize or paraphrase tool results - pass them through exactly as returned.

Your responsibilities:
- Generate practice questions (when asked)
- Analyze user answers with detailed feedback
- Find interview tip resources
- Create personalized study plans
- Build confidence and reduce anxiety

When using tools:
1. Call the appropriate tool
2. If the tool returns JSON, include it DIRECTLY in your response
3. Add brief context/introduction but keep the JSON intact
4. If the tool returns an error, explain the error and suggest alternatives

Example format when returning questions:
"Here are your practice questions:

[INSERT FULL JSON FROM TOOL HERE]

Would you like me to analyze any of your answers?"

Be supportive, encouraging, and practical.
    `.trim(),
    });

    return agent;
}


export default getInterviewAgent;