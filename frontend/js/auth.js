import { initTheme } from './theme.js?v=34';
import { api, sesion } from './api.js?v=34';

let captchaToken = '';
let countdownTimer = null;
let expiryTimer = null;
let captchaVersion = 0;
let submitting = false;
const captchaHint = document.getElementById('captchaHint');
const connectionHelp = document.getElementById('connectionHelp');

const q = document.getElementById('captchaQuestion');
const err = document.getElementById('error');
const statusBox = document.getElementById('status');
const form = document.getElementById('loginForm');
const userInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const captchaInput = document.getElementById('captchaAnswer');
const reloadButton = document.getElementById('reloadCaptcha');
const loginButton = document.getElementById('loginButton');
const loginButtonText = document.getElementById('loginButtonText');
const loginSpinner = document.getElementById('loginSpinner');
const togglePassword = document.getElementById('togglePassword');
const capsWarning = document.getElementById('capsWarning');

function setLoading(loading) {
  submitting = loading;
  loginButton.disabled = loading || !captchaToken;
  reloadButton.disabled = loading;
  userInput.readOnly = loading;
  passwordInput.readOnly = loading;
  captchaInput.readOnly = loading;
  loginButtonText.textContent = loading ? 'Validando acceso…' : 'Ingresar a NEXO PARK';
  loginSpinner.classList.toggle('hidden', !loading);
}

function hideMessages() {
  err.classList.add('hidden');
  statusBox.classList.add('hidden');
}

function showError(message) {
  err.textContent = message;
  err.classList.remove('hidden');
  statusBox.classList.add('hidden');
}

function showStatus(message) {
  statusBox.textContent = message;
  statusBox.classList.remove('hidden');
  err.classList.add('hidden');
}

async function cargarCaptcha({ preserveError = false } = {}) {
  const version = ++captchaVersion;
  clearTimeout(expiryTimer);
  captchaToken = '';
  captchaInput.value = '';
  captchaInput.disabled = true;
  loginButton.disabled = true;
  q.textContent = 'Preparando verificación…';
  captchaHint.textContent = 'Conectando con el servidor';
  reloadButton.disabled = true;
  connectionHelp.hidden = true;
  if (!preserveError) hideMessages();
  try {
    let challenge;
    for (let attempt = 0; attempt < 2; attempt++) {
      try { challenge = await api('/autenticacion/captcha', { auth: false, timeout: 8000 }); break; }
      catch (e) { if (attempt || (e.status && e.status < 500)) throw e; await new Promise(r => setTimeout(r, 700)); }
    }
    if (version !== captchaVersion) return;
    if (!challenge?.token || typeof challenge.question !== 'string') throw new Error('El servidor devolvió una verificación incompleta. Reinicie NEXO PARK con los archivos actualizados.');
    captchaToken = challenge.token;
    q.textContent = challenge.question;
    captchaInput.disabled = false;
    captchaHint.textContent = 'Resuelve la operación e ingresa el resultado.';
    expiryTimer = setTimeout(() => {
      if (submitting || version !== captchaVersion) return;
      captchaToken = ''; loginButton.disabled = true; captchaInput.disabled = true;
      captchaHint.textContent = 'La verificación venció. Pulsa ↻ para generar otra.';
    }, Math.max(1, Number(challenge.expiresInSeconds || 300)) * 1000);
  } catch (e) {
    if (version !== captchaVersion) return;
    q.textContent = 'Sin verificación';
    captchaHint.textContent = 'Pulsa ↻ después de restablecer la conexión.';
    showError(e.message);
    connectionHelp.hidden = false;
  } finally {
    if (version === captchaVersion) {
      reloadButton.disabled = submitting;
      loginButton.disabled = submitting || !captchaToken;
    }
  }
}

function iniciarCuentaRegresiva(segundos) {
  clearInterval(countdownTimer);
  let restante = Math.max(1, Number(segundos || 0));
  const pintar = () => {
    const min = Math.floor(restante / 60);
    const seg = restante % 60;
    showError(`Cuenta temporalmente bloqueada. Intente nuevamente en ${min}:${String(seg).padStart(2, '0')}.`);
    restante -= 1;
    if (restante < 0) {
      clearInterval(countdownTimer);
      showStatus('El tiempo de bloqueo terminó. Puede intentar iniciar sesión nuevamente.');
      cargarCaptcha();
    }
  };
  pintar();
  countdownTimer = setInterval(pintar, 1000);
}

reloadButton.addEventListener('click', () => {
  hideMessages();
  cargarCaptcha();
});

togglePassword.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  togglePassword.textContent = showing ? 'Mostrar' : 'Ocultar';
  togglePassword.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
  togglePassword.setAttribute('aria-pressed', String(!showing));
  passwordInput.focus();
});

passwordInput.addEventListener('keyup', e => {
  capsWarning.classList.toggle('hidden', !e.getModifierState?.('CapsLock'));
});
passwordInput.addEventListener('blur', () => capsWarning.classList.add('hidden'));

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (submitting) return;
  hideMessages();

  const nombreUsuario = userInput.value.trim();
  const contrasena = passwordInput.value;
  const captchaRespuesta = captchaInput.value.trim();

  if (!nombreUsuario || !contrasena || !captchaRespuesta) {
    showError('Complete usuario, contraseña y CAPTCHA para continuar.');
    return;
  }
  if (!/^\d{1,3}$/.test(captchaRespuesta)) { showError('Ingrese únicamente el resultado numérico de la operación.'); captchaInput.focus(); return; }
  if (!captchaToken) {
    showError('El CAPTCHA no está disponible. Genere uno nuevo e intente otra vez.');
    await cargarCaptcha();
    return;
  }

  setLoading(true);
  try {
    const data = await api('/autenticacion/login', {
      method: 'POST',
      auth: false,
      body: { nombreUsuario, contrasena, captchaToken, captchaRespuesta }
    });
    sesion.guardar(data);
    showStatus('Acceso correcto. Ingresando al sistema...');
    location.replace('/sistema');
  } catch (ex) {
    if (ex.status === 423 && ex.data?.retryAfterSeconds) {
      iniciarCuentaRegresiva(ex.data.retryAfterSeconds);
    } else {
      showError(ex.message || 'No fue posible iniciar sesión.');
      await cargarCaptcha({ preserveError: true });
    }
    passwordInput.select();
  } finally {
    setLoading(false);
  }
});

async function iniciar() {
  initTheme('themeToggleLogin');
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
  if (sesion.token) {
    try {
      const data = await api('/autenticacion/yo');
      sesion.actualizarUsuario(data.usuario);
      location.replace('/sistema');
      return;
    } catch {
      sesion.limpiar();
    }
  }
  userInput.focus();
  await cargarCaptcha();
}

window.addEventListener('online', () => { if (!captchaToken && !submitting) cargarCaptcha(); });
iniciar();
