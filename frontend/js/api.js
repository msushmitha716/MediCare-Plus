const TOKEN_KEY = 'token';
const USER_KEY = 'user';

async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !location.pathname.endsWith('login.html')) { logout(); return; }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function currentUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  location.href = 'login.html';
}

function requireLogin(allowedRoles) {
  const u = currentUser();
  if (!u || !localStorage.getItem(TOKEN_KEY)) return logout();
  if (allowedRoles && !allowedRoles.includes(u.role)) {
    alert('You do not have access to this page');
    location.href = 'dashboard.html';
    return;
  }
  document.querySelectorAll('[data-roles]').forEach(el => {
    if (!el.dataset.roles.split(',').includes(u.role)) el.style.display = 'none';
  });
}
// Automatically run role and sidebar checks as soon as api.js loads
document.addEventListener("DOMContentLoaded", () => {
  const u = currentUser();
  if (u && u.role) {
    document.querySelectorAll('[data-roles]').forEach(el => {
      if (!el.dataset.roles.split(',').includes(u.role)) {
        el.style.display = 'none';
      }
    });
  }
});
