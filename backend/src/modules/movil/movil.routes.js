import {Router} from 'express';
import {query} from '../../config/db.js';
import {authenticate} from '../../middleware/auth.js';
import {asyncHandler} from '../../utils/asyncHandler.js';

export const movilRouter=Router();
movilRouter.use(authenticate);

const accesosBase=[
  ['control','Control de ingreso y salida','acceso.ver','Consulta movimientos, validaciones y control operativo.'],
  ['lugares','Parqueos y disponibilidad','panel.ver','Supervisa zonas, plazas y disponibilidad del campus.'],
  ['reportes','Informes y reportes','reportes.generar','Consulta indicadores e informes institucionales.'],
  ['alertas','Alertas y notificaciones','alertas.ver','Revisa incidencias y alertas activas.'],
  ['vehiculos','Vehículos','vehiculos.ver','Consulta vehículos, autorizaciones y datos registrados.'],
  ['usuarios','Gestión de usuarios','usuarios.gestionar','Administra cuentas, roles y estados.'],
  ['auditoria','Auditoría y continuidad','auditoria.ver','Consulta auditoría y trazabilidad técnica.'],
  ['propietarios','Personas y titulares','propietarios.ver','Consulta titulares y cuentas vinculadas a vehículos.']
];

async function vehiculosPropios(usuarioId){
  const r=await query(`
    SELECT v.id,v.placa,v.tipo_vehiculo,v.marca,v.modelo,v.color,v.categoria_usuario,v.estado,
           COALESCE(a.vigencia,'SIN_AUTORIZACION') autorizacion_vigencia
    FROM vehiculos v
    LEFT JOIN LATERAL (
      SELECT CASE
        WHEN x.estado='ACTIVA' AND x.valido_desde>NOW() THEN 'PENDIENTE'
        WHEN x.estado='ACTIVA' AND x.valido_hasta IS NOT NULL AND x.valido_hasta<NOW() THEN 'VENCIDA'
        ELSE x.estado END vigencia
      FROM autorizaciones_vehiculares x
      WHERE x.vehiculo_id=v.id
      ORDER BY x.creado_en DESC,x.id DESC LIMIT 1
    ) a ON TRUE
    WHERE v.propietario_usuario_id=$1 AND v.estado='ACTIVO'
    ORDER BY v.placa`,[usuarioId]);
  return r.rows;
}

function tiposPlazaCompatibles(vehiculos,rol){
  const tipos=new Set();
  for(const v of vehiculos){
    if(v.tipo_vehiculo==='MOTOCICLETA') tipos.add('MOTOCICLETA');
    else tipos.add('ESTANDAR');
    if(v.categoria_usuario==='VISITANTE') tipos.add('VISITANTE');
  }
  if(['DIRECTOR','ADMIN'].includes(rol)) tipos.add('OFICIAL');
  return [...tipos];
}

movilRouter.get('/contexto',asyncHandler(async(req,res)=>{
  const allowed=p=>req.user.permisos.includes('*')||req.user.permisos.includes(p);
  const propios=await vehiculosPropios(req.user.sub);
  const accesos=accesosBase
    .filter(x=>allowed(x[2]))
    .map(([modulo,nombre,,descripcion])=>({modulo,nombre,descripcion}));
  res.set('Cache-Control','private, no-store').json({
    rol:req.user.rol,
    nombreRol:req.user.nombreRol,
    nombreCompleto:req.user.nombreCompleto,
    tieneVehiculo:propios.length>0,
    cantidadVehiculos:propios.length,
    accesos
  });
}));

movilRouter.get('/mi-movilidad',asyncHandler(async(req,res)=>{
  const vehiculos=await vehiculosPropios(req.user.sub);
  res.set('Cache-Control','private, no-store');
  if(!vehiculos.length){
    return res.json({
      tieneVehiculo:false,
      vehiculos:[],
      resumen:{totalCompatibles:0,libres:0,ocupadas:0,fueraServicio:0,sinDatos:0},
      zonas:[],plazasLibres:[],historial:[],
      mensaje:'Tu cuenta todavía no tiene un vehículo activo registrado.'
    });
  }

  const compatibles=tiposPlazaCompatibles(vehiculos,req.user.rol);
  const plazas=await query(`
    SELECT p.id,p.codigo,p.tipo_plaza,p.estado_actual,p.confianza,p.actualizado_en,
           z.id zona_id,z.codigo zona_codigo,z.nombre zona_nombre,z.referencia_ubicacion
    FROM plazas_parqueo p
    JOIN zonas_parqueo z ON z.id=p.zona_id
    WHERE p.habilitada=TRUE AND z.estado='ACTIVA' AND p.tipo_plaza=ANY($1::text[])
    ORDER BY z.nombre,p.tipo_plaza,p.coordenada_y,p.coordenada_x,p.codigo`,[compatibles]);

  const resumen={totalCompatibles:0,libres:0,ocupadas:0,fueraServicio:0,sinDatos:0};
  const porZona=new Map();
  const plazasLibres=[];
  for(const p of plazas.rows){
    resumen.totalCompatibles++;
    if(p.estado_actual==='LIBRE') resumen.libres++;
    else if(p.estado_actual==='OCUPADA') resumen.ocupadas++;
    else if(p.estado_actual==='FUERA_SERVICIO') resumen.fueraServicio++;
    else resumen.sinDatos++;

    if(!porZona.has(p.zona_id)) porZona.set(p.zona_id,{
      id:p.zona_id,codigo:p.zona_codigo,nombre:p.zona_nombre,ubicacion:p.referencia_ubicacion,
      total:0,libres:0,ocupadas:0,fueraServicio:0,sinDatos:0
    });
    const z=porZona.get(p.zona_id);z.total++;
    if(p.estado_actual==='LIBRE') z.libres++;
    else if(p.estado_actual==='OCUPADA') z.ocupadas++;
    else if(p.estado_actual==='FUERA_SERVICIO') z.fueraServicio++;
    else z.sinDatos++;

    if(p.estado_actual==='LIBRE') plazasLibres.push({
      codigo:p.codigo,tipo:p.tipo_plaza,zonaId:p.zona_id,zona:p.zona_nombre,
      ubicacion:p.referencia_ubicacion,confianza:p.confianza,actualizadoEn:p.actualizado_en
    });
  }

  const hist=await query(`
    SELECT e.id,e.tipo_evento,e.fecha_hora,e.placa_detectada,e.resultado_validacion,e.punto_acceso,
           v.placa,v.tipo_vehiculo,v.marca,v.modelo
    FROM eventos_acceso e
    JOIN vehiculos v ON v.id=e.vehiculo_id
    WHERE v.propietario_usuario_id=$1
    ORDER BY e.fecha_hora DESC LIMIT 100`,[req.user.sub]);

  const categorias={
    auto:vehiculos.some(v=>v.tipo_vehiculo!=='MOTOCICLETA'),
    moto:vehiculos.some(v=>v.tipo_vehiculo==='MOTOCICLETA')
  };
  const tipoTexto=categorias.auto&&categorias.moto?'tu auto o moto':categorias.moto?'tu moto':'tu vehículo';
  res.json({
    tieneVehiculo:true,
    vehiculos,
    categorias,
    resumen,
    zonas:[...porZona.values()],
    plazasLibres,
    historial:hist.rows,
    actualizadoEn:new Date().toISOString(),
    actualizacionSegundos:5,
    mensaje:resumen.libres>0
      ?`Hay ${resumen.libres} espacio${resumen.libres===1?'':'s'} disponible${resumen.libres===1?'':'s'} compatible${resumen.libres===1?'':'s'} con ${tipoTexto}.`
      :`NO HAY ESPACIOS DISPONIBLES PARA ${tipoTexto.toUpperCase()}`
  });
}));
