import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

const APP_URL = import.meta.env.VITE_APP_URL ?? '';

const LAST_UPDATED = '25 de agosto de 2026';

const PrivacyPage = () => (
  <div className='mx-auto max-w-3xl space-y-8 px-4 py-10'>
    <Helmet>
      <title>Política de privacidad — Merku</title>
      <meta name='description' content='Conoce cómo Merku recopila, usa y protege tus datos personales conforme a la Ley 1581 de 2012 de Colombia.' />
      <link rel='canonical' href={`${APP_URL}/privacidad`} />
      <meta name='robots' content='index, follow' />
    </Helmet>

    {/* Header */}
    <div>
      <Link to={ROUTES.PUBLIC.HOME} className='mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary'>
        <i className='bx bx-arrow-back' /> Volver al inicio
      </Link>
      <h1 className='text-3xl font-extrabold text-slate-900'>Política de privacidad y tratamiento de datos</h1>
      <p className='mt-2 text-sm text-slate-500'>Última actualización: {LAST_UPDATED}</p>
      <p className='mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700'>
        Esta política cumple con la <strong>Ley 1581 de 2012</strong> y su Decreto Reglamentario 1074 de 2015 sobre protección de datos personales en Colombia.
      </p>
    </div>

    <Section title='1. Responsable del tratamiento'>
      <p><strong>Merku SAS</strong>, identificada con NIT [pendiente de actualización], con domicilio en la República de Colombia.</p>
      <p className='mt-2'>Correo de contacto para asuntos de privacidad: <strong>privacidad@merku.co</strong></p>
    </Section>

    <Section title='2. Datos personales que recopilamos'>
      <p>Merku recopila las siguientes categorías de datos:</p>
      <ul className='mt-2 list-disc space-y-1 pl-5'>
        <li><strong>Datos de registro:</strong> Nombre completo, correo electrónico, número de teléfono y contraseña cifrada.</li>
        <li><strong>Datos del negocio (vendedores):</strong> Nombre de la tienda, dirección, NIT o cédula de representante, imágenes del catálogo.</li>
        <li><strong>Datos de uso:</strong> Historial de pedidos, productos visualizados, preferencias de compra y registros de actividad.</li>
        <li><strong>Datos técnicos:</strong> Dirección IP, tipo de dispositivo, sistema operativo, versión del navegador y cookies de sesión.</li>
      </ul>
      <p className='mt-3'>No recopilamos datos sensibles según el artículo 5 de la Ley 1581 (salud, orientación sexual, filiación política, datos biométricos, etc.) salvo cuando el titular los proporcione voluntariamente para habilitar funciones específicas.</p>
    </Section>

    <Section title='3. Finalidades del tratamiento'>
      <ul className='list-disc space-y-1 pl-5'>
        <li>Operar, mantener y mejorar la Plataforma y sus funcionalidades.</li>
        <li>Gestionar el registro de usuarios y la autenticación segura.</li>
        <li>Procesar y hacer seguimiento de pedidos y transacciones.</li>
        <li>Enviar notificaciones transaccionales (confirmación de pedido, cambios de estado).</li>
        <li>Enviar comunicaciones de marketing y novedades (solo con consentimiento explícito).</li>
        <li>Cumplir obligaciones legales, contables y fiscales.</li>
        <li>Prevenir fraudes y garantizar la seguridad de la Plataforma.</li>
        <li>Generar estadísticas e informes de desempeño para los vendedores (datos agregados).</li>
      </ul>
    </Section>

    <Section title='4. Base legal del tratamiento'>
      <p>El tratamiento de datos personales se sustenta en:</p>
      <ul className='mt-2 list-disc space-y-1 pl-5'>
        <li><strong>Consentimiento:</strong> Otorgado al crear una cuenta y aceptar esta política.</li>
        <li><strong>Ejecución de contrato:</strong> Necesario para prestar los servicios contratados.</li>
        <li><strong>Interés legítimo:</strong> Prevención de fraudes, seguridad de la plataforma.</li>
        <li><strong>Obligación legal:</strong> Cumplimiento de normativa fiscal y contable colombiana.</li>
      </ul>
    </Section>

    <Section title='5. Transferencia y transmisión de datos'>
      <p>Merku puede compartir datos personales con:</p>
      <ul className='mt-2 list-disc space-y-1 pl-5'>
        <li><strong>Proveedores de servicios:</strong> Alojamiento en la nube, pasarelas de pago, servicios de correo electrónico y analítica, con cláusulas contractuales de confidencialidad.</li>
        <li><strong>Autoridades:</strong> Cuando sea requerido por mandato legal, orden judicial o autoridad competente.</li>
        <li><strong>Otros vendedores de la plataforma:</strong> Exclusivamente los datos necesarios para completar un pedido (nombre del comprador y dirección de entrega).</li>
      </ul>
      <p className='mt-3'>Merku no vende ni cede datos personales a terceros para fines publicitarios propios de dichos terceros.</p>
    </Section>

    <Section title='6. Derechos del titular de los datos'>
      <p>Conforme al artículo 8 de la Ley 1581 de 2012, usted tiene derecho a:</p>
      <ul className='mt-2 list-disc space-y-1 pl-5'>
        <li><strong>Conocer:</strong> Los datos que tenemos sobre usted y para qué fines se utilizan.</li>
        <li><strong>Actualizar y rectificar:</strong> Corregir datos inexactos, incompletos o desactualizados.</li>
        <li><strong>Suprimir:</strong> Eliminar su cuenta directamente desde "Mi perfil" en la Plataforma, o solicitarlo por correo, cuando sus datos no sean necesarios para las finalidades declaradas. Si su cuenta tiene pedidos o transacciones asociadas, sus datos de identificación se anonimizan (en vez de borrarse por completo) para conservar el registro contable y fiscal que exige la ley, sin que puedan volver a vincularse a usted.</li>
        <li><strong>Revocar el consentimiento:</strong> Retirar el consentimiento dado para tratamientos que no sean necesarios para la ejecución del contrato.</li>
        <li><strong>Acceder gratuitamente:</strong> Conocer de forma gratuita sus datos personales al menos una vez al mes.</li>
        <li><strong>Presentar quejas:</strong> Ante la Superintendencia de Industria y Comercio (SIC) si considera que sus derechos han sido vulnerados (<a href='https://www.sic.gov.co' target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>www.sic.gov.co</a>).</li>
      </ul>
      <p className='mt-3'>Para ejercer estos derechos, envíe su solicitud a <strong>privacidad@merku.co</strong>. Atenderemos su petición en los plazos establecidos por la ley (máximo 15 días hábiles para consultas; 15 días hábiles para reclamos).</p>
    </Section>

    <Section title='7. Seguridad de los datos'>
      <p>Merku implementa medidas técnicas, administrativas y físicas para proteger sus datos personales contra accesos no autorizados, pérdida, alteración o divulgación, incluyendo cifrado en tránsito (TLS), contraseñas cifradas con bcrypt, y controles de acceso por roles.</p>
      <p className='mt-3'>En caso de una brecha de seguridad que afecte datos personales, notificaremos a los titulares y a la SIC en los términos que exige la normativa vigente.</p>
    </Section>

    <Section title='8. Cookies y tecnologías similares'>
      <p>La Plataforma utiliza cookies esenciales (sesión, autenticación) y cookies analíticas (comportamiento de uso) para mejorar la experiencia. Puede deshabilitar las cookies no esenciales desde la configuración de su navegador, aunque algunas funcionalidades podrían verse limitadas.</p>
    </Section>

    <Section title='9. Vigencia de la política y datos'>
      <p>Esta política entra en vigencia desde la fecha de su última actualización. Los datos personales se conservarán durante el tiempo que la cuenta esté activa y hasta 5 años adicionales para cumplir obligaciones legales y fiscales.</p>
      <p className='mt-3'>Merku se reserva el derecho de actualizar esta política. Notificaremos cualquier cambio relevante a través de la Plataforma o por correo electrónico con al menos 15 días de anticipación.</p>
    </Section>

    <Section title='10. Contacto'>
      <p>Para ejercer sus derechos, presentar consultas o reclamos sobre el tratamiento de sus datos personales, contáctenos en:</p>
      <ul className='mt-2 list-disc pl-5'>
        <li>Correo electrónico: <strong>privacidad@merku.co</strong></li>
        <li>A través del soporte disponible en la Plataforma</li>
      </ul>
      <p className='mt-3'>También puede consultar nuestros <Link to={ROUTES.PUBLIC.TERMS} className='font-medium text-primary hover:underline'>Términos y Condiciones</Link>.</p>
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

export default PrivacyPage;
