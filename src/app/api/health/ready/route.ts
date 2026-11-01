import { NextResponse } from "next/server";
import { TINYFISH_CONFIG, AI_CONFIG } from "@/lib/config";

export async function GET() {
  const hasTinyFishKey = !!TINYFISH_CONFIG.apiKey;
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({
    status: "ready",
    providers: {
      tinyfish: {
        configured: hasTinyFishKey,
        search_endpoint: TINYFISH_CONFIG.searchEndpoint,
        fetch_endpoint: TINYFISH_CONFIG.fetchEndpoint,
      },
      gemma: {
        configured: hasGeminiKey,
        model: AI_CONFIG.model,
        fallback_model: AI_CONFIG.fallbackModel,
      },
    },
    database: { type: "local-json", persistent: true },
    timestamp: new Date().toISOString(),
  });
}
