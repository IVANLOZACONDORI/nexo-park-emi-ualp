const base=process.env.NEXO_URL||'http://localhost:4000';
console.log('NEXO PARK — diagnóstico de conexión\nServidor: '+base);
for(const endpoint of ['/api/health','/api/autenticacion/captcha']) {
 try {const r=await fetch(base+endpoint,{signal:AbortSignal.timeout(8000),cache:'no-store'});const d=await r.json();if(!r.ok)throw Error(d.message||'HTTP '+r.status);if(endpoint.endsWith('health')&&d.version!=='34.0.0')throw Error('Hay una version anterior ejecutandose. Detenga el servidor anterior e inicie V34.');if(endpoint.endsWith('captcha')&&(!d.token||!d.question))throw Error('Respuesta incompleta');console.log('OK '+endpoint+(d.question?' — verificación disponible':' — servidor disponible'));}
 catch(e){console.error('ERROR '+endpoint+': '+e.message);console.error('Inicie el backend y su base de datos. Utilice la dirección de la terminal, no Live Server. Si cambió el puerto, defina NEXO_URL.');process.exitCode=1;}
}

try {const r=await fetch(base+'/login',{cache:'no-store',signal:AbortSignal.timeout(8000)});const html=await r.text();if(!html.includes('name="nexo-build" content="34.0.0"'))throw Error('Frontend antiguo: compruebe FRONTEND_DIR y reemplace los archivos del frontend con V34.');console.log('OK frontend V34');}catch(e){console.error(e.message);process.exitCode=1;}
