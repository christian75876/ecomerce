import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Card from '@/presentation/ui/atoms/card/SimpleCard';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';
import SelectDropdown from '@/presentation/ui/molecules/common/SelectDropdown';
import FeaturePanel from '@/presentation/ui/templates/feature/FeaturePanel';
import { formatCurrencyCOP } from '@/shared/utils/formatCurrencyCOP';
import { formatDate } from '@/shared/utils/formatDate';
import { usePurchaseListingSection } from './PurchasesContext';
import PurchaseStatusBadge from './PurchaseStatusBadge';

const PurchasesListPanel = () => {
  const {
    purchases,
    suppliers,
    loading,
    filters,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    openPurchaseDetailModal,
    updateFilters,
    applyFilters,
    clearFilters,
    changePage,
  } = usePurchaseListingSection();

  return (
    <FeaturePanel
      title='Compras registradas'
      subtitle='Filtra por proveedor, fecha o búsqueda libre y navega el histórico por páginas.'
    >
      <Box className='grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
        <Box className='xl:col-span-2'>
          <Label htmlFor='purchases-search'>Buscar</Label>
          <Input
            id='purchases-search'
            value={filters.search}
            onChange={(event) => updateFilters('search', event.target.value)}
            placeholder='Proveedor, nota o ID'
          />
        </Box>
        <Box>
          <Label>Proveedor</Label>
          <SelectDropdown
            value={filters.supplierId}
            options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            placeholder='Todos'
            onChange={(v) => updateFilters('supplierId', v)}
          />
        </Box>
        <Box>
          <Label htmlFor='purchases-date-from'>Desde</Label>
          <Input
            id='purchases-date-from'
            type='date'
            value={filters.dateFrom}
            onChange={(event) => updateFilters('dateFrom', event.target.value)}
          />
        </Box>
        <Box>
          <Label htmlFor='purchases-date-to'>Hasta</Label>
          <Input
            id='purchases-date-to'
            type='date'
            value={filters.dateTo}
            onChange={(event) => updateFilters('dateTo', event.target.value)}
          />
        </Box>
      </Box>

      <Box className='mt-4 flex flex-wrap gap-3'>
        <Button
          type='button'
          variant='primary'
          onClick={() => void applyFilters()}
        >
          Aplicar filtros
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => void clearFilters()}
        >
          Limpiar
        </Button>
      </Box>

      <Box className='space-y-3'>
        {loading ? (
          <Typography>Cargando compras...</Typography>
        ) : purchases.length === 0 ? (
          <Box className='rounded-2xl border border-dashed border-neutral-gray/30 px-6 py-10 text-center'>
            <Typography>No hay compras para los filtros actuales.</Typography>
          </Box>
        ) : (
          purchases.map((purchase) => (
            <Card
              key={purchase.id}
              className='rounded-2xl border border-neutral-gray/20 px-5 py-4 hover:translate-y-0 hover:shadow-none'
            >
              <Box className='flex flex-wrap items-start justify-between gap-4'>
                <Box>
                  <Typography variant='h3' className='text-lg font-semibold'>
                    {purchase.supplier.name}
                  </Typography>
                  <Typography variant='p' className='mt-1 text-neutral-dark/65'>
                    {formatDate(purchase.purchaseDate)}
                  </Typography>
                </Box>
                <PurchaseStatusBadge status={purchase.status} />
              </Box>
              <Typography className='mt-1 text-sm text-neutral-dark/65'>
                {purchase.store.name} · Total {formatCurrencyCOP(purchase.total)} ·
                Saldo {formatCurrencyCOP(purchase.balance)}
              </Typography>
              <Box className='mt-4 flex flex-wrap gap-3'>
                <Button
                  type='button'
                  variant='outlinePrimary'
                  onClick={() => openPurchaseDetailModal(purchase.id)}
                >
                  Ver detalle
                </Button>
              </Box>
            </Card>
          ))
        )}
      </Box>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        loading={loading}
        onChangePage={changePage}
      />
    </FeaturePanel>
  );
};

export default PurchasesListPanel;
