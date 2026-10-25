'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { getSupabase } from '@/lib/supabase';
import {
  categoryLabel,
  isValidWebUrl,
  nqfLevels,
  normalizeOpportunity,
  opportunityCoverageLabel,
  opportunityCategories,
  southAfricanProvinces,
  type Opportunity,
  type OpportunityCategory,
  type OpportunityStatus,
} from '@/lib/opportunities';

type OpportunityDraft = {
  title: string;
  organization: string;
  category: OpportunityCategory;
  summary: string;
  source_name: string;
  source_url: string;
  banner_image_url: string;
  location: string;
  nationwide: boolean;
  provinces: string[];
  remote_ok: boolean;
  minimum_nqf_level: string;
  required_skills_text: string;
  shift_types: string[];
  salary_min_monthly: string;
  salary_max_monthly: string;
  closing_date: string;
  status: 'draft' | 'published';
};

const emptyDraft: OpportunityDraft = {
  title: '',
  organization: '',
  category: 'job',
  summary: '',
  source_name: '',
  source_url: '',
  banner_image_url: '',
  location: '',
  nationwide: true,
  provinces: [],
  remote_ok: false,
  minimum_nqf_level: '',
  required_skills_text: '',
  shift_types: [],
  salary_min_monthly: '',
  salary_max_monthly: '',
  closing_date: '',
  status: 'draft',
};

const maxBannerSizeBytes = 5 * 1024 * 1024;
const bannerTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

function opportunitySaveError(error: unknown): string {
  const details = error && typeof error === 'object'
    ? error as { message?: unknown; code?: unknown }
    : null;
  const message = typeof details?.message === 'string' ? details.message : '';
  const code = typeof details?.code === 'string' ? details.code : '';

  if ((code === 'PGRST204' || code === '42703') && message.includes('banner_image_url')) {
    return `The banner image column is not available yet. Apply migration 20261026006000_opportunity_banner_image.sql, then reload the Supabase API schema cache. Details: ${message}`;
  }
  if ((code === 'PGRST204' || code === '42703') && message.includes('withdrawn_at')) {
    return `The opportunity visibility migration is missing. Apply migration 20261026002000_opportunity_integrity.sql, then reload the Supabase API schema cache. Details: ${message}`;
  }
  if (message) return message;
  return error instanceof Error ? error.message : 'The opportunity could not be saved. Check the listing fields and Supabase migrations, then try again.';
}

function toDraft(opportunity: Opportunity): OpportunityDraft {
  const includesAllProvinces = southAfricanProvinces.every((province) => opportunity.provinces.includes(province));
  const nationwide = opportunity.provinces.length === 0 || includesAllProvinces;
  return {
    title: opportunity.title,
    organization: opportunity.organization,
    category: opportunity.category,
    summary: opportunity.summary,
    source_name: opportunity.source_name,
    source_url: opportunity.source_url,
    banner_image_url: opportunity.banner_image_url || '',
    location: opportunity.location,
    nationwide,
    provinces: nationwide ? [] : opportunity.provinces,
    remote_ok: opportunity.remote_ok,
    minimum_nqf_level: opportunity.minimum_nqf_level === null ? '' : String(opportunity.minimum_nqf_level),
    required_skills_text: opportunity.required_skills.join(', '),
    shift_types: opportunity.shift_types || [],
    salary_min_monthly: opportunity.salary_min_monthly === null ? '' : String(opportunity.salary_min_monthly),
    salary_max_monthly: opportunity.salary_max_monthly === null ? '' : String(opportunity.salary_max_monthly),
    closing_date: opportunity.closing_date || '',
    status: opportunity.status === 'published' ? 'published' : 'draft',
  };
}

export function OpportunityAdmin() {
  const [listings, setListings] = useState<Opportunity[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');
  const [bannerInputKey, setBannerInputKey] = useState(0);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadListings() {
    const { data, error: queryError } = await getSupabase()
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (queryError) throw queryError;
    setListings(((data || []) as Opportunity[]).map(normalizeOpportunity));
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data, error: queryError } = await getSupabase()
          .from('opportunities')
          .select('*')
          .order('created_at', { ascending: false });
        if (queryError) throw queryError;
        if (active) setListings(((data || []) as Opportunity[]).map(normalizeOpportunity));
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'The opportunity review queue could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreviewUrl('');
      return;
    }
    const previewUrl = URL.createObjectURL(bannerFile);
    setBannerPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [bannerFile]);

  function update<K extends keyof OpportunityDraft>(key: K, value: OpportunityDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setDraft(emptyDraft);
    setBannerFile(null);
    setBannerInputKey((key) => key + 1);
    setEditingId('');
  }

  function selectBannerFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setError('');
    setMessage('');
    if (!file) {
      setBannerFile(null);
      return;
    }
    if (!Object.hasOwn(bannerTypes, file.type)) {
      setBannerFile(null);
      event.target.value = '';
      setError('Choose a JPEG, PNG, or WebP image for the opportunity banner.');
      return;
    }
    if (file.size > maxBannerSizeBytes) {
      setBannerFile(null);
      event.target.value = '';
      setError('The opportunity banner image must be 5 MB or smaller.');
      return;
    }
    setBannerFile(file);
    update('banner_image_url', '');
  }

  async function saveListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    if (!isValidWebUrl(draft.source_url)) {
      setError('Enter a valid original source URL beginning with https://.');
      setSaving(false);
      return;
    }
    if (!bannerFile && draft.banner_image_url.trim() && !isValidWebUrl(draft.banner_image_url.trim())) {
      setError('The banner image URL must begin with https://.');
      setSaving(false);
      return;
    }
    const closingDate = draft.closing_date || null;
    const today = new Date().toISOString().slice(0, 10);
    if (draft.status === 'published' && closingDate && closingDate < today) {
      setError('This closing date has passed. Update it or save the listing as a draft.');
      setSaving(false);
      return;
    }
    if (!draft.nationwide && draft.provinces.length === 0) {
      setError('Choose Nationwide or select at least one province.');
      setSaving(false);
      return;
    }
    const selectedProvinces = draft.nationwide ? [] : draft.provinces;
    const minNqf = draft.minimum_nqf_level ? Number(draft.minimum_nqf_level) : null;
    if (minNqf !== null && (!Number.isInteger(minNqf) || minNqf < 1 || minNqf > 10)) {
      setError('Minimum NQF level must be a number from 1 to 10.');
      setSaving(false);
      return;
    }
    const salaryMin = draft.salary_min_monthly ? Number(draft.salary_min_monthly) : null;
    const salaryMax = draft.salary_max_monthly ? Number(draft.salary_max_monthly) : null;
    if (
      (salaryMin !== null && (!Number.isInteger(salaryMin) || salaryMin < 0))
      || (salaryMax !== null && (!Number.isInteger(salaryMax) || salaryMax < 0))
      || (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin)
    ) {
      setError('Enter a valid monthly salary range, with the maximum equal to or higher than the minimum.');
      setSaving(false);
      return;
    }

    let uploadedBannerPath = '';
    let listingSaved = false;

    try {
      const supabase = getSupabase();
      let bannerImageUrl = draft.banner_image_url.trim() || null;
      if (bannerFile) {
        setUploadingBanner(true);
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in again before uploading an opportunity banner.');
        const extension = bannerTypes[bannerFile.type as keyof typeof bannerTypes];
        uploadedBannerPath = `${authData.user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('opportunity-banners')
          .upload(uploadedBannerPath, bannerFile, {
            contentType: bannerFile.type,
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) throw uploadError;
        bannerImageUrl = supabase.storage.from('opportunity-banners').getPublicUrl(uploadedBannerPath).data.publicUrl;
      }

      const payload = {
        title: draft.title.trim(),
        organization: draft.organization.trim(),
        category: draft.category,
        summary: draft.summary.trim(),
        source_name: draft.source_name.trim(),
        source_url: draft.source_url.trim(),
        banner_image_url: bannerImageUrl,
        location: draft.location.trim(),
        provinces: selectedProvinces,
        remote_ok: draft.remote_ok,
        minimum_nqf_level: minNqf,
        required_skills: draft.required_skills_text.split(',').map((item) => item.trim()).filter(Boolean),
        shift_types: draft.shift_types,
        salary_min_monthly: salaryMin,
        salary_max_monthly: salaryMax,
        closing_date: closingDate,
        verified_at: today,
        status: draft.status as OpportunityStatus,
        withdrawn_at: null,
      };

      if (editingId) {
        const { error: saveError } = await supabase.from('opportunities').update(payload).eq('id', editingId);
        if (saveError) throw saveError;
      } else {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) throw new Error('Sign in again before publishing an opportunity.');
        const { error: saveError } = await supabase.from('opportunities').insert({ ...payload, created_by: authData.user.id });
        if (saveError) throw saveError;
      }
      listingSaved = true;
      await loadListings();
      setMessage(editingId ? 'Opportunity updated.' : 'Opportunity added to the review queue.');
      resetForm();
    } catch (caught) {
      console.error('Could not save opportunity:', caught);
      if (uploadedBannerPath && !listingSaved) {
        try {
          const { error: cleanupError } = await getSupabase().storage.from('opportunity-banners').remove([uploadedBannerPath]);
          if (cleanupError) console.error('Could not remove the unlinked opportunity banner upload:', cleanupError);
        } catch (cleanupError) {
          console.error('Could not remove the unlinked opportunity banner upload:', cleanupError);
        }
      }
      setError(opportunitySaveError(caught));
    } finally {
      setSaving(false);
      setUploadingBanner(false);
    }
  }

  async function changeStatus(opportunity: Opportunity, status: 'draft' | 'published') {
    setBusyId(opportunity.id);
    setError('');
    setMessage('');
    try {
      if (status === 'published' && opportunity.closing_date && opportunity.closing_date < new Date().toISOString().slice(0, 10)) {
        throw new Error('The closing date has passed. Edit the listing before publishing it again.');
      }
      const { error: updateError } = await getSupabase()
        .from('opportunities')
        .update({ status, verified_at: new Date().toISOString().slice(0, 10) })
        .eq('id', opportunity.id);
      if (updateError) throw updateError;
      await loadListings();
      setMessage(status === 'published'
        ? opportunity.status === 'published' ? 'Listing re-verified and visible in the learner feed again.' : 'Opportunity published.'
        : 'Opportunity moved to drafts.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The listing status could not be changed.');
    } finally {
      setBusyId('');
    }
  }

  async function deleteListing(opportunity: Opportunity) {
    if (!window.confirm(`Delete “${opportunity.title}”? This also removes learner save/application records for this listing.`)) return;
    setBusyId(opportunity.id);
    setError('');
    setMessage('');
    try {
      const { error: deleteError } = await getSupabase().from('opportunities').delete().eq('id', opportunity.id);
      if (deleteError) throw deleteError;
      setListings((current) => current.filter((item) => item.id !== opportunity.id));
      if (editingId === opportunity.id) resetForm();
      setMessage('Opportunity deleted.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The opportunity could not be deleted.');
    } finally {
      setBusyId('');
    }
  }

  const inputClass = 'input';
  const today = new Date().toISOString().slice(0, 10);
  const verificationCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="mt-8 space-y-10">
      <section aria-labelledby="opportunity-form-heading">
        <h2 id="opportunity-form-heading" className="text-xl font-semibold text-midnight">{editingId ? 'Edit verified opportunity' : 'Add a verified opportunity'}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Enter a short summary you have permission to use, check the original advert and closing date, then publish. Published listings appear in learner feeds and must link to the original source.</p>
        <form className="mt-5 grid gap-5 border-y border-slate-200 py-6 sm:grid-cols-2" onSubmit={saveListing}>
          <div>
            <label htmlFor="opportunity-title" className="label">Opportunity title</label>
            <input id="opportunity-title" className={inputClass} required minLength={3} maxLength={160} value={draft.title} onChange={(event) => update('title', event.target.value)} />
          </div>
          <div>
            <label htmlFor="opportunity-organization" className="label">Organization</label>
            <input id="opportunity-organization" className={inputClass} required minLength={2} maxLength={160} value={draft.organization} onChange={(event) => update('organization', event.target.value)} />
          </div>
          <div>
            <label htmlFor="opportunity-category" className="label">Type</label>
            <select id="opportunity-category" className={inputClass} value={draft.category} onChange={(event) => update('category', event.target.value as OpportunityCategory)}>
              {opportunityCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="opportunity-source-name" className="label">Verified source name</label>
            <input id="opportunity-source-name" className={inputClass} required minLength={2} maxLength={120} placeholder="For example, SAYouth" value={draft.source_name} onChange={(event) => update('source_name', event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="opportunity-source-url" className="label">Original advert or application URL</label>
            <input id="opportunity-source-url" className={inputClass} type="url" required placeholder="https://" value={draft.source_url} onChange={(event) => update('source_url', event.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="opportunity-banner-file" className="label">Upload your own opportunity banner <span className="font-normal text-slate-500">(optional)</span></label>
            <input
              key={bannerInputKey}
              id="opportunity-banner-file"
              className={inputClass}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="opportunity-banner-guidance"
              onChange={selectBannerFile}
            />
            <p id="opportunity-banner-guidance" className="mt-1 text-xs leading-5 text-slate-500">JPEG, PNG, or WebP · maximum 5 MB. Use an image you have permission to publish. Uploads are stored in the site’s Supabase Storage bucket.</p>
            {bannerFile && <button type="button" className="link mt-2 text-sm" onClick={() => { setBannerFile(null); setBannerInputKey((key) => key + 1); }}>Remove selected image</button>}
            {!bannerFile && (
              <div className="mt-3">
                <label htmlFor="opportunity-banner-image" className="label">Or use an existing HTTPS image URL</label>
                <input
                  id="opportunity-banner-image"
                  className={inputClass}
                  type="url"
                  placeholder="https://source.example/image.jpg"
                  value={draft.banner_image_url}
                  onChange={(event) => {
                    setBannerFile(null);
                    update('banner_image_url', event.target.value);
                  }}
                />
              </div>
            )}
            {(bannerPreviewUrl || (draft.banner_image_url && isValidWebUrl(draft.banner_image_url))) && (
              <img src={bannerPreviewUrl || draft.banner_image_url} alt="Opportunity banner preview" className="mt-3 h-32 w-full rounded-lg border border-slate-200 object-cover sm:max-w-md" />
            )}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="opportunity-summary" className="label">Plain-language summary</label>
            <textarea id="opportunity-summary" className={inputClass} required minLength={20} maxLength={2000} rows={4} value={draft.summary} onChange={(event) => update('summary', event.target.value)} />
          </div>
          <div>
            <label htmlFor="opportunity-location" className="label">Location or coverage</label>
            <input id="opportunity-location" className={inputClass} maxLength={160} placeholder="For example, Johannesburg or National" value={draft.location} onChange={(event) => update('location', event.target.value)} />
            <p className="mt-1 text-xs text-slate-500">Optional place name or extra location detail. Use the coverage selector for nationwide or province availability.</p>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="label">Where is this opportunity available?</legend>
            <label className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-300 bg-sunshine-light/40 px-3 py-2 text-sm font-semibold text-midnight">
              <input
                type="checkbox"
                className="h-5 w-5 accent-sunshine-dark"
                checked={draft.nationwide}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    nationwide: event.target.checked,
                    provinces: event.target.checked ? [] : current.provinces,
                  }));
                }}
              />
              Nationwide — available in all provinces
            </label>
            <p className="mt-2 text-xs leading-5 text-slate-500">For province-specific opportunities, uncheck Nationwide and choose every applicable province below. Choosing all provinces is treated as nationwide.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {southAfricanProvinces.map((province) => (
                <label key={province} className={`flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 text-sm ${draft.nationwide ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-700'}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-sunshine-dark"
                    checked={draft.provinces.includes(province)}
                    disabled={draft.nationwide}
                    onChange={(event) => {
                      const selected = event.target.checked
                        ? [...draft.provinces, province]
                        : draft.provinces.filter((item) => item !== province);
                      const allSelected = selected.length === southAfricanProvinces.length;
                      setDraft((current) => ({
                        ...current,
                        nationwide: allSelected,
                        provinces: allSelected ? [] : selected,
                      }));
                    }}
                  />
                  {province}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="opportunity-minimum-nqf" className="label">Stated minimum NQF <span className="font-normal text-slate-500">(optional)</span></label>
            <select id="opportunity-minimum-nqf" className={inputClass} value={draft.minimum_nqf_level} onChange={(event) => update('minimum_nqf_level', event.target.value)}>
              <option value="">Not stated</option>
              {nqfLevels.map((level) => <option key={level} value={level}>NQF {level}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="opportunity-skills" className="label">Stated skills or subjects <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="opportunity-skills" className={inputClass} placeholder="Communication, Excel" value={draft.required_skills_text} onChange={(event) => update('required_skills_text', event.target.value)} />
            <p className="mt-1 text-xs text-slate-500">Comma-separated. Only include requirements from the advert.</p>
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="label">Shifts stated in the advert <span className="font-normal text-slate-500">(optional)</span></legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['day', 'Daytime'],
                ['evening', 'Evenings'],
                ['night', 'Night shifts'],
                ['weekend', 'Weekends'],
                ['flexible', 'Flexible'],
              ].map(([value, label]) => (
                <label key={value} className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-sunshine-dark"
                    checked={draft.shift_types.includes(value)}
                    onChange={(event) => update('shift_types', event.target.checked
                      ? [...draft.shift_types, value]
                      : draft.shift_types.filter((item) => item !== value))}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">Only select shifts explicitly stated in the original advert.</p>
          </fieldset>
          <div>
            <label htmlFor="opportunity-salary-min" className="label">Minimum monthly salary (R) <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="opportunity-salary-min" type="number" min="0" step="1" className={inputClass} value={draft.salary_min_monthly} onChange={(event) => update('salary_min_monthly', event.target.value)} />
          </div>
          <div>
            <label htmlFor="opportunity-salary-max" className="label">Maximum monthly salary (R) <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="opportunity-salary-max" type="number" min="0" step="1" className={inputClass} value={draft.salary_max_monthly} onChange={(event) => update('salary_max_monthly', event.target.value)} />
            <p className="mt-1 text-xs text-slate-500">Only enter a range if the advert states it.</p>
          </div>
          <div>
            <label htmlFor="opportunity-closing" className="label">Closing date <span className="font-normal text-slate-500">(optional)</span></label>
            <input id="opportunity-closing" type="date" min={today} className={inputClass} value={draft.closing_date} onChange={(event) => update('closing_date', event.target.value)} />
          </div>
          <label className="flex min-h-12 items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" className="h-5 w-5 accent-sunshine-dark" checked={draft.remote_ok} onChange={(event) => update('remote_ok', event.target.checked)} />
            Advert states remote participation is available
          </label>
          <div>
            <label htmlFor="opportunity-status" className="label">Visibility</label>
            <select id="opportunity-status" className={inputClass} value={draft.status} onChange={(event) => update('status', event.target.value as OpportunityDraft['status'])}>
              <option value="draft">Save as draft</option>
              <option value="published">Publish to learner feed</option>
            </select>
          </div>
          {error && <p className="sm:col-span-2 text-sm text-red-700" role="alert">{error}</p>}
          {message && <p className="sm:col-span-2 text-sm text-emerald-dark" role="status">{message}</p>}
          <div className="sm:col-span-2 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>{uploadingBanner ? 'Uploading banner...' : saving ? 'Saving...' : editingId ? 'Save changes' : 'Add opportunity'}</button>
            {editingId && <button type="button" className="btn-secondary" onClick={resetForm} disabled={saving}>Cancel edit</button>}
          </div>
        </form>
      </section>

      <section aria-labelledby="opportunity-queue-heading">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="opportunity-queue-heading" className="text-xl font-semibold text-midnight">Listings and review queue</h2>
          <button type="button" className="btn-secondary min-h-10" onClick={() => { setError(''); void loadListings().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'Listings could not be refreshed.')); }}>Refresh</button>
        </div>
        {loading ? <p className="py-5 text-sm text-slate-600" role="status">Loading listings...</p> : listings.length === 0 ? (
          <p className="border-y border-slate-200 py-5 text-sm text-slate-600">No opportunities have been added yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
            {listings.map((opportunity) => {
              const pastClosingDate = Boolean(opportunity.closing_date && opportunity.closing_date < today);
              const needsReverification = opportunity.verified_at < verificationCutoff;
              return (
                <li key={opportunity.id} className="flex flex-wrap items-start justify-between gap-4 py-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-midnight">{opportunity.title}</h3>
                      <span className={`text-xs font-semibold ${pastClosingDate || needsReverification ? 'text-amber-800' : opportunity.status === 'published' ? 'text-emerald-dark' : 'text-slate-500'}`}>
                        {pastClosingDate ? 'Closing date passed' : needsReverification ? 'Needs re-verification' : opportunity.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{opportunity.organization} · {categoryLabel(opportunity.category)} · Source: {opportunity.source_name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600">Coverage: {opportunityCoverageLabel(opportunity.provinces)}</p>
                    {(opportunity.shift_types.length > 0 || opportunity.salary_min_monthly !== null || opportunity.salary_max_monthly !== null) && (
                      <p className="mt-1 text-xs text-slate-500">
                        {opportunity.shift_types.length > 0 && `Shifts: ${opportunity.shift_types.join(', ')}`}
                        {opportunity.shift_types.length > 0 && (opportunity.salary_min_monthly !== null || opportunity.salary_max_monthly !== null) && ' · '}
                        {(opportunity.salary_min_monthly !== null || opportunity.salary_max_monthly !== null) && `Monthly pay: R ${opportunity.salary_min_monthly ?? '—'} to ${opportunity.salary_max_monthly ?? '—'}`}
                      </p>
                    )}
                    <p className="mt-1 break-all text-xs text-slate-500">{opportunity.source_url}</p>
                    <p className="mt-1 text-xs text-slate-500">Verified {opportunity.verified_at}{opportunity.closing_date ? ` · Closes ${opportunity.closing_date}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" onClick={() => { setDraft(toDraft(opportunity)); setEditingId(opportunity.id); setMessage(''); setError(''); }}>Edit</button>
                    {needsReverification && opportunity.status === 'published' && !pastClosingDate && (
                      <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" disabled={busyId === opportunity.id} onClick={() => void changeStatus(opportunity, 'published')}>Confirm still open</button>
                    )}
                    <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-sm" disabled={busyId === opportunity.id || (pastClosingDate && opportunity.status !== 'published')} onClick={() => void changeStatus(opportunity, opportunity.status === 'published' ? 'draft' : 'published')}>
                      {opportunity.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button type="button" className="btn-secondary min-h-9 border-red-300 px-3 py-1 text-sm text-red-800 hover:bg-red-50" disabled={busyId === opportunity.id} onClick={() => void deleteListing(opportunity)}>Delete</button>
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
