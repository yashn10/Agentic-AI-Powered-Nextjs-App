// lib/agents/interviewAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent, tool } from "langchain";
import axios from "axios";
import * as z from "zod";


const generateInterviewQuestionsTool = tool(
    async (input: any) => {
        // Use Groq LLM to generate questions (already have it!)
        const prompt = `Generate 5 interview questions for a ${input.role} position in ${input.company || 'tech'}. 
    Focus on: ${input.focus || 'general technical skills and problem solving'}
    
    Return as JSON array with "question" and "suggested_answer" fields.`;

        // Use your existing LLM
        const llm = new ChatGroq({
            model: process.env.GROQ_MODEL,
        });

        const response = await llm.invoke(prompt);
        return response.content;
    },
    {
        name: "generate_questions",
        description: "Generate interview practice questions",
        schema: z.object({
            role: z.string().describe("Job position/role"),
            company: z.string().optional(),
            focus: z.string().optional()
        })
    }
);


const analyzeResponseTool = tool(
    async (input: any) => {
        // Use Groq to analyze user's answer
        const prompt = `Analyze this interview answer:
    
Question: ${input.question}
User's Answer: ${input.answer}

Provide:
1. Score (1-10)
2. Strengths
3. Areas for improvement
4. Better example answer (if applicable)

Be constructive and helpful.`;

        const llm = new ChatGroq({
            model: process.env.GROQ_MODEL,
        });

        const response = await llm.invoke(prompt);
        return response.content;
    },
    {
        name: "analyze_response",
        description: "Analyze and provide feedback on interview answer",
        schema: z.object({
            question: z.string().describe("The interview question"),
            answer: z.string().describe("User's answer to analyze")
        })
    }
);


const searchInterviewTipsTool = tool(
    async (input: any) => {
        // Use YouTube API (Free tier)
        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    q: `${input.topic} interview tips`,
                    part: "snippet",
                    maxResults: 5,
                    type: "video",
                    key: process.env.YOUTUBE_API_KEY,
                },
            }
        );

        const videos = response.data.items.map((item: any) => ({
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            url: `https://youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.medium.url,
        }));

        return JSON.stringify(videos);
    },
    {
        name: "search_tips",
        description: "Search for interview tips videos",
        schema: z.object({
            topic: z.string().describe("Topic to search (e.g., 'behavioral', 'technical', 'startup')")
        })
    }
);


const createStudyPlanTool = tool(
    async (input: any) => {
        // Use Groq to create personalized study plan
        const prompt = `Create a ${input.days || 7}-day interview preparation study plan for:
    
Role: ${input.role}
Experience Level: ${input.level || 'mid-level'}
Focus Areas: ${input.focus || 'general'}

Include:
- Daily topics to cover
- Practice questions per day
- Mock interview schedule
- Resources to review
- Tips and tricks

Format as a structured day-by-day plan.`;

        const llm = new ChatGroq({
            model: process.env.GROQ_MODEL,
        });

        const response = await llm.invoke(prompt);
        return response.content;
    },
    {
        name: "create_study_plan",
        description: "Create personalized interview prep study plan",
        schema: z.object({
            role: z.string().describe("Job position"),
            level: z.string().optional().describe("Experience level"),
            focus: z.string().optional(),
            days: z.number().optional()
        })
    }
);


export async function getInterviewAgent(userQuery: string) {
    const agent = createAgent({
        model: new ChatGroq({
            model: process.env.GROQ_MODEL,
            temperature: 0.4,
            maxTokens: 2000,
        }),
        tools: [
            generateInterviewQuestionsTool,
            analyzeResponseTool,
            searchInterviewTipsTool,
            createStudyPlanTool,
        ],
        systemPrompt: `
You are Live Interview Coach. Help users:
- Generate practice interview questions
- Analyze and provide feedback on answers
- Find helpful interview tip videos
- Create personalized study plans
- Build confidence for interviews
- Suggest common interview mistakes to avoid

Be supportive, constructive, and provide actionable feedback.
    `,
    });

    return agent;
}