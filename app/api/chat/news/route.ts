// app/api/chat/news/route.ts
import { NextResponse } from "next/server";
import { getNewsAgent } from "../../../../lib/agents/newsAgent";



function extractAssistantText(result: any, maxLen = 8000): string {
    // 1) Already a string
    if (typeof result === "string") return result.trim();

    // 2) OpenAI/Groq style choices => choices[0].message.content or choices[0].text
    try {
        if (result?.choices && Array.isArray(result.choices) && result.choices.length) {
            const c = result.choices[0];
            const text = c?.message?.content ?? c?.text;
            if (typeof text === "string") return text.trim();
        }
    } catch { }

    // 3) LangChain serialized messages shape:
    // { messages: [ { type: "constructor", id: ["langchain_core","messages","AIMessage"], kwargs: { content: "..." } }, ... ] }
    try {
        if (result?.messages && Array.isArray(result.messages)) {
            // search for the first AIMessage in reverse order (latest)
            for (let i = result.messages.length - 1; i >= 0; i--) {
                const entry = result.messages[i];
                const idArr = Array.isArray(entry?.id) ? entry.id.map(String) : [];
                const isAIMessage =
                    entry?.type === "constructor" &&
                    idArr.includes("AIMessage") || // some bundles include just 'AIMessage'
                    idArr.includes("messages") && idArr.some((v: string) => v.toLowerCase().includes("aimessage"));

                if (isAIMessage) {
                    const content = entry?.kwargs?.content ?? entry?.kwargs?.message ?? entry?.kwargs?.output;
                    if (typeof content === "string") return content.trim();
                    // sometimes kwargs.content is itself an object with 'content' field
                    if (content && typeof content === "object" && typeof content.content === "string") {
                        return content.content.trim();
                    }
                }
            }

            // if no AIMessage found, try last message's kwargs.content
            const last = result.messages[result.messages.length - 1];
            const alt = last?.kwargs?.content ?? last?.kwargs?.message;
            if (typeof alt === "string") return alt.trim();
            if (alt && typeof alt === "object" && typeof alt.content === "string") return alt.content.trim();
        }
    } catch (e) {
        // ignore and fallback
    }

    // 4) LangChain agent might return { output: "..." } or { content: "..." }
    if (result?.output && typeof result.output === "string") return result.output.trim();
    if (result?.content && typeof result.content === "string") return result.content.trim();
    if (result?.message && typeof result.message === "string") return result.message.trim();

    // 5) If it's an object or array, pretty-print (truncated)
    try {
        const pretty = JSON.stringify(result, null, 2);
        if (pretty.length > maxLen) return pretty.slice(0, maxLen) + "\n\n...[truncated]";
        return pretty;
    } catch {
        return String(result);
    }
}


export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return NextResponse.json({ error: "messages array required" }, { status: 400 });
        }

        // find last user message for the agent to handle
        const lastUser = [...messages].reverse().find((m: any) => m.role === "user") ?? messages[messages.length - 1];
        const userQuery = String(lastUser?.content ?? "").trim();
        if (!userQuery) return NextResponse.json({ error: "empty query" }, { status: 400 });

        // get singleton agent and invoke it
        const agent = getNewsAgent();

        // The agent API in langchain docs: agent.invoke({ messages: [...] }) or agent.run(input)
        // Try invoke with messages first; if your version expects .run() use that instead.
        let assistantResult: any;
        try {
            // prefer invoking conversation shape; if that fails, fallback to .run(userQuery)
            if (typeof agent.invoke === "function") {
                assistantResult = await agent.invoke({
                    messages: [{ role: "user", content: userQuery }],
                });
            } else if (typeof agent.run === "function") {
                assistantResult = await agent.run(userQuery);
            } else {
                throw new Error("Agent has neither invoke nor run method");
            }
        } catch (err) {
            console.error("Agent execution error:", err);
            return NextResponse.json({ error: "agent execution failed", detail: String(err) }, { status: 500 });
        }

        // agent.invoke may return a ToolMessage or an object depending on versions. Normalize to string:
        const assistantText = extractAssistantText(assistantResult);

        return NextResponse.json({ assistant: assistantText, raw: assistantResult });
    } catch (err) {
        console.error("news route error:", err);
        return NextResponse.json({ error: "internal server error", detail: String(err) }, { status: 500 });
    }
}
