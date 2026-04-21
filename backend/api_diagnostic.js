const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(method, path, payload = null) {
  try {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };
    if (payload) options.body = JSON.stringify(payload);

    console.log(`\n[${method}] ${url}`);
    console.log('Payload:', payload || 'None');

    const res = await fetch(url, options);
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log('Response:', data);

    return { method, path, status: res.status, ok: res.ok, data };
  } catch (error) {
    console.error(`Error on ${method} ${path}:`, error.message);
    return { method, path, error: error.message };
  }
}

(async () => {
  console.log('=== API DIAGNOSTIC TEST ===\n');

  const results = [];

  // Test auth
  results.push(await testEndpoint('GET', '/auth/demo'));

  // Test clients CRUD
  console.log('\n--- CLIENTS CRUD ---');
  results.push(await testEndpoint('GET', '/clients', null, token));
  
  const clientPayload = { name: 'Test Client', email: 'test@mail.com', phone: '123456', address: 'Test Address' };
  const createRes = await testEndpoint('POST', '/clients', clientPayload, token);
  results.push(createRes);
  
  if (createRes.data?._id) {
    const clientId = createRes.data._id;
    results.push(await testEndpoint('GET', `/clients/${clientId}`, null, token));
    results.push(await testEndpoint('PUT', `/clients/${clientId}`, { name: 'Updated Client' }, token));
    results.push(await testEndpoint('DELETE', `/clients/${clientId}`, null, token));
  }

  // Test employees CRUD
  console.log('\n--- EMPLOYEES CRUD ---');
  results.push(await testEndpoint('GET', '/employees', null, token));
  
  const empPayload = { position: 'Engineer', department: 'Tech', salary: 50000, leaveBalance: 20 };
  const createEmpRes = await testEndpoint('POST', '/employees', empPayload, token);
  results.push(createEmpRes);
  
  if (createEmpRes.data?._id) {
    const empId = createEmpRes.data._id;
    results.push(await testEndpoint('GET', `/employees/${empId}`, null, token));
    results.push(await testEndpoint('PUT', `/employees/${empId}`, { position: 'Senior Engineer' }, token));
    results.push(await testEndpoint('DELETE', `/employees/${empId}`, null, token));
  }

  // Test projects CRUD
  console.log('\n--- PROJECTS CRUD ---');
  results.push(await testEndpoint('GET', '/projects', null, token));
  
  const projPayload = { name: 'Test Project', clientId: 'test-client', status: 'pending' };
  const createProjRes = await testEndpoint('POST', '/projects', projPayload, token);
  results.push(createProjRes);
  
  if (createProjRes.data?._id) {
    const projId = createProjRes.data._id;
    results.push(await testEndpoint('GET', `/projects/${projId}`, null, token));
    results.push(await testEndpoint('PUT', `/projects/${projId}`, { status: 'active' }, token));
    results.push(await testEndpoint('DELETE', `/projects/${projId}`, null, token));
  }

  // Test audit
  console.log('\n--- AUDIT ---');
  results.push(await testEndpoint('GET', '/audit/report', null, token));

  // Test AI
  console.log('\n--- AI ---');
  results.push(await testEndpoint('POST', '/ai/chat', { message: 'Hello' }, token));
  results.push(await testEndpoint('POST', '/ai/automate', { message: 'List clients' }, token));

  // Summary
  console.log('\n=== SUMMARY ===');
  const failed = results.filter(r => r.error || !r.ok);
  const passed = results.filter(r => !r.error && r.ok);

  console.log(`✓ Passed: ${passed.length}`);
  console.log(`✗ Failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed endpoints:');
    failed.forEach(r => {
      console.log(`  [${r.status || 'ERROR'}] ${r.method} ${r.path}`);
      if (r.error) console.log(`    Error: ${r.error}`);
      if (r.data?.message) console.log(`    Message: ${r.data.message}`);
    });
  }
})();
