import fs from "fs";
import path from "path";
import os from "os";
import seedData from "./seed.json";
import {
  ResearchProject,
  ResearchJob,
  ResearchSource,
  ExtractedClaim,
  ClaimEvidence,
  DetectedConflict,
  InformationGap,
  VerificationChecklistItem,
  ResearchEvent,
  ResearchReport,
  JobStatus,
  SavedResearchItem,
} from "../types";
import { SUPABASE_CONFIG } from "../config";
import { logger } from "../logger";

const DATA_FILE = process.env.VERITY_DATA_FILE || path.join(process.cwd(), ".verity_store.json");
const TMP_DATA_FILE = path.join(os.tmpdir(), ".verity_store.json");

interface VerityDatabaseSchema {
  projects: Record<string, ResearchProject>;
  jobs: Record<string, ResearchJob>;
  sources: Record<string, ResearchSource>;
  claims: Record<string, ExtractedClaim>;
  evidence: Record<string, ClaimEvidence>;
  conflicts: Record<string, DetectedConflict>;
  gaps: Record<string, InformationGap>;
  checklist: Record<string, VerificationChecklistItem>;
  events: Record<string, ResearchEvent[]>; // keyed by job_id
  reports: Record<string, ResearchReport>; // keyed by project_id
  saved: Record<string, SavedResearchItem>;
}

class ResilientDatabase {
  private data: VerityDatabaseSchema;

  constructor() {
    this.data = this.loadInitial();
    this.removeDemoData();
  }

  private removeDemoData() {
    const knownDemoIds = new Set(["gsoc-2027-demo", "proj-1793379773842-5nc0t"]);
    const demoProjectIds = new Set(
      Object.values(this.data.projects).filter((project) => knownDemoIds.has(project.id)).map((project) => project.id)
    );
    if (demoProjectIds.size === 0) return;

    const demoJobIds = new Set(
      Object.values(this.data.jobs)
        .filter((job) => demoProjectIds.has(job.project_id))
        .map((job) => job.id)
    );
    const demoClaimIds = new Set(
      Object.values(this.data.claims)
        .filter((claim) => demoProjectIds.has(claim.project_id))
        .map((claim) => claim.id)
    );
    const removeProjectRecords = <T extends { project_id?: string }>(records: Record<string, T>) => {
      for (const [id, record] of Object.entries(records)) {
        if (record.project_id && demoProjectIds.has(record.project_id)) delete records[id];
      }
    };

    for (const projectId of demoProjectIds) {
      delete this.data.projects[projectId];
      delete this.data.reports[projectId];
    }
    removeProjectRecords(this.data.jobs);
    removeProjectRecords(this.data.sources);
    removeProjectRecords(this.data.claims);
    removeProjectRecords(this.data.conflicts);
    removeProjectRecords(this.data.gaps);
    removeProjectRecords(this.data.checklist);
    removeProjectRecords(this.data.saved);
    for (const jobId of demoJobIds) delete this.data.events[jobId];
    for (const [id, evidence] of Object.entries(this.data.evidence)) {
      if (demoClaimIds.has(evidence.claim_id)) delete this.data.evidence[id];
    }
    this.persist();
  }

  private loadInitial(): VerityDatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.projects && Object.keys(parsed.projects).length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    try {
      if (fs.existsSync(TMP_DATA_FILE)) {
        const raw = fs.readFileSync(TMP_DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.projects && Object.keys(parsed.projects).length > 0) {
          return parsed;
        }
      }
    } catch (e) {}

    // Fallback to bundled seed data (Amazon SDE, Gnani AI, GSoC, NMMSS)
    try {
      if (seedData && (seedData as any).projects && Object.keys((seedData as any).projects).length > 0) {
        return JSON.parse(JSON.stringify(seedData));
      }
    } catch (e) {}

    return {
      projects: {},
      jobs: {},
      sources: {},
      claims: {},
      evidence: {},
      conflicts: {},
      gaps: {},
      checklist: {},
      events: {},
      reports: {},
      saved: {},
    };
  }

  // Next.js can evaluate route handlers in separate module contexts. Refresh on
  // every operation so each route observes writes made by the background worker.
  private refresh() {
    this.data = this.loadInitial();
  }

  private persist() {
    // 1. Try persisting to primary DATA_FILE
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
      return;
    } catch (e) {
      // Primary location is read-only (e.g. Vercel serverless /var/task)
    }

    // 2. Persist to writable /tmp on serverless
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      // In-memory state remains updated in this.data
    }
  }

  // --- Projects ---
  async createProject(input: {
    title: string;
    research_question: string;
    owner_session_id?: string;
  }): Promise<ResearchProject> {
    this.refresh();
    const id = `proj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const project: ResearchProject = {
      id,
      owner_session_id: input.owner_session_id || "guest-session-1",
      title: input.title,
      research_question: input.research_question,
      status: "active",
      created_at: now,
      updated_at: now,
    };
    this.data.projects[id] = project;
    this.persist();
    return project;
  }

  async getProject(id: string): Promise<ResearchProject | null> {
    this.refresh();
    return this.data.projects[id] || null;
  }

  async listProjects(ownerSessionId?: string): Promise<ResearchProject[]> {
    this.refresh();
    const all = Object.values(this.data.projects).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (!ownerSessionId) return all;
    const userProjects = all.filter((p) => p.owner_session_id === ownerSessionId);
    return userProjects.length > 0 ? userProjects : all;
  }

  // --- Jobs ---
  async createJob(input: {
    project_id: string;
    idempotency_key?: string;
  }): Promise<ResearchJob> {
    this.refresh();
    if (input.idempotency_key) {
      const existing = Object.values(this.data.jobs).find((job) => job.idempotency_key === input.idempotency_key);
      if (existing) return existing;
    }
    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const job: ResearchJob = {
      id,
      project_id: input.project_id,
      idempotency_key: input.idempotency_key || `idem-${id}`,
      status: "queued",
      current_stage: "queued",
      sequence_number: 1,
      attempt_count: 0,
      started_at: now,
      created_at: now,
      updated_at: now,
    };
    this.data.jobs[id] = job;
    this.persist();
    return job;
  }

  async getJob(id: string): Promise<ResearchJob | null> {
    this.refresh();
    return this.data.jobs[id] || null;
  }

  async getJobByIdempotencyKey(key: string): Promise<ResearchJob | null> {
    this.refresh();
    return Object.values(this.data.jobs).find((job) => job.idempotency_key === key) || null;
  }

  async getJobByProjectId(projectId: string): Promise<ResearchJob | null> {
    this.refresh();
    const jobs = Object.values(this.data.jobs).filter((j) => j.project_id === projectId);
    return jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
  }

  async updateJob(
    id: string,
    updates: Partial<ResearchJob>
  ): Promise<ResearchJob | null> {
    this.refresh();
    const job = this.data.jobs[id];
    if (!job) return null;
    const updated = {
      ...job,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.jobs[id] = updated;
    this.persist();
    return updated;
  }

  // --- Events (SSE Stream) ---
  async appendEvent(event: Omit<ResearchEvent, "id">): Promise<ResearchEvent> {
    this.refresh();
    const id = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const fullEvent: ResearchEvent = { ...event, id };
    if (!this.data.events[event.job_id]) {
      this.data.events[event.job_id] = [];
    }
    this.data.events[event.job_id].push(fullEvent);
    this.persist();
    return fullEvent;
  }

  async getEvents(jobId: string): Promise<ResearchEvent[]> {
    this.refresh();
    return this.data.events[jobId] || [];
  }

  // --- Sources ---
  async addSource(source: Omit<ResearchSource, "id" | "created_at">): Promise<ResearchSource> {
    this.refresh();
    const id = `src-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const fullSource: ResearchSource = {
      ...source,
      id,
      created_at: now,
    };
    this.data.sources[id] = fullSource;
    this.persist();
    return fullSource;
  }

  async getSourcesByProjectId(projectId: string): Promise<ResearchSource[]> {
    this.refresh();
    return Object.values(this.data.sources).filter((s) => s.project_id === projectId);
  }

  // --- Claims & Evidence ---
  async addClaim(
    claim: Omit<ExtractedClaim, "id" | "created_at">,
    evidenceItems: Array<Omit<ClaimEvidence, "id" | "claim_id" | "created_at">> = []
  ): Promise<ExtractedClaim> {
    this.refresh();
    const claimId = `claim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const fullClaim: ExtractedClaim = {
      ...claim,
      id: claimId,
      created_at: now,
    };
    this.data.claims[claimId] = fullClaim;

    for (const ev of evidenceItems) {
      const evId = `evi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const source = this.data.sources[ev.source_id];
      const fullEv: ClaimEvidence = {
        ...ev,
        id: evId,
        claim_id: claimId,
        source_title: source?.title || "Discovered Source",
        source_url: source?.submitted_url || "",
        created_at: now,
      };
      this.data.evidence[evId] = fullEv;
    }

    this.persist();
    return fullClaim;
  }

  async getClaimsByProjectId(projectId: string): Promise<ExtractedClaim[]> {
    this.refresh();
    const claims = Object.values(this.data.claims).filter((c) => c.project_id === projectId);
    return claims.map((claim) => {
      const claimEvidence = Object.values(this.data.evidence).filter((e) => e.claim_id === claim.id);
      return {
        ...claim,
        evidence: claimEvidence,
      };
    });
  }

  // --- Conflicts ---
  async addConflict(conflict: Omit<DetectedConflict, "id" | "created_at">): Promise<DetectedConflict> {
    this.refresh();
    const id = `conf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const full: DetectedConflict = {
      ...conflict,
      id,
      created_at: new Date().toISOString(),
    };
    this.data.conflicts[id] = full;
    this.persist();
    return full;
  }

  async getConflictsByProjectId(projectId: string): Promise<DetectedConflict[]> {
    this.refresh();
    return Object.values(this.data.conflicts).filter((c) => c.project_id === projectId);
  }

  // --- Information Gaps ---
  async addGap(gap: Omit<InformationGap, "id" | "created_at">): Promise<InformationGap> {
    this.refresh();
    const id = `gap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const full: InformationGap = {
      ...gap,
      id,
      created_at: new Date().toISOString(),
    };
    this.data.gaps[id] = full;
    this.persist();
    return full;
  }

  async getGapsByProjectId(projectId: string): Promise<InformationGap[]> {
    this.refresh();
    return Object.values(this.data.gaps).filter((g) => g.project_id === projectId);
  }

  // --- Checklist ---
  async addChecklistItem(
    item: Omit<VerificationChecklistItem, "id" | "created_at" | "updated_at">
  ): Promise<VerificationChecklistItem> {
    this.refresh();
    const id = `chk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const full: VerificationChecklistItem = {
      ...item,
      id,
      created_at: now,
      updated_at: now,
    };
    this.data.checklist[id] = full;
    this.persist();
    return full;
  }

  async getChecklistByProjectId(projectId: string): Promise<VerificationChecklistItem[]> {
    this.refresh();
    return Object.values(this.data.checklist).filter((c) => c.project_id === projectId);
  }

  async getChecklistItem(id: string): Promise<VerificationChecklistItem | null> {
    this.refresh();
    return this.data.checklist[id] || null;
  }

  async toggleChecklistItem(id: string): Promise<VerificationChecklistItem | null> {
    this.refresh();
    const item = this.data.checklist[id];
    if (!item) return null;
    const newStatus = item.status === "completed" ? "pending" : "completed";
    const updated: VerificationChecklistItem = {
      ...item,
      status: newStatus,
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    this.data.checklist[id] = updated;
    this.persist();
    return updated;
  }

  // --- Reports ---
  async saveReport(report: Omit<ResearchReport, "id" | "generated_at">): Promise<ResearchReport> {
    this.refresh();
    const id = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const full: ResearchReport = {
      ...report,
      id,
      generated_at: new Date().toISOString(),
    };
    this.data.reports[report.project_id] = full;
    this.persist();
    return full;
  }

  async getReportByProjectId(projectId: string): Promise<ResearchReport | null> {
    this.refresh();
    return this.data.reports[projectId] || null;
  }

  async listSavedItems(ownerId?: string): Promise<SavedResearchItem[]> {
    this.refresh();
    const all = Object.values(this.data.saved).sort((a, b) => b.saved_at.localeCompare(a.saved_at));
    if (!ownerId) return all;
    const userItems = all.filter((item) => item.owner_session_id === ownerId);
    return userItems.length > 0 ? userItems : all;
  }

  async addSavedItem(input: Omit<SavedResearchItem, "id" | "saved_at">): Promise<SavedResearchItem> {
    this.refresh();
    const existing = Object.values(this.data.saved).find((item) =>
      (item.owner_session_id === input.owner_session_id || !input.owner_session_id) &&
      item.item_type === input.item_type &&
      item.item_id === input.item_id
    );
    if (existing) return existing;
    const saved: SavedResearchItem = { ...input, id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, saved_at: new Date().toISOString() };
    this.data.saved[saved.id] = saved;
    this.persist();
    return saved;
  }

  async removeSavedItem(id: string, ownerId?: string): Promise<boolean> {
    this.refresh();
    const item = this.data.saved[id];
    if (!item) return false;
    delete this.data.saved[id];
    this.persist();
    return true;
  }

}

export const db = new ResilientDatabase();
