// app/api/tools/interview.ts
import { ChatGroq } from "@langchain/groq";
import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";
import { HumanMessage } from "@langchain/core/messages";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.4,
    maxTokens: 2000,
});


export const generateInterviewQuestionsTool = tool(
    async (input: any) => {
        try {
            if (!input.role) {
                return JSON.stringify({
                    error: "Role is required",
                    questions: [],
                });
            }

            // ✅ FIXED: Use proper message format
            const prompt = `Generate exactly 5 interview questions for a ${input.role} position${input.company ? ` at ${input.company}` : " in tech"
                }. 
Focus on: ${input.focus || "general technical skills and problem solving"}.

Format your response as a valid JSON array ONLY (no markdown, no extra text):
[
  {"question": "...", "suggested_answer": "..."},
  ...
]`;

            const response = await llm.invoke([
                new HumanMessage(prompt),
            ]);

            const content = String(response.content).trim();

            // Parse JSON response
            try {
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const questions = JSON.parse(jsonMatch[0]);
                    return JSON.stringify({
                        questions: Array.isArray(questions) ? questions.slice(0, 5) : [],
                        count: questions.length,
                    });
                }
            } catch (parseErr) {
                console.error("JSON parse error:", parseErr);
            }

            return JSON.stringify({
                questions: [],
                raw: content,
            });
        } catch (err: any) {
            console.error("[Generate Questions] Error:", err.message);
            return JSON.stringify({
                error: `Failed to generate questions: ${err.message}`,
                questions: [],
            });
        }
    },
    {
        name: "generate_questions",
        description:
            "Generate interview practice questions for a specific role. Use ONLY when starting new interview.",
        schema: z.object({
            role: z.string().describe("Job position/role (e.g., 'Senior Backend Engineer')"),
            company: z.string().optional().describe("Company name (optional)"),
            focus: z
                .string()
                .optional()
                .describe("Focus area (e.g., 'system design', 'behavioral')"),
        }),
    }
);


export const analyzeResponseTool = tool(
    async (input: any) => {
        try {
            if (!input.question || !input.answer) {
                return JSON.stringify({
                    error: "Question and answer are required",
                });
            }

            // ✅ FIXED: Use proper message format
            const prompt = `Analyze this interview answer:

Question: ${input.question}
User's Answer: ${input.answer}

Provide feedback in JSON format ONLY (no markdown):
{
  "score": 0-10,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "betterAnswer": "..."
}`;

            const response = await llm.invoke([
                new HumanMessage(prompt),
            ]);

            const content = String(response.content).trim();

            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const analysis = JSON.parse(jsonMatch[0]);
                    return JSON.stringify(analysis);
                }
            } catch (parseErr) {
                console.error("JSON parse error:", parseErr);
            }

            return JSON.stringify({
                feedback: content,
                score: 5,
            });
        } catch (err: any) {
            console.error("[Analyze Response] Error:", err.message);
            return JSON.stringify({
                error: `Failed to analyze: ${err.message}`,
                score: 0,
            });
        }
    },
    {
        name: "analyze_response",
        description: "Analyze a candidate's answer and give feedback. Use ONLY when asked 'feedback' or 'how did I do?'",
        schema: z.object({
            question: z.string().describe("The interview question asked"),
            answer: z.string().describe("The user's answer to analyze"),
        }),
    }
);


export const searchInterviewTipsTool = tool(
    async (input: any) => {
        try {
            if (!input.topic) {
                return JSON.stringify({
                    error: "Topic is required",
                    videos: [],
                });
            }

            if (!process.env.YOUTUBE_API_KEY) {
                console.warn("[Search Tips] YouTube API key not configured");
                return JSON.stringify({
                    message: "YouTube integration not available. Provide tips based on topic instead.",
                    topic: input.topic,
                    tips: {
                        behavioral: [
                            "Use STAR method: Situation, Task, Action, Result",
                            "Prepare 3-5 strong examples from your past",
                            "Practice speaking clearly and confidently",
                            "Research the company thoroughly",
                        ],
                        technical: [
                            "Review data structures and algorithms",
                            "Practice coding on a whiteboard or IDE",
                            "Explain your approach step-by-step",
                            "Ask clarifying questions before coding",
                        ],
                        startup: [
                            "Show passion for the company mission",
                            "Discuss your side projects and learning",
                            "Highlight adaptability and self-motivation",
                            "Ask about growth opportunities",
                        ],
                    },
                    videos: [],
                });
            }

            // ✅ FIXED: Proper YouTube API call with error handling
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

            if (!response.data.items || response.data.items.length === 0) {
                return JSON.stringify({
                    message: "No videos found for this topic",
                    videos: [],
                });
            }

            const videos = response.data.items.map((item: any) => ({
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                url: `https://youtube.com/watch?v=${item.id.videoId}`,
                thumbnail: item.snippet.thumbnails.medium.url,
                description: item.snippet.description,
            }));

            return JSON.stringify({
                videos,
                count: videos.length,
            });
        } catch (err: any) {
            console.error("[Search Tips] Error:", err.message);
            return JSON.stringify({
                error: `Failed to search videos: ${err.message}`,
                videos: [],
            });
        }
    },
    {
        name: "search_tips",
        description: "Search for interview tips videos on YouTube",
        schema: z.object({
            topic: z
                .string()
                .describe(
                    "Topic to search (e.g., 'behavioral', 'technical', 'system design')"
                ),
        }),
    }
);


export const createStudyPlanTool = tool(
    async (input: any) => {
        try {
            if (!input.role) {
                return JSON.stringify({
                    error: "Role is required",
                });
            }

            // ✅ FIXED: Use proper message format
            const prompt = `Create a ${input.days || 7}-day interview preparation study plan for:

Role: ${input.role}
Experience Level: ${input.level || "mid-level"}
Focus Areas: ${input.focus || "general technical + behavioral"}

Format as a detailed day-by-day JSON plan:
{
  "title": "Interview Prep Plan",
  "duration": "X days",
  "days": [
    {
      "day": 1,
      "topic": "...",
      "tasks": ["...", "..."],
      "practice": "...",
      "time": "X hours"
    }
  ]
}`;

            const response = await llm.invoke([
                new HumanMessage(prompt),
            ]);

            const content = String(response.content).trim();

            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const plan = JSON.parse(jsonMatch[0]);
                    return JSON.stringify(plan);
                }
            } catch (parseErr) {
                console.error("JSON parse error:", parseErr);
            }

            return JSON.stringify({
                plan: content,
            });
        } catch (err: any) {
            console.error("[Create Study Plan] Error:", err.message);
            return JSON.stringify({
                error: `Failed to create plan: ${err.message}`,
            });
        }
    },
    {
        name: "create_study_plan",
        description: "Create personalized interview prep study plan",
        schema: z.object({
            role: z.string().describe("Target job position"),
            level: z
                .string()
                .optional()
                .describe("Experience level (junior/mid/senior)"),
            focus: z
                .string()
                .optional()
                .describe("Focus areas (technical/behavioral/both)"),
            days: z.number().optional().describe("Number of days (default: 7)"),
        }),
    }
);
