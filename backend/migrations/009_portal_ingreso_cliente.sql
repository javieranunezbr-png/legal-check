-- Migration 009: Portal de ingreso del cliente (Sprint 3 — versión final)
-- Trigger: cuando se marca la primera cuota como pagada se envía el link al cliente.
-- Reutilizamos canal_llegada (existente) para "cómo nos conociste"
-- y clave_unica (existente) para la clave única.

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS token_ingreso       VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS ingreso_completado  BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ingreso_completado_en TIMESTAMP,
  ADD COLUMN IF NOT EXISTS comuna              VARCHAR(120),
  ADD COLUMN IF NOT EXISTS region              VARCHAR(120),
  ADD COLUMN IF NOT EXISTS consideraciones     TEXT;

CREATE INDEX IF NOT EXISTS idx_clientes_token_ingreso ON clientes(token_ingreso);
