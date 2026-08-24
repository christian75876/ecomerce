import { Turnstile } from '@marsidev/react-turnstile';

const SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ||
  '1x00000000000000000000AA'; // Cloudflare test key — always passes in dev

interface Props {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

const TurnstileWidget = ({ onVerify, onExpire, className }: Props) => (
  <div className={className}>
    <Turnstile
      siteKey={SITE_KEY}
      onSuccess={onVerify}
      onExpire={() => { onVerify(''); onExpire?.(); }}
      options={{ theme: 'light', size: 'normal' }}
    />
  </div>
);

export default TurnstileWidget;
