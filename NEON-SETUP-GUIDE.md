# 🚀 Quick Setup Guide - Neon Database

## **Your Database Connection**
You already have your Neon PostgreSQL database set up with this connection string:
```
postgresql://neondb_owner:npg_D0wZTJ7uqdRr@ep-damp-pine-a83kg2ln-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

## **Step 1: Set Up Database Tables**

Connect to your database and run this SQL:

```sql
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
  last_request_time timestamptz,
  api_key_revoked boolean DEFAULT false
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

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- Insert default admin (password: admin123)
INSERT INTO admins (email, password_hash, name, role)
VALUES (
  'admin@plantdisease.com',
  'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  'System Administrator',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;
```

## **Step 2: Set Up Backend Environment**

Create a `.env` file in your `backend` folder:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_D0wZTJ7uqdRr@ep-damp-pine-a83kg2ln-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_random_secret_key_here
NODE_ENV=development
PORT=3001
```

## **Step 3: Install Backend Dependencies**

```bash
cd backend
npm install
```

## **Step 4: Test Backend Locally**

```bash
cd backend
npm run dev
```

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

## **Step 5: Deploy Backend to Render**

1. **Push your code to GitHub**
2. **Go to [render.com](https://render.com)**
3. **Create new Web Service**
4. **Connect your GitHub repo**
5. **Set environment variables**:
   - `DATABASE_URL`: Your Neon connection string
   - `GOOGLE_GEMINI_API_KEY`: Your Gemini API key
   - `JWT_SECRET`: Random secret key
   - `NODE_ENV`: production

## **Step 6: Update Frontend**

Update your frontend `.env` file:
```bash
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
VITE_ADMIN_EMAIL=admin@plantdisease.com
VITE_ADMIN_PASSWORD=admin123
```

## **Step 7: Deploy Frontend to Vercel**

```bash
npm install -g vercel
vercel --prod
```

## **🎯 Test Everything**

1. **Test backend health**:
```bash
curl https://your-render-app.onrender.com/health
```

2. **Test admin login**:
```bash
curl -X POST https://your-render-app.onrender.com/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@plantdisease.com","password":"admin123"}'
```

3. **Create a test company**:
```bash
curl -X POST https://your-render-app.onrender.com/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "test@example.com",
    "gemini_key": "your_gemini_api_key"
  }'
```

## **💰 Cost: $0/month**

- **Neon Database**: Free tier (3GB storage, unlimited requests)
- **Render Backend**: Free tier (750 hours/month)
- **Vercel Frontend**: Free tier (unlimited)
- **Google Gemini**: Free tier (15 requests/minute)

**Total setup time**: ~15 minutes 