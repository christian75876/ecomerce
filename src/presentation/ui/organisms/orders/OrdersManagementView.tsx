import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { CartRow, ORDER_STATUSES } from '@/application/useCases/orders/useOrdersManagement';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface OrdersManagementViewProps {
  customers: ICustomer[];
  products: IProduct[];
  orders: IOrder[];
  customerId: string;
  newCustomer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
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
  onStatusChange: (
    orderId: string,
    status: (typeof ORDER_STATUSES)[number],
  ) => Promise<boolean>;
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
  return (
    <Box className="space-y-8">
      <Box>
        <Typography variant="h1" className="text-3xl font-bold">
          Pedidos Online
        </Typography>
        <Typography className="mt-2 text-neutral-dark/70">
          Crea pedidos contra clientes existentes, descuenta inventario al crearlos y gestiona su ciclo de estado.
        </Typography>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <Box className="space-y-6">
          <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
            <Typography variant="h2" className="text-xl font-semibold">
              Cliente del pedido
            </Typography>
            <Box className="mt-5 space-y-4">
              <Box>
                <Label htmlFor="order-customer">Cliente existente</Label>
                <select
                  id="order-customer"
                  value={customerId}
                  onChange={(event) => onCustomerIdChange(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona un cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName} · {customer.email}
                    </option>
                  ))}
                </select>
              </Box>

              <Box className="rounded-2xl border border-neutral-gray/20 p-4">
                <Typography className="font-semibold">Nuevo cliente rápido</Typography>
                <Box className="mt-4 grid gap-3">
                  <Input
                    placeholder="Nombre"
                    value={newCustomer.firstName}
                    onChange={(event) =>
                      onNewCustomerChange({
                        ...newCustomer,
                        firstName: event.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Apellido"
                    value={newCustomer.lastName}
                    onChange={(event) =>
                      onNewCustomerChange({
                        ...newCustomer,
                        lastName: event.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Correo"
                    value={newCustomer.email}
                    onChange={(event) =>
                      onNewCustomerChange({
                        ...newCustomer,
                        email: event.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Teléfono"
                    value={newCustomer.phone}
                    onChange={(event) =>
                      onNewCustomerChange({
                        ...newCustomer,
                        phone: event.target.value,
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void onCreateCustomer()}
                    disabled={submitting}
                  >
                    Crear cliente
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
            <Typography variant="h2" className="text-xl font-semibold">
              Ítems del pedido
            </Typography>
            <Box className="mt-5 space-y-3">
              {cartRows.map((row, index) => (
                <Box key={`${row.productId}-${index}`} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                  <select
                    value={row.productId}
                    onChange={(event) =>
                      onCartRowChange(index, { productId: event.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} · ${Number(product.price).toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    value={String(row.quantity)}
                    onChange={(event) =>
                      onCartRowChange(index, {
                        quantity: Number(event.target.value || 1),
                      })
                    }
                  />
                </Box>
              ))}
            </Box>

            <Box className="mt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onAddCartRow}>
                Agregar línea
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => void onCreateOrder()}
                disabled={submitting}
              >
                {submitting ? 'Creando...' : 'Crear pedido'}
              </Button>
            </Box>

            {error ? (
              <Box className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
          <Typography variant="h2" className="text-xl font-semibold">
            Pedidos registrados
          </Typography>
          <Box className="mt-5 space-y-4">
            {loading ? (
              <Typography>Cargando pedidos...</Typography>
            ) : (
              orders.map((order) => (
                <Box key={order.id} className="rounded-2xl border border-neutral-gray/20 p-5">
                  <Box className="flex flex-wrap items-center justify-between gap-3">
                    <Box>
                      <Typography className="font-semibold">
                        Pedido {order.id.slice(0, 8)}
                      </Typography>
                      <Typography className="text-sm text-neutral-dark/65">
                        {order.customer.firstName} {order.customer.lastName} · {order.customer.email}
                      </Typography>
                    </Box>
                    <select
                      value={order.status}
                      onChange={(event) =>
                        void onStatusChange(
                          order.id,
                          event.target.value as (typeof ORDER_STATUSES)[number],
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Box>
                  <Typography className="mt-3 text-sm text-neutral-dark/70">
                    {order.items.length} ítems · ${Number(order.total).toFixed(2)}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
