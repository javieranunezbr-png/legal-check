# DESIGN — lawkit

## Estrategia de color

**Committed.** Un solo color saturado (el morado de marca) carga la identidad;
el resto son neutros tintados hacia ese hue. No es morado-IA decorativo: es la
identidad ya establecida del producto. Sin gradientes de morado, sin texto con
gradiente, sin glassmorphism.

- `primary` morado `#8B5CF6` (dark `#7C3AED`, light `#A78BFA`)
- `carbon` casi-negro tintado a violeta `#0B0A0F` (texto, superficies oscuras)
- `bone` blanco-hueso tintado `#FBFAFC` (fondo)
- `soft` gris tintado `#F4F3F7` (fondos secundarios, hover)
- `muted` gris-violeta `#6F6D7B` (texto secundario)

Regla: ningún `#000`/`#fff` puro. Texto gris nunca sobre fondo de color (usar
tono del propio color o transparencia).

## Tipografía

- **Display (titulares de marca):** Schibsted Grotesk. Grotesca contemporánea,
  confiada, no en la lista de reflejos (no Inter / DM / Space / Plus Jakarta).
  Escala fluida con `clamp()`, contraste de peso fuerte (≥1.25 entre pasos).
- **Cuerpo / app:** Inter (ya es la identidad de la aplicación; se preserva).
- Largo de línea de cuerpo: 60–72ch.

## Layout

- Marca: composiciones asimétricas, alineado a la izquierda, ritmo de espaciado
  variable con `clamp()`. Nada de stack centrado uniforme.
- Las tarjetas son el recurso perezoso: usarlas solo cuando sean el mejor
  affordance, nunca grilla de tarjetas idénticas, nunca anidadas.
- Kicker tipográfico: máximo uno, no como gramática repetida sobre cada sección.

## Movimiento

- Una entrada orquestada al cargar (reveals escalonados), `ease-out` exponencial.
- Sin bounce/elastic. No animar propiedades de layout. Respeta
  `prefers-reduced-motion`.

## Prohibiciones (además de las globales de impeccable)

- Bordes laterales de color (>1px) como acento.
- Texto con `background-clip:text` + gradiente.
- Íconos grandes redondeados sobre cada titular.
- Em dashes (usar coma, dos puntos, punto o paréntesis). Tampoco `--`.
- Grillas de tarjetas idénticas; pills mayúsculas repetidas por sección.
