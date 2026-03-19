/* =====================================================
   GestiónTickets — Lógica de la aplicación
   ===================================================== */

// ===== DATA =====
const USERS = [
  { id: 1, name: 'Jose Lema',     email: 'jose@empresa.com',     pass: '1234', role: 'admin' },
  { id: 2, name: 'Marcos pepe',    email: 'marcos@empresa.com',  pass: '1234', role: 'jefe' },
  { id: 3, name: 'Fabian López',    email: 'fabian@empresa.com',   pass: '1234', role: 'trabajador' },
  { id: 4, name: 'Isaac Sánchez',  email: 'isaac@empresa.com',   pass: '1234', role: 'trabajador' },
  { id: 5, name: 'Laura Torres',   email: 'laura@empresa.com',   pass: '1234', role: 'cliente' },
  { id: 6, name: 'Javier Morales', email: 'javier@empresa.com',  pass: '1234', role: 'cliente' },
];

let tickets = [
  {
    id: 1,
    title: 'No puedo iniciar sesión en el panel',
    desc: 'Desde ayer no puedo acceder al panel de administración. Sale error 403.',
    category: 'acceso', priority: 'alta', status: 'en_revision',
    createdBy: 5, assignedTo: 3,
    comments: [
      { author: 5, text: 'El problema empezó ayer por la tarde, antes funcionaba bien.', date: '2025-06-01 09:15' },
      { author: 3, text: 'He revisado los permisos, parece un problema con la sesión. Revisando logs del servidor.', date: '2025-06-01 10:30' },
    ],
    createdAt: '2025-06-01',
  },
  {
    id: 2,
    title: 'Error en la generación de facturas PDF',
    desc: 'Al generar facturas en PDF el importe sale en cero. Solo pasa con facturas mayores a 1000€.',
    category: 'bug', priority: 'alta', status: 'abierto',
    createdBy: 6, assignedTo: null, comments: [], createdAt: '2025-06-02',
  },
  {
    id: 3,
    title: 'Añadir exportación a Excel en reportes',
    desc: 'Sería muy útil poder exportar los reportes a Excel además de PDF.',
    category: 'mejora', priority: 'baja', status: 'cerrado',
    createdBy: 5, assignedTo: 4,
    comments: [
      { author: 4, text: 'Funcionalidad implementada y desplegada en producción.', date: '2025-05-28 16:00' },
      { author: 5, text: '¡Perfecto! Ya funciona correctamente. Muchas gracias.', date: '2025-05-29 09:00' },
    ],
    createdAt: '2025-05-25',
  },
  {
    id: 4,
    title: 'Cobro duplicado en suscripción',
    desc: 'Este mes me han cobrado dos veces la suscripción mensual. Necesito el reembolso.',
    category: 'facturacion', priority: 'alta', status: 'abierto',
    createdBy: 6, assignedTo: null, comments: [], createdAt: '2025-06-03',
  },
  {
    id: 5,
    title: 'El dashboard tarda mucho en cargar',
    desc: 'El panel principal tarda más de 30 segundos en cargar. Antes iba rápido.',
    category: 'soporte', priority: 'media', status: 'en_revision',
    createdBy: 5, assignedTo: 3,
    comments: [
      { author: 3, text: 'Detectado problema en queries de base de datos. Optimizando índices.', date: '2025-06-03 11:00' },
    ],
    createdAt: '2025-06-02',
  },
];

let nextId = 6;
let currentUser = null;
let currentFilter = 'all';

// ===== HELPERS =====
const $ = id => document.getElementById(id);

const statusLabel = s => ({ abierto: 'Abierto', en_revision: 'En Revisión', cerrado: 'Cerrado' }[s] || s);
const statusColor = s => ({ abierto: '#3b82f6', en_revision: '#eab308', cerrado: '#22c55e' }[s] || '#cc0000');
const statusBadge = s => ({ abierto: 'badge-open', en_revision: 'badge-review', cerrado: 'badge-closed' }[s] || 'badge-open');
const priorityDot = p => `<span class="priority-dot p-${p}" title="Prioridad ${p}"></span>`;
const roleBadge = r => `<span class="badge badge-${r}">${r.charAt(0).toUpperCase() + r.slice(1)}</span>`;
const userInitials = u => u.name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
const getUserById = id => USERS.find(u => u.id === id);
const now = () => new Date().toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

// ===== UI UTILS =====
function showAlert(msg, type = 'success') {
  const a = $('alert');
  a.textContent = msg;
  a.className = `alert alert-${type} show`;
  setTimeout(() => a.className = 'alert', 2800);
}

function openModal(id)  { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// ===== AUTH =====
function doLogin() {
  const u = $('loginUser').value.trim().toLowerCase();
  const p = $('loginPass').value;
  const found = USERS.find(x => x.email.toLowerCase() === u && x.pass === p);
  if (!found) {
    $('loginError').style.display = 'block';
    return;
  }
  $('loginError').style.display = 'none';
  currentUser = found;
  $('loginScreen').style.display = 'none';
  $('app').style.display = 'block';
  initApp();
}

function doLogout() {
  currentUser = null;
  $('app').style.display = 'none';
  $('loginScreen').style.display = 'flex';
  $('loginUser').value = '';
  $('loginPass').value = '';
}

function fillDemo(email, pass) {
  $('loginUser').value = email;
  $('loginPass').value = pass;
}

// ===== INIT =====
function initApp() {
  $('navAvatar').textContent = userInitials(currentUser);
  $('navName').textContent = currentUser.name;
  $('navBadge').className = 'badge badge-' + currentUser.role;
  $('navBadge').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  buildSidebar();
  showView('dashboard');
}

function buildSidebar() {
  const r = currentUser.role;
  let html = '';
  html += `<div class="sidebar-section">Principal</div>`;
  html += `<button class="sidebar-btn" onclick="showView('dashboard')" id="sb-dashboard"><span class="icon">📊</span> Dashboard</button>`;

  if (r === 'cliente') {
    html += `<div class="sidebar-section">Mis tickets</div>`;
    html += `<button class="sidebar-btn" onclick="showView('tickets')" id="sb-tickets"><span class="icon">🎫</span> Mis Tickets</button>`;
  } else {
    html += `<div class="sidebar-section">Tickets</div>`;
    html += `<button class="sidebar-btn" onclick="showView('tickets')" id="sb-tickets"><span class="icon">🎫</span> Todos los Tickets</button>`;
  }

  if (r === 'admin') {
    html += `<div class="sidebar-section">Administración</div>`;
    html += `<button class="sidebar-btn" onclick="showView('users')" id="sb-users"><span class="icon">👥</span> Usuarios</button>`;
  }
  $('sidebar').innerHTML = html;
}

function showView(v) {
  document.querySelectorAll('.view').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.sidebar-btn').forEach(x => x.classList.remove('active'));
  $('view-' + v).classList.add('active');
  if ($('sb-' + v)) $('sb-' + v).classList.add('active');

  if (v === 'dashboard') renderDashboard();
  if (v === 'tickets')   renderTickets();
  if (v === 'users')     renderUsers();
}

// ===== DASHBOARD =====
function renderDashboard() {
  const r = currentUser.role;
  const myTickets = r === 'cliente' ? tickets.filter(t => t.createdBy === currentUser.id) : tickets;
  const assigned  = tickets.filter(t => t.assignedTo === currentUser.id);

  let stats = '';
  if (r === 'cliente') {
    stats += statCard('Mis Tickets', myTickets.length, 'blue');
    stats += statCard('Abiertos',    myTickets.filter(t => t.status === 'abierto').length,    'red');
    stats += statCard('En Revisión', myTickets.filter(t => t.status === 'en_revision').length, 'yellow');
    stats += statCard('Cerrados',    myTickets.filter(t => t.status === 'cerrado').length,    'green');
  } else if (r === 'trabajador') {
    stats += statCard('Asignados a mí', assigned.length, 'blue');
    stats += statCard('Por resolver',   assigned.filter(t => t.status !== 'cerrado').length, 'red');
    stats += statCard('En Revisión',    assigned.filter(t => t.status === 'en_revision').length, 'yellow');
    stats += statCard('Cerrados',       assigned.filter(t => t.status === 'cerrado').length, 'green');
  } else {
    stats += statCard('Total Tickets', tickets.length, 'blue');
    stats += statCard('Abiertos',    tickets.filter(t => t.status === 'abierto').length,    'red');
    stats += statCard('En Revisión', tickets.filter(t => t.status === 'en_revision').length, 'yellow');
    stats += statCard('Cerrados',    tickets.filter(t => t.status === 'cerrado').length,    'green');
  }
  $('statsGrid').innerHTML = stats;

  const recent = (r === 'cliente' ? myTickets : r === 'trabajador' ? assigned : tickets).slice(-5).reverse();
  $('dashTickets').innerHTML = recent.length
    ? recent.map(t => ticketCardHTML(t)).join('')
    : `<div class="empty-state"><div class="icon">🎫</div><p>No hay tickets recientes</p></div>`;
}

function statCard(label, val, color) {
  return `<div class="stat-card">
    <div class="stat-label">${label}</div>
    <div class="stat-value ${color}">${val}</div>
  </div>`;
}

// ===== TICKETS LIST =====
function renderTickets() {
  const r = currentUser.role;
  $('ticketsViewTitle').textContent = r === 'cliente' ? '🎫 Mis Tickets' : '🎫 Todos los Tickets';
  $('ticketsViewSub').textContent   = r === 'cliente' ? 'Tickets que has creado' : 'Gestión completa de tickets';

  $('createTicketBtn').innerHTML = r === 'cliente'
    ? `<button class="btn btn-primary btn-sm" onclick="openModal('newTicketModal')">Nuevo Ticket</button>`
    : '';

  const q = $('searchInput').value.toLowerCase();
  let list = tickets;
  if (r === 'cliente') list = tickets.filter(t => t.createdBy === currentUser.id);
  if (currentFilter !== 'all') list = list.filter(t => t.status === currentFilter);
  if (q) list = list.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q)  ||
    String(t.id).includes(q)
  );
  list = [...list].reverse();

  $('ticketsList').innerHTML = list.length
    ? list.map(t => ticketCardHTML(t)).join('')
    : `<div class="empty-state"><div class="icon">🔍</div><p>No se encontraron tickets</p></div>`;
}

function ticketCardHTML(t) {
  const creator  = getUserById(t.createdBy);
  const assigned = t.assignedTo ? getUserById(t.assignedTo) : null;
  const sc = statusColor(t.status);
  return `<div class="ticket-card" style="--status-color:${sc}" onclick="openTicket(${t.id})">
    <div class="ticket-row">
      <span class="ticket-id">#${String(t.id).padStart(4, '0')}</span>
      <span class="ticket-title">${t.title}</span>
      <span class="badge ${statusBadge(t.status)}">${statusLabel(t.status)}</span>
    </div>
    <div class="ticket-meta">
      ${priorityDot(t.priority)}
      <span>👤 ${creator ? creator.name : '?'}</span>
      <span>📂 ${t.category}</span>
      ${assigned
        ? `<span>🔧 ${assigned.name}</span>`
        : `<span style="color:#ef4444">⚠ Sin asignar</span>`}
      <span>💬 ${t.comments.length}</span>
      <span>📅 ${t.createdAt}</span>
    </div>
  </div>`;
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderTickets();
}

// ===== TICKET DETAIL =====
function openTicket(id) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  const r       = currentUser.role;
  const creator = getUserById(t.createdBy);
  const assigned = t.assignedTo ? getUserById(t.assignedTo) : null;

  $('modalTitle').textContent = `#${String(t.id).padStart(4, '0')} — ${t.title}`;
  $('modalBadges').innerHTML  = `
    <span class="badge ${statusBadge(t.status)}">${statusLabel(t.status)}</span>
    <span class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-2)">${t.category}</span>
    ${priorityDot(t.priority)}
    <span style="font-size:0.75rem;color:var(--text-3)">Prioridad ${t.priority}</span>`;

  // Status control (trabajador, jefe, admin)
  let statusControl = '';
  if (r === 'trabajador' || r === 'jefe' || r === 'admin') {
    statusControl = `<div class="detail-section">
      <h4>Cambiar Estado</h4>
      <select class="status-select" onchange="changeStatus(${t.id}, this.value)">
        <option value="abierto"     ${t.status === 'abierto'     ? 'selected' : ''}>📂 Abierto</option>
        <option value="en_revision" ${t.status === 'en_revision' ? 'selected' : ''}>🔍 En Revisión</option>
        <option value="cerrado"     ${t.status === 'cerrado'     ? 'selected' : ''}>✅ Cerrado</option>
      </select>
    </div>`;
  }

  // Assign control (jefe, admin)
  let assignControl = '';
  if (r === 'jefe' || r === 'admin') {
    const workers = USERS.filter(u => u.role === 'trabajador');
    assignControl = `<div class="detail-section">
      <h4>Asignar a Trabajador</h4>
      <select class="assign-select" onchange="assignTicket(${t.id}, this.value)">
        <option value="">— Sin asignar —</option>
        ${workers.map(w => `<option value="${w.id}" ${t.assignedTo === w.id ? 'selected' : ''}>${w.name}</option>`).join('')}
      </select>
    </div>`;
  }

  // Comments HTML
  const commentsHTML = buildCommentsHTML(t);

  // Comment form (anyone involved or staff)
  const canComment = r === 'admin' || r === 'jefe' || r === 'trabajador' || (r === 'cliente' && t.createdBy === currentUser.id);
  const commentForm = canComment ? `<div class="comment-form">
    <textarea id="commentInput_${t.id}" placeholder="Añade un comentario..."></textarea>
    <div class="comment-form-footer">
      <button class="btn btn-primary btn-sm" onclick="addComment(${t.id})">Enviar comentario →</button>
    </div>
  </div>` : '';

  $('modalBody').innerHTML = `
    <div class="detail-grid">
      <div>
        <div class="detail-section">
          <h4>Descripción</h4>
          <div class="detail-desc">${t.desc}</div>
        </div>
        <div class="divider"></div>
        <div class="detail-section">
          <h4>Historial de Comentarios (${t.comments.length})</h4>
          <div class="comments-wrap" id="commentsWrap_${t.id}">${commentsHTML}</div>
          ${commentForm}
        </div>
      </div>
      <div>
        <div class="detail-section">
          <h4>Información</h4>
          <div class="detail-meta-grid">
            <div class="meta-item"><span class="meta-label">Creado por</span><span class="meta-value">${creator ? creator.name : '?'}</span></div>
            <div class="meta-item"><span class="meta-label">Fecha</span><span class="meta-value">${t.createdAt}</span></div>
            <div class="meta-item"><span class="meta-label">Categoría</span><span class="meta-value">${t.category}</span></div>
            <div class="meta-item"><span class="meta-label">Prioridad</span><span class="meta-value">${t.priority}</span></div>
            <div class="meta-item">
              <span class="meta-label">Asignado a</span>
              <span class="meta-value" style="${!assigned ? 'color:#ef4444' : ''}">${assigned ? assigned.name : 'Sin asignar'}</span>
            </div>
          </div>
        </div>
        ${statusControl}
        ${assignControl}
      </div>
    </div>`;

  openModal('ticketModal');
}

function buildCommentsHTML(t) {
  if (!t.comments.length) {
    return `<p style="color:var(--text-3);font-size:0.85rem;text-align:center;padding:1rem">Sin comentarios aún</p>`;
  }
  return t.comments.map(c => {
    const u = getUserById(c.author);
    return `<div class="comment-item">
      <div class="comment-header">
        <div class="comment-avatar">${u ? userInitials(u) : '?'}</div>
        <span class="comment-author">${u ? u.name : 'Usuario'}</span>
        ${u ? roleBadge(u.role) : ''}
        <span class="comment-date">${c.date}</span>
      </div>
      <div class="comment-text">${c.text}</div>
    </div>`;
  }).join('');
}

function changeStatus(id, status) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  const old = t.status;
  t.status = status;
  t.comments.push({ author: currentUser.id, text: `Estado cambiado: "${statusLabel(old)}" → "${statusLabel(status)}"`, date: now() });
  showAlert(`Estado actualizado a "${statusLabel(status)}"`, 'success');
  $('modalBadges').innerHTML = `
    <span class="badge ${statusBadge(t.status)}">${statusLabel(t.status)}</span>
    <span class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-2)">${t.category}</span>
    ${priorityDot(t.priority)}
    <span style="font-size:0.75rem;color:var(--text-3)">Prioridad ${t.priority}</span>`;
  refreshComments(t);
}

function assignTicket(id, uid) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  t.assignedTo = uid ? parseInt(uid) : null;
  const u = t.assignedTo ? getUserById(t.assignedTo) : null;
  t.comments.push({ author: currentUser.id, text: `Ticket ${u ? `asignado a ${u.name}` : 'desasignado'}`, date: now() });
  showAlert(u ? `Asignado a ${u.name}` : 'Ticket desasignado', 'info');
  refreshComments(t);
}

function addComment(id) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  const inp = $(`commentInput_${id}`);
  const txt = inp.value.trim();
  if (!txt) { showAlert('Escribe un comentario antes de enviar', 'error'); return; }
  t.comments.push({ author: currentUser.id, text: txt, date: now() });
  inp.value = '';
  showAlert('Comentario añadido', 'success');
  refreshComments(t);
}

function refreshComments(t) {
  const wrap = $(`commentsWrap_${t.id}`);
  if (!wrap) return;
  wrap.innerHTML = buildCommentsHTML(t);
  wrap.scrollTop = wrap.scrollHeight;
}

// ===== CREATE TICKET =====
function createTicket() {
  const title = $('nt_title').value.trim();
  const desc  = $('nt_desc').value.trim();
  if (!title || !desc) { showAlert('Completa el título y la descripción', 'error'); return; }
  const t = {
    id: nextId++,
    title, desc,
    category:  $('nt_cat').value,
    priority:  $('nt_prior').value,
    status:    'abierto',
    createdBy: currentUser.id,
    assignedTo: null,
    comments:  [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
  tickets.push(t);
  $('nt_title').value = '';
  $('nt_desc').value  = '';
  closeModal('newTicketModal');
  showAlert('Ticket creado correctamente ✓', 'success');
  renderTickets();
}

// ===== ADMIN — USERS =====
function renderUsers() {
  if (currentUser.role !== 'admin') { $('usersList').innerHTML = '<p>Sin acceso</p>'; return; }
  $('usersList').innerHTML = USERS.map(u => `
    <div class="user-row">
      <div class="user-row-avatar">${userInitials(u)}</div>
      <div class="user-row-info">
        <div class="user-row-name">${u.name} ${u.id === currentUser.id ? '<span style="font-size:0.7rem;color:var(--text-3)">(tú)</span>' : ''}</div>
        <div class="user-row-email">${u.email}</div>
      </div>
      ${roleBadge(u.role)}
      <div class="user-row-actions">
        <select class="role-select"
          onchange="changeRole(${u.id}, this.value)"
          ${u.id === currentUser.id ? 'disabled title="No puedes cambiar tu propio rol"' : ''}>
          <option value="admin"      ${u.role === 'admin'      ? 'selected' : ''}>Admin</option>
          <option value="jefe"       ${u.role === 'jefe'       ? 'selected' : ''}>Jefe</option>
          <option value="trabajador" ${u.role === 'trabajador' ? 'selected' : ''}>Trabajador</option>
          <option value="cliente"    ${u.role === 'cliente'    ? 'selected' : ''}>Cliente</option>
        </select>
      </div>
    </div>`).join('');
}

function changeRole(uid, role) {
  const u = USERS.find(x => x.id === uid);
  if (!u) return;
  if (u.id === currentUser.id) { showAlert('No puedes cambiar tu propio rol', 'error'); return; }
  u.role = role;
  showAlert(`Rol de ${u.name} cambiado a "${role}"`, 'success');
  renderUsers();
}

// ===== DEMO USERS =====
function buildDemoUsers() {
  const roleColors = { admin: 'badge-admin', jefe: 'badge-jefe', trabajador: 'badge-trabajador', cliente: 'badge-cliente' };
  $('demoUsers').innerHTML = USERS.map(u => `
    <div class="demo-user" onclick="fillDemo('${u.email}', '${u.pass}')">
      <span>${u.name} — <span style="font-family:'Share Tech Mono',monospace;font-size:0.75rem;color:var(--text-3)">${u.email}</span></span>
      <span class="badge role-pill ${roleColors[u.role]}">${u.role}</span>
    </div>`).join('');
}

// ===== EVENT LISTENERS =====
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});
$('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('loginUser').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

// ===== BOOT =====
buildDemoUsers();
