import {api,fecha} from '../../js/api.js?v=362';

let timer=null;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const humanType=t=>({AUTOMOVIL:'Automóvil',CAMIONETA:'Camioneta',MOTOCICLETA:'Motocicleta',CAMION:'Camión',MINIBUS:'Minibús',OTRO:'Vehículo'}[t]||t||'Vehículo');
const plazaType=t=>({ESTANDAR:'Auto',MOTOCICLETA:'Moto',OFICIAL:'Oficial',VISITANTE:'Visitante',ACCESIBLE:'Accesible'}[t]||t);

function stop(){if(timer){clearInterval(timer);timer=null;}}

function historyRows(items){
 if(!items?.length)return '<div class="mobility-empty">Todavía no hay ingresos o salidas registrados para tus vehículos.</div>';
 return `<div class="mobility-history">${items.map(e=>`<article class="mobility-history-item"><div class="mobility-history-mark ${String(e.tipo_evento||'').toLowerCase()}">${e.tipo_evento==='INGRESO'?'↘':'↗'}</div><div><strong>${esc(e.tipo_evento||'Movimiento')} · ${esc(e.placa_detectada||e.placa||'')}</strong><span>${esc(fecha(e.fecha_hora))} · ${esc(e.punto_acceso||'Punto de acceso')}</span></div><span class="mobility-result ${String(e.resultado_validacion||'').toLowerCase()}">${esc(e.resultado_validacion||'—')}</span></article>`).join('')}</div>`;
}

function freePlaces(items){
 if(!items?.length)return '<div class="mobility-no-space"><strong>NO HAY ESPACIOS DISPONIBLES</strong><span>En este momento no existe una plaza compatible libre. La pantalla se actualizará automáticamente.</span></div>';
 const byZone=new Map();
 for(const p of items){if(!byZone.has(p.zona))byZone.set(p.zona,[]);byZone.get(p.zona).push(p)}
 return [...byZone.entries()].map(([zona,plazas])=>`<section class="mobility-zone"><header><div><span>Zona</span><h3>${esc(zona)}</h3></div><b>${plazas.length} libre${plazas.length===1?'':'s'}</b></header><div class="mobility-slot-grid">${plazas.map(p=>`<article class="mobility-slot"><span class="mobility-slot-type">${esc(plazaType(p.tipo))}</span><strong>${esc(p.codigo)}</strong><small>${esc(p.ubicacion||'Campus EMI UALP')}</small></article>`).join('')}</div></section>`).join('');
}

function vehicleCards(items){
 return `<div class="mobility-vehicles">${items.map(v=>`<article><span class="mobility-vehicle-icon">${v.tipo_vehiculo==='MOTOCICLETA'?'◉':'▰'}</span><div><strong>${esc(v.placa)}</strong><span>${esc(humanType(v.tipo_vehiculo))}${v.marca?' · '+esc(v.marca):''}${v.modelo?' '+esc(v.modelo):''}</span></div><em>${esc(v.autorizacion_vigencia||'SIN AUTORIZACIÓN')}</em></article>`).join('')}</div>`;
}

function render(c,d){
 if(!d.tieneVehiculo){
  c.innerHTML=`<section class="mobility-page"><div class="mobility-hero compact"><span class="mobility-kicker">TU MOVILIDAD</span><h1>Aún no tienes un vehículo activo vinculado</h1><p>Cuando la institución registre tu auto o moto en tu cuenta, aquí verás espacios libres en tiempo real y tu historial personal de ingresos y salidas.</p></div></section>`;
  return;
 }
 const r=d.resumen||{};
 c.innerHTML=`<section class="mobility-page">
  <header class="mobility-hero ${r.libres>0?'has-space':'full'}">
   <div><span class="mobility-kicker">NEXO PARK · TU MOVILIDAD</span><h1>${r.libres>0?'Hay espacio para estacionar':'Parqueos completos por ahora'}</h1><p>${esc(d.mensaje)}</p><div class="mobility-live">● En vivo · ${esc(fecha(d.actualizadoEn))}</div></div>
   <div class="mobility-big-number"><strong>${Number(r.libres||0)}</strong><span>espacios libres</span></div>
  </header>
  <section class="mobility-summary" aria-label="Resumen de disponibilidad">
   <article><strong>${Number(r.totalCompatibles||0)}</strong><span>Compatibles</span></article>
   <article class="ok"><strong>${Number(r.libres||0)}</strong><span>Libres</span></article>
   <article><strong>${Number(r.ocupadas||0)}</strong><span>Ocupadas</span></article>
   <article><strong>${Number(r.fueraServicio||0)}</strong><span>Fuera de servicio</span></article>
  </section>
  <section class="mobility-card"><div class="mobility-section-title"><div><span>TUS VEHÍCULOS</span><h2>Cuenta vinculada</h2></div><small>Solo se muestran vehículos asociados a tu usuario.</small></div>${vehicleCards(d.vehiculos)}</section>
  <section class="mobility-card"><div class="mobility-section-title"><div><span>DISPONIBILIDAD AHORA</span><h2>Lugares donde puedes estacionar</h2></div><small>Se muestran únicamente plazas compatibles con tu auto o moto.</small></div>${freePlaces(d.plazasLibres)}</section>
  <section class="mobility-card"><div class="mobility-section-title"><div><span>HISTORIAL PERSONAL</span><h2>Mis ingresos y salidas</h2></div><small>Últimos 100 movimientos de tus vehículos.</small></div>${historyRows(d.historial)}</section>
 </section>`;
}

export async function renderMiMovilidad(c,{autoRefresh=true}={}){
 stop();
 let busy=false,active=true;
 c.innerHTML='<div class="mobility-loading"><i></i><strong>Consultando disponibilidad y tus movimientos…</strong></div>';
 const load=async()=>{
  if(!active||busy||document.hidden)return;
  if(!c.isConnected){active=false;stop();return;}
  busy=true;
  try{const d=await api('/movil/mi-movilidad');if(active&&c.isConnected)render(c,d)}
  catch(e){if(active&&c.isConnected)c.innerHTML=`<div class="mobility-error"><h2>No se pudo confirmar la disponibilidad</h2><p>${esc(e.message||'Intente nuevamente.')}</p></div>`}
  finally{busy=false}
 };
 await load();
 if(autoRefresh){timer=setInterval(load,5000);const onVisibility=()=>{if(!document.hidden)load()};document.addEventListener('visibilitychange',onVisibility);const originalStop=stop;return()=>{active=false;clearInterval(timer);timer=null;document.removeEventListener('visibilitychange',onVisibility)}}
 return()=>{active=false};
}
