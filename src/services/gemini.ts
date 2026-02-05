import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Setup the API Key
// Ideally, use: import.meta.env.VITE_GEMINI_API_KEY
// For the hackathon demo, ensure this key is secure or restricted.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// 2. Define the expected output format (Typescript interface)
// This helps us ensure we pass the right data back to your UI
export interface AIRecommendation {
  recommendedGemId: number;
  reason: string;
}

// 3. The Main Function
export const askRailRonda = async (
  userQuery: string, 
  availableGems: any[]
): Promise<AIRecommendation | null> => {
  
  // We use the "flash" model because it's fast and cheap (perfect for real-time chat)
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // 4. Construct the Prompt (The most important part!)
  // We feed it the 'availableGems' so it acts as a filter/curator, not just a chatbot.
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
    
    // Clean the output just in case Gemini adds formatting
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Brain Freeze:", error);
    return null;
  }
};