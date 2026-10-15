const MENUS = {
  admin: [
    ['Patients', 'patients.html'],
    ['Doctors', 'doctors.html'],
    ['Appointments', 'appointments.html'],
    ['Prescriptions', 'prescriptions.html'],
    ['Reports', 'reports.html'],
    ['Analytics', 'analytics.html'],
    ['User Management', 'users.html']
  ],
  receptionist: [
    ['Patients', 'patients.html'],
    ['Appointments', 'appointments.html'],
    ['Doctors', 'doctors.html']
  ],
  doctor: [
    ['My Patients', 'patients.html'],
    ['My Appointments', 'appointments.html'],
    ['Prescriptions', 'prescriptions.html'],
    ['Medical Reports', 'medical-reports.html']
  ]
};

(function () {
  const user = currentUser();
  if (!user || !localStorage.getItem('token')) return logout();

  const menu = MENUS[user.role] || [];
  const page = location.pathname.split('/').pop() || 'dashboard.html';

  // Page guard: dashboard is open to everyone, other pages only if in this role's menu
  if (page !== 'dashboard.html' && !menu.some(m => m[1] === page)) {
    alert('You do not have access to this page');
    location.href = 'dashboard.html';
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('sidebar-menu');
    if (!nav) return;
    const items = [['Dashboard', 'dashboard.html'], ...menu];
    nav.innerHTML = items.map(([label, href]) =>
      `<a href="${href}" class="${href === page ? 'active' : ''}">${label}</a>`
    ).join('');
  });
})();