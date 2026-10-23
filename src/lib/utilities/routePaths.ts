const ROUTE_PATHS = {
  home: () => '/',
  login: () => '/login',
  signup: () => '/signup',
  onboarding: () => '/onboarding',
  oauthCallbackPrefix: () => '/oauth/',
  oauthCallback: (provider: string) => `/oauth/${provider}`,
  oauthAuthorize: (provider: string) => `/api/oauth/${provider}/authorize`,
  dashboard: () => '/dashboard',
  sales: () => '/sales/dashboard',
  salesDetails: () => '/sales/details',
  partTime: () => '/partTime',
  partTimeSchedule: () => '/partTime/schedule',
  partTimeStaff: () => '/partTime/staff',
} as const;

export { ROUTE_PATHS };
