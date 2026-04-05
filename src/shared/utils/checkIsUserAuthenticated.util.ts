import { authSession } from '@/shared/utils/authSession';

export const isAuthenticated = () => Boolean(authSession.getToken());
