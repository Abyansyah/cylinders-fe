'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Triangle } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, useSidebarMenu } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';
import { useAuthStore } from '@/stores/authStore';
import { logoutAction } from '@/lib/actions';
import type { SidebarItem } from '@/types/sidebar';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/config/permissions';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { checkPermission } = usePermission();
  const pathname = usePathname();
  const router = useRouter();
  const { state, setOpenMobile } = useSidebar();
  const { expandedGroup, setExpandedGroup } = useSidebarMenu();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role.role_name === 'Super Admin';

  React.useEffect(() => {
    const currentGroup = SIDEBAR_ITEMS.find((item) => item.items?.some((subItem) => pathname === subItem.url || (pathname.startsWith(subItem.url + '/') && subItem.url !== '/')));

    if (currentGroup && currentGroup.title) {
      setExpandedGroup(currentGroup.title);
    } else {
      setExpandedGroup(null);
    }
  }, [pathname, setExpandedGroup]);

  const handleNavigation = (item: any) => {
    router.push(item.url);
    if (window.innerWidth < 768) {
      setOpenMobile(false);
    }
  };

  const isItemActive = (item: any) => {
    if (item.items) {
      return item.items.some((subItem: any) => {
        return pathname === subItem.url || (pathname.startsWith(subItem.url + '/') && subItem.url !== '/');
      });
    }
    return pathname === item.url || (pathname.startsWith(item.url + '/') && item.url !== '/');
  };

  const isSubItemActive = (url: string) => {
    return pathname === url || (pathname.startsWith(url + '/') && url !== '/');
  };

  const accessibleMenuItems = React.useMemo(() => {
    return SIDEBAR_ITEMS.map((item) => {
      if (item.onlyPermission && isSuperAdmin) {
        return null;
      }

      if (item.items) {
        const accessibleSubItems = item.items.filter((subItem) => {
          if (subItem.onlyPermission && isSuperAdmin) return false;
          if (!subItem.permissionKey) return true;

          const permissionConfig: any = PERMISSIONS[subItem.permissionKey as keyof typeof PERMISSIONS];
          const requiredPermission = permissionConfig?.view || permissionConfig?.view_all;
          return checkPermission(requiredPermission);
        });

        return { ...item, items: accessibleSubItems };
      }

      if (item.permissionKey) {
        const permissionConfig: any = PERMISSIONS[item.permissionKey as keyof typeof PERMISSIONS];
        const requiredPermission = permissionConfig?.view || permissionConfig?.view_all;
        return checkPermission(requiredPermission) ? item : null;
      }

      return item;
    }).filter((item): item is SidebarItem => {
      if (!item) return false;
      if (item.items && item.items.length === 0) return false;
      return true;
    });
  }, [checkPermission, isSuperAdmin]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <motion.div
          className="flex items-center gap-3 px-3 py-2"
          initial={false}
          animate={{
            justifyContent: state === 'collapsed' ? 'center' : 'flex-start',
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white flex-shrink-0">
            <Triangle className="h-4 w-4" />
          </div>
          <AnimatePresence>
            {state === 'expanded' && (
              <motion.span className="font-semibold text-lg whitespace-nowrap" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
                Art Design Pro
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarMenu>
            {accessibleMenuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.items ? (
                  state === 'collapsed' ? (
                    <HoverCard openDelay={100} closeDelay={200}>
                      <HoverCardTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isItemActive(item)}
                          className={`h-10 justify-center ${isItemActive(item) ? 'bg-blue-50 dark:bg-blue-900/20' : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
                          onClick={() => {
                            if (item.items && item.items.length > 0) {
                              handleNavigation(item.items[0]);
                            }
                          }}
                        >
                          {item.icon && (
                            <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${item.iconBg || 'bg-gray-100 dark:bg-gray-800'}`}>
                              <item.icon className={`h-4 w-4 ${item.iconColor || 'text-gray-600'}`} />
                            </div>
                          )}
                        </SidebarMenuButton>
                      </HoverCardTrigger>
                      <HoverCardContent side="right" align="start" className="w-48 p-2 bg-background border shadow-lg ml-2" sideOffset={8}>
                        <div className="space-y-1">
                          <div className="font-medium text-sm px-2 py-1 flex items-center gap-2 border-b border-border pb-2 mb-2">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-lg ${item.iconBg || 'bg-gray-100 dark:bg-gray-800'}`}>
                              {item.icon && <item.icon className={`h-4 w-4 ${item.iconColor || 'text-gray-600'}`} />}
                            </div>
                            {item.title}
                          </div>
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.title}
                              onClick={() => handleNavigation(subItem)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                                isSubItemActive(subItem.url) ? 'text-blue-600 font-medium bg-blue-50 dark:bg-blue-900/20' : 'text-muted-foreground'
                              }`}
                            >
                              {subItem.title}
                            </button>
                          ))}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <Collapsible
                      asChild
                      open={expandedGroup === item.title}
                      onOpenChange={(isOpen: any) => {
                        if (isOpen) {
                          setExpandedGroup(item.title);
                        } else {
                          setExpandedGroup(null);
                        }
                      }}
                      className="group/collapsible"
                    >
                      <div className="relative">
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title} isActive={isItemActive(item)} className={`h-10 ${isItemActive(item) ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                            {item.icon && (
                              <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${item.iconBg || 'bg-gray-100 dark:bg-gray-800'} mr-2`}>
                                <item.icon className={`h-4 w-4 ${item.iconColor || 'text-gray-600'}`} />
                              </div>
                            )}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                          <motion.div className="relative py-1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                            <div className="space-y-1">
                              {item.items?.map((subItem) => (
                                <motion.button
                                  key={subItem.title}
                                  onClick={() => handleNavigation(subItem)}
                                  className={`flex w-full items-center rounded-md px-2 py-2 text-sm ${isSubItemActive(subItem.url) ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20' : ' hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.2, delay: 0.1 }}
                                >
                                  <span className="ml-10">{subItem.title}</span>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                    className={`h-10 ${state === 'collapsed' ? 'justify-center' : ''} ${pathname === item.url ? '!bg-blue-600 !text-white !hover:bg-blue-700' : ''} hover:bg-gray-100 dark:hover:bg-gray-800`}
                  >
                    <button onClick={() => handleNavigation(item)}>
                      {item.icon && (
                        <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${state === 'expanded' ? 'mr-2' : ''}`}>
                          <item.icon className={`h-4 w-4`} />
                        </div>
                      )}
                      {state === 'expanded' && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <AnimatePresence>
                    {state === 'expanded' && (
                      <motion.div
                        className="flex items-center justify-between flex-1 min-w-0"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="ml-auto"
                    initial={false}
                    animate={{
                      opacity: state === 'expanded' ? 1 : 0,
                      scale: state === 'expanded' ? 1 : 0,
                    }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <circle cx="12" cy="6" r="1" />
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="18" r="1" />
                    </svg>
                  </motion.div>
                </SidebarMenuButton>
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
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <form action={logoutAction}>
                    <button type="submit" className="flex items-center w-full cursor-pointer">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        Log out
                      </span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
