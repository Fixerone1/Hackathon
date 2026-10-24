import Link from 'next/link';

export type SectionTabItem = {
  label: string;
  href: string;
};

export const MONEY_TABS: SectionTabItem[] = [
  { label: 'Overview', href: '/app' },
  { label: 'Money skills', href: '/app#money-skills' },
  { label: 'Growth studio', href: '/app#growth-studio' },
];

export const GROWTH_TABS: SectionTabItem[] = [
  { label: 'Overview', href: '/app' },
  { label: 'Growth studio', href: '/app#growth-studio' },
  { label: 'Money skills', href: '/app#money-skills' },
];

export function SectionTabs({ items }: { items: SectionTabItem[] }) {
  return (
    <nav aria-label="App sections" className="border-b border-[#e7e5dc] bg-white">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm font-medium text-slate-600 hover:border-sunshine-dark hover:text-midnight"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}