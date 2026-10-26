'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase';
import { isValidWebUrl } from '@/lib/opportunities';
import { siteContentTypes, type SiteContent, type SiteContentStatus, type SiteContentType } from '@/lib/site-content';

type Draft = {
  content_type: SiteContentType;
  title: string;
  body: string;
  link_label: string;
  link_url: string;
  image_url: string;
  event_date: string;
  event_location: string;
  status: SiteContentStatus;
  sort_order: string;
};

const emptyDraft: Draft = {
  content_type: 'announcement',
  title: '',
  body: '',
  link_label: '',
  link_url: '',
  image_url: '',
  event_date: '',
  event_location: '',
  status: 'draft',
  sort_order: '0',
};

function contentError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST205') {
    return 'Supabase cannot find site_content. Apply migration 20261026007000_site_content.sql, then reload the API schema cache.';
  }
  if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST204'
    && 'message' in error && typeof error.message === 'string'
    && (error.message.includes('event_date') || error.message.includes('opportunity_resource'))) {
    return `The opportunity information migration is missing. Apply migration 20261026018000_opportunity_resources.sql, then reload the Supabase API schema cache. Details: ${error.message}`;
  }
  return error instanceof Error ? error.message : 'The content could not be saved.';
}

function dateLabel(value: string | null): string {
  if (!value) return 'Not published';
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function SiteContentAdmin() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [filterType, setFilterType] = useState<SiteContentType | 'all'>('all');
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadContent() {
    const { data, error: queryError } = await getSupabase()
      .from('site_content')
      .select('id,content_type,title,body,link_label,link_url,image_url,event_date,event_location,status,sort_order,published_at,created_at')
      .order('content_type', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (queryError) throw queryError;
    setItems((data || []) as SiteContent[]);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error: queryError } = await getSupabase()
          .from('site_content')
          .select('id,content_type,title,body,link_label,link_url,image_url,event_date,event_location,status,sort_order,published_at,created_at')
          .order('content_type', { ascending: true })
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });
        if (queryError) throw queryError;
        if (active) setItems((data || []) as SiteContent[]);
      } catch (caught) {
        if (active) setError(contentError(caught));
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  function resetForm() {
    setDraft(emptyDraft);
    setEditingId('');
  }

  async function saveContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const linkUrl = draft.link_url.trim();
    const linkLabel = draft.link_label.trim();
    const imageUrl = draft.image_url.trim();
    const sortOrder = Number(draft.sort_order);
    if (Boolean(linkUrl) !== Boolean(linkLabel)) {
      setError('Add both a link label and URL, or leave both fields blank.');
      setSaving(false);
      return;
    }
    if (linkUrl && !isValidWebUrl(linkUrl)) {
      setError('The content link must be a valid HTTPS URL.');
      setSaving(false);
      return;
    }
    if (imageUrl && !isValidWebUrl(imageUrl)) {
      setError('The image URL must be a valid HTTPS URL.');
      setSaving(false);
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < -10000 || sortOrder > 10000) {
      setError('Display order must be a whole number from -10000 to 10000.');
      setSaving(false);
      return;
    }

    try {
      const supabase = getSupabase();
      const existing = editingId ? items.find((item) => item.id === editingId) : undefined;
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw new Error('Sign in again before saving site content.');
      const payload = {
        content_type: draft.content_type,
        title: draft.title.trim(),
        body: draft.body.trim(),
        link_label: linkLabel || null,
        link_url: linkUrl || null,
        image_url: imageUrl || null,
        event_date: draft.content_type === 'opportunity_resource' ? draft.event_date || null : null,
        event_location: draft.content_type === 'opportunity_resource' ? draft.event_location.trim() || null : null,
        status: draft.status,
        sort_order: sortOrder,
        published_at: draft.status === 'draft'
          ? null
          : draft.status === 'archived'
            ? existing?.published_at || null
            : existing?.published_at || new Date().toISOString(),
      };

      if (editingId) {
        const { error: saveError } = await supabase.from('site_content').update(payload).eq('id', editingId);
        if (saveError) throw saveError;
      } else {
        const { error: saveError } = await supabase.from('site_content').insert({
          ...payload,
          created_by: authData.user.id,
        });
        if (saveError) throw saveError;
      }
      await loadContent();
      setMessage(editingId ? 'Content updated.' : 'Content created.');
      resetForm();
    } catch (caught) {
      console.error('Could not save site content:', caught);
      setError(contentError(caught));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(item: SiteContent, status: SiteContentStatus) {
    setBusyId(item.id);
    setError('');
    setMessage('');
    try {
      const { error: saveError } = await getSupabase()
        .from('site_content')
        .update({
          status,
          published_at: status === 'draft'
            ? null
            : status === 'archived'
              ? item.published_at
              : item.published_at || new Date().toISOString(),
        })
        .eq('id', item.id);
      if (saveError) throw saveError;
      await loadContent();
      setMessage(status === 'published' ? 'Content published to its site section.' : `Content moved to ${status}.`);
    } catch (caught) {
      setError(contentError(caught));
    } finally {
      setBusyId('');
    }
  }

  async function deleteContent(item: SiteContent) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setBusyId(item.id);
    setError('');
    setMessage('');
    try {
      const { error: deleteError } = await getSupabase().from('site_content').delete().eq('id', item.id);
      if (deleteError) throw deleteError;
      setItems((current) => current.filter((content) => content.id !== item.id));
      if (editingId === item.id) resetForm();
      setMessage('Content deleted.');
    } catch (caught) {
      setError(contentError(caught));
    } finally {
      setBusyId('');
    }
  }

  const filteredItems = filterType === 'all' ? items : items.filter((item) => item.content_type === filterType);
  const typeHelp = siteContentTypes.find((item) => item.value === draft.content_type);

  return (
    <div className="mt-8 space-y-10">
      <section aria-labelledby="site-content-form-heading">
        <h2 id="site-content-form-heading" className="text-xl font-semibold text-midnight">{editingId ? 'Edit site content' : 'Create site content'}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Publish learner announcements, learning resources, seminars, events, and other opportunity information. Application listings remain separate; content published as an opportunity resource appears in the Work and Study information feeds.
        </p>
        <form className="mt-5 grid gap-5 border-y border-slate-200 py-6 sm:grid-cols-2" onSubmit={saveContent}>
          <div>
            <label htmlFor="site-content-type" className="label">Content type and destination</label>
            <select id="site-content-type" className="input" value={draft.content_type} onChange={(event) => setDraft((current) => ({ ...current, content_type: event.target.value as SiteContentType }))}>
              {siteContentTypes.map((type) => <option key={type.value} value={type.value}>{type.label} — {type.placement}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-500">This content will appear in: {typeHelp?.placement}.</p>
          </div>
          <div>
            <label htmlFor="site-content-status" className="label">Visibility</label>
            <select id="site-content-status" className="input" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as SiteContentStatus }))}>
              <option value="draft">Save as draft</option>
              <option value="published">Publish now</option>
              <option value="archived">Archive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="site-content-title" className="label">Title</label>
            <input id="site-content-title" className="input" required minLength={3} maxLength={160} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="site-content-body" className="label">Content</label>
            <textarea id="site-content-body" className="input min-h-36 resize-y" required minLength={10} maxLength={8000} rows={6} value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} />
            <p className="mt-1 text-xs text-slate-500">Plain text only; line breaks are preserved.</p>
          </div>
          {draft.content_type === 'opportunity_resource' && <>
            <div>
              <label htmlFor="site-content-event-date" className="label">Event or seminar date <span className="font-normal text-slate-500">(optional)</span></label>
              <input id="site-content-event-date" className="input" type="date" value={draft.event_date} onChange={(event) => setDraft((current) => ({ ...current, event_date: event.target.value }))} />
            </div>
            <div>
              <label htmlFor="site-content-event-location" className="label">Location or format <span className="font-normal text-slate-500">(optional)</span></label>
              <input id="site-content-event-location" className="input" maxLength={160} placeholder="Online, Johannesburg, or venue details" value={draft.event_location} onChange={(event) => setDraft((current) => ({ ...current, event_location: event.target.value }))} />
            </div>
          </>}
          <div>
            <label htmlFor="site-content-link-label" className="label">Link label <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="site-content-link-label" className="input" maxLength={80} placeholder="Read more" value={draft.link_label} onChange={(event) => setDraft((current) => ({ ...current, link_label: event.target.value }))} />
          </div>
          <div>
            <label htmlFor="site-content-link-url" className="label">Link URL <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="site-content-link-url" className="input" type="url" placeholder="https://" value={draft.link_url} onChange={(event) => setDraft((current) => ({ ...current, link_url: event.target.value }))} />
          </div>
          <div>
            <label htmlFor="site-content-image-url" className="label">Image URL <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="site-content-image-url" className="input" type="url" placeholder="https://" value={draft.image_url} onChange={(event) => setDraft((current) => ({ ...current, image_url: event.target.value }))} />
            <p className="mt-1 text-xs text-slate-500">HTTPS image URL. Use only images you have permission to publish.</p>
          </div>
          <div>
            <label htmlFor="site-content-sort-order" className="label">Display order</label>
            <input id="site-content-sort-order" className="input" type="number" min="-10000" max="10000" step="1" value={draft.sort_order} onChange={(event) => setDraft((current) => ({ ...current, sort_order: event.target.value }))} />
            <p className="mt-1 text-xs text-slate-500">Smaller numbers appear first within that section.</p>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="sm:col-span-2 text-sm text-emerald-dark" role="status">{message}</p>}
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create content'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={resetForm} disabled={saving}>Cancel edit</button>}
          </div>
        </form>
      </section>

      <section aria-labelledby="site-content-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="site-content-list-heading" className="text-xl font-semibold text-midnight">Content library</h2>
            <p className="mt-1 text-sm text-slate-600">Review, edit, publish, unpublish, archive, or remove site content.</p>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="site-content-filter" className="label">Filter by content type</label>
            <select id="site-content-filter" className="input sm:min-w-64" value={filterType} onChange={(event) => setFilterType(event.target.value as SiteContentType | 'all')}>
              <option value="all">All content types</option>
              {siteContentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
        </div>
        {loading ? <p className="py-5 text-sm text-slate-600" role="status">Loading site content...</p> : filteredItems.length === 0 ? (
          <p className="border-y border-slate-200 py-5 text-sm text-slate-600">No content matches this selection yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
            {filteredItems.map((item) => {
              const destination = siteContentTypes.find((type) => type.value === item.content_type)?.placement;
              return (
                <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-midnight">{item.title}</h3>
                      <span className="text-xs font-semibold capitalize text-slate-600">{item.status}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{siteContentTypes.find((type) => type.value === item.content_type)?.label} · {destination}</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{item.body}</p>
                    {item.event_date && <p className="mt-2 text-sm font-medium text-slate-700">Date: {new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${item.event_date}T00:00:00Z`))}{item.event_location ? ` · ${item.event_location}` : ''}</p>}
                    <p className="mt-2 text-xs text-slate-500">{item.status === 'published' ? 'Published' : 'Created'} · {dateLabel(item.status === 'published' ? item.published_at : item.created_at)} · Display order {item.sort_order}</p>
                    {item.link_url && <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="link mt-2 inline-block text-sm">{item.link_label || item.link_url}</a>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" onClick={() => { setDraft({ content_type: item.content_type, title: item.title, body: item.body, link_label: item.link_label || '', link_url: item.link_url || '', image_url: item.image_url || '', event_date: item.event_date || '', event_location: item.event_location || '', status: item.status, sort_order: String(item.sort_order) }); setEditingId(item.id); setMessage(''); setError(''); }}>Edit</button>
                    {item.status !== 'published' && <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" disabled={busyId === item.id} onClick={() => void changeStatus(item, 'published')}>Publish</button>}
                    {item.status === 'published' && <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" disabled={busyId === item.id} onClick={() => void changeStatus(item, 'draft')}>Unpublish</button>}
                    {item.status !== 'archived' && <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" disabled={busyId === item.id} onClick={() => void changeStatus(item, 'archived')}>Archive</button>}
                    <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" disabled={busyId === item.id} onClick={() => void deleteContent(item)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
