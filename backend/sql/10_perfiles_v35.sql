-- Actualización aditiva: conserva cuentas y registros existentes.
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(30);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_perfil TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil_completado_en TIMESTAMPTZ;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS perfil_limite_en TIMESTAMPTZ;
-- Las cuentas anteriores reciben un recordatorio, sin bloqueo de acceso.
UPDATE usuarios SET perfil_limite_en=NOW()+INTERVAL '7 days' WHERE perfil_limite_en IS NULL AND perfil_completado_en IS NULL;

ALTER TABLE usuarios ALTER COLUMN perfil_limite_en SET DEFAULT (NOW()+INTERVAL '7 days');
UPDATE configuracion_sistema SET valor=jsonb_set(valor,'{version}','"35.0.0"'::jsonb) WHERE clave='identidad_sistema';
