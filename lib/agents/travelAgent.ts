// lib/agents/travelAgent.ts
import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { searchFlightsTool, searchHotelsTool, getWeatherTool, getDirectionsTool, geocodeTool } from "@/app/api/tools/travel";


const llm = new ChatGroq({
    model: process.env.GROQ_MODEL,
    temperature: 0.3,
    maxTokens: 2000,
});


export async function getTravelAgent() {
    const agent = createAgent({
        model: llm,
        tools: [
            geocodeTool,
            searchFlightsTool,
            searchHotelsTool,
            getWeatherTool,
            getDirectionsTool,
        ],
        systemPrompt: `
You are Live Travel Orchestrator. Create comprehensive travel guides.

When asked for a destination guide:
1. FIRST: Use geocode_location to find coordinates for the destination
2. THEN: Get weather forecast using those coordinates
3. For flights: Ask user for travel dates, then search flights
4. For hotels: Use the destination city code and ask for dates
5. Compile everything into a structured travel guide

Format your response as:
- **Destination Overview**: Basic info
- **Best Time to Visit**: From weather data
- **Weather Forecast**: 7-day forecast
- **Flights**: If dates provided
- **Hotels**: If dates provided
- **Top Attractions**: General knowledge
- **Travel Tips**: Practical advice

Always be helpful and provide comprehensive information.
    `.trim(),
    });

    return agent;
}


export default getTravelAgent;