// api/chat/personalAgent/route.ts
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

    const input = { messages }; // correct shape for agent.invoke

    if (valid.length > 1) {
        const agent = await getUnifiedAgent();
        const result = await agent.invoke(input);
        return NextResponse.json(result);
    }
    if (valid.includes("chat")) {
        const agent = await getChatAgent();
        const result = await agent.invoke(input);
        return NextResponse.json(result);
    }
    if (valid.includes("travel")) {
        const agent = await getTravelAgent();
        const result = await agent.invoke(input);
        return NextResponse.json(result);
    }
    if (valid.includes("web-search")) {
        const agent = await getCustomSearchAgent();
        const result = await agent.invoke(input);
        console.log(result);
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: "No agent matched" }, { status: 400 });
}