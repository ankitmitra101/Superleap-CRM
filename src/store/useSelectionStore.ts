import { create } from 'zustand';

interface SelectionState {
  // Explicitly type the Set as containing strings (IDs)
  selectedIds: Set<string>; 
  toggleId: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedIds: new Set<string>(), // Initialize with explicit type
  toggleId: (id) => set((state) => {
    const next = new Set(state.selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return { selectedIds: next };
  }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clear: () => set({ selectedIds: new Set<string>() }),
}));
