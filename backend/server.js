const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes
app.use('/api/analyze-disease', require('./routes/analyze-disease'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/usage-tracking', require('./routes/usage-tracking'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin-auth', require('./routes/admin-auth'));
app.use('/api/cron', require('./routes/cron'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Plant Saathi AI Backend is running' });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const { rows } = await global.pool.query('SELECT COUNT(*) as count FROM companies');
    res.json({ 
      status: 'OK', 
      message: 'Database connection working',
      companies_count: rows[0].count
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test API key validation
app.get('/test-api-key', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    console.log('Received API key:', apiKey);
    
    if (!apiKey) {
      return res.json({ error: 'No API key provided' });
    }
    
    const apiKeyHash = require('crypto').createHash('sha256').update(apiKey.trim()).digest('hex');
    console.log('Generated hash:', apiKeyHash);
    
    const { rows } = await global.pool.query('SELECT * FROM companies WHERE api_key_hash = $1', [apiKeyHash]);
    console.log('Found companies:', rows.length);
    
    res.json({ 
      received_key: apiKey,
      generated_hash: apiKeyHash,
      found_companies: rows.length,
      companies: rows
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Test failed',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'An error occurred while processing your request.',
    branding: 'Powered by Plant Saathi AI'
  });
});

app.listen(PORT, () => {
  console.log(`Plant Saathi AI Backend running on port ${PORT}`);
});

// Export pool for routes to use
global.pool = pool;
