import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { ADMIN_WHATSAPP } from '@/shared/config/appContact';
import { isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';

const whatsappHref = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent('Hola, me interesa abrir mi tienda en Merku. ¿Cómo empiezo?')}`;

// ── Navbar ────────────────────────────────────────────────────────────────────

const Navbar = () => {
  const authed = isAuthenticated();
  return (
    <nav className='fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-md'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5'>
        <Link to='/' className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white'>
            <i className='bx bx-store-alt text-lg' />
          </div>
          <span className='text-lg font-black tracking-tight text-slate-800'>Merku</span>
        </Link>

        <div className='flex items-center gap-2'>
          <Link
            to={ROUTES.PUBLIC.STORES}
            className='hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 sm:block'
          >
            Explorar tiendas
          </Link>
          {authed ? (
            <Link
              to={ROUTES.PUBLIC.HOME}
              className='rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark'
            >
              Ir al marketplace
            </Link>
          ) : (
            <>
              <Link
                to={ROUTES.PUBLIC.LOGIN}
                className='rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100'
              >
                Ingresar
              </Link>
              <Link
                to={ROUTES.PUBLIC.REGISTER}
                className='rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark'
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// ── Hero ──────────────────────────────────────────────────────────────────────

const Hero = () => (
  <section className='relative overflow-hidden pt-24 pb-20'>
    {/* background blobs */}
    <div className='pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl' />
    <div className='pointer-events-none absolute top-10 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl' />

    <div className='relative mx-auto max-w-6xl px-5'>
      <div className='mx-auto max-w-3xl text-center'>
        <span className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary'>
          <i className='bx bx-map-pin' /> Tiendas locales · Colombia
        </span>

        <h1 className='mt-4 text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl'>
          Tu mercado local,{' '}
          <span className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
            en un solo lugar
          </span>
        </h1>

        <p className='mx-auto mt-5 max-w-xl text-lg text-slate-500'>
          Descubre tiendas cercanas, compra con confianza y paga a tu manera. Sin intermediarios, sin complicaciones.
        </p>

        <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
          <Link
            to={ROUTES.PUBLIC.STORES}
            className='flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark hover:-translate-y-0.5'
          >
            <i className='bx bx-store text-base' />
            Explorar tiendas
          </Link>
          <a
            href={whatsappHref}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary hover:-translate-y-0.5'
          >
            <i className='bx bxl-whatsapp text-base text-[#25D366]' />
            Quiero vender aquí
          </a>
        </div>
      </div>

      {/* mockup strip */}
      <div className='mt-14 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6'>
        {CATEGORY_ICONS.map((c) => (
          <div
            key={c.label}
            className='flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-4 shadow-sm transition hover:border-primary/20 hover:shadow-md'
          >
            <span className='text-2xl'>{c.emoji}</span>
            <span className='text-[11px] font-medium text-slate-500'>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CATEGORY_ICONS = [
  { emoji: '🥗', label: 'Comida' },
  { emoji: '👗', label: 'Ropa' },
  { emoji: '💄', label: 'Belleza' },
  { emoji: '📱', label: 'Tecnología' },
  { emoji: '🌿', label: 'Natural' },
  { emoji: '🏠', label: 'Hogar' },
  { emoji: '🎮', label: 'Juguetes' },
  { emoji: '📚', label: 'Libros' },
  { emoji: '🐾', label: 'Mascotas' },
  { emoji: '🧴', label: 'Cuidado' },
  { emoji: '⚽', label: 'Deporte' },
  { emoji: '🛍️', label: 'Más' },
];

// ── Stats ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '50+', label: 'Tiendas activas', icon: 'bx-store-alt' },
  { value: '7,500+', label: 'Productos publicados', icon: 'bx-package' },
  { value: '2,500', label: 'Visitas diarias', icon: 'bx-user-check' },
  { value: '100%', label: 'Pago seguro', icon: 'bx-shield-check' },
];

const Stats = () => (
  <section className='bg-gradient-to-r from-primary to-secondary py-12'>
    <div className='mx-auto max-w-6xl px-5'>
      <div className='grid grid-cols-2 gap-6 sm:grid-cols-4'>
        {STATS.map((s) => (
          <div key={s.label} className='text-center'>
            <i className={`bx ${s.icon} mb-1 text-2xl text-white/70`} />
            <p className='text-3xl font-black text-white'>{s.value}</p>
            <p className='mt-1 text-sm text-white/70'>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── How it works (buyers) ─────────────────────────────────────────────────────

const BUYER_STEPS = [
  {
    step: '01',
    icon: 'bx-search-alt',
    title: 'Explora tiendas locales',
    desc: 'Encuentra tiendas de tu ciudad con catálogos completos, fotos reales y precios actualizados.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    step: '02',
    icon: 'bx-cart-add',
    title: 'Agrega al carrito',
    desc: 'Selecciona los productos que quieres, aplica cupones de descuento y elige entrega a domicilio o recoge tú mismo.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    step: '03',
    icon: 'bx-transfer',
    title: 'Paga con transferencia',
    desc: 'Paga por Nequi, Bancolombia o el método que prefieras. Sube tu comprobante y la tienda confirma en minutos.',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

const HowItWorks = () => (
  <section className='py-20 bg-white'>
    <div className='mx-auto max-w-6xl px-5'>
      <div className='mb-12 text-center'>
        <span className='text-xs font-bold uppercase tracking-widest text-primary'>Para compradores</span>
        <h2 className='mt-2 text-3xl font-black text-slate-800 sm:text-4xl'>Comprar en Merku es fácil</h2>
        <p className='mt-3 text-slate-500'>Tres pasos y tu pedido está en camino.</p>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {BUYER_STEPS.map((s) => (
          <div key={s.step} className='relative rounded-3xl border border-slate-100 bg-slate-50 p-7 transition hover:border-primary/20 hover:shadow-lg'>
            <span className='absolute right-5 top-5 text-5xl font-black text-slate-100'>{s.step}</span>
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${s.color}`}>
              <i className={`bx ${s.icon} text-2xl`} />
            </div>
            <h3 className='text-lg font-bold text-slate-800'>{s.title}</h3>
            <p className='mt-2 text-sm leading-relaxed text-slate-500'>{s.desc}</p>
          </div>
        ))}
      </div>

      <div className='mt-8 text-center'>
        <Link
          to={ROUTES.PUBLIC.REGISTER}
          className='inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/25 transition hover:bg-primary-dark'
        >
          <i className='bx bx-user-plus' /> Crear cuenta gratis
        </Link>
      </div>
    </div>
  </section>
);

// ── For sellers ───────────────────────────────────────────────────────────────

const SELLER_FEATURES = [
  {
    icon: 'bx-store',
    title: 'Tu tienda online en minutos',
    desc: 'Crea tu catálogo con fotos, precios y stock. Tus clientes pueden encontrarte en el mapa y hacer pedidos 24/7.',
  },
  {
    icon: 'bx-receipt',
    title: 'POS integrado',
    desc: 'Registra ventas presenciales desde la misma plataforma. Todo queda en tu historial automáticamente.',
  },
  {
    icon: 'bx-package',
    title: 'Inventario en tiempo real',
    desc: 'Controla tu stock, entradas y salidas. El sistema te avisa cuando un producto está por agotarse.',
  },
  {
    icon: 'bx-bell',
    title: 'Pedidos con notificaciones',
    desc: 'Recibe alertas al instante cuando llega un nuevo pedido. Confirma pagos y actualiza estados con un clic.',
  },
  {
    icon: 'bx-transfer-alt',
    title: 'Comprobantes de pago',
    desc: 'Tus clientes suben la foto del pago. Tú la verificas y confirmas. Sin pasarela, sin comisiones externas.',
  },
  {
    icon: 'bx-line-chart',
    title: 'Dashboard de ventas',
    desc: 'Mira tus ventas del día, productos más vendidos y movimientos de caja desde el panel de control.',
  },
];

const ForSellers = () => (
  <section className='py-20 bg-slate-50'>
    <div className='mx-auto max-w-6xl px-5'>
      <div className='mb-12 text-center'>
        <span className='text-xs font-bold uppercase tracking-widest text-accent'>Para vendedores</span>
        <h2 className='mt-2 text-3xl font-black text-slate-800 sm:text-4xl'>Todo lo que necesitas para vender</h2>
        <p className='mt-3 text-slate-500'>Una sola herramienta para tu tienda física y tu canal online.</p>
      </div>

      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {SELLER_FEATURES.map((f) => (
          <div key={f.title} className='rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:shadow-md'>
            <div className='mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10'>
              <i className={`bx ${f.icon} text-xl text-primary`} />
            </div>
            <h3 className='font-bold text-slate-800'>{f.title}</h3>
            <p className='mt-1.5 text-sm leading-relaxed text-slate-500'>{f.desc}</p>
          </div>
        ))}
      </div>

      <div className='mt-10 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 text-center text-white md:p-12'>
        <h3 className='text-2xl font-black sm:text-3xl'>¿Listo para abrir tu tienda?</h3>
        <p className='mt-3 text-white/80'>El acceso de vendedores es por invitación. Escríbenos y te activamos en menos de 24 horas.</p>
        <a
          href={whatsappHref}
          target='_blank'
          rel='noopener noreferrer'
          className='mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl'
        >
          <i className='bx bxl-whatsapp text-lg text-[#25D366]' />
          Solicitar acceso por WhatsApp
        </a>
      </div>
    </div>
  </section>
);

// ── Trust ─────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  { icon: 'bx-lock-alt', title: 'Pagos con evidencia', desc: 'El comprador sube el comprobante. La tienda verifica antes de despachar.' },
  { icon: 'bx-map', title: 'Tiendas con dirección', desc: 'Cada tienda tiene ubicación real. Puedes recoger en el local si quieres.' },
  { icon: 'bx-support', title: 'Soporte directo', desc: 'Cualquier duda la resolvemos por WhatsApp. Sin bots, sin esperas.' },
];

const Trust = () => (
  <section className='py-20 bg-white'>
    <div className='mx-auto max-w-6xl px-5'>
      <div className='mb-12 text-center'>
        <h2 className='text-3xl font-black text-slate-800 sm:text-4xl'>Compra con confianza</h2>
        <p className='mt-3 text-slate-500'>Diseñado para proteger tanto al comprador como al vendedor.</p>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        {TRUST_ITEMS.map((t) => (
          <div key={t.title} className='flex gap-4 rounded-3xl border border-slate-100 p-6'>
            <div className='mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50'>
              <i className={`bx ${t.icon} text-xl text-emerald-600`} />
            </div>
            <div>
              <h3 className='font-bold text-slate-800'>{t.title}</h3>
              <p className='mt-1 text-sm text-slate-500'>{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Final CTA ─────────────────────────────────────────────────────────────────

const FinalCta = () => (
  <section className='py-20 bg-slate-50'>
    <div className='mx-auto max-w-2xl px-5 text-center'>
      <h2 className='text-3xl font-black text-slate-800 sm:text-4xl'>Empieza hoy</h2>
      <p className='mt-4 text-slate-500 text-lg'>
        Crea tu cuenta gratis como comprador o escríbenos para abrir tu tienda.
      </p>
      <div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
        <Link
          to={ROUTES.PUBLIC.REGISTER}
          className='flex items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-dark hover:-translate-y-0.5'
        >
          <i className='bx bx-user-plus' /> Crear cuenta gratis
        </Link>
        <Link
          to={ROUTES.PUBLIC.STORES}
          className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary hover:-translate-y-0.5'
        >
          <i className='bx bx-search-alt' /> Ver tiendas sin registrarse
        </Link>
      </div>
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────────────────────────────

const Footer = () => (
  <footer className='border-t border-slate-100 bg-white py-10'>
    <div className='mx-auto max-w-6xl px-5'>
      <div className='flex flex-col items-center justify-between gap-6 md:flex-row'>
        <Link to='/' className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white'>
            <i className='bx bx-store-alt text-lg' />
          </div>
          <span className='text-lg font-black text-slate-800'>Merku</span>
        </Link>

        <div className='flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500'>
          <Link to={ROUTES.PUBLIC.STORES} className='hover:text-primary'>Tiendas</Link>
          <Link to={ROUTES.PUBLIC.STORE_MAP} className='hover:text-primary'>Mapa</Link>
          <Link to={ROUTES.PUBLIC.HELP} className='hover:text-primary'>Ayuda</Link>
          <Link to={ROUTES.PUBLIC.LOGIN} className='hover:text-primary'>Ingresar</Link>
          <a href={whatsappHref} target='_blank' rel='noopener noreferrer' className='hover:text-primary'>
            Contacto
          </a>
          <Link to={ROUTES.PUBLIC.TERMS} className='hover:text-primary'>Términos</Link>
          <Link to={ROUTES.PUBLIC.PRIVACY} className='hover:text-primary'>Privacidad</Link>
        </div>

        <p className='text-xs text-slate-400'>© {new Date().getFullYear()} Merku. Hecho en Colombia 🇨🇴</p>
      </div>
    </div>
  </footer>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const LandingPage = () => (
  <>
    <Helmet>
      <title>Merku — Abre tu tienda online y vende más</title>
      <meta name='description' content='Merku es la plataforma para abrir tu tienda online, gestionar inventario, recibir pedidos y vender más. Gratis para empezar.' />
      <link rel='canonical' href={`${import.meta.env.VITE_APP_URL ?? ''}/bienvenida`} />
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='Merku' />
      <meta property='og:url' content={`${import.meta.env.VITE_APP_URL ?? ''}/bienvenida`} />
      <meta property='og:title' content='Merku — Abre tu tienda online y vende más' />
      <meta property='og:description' content='Merku es la plataforma para abrir tu tienda online, gestionar inventario, recibir pedidos y vender más.' />
      <meta property='og:image' content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.svg`} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content='Merku — Abre tu tienda online y vende más' />
      <meta name='twitter:description' content='Abre tu tienda, gestiona inventario y recibe pedidos con Merku.' />
      <meta name='twitter:image' content={`${import.meta.env.VITE_APP_URL ?? ''}/og-image.svg`} />
    </Helmet>
    <div className='min-h-screen bg-white'>
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <ForSellers />
      <Trust />
      <FinalCta />
      <Footer />
    </div>
  </>
);

export default LandingPage;
