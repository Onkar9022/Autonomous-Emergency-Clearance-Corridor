// Node 18+ has native fetch

async function runComprehensiveVerification() {
  console.log('===============================================================');
  console.log('    AECC FULL-STACK BACKEND & WORKFLOW VERIFICATION SUITE      ');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Health & Database Connectivity
  console.log('\n--- 1. Health & PostgreSQL Database Connectivity ---');
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, 'Health endpoint responds with HTTP 200');
  assert(healthData.status === 'Healthy', 'System status is Healthy');
  assert(healthData.services?.database?.status === 'Connected', 'PostgreSQL database connection is alive (Neon AWS)');

  // 2. Authentication & Real Credentials Validation
  console.log('\n--- 2. Authentication & Password Hashing Verification ---');
  // 2a. Fake login rejection
  const fakeLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fake@aecc.gov', password: 'WrongPassword123!' }),
  });
  assert(fakeLoginRes.status === 401, 'Fake login with invalid credentials is rejected with HTTP 401');

  // 2b. Bootstrap accounts check
  const bootstrapRes = await fetch(`${BASE_URL}/auth/bootstrap`);
  const bootstrapData = await bootstrapRes.json();
  assert(bootstrapData.accounts?.length >= 3, 'Default bootstrapped accounts (Admin, Operator, Observer) are available');

  // 2c. Valid Operator login
  const opLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'operator@aecc.gov', password: 'Operator@AECC2026!' }),
  });
  const opLoginData = await opLoginRes.json();
  assert(opLoginRes.status === 200 && opLoginData.token, 'Operator login succeeds with signed JWT');
  const opToken = opLoginData.token;

  // 2d. Valid Observer login
  const obsLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'observer@aecc.gov', password: 'Observer@AECC2026!' }),
  });
  const obsLoginData = await obsLoginRes.json();
  assert(obsLoginRes.status === 200 && obsLoginData.token, 'Observer login succeeds with signed JWT');
  const obsToken = obsLoginData.token;

  // 2e. Valid Admin login
  const admLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aecc.gov', password: 'Admin@AECC2026!' }),
  });
  const admLoginData = await admLoginRes.json();
  assert(admLoginRes.status === 200 && admLoginData.token, 'Administrator login succeeds with signed JWT');
  const admToken = admLoginData.token;

  // 3. RBAC Enforcement (Read-Only Observer Rejection)
  console.log('\n--- 3. Role-Based Access Control (RBAC) Enforcement ---');
  // Observer attempts to override traffic signal
  const obsSignalRes = await fetch(`${BASE_URL}/signals/SIG-SR01/state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${obsToken}`,
    },
    body: JSON.stringify({ state: 'PRIORITY_ACTIVE' }),
  });
  assert(obsSignalRes.status === 403, 'Observer signal state write is strictly rejected with HTTP 403 Forbidden');

  // Observer attempts to create an incident
  const obsCreateRes = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${obsToken}`,
    },
    body: JSON.stringify({
      category: 'Road accident',
      severity: 'Critical',
      location: { address: 'Test St', lat: 17.66, lng: 75.90 },
      patientReference: 'PAT-TEST',
    }),
  });
  assert(obsCreateRes.status === 403, 'Observer incident creation is strictly rejected with HTTP 403 Forbidden');

  // 4. Incident Registration & PostgreSQL Persistence
  console.log('\n--- 4. Incident Registration & PostgreSQL Persistence ---');
  const createRes = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opToken}`,
    },
    body: JSON.stringify({
      category: 'Road accident',
      severity: 'Critical',
      location: {
        address: 'Saat Rasta Flyover Approach, Solapur',
        lat: 17.6688,
        lng: 75.9015,
      },
      patientReference: `PAT-TEST-${Date.now().toString().slice(-4)}`,
      patientCount: 1,
      medicalRequirements: 'Trauma Triage & Advanced Life Support',
      reportingSource: 'Municipal 112 Dispatch',
      notes: 'Automated E2E Test Incident',
    }),
  });
  const createData = await createRes.json();
  assert(createRes.status === 201 && createData.data?.id, `Incident successfully created in PostgreSQL with ID: ${createData.data?.id}`);
  const incidentId = createData.data.id;

  // 5. Unknown Hospital Capacity Guarantee
  console.log('\n--- 5. Hospital Discovery & Unknown Capacity Integrity ---');
  const hospRankRes = await fetch(`${BASE_URL}/hospitals/rank?lat=17.6688&lng=75.9015&category=Road%20accident`);
  const hospRankData = await hospRankRes.json();
  assert(hospRankData.data?.length > 0, 'Hospital discovery returns ranked municipal facilities');
  
  // Verify unverified hospitals preserve unknown capacity
  const unverifiedHosp = hospRankData.data.find(h => !h.bedCapacityVerified);
  assert(unverifiedHosp !== undefined, 'Unverified hospital feeds exist in dataset');
  assert(unverifiedHosp.capacityKnown === false, 'Unverified hospital capacity is preserved as unknown (capacityKnown: false)');
  const destinationHospital = hospRankData.data[0];
  console.log(`Top recommended hospital: ${destinationHospital.name} (Score: ${destinationHospital.suitabilityScore})`);

  // Assign destination hospital to incident
  const assignHospRes = await fetch(`${BASE_URL}/incidents/${incidentId}/hospital`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opToken}`,
    },
    body: JSON.stringify({ hospitalId: destinationHospital.id }),
  });
  assert(assignHospRes.status === 200, 'Hospital assignment persisted to PostgreSQL');

  // 6. Concurrency-Safe Ambulance Assignment
  console.log('\n--- 6. Concurrency-Safe Ambulance Assignment ---');
  const ambListRes = await fetch(`${BASE_URL}/ambulances`);
  const ambListData = await ambListRes.json();
  const availableAmb = ambListData.data.find(a => a.status === 'AVAILABLE');
  assert(availableAmb !== undefined, `Found available ambulance: ${availableAmb?.callSign} (${availableAmb?.id})`);

  // 6a. First assignment to incidentId
  const assignAmb1Res = await fetch(`${BASE_URL}/incidents/${incidentId}/ambulance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opToken}`,
    },
    body: JSON.stringify({ ambulanceId: availableAmb.id }),
  });
  assert(assignAmb1Res.status === 200, `Ambulance ${availableAmb.callSign} successfully dispatched to incident ${incidentId}`);

  // 6b. Create a secondary incident
  const create2Res = await fetch(`${BASE_URL}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opToken}`,
    },
    body: JSON.stringify({
      category: 'Cardiac emergency',
      severity: 'Critical',
      location: { address: 'Rang Bhavan, Solapur', lat: 17.6715, lng: 75.9095 },
      patientReference: 'PAT-CONCURRENCY-TEST',
      patientCount: 1,
    }),
  });
  const incident2Id = (await create2Res.json()).data.id;

  // 6c. Attempt to assign the SAME ambulance to incident2Id -> MUST return 409 Conflict
  const assignAmb2ConflictRes = await fetch(`${BASE_URL}/incidents/${incident2Id}/ambulance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opToken}`,
    },
    body: JSON.stringify({ ambulanceId: availableAmb.id }),
  });
  const conflictData = await assignAmb2ConflictRes.json();
  assert(assignAmb2ConflictRes.status === 409, `Double dispatch safely prevented with HTTP 409 Conflict: "${conflictData.error}"`);

  // 7. Green Corridor Signal Coordination
  console.log('\n--- 7. Green Corridor Signal Coordination ---');
  const sigOverrideRes = await fetch(`${BASE_URL}/signals/SIG-SR01/state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opToken}`,
    },
    body: JSON.stringify({ state: 'PRIORITY_ACTIVE' }),
  });
  const sigOverrideData = await sigOverrideRes.json();
  assert(sigOverrideRes.status === 200 && sigOverrideData.data?.state === 'PRIORITY_ACTIVE', 'Traffic signal SIG-SR01 preemption set to PRIORITY_ACTIVE');

  // 8. Incident Resolution, Hospital Handover & Corridor Release
  console.log('\n--- 8. Hospital Handover & Corridor Release ---');
  const resolveRes = await fetch(`${BASE_URL}/incidents/${incidentId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${opToken}`,
    },
    body: JSON.stringify({
      resolutionNotes: 'Patient successfully handed over to trauma center. All signals restored to normal cycles.',
      timeSavedMinutes: 7.8,
    }),
  });
  const resolveData = await resolveRes.json();
  assert(resolveRes.status === 200, 'Incident resolution & corridor release succeeded');
  assert(resolveData.data?.status === 'RESOLVED', 'Incident status updated to RESOLVED in PostgreSQL');

  // Verify ambulance is released back to AVAILABLE
  const releasedAmbRes = await fetch(`${BASE_URL}/ambulances`);
  const releasedAmbData = await releasedAmbRes.json();
  const verifiedAmb = releasedAmbData.data.find(a => a.id === availableAmb.id);
  assert(verifiedAmb.status === 'AVAILABLE', `Ambulance ${verifiedAmb.callSign} returned to AVAILABLE status`);

  // 9. Incident Audit Trail & History Verification
  console.log('\n--- 9. Incident Audit Trail & Refresh Persistence ---');
  const incidentVerifyRes = await fetch(`${BASE_URL}/incidents/${incidentId}`);
  const incidentVerifyData = await incidentVerifyRes.json();
  assert(incidentVerifyData.data?.status === 'RESOLVED', 'PostgreSQL confirms incident persists as RESOLVED');
  assert(incidentVerifyData.data?.auditLogs?.length >= 2, 'Detailed audit trail events persisted in database');

  // 10. CSV Report Generation
  console.log('\n--- 10. CSV Report Data Export ---');
  const csvRes = await fetch(`${BASE_URL}/reports/csv`, {
    headers: { 'Authorization': `Bearer ${opToken}` },
  });
  const csvText = await csvRes.text();
  assert(csvRes.status === 200, 'CSV export endpoint returns HTTP 200');
  assert(csvText.includes('Incident ID,Category,Severity,Address'), 'CSV output contains standard audit column headers');
  assert(csvText.includes(incidentId), 'CSV output contains newly created and resolved incident record');

  console.log('\n===============================================================');
  console.log(`  VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED (100%) `);
  console.log('===============================================================');
}

runComprehensiveVerification().catch((err) => {
  console.error('\nTest suite execution failed:', err);
  process.exit(1);
});
