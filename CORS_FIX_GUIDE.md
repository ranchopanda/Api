# CORS Issue Fix Guide

## 🚨 Current Issue
Your application is showing CORS (Cross-Origin Resource Sharing) errors:
```
Access to fetch at 'https://plant-saathi-api.onrender.com/api/companies' from origin 'https://apinew4aug-18met8g4f-ranchopandas-projects.vercel.app' has been blocked by CORS policy
```

## 🔍 Root Cause
The backend API is configured to only allow requests from the old Vercel domain (`https://apinew4aug-p1vjd72zr-ranchopandas-projects.vercel.app`), but your frontend is now deployed on a new domain (`https://apinew4aug-18met8g4f-ranchopandas-projects.vercel.app`).

## 🛠️ Solution: Update Backend CORS Configuration

### Step 1: Backend Code Changes (Already Done)
I've updated the backend CORS configuration in `backend/server.js` to allow multiple domains:

```javascript
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, allow specific domains
    const allowedOrigins = [
      'https://apinew4aug-p1vjd72zr-ranchopandas-projects.vercel.app',
      'https://apinew4aug-18met8g4f-ranchopandas-projects.vercel.app',
      'https://apinew4aug-hqa00jg4b-ranchopandas-projects.vercel.app'
    ];
    
    // Also allow the FRONTEND_URL environment variable if set
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};
```

### Step 2: Update Render Deployment Configuration
I've updated `render.yaml` to use the new frontend URL:
```yaml
- key: FRONTEND_URL
  value: https://apinew4aug-18met8g4f-ranchopandas-projects.vercel.app/
```

### Step 3: Redeploy Backend to Render
You need to redeploy your backend to Render to apply these changes:

**Option A: Automatic Redeploy (Recommended)**
1. Push these changes to your GitHub repository
2. Render will automatically redeploy the backend
3. Wait 2-3 minutes for deployment to complete

**Option B: Manual Redeploy**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `plant-saathi-backend` service
3. Click "Manual Deploy" → "Deploy latest commit"

## 🎯 What This Fixes

- ✅ **Company Management**: All CRUD operations will work
- ✅ **API Testing**: Will connect to backend properly
- ✅ **Usage Analytics**: Data will load correctly
- ✅ **Complaints Management**: Will work properly
- ✅ **Admin Dashboard**: All features will be functional

## 📊 Test Your Fix

After redeploying the backend:

1. **Wait 2-3 minutes** for the deployment to complete
2. **Go to your frontend**: https://apinew4aug-18met8g4f-ranchopandas-projects.vercel.app/
3. **Try creating a company**: Should work without CORS errors
4. **Check all features**: Companies, Analytics, API Testing

## 🎉 Expected Result

- ✅ No more CORS errors
- ✅ "Failed to fetch" errors resolved
- ✅ Company creation works smoothly
- ✅ All API calls connect to your Render backend
- ✅ Full functionality restored

## 🔧 Alternative: Quick Test

You can test if the backend is working by making a direct API call:

```bash
curl -X GET https://plant-saathi-api.onrender.com/api/companies \
  -H "Content-Type: application/json"
```

This should return a JSON response (even if empty) without CORS errors.

## 📝 Technical Details

**CORS Error Explanation:**
- CORS is a security feature that prevents web pages from making requests to different domains
- Your backend was only allowing requests from the old Vercel domain
- The new domain wasn't in the allowed list, causing the error

**Solution Details:**
- Updated CORS configuration to allow multiple domains
- Added both old and new Vercel domains to the allowed list
- Made the configuration more flexible for future domain changes

---

**Your Plant Saathi AI application will be fully functional once the backend is redeployed!** 🌱✨ 