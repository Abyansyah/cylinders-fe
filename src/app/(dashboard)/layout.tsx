import { AppSidebar } from '@/components/app-sidebar';
import { CommandPalette } from '@/components/command-palette';
import AuthProvider from '@/components/pages/auth/auth-provider';
import { TopNavigation } from '@/components/top-navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CommandPaletteProvider } from '@/hooks/use-command-palette';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AuthProvider>
        <CommandPaletteProvider>
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full overflow-hidden">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <TopNavigation />
                <main className="flex-1 p-3 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50 overflow-auto pt-16">
                  <div className="max-w-full">{children}</div>
                </main>
              </div>
            </div>
            <CommandPalette />
          </SidebarProvider>
        </CommandPaletteProvider>
      </AuthProvider>
    </>
  );
}
