export interface Tab {
  id: string
  title: string
  path: string
  isPinned?: boolean
}

export interface TabsContextType {
  tabs: Tab[]
  activeTab: string
  addTab: (tab: Omit<Tab, "isPinned">) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  pinTab: (id: string) => void
  unpinTab: (id: string) => void
  closeAllTabs: () => void
  closeOtherTabs: (id: string) => void
  closeTabsToRight: (id: string) => void
}
