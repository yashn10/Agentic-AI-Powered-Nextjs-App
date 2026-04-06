// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";


export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json(
                { error: "Authorization code required" },
                { status: 400 }
            );
        }

        console.log("[Google Auth] Exchanging code for tokens...");

        // ✅ Exchange authorization code for tokens
        const tokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
                client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
                client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
                code,
                grant_type: "authorization_code",
                redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URL,
            }
        );

        const {
            access_token,
            refresh_token,
            expires_in,
        } = tokenResponse.data;

        console.log("[Google Auth] Tokens received:", {
            access_token: access_token ? "✓ Yes" : "✗ No",
            refresh_token: refresh_token ? "✓ Yes" : "✗ No",
        });

        const expiry_date = new Date().getTime() + (expires_in * 1000);

        return NextResponse.json({
            access_token,
            refresh_token,
            expiry_date,
            expires_in,
        });
    } catch (err: any) {
        console.error("[Google Auth] Error:", err);
        return NextResponse.json(
            {
                error: "Token exchange failed",
                detail: err?.response?.data || String(err),
            },
            { status: 500 }
        );
    }
}