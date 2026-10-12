const ROUTE_PATHS = {
  home: () => '/',
  login: () => '/login',
  signup: () => '/signup',
  onboarding: () => '/onboarding',
  dashboard: () => '/dashboard',
  sales: () => '/sales/dashboard',
  salesDetails: () => '/sales/details',
  partTime: () => '/partTime',
  partTimeSchedule: () => '/partTime/schedule',
  partTimeStaff: () => '/partTime/staff',
} as const;

export { ROUTE_PATHS };
