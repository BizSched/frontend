'use client';

import { Button } from '@base-ui/react/button';
import { Collapsible } from '@base-ui/react/collapsible';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NotificationButton } from '@components/_common/IconButton/NotificationButton';
import { Sidebar } from '@components/_common/Sidebar/Sidebar';
import { SidebarBrand } from '@components/_common/Sidebar/SidebarBrand';
import { SidebarContent } from '@components/_common/Sidebar/SidebarContent';
import { SidebarFooter } from '@components/_common/Sidebar/SidebarFooter';
import { SidebarHeader } from '@components/_common/Sidebar/SidebarHeader';
import { SidebarMenuButton } from '@components/_common/Sidebar/SidebarMenuButton';
import { useSidebar } from '@components/_common/Sidebar/SidebarProvider';
import { SidebarTrigger } from '@components/_common/Sidebar/SidebarTrigger';

import { ROUTE_PATHS } from '@lib/utilities/routePaths';

import Bell from '@assets/icons/ic_bell.svg';
import Calendar from '@assets/icons/ic_calendar-days.svg';
import ChevronDown from '@assets/icons/ic_chevron-down.svg';
import ProfileChevron from '@assets/icons/ic_chevron-down.svg';
import Dashboard from '@assets/icons/ic_layout-dashboard.svg';
import Logout from '@assets/icons/ic_log-out.svg';
import Settings from '@assets/icons/ic_settings.svg';
import UserGroup from '@assets/icons/ic_user-group.svg';
import SalesIcon from '@assets/icons/ic_wallet.svg';
import Avatar from '@assets/icons/sidebar/ic_avatar.svg';

interface AppSidebarProps {
  profile?: { name: string; email: string };
  hasUnreadNotifications?: boolean;
  onSettingsClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
}
function SideIcon({ icons }: { icons: string }) {
  return <Image src={icons} alt="" width={24} height={24} unoptimized />;
}
function AppSidebar({
  profile,
  hasUnreadNotifications = false,
  onSettingsClick,
  onLogoutClick,
  onProfileClick,
  onNotificationsClick,
}: AppSidebarProps) {
  const pathname = usePathname();
  const { setIsOverlayOpen } = useSidebar();
  const isDashboard = pathname === ROUTE_PATHS.dashboard();
  const isSales = pathname === ROUTE_PATHS.sales();
  const isSalesDetail = pathname === ROUTE_PATHS.salesDetails();
  const isPartTimeSchedule = pathname === ROUTE_PATHS.partTimeSchedule();
  const isPartTimeStaff =
    pathname === ROUTE_PATHS.partTimeStaff() ||
    pathname.startsWith(ROUTE_PATHS.partTimeStaff() + '/');
  const isPartTime = isPartTimeSchedule || isPartTimeStaff;
  const mobilePageTitle = isDashboard
    ? '대시보드'
    : isSales
      ? '매출 대시보드'
      : isSalesDetail
        ? '매출 내역'
        : isPartTimeSchedule
          ? '아르바이트생 스케쥴 관리'
          : isPartTimeStaff
            ? '아르바이트생 관리'
            : 'BizSched'; // NOTE : 라우트별 반환 로직 리팩토링 필요
  const handleNavigate = () => setIsOverlayOpen(false);

  return (
    <Sidebar
      rail={
        <>
          <aside
            aria-label="접힌 주 메뉴"
            className="fixed inset-y-0 left-0 z-30 hidden w-15 flex-col items-center gap-10 rounded-r-[40px] bg-white-50 py-8 shadow-modal max-desktop:flex max-tablet:hidden"
          >
            <SidebarTrigger />
            <SidebarBrand href={ROUTE_PATHS.dashboard()} isSmall />
            <Button
              aria-label="알림"
              disabled={!onNotificationsClick}
              onClick={onNotificationsClick}
              className="-mt-2 flex size-8 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed"
            >
              <span className="relative">
                <Image src={Bell} alt="" width={24} height={24} unoptimized />
                {hasUnreadNotifications && (
                  <span className="absolute top-0 right-0 size-1.5 rounded-full bg-primary-500" />
                )}
              </span>
            </Button>
          </aside>
          <header className="fixed inset-x-0 top-0 z-30 hidden h-14 items-center justify-between bg-white-50 px-4 max-tablet:flex">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span aria-hidden="true" className="text-sm font-semibold">
                {mobilePageTitle}
              </span>
            </div>
            <Button
              aria-label="알림"
              disabled={!onNotificationsClick}
              onClick={onNotificationsClick}
              className="relative flex size-8 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed"
            >
              <Image src={Bell} alt="" width={24} height={24} unoptimized />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary-500" />
              )}
            </Button>
          </header>
        </>
      }
    >
      <SidebarHeader>
        <SidebarTrigger className="self-end group-data-[state=collapsed]/sidebar:self-center" />
        <SidebarBrand href={ROUTE_PATHS.dashboard()} onClick={handleNavigate} />
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label="서비스 메뉴">
          <ul className="flex flex-col gap-3">
            <li>
              <SidebarMenuButton
                nativeButton={false}
                role="link"
                render={<Link href={ROUTE_PATHS.dashboard()} />}
                isActive={isDashboard}
                aria-current={isDashboard ? 'page' : undefined}
                onClick={handleNavigate}
              >
                <SideIcon icons={Dashboard} />
                대시보드
              </SidebarMenuButton>
            </li>
            <li>
              <Collapsible.Root
                key={isPartTime ? 'partTime' : 'other'}
                defaultOpen={isPartTime}
              >
                <Collapsible.Trigger render={<SidebarMenuButton />}>
                  <SideIcon icons={UserGroup} />
                  <span className="flex-1">아르바이트</span>
                  <Image
                    src={ChevronDown}
                    alt=""
                    width={24}
                    height={24}
                    className="[[aria-expanded=true]>&]:rotate-180"
                    unoptimized
                  />
                </Collapsible.Trigger>
                <Collapsible.Panel>
                  <ul className="pt-2">
                    <li>
                      <SidebarMenuButton
                        size="sub"
                        nativeButton={false}
                        role="link"
                        render={<Link href={ROUTE_PATHS.partTimeSchedule()} />}
                        isActive={isPartTimeSchedule}
                        aria-current={isPartTimeSchedule ? 'page' : undefined}
                        onClick={handleNavigate}
                      >
                        스케쥴 관리
                      </SidebarMenuButton>
                    </li>
                    <li>
                      <SidebarMenuButton
                        size="sub"
                        nativeButton={false}
                        role="link"
                        render={<Link href={ROUTE_PATHS.partTimeStaff()} />}
                        isActive={isPartTimeStaff}
                        aria-current={isPartTimeStaff ? 'page' : undefined}
                        onClick={handleNavigate}
                      >
                        아르바이트생 관리
                      </SidebarMenuButton>
                    </li>
                  </ul>
                </Collapsible.Panel>
              </Collapsible.Root>
            </li>
            <li>
              <Collapsible.Root
                key={isSales ? 'sales' : 'other'}
                defaultOpen={isSales}
              >
                <Collapsible.Trigger render={<SidebarMenuButton />}>
                  <SideIcon icons={SalesIcon} />
                  <span className="flex-1">매출</span>
                  <Image
                    src={ChevronDown}
                    alt=""
                    width={24}
                    height={24}
                    className="[[aria-expanded=true]>&]:rotate-180"
                    unoptimized
                  />
                </Collapsible.Trigger>
                <Collapsible.Panel>
                  <ul className="pt-2">
                    <li>
                      <SidebarMenuButton
                        size="sub"
                        nativeButton={false}
                        role="link"
                        render={<Link href={ROUTE_PATHS.sales()} />}
                        isActive={isSales}
                        aria-current={isSales ? 'page' : undefined}
                        onClick={handleNavigate}
                      >
                        매출 대시보드
                      </SidebarMenuButton>
                    </li>
                    <li>
                      <SidebarMenuButton
                        size="sub"
                        nativeButton={false}
                        role="link"
                        render={<Link href={ROUTE_PATHS.salesDetails()} />}
                        isActive={isSalesDetail}
                        aria-current={isSalesDetail ? 'page' : undefined}
                        onClick={handleNavigate}
                      >
                        매출 내역
                      </SidebarMenuButton>
                    </li>
                  </ul>
                </Collapsible.Panel>
              </Collapsible.Root>
            </li>
            <li>
              <SidebarMenuButton disabled title="준비 중">
                <SideIcon icons={Calendar} />
                업무
              </SidebarMenuButton>
            </li>
          </ul>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <div>
          <SidebarMenuButton
            disabled={!onSettingsClick}
            onClick={onSettingsClick}
            className="text-[#737373]"
          >
            <Image src={Settings} alt="" width={24} height={24} unoptimized />
            설정
          </SidebarMenuButton>
          <SidebarMenuButton
            disabled={!onLogoutClick}
            onClick={onLogoutClick}
            className="text-[#737373]"
          >
            <Image src={Logout} alt="" width={24} height={24} unoptimized />
            로그아웃
          </SidebarMenuButton>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={!onProfileClick}
            onClick={onProfileClick}
            aria-label="내 프로필"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#ddd] bg-white-50 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed"
          >
            <span className="relative size-[38px] shrink-0">
              <Image
                src={Avatar}
                alt=""
                width={38.2815}
                height={38.2815}
                className="absolute top-0 left-[-0.2815px] max-w-none"
                unoptimized
              />
            </span>
            <span className="min-w-0 text-sm tracking-[-0.03em]">
              <span className="flex items-center font-medium text-[#333]">
                <span className="truncate">{profile?.name ?? '내 프로필'}</span>
                <Image
                  src={ProfileChevron}
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                />
              </span>
              <span className="block truncate text-[#a0a0a0]">
                {profile?.email ?? '계정 정보'}
              </span>
            </span>
          </Button>
          <NotificationButton
            aria-label="알림"
            unread={hasUnreadNotifications}
            disabled={!onNotificationsClick}
            onClick={onNotificationsClick}
            className="shrink-0"
          />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export { AppSidebar };
export type { AppSidebarProps };
