'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import { useCommandPalette } from '@/hooks/use-command-palette';
import { SIDEBAR_ITEMS } from '@/constants/sidebar';

export function CommandPalette() {
  const { isOpen, closeCommandPalette } = useCommandPalette();
  const router = useRouter();
  const pathname = usePathname();

  // Generate commands from sidebar items
  const commands = React.useMemo(() => {
    const allCommands: Array<{
      title: string;
      icon: React.ElementType;
      action: string;
      iconColor?: string;
      iconBg?: string;
      isActive: boolean;
    }> = [];

    SIDEBAR_ITEMS.forEach((item) => {
      if (item.items) {
        // Add sub-items
        item.items.forEach((subItem) => {
          const isActive = pathname === subItem.url || (pathname.startsWith(subItem.url + '/') && subItem.url !== '/');
          allCommands.push({
            title: `${item.title} - ${subItem.title}`,
            icon: item.icon!,
            action: subItem.url,
            iconColor: item.iconColor,
            iconBg: item.iconBg,
            isActive,
          });
        });
      } else {
        // Add main item
        const isActive = pathname === item.url || (pathname.startsWith(item.url + '/') && item.url !== '/');
        allCommands.push({
          title: item.title,
          icon: item.icon!,
          action: item.url,
          iconColor: item.iconColor,
          iconBg: item.iconBg,
          isActive,
        });
      }
    });

    return [
      {
        group: 'Navigation',
        items: allCommands,
      },
    ];
  }, [pathname]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      closeCommandPalette();
      command();
    },
    [closeCommandPalette]
  );

  return (
    <CommandDialog open={isOpen} onOpenChange={closeCommandPalette}>
      <DialogTitle className="sr-only">Command Palette</DialogTitle>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {commands.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.title}
                onSelect={() => {
                  runCommand(() => router.push(item.action));
                }}
                className={item.isActive ? 'bg-accent text-accent-foreground' : ''}
              >
                <div className={`mr-2 h-5 w-5 rounded-lg p-1 ${item.iconBg || 'bg-gray-100 dark:bg-gray-800'}`}>
                  <item.icon className={`h-3 w-3 ${item.iconColor || 'text-gray-600'}`} />
                </div>
                <span>{item.title}</span>
                {item.isActive && <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
