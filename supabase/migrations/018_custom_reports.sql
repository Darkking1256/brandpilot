-- Custom Reports Migration
-- Build and schedule custom analytics reports

CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  report_config JSONB NOT NULL, -- { metrics: [], dateRange: {}, filters: {}, chartTypes: [], layout: {} }
  is_scheduled BOOLEAN DEFAULT FALSE,
  schedule_config JSONB, -- { frequency: "weekly", day: 1, time: "09:00", recipients: [] }
  last_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_reports_user_id ON custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_scheduled ON custom_reports(is_scheduled);

-- Report generation history
CREATE TABLE IF NOT EXISTS report_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_url TEXT,
  format TEXT CHECK (format IN ('pdf', 'csv', 'excel', 'json')),
  file_size BIGINT
);

CREATE INDEX IF NOT EXISTS idx_report_generations_report_id ON report_generations(report_id);
CREATE INDEX IF NOT EXISTS idx_report_generations_generated_at ON report_generations(generated_at DESC);

-- Enable RLS
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on custom_reports for development"
  ON custom_reports FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on report_generations for development"
  ON report_generations FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_custom_reports_updated_at
  BEFORE UPDATE ON custom_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

