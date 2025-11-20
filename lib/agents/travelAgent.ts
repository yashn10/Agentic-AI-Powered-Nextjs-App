// // lib/agents/travelAgent.ts
// import { StateGraph } from "@langchain/langgraph";
// import { TavilySearch } from "@langchain/community/tools/tavily_search";
// import { ExaSearchTool } from "custom exa tool";

// const searchTool = new TavilySearch({ apiKey: process.env.TAVILY_API_KEY });

// const graph = new StateGraph({
//   channels: {
//     messages: {
//       reducer: (x, y) => x.concat(y),
//       default: () => [],
//     },
//     nextStep: "planner | researcher | booker | end",
//   },
// })
//   .addNode("planner", plannerNode)
//   .addNode("researcher", researcherNode)
//   .addNode("booker", bookerNode);

// const app = graph.compile({ checkpointer: memory });