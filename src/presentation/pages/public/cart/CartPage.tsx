import { useState } from 'react';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { useCart } from '@/shared/hooks/useCart';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';

const CartPage = () => {
  const { items, total, updateQuantity, clear } = useCart();
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (
      items.length === 0 ||
      !customer.firstName.trim() ||
      !customer.lastName.trim() ||
      !customer.email.trim()
    ) {
      setError('Completa los datos del cliente y agrega productos al carrito');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await OrdersRepository.createOrder({
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          email: customer.email.trim(),
          phone: customer.phone.trim() || undefined,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clear();
      setCustomer({ firstName: '', lastName: '', email: '', phone: '' });
      setSuccess('Pedido creado correctamente');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No fue posible crear el pedido',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className='space-y-8'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>
          Carrito
        </Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Revisa tus productos y confirma el pedido online.
        </Typography>
      </Box>

      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]'>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>
            Productos seleccionados
          </Typography>
          <Box className='mt-5 space-y-4'>
            {items.length === 0 ? (
              <Typography>No hay productos en el carrito.</Typography>
            ) : (
              items.map((item) => (
                <Box
                  key={item.productId}
                  className='rounded-2xl border border-neutral-gray/20 p-4'
                >
                  <Typography className='font-semibold'>{item.name}</Typography>
                  <Typography className='mt-1 text-sm text-neutral-dark/65'>
                    ${item.price.toFixed(2)} c/u
                  </Typography>
                  <Input
                    type='number'
                    min='1'
                    value={String(item.quantity)}
                    onChange={(event) =>
                      updateQuantity(item.productId, Number(event.target.value || 0))
                    }
                    className='mt-3 max-w-24'
                  />
                </Box>
              ))
            )}
          </Box>
        </Box>

        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>
            Datos del cliente
          </Typography>
          <Box className='mt-5 space-y-3'>
            <Input
              placeholder='Nombre'
              value={customer.firstName}
              onChange={(event) =>
                setCustomer((current) => ({
                  ...current,
                  firstName: event.target.value,
                }))
              }
            />
            <Input
              placeholder='Apellido'
              value={customer.lastName}
              onChange={(event) =>
                setCustomer((current) => ({
                  ...current,
                  lastName: event.target.value,
                }))
              }
            />
            <Input
              placeholder='Correo'
              value={customer.email}
              onChange={(event) =>
                setCustomer((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
            <Input
              placeholder='Teléfono'
              value={customer.phone}
              onChange={(event) =>
                setCustomer((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
          </Box>

          <Box className='mt-6 border-t border-neutral-gray/20 pt-4'>
            <Typography className='text-sm text-neutral-dark/65'>Total</Typography>
            <Typography variant='h3' className='text-2xl font-bold'>
              ${total.toFixed(2)}
            </Typography>
          </Box>

          {error ? (
            <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
              {error}
            </Box>
          ) : null}
          {success ? (
            <Box className='mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
              {success}
            </Box>
          ) : null}

          <Button
            type='button'
            variant='primary'
            className='mt-5'
            disabled={submitting || items.length === 0}
            onClick={() => void handleCheckout()}
          >
            {submitting ? 'Procesando...' : 'Confirmar pedido'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CartPage;
