import { create } from "zustand"

interface UiState {
  communitySidebarOpen: boolean
  toggleCommunitySidebar: () => void
  setCommunitySidebarOpen: (open: boolean) => void
  // Mobile overlay state
  communitySidebarMobileOpen: boolean
  toggleCommunitySidebarMobile: () => void
  setCommunitySidebarMobileOpen: (open: boolean) => void
  // Teacher / faculty filter in community
  selectedTeacher: string | null
  setSelectedTeacher: (teacher: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  communitySidebarOpen: true,
  toggleCommunitySidebar: () =>
    set((state) => ({ communitySidebarOpen: !state.communitySidebarOpen })),
  setCommunitySidebarOpen: (open) => set({ communitySidebarOpen: open }),

  communitySidebarMobileOpen: false,
  toggleCommunitySidebarMobile: () =>
    set((state) => ({
      communitySidebarMobileOpen: !state.communitySidebarMobileOpen,
    })),
  setCommunitySidebarMobileOpen: (open) =>
    set({ communitySidebarMobileOpen: open }),

  selectedTeacher: null,
  setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
}))
