const base = 'http://localhost:5000';

async function check(path, opts = {}) {
  const res = await fetch(base + path, opts);
  const body = await res.text();
  console.log(`\n=== ${path} (${res.status}) ===`);
  console.log(body);
  return JSON.parse(body || '{}');
}

(async () => {
  try {
    await check('/');
    const demo = await check('/api/auth/demo', { credentials: 'include' });
    await check('/api/employees?search=&department=&position=', { credentials: 'include' });
    await check('/api/projects?search=&status=', { credentials: 'include' });
    await check('/api/clients?search=', { credentials: 'include' });
    await check('/api/audit/report', { credentials: 'include' });
    await check('/api/ai/chat', { method: 'POST', credentials: 'include', body: JSON.stringify({ message: 'Bonjour' }) });
    await check('/api/ai/automate', { method: 'POST', credentials: 'include', body: JSON.stringify({ message: 'Lister les projets' }) });
    console.log('\nAll API checks completed.');
  } catch (err) {
    console.error('Verification failed:', err);
    process.exit(1);
  }
})();
