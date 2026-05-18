import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'

/* ---------------------------------------------------------------- */

const PROBLEMAS = [
  'Manejan a sus clientes en planillas Excel o "en la cabeza".',
  'Cobran las cuotas de honorarios de forma manual por correo y WhatsApp.',
  'No tienen visibilidad de qué gestiones o audiencias están pendientes.',
  'El software jurídico que existe es caro, complejo y poco intuitivo.',
]

const MODULOS = [
  {
    titulo: 'Clientes y causas',
    desc: 'Ficha completa de cada cliente, sus causas y documentos, en un solo lugar y con búsqueda rápida.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    titulo: 'Presupuestos con aceptación online',
    desc: 'El abogado crea un presupuesto y lo envía por correo o WhatsApp. El prospecto lo acepta desde un link, sin instalar nada.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    titulo: 'Cobros en cuotas automáticos',
    desc: 'Al aceptar el presupuesto se genera el acuerdo y todas las cuotas. Control de pagado, pendiente y vencido con alertas.',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    titulo: 'Portal del cliente',
    desc: 'Tras el primer pago, el cliente recibe un link y completa sus datos en un formulario seguro. Queda activo automáticamente.',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    titulo: 'Agenda y alertas',
    desc: 'Calendario de audiencias, gestiones y plazos por abogado, con avisos de lo que vence esta semana.',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    titulo: 'Identidad del estudio',
    desc: 'Mensajes y comunicaciones con el cliente personalizables, manteniendo la imagen profesional del estudio.',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
]

const FLUJO = [
  ['Presupuesto', 'El abogado crea el presupuesto y lo envía por correo o WhatsApp.'],
  ['Aceptación', 'El prospecto lo revisa y acepta desde un link público, sin registrarse.'],
  ['Cobro', 'Se genera automáticamente el acuerdo de honorarios y sus cuotas.'],
  ['Portal', 'Tras el primer pago, el cliente completa su ficha y queda activo.'],
  ['Gestión', 'El estudio administra causas, cobros y agenda desde un solo panel.'],
]

const DIFERENCIADORES = [
  'Todo en un solo lugar: gestión, cobros, presupuestos y agenda integrados.',
  'Precio accesible, pensado para abogados independientes y estudios jurídicos.',
  'Presupuestos con aceptación online y portal del cliente integrados.',
  'Flujo automático del presupuesto al cliente activo, sin pasos manuales.',
  'Fácil de usar: cualquier abogado lo opera sin capacitación.',
]

const VISION = [
  'Generación automática de mandato y contrato de prestación de servicios.',
  'Firma electrónica avanzada (FEA) del contrato desde el link del cliente.',
  'Asesorías online con agenda y pago integrado.',
  'Emisión de boletas/facturas e integración con el SII.',
  'Seguimiento de causas en el Poder Judicial con alertas de plazos.',
]

/* ---------------------------------------------------------------- */

function Seccion({ id, children, className = '' }) {
  return (
    <section id={id} className={`max-w-6xl mx-auto px-5 sm:px-8 ${className}`}>
      {children}
    </section>
  )
}

function Pill({ children }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
      {children}
    </span>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-bone text-carbon">

      {/* NAV */}
      <header className="sticky top-0 z-30 bg-bone/80 backdrop-blur border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden sm:flex items-center gap-7 text-sm font-medium text-muted">
            <a href="#producto" className="hover:text-carbon transition-colors">Producto</a>
            <a href="#como-funciona" className="hover:text-carbon transition-colors">Cómo funciona</a>
            <a href="#vision" className="hover:text-carbon transition-colors">Visión</a>
            <a href="#contacto" className="hover:text-carbon transition-colors">Contacto</a>
          </nav>
          <Link
            to="/login"
            className="text-sm font-medium text-carbon border border-zinc-300 px-4 py-2 rounded-lg hover:bg-soft transition-colors"
          >
            Acceso clientes
          </Link>
        </div>
      </header>

      {/* HERO */}
      <Seccion className="pt-20 pb-24 text-center">
        <Pill>Software de gestión jurídica</Pill>
        <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
          El estudio jurídico,<br className="hidden sm:block" />
          <span className="text-primary"> ordenado en un solo lugar.</span>
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          lawkit es la plataforma de gestión para abogados independientes y estudios
          jurídicos: clientes, presupuestos, cobros en cuotas, portal del cliente y
          agenda — simple, accesible y todo en un solo lugar.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#producto"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Conoce el producto
          </a>
          <a
            href="#contacto"
            className="border border-zinc-300 text-carbon px-6 py-3 rounded-lg font-semibold hover:bg-soft transition-colors"
          >
            Contáctanos
          </a>
        </div>
      </Seccion>

      {/* PROBLEMA */}
      <div className="bg-soft py-20">
        <Seccion>
          <div className="max-w-3xl">
            <Pill>El problema</Pill>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              El abogado independiente pierde tiempo y plata en tareas administrativas.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROBLEMAS.map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-5 border border-zinc-100">
                <span className="text-primary text-xl leading-none mt-0.5">›</span>
                <p className="text-sm text-zinc-700 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </Seccion>
      </div>

      {/* PRODUCTO / MÓDULOS */}
      <Seccion id="producto" className="py-20">
        <div className="text-center max-w-2xl mx-auto">
          <Pill>La solución</Pill>
          <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Una sola plataforma para todo el ciclo del cliente
          </h2>
          <p className="mt-4 text-muted">
            Desde el primer presupuesto hasta la gestión completa del caso, sin Excel
            ni procesos manuales.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULOS.map((m) => (
            <div key={m.titulo} className="bg-white rounded-2xl p-6 border border-zinc-100 hover:border-primary/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.icon} />
                </svg>
              </div>
              <h3 className="mt-4 font-semibold text-carbon">{m.titulo}</h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </Seccion>

      {/* CÓMO FUNCIONA */}
      <div id="como-funciona" className="bg-carbon text-white py-20">
        <Seccion>
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary bg-primary/15 px-3 py-1 rounded-full">
              Cómo funciona
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
              Del presupuesto al cliente activo, automático
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {FLUJO.map(([titulo, desc], i) => (
              <div key={titulo} className="relative">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold">{titulo}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Seccion>
      </div>

      {/* DIFERENCIADORES */}
      <Seccion className="py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Pill>Por qué lawkit</Pill>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
              Diseñado para quien la competencia ignora
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Los sistemas existentes son caros y complejos. lawkit nace para el
              abogado independiente y los estudios jurídicos que necesitan ordenarse
              sin fricción.
            </p>
          </div>
          <ul className="space-y-3">
            {DIFERENCIADORES.map((d, i) => (
              <li key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-zinc-100">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-zinc-700 leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </Seccion>

      {/* MODELO DE NEGOCIO */}
      <div className="bg-soft py-20">
        <Seccion>
          <div className="text-center max-w-2xl mx-auto">
            <Pill>Modelo de negocio</Pill>
            <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
              Suscripción mensual accesible
            </h2>
            <p className="mt-4 text-muted">
              Software como servicio (SaaS), con planes según el tamaño del estudio.
              Sin instalaciones, sin contratos largos.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              ['Plan Solo', 'Para el abogado independiente que trabaja por su cuenta.'],
              ['Plan Estudio', 'Para estudios jurídicos con un equipo de abogados.'],
              ['Plan Pro', 'Para estudios con varios abogados y mayor volumen de casos.'],
            ].map(([t, d]) => (
              <div key={t} className="bg-white rounded-2xl p-7 border border-zinc-100 text-center">
                <h3 className="font-semibold text-carbon text-lg">{t}</h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">{d}</p>
                <p className="mt-5 text-xs font-medium text-primary uppercase tracking-wide">
                  Disponible próximamente
                </p>
              </div>
            ))}
          </div>
        </Seccion>
      </div>

      {/* VISIÓN */}
      <Seccion id="vision" className="py-20">
        <div className="max-w-3xl">
          <Pill>Visión de producto</Pill>
          <h2 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight">
            Hacia el estudio jurídico totalmente digital
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            lawkit está en desarrollo activo. El núcleo de gestión ya está operativo y
            la hoja de ruta avanza hacia la automatización completa del trabajo legal:
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {VISION.map((v, i) => (
            <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-5 border border-zinc-100">
              <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-zinc-700 leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      </Seccion>

      {/* CTA / CONTACTO */}
      <div id="contacto" className="bg-carbon text-white">
        <Seccion className="py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            ¿Quieres saber más sobre lawkit?
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Estamos construyendo el software de gestión que el abogado
            necesita. Conversemos.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:contacto@lawkit.cl"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              contacto@lawkit.cl
            </a>
          </div>
        </Seccion>
      </div>

      {/* FOOTER */}
      <footer className="bg-carbon border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo light size="sm" />
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} lawkit — Software de gestión jurídica
          </p>
        </div>
      </footer>
    </div>
  )
}
