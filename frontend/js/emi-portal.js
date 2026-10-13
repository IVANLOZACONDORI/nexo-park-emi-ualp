const menu=document.getElementById('navPrincipal');
const toggle=document.getElementById('navToggle');
toggle?.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'✕ Cerrar':'☰ Menú'});
const groups=[...document.querySelectorAll('.dropdown')];
groups.forEach(group=>group.addEventListener('toggle',()=>{if(group.open)groups.filter(other=>other!==group).forEach(other=>other.open=false)}));
document.addEventListener('click',event=>{if(!menu?.contains(event.target))groups.forEach(group=>group.open=false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){groups.forEach(group=>group.open=false);if(menu?.classList.contains('open')){menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰ Menú';toggle.focus()}}});
const slides=[...document.querySelectorAll('.slide')];const dots=[...document.querySelectorAll('[data-slide]')];let current=0;
function show(index){if(!slides.length)return;current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.hidden=i!==current;slide.classList.toggle('active',i===current)});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===current)));document.getElementById('slideStatus').textContent=String(current+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0')}
dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.slide))));document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>show(current+Number(button.dataset.step))));
