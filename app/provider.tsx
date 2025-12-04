// app/providers.tsx
"use client";

// import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import userContext, { User } from "@/components/userContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<User | null>(null);

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID;

    if (!clientId) {
        throw new Error(
            "Missing NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID environment variable. Add it to .env.local."
        );
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <userContext.Provider value={{ user, setUser }}>
                {children}
            </userContext.Provider>
        </GoogleOAuthProvider>
    );
}