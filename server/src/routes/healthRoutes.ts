import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';
import { UpdateSettingSchema } from '../types.js';
import { seedDatabase } from '../seed.js';

const router = Router();

// GET /api/health
router.get('/', async (req: Request, res: Response): Promise<void> => {
  let dbStatus = 'Disconnected';
  let dbLatencyMs = 0;

  try {
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - start);
    dbStatus = 'Connected';
  } catch (e: any) {
    dbStatus = `Error: ${e.message}`;
  }

  res.json({
    success: true,
    status: dbStatus === 'Connected' ? 'Healthy' : 'Degraded',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: {
        provider: 'Neon PostgreSQL (AWS us-east-2)',
        status: dbStatus,
        latency: `${dbLatencyMs}ms`,
      },
      routingEngine: {
        provider: 'OSRM Driving Engine',
        status: 'Operational',
        fallback: 'AECC Deterministic GIS Model Active',
      },
      memory: {
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    },
  });
});

// GET /api/settings
router.get('/settings', async (req: Request, res: Response): Promise<void> => {
  const settings = await prisma.systemSetting.findMany();
  res.json({ success: true, data: settings });
});

// POST /api/settings
router.post('/settings', requireAuth, requireRole(Role.ADMINISTRATOR), async (req: Request, res: Response): Promise<void> => {
  const parsed = UpdateSettingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Invalid setting payload' });
    return;
  }

  const { key, value } = parsed.data;
  const updated = await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  res.json({ success: true, data: updated });
});

// POST /api/settings/reset (Re-seed demo data to clean Solapur baseline)
router.post('/settings/reset', requireAuth, requireRole(Role.ADMINISTRATOR), async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.greenCorridor.deleteMany();
    await prisma.routeAlternative.deleteMany();
    await prisma.incident.deleteMany();
    await prisma.ambulance.updateMany({
      data: { status: 'AVAILABLE', assignedIncidentId: null, speedKmH: 0 },
    });
    await prisma.trafficSignal.updateMany({
      data: { state: 'RED', lastAck: 'Normal cycle restored' },
    });

    await seedDatabase();

    res.json({ success: true, message: 'All AECC state reset to clean Solapur baseline.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
