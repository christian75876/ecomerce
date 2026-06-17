import { useState } from 'react';
import { PosCartItem } from '@/application/useCases/pos/usePosManagement';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { ReceiptModal } from '@/presentation/ui/organisms/pos/ReceiptModal';

// ── Customer SearchCombobox ───────────────────────────────────────────────────
const CustomerCombobox = ({
  customers,
  value,
  onChange,
  disabled
}: {
  customers: ICustomer[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const items = customers.map(c => ({
    id: c.id,
    label: `${c.firstName} ${c.lastName}`,
    secondary: `Saldo: ${formatCurrencyCOP(Number(c.creditBalance))}`
  }));

  const selected = items.find(i => i.id === value) ?? null;
  const filtered = query.trim()
    ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div className='relative w-full'>
      {selected ? (
        <div className='flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3'>
          <i className='bx bx-user text-primary' />
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold text-primary'>
              {selected.label}
            </p>
            <p className='text-xs text-slate-400'>{selected.secondary}</p>
          </div>
          <button
            type='button'
            onClick={() => onChange('')}
            disabled={disabled}
            className='text-slate-400 hover:text-red-500'
          >
            <i className='bx bx-x' />
          </button>
        </div>
      ) : (
        <>
          <div className='relative'>
            <i className='bx bx-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400' />
            <input
              value={open ? query : ''}
              onChange={e => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() =>
                setTimeout(() => {
                  setOpen(false);
                  setQuery('');
                }, 200)
              }
              placeholder='Buscar cliente para crédito…'
              disabled={disabled}
              className='w-full rounded-2xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10 disabled:opacity-50'
            />
          </div>
          {open && (
            <div className='absolute z-30 mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
              <div className='max-h-52 overflow-y-auto'>
                {filtered.slice(0, 10).map(item => (
                  <button
                    key={item.id}
                    type='button'
                    onMouseDown={() => {
                      onChange(item.id);
                      setOpen(false);
                      setQuery('');
                    }}
                    className='flex w-full flex-col px-4 py-2.5 text-left text-sm transition hover:bg-primary/5'
                  >
                    <span className='font-semibold text-slate-700'>
                      {item.label}
                    </span>
                    <span className='text-xs text-slate-400'>
                      {item.secondary}
                    </span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className='px-4 py-3 text-xs text-slate-400'>
                    Sin resultados
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface PosManagementViewProps {
  products: IProduct[];
  customers: ICustomer[];
  cart: PosCartItem[];
  sales: ISale[];
  salesPage: number;
  salesTotalPages: number;
  onSalesPageChange: (page: number) => Promise<void>;
  search: string;
  selectedCustomerId: string;
  paymentMethod: 'CASH' | 'CREDIT';
  loading: boolean;
  submitting: boolean;
  error: string | null;
  total: number;
  onSearchChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onPaymentMethodChange: (value: 'CASH' | 'CREDIT') => void;
  onAddToCart: (product: IProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onConfirmSale: () => Promise<boolean>;
  receiptSale: ISale | null;
  onCloseReceipt: () => void;
}

export const PosManagementView = ({
  products,
  customers,
  cart,
  sales,
  salesPage,
  salesTotalPages,
  onSalesPageChange,
  search,
  selectedCustomerId,
  paymentMethod,
  loading,
  submitting,
  error,
  total,
  onSearchChange,
  onCustomerChange,
  onPaymentMethodChange,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onConfirmSale,
  receiptSale,
  onCloseReceipt
}: PosManagementViewProps) => {
  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-slate-800'>POS</h1>
        <p className='mt-1 text-sm text-slate-500'>
          Registra ventas presenciales, pagos en efectivo y ventas a crédito.
        </p>
      </div>

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]'>
        {/* ── Left: Catalog ── */}
        <div className='flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
          {/* Title + payment toggle */}
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='text-xl font-bold text-slate-800'>Catálogo</h2>
            <div className='flex rounded-2xl border border-slate-200 bg-slate-100 p-1 gap-1'>
              <button
                type='button'
                onClick={() => onPaymentMethodChange('CASH')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${paymentMethod === 'CASH' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className='bx bx-money text-base' />
                Efectivo
              </button>
              <button
                type='button'
                onClick={() => onPaymentMethodChange('CREDIT')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${paymentMethod === 'CREDIT' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <i className='bx bx-credit-card text-base' />
                Crédito
              </button>
            </div>
          </div>

          {/* Search + customer — grouped close together */}
          <div className='flex flex-col gap-2'>
            {paymentMethod === 'CREDIT' && (
              <CustomerCombobox
                customers={customers}
                value={selectedCustomerId}
                onChange={onCustomerChange}
              />
            )}
            <div className='relative'>
              <i className='bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
              <input
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder='Buscar producto por nombre'
                className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10'
              />
            </div>
          </div>

          {/* Product grid */}
          {loading ? (
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className='animate-pulse rounded-2xl border border-slate-100 bg-slate-50'
                >
                  <div className='aspect-square rounded-t-2xl bg-slate-200' />
                  <div className='space-y-2 p-3'>
                    <div className='h-3 w-3/4 rounded bg-slate-200' />
                    <div className='h-3 w-1/2 rounded bg-slate-200' />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-16 text-slate-400'>
              <i className='bx bx-package text-5xl' />
              <p className='text-sm'>No se encontraron productos</p>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
              {products.map(product => (
                <button
                  key={product.id}
                  type='button'
                  onClick={() => onAddToCart(product)}
                  className='group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:border-primary/40 hover:shadow-md active:scale-[0.98]'
                >
                  {/* Image */}
                  <div className='aspect-square w-full overflow-hidden bg-slate-100'>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className='h-full w-full object-cover transition group-hover:scale-105'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <i className='bx bx-image text-4xl text-slate-300' />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex flex-1 flex-col p-3'>
                    <p className='line-clamp-2 text-xs font-semibold leading-tight text-slate-800'>
                      {product.name}
                    </p>
                    {product.category?.name ? (
                      <p className='mt-1 truncate text-[10px] text-slate-400'>
                        {product.category.name}
                      </p>
                    ) : null}
                    <p className='mt-2 text-sm font-bold text-primary'>
                      {formatCurrencyCOP(Number(product.price))}
                    </p>
                    <div className='mt-2 flex items-center justify-center gap-1 rounded-xl bg-primary py-1.5 text-[11px] font-bold text-white'>
                      <i className='bx bx-plus' />
                      Agregar
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Cart + Recent sales ── */}
        <div className='flex flex-col gap-6'>
          {/* Cart */}
          <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-slate-800'>Carrito</h2>

            <div className='mt-4 space-y-3'>
              {cart.length === 0 ? (
                <div className='flex flex-col items-center gap-2 py-8 text-slate-300'>
                  <i className='bx bx-cart text-4xl' />
                  <p className='text-xs'>El carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={item.product.id}
                    className='flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3'
                  >
                    {/* Thumbnail */}
                    <div className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-200'>
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <div className='flex h-full items-center justify-center'>
                          <i className='bx bx-image text-slate-300' />
                        </div>
                      )}
                    </div>

                    {/* Name + price */}
                    <div className='min-w-0 flex-1'>
                      <p className='line-clamp-1 text-xs font-semibold text-slate-700'>
                        {item.product.name}
                      </p>
                      <p className='text-xs text-slate-400'>
                        {formatCurrencyCOP(Number(item.product.price))} c/u
                      </p>

                      {/* Stepper */}
                      <div className='mt-2 flex items-center gap-2'>
                        <div className='flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white'>
                          <button
                            type='button'
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className='flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100'
                          >
                            <i className='bx bx-minus text-xs' />
                          </button>
                          <span className='w-7 text-center text-xs font-bold text-slate-700'>
                            {item.quantity}
                          </span>
                          <button
                            type='button'
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity + 1
                              )
                            }
                            className='flex h-7 w-7 items-center justify-center text-slate-500 hover:bg-slate-100'
                          >
                            <i className='bx bx-plus text-xs' />
                          </button>
                        </div>
                        <span className='text-xs font-semibold text-slate-700'>
                          ={' '}
                          {formatCurrencyCOP(
                            Number(item.product.price) * item.quantity
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type='button'
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-red-50 hover:text-red-500'
                    >
                      <i className='bx bx-x text-base' />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            {cart.length > 0 && (
              <div className='mt-5 rounded-2xl bg-slate-50 px-4 py-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-slate-500'>
                    Total ·{' '}
                    {paymentMethod === 'CREDIT' ? 'Crédito' : 'Efectivo'}
                  </span>
                  <span className='text-xl font-bold text-slate-800'>
                    {formatCurrencyCOP(total)}
                  </span>
                </div>
              </div>
            )}

            {error ? (
              <div className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600'>
                {error}
              </div>
            ) : null}

            <button
              type='button'
              disabled={submitting || cart.length === 0}
              onClick={() => void onConfirmSale()}
              className='mt-4 w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50'
            >
              {submitting ? (
                <span className='flex items-center justify-center gap-2'>
                  <i className='bx bx-loader-alt animate-spin' /> Confirmando…
                </span>
              ) : (
                `Confirmar venta · ${formatCurrencyCOP(total)}`
              )}
            </button>
          </div>

          {/* Recent sales */}
          <div className='rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-bold text-slate-800'>
                Ventas recientes
              </h2>
              {salesTotalPages > 1 && (
                <span className='text-xs text-slate-400'>
                  {salesPage} / {salesTotalPages}
                </span>
              )}
            </div>
            <div className='mt-4 space-y-2'>
              {sales.length === 0 ? (
                <p className='text-sm text-slate-400'>
                  Sin ventas registradas.
                </p>
              ) : (
                sales.map(sale => (
                  <div
                    key={sale.id}
                    className='flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3'
                  >
                    <div>
                      <p className='text-xs font-semibold text-slate-700'>
                        #{sale.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className='text-[10px] text-slate-400'>
                        {sale.items.length} ítem
                        {sale.items.length !== 1 ? 's' : ''} ·{' '}
                        {sale.paymentMethod === 'CASH'
                          ? 'Efectivo'
                          : sale.paymentMethod === 'CREDIT'
                            ? 'Crédito'
                            : sale.paymentMethod}
                      </p>
                    </div>
                    <span className='text-sm font-bold text-primary'>
                      {formatCurrencyCOP(Number(sale.total))}
                    </span>
                  </div>
                ))
              )}
            </div>
            {salesTotalPages > 1 && (
              <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-3'>
                <button
                  disabled={salesPage <= 1}
                  onClick={() => void onSalesPageChange(salesPage - 1)}
                  className='flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <i className='bx bx-chevron-left text-sm' /> Anterior
                </button>
                <span className='text-xs text-slate-400'>
                  Página {salesPage} de {salesTotalPages}
                </span>
                <button
                  disabled={salesPage >= salesTotalPages}
                  onClick={() => void onSalesPageChange(salesPage + 1)}
                  className='flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  Siguiente <i className='bx bx-chevron-right text-sm' />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {receiptSale && (
        <ReceiptModal sale={receiptSale} onClose={onCloseReceipt} />
      )}
    </div>
  );
};
