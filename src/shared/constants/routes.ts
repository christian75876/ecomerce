export const ROUTES = {
  PUBLIC: {
    LOGIN: '/auth',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    NOT_FOUND: '*',
    HOME: '/home',
    CART: '/cart',
    PRODUCT_DETAILS: '/product/:productId'
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    CATEGORIES: '/categories',
    INVENTORY: '/inventory',
    POS: '/pos',
    ORDERS: '/orders',
    TRACKING: '/tracking',
    SETTINGS: '/settings',
    PRODUCTS: '/products',
    PROFILE: '/profile',
    DETAILS: '/product/:productId',
    STORE: '/stores'
  }
} as const;
