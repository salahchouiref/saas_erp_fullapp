const BASE = 'http://localhost:5000/api';
let cookie = '';
let testIds = {};
let passed = 0, failed = 0;

const ts = Date.now();

async function req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (cookie) opts.headers['Cookie'] = cookie;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = res.headers.get('set-cookie');
  if (data) cookie = data.split(';')[0];
  let json;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, data: json, ok: res.ok };
}

function test(name, fn) {
  process.stdout.write(`  ${name}... `);
  return fn().then(r => {
    if (r) { console.log('✅'); passed++; }
    else { console.log('❌'); failed++; }
    return r;
  }).catch(e => {
    console.log(`❌ (${e.message})`); failed++;
    return false;
  });
}

function expect(res, wantedStatus, checks) {
  if (res.status !== wantedStatus) {
    console.log(`Expected ${wantedStatus} got ${res.status}`);
    if (res.data) console.log('  →', JSON.stringify(res.data).slice(0, 120));
    return false;
  }
  if (checks) {
    for (const [k, v] of Object.entries(checks)) {
      const val = k.split('.').reduce((o, p) => o?.[p], res.data);
      if (String(val) !== String(v)) {
        console.log(`Expected ${k}=${v} got ${val}`);
        return false;
      }
    }
  }
  return true;
}

async function run() {
  console.log('\n═══════════════════════════════════════════');
  console.log('   SaaS AI ERP - FULL FEATURE TEST');
  console.log('═══════════════════════════════════════════\n');

  // ─── 1. AUTH ──────────────────────────────────────
  console.log('📋 1. AUTHENTICATION');
  await test('POST /auth/login (admin)', () =>
    req('POST', '/auth/login', { email: 'admin@example.com', password: 'admin123' })
      .then(r => expect(r, 200, { 'user.role': 'admin' })) );

  await test('GET /auth/me', () =>
    req('GET', '/auth/me').then(r => expect(r, 200, { 'user.role': 'admin' })) );

  // ─── 2. HR / EMPLOYEES ────────────────────────────
  console.log('\n📋 2. HR - EMPLOYÉS');
  const empEmail = `omar${ts}@test.ma`;
  await test('POST /hr (create employee)', () =>
    req('POST', '/hr', {
      firstName: 'Omar', lastName: 'Benali', email: empEmail,
      position: 'Développeur Fullstack', department: 'IT', salary: 18000, leaveBalance: 22
    }).then(r => { if (r.ok && r.data?._id) testIds.employee = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /hr (list)', () =>
    req('GET', '/hr').then(r => expect(r, 200)) );

  await test('GET /hr/stats/overview', () =>
    req('GET', '/hr/stats/overview').then(r => expect(r, 200)) );

  if (testIds.employee) {
    await test('GET /hr/:id', () =>
      req('GET', `/hr/${testIds.employee}`).then(r => expect(r, 200)) );
    await test('PUT /hr/:id (update)', () =>
      req('PUT', `/hr/${testIds.employee}`, { salary: 20000 })
        .then(r => expect(r, 200)) );
  }

  // ─── 3. CRM / CLIENTS ────────────────────────────
  console.log('\n📋 3. CRM - CLIENTS');
  await test('POST /clients (create)', () =>
    req('POST', '/clients', {
      name: 'CGI Maroc', email: `cgi${ts}@cgi.ma`, company: 'CGI Maroc SA',
      industry: 'Technology', status: 'active', phone: '+212522123456',
      address: { city: 'Casablanca', country: 'Maroc' }
    }).then(r => { if (r.ok && r.data?._id) testIds.client = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /clients (list)', () =>
    req('GET', '/clients').then(r => expect(r, 200)) );

  if (testIds.client) {
    await test('GET /clients/:id', () =>
      req('GET', `/clients/${testIds.client}`).then(r => expect(r, 200, { name: 'CGI Maroc' })) );
    await test('PUT /clients/:id (update)', () =>
      req('PUT', `/clients/${testIds.client}`, { annualRevenue: 50000000 })
        .then(r => expect(r, 200)) );
  }

  // ─── 4. PROJECTS ──────────────────────────────────
  console.log('\n📋 4. PROJECTS - PROJETS');
  await test('POST /projects (create)', () =>
    req('POST', '/projects', {
      name: 'Plateforme E-Commerce', clientId: testIds.client || undefined,
      description: 'Développement plateforme e-commerce', status: 'active',
      budget: 300000, startDate: '2026-01-01', dueDate: '2026-06-30'
    }).then(r => { if (r.ok && r.data?._id) testIds.project = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /projects (list)', () =>
    req('GET', '/projects').then(r => expect(r, 200)) );

  await test('GET /projects/stats/overview', () =>
    req('GET', '/projects/stats/overview').then(r => expect(r, 200)) );

  if (testIds.project) {
    await test('GET /projects/:id', () =>
      req('GET', `/projects/${testIds.project}`).then(r => expect(r, 200, { name: 'Plateforme E-Commerce' })) );
    await test('PUT /projects/:id (update)', () =>
      req('PUT', `/projects/${testIds.project}`, { progress: 50 })
        .then(r => expect(r, 200, { progress: 50 })) );
  }

  // ─── 5. TASKS (under projects) ────────────────────
  console.log('\n📋 5. TASKS - TÂCHES');
  if (testIds.project) {
    await test('POST /projects/:id/tasks (create)', () =>
      req('POST', `/projects/${testIds.project}/tasks`, {
        title: 'Développer API REST', description: 'Créer les endpoints API',
        status: 'todo', priority: 'high'
      }).then(r => { if (r.ok && r.data?._id) testIds.task = r.data._id; return r; })
        .then(r => expect(r, 201)) );

    await test('GET /projects/:id/tasks (list)', () =>
      req('GET', `/projects/${testIds.project}/tasks`).then(r => expect(r, 200)) );

    await test('GET /projects/:id/tasks/stats', () =>
      req('GET', `/projects/${testIds.project}/tasks/stats`).then(r => expect(r, 200)) );

    if (testIds.task) {
      await test('PUT /projects/:id/tasks/:taskId (update)', () =>
        req('PUT', `/projects/${testIds.project}/tasks/${testIds.task}`, { status: 'in_progress' })
          .then(r => expect(r, 200)) );
      await test('POST /projects/:id/tasks/:taskId/comments', () =>
        req('POST', `/projects/${testIds.project}/tasks/${testIds.task}/comments`, { text: 'En cours de développement' })
          .then(r => expect(r, 200)) );
    }
  }

  // ─── 6. TEAM MEMBERS ─────────────────────────────
  console.log('\n📋 6. TEAM - ÉQUIPE');
  if (testIds.project && testIds.employee) {
    await test('POST /projects/:id/team (add member)', () =>
      req('POST', `/projects/${testIds.project}/team`, { userId: testIds.employee, role: 'developer' })
        .then(r => { if (r.ok && r.data?._id) testIds.member = r.data._id; return r; })
        .then(r => expect(r, 201)) );
    await test('GET /projects/:id/team (list)', () =>
      req('GET', `/projects/${testIds.project}/team`).then(r => expect(r, 200)) );
  }

  // ─── 7. STOCK ─────────────────────────────────────
  console.log('\n📋 7. STOCK - STOCK & INVENTAIRE');
  await test('POST /stock/categories (create)', () =>
    req('POST', '/stock/categories', { name: 'Électronique' })
      .then(r => { if (r.ok && r.data?._id) testIds.category = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('POST /stock/warehouses (create)', () =>
    req('POST', '/stock/warehouses', { name: 'Entrepôt Casa', location: 'Casablanca' })
      .then(r => { if (r.ok && r.data?._id) testIds.warehouse = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('POST /stock/products (create)', () =>
    req('POST', '/stock/products', {
      name: 'Laptop HP ProBook', sku: `HP-PRO-${ts}`,
      categoryId: testIds.category, unitPrice: 12000, unitCost: 9000, minStockLevel: 5,
      warehouseId: testIds.warehouse
    }).then(r => { if (r.ok && r.data?._id) testIds.product = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /stock/products (list)', () =>
    req('GET', '/stock/products').then(r => expect(r, 200)) );

  if (testIds.product) {
    await test('GET /stock/products/:id', () =>
      req('GET', `/stock/products/${testIds.product}`).then(r => expect(r, 200)) );
    await test('PUT /stock/products/:id', () =>
      req('PUT', `/stock/products/${testIds.product}`, { unitPrice: 11500 })
        .then(r => expect(r, 200, { unitPrice: 11500 })) );
    await test('POST /stock/movements (stock in)', () =>
      req('POST', '/stock/movements', { productId: testIds.product, warehouseId: testIds.warehouse, type: 'in', quantity: 50 })
        .then(r => expect(r, 201)) );
    await test('POST /stock/movements (stock out)', () =>
      req('POST', '/stock/movements', { productId: testIds.product, warehouseId: testIds.warehouse, type: 'out', quantity: 5 })
        .then(r => expect(r, 201)) );
  }

  await test('GET /stock/movements (list)', () =>
    req('GET', '/stock/movements').then(r => expect(r, 200)) );
  await test('GET /stock/levels (stock levels)', () =>
    req('GET', '/stock/levels').then(r => expect(r, 200)) );
  await test('GET /stock/levels?lowStock=true', () =>
    req('GET', '/stock/levels?lowStock=true').then(r => expect(r, 200)) );

  await test('POST /stock/suppliers (create)', () =>
    req('POST', '/stock/suppliers', { name: 'Distributec Maroc', email: `info${ts}@distributec.ma`, phone: '+212522987654', paymentTerms: '30 jours' })
      .then(r => { if (r.ok && r.data?._id) testIds.supplier = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /stock/suppliers (list)', () =>
    req('GET', '/stock/suppliers').then(r => expect(r, 200)) );

  // ─── 8. ORDERS ────────────────────────────────────
  console.log('\n📋 8. ORDERS - COMMANDES');
  await test('POST /orders/orders (create)', () =>
    req('POST', '/orders/orders', {
      clientId: testIds.client,
      items: [{ description: 'Laptop HP ProBook', quantity: 5, unitPrice: 12000 }],
      subtotal: 60000, taxTotal: 12000, total: 72000
    }).then(r => { if (r.ok && r.data?._id) testIds.order = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /orders/orders (list)', () =>
    req('GET', '/orders/orders').then(r => expect(r, 200)) );
  await test('GET /orders/orders/stats', () =>
    req('GET', '/orders/orders/stats').then(r => expect(r, 200)) );

  if (testIds.order) {
    await test('GET /orders/orders/:id', () =>
      req('GET', `/orders/orders/${testIds.order}`).then(r => expect(r, 200)) );
    await test('PUT /orders/orders/:id (update)', () =>
      req('PUT', `/orders/orders/${testIds.order}`, { status: 'confirmed' })
        .then(r => expect(r, 200)) );
    await test('POST /orders/orders/:id/payments', () =>
      req('POST', `/orders/orders/${testIds.order}/payments`, { amount: 72000, method: 'transfer', reference: 'VIR-001' })
        .then(r => expect(r, 200)) );
  }

  await test('GET /orders/invoices (list)', () =>
    req('GET', '/orders/invoices').then(r => expect(r, 200)) );

  // ─── 9. DELIVERY ──────────────────────────────────
  console.log('\n📋 9. DELIVERY - LIVRAISONS');
  await test('POST /delivery/agents (create)', () =>
    req('POST', '/delivery/agents', { name: 'Hicham El Fassi', phone: '+212661234567', vehicleType: 'van', isAvailable: true })
      .then(r => { if (r.ok && r.data?._id) testIds.agent = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /delivery/agents/list', () =>
    req('GET', '/delivery/agents/list').then(r => expect(r, 200)) );

  if (testIds.order && testIds.agent) {
    await test('POST /delivery (create delivery)', () =>
      req('POST', '/delivery', {
        orderId: testIds.order, agentId: testIds.agent,
        deliveryAddress: { street: '15 Avenue Hassan II', city: 'Casablanca' }
      }).then(r => { if (r.ok && r.data?._id) testIds.delivery = r.data._id; return r; })
        .then(r => expect(r, 201)) );
  }

  await test('GET /delivery (list)', () =>
    req('GET', '/delivery').then(r => expect(r, 200)) );

  if (testIds.delivery) {
    await test('PUT /delivery/:id/status (in_transit)', () =>
      req('PUT', `/delivery/${testIds.delivery}/status`, { status: 'in_transit' })
        .then(r => expect(r, 200)) );
    await test('PUT /delivery/:id/status (delivered)', () =>
      req('PUT', `/delivery/${testIds.delivery}/status`, { status: 'delivered' })
        .then(r => expect(r, 200)) );
    await test('GET /delivery/:id', () =>
      req('GET', `/delivery/${testIds.delivery}`).then(r => expect(r, 200)) );
  }

  // ─── 10. SERVICES ─────────────────────────────────
  console.log('\n📋 10. SERVICES - SERVICES');
  await test('POST /services/catalog (create)', () =>
    req('POST', '/services/catalog', {
      name: 'Audit Sécurité IT', description: 'Audit complet de sécurité',
      category: 'consulting', basePrice: 50000, estimatedDuration: 5, durationUnit: 'days'
    }).then(r => { if (r.ok && r.data?._id) testIds.catalog = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /services/catalog (list)', () =>
    req('GET', '/services/catalog').then(r => expect(r, 200)) );

  if (testIds.catalog && testIds.client) {
    await test('POST /services/requests (create)', () =>
      req('POST', '/services/requests', {
        serviceId: testIds.catalog, clientId: testIds.client,
        title: 'Audit sécurité CGI Maroc', description: 'Audit complet', priority: 'high'
      }).then(r => { if (r.ok && r.data?._id) testIds.request = r.data._id; return r; })
        .then(r => expect(r, 201)) );
    await test('GET /services/requests (list)', () =>
      req('GET', '/services/requests').then(r => expect(r, 200)) );
    if (testIds.request) {
      await test('PUT /services/requests/:id/status', () =>
        req('PUT', `/services/requests/${testIds.request}/status`, { status: 'in_progress' })
          .then(r => expect(r, 200)) );
      await test('GET /services/requests/:id/history', () =>
        req('GET', `/services/requests/${testIds.request}/history`).then(r => expect(r, 200)) );
    }
  }

  await test('POST /services/technicians (create)', () =>
    req('POST', '/services/technicians', {
      name: 'Sara El Amrani', email: `sara${ts}@test.ma`, phone: '+212612345678',
      skills: ['Cybersécurité', 'Réseaux']
    }).then(r => { if (r.ok && r.data?._id) testIds.technician = r.data._id; return r; })
      .then(r => expect(r, 201)) );

  await test('GET /services/technicians (list)', () =>
    req('GET', '/services/technicians').then(r => expect(r, 200)) );

  if (testIds.request) {
    await test('POST /services/reports (create)', () =>
      req('POST', '/services/reports', {
        requestId: testIds.request, title: 'Rapport Audit Sécurité',
        content: 'Rapport détaillé...', findings: ['Faille XSS'], recommendations: ['Corriger les entrées']
      }).then(r => { if (r.ok && r.data?._id) testIds.serviceReport = r.data._id; return r; })
        .then(r => expect(r, 201)) );
    await test('GET /services/reports (list)', () =>
      req('GET', '/services/reports').then(r => expect(r, 200)) );
  }

  // ─── 11. AI ───────────────────────────────────────
  console.log('\n📋 11. AI - ASSISTANT IA');
  await test('POST /ai/chat', () =>
    req('POST', '/ai/chat', { message: 'Combien d\'employés?' })
      .then(r => expect(r, 200)) );

  await test('POST /ai/reminder (create)', () =>
    req('POST', '/ai/reminder', {
      title: 'Réunion équipe', message: 'Réunion hebdomadaire à 10h',
      type: 'meeting', scheduledAt: new Date(Date.now() + 86400000).toISOString(), priority: 'high'
    }).then(r => { if (r.ok && r.data?.reminder?._id) testIds.reminder = r.data.reminder._id; return r; })
      .then(r => r.status === 200 || r.status === 201 ? true : (console.log(`Expected 2xx got ${r.status}`), false)) );

  await test('GET /ai/reminders (list)', () =>
    req('GET', '/ai/reminders').then(r => expect(r, 200)) );

  if (testIds.reminder) {
    await test('PUT /ai/reminder/:id/status', () =>
      req('PUT', `/ai/reminder/${testIds.reminder}/status`, { status: 'completed' })
        .then(r => expect(r, 200)) );
  }

  await test('POST /ai/clear', () =>
    req('POST', '/ai/clear').then(r => expect(r, 200)) );

  // ─── 12. PAYSLIPS ─────────────────────────────────
  console.log('\n📋 12. PAYSLIPS - BULLETINS DE PAIE');
  if (testIds.employee) {
    await test('POST /payslips (create)', () =>
      req('POST', '/payslips', {
        employeeId: testIds.employee, baseSalary: 18000, tax: 3600, net: 14400, month: 5, year: 2026
      }).then(r => { if (r.ok && r.data?._id) testIds.payslip = r.data._id; return r; })
        .then(r => expect(r, 201)) );
    await test('GET /payslips (list)', () =>
      req('GET', '/payslips').then(r => expect(r, 200)) );
  }

  // ─── 13. AUDIT ────────────────────────────────────
  console.log('\n📋 13. AUDIT - AUDIT INTELLIGENT');
  await test('GET /audit/report', () =>
    req('GET', '/audit/report').then(r => expect(r, 200)) );

  if (testIds.project) {
    await test('POST /audit/reports (create)', () =>
      req('POST', '/audit/reports', {
        projectId: testIds.project, content: 'Rapport d\'audit initial...', anomalies: ['Retard sur livrable 1']
      }).then(r => { if (r.ok && r.data?._id) testIds.audit = r.data._id; return r; })
        .then(r => expect(r, 201)) );
    await test('GET /audit/reports (list)', () =>
      req('GET', '/audit/reports').then(r => expect(r, 200)) );
  }

  // ─── 14. NOTIFICATIONS ────────────────────────────
  console.log('\n📋 14. NOTIFICATIONS');
  await test('GET /notifications (list)', () =>
    req('GET', '/notifications').then(r => expect(r, 200)) );

  // ─── 15. COMPANIES ────────────────────────────────
  console.log('\n📋 15. COMPANIES');
  await test('POST /companies (create)', () =>
    req('POST', '/companies', { name: `Holding Test ${ts}` })
      .then(r => { if (r.ok && r.data?._id) testIds.company = r.data._id; return r; })
      .then(r => expect(r, 201)) );
  await test('GET /companies (list)', () =>
    req('GET', '/companies').then(r => expect(r, 200)) );

  // ─── 16. CHATBOT LOGS ─────────────────────────────
  console.log('\n📋 16. CHATBOT LOGS');
  await test('POST /chatbot-logs (create)', () =>
    req('POST', '/chatbot-logs', { message: 'Test message', response: 'Test response' })
      .then(r => { if (r.ok && r.data?._id) testIds.log = r.data._id; return r; })
      .then(r => expect(r, 201)) );
  await test('GET /chatbot-logs (list)', () =>
    req('GET', '/chatbot-logs').then(r => expect(r, 200)) );

  // ─── 17. DELETE TESTS (cleanup) ──────────────────
  console.log('\n📋 17. DELETE (cleanup)');
  const deletions = [
    ['audit report', testIds.audit, `/audit/reports/${testIds.audit}`],
    ['payslip', testIds.payslip, `/payslips/${testIds.payslip}`],
    ['ai reminder', testIds.reminder, `/ai/reminder/${testIds.reminder}`],
    ['task', testIds.task, testIds.project ? `/projects/${testIds.project}/tasks/${testIds.task}` : null],
    ['team member', testIds.member, testIds.project ? `/projects/${testIds.project}/team/${testIds.member}` : null],
    ['product', testIds.product, `/stock/products/${testIds.product}`],
    ['client', testIds.client, `/clients/${testIds.client}`],
  ];
  for (const [label, id, path] of deletions) {
    if (!id || !path) { await test(`SKIP ${label} (no id)`, () => Promise.resolve(true)); continue; }
    await test(`DELETE ${label}`, () => req('DELETE', path).then(r => r.ok || r.status === 404 ? true : (console.log(`Expected 2xx/404 got ${r.status}`), false)));
  }

  // ─── RESULTS ─────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log(`   RESULTS: ${passed} ✅ passed, ${failed} ❌ failed`);
  console.log('═══════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
