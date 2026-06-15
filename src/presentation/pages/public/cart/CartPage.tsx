import { useState } from 'react';
import { Link } from 'react-router-dom';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import Icon from '@/presentation/ui/atoms/icon/SimpleIcon';
import { useCart } from '@/shared/hooks/useCart';
import { OrdersRepository } from '@/infrastructure/repositories/api/orders/OrdersRepository';
import { CouponsRepository } from '@/infrastructure/repositories/api/coupons/CouponsRepository';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { isAuthenticated, getAuthenticatedUser } from '@/shared/utils/checkIsUserAuthenticated.util';
import { ROUTES } from '@/shared/constants/routes';
import MapAddressPicker, { MapAddress } from '@molecules/common/MapAddressPicker';
import type { ICouponValidation } from '@/application/dtos/coupons/CouponDtos';

const CartPage = () => {
  const { items, total, updateQuantity, removeItem, clear } = useCart();
  const authenticated = isAuthenticated();
  const sessionUser = getAuthenticatedUser();
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: sessionUser?.email ?? '',
    phone: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('PICKUP');
  const [mapAddress, setMapAddress] = useState<MapAddress | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<ICouponValidation | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponValidating(true);
    setCouponError(null);
    setAppliedCoupon(null);
    try {
      const result = await CouponsRepository.validateCoupon(couponInput.trim().toUpperCase(), total);
      if (result.valid) {
        setAppliedCoupon(result);
      } else {
        setCouponError(result.message ?? 'Cupón inválido');
      }
    } catch {
      setCouponError('No se pudo validar el cupón');
    } finally {
      setCouponValidating(false);
    }
  };

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = Math.max(0, total - discountAmount);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Agrega productos al carrito antes de continuar');
      return;
    }
    if (!customer.firstName.trim() || !customer.lastName.trim() || !customer.email.trim()) {
      setError('Nombre, apellido y correo son obligatorios');
      return;
    }
    if (deliveryMethod === 'DELIVERY' && !mapAddress) {
      setError('Selecciona el punto de entrega en el mapa');
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
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? mapAddress?.street : undefined,
        deliveryCity: deliveryMethod === 'DELIVERY' ? mapAddress?.city || undefined : undefined,
        deliveryDepartment: deliveryMethod === 'DELIVERY' ? mapAddress?.department || undefined : undefined,
        deliveryNotes: deliveryMethod === 'DELIVERY' ? deliveryNotes.trim() || undefined : undefined,
        deliveryLat: deliveryMethod === 'DELIVERY' ? mapAddress?.lat : undefined,
        deliveryLng: deliveryMethod === 'DELIVERY' ? mapAddress?.lng : undefined,
        couponCode: appliedCoupon?.coupon?.code,
      });

      clear();
      setCustomer({ firstName: '', lastName: '', email: '', phone: '' });
      setMapAddress(null);
      setDeliveryNotes('');
      setCouponInput('');
      setAppliedCoupon(null);
      setCouponError(null);
      setSuccess('¡Pedido creado! Pronto recibirás confirmación por correo.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className='animate-fade-up space-y-8'>
      {/* Header */}
      <Box className='rounded-[2rem] bg-gradient-to-br from-primary/6 via-white to-secondary/4 px-7 py-10 shadow-soft'>
        <Box className='flex items-center gap-3'>
          <Box className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10'>
            <Icon name='bx-cart' className='text-2xl text-primary' />
          </Box>
          <Box>
            <Typography variant='h1' className='text-2xl font-bold md:text-3xl'>
              Mi carrito
            </Typography>
            <Typography className='text-sm text-neutral-dark/60'>
              {items.length === 0
                ? 'Tu carrito está vacío'
                : `${items.length} producto${items.length !== 1 ? 's' : ''} seleccionado${items.length !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]'>
        {/* Products */}
        <Box className='surface-elevated rounded-[1.75rem] p-6'>
          <Typography variant='h2' className='text-lg font-semibold'>
            Productos
          </Typography>

          <Box className='mt-4 space-y-3'>
            {items.length === 0 ? (
              <Box className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-gray/50 py-14 text-center'>
                <Icon name='bx-cart-alt' className='mb-3 text-5xl text-neutral-gray' />
                <Typography className='font-medium text-neutral-dark/50'>
                  Aún no agregaste productos
                </Typography>
                <Typography className='mt-1 text-sm text-neutral-dark/35'>
                  Explora el catálogo y haz clic en "Agregar"
                </Typography>
              </Box>
            ) : (
              items.map((item) => (
                <Box
                  key={item.productId}
                  className='group flex items-center gap-4 rounded-2xl border border-neutral-gray/20 bg-white p-4 transition-all hover:border-primary/20 hover:shadow-soft'
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className='h-16 w-16 flex-shrink-0 rounded-xl object-cover'
                    />
                  ) : (
                    <Box className='flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100'>
                      <Icon name='bx-package' className='text-2xl text-neutral-gray' />
                    </Box>
                  )}

                  <Box className='min-w-0 flex-1'>
                    <Typography className='truncate font-semibold'>{item.name}</Typography>
                    <Typography className='mt-0.5 text-sm font-medium text-primary'>
                      {formatCurrencyCOP(item.price)} c/u
                    </Typography>
                  </Box>

                  <Box className='flex items-center gap-2'>
                    <button
                      type='button'
                      aria-label='Reducir cantidad'
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className='flex h-7 w-7 items-center justify-center rounded-full border border-neutral-gray/40 bg-white text-neutral-dark/70 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
                    >
                      <Icon name='bx-minus' className='text-xs' />
                    </button>
                    <span className='w-6 text-center text-sm font-semibold tabular-nums'>
                      {item.quantity}
                    </span>
                    <button
                      type='button'
                      aria-label='Aumentar cantidad'
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className='flex h-7 w-7 items-center justify-center rounded-full border border-neutral-gray/40 bg-white text-neutral-dark/70 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary'
                    >
                      <Icon name='bx-plus' className='text-xs' />
                    </button>
                  </Box>

                  <Typography className='w-24 text-right text-sm font-bold tabular-nums text-neutral-dark'>
                    {formatCurrencyCOP(item.price * item.quantity)}
                  </Typography>

                  {typeof removeItem === 'function' ? (
                    <button
                      type='button'
                      aria-label='Eliminar producto'
                      onClick={() => removeItem(item.productId)}
                      className='ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-dark/30 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500'
                    >
                      <Icon name='bx-trash' className='text-sm' />
                    </button>
                  ) : null}
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Sidebar */}
        <Box className='space-y-4'>
          {/* Login gate */}
          {!authenticated ? (
            <Box className='surface-elevated flex flex-col items-center rounded-[1.75rem] p-8 text-center'>
              <Box className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10'>
                <Icon name='bx-lock-alt' className='text-2xl text-primary' />
              </Box>
              <Typography variant='h2' className='text-lg font-semibold'>
                Inicia sesión para continuar
              </Typography>
              <Typography className='mt-2 text-sm text-neutral-dark/60'>
                Necesitas una cuenta para completar tu pedido y poder rastrearlo.
              </Typography>
              <Link
                to={ROUTES.PUBLIC.LOGIN}
                className='mt-6 w-full rounded-2xl bg-primary py-3 text-center text-sm font-bold text-white transition hover:opacity-90'
              >
                Iniciar sesión
              </Link>
              <Typography className='mt-3 text-xs text-neutral-dark/40'>
                ¿No tienes cuenta? Contacta al administrador para recibir una invitación.
              </Typography>
            </Box>
          ) : null}

          {/* Customer form, delivery and summary — only when authenticated */}
          {authenticated ? (
          <>
          <Box className='surface-elevated rounded-[1.75rem] p-6'>
            <Box className='mb-5 flex items-center gap-2'>
              <Icon name='bx-user-circle' className='text-xl text-primary' />
              <Typography variant='h2' className='text-lg font-semibold'>
                Datos del cliente
              </Typography>
            </Box>
            <Box className='space-y-3'>
              <Box className='grid grid-cols-2 gap-3'>
                <Input
                  placeholder='Nombre'
                  value={customer.firstName}
                  onChange={(e) => setCustomer((c) => ({ ...c, firstName: e.target.value }))}
                />
                <Input
                  placeholder='Apellido'
                  value={customer.lastName}
                  onChange={(e) => setCustomer((c) => ({ ...c, lastName: e.target.value }))}
                />
              </Box>
              <Input
                type='email'
                placeholder='correo@ejemplo.com'
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              />
              <Input
                type='tel'
                placeholder='Teléfono (opcional)'
                value={customer.phone}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              />
            </Box>
          </Box>

          {/* Delivery method */}
          <Box className='surface-elevated rounded-[1.75rem] p-6'>
            <Box className='mb-4 flex items-center gap-2'>
              <Icon name='bx-package' className='text-xl text-primary' />
              <Typography variant='h2' className='text-lg font-semibold'>
                Método de entrega
              </Typography>
            </Box>
            <Box className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => setDeliveryMethod('PICKUP')}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition-all ${
                  deliveryMethod === 'PICKUP'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-neutral-gray/30 text-neutral-dark/60 hover:border-primary/30'
                }`}
              >
                <Icon name='bx-store' className='text-2xl' />
                Recoger en tienda
              </button>
              <button
                type='button'
                onClick={() => setDeliveryMethod('DELIVERY')}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition-all ${
                  deliveryMethod === 'DELIVERY'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-neutral-gray/30 text-neutral-dark/60 hover:border-primary/30'
                }`}
              >
                <Icon name='bx-car' className='text-2xl' />
                Envío a domicilio
              </button>
            </Box>

            {deliveryMethod === 'DELIVERY' ? (
              <Box className='mt-4 space-y-3'>
                <MapAddressPicker value={mapAddress} onChange={setMapAddress} />
                <Input
                  placeholder='Notas para la entrega (piso, apartamento, referencias…)'
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </Box>
            ) : (
              <Box className='mt-3 rounded-2xl border border-neutral-gray/20 bg-neutral-50 px-4 py-3 text-sm text-neutral-dark/60'>
                Coordina el punto de recogida directamente con la tienda.
              </Box>
            )}
          </Box>

          {/* Summary */}
          <Box className='surface-elevated rounded-[1.75rem] p-6'>
            <Typography variant='h2' className='mb-4 text-lg font-semibold'>
              Resumen
            </Typography>

            <Box className='space-y-2 text-sm'>
              {items.map((item) => (
                <Box key={item.productId} className='flex justify-between text-neutral-dark/70'>
                  <span className='truncate pr-2'>{item.name} × {item.quantity}</span>
                  <span className='flex-shrink-0 tabular-nums'>{formatCurrencyCOP(item.price * item.quantity)}</span>
                </Box>
              ))}
            </Box>

            {/* Coupon input */}
            <Box className='mt-4 space-y-2'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    if (appliedCoupon) { setAppliedCoupon(null); setCouponError(null); }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { void handleApplyCoupon(); } }}
                  placeholder='Código de descuento'
                  maxLength={50}
                  disabled={!!appliedCoupon}
                  className='flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'
                />
                <button
                  type='button'
                  onClick={appliedCoupon ? () => { setAppliedCoupon(null); setCouponInput(''); setCouponError(null); } : () => { void handleApplyCoupon(); }}
                  disabled={couponValidating || (!couponInput.trim() && !appliedCoupon)}
                  className='flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-dark disabled:opacity-40 active:scale-95'
                >
                  {couponValidating
                    ? <i className='bx bx-loader-alt animate-spin text-sm' />
                    : appliedCoupon
                      ? <><i className='bx bx-x text-sm' />Quitar</>
                      : 'Aplicar'}
                </button>
              </div>
              {couponError ? (
                <p className='flex items-center gap-1.5 text-xs text-red-600'>
                  <i className='bx bx-error-circle text-sm' />
                  {couponError}
                </p>
              ) : null}
              {appliedCoupon?.valid ? (
                <p className='flex items-center gap-1.5 text-xs font-semibold text-green-700'>
                  <i className='bx bx-check-circle text-sm' />
                  Cupón <strong>{appliedCoupon.coupon?.code}</strong> aplicado — descuento {formatCurrencyCOP(discountAmount)}
                </p>
              ) : null}
            </Box>

            <Box className='mt-4 space-y-1.5 border-t border-neutral-gray/20 pt-4'>
              <div className='flex items-center justify-between text-sm text-neutral-dark/65'>
                <span>Subtotal</span>
                <span>{formatCurrencyCOP(total)}</span>
              </div>
              {discountAmount > 0 ? (
                <div className='flex items-center justify-between text-sm font-semibold text-green-700'>
                  <span>Descuento ({appliedCoupon?.coupon?.code})</span>
                  <span>-{formatCurrencyCOP(discountAmount)}</span>
                </div>
              ) : null}
              <div className='flex items-center justify-between'>
                <Typography className='text-sm font-medium text-neutral-dark/65'>Total del pedido</Typography>
                <Typography variant='h3' className='text-2xl font-bold text-neutral-dark'>
                  {formatCurrencyCOP(finalTotal)}
                </Typography>
              </div>
            </Box>

            {error ? (
              <Box className='mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                <Icon name='bx-error-circle' className='mt-0.5 flex-shrink-0 text-base' />
                {error}
              </Box>
            ) : null}

            {success ? (
              <Box className='mt-4 flex items-start gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
                <Icon name='bx-check-circle' className='mt-0.5 flex-shrink-0 text-base' />
                {success}
              </Box>
            ) : null}

            <Button
              type='button'
              variant='primary'
              fullWidth
              size='lg'
              className='mt-5'
              loading={submitting}
              disabled={items.length === 0}
              onClick={() => void handleCheckout()}
            >
              {submitting ? 'Procesando...' : 'Confirmar pedido'}
            </Button>

            {items.length > 0 ? (
              <button
                type='button'
                onClick={clear}
                className='mt-3 w-full rounded-2xl py-2 text-center text-xs font-medium text-neutral-dark/40 transition hover:text-red-500'
              >
                Vaciar carrito
              </button>
            ) : null}
          </Box>
          </>) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default CartPage;
