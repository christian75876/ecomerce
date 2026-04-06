import { ICustomer, ICustomerLedgerEntry } from '@/application/dtos/customers/response/CustomerResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';

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
  onSelectCustomer: (value: string) => void;
  onCreditLimitChange: (value: string) => void;
  onPaymentAmountChange: (value: string) => void;
  onPaymentNoteChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onToggleCredit: (customer: ICustomer, payload: Partial<ICustomer>) => Promise<void>;
  onRegisterPayment: () => Promise<boolean>;
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
  onSelectCustomer,
  onCreditLimitChange,
  onPaymentAmountChange,
  onPaymentNoteChange,
  onSearchChange,
  onToggleCredit,
  onRegisterPayment,
}: CustomersCreditManagementViewProps) => {
  const selectedCustomer = customers.find((item) => item.id === selectedCustomerId) ?? null;

  return (
    <Box className='space-y-8'>
      <Box>
        <Typography variant='h1' className='text-3xl font-bold'>Clientes y crédito</Typography>
        <Typography className='mt-2 text-neutral-dark/70'>
          Habilita cupos de crédito y registra abonos de cartera.
        </Typography>
      </Box>
      <Box className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]'>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder='Buscar cliente' className='max-w-80' />
          <Box className='mt-5 space-y-3'>
            {loading ? <Typography>Cargando clientes...</Typography> : customers.map((customer) => (
              <Box key={customer.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
                <Typography variant='h3' className='text-lg font-semibold'>
                  {customer.firstName} {customer.lastName}
                </Typography>
                <Typography className='mt-1 text-sm text-neutral-dark/65'>
                  {customer.email} · Saldo ${Number(customer.creditBalance).toFixed(2)}
                </Typography>
                <Box className='mt-4 flex flex-wrap gap-3'>
                  <Button type='button' variant='outlinePrimary' onClick={() => onSelectCustomer(customer.id)}>
                    Ver cartera
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
        </Box>
        <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
          <Typography variant='h2' className='text-xl font-semibold'>Detalle de crédito</Typography>
          {selectedCustomer ? (
            <>
              <Typography className='mt-2 text-sm text-neutral-dark/65'>
                {selectedCustomer.firstName} {selectedCustomer.lastName} · Límite ${Number(selectedCustomer.creditLimit ?? 0).toFixed(2)}
              </Typography>
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
              <Box className='mt-5 space-y-3'>
                <Input type='number' min='0' step='0.01' value={paymentAmount} onChange={(event) => onPaymentAmountChange(event.target.value)} placeholder='Valor del abono' />
                <Input value={paymentNote} onChange={(event) => onPaymentNoteChange(event.target.value)} placeholder='Nota opcional' />
                <Button type='button' variant='primary' disabled={submitting} onClick={() => void onRegisterPayment()}>
                  {submitting ? 'Guardando...' : 'Registrar abono'}
                </Button>
              </Box>
              <Box className='mt-6 space-y-3'>
                {ledger.map((entry) => (
                  <Box key={entry.id} className='rounded-2xl border border-neutral-gray/20 px-4 py-3'>
                    <Typography className='font-semibold'>{entry.type}</Typography>
                    <Typography className='text-sm text-neutral-dark/65'>
                      ${Number(entry.amount).toFixed(2)} · {entry.note || 'Sin nota'}
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
