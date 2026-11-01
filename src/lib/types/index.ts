export type EvidenceStatus =
  | "CORROBORATED"
  | "CONFLICTING"
  | "MISSING"
  | "POTENTIALLY_OUTDATED"
  | "UNVERIFIED";

export type JobStatus =
  | "queued"
  | "discovering_sources"
  | "fetching_sources"
  | "extracting_claims"
  | "comparing_evidence"
  | "detecting_gaps"
  | "building_checklist"
  | "saving_report"
  | "completed"
  | "completed_with_warnings"
  | "failed"
  | "cancelled";

export interface ResearchProject {
  id: string;
  owner_session_id: string;
  title: string;
  research_question: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchJob {
  id: string;
  project_id: string;
  idempotency_key: string;
  status: JobStatus;
  current_stage: string;
  sequence_number: number;
  attempt_count: number;
  cancel_requested_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  last_error_code?: string | null;
  last_error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchSource {
  id: string;
  project_id: string;
  submitted_url: string;
  canonical_url?: string;
  title?: string;
  publisher?: string;
  author?: string;
  published_at?: string | null;
  source_updated_at?: string | null;
  fetched_at: string;
  content_type: string;
  fetch_status: "pending" | "success" | "failed" | "inaccessible";
  fetch_error_code?: string;
  fetch_error_message?: string;
  content_hash?: string;
  extracted_text?: string;
  credibility_score?: number;
  credibility_notes?: string;
  category?: string;
  created_at: string;
}

export interface ExtractedClaim {
  id: string;
  project_id: string;
  claim_text: string;
  normalized_claim?: string;
  subject?: string;
  predicate?: string;
  value?: string;
  unit?: string;
  time_period?: string;
  conditions?: string;
  category?: string;
  status: EvidenceStatus;
  confidence_note?: string;
  created_at: string;
  evidence?: ClaimEvidence[];
}

export interface ClaimEvidence {
  id: string;
  claim_id: string;
  source_id: string;
  source_title?: string;
  source_url?: string;
  excerpt: string;
  page_number?: number | null;
  evidence_type: "supports" | "contradicts" | "mentions";
  credibility?: string;
  published_at?: string;
  created_at: string;
}

export interface DetectedConflict {
  id: string;
  project_id: string;
  claim_a_id: string;
  claim_b_id: string;
  claim_a_text?: string;
  claim_b_text?: string;
  source_a_id?: string;
  source_b_id?: string;
  explanation: string;
  status: "open" | "resolved";
  created_at: string;
}

export interface InformationGap {
  id: string;
  project_id: string;
  question: string;
  why_it_matters: string;
  priority: "high" | "medium" | "low";
  supporting_source_ids: string[];
  created_at: string;
}

export interface VerificationChecklistItem {
  id: string;
  project_id: string;
  item: string;
  reason: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "completed";
  related_gap_or_conflict?: string;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchEvent {
  id: string;
  job_id: string;
  sequence_number: number;
  stage: string;
  status: string;
  message: string;
  completed_units?: number;
  total_units?: number;
  occurred_at: string;
}

export interface ResearchReport {
  id: string;
  project_id: string;
  report_json: {
    title: string;
    research_question: string;
    executive_summary: string;
    readiness_score: number;
    readiness_label: string;
    total_findings: number;
    verified_count: number;
    gaps_count: number;
    conflicts_count: number;
    outdated_count: number;
    key_findings: Array<{
      title: string;
      description: string;
      status: EvidenceStatus;
    }>;
    information_gaps: Array<{
      item: string;
      reason: string;
      priority: string;
    }>;
    conflicts: Array<{
      explanation: string;
      claims: string[];
    }>;
    outdated_warnings: Array<{
      finding: string;
      warning: string;
    }>;
    unanswered_questions: string[];
    checklist: Array<{
      item: string;
      priority: string;
    }>;
    limitations_and_uncertainty: string;
  };
  generated_at: string;
  version: number;
}

export interface SavedResearchItem {
  id: string;
  owner_session_id: string;
  project_id: string;
  item_type: "report" | "finding" | "source";
  item_id: string;
  title: string;
  snippet: string;
  source_url?: string;
  saved_at: string;
}
