import { useState } from 'react';
import { useUsers } from '@/application/useCases/users/useUsers';
import { authSession } from '@/shared/utils/authSession';

const UsersPage = () => {
  const {
    users, roles, loading, submitting, actionIds,
    email, setEmail, password, setPassword, roleId, setRoleId,
    error, success,
    createUser, updateUserRole, toggleVerified, deleteUser,
  } = useUsers();

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const currentUserId = authSession.getUser()?.id ?? null;

  const handleDelete = (id: number) => {
    if (confirmDeleteId === id) {
      setConfirmDeleteId(null);
      void deleteUser(id);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className='space-y-6 animate-fade-up'>
      {/* Header */}
      <div className='gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-lg sm:px-10'>
        <div className='pointer-events-none absolute inset-0 opacity-10' aria-hidden='true' />
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/60'>Acceso controlado</p>
        <h1 className='mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl'>Usuarios de la plataforma</h1>
        <p className='mt-2 text-sm text-white/70'>
          Consulta, crea y administra el acceso de todos los usuarios registrados en Merku.
        </p>
      </div>

      {/* Create form */}
      <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='mb-4 text-base font-semibold text-slate-800'>Crear usuario</h2>
        <div className='flex flex-wrap gap-3'>
          <input
            type='email'
            placeholder='correo@usuario.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='min-w-[220px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
          />
          <input
            type='password'
            placeholder='Contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='min-w-[160px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
          />
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10'
          >
            <option value=''>Rol...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button
            type='button'
            onClick={() => void createUser()}
            disabled={submitting || !email.trim() || !password.trim() || !roleId}
            className='flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50'
          >
            <i className='bx bx-user-plus text-base' aria-hidden='true' />
            {submitting ? 'Creando...' : 'Crear usuario'}
          </button>
        </div>
        <p className='mt-3 text-xs text-slate-400'>
          El usuario queda verificado de inmediato — no se envía correo de verificación.
        </p>

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
            Usuarios
            {!loading ? <span className='ml-2 text-sm font-normal text-slate-400'>({users.length})</span> : null}
          </h2>
        </div>

        {loading ? (
          <div className='space-y-3 p-6'>
            {[1, 2, 3].map((i) => <div key={i} className='h-12 skeleton rounded-2xl' />)}
          </div>
        ) : users.length === 0 ? (
          <div className='flex flex-col items-center py-16 text-center'>
            <i className='bx bx-group mb-3 text-5xl text-slate-300' aria-hidden='true' />
            <p className='font-semibold text-slate-500'>Aún no hay usuarios</p>
          </div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {users.map((u) => {
              const busy = actionIds.has(u.id);
              const pendingDelete = confirmDeleteId === u.id;
              const isSelf = u.id === currentUserId;
              return (
                <div
                  key={u.id}
                  className='flex flex-wrap items-center gap-4 px-6 py-4'
                  onMouseLeave={() => { if (pendingDelete) setConfirmDeleteId(null); }}
                >
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium text-slate-800'>
                      {u.email} {isSelf ? <span className='text-xs text-slate-400'>(tú)</span> : null}
                    </p>
                    <p className='text-xs text-slate-400'>
                      Creado {new Date(u.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <select
                    value={u.roleId}
                    disabled={busy}
                    onChange={(e) => void updateUserRole(u.id, e.target.value)}
                    className='rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none transition focus:border-primary/40 disabled:opacity-40'
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  <button
                    type='button'
                    disabled={busy}
                    onClick={() => void toggleVerified(u.id, !u.isEmailVerified)}
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-40 ${
                      u.isEmailVerified ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    }`}
                    title='Clic para cambiar el estado de verificación'
                  >
                    {u.isEmailVerified ? 'Verificado' : 'Sin verificar'}
                  </button>

                  <button
                    type='button'
                    disabled={busy || isSelf}
                    onClick={() => handleDelete(u.id)}
                    title={isSelf ? 'No puedes eliminar tu propio usuario' : pendingDelete ? 'Confirmar eliminación' : 'Eliminar usuario'}
                    className={`flex h-8 flex-shrink-0 items-center gap-1.5 rounded-xl px-2 text-xs font-medium transition disabled:opacity-30 ${
                      pendingDelete
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'text-slate-400 hover:bg-slate-100 hover:text-red-500'
                    }`}
                  >
                    <i className='bx bx-trash text-base' aria-hidden='true' />
                    {pendingDelete ? 'Confirmar' : null}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
