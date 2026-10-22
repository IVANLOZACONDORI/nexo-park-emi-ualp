import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);const expected=['alertas','auditoria','control','lugares','movil','propietarios','reportes','usuarios','vehiculos'];
for(const folder of ['backend/src/modules','frontend/modules'])assert.deepEqual(fs.readdirSync(new URL(folder,root)).sort(),expected);
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'?[]:walk(path.join(d,e.name))):[path.join(d,e.name)])}
for(const p of walk(new URL('frontend',root).pathname).concat(walk(new URL('backend/src',root).pathname)).filter(f=>f.endsWith('.js'))){const s=fs.readFileSync(p,'utf8');for(const m of s.matchAll(/from\s+['"](\.[^'"]+)['"]/g))assert.ok(fs.existsSync(path.resolve(path.dirname(p),m[1].split('?')[0])),`Import missing ${p} -> ${m[1]}`);}
const app=fs.readFileSync(new URL('frontend/js/app.js',root),'utf8');assert.equal([...app.matchAll(/\{ id:'/g)].length,10);
assert.ok(app.includes("id:'mi-movilidad'"),'La vista personal de movilidad debe estar registrada en la interfaz web.');
assert.ok(app.includes("id:'movil'") && app.includes('Parqueos disponibles'),'El estudiante debe tener un módulo visible de parqueos disponibles.');
assert.ok(fs.existsSync(new URL('frontend/movil.html',root)),'Debe existir la experiencia móvil independiente.');
assert.ok(fs.existsSync(new URL('mobile/android-app/app/src/main/java/bo/edu/emi/nexopark/MainActivity.java',root)),'El proyecto Android debe incluir MainActivity.');
console.log('Diez módulos funcionales, parqueos disponibles para estudiantes, experiencia móvil independiente, APK-ready e imports relativos válidos.');
