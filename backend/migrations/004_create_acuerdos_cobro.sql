-- Migration 004: Tabla de acuerdos de cobro
CREATE TABLE IF NOT EXISTS acuerdos_cobro (
    id                  SERIAL PRIMARY KEY,
    causa_id            INT NOT NULL REFERENCES causas(id),
    descripcion         TEXT,
    monto_total         NUMERIC(14,2) NOT NULL,
    tipo_cobro          VARCHAR(30) NOT NULL
                        CHECK (tipo_cobro IN ('honorarios', 'cuotas', 'exito', 'mixto')),
    estado              VARCHAR(30) DEFAULT 'vigente'
                        CHECK (estado IN ('vigente', 'completado', 'incumplido', 'anulado')),
    fecha_acuerdo       DATE NOT NULL,
    porcentaje_exito    NUMERIC(5,2),
    notas               TEXT,
    creado_en           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acuerdos_causa ON acuerdos_cobro(causa_id);
