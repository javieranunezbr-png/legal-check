# DESIGN — lawkit

## Dirección: "Estudio sereno"

Lujo silencioso para el abogado independiente y el estudio jurídico. Cálido,
humano, con trayectoria. Vibra de bufete boutique, no de SaaS ruidoso. La
distinción viene de la calma y el oficio, no de la estridencia.

## Estrategia de color

**Committed cálido.** Un verde pino apagado carga la identidad sobre papel
cálido y tinta de oliva. Nada de morado, nada de azul corporativo, nada de
dorado/balanza. Sin gradientes, sin texto con gradiente, sin glassmorphism.

- `primary` pino `#2F4A3C` (dark `#243A2F`, light `#3D6150`)
- `carbon` tinta cálida casi-negra `#20211C` (texto, superficies oscuras)
- `bone` papel cálido `#F4F1EA` (fondo)
- `soft` papel secundario `#ECE8DE` (fondos secundarios, hover)
- `muted` gris-oliva `#6B6A5F` (texto secundario)

Regla: ningún `#000`/`#fff` puro; todos los neutros tintados cálidos. Texto
gris nunca sobre fondo de color (usar tono del propio color o transparencia).

## Tipografía

- **Display (titulares):** Spectral. Serif humanista con calma editorial, fuera
  de los clichés (no Fraunces / Playfair / Cormorant / Newsreader). Pesos
  500–700, tracking normal o levemente negativo (los serif no quieren
  tracking-tight agresivo).
- **Cuerpo / app:** Hanken Grotesk. Grotesca humanista cálida, legible, fuera
  de la lista de reflejos (no Inter / DM / Space / Plus Jakarta).
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
