import {api,sesion} from './api.js?v=36';
import {renderMiMovilidad} from '../modules/movil/mi-movilidad.js?v=362';

const host=document.getElementById('mobileMobility');
const tools=document.getElementById('mobileRoleTools');
const grid=document.getElementById('mobileRoleGrid');

async function logout(){
 try{if(sesion.token)await api('/autenticacion/logout',{method:'POST'})}catch{}
 sesion.limpiar();location.replace('/login?next=/movil');
}

function toolCard(m){
 const a=document.createElement('a');a.className='mobile-role-card';a.href='/sistema#'+encodeURIComponent(m.modulo);
 a.innerHTML=`<strong>${m.nombre}</strong><small>${m.descripcion||'Abrir función autorizada.'}</small><span>Abrir →</span>`;
 return a;
}

async function init(){
 if(!sesion.token){location.replace('/login?next=/movil');return}
 try{
  const [yo,ctx]=await Promise.all([api('/autenticacion/yo'),api('/movil/contexto')]);
  sesion.actualizarUsuario(yo.usuario);
  document.getElementById('mobileUser').textContent=yo.usuario.nombreCompleto||yo.usuario.nombreUsuario||'NEXO PARK';
  document.getElementById('mobileRole').textContent=yo.usuario.nombreRol||'Cuenta institucional';
  await renderMiMovilidad(host);
  grid.replaceChildren();
  for(const m of ctx.accesos||[])grid.append(toolCard(m));
  tools.hidden=!(ctx.accesos?.length);
 }catch(e){
  if(e.status===401){sesion.limpiar();location.replace('/login?next=/movil');return}
  host.innerHTML=`<div class="mobility-error"><h2>No se pudo abrir NEXO PARK</h2><p>${String(e.message||'Intente nuevamente.')}</p></div>`;
 }
}

document.getElementById('mobileLogout').onclick=logout;
document.getElementById('mobileRefresh').onclick=()=>location.reload();
init();
