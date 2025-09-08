export const ROUTES = {
  PUBLIC: {
    LOGIN: '/login',
    REGISTER: '/register',
    NOT_FOUND: '*',
    HOME: '/home'
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    TRACKING: '/tracking',
    SETTINGS: '/settings',
    PRODUCTS: '/products',
    CART: '/cart',
    PROFILE: '/profile',
    DETAILS: '/product/:productId',
    STORE: '/stores'
  }
} as const;
