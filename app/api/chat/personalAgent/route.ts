// app/api/chat/personalAgent/route.ts
import { NextResponse } from 'next/server';
import getChatAgent from "@/lib/agents/chatAgent";
import getTravelAgent from "@/lib/agents/travelAgent";
import { getCustomSearchAgent, getUnifiedAgent } from "@/lib/agents/customAgent";


const ALLOWED_AGENTS = new Set(["chat", "travel", "web-search", "custom"]);


export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));

    const messages = Array.isArray(body?.messages) ? body.messages : [];
    if (!messages.length) {
        return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const requested = Array.isArray(body?.agent?.tools) ? body.agent.tools : [];
    const valid = requested.filter((t: string) => ALLOWED_AGENTS.has(t));

    if (!valid.length) {
        return NextResponse.json({ error: "No supported agent requested" }, { status: 400 });
    }

    const input = { messages };

    try {
        let agent;

        if (valid.length > 1) {
            agent = await getUnifiedAgent();
        } else if (valid.includes("chat")) {
            agent = await getChatAgent();
        } else if (valid.includes("travel")) {
            agent = await getTravelAgent();
        } else if (valid.includes("web-search")) {
            agent = await getCustomSearchAgent();
        } else {
            return NextResponse.json({ error: "No agent matched" }, { status: 400 });
        }

        const result = await agent.invoke(input);

        // Standardized response format — extract assistant content
        const response = result.messages[result.messages.length - 1]?.content || "No response";

        return NextResponse.json({
            assistant: response,
        });
    } catch (err) {
        console.error("[Personal Agent] Error:", err);
        return NextResponse.json(
            { error: "agent execution failed", detail: String(err) },
            { status: 500 }
        );
    }
}