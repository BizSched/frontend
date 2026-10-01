import { SidebarInset } from '@components/_common/Sidebar/SidebarInset';
import { SidebarProvider } from '@components/_common/Sidebar/SidebarProvider';
import { AppSidebar } from '@components/Sidebar/AppSidebar';

export default function MainLayout({ children }: LayoutProps<'/'>) {
  return (
    <SidebarProvider className="bg-slate-50">
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
