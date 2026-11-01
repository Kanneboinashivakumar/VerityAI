import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { tinyFish } from "../src/lib/tinyfish/client";

async function main() {
  console.log("=== Testing TinyFish Integration ===");
  console.log("Using API Key:", process.env.TINYFISH_API_KEY ? "Present (sk-tinyfish-...)" : "Missing");

  // 1. Test Search
  console.log("\n[1] Testing TinyFish Search for: 'Google Summer of Code 2027'...");
  const searchResults = await tinyFish.search("Google Summer of Code 2027", 3);
  console.log("Search returned", searchResults.length, "results:");
  searchResults.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.site_name || "Source"}] ${r.title}`);
    console.log(`     URL: ${r.url}`);
  });

  // 2. Test Fetch
  if (searchResults.length > 0) {
    const testUrl = searchResults[0].url;
    console.log(`\n[2] Testing TinyFish Fetch for: ${testUrl}...`);
    const fetchResults = await tinyFish.fetchUrls([testUrl]);
    console.log("Fetch returned status:", fetchResults[0]?.status);
    console.log("Extracted text length:", fetchResults[0]?.text?.length || 0, "chars");
    if (fetchResults[0]?.text) {
      console.log("Preview:", fetchResults[0].text.slice(0, 150) + "...");
    }
  }

  console.log("\n=== TinyFish Test Complete ===");
}

main().catch(console.error);
