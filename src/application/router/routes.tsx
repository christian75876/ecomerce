import { HomePage } from '@/presentation/pages/public/home/HomePage';
import DashboardLayout from '@/presentation/ui/layouts/navigation/DashboardLayout';
import { ROUTES } from '@/shared/constants/routes';
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy-loaded pages
const LoginPage = lazy(
  () => import('@presentation/pages/public/auth/LoginPage')
);
const NotFound = lazy(
  () => import('@presentation/pages/public/404/NotFoundPage')
);
// const RegisterPage = lazy(
//   () => import('@presentation/pages/public/auth/RegisterPage')
// );

// Private pages
const AdminDashboard = lazy(
  () => import('@presentation/pages/private/dashboard/AdminDashboard')
);
// const TrackingPage = lazy(
//   () => import('@presentation/pages/private/tracking/TrackingPage')
// );
const SettingsPage = lazy(
  () => import('@presentation/pages/private/settings/SettingsPage')
);
const ProductsPage = lazy(
  () => import('@presentation/pages/private/products/ProductsPage')
);
const ProductDetailPage = lazy(
  () => import('@presentation/pages/private/products/ProductDetailPage')
);

export type AppRoute = RouteObject & {
  path: string;
  element: React.ReactNode;
  private?: boolean;
  layout?: React.ComponentType<{
    children: React.ReactNode;
    hasGradient?: boolean;
  }>;
  hasGradient?: boolean;
};

export const routes: AppRoute[] = [
  // Rutas Públicas
  { path: ROUTES.PUBLIC.LOGIN, element: <LoginPage /> },
  // { path: ROUTES.PUBLIC.REGISTER, element: <RegisterPage /> },
  { path: ROUTES.PUBLIC.NOT_FOUND, element: <NotFound /> },
  {
    path: ROUTES.PUBLIC.HOME,
    element: <HomePage />,
    layout: DashboardLayout,
    hasGradient: true
  },

  // Rutas Privadas con Layout
  {
    path: ROUTES.PRIVATE.DASHBOARD,
    element: <AdminDashboard />,
    private: true,
    layout: DashboardLayout,
    hasGradient: true
  },
  // {
  //   path: ROUTES.PRIVATE.TRACKING,
  //   element: <TrackingPage />,
  //   layout: DashboardLayout
  // },
  {
    path: ROUTES.PRIVATE.SETTINGS,
    element: <SettingsPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.PRODUCTS,
    element: <ProductsPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.DETAILS,
    element: <ProductDetailPage />,
    private: true,
    layout: DashboardLayout
  }
];
