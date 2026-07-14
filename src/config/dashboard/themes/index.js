import { WEBSITE_THEME } from './website.theme';
import { USER_DASHBOARD_THEME } from './user-dashboard.theme';
import { ADMIN_DASHBOARD_THEME } from './admin-dashboard.theme';

export const THEMES = {
  website: WEBSITE_THEME,
  'user-dashboard': USER_DASHBOARD_THEME,
  'admin-dashboard': ADMIN_DASHBOARD_THEME,
};

export const THEME_IDS = {
  WEBSITE: 'website',
  USER_DASHBOARD: 'user-dashboard',
  ADMIN_DASHBOARD: 'admin-dashboard',
};

export const getTheme = (themeId) => {
  return THEMES[themeId] || THEMES.website;
};

export const getThemeByRole = (role) => {
  if (role === 'admin') return THEMES['admin-dashboard'];
  if (role === 'user') return THEMES['user-dashboard'];
  return THEMES.website;
};