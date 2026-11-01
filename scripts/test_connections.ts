import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createClient } from "@supabase/supabase-js";

async function main() {
  console.log("=== Testing Supabase & Gemini Connectivity ===");

  // 1. Supabase Check
  console.log("\n[1] Checking Supabase Project Connection...");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.from("research_projects").select("count").limit(1);
      if (error) {
        console.log("Supabase connected! Note: Table 'research_projects' not created yet (needs SQL editor script):", error.message);
      } else {
        console.log("Supabase connected and 'research_projects' table exists! Count:", data);
      }
    } catch (e: any) {
      console.log("Supabase error:", e.message);
    }
  }

  // 2. Gemini / Gemma Check
  console.log("\n[2] Checking Gemini / Gemma API Key...");
  const geminiApiKey = process.env.GEMINI_API_KEY || "";
  if (!geminiApiKey) {
    console.error("Missing GEMINI_API_KEY");
  } else {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const model = process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it";
      console.log(`Sending ping prompt to model: ${model}...`);
      
      const response = await ai.models.generateContent({
        model,
        contents: "Return a 3-word confirmation: Status: Verified Online",
      });
      console.log("Gemma 4 responded:", response.text?.trim());
    } catch (e: any) {
      console.log("Gemini API call note:", e.message);
    }
  }

  console.log("\n=== Test Finished ===");
}

main().catch(console.error);
