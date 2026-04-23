-- Migration 001: Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    rol         VARCHAR(20) NOT NULL
                CHECK (rol IN ('admin', 'abogado')),
    activo      BOOLEAN DEFAULT true,
    creado_en   TIMESTAMP DEFAULT NOW()
);
