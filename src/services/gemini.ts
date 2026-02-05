import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔴 FIX: We cast to 'any' to force TypeScript to accept .env
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;

// Safety check
if (!API_KEY) {
  console.error("🚨 Error: VITE_GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIRecommendation {
  recommendedGemId: number;
  reason: string;
}

export const askRailRonda = async (
  userQuery: string, 
  availableGems: any[]
): Promise<AIRecommendation | null> => {
  
  // ✅ Using the latest model as you requested
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are RailRonda, a smart travel companion for KL public transport.
    
    Here is the database of locations (Hidden Gems) available near the user:
    ${JSON.stringify(availableGems)}

    The user asks: "${userQuery}"

    INSTRUCTIONS:
    1. Analyze the user's request (e.g., looking for 'quiet', 'food', 'plugs', 'traditional').
    2. Select the ONE single best matching location from the database above.
    3. Return ONLY a JSON object with this exact format:
       {
         "recommendedGemId": <insert_id_number_here>,
         "reason": "<insert_short_punchy_reason_here>"
       }
    4. If no place fits well, pick the closest match but acknowledge the limitation in the reason.
    5. Do NOT use Markdown formatting (no \`\`\`json). Just the raw JSON string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Brain Freeze:", error);
    return null;
  }
};