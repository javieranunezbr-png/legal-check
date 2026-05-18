-- Migration 012: Agenda interna del estudio (Sprint 4)
-- Eventos / audiencias / gestiones / plazos agendables por abogado,
-- opcionalmente asociados a una causa.

CREATE TABLE IF NOT EXISTS agenda_eventos (
  id           SERIAL PRIMARY KEY,
  abogado_id   INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  causa_id     INT REFERENCES causas(id) ON DELETE SET NULL,
  titulo       VARCHAR(200) NOT NULL,
  tipo         VARCHAR(30) NOT NULL DEFAULT 'gestion'
               CHECK (tipo IN ('audiencia','gestion','reunion','plazo','otro')),
  descripcion  TEXT,
  fecha        TIMESTAMP NOT NULL,
  estado       VARCHAR(20) NOT NULL DEFAULT 'pendiente'
               CHECK (estado IN ('pendiente','realizado','cancelado')),
  creado_en    TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agenda_abogado ON agenda_eventos(abogado_id);
CREATE INDEX IF NOT EXISTS idx_agenda_causa   ON agenda_eventos(causa_id);
CREATE INDEX IF NOT EXISTS idx_agenda_fecha   ON agenda_eventos(fecha);
