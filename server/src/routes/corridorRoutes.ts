import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { CorridorStatus, Role, SignalState } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { UpdateCorridorStatusSchema } from '../types.js';

const router = Router();

// GET /api/corridors/active
router.get('/active', async (req: Request, res: Response): Promise<void> => {
  const active = await prisma.greenCorridor.findFirst({
    where: {
      status: {
        in: [CorridorStatus.ACTIVE, CorridorStatus.REQUESTED, CorridorStatus.PLANNED],
      },
    },
    include: {
      incident: true,
      ambulance: true,
      hospital: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: active });
});

// POST /api/corridors/:id/status
router.post(
  '/:id/status',
  requireAuth,
  requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsed = UpdateCorridorStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid corridor status payload', details: parsed.error.format() });
      return;
    }

    const { status, signalsSequenceJson } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const corridor = await tx.greenCorridor.update({
        where: { id },
        data: {
          status,
          ...(signalsSequenceJson ? { signalsSequenceJson } : {}),
          ...(status === CorridorStatus.ACTIVE ? { activatedAt: new Date() } : {}),
          ...(status === CorridorStatus.RELEASED ? { releasedAt: new Date() } : {}),
        },
      });

      // If active, lock signals to priority_active
      if (status === CorridorStatus.ACTIVE) {
        await tx.trafficSignal.updateMany({
          data: {
            state: SignalState.PRIORITY_ACTIVE,
            lastAck: 'Locked by AECC Priority Grid',
          },
        });
      } else if (status === CorridorStatus.RELEASED) {
        // Restore equilibrium
        await tx.trafficSignal.updateMany({
          data: {
            state: SignalState.GREEN,
            lastAck: 'Corridor Released (Civilian Equilibrium)',
          },
        });
      }

      return corridor;
    });

    await prisma.incidentAuditLog.create({
      data: {
        category: 'Corridor',
        severity: status === CorridorStatus.ACTIVE ? 'Critical' : 'Info',
        message: `Green corridor ${updated.id} status transitioned to ${updated.status} by ${req.user?.fullName}.`,
        userId: req.user?.id,
      },
    });

    res.json({ success: true, data: updated });
  }
);

export default router;
