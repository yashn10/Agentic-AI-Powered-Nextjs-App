// lib/pricing/tiers.ts

export const PRICING_TIERS = {
    free: {
        name: "Free",
        price: 0,
        limits: {
            messagesPerMonth: 100,
            agentsPerTeam: 3,
            memories: 100,
            workflows: 5,
            apiRequests: 0,
            teamMembers: 1,
        },
        features: ["Basic agents", "Message history"],
    },
    pro: {
        name: "Pro",
        price: 49,
        limits: {
            messagesPerMonth: 10000,
            agentsPerTeam: 50,
            memories: 10000,
            workflows: 100,
            apiRequests: 100000,
            teamMembers: 5,
        },
        features: [
            // ...freeTierFeatures,
            "Memory vault",
            "Workflows & automation",
            "Advanced analytics",
            "API access",
            "Custom training",
        ],
    },
    enterprise: {
        name: "Enterprise",
        price: "custom",
        limits: {
            messagesPerMonth: "unlimited",
            agentsPerTeam: "unlimited",
            memories: "unlimited",
            workflows: "unlimited",
            apiRequests: "unlimited",
            teamMembers: "unlimited",
        },
        features: [
            // ...proTierFeatures,
            "Dedicated account manager",
            "Custom integrations",
            "Custom training",
        ],
    },
};