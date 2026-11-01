-- Verity AI Database Schema
-- Migration: 20261030_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Anonymous sessions
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Research projects
CREATE TABLE IF NOT EXISTS research_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_session_id UUID NOT NULL,
  title TEXT NOT NULL,
  research_question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Research jobs (durable execution lifecycle)
CREATE TABLE IF NOT EXISTS research_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  idempotency_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  current_stage TEXT NOT NULL DEFAULT 'queued',
  sequence_number INTEGER NOT NULL DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  cancel_requested_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  last_error_code TEXT,
  last_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Research sources
CREATE TABLE IF NOT EXISTS research_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  submitted_url TEXT NOT NULL,
  canonical_url TEXT,
  title TEXT,
  publisher TEXT,
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  content_type TEXT DEFAULT 'text/html',
  fetch_status TEXT NOT NULL DEFAULT 'pending',
  fetch_error_code TEXT,
  fetch_error_message TEXT,
  content_hash TEXT,
  extracted_text TEXT,
  credibility_score INTEGER DEFAULT 85,
  credibility_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Uploaded documents
CREATE TABLE IF NOT EXISTS uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT,
  page_count INTEGER DEFAULT 1,
  extracted_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Extracted claims
CREATE TABLE IF NOT EXISTS extracted_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  normalized_claim TEXT,
  subject TEXT,
  predicate TEXT,
  value TEXT,
  unit TEXT,
  time_period TEXT,
  conditions TEXT,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'UNVERIFIED', -- CORROBORATED, CONFLICTING, MISSING, POTENTIALLY_OUTDATED, UNVERIFIED
  confidence_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Claim evidence
CREATE TABLE IF NOT EXISTS claim_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES extracted_claims(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES research_sources(id) ON DELETE CASCADE,
  excerpt TEXT NOT NULL,
  page_number INTEGER,
  evidence_type TEXT DEFAULT 'supports', -- supports, contradicts, mentions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Detected conflicts
CREATE TABLE IF NOT EXISTS detected_conflicts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  claim_a_id UUID NOT NULL REFERENCES extracted_claims(id) ON DELETE CASCADE,
  claim_b_id UUID NOT NULL REFERENCES extracted_claims(id) ON DELETE CASCADE,
  explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Information gaps
CREATE TABLE IF NOT EXISTS information_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  supporting_source_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Verification checklist
CREATE TABLE IF NOT EXISTS verification_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Research events (for SSE live progress stream)
CREATE TABLE IF NOT EXISTS research_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES research_jobs(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  stage TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  completed_units INTEGER DEFAULT 0,
  total_units INTEGER,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, sequence_number)
);

-- 12. Research reports
CREATE TABLE IF NOT EXISTS research_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  report_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- 13. Saved items
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_session_id UUID NOT NULL,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL, -- finding, source, report, checklist
  item_reference_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_session_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-throughput queries
CREATE INDEX IF NOT EXISTS idx_research_projects_owner ON research_projects(owner_session_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_project ON research_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_research_jobs_status ON research_jobs(status);
CREATE INDEX IF NOT EXISTS idx_research_sources_project ON research_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_extracted_claims_project ON extracted_claims(project_id);
CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence(claim_id);
CREATE INDEX IF NOT EXISTS idx_research_events_job ON research_events(job_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_verification_checklist_project ON verification_checklist(project_id);
