#!/bin/bash

# Vercel Environment Variable Setup Script
# This script helps you set up the required environment variable for Vercel deployment

echo "🌱 Plant Saathi AI - Vercel Environment Setup"
echo "=============================================="
echo ""

echo "🚨 Current Issue:"
echo "Your application is showing: 'Error: VITE_API_BASE_URL is not configured'"
echo ""

echo "🔧 Solution:"
echo "You need to add the environment variable to your Vercel deployment."
echo ""

echo "📋 Steps to Fix:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Find your project: apinew4aug-hqa00jg4b-ranchopandas-projects"
echo "3. Click on the project"
echo "4. Go to Settings tab"
echo "5. Click on Environment Variables"
echo "6. Add new environment variable:"
echo "   - Name: VITE_API_BASE_URL"
echo "   - Value: https://plant-saathi-api.onrender.com/api"
echo "   - Environment: Production (and Preview if you want)"
echo "7. Click Redeploy"
echo ""

echo "🎯 What This Fixes:"
echo "✅ Company Management - All CRUD operations"
echo "✅ Usage Analytics - Data will load correctly"
echo "✅ API Testing - Will connect to your backend"
echo "✅ Complaints Management - Will work properly"
echo "✅ Admin Dashboard - All features will be functional"
echo ""

echo "📊 Test Your Fix:"
echo "After setting the environment variable and redeploying:"
echo "1. Go to your frontend: https://apinew4aug-hqa00jg4b-ranchopandas-projects.vercel.app/"
echo "2. Try creating a company - Should work without errors"
echo "3. Check all features - Companies, Analytics, API Testing"
echo ""

echo "🎉 Expected Result:"
echo "✅ No more 'VITE_API_BASE_URL is not configured' errors"
echo "✅ Company creation works smoothly"
echo "✅ All API calls connect to your Render backend"
echo "✅ Full functionality restored"
echo ""

echo "📝 Environment Variable Details:"
echo "- Variable Name: VITE_API_BASE_URL"
echo "- Value: https://plant-saathi-api.onrender.com/api"
echo "- Purpose: Tells the frontend where to find the backend API"
echo "- Required: Yes, for production deployment"
echo ""

echo "🌱 Your Plant Saathi AI application will be fully functional once this environment variable is set!" 