import { Suspense, lazy } from 'react';
import { getAuthenticatedRole } from '@/shared/utils/checkIsUserAuthenticated.util';

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const SellerDashboard = lazy(() => import('./SellerDashboard'));

const DashboardPage = () => {
  const role = getAuthenticatedRole();
  return (
    <Suspense fallback={null}>
      {role === 'admin' ? <AdminDashboard /> : <SellerDashboard />}
    </Suspense>
  );
};

export default DashboardPage;
