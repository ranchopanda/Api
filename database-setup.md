# Free Database Setup - Railway PostgreSQL

## Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

## Step 2: Add PostgreSQL Database
1. Click "New Service" → "Database" → "PostgreSQL"
2. Wait for provisioning
3. Copy the connection string

## Step 3: Run Database Migration
```sql
-- Copy this from supabase/migrations/20250709103126_soft_summit.sql
-- Run in Railway's SQL editor or via connection

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
  updated_at timestamptz DEFAULT now(),
  rate_limit_per_minute integer DEFAULT 60,
  requests_this_minute integer DEFAULT 0,
  last_request_time timestamptz
);

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  response_time integer,
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

-- Insert default admin (password: admin123)
INSERT INTO admins (email, password_hash, name, role)
VALUES (
  'admin@plantdisease.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'System Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;
```

## Step 4: Environment Variables
Add to your Railway project:
```
DATABASE_URL=postgresql://user:password@host:port/database
``` 