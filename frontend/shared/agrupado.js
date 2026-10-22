import {tienePermiso} from '../js/api.js?v=36';
import {renderActionCards,actionDetail} from './actions.js?v=36';
export async function renderAgrupado(c,secciones){
 const validas=secciones.filter(s=>tienePermiso(s.perm));
 if(!validas.length){c.textContent='No tiene permisos de consulta.';return;}
 function home(){renderActionCards(c,{title:'¿Qué deseas hacer?',description:'Elige una herramienta. Cada acción tiene su propio espacio de trabajo.',actions:validas.map((s,i)=>({title:s.nombre,description:descriptions[s.nombre]||'Consulta y administra la información de esta función.',icon:({'Auditoría':'shield','Respaldo y continuidad':'chart','Ingresos y salidas':'flow','Historial y trazabilidad':'chart','Panel de supervisión':'chart','Parqueos y plazas':'grid','Visión artificial':'car'}[s.nombre]||'grid'),run:()=>open(s)}))});}
 async function open(s){const host=actionDetail(c,s.nombre,home);host.innerHTML='<div class="skeleton" role="status" aria-label="Cargando herramienta"><i></i><i></i></div>';try{await s.render(host)}catch(e){host.replaceChildren();const p=document.createElement('p');p.className='error';p.textContent=e.message;host.append(p);}}
 home();
}
const descriptions={'Panel de supervisión':'Visualiza indicadores y disponibilidad por zona del campus.','Parqueos y plazas':'Organiza zonas, espacios y clasificación de parqueos.','Visión artificial':'Revisa el seguimiento de ocupación y los eventos registrados.','Ingresos y salidas':'Registra y consulta el movimiento vehicular.','Historial y trazabilidad':'Encuentra movimientos anteriores y su detalle.','Auditoría':'Consulta las acciones registradas por el sistema.','Respaldo y continuidad':'Gestiona las solicitudes y evidencias de respaldo.'};
