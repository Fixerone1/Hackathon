import { ImagePlus, UsersRound } from 'lucide-react';

type PhotoPlaceholderProps = {
  label: string;
  description: string;
  className?: string;
};

export function PhotoPlaceholder({ label, description, className = '' }: PhotoPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={`${label}. Image placeholder: ${description}`}
      className={`relative isolate flex min-h-48 overflow-hidden rounded-2xl border border-[#dedede] bg-[#f1f1f1] ${className}`}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-br from-sunshine/70 via-[#f1f1f1] to-[#dedede]" />
      <div aria-hidden="true" className="absolute -right-8 -top-12 -z-10 h-48 w-48 rounded-full border-[24px] border-white/45" />
      <div className="m-auto flex max-w-sm flex-col items-center px-6 py-8 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-sunshine text-midnight shadow-sm">
          <UsersRound size={26} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-midnight">Photo to add</p>
        <p className="mt-2 text-lg font-bold leading-snug text-midnight">{label}</p>
        <p className="mt-2 text-sm leading-6 text-[#555555]">{description}</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/75 px-3 py-1 text-xs font-medium text-[#444444]">
          <ImagePlus size={14} aria-hidden="true" />
          Replace with an authentic photo
        </span>
      </div>
    </div>
  );
}
