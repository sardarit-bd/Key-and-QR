import { redirect } from 'next/navigation';

/**
 * /new-dashboard → redirect to /new-dashboard/user
 */
export default function NewDashboardPage() {
  redirect('/new-dashboard/user');
}
