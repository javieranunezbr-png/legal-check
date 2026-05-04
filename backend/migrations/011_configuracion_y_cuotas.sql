-- Migration 011: Configuración del estudio + cuotas con fechas flexibles

-- 1) cuotas.fecha_vencimiento puede ser NULL (cuando un presupuesto se acepta
--    sin fecha de primera cuota, las fechas se asignan al marcar la primera
--    como pagada).
ALTER TABLE cuotas ALTER COLUMN fecha_vencimiento DROP NOT NULL;

-- 2) Tabla de configuración del estudio por abogado
CREATE TABLE IF NOT EXISTS configuracion_estudio (
  id                          SERIAL PRIMARY KEY,
  abogado_id                  INT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  mensaje_bienvenida_portal   TEXT,
  creado_en                   TIMESTAMP DEFAULT NOW(),
  actualizado_en              TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_config_abogado ON configuracion_estudio(abogado_id);
