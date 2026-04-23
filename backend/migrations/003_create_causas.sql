-- Migration 003: Tabla de causas / expedientes
CREATE TABLE IF NOT EXISTS causas (
    id              SERIAL PRIMARY KEY,
    rol_causa       VARCHAR(50),
    titulo          VARCHAR(300) NOT NULL,
    descripcion     TEXT,
    tribunal        VARCHAR(200),
    materia         VARCHAR(100),
    estado          VARCHAR(30) DEFAULT 'activa'
                    CHECK (estado IN ('activa', 'cerrada', 'suspendida', 'archivada')),
    cliente_id      INT NOT NULL REFERENCES clientes(id),
    abogado_id      INT NOT NULL REFERENCES usuarios(id),
    fecha_inicio    DATE NOT NULL,
    fecha_termino   DATE,
    creado_en       TIMESTAMP DEFAULT NOW(),
    actualizado_en  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_causas_cliente  ON causas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_causas_abogado  ON causas(abogado_id);
CREATE INDEX IF NOT EXISTS idx_causas_estado   ON causas(estado);
