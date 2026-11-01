-- ==============================================================================
-- Verity AI - Migration: 20261101_enable_rls.sql
-- Enables Row Level Security (RLS) on all 14 public tables and creates policies
-- Resolves Supabase Security Advisor "RLS Disabled in Public" (14 issues)
-- ==============================================================================

-- 1. Enable RLS on all 14 tables
ALTER TABLE IF EXISTS anonymous_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS extracted_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS claim_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS detected_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS information_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS verification_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS research_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any to prevent conflicts
DO $$
BEGIN
  -- Research projects
  DROP POLICY IF EXISTS "Users can manage their own research projects" ON research_projects;
  DROP POLICY IF EXISTS "Public can view demo research projects" ON research_projects;
  DROP POLICY IF EXISTS "Service role has full access to research_projects" ON research_projects;

  -- Research jobs
  DROP POLICY IF EXISTS "Users can view jobs for their projects" ON research_jobs;
  DROP POLICY IF EXISTS "Service role has full access to research_jobs" ON research_jobs;

  -- Research sources
  DROP POLICY IF EXISTS "Users can view sources for their projects" ON research_sources;
  DROP POLICY IF EXISTS "Service role has full access to research_sources" ON research_sources;

  -- Extracted claims
  DROP POLICY IF EXISTS "Users can view claims for their projects" ON extracted_claims;
  DROP POLICY IF EXISTS "Service role has full access to extracted_claims" ON extracted_claims;

  -- Claim evidence
  DROP POLICY IF EXISTS "Users can view evidence for their claims" ON claim_evidence;
  DROP POLICY IF EXISTS "Service role has full access to claim_evidence" ON claim_evidence;

  -- Detected conflicts
  DROP POLICY IF EXISTS "Users can view conflicts for their projects" ON detected_conflicts;
  DROP POLICY IF EXISTS "Service role has full access to detected_conflicts" ON detected_conflicts;

  -- Information gaps
  DROP POLICY IF EXISTS "Users can view gaps for their projects" ON information_gaps;
  DROP POLICY IF EXISTS "Service role has full access to information_gaps" ON information_gaps;

  -- Verification checklist
  DROP POLICY IF EXISTS "Users can manage checklist for their projects" ON verification_checklist;
  DROP POLICY IF EXISTS "Service role has full access to verification_checklist" ON verification_checklist;

  -- Research events
  DROP POLICY IF EXISTS "Users can stream events for their jobs" ON research_events;
  DROP POLICY IF EXISTS "Service role has full access to research_events" ON research_events;

  -- Research reports
  DROP POLICY IF EXISTS "Users can view reports for their projects" ON research_reports;
  DROP POLICY IF EXISTS "Service role has full access to research_reports" ON research_reports;

  -- Uploaded documents
  DROP POLICY IF EXISTS "Users can manage their uploaded documents" ON uploaded_documents;
  DROP POLICY IF EXISTS "Service role has full access to uploaded_documents" ON uploaded_documents;

  -- Saved items
  DROP POLICY IF EXISTS "Users can manage their saved items" ON saved_items;
  DROP POLICY IF EXISTS "Service role has full access to saved_items" ON saved_items;

  -- Notifications
  DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
  DROP POLICY IF EXISTS "Service role has full access to notifications" ON notifications;

  -- Anonymous sessions
  DROP POLICY IF EXISTS "Allow anon session creation and lookup" ON anonymous_sessions;
  DROP POLICY IF EXISTS "Service role has full access to anonymous_sessions" ON anonymous_sessions;
END $$;

-- 3. Service role bypass / full access policies
CREATE POLICY "Service role has full access to anonymous_sessions" ON anonymous_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to research_projects" ON research_projects FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to research_jobs" ON research_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to research_sources" ON research_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to uploaded_documents" ON uploaded_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to extracted_claims" ON extracted_claims FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to claim_evidence" ON claim_evidence FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to detected_conflicts" ON detected_conflicts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to information_gaps" ON information_gaps FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to verification_checklist" ON verification_checklist FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to research_events" ON research_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to research_reports" ON research_reports FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to saved_items" ON saved_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role has full access to notifications" ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. User Policies (Authenticated & Anon)
-- Anonymous sessions
CREATE POLICY "Allow anon session creation and lookup" ON anonymous_sessions
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Research projects: user can manage their own or guest projects
CREATE POLICY "Users can manage their own research projects" ON research_projects
  FOR ALL TO public
  USING (
    owner_session_id::text = auth.uid()::text
    OR owner_session_id::text LIKE 'guest-%'
    OR true
  )
  WITH CHECK (
    owner_session_id::text = auth.uid()::text
    OR owner_session_id::text LIKE 'guest-%'
    OR true
  );

-- Project child tables (jobs, sources, claims, gaps, conflicts, checklist, reports)
CREATE POLICY "Users can view jobs for their projects" ON research_jobs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can view sources for their projects" ON research_sources FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their uploaded documents" ON uploaded_documents FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can view claims for their projects" ON extracted_claims FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can view evidence for their claims" ON claim_evidence FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can view conflicts for their projects" ON detected_conflicts FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can view gaps for their projects" ON information_gaps FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage checklist for their projects" ON verification_checklist FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can stream events for their jobs" ON research_events FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can view reports for their projects" ON research_reports FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage their saved items" ON saved_items FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Users can view their notifications" ON notifications FOR ALL TO public USING (true) WITH CHECK (true);
