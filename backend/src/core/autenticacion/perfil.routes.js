import { Router } from 'express';
import sharp from 'sharp';
import { query, transaction } from '../../config/db.js';
import { authenticate } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const perfilRouter = Router();
perfilRouter.use(authenticate);

const CV_ROLES = new Set([
  'ADMIN','OPERADORES','SOPORTE','RRHH','DIRECTOR','GUARDIA',
  'ADMINISTRADOR_SISTEMA','JEFE_OPERACIONES','SOPORTE_TIC','RECURSOS_HUMANOS',
  'DIRECCION_GRADO','PERSONAL_GUARDIA','INFRAESTRUCTURA'
]);

async function rolActual(usuarioId){
  const row=(await query(`SELECT r.codigo FROM usuarios u JOIN roles r ON r.id=u.rol_id WHERE u.id=$1`,[usuarioId])).rows[0];
  return row?.codigo||'';
}


const selection = `
  SELECT
    u.nombre_usuario,u.nombre_completo,u.correo,u.correo_personal,
    u.area_institucional,u.telefono,u.celular,u.direccion_residencia,
    u.fecha_nacimiento,u.numero_referencia,u.profesion,u.grado_especialidad,
    u.foto_perfil,u.perfil_limite_en,u.perfil_completado_en,u.creado_en,
    CASE WHEN r.codigo IN ('ADMIN','OPERADORES','SOPORTE','RRHH','DIRECTOR','GUARDIA','ADMINISTRADOR_SISTEMA','JEFE_OPERACIONES','SOPORTE_TIC','RECURSOS_HUMANOS','DIRECCION_GRADO','PERSONAL_GUARDIA','INFRAESTRUCTURA') THEN (u.cv_pdf IS NOT NULL) ELSE FALSE END cv_disponible,
    u.cv_nombre,u.cv_actualizado_en,r.codigo rol_codigo,
    (r.codigo IN ('ADMIN','OPERADORES','SOPORTE','RRHH','DIRECTOR','GUARDIA','ADMINISTRADOR_SISTEMA','JEFE_OPERACIONES','SOPORTE_TIC','RECURSOS_HUMANOS','DIRECCION_GRADO','PERSONAL_GUARDIA','INFRAESTRUCTURA')) cv_habilitado,
    r.nombre rol_nombre,z.nombre zona_nombre
  FROM usuarios u
  JOIN roles r ON r.id=u.rol_id
  LEFT JOIN zonas_parqueo z ON z.id=u.zona_asignada_id
  WHERE u.id=$1`;

perfilRouter.get('/', asyncHandler(async (req,res)=>{
  res.set('Cache-Control','no-store');
  res.json((await query(selection,[req.user.sub])).rows[0]);
}));

perfilRouter.get('/cv', asyncHandler(async (req,res)=>{
  const rol=await rolActual(req.user.sub);
  if(!CV_ROLES.has(rol)) return res.status(403).json({message:'El currículum vitae solo está habilitado para personal administrativo, militar y autoridades.'});
  const row=(await query('SELECT cv_pdf,cv_nombre FROM usuarios WHERE id=$1',[req.user.sub])).rows[0];
  if(!row?.cv_pdf) return res.status(404).json({message:'No tienes un currículum registrado.'});
  const safe=(row.cv_nombre||'curriculum.pdf').replace(/[^a-zA-Z0-9._ ()-]/g,'_');
  res.set({'Content-Type':'application/pdf','Content-Disposition':`inline; filename="${safe}"`,'Cache-Control':'private, no-store'});
  res.send(row.cv_pdf);
}));

perfilRouter.patch('/', asyncHandler(async (req,res)=>{
  const b=req.body||{};
  const fields={
    nombreCompleto:170, correo:170, correoPersonal:170, area:120,
    telefono:30, celular:30, direccion:220, numeroReferencia:30,
    profesion:120, gradoEspecialidad:160
  };
  for(const [key,max] of Object.entries(fields)){
    if(b[key]!==undefined&&(typeof b[key]!=='string'||b[key].length>max))
      return res.status(400).json({message:'Revise el campo '+key+'.'});
  }
  if(b.nombreCompleto!==undefined&&b.nombreCompleto.trim().length<3)
    return res.status(400).json({message:'Ingrese su nombre completo (mínimo 3 caracteres).'});
  for(const key of ['correo','correoPersonal']){
    if(b[key]&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b[key]))
      return res.status(400).json({message:'Ingrese un correo válido.'});
  }
  for(const key of ['telefono','celular','numeroReferencia']){
    if(b[key]&&!/^[+0-9() .-]{6,30}$/.test(b[key]))
      return res.status(400).json({message:'Ingrese un número telefónico válido.'});
  }

  let fechaNacimiento;
  if(b.fechaNacimiento!==undefined){
    if(b.fechaNacimiento==='') fechaNacimiento=null;
    else {
      const d=new Date(b.fechaNacimiento+'T00:00:00Z'), now=new Date();
      if(Number.isNaN(d.valueOf())||d>now||d.getUTCFullYear()<1940)
        return res.status(400).json({message:'Ingrese una fecha de nacimiento válida.'});
      fechaNacimiento=b.fechaNacimiento;
    }
  }

  let photo;
  if(b.foto!==undefined){
    if(b.foto===null) photo=null;
    else {
      if(typeof b.foto!=='string'||b.foto.length>2800000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b.foto))
        return res.status(400).json({message:'Utilice una foto JPG, PNG o WebP de hasta 2 MB.'});
      try{
        const bytes=Buffer.from(b.foto.split(',')[1],'base64');
        if(bytes.length>2*1024*1024) throw Error();
        const clean=await sharp(bytes,{limitInputPixels:25000000}).rotate().resize(512,512,{fit:'cover'}).webp({quality:84}).toBuffer();
        photo='data:image/webp;base64,'+clean.toString('base64');
      }catch{return res.status(400).json({message:'No se pudo procesar la foto.'});}
    }
  }

  const rol=await rolActual(req.user.sub);
  const cvHabilitado=CV_ROLES.has(rol);
  if(b.cv!==undefined&&!cvHabilitado)
    return res.status(403).json({message:'El currículum vitae solo está habilitado para personal administrativo, militar y autoridades.'});

  let cvBytes,cvNombre;
  if(b.cv!==undefined){
    if(b.cv===null){cvBytes=null;cvNombre=null;}
    else {
      if(typeof b.cv!=='string'||typeof b.cvNombre!=='string'||b.cv.length>8000000||!/^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(b.cv))
        return res.status(400).json({message:'Adjunte un currículum en PDF de hasta 5 MB.'});
      cvBytes=Buffer.from(b.cv.split(',')[1],'base64');
      if(cvBytes.length>5*1024*1024||cvBytes.slice(0,4).toString()!=='%PDF')
        return res.status(400).json({message:'El currículum debe ser un PDF válido de hasta 5 MB.'});
      cvNombre=b.cvNombre.slice(0,255).replace(/[^a-zA-Z0-9._ ()-]/g,'_');
    }
  }

  await transaction(async cl=>{
    const old=(await cl.query('SELECT * FROM usuarios WHERE id=$1 FOR UPDATE',[req.user.sub])).rows[0];
    const val=(key,dbKey)=>b[key]===undefined?old[dbKey]:(typeof b[key]==='string'?(b[key].trim()||null):b[key]);
    const name=val('nombreCompleto','nombre_completo')||old.nombre_usuario;
    const email=val('correo','correo');
    const personal=val('correoPersonal','correo_personal');
    const area=val('area','area_institucional');
    const cel=val('celular','celular');
    const dir=val('direccion','direccion_residencia');
    const prof=val('profesion','profesion');
    const grado=val('gradoEspecialidad','grado_especialidad');
    const ref=val('numeroReferencia','numero_referencia');
    const fecha=fechaNacimiento===undefined?old.fecha_nacimiento:fechaNacimiento;
    const complete=Boolean(name&&name!==old.nombre_usuario&&personal&&area&&cel&&dir&&fecha&&prof&&grado&&ref);
    const cvFinal=cvBytes===undefined?old.cv_pdf:cvBytes;
    const cvNombreFinal=cvBytes===undefined?old.cv_nombre:cvNombre;

    await cl.query(`UPDATE usuarios SET
      nombre_completo=$2,correo=$3,correo_personal=$4,area_institucional=$5,
      telefono=$6,celular=$7,direccion_residencia=$8,fecha_nacimiento=$9,
      numero_referencia=$10,profesion=$11,grado_especialidad=$12,
      foto_perfil=$13,cv_pdf=$14,cv_nombre=$15,
      cv_actualizado_en=CASE WHEN $16 THEN NOW() ELSE cv_actualizado_en END,
      perfil_completado_en=CASE WHEN $17 THEN COALESCE(perfil_completado_en,NOW()) ELSE NULL END,
      perfil_limite_en=COALESCE(perfil_limite_en,NOW()+INTERVAL '7 days'),actualizado_en=NOW()
      WHERE id=$1`,[
        req.user.sub,name,email,personal,area,val('telefono','telefono'),cel,dir,fecha,
        ref,prof,grado,photo===undefined?old.foto_perfil:photo,cvFinal,cvNombreFinal,
        cvBytes!==undefined,complete
      ]);
    await cl.query(`INSERT INTO auditoria(usuario_id,accion,entidad,entidad_id,detalle)
      VALUES($1,'PERFIL_ACTUALIZAR','usuarios',$3,$2)`,[
        req.user.sub,
        JSON.stringify({campos:Object.keys(fields).filter(k=>b[k]!==undefined),fotoModificada:photo!==undefined,cvModificado:cvBytes!==undefined}),
        req.user.sub
      ]);
  });

  res.set('Cache-Control','no-store');
  res.json((await query(selection,[req.user.sub])).rows[0]);
}));
