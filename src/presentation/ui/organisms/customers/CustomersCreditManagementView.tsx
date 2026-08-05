import { ICustomer, ICustomerLedgerEntry } from '@/application/dtos/customers/response/CustomerResponse';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';

interface CustomersCreditManagementViewProps {
  customers: ICustomer[];
  selectedCustomerId: string;
  ledger: ICustomerLedgerEntry[];
  creditLimit: string;
  paymentAmount: string;
  paymentNote: string;
  search: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onSelectCustomer: (value: string) => void;
  onCreditLimitChange: (value: string) => void;
  onPaymentAmountChange: (value: string) => void;
  onPaymentNoteChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onToggleCredit: (customer: ICustomer, payload: Partial<ICustomer>) => Promise<void>;
  onRegisterPayment: () => Promise<boolean>;
  onChangePage: (page: number) => void | Promise<void>;
}

export const CustomersCreditManagementView = ({
  customers,
  selectedCustomerId,
  ledger,
  creditLimit,
  paymentAmount,
  paymentNote,
  search,
  loading,
  submitting,
  error,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onSelectCustomer,
  onCreditLimitChange,
  onPaymentAmountChange,
  onPaymentNoteChange,
  onSearchChange,
  onToggleCredit,
  onRegisterPayment,
  onChangePage,
}: CustomersCreditManagementViewProps) => {
  const selectedCustomer = customers.find((item) => item.id === selectedCustomerId) ?? null;
  const customersWithDebt = customers.filter((customer) => Number(customer.creditBalance) > 0);
  const enabledCreditCustomers = customers.filter((customer) => customer.creditEnabled);
  const totalPortfolio = customersWithDebt.reduce(
    (acc, customer) => acc + Number(customer.creditBalance),
    0,
  );

  return (
    <Box className='space-y-8'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>Clientes y cartera</Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Administra crédito comercial, consulta saldos y registra abonos sin mezclarlo con usuarios internos.
        </Typography>
      </Box>
      <Box className='grid gap-4 md:grid-cols-3'>
        <Box className='surface-card rounded-[1.5rem] px-5 py-4'>
          <Typography variant='span' className='uppercase tracking-[0.24em] text-neutral-dark/45'>
            Clientes con crédito
          </Typography>
          <Typography variant='h2' className='mt-2'>
            {enabledCreditCustomers.length}
          </Typography>
        </Box>
        <Box className='surface-card rounded-[1.5rem] px-5 py-4'>
          <Typography variant='span' className='uppercase tracking-[0.24em] text-neutral-dark/45'>
            Clientes con saldo
          </Typography>
          <Typography variant='h2' className='mt-2'>
            {customersWithDebt.length}
          </Typography>
        </Box>
        <Box className='surface-card rounded-[1.5rem] px-5 py-4'>
          <Typography variant='span' className='uppercase tracking-[0.24em] text-neutral-dark/45'>
            Cartera total
          </Typography>
          <Typography variant='h2' className='mt-2'>
            {formatCurrencyCOP(totalPortfolio)}
          </Typography>
        </Box>
      </Box>
      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]'>
        <Box className='surface-panel rounded-[1.75rem] p-6'>
          <Box className='flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between'>
            <Box>
              <Typography variant='h2' className='text-xl font-semibold'>Listado de clientes</Typography>
              <Typography className='mt-1 text-sm text-neutral-dark/65'>
                Aquí gestionas clientes compradores y su cartera. Los usuarios internos irán en un módulo separado.
              </Typography>
            </Box>
            <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder='Buscar cliente' className='max-w-80' />
          </Box>
          <Box className='mt-5 space-y-3'>
            {loading ? (
              <>
                <div className='h-32 skeleton rounded-2xl' />
                <div className='h-32 skeleton rounded-2xl' />
                <div className='h-32 skeleton rounded-2xl' />
              </>
            ) : customers.length === 0 ? (
              <Box className='flex flex-col items-center rounded-2xl border border-dashed border-neutral-gray/30 py-10 text-center'>
                <i className='bx bx-group mb-3 text-4xl text-neutral-dark/20' aria-hidden='true' />
                <Typography className='font-semibold text-neutral-dark/50'>No se encontraron clientes</Typography>
                <Typography className='mt-1 text-sm text-neutral-dark/35'>Ajusta la búsqueda o registra un nuevo cliente.</Typography>
              </Box>
            ) : customers.map((customer) => (
              <Box key={customer.id} className='rounded-2xl border border-neutral-gray/20 bg-white px-5 py-4 shadow-sm'>
                <Box className='flex flex-wrap items-start justify-between gap-3'>
                  <Box>
                    <Typography variant='h3' className='text-lg font-semibold'>
                      {customer.firstName} {customer.lastName}
                    </Typography>
                    <Typography className='mt-1 text-sm text-neutral-dark/65'>
                      {customer.email}
                    </Typography>
                  </Box>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    customer.creditEnabled
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-neutral-dark/8 text-neutral-dark/60'
                  }`}>
                    {customer.creditEnabled ? 'Crédito activo' : 'Sin crédito'}
                  </span>
                </Box>
                <Box className='mt-4 grid gap-3 md:grid-cols-2'>
                  <Box className='rounded-2xl bg-background px-4 py-3'>
                    <Typography className='text-xs uppercase tracking-[0.18em] text-neutral-dark/45'>
                      Saldo actual
                    </Typography>
                    <Typography className='mt-1 font-semibold'>
                      {formatCurrencyCOP(Number(customer.creditBalance))}
                    </Typography>
                  </Box>
                  <Box className='rounded-2xl bg-background px-4 py-3'>
                    <Typography className='text-xs uppercase tracking-[0.18em] text-neutral-dark/45'>
                      Límite
                    </Typography>
                    <Typography className='mt-1 font-semibold'>
                      {formatCurrencyCOP(Number(customer.creditLimit ?? 0))}
                    </Typography>
                  </Box>
                </Box>
                <Box className='mt-4 flex flex-wrap gap-3'>
                  <Button type='button' variant='outlinePrimary' onClick={() => onSelectCustomer(customer.id)}>
                    Abrir detalle
                  </Button>
                  <Button
                    type='button'
                    variant={customer.creditEnabled ? 'danger' : 'secondary'}
                    onClick={() => void onToggleCredit(customer, { creditEnabled: !customer.creditEnabled })}
                  >
                    {customer.creditEnabled ? 'Deshabilitar crédito' : 'Habilitar crédito'}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            loading={loading}
            onChangePage={onChangePage}
          />
        </Box>
        <Box className='surface-panel rounded-[1.75rem] p-6'>
          <Typography variant='h2' className='text-xl font-semibold'>Detalle de cartera</Typography>
          {selectedCustomer ? (
            <>
              <Box className='mt-2 rounded-2xl bg-white px-4 py-4 shadow-sm'>
                <Typography className='text-sm text-neutral-dark/65'>
                  Cliente seleccionado
                </Typography>
                <Typography variant='h3' className='mt-1'>
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </Typography>
                <Typography className='mt-1 text-sm text-neutral-dark/65'>
                  Límite {formatCurrencyCOP(Number(selectedCustomer.creditLimit ?? 0))} · Saldo {formatCurrencyCOP(Number(selectedCustomer.creditBalance))}
                </Typography>
              </Box>
              <Box className='mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]'>
                <Input
                  type='number'
                  min='0'
                  step='0.01'
                  value={creditLimit}
                  onChange={(event) => onCreditLimitChange(event.target.value)}
                  placeholder='Nuevo límite de crédito'
                />
                <Button
                  type='button'
                  variant='outlinePrimary'
                  disabled={submitting}
                  onClick={() =>
                    void onToggleCredit(selectedCustomer, {
                      creditEnabled: true,
                      creditLimit: creditLimit ? Number(creditLimit) : 0,
                    })
                  }
                >
                  Guardar cupo
                </Button>
              </Box>
              <Box className='mt-5 rounded-2xl bg-white p-4 shadow-sm'>
                <Typography variant='h3' className='text-base font-semibold'>
                  Registrar abono
                </Typography>
                <Box className='mt-3 space-y-3'>
                <Input type='number' min='0' step='0.01' value={paymentAmount} onChange={(event) => onPaymentAmountChange(event.target.value)} placeholder='Valor del abono' />
                <Input value={paymentNote} onChange={(event) => onPaymentNoteChange(event.target.value)} placeholder='Nota opcional' />
                <Button type='button' variant='primary' disabled={submitting} onClick={() => void onRegisterPayment()}>
                  {submitting ? 'Guardando...' : 'Registrar abono'}
                </Button>
                </Box>
              </Box>
              <Box className='mt-6 space-y-3'>
                <Typography variant='h3' className='text-base font-semibold'>
                  Historial de movimientos
                </Typography>
                {ledger.length === 0 ? (
                  <Box className='flex flex-col items-center rounded-2xl border border-dashed border-neutral-gray/30 py-12 text-center'>
                    <i className='bx bx-receipt mb-3 text-4xl text-neutral-dark/20' aria-hidden='true' />
                    <Typography className='font-semibold text-neutral-dark/50'>Sin movimientos en la cartera</Typography>
                    <Typography className='mt-1 text-sm text-neutral-dark/35'>Los pagos y créditos registrados aparecerán aquí.</Typography>
                  </Box>
                ) : ledger.map((entry) => (
                  <Box key={entry.id} className='rounded-2xl border border-neutral-gray/20 bg-white px-4 py-3 shadow-sm'>
                    <Box className='flex items-center justify-between gap-3'>
                      <Typography className='font-semibold'>{entry.type}</Typography>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        entry.amount < 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {formatCurrencyCOP(Number(entry.amount))}
                      </span>
                    </Box>
                    <Typography className='mt-2 text-sm text-neutral-dark/65'>
                      {entry.note || 'Sin nota'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <Typography className='mt-4'>Selecciona un cliente para ver su cartera.</Typography>
          )}
          {error ? <Box className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</Box> : null}
        </Box>
      </Box>
    </Box>
  );
};
