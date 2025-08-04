# Deploy Supabase Edge Functions

To deploy the edge functions for this project, you need to use the Supabase CLI with the correct flags.

## Prerequisites

1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref wyvbhffvhsbcuylyidpj`

## Deploy Commands

### 1. Deploy analyze-disease function (PUBLIC - no JWT verification)
```bash
supabase functions deploy analyze-disease --no-verify-jwt
```

### 2. Deploy other functions (require authentication)
```bash
supabase functions deploy companies-management
supabase functions deploy usage-tracking
supabase functions deploy complaints-management
supabase functions deploy admin-auth
```

## Important Notes

- The `analyze-disease` function MUST be deployed with `--no-verify-jwt` flag
- This allows the function to accept custom `x-api-key` headers instead of requiring Supabase JWT
- Other admin functions should require authentication for security

## Test after deployment

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -d '{
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato"
  }'
```

## Verify deployment

Check the Supabase dashboard:
1. Go to Edge Functions
2. Verify `analyze-disease` shows as deployed
3. Check that it's configured as public (no JWT verification)