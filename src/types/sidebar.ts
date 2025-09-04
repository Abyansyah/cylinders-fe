import type React from 'react';

export interface SidebarItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  id?: string;
  isActive?: boolean;
  iconColor?: string;
  iconBg?: string;
  items?: SidebarSubItem[];
  permissionKey?: string;
  onlyPermission?: boolean;
}

export interface SidebarSubItem {
  title: string;
  url: string;
  id: string;
  icon?: React.ElementType;
  permissionKey?: string;
  onlyPermission?: boolean;
}
