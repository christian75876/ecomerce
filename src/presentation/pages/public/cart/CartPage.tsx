import { useEffect, useRef, useState } from 'react';
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
import type { ICouponValidation } from '@/application/dtos/coupons/CouponDtos';
import type { IOrder } from '@/application/dtos/orders/response/OrderResponse';

const fallbackImage =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80';

const CartPage = () => {
  const { items, total, updateQuantity, removeItem, clear } = useCart();
  const authenticated = isAuthenticated();
  const sessionUser = getAuthenticatedUser();

  // Pickup/delivery availability depends on what the store itself allows
  // (deliveryOptions: DELIVERY | PICKUP | BOTH) — only checked for single-store
  // carts, since a multi-store cart's consolidated delivery is a separate,
  // unhandled case (not something changed here).
  const cartStoreIds = [...new Set(items.map((i) => i.storeId).filter(Boolean))];
  const singleStoreOptions =
    cartStoreIds.length === 1
      ? items.find((i) => i.storeId === cartStoreIds[0])?.storeDeliveryOptions
      : undefined;
  const pickupAvailable =
    cartStoreIds.length === 1 &&
    singleStoreOptions !== 'DELIVERY' &&
    Boolean(items.find((i) => i.storeId === cartStoreIds[0])?.storeAddressText);
  const deliveryAvailable = cartStoreIds.length !== 1 || singleStoreOptions !== 'PICKUP';
  const pickupAddress = pickupAvailable
    ? (items.find((i) => i.storeAddressText)?.storeAddressText ?? null)
    : null;

  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>(() =>
    !deliveryAvailable && pickupAvailable ? 'PICKUP' : 'DELIVERY',
  );

  // Keep the selected method valid as cart contents change (e.g. switching
  // to a pickup-only store, or clearing a multi-store cart down to one item).
  useEffect(() => {
    if (!pickupAvailable && deliveryMethod === 'PICKUP') {
      setDeliveryMethod('DELIVERY');
    } else if (!deliveryAvailable && deliveryMethod === 'DELIVERY') {
      setDeliveryMethod('PICKUP');
    }
  }, [pickupAvailable, deliveryAvailable, deliveryMethod]);
  const [deliveryStreet, setDeliveryStreet] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryDepartment, setDeliveryDepartment] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; storePaymentInstructions: string | null } | null>(null);
  const [paymentMethodType, setPaymentMethodType] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [evidenceImage, setEvidenceImage] = useState<File | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentSkipped, setPaymentSkipped] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const paymentPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (createdOrder) {
      paymentPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [createdOrder]);

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
    if (!sessionUser?.email) {
      setError('Tu sesión expiró. Vuelve a iniciar sesión.');
      return;
    }
    if (deliveryMethod === 'DELIVERY' && !deliveryStreet.trim()) {
      setError('Ingresa la dirección de entrega');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const orderResp = await OrdersRepository.createOrder({
        ...(sessionUser.customer?.id
          ? { customerId: sessionUser.customer.id }
          : {
              customer: {
                firstName: sessionUser.customer?.firstName ?? sessionUser.email.split('@')[0],
                lastName: sessionUser.customer?.lastName ?? '',
                email: sessionUser.email,
                phone: sessionUser.customer?.phone ?? undefined,
              },
            }),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'DELIVERY' ? deliveryStreet.trim() : undefined,
        deliveryCity: deliveryMethod === 'DELIVERY' ? deliveryCity.trim() || undefined : undefined,
        deliveryDepartment: deliveryMethod === 'DELIVERY' ? deliveryDepartment.trim() || undefined : undefined,
        deliveryNotes: deliveryMethod === 'DELIVERY' ? deliveryNotes.trim() || undefined : undefined,
        couponCode: appliedCoupon?.coupon?.code,
      });

      const orderData = orderResp.data as IOrder & { storePaymentInstructions?: string | null };
      setCreatedOrder({
        id: orderData.id,
        storePaymentInstructions: orderData.storePaymentInstructions ?? null,
      });

      clear();
      setDeliveryStreet('');
      setDeliveryCity('');
      setDeliveryDepartment('');
      setDeliveryNotes('');
      setCouponInput('');
      setAppliedCoupon(null);
      setCouponError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  const hasPaymentEvidence = paymentMethodType.trim() || paymentReference.trim() || evidenceImage;

  const handleSubmitPayment = async () => {
    if (!createdOrder || !hasPaymentEvidence) return;
    setPaymentSubmitting(true);
    setPaymentError(null);
    try {
      await OrdersRepository.submitPayment(createdOrder.id, {
        paymentMethodType: paymentMethodType.trim() || undefined,
        paymentReference: paymentReference.trim() || undefined,
        evidenceImage: evidenceImage ?? undefined,
      });
      setPaymentSubmitted(true);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'No se pudo enviar el comprobante');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  return (
    <Box className='animate-fade-up space-y-8'>
      {/* Header */}
      <Box className='rounded-2xl bg-gradient-to-br from-primary/6 via-white to-secondary/4 px-4 py-6 shadow-soft sm:rounded-[2rem] sm:px-7 sm:py-10'>
        <Box className='flex items-center gap-3'>
          <Box className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-11 sm:w-11 sm:rounded-2xl'>
            <Icon name='bx-cart' className='text-xl text-primary sm:text-2xl' />
          </Box>
          <Box>
            <Typography variant='h1' className='font-display text-xl font-extrabold sm:text-2xl md:text-3xl'>
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

      {!createdOrder && (
      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]'>
        {/* Products */}
        <Box className='surface-elevated rounded-2xl p-4 sm:rounded-[1.75rem] sm:p-6'>
          <Typography variant='h2' className='text-base font-semibold sm:text-lg'>
            Productos
          </Typography>

          <Box className='mt-4 space-y-3'>
            {items.length === 0 ? (
              <Box className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-gray/50 py-10 text-center sm:py-14'>
                <Icon name='bx-cart-alt' className='mb-3 text-4xl text-neutral-gray sm:text-5xl' />
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
                  className='flex items-center gap-3 rounded-2xl border border-neutral-gray/20 bg-white p-3 transition-all hover:border-primary/20 hover:shadow-soft sm:gap-4 sm:p-4'
                >
                  {/* Imagen */}
                  <img
                    src={item.imageUrl || fallbackImage}
                    alt={item.name}
                    className='h-12 w-12 flex-shrink-0 rounded-xl object-cover sm:h-16 sm:w-16'
                  />

                  {/* Nombre + precio */}
                  <Box className='min-w-0 flex-1'>
                    <Typography className='truncate text-sm font-semibold sm:text-base'>{item.name}</Typography>
                    <Typography className='mt-0.5 text-xs font-medium text-primary sm:text-sm'>
                      {formatCurrencyCOP(item.price)} c/u
                    </Typography>
                    {/* Total inline — solo visible en mobile */}
                    <Typography className='mt-0.5 text-xs font-bold tabular-nums text-neutral-dark sm:hidden'>
                      {formatCurrencyCOP(item.price * item.quantity)}
                    </Typography>
                  </Box>

                  {/* Controles de cantidad */}
                  <Box className='flex items-center gap-1 sm:gap-2'>
                    <button
                      type='button'
                      aria-label='Reducir cantidad'
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className='flex h-6 w-6 items-center justify-center rounded-full border border-neutral-gray/40 bg-white text-neutral-dark/70 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:h-7 sm:w-7'
                    >
                      <Icon name='bx-minus' className='text-[10px] sm:text-xs' />
                    </button>
                    <span className='w-5 text-center text-sm font-semibold tabular-nums sm:w-6'>
                      {item.quantity}
                    </span>
                    <button
                      type='button'
                      aria-label='Aumentar cantidad'
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                      className='flex h-6 w-6 items-center justify-center rounded-full border border-neutral-gray/40 bg-white text-neutral-dark/70 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 sm:h-7 sm:w-7'
                    >
                      <Icon name='bx-plus' className='text-[10px] sm:text-xs' />
                    </button>
                  </Box>

                  {/* Total — oculto en mobile, visible en sm+ */}
                  <Typography className='hidden w-24 text-right text-sm font-bold tabular-nums text-neutral-dark sm:block'>
                    {formatCurrencyCOP(item.price * item.quantity)}
                  </Typography>

                  {/* Eliminar — siempre visible en mobile (no hay hover), hover-only en desktop */}
                  {typeof removeItem === 'function' ? (
                    <button
                      type='button'
                      aria-label='Eliminar producto'
                      onClick={() => removeItem(item.productId)}
                      className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-dark/30 transition hover:bg-error-light hover:text-error'
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
            <Box className='surface-elevated flex flex-col items-center rounded-2xl p-5 text-center sm:rounded-[1.75rem] sm:p-8'>
              <Box className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 sm:h-14 sm:w-14 sm:rounded-2xl'>
                <Icon name='bx-lock-alt' className='text-xl text-primary sm:text-2xl' />
              </Box>
              <Typography variant='h2' className='text-base font-semibold sm:text-lg'>
                Inicia sesión para continuar
              </Typography>
              <Typography className='mt-2 text-xs text-neutral-dark/60 sm:text-sm'>
                Necesitas una cuenta para completar tu pedido y poder rastrearlo.
              </Typography>
              <Link
                to={ROUTES.PUBLIC.LOGIN}
                className='mt-5 w-full rounded-xl bg-primary py-2.5 text-center text-sm font-bold text-white transition hover:opacity-90 sm:mt-6 sm:rounded-2xl sm:py-3'
              >
                Iniciar sesión
              </Link>
              <Typography className='mt-3 text-[11px] text-neutral-dark/40 sm:text-xs'>
                ¿No tienes cuenta? Contacta al administrador para recibir una invitación.
              </Typography>
            </Box>
          ) : null}

          {/* Delivery and summary — only when authenticated */}
          {authenticated ? (
          <>
          {/* Delivery method */}
          <Box className='surface-elevated rounded-2xl p-4 sm:rounded-[1.75rem] sm:p-6'>
            <Box className='mb-4 flex items-center gap-2'>
              <Icon name='bx-package' className='text-xl text-primary' />
              <Typography variant='h2' className='text-base font-semibold sm:text-lg'>
                Método de entrega
              </Typography>
            </Box>
            <Box className={`grid gap-3 ${pickupAvailable && deliveryAvailable ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {pickupAvailable && (
                <button
                  type='button'
                  onClick={() => { setDeliveryMethod('PICKUP'); setError(null); }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition-all ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-neutral-gray/30 text-neutral-dark/60 hover:border-primary/30'
                  }`}
                >
                  <Icon name='bx-store' className='text-2xl' />
                  Recoger en tienda
                </button>
              )}
              {deliveryAvailable && (
                <button
                  type='button'
                  onClick={() => { setDeliveryMethod('DELIVERY'); setError(null); }}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition-all ${
                    deliveryMethod === 'DELIVERY'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-neutral-gray/30 text-neutral-dark/60 hover:border-primary/30'
                  }`}
                >
                  <Icon name='bx-car' className='text-2xl' />
                  Envío a domicilio
                </button>
              )}
            </Box>
            {!deliveryAvailable ? (
              <p className='mt-2 text-xs text-neutral-dark/50'>
                Esta tienda solo ofrece recogida en tienda, no hace envíos a domicilio.
              </p>
            ) : null}

            {deliveryMethod === 'DELIVERY' ? (
              <Box className='mt-4 space-y-3'>
                <Input
                  placeholder='Dirección completa (Calle, Carrera, número…) *'
                  value={deliveryStreet}
                  onChange={(e) => setDeliveryStreet(e.target.value)}
                />
                <Box className='grid grid-cols-2 gap-2'>
                  <Input
                    placeholder='Ciudad'
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                  />
                  <Input
                    placeholder='Departamento'
                    value={deliveryDepartment}
                    onChange={(e) => setDeliveryDepartment(e.target.value)}
                  />
                </Box>
                <Input
                  placeholder='Notas de entrega (piso, apartamento, referencias…)'
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </Box>
            ) : pickupAvailable && pickupAddress ? (
              (() => {
                const coordMatch = pickupAddress.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
                if (coordMatch) {
                  const mapsUrl = `https://maps.google.com/?q=${coordMatch[1]},${coordMatch[2]}`;
                  return (
                    <Box className='mt-3 rounded-2xl border border-success/25 bg-success-light px-4 py-3'>
                      <a
                        href={mapsUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex items-center gap-2 text-sm font-semibold text-success hover:underline'
                      >
                        <Icon name='bx-map-pin' className='shrink-0 text-base' />
                        Ver punto de recogida en mapa
                        <Icon name='bx-link-external' className='text-xs' />
                      </a>
                      <p className='mt-1 text-xs text-success'>
                        Coordina el horario de recogida directamente con la tienda.
                      </p>
                    </Box>
                  );
                }
                return (
                  <Box className='mt-3 rounded-2xl border border-success/25 bg-success-light px-4 py-3'>
                    <p className='flex items-center gap-2 text-sm font-semibold text-success'>
                      <Icon name='bx-map-pin' className='shrink-0 text-base' />
                      {pickupAddress}
                    </p>
                    <p className='mt-1 text-xs text-success'>
                      Recogerás tu pedido en esta dirección. Coordina el horario con la tienda.
                    </p>
                  </Box>
                );
              })()
            ) : null}
          </Box>

          {/* Summary */}
          <Box className='surface-elevated rounded-2xl p-4 sm:rounded-[1.75rem] sm:p-6'>
            <Typography variant='h2' className='mb-4 text-base font-semibold sm:text-lg'>
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
                  className='flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60'
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
                <p className='flex items-center gap-1.5 text-xs text-error'>
                  <i className='bx bx-error-circle text-sm' />
                  {couponError}
                </p>
              ) : null}
              {appliedCoupon?.valid ? (
                <p className='flex items-center gap-1.5 text-xs font-semibold text-success'>
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
                <div className='flex items-center justify-between text-sm font-semibold text-success'>
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
              <Box className='mt-4 flex items-start gap-2 rounded-2xl border border-error/25 bg-error-light px-4 py-3 text-sm text-error'>
                <Icon name='bx-error-circle' className='mt-0.5 flex-shrink-0 text-base' />
                {error}
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
                className='mt-3 w-full rounded-2xl py-2 text-center text-xs font-medium text-neutral-dark/40 transition hover:text-error'
              >
                Vaciar carrito
              </button>
            ) : null}
          </Box>
          </>) : null}
        </Box>
      </Box>
      )}

      {/* Payment panel — shown after successful order creation */}
      {createdOrder ? (
        <Box ref={paymentPanelRef} className='surface-elevated rounded-2xl p-4 sm:rounded-[1.75rem] sm:p-6'>
          {/* Header */}
          <Box className='mb-4 flex items-center gap-3'>
            <Box className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success-light'>
              <Icon name='bx-check-circle' className='text-lg text-success' />
            </Box>
            <Box>
              <Typography variant='h2' className='text-base font-semibold'>
                ¡Pedido creado!
              </Typography>
              <Typography className='text-xs text-neutral-dark/55'>
                #{createdOrder.id.slice(0, 8).toUpperCase()}
                {paymentSubmitted
                  ? ' — Comprobante enviado'
                  : paymentSkipped
                  ? ' — Pedido en espera'
                  : ' — Ahora envía tu comprobante de pago'}
              </Typography>
            </Box>
          </Box>

          {/* 5-day warning */}
          {!paymentSubmitted && !paymentSkipped && (
            <Box className='mb-4 flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning-light px-4 py-3'>
              <Icon name='bx-time' className='mt-0.5 shrink-0 text-base text-warning' />
              <p className='text-xs text-warning'>
                <strong>Sin comprobante</strong>, tu pedido quedará archivado y se cancelará automáticamente en <strong>5 días</strong> si la tienda no confirma el pago.
              </p>
            </Box>
          )}

          {/* Store payment instructions */}
          {createdOrder.storePaymentInstructions && !paymentSubmitted && !paymentSkipped ? (
            <Box className='mb-4 rounded-xl border border-info/25 bg-info-light px-4 py-3'>
              <p className='mb-1 text-xs font-bold uppercase tracking-wide text-info'>Instrucciones de pago</p>
              <p className='whitespace-pre-line text-sm text-info'>{createdOrder.storePaymentInstructions}</p>
            </Box>
          ) : null}

          {/* Done states */}
          {paymentSubmitted ? (
            <Box className='space-y-3'>
              <Box className='flex items-center gap-2 rounded-xl border border-success/25 bg-success-light px-4 py-3 text-sm font-semibold text-success'>
                <Icon name='bx-check-circle' className='text-base' />
                Comprobante enviado. La tienda verificará tu pago pronto.
              </Box>
              <Link
                to={ROUTES.PUBLIC.MY_ORDERS}
                className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90'
              >
                <Icon name='bx-list-ul' className='text-base' />
                Ver mis pedidos
              </Link>
            </Box>
          ) : paymentSkipped ? (
            <Box className='space-y-3'>
              <Box className='flex items-center gap-2 rounded-xl border border-warning/25 bg-warning-light px-4 py-3 text-sm text-warning'>
                <Icon name='bx-time' className='text-base' />
                Pedido en espera. Tienes 5 días para enviar tu comprobante desde "Mis pedidos".
              </Box>
              <Link
                to={ROUTES.PUBLIC.MY_ORDERS}
                className='flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90'
              >
                <Icon name='bx-list-ul' className='text-base' />
                Ver mis pedidos
              </Link>
            </Box>
          ) : (
            <Box className='space-y-3'>
              <Box>
                <label className='mb-1 block text-xs font-medium text-neutral-dark/60'>
                  Medio de pago <span className='text-neutral-dark/40'>(Nequi, Bancolombia, Daviplata…)</span>
                </label>
                <input
                  type='text'
                  placeholder='Ej: Nequi 3001234567'
                  value={paymentMethodType}
                  onChange={(e) => setPaymentMethodType(e.target.value)}
                  maxLength={120}
                  className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-500 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                />
              </Box>

              <Box>
                <label className='mb-1 block text-xs font-medium text-neutral-dark/60'>
                  Número de referencia / transacción
                </label>
                <input
                  type='text'
                  placeholder='Ej: 1234567890'
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  maxLength={200}
                  className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-500 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20'
                />
              </Box>

              {/* Image upload */}
              <Box>
                <label className='mb-1 block text-xs font-medium text-neutral-dark/60'>
                  Captura de pantalla del pago <span className='text-neutral-dark/40'>(recomendado)</span>
                </label>
                {evidenceImage ? (
                  <Box className='flex items-center gap-3 rounded-xl border border-success/25 bg-success-light px-3 py-2.5'>
                    <Icon name='bx-image' className='shrink-0 text-lg text-success' />
                    <span className='min-w-0 flex-1 truncate text-sm font-medium text-success'>
                      {evidenceImage.name}
                    </span>
                    <button
                      type='button'
                      onClick={() => setEvidenceImage(null)}
                      className='shrink-0 text-xs text-success hover:text-error'
                    >
                      Quitar
                    </button>
                  </Box>
                ) : (
                  <label className='flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 transition hover:border-primary/50 hover:bg-primary/[0.03]'>
                    <Icon name='bx-upload' className='shrink-0 text-lg text-slate-400' />
                    <span className='text-sm text-slate-500'>Seleccionar imagen (jpg, png, webp)</span>
                    <input
                      type='file'
                      accept='image/jpeg,image/png,image/webp'
                      className='hidden'
                      onChange={(e) => setEvidenceImage(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </Box>

              {paymentError ? (
                <Box className='flex items-center gap-2 rounded-xl border border-error/25 bg-error-light px-3 py-2 text-xs text-error'>
                  <Icon name='bx-error-circle' className='shrink-0 text-sm' />
                  {paymentError}
                </Box>
              ) : null}

              <Button
                type='button'
                variant='primary'
                fullWidth
                loading={paymentSubmitting}
                disabled={!hasPaymentEvidence}
                onClick={() => void handleSubmitPayment()}
              >
                Enviar comprobante
              </Button>

              <button
                type='button'
                onClick={() => setPaymentSkipped(true)}
                className='w-full pt-1 text-center text-xs text-neutral-dark/40 transition hover:text-neutral-dark/60'
              >
                Continuar sin enviar comprobante (el pedido quedará en espera)
              </button>
            </Box>
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default CartPage;
