-- Migration 005: Tabla de cuotas de pago
CREATE TABLE IF NOT EXISTS cuotas (
    id                  SERIAL PRIMARY KEY,
    acuerdo_id          INT NOT NULL REFERENCES acuerdos_cobro(id),
    numero_cuota        INT NOT NULL,
    monto               NUMERIC(14,2) NOT NULL,
    fecha_vencimiento   DATE NOT NULL,
    fecha_pago          DATE,
    estado              VARCHAR(20) DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'condonada')),
    metodo_pago         VARCHAR(50),
    comprobante         VARCHAR(255),
    notas               TEXT,
    creado_en           TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cuotas_acuerdo     ON cuotas(acuerdo_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_estado       ON cuotas(estado);
CREATE INDEX IF NOT EXISTS idx_cuotas_vencimiento  ON cuotas(fecha_vencimiento);
