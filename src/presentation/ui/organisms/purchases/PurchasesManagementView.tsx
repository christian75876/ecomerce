import Box from '@/presentation/ui/atoms/box/SimpleBox';
import FeatureScreen from '@/presentation/ui/templates/feature/FeatureScreen';
import FeatureScreenHeader from '@/presentation/ui/templates/feature/FeatureScreenHeader';
import CreateProductModal from './CreateProductModal';
import CreateSupplierModal from './CreateSupplierModal';
import PurchaseDetailModal from './PurchaseDetailModal';
import PurchaseRegistrationForm from './PurchaseRegistrationForm';
import PurchasesListPanel from './PurchasesListPanel';

const PurchasesManagementRoot = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return (
    <FeatureScreen>
      <FeatureScreenHeader
        title='Compras'
        description='Registra abastecimientos a proveedor, crea proveedor o producto inline y controla el ciclo completo de compras desde una sola vista.'
      />
      {children}
    </FeatureScreen>
  );
};

const PurchasesManagementLayout = () => {
  return (
    <Box className='grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]'>
      <PurchasesManagementView.Registration />
      <PurchasesManagementView.History />
    </Box>
  );
};

const PurchasesManagementView = Object.assign(PurchasesManagementRoot, {
  Layout: PurchasesManagementLayout,
  Registration: PurchaseRegistrationForm,
  History: PurchasesListPanel,
  SupplierModal: CreateSupplierModal,
  ProductModal: CreateProductModal,
  DetailModal: PurchaseDetailModal,
});

export const PurchasesManagementWorkspace = () => {
  return (
    <PurchasesManagementView>
      <PurchasesManagementView.Layout />
      <PurchasesManagementView.SupplierModal />
      <PurchasesManagementView.ProductModal />
      <PurchasesManagementView.DetailModal />
    </PurchasesManagementView>
  );
};

export { PurchasesManagementView };
