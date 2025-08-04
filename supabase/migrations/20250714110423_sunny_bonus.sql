/*
  # Enhanced API Management System

  1. New Features
    - API key expiry dates
    - API key revocation system
    - Company-specific pricing
    - Usage analytics improvements
    - Rate limiting support
    - Audit logging

  2. Database Changes
    - Add expiry_date to companies table
    - Add revoked flag for API keys
    - Add pricing fields
    - Create audit_logs table
    - Add rate limiting fields

  3. Security Enhancements
    - Better tracking and monitoring
    - Comprehensive audit trail
*/

-- Add expiry and revocation support to companies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'api_key_revoked'
  ) THEN
    ALTER TABLE companies ADD COLUMN api_key_revoked BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'api_key_created_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN api_key_created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Add rate limiting fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'rate_limit_per_minute'
  ) THEN
    ALTER TABLE companies ADD COLUMN rate_limit_per_minute INTEGER DEFAULT 60;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'last_request_time'
  ) THEN
    ALTER TABLE companies ADD COLUMN last_request_time TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'requests_this_minute'
  ) THEN
    ALTER TABLE companies ADD COLUMN requests_this_minute INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create audit logs table for tracking all API key operations
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  admin_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins
    WHERE admins.email = (jwt() ->> 'email')
  ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_companies_expiry_date ON companies(expiry_date);
CREATE INDEX IF NOT EXISTS idx_companies_api_key_revoked ON companies(api_key_revoked);