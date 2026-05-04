-- Migration 010: Conexión presupuestos → cobros
-- Cuando un presupuesto se acepta, se crea automáticamente el cliente,
-- la causa, el acuerdo de cobro y todas sus cuotas.

-- 1) Permitir estado 'pendiente' (cliente recién creado desde presupuesto,
--    todavía no completa su ficha personal)
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_estado_check;
ALTER TABLE clientes ADD CONSTRAINT clientes_estado_check
  CHECK (estado IN ('pendiente','vigente','terminado','derivado','activo'));

-- 2) RUT puede quedar NULL hasta que el cliente complete su ficha en el portal
ALTER TABLE clientes ALTER COLUMN rut DROP NOT NULL;

-- 3) Link directo presupuesto → acuerdo de cobro creado
ALTER TABLE presupuestos
  ADD COLUMN IF NOT EXISTS acuerdo_id INT REFERENCES acuerdos_cobro(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_presupuestos_acuerdo ON presupuestos(acuerdo_id);
