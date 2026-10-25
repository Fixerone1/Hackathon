-- Rollback: drop the learner-only policy, restore the previous policy for anon/authenticated, and re-grant SELECT to anon.
revoke select on public.opportunities from anon;
grant select on public.opportunities to authenticated;

drop policy if exists "Anyone can read current published opportunities" on public.opportunities;
drop policy if exists "Learners can read current published opportunities" on public.opportunities;

create policy "Learners can read current published opportunities"
  on public.opportunities
  for select
  to authenticated
  using (
    status = 'published'
    and (closing_date is null or closing_date >= current_date)
    and verified_at >= current_date - 30
  );