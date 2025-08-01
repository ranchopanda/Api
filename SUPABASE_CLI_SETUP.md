# Supabase CLI Setup and Deployment Guide

## Step 1: Install Supabase CLI

### On macOS (using Homebrew):
```bash
brew install supabase/tap/supabase
```

### On macOS/Linux (using npm):
```bash
npm install -g supabase
```

### On Windows:
```bash
npm install -g supabase
```

## Step 2: Login to Supabase
```bash
supabase login
```
This will open a browser window for you to authenticate with your Supabase account.

## Step 3: Link Your Project
```bash
supabase link --project-ref wyvbhffvhsbcuylyidpj
```

## Step 4: Deploy the Edge Function (CRITICAL STEP)
```bash
supabase functions deploy analyze-disease --no-verify-jwt
```

**The `--no-verify-jwt` flag is absolutely essential!** Without it, the function will continue to require JWT authentication.

## Step 5: Verify Deployment
After deployment, you should see output similar to:
```
Deployed Function analyze-disease on project wyvbhffvhsbcuylyidpj
```

## Step 6: Test the API
Once deployed with `--no-verify-jwt`, try your curl command:

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -d '{
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato"
  }'
```

## Alternative Test Methods (after deployment):

### Method 1: API Key in Request Body
```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca",
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato"
  }'
```

### Method 2: API Key in Authorization Header
```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -d '{
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato"
  }'
```

## Troubleshooting

### If you get "Project not found" error:
Make sure you're using the correct project reference: `wyvbhffvhsbcuylyidpj`

### If you get permission errors:
Make sure you're logged in with the correct Supabase account that has access to this project.

### If deployment fails:
1. Check that you're in the correct directory (should contain the `supabase/functions` folder)
2. Verify the function files exist in `supabase/functions/analyze-disease/`
3. Check your internet connection

## Important Notes

- **The `--no-verify-jwt` flag is the key to making this work**
- Without this flag, Supabase will continue to require JWT authentication
- This flag tells Supabase to allow unauthenticated access to this specific function
- Your function's code will then handle API key validation internally

## Expected Result

After successful deployment with `--no-verify-jwt`, your API should:
1. Accept requests without JWT tokens
2. Validate the custom `x-api-key` header or `api_key` in request body
3. Return proper plant disease analysis results
4. Log usage to your database

The error messages "Missing authorization header" and "Invalid JWT" should disappear once the function is properly deployed with the `--no-verify-jwt` flag.