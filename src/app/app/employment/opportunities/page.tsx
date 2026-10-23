import { EmploymentModule } from '@/components/EmploymentModule';

export default function OpportunitiesPage() {
  return <EmploymentModule title="Opportunity matches" description="Review real listings, compare requirements, and apply on the original source site." statusTitle="No verified listings connected" statusText="No source connectors have been approved or configured yet. To avoid fabricated opportunities, this feed is empty. When listings are available, each will show its original source, posting link, date found, closing date, fit reasons, and any requirements you still need." />;
}
