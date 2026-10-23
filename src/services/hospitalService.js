// AECC Nearest Hospital Detection & Multi-Criteria Ranking Engine
// Section 7 of Functional Specification

import { calculateHaversineDistance } from './routingService';

// Multi-criteria hospital suitability and ranking algorithm
export function rankHospitalsForIncident(incident, hospitalsList, weights = {
  travelTime: 0.35,
  distance: 0.20,
  congestion: 0.15,
  mismatch: 0.20,
  availability: 0.10,
}) {
  if (!incident || !hospitalsList || hospitalsList.length === 0) return [];

  const incLoc = incident.location;
  const incCategory = (incident.category || '').toLowerCase();
  const incSeverity = incident.severity || 'Critical';

  return hospitalsList.map((hosp) => {
    // 1. Geographic distance
    const distKm = parseFloat(
      calculateHaversineDistance(incLoc.lat, incLoc.lng, hosp.location.lat, hosp.location.lng).toFixed(2)
    );

    // 2. Estimated road travel time with average city transit factor
    const roadDistKm = parseFloat((distKm * 1.25).toFixed(2));
    const estimatedMinutes = Math.max(3, Math.round(roadDistKm * 2.1));

    // 3. Facility Suitability & Category Matching
    let mismatchPenalty = 1.0;
    const reasonParts = [];

    if (incCategory.includes('accident') || incCategory.includes('trauma')) {
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
    } else if (incCategory.includes('cardiac')) {
      if (hosp.hasCardiac) {
        mismatchPenalty = 1.0;
        reasonParts.push('Dedicated Cath Lab & 24/7 Cardiac ICU');
      } else {
        mismatchPenalty = 6.0;
        reasonParts.push('No primary PCI/Cath lab available');
      }
    } else if (incCategory.includes('fire')) {
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

    // 4. Operational Status & Capacity Penalty
    let availabilityPenalty = 1.0;
    if (hosp.status !== 'Operational') {
      availabilityPenalty = 10.0;
    } else if (hosp.availableBedsSimulated && hosp.availableBedsSimulated < 5) {
      availabilityPenalty = 3.5;
      reasonParts.push('High occupancy (limited ICU beds)');
    } else {
      reasonParts.push('Emergency beds & ICU capacity verified');
    }

    // 5. Calculate Weighted Score (Lower is better)
    const normTime = Math.min(10, (estimatedMinutes / 15) * 10);
    const normDist = Math.min(10, (roadDistKm / 10) * 10);
    const congestionPenalty = 2.0;

    const totalScore = parseFloat(
      (
        weights.travelTime * normTime +
        weights.distance * normDist +
        weights.congestion * congestionPenalty +
        weights.mismatch * mismatchPenalty +
        weights.availability * availabilityPenalty
      ).toFixed(2)
    );

    return {
      ...hosp,
      distanceKm: roadDistKm,
      straightDistKm: distKm,
      estimatedTravelMinutes: estimatedMinutes,
      suitabilityScore: totalScore,
      recommendationReason: reasonParts.join(' • '),
      scoreBreakdown: {
        normTime: parseFloat((weights.travelTime * normTime).toFixed(2)),
        normDist: parseFloat((weights.distance * normDist).toFixed(2)),
        mismatch: parseFloat((weights.mismatch * mismatchPenalty).toFixed(2)),
        availability: parseFloat((weights.availability * availabilityPenalty).toFixed(2)),
      },
    };
  }).sort((a, b) => a.suitabilityScore - b.suitabilityScore);
}
