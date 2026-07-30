/**
 * Dashboard route-group layout — pure pass-through.
 *
 * ThemeProvider and Sidebar are owned by each child layout
 * (new-dashboard/user, new-dashboard/admin) so they never double-wrap.
 * Legacy dashboard pages have self-contained layouts and don't need wrapping here.
 */
export default function DashboardLayout({ children }) {
  return children;
}
