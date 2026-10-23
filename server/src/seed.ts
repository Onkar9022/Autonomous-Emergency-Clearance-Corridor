import { PrismaClient, Role, AmbulanceStatus, SeverityTier, IncidentStatus, SignalState } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting idempotent AECC database seed...');

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@AECC2026!', salt);
  const operatorPasswordHash = await bcrypt.hash('Operator@AECC2026!', salt);
  const observerPasswordHash = await bcrypt.hash('Observer@AECC2026!', salt);

  const users = [
    {
      email: 'admin@aecc.gov',
      fullName: 'Prof. V.D. Gaikwad (Director)',
      passwordHash: adminPasswordHash,
      role: Role.ADMINISTRATOR,
      department: 'AECC Directorate & Municipal ITS Advisory',
    },
    {
      email: 'operator@aecc.gov',
      fullName: 'Ritesh Kulkarni (Senior Dispatcher)',
      passwordHash: operatorPasswordHash,
      role: Role.EMERGENCY_OPERATOR,
      department: 'Central Emergency Dispatch Centre',
    },
    {
      email: 'observer@aecc.gov',
      fullName: 'Srushti Sakhare (Safety Auditor)',
      passwordHash: observerPasswordHash,
      role: Role.READ_ONLY_OBSERVER,
      department: 'Municipal Transportation Compliance Bureau',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        role: u.role,
        department: u.department,
      },
      create: u,
    });
  }
  console.log(`✅ Seeded ${users.length} authoritative users.`);

  // 2. Seed Solapur Hospitals
  const hospitals = [
    {
      id: 'HOSP-01',
      name: 'Ashwini Sahakari Rugnalaya & Research Centre',
      shortName: 'Ashwini Hospital',
      lat: 17.6835,
      lng: 75.9182,
      address: 'Old Pune Naka, Solapur, Maharashtra 413003',
      phone: '+91 217 231 9900',
      category: 'Super Speciality Hospital',
      traumaLevel: 'Level 1 Trauma Centre',
      hasICU: true,
      hasCardiac: true,
      hasBurnUnit: true,
      totalBeds: 250,
      availableBedsSimulated: 18,
      capacitySource: 'Municipal Health Directorate (Simulated Live Feed)',
      isVerifiedSource: false,
      status: 'Operational',
      lastVerified: '5 mins ago',
    },
    {
      id: 'HOSP-02',
      name: 'Dr. V.M. Govt. Medical College & Civil Hospital',
      shortName: 'Civil Hospital Solapur',
      lat: 17.6599,
      lng: 75.9064,
      address: 'Civil Lines, Opp. Collector Office, Solapur 413001',
      phone: '+91 217 274 9400',
      category: 'Tertiary Care Government Hospital',
      traumaLevel: 'Level 1 Trauma Centre',
      hasICU: true,
      hasCardiac: true,
      hasBurnUnit: true,
      totalBeds: 600,
      availableBedsSimulated: 42,
      capacitySource: 'State Directorate of Health Services (Simulated Live Feed)',
      isVerifiedSource: false,
      status: 'Operational',
      lastVerified: '2 mins ago',
    },
    {
      id: 'HOSP-03',
      name: 'Shri Markandey Rugnalaya',
      shortName: 'Markandey Hospital',
      lat: 17.6710,
      lng: 75.9080,
      address: 'Near Rang Bhavan, Solapur, Maharashtra 413002',
      phone: '+91 217 232 4455',
      category: 'Multi-Speciality Hospital',
      traumaLevel: 'Level 2 Trauma Centre',
      hasICU: true,
      hasCardiac: true,
      hasBurnUnit: false,
      totalBeds: 160,
      availableBedsSimulated: 9,
      capacitySource: 'Municipal Health Directorate',
      isVerifiedSource: false,
      status: 'Operational',
      lastVerified: '12 mins ago',
    },
    {
      id: 'HOSP-04',
      name: 'Yashodhara Super Speciality Hospital',
      shortName: 'Yashodhara Hospital',
      lat: 17.6655,
      lng: 75.8920,
      address: 'Hotgi Road, Near Railway Lines, Solapur 413003',
      phone: '+91 217 262 8888',
      category: 'Cardiac & Neuro Speciality',
      traumaLevel: 'Level 2 Trauma Centre',
      hasICU: true,
      hasCardiac: true,
      hasBurnUnit: false,
      totalBeds: 120,
      availableBedsSimulated: 14,
      capacitySource: 'Private Hospital Telemetry Network',
      isVerifiedSource: false,
      status: 'Operational',
      lastVerified: '8 mins ago',
    },
    {
      id: 'HOSP-05',
      name: 'Solapur District Trauma Care Facility',
      shortName: 'Solapur Trauma Centre',
      lat: 17.6480,
      lng: 75.9210,
      address: 'MIDC Road, Solapur, Maharashtra 413006',
      phone: '+91 217 238 1234',
      category: 'Emergency Trauma Centre',
      traumaLevel: 'Level 2 Trauma Centre',
      hasICU: true,
      hasCardiac: false,
      hasBurnUnit: false,
      totalBeds: 80,
      availableBedsSimulated: 6,
      capacitySource: 'District Disaster Management Authority',
      isVerifiedSource: false,
      status: 'Operational',
      lastVerified: '15 mins ago',
    },
  ];

  for (const h of hospitals) {
    await prisma.hospital.upsert({
      where: { id: h.id },
      update: h,
      create: h,
    });
  }
  console.log(`✅ Seeded ${hospitals.length} Solapur hospitals.`);

  // 3. Seed Ambulances
  const ambulances = [
    {
      id: 'AMB-01',
      callSign: 'Sanjivani Alpha',
      type: 'Advanced Life Support (ALS)',
      status: AmbulanceStatus.AVAILABLE,
      lat: 17.6680,
      lng: 75.9020,
      baseStation: 'Saat Rasta Emergency Depot',
      driverName: 'Suresh Patil',
      driverPhone: '+91 98220 12345',
      equipment: ['Ventilator', 'Defibrillator', 'Multipara Monitor', 'V2X Transmitter'],
      fuelBatteryPercent: 94,
      speedKmH: 0,
    },
    {
      id: 'AMB-02',
      callSign: 'Sanjivani Bravo',
      type: 'Basic Life Support (BLS)',
      status: AmbulanceStatus.AVAILABLE,
      lat: 17.6580,
      lng: 75.9050,
      baseStation: 'Civil Hospital Bay 02',
      driverName: 'Anand Shinde',
      driverPhone: '+91 98220 67890',
      equipment: ['Oxygen Cylinders', 'Spine Board', 'AED', 'Basic Splints'],
      fuelBatteryPercent: 88,
      speedKmH: 0,
    },
    {
      id: 'AMB-03',
      callSign: 'Sanjivani Charlie',
      type: 'Cardiac Care Unit (CCU)',
      status: AmbulanceStatus.AVAILABLE,
      lat: 17.6810,
      lng: 75.9150,
      baseStation: 'Old Pune Naka Sub-Station',
      driverName: 'Rahul Jadhav',
      driverPhone: '+91 98220 44556',
      equipment: ['12-Lead ECG', 'External Pacemaker', 'Defibrillator', 'Telemetry Unit'],
      fuelBatteryPercent: 91,
      speedKmH: 0,
    },
    {
      id: 'AMB-04',
      callSign: 'Sanjivani Delta',
      type: 'Rapid First Responder',
      status: AmbulanceStatus.AVAILABLE,
      lat: 17.6620,
      lng: 75.8950,
      baseStation: 'Hotgi Road Station',
      driverName: 'Vikas Gaikwad',
      driverPhone: '+91 98220 99887',
      equipment: ['AED', 'Oxygen Kit', 'Triage Trauma Bag'],
      fuelBatteryPercent: 78,
      speedKmH: 0,
    },
  ];

  for (const a of ambulances) {
    await prisma.ambulance.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }
  console.log(`✅ Seeded ${ambulances.length} emergency ambulances.`);

  // 4. Seed Traffic Signals
  const signals = [
    {
      id: 'SIG-SR01',
      intersectionName: 'Saat Rasta 7-Arm Hub',
      lat: 17.6685,
      lng: 75.9030,
      state: SignalState.RED,
      connectivity: 'Simulated Loopback',
      operatingMode: 'Adaptive NTCIP',
      hardwareProto: 'ESP32-V2X (Simulated)',
      lastAck: '1 sec ago',
    },
    {
      id: 'SIG-AC02',
      intersectionName: 'Dr. Ambedkar Chowk',
      lat: 17.6660,
      lng: 75.9055,
      state: SignalState.RED,
      connectivity: 'Simulated Loopback',
      operatingMode: 'Adaptive NTCIP',
      hardwareProto: 'ESP32-V2X (Simulated)',
      lastAck: '2 sec ago',
    },
    {
      id: 'SIG-RB04',
      intersectionName: 'Rang Bhavan Roundabout',
      lat: 17.6715,
      lng: 75.9095,
      state: SignalState.RED,
      connectivity: 'Simulated Loopback',
      operatingMode: 'Smart Roundabout Unit',
      hardwareProto: 'ESP32-V2X (Simulated)',
      lastAck: '1 sec ago',
    },
    {
      id: 'SIG-SC03',
      intersectionName: 'Chhatrapati Shivaji Maharaj Chowk',
      lat: 17.6625,
      lng: 75.9070,
      state: SignalState.RED,
      connectivity: 'Simulated Loopback',
      operatingMode: 'Adaptive NTCIP',
      hardwareProto: 'ESP32-V2X (Simulated)',
      lastAck: '3 sec ago',
    },
    {
      id: 'SIG-PN05',
      intersectionName: 'Old Pune Naka Junction',
      lat: 17.6795,
      lng: 75.9150,
      state: SignalState.RED,
      connectivity: 'Simulated Loopback',
      operatingMode: 'High-Speed Arterial',
      hardwareProto: 'ESP32-V2X (Simulated)',
      lastAck: '1 sec ago',
    },
    {
      id: 'SIG-RS06',
      intersectionName: 'Solapur Railway Station Square',
      lat: 17.6550,
      lng: 75.9040,
      state: SignalState.RED,
      connectivity: 'Simulated Loopback',
      operatingMode: 'Transit Priority Hub',
      hardwareProto: 'ESP32-V2X (Simulated)',
      lastAck: '4 sec ago',
    },
  ];

  for (const s of signals) {
    await prisma.trafficSignal.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }
  console.log(`✅ Seeded ${signals.length} smart traffic signals.`);

  // 5. Seed Historical Incident
  await prisma.incident.upsert({
    where: { id: 'INC-2026-8801' },
    update: {},
    create: {
      id: 'INC-2026-8801',
      category: 'Road accident',
      severity: SeverityTier.HIGH,
      status: IncidentStatus.RESOLVED,
      lat: 17.6620,
      lng: 75.9040,
      address: 'Near Railway Station Chowk, Solapur',
      patientReference: 'PAT-REF-8801',
      patientCount: 1,
      medicalRequirements: 'Head Trauma, Cervical Collar Stabilized',
      destinationHospitalId: 'HOSP-02',
      timeSavedMinutes: 8,
      totalTravelMinutes: 11,
      createdAt: new Date(Date.now() - 3600000 * 3),
      completedAt: new Date(Date.now() - 3600000 * 2.5),
    },
  });

  // 6. Seed System Settings
  const defaultSettings = [
    { key: 'operatingMode', value: 'SIMULATION', description: 'Operating mode (SIMULATION or LIVE INTEGRATION)' },
    { key: 'region', value: 'Solapur, Maharashtra, India', description: 'Municipal Deployment Jurisdiction' },
    { key: 'osrmEndpoint', value: 'https://router.project-osrm.org', description: 'OSRM Routing Service URL' },
    { key: 'hardwareSafetyInterlock', value: 'ENABLED', description: 'Physical relay signal override blocker' },
  ];

  for (const set of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: set.key },
      update: { value: set.value },
      create: set,
    });
  }
  console.log('✅ Seeded system settings.');

  console.log('🎉 AECC PostgreSQL Seed Completed Successfully.');
}

seedDatabase()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

