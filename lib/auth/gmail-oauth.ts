// lib/auth/gmail-oauth.ts
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL
);

export function getAuthUrl() {
    const scopes = [
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    });

    return url;
}

export async function getTokenFromCode(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

export function setCredentials(tokens: any) {
    oauth2Client.setCredentials(tokens);
}

export function getOAuth2Client() {
    return oauth2Client;
}