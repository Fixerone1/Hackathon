import {
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardCheck,
  ContactRound,
  FileText,
  LayoutDashboard,
  Lightbulb,
  MessageCircle,
  Route,
  UserRound,
} from 'lucide-react';

export const workspaceNavigation = [
  { href: '/app', label: 'Home', shortLabel: 'Home', Icon: LayoutDashboard },
  { href: '/app/employment', label: 'Work', shortLabel: 'Work', Icon: BriefcaseBusiness },
  {
    href: '/app/money',
    label: 'Money Skills',
    shortLabel: 'Money',
    Icon: Banknote,
    text: 'Plan a budget, explore take-home pay, and practise everyday money decisions.',
    tag: 'MONEY TOOLS',
    focus: ['money'],
  },
  {
    href: '/app/growth',
    label: 'Growth Studio',
    shortLabel: 'Ideas',
    Icon: ChartNoAxesCombined,
    text: 'Shape a business idea into a practical test and a next step.',
    tag: 'IDEA WORKSHOP',
    focus: ['business'],
  },
  { href: '/app/profile', label: 'Profile', shortLabel: 'Profile', Icon: UserRound },
] as const;

export const employmentNavigation = [
  { href: '/app/employment', label: 'Overview', Icon: BriefcaseBusiness, group: 'main' },
  {
    href: '/app/employment/opportunities',
    label: 'Opportunities',
    Icon: BriefcaseBusiness,
    group: 'main',
    text: 'Browse verified listings when they are available and open the original advert.',
    tag: 'LISTINGS MAY VARY',
    focus: ['work', 'business'],
  },
  { href: '/app/employment/applications', label: 'My opportunities', Icon: ClipboardCheck, group: 'main' },
  {
    href: '/app/employment/assessment',
    label: 'Skills assessment',
    Icon: ClipboardCheck,
    group: 'tools',
    text: 'Reflect on your work-readiness strengths and choose a growth area.',
    tag: 'SKILLS CHECK',
    focus: ['work', 'study'],
  },
  {
    href: '/app/employment/cv',
    label: 'CV builder',
    Icon: FileText,
    group: 'tools',
    text: 'Build a tailored CV from your profile and export an editable document.',
    tag: 'CV TOOL',
    focus: ['work'],
  },
  {
    href: '/app/passport',
    label: 'Skills Passport',
    Icon: ContactRound,
    group: 'tools',
    text: 'Create a shareable portfolio with evidence you choose to show employers.',
    tag: 'SHAREABLE PORTFOLIO',
    focus: ['work'],
  },
  {
    href: '/app/employment/interview',
    label: 'Interview coach',
    Icon: MessageCircle,
    group: 'tools',
    text: 'Practise interview answers and review them with the STAR structure.',
    tag: 'PRACTICE',
    focus: ['work'],
  },
  {
    href: '/app/employment/academy',
    label: 'Skills Academy',
    Icon: BookOpen,
    group: 'tools',
    text: 'Build practical work-readiness skills through short lessons and knowledge checks.',
    tag: 'PRACTICE LESSONS',
    focus: ['study', 'work'],
  },
  {
    href: '/app/employment/pathways',
    label: 'Study & career pathways',
    Icon: Route,
    group: 'tools',
    text: 'Build a goal-led plan and verify requirements before choosing a course or opportunity.',
    tag: 'PATHWAY PLANNER',
    focus: ['study'],
  },
] as const;

export const employmentToolDirectory = [
  ...employmentNavigation.filter((item): item is typeof item & { text: string; tag: string; focus: readonly string[] } => 'text' in item)
    .map(({ href, label: title, Icon, text, tag, focus }) => ({ href, title, Icon, text, tag, focus })),
  ...workspaceNavigation.filter((item): item is typeof item & { text: string; tag: string; focus: readonly string[] } => 'text' in item)
    .map(({ href, label: title, Icon, text, tag, focus }) => ({ href, title, Icon, text, tag, focus })),
] as const;
