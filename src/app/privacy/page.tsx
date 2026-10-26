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
          tone="plain"
        />
        <div className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <section>
            <h2 className="section-heading">How your information is used</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">Beacon stores your name and email for account access, and profile, checklist, notification, and CV details to provide the learner workspace. Your data is stored in Supabase and protected by user-specific row-level security. Profile photos you add are stored privately. If you connect Google Calendar, encrypted authorization credentials are stored by the service so it can maintain the application and closing-date reminders you asked it to create.</p>
          </section>
          <section>
            <h2 className="section-heading">What we do not ask for</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">This profile does not request your national ID or passport number, bank details, reference contact details, or demographic/disability information. Google sign-in is optional. Calendar access is used only to add or update Beacon application and closing-date reminders in your primary calendar. Email alerts are optional and off by default; opted-in application-date confirmations are sent through the site email provider when configured.</p>
          </section>
          <section>
            <h2 className="section-heading">Optional AI application plans</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">If you choose to create an AI application plan, the selected opportunity details and relevant profile information, which may include work authorization, availability, shift preferences, salary range, and certificates, are sent to the AI provider configured by the service operator. The plan is not sent to an employer or saved by Beacon. Your application pack is assembled in your browser and copied only when you request it; review it before pasting it into an employer form. Beacon cannot fill third-party forms or submit applications automatically. Do not include sensitive information, and verify all suggestions against the original listing before applying. AI plans are unavailable when the service is hosted on GitHub Pages or the AI provider is not configured.</p>
          </section>
          <section>
            <h2 className="section-heading">Skills Passport sharing</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">A Skills Passport is private until you publish it. You choose which sections appear on its share link and whether to include a contact email. Anyone who has a published link can view its selected content until you revoke the link or it expires. Revoking replaces the link token. The public view does not include your account ID, address, phone number, income goals, work authorisation, or private profile fields. Information you choose to share is learner-provided; Beacon does not verify credentials or work samples. Do not include another person’s private information.</p>
          </section>
          <section>
            <h2 className="section-heading">Your choices</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">You can update your profile and notification preferences in Settings. You can export or delete your account data from Settings. Do not enter information you do not want stored in this prototype.</p>
          </section>
        </div>
        <p className="mt-6 rounded-xl border-l-4 border-slate-300 bg-white px-4 py-3 text-xs leading-5 text-slate-600">This is a prototype privacy notice, not legal advice or a final POPIA compliance review. The organization operating the service must provide its legal entity, contact details, retention policy, and responsible-party information before production use.</p>
      </article>
    </PublicShell>
  );
}