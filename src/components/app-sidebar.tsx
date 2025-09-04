'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
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
import Image from 'next/image';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { checkPermission } = usePermission();
  const pathname = usePathname();
  const router = useRouter();
  const { state, setOpenMobile, openMobile } = useSidebar();
  const { expandedGroup, setExpandedGroup } = useSidebarMenu();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role.role_name === 'Super Admin';
  const [isMobile, setIsMobile] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    if (isMobile) {
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

  const filteredMenuItems = React.useMemo(() => {
    if (!searchQuery) return accessibleMenuItems;

    return accessibleMenuItems
      .map((item) => {
        if (item.items && item.items.length > 0) {
          const filteredSubItems = item.items.filter((subItem) => subItem.title.toLowerCase().includes(searchQuery.toLowerCase()));
          if (filteredSubItems.length > 0) {
            return { ...item, items: filteredSubItems };
          }
        }
        if (item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return item;
        }
        return null;
      })
      .filter(Boolean) as SidebarItem[];
  }, [accessibleMenuItems, searchQuery]);

  if (!isMobile) {
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0">
              <Image src={'/logo-KAP.png'} width={40} height={40} alt={'Karya Agung Pratama'} />
            </div>
            <AnimatePresence>
              {state === 'expanded' && (
                <motion.span className="font-semibold text-lg whitespace-nowrap" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }}>
                  Karya Agung Pratama
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
                                    className={`flex w-full items-center rounded-md px-2 py-2 text-sm ${
                                      isSubItemActive(subItem.url) ? 'bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/20' : ' hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
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

  return (
    <>
      <AnimatePresence>{openMobile && <motion.div className="fixed inset-0 bg-black/50 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenMobile(false)} />}</AnimatePresence>

      <AnimatePresence>
        {openMobile && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[80vh] md:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                  <Image src={'/logo-KAP.png'} width={32} height={32} alt={'Karya Agung Pratama'} />
                </div>
                <span className="font-semibold text-lg">Menu</span>
              </div>
              <button onClick={() => setOpenMobile(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari Menu?"
                    className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {filteredMenuItems.map((item) => (
                  <div key={item.title}>
                    {item.items && item.items.length > 0 ? (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">{item.title}</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.title}
                              onClick={() => handleNavigation(subItem)}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                                isSubItemActive(subItem.url)
                                  ? 'bg-blue-50 border-2 border-blue-200 shadow-sm dark:bg-blue-900/20 dark:border-blue-700'
                                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-105'
                              }`}
                            >
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-2 ${isSubItemActive(subItem.url) ? 'bg-blue-500 text-white' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                {subItem.icon ? (
                                  <subItem.icon className={`h-6 w-6 ${isSubItemActive(subItem.url) ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                                ) : (
                                  <div className={`w-6 h-6 rounded-lg ${isSubItemActive(subItem.url) ? 'bg-white/20' : 'bg-blue-500'}`} />
                                )}
                              </div>
                              <span className={`text-xs font-medium text-center leading-tight ${isSubItemActive(subItem.url) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{subItem.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">{item.title}</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            onClick={() => handleNavigation(item)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 ${
                              pathname === item.url
                                ? 'bg-blue-50 border-2 border-blue-200 shadow-sm dark:bg-blue-900/20 dark:border-blue-700'
                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-105'
                            }`}
                          >
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-2 ${pathname === item.url ? 'bg-blue-500 text-white' : item.iconBg || 'bg-blue-100 dark:bg-blue-900/30'}`}>
                              {item.icon ? (
                                <item.icon className={`h-6 w-6 ${pathname === item.url ? 'text-white' : item.iconColor || 'text-blue-600 dark:text-blue-400'}`} />
                              ) : (
                                <div className={`w-6 h-6 rounded-lg ${pathname === item.url ? 'bg-white/20' : 'bg-blue-500'}`} />
                              )}
                            </div>
                            <span className={`text-xs font-medium text-center leading-tight ${pathname === item.url ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.title}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <circle cx="12" cy="6" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="18" r="1" />
                      </svg>
                    </button>
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
