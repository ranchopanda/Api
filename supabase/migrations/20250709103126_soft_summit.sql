/*
# SaaS Platform Database Schema

1. New Tables
   - `companies` - Store company information and API configurations
   - `usage_logs` - Track API usage for billing and monitoring
   - `complaints` - Handle company complaints and issues
   - `admins` - Admin user management

2. Security
   - Enable RLS on all tables
   - Add policies for admin access only
   - Secure API key storage

3. Features
   - Daily usage limits with automatic reset
   - Encrypted Gemini API key storage
   - Usage tracking and billing
   - Complaint management system
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  api_key_hash text UNIQUE NOT NULL,
  gemini_key_encrypted text NOT NULL,
  daily_limit integer DEFAULT 100,
  current_usage integer DEFAULT 0,
  reset_date timestamptz DEFAULT now(),
  cost_per_extra_call decimal(10,4) DEFAULT 0.10,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  response_time integer, -- in milliseconds
  tokens_used integer DEFAULT 1,
  cost decimal(10,4) DEFAULT 0.00,
  success boolean DEFAULT true,
  error_message text,
  ip_address text,
  user_agent text
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  issue_type text NOT NULL CHECK (issue_type IN ('api_failure', 'billing', 'rate_limit', 'other')),
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_api_key ON companies(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_company_id ON usage_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_timestamp ON usage_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_complaints_company_id ON complaints(company_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin access only)
CREATE POLICY "Admins can manage companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can view usage logs"
  ON usage_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage complaints"
  ON complaints
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage admin accounts"
  ON admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE email = auth.jwt() ->> 'email' AND role = 'super_admin'
    )
  );

-- Function to reset daily usage counts
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
  UPDATE companies 
  SET current_usage = 0, reset_date = now()
  WHERE reset_date < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to check if company can make API call
CREATE OR REPLACE FUNCTION can_make_api_call(company_api_key text)
RETURNS boolean AS $$
DECLARE
  company_record companies%ROWTYPE;
BEGIN
  SELECT * INTO company_record
  FROM companies
  WHERE api_key_hash = company_api_key
  AND status = 'active'
  AND (expiry_date IS NULL OR expiry_date > now());
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Reset usage if day has passed
  IF company_record.reset_date < now() - interval '1 day' THEN
    UPDATE companies 
    SET current_usage = 0, reset_date = now()
    WHERE id = company_record.id;
    RETURN true;
  END IF;
  
  RETURN company_record.current_usage < company_record.daily_limit;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin (password: admin123)
INSERT INTO admins (email, password_hash, name, role)
VALUES (
  'admin@plantdisease.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash of 'admin123'
  'System Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;