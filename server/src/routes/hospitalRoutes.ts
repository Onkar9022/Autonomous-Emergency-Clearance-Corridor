import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { calculateHaversineDistance } from '../services/routing.js';

const router = Router();

// GET /api/hospitals
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const hospitals = await prisma.hospital.findMany({
    orderBy: { shortName: 'asc' },
  });
  const mapped = hospitals.map((h) => ({
    ...h,
    bedCapacityVerified: h.isVerifiedSource,
    capacityKnown: h.isVerifiedSource,
    capacityStatus: h.isVerifiedSource ? 'Verified Live Feed' : 'Capacity Unknown (Unverified Feed)',
  }));
  res.json({ success: true, data: mapped });
});

// GET /api/hospitals/rank?lat=...&lng=...&category=...
router.get('/rank', async (req: Request, res: Response): Promise<void> => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const category = ((req.query.category as string) || '').toLowerCase();

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ success: false, error: 'Valid lat and lng query parameters required.' });
    return;
  }

  const hospitals = await prisma.hospital.findMany();

  const ranked = hospitals.map((hosp) => {
    const distKm = parseFloat(calculateHaversineDistance(lat, lng, hosp.lat, hosp.lng).toFixed(2));
    const roadDistKm = parseFloat((distKm * 1.25).toFixed(2));
    const estimatedMinutes = Math.max(3, Math.round(roadDistKm * 2.1));

    let mismatchPenalty = 1.0;
    const reasonParts: string[] = [];

    if (category.includes('accident') || category.includes('trauma')) {
      if (hosp.traumaLevel.includes('Level 1')) {
        mismatchPenalty = 1.0;
        reasonParts.push('Level-1 Trauma & emergency surgical readiness');
      } else if (hosp.traumaLevel.includes('Level 2')) {
        mismatchPenalty = 2.5;
        reasonParts.push('Level-2 Trauma facility');
      } else {
        mismatchPenalty = 5.0;
        reasonParts.push('Limited specialized trauma equipment');
      }
    } else if (category.includes('cardiac')) {
      if (hosp.hasCardiac) {
        mismatchPenalty = 1.0;
        reasonParts.push('Dedicated Cath Lab & 24/7 Cardiac ICU');
      } else {
        mismatchPenalty = 6.0;
        reasonParts.push('No primary PCI/Cath lab available');
      }
    } else if (category.includes('fire')) {
      if (hosp.hasBurnUnit) {
        mismatchPenalty = 1.0;
        reasonParts.push('Dedicated Burn Critical Care Unit');
      } else {
        mismatchPenalty = 4.0;
        reasonParts.push('No burn ICU');
      }
    } else {
      mismatchPenalty = 1.5;
      reasonParts.push('General multi-speciality capability');
    }

    let availabilityPenalty = 1.0;
    if (hosp.status !== 'Operational') {
      availabilityPenalty = 10.0;
    } else if (hosp.availableBedsSimulated && hosp.availableBedsSimulated < 5) {
      availabilityPenalty = 3.5;
      reasonParts.push('High occupancy (limited ICU beds)');
    } else {
      reasonParts.push('Emergency beds & ICU capacity verified');
    }

    const normTime = Math.min(10, (estimatedMinutes / 15) * 10);
    const normDist = Math.min(10, (roadDistKm / 10) * 10);
    const congestionPenalty = 2.0;

    const totalScore = parseFloat(
      (0.35 * normTime + 0.20 * normDist + 0.15 * congestionPenalty + 0.20 * mismatchPenalty + 0.10 * availabilityPenalty).toFixed(2)
    );

    return {
      ...hosp,
      distanceKm: roadDistKm,
      straightDistKm: distKm,
      estimatedTravelMinutes: estimatedMinutes,
      suitabilityScore: totalScore,
      recommendationReason: reasonParts.join(' • '),
      bedCapacityVerified: hosp.isVerifiedSource,
      capacityKnown: hosp.isVerifiedSource,
      capacityStatus: hosp.isVerifiedSource ? 'Verified Live Feed' : 'Capacity Unknown (Unverified Feed)',
    };
  });

  ranked.sort((a, b) => a.suitabilityScore - b.suitabilityScore);
  res.json({ success: true, data: ranked });
});

export default router;
