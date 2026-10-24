import type { ReactNode } from 'react';

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageIntro({ eyebrow, title, description, actions, className = '' }: PageIntroProps) {
  return (
    <header className={`mb-8 flex flex-col items-center justify-between gap-5 text-center sm:mb-10 md:flex-row md:items-end md:text-left ${className}`}>
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="page-title mt-2">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap justify-center gap-2 md:w-auto md:shrink-0 md:justify-end">{actions}</div>}
    </header>
  );
}
