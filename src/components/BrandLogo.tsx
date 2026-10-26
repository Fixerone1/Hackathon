export function BrandLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center font-heading text-[1.45rem] font-bold leading-none tracking-[-0.07em] ${className}`}
      role="img"
      aria-label="Beacon"
    >
      <span>beac</span>
      <span className="mx-[0.02em] inline-block h-[0.48em] w-[0.48em] self-center rounded-full bg-sunshine" aria-hidden="true" />
      <span>n</span>
    </span>
  );
}
