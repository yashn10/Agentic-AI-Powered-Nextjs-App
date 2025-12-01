// // lib/integrations/voice.ts
import { createMiddleware } from "langchain";
// Add voice input/output and image handling.

// const multimodalMiddleware = createMiddleware({
//     name: "MultimodalInput",
//     beforeModel: async (request, handler) => {
//         const inputs = request.state?.inputs || {};

//         // Handle audio input
//         if (inputs.audioUrl) {
//             const transcription = await transcribeAudio(inputs.audioUrl);
//             request.messages = [
//                 ...request.messages,
//                 {
//                     role: "user",
//                     content: `[Transcribed from audio]\n${transcription}`,
//                 },
//             ];
//         }

//         // Handle image input
//         if (inputs.imageUrl) {
//             const imageDescription = await describeImage(inputs.imageUrl);
//             request.messages = [
//                 ...request.messages,
//                 {
//                     role: "user",
//                     content: `[Image detected]\n${imageDescription}`,
//                 },
//             ];
//         }

//         return handler(request);
//     },
//     afterModel: async (response, config) => {
//         // Generate voice output if requested
//         if (config.context?.wantVoiceOutput) {
//             const audioUrl = await synthesizeSpeech(response.content);
//             return { ...response, audioUrl };
//         }
//         return response;
//     },
// });

// // **Monetization**:
// // - Voice I/O: $0.01 per minute (Pro tier)
// // - Image processing: $0.05 per image (Pro tier)