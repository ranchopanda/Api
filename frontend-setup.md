# Frontend Setup Guide

## 🚀 Fix the "Error saving company: Unknown error" Issue

The error you're seeing is because your Vercel frontend doesn't have the correct environment variable set to connect to your Render backend.

## 🔧 Solution: Set Environment Variable in Vercel

### **Step 1: Go to Vercel Dashboard**
1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your project: `apinew4aug-p1vjd72zr-ranchopandas-projects`
3. Click on the project

### **Step 2: Add Environment Variable**
1. Go to **Settings** tab
2. Click on **Environment Variables**
3. Add a new environment variable:

**Name**: `VITE_API_BASE_URL`  
**Value**: `https://plant-saathi-api.onrender.com/api`  
**Environment**: Production (and Preview if you want)

### **Step 3: Redeploy**
1. After adding the environment variable, click **Redeploy**
2. Or push a new commit to trigger automatic deployment

## 🎯 What This Fixes

- ✅ **Company Creation**: Will work properly
- ✅ **Company Management**: All CRUD operations
- ✅ **Usage Analytics**: Will load data correctly
- ✅ **API Testing**: Will connect to your backend
- ✅ **Complaints Management**: Will work properly

## 🔍 Alternative: Hardcoded Fallback

If you can't set the environment variable, the frontend now has a fallback:

```javascript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://plant-saathi-api.onrender.com/api';
```

This means it will work even without the environment variable, but it's better to set it properly.

## 📊 Test Your Fix

After setting the environment variable and redeploying:

1. **Go to your frontend**: https://apinew4aug-p1vjd72zr-ranchopandas-projects.vercel.app/
2. **Try creating a company**: Should work without errors
3. **Check all features**: Companies, Analytics, API Testing

## 🎉 Expected Result

- ✅ No more "Unknown error" messages
- ✅ Company creation works smoothly
- ✅ All API calls connect to your Render backend
- ✅ Full functionality restored

---

**Your Plant Saathi AI application will be fully functional once this environment variable is set!** 🌱✨ 