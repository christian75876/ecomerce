import { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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

const STATUS_TABS = [
  { key: '', label: 'Todos' },
  { key: 'PENDING',   label: 'Pendientes' },
  { key: 'PAID',      label: 'Pagados' },
  { key: 'PREPARING', label: 'Preparando' },
  { key: 'SHIPPED',   label: 'Enviados' },
  { key: 'DELIVERED', label: 'Entregados' },
  { key: 'CANCELLED', label: 'Cancelados' },
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
  statuses: readonly string[];
  onCustomerIdChange: (value: string) => void;
  onNewCustomerChange: (value: OrdersManagementViewProps['newCustomer']) => void;
  onCartRowChange: (index: number, patch: Partial<CartRow>) => void;
  onAddCartRow: () => void;
  onCreateCustomer: () => Promise<boolean>;
  onCreateOrder: () => Promise<boolean>;
  onStatusChange: (orderId: string, status: (typeof ORDER_STATUSES)[number]) => Promise<boolean>;
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
  statuses,
  onCustomerIdChange,
  onNewCustomerChange,
  onCartRowChange,
  onAddCartRow,
  onCreateCustomer,
  onCreateOrder,
  onStatusChange,
}: OrdersManagementViewProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchStatus = !statusFilter || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

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
                  <Input
                    placeholder='Teléfono'
                    value={newCustomer.phone}
                    onChange={(e) => onNewCustomerChange({ ...newCustomer, phone: e.target.value })}
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

          {/* Status tabs */}
          <Box className='mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide'>
            {STATUS_TABS.map((tab) => {
              const count = tab.key ? (counts[tab.key] ?? 0) : orders.length;
              return (
                <button
                  key={tab.key}
                  type='button'
                  onClick={() => setStatusFilter(tab.key)}
                  className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === tab.key
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                  {count > 0 ? <span className='ml-1 opacity-75'>({count})</span> : null}
                </button>
              );
            })}
          </Box>

          {/* Orders */}
          <Box className='mt-4 space-y-3'>
            {loading ? (
              <Typography className='py-8 text-center text-sm text-slate-400'>Cargando pedidos…</Typography>
            ) : filtered.length === 0 ? (
              <Typography className='py-8 text-center text-sm text-slate-400'>
                {search || statusFilter ? 'Sin resultados para ese filtro.' : 'Aún no hay pedidos registrados.'}
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
                        <div className='mt-0.5 truncate text-xs text-slate-500'>
                          {order.customer.firstName} {order.customer.lastName} · {order.customer.email}
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

                        {/* Status change */}
                        <Box className='flex items-center gap-3'>
                          <p className='text-xs font-bold uppercase tracking-wide text-slate-400'>Estado</p>
                          <SelectDropdown
                            value={order.status}
                            options={statuses.map((s) => ({ value: s, label: STATUS_CONFIG[s]?.label ?? s }))}
                            onChange={(v) => void onStatusChange(order.id, v as (typeof ORDER_STATUSES)[number])}
                          />
                          <span className='text-xs text-slate-400'>
                            Actualizado: {new Date(order.updatedAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </Box>
                      </Box>
                    ) : null}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
