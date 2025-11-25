// lib/training/custom-training.ts
// Let users fine-tune agents on their specific data.

export interface TrainingJob {
    id: string;
    userId: string;
    name: string;
    agentId: string;
    dataSource: {
        type: "file" | "api" | "database";
        config: any;
    };
    status: "pending" | "in_progress" | "completed" | "failed";
    trainingData: {
        totalDocuments: number;
        totalTokens: number;
    };
    metrics: {
        accuracy: number;
        f1Score: number;
        trainingTime: number;
    };
    createdAt: number;
    completedAt?: number;
}

// **Monetization**:
// - Credits system: 1000 credits = $10
// - Fine-tuning costs credits based on data size
// - Premium training: Faster GPU access ($99/job)