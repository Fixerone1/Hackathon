import { PageIntro } from '@/components/PageIntro';

const validationQuestions = [
  'Does the problem affect enough people?',
  'Can I clearly describe my target customer?',
  'Are similar solutions already available?',
  'Why would someone choose my solution?',
  'Can this eventually generate income or attract support?',
];

const nextSteps = [
  {
    title: 'I only have an idea',
    items: [
      'Write down the problem.',
      'Define your target audience.',
      'Interview 5 people.',
      'Create a one-page concept summary.',
    ],
  },
  {
    title: 'I already have customers or users',
    items: [
      'Collect feedback.',
      'Identify the biggest pain point.',
      'Improve one part of the offer.',
      'Test pricing or value.',
    ],
  },
  {
    title: 'I am ready to launch',
    items: [
      'Create a simple budget.',
      'Make basic marketing materials.',
      'Build a basic online presence.',
      'Secure your first paying customers or supporters.',
    ],
  },
];

const skills = ['Coding', 'Graphic design', 'Writing', 'Public speaking', 'Coaching', 'Sports training'];
const resources = ['Smartphone', 'Laptop', 'Internet access', 'Network', 'Community support', 'Social media audience'];

export default function GrowthStudioPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
      <PageIntro
        eyebrow="Growth Studio"
        title="Explore your ideas"
        description="Turn an idea into a practical next step with a simple test, a real audience, and a plan you can act on."
      />

      <main className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <p className="eyebrow">Growth Studio</p>
          <h2 className="mt-2 text-2xl font-bold text-black">Turn your idea into a realistic opportunity</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Have an idea for a business, community project, app, side hustle, or social initiative but do not know where to start?
            Growth Studio helps you move from “I have an idea” to “I know what to do next.”
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Whether you want to start a tutoring service, clothing brand, podcast, food business, sports academy, tech startup,
            content channel, or community project, this guide helps you test your idea and build a practical plan.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Explore your idea</h3>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            Most ideas fail because people jump into execution before they understand the problem they are solving.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">What is your idea?</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">“I want to create a weekend coding club for high school learners.”</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">What problem are you solving?</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">“Many learners in my community do not have access to affordable coding education.”</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">Who are you helping?</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">“Students between 13 and 18 years old.”</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">What makes your solution unique?</h4>
              <p className="mt-2 text-sm leading-6 text-slate-700">“Affordable classes and practical projects taught by local mentors.”</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
            <h4 className="font-semibold text-black">Your next step</h4>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Talk to at least 5 people who fit your target audience and ask:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>Is this a real problem for you?</li>
              <li>How are you currently solving it?</li>
              <li>Would you use my solution?</li>
              <li>What would make it more useful?</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Idea validation</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            Before spending money, ask these questions:
          </p>
          <ul className="mt-4 space-y-3">
            {validationQuestions.map((question) => (
              <li key={question} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-600">
                  ✓
                </span>
                <span>{question}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-semibold text-black">Validation score</h4>
            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <strong className="block text-black">4–5 yes answers</strong>
                Strong idea, continue developing.
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <strong className="block text-black">2–3 yes answers</strong>
                Improve and test further.
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <strong className="block text-black">0–1 yes answers</strong>
                Revisit the problem being solved.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Practical next-step generator</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {nextSteps.map((step) => (
              <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="font-semibold text-black">{step.title}</h4>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {step.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Funding and support</h3>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            Funding should not be the first step. Start by proving that people want your idea.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">Bootstrapping</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                <li>Sell a service.</li>
                <li>Start small.</li>
                <li>Reinvest profits.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">Competitions and pitch challenges</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                <li>Problem statement</li>
                <li>Solution</li>
                <li>Target market</li>
                <li>Revenue model</li>
                <li>Impact story</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">Grants and development programmes</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                <li>Project proposal</li>
                <li>Expected outcomes</li>
                <li>Budget</li>
                <li>Sustainability plan</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Opportunity scanner</h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">Skills</h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li key={skill} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">Resources</h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {resources.map((resource) => (
                  <li key={resource} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-semibold text-black">Demand</h4>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                What do people around me constantly ask for help with?
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            Where your skills, resources, and demand overlap is often where your best opportunity exists.
          </p>
        </section>

        <section className="rounded-2xl border border-yellow-300 bg-yellow-50 p-5 shadow-card sm:p-6">
          <h3 className="text-xl font-bold text-black">Action challenge</h3>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-7 text-slate-800">
            <li>Identify one problem worth solving.</li>
            <li>Speak to at least 5 potential users.</li>
            <li>Create a one-page summary of your idea.</li>
            <li>Test the idea with real people.</li>
            <li>Record the feedback and decide your next step.</li>
          </ol>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            The goal is not to have the perfect idea. The goal is to take the next practical step toward making it real.
          </p>
        </section>
      </main>
    </div>
  );
}
