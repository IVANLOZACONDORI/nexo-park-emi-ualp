// Ejecutar únicamente contra una base de pruebas: crea una cuenta temporal.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:4000';
const results=[];
async function request(path,token,method='GET',body){const r=await fetch(base+'/api'+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
async function login(user,password){const {data:c}=await request('/autenticacion/captcha');const n=c.question.match(/\d+/g).map(Number);const r=await request('/autenticacion/login',null,'POST',{nombreUsuario:user,contrasena:password,captchaToken:c.token,captchaRespuesta:String(c.question.includes('-')?n[0]-n[1]:n[0]+n[1])});assert.equal(r.status,200,JSON.stringify(r));return r.data.token;}
function pass(test){console.log('PASS',test);results.push(test);}
assert.equal((await request('/perfil')).status,401);pass('Perfil protegido sin sesión');
const admin=await login('admin','PARKIA2026!Admin');const username='perfil_'+Date.now(),password='PerfilSeguro2026!';
assert.equal((await request('/usuarios',admin,'POST',{nombreUsuario:username,contrasena:password,rolCodigo:'GUARDIA',plazoPerfilDias:0})).status,400);
const created=await request('/usuarios',admin,'POST',{nombreUsuario:username,contrasena:password,rolCodigo:'GUARDIA',plazoPerfilDias:3});assert.equal(created.status,201,JSON.stringify(created));
let token=await login(username,password);let p=(await request('/perfil',token)).data;
assert.equal(p.nombre_completo,username);assert.equal(p.cv_habilitado,true);assert.equal(p.perfil_completado_en,null);assert.ok(new Date(p.perfil_limite_en)-Date.now()>2.9*86400000);pass('Alta mínima y plazo de 3 días persistente');
assert.equal((await request('/perfil',token,'PATCH',{correo:'invalido'})).status,400);
assert.equal((await request('/perfil',token,'PATCH',{nombreCompleto:[]})).status,400);
assert.equal((await request('/perfil',token,'PATCH',{foto:'data:image/svg+xml;base64,PHN2Zz4='})).status,400);pass('Validación de datos y rechazo de foto no admitida');
const before=(await request('/perfil',admin)).data;
const saved=await request('/perfil',token,'PATCH',{nombreCompleto:'Usuario de Prueba',correo:'qa@emi.example.test',correoPersonal:'personal@example.test',area:'Seguridad',telefono:'+591 22000000',celular:'+591 70000000',direccion:'Zona Sur, La Paz',fechaNacimiento:'1998-05-10',numeroReferencia:'+591 71111111',profesion:'Ingeniería de Sistemas',gradoEspecialidad:'Licenciatura',rolCodigo:'ADMIN',estado:'DESHABILITADO',id:before.id});assert.equal(saved.status,200,JSON.stringify(saved));assert.ok(saved.data.perfil_completado_en);
assert.equal((await request('/autenticacion/yo',token)).data.usuario.rol,'GUARDIA');assert.equal((await request('/perfil',admin)).data.nombre_completo,before.nombre_completo);assert.equal((await request('/usuarios',token)).status,403);pass('Perfil completo sin elevar permisos ni modificar otra cuenta');
// Imagen PNG pequeña: el servidor debe decodificar y normalizar a WebP.
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAYUlEQVR4nO3PMQ0AIADAMMAyDlCOCI6GZFWwzXH2+NnSAa8a0BrQGtAa0BrQGtAa0BrQGtAa0BrQGtAa0BrQGtAa0BrQGtAa0BrQGtAa0BrQGtAa0BrQGtAa0BrQGtAa0C5uiQF1a6lRDAAAAABJRU5ErkJggg==';
const photo=await request('/perfil',token,'PATCH',{foto:png});assert.equal(photo.status,200,JSON.stringify(photo));assert.ok(photo.data.foto_perfil.startsWith('data:image/webp;base64,'));
await request('/autenticacion/logout',token,'POST',{});token=await login(username,password);p=(await request('/perfil',token)).data;assert.equal(p.foto_perfil,photo.data.foto_perfil);assert.equal(p.nombre_completo,'Usuario de Prueba');pass('Fotografía procesada y persistente después de cerrar sesión');
assert.equal((await request('/perfil',token,'PATCH',{foto:null})).data.foto_perfil,null);pass('Eliminar fotografía');
const owner=await login('estudiante','PARKIA2026!Est');const ownerProfile=await request('/perfil',owner);assert.equal(ownerProfile.status,200);assert.equal(ownerProfile.data.cv_habilitado,false);assert.equal(ownerProfile.data.cv_disponible,false);assert.equal((await request('/perfil/cv',owner)).status,403);assert.equal((await request('/perfil',owner,'PATCH',{cv:'data:application/pdf;base64,JVBERi0xLjQK',cvNombre:'cv.pdf'})).status,403);assert.equal((await request('/usuarios',owner)).status,403);pass('Propietario accede a su perfil sin opción de CV y conserva aislamiento');
await fs.writeFile(new URL('./resultados-perfil-v36.json',import.meta.url),JSON.stringify({fecha:new Date().toISOString(),entorno:'API Express con PostgreSQL compatible PGlite, base temporal',pruebas:results},null,2));
