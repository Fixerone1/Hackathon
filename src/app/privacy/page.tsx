import { PublicShell } from '@/components/PublicShell';

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="eyebrow">Privacy</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Your information, used for your goals.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">CareerForge stores your name and email for account access, and profile, checklist, and notification settings to provide the learner workspace. Your data is stored in Supabase and protected by user-specific row-level security.</p>
        <h2 className="mt-8 font-semibold text-midnight">What we do not ask for</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">This profile does not request your national ID number, bank details, or photos. Email notifications are optional, off by default, and are not being sent by this preview.</p>
        <h2 className="mt-8 font-semibold text-midnight">Optional AI application plans</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">If you choose to create an AI application plan, the selected opportunity details and relevant profile information are sent to the AI provider configured by the service operator. The plan is not sent to an employer or saved by CareerForge. Do not include sensitive information, and verify all suggestions against the original listing before applying. AI plans are unavailable when the service is hosted on GitHub Pages or the AI provider is not configured.</p>
        <h2 className="mt-8 font-semibold text-midnight">Your choices</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">You can update your profile and notification preferences in Settings. You can export or delete your account data from Settings. Do not enter information you do not want stored in this prototype.</p>
        <p className="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">This is a prototype privacy notice, not legal advice or a final POPIA compliance review. The organization operating the service must provide its legal entity, contact details, retention policy, and responsible-party information before production use.</p>
      </article>
    </PublicShell>
  );
}