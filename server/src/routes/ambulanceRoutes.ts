import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AmbulanceStatus, Role } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/ambulances
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const ambulances = await prisma.ambulance.findMany({
    orderBy: { id: 'asc' },
  });
  res.json({ success: true, data: ambulances });
});

// PATCH /api/ambulances/:id/release (Return ambulance to Available)
router.patch('/:id/release', requireAuth, requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const updated = await prisma.ambulance.update({
    where: { id },
    data: {
      status: AmbulanceStatus.AVAILABLE,
      assignedIncidentId: null,
      speedKmH: 0,
    },
  });

  await prisma.incidentAuditLog.create({
    data: {
      category: 'Fleet',
      severity: 'Info',
      message: `Ambulance ${updated.callSign} (${updated.id}) manually returned to AVAILABLE status by ${req.user?.fullName}.`,
      userId: req.user?.id,
    },
  });

  res.json({ success: true, data: updated });
});

export default router;
