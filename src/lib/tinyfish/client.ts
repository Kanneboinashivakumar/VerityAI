import { TINYFISH_CONFIG } from "../config";
import { logger } from "../logger";

export interface TinyFishSearchResult {
  position?: number;
  site_name?: string;
  title: string;
  snippet?: string;
  published_at?: string;
  url: string;
}

export interface TinyFishFetchResult {
  url: string;
  title?: string;
  text?: string;
  markdown?: string;
  description?: string;
  author?: string;
  published_at?: string;
  updated_at?: string;
  status: "success" | "failed" | "inaccessible";
  error_message?: string;
  content_type?: string;
}

// SSRF Safety: Block private, link-local, loopback and cloud metadata ranges
export function isSafeUrl(rawUrl: string): { safe: boolean; reason?: string } {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, reason: "Invalid protocol. Only HTTP and HTTPS allowed." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check localhost & loopback
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "0.0.0.0"
    ) {
      return { safe: false, reason: "Localhost and loopback addresses are blocked." };
    }

    // Check Cloud metadata IPs
    if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") {
      return { safe: false, reason: "Cloud metadata endpoints are blocked." };
    }

    // IPv4 private address ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const b1 = parseInt(match[1], 10);
      const b2 = parseInt(match[2], 10);

      if (b1 === 10) return { safe: false, reason: "Private 10.x.x.x IP blocked." };
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return { safe: false, reason: "Private 172.16-31.x.x IP blocked." };
      if (b1 === 192 && b2 === 168) return { safe: false, reason: "Private 192.168.x.x IP blocked." };
      if (b1 === 169 && b2 === 254) return { safe: false, reason: "Link-local IP blocked." };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: "Malformed URL." };
  }
}

export class TinyFishClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || TINYFISH_CONFIG.apiKey;
    this.baseUrl = baseUrl || TINYFISH_CONFIG.baseUrl;
  }

  /**
   * Search for authoritative websites on a topic using TinyFish Search API
   */
  async search(query: string, maxResults = TINYFISH_CONFIG.maxResults): Promise<TinyFishSearchResult[]> {
    const startTime = Date.now();
    try {
      if (!this.apiKey) throw new Error("TinyFish is not configured. Add TINYFISH_API_KEY to .env.local.");
      logger.info("Starting TinyFish search", { provider: "tinyfish", query });

      const searchUrl = new URL(TINYFISH_CONFIG.searchEndpoint);
      searchUrl.searchParams.set("query", query);

      const response = await fetch(searchUrl.toString(), {
        method: "GET",
        headers: {
          "X-API-Key": this.apiKey,
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(TINYFISH_CONFIG.timeoutMs),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        logger.warn("TinyFish Search API responded with error", {
          provider: "tinyfish",
          status: response.status,
          error: errorText,
          duration_ms: Date.now() - startTime,
        });

        throw new Error(`TinyFish search returned HTTP ${response.status}.`);
      }

      const data = await response.json();
      const rawResults = data.results || data.data || [];

      // Clean & deduplicate URLs
      const seen = new Set<string>();
      const results: TinyFishSearchResult[] = [];
      const excludedHosts = /(^|\.)(reddit\.com|instagram\.com|facebook\.com|tiktok\.com|x\.com|twitter\.com|youtube\.com|youtu\.be)$/i;

      for (const item of rawResults) {
        const itemUrl = item.url;
        if (!itemUrl || seen.has(itemUrl)) continue;

        const safetyCheck = isSafeUrl(itemUrl);
        if (!safetyCheck.safe) continue;
        if (excludedHosts.test(new URL(itemUrl).hostname)) continue;

        seen.add(itemUrl);
        results.push({
          position: item.position || results.length + 1,
          site_name: item.site_name || new URL(itemUrl).hostname,
          title: item.title || "Discovered Source",
          snippet: item.snippet || "",
          published_at: item.published_at || item.published_date || item.date || undefined,
          url: itemUrl,
        });

      }

      const authorityScore = (url: string) => {
        const host = new URL(url).hostname.toLowerCase();
        if (host.endsWith(".gov") || host.endsWith(".gov.in") || host.endsWith(".edu") || host.endsWith(".edu.in") || host.endsWith(".int")) return 4;
        if (host.includes("developers.google.com") || host.includes("withgoogle.com") || host.includes("googleblog.com")) return 4;
        if (host.endsWith(".org")) return 2;
        return 0;
      };
      const topic = query.split(/\s+(?:As of|Focus on|Prioritize)\b/i)[0];
      const topicWords = topic.toLowerCase().match(/[a-z0-9]{3,}/g) || [];
      const relevanceScore = (result: TinyFishSearchResult) => {
        const searchable = `${result.title} ${result.snippet || ""} ${result.url}`.toLowerCase();
        return topicWords.reduce((score, word) => score + (searchable.includes(word) ? 1 : 0), 0);
      };
      results.sort((a, b) =>
        (relevanceScore(b) - relevanceScore(a)) ||
        (authorityScore(b.url) - authorityScore(a.url)) ||
        ((a.position || Number.MAX_SAFE_INTEGER) - (b.position || Number.MAX_SAFE_INTEGER))
      );
      const selectedResults = results.slice(0, maxResults);

      logger.info("TinyFish search completed", {
        provider: "tinyfish",
        count: selectedResults.length,
        duration_ms: Date.now() - startTime,
      });

      if (selectedResults.length === 0) throw new Error("TinyFish found no safe web sources for this query.");
      return selectedResults;
    } catch (err: unknown) {
      const error = err as Error;
      logger.error("TinyFish search failed", {
        provider: "tinyfish",
        error: error.message,
        duration_ms: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * Fetch and extract clean webpage content using TinyFish Fetch API
   */
  async fetchUrls(urls: string[]): Promise<TinyFishFetchResult[]> {
    const validUrls: string[] = [];
    const results: TinyFishFetchResult[] = [];

    // Filter and sanitize safe URLs
    for (const u of urls) {
      const safety = isSafeUrl(u);
      if (!safety.safe) {
        results.push({
          url: u,
          status: "inaccessible",
          error_message: safety.reason,
        });
      } else {
        validUrls.push(u);
      }
    }

    if (validUrls.length === 0) {
      return results;
    }

    try {
      logger.info("Calling TinyFish Fetch API", {
        provider: "tinyfish",
        url_count: validUrls.length,
      });

      const response = await fetch(TINYFISH_CONFIG.fetchEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          urls: validUrls,
        }),
        signal: AbortSignal.timeout(TINYFISH_CONFIG.timeoutMs * 2),
      });

      if (response.ok) {
        const data = await response.json();
        const fetchResults = data.results || data.data || [];

        for (const [index, targetUrl] of validUrls.entries()) {
          const item = fetchResults.find((candidate: any) => candidate.url === targetUrl) || fetchResults[index];
          if (!item) {
            results.push({ url: targetUrl, status: "inaccessible", error_message: "TinyFish returned no result for this URL." });
            continue;
          }
          const content = item.text || item.markdown || item.content || "";
          const providerStatus = String(item.status || item.fetch_status || "").toLowerCase();
          const failed = ["failed", "error", "inaccessible"].includes(providerStatus) || !!item.error;
          results.push({
            url: targetUrl,
            title: item.title || "Extracted Source",
            text: content,
            markdown: item.markdown,
            description: item.description,
            author: item.author,
            published_at: item.published_at || item.published_date || item.publishedDate,
            updated_at: item.updated_at || item.last_modified || item.lastModified,
            content_type: item.content_type || item.mime_type || item.contentType,
            status: !failed && content.trim().length > 0 ? "success" : "inaccessible",
            error_message: item.error || (!content.trim() ? "No readable content found" : undefined),
          });
        }
      } else {
        // If batch fetch fails, attempt individual direct extraction with safety
        logger.warn("TinyFish Fetch API batch request failed, falling back to direct safe fetch", {
          status: response.status,
        });

        for (const targetUrl of validUrls) {
          const directRes = await this.directSafeFetch(targetUrl);
          results.push(directRes);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn("TinyFish Fetch exception, performing safe direct fallback", {
        error: error.message,
      });
      for (const targetUrl of validUrls) {
        const directRes = await this.directSafeFetch(targetUrl);
        results.push(directRes);
      }
    }

    return results;
  }

  /**
   * Direct safe fetch with SSRF guards and HTML text extraction fallback
   */
  private async directSafeFetch(rawUrl: string): Promise<TinyFishFetchResult> {
    const safety = isSafeUrl(rawUrl);
    if (!safety.safe) {
      return { url: rawUrl, status: "inaccessible", error_message: safety.reason };
    }

    try {
      const res = await fetch(rawUrl, {
        headers: {
          "User-Agent": "VerityAI-Bot/1.0 (Information Verification Assistant; https://verity.ai)",
          "Accept": "text/html,application/xhtml+xml,text/plain;q=0.9",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return {
          url: rawUrl,
          status: "inaccessible",
          error_message: `HTTP ${res.status} ${res.statusText}`,
        };
      }

      const contentType = res.headers.get("content-type") || "";
      const html = await res.text();

      // Extract title and plain text
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : new URL(rawUrl).hostname;

      // Extract basic meta description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const description = descMatch ? descMatch[1].trim() : undefined;

      // Basic HTML text extraction (strip scripts, styles, tags)
      const cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 15000); // Token bounded

      return {
        url: rawUrl,
        title,
        description,
        text: cleanText,
        updated_at: res.headers.get("last-modified") || undefined,
        content_type: contentType,
        status: cleanText.length > 50 ? "success" : "inaccessible",
        error_message: cleanText.length > 50 ? undefined : "Extracted page content too brief or empty.",
      };
    } catch (err: unknown) {
      const error = err as Error;
      return {
        url: rawUrl,
        status: "inaccessible",
        error_message: error.message || "Failed to reach destination URL.",
      };
    }
  }

}

export const tinyFish = new TinyFishClient();
