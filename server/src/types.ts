import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const CreateIncidentSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  severity: z.preprocess((val) => typeof val === 'string' ? val.toUpperCase() : val, z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])).default('CRITICAL'),
  location: z.object({
    address: z.string().min(2, 'Incident address is required'),
    lat: z.number().min(15.0).max(22.0, 'Latitude must be within Solapur/Maharashtra bounds (15-22N)'),
    lng: z.number().min(72.0).max(80.0, 'Longitude must be within Solapur/Maharashtra bounds (72-80E)'),
  }),
  patientReference: z.string().optional(),
  patientCount: z.number().int().min(1).default(1),
  medicalRequirements: z.string().optional(),
  reportingSource: z.string().default('Municipal 112 Police & Ambulance Dispatch'),
  notes: z.string().optional(),
});

export const AssignAmbulanceSchema = z.object({
  ambulanceId: z.string().min(1, 'Ambulance ID is required'),
});

export const SelectHospitalSchema = z.object({
  hospitalId: z.string().min(1, 'Hospital ID is required'),
});

export const SelectRouteSchema = z.object({
  routeId: z.string().min(1, 'Route ID is required'),
});

export const ToggleSignalSchema = z.object({
  state: z.enum(['RED', 'AMBER', 'GREEN', 'PRIORITY_ACTIVE', 'OFFLINE']),
});

export const UpdateCorridorStatusSchema = z.object({
  status: z.enum(['PLANNED', 'REQUESTED', 'ACTIVE', 'RELEASED']),
  signalsSequenceJson: z.string().optional(),
});

export const UpdateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().min(1),
});
