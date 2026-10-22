import {api,aviso,tienePermiso} from '../../js/api.js?v=364';
const e=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

export async function renderPropietarios(c){
 const gestionar=tienePermiso('propietarios.gestionar');
 let items=[],zonas=[],busqueda='';

 const arriba=()=>window.scrollTo({top:0,behavior:'smooth'});

 async function refreshData(){
  [items,zonas]=await Promise.all([api('/propietarios'),api('/propietarios/zonas')]);
 }

 function renderLista(){
  c.innerHTML=`
   <section class="module-dashboard-view">
    <header class="page-head module-dashboard-head">
     <div>
      <span class="module-kicker">GESTIÓN INSTITUCIONAL</span>
      <h1>Registro de propietarios</h1>
      <p>Consulta y administra estudiantes o docentes vinculados al servicio de parqueos.</p>
     </div>
     ${gestionar?'<button type="button" class="btn primary module-primary-action" id="new-owner">+ Registrar propietario</button>':''}
    </header>
    <section class="card panel module-list-card">
     <div class="owner-toolbar module-toolbar">
      <input id="owner-search" value="${e(busqueda)}" placeholder="Buscar por nombre o usuario" aria-label="Buscar propietario">
      <span>Estudiantes y docentes</span>
     </div>
     <div id="owners-list"></div>
    </section>
   </section>`;

  const list=c.querySelector('#owners-list');
  const input=c.querySelector('#owner-search');
  const draw=()=>{
   busqueda=input.value.trim();
   const q=busqueda.toLowerCase();
   const data=items.filter(x=>(x.nombre_completo+' '+x.nombre_usuario).toLowerCase().includes(q));
   list.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Propietario</th><th>Tipo</th><th>Usuario</th><th>Zona</th><th>Vehículos</th><th>Estado</th>${gestionar?'<th>Acción</th>':''}</tr></thead><tbody>${data.map(x=>`<tr><td><strong>${e(x.nombre_completo)}</strong></td><td>${e(x.tipo_propietario)}</td><td>${e(x.nombre_usuario)}</td><td>${e(x.zona_nombre||'Sin asignación')}</td><td>${Number(x.vehiculos)||0}</td><td><span class="status-pill ${String(x.estado).toLowerCase()}">${e(x.estado)}</span></td>${gestionar?`<td><button class="btn edit-owner" data-id="${e(x.id)}">Editar</button></td>`:''}</tr>`).join('')||`<tr><td colspan="${gestionar?7:6}">No existen propietarios para la búsqueda.</td></tr>`}</tbody></table></div>`;
   list.querySelectorAll('.edit-owner').forEach(b=>b.onclick=()=>renderEditor(items.find(x=>x.id===b.dataset.id)));
  };
  input.oninput=draw;
  if(gestionar)c.querySelector('#new-owner').onclick=()=>renderEditor(null);
  draw();
  arriba();
 }

 function renderEditor(x){
  const title=x?'Modificar propietario':'Registrar nuevo propietario';
  c.innerHTML=`
   <section class="module-subview" aria-label="${e(title)}">
    <header class="subview-head">
     <button class="subview-back" type="button" id="owner-back" aria-label="Volver al listado de propietarios">← <span>Volver a propietarios</span></button>
     <div>
      <span class="module-kicker">REGISTRO DE PROPIETARIOS</span>
      <h1>${e(title)}</h1>
      <p>${x?'Actualiza únicamente los datos necesarios y guarda los cambios.':'Crea la cuenta inicial. El usuario podrá completar su perfil personal posteriormente.'}</p>
     </div>
    </header>
    <section class="card panel module-form-card owner-form">
     <form id="owner-form">
      <div class="owner-fields module-form-grid">
       <label>Nombre completo<input name="nombreCompleto" value="${e(x?.nombre_completo||'')}" required maxlength="170"></label>
       ${x?'':`<label>Usuario institucional<input name="nombreUsuario" required minlength="3" maxlength="60" autocomplete="off"></label><label>Contraseña inicial<input name="contrasena" type="password" required minlength="10" autocomplete="new-password"></label>`}
       <label>Correo<input name="correo" type="email" value="${e(x?.correo||'')}"></label>
       <label>Tipo<select name="tipo"><option value="ESTUDIANTE" ${x?.tipo_propietario==='ESTUDIANTE'?'selected':''}>Estudiante</option><option value="DOCENTE" ${x?.tipo_propietario==='DOCENTE'?'selected':''}>Docente</option></select></label>
       <label>Zona asignada<select name="zonaId" required>${zonas.map(z=>`<option value="${e(z.id)}" ${z.codigo===x?.zona_codigo?'selected':''}>${e(z.nombre)}</option>`).join('')}</select></label>
       ${x?`<label>Estado<select name="estado"><option ${x.estado==='ACTIVO'?'selected':''}>ACTIVO</option><option ${x.estado==='DESHABILITADO'?'selected':''}>DESHABILITADO</option></select></label>`:''}
      </div>
      <div class="module-form-actions">
       <button class="btn primary" type="submit">${x?'Guardar cambios':'Registrar propietario'}</button>
       <button class="btn" id="owner-cancel" type="button">Cancelar</button>
      </div>
     </form>
    </section>
   </section>`;

  const volver=()=>renderLista();
  c.querySelector('#owner-back').onclick=volver;
  c.querySelector('#owner-cancel').onclick=volver;
  c.querySelector('#owner-form').onsubmit=async ev=>{
   ev.preventDefault();
   const btn=ev.currentTarget.querySelector('[type=submit]');
   btn.disabled=true;
   const body=Object.fromEntries(new FormData(ev.currentTarget));
   try{
    await api(x?'/propietarios/'+x.id:'/propietarios',{method:x?'PATCH':'POST',body});
    aviso(x?'Propietario actualizado correctamente.':'Propietario registrado correctamente.');
    await refreshData();
    renderLista();
   }catch(ex){aviso(ex.message);btn.disabled=false;}
  };
  arriba();
 }

 try{
  await refreshData();
  renderLista();
 }catch(ex){
  c.innerHTML=`<section class="card panel module-error"><h2>No se pudo cargar propietarios</h2><p>${e(ex.message)}</p></section>`;
 }
}
