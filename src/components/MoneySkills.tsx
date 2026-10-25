'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Award, Banknote, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight,
  CircleHelp, Download, Heart, Lightbulb, PiggyBank, ShieldCheck, Sparkles, Target, Trash2,
  TrendingDown, TrendingUp, Wallet,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { calculateMonthlyBudget, type BudgetAmounts } from '@/lib/money/budget';
import {
  estimateStipendTakeHome, formatRand, parseRandToCents,
  type AgeGroup, type PayPeriod, type TaxEstimate,
} from '@/lib/money/tax';
import { taxTables2026_27 } from '@/lib/money/tax-tables-2026-27';
import { moneyLessons } from '@/lib/money/lessons';
import { moneyConfidenceScore } from '@/lib/scoring';

type MoneyTab = 'overview' | 'salary' | 'goals' | 'lessons';
type GoalType = 'Emergency fund' | 'Study' | 'Transport/licence' | 'Laptop/phone' | 'Business start-up' | 'Other';
type Plan = {
  grossCents: number;
  period: PayPeriod;
  hoursPerWeek: number;
  ageGroup: AgeGroup;
  retirementContributionCents: number;
  medicalAidMembers: number;
  isStipend: boolean;
  paydayDay: number;
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
  budget: BudgetAmounts;
  offerA: { grossCents: number; transportCents: number; commuteMinutes: number };
  offerB: { grossCents: number; transportCents: number; commuteMinutes: number };
  savedAt: string;
};
type Goal = {
  id: string;
  name: string;
  type: GoalType;
  target_amount: number;
  target_date: string;
  starting_amount: number;
  archived: boolean;
  created_at: string;
};
type Contribution = {
  id: string;
  goal_id: string;
  amount: number;
  contributed_on: string;
  note: string;
};
type EmailNudges = {
  payday_reminders: boolean;
  money_goal_reminders: boolean;
  money_lesson_reminders: boolean;
  bursary_deadline_reminders: boolean;
};

const moneyTabLabels: Record<MoneyTab, string> = {
  overview: 'Overview',
  salary: 'Salary planner',
  goals: 'Savings goals',
  lessons: 'Lessons',
};

const emptyBudget: BudgetAmounts = {
  rentCents: 0,
  transportCents: 0,
  foodCents: 0,
  airtimeCents: 0,
  familySupportCents: 0,
  debtRepaymentsCents: 0,
  subscriptionsCents: 0,
};

const emptyPlan: Plan = {
  grossCents: 0,
  period: 'monthly',
  hoursPerWeek: 40,
  ageGroup: 'under65',
  retirementContributionCents: 0,
  medicalAidMembers: 0,
  isStipend: false,
  paydayDay: 25,
  needsPercent: 50,
  wantsPercent: 30,
  savingsPercent: 20,
  budget: emptyBudget,
  offerA: { grossCents: 0, transportCents: 0, commuteMinutes: 0 },
  offerB: { grossCents: 0, transportCents: 0, commuteMinutes: 0 },
  savedAt: '',
};

const goalTypes: GoalType[] = [
  'Emergency fund', 'Study', 'Transport/licence', 'Laptop/phone', 'Business start-up', 'Other',
];

function safePlan(value: unknown): Plan {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyPlan;
  const candidate = value as Partial<Plan>;
  const integer = (input: unknown, fallback = 0) => Number.isSafeInteger(input) && Number(input) >= 0 ? Number(input) : fallback;
  const budget = candidate.budget && typeof candidate.budget === 'object' ? candidate.budget : emptyBudget;
  const offer = (input: unknown) => {
    const row = input && typeof input === 'object' ? input as Record<string, unknown> : {};
    return {
      grossCents: integer(row.grossCents),
      transportCents: integer(row.transportCents),
      commuteMinutes: integer(row.commuteMinutes),
    };
  };
  const period = ['monthly', 'annual', 'weekly', 'hourly'].includes(candidate.period || '') ? candidate.period! : 'monthly';
  const ageGroup = ['under65', 'age65to74', 'age75plus'].includes(candidate.ageGroup || '') ? candidate.ageGroup! : 'under65';
  return {
    ...emptyPlan,
    grossCents: integer(candidate.grossCents),
    period,
    hoursPerWeek: Math.min(168, Math.max(1, integer(candidate.hoursPerWeek, 40))),
    ageGroup,
    retirementContributionCents: integer(candidate.retirementContributionCents),
    medicalAidMembers: Math.min(20, integer(candidate.medicalAidMembers)),
    isStipend: candidate.isStipend === true,
    paydayDay: Math.min(31, Math.max(1, integer(candidate.paydayDay, 25))),
    needsPercent: integer(candidate.needsPercent, 50),
    wantsPercent: integer(candidate.wantsPercent, 30),
    savingsPercent: integer(candidate.savingsPercent, 20),
    budget: {
      rentCents: integer((budget as BudgetAmounts).rentCents),
      transportCents: integer((budget as BudgetAmounts).transportCents),
      foodCents: integer((budget as BudgetAmounts).foodCents),
      airtimeCents: integer((budget as BudgetAmounts).airtimeCents),
      familySupportCents: integer((budget as BudgetAmounts).familySupportCents),
      debtRepaymentsCents: integer((budget as BudgetAmounts).debtRepaymentsCents),
      subscriptionsCents: integer((budget as BudgetAmounts).subscriptionsCents),
    },
    offerA: offer(candidate.offerA),
    offerB: offer(candidate.offerB),
    savedAt: typeof candidate.savedAt === 'string' ? candidate.savedAt : '',
  };
}

function currencyInput(cents: number) {
  return cents > 0 ? (cents / 100).toFixed(2) : '';
}

function monthlyTakeHome(plan: Plan): TaxEstimate | null {
  if (!plan.grossCents) return null;
  try {
    return estimateStipendTakeHome({
      grossCents: plan.grossCents,
      period: plan.period,
      hoursPerWeek: plan.hoursPerWeek,
      ageGroup: plan.ageGroup,
      retirementContributionCents: plan.retirementContributionCents,
      medicalAidMembers: plan.medicalAidMembers,
      isStipend: plan.isStipend,
    });
  } catch {
    return null;
  }
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthsRemaining(dateString: string, now = new Date()) {
  const date = new Date(`${dateString}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || date <= now) return 0;
  return Math.max(1, (date.getFullYear() - now.getFullYear()) * 12 + date.getMonth() - now.getMonth()
    + (date.getDate() >= now.getDate() ? 1 : 0));
}

function streakMonths(contributions: Contribution[]) {
  const months = new Set(contributions.map(({ contributed_on }) => contributed_on.slice(0, 7)));
  const cursor = new Date();
  let streak = 0;
  while (months.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)) {
    streak += 1;
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return streak;
}

function currentMonthPace(contributions: Contribution[]) {
  const recent = contributions.filter(({ contributed_on }) => {
    const date = new Date(`${contributed_on}T12:00:00`);
    return date >= new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1);
  });
  return recent.reduce((sum, item) => sum + item.amount, 0) / 3;
}

function goalProgress(goal: Goal, contributions: Contribution[]) {
  const related = contributions.filter((item) => item.goal_id === goal.id);
  const savedCents = goal.starting_amount + related.reduce((sum, item) => sum + item.amount, 0);
  const remainingCents = Math.max(0, goal.target_amount - savedCents);
  const remainingMonths = monthsRemaining(goal.target_date);
  const requiredMonthlyCents = remainingMonths > 0 ? Math.ceil(remainingCents / remainingMonths) : remainingCents;
  const created = new Date(goal.created_at);
  const target = new Date(`${goal.target_date}T12:00:00`);
  const elapsedRatio = target > created
    ? Math.min(1, Math.max(0, (Date.now() - created.getTime()) / (target.getTime() - created.getTime())))
    : 1;
  const expectedToDate = Math.round(goal.target_amount * elapsedRatio);
  const status = savedCents >= goal.target_amount ? 'Achieved'
    : savedCents < expectedToDate ? 'Behind'
      : savedCents > expectedToDate + requiredMonthlyCents ? 'Ahead'
        : 'On track';
  const pace = currentMonthPace(related);
  const projected = remainingCents === 0 ? new Date()
    : pace > 0 ? new Date(new Date().getFullYear(), new Date().getMonth() + Math.ceil(remainingCents / pace), 1)
      : null;
  const milestones = [25, 50, 75, 100].filter((milestone) => savedCents * 100 >= goal.target_amount * milestone);
  return {
    savedCents,
    remainingCents,
    requiredMonthlyCents,
    status,
    progressPercent: goal.target_amount > 0 ? Math.min(100, Math.round(savedCents * 100 / goal.target_amount)) : 0,
    streak: streakMonths(related),
    projected,
    milestones,
    contributions: related,
  };
}

function goalCardImage(goal: Goal, progress: ReturnType<typeof goalProgress>, showAmount: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot create a share card image.');
  context.fillStyle = '#FFC400';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#0A0A0A';
  context.font = 'bold 36px sans-serif';
  context.fillText('UKUKHANYA · MY SAVINGS GOAL', 84, 106);
  context.font = 'bold 72px sans-serif';
  context.fillText(goal.name.slice(0, 28), 84, 240);
  context.font = '500 44px sans-serif';
  context.fillText(`${progress.progressPercent}% there`, 84, 340);
  context.font = '500 32px sans-serif';
  context.fillText(showAmount ? `${formatRand(progress.savedCents)} saved of ${formatRand(goal.target_amount)}` : 'Small steps add up.', 84, 420);
  context.fillText('One step at a time.', 84, 520);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ukukhanya-savings-goal.png';
    anchor.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function MoneyAmountField({
  label,
  amount,
  onChange,
  hint,
}: {
  label: string;
  amount: number;
  onChange: (cents: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label className="label">{label}
        <span className="mt-1 block">
          <span className="sr-only">Amount in rand</span>
          <input type="number" inputMode="decimal" min="0" max="10000000" step="0.01" className="input" value={currencyInput(amount)} onChange={(event) => {
            const value = event.currentTarget.value;
            const cents = value === '' ? 0 : Math.round(Number(value) * 100);
            if (Number.isSafeInteger(cents) && cents >= 0) onChange(cents);
          }} />
        </span>
      </label>
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

export function MoneySkills() {
  const [tab, setTab] = useState<MoneyTab>('overview');
  const [plan, setPlan] = useState<Plan>(emptyPlan);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [emailNudges, setEmailNudges] = useState<EmailNudges>({
    payday_reminders: false,
    money_goal_reminders: false,
    money_lesson_reminders: false,
    bursary_deadline_reminders: false,
  });
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('there');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');
  const [importedMessage, setImportedMessage] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('Emergency fund');
  const [goalTarget, setGoalTarget] = useState(50_000);
  const [goalStarting, setGoalStarting] = useState(0);
  const [goalDate, setGoalDate] = useState(() => localDateKey(new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate())));
  const [contributionGoalId, setContributionGoalId] = useState('');
  const [contributionAmount, setContributionAmount] = useState(0);
  const [contributionDate, setContributionDate] = useState(() => localDateKey(new Date()));
  const [contributionNote, setContributionNote] = useState('');
  const [editingContribution, setEditingContribution] = useState('');
  const [editAmount, setEditAmount] = useState(0);
  const [shareAmounts, setShareAmounts] = useState<Record<string, boolean>>({});
  const [celebration, setCelebration] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizMessage, setQuizMessage] = useState('');
  const [coachQuestion, setCoachQuestion] = useState('');
  const [coachAnswer, setCoachAnswer] = useState('');
  const [coachBusy, setCoachBusy] = useState(false);
  const [whatIfCents, setWhatIfCents] = useState(0);

  const takeHome = useMemo(() => monthlyTakeHome(plan), [plan]);
  const budget = useMemo(
    () => calculateMonthlyBudget(takeHome?.monthlyNetCents || 0, plan.budget),
    [takeHome, plan.budget],
  );
  const activeGoals = goals.filter((goal) => !goal.archived);
  const goalSnapshots = activeGoals.map((goal) => ({ goal, progress: goalProgress(goal, contributions) }));
  const onTrackGoals = goalSnapshots.filter(({ progress }) => progress.status === 'On track' || progress.status === 'Ahead' || progress.status === 'Achieved').length;
  const recentContribution = contributions.some(({ contributed_on }) => {
    const date = new Date(`${contributed_on}T12:00:00`);
    return Number.isFinite(date.getTime()) && date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  });
  const confidence = moneyConfidenceScore({
    salaryPlanCompleted: Boolean(plan.savedAt && plan.grossCents),
    goalCreated: activeGoals.length > 0,
    contributionWithin30Days: recentContribution,
    lessonsCompleted: completedLessons.length,
    totalLessons: moneyLessons.length,
  });
  const nextLessonIndex = Math.min(completedLessons.length, moneyLessons.length - 1);
  const activeLesson = moneyLessons.find((lesson) => lesson.id === activeLessonId);

  const load = useCallback(async () => {
    try {
      setError('');
      const supabase = getSupabase();
      const [{ data: authData, error: authError }, planResult, goalResult, contributionResult, lessonResult, emailResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('money_plans').select('plan_data').maybeSingle(),
        supabase.from('savings_goals').select('id,name,type,target_amount,target_date,starting_amount,archived,created_at').order('created_at', { ascending: false }),
        supabase.from('goal_contributions').select('id,goal_id,amount,contributed_on,note').order('contributed_on', { ascending: false }),
        supabase.from('money_lesson_completions').select('lesson_id'),
        supabase.from('email_preferences').select('payday_reminders,money_goal_reminders,money_lesson_reminders,bursary_deadline_reminders').maybeSingle(),
      ]);
      if (authError || !authData.user) throw new Error('Sign in again to use Money Skills.');
      const queryError = planResult.error || goalResult.error || contributionResult.error || lessonResult.error || emailResult.error;
      if (queryError) throw queryError;
      setUserId(authData.user.id);
      const name = authData.user.user_metadata?.name || authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'there';
      setFirstName(typeof name === 'string' ? name.split(/\s+/)[0] : 'there');
      const loadedPlan = safePlan(planResult.data?.plan_data);
      const params = new URLSearchParams(window.location.search);
      const importedGross = params.get('gross');
      if (importedGross) {
        try {
          loadedPlan.grossCents = parseRandToCents(importedGross);
          loadedPlan.period = 'monthly';
          loadedPlan.isStipend = params.get('stipend') === '1';
          loadedPlan.savedAt = '';
          setTab('salary');
          setImportedMessage('Listed monthly pay added for comparison. Confirm the details against the original advert.');
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : 'The listed pay could not be added.');
        }
      }
      setPlan(loadedPlan);
      setGoals((goalResult.data || []) as Goal[]);
      setContributions((contributionResult.data || []) as Contribution[]);
      setCompletedLessons(((lessonResult.data || []) as { lesson_id: string }[]).map(({ lesson_id }) => lesson_id));
      setEmailNudges({
        payday_reminders: emailResult.data?.payday_reminders === true,
        money_goal_reminders: emailResult.data?.money_goal_reminders === true,
        money_lesson_reminders: emailResult.data?.money_lesson_reminders === true,
        bursary_deadline_reminders: emailResult.data?.bursary_deadline_reminders === true,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Money Skills could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('tab');
    if (requested === 'salary' || requested === 'goals' || requested === 'lessons' || requested === 'overview') setTab(requested);
  }, []);

  function chooseTab(next: MoneyTab) {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', next);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }

  function changePlan<K extends keyof Plan>(key: K, value: Plan[K]) {
    setPlan((current) => ({ ...current, [key]: value, savedAt: '' }));
    setSaveMessage('');
  }

  function changeBudget(key: keyof BudgetAmounts, value: number) {
    setPlan((current) => ({ ...current, budget: { ...current.budget, [key]: value }, savedAt: '' }));
    setSaveMessage('');
  }

  function changeOffer(which: 'offerA' | 'offerB', key: 'grossCents' | 'transportCents' | 'commuteMinutes', value: number) {
    setPlan((current) => ({ ...current, [which]: { ...current[which], [key]: value }, savedAt: '' }));
  }

  async function savePlan() {
    if (!userId) return;
    if (plan.grossCents <= 0 || !takeHome) {
      setError('Enter valid gross pay to calculate and save your plan.');
      return;
    }
    if (plan.needsPercent + plan.wantsPercent + plan.savingsPercent !== 100) {
      setError('Your needs, wants and savings percentages must add up to 100%.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const saved = { ...plan, savedAt: new Date().toISOString() };
      const { error: saveError } = await getSupabase().from('money_plans').upsert({
        user_id: userId,
        plan_data: saved,
      }, { onConflict: 'user_id' });
      if (saveError) throw saveError;
      setPlan(saved);
      setSaveMessage('Your salary and budget plan is saved privately to your account.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your plan could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function saveNudgePreferences(key: keyof EmailNudges, enabled: boolean) {
    if (!userId) return;
    const updated = { ...emailNudges, [key]: enabled };
    setEmailNudges(updated);
    setError('');
    try {
      const now = enabled ? new Date().toISOString() : null;
      const { error: saveError } = await getSupabase().from('email_preferences').upsert({
        user_id: userId,
        ...updated,
        payday_reminders_consented_at: key === 'payday_reminders' ? now : undefined,
        money_goal_reminders_consented_at: key === 'money_goal_reminders' ? now : undefined,
        money_lesson_reminders_consented_at: key === 'money_lesson_reminders' ? now : undefined,
        bursary_deadline_reminders_consented_at: key === 'bursary_deadline_reminders' ? now : undefined,
      }, { onConflict: 'user_id' });
      if (saveError) throw saveError;
      setSaveMessage(enabled ? 'Your reminder preference was saved.' : 'Email reminders are turned off.');
    } catch (caught) {
      setEmailNudges((current) => ({ ...current, [key]: !enabled }));
      setError(caught instanceof Error ? caught.message : 'Your reminder preference could not be saved.');
    }
  }

  async function createGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !goalName.trim() || goalTarget <= 0 || goalStarting > goalTarget) {
      setError('Add a goal name and a valid target. The starting amount cannot exceed your target.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data, error: saveError } = await getSupabase().from('savings_goals').insert({
        user_id: userId,
        name: goalName.trim(),
        type: goalType,
        target_amount: goalTarget,
        target_date: goalDate,
        starting_amount: goalStarting,
      }).select('id,name,type,target_amount,target_date,starting_amount,archived,created_at').single();
      if (saveError) throw saveError;
      setGoals((current) => [data as Goal, ...current]);
      setGoalName('');
      setGoalType('Emergency fund');
      setGoalTarget(50_000);
      setGoalStarting(0);
      setShowGoalForm(false);
      setSaveMessage('Your savings goal is ready. Small, regular contributions count.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your goal could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function addContribution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !contributionGoalId || contributionAmount <= 0) {
      setError('Choose a goal and enter a contribution greater than R0.');
      return;
    }
    setBusy(true);
    setError('');
    setCelebration(false);
    try {
      const before = goals.find((goal) => goal.id === contributionGoalId);
      const wasComplete = before ? goalProgress(before, contributions).progressPercent >= 100 : false;
      const { data, error: saveError } = await getSupabase().from('goal_contributions').insert({
        user_id: userId,
        goal_id: contributionGoalId,
        amount: contributionAmount,
        contributed_on: contributionDate,
        note: contributionNote.trim(),
      }).select('id,goal_id,amount,contributed_on,note').single();
      if (saveError) throw saveError;
      const nextContributions = [data as Contribution, ...contributions];
      setContributions(nextContributions);
      const after = before ? goalProgress(before, nextContributions) : null;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || localStorage.getItem('careerforge-accessibility')?.includes('"reduceMotion":true');
      if (!reducedMotion && after?.progressPercent === 100 && !wasComplete) setCelebration(true);
      setContributionGoalId('');
      setContributionAmount(0);
      setContributionNote('');
      setSaveMessage('Contribution logged. Nice work keeping your goal moving.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your contribution could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function updateContribution(item: Contribution) {
    if (editAmount <= 0) {
      setError('Contribution must be greater than R0.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: saveError } = await getSupabase().from('goal_contributions')
        .update({ amount: editAmount }).eq('id', item.id).eq('user_id', userId);
      if (saveError) throw saveError;
      setContributions((current) => current.map((row) => row.id === item.id ? { ...row, amount: editAmount } : row));
      setEditingContribution('');
      setSaveMessage('Contribution updated.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Contribution could not be updated.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteContribution(item: Contribution) {
    if (!window.confirm('Undo this contribution entry?')) return;
    setBusy(true);
    setError('');
    try {
      const { error: saveError } = await getSupabase().from('goal_contributions').delete().eq('id', item.id).eq('user_id', userId);
      if (saveError) throw saveError;
      setContributions((current) => current.filter((row) => row.id !== item.id));
      setSaveMessage('Contribution entry removed.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Contribution could not be removed.');
    } finally {
      setBusy(false);
    }
  }

  async function archiveGoal(goal: Goal) {
    if (!window.confirm(`Archive “${goal.name}”? You can still export your account data.`)) return;
    setBusy(true);
    setError('');
    try {
      const { error: saveError } = await getSupabase().from('savings_goals').update({ archived: true }).eq('id', goal.id).eq('user_id', userId);
      if (saveError) throw saveError;
      setGoals((current) => current.map((item) => item.id === goal.id ? { ...item, archived: true } : item));
      setSaveMessage('Goal archived.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Goal could not be archived.');
    } finally {
      setBusy(false);
    }
  }

  async function completeLesson(lessonId: string) {
    const lesson = moneyLessons.find((item) => item.id === lessonId);
    if (!lesson || quizAnswers.length !== lesson.quiz.length || quizAnswers.some((answer) => answer < 0)) {
      setQuizMessage('Answer every question before checking your result.');
      return;
    }
    const correct = lesson.quiz.reduce((sum, question, index) => sum + (quizAnswers[index] === question.answer ? 1 : 0), 0);
    if (correct / lesson.quiz.length < 0.7) {
      setQuizMessage(`You got ${correct} of ${lesson.quiz.length}. Review the lesson and try again; 70% is needed to complete it.`);
      return;
    }
    setBusy(true);
    setQuizMessage('');
    setError('');
    try {
      const { error: saveError } = await getSupabase().from('money_lesson_completions').upsert({
        user_id: userId,
        lesson_id: lesson.id,
        quiz_correct: correct,
        quiz_total: lesson.quiz.length,
      }, { onConflict: 'user_id,lesson_id' });
      if (saveError) throw saveError;
      setCompletedLessons((current) => [...new Set([...current, lesson.id])]);
      setQuizMessage(`Lesson complete: ${correct} of ${lesson.quiz.length} correct. Your Money confidence score has been updated.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Lesson completion could not be saved.');
    } finally {
      setBusy(false);
    }
  }

  async function askCoach(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!coachQuestion.trim()) return;
    setCoachBusy(true);
    setCoachAnswer('');
    setError('');
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'financial-coach',
          payload: {
            question: coachQuestion.trim().slice(0, 1000),
            planner: takeHome ? {
              monthlyTakeHome: formatRand(takeHome.monthlyNetCents),
              monthlySurplusOrShortfall: formatRand(budget.surplusCents),
            } : null,
            goals: goalSnapshots.slice(0, 5).map(({ goal, progress }) => ({
              name: goal.name,
              saved: formatRand(progress.savedCents),
              target: formatRand(goal.target_amount),
              requiredMonthlySaving: formatRand(progress.requiredMonthlyCents),
            })),
          },
        }),
      });
      const result = await response.json() as { text?: string; error?: string };
      if (!response.ok || !result.text) throw new Error(result.error || 'Money Coach is unavailable.');
      setCoachAnswer(result.text);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Money Coach is unavailable.');
    } finally {
      setCoachBusy(false);
    }
  }

  function chooseTemplate(name: string, type: GoalType, targetCents: number) {
    setGoalName(name);
    setGoalType(type);
    setGoalTarget(targetCents);
    setGoalStarting(0);
    setGoalDate(localDateKey(new Date(new Date().getFullYear(), new Date().getMonth() + 3, new Date().getDate())));
    setShowGoalForm(true);
  }

  if (loading) return <p className="py-8 text-sm text-slate-600" role="status">Loading your private money plan and progress…</p>;

  const nextBestStep = !plan.savedAt
    ? { title: 'Start with your take-home estimate', text: 'A saved salary plan gives your monthly budget a useful starting point.', action: 'Open salary planner', run: () => chooseTab('salary') }
    : !activeGoals.some((goal) => goal.type === 'Emergency fund')
      ? { title: 'You have no emergency goal yet. Start with R500.', text: 'Make the amount and date fit your situation; you can change them before saving.', action: 'Start an emergency goal', run: () => {
        chooseTemplate('Emergency fund starter', 'Emergency fund', 50_000);
        chooseTab('goals');
      } }
      : !recentContribution
        ? { title: 'Give one goal a small boost', text: 'A contribution does not need to be large to count as progress.', action: 'Log a contribution', run: () => {
          setContributionGoalId(activeGoals[0]?.id || '');
          chooseTab('goals');
        } }
        : { title: 'Build one more money skill', text: 'A short lesson can help with the next money decision you face.', action: 'Continue a lesson', run: () => {
          chooseTab('lessons');
          setActiveLessonId(moneyLessons[nextLessonIndex]?.id || '');
        } };
  const firstBehind = goalSnapshots.find(({ progress }) => progress.status === 'Behind');
  const today = new Date();
  const daysToPayday = plan.paydayDay >= today.getDate()
    ? plan.paydayDay - today.getDate()
    : new Date(today.getFullYear(), today.getMonth() + 1, Math.min(plan.paydayDay, 28)).getDate() - today.getDate() + plan.paydayDay;
  const coachName = 'Money Coach';

  return (
    <div>
      <nav aria-label="Money Skills" className="mb-6 overflow-x-auto border-b border-slate-200">
        <div role="tablist" aria-label="Money Skills sections" className="flex min-w-max gap-1 py-2">
          {(Object.keys(moneyTabLabels) as MoneyTab[]).map((item) => (
            <button key={item} type="button" role="tab" aria-selected={tab === item} aria-controls={`money-panel-${item}`} id={`money-tab-${item}`} onClick={() => chooseTab(item)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm ${tab === item ? 'bg-sunshine-light font-bold text-black' : 'font-medium text-slate-700 hover:bg-slate-50'}`}>
              {item === 'overview' ? <Wallet size={17} aria-hidden="true" />
                : item === 'salary' ? <Banknote size={17} aria-hidden="true" />
                  : item === 'goals' ? <Target size={17} aria-hidden="true" />
                    : <BookOpen size={17} aria-hidden="true" />}
              {moneyTabLabels[item]}
            </button>
          ))}
        </div>
      </nav>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      {saveMessage && <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">{saveMessage}</p>}
      {importedMessage && <p className="mb-4 rounded-lg border border-yellow-300 bg-sunshine-light p-3 text-sm text-black" role="status">{importedMessage}</p>}

      {tab === 'overview' && <div id="money-panel-overview" role="tabpanel" aria-labelledby="money-tab-overview" className="space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <p className="eyebrow">Money confidence · {firstName}</p>
          <h2 className="mt-2 text-2xl font-bold text-black sm:text-3xl">Good to see you, {firstName}.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Your money plan is yours. Start with one useful next step and adjust it as life changes.</p>
          <div className="mt-5 rounded-xl border border-yellow-300 bg-sunshine-light/70 p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-yellow text-black"><Sparkles size={19} aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Your next best money step</p>
                <h3 className="mt-1 font-semibold text-black">{nextBestStep.title}</h3>
                <p className="mt-1 text-sm leading-5 text-slate-700">{nextBestStep.text}</p>
                <button type="button" onClick={nextBestStep.run} className="btn-primary mt-3 min-h-10">{nextBestStep.action}<ArrowRight size={16} aria-hidden="true" /></button>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Estimated take-home', value: takeHome ? formatRand(takeHome.monthlyNetCents) : 'Not set', icon: Wallet },
              { label: 'Monthly surplus', value: takeHome ? formatRand(budget.surplusCents) : 'Add a plan', icon: TrendingUp },
              { label: 'Goals on track', value: activeGoals.length ? `${onTrackGoals} of ${activeGoals.length}` : 'No goals yet', icon: Target },
            ].map(({ label, value, icon: Icon }) => <article key={label} className="rounded-xl border border-slate-200 p-4">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-sunshine-light text-black"><Icon size={18} aria-hidden="true" /></span>
              <p className="mt-3 text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold text-black">{value}</p>
            </article>)}
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="confidence-score-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="eyebrow">Money pillar · 15% of the overall score</p><h3 id="confidence-score-heading" className="mt-1 text-lg font-bold text-black">Money confidence</h3></div>
            <p className="text-3xl font-bold text-black" aria-label={`Money confidence score ${confidence} out of 100`}>{confidence}<span className="text-base font-medium text-slate-500"> / 100</span></p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Money confidence score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={confidence}>
            <div className="h-full bg-yellow transition-all" style={{ width: `${confidence}%` }} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">Salary plan 30% · a goal 25% · recent contribution 25% · lessons 20%. The overall Economic Mobility Score also needs employment and growth pillar data.</p>
        </section>

        {firstBehind && <aside className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-6 text-amber-950"><strong>{firstBehind.goal.name}</strong> is behind its target pace. Your required monthly saving is {formatRand(firstBehind.progress.requiredMonthlyCents)}; adjust the target or date if your circumstances changed.</p>
          <button type="button" className="btn-secondary min-h-10" onClick={() => chooseTab('goals')}>Review goal</button>
        </aside>}
        {daysToPayday <= 3 && emailNudges.payday_reminders && <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700" role="status">
          <CalendarDays size={17} className="mr-2 inline" aria-hidden="true" />Payday check-in: compare the money received with your payslip and update your budget. Your selected payday is day {plan.paydayDay}.
        </aside>}
        <section aria-label="Money Skills shortcuts" className="grid gap-3 sm:grid-cols-3">
          {([
            { label: 'Salary planner', text: 'Estimate take-home and plan a monthly budget.', tab: 'salary' as const, Icon: Banknote },
            { label: 'Savings goals', text: 'Choose a target and track each contribution.', tab: 'goals' as const, Icon: PiggyBank },
            { label: 'Lessons', text: 'Learn practical money skills in short steps.', tab: 'lessons' as const, Icon: BookOpen },
          ]).map(({ label, text, tab: target, Icon }) => <button key={target} type="button" onClick={() => chooseTab(target)} className="group flex min-h-28 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:bg-sunshine-light/50">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunshine-light text-black"><Icon size={20} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold text-black">{label}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{text}</span></span>
            <ArrowRight size={17} className="shrink-0 text-slate-500" aria-hidden="true" />
          </button>)}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="money-reminders-heading">
          <h3 id="money-reminders-heading" className="font-bold text-black">Money reminders</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Choose optional email reminders. In-app reminders show here when your saved plan or goals make them relevant.</p>
          <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
            {([
              ['payday_reminders', 'Payday check-in'],
              ['money_goal_reminders', 'Savings goal progress'],
              ['money_lesson_reminders', 'New money lesson'],
              ['bursary_deadline_reminders', 'NSFAS and bursary deadline check-in'],
            ] as const).map(([key, label]) => <label key={key} className="flex min-h-12 items-center gap-3 py-2 text-sm text-slate-700">
              <input type="checkbox" className="h-5 w-5 accent-yellow-500" checked={emailNudges[key]} onChange={(event) => void saveNudgePreferences(key, event.target.checked)} />
              {label}
            </label>)}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">Preferences and opt-in dates are stored privately. Automated email delivery and verified, live bursary deadlines are not configured in this deployment. Check <a className="underline" href="https://www.nsfas.org.za/" target="_blank" rel="noreferrer">NSFAS directly</a> for current dates.</p>
        </section>

        <section className="rounded-2xl border border-yellow-300 bg-sunshine-light/40 p-5 sm:p-6" aria-labelledby="money-coach-heading">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-yellow text-black"><Lightbulb size={19} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <h3 id="money-coach-heading" className="font-bold text-black">{coachName}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-700">Ask for a simple next step using your saved budget and goal numbers. Do not enter account numbers, card details, PINs, passwords, OTPs or ID numbers. General education only — not financial advice.</p>
            </div>
          </div>
          <form onSubmit={(event) => void askCoach(event)} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="sr-only" htmlFor="money-coach-question">Ask Money Coach</label>
            <input id="money-coach-question" className="input" maxLength={1000} value={coachQuestion} onChange={(event) => setCoachQuestion(event.target.value)} placeholder="How could I make room for my emergency goal?" />
            <button className="btn-primary min-h-12" type="submit" disabled={coachBusy || !coachQuestion.trim()}>{coachBusy ? 'Thinking…' : 'Ask Money Coach'}</button>
          </form>
          {coachAnswer && <p className="mt-4 whitespace-pre-line rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700" aria-live="polite">{coachAnswer}</p>}
          <p className="mt-2 text-xs leading-5 text-slate-500">When selected, the AI provider receives your question plus the take-home, surplus and goal figures shown in your account.</p>
        </section>
      </div>}

      {tab === 'salary' && <div id="money-panel-salary" role="tabpanel" aria-labelledby="money-tab-salary" className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="salary-inputs-heading">
          <p className="eyebrow">Estimate only · confirm with payroll</p>
          <h2 id="salary-inputs-heading" className="mt-1 text-xl font-bold text-black">Salary planner</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter the pay amount and its period. The estimate annualises income and applies the configured 2026/27 SARS tables.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MoneyAmountField label="Gross pay before deductions" amount={plan.grossCents} onChange={(grossCents) => changePlan('grossCents', grossCents)} />
            <div><label className="label" htmlFor="money-period">Pay period</label><select id="money-period" className="input" value={plan.period} onChange={(event) => changePlan('period', event.target.value as PayPeriod)}>
              <option value="monthly">Monthly</option><option value="annual">Annual</option><option value="weekly">Weekly</option><option value="hourly">Hourly</option>
            </select></div>
            {plan.period === 'hourly' && <div><label className="label" htmlFor="money-hours">Hours per week</label><input id="money-hours" type="number" min="1" max="168" step="1" className="input" value={plan.hoursPerWeek} onChange={(event) => changePlan('hoursPerWeek', Math.min(168, Math.max(1, Number(event.target.value) || 1)))} /></div>}
            <div><label className="label" htmlFor="money-age">Age group</label><select id="money-age" className="input" value={plan.ageGroup} onChange={(event) => changePlan('ageGroup', event.target.value as AgeGroup)}>
              <option value="under65">Under 65</option><option value="age65to74">65–74</option><option value="age75plus">75+</option>
            </select></div>
            <MoneyAmountField label={`Retirement contribution (${plan.period === 'annual' ? 'annual' : 'monthly'})`} amount={plan.retirementContributionCents} onChange={(amount) => changePlan('retirementContributionCents', amount)} hint="Optional. The estimate applies the annual deduction limits in the tax configuration." />
            <div><label className="label" htmlFor="money-medical">Medical aid members (including main member)</label><select id="money-medical" className="input" value={plan.medicalAidMembers} onChange={(event) => changePlan('medicalAidMembers', Number(event.target.value))}>
              {Array.from({ length: 7 }, (_, index) => <option key={index} value={index}>{index === 0 ? 'No medical aid' : `${index} ${index === 1 ? 'member' : 'members'}`}</option>)}
            </select></div>
            <div><label className="label" htmlFor="money-payday">Usual payday (day of month)</label><input id="money-payday" type="number" min="1" max="31" className="input" value={plan.paydayDay} onChange={(event) => changePlan('paydayDay', Math.min(31, Math.max(1, Number(event.target.value) || 1)))} /></div>
          </div>
          <label className="mt-4 flex min-h-12 items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm leading-5 text-slate-700">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-yellow-500" checked={plan.isStipend} onChange={(event) => changePlan('isStipend', event.target.checked)} />
            <span><strong className="text-black">I am a learner or intern on a stipend.</strong> UIF treatment can depend on your contract and arrangement. Check your contract and payslip; this estimate does not assume an exemption.</span>
          </label>

          <div className="mt-6" aria-live="polite" aria-atomic="true">
            {!takeHome ? <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Enter a valid gross amount to see your take-home estimate.</p> : <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ['Gross', takeHome.monthlyGrossCents],
                  ['PAYE', takeHome.monthlyPayeCents],
                  ['UIF', takeHome.monthlyUifCents],
                  ['Retirement', takeHome.monthlyRetirementDeductionCents],
                  ['Net take-home', takeHome.monthlyNetCents],
                ].map(([label, amount]) => <div key={label} className="rounded-xl border border-slate-200 p-3"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 font-bold text-black">{formatRand(Number(amount))}</p></div>)}
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-black">Monthly breakdown</h3>
                <div className="mt-3 space-y-3" role="img" aria-label={`Gross pay ${formatRand(takeHome.monthlyGrossCents)} less PAYE ${formatRand(takeHome.monthlyPayeCents)}, UIF ${formatRand(takeHome.monthlyUifCents)}, and retirement ${formatRand(takeHome.monthlyRetirementDeductionCents)} leaves net ${formatRand(takeHome.monthlyNetCents)} per month.`}>
                  {[
                    ['Take-home', takeHome.monthlyNetCents, 'bg-yellow'],
                    ['PAYE', takeHome.monthlyPayeCents, 'bg-slate-500'],
                    ['UIF', takeHome.monthlyUifCents, 'bg-slate-400'],
                    ['Retirement', takeHome.monthlyRetirementDeductionCents, 'bg-slate-300'],
                  ].map(([label, amount, color]) => <div key={label}><div className="mb-1 flex justify-between gap-2 text-xs"><span>{label}</span><span>{formatRand(Number(amount))}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${color}`} style={{ width: `${Math.min(100, Number(amount) * 100 / Math.max(1, takeHome.monthlyGrossCents))}%` }} /></div></div>)}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">Effective PAYE rate: {(takeHome.effectiveTaxRate * 100).toFixed(1)}% · marginal rate: {(takeHome.marginalRate * 100).toFixed(0)}% · medical credit applied: {formatRand(takeHome.monthlyMedicalCreditCents)}.</p>
              </div>
              {takeHome.uifStipendHint && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-5 text-amber-950">UIF can depend on the contract and learnership/stipend arrangement. This estimate shows the standard calculation as a reference; check your contract or payroll.</p>}
              <p className="mt-3 text-xs leading-5 text-slate-500">Estimate only, not tax advice. Based on SARS {taxTables2026_27.taxYear} tables ({taxTables2026_27.taxYearLabel}), last verified {taxTables2026_27.lastVerified}. Your payslip may differ. Annual taxable retirement deductions are limited to 27.5% of the relevant amount or R350,000, whichever is lower; confirm eligibility with SARS.</p>
            </>}
          </div>

          <section className="mt-6 border-t border-slate-200 pt-5" aria-labelledby="budget-heading">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 id="budget-heading" className="font-bold text-black">Build a monthly budget</h3><p className="mt-1 text-sm text-slate-600">50/30/20 is a starting guide, not a rule. Change the split to fit your life.</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.needsPercent + plan.wantsPercent + plan.savingsPercent === 100 ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-800'}`}>Total: {plan.needsPercent + plan.wantsPercent + plan.savingsPercent}%</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {([
                ['Needs', 'needsPercent'],
                ['Wants', 'wantsPercent'],
                ['Savings & debt', 'savingsPercent'],
              ] as const).map(([label, key]) => <div key={key}><label htmlFor={key} className="label">{label} target %</label><input id={key} type="number" min="0" max="100" className="input" value={plan[key]} onChange={(event) => changePlan(key, Math.min(100, Math.max(0, Number(event.target.value) || 0)))} /></div>)}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {([
                ['Rent / housing', 'rentCents'],
                ['Transport', 'transportCents'],
                ['Food', 'foodCents'],
                ['Airtime and data', 'airtimeCents'],
                ['Family support', 'familySupportCents'],
                ['Debt repayments', 'debtRepaymentsCents'],
                ['Subscriptions', 'subscriptionsCents'],
              ] as const).map(([label, key]) => <MoneyAmountField key={key} label={`${label} per month`} amount={plan.budget[key]} onChange={(value) => changeBudget(key, value)} />)}
            </div>
            {takeHome && <div className="mt-5 rounded-xl bg-slate-50 p-4" aria-live="polite">
              <div className="grid gap-3 sm:grid-cols-3">
                <p className="text-sm">Needs: <strong>{formatRand(budget.needsCents)}</strong> ({Math.round(budget.needsShare * 100)}%)</p>
                <p className="text-sm">Wants: <strong>{formatRand(budget.wantsCents)}</strong></p>
                <p className="text-sm">Surplus / shortfall: <strong className={budget.surplusCents < 0 ? 'text-red-800' : 'text-emerald-800'}>{formatRand(budget.surplusCents)}</strong></p>
              </div>
              {budget.needsOver60Percent && <p className="mt-3 text-sm leading-5 text-amber-900" role="status">Your listed needs are above 60% of take-home pay. This is a prompt to review options, not a judgement. Check whether any cost can safely change; essentials come first.</p>}
              <p className="mt-3 text-sm text-slate-600">50/30/20 guide for this take-home: needs {formatRand(Math.round(takeHome.monthlyNetCents * plan.needsPercent / 100))} · wants {formatRand(Math.round(takeHome.monthlyNetCents * plan.wantsPercent / 100))} · savings and debt {formatRand(Math.round(takeHome.monthlyNetCents * plan.savingsPercent / 100))}.</p>
            </div>}
            {takeHome && <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <label htmlFor="salary-what-if" className="label">If you earned R more or less each month</label>
              <input id="salary-what-if" type="range" min="-1000000" max="1000000" step="25000" value={whatIfCents} onChange={(event) => setWhatIfCents(Number(event.target.value))} className="w-full accent-yellow-500" />
              <p className="text-sm text-slate-700">{whatIfCents === 0 ? 'No change selected' : `${whatIfCents > 0 ? '+' : '−'}${formatRand(Math.abs(whatIfCents))} gross/month`} · estimated take-home {(() => {
                try {
                  return formatRand(estimateStipendTakeHome({
                    grossCents: Math.max(0, takeHome.monthlyGrossCents + whatIfCents),
                    period: 'monthly',
                    ageGroup: plan.ageGroup,
                    retirementContributionCents: plan.retirementContributionCents,
                    medicalAidMembers: plan.medicalAidMembers,
                    isStipend: plan.isStipend,
                  }).monthlyNetCents);
                } catch { return 'not available'; }
              })()}</p>
            </div>}
          </section>
          <button type="button" className="btn-primary mt-5 min-h-11" onClick={() => void savePlan()} disabled={busy}>{busy ? 'Saving…' : 'Save my salary and budget plan'}</button>
          {saveMessage && <p role="status" className="mt-3 text-sm text-emerald-800">{saveMessage}</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6" aria-labelledby="offer-compare-heading">
          <h2 id="offer-compare-heading" className="text-lg font-bold text-black">Compare two job offers</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Compare estimated monthly take-home after transport cost, and keep commute time visible.</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {(['offerA', 'offerB'] as const).map((key, index) => <fieldset key={key} className="rounded-xl border border-slate-200 p-4">
              <legend className="px-1 font-semibold text-black">Offer {index + 1}</legend>
              <div className="space-y-3">
                <MoneyAmountField label="Gross pay per month" amount={plan[key].grossCents} onChange={(value) => changeOffer(key, 'grossCents', value)} />
                <MoneyAmountField label="Transport cost per month" amount={plan[key].transportCents} onChange={(value) => changeOffer(key, 'transportCents', value)} />
                <div><label className="label" htmlFor={`${key}-commute`}>Commute minutes each way</label><input id={`${key}-commute`} type="number" min="0" max="1440" className="input" value={plan[key].commuteMinutes} onChange={(event) => changeOffer(key, 'commuteMinutes', Math.min(1440, Math.max(0, Number(event.target.value) || 0)))} /></div>
              </div>
              {plan[key].grossCents > 0 && <p className="mt-3 text-sm">Estimated net after transport: <strong>{formatRand(Math.max(0, estimateStipendTakeHome({ grossCents: plan[key].grossCents, period: 'monthly', ageGroup: plan.ageGroup, isStipend: plan.isStipend }).monthlyNetCents - plan[key].transportCents))}</strong> · {plan[key].commuteMinutes} min each way</p>}
            </fieldset>)}
          </div>
          {plan.offerA.grossCents > 0 && plan.offerB.grossCents > 0 && <p className="mt-4 rounded-xl bg-sunshine-light p-4 text-sm leading-6 text-black" aria-live="polite">
            Offer 1 leaves {formatRand(Math.max(0, estimateStipendTakeHome({ grossCents: plan.offerA.grossCents, period: 'monthly', ageGroup: plan.ageGroup, isStipend: false }).monthlyNetCents - plan.offerA.transportCents))}; offer 2 leaves {formatRand(Math.max(0, estimateStipendTakeHome({ grossCents: plan.offerB.grossCents, period: 'monthly', ageGroup: plan.ageGroup, isStipend: false }).monthlyNetCents - plan.offerB.transportCents))} after transport. The difference is {formatRand(Math.abs((estimateStipendTakeHome({ grossCents: plan.offerA.grossCents, period: 'monthly', ageGroup: plan.ageGroup, isStipend: false }).monthlyNetCents - plan.offerA.transportCents) - (estimateStipendTakeHome({ grossCents: plan.offerB.grossCents, period: 'monthly', ageGroup: plan.ageGroup, isStipend: false }).monthlyNetCents - plan.offerB.transportCents)))} monthly before other costs.
          </p>}
        </section>
      </div>}

      {tab === 'goals' && <div id="money-panel-goals" role="tabpanel" aria-labelledby="money-tab-goals" className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="eyebrow">Your pace, your plan</p><h2 className="mt-1 text-xl font-bold text-black">Savings goals</h2><p className="mt-1 text-sm leading-6 text-slate-600">Choose an amount and date that fit your life. Goal amounts stay private to your account.</p></div>
            <button type="button" className="btn-primary min-h-10" onClick={() => setShowGoalForm((current) => !current)}><Target size={16} aria-hidden="true" />{showGoalForm ? 'Close form' : 'Create a goal'}</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Starter goal templates">
            <button type="button" className="btn-secondary min-h-10 text-xs" onClick={() => chooseTemplate('Emergency fund', 'Emergency fund', plan.savedAt ? Math.max(50_000, budget.needsCents) : 50_000)}>Emergency fund · 1 month of needs</button>
            <button type="button" className="btn-secondary min-h-10 text-xs" onClick={() => chooseTemplate("Driver's licence", 'Transport/licence', 500_000)}>Driver’s licence</button>
            <button type="button" className="btn-secondary min-h-10 text-xs" onClick={() => chooseTemplate('CV data & transport fund', 'Transport/licence', 100_000)}>CV data & transport</button>
            <button type="button" className="btn-secondary min-h-10 text-xs" onClick={() => chooseTemplate('Business starter kit', 'Business start-up', 500_000)}>Business starter kit</button>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">Template amounts are editable examples, not recommendations. The business starter template can help you plan before exploring <Link className="underline" href="/app/growth">Growth Studio</Link>.</p>
          {showGoalForm && <form onSubmit={(event) => void createGoal(event)} className="mt-5 grid gap-4 rounded-xl border border-yellow-300 bg-sunshine-light/30 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><label htmlFor="goal-name" className="label">Goal name</label><input id="goal-name" required maxLength={100} className="input" value={goalName} onChange={(event) => setGoalName(event.target.value)} placeholder="e.g. Emergency fund" /></div>
            <div><label htmlFor="goal-type" className="label">Goal type</label><select id="goal-type" className="input" value={goalType} onChange={(event) => setGoalType(event.target.value as GoalType)}>{goalTypes.map((type) => <option key={type}>{type}</option>)}</select></div>
            <MoneyAmountField label="Target amount" amount={goalTarget} onChange={setGoalTarget} />
            <MoneyAmountField label="Starting amount already saved" amount={goalStarting} onChange={setGoalStarting} />
            <div><label htmlFor="goal-date" className="label">Target date</label><input id="goal-date" type="date" min={localDateKey(new Date())} required className="input" value={goalDate} onChange={(event) => setGoalDate(event.target.value)} /></div>
            <div className="flex items-end"><button type="submit" className="btn-primary min-h-12 w-full" disabled={busy}>{busy ? 'Saving…' : 'Save goal'}</button></div>
          </form>}
        </section>

        {activeGoals.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sunshine-light text-black"><PiggyBank size={22} aria-hidden="true" /></span>
          <h3 className="mt-3 font-bold text-black">No savings goals yet</h3>
          <p className="mt-1 text-sm text-slate-600">Pick a template or create one goal to see how much to set aside each month.</p>
          <button type="button" className="btn-primary mt-4 min-h-10" onClick={() => chooseTemplate('Emergency fund', 'Emergency fund', 50_000)}>Start with R500</button>
        </section> : <div className="grid gap-4 lg:grid-cols-2">
          {goalSnapshots.map(({ goal, progress }) => <article key={goal.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase text-slate-500">{goal.type}</p><h3 className="mt-1 text-lg font-bold text-black">{goal.name}</h3><p className="mt-1 text-sm text-slate-600">Target {formatRand(goal.target_amount)} by {new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(`${goal.target_date}T12:00:00`))}</p></div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${progress.status === 'Behind' ? 'bg-amber-100 text-amber-900' : 'bg-sunshine-light text-black'}`}>{progress.status}</span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" role="img" aria-label={`${progress.progressPercent}% of goal saved`} style={{ background: `conic-gradient(#FFC400 ${progress.progressPercent}%, #E5E7EB 0)` }}>
                <span className="grid h-[4.25rem] w-[4.25rem] place-items-center rounded-full bg-white text-lg font-bold text-black">{progress.progressPercent}%</span>
              </div>
              <div><p className="text-sm text-slate-600">Saved so far</p><p className="text-xl font-bold text-black">{formatRand(progress.savedCents)}</p><p className="mt-1 text-sm text-slate-600">Need about {formatRand(progress.requiredMonthlyCents)} each month to meet the date.</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[25, 50, 75, 100].map((milestone) => <span key={milestone} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${progress.milestones.includes(milestone) ? 'bg-sunshine-light font-semibold text-black' : 'bg-slate-100 text-slate-500'}`}>{progress.milestones.includes(milestone) && <Award size={13} aria-hidden="true" />}{milestone}%</span>)}
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"><TrendingUp size={13} aria-hidden="true" />{progress.streak} month streak</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{progress.projected ? `At your recent pace, your projected finish is ${new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(progress.projected)}.` : 'Log a contribution to see a projected finish date.'} {plan.savedAt && budget.surplusCents > 0 ? `Planner surplus: ${formatRand(budget.surplusCents)}. You can choose to direct some of it here.` : ''}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn-primary min-h-10" onClick={() => setContributionGoalId(contributionGoalId === goal.id ? '' : goal.id)}><Heart size={15} aria-hidden="true" />Add contribution</button>
              <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs text-slate-700"><input type="checkbox" checked={shareAmounts[goal.id] === true} onChange={(event) => setShareAmounts((current) => ({ ...current, [goal.id]: event.target.checked }))} />Include amounts on share card</label>
              <button type="button" className="btn-secondary min-h-10" onClick={() => {
                try { goalCardImage(goal, progress, shareAmounts[goal.id] === true); }
                catch (caught) { setError(caught instanceof Error ? caught.message : 'Share card could not be created.'); }
              }}><Download size={15} aria-hidden="true" />Download goal card</button>
              <button type="button" className="btn-secondary min-h-10" onClick={() => void archiveGoal(goal)} disabled={busy}>Archive</button>
            </div>
            {contributionGoalId === goal.id && <form onSubmit={(event) => void addContribution(event)} className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
              <MoneyAmountField label="Contribution amount" amount={contributionAmount} onChange={setContributionAmount} />
              <div><label className="label" htmlFor={`contribution-date-${goal.id}`}>Date</label><input id={`contribution-date-${goal.id}`} type="date" required className="input" value={contributionDate} onChange={(event) => setContributionDate(event.target.value)} /></div>
              <div className="sm:col-span-2"><label className="label" htmlFor={`contribution-note-${goal.id}`}>Note <span className="font-normal text-slate-500">(optional)</span></label><input id={`contribution-note-${goal.id}`} maxLength={300} className="input" value={contributionNote} onChange={(event) => setContributionNote(event.target.value)} placeholder="A short note to help you remember" /></div>
              <button type="submit" className="btn-primary min-h-10 sm:col-span-2" disabled={busy}>{busy ? 'Saving…' : 'Log contribution'}</button>
            </form>}
            {progress.contributions.length > 0 && <details className="mt-4 border-t border-slate-200 pt-3">
              <summary className="min-h-10 cursor-pointer text-sm font-semibold text-slate-700">Recent contributions ({progress.contributions.length})</summary>
              <ul className="mt-2 divide-y divide-slate-200">
                {progress.contributions.slice(0, 5).map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <div><strong>{formatRand(item.amount)}</strong> · {item.contributed_on}{item.note ? <span className="block text-xs text-slate-500">{item.note}</span> : null}</div>
                  {editingContribution === item.id ? <div className="flex items-center gap-2"><MoneyAmountField label="New amount" amount={editAmount} onChange={setEditAmount} /><button type="button" className="btn-secondary min-h-9" onClick={() => void updateContribution(item)} disabled={busy}>Save</button><button type="button" className="btn-secondary min-h-9" onClick={() => setEditingContribution('')}>Cancel</button></div>
                    : <div className="flex gap-2"><button type="button" className="btn-secondary min-h-9 px-2 text-xs" onClick={() => { setEditingContribution(item.id); setEditAmount(item.amount); }}>Edit</button><button type="button" aria-label={`Undo ${formatRand(item.amount)} contribution`} className="btn-secondary min-h-9 px-2 text-xs" onClick={() => void deleteContribution(item)} disabled={busy}><Trash2 size={14} aria-hidden="true" />Undo</button></div>}
                </li>)}
              </ul>
            </details>}
          </article>)}
        </div>}
        {celebration && <div className="relative overflow-hidden rounded-xl bg-sunshine-light p-4 text-center" role="status">
          <span className="money-confetti" aria-hidden="true">✦ ✦ ✦ ✦ ✦</span><p className="font-bold text-black">Goal reached — you did it!</p><p className="text-sm text-slate-700">Celebrate the progress you made, at your own pace.</p>
        </div>}
      </div>}

      {tab === 'lessons' && <div id="money-panel-lessons" role="tabpanel" aria-labelledby="money-tab-lessons" className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <p className="eyebrow">Money Skills Academy</p><h2 className="mt-1 text-xl font-bold text-black">Learn a little. Use it right away.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Plain-language lessons with South African examples, a quick quiz and a practical next action. General education only, not financial advice.</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Lessons completed" aria-valuemin={0} aria-valuemax={moneyLessons.length} aria-valuenow={completedLessons.length}><div className="h-full bg-yellow" style={{ width: `${completedLessons.length * 100 / moneyLessons.length}%` }} /></div>
          <p className="mt-1 text-xs text-slate-600">{completedLessons.length} of {moneyLessons.length} lessons completed</p>
        </section>
        {activeLesson ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">{activeLesson.duration} · General education</p><h3 className="mt-1 text-xl font-bold text-black">{activeLesson.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{activeLesson.summary}</p></div><button type="button" className="btn-secondary min-h-10" onClick={() => { setActiveLessonId(''); setQuizAnswers([]); setQuizMessage(''); }}><ChevronLeft size={16} aria-hidden="true" />All lessons</button></div>
          <div className="mt-5 space-y-5">
            {activeLesson.sections.map((section) => <article key={section.heading} className="border-l-2 border-yellow-500 pl-4"><h4 className="font-semibold text-black">{section.heading}</h4><p className="mt-1 text-sm leading-6 text-slate-700">{section.text}</p>{section.action && <p className="mt-2 text-sm text-slate-700"><strong>Do it now:</strong> {section.action}</p>}</article>)}
          </div>
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <h4 className="font-bold text-black">Quick check</h4>
            <div className="mt-3 space-y-5">
              {activeLesson.quiz.map((question, questionIndex) => <fieldset key={question.question}>
                <legend className="text-sm font-semibold text-slate-800">{questionIndex + 1}. {question.question}</legend>
                <div className="mt-2 space-y-2">{question.choices.map((choice, choiceIndex) => <label key={choice} className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input type="radio" name={`quiz-${activeLesson.id}-${questionIndex}`} checked={quizAnswers[questionIndex] === choiceIndex} onChange={() => setQuizAnswers((current) => {
                    const next = [...current];
                    next[questionIndex] = choiceIndex;
                    return next;
                  })} className="h-4 w-4 accent-yellow-500" />{choice}
                </label>)}</div>
                {quizAnswers[questionIndex] !== undefined && <p className="mt-2 text-xs leading-5 text-slate-600">{question.explanation}</p>}
              </fieldset>)}
            </div>
            <button type="button" className="btn-primary mt-5 min-h-10" disabled={busy || completedLessons.includes(activeLesson.id)} onClick={() => void completeLesson(activeLesson.id)}>{completedLessons.includes(activeLesson.id) ? <><Check size={16} aria-hidden="true" />Completed</> : busy ? 'Checking…' : 'Check answers and complete'}</button>
            {quizMessage && <p role="status" aria-live="polite" className="mt-3 text-sm text-slate-700">{quizMessage}</p>}
          </div>
          <div className="mt-5 rounded-xl bg-sunshine-light/50 p-4">
            <p className="text-sm font-semibold text-black">Do it now</p><p className="mt-1 text-sm leading-5 text-slate-700">Use this lesson in a small, practical way. The numbers and decisions remain yours.</p>
            <Link href={activeLesson.action.href} className="btn-secondary mt-3 min-h-10">{activeLesson.action.label}<ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4"><p className="text-xs font-semibold uppercase text-slate-500">Official sources</p><ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{activeLesson.sources.map((source) => <li key={source.href}><a className="text-sm font-medium underline underline-offset-2" href={source.href} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></div>
        </section> : <div className="grid gap-3 md:grid-cols-2">
          {moneyLessons.map((lesson, index) => {
            const complete = completedLessons.includes(lesson.id);
            const unlocked = index <= nextLessonIndex || complete;
            return <article key={lesson.id} className={`rounded-xl border p-4 ${unlocked ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sunshine-light text-black">{complete ? <Check size={19} aria-hidden="true" /> : unlocked ? <BookOpen size={19} aria-hidden="true" /> : <ShieldCheck size={19} aria-hidden="true" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="font-bold text-black">{index + 1}. {lesson.title}</h3><span className="text-xs text-slate-500">{lesson.duration}</span></div><p className="mt-1 text-sm leading-5 text-slate-600">{lesson.summary}</p><button type="button" className="btn-secondary mt-3 min-h-9" disabled={!unlocked} onClick={() => { setActiveLessonId(lesson.id); setQuizAnswers([]); setQuizMessage(''); }}>{complete ? 'Review lesson' : unlocked ? 'Start lesson' : 'Complete the earlier lesson to unlock'}<ArrowRight size={15} aria-hidden="true" /></button></div></div>
            </article>;
          })}
        </div>}
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">Lessons provide general financial education, not personal financial, legal or tax advice. Check current information with SARS, NCR, FSCA or SABRIC and use official channels.</p>
      </div>}
      <div className="sr-only" aria-live="polite">{confidence} Money confidence points · {completedLessons.length} lessons completed</div>
    </div>
  );
}
