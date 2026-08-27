import { redirect } from 'next/navigation';

export default function MyQuotesRedirectPage() {
  redirect('/dashboard/user/favorites');
}
