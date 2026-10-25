import { useId } from 'react';

export function BrandLogo({ className }: { className: string }) {
  const filterId = `remove-logo-black-${useId().replace(/:/g, '')}`;

  return (
    <svg className={className} viewBox="0 0 1920 1024" aria-hidden="true">
      <defs>
        <filter id={filterId}>
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 1 0 0 0 0" />
        </filter>
      </defs>
      <image
        href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/logo.webp`}
        width="1920"
        height="1024"
        filter={`url(#${filterId})`}
      />
    </svg>
  );
}
