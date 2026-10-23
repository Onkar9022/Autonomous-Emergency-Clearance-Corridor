// AECC Server Routing & Geographic Helper

export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function generateSolapurRoadPolyline(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  variant: 'arterial' | 'bypass' | 'inner' = 'arterial'
): [number, number][] {
  const points: [number, number][] = [];
  points.push([start.lat, start.lng]);

  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;

  if (variant === 'arterial') {
    points.push([start.lat + (midLat - start.lat) * 0.45, start.lng + 0.0035]);
    points.push([17.6715, 75.9095]); // Rang Bhavan roundabout
    points.push([midLat + 0.004, midLng + 0.0045]);
    points.push([17.6795, 75.9150]); // Old Pune Naka
  } else if (variant === 'bypass') {
    points.push([start.lat + 0.002, start.lng - 0.004]);
    points.push([midLat + 0.006, midLng - 0.002]);
    points.push([17.6820, 75.9100]);
  } else {
    points.push([start.lat, start.lng + (end.lng - start.lng) * 0.3]);
    points.push([midLat, midLng]);
    points.push([end.lat - (end.lat - midLat) * 0.3, end.lng]);
  }

  points.push([end.lat, end.lng]);
  return points;
}

export function scoreRoute(
  route: { durationMinutes: number; distanceKm: number; congestionLevel: string; signalCount: number },
  weights = { time: 0.4, dist: 0.25, congestion: 0.2, signals: 0.15 }
) {
  const normTime = Math.min(10, (route.durationMinutes / 12) * 10);
  const normDist = Math.min(10, (route.distanceKm / 8) * 10);
  const congestionPenalty = route.congestionLevel === 'High' ? 8 : route.congestionLevel === 'Moderate' ? 4 : 1.5;
  const signalPenalty = (route.signalCount / 5) * 10;

  const score =
    weights.time * normTime +
    weights.dist * normDist +
    weights.congestion * congestionPenalty +
    weights.signals * signalPenalty;

  return {
    totalScore: parseFloat(score.toFixed(2)),
    breakdown: {
      timeScore: parseFloat((weights.time * normTime).toFixed(2)),
      distScore: parseFloat((weights.dist * normDist).toFixed(2)),
      congestionScore: parseFloat((weights.congestion * congestionPenalty).toFixed(2)),
      signalScore: parseFloat((weights.signals * signalPenalty).toFixed(2)),
    },
  };
}

export async function fetchRoutesFromOSRM(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
) {
  const straightDist = calculateHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.routes && data.routes.length > 0) {
        return data.routes.map((r: any, index: number) => {
          const polyline: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
          const distKm = parseFloat((r.distance / 1000).toFixed(2));
          const durMin = Math.max(2, Math.round(r.duration / 60));
          const name = index === 0 ? 'Primary Arterial Corridor' : `Alternative Route ${index + 1}`;
          const congestion = index === 0 ? 'Low' : index === 1 ? 'Moderate' : 'High';
          const signalCount = Math.min(6, Math.max(2, Math.round(distKm * 1.4)));

          const baseRoute = {
            routeIndex: index,
            name,
            geometry: polyline,
            distanceKm: distKm,
            durationMinutes: durMin,
            congestionLevel: congestion,
            signalCount,
            source: 'OSRM Driving Engine (Live Road Geometry)',
            restrictions: 'None (Corridor Priority Overrides Active)',
            estTimeSavedMinutes: Math.round(durMin * 0.42),
          };

          const { totalScore, breakdown } = scoreRoute(baseRoute);
          return {
            ...baseRoute,
            score: totalScore,
            scoreBreakdown: breakdown,
            isSelected: index === 0,
          };
        });
      }
    }
  } catch (e: any) {
    console.info('Server OSRM call fallback:', e.message);
  }

  // Deterministic Fallback Road Routes
  const distEst = parseFloat((straightDist * 1.28).toFixed(2));
  const durEst = Math.max(3, Math.round(distEst * 2.1));

  const routeA = {
    routeIndex: 0,
    name: 'Primary Arterial Corridor (Recommended)',
    geometry: generateSolapurRoadPolyline(origin, destination, 'arterial'),
    distanceKm: distEst,
    durationMinutes: durEst,
    congestionLevel: 'Low',
    signalCount: 3,
    source: 'AECC Deterministic GIS Road Model (Simulated)',
    restrictions: 'None (Direct Emergency Corridor Access)',
    estTimeSavedMinutes: Math.round(durEst * 0.45),
  };

  const routeB = {
    routeIndex: 1,
    name: 'Ring Road Bypass',
    geometry: generateSolapurRoadPolyline(origin, destination, 'bypass'),
    distanceKm: parseFloat((distEst * 1.25).toFixed(2)),
    durationMinutes: Math.round(durEst * 1.3),
    congestionLevel: 'Moderate',
    signalCount: 4,
    source: 'AECC Deterministic GIS Road Model (Simulated)',
    restrictions: 'School Zone Speed Limit 40km/h',
    estTimeSavedMinutes: Math.round(durEst * 0.2),
  };

  const routeC = {
    routeIndex: 2,
    name: 'Old Bazaar Central Road',
    geometry: generateSolapurRoadPolyline(origin, destination, 'inner'),
    distanceKm: parseFloat((distEst * 0.95).toFixed(2)),
    durationMinutes: Math.round(durEst * 1.6),
    congestionLevel: 'High',
    signalCount: 5,
    source: 'AECC Deterministic GIS Road Model (Simulated)',
    restrictions: 'Dense Pedestrian Transit, Commercial Hour Hold',
    estTimeSavedMinutes: Math.round(durEst * 0.1),
  };

  const scored = [routeA, routeB, routeC].map((r, idx) => {
    const { totalScore, breakdown } = scoreRoute(r);
    return {
      ...r,
      score: totalScore,
      scoreBreakdown: breakdown,
      isSelected: idx === 0,
    };
  });

  scored.sort((a, b) => a.score - b.score);
  scored[0].isSelected = true;
  return scored;
}
