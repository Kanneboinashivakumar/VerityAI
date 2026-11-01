export const AI_CONFIG = {
  provider: "google-gemma",
  model: process.env.GEMMA_MODEL ?? "gemma-4-26b-a4b-it",
  fallbackModel: process.env.GEMMA_FALLBACK_MODEL ?? "gemma-4-31b-it",
};

const requestedSourceLimit = Number(process.env.RESEARCH_SOURCE_LIMIT ?? 5);

export const TINYFISH_CONFIG = {
  apiKey: process.env.TINYFISH_API_KEY ?? "",
  baseUrl: process.env.TINYFISH_API_BASE_URL ?? "https://api.tinyfish.ai",
  searchEndpoint: "https://api.search.tinyfish.ai",
  fetchEndpoint: "https://api.fetch.tinyfish.ai",
  timeoutMs: 15000,
  defaultSourceCount: 5,
  maxSources: 8,
  maxResults: 8,
  sourceLimit: Number.isFinite(requestedSourceLimit) ? Math.min(8, Math.max(2, Math.floor(requestedSourceLimit))) : 5,
};

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};

export const APP_CONFIG = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  logLevel: process.env.LOG_LEVEL ?? "info",
  workerConcurrency: Number(process.env.WORKER_CONCURRENCY ?? 3),
  jobMaxAttempts: Number(process.env.JOB_MAX_ATTEMPTS ?? 4),
  jobTimeoutSeconds: Number(process.env.JOB_TIMEOUT_SECONDS ?? 900),
};
