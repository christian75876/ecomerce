import { useEffect, useMemo, useState } from 'react';
import { IPurchase } from '@/application/dtos/purchases/response/PurchaseResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Card from '@/presentation/ui/atoms/card/SimpleCard';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { formatDate } from '@/shared/utils/formatDate';
import { buildAssetUrl } from '@/shared/utils/buildAssetUrl';
import PurchaseModalShell from './PurchaseModalShell';
import PurchaseStatusBadge from './PurchaseStatusBadge';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';
import {
  PurchaseCancelForm,
  PurchaseEditForm,
  PurchasePaymentForm,
} from '@/application/useCases/purchases/usePurchasesManagement';

interface PurchaseDetailModalProps {
  purchase: IPurchase | null;
  isOpen: boolean;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  paymentForm: PurchasePaymentForm;
  editForm: PurchaseEditForm;
  cancelForm: PurchaseCancelForm;
  onClose: () => void;
  onPaymentFormChange: <K extends keyof PurchasePaymentForm>(
    key: K,
    value: PurchasePaymentForm[K],
  ) => void;
  onEditFormChange: (key: keyof PurchaseEditForm, value: string) => void;
  onCancelFormChange: (key: keyof PurchaseCancelForm, value: string) => void;
  onSubmitPayment: () => Promise<boolean>;
  onSubmitEdit: () => Promise<boolean>;
  onSubmitCancel: () => Promise<boolean>;
}

const PurchaseDetailModal = ({
  purchase,
  isOpen,
  loading,
  submitting,
  error,
  paymentForm,
  editForm,
  cancelForm,
  onClose,
  onPaymentFormChange,
  onEditFormChange,
  onCancelFormChange,
  onSubmitPayment,
  onSubmitEdit,
  onSubmitCancel,
}: PurchaseDetailModalProps) => {
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [activeActionTab, setActiveActionTab] = useState<
    'payment' | 'edit' | 'cancel'
  >('payment');
  const paymentsPerPage = 3;
  const paymentReceiptUrl = (path?: string | null) => buildAssetUrl(path);
  const sortedPayments = useMemo(
    () =>
      [...(purchase?.payments ?? [])].sort(
        (left, right) =>
          new Date(right.paidAt).getTime() - new Date(left.paidAt).getTime(),
      ),
    [purchase?.payments],
  );
  const paymentsTotalPages = Math.max(
    1,
    Math.ceil(sortedPayments.length / paymentsPerPage),
  );
  const visiblePayments = sortedPayments.slice(
    (paymentsPage - 1) * paymentsPerPage,
    paymentsPage * paymentsPerPage,
  );

  useEffect(() => {
    setPaymentsPage(1);
  }, [purchase?.id, sortedPayments.length]);

  useEffect(() => {
    setActiveActionTab('payment');
  }, [purchase?.id]);

  if (!isOpen) {
    return null;
  }

  return (
    <PurchaseModalShell
      title='Detalle de compra'
      description='Consulta ítems, pagos, saldo pendiente y gestiona la compra sin salir de esta vista.'
      maxWidthClassName='max-w-5xl'
      onClose={onClose}
    >
      <Box className='mt-6 space-y-6'>
        {loading ? (
          <Typography>Cargando detalle de compra...</Typography>
        ) : !purchase ? (
          <Box className='rounded-2xl border border-dashed border-neutral-gray/30 px-6 py-10 text-center'>
            <Typography>No fue posible cargar el detalle de la compra.</Typography>
          </Box>
        ) : (
          <>
            <Box className='grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]'>
              <Card className='rounded-3xl border border-neutral-gray/20 p-5 shadow-none'>
                <Box className='flex flex-wrap items-start justify-between gap-3'>
                  <Box>
                    <Typography variant='h3' className='text-xl font-semibold'>
                      {purchase.supplier.name}
                    </Typography>
                    <Typography className='mt-1 text-sm text-neutral-dark/65'>
                      {purchase.store.name} · {formatDate(purchase.purchaseDate)}
                    </Typography>
                  </Box>
                  <PurchaseStatusBadge status={purchase.status} />
                </Box>

                <Box className='mt-4 grid gap-3 md:grid-cols-3'>
                  <Card className='rounded-2xl border border-neutral-gray/20 p-4 shadow-none'>
                    <Typography className='text-xs uppercase tracking-[0.18em] text-neutral-dark/45'>
                      Total
                    </Typography>
                    <Typography variant='h3' className='mt-2 text-lg font-semibold'>
                      {formatCurrencyCOP(purchase.total)}
                    </Typography>
                  </Card>
                  <Card className='rounded-2xl border border-neutral-gray/20 p-4 shadow-none'>
                    <Typography className='text-xs uppercase tracking-[0.18em] text-neutral-dark/45'>
                      Abonado
                    </Typography>
                    <Typography variant='h3' className='mt-2 text-lg font-semibold'>
                      {formatCurrencyCOP(purchase.paidAmount)}
                    </Typography>
                  </Card>
                  <Card className='rounded-2xl border border-neutral-gray/20 p-4 shadow-none'>
                    <Typography className='text-xs uppercase tracking-[0.18em] text-neutral-dark/45'>
                      Saldo
                    </Typography>
                    <Typography variant='h3' className='mt-2 text-lg font-semibold'>
                      {formatCurrencyCOP(purchase.balance)}
                    </Typography>
                  </Card>
                </Box>

                <Box className='mt-4 space-y-2 text-sm text-neutral-dark/70'>
                  <Typography>
                    Nota: {purchase.note?.trim() ? purchase.note : 'Sin observación'}
                  </Typography>
                  {purchase.cancelledAt ? (
                    <Typography>
                      Cancelada el {formatDate(purchase.cancelledAt)}
                      {purchase.cancelReason ? ` · ${purchase.cancelReason}` : ''}
                    </Typography>
                  ) : null}
                  {purchase.cancellationBlockedReason ? (
                    <Typography className='text-amber-700'>
                      Restricción: {purchase.cancellationBlockedReason}
                    </Typography>
                  ) : null}
                </Box>
              </Card>

              <Card className='rounded-3xl border border-neutral-gray/20 p-5 shadow-none'>
                <Typography variant='h3' className='text-lg font-semibold'>
                  Pagos registrados
                </Typography>
                <Box className='mt-4 space-y-3'>
                  {sortedPayments.length === 0 ? (
                    <Typography className='text-sm text-neutral-dark/60'>
                      Aún no hay abonos posteriores a la compra inicial.
                    </Typography>
                  ) : (
                    visiblePayments.map((payment) => (
                      <Box
                        key={payment.id}
                        className='rounded-2xl border border-neutral-gray/20 px-4 py-3'
                      >
                        <Box className='flex items-center justify-between gap-3'>
                          <Typography className='text-sm font-semibold'>
                            {formatCurrencyCOP(payment.amount)}
                          </Typography>
                          <Box className='text-right'>
                            <Typography className='text-xs font-semibold text-neutral-dark/65'>
                              {payment.paymentMethod === 'TRANSFER'
                                ? 'Transferencia'
                                : 'Efectivo'}
                            </Typography>
                            <Typography className='text-xs text-neutral-dark/55'>
                              {formatDate(payment.paidAt)}
                            </Typography>
                          </Box>
                        </Box>
                        {payment.reference ? (
                          <Typography className='mt-2 text-sm text-neutral-dark/65'>
                            Ref: {payment.reference}
                          </Typography>
                        ) : null}
                        {payment.note ? (
                          <Typography className='mt-2 text-sm text-neutral-dark/65'>
                            {payment.note}
                          </Typography>
                        ) : null}
                        {payment.receiptImagePath ? (
                          <a
                            href={paymentReceiptUrl(payment.receiptImagePath) ?? '#'}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-2 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline'
                          >
                            Ver constancia
                          </a>
                        ) : null}
                      </Box>
                    ))
                  )}
                </Box>
                {sortedPayments.length > paymentsPerPage ? (
                  <PaginationControls
                    currentPage={paymentsPage}
                    totalPages={paymentsTotalPages}
                    totalItems={sortedPayments.length}
                    itemsPerPage={paymentsPerPage}
                    loading={false}
                    onChangePage={setPaymentsPage}
                  />
                ) : null}
              </Card>
            </Box>

            <Card className='rounded-3xl border border-neutral-gray/20 p-5 shadow-none'>
              <Typography variant='h3' className='text-lg font-semibold'>
                Ítems de la compra
              </Typography>
              <Box className='mt-4 space-y-3'>
                {purchase.items.map((item) => (
                  <Box
                    key={item.id}
                    className='rounded-2xl border border-neutral-gray/20 px-4 py-4'
                  >
                    <Box className='flex flex-wrap items-start justify-between gap-3'>
                      <Box>
                        <Typography className='font-semibold'>
                          {item.product.name}
                        </Typography>
                        <Typography className='mt-1 text-sm text-neutral-dark/65'>
                          SKU: {item.product.sku} · Cantidad: {item.quantity} · Costo:{' '}
                          {formatCurrencyCOP(item.unitCost)}
                        </Typography>
                      </Box>
                      <Typography className='font-semibold'>
                        {formatCurrencyCOP(item.lineTotal)}
                      </Typography>
                    </Box>
                    <Typography className='mt-2 text-sm text-neutral-dark/65'>
                      Vencimiento:{' '}
                      {item.expiresAt ? formatDate(item.expiresAt) : 'No aplica'} ·
                      Lote: {item.batchCode?.trim() ? item.batchCode : 'Sin código'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>

            <Card className='rounded-3xl border border-neutral-gray/20 p-5 shadow-none'>
              <Box className='flex flex-wrap items-end gap-2 border-b border-neutral-gray/20 pb-0'>
                <button
                  type='button'
                  onClick={() => setActiveActionTab('payment')}
                  className={`rounded-t-2xl px-4 py-3 text-sm font-semibold transition ${
                    activeActionTab === 'payment'
                      ? 'border border-b-white border-neutral-gray/20 bg-white text-primary shadow-sm'
                      : 'bg-neutral-gray/10 text-neutral-dark/65 hover:bg-neutral-gray/15'
                  }`}
                >
                  Registrar abono
                </button>
                <button
                  type='button'
                  onClick={() => setActiveActionTab('edit')}
                  className={`rounded-t-2xl px-4 py-3 text-sm font-semibold transition ${
                    activeActionTab === 'edit'
                      ? 'border border-b-white border-neutral-gray/20 bg-white text-primary shadow-sm'
                      : 'bg-neutral-gray/10 text-neutral-dark/65 hover:bg-neutral-gray/15'
                  }`}
                >
                  Editar compra
                </button>
                <button
                  type='button'
                  onClick={() => setActiveActionTab('cancel')}
                  className={`rounded-t-2xl px-4 py-3 text-sm font-semibold transition ${
                    activeActionTab === 'cancel'
                      ? 'border border-b-white border-neutral-gray/20 bg-white text-primary shadow-sm'
                      : 'bg-neutral-gray/10 text-neutral-dark/65 hover:bg-neutral-gray/15'
                  }`}
                >
                  Cancelar compra
                </button>
              </Box>

              <Box className='pt-5'>
                {activeActionTab === 'payment' ? (
                  <Box className='space-y-3'>
                    <Box className='grid gap-4 md:grid-cols-2'>
                      <Box>
                        <Label htmlFor='purchase-payment-amount'>Monto</Label>
                        <Input
                          id='purchase-payment-amount'
                          type='number'
                          min='0'
                          step='0.01'
                          value={paymentForm.amount}
                          onChange={(event) =>
                            onPaymentFormChange('amount', event.target.value)
                          }
                          disabled={
                            submitting ||
                            purchase.status === 'CANCELLED' ||
                            purchase.balance <= 0
                          }
                        />
                      </Box>
                      <Box>
                        <Label htmlFor='purchase-payment-date'>Fecha de abono</Label>
                        <Input
                          id='purchase-payment-date'
                          type='datetime-local'
                          value={paymentForm.paidAt}
                          onChange={(event) =>
                            onPaymentFormChange('paidAt', event.target.value)
                          }
                          disabled={
                            submitting ||
                            purchase.status === 'CANCELLED' ||
                            purchase.balance <= 0
                          }
                        />
                      </Box>
                    </Box>
                    <Box className='grid gap-4 md:grid-cols-2'>
                      <Box>
                        <Label htmlFor='purchase-payment-method'>Medio de pago</Label>
                        <select
                          id='purchase-payment-method'
                          value={paymentForm.paymentMethod}
                          onChange={(event) =>
                            onPaymentFormChange(
                              'paymentMethod',
                              event.target.value as PurchasePaymentForm['paymentMethod'],
                            )
                          }
                          disabled={
                            submitting ||
                            purchase.status === 'CANCELLED' ||
                            purchase.balance <= 0
                          }
                          className='w-full rounded-2xl border border-neutral-gray/80 bg-white/90 px-4 py-3.5 shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20'
                        >
                          <option value='CASH'>Efectivo</option>
                          <option value='TRANSFER'>Transferencia</option>
                        </select>
                      </Box>
                      <Box>
                        <Label htmlFor='purchase-payment-reference'>
                          Referencia o comprobante
                        </Label>
                        <Input
                          id='purchase-payment-reference'
                          value={paymentForm.reference}
                          onChange={(event) =>
                            onPaymentFormChange('reference', event.target.value)
                          }
                          disabled={
                            submitting ||
                            purchase.status === 'CANCELLED' ||
                            purchase.balance <= 0
                          }
                          placeholder='Número de transferencia, banco, comprobante...'
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Label htmlFor='purchase-payment-note'>Nota</Label>
                      <Input
                        id='purchase-payment-note'
                        value={paymentForm.note}
                        onChange={(event) =>
                          onPaymentFormChange('note', event.target.value)
                        }
                        disabled={
                          submitting ||
                          purchase.status === 'CANCELLED' ||
                          purchase.balance <= 0
                        }
                      />
                    </Box>
                    <Box>
                      <Label htmlFor='purchase-payment-receipt'>
                        Foto de constancia
                      </Label>
                      <input
                        id='purchase-payment-receipt'
                        type='file'
                        accept='image/png,image/jpeg,image/webp'
                        disabled={
                          submitting ||
                          purchase.status === 'CANCELLED' ||
                          purchase.balance <= 0
                        }
                        className='block w-full rounded-2xl border border-neutral-gray/80 bg-white/90 px-4 py-3 text-sm shadow-sm transition-all file:mr-4 file:rounded-xl file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary hover:file:bg-primary/15 focus:outline-none'
                        onChange={(event) =>
                          onPaymentFormChange(
                            'receiptImage',
                            event.target.files?.[0] ?? null,
                          )
                        }
                      />
                      {paymentForm.receiptImage ? (
                        <Typography className='mt-2 text-xs text-neutral-dark/60'>
                          Archivo: {paymentForm.receiptImage.name}
                        </Typography>
                      ) : null}
                    </Box>
                    <Button
                      type='button'
                      variant='primary'
                      disabled={
                        submitting ||
                        purchase.status === 'CANCELLED' ||
                        purchase.balance <= 0
                      }
                      onClick={() => void onSubmitPayment()}
                    >
                      {submitting ? 'Procesando...' : 'Aplicar abono'}
                    </Button>
                  </Box>
                ) : null}

                {activeActionTab === 'edit' ? (
                  <Box className='space-y-3'>
                    <Box className='grid gap-4 md:grid-cols-2'>
                      <Box>
                        <Label htmlFor='purchase-edit-date'>Fecha</Label>
                        <Input
                          id='purchase-edit-date'
                          type='datetime-local'
                          value={editForm.purchaseDate}
                          onChange={(event) =>
                            onEditFormChange('purchaseDate', event.target.value)
                          }
                          disabled={submitting || purchase.status === 'CANCELLED'}
                        />
                      </Box>
                      <Box>
                        <Label htmlFor='purchase-edit-note'>Observación</Label>
                        <Input
                          id='purchase-edit-note'
                          value={editForm.note}
                          onChange={(event) =>
                            onEditFormChange('note', event.target.value)
                          }
                          disabled={submitting || purchase.status === 'CANCELLED'}
                        />
                      </Box>
                    </Box>
                    <Button
                      type='button'
                      variant='outlinePrimary'
                      disabled={submitting || purchase.status === 'CANCELLED'}
                      onClick={() => void onSubmitEdit()}
                    >
                      {submitting ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </Box>
                ) : null}

                {activeActionTab === 'cancel' ? (
                  <Box className='space-y-3'>
                    <Typography className='text-sm text-neutral-dark/65'>
                      La cancelación deshabilita la compra y deja de contarla en el
                      saldo pendiente general. Solo se permite si ninguno de sus lotes
                      ya tuvo consumo.
                    </Typography>
                    <Box>
                      <Label htmlFor='purchase-cancel-reason'>Motivo</Label>
                      <Input
                        id='purchase-cancel-reason'
                        value={cancelForm.reason}
                        onChange={(event) =>
                          onCancelFormChange('reason', event.target.value)
                        }
                        disabled={
                          submitting ||
                          purchase.status === 'CANCELLED' ||
                          purchase.canCancel === false
                        }
                      />
                    </Box>
                    <Button
                      type='button'
                      variant='danger'
                      disabled={
                        submitting ||
                        purchase.status === 'CANCELLED' ||
                        purchase.canCancel === false
                      }
                      onClick={() => void onSubmitCancel()}
                    >
                      {submitting ? 'Cancelando...' : 'Cancelar compra'}
                    </Button>
                  </Box>
                ) : null}
              </Box>
            </Card>

            {error ? (
              <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>
                {error}
              </Box>
            ) : null}
          </>
        )}
      </Box>
    </PurchaseModalShell>
  );
};

export default PurchaseDetailModal;
