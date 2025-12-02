// app/api/tools/chat.ts
import { tool } from "langchain";
import z from "zod";


export const webSearchTool = tool(
    async ({ query }) => {
        // call to SerpAPI / Google / custom search
        return `Top web results for: ${query}`;
    },
    { name: "web_search", description: "Search the web for live info", schema: z.object({ query: z.string() }) }
);


export const calculatorTool = tool(
    ({ expr }) => eval(expr).toString(), // replace eval with safe evaluator
    { name: "calculator", description: "Evaluate math expressions", schema: z.object({ expr: z.string() }) }
);


// Action tools (email/calendar) - wrap your API call
export const sendEmailTool = tool(
    async ({ to, subject, body }) => {
        // call your email-sending backend
        return `Email queued to ${to}`;
    },
    { name: "send_email", description: "Send an email", schema: z.object({ to: z.string().email(), subject: z.string(), body: z.string() }) }
);
