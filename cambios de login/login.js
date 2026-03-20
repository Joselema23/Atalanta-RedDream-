/* ===== PARTÍCULAS ===== */
(function(){
  const container = document.getElementById('particles');
  for(let i = 0; i < 28; i++){
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random()*100}%;
      width: ${Math.random() > 0.5 ? 2 : 1}px;
      height: ${Math.random() > 0.5 ? 2 : 1}px;
      animation-duration: ${12 + Math.random()*20}s;
      animation-delay: ${Math.random()*15}s;
      opacity: ${0.3 + Math.random()*0.4};
    `;
    container.appendChild(p);
  }
})();

/* ===== TABS ===== */
let currentTab = 'login';

function switchTab(tab) {
  currentTab = tab;
  const panels = document.querySelectorAll('.panel');
  const btns = document.querySelectorAll('.tab-btn');
  const indicator = document.getElementById('tabIndicator');

  panels.forEach(p => p.classList.remove('active'));
  btns.forEach(b => b.classList.remove('active'));

  document.getElementById('panel-' + tab).classList.add('active');
  if(tab === 'login'){
    btns[0].classList.add('active');
    indicator.classList.remove('right');
  } else {
    btns[1].classList.add('active');
    indicator.classList.add('right');
  }
}

/* ===== STEPS REGISTRO ===== */
let currentStep = 1;

function goStep(n) {
  if(n > currentStep && !validateStep(currentStep)) return;

  document.getElementById('reg-step-' + currentStep).classList.remove('active');
  currentStep = n;
  document.getElementById('reg-step-' + currentStep).classList.add('active');
  updateStepIndicator();
}

function updateStepIndicator() {
  for(let i = 1; i <= 3; i++){
    const dot = document.getElementById('step-dot-' + i);
    dot.classList.remove('active','done');
    if(i < currentStep) dot.classList.add('done');
    else if(i === currentStep) dot.classList.add('active');
  }
  for(let i = 1; i <= 2; i++){
    const line = document.getElementById('step-line-' + i);
    line.classList.toggle('active', i < currentStep);
  }
}

/* ===== VALIDACIÓN ===== */
function validateStep(step) {
  if(step === 1){
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    if(!email || !/\S+@\S+\.\S+/.test(email)){
      showToast('⚠️ Introduce un email válido', '#ef4444'); return false;
    }
    if(pass.length < 8){
      showToast('⚠️ La contraseña debe tener 8+ caracteres', '#ef4444'); return false;
    }
    if(pass !== pass2){
      showToast('⚠️ Las contraseñas no coinciden', '#ef4444'); return false;
    }
  }
  if(step === 2){
    const nombre = document.getElementById('reg-nombre').value;
    const apellido = document.getElementById('reg-apellido').value;
    if(!nombre || !apellido){
      showToast('⚠️ Introduce tu nombre y apellidos', '#ef4444'); return false;
    }
  }
  return true;
}

/* ===== STRENGTH BAR ===== */
function checkStrength(val){
  const bar = document.getElementById('strengthBar');
  const txt = document.getElementById('strengthText');
  let score = 0;
  if(val.length >= 8) score++;
  if(/[A-Z]/.test(val)) score++;
  if(/[0-9]/.test(val)) score++;
  if(/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct:'0%', color:'transparent', label:'' },
    { pct:'25%', color:'#ef4444', label:'Débil' },
    { pct:'50%', color:'#f97316', label:'Regular' },
    { pct:'75%', color:'#eab308', label:'Buena' },
    { pct:'100%', color:'#22c55e', label:'Fuerte ✓' },
  ];

  const lvl = val.length === 0 ? levels[0] : levels[score] || levels[4];
  bar.style.width = lvl.pct;
  bar.style.background = lvl.color;
  txt.textContent = lvl.label;
  txt.style.color = lvl.color;
}

/* ===== ROL ===== */
function selectRole(rol, el) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('rol-value').value = rol;

  ['empleado','jefe','cliente'].forEach(r => {
    const el2 = document.getElementById('extra-' + r);
    if(el2) el2.style.display = r === rol ? 'block' : 'none';
  });
}

/* ===== HANDLES ===== */
function handleLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  if(!email || !pass){
    showToast('⚠️ Completa todos los campos', '#ef4444'); return;
  }
  const btn = document.getElementById('loginBtn');
  btn.classList.add('loading');
  setTimeout(()=>{
    btn.classList.remove('loading');
    showToast('✓ Acceso concedido. Bienvenido.', '#22c55e');
  }, 1800);
}

function handleRegister() {
  if(!validateStep(2)) return;
  const rol = document.getElementById('rol-value').value;
  if(!rol){ showToast('⚠️ Selecciona un cargo', '#ef4444'); return; }
  if(!document.getElementById('terms').checked){
    showToast('⚠️ Acepta los términos y condiciones', '#ef4444'); return;
  }
  const btn = document.getElementById('registerBtn');
  btn.classList.add('loading');
  setTimeout(()=>{
    btn.classList.remove('loading');
    showToast('✓ Cuenta creada con éxito', '#22c55e');
    setTimeout(()=> switchTab('login'), 1200);
  }, 2000);
}

/* ===== TOAST ===== */
function showToast(msg, color) {
  const t = document.getElementById('toast');
  const m = document.getElementById('toastMsg');
  m.textContent = msg;
  t.style.borderColor = color || 'rgba(220,38,38,0.35)';
  t.classList.add('show');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(()=> t.classList.remove('show'), 3200);
}