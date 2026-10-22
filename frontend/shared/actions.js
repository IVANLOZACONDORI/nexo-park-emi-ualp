export const escapeHTML = x => String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function actionArt(kind='grid'){
 const paths={people:'M28 51a14 14 0 1 0 0-28 14 14 0 0 0 0 28M9 78V67c0-9 38-9 38 0v11M58 33h23m-11-11v23',shield:'M45 13 16 26v23c0 19 29 30 29 30s29-11 29-30V26ZM30 46l11 11 21-24',chart:'M16 17v59h63M30 61V43m18 18V29m18 32V17',car:'M17 60V36l10-16h36l10 16v24ZM17 38h56M25 60v13m40-13v13M28 48h3m28 0h3',grid:'M15 15h25v25H15ZM53 15h25v25H53ZM15 53h25v25H15ZM53 53h25v25H53Z',flow:'M13 29h62M60 14l15 15-15 15M77 65H15m15-15L15 65l15 15',bell:'M65 35a20 20 0 0 0-40 0c0 23-9 23-9 30h58c0-7-9-7-9-30M37 78h16'};
 return `<svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="45" fill="currentColor" opacity=".06"/><path d="${paths[kind]||paths.grid}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
export function renderActionCards(c,{title,description,actions}){
 c.innerHTML=`<section class="action-hub"><div class="hub-heading"><span class="section-kicker">ESPACIO DE TRABAJO</span><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description||'Selecciona una acción para comenzar.')}</p></div><div class="action-grid">${actions.map((a,i)=>`<button type="button" class="action-card" data-action="${i}"><span class="action-art">${actionArt(a.icon)}</span><span class="action-count">${String(i+1).padStart(2,'0')}</span><strong>${escapeHTML(a.title)}</strong><span class="action-description">${escapeHTML(a.description)}</span><span class="action-go">Abrir herramienta <b aria-hidden="true">↗</b></span></button>`).join('')}</div></section>`;
 c.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>actions[Number(b.dataset.action)].run());
}
export function actionDetail(c,title,back){
 c.innerHTML=`<div class="action-detail-head"><button type="button" class="btn btn-outline" data-back>← Todas las acciones</button><span>${escapeHTML(title)}</span></div><div class="action-workspace"></div>`;
 c.querySelector('[data-back]').onclick=back;
 const host=c.querySelector('.action-workspace');host.dataset.moduloActivo=c.dataset.moduloActivo;
 return host;
}
