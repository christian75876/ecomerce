import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import {
  ISalesHistoryFilters,
  saleToGuestInfo,
  useSalesHistory,
} from '@/application/useCases/sales/useSalesHistory';
import { PosReceiptModal } from '@/presentation/ui/organisms/pos/PosReceiptModal';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { formatDate } from '@/shared/utils/formatDate';

// ── Helpers ──────────────────────────────────────────────────────────────────

function clientName(sale: ISale): string {
  if (sale.customer) return `${sale.customer.firstName} ${sale.customer.lastName}`;
  if (sale.guestName) return sale.guestName;
  return 'Sin nombre';
}

function paymentMethodLabel(sale: ISale): string {
  if (sale.paymentMethod === 'CASH') return 'Efectivo';
  if (sale.paymentMethod === 'CREDIT') return 'Crédito';
  return sale.paymentMethodLabel ?? 'Pago en línea';
}

function buildWhatsAppUrl(sale: ISale): string {
  const guest = saleToGuestInfo(sale);
  const name = clientName(sale);
  const lines = [
    `🧾 *Comprobante de Venta*`,
    sale.store?.name ? `📍 ${sale.store.name}` : '',
    `📅 ${formatDate(sale.createdAt)}`,
    `🔖 Ref: #${sale.id.slice(0, 8).toUpperCase()}`,
    `---`,
    ...sale.items.map((i) => `• ${i.product.name} ×${i.quantity} = ${formatCurrencyCOP(i.lineTotal)}`),
    `---`,
    `💰 *Total: ${formatCurrencyCOP(sale.total)}*`,
    `Método: ${paymentMethodLabel(sale)}`,
    name !== 'Sin nombre' ? `👤 ${name}` : '',
    guest?.doc ? `📄 ${guest.docType} ${guest.doc}` : '',
    guest?.phone ? `📱 ${guest.phone}` : '',
    sale.deliveryType === 'SHIPPING' ? `\n🚚 *Envío a domicilio*` : '',
    sale.deliveryType === 'SHIPPING' && sale.deliveryAddress ? `📍 ${sale.deliveryAddress}` : '',
    sale.deliveryType === 'SHIPPING' && sale.deliveryCity ? `🏙️ ${sale.deliveryCity}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const phone = guest?.phone ? guest.phone.replace(/\D/g, '') : '';
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(lines)}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeliveryBadge({ type }: { type: string | null | undefined }) {
  if (type === 'SHIPPING')
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600'>
        <i className='bx bx-package text-xs' /> Envío
      </span>
    );
  if (type === 'LOCAL')
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600'>
        <i className='bx bx-store text-xs' /> Local
      </span>
    );
  return null;
}

function PaymentBadge({ sale }: { sale: ISale }) {
  if (sale.paymentMethod === 'CREDIT') {
    return (
      <span className='rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600'>
        Crédito
      </span>
    );
  }
  if (sale.paymentMethod === 'CASH') {
    return (
      <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500'>
        Efectivo
      </span>
    );
  }
  return (
    <span className='rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700'>
      {paymentMethodLabel(sale)}
    </span>
  );
}

function SourceBadge({ source }: { source: ISale['source'] }) {
  if (source !== 'ONLINE') return null;
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary'>
      <i className='bx bx-globe text-xs' /> En línea
    </span>
  );
}

function SaleCard({
  sale,
  selected,
  onClick,
}: {
  sale: ISale;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-primary bg-primary/[0.04] shadow-sm'
          : 'border-slate-200 bg-white hover:border-primary/40 hover:shadow-sm'
      }`}
    >
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <span className='font-mono text-xs font-bold text-slate-400'>
              #{sale.id.slice(0, 8).toUpperCase()}
            </span>
            <SourceBadge source={sale.source} />
            <PaymentBadge sale={sale} />
            <DeliveryBadge type={sale.deliveryType} />
          </div>
          <p className='mt-1.5 truncate text-sm font-semibold text-slate-800'>{clientName(sale)}</p>
          <p className='mt-0.5 text-xs text-slate-400'>
            {sale.items.length > 0
              ? `${sale.items.length} ${sale.items.length === 1 ? 'artículo' : 'artículos'}`
              : ''}
            {sale.store?.name ? ` · ${sale.store.name}` : ''}
          </p>
        </div>
        <div className='shrink-0 text-right'>
          <p className='text-base font-bold text-slate-800'>{formatCurrencyCOP(sale.total)}</p>
          <p className='mt-0.5 text-[10px] text-slate-400'>{formatDate(sale.createdAt)}</p>
        </div>
      </div>
    </button>
  );
}

function SaleDetail({
  sale,
  loading,
  onClose,
  onPrint,
}: {
  sale: ISale;
  loading: boolean;
  onClose: () => void;
  onPrint: () => void;
}) {
  const guest = saleToGuestInfo(sale);
  const name = clientName(sale);

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
      {/* Header */}
      <div className='flex items-start justify-between border-b border-slate-100 px-5 py-4'>
        <div>
          <div className='flex items-center gap-1.5'>
            <p className='font-mono text-xs font-bold text-slate-400'>
              #{sale.id.slice(0, 8).toUpperCase()}
            </p>
            <SourceBadge source={sale.source} />
          </div>
          <p className='mt-0.5 text-sm font-semibold text-slate-700'>
            {sale.store?.name ?? 'Venta POS'}
          </p>
          <p className='mt-0.5 text-xs text-slate-400'>{formatDate(sale.createdAt)}</p>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100'
        >
          <i className='bx bx-x text-xl' />
        </button>
      </div>

      {loading ? (
        <div className='flex items-center justify-center py-12 text-slate-400'>
          <i className='bx bx-loader-alt animate-spin text-2xl' />
        </div>
      ) : (
        <>
          {/* Items */}
          <div className='px-5 py-4'>
            <p className='mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
              Artículos
            </p>
            <div className='space-y-2'>
              {sale.items.map((item, idx) => (
                <div key={item.id || idx} className='flex justify-between text-sm'>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium text-slate-800'>{item.product.name}</p>
                    <p className='text-xs text-slate-400'>
                      {item.quantity} × {formatCurrencyCOP(item.unitPrice)}
                    </p>
                  </div>
                  <p className='ml-3 shrink-0 font-semibold text-slate-700'>
                    {formatCurrencyCOP(item.lineTotal)}
                  </p>
                </div>
              ))}
            </div>

            <div className='mt-4 border-t border-dashed border-slate-200 pt-3'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-slate-800'>Total</span>
                <span className='text-lg font-bold text-slate-800'>
                  {formatCurrencyCOP(sale.total)}
                </span>
              </div>
              <div className='mt-1 flex items-center justify-between text-xs text-slate-500'>
                <span>Método de pago</span>
                <PaymentBadge sale={sale} />
              </div>
            </div>
          </div>

          {/* Customer info */}
          {(name !== 'Sin nombre' || guest?.doc || guest?.phone) && (
            <div className='border-t border-slate-100 px-5 py-4'>
              <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                {sale.customer ? 'Cliente registrado' : 'Datos del cliente'}
              </p>
              <div className='space-y-1 text-sm text-slate-700'>
                {name !== 'Sin nombre' && (
                  <p className='flex items-center gap-2'>
                    <i className='bx bx-user shrink-0 text-slate-400' />
                    {name}
                  </p>
                )}
                {guest?.doc && (
                  <p className='flex items-center gap-2'>
                    <i className='bx bx-id-card shrink-0 text-slate-400' />
                    {guest.docType} {guest.doc}
                  </p>
                )}
                {guest?.phone && (
                  <p className='flex items-center gap-2'>
                    <i className='bx bxl-whatsapp shrink-0 text-green-500' />
                    {guest.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Delivery */}
          {sale.deliveryType && (
            <div className='border-t border-slate-100 px-5 py-4'>
              <p className='mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                {sale.deliveryType === 'SHIPPING' ? 'Datos de envío' : 'Entrega'}
              </p>
              {sale.deliveryType === 'LOCAL' ? (
                <p className='flex items-center gap-2 text-sm text-emerald-700'>
                  <i className='bx bx-store' /> Retiro en local
                </p>
              ) : (
                <div className='space-y-1 text-sm text-slate-700'>
                  {sale.deliveryAddress && (
                    <p className='flex items-start gap-2'>
                      <i className='bx bx-map-pin mt-0.5 shrink-0 text-blue-500' />
                      {sale.deliveryAddress}
                    </p>
                  )}
                  {sale.deliveryCity && (
                    <p className='flex items-center gap-2'>
                      <i className='bx bx-buildings shrink-0 text-slate-400' />
                      {sale.deliveryCity}
                    </p>
                  )}
                  {sale.deliveryNotes && (
                    <p className='flex items-start gap-2 text-xs text-slate-500'>
                      <i className='bx bx-note mt-0.5 shrink-0' />
                      {sale.deliveryNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className='border-t border-slate-100 px-5 py-4'>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={onPrint}
                className='flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
              >
                <i className='bx bx-printer text-base' />
                Imprimir
              </button>
              {(guest?.phone || sale.guestPhone || sale.items.length > 0) && (
                <button
                  type='button'
                  onClick={() => window.open(buildWhatsAppUrl(sale), '_blank')}
                  className='flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-300 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-100'
                >
                  <i className='bx bxl-whatsapp text-base' />
                  WhatsApp
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FiltersBar({
  filters,
  onUpdate,
  onReset,
}: {
  filters: ISalesHistoryFilters;
  onUpdate: <K extends keyof ISalesHistoryFilters>(k: K, v: ISalesHistoryFilters[K]) => void;
  onReset: () => void;
}) {
  const hasActive =
    filters.search ||
    filters.paymentMethod ||
    filters.deliveryType ||
    filters.from ||
    filters.to;

  const inputCls =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto_auto]'>
        {/* Search */}
        <div className='relative'>
          <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            placeholder='Buscar por nombre, ref o documento…'
            value={filters.search}
            onChange={(e) => onUpdate('search', e.target.value)}
            className={`${inputCls} w-full pl-9`}
          />
        </div>

        {/* From */}
        <input
          type='date'
          value={filters.from}
          onChange={(e) => onUpdate('from', e.target.value)}
          className={inputCls}
          title='Desde'
        />

        {/* To */}
        <input
          type='date'
          value={filters.to}
          onChange={(e) => onUpdate('to', e.target.value)}
          className={inputCls}
          title='Hasta'
        />

        {/* Payment method */}
        <select
          value={filters.paymentMethod}
          onChange={(e) => onUpdate('paymentMethod', e.target.value as ISalesHistoryFilters['paymentMethod'])}
          className={inputCls}
        >
          <option value=''>Todos los métodos</option>
          <option value='CASH'>Efectivo</option>
          <option value='CREDIT'>Crédito</option>
        </select>

        {/* Delivery type */}
        <select
          value={filters.deliveryType}
          onChange={(e) => onUpdate('deliveryType', e.target.value as ISalesHistoryFilters['deliveryType'])}
          className={inputCls}
        >
          <option value=''>Todas las entregas</option>
          <option value='LOCAL'>Retiro en local</option>
          <option value='SHIPPING'>Envío a domicilio</option>
          <option value='NONE'>Sin entrega</option>
        </select>

        {/* Clear button */}
        {hasActive ? (
          <button
            type='button'
            onClick={onReset}
            className='flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 transition hover:border-red-300 hover:text-red-500'
          >
            <i className='bx bx-x text-base' />
            Limpiar
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className='mt-4 flex items-center justify-between gap-2'>
      <p className='text-xs text-slate-400'>{total} ventas</p>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className='flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40'
        >
          <i className='bx bx-chevron-left text-lg' />
        </button>
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} className='px-1 text-xs text-slate-400'>…</span>
          ) : (
            <button
              key={p}
              type='button'
              onClick={() => onPage(p)}
              className={`flex h-8 min-w-[2rem] items-center justify-center rounded-xl border px-2 text-xs font-semibold transition ${
                p === page
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type='button'
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
          className='flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40'
        >
          <i className='bx bx-chevron-right text-lg' />
        </button>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const SalesHistoryPage = () => {
  const {
    result,
    selectedSale,
    loading,
    detailLoading,
    error,
    filters,
    page,
    printSale,
    updateFilter,
    resetFilters,
    setPage,
    selectSale,
    closeSale,
    openPrint,
    closePrint,
  } = useSalesHistory();

  const items = result?.items ?? [];
  const totalPages = result?.totalPages ?? 1;
  const total = result?.total ?? 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-slate-800'>Historial de Ventas</h1>
        <p className='mt-1 text-sm text-slate-500'>
          Consulta, filtra y re-imprime todas las ventas registradas
        </p>
      </div>

      {/* Filters */}
      <FiltersBar filters={filters} onUpdate={updateFilter} onReset={resetFilters} />

      {/* Content */}
      {error ? (
        <div className='flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600'>
          <i className='bx bx-error-circle shrink-0 text-xl' />
          {error}
        </div>
      ) : (
        <div className='grid gap-6 lg:grid-cols-[400px_1fr]'>
          {/* Left — sales list */}
          <div>
            {loading ? (
              <div className='flex items-center justify-center py-20 text-slate-400'>
                <i className='bx bx-loader-alt animate-spin text-3xl' />
              </div>
            ) : items.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-20 text-center'>
                <i className='bx bx-receipt mb-3 text-4xl text-slate-200' />
                <p className='text-sm font-semibold text-slate-400'>Sin resultados</p>
                <p className='mt-1 text-xs text-slate-300'>
                  Prueba ajustando los filtros de búsqueda
                </p>
              </div>
            ) : (
              <>
                <div className='space-y-2'>
                  {items.map((sale) => (
                    <SaleCard
                      key={sale.id}
                      sale={sale}
                      selected={selectedSale?.id === sale.id}
                      onClick={() => void selectSale(sale)}
                    />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  onPage={setPage}
                />
              </>
            )}
          </div>

          {/* Right — detail panel (desktop) */}
          <div className='hidden lg:block'>
            {selectedSale ? (
              <div className='sticky top-6'>
                <SaleDetail
                  sale={selectedSale}
                  loading={detailLoading}
                  onClose={closeSale}
                  onPrint={() => openPrint(selectedSale)}
                />
              </div>
            ) : (
              <div className='flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 text-center'>
                <i className='bx bx-file-blank mb-3 text-4xl text-slate-200' />
                <p className='text-sm font-semibold text-slate-400'>Selecciona una venta</p>
                <p className='mt-1 text-xs text-slate-300'>
                  Haz clic en una venta para ver el detalle
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile detail bottom sheet */}
      {selectedSale && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div className='absolute inset-0 bg-black/50' onClick={closeSale} />
          <div className='absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white'>
            <div className='sticky top-0 flex justify-center pt-3 pb-1 bg-white'>
              <div className='h-1 w-10 rounded-full bg-slate-200' />
            </div>
            <div className='px-4 pb-8'>
              <SaleDetail
                sale={selectedSale}
                loading={detailLoading}
                onClose={closeSale}
                onPrint={() => openPrint(selectedSale)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Print overlay */}
      {printSale && (
        <PosReceiptModal
          sale={printSale}
          guestInfo={saleToGuestInfo(printSale)}
          onClose={closePrint}
        />
      )}
    </div>
  );
};

export default SalesHistoryPage;
