const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB, getDbStatus } = require('./config/db');
const carbonRoutes = require('./routes/carbonRoutes');
const userRoutes = require('./routes/userRoutes');
const historyRoutes = require('./routes/historyRoutes');
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    name: 'EcoTrack API Service',
    version: '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: getDbStatus()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/carbon/history', historyRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/users', userRoutes);

// Serve Static Frontend files (so app can run as unified full-stack)
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir));

// Fallback to index.html for root or client navigation if not an API route
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Middleware for 404 & Global errors on unmatched routes
app.use('/api/*', notFound);
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌱 EcoTrack Backend Server running on port ${PORT}`);
    console.log(`🚀 API Base URL:    http://localhost:${PORT}/api`);
    console.log(`🌍 Web Application: http://localhost:${PORT}`);
    console.log(`📋 Health Check:    http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
