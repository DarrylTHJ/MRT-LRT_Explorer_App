import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

// --- ENV VARIABLES ---
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!API_KEY) {
  console.error("🚨 Error: VITE_GEMINI_API_KEY is missing in .env file");
}

// --- INITIALIZE CLIENTS ---
const genAI = new GoogleGenerativeAI(API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- AI MODEL ROSTER ---
const MODEL_ROSTER = [
  "gemini-2.5-flash",
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-pro"
];

export interface AIRecommendation {
  recommendedGemIds: (number | string)[]; 
  reason: string;
}

// --- CORE FALLBACK GENERATOR ---
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

// --- 1. LOCAL SEARCH (Original Dashboard) ---
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

// --- 2. GLOBAL RAG PIPELINE (Supabase + Google Reviews) ---
export const askSupabaseRailRonda = async (
  query: string, 
  currentStationName: string
): Promise<AIRecommendation | null> => {
  try {
 // 1. Run the GLOBAL Full-Text Search across ALL stations
    let { data: matchedReviews, error } = await supabase.rpc('search_global_reviews', {
      search_query: query
    });

    if (error) {
      console.error("Supabase Global Search Error:", error);
      return null;
    }

    // 2. THE SAFETY NET: If strict search fails, grab global highly-rated spots
    if (!matchedReviews || matchedReviews.length === 0) {
      console.warn(`Keyword match failed. Falling back to global highly-rated gems...`);
      const { data: fallbackReviews } = await supabase
        .from('reviews')
        .select('location_id, location_name, review_text, rating, station_name')
        .ilike('review_text', `%${query}%`) // Searches everywhere
        .limit(20);
        
      matchedReviews = fallbackReviews;
    }

    // If there is still absolutely no data (e.g., station has no reviews seeded yet)
    if (!matchedReviews || matchedReviews.length === 0) {
        console.warn(`No review data available for ${currentStationName}.`);
        return null;
    }

    // 3. Compress the reviews into a neat context block for Gemini
    const contextData = matchedReviews.map((r: any) => 
      `ID: ${r.location_id} | Name: ${r.location_name} | Rating: ${r.rating}⭐ | Review: "${r.review_text}"`
    ).join('\n');

    // 4. Ask Gemini to make the final decision based ON THE REVIEWS
    const prompt = `
      You are RailRonda, an AI Transit & Food Guide.
      A user at [${currentStationName} Station] asked: "${query}"

      Here are authentic Google Reviews from places near that station:
      ---
      ${contextData}
      ---

      INSTRUCTIONS:
      1. Read the reviews to find the locations that best fit the user's request.
      2. Return a raw JSON object (no markdown, no backticks).
      3. Format EXACTLY like this:
      { 
        "recommendedGemIds": ["id1", "id2"], 
        "reason": "Explain your picks. You MUST reference what the specific Google Reviews or star ratings said!" 
      }
      4. DO NOT limit the count. If 4 places fit perfectly, return all 4 IDs.
    `;

    // 5. Generate with Fallback Roster
    const rawText = await generateWithFallback(prompt);
    
    if (!rawText) return null;

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);

  } catch (error) {
    console.error("RAG Pipeline Error:", error);
    return null;
  }
  
};

// --- 3. FETCH EXACT LOCATIONS FOR THE UI (100% DATABASE ONLY) ---
export const fetchLocationsByIds = async (ids: (string | number)[]) => {
  try {
    const stringIds = ids.map(String);
    const { data, error } = await supabase
      .from('mrt_kajang_line_2')
      .select('*')
      .in('id', stringIds);

    if (error) {
       console.error("Supabase fetch error:", error);
       return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category || 'gem',
      lat: row.lat,
      lng: row.lng,
      stationName: row.nearestStation,
      dbDistance: row['Distance (m)'] || 400 // 🔴 Pulling straight from your DB!
    }));
  } catch (error) {
    console.error("Error fetching missing location coordinates:", error);
    return [];
  }
};