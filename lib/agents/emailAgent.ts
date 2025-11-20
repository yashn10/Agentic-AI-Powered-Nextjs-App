// // lib/agents/emailAgent.ts
// import { createReactAgent } from "@langchain/langgraph/prebuilt";
// import { Groq } from "@langchain/groq";
// import { GmailToolKit } from "langchain/tools/gmail"; // or custom wrapper

// export function createEmailAgent(userId: string) {
//     const llm = new Groq({ model: "llama-3.1-70b-versatile", temperature: 0.5 });

//     // Get user Gmail tokens from Supabase
//     const tokens = await getGmailTokens(userId);

//     const toolkit = GmailToolKit({ tokens });

//     const tools = toolkit.getTools(); // search_mail, send_mail, create_label, etc.

//     const agent = createReactAgent({
//         llm,
//         tools,
//         systemMessage: `You are an autonomous email assistant. Always read inbox first, summarize unread, draft perfect replies in my tone, ask for confirmation before sending important emails. Use tools proactively.`,
//     });

//     return agent;
// }