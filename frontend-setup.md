# Frontend Setup for Free Backend

## Step 1: Update Environment Variables

Replace the Supabase environment variables in your `.env` file:

```bash
# Remove these
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Add these instead
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_ADMIN_EMAIL=admin@plantdisease.com
VITE_ADMIN_PASSWORD=admin123
```

## Step 2: Update API Calls

Replace all Supabase function calls with your new API endpoints:

### Before (Supabase):
```javascript
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-disease`, {
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

### After (Express.js):
```javascript
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analyze-disease`, {
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

## Step 3: Update Component Files

### CompaniesManagement.tsx
Replace all API calls:
```javascript
// Old
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/companies-management`);

// New
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies`);
```

### APITester.tsx
Replace API calls:
```javascript
// Old
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-disease`);

// New
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/analyze-disease`);
```

### UsageAnalytics.tsx
Replace API calls:
```javascript
// Old
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/usage-tracking`);

// New
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/usage-tracking`);
```

### ComplaintsManagement.tsx
Replace API calls:
```javascript
// Old
const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complaints-management`);

// New
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaints`);
```

## Step 4: Deploy Frontend to Vercel

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel --prod
```

3. **Set environment variables** in Vercel dashboard:
   - `VITE_API_BASE_URL`
   - `VITE_ADMIN_EMAIL`
   - `VITE_ADMIN_PASSWORD`

## Step 5: Test the Setup

1. **Test API endpoint**:
```bash
curl -X POST "https://your-railway-app.railway.app/api/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato"
  }'
```

2. **Test admin dashboard** at your Vercel URL
3. **Create a test company** with a valid Gemini API key
4. **Test the complete flow** with a real plant image 