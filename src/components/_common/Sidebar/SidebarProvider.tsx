'use client';

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
} from 'react';
import type { ComponentProps } from 'react';

import { cn } from '@lib/utilities/cn';

interface SidebarContextValue {
  isOpen: boolean;
  isCompact: boolean;
  isOverlayOpen: boolean;
  panelId: string;
  setIsOverlayOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);
const COMPACT_QUERY = '(width < 120rem)';
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const getSnapshot = () => window.matchMedia(COMPACT_QUERY).matches;
const getServerSnapshot = () => false;

interface SidebarProviderProps extends ComponentProps<'div'> {
  isDefaultOpen?: boolean;
}

function SidebarProvider({
  isDefaultOpen = true,
  className,
  children,
  ...props
}: SidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const isCompact = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const panelId = useId();
  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const handleViewportChange = () => {
      if (!query.matches) setIsOverlayOpen(false);
    };
    query.addEventListener('change', handleViewportChange);
    return () => query.removeEventListener('change', handleViewportChange);
  }, []);
  const toggleSidebar = () => {
    if (isCompact) setIsOverlayOpen((previous) => !previous);
    else setIsOpen((previous) => !previous);
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCompact,
        isOverlayOpen,
        panelId,
        setIsOverlayOpen,
        toggleSidebar,
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        className={cn('flex min-h-dvh w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error('SidebarProvider 안에서 Sidebar를 사용해야 합니다.');
  return context;
};

export { SidebarProvider, useSidebar };
