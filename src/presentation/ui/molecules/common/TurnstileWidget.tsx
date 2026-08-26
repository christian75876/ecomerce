import { forwardRef } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

const SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ||
  '1x00000000000000000000AA'; // Cloudflare test key — always passes in dev

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

// Forwards a ref to the underlying widget so the form can call .reset() after
// a failed submit — a Turnstile token is single-use: Cloudflare's siteverify
// rejects it the moment it's checked once, pass or fail. Without resetting,
// the widget keeps showing its old "verified" checkmark and the form keeps
// sending that same dead token on every retry, so even a correct password
// on the second attempt fails with "verificación de seguridad fallida".
const TurnstileWidget = forwardRef<TurnstileInstance | undefined, Props>(
  ({ onVerify, onExpire, className }, ref) => (
    <div className={className}>
      <Turnstile
        ref={ref}
        siteKey={SITE_KEY}
        onSuccess={onVerify}
        onExpire={() => { onVerify(''); onExpire?.(); }}
        options={{ theme: 'light', size: 'normal' }}
      />
    </div>
  ),
);

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
