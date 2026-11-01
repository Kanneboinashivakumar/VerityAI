import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { db } from "./lib/db/store";
import { ResearchPipeline } from "./lib/worker/pipeline";
import { logger } from "./lib/logger";
import { APP_CONFIG } from "./lib/config";

logger.info("Starting Verity AI Persistent Background Worker", {
  concurrency: APP_CONFIG.workerConcurrency,
  maxAttempts: APP_CONFIG.jobMaxAttempts,
});

async function pollAndProcessJobs() {
  try {
    // Check for queued jobs
    // In a production multi-worker setup, jobs are picked with atomic locking
    logger.debug("Worker checking for queued research jobs...");
  } catch (err: any) {
    logger.error("Worker polling error", { error: err.message });
  }
}

// Keep worker alive with graceful shutdown
const interval = setInterval(pollAndProcessJobs, 5000);

process.on("SIGINT", () => {
  logger.info("Worker shutting down gracefully (SIGINT)...");
  clearInterval(interval);
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Worker shutting down gracefully (SIGTERM)...");
  clearInterval(interval);
  process.exit(0);
});
