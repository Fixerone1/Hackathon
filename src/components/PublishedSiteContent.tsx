'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Megaphone } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { siteContentTypeLabel, type SiteContent, type SiteContentType } from '@/lib/site-content';

type Props = {
  contentType: SiteContentType | SiteContentType[];
  heading?: string;
  eyebrow?: string;
  className?: string;
  display?: 'cards' | 'list';
  emptyMessage?: string;
};

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(value));
}

export function PublishedSiteContent({
  contentType,
  heading,
  eyebrow,
  className = '',
  display = 'cards',
  emptyMessage,
}: Props) {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const types = Array.isArray(contentType) ? contentType : [contentType];

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error: queryError } = await getSupabase()
          .from('site_content')
          .select('id,content_type,title,body,link_label,link_url,image_url,event_date,event_location,status,sort_order,published_at,created_at')
          .in('content_type', types)
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .order('sort_order', { ascending: true })
          .order('published_at', { ascending: false })
          .limit(20);
        if (queryError) throw queryError;
        if (active) {
          const today = new Date().toISOString().slice(0, 10);
          setItems(((data || []) as SiteContent[]).filter((item) => !item.event_date || item.event_date >= today));
        }
      } catch (caught) {
        if (active) {
          console.error('Could not load published site content:', caught);
          setError(caught instanceof Error ? caught.message : 'Content could not be loaded.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [types.join(',')]);

  if (!loading && !error && items.length === 0 && !emptyMessage) return null;

  return (
    <section className={`my-8 ${className}`} aria-label={heading || 'Published content'}>
      {(heading || eyebrow) && (
        <div className="mb-4">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {heading && <h2 className="mt-1 text-xl font-semibold text-midnight">{heading}</h2>}
        </div>
      )}
      {loading ? <p className="text-sm text-slate-600" role="status">Loading {heading?.toLowerCase() || 'content'}...</p> : error ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-red-700" role="alert">Content is temporarily unavailable: {error}</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">{emptyMessage}</p>
      ) : display === 'list' ? (
        <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-4 sm:px-6">
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <article>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{siteContentTypeLabel(item.content_type)}</p>
                <h3 className="mt-1 font-semibold text-midnight">{item.title}</h3>
                {item.event_date && <p className="mt-1 text-xs font-medium text-slate-600">Date: {new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${item.event_date}T00:00:00Z`))}{item.event_location ? ` · ${item.event_location}` : ''}</p>}
                {item.content_type === 'announcement' && <time className="mt-1 block text-xs text-slate-500" dateTime={item.published_at || ''}>{dateLabel(item.published_at || item.created_at)}</time>}
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{item.body}</p>
                {item.link_url && <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-flex min-h-9 items-center gap-1 text-sm">{item.link_label || 'Read more'} <ArrowUpRight size={15} aria-hidden="true" /></a>}
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
                {item.image_url && <img src={item.image_url} alt="" loading="lazy" className="h-40 w-full object-cover" />}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{siteContentTypeLabel(item.content_type)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-midnight">{item.title}</h3>
                  {item.event_date && <p className="mt-2 text-sm font-medium text-slate-700">Date: {new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${item.event_date}T00:00:00Z`))}{item.event_location ? ` · ${item.event_location}` : ''}</p>}
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{item.body}</p>
                  {item.link_url && <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="link mt-4 inline-flex min-h-9 items-center gap-1 text-sm">{item.link_label || 'Read more'} <ArrowUpRight size={15} aria-hidden="true" /></a>}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
