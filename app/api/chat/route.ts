// import { createEmailAgent } from "@/lib/agents/emailAgent";
// import { createTravelAgent } from "@/lib/agents/travelAgent";
// // ... import others

// export async function POST(req: Request) {
//     const { agentType, threadId, message, userId } = await req.json();

//     let graph;
//     if (agentType === "email") graph = createEmailAgent(userId); // passes Gmail credentials from DB
//     else if (agentType === "travel") graph = createTravelAgent();

//     const stream = await graph.stream(
//         { messages: [{ role: "human", content: message }] },
//         { configurable: { thread_id: threadId } }
//     );

//     // Stream tokens + tool calls to client
//     const readable = new ReadableStream({
//         async start(controller) {
//             for await (const chunk of stream) {
//                 if (chunk.event === "on_chat_model_stream") {
//                     controller.enqueue(chunk.data.chunk);
//                 } else if (chunk.event === "on_tool_start") {
//                     controller.enqueue(`\n\nTool Call: ${chunk.data.name} ${JSON.stringify(chunk.data.input)}`);
//                 }
//                 // ... handle tool end, etc.
//             }
//             controller.close();
//         }
//     });

//     return new Response(readable, { headers: { "Content-Type": "text/event-stream" } });
// }