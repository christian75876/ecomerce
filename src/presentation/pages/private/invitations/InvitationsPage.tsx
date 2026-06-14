import { useInvitations } from '@/application/useCases/invitations/useInvitations';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  EXPIRED: 'Expirada',
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  EXPIRED: 'bg-slate-100 text-slate-500',
};

const InvitationsPage = () => {
  const { invitations, loading, submitting, email, setEmail, error, success, sendInvitation } =
    useInvitations();

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* Header */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute inset-0 opacity-10' aria-hidden='true' />
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Acceso controlado</p>
        <h1 className='mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl'>Invitaciones de vendedores</h1>
        <p className='mt-2 text-sm text-white/70'>
          Envía invitaciones por email para que los vendedores puedan crear su tienda.
        </p>
      </div>

      {/* Send form */}
      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-base font-semibold text-slate-800'>Invitar nuevo vendedor</h2>
        <div className='flex gap-3'>
          <input
            type='email'
            placeholder='correo@vendedor.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void sendInvitation(); }}
            className='flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
          />
          <button
            type='button'
            onClick={() => void sendInvitation()}
            disabled={submitting || !email.trim()}
            className='flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
          >
            <i className='bx bx-send text-base' aria-hidden='true' />
            {submitting ? 'Enviando...' : 'Enviar invitación'}
          </button>
        </div>

        {error ? (
          <div className='mt-3 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700'>
            <i className='bx bx-error-circle' aria-hidden='true' /> {error}
          </div>
        ) : null}
        {success ? (
          <div className='mt-3 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700'>
            <i className='bx bx-check-circle' aria-hidden='true' /> {success}
          </div>
        ) : null}
      </div>

      {/* List */}
      <div className='rounded-3xl border border-slate-200 bg-white shadow-sm'>
        <div className='border-b border-slate-100 px-6 py-4'>
          <h2 className='text-base font-semibold text-slate-800'>
            Invitaciones enviadas
            {!loading ? <span className='ml-2 text-sm font-normal text-slate-400'>({invitations.length})</span> : null}
          </h2>
        </div>

        {loading ? (
          <div className='space-y-3 p-6'>
            {[1, 2, 3].map((i) => <div key={i} className='h-12 skeleton rounded-2xl' />)}
          </div>
        ) : invitations.length === 0 ? (
          <div className='flex flex-col items-center py-16 text-center'>
            <i className='bx bx-envelope mb-3 text-5xl text-slate-300' aria-hidden='true' />
            <p className='font-semibold text-slate-500'>Aún no hay invitaciones</p>
            <p className='mt-1 text-sm text-slate-400'>Usa el formulario de arriba para invitar vendedores.</p>
          </div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {invitations.map((inv) => (
              <div key={inv.id} className='flex items-center justify-between px-6 py-4'>
                <div className='min-w-0'>
                  <p className='truncate font-medium text-slate-800'>{inv.email}</p>
                  <p className='text-xs text-slate-400'>
                    Enviada {new Date(inv.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {inv.status === 'PENDING'
                      ? ` · Expira ${new Date(inv.expiresAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}`
                      : inv.acceptedAt
                      ? ` · Aceptada ${new Date(inv.acceptedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}`
                      : null}
                  </p>
                </div>
                <span className={`ml-4 flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[inv.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {STATUS_LABEL[inv.status] ?? inv.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPage;
