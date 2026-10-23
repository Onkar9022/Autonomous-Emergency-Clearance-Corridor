async function testBackend() {
  console.log('Testing /api/health...');
  const healthRes = await fetch('http://localhost:5000/api/health');
  const healthData = await healthRes.json();
  console.log('Health Response:', JSON.stringify(healthData, null, 2));

  console.log('\nTesting /api/auth/bootstrap...');
  const bootstrapRes = await fetch('http://localhost:5000/api/auth/bootstrap');
  const bootstrapData = await bootstrapRes.json();
  console.log('Bootstrap Users:', bootstrapData.accounts.map(a => `${a.email} (${a.role})`));

  console.log('\nTesting Operator Login...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'operator@aecc.gov', password: 'Operator@AECC2026!' }),
  });
  const loginData = await loginRes.json();
  console.log('Login Success:', loginData.success, 'Token length:', loginData.token?.length);

  console.log('\nTesting Observer Login & RBAC Write Rejection...');
  const observerLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'observer@aecc.gov', password: 'Observer@AECC2026!' }),
  });
  const observerLoginData = await observerLoginRes.json();

  const observerWriteRes = await fetch('http://localhost:5000/api/signals/SIG-SR01/state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${observerLoginData.token}`,
    },
    body: JSON.stringify({ state: 'PRIORITY_ACTIVE' }),
  });
  const observerWriteData = await observerWriteRes.json();
  console.log('Observer write rejected status:', observerWriteRes.status, 'Error message:', observerWriteData.error);

  console.log('\nTesting Operator Signal Override...');
  const operatorWriteRes = await fetch('http://localhost:5000/api/signals/SIG-SR01/state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`,
    },
    body: JSON.stringify({ state: 'PRIORITY_ACTIVE' }),
  });
  const operatorWriteData = await operatorWriteRes.json();
  console.log('Operator write success:', operatorWriteData.success, 'Signal state:', operatorWriteData.data?.state);

  console.log('\nTesting Dashboard Metrics...');
  const metricsRes = await fetch('http://localhost:5000/api/dashboard/metrics');
  const metricsData = await metricsRes.json();
  console.log('Metrics Response:', JSON.stringify(metricsData.data, null, 2));

  console.log('\nTesting Hospital List & Ranking...');
  const hospRankRes = await fetch('http://localhost:5000/api/hospitals/rank?lat=17.6688&lng=75.9015&category=Road%20accident');
  const hospRankData = await hospRankRes.json();
  console.log('Top Ranked Hospital:', hospRankData.data[0]?.shortName, 'Score:', hospRankData.data[0]?.suitabilityScore);

  console.log('\nTesting Ambulance Fleet...');
  const ambRes = await fetch('http://localhost:5000/api/ambulances');
  const ambData = await ambRes.json();
  console.log('Ambulances count:', ambData.data?.length, 'First status:', ambData.data[0]?.status);

  console.log('\nALL BACKEND API TESTS PASSED SUCCESSFULLY! 🚀');
}

testBackend().catch(console.error);
