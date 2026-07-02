import { HomePage } from '@/presentation/pages/public/home/HomePage';
import DashboardLayout from '@/presentation/ui/layouts/navigation/DashboardLayout';
import { ROUTES } from '@/shared/constants/routes';
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy-loaded pages
const LoginPage = lazy(
  () => import('@presentation/pages/public/auth/LoginPage')
);
const VerifyEmailPage = lazy(
  () => import('@presentation/pages/public/auth/VerifyEmailPage')
);
const NotFound = lazy(
  () => import('@presentation/pages/public/404/NotFoundPage')
);
const CartPage = lazy(
  () => import('@presentation/pages/public/cart/CartPage')
);
const StoresPage = lazy(
  () => import('@presentation/pages/public/stores/StoresPage')
);
const StoreDetailPage = lazy(
  () => import('@presentation/pages/public/stores/StoreDetailPage')
);
const FavoritesPage = lazy(
  () => import('@presentation/pages/public/favorites/FavoritesPage')
);
const MyOrdersPage = lazy(
  () => import('@presentation/pages/public/orders/MyOrdersPage')
);
const RegisterPage = lazy(
  () => import('@presentation/pages/public/auth/RegisterPage')
);

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
const CategoriesPage = lazy(
  () => import('@presentation/pages/private/categories/CategoriesPage')
);
const InventoryPage = lazy(
  () => import('@presentation/pages/private/inventory/InventoryPage')
);
const PosPage = lazy(
  () => import('@presentation/pages/private/pos/PosPage')
);
const OrdersPage = lazy(
  () => import('@presentation/pages/private/orders/OrdersPage')
);
const ProductDetailPage = lazy(
  () => import('@presentation/pages/private/products/ProductDetailPage')
);
const StoresAdminPage = lazy(
  () => import('@presentation/pages/private/stores/StoresPage')
);
const SuppliersPage = lazy(
  () => import('@presentation/pages/private/suppliers/SuppliersPage')
);
const PurchasesPage = lazy(
  () => import('@presentation/pages/private/purchases/PurchasesPage')
);
const CustomersPage = lazy(
  () => import('@presentation/pages/private/customers/CustomersPage')
);
const CashPage = lazy(
  () => import('@presentation/pages/private/cash/CashPage')
);
const AuditPage = lazy(
  () => import('@presentation/pages/private/audit/AuditPage')
);
const InvitationsPage = lazy(
  () => import('@presentation/pages/private/invitations/InvitationsPage')
);
const HelpPage = lazy(
  () => import('@presentation/pages/public/help/HelpPage')
);
const ProfilePage = lazy(
  () => import('@presentation/pages/public/profile/ProfilePage')
);
const CouponsPage = lazy(
  () => import('@presentation/pages/private/coupons/CouponsPage')
);

export type AppRoute = RouteObject & {
  path: string;
  element: React.ReactNode;
  private?: boolean;
  publicOnly?: boolean;
  layout?: React.ComponentType<{
    children: React.ReactNode;
    hasGradient?: boolean;
  }>;
  hasGradient?: boolean;
};

export const routes: AppRoute[] = [
  // Rutas Públicas
  { path: ROUTES.PUBLIC.LOGIN, element: <LoginPage /> },
  {
    path: ROUTES.PUBLIC.VERIFY_EMAIL,
    element: <VerifyEmailPage />,
    publicOnly: false
  },
  { path: ROUTES.PUBLIC.REGISTER, element: <RegisterPage /> },
  { path: ROUTES.PUBLIC.NOT_FOUND, element: <NotFound /> },
  {
    path: ROUTES.PUBLIC.HELP,
    element: <HelpPage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.HOME,
    element: <HomePage />,
    layout: DashboardLayout,
    hasGradient: true,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.CART,
    element: <CartPage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.STORES,
    element: <StoresPage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.STORE_DETAILS,
    element: <StoreDetailPage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.FAVORITES,
    element: <FavoritesPage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.MY_ORDERS,
    element: <MyOrdersPage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PRIVATE.PROFILE,
    element: <ProfilePage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.MY_ORDER_DETAILS,
    element: <MyOrdersPage />,
    layout: DashboardLayout,
    publicOnly: false
  },
  {
    path: ROUTES.PUBLIC.PRODUCT_DETAILS,
    element: <ProductDetailPage />,
    layout: DashboardLayout,
    publicOnly: false
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
    path: ROUTES.PRIVATE.CATEGORIES,
    element: <CategoriesPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.INVENTORY,
    element: <InventoryPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.POS,
    element: <PosPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.ORDERS,
    element: <OrdersPage />,
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
    path: ROUTES.PRIVATE.STORES,
    element: <StoresAdminPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.SUPPLIERS,
    element: <SuppliersPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.PURCHASES,
    element: <PurchasesPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.CUSTOMERS,
    element: <CustomersPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.CASH,
    element: <CashPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.AUDIT,
    element: <AuditPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.INVITATIONS,
    element: <InvitationsPage />,
    private: true,
    layout: DashboardLayout
  },
  {
    path: ROUTES.PRIVATE.COUPONS,
    element: <CouponsPage />,
    private: true,
    layout: DashboardLayout
  },
];
