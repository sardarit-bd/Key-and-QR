import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

/**
 * Helper to extract verified user role from access token cookie
 */
async function getUserRoleFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload?.role || null;
  } catch {
    return null;
  }
}

/**
 * /new-dashboard → role-aware redirect:
 * - Admin → /new-dashboard/admin
 * - User → /new-dashboard/user
 */
export default async function NewDashboardPage() {
  const role = await getUserRoleFromCookie();
  if (role === 'admin') {
    redirect('/new-dashboard/admin');
  }
  redirect('/new-dashboard/user');
}
