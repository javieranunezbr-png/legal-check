-- Migration 006: Tabla de presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
    id                   SERIAL PRIMARY KEY,
    abogado_id           INT NOT NULL REFERENCES usuarios(id),
    nombre_prospecto     VARCHAR(200) NOT NULL,
    correo               VARCHAR(255),
    telefono             VARCHAR(50),
    descripcion          TEXT,
    materias             TEXT[] DEFAULT '{}',
    honorarios_total     NUMERIC(12,2) NOT NULL DEFAULT 0,
    numero_cuotas        INT NOT NULL DEFAULT 1,
    monto_cuota          NUMERIC(12,2) NOT NULL DEFAULT 0,
    fecha_primera_cuota  DATE,
    notas                TEXT,
    estado               VARCHAR(20) NOT NULL DEFAULT 'borrador'
                         CHECK (estado IN ('borrador','enviado','aceptado','rechazado')),
    token_unico          VARCHAR(64) UNIQUE NOT NULL,
    respondido_en        TIMESTAMP,
    creado_en            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presupuestos_abogado ON presupuestos(abogado_id);
CREATE INDEX IF NOT EXISTS idx_presupuestos_token   ON presupuestos(token_unico);
