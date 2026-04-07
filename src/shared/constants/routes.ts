export const ROUTES = {
  PUBLIC: {
    LOGIN: '/auth',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    NOT_FOUND: '*',
    HOME: '/home',
    STORES: '/stores',
    STORE_DETAILS: '/stores/:slug',
    CART: '/cart',
    FAVORITES: '/favorites',
    MY_ORDERS: '/my-orders',
    MY_ORDER_DETAILS: '/my-orders/:orderId',
    PRODUCT_DETAILS: '/product/:productId'
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    CATEGORIES: '/categories',
    INVENTORY: '/inventory',
    POS: '/pos',
    ORDERS: '/orders',
    STORES: '/admin/stores',
    SUPPLIERS: '/suppliers',
    PURCHASES: '/purchases',
    CUSTOMERS: '/customers',
    CASH: '/cash',
    AUDIT: '/audit',
    TRACKING: '/tracking',
    SETTINGS: '/settings',
    PRODUCTS: '/products',
    PROFILE: '/profile',
    DETAILS: '/product/:productId',
    STORE: '/admin/store'
  }
} as const;
