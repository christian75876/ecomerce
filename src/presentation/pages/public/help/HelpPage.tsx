import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';
import { ADMIN_EMAIL, ADMIN_WHATSAPP } from '@/shared/config/appContact';

/* ─── Types ─── */
type SectionId = 'comprador' | 'vendedor' | 'admin' | 'wpp';

interface StepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

interface AccordionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/* ─── Small components ─── */
const Step = ({ number, title, children }: StepProps) => (
  <div className='flex gap-4'>
    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white'>
      {number}
    </div>
    <div className='pb-6 flex-1 border-l border-slate-100 pl-4 last:border-0'>
      <p className='font-semibold text-slate-800'>{title}</p>
      <div className='mt-1 text-sm text-slate-500 space-y-1'>{children}</div>
    </div>
  </div>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className='flex gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800'>
    <i className='bx bx-info-circle mt-0.5 shrink-0 text-base text-sky-500' aria-hidden='true' />
    <span>{children}</span>
  </div>
);

const Warn = ({ children }: { children: React.ReactNode }) => (
  <div className='flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
    <i className='bx bx-error mt-0.5 shrink-0 text-base text-amber-500' aria-hidden='true' />
    <span>{children}</span>
  </div>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code className='rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-700'>
    {children}
  </code>
);

const Accordion = ({ title, icon, children, defaultOpen = false }: AccordionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='rounded-2xl border border-slate-200 bg-white overflow-hidden'>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='flex w-full items-center justify-between gap-3 px-5 py-4 text-left'
      >
        <div className='flex items-center gap-3'>
          <i className={`bx ${icon} text-xl text-primary`} aria-hidden='true' />
          <span className='font-semibold text-slate-800'>{title}</span>
        </div>
        <i className={`bx bx-chevron-down text-lg text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden='true' />
      </button>
      {open ? <div className='border-t border-slate-100 px-5 py-5 space-y-4'>{children}</div> : null}
    </div>
  );
};

/* ─── Section components ─── */
const SectionComprador = () => (
  <div className='space-y-3'>
    <Accordion icon='bx-search' title='Explorar el catálogo' defaultOpen>
      <Step number={1} title='Entra al catálogo'>
        <p>Haz clic en <strong>Productos</strong> en el menú superior. Verás todos los productos disponibles en el marketplace.</p>
      </Step>
      <Step number={2} title='Filtra por categoría'>
        <p>Usa los botones de categoría (ej. <em>Repuestos, Electrónica…</em>) para filtrar. Haz clic en <strong>Todo</strong> para quitar el filtro.</p>
      </Step>
      <Step number={3} title='Ordena los resultados'>
        <p>Usa el menú <strong>Más nuevos</strong> (esquina superior derecha del catálogo) para ordenar por precio o nombre.</p>
      </Step>
      <Step number={4} title='Busca un producto específico'>
        <p>Escribe en la barra de búsqueda del banner. Los resultados se actualizan al instante.</p>
      </Step>
    </Accordion>

    <Accordion icon='bx-cart' title='Agregar al carrito y hacer un pedido'>
      <Step number={1} title='Agrega productos al carrito'>
        <p>En la tarjeta del producto haz clic en <strong>+ Agregar</strong>. Verás una notificación verde confirmando la acción.</p>
      </Step>
      <Step number={2} title='Revisa tu carrito'>
        <p>Haz clic en <strong>Carrito</strong> en el menú. Puedes aumentar/disminuir cantidades o eliminar productos.</p>
      </Step>
      <Step number={3} title='Inicia sesión'>
        <p>Para confirmar un pedido debes tener cuenta. Si no tienes sesión activa, el carrito te pedirá iniciar sesión.</p>
      </Step>
      <Step number={4} title='Completa los datos del cliente'>
        <p>Ingresa tu nombre, apellido, correo y teléfono (opcional).</p>
      </Step>
      <Step number={5} title='Elige el método de entrega'>
        <p><strong>Recoger en tienda</strong> — coordinas directamente con la tienda.<br />
        <strong>Envío a domicilio</strong> — completa la dirección de entrega.</p>
      </Step>
      <Step number={6} title='Confirma el pedido'>
        <p>Revisa el resumen y haz clic en <strong>Confirmar pedido</strong>. Recibirás confirmación en pantalla.</p>
      </Step>
      <Tip>El carrito se guarda aunque cierres el navegador. Puedes continuar más tarde.</Tip>
    </Accordion>

    <Accordion icon='bx-receipt' title='Ver mis pedidos'>
      <Step number={1} title='Accede a Mis pedidos'>
        <p>En el menú superior haz clic en <strong>Mis pedidos</strong>. Necesitas estar autenticado.</p>
      </Step>
      <Step number={2} title='Consulta el estado'>
        <p>Cada pedido muestra su estado actual:</p>
        <ul className='mt-1 list-disc pl-4 space-y-0.5'>
          <li><strong>Pendiente</strong> — recibido, en revisión</li>
          <li><strong>Pagado</strong> — pago confirmado</li>
          <li><strong>En preparación</strong> — siendo alistado</li>
          <li><strong>Enviado</strong> — en camino</li>
          <li><strong>Entregado</strong> — completado</li>
          <li><strong>Cancelado</strong> — anulado</li>
        </ul>
      </Step>
    </Accordion>

    <Accordion icon='bx-heart' title='Favoritos'>
      <Step number={1} title='Guarda un producto'>
        <p>En la tarjeta del producto haz clic en el ícono <i className='bx bx-heart' />. El producto aparecerá en <strong>Favoritos</strong>.</p>
      </Step>
      <Step number={2} title='Gestiona tu lista'>
        <p>Ve a <strong>Favoritos</strong> en el menú. Puedes agregar al carrito directamente desde ahí o quitar productos de la lista.</p>
      </Step>
      <Tip>Necesitas estar autenticado para guardar favoritos.</Tip>
    </Accordion>
  </div>
);

const SectionVendedor = () => (
  <div className='space-y-3'>
    <Accordion icon='bx-envelope' title='Cómo registrarte como vendedor' defaultOpen>
      <Step number={1} title='Solicita una invitación'>
        <p>El acceso de vendedores es por invitación. Ve a <Link to={ROUTES.PUBLIC.REGISTER} className='text-primary underline'>Registro</Link> y usa los botones de contacto para solicitar acceso al administrador.</p>
      </Step>
      <Step number={2} title='Revisa tu correo'>
        <p>Recibirás un email con un enlace de invitación válido por <strong>48 horas</strong>. Haz clic en el enlace.</p>
      </Step>
      <Step number={3} title='Completa el formulario'>
        <p>El correo vendrá pre-llenado (no se puede cambiar). Completa tu nombre, teléfono y contraseña.</p>
      </Step>
      <Step number={4} title='Inicia sesión'>
        <p>Una vez creada la cuenta, inicia sesión con tu correo y contraseña. Tendrás acceso al panel de vendedor.</p>
      </Step>
      <Warn>Si el enlace expiró (más de 48 h), solicita una nueva invitación al administrador.</Warn>
    </Accordion>

    <Accordion icon='bx-store' title='Panel de administración — primeros pasos'>
      <Step number={1} title='Dashboard'>
        <p>Al iniciar sesión verás el <strong>Dashboard</strong> con métricas rápidas: ventas del día, pedidos recientes y stock crítico.</p>
      </Step>
      <Step number={2} title='Tus tiendas'>
        <p>En el menú ve a <strong>Catálogo → Tiendas</strong> para ver las tiendas asignadas a tu cuenta.</p>
      </Step>
      <Step number={3} title='Gestionar productos'>
        <p>Ve a <strong>Catálogo → Productos y fichas</strong>. Puedes crear, editar y activar/desactivar productos.</p>
      </Step>
    </Accordion>

    <Accordion icon='bx-receipt' title='Gestionar pedidos'>
      <Step number={1} title='Ver pedidos entrantes'>
        <p>Ve a <strong>Operación → Pedidos</strong>. Los pedidos nuevos aparecen arriba con estado <strong>Pendiente</strong>.</p>
      </Step>
      <Step number={2} title='Actualizar el estado'>
        <p>Haz clic en un pedido y usa el selector de estado para avanzarlo: <em>Pendiente → Pagado → En preparación → Enviado → Entregado</em>.</p>
      </Step>
      <Tip>Cuando llegue un pedido nuevo también recibirás una notificación en la campana (<i className='bx bx-bell' />) del panel.</Tip>
    </Accordion>

    <Accordion icon='bx-box' title='Inventario'>
      <Step number={1} title='Ver stock actual'>
        <p>Ve a <strong>Catálogo → Inventario general</strong>. Aquí ves el stock disponible de todos tus productos.</p>
      </Step>
      <Step number={2} title='Registrar entradas de stock'>
        <p>Usa el módulo de <strong>Compras</strong> (Abastecimiento → Compras) para registrar compras a proveedores. El stock se actualiza automáticamente.</p>
      </Step>
    </Accordion>
  </div>
);

const SectionAdmin = () => (
  <div className='space-y-3'>
    <Accordion icon='bxs-crown' title='Gestionar invitaciones' defaultOpen>
      <Step number={1} title='Ir a Invitaciones'>
        <p>En el menú ve a <strong>Control → Invitaciones</strong>.</p>
      </Step>
      <Step number={2} title='Enviar una invitación'>
        <p>Escribe el correo del futuro vendedor en el campo y haz clic en <strong>Enviar invitación</strong>. Le llegará un email con su enlace de registro.</p>
      </Step>
      <Step number={3} title='Monitorear el estado'>
        <p>La tabla muestra cada invitación con estado <strong>Pendiente</strong>, <strong>Aceptada</strong> o <strong>Expirada</strong>.</p>
      </Step>
      <Tip>Puedes reenviar una nueva invitación a la misma dirección; la anterior quedará expirada automáticamente.</Tip>
    </Accordion>

    <Accordion icon='bx-store' title='Crear y asignar tiendas'>
      <Step number={1} title='Crear una tienda'>
        <p>Ve a <strong>Catálogo → Tiendas</strong> y haz clic en <strong>Nueva tienda</strong>. Completa nombre, slug, colores y datos de contacto.</p>
      </Step>
      <Step number={2} title='Asignar al vendedor'>
        <p>Al crear o editar la tienda, asigna el <strong>ID del usuario vendedor</strong> en el campo <em>userId</em>. Esto le permite al vendedor ver y configurar su tienda desde Ajustes.</p>
      </Step>
    </Accordion>

    <Accordion icon='bx-category' title='Categorías, productos e inventario'>
      <Step number={1} title='Categorías'>
        <p>Ve a <strong>Catálogo → Categorías</strong> para crear las categorías del marketplace. Los productos se asignan a una categoría.</p>
      </Step>
      <Step number={2} title='Productos'>
        <p>Ve a <strong>Catálogo → Productos y fichas</strong> para gestionar el catálogo completo.</p>
      </Step>
      <Step number={3} title='Inventario general'>
        <p>Ve a <strong>Catálogo → Inventario general</strong> para ver el stock consolidado de todos los productos.</p>
      </Step>
    </Accordion>

    <Accordion icon='bx-history' title='Auditoría'>
      <Step number={1} title='Ver registros de actividad'>
        <p>Ve a <strong>Control → Auditoría</strong>. Aquí encontrarás un historial de todas las acciones importantes realizadas en la plataforma.</p>
      </Step>
    </Accordion>

    <Accordion icon='bx-wallet' title='Caja y POS'>
      <Step number={1} title='POS (Punto de venta)'>
        <p>Ve a <strong>Operación → POS</strong> para gestionar ventas presenciales. Busca productos, agrega al carrito y confirma la venta.</p>
      </Step>
      <Step number={2} title='Caja'>
        <p>Ve a <strong>Operación → Caja</strong> para registrar apertura/cierre de caja y ver el balance del día.</p>
      </Step>
    </Accordion>
  </div>
);

const SectionWhatsApp = () => (
  <div className='space-y-3'>
    <Accordion icon='bxl-whatsapp' title='Activar notificaciones de pedidos por WhatsApp' defaultOpen>
      <div className='rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 mb-4'>
        <p className='font-semibold'>¿Qué hace esta función?</p>
        <p className='mt-1'>Cuando un cliente confirme un pedido en tu tienda, recibirás automáticamente un mensaje de WhatsApp con el detalle del pedido — sin necesidad de estar mirando la app.</p>
      </div>

      <Step number={1} title='Abre WhatsApp en tu teléfono'>
        <p>Desde tu celular, abre WhatsApp y crea un nuevo chat.</p>
      </Step>

      <Step number={2} title='Busca el número de CallMeBot'>
        <p>Agrega a tus contactos el número: <Code>+34 644 59 72 87</Code></p>
        <p className='mt-1'>O escanea este enlace para abrirlo directo:</p>
        <a
          href='https://wa.me/34644597287'
          target='_blank'
          rel='noopener noreferrer'
          className='mt-2 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:opacity-90'
        >
          <i className='bx bxl-whatsapp text-base' aria-hidden='true' />
          Abrir chat con CallMeBot
        </a>
      </Step>

      <Step number={3} title='Envía el mensaje de activación'>
        <p>En el chat, escribe y envía <strong>exactamente</strong> este mensaje (cópialo tal cual):</p>
        <div className='mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 select-all'>
          I allow callmebot to send me messages
        </div>
        <Warn>El mensaje debe estar en inglés exactamente como está escrito. Cualquier cambio y no funcionará.</Warn>
      </Step>

      <Step number={4} title='Recibe tu API Key'>
        <p>En pocos segundos CallMeBot te responderá con un mensaje así:</p>
        <div className='mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 font-mono'>
          API Granted for +57 300 xxx xxxx - Your APIKEY is <strong className='text-primary'>1234567</strong>
        </div>
        <p className='mt-1'>Guarda ese número — es tu <strong>API Key</strong>.</p>
      </Step>

      <Step number={5} title='Configura en la plataforma'>
        <p>Entra al panel de administración y ve a <strong>Ajustes</strong> (ícono de engranaje en el menú).</p>
        <ol className='mt-1 list-decimal pl-4 space-y-1'>
          <li>Encuentra tu tienda en la lista.</li>
          <li>Activa el interruptor verde de <strong>Notificaciones WA</strong>.</li>
          <li>En el campo <strong>Número de WhatsApp</strong> ingresa tu número completo con código de país, sin espacios ni el signo +.<br />
            <Code>{ADMIN_WHATSAPP}</Code> (ejemplo Colombia)
          </li>
          <li>En el campo <strong>API Key de CallMeBot</strong> pega la key que recibiste.</li>
          <li>Haz clic en <strong>Guardar configuración</strong>.</li>
        </ol>
      </Step>

      <Step number={6} title='Prueba el sistema'>
        <p>Haz un pedido de prueba en tu tienda desde otra cuenta. Deberías recibir en tu WhatsApp un mensaje como este:</p>
        <div className='mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 font-mono whitespace-pre-line'>{`🛍️ Nuevo pedido
Cliente: Juan Pérez
Total: $150.000
Artículos: 2
Entrega: Envío a domicilio
Tienda: Mi Tienda`}</div>
      </Step>

      <Tip>Si no recibes el mensaje, verifica que el número esté en formato internacional sin + ni espacios, y que la API Key sea correcta.</Tip>
    </Accordion>

    <Accordion icon='bx-bell-off' title='Desactivar las notificaciones'>
      <Step number={1} title='Ir a Ajustes'>
        <p>Ve a <strong>Control → Ajustes</strong> en el menú del panel.</p>
      </Step>
      <Step number={2} title='Desactivar el interruptor'>
        <p>Haz clic en el interruptor verde junto a tu tienda. Cambiará a gris y las notificaciones se detendrán de inmediato.</p>
      </Step>
      <Tip>Tus datos (número y API Key) se conservan aunque desactives. Puedes reactivar cuando quieras sin volver a configurar.</Tip>
    </Accordion>

    <Accordion icon='bx-question-mark' title='Preguntas frecuentes'>
      <div className='space-y-4 text-sm text-slate-600'>
        <div>
          <p className='font-semibold text-slate-800'>¿CallMeBot tiene costo?</p>
          <p>No. CallMeBot es completamente gratuito para uso personal y pequeño volumen.</p>
        </div>
        <div>
          <p className='font-semibold text-slate-800'>¿Cada tienda necesita su propio registro?</p>
          <p>Sí. Cada número de WhatsApp debe registrarse por separado con CallMeBot y tiene su propia API Key.</p>
        </div>
        <div>
          <p className='font-semibold text-slate-800'>¿Puedo usar el mismo número en varias tiendas?</p>
          <p>Sí, mientras sea el mismo número de WhatsApp registrado. La API Key será la misma para ese número.</p>
        </div>
        <div>
          <p className='font-semibold text-slate-800'>¿Qué pasa si el número ya estaba registrado?</p>
          <p>Puedes volver a enviar el mensaje de activación. CallMeBot te confirmará tu API Key existente.</p>
        </div>
        <div>
          <p className='font-semibold text-slate-800'>El mensaje de activación no funciona</p>
          <p>Asegúrate de enviarlo en un chat directo con el número de CallMeBot (no en un grupo). El mensaje debe ser exactamente: <Code>I allow callmebot to send me messages</Code></p>
        </div>
      </div>
    </Accordion>
  </div>
);

/* ─── Main page ─── */
const SECTIONS: { id: SectionId; label: string; icon: string; color: string }[] = [
  { id: 'comprador', label: 'Compradores', icon: 'bx-user', color: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' },
  { id: 'vendedor', label: 'Vendedores', icon: 'bx-store', color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
  { id: 'admin', label: 'Administrador', icon: 'bxs-crown', color: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
  { id: 'wpp', label: 'WhatsApp', icon: 'bxl-whatsapp', color: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
];

const SECTIONS_BY_ROLE: Record<string, SectionId[]> = {
  admin:   ['comprador', 'vendedor', 'admin', 'wpp'],
  seller:  ['vendedor', 'wpp'],
  buyer:   ['comprador'],
  default: ['comprador'],
};

const HelpPage = () => {
  const role = getAuthenticatedRole() ?? 'default';
  const allowedIds = SECTIONS_BY_ROLE[role] ?? SECTIONS_BY_ROLE.default;

  const visibleSections = useMemo(
    () => SECTIONS.filter((s) => allowedIds.includes(s.id)),
    [role], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [active, setActive] = useState<SectionId>(() => allowedIds[0]);

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* Hero */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-12 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5' aria-hidden='true' />
        <div className='pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/5' aria-hidden='true' />
        <div className='relative z-10 max-w-2xl'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Documentación</p>
          <h1 className='mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl'>Centro de ayuda</h1>
          <p className='mt-2 text-sm text-white/70'>
            Guías paso a paso para compradores, vendedores y administradores.
          </p>
        </div>
      </div>

      {/* Tab selector */}
      <div className='flex flex-wrap gap-2'>
        {visibleSections.map((s) => (
          <button
            key={s.id}
            type='button'
            onClick={() => setActive(s.id)}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
              active === s.id
                ? 'bg-primary text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary'
            }`}
          >
            <i className={`bx ${s.icon} text-base`} aria-hidden='true' />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {active === 'comprador' ? <SectionComprador /> : null}
        {active === 'vendedor' ? <SectionVendedor /> : null}
        {active === 'admin' ? <SectionAdmin /> : null}
        {active === 'wpp' ? <SectionWhatsApp /> : null}
      </div>

      {/* Footer CTA */}
      <div className='rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm'>
        <i className='bx bx-support text-4xl text-primary' aria-hidden='true' />
        <h2 className='mt-3 text-lg font-semibold text-slate-800'>¿No encontraste lo que buscabas?</h2>
        <p className='mt-1 text-sm text-slate-500'>Contáctanos directamente y te ayudamos.</p>
        <div className='mt-4 flex flex-wrap justify-center gap-3'>
          <a
            href={`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent('Soporte Hot Commerce')}`}
            className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary'
          >
            <i className='bx bx-envelope text-base' aria-hidden='true' />
            Enviar email
          </a>
          <a
            href={`https://wa.me/${ADMIN_WHATSAPP}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
          >
            <i className='bx bxl-whatsapp text-base' aria-hidden='true' />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
