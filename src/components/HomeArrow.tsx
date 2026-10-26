import { ArrowRight } from 'lucide-react';

export function HomeArrow({ className = '' }: { className?: string }) {
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black text-white transition-transform group-hover:translate-x-0.5 ${className}`}>
      <ArrowRight size={14} aria-hidden="true" />
    </span>
  );
}
