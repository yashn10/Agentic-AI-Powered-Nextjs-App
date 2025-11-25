// lib/marketplace/types.ts
import * as z from "zod";

export const AgentTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    creator: z.object({
        id: z.string(),
        name: z.string(),
        avatar: z.string().url().optional(),
    }),
    systemPrompt: z.string().min(20),
    tools: z.array(z.string()), // Tool IDs
    category: z.enum([
        "productivity",
        "business",
        "research",
        "support",
        "marketing",
        "other",
    ]),
    pricing: z.object({
        type: z.enum(["free", "one_time", "subscription"]),
        amount: z.number().optional(),
        currency: z.string().default("usd"),
        period: z.enum(["monthly", "yearly"]).optional(),
    }),
    downloads: z.number().default(0),
    rating: z.number().min(0).max(5).default(0),
    reviews: z
        .array(
            z.object({
                userId: z.string(),
                userName: z.string(),
                rating: z.number().min(1).max(5),
                comment: z.string(),
                createdAt: z.number(),
            })
        )
        .default([]),
    tags: z.array(z.string()).default([]),
    imageUrl: z.string().url().optional(),
    demoVideoUrl: z.string().url().optional(),
    stats: z.object({
        monthlyDownloads: z.number().default(0),
        totalEarnings: z.number().default(0),
    }),
    createdAt: z.number(),
    updatedAt: z.number(),
    published: z.boolean().default(false),
});

export type AgentTemplate = z.infer<typeof AgentTemplateSchema>;

export const MarketplacePurchaseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    templateId: z.string(),
    creatorId: z.string(),
    amount: z.number(),
    currency: z.string(),
    stripePaymentId: z.string(),
    status: z.enum(["pending", "completed", "failed", "refunded"]),
    createdAt: z.number(),
});

export type MarketplacePurchase = z.infer<typeof MarketplacePurchaseSchema>;