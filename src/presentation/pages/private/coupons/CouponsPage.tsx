import { useEffect, useState } from 'react';
import { CouponsRepository } from '@/infrastructure/repositories/api/coupons/CouponsRepository';
import type { ICoupon, ICreateCouponRequest, CouponType } from '@/application/dtos/coupons/CouponDtos';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { formatDate } from '@/shared/utils/formatDate';
import { showToast } from '@/shared/utils/SnackbarManager';

const EMPTY_FORM: ICreateCouponRequest = {
  code: '',
  type: 'PERCENTAGE',
  value: 0,
  minOrderAmount: undefined,
  maxUses: undefined,
  expiresAt: undefined,
};

const statusBadge = (coupon: ICoupon) => {
  if (!coupon.isActive) return { label: 'Inactivo', cls: 'bg-slate-100 text-slate-500' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return { label: 'Expirado', cls: 'bg-red-100 text-red-600' };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return { label: 'Agotado', cls: 'bg-orange-100 text-orange-600' };
  return { label: 'Activo', cls: 'bg-green-100 text-green-700' };
};

const CouponsPage = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<ICreateCouponRequest>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await CouponsRepository.getCoupons();
      setCoupons(res.data);
    } catch {
      showToast('No se pudieron cargar los cupones', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || form.value <= 0) {
      showToast('Código y valor son obligatorios', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await CouponsRepository.createCoupon({
        ...form,
        code: form.code.trim().toUpperCase(),
        minOrderAmount: form.minOrderAmount || undefined,
        maxUses: form.maxUses || undefined,
        expiresAt: form.expiresAt || undefined,
      });
      setForm(EMPTY_FORM);
      await load();
      showToast('Cupón creado', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo crear el cupón', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await CouponsRepository.deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      showToast('Cupón eliminado', 'success');
    } catch {
      showToast('No se pudo eliminar el cupón', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='rounded-[2rem] bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_55%,_#fef3c7_100%)] px-6 py-10 shadow-sm'>
        <h1 className='text-3xl font-bold text-slate-800'>Cupones y descuentos</h1>
        <p className='mt-3 max-w-2xl text-slate-500'>
          Crea códigos de descuento que tus clientes pueden aplicar al finalizar su pedido.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[380px_1fr]'>
        {/* ── Create form ── */}
        <div className='rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm'>
          <h2 className='mb-5 text-lg font-semibold text-slate-800'>Nuevo cupón</h2>
          <form onSubmit={(e) => { void handleSubmit(e); }} className='space-y-4'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>Código</label>
              <input
                className={inputCls}
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder='Ej: VERANO20'
                maxLength={50}
                required
              />
              <p className='mt-1 text-[11px] text-slate-400'>Solo mayúsculas, números, - y _</p>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>Tipo</label>
                <select
                  className={inputCls}
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CouponType }))}
                >
                  <option value='PERCENTAGE'>Porcentaje (%)</option>
                  <option value='FIXED'>Valor fijo ($)</option>
                </select>
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  {form.type === 'PERCENTAGE' ? 'Descuento (%)' : 'Valor ($)'}
                </label>
                <input
                  type='number'
                  className={inputCls}
                  value={form.value || ''}
                  onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                  min={0.01}
                  max={form.type === 'PERCENTAGE' ? 100 : undefined}
                  step={form.type === 'PERCENTAGE' ? 1 : 1000}
                  required
                />
              </div>
            </div>

            <div>
              <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>Pedido mínimo (opcional)</label>
              <input
                type='number'
                className={inputCls}
                value={form.minOrderAmount || ''}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder='Sin mínimo'
                min={0}
                step={1000}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>Usos máx. (opcional)</label>
                <input
                  type='number'
                  className={inputCls}
                  value={form.maxUses || ''}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder='Ilimitado'
                  min={1}
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'>Expira (opcional)</label>
                <input
                  type='date'
                  className={inputCls}
                  value={form.expiresAt ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value || undefined }))}
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={submitting}
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-50 active:scale-95'
            >
              {submitting
                ? <><i className='bx bx-loader-alt animate-spin text-base' />Creando...</>
                : <><i className='bx bx-plus text-base' />Crear cupón</>}
            </button>
          </form>
        </div>

        {/* ── Coupons list ── */}
        <div className='rounded-[1.75rem] border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-100 px-6 py-4'>
            <h2 className='text-lg font-semibold text-slate-800'>
              Cupones creados
              {!loading ? <span className='ml-2 text-sm font-normal text-slate-400'>({coupons.length})</span> : null}
            </h2>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-16'>
              <i className='bx bx-loader-alt animate-spin text-3xl text-primary' />
            </div>
          ) : coupons.length === 0 ? (
            <div className='flex flex-col items-center py-16 text-center'>
              <i className='bx bx-purchase-tag text-4xl text-slate-300' />
              <p className='mt-3 text-sm font-medium text-slate-400'>No hay cupones creados</p>
            </div>
          ) : (
            <div className='divide-y divide-slate-100'>
              {coupons.map((c) => {
                const badge = statusBadge(c);
                return (
                  <div key={c.id} className='flex items-center gap-4 px-6 py-4'>
                    {/* Code */}
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm font-bold tracking-wider text-slate-800'>{c.code}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>{badge.label}</span>
                      </div>
                      <div className='mt-1 flex flex-wrap gap-3 text-xs text-slate-500'>
                        <span>
                          <i className='bx bx-discount mr-1' />
                          {c.type === 'PERCENTAGE' ? `${c.value}% off` : `${formatCurrencyCOP(c.value)} off`}
                        </span>
                        {c.minOrderAmount ? (
                          <span>mín. {formatCurrencyCOP(c.minOrderAmount)}</span>
                        ) : null}
                        <span>{c.usedCount}{c.maxUses !== null ? `/${c.maxUses}` : ''} usos</span>
                        {c.expiresAt ? (
                          <span>vence {formatDate(c.expiresAt)}</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      type='button'
                      onClick={() => { void handleDelete(c.id); }}
                      disabled={deleting === c.id}
                      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40'
                      aria-label='Eliminar cupón'
                    >
                      {deleting === c.id
                        ? <i className='bx bx-loader-alt animate-spin text-sm' />
                        : <i className='bx bx-trash text-sm' />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsPage;
