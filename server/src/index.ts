import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import corridorRoutes from './routes/corridorRoutes.js';
import signalRoutes from './routes/signalRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './prisma.js';

dotenv.config();

// Fail-fast environment variable validation
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`FATAL CONFIGURATION ERROR: Missing required environment variable(s): ${missingVars.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Request Logging in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = performance.now();
    res.on('finish', () => {
      const dur = Math.round(performance.now() - start);
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${dur}ms)`);
    });
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/corridors', corridorRoutes);
app.use('/api/signals', signalRoutes);
app.use('/api/events', auditRoutes);
app.use('/api/reports', auditRoutes);
app.use('/api/health', healthRoutes);

// Root Health Probe
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'AECC Backend Gateway', version: '2.0.0' });
});

// Centralized Error Handling
app.use(errorHandler);

// Server startup
const server = app.listen(PORT, () => {
  console.log(`🚀 AECC PostgreSQL Backend Server listening on http://localhost:${PORT}`);
  console.log(`📡 Connected to Neon PostgreSQL (AWS us-east-2) with Prisma ORM`);
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down AECC backend gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ PostgreSQL connection pool closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
