-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMINISTRATOR', 'EMERGENCY_OPERATOR', 'READ_ONLY_OBSERVER');

-- CreateEnum
CREATE TYPE "AmbulanceStatus" AS ENUM ('AVAILABLE', 'DISPATCHED', 'EN_ROUTE', 'AT_HOSPITAL', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "SeverityTier" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'DISPATCHED', 'EN_ROUTE', 'CORRIDOR_ACTIVE', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CorridorStatus" AS ENUM ('PLANNED', 'REQUESTED', 'ACTIVE', 'RELEASED');

-- CreateEnum
CREATE TYPE "SignalState" AS ENUM ('RED', 'AMBER', 'GREEN', 'PRIORITY_ACTIVE', 'OFFLINE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMERGENCY_OPERATOR',
    "department" TEXT DEFAULT 'Emergency Dispatch Centre',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "category" TEXT NOT NULL,
    "traumaLevel" TEXT NOT NULL,
    "hasICU" BOOLEAN NOT NULL DEFAULT true,
    "hasCardiac" BOOLEAN NOT NULL DEFAULT false,
    "hasBurnUnit" BOOLEAN NOT NULL DEFAULT false,
    "totalBeds" INTEGER NOT NULL DEFAULT 100,
    "availableBedsSimulated" INTEGER,
    "capacitySource" TEXT NOT NULL DEFAULT 'Municipal Health Directorate (Simulated Live Feed)',
    "isVerifiedSource" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Operational',
    "lastVerified" TEXT DEFAULT '5 mins ago',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ambulances" (
    "id" TEXT NOT NULL,
    "callSign" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "AmbulanceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "baseStation" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "equipment" TEXT[],
    "fuelBatteryPercent" INTEGER NOT NULL DEFAULT 90,
    "speedKmH" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assignedIncidentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ambulances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" "SeverityTier" NOT NULL DEFAULT 'CRITICAL',
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "patientReference" TEXT,
    "patientCount" INTEGER NOT NULL DEFAULT 1,
    "medicalRequirements" TEXT,
    "reportingSource" TEXT NOT NULL DEFAULT 'Municipal 112 Dispatch',
    "notes" TEXT,
    "destinationHospitalId" TEXT,
    "timeSavedMinutes" INTEGER NOT NULL DEFAULT 0,
    "totalTravelMinutes" INTEGER NOT NULL DEFAULT 0,
    "reportedById" TEXT,
    "selectedRouteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_alternatives" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "routeIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "geometryJson" TEXT NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "congestionLevel" TEXT NOT NULL,
    "signalCount" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "scoreBreakdownJson" TEXT,
    "source" TEXT NOT NULL,
    "restrictions" TEXT,
    "estTimeSavedMinutes" INTEGER NOT NULL DEFAULT 0,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "green_corridors" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "status" "CorridorStatus" NOT NULL DEFAULT 'PLANNED',
    "ambulanceId" TEXT,
    "hospitalId" TEXT,
    "signalsSequenceJson" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "green_corridors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_signals" (
    "id" TEXT NOT NULL,
    "intersectionName" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "state" "SignalState" NOT NULL DEFAULT 'RED',
    "connectivity" TEXT NOT NULL DEFAULT 'Simulated Loopback',
    "operatingMode" TEXT NOT NULL DEFAULT 'Adaptive NTCIP',
    "hardwareProto" TEXT NOT NULL DEFAULT 'ESP32-V2X (Simulated)',
    "activeCorridorId" TEXT,
    "lastAck" TEXT NOT NULL DEFAULT '1 sec ago',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traffic_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_audit_logs" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ambulances_assignedIncidentId_key" ON "ambulances"("assignedIncidentId");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_createdAt_idx" ON "incidents"("createdAt");

-- CreateIndex
CREATE INDEX "route_alternatives_incidentId_idx" ON "route_alternatives"("incidentId");

-- CreateIndex
CREATE UNIQUE INDEX "green_corridors_incidentId_key" ON "green_corridors"("incidentId");

-- CreateIndex
CREATE INDEX "incident_audit_logs_incidentId_idx" ON "incident_audit_logs"("incidentId");

-- CreateIndex
CREATE INDEX "incident_audit_logs_timestamp_idx" ON "incident_audit_logs"("timestamp");

-- AddForeignKey
ALTER TABLE "ambulances" ADD CONSTRAINT "ambulances_assignedIncidentId_fkey" FOREIGN KEY ("assignedIncidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_destinationHospitalId_fkey" FOREIGN KEY ("destinationHospitalId") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_alternatives" ADD CONSTRAINT "route_alternatives_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "green_corridors" ADD CONSTRAINT "green_corridors_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "green_corridors" ADD CONSTRAINT "green_corridors_ambulanceId_fkey" FOREIGN KEY ("ambulanceId") REFERENCES "ambulances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "green_corridors" ADD CONSTRAINT "green_corridors_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_audit_logs" ADD CONSTRAINT "incident_audit_logs_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_audit_logs" ADD CONSTRAINT "incident_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
