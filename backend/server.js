const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'plant-saathi-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log' 
  }));
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration - FUTURE PROOF SOLUTION
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, use dynamic CORS handling
    const allowedOrigins = [
      // Legacy domains (for backward compatibility)
      'https://apinew4aug-p1vjd72zr-ranchopandas-projects.vercel.app',
      'https://apinew4aug-18met8g4f-ranchopandas-projects.vercel.app',
      'https://apinew4aug-hqa00jg4b-ranchopandas-projects.vercel.app',
      'https://apinew4aug-p5ihzqbvo-ranchopandas-projects.vercel.app',
      'https://apinew4aug-mh0l32eph-ranchopandas-projects.vercel.app',
      // Current domain
      'https://apinew4aug.vercel.app'
    ];
    
    // Add FRONTEND_URL from environment variable
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
    }
    
    // DYNAMIC SOLUTION: Allow any Vercel domain for this project
    const vercelDomainPattern = /^https:\/\/apinew4aug-[a-zA-Z0-9]+-ranchopandas-projects\.vercel\.app$/;
    const vercelAppPattern = /^https:\/\/apinew4aug\.vercel\.app$/;
    
    if (vercelDomainPattern.test(origin) || vercelAppPattern.test(origin)) {
      console.log('CORS: Allowing Vercel domain:', origin);
      return callback(null, true);
    }
    
    // Check against static allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing static domain:', origin);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.log('CORS: Blocked origin:', origin);
    console.log('CORS: Allowed origins:', allowedOrigins);
    console.log('CORS: FRONTEND_URL:', process.env.FRONTEND_URL);
    
    callback(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later',
    branding: 'Powered by Plant Saathi AI'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Reduced for free tier (was 20)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased from 2000 to 10000 for cross-region latency
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed:', err);
  } else {
    logger.info('Database connected successfully');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'connected'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Plant Saathi AI API',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/docs'
  });
});

// Make pool globally available
global.pool = pool;
global.logger = logger;

// Routes
app.use('/api/analyze-disease', require('./routes/analyze-disease'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/admin-auth', require('./routes/admin-auth'));
app.use('/api/usage-tracking', require('./routes/usage-tracking'));
app.use('/api/cron', require('./routes/cron'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
    branding: 'Powered by Plant Saathi AI'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'An error occurred while processing your request.',
    branding: 'Powered by Plant Saathi AI'
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    pool.end(() => {
      logger.info('Database pool closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

const server = app.listen(PORT, () => {
  logger.info(`Plant Saathi AI Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Export app for testing
module.exports = app;
