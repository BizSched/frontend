import { SidebarInset } from '@components/_common/Sidebar/SidebarInset';
import { SidebarProvider } from '@components/_common/Sidebar/SidebarProvider';
import { AppSidebarContainer } from '@components/Sidebar/AppSidebarContainer';

export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <SidebarProvider className="bg-slate-50">
      <AppSidebarContainer />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
