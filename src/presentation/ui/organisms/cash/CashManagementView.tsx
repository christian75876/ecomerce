import { ICashMovement, ICashSession } from '@/application/dtos/cash/response/CashResponse';
import { IStore } from '@/application/dtos/stores/response/StoreResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';

interface CashManagementViewProps {
  sessions: ICashSession[];
  stores: IStore[];
  selectedSessionId: string;
  movements: ICashMovement[];
  storeId: string;
  openingAmount: string;
  closingAmount: string;
  movementType: 'MANUAL_IN' | 'MANUAL_OUT' | 'ADJUSTMENT';
  movementAmount: string;
  movementReason: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  onSelectSession: (value: string) => void;
  onStoreChange: (value: string) => void;
  onOpeningAmountChange: (value: string) => void;
  onClosingAmountChange: (value: string) => void;
  onMovementTypeChange: (value: 'MANUAL_IN' | 'MANUAL_OUT' | 'ADJUSTMENT') => void;
  onMovementAmountChange: (value: string) => void;
  onMovementReasonChange: (value: string) => void;
  onOpenSession: () => Promise<boolean>;
  onCloseSession: () => Promise<boolean>;
  onCreateMovement: () => Promise<boolean>;
}

export const CashManagementView = ({
  sessions,
  stores,
  selectedSessionId,
  movements,
  storeId,
  openingAmount,
  closingAmount,
  movementType,
  movementAmount,
  movementReason,
  loading,
  submitting,
  error,
  onSelectSession,
  onStoreChange,
  onOpeningAmountChange,
  onClosingAmountChange,
  onMovementTypeChange,
  onMovementAmountChange,
  onMovementReasonChange,
  onOpenSession,
  onCloseSession,
  onCreateMovement,
}: CashManagementViewProps) => (
  <Box className='space-y-8'>
    <Box>
      <Typography variant='h1' className='text-3xl font-bold'>Caja</Typography>
      <Typography className='mt-2 text-neutral-dark/70'>
        Abre y cierra caja, y registra ingresos o retiros manuales.
      </Typography>
    </Box>
    <Box className='grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]'>
      <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm space-y-6'>
        <Box className='space-y-3'>
          <Typography variant='h2' className='text-xl font-semibold'>Abrir caja</Typography>
          <SelectDropdown
            value={storeId}
            options={stores.map((s) => ({ value: s.id, label: s.name }))}
            placeholder='Selecciona tienda'
            onChange={(v) => onStoreChange(v)}
          />
          <Input type='number' min='0' step='0.01' value={openingAmount} onChange={(event) => onOpeningAmountChange(event.target.value)} placeholder='Monto inicial' />
          <Button type='button' variant='primary' disabled={submitting} onClick={() => void onOpenSession()}>
            {submitting ? 'Guardando...' : 'Abrir caja'}
          </Button>
        </Box>
        <Box className='space-y-3'>
          <Typography variant='h2' className='text-xl font-semibold'>Operar sesión</Typography>
          <SelectDropdown
            value={selectedSessionId}
            options={sessions.map((s) => ({ value: s.id, label: `${s.store.name} · ${s.status}` }))}
            placeholder='Selecciona sesión'
            onChange={(v) => onSelectSession(v)}
          />
          <Input type='number' min='0' step='0.01' value={closingAmount} onChange={(event) => onClosingAmountChange(event.target.value)} placeholder='Monto de cierre' />
          <Button type='button' variant='secondary' disabled={submitting} onClick={() => void onCloseSession()}>
            Cerrar caja
          </Button>
          <SelectDropdown
            value={movementType}
            options={[
              { value: 'MANUAL_IN', label: 'Ingreso manual' },
              { value: 'MANUAL_OUT', label: 'Retiro' },
              { value: 'ADJUSTMENT', label: 'Ajuste' },
            ]}
            onChange={(v) => onMovementTypeChange(v as 'MANUAL_IN' | 'MANUAL_OUT' | 'ADJUSTMENT')}
          />
          <Input type='number' min='0' step='0.01' value={movementAmount} onChange={(event) => onMovementAmountChange(event.target.value)} placeholder='Valor movimiento' />
          <Input value={movementReason} onChange={(event) => onMovementReasonChange(event.target.value)} placeholder='Motivo' />
          <Button type='button' variant='outlinePrimary' disabled={submitting} onClick={() => void onCreateMovement()}>
            Registrar movimiento
          </Button>
        </Box>
        {error ? <Box className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</Box> : null}
      </Box>
      <Box className='rounded-[1.75rem] border border-neutral-gray/30 bg-white p-6 shadow-sm'>
        <Typography variant='h2' className='text-xl font-semibold'>Sesiones y movimientos</Typography>
        <Box className='mt-5 space-y-3'>
          {loading ? <Typography>Cargando caja...</Typography> : sessions.map((session) => (
            <Box key={session.id} className='rounded-2xl border border-neutral-gray/20 px-5 py-4'>
              <Typography variant='h3' className='text-lg font-semibold'>{session.store.name}</Typography>
              <Typography className='mt-1 text-sm text-neutral-dark/65'>
                {session.status} · Esperado ${Number(session.expectedAmount).toFixed(2)}
              </Typography>
            </Box>
          ))}
        </Box>
        {selectedSessionId ? (
          <Box className='mt-8 space-y-3'>
            <Typography variant='h3' className='text-lg font-semibold'>Movimientos</Typography>
            {movements.map((movement) => (
              <Box key={movement.id} className='rounded-2xl border border-neutral-gray/20 px-4 py-3'>
                <Typography className='font-semibold'>{movement.type}</Typography>
                <Typography className='text-sm text-neutral-dark/65'>
                  ${Number(movement.amount).toFixed(2)} · {movement.reason}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  </Box>
);
