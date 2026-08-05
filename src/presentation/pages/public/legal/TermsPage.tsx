import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

const APP_URL = import.meta.env.VITE_APP_URL ?? '';

const LAST_UPDATED = '1 de agosto de 2025';

const TermsPage = () => (
  <div className='mx-auto max-w-3xl space-y-8 px-4 py-10'>
    <Helmet>
      <title>Términos y condiciones — Merku</title>
      <meta name='description' content='Consulta los términos y condiciones de uso de Merku, la plataforma de marketplace y gestión de tiendas locales en Colombia.' />
      <link rel='canonical' href={`${APP_URL}/terminos`} />
      <meta name='robots' content='index, follow' />
    </Helmet>

    {/* Header */}
    <div>
      <Link to={ROUTES.PUBLIC.LANDING} className='mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary'>
        <i className='bx bx-arrow-back' /> Volver al inicio
      </Link>
      <h1 className='text-3xl font-extrabold text-slate-900'>Términos y condiciones de uso</h1>
      <p className='mt-2 text-sm text-slate-500'>Última actualización: {LAST_UPDATED}</p>
    </div>

    <Section title='1. Objeto'>
      <p>Los presentes Términos y Condiciones regulan el acceso y uso de la plataforma <strong>Merku</strong> (en adelante "la Plataforma"), operada por Merku SAS, sociedad constituida conforme a las leyes de la República de Colombia. Al registrarse o usar la Plataforma, el usuario acepta íntegramente estos términos.</p>
    </Section>

    <Section title='2. Definiciones'>
      <ul className='list-disc space-y-1 pl-5'>
        <li><strong>Merku / Plataforma:</strong> Servicio digital de marketplace y administración de inventario, punto de venta y tiendas en línea.</li>
        <li><strong>Vendedor:</strong> Persona natural o jurídica que crea y opera una tienda dentro de Merku.</li>
        <li><strong>Comprador / Usuario:</strong> Persona que navega o realiza pedidos en la Plataforma.</li>
        <li><strong>Cuenta:</strong> Credenciales de acceso registradas en la Plataforma.</li>
        <li><strong>Contenido:</strong> Textos, imágenes, precios y cualquier información publicada en la Plataforma.</li>
      </ul>
    </Section>

    <Section title='3. Registro y cuenta'>
      <p>Para acceder a las funciones de vendedor, el usuario debe crear una cuenta con información veraz, completa y actualizada. Cada persona solo puede registrar una cuenta. El usuario es responsable de mantener la confidencialidad de sus credenciales y de todas las acciones realizadas con su cuenta.</p>
      <p className='mt-3'>Merku se reserva el derecho de suspender o eliminar cuentas que incumplan estos términos, presenten información falsa o realicen actividades fraudulentas.</p>
    </Section>

    <Section title='4. Uso aceptable de la Plataforma'>
      <p>El usuario se compromete a:</p>
      <ul className='mt-2 list-disc space-y-1 pl-5'>
        <li>Publicar únicamente productos y servicios lícitos conforme a la legislación colombiana.</li>
        <li>No inducir a error sobre las características, precio o disponibilidad de los productos.</li>
        <li>No utilizar la Plataforma para distribuir spam, malware ni contenido ilegal.</li>
        <li>Respetar los derechos de propiedad intelectual de terceros.</li>
        <li>No intentar acceder sin autorización a sistemas, datos o cuentas ajenas.</li>
      </ul>
    </Section>

    <Section title='5. Responsabilidades del vendedor'>
      <p>El Vendedor es el único responsable de:</p>
      <ul className='mt-2 list-disc space-y-1 pl-5'>
        <li>La veracidad y exactitud del catálogo de productos publicado.</li>
        <li>El cumplimiento de los pedidos recibidos a través de la Plataforma.</li>
        <li>El cobro y declaración de los impuestos aplicables (IVA, impuesto al consumo, etc.).</li>
        <li>La calidad y legalidad de los productos o servicios ofrecidos.</li>
        <li>La atención postventa y resolución de reclamaciones de los compradores.</li>
      </ul>
      <p className='mt-3'>Merku actúa como facilitador tecnológico y no como parte en las transacciones comerciales entre vendedores y compradores.</p>
    </Section>

    <Section title='6. Tarifas y comisiones'>
      <p>Los planes, tarifas y comisiones vigentes se publican en la Plataforma y pueden consultarse en el área de Suscripciones. Merku podrá modificar las tarifas con un preaviso de al menos 30 días calendario comunicado por correo electrónico o mediante notificación dentro de la Plataforma.</p>
    </Section>

    <Section title='7. Propiedad intelectual'>
      <p>Merku y sus logos, nombre, diseño y código fuente son propiedad de Merku SAS y están protegidos por las leyes colombianas e internacionales de propiedad intelectual. El Vendedor concede a Merku una licencia no exclusiva para mostrar su catálogo en la Plataforma durante la vigencia de su suscripción.</p>
    </Section>

    <Section title='8. Privacidad y protección de datos'>
      <p>El tratamiento de datos personales se rige por nuestra <Link to={ROUTES.PUBLIC.PRIVACY} className='font-medium text-primary hover:underline'>Política de Privacidad</Link>, conforme a la Ley 1581 de 2012 y el Decreto 1074 de 2015 de la República de Colombia.</p>
    </Section>

    <Section title='9. Limitación de responsabilidad'>
      <p>En la máxima medida permitida por la ley, Merku no será responsable por daños indirectos, lucro cesante, pérdida de datos ni interrupciones del servicio causadas por eventos fuera de su control razonable. La responsabilidad total de Merku frente al Vendedor se limita al valor pagado por la suscripción en los últimos 3 meses.</p>
    </Section>

    <Section title='10. Suspensión y terminación'>
      <p>Cualquiera de las partes puede terminar la relación contractual con previo aviso de 15 días. Merku podrá suspender el acceso de forma inmediata si detecta un incumplimiento grave de estos Términos, actividad fraudulenta o riesgo para otros usuarios.</p>
    </Section>

    <Section title='11. Modificaciones'>
      <p>Merku puede actualizar estos Términos en cualquier momento. Las modificaciones se notificarán con al menos 15 días de anticipación. El uso continuado de la Plataforma después de dicho plazo implica la aceptación de los nuevos términos.</p>
    </Section>

    <Section title='12. Ley aplicable y jurisdicción'>
      <p>Estos Términos se rigen por las leyes de la República de Colombia. Cualquier controversia que no se resuelva de forma amistosa será dirimida por los jueces competentes de la ciudad de Bogotá D.C., Colombia.</p>
    </Section>

    <Section title='13. Contacto'>
      <p>Para consultas o reclamaciones sobre estos Términos, escriba a <strong>legal@merku.co</strong> o comuníquese a través del canal de soporte disponible en la Plataforma.</p>
    </Section>
  </div>
);

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='rounded-2xl border border-slate-100 bg-white p-6 shadow-sm'>
      <h2 className='mb-3 text-base font-bold text-slate-800'>{title}</h2>
      <div className='space-y-2 text-sm leading-relaxed text-slate-600'>{children}</div>
    </section>
  );
}

export default TermsPage;
