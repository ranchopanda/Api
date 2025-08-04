# 🆓 Complete Free Setup Guide - Plant Saathi AI

## **📋 What You'll Get (100% Free)**

✅ **Database**: Railway PostgreSQL (1GB storage, 1000 requests/day)  
✅ **Backend**: Railway Express.js API (free tier)  
✅ **Frontend**: Vercel React app (free tier)  
✅ **File Storage**: Local storage (no external service needed)  
✅ **AI**: Google Gemini API (free tier - 15 requests/minute)  

## **🚀 Step-by-Step Setup**

### **Step 1: Database Setup (Railway)**

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Create new project

2. **Add PostgreSQL Database**:
   - Click "New Service" → "Database" → "PostgreSQL"
   - Wait for provisioning
   - Copy the connection string

3. **Run Database Migration**:
   - Go to your PostgreSQL service in Railway
   - Click "Query" tab
   - Run the SQL from `database-setup.md`

### **Step 2: Backend Setup (Railway)**

1. **Create Backend Service**:
   - In your Railway project, click "New Service" → "GitHub Repo"
   - Connect your GitHub repository
   - Select the `backend` folder

2. **Set Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_random_secret_key
   NODE_ENV=production
   ```

3. **Deploy Backend**:
   - Railway will automatically deploy when you push to GitHub
   - Get your backend URL (e.g., `https://your-app.railway.app`)

### **Step 3: Frontend Setup (Vercel)**

1. **Update Environment Variables**:
   ```bash
   # In your frontend .env file
   VITE_API_BASE_URL=https://your-app.railway.app/api
   VITE_ADMIN_EMAIL=admin@plantdisease.com
   VITE_ADMIN_PASSWORD=admin123
   ```

2. **Update API Calls** (see `frontend-setup.md`)

3. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

### **Step 4: Get Google Gemini API Key**

1. **Create Google AI Studio Account**:
   - Go to [aistudio.google.com](https://aistudio.google.com)
   - Sign in with Google account
   - Create new API key

2. **Add to Backend**:
   - Add `GOOGLE_GEMINI_API_KEY=your_key` to Railway environment variables

### **Step 5: Test Everything**

1. **Test Backend Health**:
   ```bash
   curl https://your-app.railway.app/health
   ```

2. **Test API Endpoint**:
   ```bash
   curl -X POST "https://your-app.railway.app/api/analyze-disease" \
     -H "Content-Type: application/json" \
     -H "x-api-key: YOUR_API_KEY" \
     -d '{
       "image": "data:image/jpeg;base64,test",
       "crop": "tomato"
     }'
   ```

3. **Test Admin Dashboard**:
   - Visit your Vercel URL
   - Login with `admin@plantdisease.com` / `admin123`
   - Create a test company

## **🔧 Required Files Structure**

```
your-project/
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   ├── analyze-disease.js
│   │   ├── companies.js
│   │   ├── usage-tracking.js
│   │   ├── complaints.js
│   │   └── admin-auth.js
│   └── middleware/
│       ├── auth.js
│       └── rateLimit.js
├── frontend/ (your existing React app)
│   ├── src/
│   ├── package.json
│   └── .env
└── README.md
```

## **💰 Cost Breakdown**

| Service | Free Tier | Your Usage |
|---------|-----------|------------|
| Railway Database | 1GB storage, 1000 req/day | ~$0 |
| Railway Backend | 500 hours/month | ~$0 |
| Vercel Frontend | Unlimited | ~$0 |
| Google Gemini | 15 req/minute | ~$0 |
| **Total** | | **$0/month** |

## **🚨 Important Notes**

1. **Railway Free Tier Limits**:
   - Database: 1GB storage, 1000 requests/day
   - Backend: 500 hours/month
   - Upgrade when needed

2. **Google Gemini Limits**:
   - 15 requests/minute
   - 60 requests/minute with billing enabled
   - Free tier is sufficient for testing

3. **Vercel Limits**:
   - 100GB bandwidth/month
   - Unlimited deployments
   - Perfect for frontend hosting

## **🔧 Troubleshooting**

### **Database Connection Issues**
```bash
# Check Railway logs
railway logs

# Test connection
psql $DATABASE_URL -c "SELECT NOW();"
```

### **Backend Deployment Issues**
```bash
# Check Railway logs
railway logs

# Test locally
cd backend
npm install
npm run dev
```

### **Frontend Issues**
```bash
# Check Vercel logs
vercel logs

# Test locally
npm run dev
```

## **📈 Scaling Up (When Ready)**

When you need to upgrade:

1. **Railway Pro**: $5/month for more resources
2. **Google Gemini**: Pay-per-use after free tier
3. **Vercel Pro**: $20/month for team features
4. **Custom Domain**: $10-15/year

## **🎯 Next Steps**

1. **Set up the database** using Railway
2. **Deploy the backend** to Railway
3. **Update frontend** API calls
4. **Deploy frontend** to Vercel
5. **Test the complete flow**
6. **Create your first company** in the admin dashboard
7. **Test with real plant images**

**Total setup time**: ~30 minutes  
**Monthly cost**: $0  
**Ready for production**: Yes (with monitoring) 