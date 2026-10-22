-- V36: perfil profesional ampliado y CV PDF. Migración aditiva e idempotente.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS correo_personal VARCHAR(170);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS celular VARCHAR(30);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS direccion_residencia VARCHAR(220);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS numero_referencia VARCHAR(30);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS profesion VARCHAR(120);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS grado_especialidad VARCHAR(160);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cv_pdf BYTEA;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cv_nombre VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cv_actualizado_en TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS ix_usuarios_correo_personal_ci ON usuarios(LOWER(correo_personal)) WHERE correo_personal IS NOT NULL;
UPDATE configuracion_sistema SET valor=jsonb_set(valor,'{version}','"36.0.0"'::jsonb) WHERE clave='identidad_sistema';
