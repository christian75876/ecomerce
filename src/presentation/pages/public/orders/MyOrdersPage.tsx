import { Navigate, useParams } from 'react-router-dom';
import { useMyOrders } from '@/application/useCases/orders/useMyOrders';
import { isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';
import { ROUTES } from '@/shared/constants/routes';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Link from '@/presentation/ui/atoms/link/Simplelink';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

const MyOrdersPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { orders, selectedOrder, loading, error } = useMyOrders(orderId);

  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
  }

  return (
    <Box className='space-y-8'>
      <Box className='rounded-[2rem] bg-[linear-gradient(135deg,_#eff6ff_0%,_#ffffff_55%,_#ecfeff_100%)] px-6 py-10 shadow-sm'>
        <Typography variant='h1' className='text-3xl font-bold'>
          Mis pedidos
        </Typography>
        <Typography className='mt-3 max-w-2xl text-neutral-dark/70'>
          Revisa tu historial, estados e ítems comprados desde tu cuenta.
        </Typography>
      </Box>

      {error ? (
        <Box className='rounded-3xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-600'>
          {error}
        </Box>
      ) : null}

      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]'>
        <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-2xl font-semibold'>
            Historial
          </Typography>
          <Box className='mt-5 space-y-3'>
            {loading ? (
              <Typography>Cargando pedidos...</Typography>
            ) : orders.length === 0 ? (
              <Typography>Aún no tienes pedidos registrados.</Typography>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  to={ROUTES.PUBLIC.MY_ORDER_DETAILS.replace(':orderId', order.id)}
                  className='block rounded-2xl border border-neutral-gray/20 px-5 py-4 transition hover:border-primary/30 hover:bg-background'
                >
                  <Typography className='font-semibold'>
                    Pedido {order.id.slice(0, 8)}
                  </Typography>
                  <Typography className='mt-1 text-sm text-neutral-dark/65'>
                    {order.status} · ${Number(order.total).toFixed(2)} · {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                </Link>
              ))
            )}
          </Box>
        </Box>

        <Box className='rounded-[1.75rem] border border-neutral-gray/20 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-2xl font-semibold'>
            Detalle del pedido
          </Typography>
          {!orderId ? (
            <Typography className='mt-4 text-neutral-dark/70'>
              Selecciona un pedido para ver sus ítems y estado.
            </Typography>
          ) : loading ? (
            <Typography className='mt-4'>Cargando detalle...</Typography>
          ) : selectedOrder ? (
            <Box className='mt-5 space-y-4'>
              <Typography className='text-sm text-neutral-dark/65'>
                Estado: {selectedOrder.status}
              </Typography>
              <Typography className='text-sm text-neutral-dark/65'>
                Fecha: {new Date(selectedOrder.createdAt).toLocaleString()}
              </Typography>
              <Typography className='text-sm text-neutral-dark/65'>
                Total: ${Number(selectedOrder.total).toFixed(2)}
              </Typography>
              {selectedOrder.items.map((item) => (
                <Box
                  key={item.id}
                  className='rounded-2xl border border-neutral-gray/20 px-4 py-3'
                >
                  <Typography className='font-semibold'>
                    {item.product.name}
                  </Typography>
                  <Typography className='mt-1 text-sm text-neutral-dark/65'>
                    SKU {item.product.sku} · {item.quantity} unidad(es) · ${Number(item.lineTotal).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography className='mt-4 text-neutral-dark/70'>
              No fue posible cargar ese pedido.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MyOrdersPage;
