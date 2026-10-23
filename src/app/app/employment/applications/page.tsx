import { EmploymentModule } from '@/components/EmploymentModule';

export default function ApplicationsPage() {
  return <EmploymentModule title="My applications" description="Keep track of saved opportunities and application progress." statusTitle="Application tracking is not connected" statusText="The current Phase 1 schema does not yet include application records. You remain in control of every application; this preview never applies on your behalf." />;
}
