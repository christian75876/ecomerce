import {
  PurchasesManagementWorkspace,
} from '@/presentation/ui/organisms/purchases/PurchasesManagementView';
import { PurchasesProvider } from '@/presentation/ui/organisms/purchases/PurchasesContext';

const PurchasesPage = () => {
  return (
    <PurchasesProvider>
      <PurchasesManagementWorkspace />
    </PurchasesProvider>
  );
};

export default PurchasesPage;
