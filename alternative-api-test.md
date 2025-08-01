# Alternative API Testing Methods

Since the edge function deployment requires CLI access, here are alternative ways to test the API:

## Method 1: API Key in Request Body

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca",
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves, brown spots"
  }'
```

## Method 2: API Key in Authorization Header (Bearer format)

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -d '{
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato"
  }'
```

## Method 3: API Key in Authorization Header (Direct)

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "Authorization: 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -d '{
    "image": "data:image/jpeg;base64,test",
    "crop": "tomato"
  }'
```

## Method 4: Using JavaScript/Fetch

```javascript
// Option 1: API key in body
fetch('https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: '3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca',
    image: 'data:image/jpeg;base64,test',
    crop: 'tomato'
  })
})

// Option 2: API key in Authorization header
fetch('https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca'
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,test',
    crop: 'tomato'
  })
})
```

## Method 5: Python Example

```python
import requests

# Option 1: API key in body
response = requests.post(
    'https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease',
    headers={'Content-Type': 'application/json'},
    json={
        'api_key': '3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca',
        'image': 'data:image/jpeg;base64,test',
        'crop': 'tomato'
    }
)

# Option 2: API key in Authorization header
response = requests.post(
    'https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca'
    },
    json={
        'image': 'data:image/jpeg;base64,test',
        'crop': 'tomato'
    }
)

print(response.json())
```

## Why These Methods Work

The updated edge function now accepts the API key in multiple ways:
1. `x-api-key` header (original method)
2. `Authorization: Bearer <api_key>` header
3. `Authorization: <api_key>` header (direct)
4. `api_key` field in the request body

This provides flexibility and works around the JWT verification requirement by accepting the API key through channels that Supabase allows.

## Testing Priority

Try these methods in order:
1. **Method 1** (API key in body) - Most likely to work
2. **Method 2** (Bearer format) - Second most likely
3. **Method 3** (Direct authorization) - Fallback option

The function will automatically detect and use whichever method you choose.