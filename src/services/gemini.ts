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
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    CONTEXT DATA: ${JSON.stringify(availableGems)}
    USER REQUEST: "${userQuery}"

    INSTRUCTIONS:
    1. Select ALL matching locations.
    2. Format exactly: { "recommendedGemIds": [101, 102], "reason": "Short summary" }
    3. STRICTLY NO MARKDOWN.
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
) => {
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
        .ilike('review_text', `%${query}%`)
        .limit(30);
        
      matchedReviews = fallbackReviews;
    }

    if (!matchedReviews || matchedReviews.length === 0) return null;

    // 3. Get the unique location IDs the reviews belong to
    const locationIds = [...new Set(matchedReviews.map((r: any) => r.location_id))];

    // 4. Fetch the full location details from your mrt_kajang_line_2 table
    const { data: locations } = await supabase
      .from('mrt_kajang_line_2')
      .select('*')
      .in('id', locationIds);

    if (!locations || locations.length === 0) return null;

    // 5. Bundle Reviews + Name + Category + Distance for Gemini to analyze
    const contextData = locations.map(loc => {
      const locReviews = matchedReviews?.filter((r: any) => r.location_id === loc.id) || [];
      const combinedReviews = locReviews.map((r: any) => `"${r.review_text}" (${r.rating}⭐)`).join(' | ');
      return {
        id: loc.id,
        name: loc.name,
        category: loc.category,
        station: loc.nearestStation,
        distance: loc.distance,
        reviews: combinedReviews
      };
    });

    // 6. Ask Gemini to evaluate and return ALL relevant matches
    const prompt = `
      You are RailRonda, an AI Transit Guide in Kuala Lumpur.
      User Request: "${query}"
      User's Current Station: "${currentStationName}"

      Here are places from our database that match the keywords, including their Google Reviews:
      ${JSON.stringify(contextData, null, 2)}

      INSTRUCTIONS:
      1. Analyze the reviews, categories, and names to find the best matches.
      2. Return AS MANY locations as you think are highly relevant. DO NOT LIMIT TO 10.
      3. Sort them strictly by RELEVANCE to the user's query (best match first).
      4. Return ONLY a raw JSON array exactly in this format (no markdown):
      [
        { "id": "the_id", "reason": "Short explanation referencing the reviews/category." }
      ]
    `;

    const rawText = await generateWithFallback(prompt);
    if (!rawText) return null;

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiSelections = JSON.parse(cleanText);

    // 7. Map AI choices back to the database objects to send to App.tsx
    const finalResults = aiSelections.map((selection: any) => {
       const dbGem = locations.find(loc => loc.id === selection.id);
       if (!dbGem) return null;
       
       return {
         gem: {
           id: dbGem.id,
           name: dbGem.name,
           category: dbGem.category || 'gem',
           lat: dbGem.lat,
           lng: dbGem.lng,
           stationName: dbGem.nearestStation
         },
         reason: selection.reason
       };
    }).filter(Boolean);

    return finalResults;

  } catch (error) {
    console.error("RAG Pipeline Error:", error);
    return null;
  }
};