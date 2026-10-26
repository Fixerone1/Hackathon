export const siteContentTypes = [
  { value: 'announcement', label: 'Learner announcement', placement: 'Dashboard' },
  { value: 'learning_resource', label: 'Learning resource or course', placement: 'Employment Hub' },
  { value: 'faq', label: 'Frequently asked question', placement: 'Public homepage' },
  { value: 'homepage_feature', label: 'Homepage feature', placement: 'Public homepage' },
  { value: 'money_skill', label: 'Money Skills content', placement: 'Money Skills' },
  { value: 'growth_resource', label: 'Growth Studio content', placement: 'Growth Studio' },
  { value: 'employment_resource', label: 'Employment resource', placement: 'Employment Hub' },
  { value: 'opportunity_resource', label: 'Seminar, event or useful information', placement: 'Opportunities and Study feeds' },
] as const;

export type SiteContentType = (typeof siteContentTypes)[number]['value'];
export type SiteContentStatus = 'draft' | 'published' | 'archived';

export type SiteContent = {
  id: string;
  content_type: SiteContentType;
  title: string;
  body: string;
  link_label: string | null;
  link_url: string | null;
  image_url: string | null;
  event_date: string | null;
  event_location: string | null;
  status: SiteContentStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
};

export function siteContentTypeLabel(value: SiteContentType): string {
  return siteContentTypes.find((type) => type.value === value)?.label || value;
}
