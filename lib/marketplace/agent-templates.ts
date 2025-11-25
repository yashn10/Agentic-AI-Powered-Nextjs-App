// lib/marketplace/agent-templates.ts
// Let users create, share, and sell custom agents.

export interface AgentTemplate {
    id: string;
    name: string;
    description: string;
    creator: {
        id: string;
        name: string;
        avatar: string;
    };
    systemPrompt: string;
    tools: string[]; // Tool IDs
    pricing: {
        type: "free" | "one_time" | "subscription";
        amount?: number; // in cents
        currency?: "usd";
        period?: "monthly" | "yearly";
    };
    downloads: number;
    rating: number;
    reviews: Array<{
        userId: string;
        rating: number;
        comment: string;
    }>;
    tags: string[];
    createdAt: number;
    updatedAt: number;
}

// **Monetization**:
// - Revenue share: 70/30 split (creator/platform)
// - Featured listing: $50/month
// - Premium tier gets 80% cut