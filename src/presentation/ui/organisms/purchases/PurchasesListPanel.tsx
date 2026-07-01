import Box from '@/presentation/ui/atoms/box/SimpleBox';
import Button from '@/presentation/ui/atoms/button/SimpleButton';
import Input from '@/presentation/ui/atoms/input/SimpleInput';
import Label from '@/presentation/ui/atoms/label/SimpleLabel';
import Typography from '@/presentation/ui/atoms/typography/SimpleTypography';
import PaginationControls from '@/presentation/ui/molecules/common/PaginationControls';
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
    <FeaturePanel title='Compras registradas' subtitle='Filtra por proveedor, fecha o búsqueda libre y navega el histórico por páginas.'>
      {/* Filters */}
      <Box className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <Box className='sm:col-span-2 xl:col-span-2'>
          <Label htmlFor='purchases-search'>Buscar</Label>
          <Input
            id='purchases-search'
            value={filters.search}
            onChange={(event) => updateFilters('search', event.target.value)}
            placeholder='Proveedor, nota o ID'
          />
        </Box>
        <Box>
          <Label htmlFor='purchases-supplier-filter'>Proveedor</Label>
          <select
            id='purchases-supplier-filter'
            value={filters.supplierId}
            onChange={(event) => updateFilters('supplierId', event.target.value)}
            className='w-full rounded-2xl border border-neutral-gray/80 bg-white/90 px-4 py-3.5 shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20'
          >
            <option value=''>Todos</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </Box>
        <Box className='grid grid-cols-2 gap-2'>
          <Box>
            <Label htmlFor='purchases-date-from'>Desde</Label>
            <Input id='purchases-date-from' type='date' value={filters.dateFrom} onChange={(event) => updateFilters('dateFrom', event.target.value)} />
          </Box>
          <Box>
            <Label htmlFor='purchases-date-to'>Hasta</Label>
            <Input id='purchases-date-to' type='date' value={filters.dateTo} onChange={(event) => updateFilters('dateTo', event.target.value)} />
          </Box>
        </Box>
      </Box>

      <Box className='mt-3 flex gap-2'>
        <Button type='button' variant='primary' onClick={() => void applyFilters()}>
          Aplicar filtros
        </Button>
        <Button type='button' variant='outline' onClick={() => void clearFilters()}>
          Limpiar
        </Button>
      </Box>

      {/* List */}
      <Box className='mt-5 space-y-2'>
        {loading ? (
          <Typography className='py-8 text-center text-sm text-slate-400'>
            Cargando compras...
          </Typography>
        ) : purchases.length === 0 ? (
          <Box className='rounded-2xl border border-dashed border-neutral-gray/30 px-6 py-12 text-center'>
            <i className='bx bx-package mb-2 block text-3xl text-slate-300' />
            <Typography className='text-sm text-slate-400'>
              No hay compras para los filtros actuales.
            </Typography>
          </Box>
        ) : (
          purchases.map((purchase) => (
            <button
              key={purchase.id}
              type='button'
              onClick={() => openPurchaseDetailModal(purchase.id)}
              className='w-full rounded-2xl border border-neutral-gray/20 bg-white px-5 py-4 text-left transition hover:border-primary/25 hover:bg-primary/5'
            >
              <Box className='flex items-start justify-between gap-3'>
                <Box className='min-w-0 flex-1'>
                  <Box className='flex flex-wrap items-center gap-2'>
                    <span className='font-semibold text-slate-800'>
                      {purchase.supplier?.name ?? '—'}
                    </span>
                    <PurchaseStatusBadge status={purchase.status} />
                  </Box>
                  <Typography className='mt-0.5 truncate text-xs text-slate-400'>
                    {purchase.store?.name ?? '—'} · {formatDate(purchase.purchaseDate)}
                    {purchase.note ? ` · ${purchase.note}` : ''}
                  </Typography>
                </Box>
                <Box className='flex-shrink-0 text-right'>
                  <p className='text-sm font-bold text-slate-800'>
                    {formatCurrencyCOP(purchase.total)}
                  </p>
                  {Number(purchase.balance) > 0 ? (
                    <p className='text-xs font-medium text-amber-600'>
                      Saldo {formatCurrencyCOP(purchase.balance)}
                    </p>
                  ) : (
                    <p className='text-xs text-emerald-600'>Pagado</p>
                  )}
                </Box>
              </Box>
            </button>
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
