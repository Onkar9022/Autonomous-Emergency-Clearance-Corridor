import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AmbulanceStatus, CorridorStatus, IncidentStatus } from '@prisma/client';

const router = Router();

// GET /api/dashboard/metrics
router.get('/metrics', async (req: Request, res: Response): Promise<void> => {
  const [
    activeIncCount,
    enRouteAmbCount,
    activeCorridor,
    hospitalsCount,
    incidents,
    signalsCount,
  ] = await Promise.all([
    prisma.incident.count({
      where: { status: { notIn: [IncidentStatus.RESOLVED, IncidentStatus.CANCELLED] } },
    }),
    prisma.ambulance.count({
      where: { status: { in: [AmbulanceStatus.DISPATCHED, AmbulanceStatus.EN_ROUTE] } },
    }),
    prisma.greenCorridor.findFirst({
      where: { status: CorridorStatus.ACTIVE },
    }),
    prisma.hospital.count(),
    prisma.incident.findMany({
      select: { timeSavedMinutes: true, totalTravelMinutes: true },
    }),
    prisma.trafficSignal.count(),
  ]);

  const totalTimeSaved = incidents.reduce((acc, curr) => acc + (curr.timeSavedMinutes || 0), 0);
  const avgEta =
    incidents.length > 0
      ? Math.round(incidents.reduce((acc, curr) => acc + (curr.totalTravelMinutes || 8), 0) / incidents.length)
      : 8;

  let coordinatedSignals = 0;
  if (activeCorridor && activeCorridor.signalsSequenceJson) {
    try {
      const parsed = JSON.parse(activeCorridor.signalsSequenceJson);
      coordinatedSignals = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      coordinatedSignals = 0;
    }
  }

  res.json({
    success: true,
    data: {
      activeEmergencies: activeIncCount,
      ambulancesEnRoute: enRouteAmbCount,
      greenCorridorsActive: activeCorridor ? 1 : 0,
      hospitalsVerified: hospitalsCount,
      avgEstimatedEtaMinutes: avgEta,
      signalsCoordinated: coordinatedSignals,
      simulatedTimeSavedMinutes: totalTimeSaved,
      systemAvailabilityPercent: 100,
    },
  });
});

export default router;
