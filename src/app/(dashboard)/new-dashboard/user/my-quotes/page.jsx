import { redirect } from 'next/navigation';

export default function MyQuotesRedirectPage() {
  redirect('/new-dashboard/user/favorites');
}
