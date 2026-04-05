import { PosCartItem } from '@/application/useCases/pos/usePosManagement';
import { IProduct } from '@/application/dtos/products/response/ProductResponse';
import { ISale } from '@/application/dtos/sales/response/SaleResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

interface PosManagementViewProps {
  products: IProduct[];
  cart: PosCartItem[];
  sales: ISale[];
  search: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  total: number;
  onSearchChange: (value: string) => void;
  onAddToCart: (product: IProduct) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onConfirmSale: () => Promise<boolean>;
}

export const PosManagementView = ({
  products,
  cart,
  sales,
  search,
  loading,
  submitting,
  error,
  total,
  onSearchChange,
  onAddToCart,
  onUpdateQuantity,
  onConfirmSale,
}: PosManagementViewProps) => {
  return (
    <Box className="space-y-8">
      <Box>
        <Typography variant="h1" className="text-3xl font-bold">
          POS
        </Typography>
        <Typography className="mt-2 text-neutral-dark/70">
          Registra ventas presenciales, calcula totales y descuenta inventario al confirmar.
        </Typography>
      </Box>

      <Box className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
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
                    {product.category.name} · SKU {product.sku}
                  </Typography>
                  <Typography className="mt-2 text-lg font-bold">
                    ${Number(product.price).toFixed(2)}
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
                        ${Number(item.product.price).toFixed(2)} c/u
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            <Box className="mt-6 border-t border-neutral-gray/20 pt-4">
              <Typography className="text-sm text-neutral-dark/65">
                Total
              </Typography>
              <Typography variant="h3" className="text-2xl font-bold">
                ${total.toFixed(2)}
              </Typography>
            </Box>

            {error ? (
              <Box className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </Box>
            ) : null}

            <Button
              type="button"
              variant="primary"
              className="mt-5"
              disabled={submitting || cart.length === 0}
              onClick={() => void onConfirmSale()}
            >
              {submitting ? 'Confirmando...' : 'Confirmar venta'}
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
                    {sale.items.length} ítems · ${Number(sale.total).toFixed(2)}
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
