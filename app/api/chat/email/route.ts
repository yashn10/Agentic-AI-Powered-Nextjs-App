// app/api/chat/email/route.ts - FIXED
import { NextResponse } from "next/server";
import { getEmailAgent } from "@/lib/agents/emailAgent";


export async function POST(req: Request) {
    try {
        const gmailTokenStr = req.headers.get("x-gmail-token");
        if (!gmailTokenStr) {
            return NextResponse.json(
                { error: "Gmail not connected. Please sign in with Google." },
                { status: 401 }
            );
        }

        // ✅ Parse the token object
        let gmailToken;
        try {
            gmailToken = JSON.parse(gmailTokenStr);
        } catch {
            gmailToken = { access_token: gmailTokenStr };
        }

        const body = await req.json();
        const messages = Array.isArray(body?.messages) ? body.messages : [];

        if (!messages.length) {
            return NextResponse.json({ error: "messages array required" }, { status: 400 });
        }

        const userQuery = String(messages[messages.length - 1]?.content ?? "").trim();
        if (!userQuery) {
            return NextResponse.json({ error: "empty query" }, { status: 400 });
        }

        console.log("[Email Agent] User query:", userQuery);
        console.log("[Email Agent] Token has refresh_token:", gmailToken?.refresh_token ? "✓ Yes" : "✗ No");

        const agent = await getEmailAgent();

        const result = await agent.invoke(
            { messages: [{ role: "user", content: userQuery }] },
            {
                configurable: {
                    gmailToken, // ✅ Pass full token object
                },
            }
        );

        const response = result.messages[result.messages.length - 1]?.content || "No response";

        return NextResponse.json({
            assistant: response,
        });
    } catch (err) {
        console.error("[Email Agent] Route error:", err);
        return NextResponse.json(
            { error: "internal server error", detail: String(err) },
            { status: 500 }
        );
    }
}