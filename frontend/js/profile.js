import {api,sesion,aviso} from './api.js?v=36';
import {escapeHTML as esc} from '../shared/actions.js?v=36';

export async function initProfile(){
 const toggle=document.getElementById('accountToggle');
 const menu=document.getElementById('accountMenu');
 const dialog=document.getElementById('profileDialog');
 const reminder=document.getElementById('profileReminder');
 let profile=null;

 function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');}
 toggle.onclick=()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));};
 document.addEventListener('click',e=>{if(!e.target.closest('.account-wrap'))closeMenu();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

 function calcularEdad(p){
  if(!p.fecha_nacimiento)return null;
  const n=new Date(String(p.fecha_nacimiento).slice(0,10)+'T00:00:00Z'),h=new Date();
  let a=h.getFullYear()-n.getUTCFullYear();
  if(h.getMonth()<n.getUTCMonth()||(h.getMonth()===n.getUTCMonth()&&h.getDate()<n.getUTCDate()))a--;
  return a;
 }
 function paint(){
  const name=profile.nombre_completo||profile.nombre_usuario,avatar=document.getElementById('avatar');
  document.getElementById('userName').textContent=name;
  document.getElementById('welcomeName').textContent='Hola, '+name.split(/\s+/)[0]+'.';
  avatar.replaceChildren();
  if(profile.foto_perfil){const img=document.createElement('img');img.src=profile.foto_perfil;img.alt='Fotografía de '+name;avatar.append(img);}else avatar.textContent=name[0].toUpperCase();
  sesion.actualizarUsuario({...sesion.usuario,nombreCompleto:name});
  reminder.hidden=Boolean(profile.perfil_completado_en);
  if(!reminder.hidden){
   const days=profile.perfil_limite_en?Math.max(0,Math.ceil((new Date(profile.perfil_limite_en)-Date.now())/86400000)):7;
   const propietario=profile.rol_codigo==='PROPIETARIO';
   reminder.innerHTML=`<div><strong>${propietario?'Completa tu perfil.':'Completa tu ficha profesional.'}</strong><p>${days?'Tienes '+days+' día'+(days===1?'':'s')+' para completar tus '+(propietario?'datos personales.':'datos personales y profesionales.'):'El plazo ha finalizado; completa tus datos a la brevedad.'}</p></div><button class="btn btn-navy">Completar perfil →</button>`;
   reminder.querySelector('button').onclick=()=>open(true);
  }
 }
 async function open(edit=false){
  closeMenu();dialog.innerHTML='<div class="profile-loading" role="status">Cargando tu perfil…</div>';if(!dialog.open)dialog.showModal();
  try{profile=await api('/perfil');render(edit);}catch(e){dialog.innerHTML='<div class="panel"><p role="alert"></p><button class="btn" data-close>Cerrar</button></div>';dialog.querySelector('p').textContent=e.message;dialog.querySelector('button').onclick=()=>dialog.close();}
 }
 function render(edit){
  const p=profile,age=calcularEdad(p);
  const propietario=p.rol_codigo==='PROPIETARIO';
  dialog.innerHTML=`<div class="profile-dialog-head"><div class="profile-title-block"><img class="profile-brand" src="/assets/logo/nexo-wordmark.svg" alt="NEXO PARK · EMI UALP"><span class="section-kicker">MI CUENTA · ${propietario?'PERFIL PERSONAL':'FICHA PROFESIONAL'}</span><h2>${edit?'Actualiza tu perfil.':'Mi perfil'}</h2></div><button class="btn btn-outline" data-close aria-label="Cerrar perfil">✕</button></div><div class="profile-identity"><div class="profile-photo">${p.foto_perfil?`<img src="${esc(p.foto_perfil)}" alt="Tu fotografía">`:esc((p.nombre_completo||p.nombre_usuario)[0])}</div><div><h3>${esc(p.nombre_completo)}</h3><span>${esc(p.rol_nombre)}</span><small>@${esc(p.nombre_usuario)} · ${esc(p.profesion||'Profesión por completar')}</small></div></div><div class="profile-body">${edit?editForm(p):viewProfile(p,age)}</div>`;
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  if(!edit){dialog.querySelector('[data-edit]').onclick=()=>render(true);return;}
  bindForm();
 }
 function editForm(p){
  const cvSection=p.cv_habilitado?`<section class="profile-section cv-section"><div class="profile-section-title"><b>Currículum vitae</b><span>Disponible para personal administrativo, militar y autoridades.</span></div>
   <div class="cv-controls"><label class="btn btn-outline">Seleccionar PDF<input type="file" id="cvFile" accept="application/pdf"></label>${p.cv_disponible?'<a class="btn btn-outline" href="/api/perfil/cv" target="_blank" rel="noopener">Ver CV actual ↗</a><button type="button" class="btn" id="removeCv">Quitar CV</button>':''}<small id="cvState">${p.cv_disponible?'CV actual: '+esc(p.cv_nombre||'curriculum.pdf'):'PDF · Hasta 5 MB · Opcional'}</small></div>
  </section>`:'';
  return `<form id="profileForm">
  <section class="profile-section"><div class="profile-section-title"><b>Identidad y contacto</b><span>Datos personales para tu ficha institucional.</span></div>
   <div class="photo-controls"><label class="btn btn-outline">Cambiar fotografía<input type="file" id="photoFile" accept="image/jpeg,image/png,image/webp"></label><button type="button" class="btn" id="removePhoto">Quitar foto</button><small>JPG, PNG o WebP · Hasta 2 MB.</small></div>
   <div class="form-grid profile-form-grid">
    <label class="field form-wide">Nombre completo<input name="nombreCompleto" required minlength="3" maxlength="170" autocomplete="name" value="${esc(p.nombre_completo===p.nombre_usuario?'':p.nombre_completo)}"></label>
    <label class="field">Correo institucional<input name="correo" type="email" maxlength="170" value="${esc(p.correo||'')}"></label>
    <label class="field">Correo personal<input name="correoPersonal" required type="email" maxlength="170" autocomplete="email" value="${esc(p.correo_personal||'')}"></label>
    <label class="field">Celular<input name="celular" required type="tel" maxlength="30" autocomplete="tel" value="${esc(p.celular||p.telefono||'')}"></label>
    <label class="field">Teléfono alternativo<input name="telefono" type="tel" maxlength="30" value="${esc(p.telefono||'')}"></label>
    <label class="field form-wide">Domicilio / lugar donde vive<input name="direccion" required maxlength="220" autocomplete="street-address" value="${esc(p.direccion_residencia||'')}"></label>
    <label class="field">Fecha de nacimiento<input name="fechaNacimiento" required type="date" value="${p.fecha_nacimiento?esc(String(p.fecha_nacimiento).slice(0,10)):''}"></label>
    <label class="field">Número de referencia / emergencia<input name="numeroReferencia" required type="tel" maxlength="30" value="${esc(p.numero_referencia||'')}"></label>
   </div></section>
  <section class="profile-section"><div class="profile-section-title"><b>Información profesional</b><span>Formación y ubicación institucional.</span></div>
   <div class="form-grid profile-form-grid">
    <label class="field">Área / unidad institucional<input name="area" required maxlength="120" value="${esc(p.area_institucional||'')}"></label>
    <label class="field">Profesión<input name="profesion" required maxlength="120" value="${esc(p.profesion||'')}"></label>
    <label class="field form-wide">Grado académico / especialidad<input name="gradoEspecialidad" required maxlength="160" value="${esc(p.grado_especialidad||'')}"></label>
   </div></section>
  ${cvSection}
  <p class="muted profile-managed-note">Tu usuario, rol, estado y zona asignada son administrados por la institución.</p><p id="profileError" class="error" role="alert" hidden></p><div class="profile-buttons"><button type="button" class="btn btn-outline" data-cancel>Cancelar</button><button type="submit" class="btn btn-navy">Guardar mi perfil →</button></div></form>`;
 }
 function viewProfile(p,age){
  const items=[['Correo institucional',p.correo],['Correo personal',p.correo_personal],['Celular',p.celular],['Teléfono alternativo',p.telefono],['Domicilio',p.direccion_residencia],['Fecha de nacimiento',p.fecha_nacimiento?new Date(String(p.fecha_nacimiento).slice(0,10)+'T00:00:00Z').toLocaleDateString('es-BO',{timeZone:'UTC'}):null],['Edad',age!=null?age+' años':null],['Número de referencia',p.numero_referencia],['Profesión',p.profesion],['Grado / especialidad',p.grado_especialidad],['Área / unidad',p.area_institucional],['Zona asignada',p.zona_nombre],['Estado del perfil',p.perfil_completado_en?'Completo':'Pendiente']];
  return `<dl class="profile-data profile-data-pro">${items.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v||'Sin registrar')}</dd></div>`).join('')}</dl><div class="profile-view-actions">${p.cv_habilitado&&p.cv_disponible?'<a class="btn btn-outline" href="/api/perfil/cv" target="_blank" rel="noopener">Abrir currículum PDF ↗</a>':''}<button class="btn btn-navy" data-edit>Editar mi perfil →</button></div>`;
 }
 const read=file=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});
 function bindForm(){
  let photo,cv,cvNombre,loading=false;
  const form=dialog.querySelector('form'),err=dialog.querySelector('#profileError'),save=dialog.querySelector('[type=submit]');
  const error=m=>{err.hidden=false;err.textContent=m;};
  dialog.querySelector('[data-cancel]').onclick=()=>render(false);
  dialog.querySelector('#photoFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>2*1024*1024){error('Selecciona una imagen JPG, PNG o WebP de hasta 2 MB.');return;}loading=true;save.disabled=true;try{photo=await read(file);const box=dialog.querySelector('.profile-photo');box.innerHTML=`<img src="${photo}" alt="Vista previa">`;err.hidden=true;}finally{loading=false;save.disabled=false;}};
  dialog.querySelector('#removePhoto').onclick=()=>{photo=null;dialog.querySelector('.profile-photo').textContent=(profile.nombre_completo||profile.nombre_usuario)[0];};
  const cvFile=dialog.querySelector('#cvFile');
  if(cvFile)cvFile.onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.type!=='application/pdf'||file.size>5*1024*1024){error('Selecciona un PDF de hasta 5 MB.');e.target.value='';return;}loading=true;save.disabled=true;try{cv=await read(file);cvNombre=file.name;dialog.querySelector('#cvState').textContent='Nuevo CV: '+file.name;err.hidden=true;}finally{loading=false;save.disabled=false;}};
  dialog.querySelector('#removeCv')?.addEventListener('click',()=>{cv=null;cvNombre='';dialog.querySelector('#cvState').textContent='El currículum será eliminado al guardar.';});
  form.onsubmit=async e=>{e.preventDefault();if(loading)return;save.disabled=true;save.textContent='Guardando…';err.hidden=true;const body=Object.fromEntries(new FormData(form));if(photo!==undefined)body.foto=photo;if(cv!==undefined){body.cv=cv;body.cvNombre=cvNombre;}try{profile=await api('/perfil',{method:'PATCH',body});paint();render(false);aviso('Tu perfil se actualizó correctamente.');}catch(ex){error(ex.message);save.disabled=false;save.textContent='Guardar mi perfil →';}};
 }
 document.getElementById('avatar').title='Ver mi perfil';
 document.getElementById('avatar').onclick=e=>{e.stopPropagation();open(false);};
 document.getElementById('viewProfile').onclick=()=>open(false);
 document.getElementById('editProfile').onclick=()=>open(true);
 try{profile=await api('/perfil');paint();}catch{reminder.hidden=false;reminder.innerHTML='<p>No se pudo consultar tu perfil.</p><button class="btn btn-outline">Reintentar</button>';reminder.querySelector('button').onclick=()=>open();}
}
