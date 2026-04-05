import { useEffect, useState } from 'react';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { CustomersRepository } from '@/infrastructure/repositories/api/customers/CustomersRepository';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';
import { ProductRepository } from '@/infrastructure/repositories/api/products/ProductsRepository';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IOrder } from '@/application/dtos/orders/response/OrderResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';

const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

type CartRow = {
  productId: string;
  quantity: number;
};

const OrdersPage = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [cartRows, setCartRows] = useState<CartRow[]>([{ productId: '', quantity: 1 }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScreen = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersResponse, productsResponse, ordersResponse] = await Promise.all([
        CustomersRepository.getCustomers(),
        ProductRepository.getProducts({ active: true }),
        OrdersRepository.getOrders(),
      ]);
      setCustomers(customersResponse.data);
      setProducts(productsResponse.data);
      setOrders(ordersResponse.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible cargar pedidos',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadScreen();
  }, []);

  const handleCreateCustomer = async () => {
    if (
      !newCustomer.firstName.trim() ||
      !newCustomer.lastName.trim() ||
      !newCustomer.email.trim()
    ) {
      setError('Completa nombre, apellido y correo del cliente');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await CustomersRepository.createCustomer(newCustomer);
      setCustomerId(response.data.id);
      setNewCustomer({ firstName: '', lastName: '', email: '', phone: '' });
      await loadScreen();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible crear el cliente',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateCartRow = (index: number, patch: Partial<CartRow>) => {
    setCartRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const handleCreateOrder = async () => {
    const validItems = cartRows.filter((row) => row.productId && row.quantity > 0);

    if (!customerId || validItems.length === 0) {
      setError('Selecciona cliente y al menos un producto');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await OrdersRepository.createOrder({
        customerId,
        items: validItems,
      });
      setCartRows([{ productId: '', quantity: 1 }]);
      await loadScreen();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible crear el pedido',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    orderId: string,
    status: (typeof ORDER_STATUSES)[number],
  ) => {
    setSubmitting(true);
    setError(null);
    try {
      await OrdersRepository.updateOrderStatus(orderId, { status });
      await loadScreen();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible actualizar el estado del pedido',
      );
    } finally {
      setSubmitting(false);
    }
  };

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
                  onChange={(event) => setCustomerId(event.target.value)}
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
                      setNewCustomer((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Apellido"
                    value={newCustomer.lastName}
                    onChange={(event) =>
                      setNewCustomer((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Correo"
                    value={newCustomer.email}
                    onChange={(event) =>
                      setNewCustomer((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Teléfono"
                    value={newCustomer.phone}
                    onChange={(event) =>
                      setNewCustomer((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleCreateCustomer()}
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
                      updateCartRow(index, { productId: event.target.value })
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
                      updateCartRow(index, {
                        quantity: Number(event.target.value || 1),
                      })
                    }
                  />
                </Box>
              ))}
            </Box>

            <Box className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setCartRows((current) => [...current, { productId: '', quantity: 1 }])
                }
              >
                Agregar línea
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => void handleCreateOrder()}
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
                        void handleStatusChange(
                          order.id,
                          event.target.value as (typeof ORDER_STATUSES)[number],
                        )
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {ORDER_STATUSES.map((status) => (
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

export default OrdersPage;
