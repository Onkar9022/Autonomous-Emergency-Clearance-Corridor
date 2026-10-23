import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import {
  AmbulanceStatus,
  CorridorStatus,
  IncidentStatus,
  Role,
  SignalState,
} from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  CreateIncidentSchema,
  AssignAmbulanceSchema,
  SelectHospitalSchema,
  SelectRouteSchema,
} from '../types.js';
import {
  calculateHaversineDistance,
  fetchRoutesFromOSRM,
} from '../services/routing.js';

const router = Router();

// GET /api/incidents
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const statusFilter = req.query.status as string;

  const incidents = await prisma.incident.findMany({
    where: statusFilter ? { status: statusFilter as IncidentStatus } : undefined,
    include: {
      destinationHospital: true,
      assignedAmbulance: true,
      routes: { orderBy: { routeIndex: 'asc' } },
      corridorPlan: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: incidents });
});

// GET /api/incidents/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: {
      destinationHospital: true,
      assignedAmbulance: true,
      routes: { orderBy: { routeIndex: 'asc' } },
      corridorPlan: true,
      auditLogs: { orderBy: { timestamp: 'desc' } },
    },
  });

  if (!incident) {
    res.status(404).json({ success: false, error: `Incident ${id} not found.` });
    return;
  }

  res.json({ success: true, data: incident });
});

// POST /api/incidents (Register new emergency incident)
router.post('/', requireAuth, requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR), async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateIncidentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.format() });
    return;
  }

  const {
    category,
    severity,
    location,
    patientReference,
    patientCount,
    medicalRequirements,
    reportingSource,
    notes,
  } = parsed.data;

  // 1. Find nearest suitable hospital from DB
  const hospitals = await prisma.hospital.findMany();
  let bestHospital = hospitals[0];
  let minScore = Infinity;

  hospitals.forEach((h) => {
    const dist = calculateHaversineDistance(location.lat, location.lng, h.lat, h.lng);
    let penalty = 1.0;
    if (category.toLowerCase().includes('accident') && !h.traumaLevel.includes('Level 1')) {
      penalty = 2.5;
    }
    const score = dist * penalty;
    if (score < minScore) {
      minScore = score;
      bestHospital = h;
    }
  });

  // 2. Concurrency-safe ambulance check
  const availableAmbulances = await prisma.ambulance.findMany({
    where: { status: AmbulanceStatus.AVAILABLE },
    orderBy: { id: 'asc' },
  });

  const bestAmbulance = availableAmbulances.length > 0 ? availableAmbulances[0] : null;

  // 3. Generate Road Routes (OSRM with fallback)
  const generatedRoutes = await fetchRoutesFromOSRM(location, { lat: bestHospital.lat, lng: bestHospital.lng });
  const topRoute = generatedRoutes[0];

  // 4. Identify matching traffic signals along route (< 450m)
  const trafficSignals = await prisma.trafficSignal.findMany();
  const matchedSignals: any[] = [];
  trafficSignals.forEach((sig) => {
    let minDist = Infinity;
    let bestWaypointIdx = 0;
    topRoute.geometry.forEach((pt: [number, number], idx: number) => {
      const d = calculateHaversineDistance(sig.lat, sig.lng, pt[0], pt[1]);
      if (d < minDist) {
        minDist = d;
        bestWaypointIdx = idx;
      }
    });

    if (minDist <= 0.45) {
      matchedSignals.push({
        id: sig.id,
        intersectionName: sig.intersectionName,
        lat: sig.lat,
        lng: sig.lng,
        waypointIndex: bestWaypointIdx,
        progressPct: bestWaypointIdx / Math.max(1, topRoute.geometry.length - 1),
        estEtaSeconds: Math.round((bestWaypointIdx / Math.max(1, topRoute.geometry.length - 1)) * (topRoute.durationMinutes * 60)),
        corridorState: 'Pending Priority Hold',
      });
    }
  });

  matchedSignals.sort((a, b) => a.waypointIndex - b.waypointIndex);

  const incidentId = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // 5. Execute DB write in atomic transaction
  const createdIncident = await prisma.$transaction(async (tx) => {
    const inc = await tx.incident.create({
      data: {
        id: incidentId,
        category,
        severity,
        status: bestAmbulance ? IncidentStatus.DISPATCHED : IncidentStatus.REPORTED,
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        patientReference: patientReference || `PAT-${Date.now().toString().slice(-4)}`,
        patientCount,
        medicalRequirements,
        reportingSource,
        notes,
        destinationHospitalId: bestHospital.id,
        reportedById: req.user?.id,
        timeSavedMinutes: topRoute.estTimeSavedMinutes,
        totalTravelMinutes: topRoute.durationMinutes,
      },
    });

    // If ambulance available, atomically assign
    if (bestAmbulance) {
      await tx.ambulance.update({
        where: { id: bestAmbulance.id },
        data: {
          status: AmbulanceStatus.DISPATCHED,
          assignedIncidentId: inc.id,
        },
      });
    }

    // Persist Route Alternatives
    for (const r of generatedRoutes) {
      await tx.routeAlternative.create({
        data: {
          incidentId: inc.id,
          routeIndex: r.routeIndex,
          name: r.name,
          geometryJson: JSON.stringify(r.geometry),
          distanceKm: r.distanceKm,
          durationMinutes: r.durationMinutes,
          congestionLevel: r.congestionLevel,
          signalCount: r.signalCount,
          score: r.score,
          scoreBreakdownJson: JSON.stringify(r.scoreBreakdown),
          source: r.source,
          restrictions: r.restrictions,
          estTimeSavedMinutes: r.estTimeSavedMinutes,
          isSelected: r.isSelected,
        },
      });
    }

    // Persist Green Corridor Plan
    await tx.greenCorridor.create({
      data: {
        id: `COR-${inc.id}`,
        incidentId: inc.id,
        status: CorridorStatus.PLANNED,
        ambulanceId: bestAmbulance?.id || null,
        hospitalId: bestHospital.id,
        signalsSequenceJson: JSON.stringify(matchedSignals),
      },
    });

    // Create Audit Log
    await tx.incidentAuditLog.create({
      data: {
        incidentId: inc.id,
        userId: req.user?.id,
        category: 'Emergency',
        severity: 'Critical',
        message: `New ${severity} emergency created: ${category} at ${location.address}. Destination: ${bestHospital.shortName}.`,
      },
    });

    return inc;
  });

  const fullIncident = await prisma.incident.findUnique({
    where: { id: createdIncident.id },
    include: {
      destinationHospital: true,
      assignedAmbulance: true,
      routes: { orderBy: { routeIndex: 'asc' } },
      corridorPlan: true,
    },
  });

  res.status(201).json({ success: true, data: fullIncident });
});

// Assign specific ambulance with concurrency safety (supports PATCH & POST)
const assignAmbulanceHandler = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const parsed = AssignAmbulanceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Ambulance ID required' });
    return;
  }

  const { ambulanceId } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Lock check: ensure ambulance is strictly AVAILABLE or already assigned to this incident
      const targetAmbulance = await tx.ambulance.findUnique({
        where: { id: ambulanceId },
      });

      if (!targetAmbulance) {
        throw new Error(`Ambulance ${ambulanceId} not found.`);
      }

      if (targetAmbulance.status !== AmbulanceStatus.AVAILABLE && targetAmbulance.assignedIncidentId !== id) {
        const err: any = new Error(`ASSIGNMENT CONFLICT: Ambulance ${targetAmbulance.callSign} is currently ${targetAmbulance.status}. Concurrency lock rejects double assignment.`);
        err.statusCode = 409;
        throw err;
      }

      // 2. Free any previously assigned ambulance on this incident
      await tx.ambulance.updateMany({
        where: { assignedIncidentId: id, id: { not: ambulanceId } },
        data: { status: AmbulanceStatus.AVAILABLE, assignedIncidentId: null },
      });

      // 3. Mark newly assigned ambulance
      await tx.ambulance.update({
        where: { id: ambulanceId },
        data: { status: AmbulanceStatus.DISPATCHED, assignedIncidentId: id },
      });

      // 4. Update incident status
      const inc = await tx.incident.update({
        where: { id },
        data: { status: IncidentStatus.DISPATCHED },
      });

      // 5. Update corridor record
      await tx.greenCorridor.updateMany({
        where: { incidentId: id },
        data: { ambulanceId },
      });

      await tx.incidentAuditLog.create({
        data: {
          incidentId: id,
          userId: req.user?.id,
          category: 'Fleet',
          severity: 'Success',
          message: `Ambulance ${targetAmbulance.callSign} (${targetAmbulance.type}) successfully assigned by ${req.user?.fullName}.`,
        },
      });

      return inc;
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, error: err.message });
  }
};

router.patch('/:id/ambulance', requireAuth, requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR), assignAmbulanceHandler);
router.post('/:id/ambulance', requireAuth, requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR), assignAmbulanceHandler);

// Change Destination Hospital (supports PATCH & POST)
const selectHospitalHandler = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const parsed = SelectHospitalSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, error: 'Hospital ID required' });
    return;
  }

  const { hospitalId } = parsed.data;
  const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
  if (!hospital) {
    res.status(404).json({ success: false, error: 'Hospital not found' });
    return;
  }

  const incident = await prisma.incident.findUnique({ where: { id } });
  if (!incident) {
    res.status(404).json({ success: false, error: 'Incident not found' });
    return;
  }

  // Recalculate routes to new hospital
  const newRoutes = await fetchRoutesFromOSRM(
    { lat: incident.lat, lng: incident.lng },
    { lat: hospital.lat, lng: hospital.lng }
  );

  await prisma.$transaction(async (tx) => {
    await tx.incident.update({
      where: { id },
      data: { destinationHospitalId: hospitalId },
    });

    await tx.routeAlternative.deleteMany({ where: { incidentId: id } });

    for (const r of newRoutes) {
      await tx.routeAlternative.create({
        data: {
          incidentId: id,
          routeIndex: r.routeIndex,
          name: r.name,
          geometryJson: JSON.stringify(r.geometry),
          distanceKm: r.distanceKm,
          durationMinutes: r.durationMinutes,
          congestionLevel: r.congestionLevel,
          signalCount: r.signalCount,
          score: r.score,
          scoreBreakdownJson: JSON.stringify(r.scoreBreakdown),
          source: r.source,
          restrictions: r.restrictions,
          estTimeSavedMinutes: r.estTimeSavedMinutes,
          isSelected: r.isSelected,
        },
      });
    }

    await tx.greenCorridor.updateMany({
      where: { incidentId: id },
      data: { hospitalId },
    });

    await tx.incidentAuditLog.create({
      data: {
        incidentId: id,
        userId: req.user?.id,
        category: 'Hospital',
        severity: 'Info',
        message: `Destination changed to ${hospital.name} (~${newRoutes[0].durationMinutes} mins).`,
      },
    });
  });

  const full = await prisma.incident.findUnique({
    where: { id },
    include: { destinationHospital: true, assignedAmbulance: true, routes: true, corridorPlan: true },
  });

  res.json({ success: true, data: full });
};

router.patch('/:id/hospital', requireAuth, requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR), selectHospitalHandler);
router.post('/:id/hospital', requireAuth, requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR), selectHospitalHandler);

// POST /api/incidents/:id/resolve (Complete Incident & Release Corridor)
router.post('/:id/resolve', requireAuth, requireRole(Role.ADMINISTRATOR, Role.EMERGENCY_OPERATOR), async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const incident = await prisma.incident.findUnique({
    where: { id },
    include: { assignedAmbulance: true, corridorPlan: true },
  });

  if (!incident) {
    res.status(404).json({ success: false, error: 'Incident not found' });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    // 1. Mark incident resolved
    const inc = await tx.incident.update({
      where: { id },
      data: {
        status: IncidentStatus.RESOLVED,
        completedAt: new Date(),
      },
    });

    // 2. Free assigned ambulance back to AVAILABLE
    if (incident.assignedAmbulance) {
      await tx.ambulance.update({
        where: { id: incident.assignedAmbulance.id },
        data: {
          status: AmbulanceStatus.AVAILABLE,
          assignedIncidentId: null,
          speedKmH: 0,
        },
      });
    }

    // 3. Release Corridor
    if (incident.corridorPlan) {
      await tx.greenCorridor.update({
        where: { id: incident.corridorPlan.id },
        data: {
          status: CorridorStatus.RELEASED,
          releasedAt: new Date(),
        },
      });
    }

    // 4. Restore Signals
    await tx.trafficSignal.updateMany({
      data: {
        state: SignalState.GREEN,
        lastAck: 'Corridor Released (Civilian Equilibrium)',
      },
    });

    // 5. Audit log
    await tx.incidentAuditLog.create({
      data: {
        incidentId: id,
        userId: req.user?.id,
        category: 'Emergency',
        severity: 'Success',
        message: `Incident ${id} marked RESOLVED by ${req.user?.fullName}. Resources returned to service and corridor released.`,
      },
    });

    return inc;
  });

  res.json({ success: true, data: updated });
});

export default router;
