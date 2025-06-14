import {
  BarChart3,
  Component,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Monitor,
  Settings,
  Shield,
  ShoppingCart,
  Users,
} from "lucide-react"
import type { SidebarItem } from "@/types/sidebar"

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    isActive: true,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    items: [
      {
        title: "Console",
        url: "/",
        id: "console",
      },
      {
        title: "Analysis",
        url: "/analysis",
        id: "analysis",
      },
    ],
  },
  {
    title: "Ecommerce",
    url: "/ecommerce",
    icon: ShoppingCart,
    id: "ecommerce",
    iconColor: "text-green-600",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    title: "User Management",
    url: "/users",
    icon: Users,
    id: "users",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    items: [
      {
        title: "Users",
        url: "/users",
        id: "users-list",
      },
      {
        title: "Roles",
        url: "/users/roles",
        id: "users-roles",
      },
    ],
  },
  {
    title: "Components",
    url: "/components",
    icon: Component,
    id: "components",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    items: [
      {
        title: "UI Components",
        url: "/components/ui",
        id: "components-ui",
      },
      {
        title: "Form Components",
        url: "/components/forms",
        id: "components-forms",
      },
    ],
  },
  {
    title: "Template Center",
    url: "/templates",
    icon: Monitor,
    id: "templates",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
    items: [
      {
        title: "Page Templates",
        url: "/templates/pages",
        id: "templates-pages",
      },
      {
        title: "Component Templates",
        url: "/templates/components",
        id: "templates-components",
      },
    ],
  },
  {
    title: "System Settings",
    url: "/settings",
    icon: Settings,
    id: "settings",
    iconColor: "text-gray-600",
    iconBg: "bg-gray-100 dark:bg-gray-900/30",
    items: [
      {
        title: "General",
        url: "/settings/general",
        id: "settings-general",
      },
      {
        title: "Security",
        url: "/settings/security",
        id: "settings-security",
      },
    ],
  },
  {
    title: "Article Management",
    url: "/articles",
    icon: FileText,
    id: "articles",
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    items: [
      {
        title: "All Articles",
        url: "/articles/all",
        id: "articles-all",
      },
      {
        title: "Categories",
        url: "/articles/categories",
        id: "articles-categories",
      },
    ],
  },
  {
    title: "Result Page",
    url: "/results",
    icon: BarChart3,
    id: "results",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    items: [
      {
        title: "Success",
        url: "/results/success",
        id: "results-success",
      },
      {
        title: "Error",
        url: "/results/error",
        id: "results-error",
      },
    ],
  },
  {
    title: "Exception",
    url: "/exception",
    icon: Shield,
    id: "exception",
    iconColor: "text-red-600",
    iconBg: "bg-red-100 dark:bg-red-900/30",
    items: [
      {
        title: "403",
        url: "/exception/403",
        id: "exception-403",
      },
      {
        title: "404",
        url: "/exception/404",
        id: "exception-404",
      },
      {
        title: "500",
        url: "/exception/500",
        id: "exception-500",
      },
    ],
  },
  {
    title: "Help Center",
    url: "/help",
    icon: HelpCircle,
    id: "help",
    iconColor: "text-pink-600",
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    items: [
      {
        title: "Documentation",
        url: "/help/docs",
        id: "help-docs",
      },
      {
        title: "FAQ",
        url: "/help/faq",
        id: "help-faq",
      },
    ],
  },
]

export const SIDEBAR_COOKIE_NAME = "sidebar:state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"
