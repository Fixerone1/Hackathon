-- Rollback: drop the learner-only policy, restore the previous policy for anon/authenticated, and re-grant SELECT to anon.
revoke select on public.opportunities from anon;
grant select on public.opportunities to authenticated;

drop policy if exists "Anyone can read current published opportunities" on public.opportunities;
drop policy if exists "Learners can read current published opportunities" on public.opportunities;
drop policy if exists "Learners can read listings they have saved" on public.opportunities;
drop policy if exists "Learners can read published listings they have saved" on public.opportunities;

create policy "Learners can read current published opportunities"
  on public.opportunities
  for select
  to authenticated
  using (
    status = 'published'
    and (closing_date is null or closing_date >= current_date)
    and verified_at >= current_date - 30
  );

create policy "Learners can read published listings they have saved"
  on public.opportunities
  for select
  to authenticated
  using (
    status = 'published'
    and exists (
      select 1
      from public.learner_opportunity_actions
      where learner_opportunity_actions.opportunity_id = opportunities.id
        and learner_opportunity_actions.user_id = (select auth.uid())
    )
  );