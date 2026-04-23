# LEGAL CHECK — Roadmap del Producto

**Versión 1.0 | Abril 2026**

---

## Estado actual (completado)

- ✅ Backend completo: clientes, causas, acuerdos, cuotas, dashboard, auth
- ✅ Frontend completo: login, dashboard, clientes, causas, cobros
- ✅ Base de datos PostgreSQL en Railway
- ✅ Sistema corriendo localmente con Docker
- ✅ Código en GitHub: [github.com/javieranunezbr-png/legal-check](https://github.com/javieranunezbr-png/legal-check)
- ✅ Usuario admin creado: `admin@legalcheck.cl` / `Admin1234!`

## Próximo paso inmediato

→ **Desplegar frontend en Vercel** (necesario antes del portal del cliente)

---

## Fase 2 — Funcionalidades pendientes

### 1. Portal del cliente (alta prioridad)
- El abogado genera un link único por cliente
- El cliente abre el link y rellena un formulario con sus datos
- Al enviar, los datos aparecen automáticamente en el panel del abogado
- Similar al formulario de Google actual, pero integrado en Legal Check
- Requiere URL pública (por eso primero Vercel)

### 2. Presupuestos
- El abogado crea un presupuesto con descripción de servicios y montos
- Se genera un documento PDF o vista web
- Se envía al cliente por link o correo
- El cliente puede aceptar o rechazar
- Si acepta, se crea automáticamente el acuerdo de cobro

### 3. Cobros completos (parcialmente construido)
- Lista de todos los acuerdos activos
- Formulario crear acuerdo con generación automática de cuotas
- Vista detalle con cuotas y botón "Marcar como pagada"
- Resumen general con cuotas vencidas primero

### 4. Configuración de usuarios
- Admin puede crear y editar abogados
- Asignar clientes a abogados
- Ver rendimiento por abogado

---

## Fase 3 — Versión comercial

### 5. Notificaciones automáticas
- Correo al cliente cuando vence una cuota
- Recordatorio 3 días antes del vencimiento
- Notificación al abogado de gestiones pendientes

### 6. Automatización de documentos
- Mandato judicial generado automáticamente desde ficha del cliente
- Contrato de prestación de servicios automático
- Integración con el script de Google Apps Script existente

### 7. Integración FEA (Firma Electrónica Avanzada)
- El cliente firma el contrato digitalmente desde el link
- Integración con proveedores FEA en Chile

### 8. Facturación
- Integración con SII para emitir boletas/facturas
- Historial de facturación por cliente

### 9. Integración Poder Judicial
- Seguimiento automático de causas desde el PJUD
- Alertas de resoluciones y plazos

---

## Modelo de negocio

| Plan     | Abogados         | Precio             |
|----------|------------------|--------------------|
| Solo     | 1 abogado        | $15.000 CLP/mes    |
| Estudio  | hasta 5          | $39.000 CLP/mes    |
| Pro      | hasta 15         | $79.000 CLP/mes    |

**Meta año 1:** 100 clientes → ~$1.500.000 CLP/mes

**Mercado objetivo:**
- Abogados independientes (primer target)
- Estudios pequeños de 2-5 abogados
- Chile primero, luego Latinoamérica

**Diferenciador clave:**
- Todo en un lugar (clientes + causas + cobros + documentos)
- Pensado para la realidad chilena (SII, PJUD, FEA)
- Simple — cualquier abogado puede usarlo sin capacitación
- Precio accesible para abogados solos

---

## Notas técnicas

**Stack:**
- Frontend: React + Tailwind CSS → Vercel
- Backend: Node.js + Express → Railway
- Base de datos: PostgreSQL → Railway
- Repositorio: GitHub (`javieranunezbr-png/legal-check`)
- Local: Docker Desktop

**Credenciales desarrollo:**
- Admin: `admin@legalcheck.cl` / `Admin1234!`
- Frontend local: http://localhost:5173 (o 5174)
- Backend local: http://localhost:3001
- Railway backend: `legal-check-production.up.railway.app`

**Para iniciar el sistema localmente:**
1. Abrir Docker Desktop
2. En terminal: `cd ~/Desktop/legal-check`
3. `docker-compose up`
4. En terminal nueva: `cd frontend && npm run dev`
5. Abrir http://localhost:5173

---

## Diseño

- Los colores y diseño se pueden cambiar fácilmente
- Tailwind CSS permite cambios rápidos con Claude Code
- Ejemplos de cambios simples:
  - "Cambia el color del sidebar a verde oscuro"
  - "Agrega el logo de Legal Check en el header"
  - "Cambia la tipografía a Inter"
