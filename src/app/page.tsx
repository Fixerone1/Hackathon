import Link from 'next/link';
import { Fragment } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  CircleDollarSign,
  Compass,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageCircle,
  Route,
  Sparkles,
} from 'lucide-react';
import { PublicShell } from '@/components/PublicShell';
import { SiteSearch } from '@/components/SiteSearch';

const tools = [
  { icon: ClipboardCheck, title: 'Skills assessment', text: 'See your strengths and choose what to grow next.', href: '/app/employment/assessment', tag: 'KNOW YOUR STRENGTHS' },
  { icon: FileText, title: 'CV Builder', text: 'Get your experience and skills ready to share.', href: '/app/employment/cv', tag: 'TELL YOUR STORY' },
  { icon: MessageCircle, title: 'Interview Coach', text: 'Get ready to show up with confidence.', href: '/app/employment/interview', tag: 'PREPARE FOR WORK' },
  { icon: BookOpen, title: 'Skills Academy', text: 'Explore practical activities to build your skills.', href: '/app/employment/academy', tag: 'KEEP LEARNING' },
  { icon: BriefcaseBusiness, title: 'Opportunities', text: 'Browse verified listings and keep track of your next move.', href: '/app/employment/opportunities', tag: 'FIND YOUR OPENING' },
  { icon: Route, title: 'Study & career pathways', text: 'Explore routes that can take you towards your goals.', href: '/app/employment/pathways', tag: 'PLAN WHAT’S NEXT' },
  { icon: Banknote, title: 'Money Skills', text: 'Build confidence with budgets, savings, and everyday choices.', href: '/app/money', tag: 'OWN YOUR MONEY' },
  { icon: Lightbulb, title: 'Growth Studio', text: 'Shape a business idea into a small first experiment.', href: '/app/growth', tag: 'START AN IDEA' },
];

const journeySteps = [
  {
    number: '01',
    icon: Compass,
    title: 'Find your direction',
    text: 'Get clear on what matters to you, what you already bring, and what you want to do next.',
    detail: 'Your goals, your pace',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Build your toolkit',
    text: 'Grow practical skills, strengthen your CV, and get more confident with money decisions.',
    detail: 'Skills for real life',
  },
  {
    number: '03',
    icon: ArrowRight,
    title: 'Make your next move',
    text: 'Explore opportunities, test an idea, or take a small step towards the future you want.',
    detail: 'Progress you can own',
  },
];

const pathways = [
  {
    icon: GraduationCap,
    tag: 'STUDY FURTHER',
    title: 'Turn “maybe one day” into a plan.',
    text: 'Explore pathways, recognise your strengths, and map a practical next step towards further study.',
    prompt: 'Your next chapter can start now.',
    image: '/images/careerforge-students.jpg',
    imageAlt: 'Students sharing ideas around a laptop in a library',
  },
  {
    icon: Lightbulb,
    tag: 'START SOMETHING',
    title: 'Got an idea? Give it a first step.',
    text: 'Shape a business idea, think through who it could help, and choose one small thing to test.',
    prompt: 'Big ideas grow from small moves.',
    image: '/images/careerforge-founders.jpg',
    imageAlt: 'A Black woman and colleague working together at a computer',
  },
  {
    icon: BriefcaseBusiness,
    tag: 'NEW JOB, NEW GOALS',
    title: 'Make your money work for you.',
    text: 'Build everyday money confidence, set a savings goal, and feel more in control of your next pay day.',
    prompt: 'Your first pay is a fresh start.',
    image: '/images/careerforge-people.jpg',
    imageAlt: 'A diverse group of young people smiling together',
  },
];

export default function HomePage() {
  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden bg-white text-midnight">
        <div aria-hidden="true" className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full border-[48px] border-sunshine-light" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-midnight">
              <span className="h-2 w-2 rounded-full bg-sunshine-dark" aria-hidden="true" />
              Made for your next move
            </p>
            <h1 className="mt-6 text-[2.65rem] font-bold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.25rem]">
              Your future is
              <span className="block"><span className="bg-sunshine px-2 text-midnight">yours to build.</span></span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-midnight sm:text-lg sm:leading-8">
              Whether you’re thinking about studying further, starting a business, or finding your feet in a new job, your next step deserves a plan that starts with you.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/signup" className="btn-primary w-full sm:w-fit">
                Start building your next step <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/how-it-works" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#d9d9d9] px-4 py-2 text-sm font-semibold text-midnight transition hover:border-sunshine-dark hover:bg-sunshine-light">
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-xs text-midnight">A practical starting point for young South Africans. Go at your own pace.</p>
          </div>

          <div className="relative mx-auto w-full max-w-[570px] lg:justify-self-end">
            <div aria-hidden="true" className="absolute -inset-3 rotate-2 rounded-[2rem] bg-sunshine sm:-inset-4" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#e5e5e5] bg-white p-2 shadow-[0_18px_48px_rgba(0,0,0,0.12)] sm:p-3">
              <div className="grid grid-cols-[1.2fr_0.8fr] grid-rows-2 gap-2 overflow-hidden rounded-[1.25rem] sm:gap-3">
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/careerforge-people.jpg`}
                  alt="A diverse group of young people smiling together"
                  width={519}
                  height={345}
                  className="row-span-2 h-full min-h-[15rem] w-full object-cover sm:min-h-[23rem]"
                />
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/careerforge-students.jpg`}
                  alt="Students sharing ideas around a laptop in a library"
                  width={1000}
                  height={667}
                  className="h-full min-h-[7.25rem] w-full object-cover sm:min-h-[11rem]"
                />
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/careerforge-founders.jpg`}
                  alt="A Black woman and colleague working together at a computer"
                  width={1000}
                  height={667}
                  className="h-full min-h-[7.25rem] w-full object-cover sm:min-h-[11rem]"
                />
              </div>
              <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-sunshine px-4 py-2 text-xs font-bold text-midnight shadow-sm sm:left-6 sm:top-6">
                Your journey. Your way.
              </span>
              <div className="grid gap-3 bg-white p-4 sm:grid-cols-3 sm:gap-2 sm:p-5">
                {[
                  { icon: GraduationCap, label: 'Study further' },
                  { icon: Lightbulb, label: 'Grow an idea' },
                  { icon: CircleDollarSign, label: 'Own your money' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-midnight sm:flex-col sm:items-start sm:gap-2 sm:px-3 sm:py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sunshine">
                      <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-2 hidden items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm font-semibold text-midnight shadow-lg sm:flex lg:-left-8">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sunshine"><Check size={15} strokeWidth={3} aria-hidden="true" /></span>
              Small steps count.
            </div>
          </div>
        </div>
      </section>

      <div className="bg-white px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
        <SiteSearch />
      </div>

      <section id="tools" className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20" aria-labelledby="tools-heading">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Your toolkit, all in one place</p>
            <h2 id="tools-heading" className="section-heading mt-2 text-2xl sm:text-3xl">Find the tool for your next move.</h2>
            <p className="section-description">Explore career, study, business, and money tools. Create an account to open your learner workspace; current availability is shown on each tool page.</p>
          </div>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map(({ icon: Icon, title, text, href, tag }, index) => {
              const featured = index === 1 || index === 6;
              return (
                <Link key={title} href={href} className={`group flex min-h-48 flex-col rounded-3xl border p-4 transition hover:-translate-y-1 hover:border-sunshine-dark hover:shadow-[0_10px_28px_rgba(34,34,34,0.1)] focus-visible:ring-2 focus-visible:ring-sunshine-dark sm:p-5 ${featured ? 'border-sunshine bg-sunshine' : 'border-[#e5e5e5] bg-white'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-[0.12em] text-midnight">{tag}</span>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${featured ? 'bg-white' : 'bg-sunshine'}`}>
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-midnight">{title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-5 text-midnight">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-midnight group-hover:underline">
                    Explore tool <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-[#e5e5e5] bg-white px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20" aria-labelledby="journey-heading">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">No one-size-fits-all route</p>
            <h2 id="journey-heading" className="mt-3 text-3xl font-bold leading-tight tracking-tight text-midnight sm:text-4xl">
              Big goals. <span className="underline decoration-sunshine decoration-[6px] underline-offset-4">One step at a time.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-midnight sm:text-base sm:leading-7">
              Start wherever you are. Build momentum with practical steps you can come back to whenever you’re ready.
            </p>
          </div>

          <ol className="mt-9 flex flex-col items-stretch gap-2 md:mt-12 md:flex-row md:items-center md:gap-3">
            {journeySteps.map(({ number, icon: Icon, title, text, detail }, index) => (
              <Fragment key={number}>
                <li className="flex-1">
                  <article className="relative h-full rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-[0_8px_26px_rgba(34,34,34,0.05)] transition-transform hover:-translate-y-1 sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold tracking-[0.18em] text-midnight">STEP {number}</span>
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-sunshine text-midnight">
                        <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-midnight">{title}</h3>
                    <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-midnight">{text}</p>
                    <p className="mt-4 border-t border-slate-100 pt-3 text-xs font-semibold uppercase tracking-wide text-midnight">{detail}</p>
                  </article>
                </li>
                {index < journeySteps.length - 1 && (
                  <li aria-hidden="true" className="flex h-9 shrink-0 items-center justify-center text-sunshine-dark md:h-auto md:w-12">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-sunshine md:h-10 md:w-10">
                      <ArrowRight size={20} strokeWidth={2.5} className="hidden md:block" />
                      <ArrowDown size={20} strokeWidth={2.5} className="md:hidden" />
                    </span>
                  </li>
                )}
              </Fragment>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Link href="/signup" className="btn-primary">
              Take your first step <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20" aria-labelledby="pathways-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Whatever your next move looks like</p>
            <h2 id="pathways-heading" className="section-heading mt-2 text-2xl sm:text-3xl">There’s more than one way forward.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-midnight">Pick the path that feels most like you today. You can explore the others whenever you like.</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3 md:gap-5">
          {pathways.map(({ icon: Icon, tag, title, text, prompt, image, imageAlt }, index) => (
            <article key={tag} className={`flex h-full flex-col overflow-hidden rounded-3xl border border-[#e5e5e5] bg-white shadow-[0_8px_26px_rgba(34,34,34,0.05)] ${index === 1 ? 'md:-translate-y-2' : ''}`}>
              <div className="relative h-44 overflow-hidden sm:h-52">
                <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${image}`} alt={imageAlt} loading="lazy" width={1000} height={667} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                <span className="absolute bottom-3 left-3 rounded-full bg-sunshine px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-midnight">{tag}</span>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-full ${index === 1 ? 'bg-midnight text-sunshine' : 'bg-sunshine text-midnight'}`}>
                    <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold leading-snug text-midnight">{title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-midnight">{text}</p>
                <p className="mt-5 border-t border-slate-100 pt-4 text-sm font-semibold text-midnight">{prompt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20" aria-labelledby="cta-heading">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] bg-sunshine px-6 py-9 sm:px-10 sm:py-12 lg:px-14">
          <div aria-hidden="true" className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[32px] border-black/[0.06]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-black/65">Your next chapter starts somewhere</p>
              <h2 id="cta-heading" className="mt-2 text-2xl font-bold leading-tight tracking-tight text-midnight sm:text-3xl">Make today your starting point.</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-black/70 sm:text-base">Create your learner profile and start turning what matters to you into a plan.</p>
            </div>
            <Link href="/signup" className="btn min-h-12 w-full shrink-0 rounded-xl bg-sunshine px-5 text-midnight hover:bg-[#f0d600] md:w-auto">
              Get started <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
