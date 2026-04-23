-- Migration 007: Catálogo de gestiones reutilizables y líneas de presupuesto

CREATE TABLE IF NOT EXISTS gestiones (
    id               SERIAL PRIMARY KEY,
    abogado_id       INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre           VARCHAR(200) NOT NULL,
    precio_sugerido  NUMERIC(12,2) NOT NULL DEFAULT 0,
    descripcion      TEXT,
    creado_en        TIMESTAMP DEFAULT NOW(),
    UNIQUE (abogado_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_gestiones_abogado ON gestiones(abogado_id);

CREATE TABLE IF NOT EXISTS presupuesto_items (
    id              SERIAL PRIMARY KEY,
    presupuesto_id  INT NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
    gestion_id      INT REFERENCES gestiones(id) ON DELETE SET NULL,
    nombre          VARCHAR(200) NOT NULL,
    precio          NUMERIC(12,2) NOT NULL DEFAULT 0,
    detalle         TEXT,
    orden           INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_presupuesto_items_pres ON presupuesto_items(presupuesto_id);
