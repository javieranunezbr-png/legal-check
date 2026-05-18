import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/ui/Logo'

/* ----------------------------------------------------------------- */
/* Datos                                                              */

const PROBLEMAS = [
  'Pierdes horas en Excel y WhatsApp en vez de ejercer.',
  'Persigues las cuotas de honorarios una por una, a mano.',
  'Te enteras tarde de una audiencia o un plazo que ya venció.',
  'El software legal que existe es caro, pesado y nadie lo entiende.',
]

const MODULOS = [
  ['Clientes y causas', 'Cada cliente, sus causas y documentos en una ficha. Encuentras lo que buscas en segundos, no revolviendo carpetas.'],
  ['Presupuestos que se aceptan solos', 'Envías el presupuesto por correo o WhatsApp y el prospecto lo acepta desde un link. Cierras antes y sin fricción.'],
  ['Cobra sin perseguir a nadie', 'Al aceptar el presupuesto se generan todas las cuotas. Ves qué está pagado, pendiente o vencido, con alertas automáticas.'],
  ['Portal del cliente', 'Tras el primer pago el cliente completa sus datos solo. Tú recibes la ficha lista, sin pedirla tres veces.'],
  ['Nunca más un plazo perdido', 'Audiencias, gestiones y vencimientos en una agenda que te avisa lo que corre esta semana.'],
  ['Con la cara de tu estudio', 'Los correos y el portal salen con tu identidad. El cliente ve a tu estudio, profesional y serio.'],
]

const FLUJO = [
  ['Presupuesto', 'Lo creas y lo envías por correo o WhatsApp en un minuto.'],
  ['Aceptación', 'El prospecto lo acepta desde un link, sin registrarse.'],
  ['Cobro', 'Se generan el acuerdo y todas las cuotas automáticamente.'],
  ['Portal', 'Con el primer pago, el cliente completa su ficha y queda activo.'],
  ['Gestión', 'Causas, cobros y agenda, todo desde un solo panel.'],
]

const DIFERENCIADORES = [
  'Todo el ciclo del cliente en un solo lugar, no cinco herramientas sueltas.',
  'Del presupuesto al cliente activo en automático, sin pasos manuales.',
  'Precio accesible, pensado para el abogado independiente, no para el corporativo.',
  'Lo usas el primer día, sin manuales ni capacitación.',
]

const VISION = [
  'Mandato y contrato de prestación de servicios generados automáticamente.',
  'Firma electrónica avanzada del contrato desde el link del cliente.',
  'Asesorías online con agenda y pago integrado.',
  'Emisión de boletas y facturas con integración tributaria.',
  'Seguimiento de causas en tribunales con alertas de plazos.',
]

const PLANES = [
  ['Solo', 'El abogado independiente que trabaja por su cuenta.'],
  ['Estudio', 'Un estudio jurídico con su equipo de abogados.'],
  ['Pro', 'Estudios con varios abogados y mayor volumen de casos.'],
]

/* ----------------------------------------------------------------- */
/* Primitivas de movimiento                                           */

function Rise({ delay = 0, as: Tag = 'div', className = '', children }) {
  return (
    <Tag className={`lk-rise ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

/* Reveal al hacer scroll (IntersectionObserver, una vez) */
function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`lk-reveal ${shown ? 'in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  )
}

/* Visual de producto: mini-panel de lawkit con vida */
function ProductoVisual() {
  const dias = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const eventos = { 3: 'audiencia', 8: 'gestion', 9: 'gestion', 16: 'reunion', 22: 'plazo' }
  const dot = {
    audiencia: 'bg-red-400', gestion: 'bg-primary',
    reunion: 'bg-sky-500', plazo: 'bg-amber-400',
  }
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-primary/5 rounded-[2rem] -z-10" />
      <div className="bg-white rounded-2xl border border-line shadow-2xl shadow-primary/10 p-5 rotate-1 transition-transform duration-500 hover:rotate-0">
        <div className="flex items-center gap-1.5 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
          <span className="w-2.5 h-2.5 rounded-full bg-line" />
          <span className="ml-3 text-[11px] font-medium text-muted">Agenda · esta semana</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {dias.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-muted pb-1">{d}</div>
          ))}
          {Array.from({ length: 28 }, (_, i) => {
            const n = i + 1
            const ev = eventos[n]
            const hoy = n === 9
            return (
              <div key={n} className={`aspect-square rounded-md flex flex-col items-center justify-center text-[10px] ${
                hoy ? 'bg-primary text-white font-semibold' : 'bg-soft text-carbon/70'
              }`}>
                {n}
                {ev && <span className={`w-1 h-1 rounded-full mt-0.5 ${hoy ? 'bg-white lk-pulse' : dot[ev]}`} />}
              </div>
            )
          })}
        </div>
        <div className="mt-5 pt-4 border-t border-line">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="font-medium text-carbon">Honorarios · 4 de 6 cuotas</span>
            <span className="text-muted">66%</span>
          </div>
          <div className="h-2 rounded-full bg-soft overflow-hidden">
            <div className="h-full rounded-full bg-primary lk-grow" style={{ width: '66%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- */

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8)
    f()
    window.addEventListener('scroll', f, { passive: true })
    return () => window.removeEventListener('scroll', f)
  }, [])

  return (
    <div className="min-h-screen bg-bone text-carbon antialiased">

      {/* NAV con reacción al scroll */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-bone/90 backdrop-blur-md border-b border-line shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Logo size="md" animated />
          <nav className="hidden sm:flex items-center gap-8 text-sm text-muted">
            <a href="#producto" className="lk-navlink hover:text-carbon transition-colors">Producto</a>
            <a href="#flujo" className="lk-navlink hover:text-carbon transition-colors">Cómo funciona</a>
            <a href="#vision" className="lk-navlink hover:text-carbon transition-colors">Visión</a>
          </nav>
          <Link
            to="/login"
            className="text-sm font-semibold text-carbon hover:text-primary transition-colors"
          >
            Acceso clientes
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 pb-28 sm:pt-28 sm:pb-36">
        <div className="grid lg:grid-cols-12 gap-14 lg:gap-10 items-center">
          <div className="lg:col-span-7">
            <Rise as="p" className="text-sm font-semibold text-primary tracking-wide">
              Software de gestión para abogados
            </Rise>
            <Rise as="h1" delay={80}
              className="mt-5 font-display font-extrabold tracking-[-0.02em] text-carbon text-5xl sm:text-7xl leading-[1.0]">
              Todo tu estudio,
              <br />
              <span className="text-primary">en un solo lugar.</span>
            </Rise>
            <Rise as="p" delay={160}
              className="mt-7 text-lg text-ink2 leading-relaxed max-w-xl">
              Clientes, presupuestos, cobros en cuotas y agenda, conectados
              entre sí. Cierra presupuestos más rápido, cobra a tiempo y no
              vuelvas a perder un plazo. Deja la planilla atrás.
            </Rise>
            <Rise delay={240} className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#flujo"
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 transition-all duration-300">
                Ver cómo funciona
              </a>
              <a href="#contacto"
                className="px-6 py-3 rounded-lg font-semibold text-primary hover:bg-soft transition-colors">
                Contáctanos
              </a>
            </Rise>
          </div>
          <Rise delay={340} className="lg:col-span-5">
            <ProductoVisual />
          </Rise>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="bg-carbon text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-28">
          <div className="grid lg:grid-cols-12 gap-12">
            <Reveal as="h2" className="lg:col-span-5 font-display font-bold tracking-[-0.015em] text-3xl sm:text-4xl leading-tight">
              El abogado independiente pierde tiempo y dinero en administración.
            </Reveal>
            <ol className="lg:col-span-7 lg:pt-2">
              {PROBLEMAS.map((p, i) => (
                <Reveal as="li" key={i} delay={i * 90}
                  className="flex gap-5 py-5 border-b border-white/10 last:border-0">
                  <span className="font-display text-sm text-primary tabular-nums pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-lg text-zinc-300 leading-relaxed">{p}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PRODUCTO */}
      <section id="producto" className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <h2 className="font-display font-bold tracking-[-0.015em] text-3xl sm:text-4xl leading-tight">
              Una plataforma para todo el ciclo del cliente
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Desde el primer presupuesto hasta la gestión completa del caso.
              Cada pieza conectada con la siguiente.
            </p>
          </Reveal>
          <div className="lg:col-span-8">
            {MODULOS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 70}
                className="group grid sm:grid-cols-12 gap-2 sm:gap-6 py-7 border-t border-line first:border-0 first:pt-0 transition-colors hover:bg-soft/60 rounded-lg sm:px-4 sm:-mx-4">
                <div className="sm:col-span-5 flex items-baseline gap-4">
                  <span className="font-display text-sm text-primary tabular-nums transition-transform duration-300 group-hover:-translate-y-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display font-bold text-xl text-carbon">{t}</h3>
                </div>
                <p className="sm:col-span-7 text-muted leading-relaxed">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FLUJO — grafito, línea de conexión animada */}
      <section id="flujo" className="bg-carbon text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-28">
          <Reveal as="h2" className="font-display font-bold tracking-[-0.015em] text-3xl sm:text-5xl leading-tight max-w-2xl">
            Del presupuesto al cliente activo, <span className="text-primary">en automático.</span>
          </Reveal>
          <div className="relative mt-16">
            <div className="hidden lg:block absolute top-[14px] left-0 right-0 h-px bg-white/15" />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
              {FLUJO.map(([t, d], i) => (
                <Reveal key={t} delay={i * 110} className="relative">
                  <div className="relative inline-flex items-center justify-center w-7 h-7 rounded-full bg-carbon ring-1 ring-primary/40">
                    <span className="font-display text-xs font-extrabold text-primary tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display font-bold text-lg">{t}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIADORES */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <Reveal className="lg:col-span-5">
            <h2 className="font-display font-bold tracking-[-0.015em] text-3xl sm:text-4xl leading-tight">
              Diseñado para quien la competencia ignora
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Los sistemas existentes son caros y complejos. lawkit nace para el
              abogado independiente y los estudios que necesitan ordenarse sin
              fricción.
            </p>
          </Reveal>
          <ul className="lg:col-span-7">
            {DIFERENCIADORES.map((d, i) => (
              <Reveal as="li" key={i} delay={i * 80}
                className="flex gap-5 py-6 border-b border-line last:border-0">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="none"
                  stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg text-carbon/90 leading-relaxed">{d}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* MODELO DE NEGOCIO */}
      <section className="bg-soft">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-28">
          <Reveal className="max-w-2xl">
            <h2 className="font-display font-bold tracking-[-0.015em] text-3xl sm:text-4xl leading-tight">
              Suscripción mensual, sin instalaciones
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              Software como servicio, con planes según el tamaño del estudio.
              Los valores se definen al cierre del desarrollo en curso.
            </p>
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-line border-y border-line">
            {PLANES.map(([t, d], i) => (
              <Reveal key={t} delay={i * 90}
                className="px-0 sm:px-8 py-8 first:pl-0 last:pr-0">
                <h3 className="font-display font-bold text-xl text-carbon">Plan {t}</h3>
                <p className="mt-3 text-sm text-muted leading-relaxed">{d}</p>
                <p className="mt-6 text-xs font-semibold text-primary">Disponible próximamente</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VISIÓN */}
      <section id="vision" className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <h2 className="font-display font-bold tracking-[-0.015em] text-3xl sm:text-4xl leading-tight">
              Hacia el estudio totalmente digital
            </h2>
            <p className="mt-5 text-muted leading-relaxed">
              El núcleo de gestión ya opera. La hoja de ruta avanza hacia la
              automatización completa del trabajo legal.
            </p>
          </Reveal>
          <ol className="lg:col-span-8">
            {VISION.map((v, i) => (
              <Reveal as="li" key={i} delay={i * 70}
                className="flex gap-5 py-6 border-b border-line last:border-0">
                <span className="font-display text-sm text-primary tabular-nums pt-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-lg text-carbon/90 leading-relaxed">{v}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="bg-carbon text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-24 sm:py-32">
          <Reveal as="h2" className="font-display font-extrabold tracking-[-0.02em] text-4xl sm:text-6xl leading-[1.03] max-w-3xl">
            Tu estudio puede funcionar mejor. <span className="text-primary">Hablemos.</span>
          </Reveal>
          <Reveal as="p" delay={120} className="mt-6 text-lg text-zinc-400 max-w-xl leading-relaxed">
            Estamos construyendo el software de gestión que el abogado
            independiente realmente puede usar. Cuéntanos de tu estudio.
          </Reveal>
          <Reveal delay={220}>
            <a href="mailto:contacto@lawkit.cl"
              className="mt-10 inline-block bg-primary text-white px-7 py-3.5 rounded-lg font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark hover:-translate-y-0.5 transition-all duration-300">
              contacto@lawkit.cl
            </a>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-carbon border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo light size="sm" />
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} lawkit. Software de gestión jurídica.
          </p>
        </div>
      </footer>
    </div>
  )
}
