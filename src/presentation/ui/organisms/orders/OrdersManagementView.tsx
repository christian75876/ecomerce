import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import PhoneInputCO from '@/presentation/ui/molecules/common/PhoneInputCO';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CartRow, ORDER_STATUSES } from '@/application/useCases/orders/useOrdersManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';

// Fix Leaflet default icons in Vite
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  PENDING:   { label: 'Pendiente',  dot: 'bg-amber-400',  badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  PAID:      { label: 'Pagado',     dot: 'bg-blue-400',   badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  PREPARING: { label: 'Preparando', dot: 'bg-indigo-400', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  SHIPPED:   { label: 'Enviado',    dot: 'bg-cyan-400',   badge: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  DELIVERED: { label: 'Entregado',  dot: 'bg-green-400',  badge: 'bg-green-100 text-green-700 border-green-200' },
  CANCELLED: { label: 'Cancelado',  dot: 'bg-red-400',    badge: 'bg-red-100 text-red-700 border-red-200' },
};

const STATUS_SEQUENCE = ['PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'] as const;
const ACTIVE_ORDER_STATUSES = ['PAID', 'PREPARING', 'SHIPPED', 'DELIVERED'];

const getNextStatus = (current: string): string | null => {
  const idx = STATUS_SEQUENCE.indexOf(current as typeof STATUS_SEQUENCE[number]);
  if (idx === -1 || idx === STATUS_SEQUENCE.length - 1) return null;
  return STATUS_SEQUENCE[idx + 1];
};

const getStatusOptions = (current: string) => {
  const opts = [{ value: current, label: STATUS_CONFIG[current]?.label ?? current }];
  const next = getNextStatus(current);
  if (next) opts.push({ value: next, label: STATUS_CONFIG[next]?.label ?? next });
  if (current !== 'CANCELLED' && current !== 'DELIVERED') {
    opts.push({ value: 'CANCELLED', label: STATUS_CONFIG['CANCELLED'].label });
  }
  return opts;
};

const PAYMENT_TABS = [
  { key: 'NONE',      label: 'Sin pago',       icon: 'bx-time-five',     color: 'text-amber-600',  activeBg: 'bg-amber-500' },
  { key: 'SUBMITTED', label: 'Por verificar',  icon: 'bx-receipt',       color: 'text-blue-600',   activeBg: 'bg-blue-500' },
  { key: 'CONFIRMED', label: 'Activos',         icon: 'bx-check-circle',  color: 'text-emerald-600',activeBg: 'bg-emerald-500' },
  { key: 'CANCELLED', label: 'Cancelados',      icon: 'bx-x-circle',      color: 'text-red-500',    activeBg: 'bg-red-400' },
] as const;

type PaymentTab = typeof PAYMENT_TABS[number]['key'];

const ACTIVE_STATUS_TABS = [
  { key: '',          label: 'Todos' },
  { key: 'PAID',      label: 'Pagados' },
  { key: 'PREPARING', label: 'Preparando' },
  { key: 'SHIPPED',   label: 'Enviados' },
  { key: 'DELIVERED', label: 'Entregados' },
];

interface OrdersManagementViewProps {
  customers: ICustomer[];
  products: IProduct[];
  orders: IOrder[];
  customerId: string;
  newCustomer: { firstName: string; lastName: string; email: string; phone: string };
  cartRows: CartRow[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onCustomerIdChange: (value: string) => void;
  onNewCustomerChange: (value: OrdersManagementViewProps['newCustomer']) => void;
  onCartRowChange: (index: number, patch: Partial<CartRow>) => void;
  onAddCartRow: () => void;
  onCreateCustomer: () => Promise<boolean>;
  onCreateOrder: () => Promise<boolean>;
  onStatusChange: (orderId: string, status: (typeof ORDER_STATUSES)[number]) => Promise<boolean>;
  onConfirmPayment?: (orderId: string) => Promise<boolean>;
  onChangePage: (page: number) => void | Promise<void>;
}

export const OrdersManagementView = ({
  customers,
  products,
  orders,
  customerId,
  newCustomer,
  cartRows,
  loading,
  submitting,
  error,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onCustomerIdChange,
  onNewCustomerChange,
  onCartRowChange,
  onAddCartRow,
  onCreateCustomer,
  onCreateOrder,
  onStatusChange,
  onConfirmPayment,
  onChangePage,
}: OrdersManagementViewProps) => {
  const [search, setSearch] = useState('');
  const [paymentTab, setPaymentTab] = useState<PaymentTab>('NONE');
  const [activeStatusFilter, setActiveStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [searchParams] = useSearchParams();

  // When navigating from a notification, select the right tab and expand the target order
  useEffect(() => {
    const targetId = searchParams.get('order');
    if (!targetId || orders.length === 0) return;
    const order = orders.find((o) => o.id === targetId);
    if (!order) return;

    let tab: PaymentTab;
    if (order.status === 'CANCELLED') tab = 'CANCELLED';
    else if (order.paymentStatus === 'SUBMITTED') tab = 'SUBMITTED';
    else if (order.paymentStatus === 'CONFIRMED' || ACTIVE_ORDER_STATUSES.includes(order.status)) tab = 'CONFIRMED';
    else tab = 'NONE';

    setPaymentTab(tab);
    setActiveStatusFilter('');
    setSearch('');
    setExpandedId(targetId);
  }, [searchParams, orders]);

  const BASE_URL = (import.meta.env.VITE_API_URL as string ?? import.meta.env.VITE_API_BASE_URL as string ?? 'http://127.0.0.1:3000/api/').replace(/\/api\/?$/, '');

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q);

    if (paymentTab === 'CANCELLED') return matchSearch && o.status === 'CANCELLED';
    if (paymentTab === 'NONE')      return matchSearch && o.paymentStatus === 'NONE' && o.status === 'PENDING';
    if (paymentTab === 'SUBMITTED') return matchSearch && o.paymentStatus === 'SUBMITTED';
    if (paymentTab === 'CONFIRMED') {
      const matchActiveStatus = !activeStatusFilter || o.status === activeStatusFilter;
      const isActive = o.paymentStatus === 'CONFIRMED' || ACTIVE_ORDER_STATUSES.includes(o.status);
      return matchSearch && isActive && matchActiveStatus;
    }
    return matchSearch;
  });

  const payCounts: Record<PaymentTab, number> = {
    NONE:      orders.filter(o => o.paymentStatus === 'NONE' && o.status === 'PENDING').length,
    SUBMITTED: orders.filter(o => o.paymentStatus === 'SUBMITTED').length,
    CONFIRMED: orders.filter(o => o.paymentStatus === 'CONFIRMED' || ACTIVE_ORDER_STATUSES.includes(o.status)).length,
    CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
  };

  return (
    <Box className='space-y-8'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>
          Pedidos Online
        </Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Crea pedidos contra clientes existentes, descuenta inventario al crearlos y gestiona su ciclo de estado.
        </Typography>
      </Box>

      <Box className='grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]'>
        {/* ── Creation form (unchanged) ─────────────────────── */}
        <Box className='space-y-6'>
          <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
            <Typography variant='h2' className='text-xl font-semibold'>
              Cliente del pedido
            </Typography>
            <Box className='mt-5 space-y-4'>
              <Box>
                <Label>Cliente existente</Label>
                <SelectDropdown
                  value={customerId}
                  options={customers.map((c) => ({
                    value: c.id,
                    label: `${c.firstName} ${c.lastName} · ${c.email}`,
                  }))}
                  placeholder='Selecciona un cliente'
                  onChange={(v) => onCustomerIdChange(v)}
                />
              </Box>

              <Box className='rounded-2xl border border-neutral-gray/20 p-4'>
                <Typography className='font-semibold'>Nuevo cliente rápido</Typography>
                <Box className='mt-4 grid gap-3'>
                  <Input
                    placeholder='Nombre'
                    value={newCustomer.firstName}
                    onChange={(e) => onNewCustomerChange({ ...newCustomer, firstName: e.target.value })}
                  />
                  <Input
                    placeholder='Apellido'
                    value={newCustomer.lastName}
                    onChange={(e) => onNewCustomerChange({ ...newCustomer, lastName: e.target.value })}
                  />
                  <Input
                    placeholder='Correo'
                    value={newCustomer.email}
                    onChange={(e) => onNewCustomerChange({ ...newCustomer, email: e.target.value })}
                  />
                  <PhoneInputCO
                    value={newCustomer.phone}
                    onChange={(v) => onNewCustomerChange({ ...newCustomer, phone: v })}
                  />
                  <Button type='button' variant='secondary' onClick={() => void onCreateCustomer()} disabled={submitting}>
                    Crear cliente
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
            <Typography variant='h2' className='text-xl font-semibold'>
              Ítems del pedido
            </Typography>
            <Box className='mt-5 space-y-3'>
              {cartRows.map((row, index) => (
                <Box key={`${row.productId}-${index}`} className='grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]'>
                  <SelectDropdown
                    value={row.productId}
                    options={products.map((p) => ({
                      value: p.id,
                      label: `${p.name} · ${formatCurrencyCOP(p.price)}`,
                    }))}
                    placeholder='Selecciona un producto'
                    onChange={(v) => onCartRowChange(index, { productId: v })}
                  />
                  <Input
                    type='number'
                    min='1'
                    value={String(row.quantity)}
                    onChange={(e) => onCartRowChange(index, { quantity: Number(e.target.value || 1) })}
                  />
                </Box>
              ))}
            </Box>

            <Box className='mt-4 flex gap-3'>
              <Button type='button' variant='outline' onClick={onAddCartRow}>
                Agregar línea
              </Button>
              <Button type='button' variant='primary' onClick={() => void onCreateOrder()} disabled={submitting}>
                {submitting ? 'Creando...' : 'Crear pedido'}
              </Button>
            </Box>

            {error ? (
              <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </Box>
            ) : null}
          </Box>
        </Box>

        {/* ── Orders list ───────────────────────────────────── */}
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          {/* Search */}
          <Box className='relative'>
            <i className='bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400' aria-hidden='true' />
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar por ID, nombre o correo…'
              className='w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
            />
          </Box>

          {/* Payment tabs */}
          <Box className='mt-3 grid grid-cols-4 gap-1.5'>
            {PAYMENT_TABS.map((tab) => {
              const count = payCounts[tab.key];
              const isActive = paymentTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => { setPaymentTab(tab.key); setActiveStatusFilter(''); }}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 text-[11px] font-semibold transition-all ${
                    isActive
                      ? `${tab.activeBg} border-transparent text-white shadow-sm`
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <i className={`bx ${tab.icon} text-base ${isActive ? '' : tab.color}`} />
                  <span>{tab.label}</span>
                  {count > 0 ? (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </Box>

          {/* Sub-filter for Activos */}
          {paymentTab === 'CONFIRMED' && (
            <Box className='mt-2 flex gap-1.5 overflow-x-auto pb-1'>
              {ACTIVE_STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => setActiveStatusFilter(tab.key)}
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    activeStatusFilter === tab.key
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </Box>
          )}

          {/* Orders */}
          <Box className='mt-4 space-y-3'>
            {loading ? (
              <>
                <div className='h-20 skeleton rounded-2xl' />
                <div className='h-20 skeleton rounded-2xl' />
                <div className='h-20 skeleton rounded-2xl' />
                <div className='h-20 skeleton rounded-2xl' />
              </>
            ) : filtered.length === 0 ? (
              <Typography className='py-8 text-center text-sm text-slate-400'>
                {search || paymentTab !== 'NONE' ? 'Sin resultados para ese filtro.' : 'Aún no hay pedidos registrados.'}
              </Typography>
            ) : (
              filtered.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['PENDING'];
                const isOpen = expandedId === order.id;

                return (
                  <Box
                    key={order.id}
                    className={`overflow-hidden rounded-2xl border transition-all ${isOpen ? 'border-primary/30 shadow-md' : 'border-neutral-gray/20'}`}
                  >
                    {/* Card header — always visible */}
                    <button
                      type='button'
                      className='flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50'
                      onClick={() => setExpandedId(isOpen ? null : order.id)}
                    >
                      <span className={`h-2 w-2 flex-shrink-0 rounded-full ${cfg.dot}`} />
                      <Box className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold text-slate-800'>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          {order.deliveryMethod === 'DELIVERY' ? (
                            <span className='rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-700'>
                              Domicilio
                            </span>
                          ) : order.deliveryMethod === 'PICKUP' ? (
                            <span className='rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600'>
                              Recogida
                            </span>
                          ) : null}
                        </div>
                        <div className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500'>
                          <span>{order.customer.firstName} {order.customer.lastName}</span>
                          <span className='text-slate-300'>·</span>
                          <span className='truncate'>{order.customer.email}</span>
                          {order.customer.phone ? (
                            <>
                              <span className='text-slate-300'>·</span>
                              <a
                                href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={(e) => e.stopPropagation()}
                                className='inline-flex items-center gap-1 font-medium text-green-600 hover:text-green-700 hover:underline'
                              >
                                <i className='bx bxl-whatsapp text-sm' />
                                {order.customer.phone}
                              </a>
                            </>
                          ) : null}
                        </div>
                      </Box>
                      <Box className='flex-shrink-0 text-right'>
                        <div className='text-sm font-bold text-slate-800'>{formatCurrencyCOP(order.total)}</div>
                        <div className='text-xs text-slate-400'>
                          {new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                        </div>
                      </Box>
                      <i className={`bx ${isOpen ? 'bx-chevron-up' : 'bx-chevron-down'} flex-shrink-0 text-lg text-slate-400`} aria-hidden='true' />
                    </button>

                    {/* Expanded detail */}
                    {isOpen ? (
                      <Box className='border-t border-slate-100 px-4 pb-4 pt-3 space-y-4'>
                        {/* Items table */}
                        <Box>
                          <p className='mb-2 text-xs font-bold uppercase tracking-wide text-slate-400'>
                            Productos ({order.items.length})
                          </p>
                          <table className='w-full text-sm'>
                            <tbody>
                              {order.items.map((item) => (
                                <tr key={item.id} className='border-b border-slate-100 last:border-0'>
                                  <td className='py-2 pr-3'>
                                    <div className='font-medium text-slate-700'>{item.product.name}</div>
                                    <div className='text-xs text-slate-400'>{item.product.sku}</div>
                                  </td>
                                  <td className='py-2 text-center text-xs text-slate-500'>× {item.quantity}</td>
                                  <td className='py-2 text-right text-xs text-slate-500'>{formatCurrencyCOP(item.unitPrice)}</td>
                                  <td className='py-2 pl-3 text-right font-semibold text-slate-700'>{formatCurrencyCOP(item.lineTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan={3} className='pt-2 text-right text-xs font-semibold text-slate-500'>Total</td>
                                <td className='pt-2 pl-3 text-right font-bold text-slate-800'>{formatCurrencyCOP(order.total)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </Box>

                        {/* Delivery info */}
                        {order.deliveryMethod === 'DELIVERY' && order.deliveryAddress ? (
                          <Box>
                            <p className='mb-2 text-xs font-bold uppercase tracking-wide text-slate-400'>
                              Dirección de entrega
                            </p>
                            <div className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm'>
                              <div className='flex items-start gap-2'>
                                <i className='bx bx-map-pin mt-0.5 flex-shrink-0 text-primary' aria-hidden='true' />
                                <div>
                                  <span className='font-medium text-slate-700'>{order.deliveryAddress}</span>
                                  {(order.deliveryCity || order.deliveryDepartment) ? (
                                    <span className='text-slate-500'>
                                      {' '}— {[order.deliveryCity, order.deliveryDepartment].filter(Boolean).join(', ')}
                                    </span>
                                  ) : null}
                                  {order.deliveryNotes ? (
                                    <p className='mt-1 text-xs text-slate-400'>
                                      <i className='bx bx-note mr-1' />
                                      {order.deliveryNotes}
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {/* Delivery map */}
                            {order.deliveryLat && order.deliveryLng ? (
                              <Box className='mt-2 overflow-hidden rounded-xl border border-slate-200' style={{ height: 180 }}>
                                <MapContainer
                                  center={[order.deliveryLat, order.deliveryLng]}
                                  zoom={15}
                                  style={{ height: '100%', width: '100%' }}
                                  scrollWheelZoom={false}
                                  zoomControl={false}
                                >
                                  <TileLayer
                                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                    attribution='&copy; OpenStreetMap'
                                  />
                                  <Marker position={[order.deliveryLat, order.deliveryLng]} />
                                </MapContainer>
                              </Box>
                            ) : null}
                          </Box>
                        ) : null}

                        {/* Payment evidence */}
                        {order.paymentStatus === 'CONFIRMED' ? (
                          <Box className='rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 space-y-1.5'>
                            <p className='text-xs font-bold uppercase tracking-wide text-emerald-600'>
                              Pago confirmado
                            </p>
                            {(order.paymentMethodType || order.paymentReference) && (
                              <p className='text-sm text-emerald-800'>
                                {order.paymentMethodType && <span className='font-medium'>{order.paymentMethodType}</span>}
                                {order.paymentMethodType && order.paymentReference && ' — '}
                                {order.paymentReference}
                              </p>
                            )}
                            {order.paymentEvidenceImagePath && (
                              <a
                                href={`${BASE_URL}/${order.paymentEvidenceImagePath}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='mt-1 block overflow-hidden rounded-lg border border-emerald-200'
                              >
                                <img
                                  src={`${BASE_URL}/${order.paymentEvidenceImagePath}`}
                                  alt='Comprobante'
                                  className='max-h-48 w-full object-contain bg-white'
                                />
                              </a>
                            )}
                            <p className='flex items-center gap-1 text-xs text-emerald-600'>
                              <i className='bx bx-check-circle' />
                              {order.paymentConfirmedAt
                                ? `Confirmado el ${new Date(order.paymentConfirmedAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' })}`
                                : 'Pago confirmado por la tienda'}
                            </p>
                          </Box>
                        ) : order.paymentStatus === 'SUBMITTED' ? (
                          <Box className='rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 space-y-1.5'>
                            <p className='text-xs font-bold uppercase tracking-wide text-blue-600'>
                              Comprobante enviado — pendiente de verificación
                            </p>
                            {(order.paymentMethodType || order.paymentReference) && (
                              <p className='text-sm text-blue-800'>
                                {order.paymentMethodType && <span className='font-medium'>{order.paymentMethodType}</span>}
                                {order.paymentMethodType && order.paymentReference && ' — '}
                                {order.paymentReference}
                              </p>
                            )}
                            {order.paymentEvidenceImagePath && (
                              <a
                                href={`${BASE_URL}/${order.paymentEvidenceImagePath}`}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='mt-1 block overflow-hidden rounded-lg border border-blue-200'
                              >
                                <img
                                  src={`${BASE_URL}/${order.paymentEvidenceImagePath}`}
                                  alt='Comprobante'
                                  className='max-h-48 w-full object-contain bg-white'
                                />
                              </a>
                            )}
                            {onConfirmPayment && (
                              <button
                                type='button'
                                onClick={() => void onConfirmPayment(order.id)}
                                disabled={submitting}
                                className='mt-1 flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50'
                              >
                                <i className='bx bx-check-double text-sm' />
                                Confirmar pago recibido
                              </button>
                            )}
                          </Box>
                        ) : order.status !== 'CANCELLED' ? (
                          <Box className='rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 space-y-1.5'>
                            <p className='text-xs font-bold uppercase tracking-wide text-amber-600'>
                              Sin comprobante de pago
                            </p>
                            <p className='text-xs text-amber-700'>
                              El cliente aún no ha enviado comprobante. El pedido se cancelará automáticamente a los 5 días si no hay pago.
                            </p>
                            {onConfirmPayment && (
                              <button
                                type='button'
                                onClick={() => void onConfirmPayment(order.id)}
                                disabled={submitting}
                                className='mt-1 flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700 disabled:opacity-50'
                              >
                                <i className='bx bx-check-double text-sm' />
                                Confirmar pago directo
                              </button>
                            )}
                          </Box>
                        ) : null}

                        {/* Status change */}
                        <Box className='flex items-center gap-3'>
                          <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>Estado</p>
                          <SelectDropdown
                            value={order.status}
                            options={getStatusOptions(order.status)}
                            disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                            onChange={(v) => { if (v && v !== order.status) void onStatusChange(order.id, v as (typeof ORDER_STATUSES)[number]); }}
                          />
                          <span className='text-xs text-slate-400'>
                            Actualizado: {new Date(order.updatedAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' })}
                          </span>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                );
              })
            )}
          </Box>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            loading={loading}
            onChangePage={onChangePage}
          />
        </Box>
      </Box>
    </Box>
  );
};
