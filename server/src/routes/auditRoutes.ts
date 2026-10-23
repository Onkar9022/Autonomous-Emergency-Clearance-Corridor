import { Router, Request, Response } from 'express';
import { prisma } from '../prisma.js';

const router = Router();

// GET /api/events
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const limit = parseInt(req.query.limit as string, 10) || 50;

  const logs = await prisma.incidentAuditLog.findMany({
    take: limit,
    orderBy: { timestamp: 'desc' },
    include: {
      user: { select: { fullName: true, role: true } },
    },
  });

  res.json({ success: true, data: logs });
});

// GET /api/reports/csv
router.get('/csv', async (req: Request, res: Response): Promise<void> => {
  const incidents = await prisma.incident.findMany({
    include: { destinationHospital: true, assignedAmbulance: true },
    orderBy: { createdAt: 'desc' },
  });

  const headers = ['Incident ID,Category,Severity,Address,Ambulance,Hospital,Status,Created At,Time Saved (mins)'];
  const rows = incidents.map((inc) => {
    const hosp = inc.destinationHospital?.shortName || 'N/A';
    const amb = inc.assignedAmbulance?.callSign || 'N/A';
    return `"${inc.id}","${inc.category}","${inc.severity}","${inc.address.replace(/"/g, '""')}","${amb}","${hosp}","${inc.status}","${inc.createdAt.toISOString()}","${inc.timeSavedMinutes}"`;
  });

  const csv = [headers, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=AECC_Incident_History_${Date.now()}.csv`);
  res.send(csv);
});

export default router;
