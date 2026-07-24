import { useEffect } from 'react';

interface Props {
  url: string;
  title?: string | null;
}

/**
 * Renders an Instagram post/reel/video using Meta's official embed.js mechanism.
 * This allows inline playback without redirecting the user to Instagram.
 * embed.js is loaded once and shared across all instances.
 */
const InstagramEmbed = ({ url, title }: Props) => {
  useEffect(() => {
    const w = window as unknown as { instgrm?: { Embeds?: { process: () => void } } };
    if (document.getElementById('instagram-embed-js')) {
      w.instgrm?.Embeds?.process();
    } else {
      const s = document.createElement('script');
      s.id = 'instagram-embed-js';
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, [url]);

  return (
    <div className="mx-auto w-full max-w-[540px]">
      {title ? (
        <p className="mb-2 px-1 text-sm font-semibold">{title}</p>
      ) : null}
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: '#FFF',
          border: 0,
          borderRadius: '3px',
          boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
          margin: '1px',
          maxWidth: '540px',
          minWidth: '326px',
          padding: 0,
          width: 'calc(100% - 2px)',
        }}
      >
        <div style={{ padding: '16px' }}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Ver en Instagram
          </a>
        </div>
      </blockquote>
    </div>
  );
};

export default InstagramEmbed;
