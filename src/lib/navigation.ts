import {
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardCheck,
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
    text: 'Money lessons and budgeting calculators are not active in this preview yet.',
    tag: 'MORE TO COME',
    focus: ['money'],
  },
  {
    href: '/app/growth',
    label: 'Growth Studio',
    shortLabel: 'Ideas',
    Icon: ChartNoAxesCombined,
    text: 'Business idea tools and verified funding listings are not connected yet.',
    tag: 'MORE TO COME',
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
    text: 'A dedicated career assessment is not active in this preview yet.',
    tag: 'NOT ACTIVE YET',
    focus: ['work', 'study'],
  },
  {
    href: '/app/employment/cv',
    label: 'CV builder',
    Icon: FileText,
    group: 'tools',
    text: 'The CV builder is not active in this preview yet.',
    tag: 'NOT ACTIVE YET',
    focus: ['work'],
  },
  {
    href: '/app/employment/interview',
    label: 'Interview coach',
    Icon: MessageCircle,
    group: 'tools',
    text: 'Interview practice is not active in this preview yet.',
    tag: 'NOT ACTIVE YET',
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
    text: 'Verified courses, learnerships, and university deadlines are not connected yet.',
    tag: 'MORE TO COME',
    focus: ['study'],
  },
] as const;

export const employmentToolDirectory = [
  ...employmentNavigation.filter((item): item is typeof item & { text: string; tag: string; focus: readonly string[] } => 'text' in item)
    .map(({ href, label: title, Icon, text, tag, focus }) => ({ href, title, Icon, text, tag, focus })),
  ...workspaceNavigation.filter((item): item is typeof item & { text: string; tag: string; focus: readonly string[] } => 'text' in item)
    .map(({ href, label: title, Icon, text, tag, focus }) => ({ href, title, Icon, text, tag, focus })),
] as const;
