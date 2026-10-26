import type { ReactNode } from 'react';

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  tone?: 'brand' | 'plain';
};

export function PageIntro({ eyebrow, title, description, actions, className = '', tone = 'brand' }: PageIntroProps) {
  return (
    <header className={`mb-7 flex flex-col items-center justify-between gap-4 rounded-2xl text-center sm:mb-8 ${
      tone === 'brand' ? 'border border-slate-200 bg-sunshine p-5 shadow-card sm:p-7' : ''
    } md:flex-row md:items-end md:text-left ${className}`}>
      <div className="min-w-0">
        <p className={`eyebrow ${tone === 'brand' ? 'text-black' : ''}`}>{eyebrow}</p>
        <h1 className={`page-title mt-2 ${tone === 'brand' ? 'text-black' : ''}`}>{title}</h1>
        {description && <p className={`page-description mx-auto ${tone === 'brand' ? 'text-black/75' : ''} md:mx-0`}>{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap justify-center gap-2 md:w-auto md:shrink-0 md:justify-end">{actions}</div>}
    </header>
  );
}
