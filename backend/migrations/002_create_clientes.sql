-- Migration 002: Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id                  SERIAL PRIMARY KEY,
    rut                 VARCHAR(12) UNIQUE NOT NULL,
    nombre              VARCHAR(200) NOT NULL,
    apellidos           VARCHAR(200),
    email               VARCHAR(255),
    telefono            VARCHAR(20),
    direccion           TEXT,
    tipo                VARCHAR(20) DEFAULT 'persona'
                        CHECK (tipo IN ('persona', 'empresa')),
    estado_civil        VARCHAR(50),
    ocupacion           VARCHAR(150),
    nacionalidad        VARCHAR(100),
    genero              VARCHAR(20),
    clave_unica         VARCHAR(100),
    nombre_conyuge      VARCHAR(200),
    apellidos_conyuge   VARCHAR(200),
    rut_conyuge         VARCHAR(12),
    direccion_conyuge   TEXT,
    canal_llegada       VARCHAR(50),
    estado              VARCHAR(20) DEFAULT 'vigente'
                        CHECK (estado IN ('vigente', 'terminado', 'derivado')),
    abogado_id          INT REFERENCES usuarios(id),
    notas               TEXT,
    creado_en           TIMESTAMP DEFAULT NOW()
);
