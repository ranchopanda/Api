# Corrected API Test Command

## Issue
You used `Authorization: Bearer` header, but the API expects `x-api-key` header.

## Correct curl command:

```bash
curl -X POST "https://wyvbhffvhsbcuylyidpj.supabase.co/functions/v1/analyze-disease" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
    "crop": "tomato",
    "location": "California, USA",
    "symptoms": "yellowing leaves, brown spots"
  }'
```

## Key Changes:
- Changed `Authorization: Bearer` to `x-api-key:`
- This matches how the edge function validates the API key

## For companies using your API, provide this format:

### Headers Required:
```
Content-Type: application/json
x-api-key: 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca
```

### NOT this format:
```
Authorization: Bearer 3caf1c96b196ca1ff9967c63fe2aed2a9708d9d59febd3851a151e15ff168aca
```

## Test with a real image:
To test with an actual image, you need to base64 encode it first:

```bash
# On macOS/Linux, encode an image file:
base64 -i your_plant_image.jpg

# Then use the output in the curl command
```