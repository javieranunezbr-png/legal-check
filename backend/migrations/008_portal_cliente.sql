-- Migration 008: Portal del cliente (Sprint 3)

-- 1) Permitir estado 'activo' en clientes
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_estado_check;
ALTER TABLE clientes ADD CONSTRAINT clientes_estado_check
  CHECK (estado IN ('vigente', 'terminado', 'derivado', 'activo'));

-- 2) Campos nuevos en presupuestos: primer pago + portal del cliente
ALTER TABLE presupuestos
  ADD COLUMN IF NOT EXISTS primer_pago_recibido_en TIMESTAMP,
  ADD COLUMN IF NOT EXISTS portal_token VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS portal_completado_en TIMESTAMP,
  ADD COLUMN IF NOT EXISTS cliente_id INT REFERENCES clientes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_presupuestos_portal_token ON presupuestos(portal_token);
