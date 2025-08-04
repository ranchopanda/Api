CREATE TABLE IF NOT EXISTS analysis_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  analysis_result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
