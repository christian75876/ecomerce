import { PurchaseStatus } from '@/application/dtos/purchases/response/PurchaseResponse';
import Box from '@/presentation/ui/atoms/box/SimpleBox';

interface PurchaseStatusBadgeProps {
  status: PurchaseStatus;
}

const purchaseStatusConfig: Record<
  PurchaseStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: 'Registrada',
    className: 'bg-amber-100 text-amber-700',
  },
  PARTIALLY_PAID: {
    label: 'Abonada',
    className: 'bg-sky-100 text-sky-700',
  },
  PAID: {
    label: 'Pagada',
    className: 'bg-emerald-100 text-emerald-700',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-700',
  },
};

const PurchaseStatusBadge = ({ status }: PurchaseStatusBadgeProps) => {
  const config = purchaseStatusConfig[status];

  return (
    <Box
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </Box>
  );
};

export default PurchaseStatusBadge;
