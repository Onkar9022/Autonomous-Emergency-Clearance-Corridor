import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { Role, SignalState } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ToggleSignalSchema } from '../types.js';

const router = Router();

// GET /api/signals
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const signals = await prisma.trafficSignal.findMany({
    orderBy: { id: 'asc' },
  });
  res.json({ success: true, data: signals });
});

// POST /api/signals/:id/state
// RBAC Enforcement: Administrator and Emergency Operator only. Observer receives 403.
router.post(
  '/:id/state',
  requireAuth,
  requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = ToggleSignalSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid signal state payload', details: parsed.error.format() });
      return;
    }

    const targetSignal = await prisma.trafficSignal.findUnique({ where: { id } });
    if (!targetSignal) {
      res.status(404).json({ success: false, error: `Traffic signal with ID ${id} not found.` });
      return;
    }

    const updated = await prisma.trafficSignal.update({
      where: { id },
      data: {
        state: parsed.data.state,
        lastAck: 'Just now (Simulated Virtual Hold)',
      },
    });

    await prisma.incidentAuditLog.create({
      data: {
        category: 'Traffic Signal',
        severity: 'Warning',
        message: `Signal ${updated.id} (${updated.intersectionName}) state toggled to ${updated.state} by ${req.user?.fullName} (${req.user?.role}).`,
        userId: req.user?.id,
      },
    });

    res.json({ success: true, data: updated });
  }
);

export default router;
