// Checks that the backend is running and shows the result on the homepage
async function checkServer() {
  const el = document.getElementById('server-status');
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    el.textContent = data.status === 'ok' ? 'Online ✅' : 'Problem ⚠️';
  } catch (err) {
    el.textContent = 'Offline ❌';
  }
}

checkServer();