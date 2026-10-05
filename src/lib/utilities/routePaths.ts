const ROUTE_PATHS = {
  dashboard: () => '/dashboard',
  sales: () => '/sales/dashboard',
  salesDetails: () => '/sales/details',
  partTime: () => '/partTime',
  partTimeSchedule: () => '/partTime/schedule',
  partTimeStaff: () => '/partTime/staff',
} as const;

export { ROUTE_PATHS };
