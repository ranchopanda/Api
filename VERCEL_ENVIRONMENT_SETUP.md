# Vercel Environment Variable Setup Guide

## 🚨 Current Issue
The application is showing this error:
```
Error fetching companies: Error: VITE_API_BASE_URL is not configured
```

This happens because the `VITE_API_BASE_URL` environment variable is not set in your Vercel deployment.

## 🔧 Solution: Set Environment Variable in Vercel

### Step 1: Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `apinew4aug-hqa00jg4b-ranchopandas-projects`
3. Click on the project

### Step 2: Add Environment Variable
1. Go to **Settings** tab
2. Click on **Environment Variables**
3. Add a new environment variable:

**Name**: `VITE_API_BASE_URL`  
**Value**: `https://plant-saathi-api.onrender.com/api`  
**Environment**: Production (and Preview if you want)

### Step 3: Redeploy
1. After adding the environment variable, click **Redeploy**
2. Or push a new commit to trigger automatic deployment

## 🎯 What This Fixes

- ✅ **Company Management**: All CRUD operations will work
- ✅ **Usage Analytics**: Data will load correctly
- ✅ **API Testing**: Will connect to your backend
- ✅ **Complaints Management**: Will work properly
- ✅ **Admin Dashboard**: All features will be functional

## 🔍 Alternative Solutions

### Option 1: Use the Built-in Fallback
The application already has a fallback mechanism in `src/utils/config.ts`:
```typescript
export const getApiBaseUrl = (): string => {
  return 'https://plant-saathi-api.onrender.com/api';
};
```

### Option 2: Create a .env.local file (for local development)
Create a `.env.local` file in your project root:
```
VITE_API_BASE_URL=https://plant-saathi-api.onrender.com/api
```

## 📊 Test Your Fix

After setting the environment variable and redeploying:

1. **Go to your frontend**: https://apinew4aug-hqa00jg4b-ranchopandas-projects.vercel.app/
2. **Try creating a company**: Should work without errors
3. **Check all features**: Companies, Analytics, API Testing

## 🎉 Expected Result

- ✅ No more "VITE_API_BASE_URL is not configured" errors
- ✅ Company creation works smoothly
- ✅ All API calls connect to your Render backend
- ✅ Full functionality restored

## 🔧 Manual Fix (if Vercel setup doesn't work)

If you can't access the Vercel dashboard, you can also:

1. **Fork the repository**
2. **Add the environment variable** in your fork
3. **Deploy from your fork**

## 📝 Environment Variable Details

- **Variable Name**: `VITE_API_BASE_URL`
- **Value**: `https://plant-saathi-api.onrender.com/api`
- **Purpose**: Tells the frontend where to find the backend API
- **Required**: Yes, for production deployment

---

**Your Plant Saathi AI application will be fully functional once this environment variable is set!** 🌱✨ 