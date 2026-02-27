import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("🚨 Error: VITE_GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_ROSTER = [
  "gemini-2.5-flash",
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-pro"
];

export interface AIRecommendation {
  recommendedGemIds: number[]; 
  reason: string;
}

const generateWithFallback = async (prompt: string, rosterIndex = 0): Promise<string | null> => {
  if (rosterIndex >= MODEL_ROSTER.length) {
    console.error("💀 CRITICAL: All AI models are exhausted or failing.");
    return null;
  }

  const currentModelName = MODEL_ROSTER[rosterIndex];
  console.log(`🤖 RailRonda Brain: Attempting with [${currentModelName}]...`);

  try {
    const model = genAI.getGenerativeModel({ model: currentModelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();

  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || error.message?.includes("Quota");
    const isOverloaded = error.message?.includes("503") || error.message?.includes("Overloaded");

    if (isRateLimit || isOverloaded) {
      console.warn(`⚠️ Model [${currentModelName}] is out of breath. Switching to backup...`);
      return generateWithFallback(prompt, rosterIndex + 1);
    } else {
      console.error(`❌ Fatal Error on [${currentModelName}]:`, error);
      return generateWithFallback(prompt, rosterIndex + 1);
    }
  }
};

export const askRailRonda = async (
  userQuery: string, 
  availableGems: any[]
): Promise<AIRecommendation | null> => {
  
  const prompt = `
    You are RailRonda, a smart travel companion for KL public transport.
    
    CONTEXT DATA (Places near the user):
    ${JSON.stringify(availableGems)}

    USER REQUEST: "${userQuery}"

    INSTRUCTIONS:
    1. Analyze the User Request against the Context Data.
    2. Select ALL matching locations (e.g. if user asks for 'coffee', return all cafes).
    3. Return ONLY a raw JSON object (no markdown).
    4. Format: { "recommendedGemIds": [101, 102], "reason": "Short summary of why these were picked" }
    5. If nothing fits perfectly, return an empty array [] and a polite reason.
    6. STRICTLY NO MARKDOWN. Just the JSON string.
  `;

  const rawText = await generateWithFallback(prompt);

  if (!rawText) return null;

  try {
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("🧠 JSON Parse Error:", error);
    return null;
  }
};

// DTO for Global Search
export interface GlobalGem {
  id: number;
  name: string;
  category: string;
  description: string;
  stationName: string;
}

export const askGlobalRailRonda = async (query: string, allGems: GlobalGem[]) => {
  try {
    // Compress data to save tokens
    const compressedGems = allGems.map(g => `${g.id}|${g.name}|${g.category}|${g.stationName}`).join('\n');
    
    const prompt = `
      You are RailRonda, an expert transit and local food guide in Kuala Lumpur.
      A user asked: "${query}"
      
      Here is a list of ALL locations across ALL stations in the format ID|Name|Category|Station:
      ${compressedGems}
      
      INSTRUCTIONS:
      1. Find ALL locations that are a good semantic match for the user's request.
      2. Do NOT limit your selection. If there are 30 great matches across the city, return all 30 IDs. If there are only 2, return 2.
      3. Order the IDs roughly by how accurately they match the query (Best match first).
      4. Return ONLY a raw JSON object (no markdown, no backticks) with this exact structure:
      {
        "recommendedGemIds": [id1, id2, id3...],
        "reason": "A short, friendly sentence explaining what you found across the network."
      }
    `;

    const rawText = await generateWithFallback(prompt);

    if (!rawText) return null;

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Global Gemini Error:", error);
    return null;
  }
};