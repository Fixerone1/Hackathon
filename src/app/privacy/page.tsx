import { PublicShell } from '@/components/PublicShell';
import { PageIntro } from '@/components/PageIntro';

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="mx-auto w-full max-w-4xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <PageIntro
          eyebrow="Privacy"
          title="Your information, used for your goals."
          description="We aim to make it clear what information is used, why it is needed, and what choices you have."
          className="max-w-3xl"
        />
        <div className="space-y-7 rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-5 sm:p-7">
          <section>
            <h2 className="section-heading">How your information is used</h2>
            <p className="mt-2 text-sm leading-7 text-[#555555]">CareerForge stores your name and email for account access, and profile, checklist, and notification settings to provide the learner workspace. Your data is stored in Supabase and protected by user-specific row-level security.</p>
          </section>
          <section>
            <h2 className="section-heading">What we do not ask for</h2>
            <p className="mt-2 text-sm leading-7 text-[#555555]">This profile does not request your national ID or passport number, bank details, reference contact details, or demographic/disability information. Email notifications are optional, off by default, and are not being sent by this preview.</p>
          </section>
          <section>
            <h2 className="section-heading">Optional AI application plans</h2>
            <p className="mt-2 text-sm leading-7 text-[#555555]">If you choose to create an AI application plan, the selected opportunity details and relevant profile information, which may include work authorization, availability, shift preferences, salary range, and certificates, are sent to the AI provider configured by the service operator. The plan is not sent to an employer or saved by CareerForge. Your application pack is assembled in your browser and copied only when you request it; review it before pasting it into an employer form. CareerForge cannot fill third-party forms or submit applications automatically. Do not include sensitive information, and verify all suggestions against the original listing before applying. AI plans are unavailable when the service is hosted on GitHub Pages or the AI provider is not configured.</p>
          </section>
          <section>
            <h2 className="section-heading">Your choices</h2>
            <p className="mt-2 text-sm leading-7 text-[#555555]">You can update your profile and notification preferences in Settings. You can export or delete your account data from Settings. Do not enter information you do not want stored in this prototype.</p>
          </section>
        </div>
        <p className="mt-6 rounded-xl border-l-4 border-sunshine bg-white px-4 py-3 text-xs leading-5 text-[#555555]">This is a prototype privacy notice, not legal advice or a final POPIA compliance review. The organization operating the service must provide its legal entity, contact details, retention policy, and responsible-party information before production use.</p>
      </article>
    </PublicShell>
  );
}