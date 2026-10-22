import {api,aviso,tienePermiso,fecha} from '../../js/api.js?v=364';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cats=['MILITAR','CIVIL','ADMINISTRATIVO','ESTUDIANTE','VISITANTE','PROVEEDOR','INSTITUCIONAL'];
const tipos=['AUTOMOVIL','CAMIONETA','MOTOCICLETA','CAMION','MINIBUS','OTRO'];
const opciones=(list,value)=>list.map(v=>`<option value="${v}" ${v===value?'selected':''}>${v}</option>`).join('');

export async function renderVehiculos(c){
 const gestionar=tienePermiso('vehiculos.gestionar');
 const estado={q:'',categoria:'',filtro:''};
 let lista=[],propietarios=[];
 const arriba=()=>window.scrollTo({top:0,behavior:'smooth'});

 try{propietarios=await api('/vehiculos/propietarios/opciones')}catch(e){aviso(e.message)}

 async function cargarDatos(){
  lista=await api('/vehiculos?'+new URLSearchParams({q:estado.q,categoria:estado.categoria,estado:estado.filtro}));
 }

 function renderLista(){
  c.innerHTML=`
   <section class="module-dashboard-view">
    <header class="page-head module-dashboard-head">
     <div>
      <span class="module-kicker">OPERACIÓN</span>
      <h1>Vehículos y autorizaciones</h1>
      <p>Control institucional de vehículos registrados y permisos de circulación.</p>
     </div>
     ${gestionar?'<button class="btn primary module-primary-action" id="nuevoVeh">+ Registrar vehículo</button>':''}
    </header>
    <section class="card panel module-list-card">
     <h2>Consulta de vehículos</h2>
     <div class="module-toolbar vehicle-toolbar">
      <input id="busquedaVeh" value="${esc(estado.q)}" placeholder="Buscar por placa" aria-label="Buscar por placa">
      <select id="categoriaVeh" aria-label="Categoría"><option value="">Todas las categorías</option>${opciones(cats,estado.categoria)}</select>
      <select id="estadoVeh" aria-label="Estado"><option value="">Todos los estados</option>${opciones(['ACTIVO','SUSPENDIDO','RETIRADO'],estado.filtro)}</select>
      <button class="btn" id="filtrarVeh">Buscar</button>
     </div>
     <div id="listaVeh"></div>
    </section>
   </section>`;
  dibujarTabla();
  c.querySelector('#filtrarVeh').onclick=async()=>{
   estado.q=c.querySelector('#busquedaVeh').value.trim();
   estado.categoria=c.querySelector('#categoriaVeh').value;
   estado.filtro=c.querySelector('#estadoVeh').value;
   try{await cargarDatos();dibujarTabla()}catch(e){aviso(e.message)}
  };
  c.querySelector('#busquedaVeh').onkeydown=e=>{if(e.key==='Enter')c.querySelector('#filtrarVeh').click()};
  if(gestionar)c.querySelector('#nuevoVeh').onclick=()=>renderEditor(null);
  arriba();
 }

 function dibujarTabla(){
  const host=c.querySelector('#listaVeh');
  if(!host)return;
  host.innerHTML=`<div class="table-wrap"><table><thead><tr><th>Placa</th><th>Tipo</th><th>Titular</th><th>Referencia</th><th>Categoría</th><th>Estado</th><th>Autorización</th><th>Acciones</th></tr></thead><tbody>${lista.map(v=>`<tr><td><strong>${esc(v.placa)}</strong></td><td>${esc(v.tipo_vehiculo)}</td><td>${esc(v.propietario_nombre||'-')}</td><td>${esc(v.referencia_propietario||'-')}</td><td>${esc(v.categoria_usuario)}</td><td><span class="status-pill ${String(v.estado).toLowerCase()}">${esc(v.estado)}</span></td><td>${esc(v.autorizacion_vigencia)}</td><td><div class="row-actions"><button class="btn historyVeh" data-id="${v.id}">Autorizaciones</button>${gestionar?`<button class="btn editVeh" data-id="${v.id}">Editar</button><button class="btn primary authVeh" data-id="${v.id}">Autorizar</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>${!lista.length?'<p class="empty">No se encontraron vehículos.</p>':''}`;
  host.querySelectorAll('.historyVeh').forEach(b=>b.onclick=()=>renderHistorial(b.dataset.id));
  host.querySelectorAll('.editVeh').forEach(b=>b.onclick=()=>renderEditor(lista.find(x=>x.id===b.dataset.id)));
  host.querySelectorAll('.authVeh').forEach(b=>b.onclick=()=>renderAutorizacion(lista.find(x=>x.id===b.dataset.id)));
 }

 function subviewHead(kicker,title,description){
  return `<header class="subview-head"><button class="subview-back" type="button" id="vehicle-back">← <span>Volver a vehículos</span></button><div><span class="module-kicker">${kicker}</span><h1>${title}</h1><p>${description}</p></div></header>`;
 }
 function bindBack(){c.querySelector('#vehicle-back').onclick=()=>renderLista();}

 function renderEditor(v){
  const title=v?'Editar vehículo':'Registrar vehículo';
  c.innerHTML=`<section class="module-subview">${subviewHead('REGISTRO DE VEHÍCULOS',title,v?'Actualiza la información del vehículo y guarda los cambios.':'Registra el vehículo y vincúlalo con una cuenta institucional activa.')}
   <section class="card panel module-form-card">
    <form id="formVeh">
     <div class="module-form-grid vehicle-form-grid">
      <label>Placa<input name="placa" required maxlength="20" value="${esc(v?.placa||'')}"></label>
      <label>Tipo<select name="tipoVehiculo">${opciones(tipos,v?.tipo_vehiculo||'AUTOMOVIL')}</select></label>
      <label>Marca<input name="marca" maxlength="80" value="${esc(v?.marca||'')}"></label>
      <label>Modelo<input name="modelo" maxlength="80" value="${esc(v?.modelo||'')}"></label>
      <label>Color<input name="color" maxlength="60" value="${esc(v?.color||'')}"></label>
      <label>Referencia del titular<input name="referenciaPropietario" maxlength="170" value="${esc(v?.referencia_propietario||'')}"></label>
      <label class="form-wide">Titular con cuenta registrada<select name="propietarioUsuarioId" required><option value="">Seleccione una cuenta</option>${propietarios.map(u=>`<option value="${u.id}" ${v?.propietario_usuario_id===u.id?'selected':''}>${esc(u.nombre_completo)} (${esc(u.nombre_usuario)}) · ${esc(u.rol_nombre||'Cuenta institucional')}</option>`).join('')}</select></label>
      <label>Foto del vehículo ${v?'':'(obligatoria)'}<input type="file" name="fotoVehiculo" accept="image/jpeg,image/png,image/webp" ${v?'':'required'}></label>
      <label>Foto legible de placa ${v?'':'(obligatoria)'}<input type="file" name="fotoPlaca" accept="image/jpeg,image/png,image/webp" ${v?'':'required'}></label>
      <label>Categoría<select name="categoriaUsuario">${opciones(cats,v?.categoria_usuario||'INSTITUCIONAL')}</select></label>
      <label>Estado<select name="estado">${opciones(['ACTIVO','SUSPENDIDO','RETIRADO'],v?.estado||'ACTIVO')}</select></label>
     </div>
     <div class="module-form-actions"><button class="btn primary" type="submit">Guardar vehículo</button><button class="btn" id="vehicle-cancel" type="button">Cancelar</button></div>
    </form>
   </section>
  </section>`;
  bindBack();
  c.querySelector('#vehicle-cancel').onclick=()=>renderLista();
  c.querySelector('#formVeh').onsubmit=async ev=>{
   ev.preventDefault();
   const submit=ev.currentTarget.querySelector('[type=submit]');submit.disabled=true;
   const body=Object.fromEntries(new FormData(ev.currentTarget));
   try{
    for(const field of ['fotoVehiculo','fotoPlaca']){
     const file=body[field];
     if(file instanceof File&&file.size){
      if(file.size>1300000||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Formato o tamaño de imagen inválido. Máximo 1,3 MB.');
      body[field]=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(file)});
     }else delete body[field];
    }
    await api(v?'/vehiculos/'+v.id:'/vehiculos',{method:v?'PATCH':'POST',body});
    aviso(v?'Vehículo actualizado.':'Vehículo registrado.');
    await cargarDatos();
    renderLista();
   }catch(e){aviso(e.message);submit.disabled=false;}
  };
  arriba();
 }

 function renderAutorizacion(v){
  c.innerHTML=`<section class="module-subview">${subviewHead('AUTORIZACIONES',`Nueva autorización · ${esc(v.placa)}`,'Define la vigencia y el motivo de la autorización para este vehículo.')}
   <section class="card panel module-form-card compact-form-card">
    <form id="formAuto">
     <div class="module-form-grid">
      <label>Tipo<select name="tipoAutorizacion">${opciones(['PERMANENTE','TEMPORAL','EXCEPCIONAL'],'TEMPORAL')}</select></label>
      <label>Válida desde<input type="datetime-local" name="validoDesde" required></label>
      <label>Válida hasta<input type="datetime-local" name="validoHasta"></label>
      <label class="form-wide">Motivo<input name="motivo" maxlength="1000" placeholder="Motivo o referencia institucional"></label>
     </div>
     <div class="module-form-actions"><button class="btn primary" type="submit">Registrar autorización</button><button class="btn" id="vehicle-cancel" type="button">Cancelar</button></div>
    </form>
   </section>
  </section>`;
  bindBack();
  c.querySelector('#vehicle-cancel').onclick=()=>renderLista();
  c.querySelector('[name=validoDesde]').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16);
  c.querySelector('#formAuto').onsubmit=async ev=>{
   ev.preventDefault();const submit=ev.currentTarget.querySelector('[type=submit]');submit.disabled=true;
   const body=Object.fromEntries(new FormData(ev.currentTarget));
   try{
    await api(`/vehiculos/${v.id}/autorizaciones`,{method:'POST',body:{...body,validoDesde:new Date(body.validoDesde).toISOString(),validoHasta:body.validoHasta?new Date(body.validoHasta).toISOString():null}});
    aviso('Autorización registrada.');await cargarDatos();renderLista();
   }catch(e){aviso(e.message);submit.disabled=false;}
  };
  arriba();
 }

 async function renderHistorial(id){
  try{
   const v=lista.find(x=>x.id===id),items=await api(`/vehiculos/${id}/autorizaciones`);
   c.innerHTML=`<section class="module-subview">${subviewHead('AUTORIZACIONES',`Historial · ${esc(v?.placa||'Vehículo')}`,'Consulta la vigencia de autorizaciones y realiza acciones permitidas.')}
    <section class="card panel module-list-card">
     <div class="table-wrap"><table><thead><tr><th>Tipo</th><th>Desde</th><th>Hasta</th><th>Estado</th><th>Motivo</th><th>Acciones</th></tr></thead><tbody>${items.map(a=>`<tr><td>${esc(a.tipo_autorizacion)}</td><td>${esc(fecha(a.valido_desde))}</td><td>${a.valido_hasta?esc(fecha(a.valido_hasta)):'Sin vencimiento'}</td><td>${esc(a.vigencia)}</td><td>${esc(a.motivo||'-')}</td><td>${gestionar&&a.estado==='ACTIVA'?`<div class="row-actions"><button class="btn susp" data-id="${a.id}">Suspender</button><button class="btn rev" data-id="${a.id}">Revocar</button></div>`:'-'}</td></tr>`).join('')}</tbody></table></div>
     ${!items.length?'<p class="empty">No hay autorizaciones registradas.</p>':''}
    </section>
   </section>`;
   bindBack();
   for(const [selector,value] of [['.susp','SUSPENDIDA'],['.rev','REVOCADA']])c.querySelectorAll(selector).forEach(b=>b.onclick=async()=>{
    const motivo=prompt('Indique el motivo de la modificación:');if(!motivo?.trim())return;
    try{await api(`/vehiculos/${id}/autorizaciones/${b.dataset.id}`,{method:'PATCH',body:{estado:value,motivo}});aviso('Autorización actualizada.');await cargarDatos();await renderHistorial(id)}catch(e){aviso(e.message)}
   });
   arriba();
  }catch(e){aviso(e.message)}
 }

 try{await cargarDatos();renderLista()}catch(e){c.innerHTML=`<section class="card panel module-error"><h2>No se pudo cargar vehículos</h2><p>${esc(e.message)}</p></section>`}
}
