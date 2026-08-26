import { useCallback, useEffect, useRef } from 'react';
import { isAuthenticated } from '@/shared/utils/checkIsUserAuthenticated.util';
import { authenticatedClientHTTP } from '@/infrastructure/repositories/api/ClientHTTP';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function registerPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  if (!VAPID_PUBLIC_KEY) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await sendSubscriptionToServer(existing);
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  await sendSubscriptionToServer(subscription);
}

async function sendSubscriptionToServer(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
  // authenticatedClientHTTP ya apunta al backend correcto (VITE_API_URL) y
  // adjunta el Authorization automáticamente — un fetch('/api/...') relativo
  // aquí resolvía contra el propio dominio del frontend, no el backend, así
  // que esta suscripción nunca llegaba a guardarse.
  await authenticatedClientHTTP.post('/push/subscribe', { endpoint: json.endpoint, keys: json.keys });
}

export function usePushNotifications() {
  const attempted = useRef(false);

  const requestPush = useCallback(async () => {
    if (attempted.current) return;
    attempted.current = true;
    try {
      await registerPush();
    } catch {
      // Non-critical: silently ignore push errors
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) return;
    // Small delay so SW has time to activate on first load
    const t = setTimeout(() => { void requestPush(); }, 3000);
    return () => clearTimeout(t);
  }, [requestPush]);

  return { requestPush };
}
