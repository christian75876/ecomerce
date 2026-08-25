import { useState } from 'react';
import { PosCartItem, PosGuestInfo } from '@/application/useCases/pos/usePosManagement';
import { ICustomer } from '@/application/dtos/customers/response/CustomerResponse';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { PosGuestModal } from './PosGuestModal';
import { PosReceiptModal } from './PosReceiptModal';

interface PosManagementViewProps {
  products: IProduct[];
  customers: ICustomer[];
  cart: PosCartItem[];
  sales: ISale[];
  search: string;
  selectedCustomerId: string;
  paymentMethod: 'CASH' | 'CREDIT';
  loading: boolean;
  submitting: boolean;
  error: string | null;
  total: number;
  lastSale: ISale | null;
  lastSaleGuestInfo: PosGuestInfo | null;
  guestName: string;
  guestPhone: string;
  guestDocType: string;
  guestDoc: string;
  deliveryType: PosGuestInfo['deliveryType'];
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string;
  onSearchChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
  onPaymentMethodChange: (value: 'CASH' | 'CREDIT') => void;
  onGuestNameChange: (v: string) => void;
  onGuestPhoneChange: (v: string) => void;
  onGuestDocTypeChange: (v: string) => void;
  onGuestDocChange: (v: string) => void;
  onDeliveryTypeChange: (v: PosGuestInfo['deliveryType']) => void;
  onDeliveryAddressChange: (v: string) => void;
  onDeliveryCityChange: (v: string) => void;
  onDeliveryNotesChange: (v: string) => void;
  onAddToCart: (product: IProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onConfirmSale: () => Promise<boolean>;
  onCloseSaleReceipt: () => void;
}

export const PosManagementView = ({
  products,
  customers,
  cart,
  sales,
  search,
  selectedCustomerId,
  paymentMethod,
  loading,
  submitting,
  error,
  total,
  lastSale,
  lastSaleGuestInfo,
  guestName,
  guestPhone,
  guestDocType,
  guestDoc,
  deliveryType,
  deliveryAddress,
  deliveryCity,
  deliveryNotes,
  onSearchChange,
  onCustomerChange,
  onPaymentMethodChange,
  onGuestNameChange,
  onGuestPhoneChange,
  onGuestDocTypeChange,
  onGuestDocChange,
  onDeliveryTypeChange,
  onDeliveryAddressChange,
  onDeliveryCityChange,
  onDeliveryNotesChange,
  onAddToCart,
  onUpdateQuantity,
  onConfirmSale,
  onCloseSaleReceipt,
}: PosManagementViewProps) => {
  const [showGuestModal, setShowGuestModal] = useState(false);

  return (
    <Box className="space-y-8">
      {lastSale && (
        <PosReceiptModal
          sale={lastSale}
          guestInfo={lastSaleGuestInfo ?? undefined}
          onClose={onCloseSaleReceipt}
        />
      )}

      {showGuestModal && (
        <PosGuestModal
          guestName={guestName}
          guestPhone={guestPhone}
          guestDocType={guestDocType}
          guestDoc={guestDoc}
          deliveryType={deliveryType}
          deliveryAddress={deliveryAddress}
          deliveryCity={deliveryCity}
          deliveryNotes={deliveryNotes}
          submitting={submitting}
          error={error}
          onGuestNameChange={onGuestNameChange}
          onGuestPhoneChange={onGuestPhoneChange}
          onGuestDocTypeChange={onGuestDocTypeChange}
          onGuestDocChange={onGuestDocChange}
          onDeliveryTypeChange={onDeliveryTypeChange}
          onDeliveryAddressChange={onDeliveryAddressChange}
          onDeliveryCityChange={onDeliveryCityChange}
          onDeliveryNotesChange={onDeliveryNotesChange}
          onConfirm={onConfirmSale}
          onClose={() => setShowGuestModal(false)}
        />
      )}

      <Box>
        <Typography variant="h1" className="font-display text-3xl font-extrabold">
          POS
        </Typography>
        <Typography className="mt-2 text-neutral-dark/70">
          Registra ventas presenciales por tienda, método de pago y caja, incluyendo ventas a crédito.
        </Typography>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ── Catalog column ── */}
        <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
          <Box className="mb-5 flex items-center justify-between gap-4">
            <Typography variant="h2" className="text-xl font-semibold">
              Catálogo para caja
            </Typography>
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar producto"
              className="max-w-72"
            />
          </Box>

          <Box className="mb-5 grid gap-3 md:grid-cols-2">
            <SelectDropdown
              value={paymentMethod}
              options={[
                { value: 'CASH', label: 'Pago en efectivo' },
                { value: 'CREDIT', label: 'Venta a crédito' },
              ]}
              onChange={(v) => onPaymentMethodChange(v as 'CASH' | 'CREDIT')}
            />
            <SelectDropdown
              value={selectedCustomerId}
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.firstName} ${c.lastName} · saldo ${formatCurrencyCOP(c.creditBalance)}`,
              }))}
              placeholder='Selecciona cliente para crédito'
              disabled={paymentMethod !== 'CREDIT'}
              onChange={(v) => onCustomerChange(v)}
            />
          </Box>

          <Box className="grid gap-3 md:grid-cols-2">
            {loading ? (
              <Typography>Cargando productos...</Typography>
            ) : (
              products.map((product) => (
                <Box
                  key={product.id}
                  className="rounded-2xl border border-neutral-gray/20 p-4"
                >
                  <Typography variant="h3" className="font-semibold">
                    {product.name}
                  </Typography>
                  <Typography className="mt-1 text-sm text-neutral-dark/65">
                    {product.category.name} · SKU {product.sku} · {product.store?.name ?? 'Sin tienda'}
                  </Typography>
                  <Typography className="mt-2 text-lg font-bold">
                    {formatCurrencyCOP(product.price)}
                  </Typography>
                  <Button
                    type="button"
                    variant="primary"
                    className="mt-4"
                    onClick={() => onAddToCart(product)}
                  >
                    Agregar
                  </Button>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* ── Cart column ── */}
        <Box className="space-y-6">
          <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
            <Typography variant="h2" className="text-xl font-semibold">
              Carrito POS
            </Typography>
            <Box className="mt-5 space-y-3">
              {cart.length === 0 ? (
                <Typography>No hay productos en el carrito.</Typography>
              ) : (
                cart.map((item) => (
                  <Box
                    key={item.product.id}
                    className="rounded-2xl border border-neutral-gray/20 p-4"
                  >
                    <Typography className="font-semibold">
                      {item.product.name}
                    </Typography>
                    <Box className="mt-3 flex items-center gap-3">
                      <Input
                        type="number"
                        min="1"
                        value={String(item.quantity)}
                        onChange={(event) =>
                          onUpdateQuantity(
                            item.product.id,
                            Number(event.target.value || 0),
                          )
                        }
                        className="max-w-24"
                      />
                      <Typography className="text-sm text-neutral-dark/70">
                        {formatCurrencyCOP(item.product.price)} c/u
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            <Box className="mt-6 border-t border-neutral-gray/20 pt-4">
              <Typography className="text-sm text-neutral-dark/65">
                Total · {paymentMethod === 'CREDIT' ? 'Crédito' : 'Efectivo'}
              </Typography>
              <Typography variant="h3" className="text-2xl font-bold">
                {formatCurrencyCOP(total)}
              </Typography>
            </Box>

            <Button
              type="button"
              variant="primary"
              className="mt-5"
              disabled={cart.length === 0}
              onClick={() => setShowGuestModal(true)}
            >
              Confirmar venta
            </Button>
          </Box>

          <Box className="rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm">
            <Typography variant="h2" className="text-xl font-semibold">
              Ventas recientes
            </Typography>
            <Box className="mt-5 space-y-3">
              {sales.slice(0, 8).map((sale) => (
                <Box key={sale.id} className="rounded-2xl border border-neutral-gray/20 p-4">
                  <Typography className="font-semibold">
                    Venta {sale.id.slice(0, 8)}
                  </Typography>
                  <Typography className="mt-1 text-sm text-neutral-dark/65">
                    {sale.items.length} {sale.items.length === 1 ? 'ítem' : 'ítems'} · {formatCurrencyCOP(sale.total)} · {sale.paymentMethod === 'CREDIT' ? 'Crédito' : 'Efectivo'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
