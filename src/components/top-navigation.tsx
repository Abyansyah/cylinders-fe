'use client';
import { motion } from 'framer-motion';
import React from 'react';

import { Minimize, Maximize, Search, Sun, Moon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { useFullscreen } from '@/hooks/use-fullscreen';
import { useTheme } from '@/hooks/use-theme';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';
import { useAuthStore } from '@/stores/authStore';
import { logoutAction } from '@/lib/actions';
import { useCurrentUser } from '@/hooks/use-current-user';

export function TopNavigation() {
  const { state } = useSidebar();
  const { openCommandPalette } = useCommandPalette();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    if (paths.length === 0) return [{ title: 'Dashboard', path: '/' }];

    const breadcrumbs = [{ title: 'Dashboard', path: '/' }];

    let currentPath = '';
    for (const segment of paths) {
      currentPath += `/${segment}`;

      let title = segment.charAt(0).toUpperCase() + segment.slice(1);

      for (const item of SIDEBAR_ITEMS) {
        if (item.url === currentPath) {
          title = item.title;
          break;
        }

        if (item.items) {
          const subItem = item.items.find((sub) => sub.url === currentPath);
          if (subItem) {
            title = subItem.title;
            break;
          }
        }
      }

      breadcrumbs.push({ title, path: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const { mutate: mutateUser } = useCurrentUser();

  const handleLogout = async () => {
    await mutateUser(undefined, { revalidate: false });
    await logoutAction();
  };

  return (
    <div className="border-b bg-background sticky top-0 left-0 right-0 z-50 md:left-[var(--sidebar-width)] md:group-data-[collapsible=icon]:left-[var(--sidebar-width-icon)] md:group-data-[collapsible=offcanvas]:left-0 transition-[left] duration-200 ease-linear">
      <motion.header
        className="flex h-16 shrink-0 items-center gap-2 px-4"
        initial={false}
        animate={{
          paddingLeft: state === 'collapsed' ? '1rem' : '1rem',
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />

          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index > 0 && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                  <BreadcrumbItem>{index === breadcrumbs.length - 1 ? <span className="font-medium">{crumb.title}</span> : <BreadcrumbLink href={crumb.path}>{crumb.title}</BreadcrumbLink>}</BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search" className="w-48 lg:w-64 pl-8 pr-12" onClick={openCommandPalette} readOnly />
            <kbd className="pointer-events-none absolute right-2.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 lg:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="h-8 w-8">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Hide fullscreen on mobile, show on desktop */}
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8 hidden md:flex">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
                  </svg>
                  Account
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  Billing
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  </svg>
                  Notifications
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" x2="9" y1="12" y2="12" />
                  </svg>
                  Log out
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </div>
  );
}
