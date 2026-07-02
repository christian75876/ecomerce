import Card from '@atoms/card/SimpleCard';
import Box from '@atoms/box/SimpleBox';
import Typography from '@atoms/typography/SimpleTypography';
import {
  IDashboardPayableItem,
  IDashboardReceivableItem,
  IDashboardStockAlertItem,
} from '@/application/dtos/dashboard/response/DashboardResponse';

const EmptyState = ({ message }: { message: string }) => (
  <Box className='rounded-2xl border border-dashed border-neutral-gray/70 bg-white/50 px-4 py-6 text-center text-sm text-neutral-dark/60'>
    {message}
  </Box>
);

const TableCard = ({
  title,
  subtitle,
  headers,
  children,
  empty,
}: {
  title: string;
  subtitle: string;
  headers: string[];
  children: React.ReactNode;
  empty: boolean;
}) => (
  <Card className='p-6'>
    <Typography variant='h3'>{title}</Typography>
    <Typography className='mt-1 text-sm text-neutral-dark/60'>{subtitle}</Typography>
    <Box className='mt-5 overflow-x-auto'>
      {empty ? (
        <EmptyState message='Sin datos suficientes para este criterio.' />
      ) : (
        <table className='min-w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-neutral-gray/60 text-neutral-dark/55'>
              {headers.map((header) => (
                <th key={header} className='px-3 py-3 font-medium'>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
    </Box>
  </Card>
);

export const StockAlertTable = ({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: IDashboardStockAlertItem[];
}) => (
  <TableCard
    title={title}
    subtitle={subtitle}
    headers={['Producto', 'SKU', 'Stock', 'Categoría', 'Tienda']}
    empty={items.length === 0}
  >
    {items.map((item) => (
      <tr key={item.id} className='border-b border-neutral-gray/40 last:border-b-0'>
        <td className='px-3 py-3 font-medium text-neutral-dark'>{item.name}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>{item.sku}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>{item.stock}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>{item.categoryName}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>{item.storeName}</td>
      </tr>
    ))}
  </TableCard>
);

export const ReceivablesTable = ({ items }: { items: IDashboardReceivableItem[] }) => (
  <TableCard
    title='Cartera de clientes'
    subtitle='Clientes con saldo pendiente y referencia rápida del último abono.'
    headers={['Cliente', 'Email', 'Saldo', 'Límite', 'Último abono']}
    empty={items.length === 0}
  >
    {items.map((item) => (
      <tr key={item.customerId} className='border-b border-neutral-gray/40 last:border-b-0'>
        <td className='px-3 py-3 font-medium text-neutral-dark'>{item.name}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>{item.email}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>{item.balance.toLocaleString('es-CO')}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>
          {item.creditLimit ? item.creditLimit.toLocaleString('es-CO') : 'Sin límite'}
        </td>
        <td className='px-3 py-3 text-neutral-dark/70'>
          {item.lastPaymentAt
            ? new Date(item.lastPaymentAt).toLocaleDateString('es-CO')
            : 'Sin abonos'}
        </td>
      </tr>
    ))}
  </TableCard>
);

export const PayablesTable = ({ items }: { items: IDashboardPayableItem[] }) => (
  <TableCard
    title='Deuda con proveedores'
    subtitle='Saldo pendiente consolidado por proveedor y última compra registrada.'
    headers={['Proveedor', 'Saldo', 'Última compra', 'Último pago registrado']}
    empty={items.length === 0}
  >
    {items.map((item) => (
      <tr key={item.supplierId} className='border-b border-neutral-gray/40 last:border-b-0'>
        <td className='px-3 py-3 font-medium text-neutral-dark'>{item.name}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>{item.balance.toLocaleString('es-CO')}</td>
        <td className='px-3 py-3 text-neutral-dark/70'>
          {item.lastPurchaseAt
            ? new Date(item.lastPurchaseAt).toLocaleDateString('es-CO')
            : 'Sin compras'}
        </td>
        <td className='px-3 py-3 text-neutral-dark/70'>
          {item.lastPaidAmount.toLocaleString('es-CO')}
        </td>
      </tr>
    ))}
  </TableCard>
);
