import { create } from 'zustand';

export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  thickness: number;
  height: number;
  type: 'external' | 'internal';
}

export interface CanvasItem {
  id: string;
  x: number;
  y: number;
  type: 'door' | 'window' | 'plumbing' | 'electrical' | 'furniture';
  rotation: number;
  width: number;
  height: number;
}

export interface CanvasText {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

interface CanvasState {
  walls: Wall[];
  items: CanvasItem[];
  texts: CanvasText[];
  selectedId: string | null; // Tracks which item the user has clicked on
  
  // Base Actions
  addWall: (wall: Wall) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  addItem: (item: CanvasItem) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  addText: (text: CanvasText) => void;
  updateText: (id: string, updates: Partial<CanvasText>) => void;
  
  // Advanced Actions
  setSelectedId: (id: string | null) => void;
  deleteSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  walls: [],
  items: [],
  texts: [],
  selectedId: null,

  addWall: (wall) => set((state) => ({ walls: [...state.walls, wall] })),
  updateWall: (id, updates) => set((state) => ({
    walls: state.walls.map((w) => w.id === id ? { ...w, ...updates } : w),
  })),

  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((i) => i.id === id ? { ...i, ...updates } : i),
  })),

  addText: (text) => set((state) => ({ texts: [...state.texts, text] })),
  updateText: (id, updates) => set((state) => ({
    texts: state.texts.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),

  // --- Advanced Tools ---
  setSelectedId: (id) => set({ selectedId: id }),

  // Deletes whatever is currently selected
  deleteSelected: () => set((state) => ({
    walls: state.walls.filter(w => w.id !== state.selectedId),
    items: state.items.filter(i => i.id !== state.selectedId),
    texts: state.texts.filter(t => t.id !== state.selectedId),
    selectedId: null 
  })),

  // Moves selected item to the end of the array so it renders on top
  bringToFront: () => set((state) => {
    if (!state.selectedId) return state;
    
    const itemIndex = state.items.findIndex(i => i.id === state.selectedId);
    if (itemIndex > -1) {
      const newItems = [...state.items];
      newItems.push(newItems.splice(itemIndex, 1)[0]);
      return { items: newItems };
    }

    const textIndex = state.texts.findIndex(t => t.id === state.selectedId);
    if (textIndex > -1) {
      const newTexts = [...state.texts];
      newTexts.push(newTexts.splice(textIndex, 1)[0]);
      return { texts: newTexts };
    }
    return state;
  }),

  // Moves selected item to the beginning of the array so it renders underneath
  sendToBack: () => set((state) => {
    if (!state.selectedId) return state;
    
    const itemIndex = state.items.findIndex(i => i.id === state.selectedId);
    if (itemIndex > -1) {
      const newItems = [...state.items];
      newItems.unshift(newItems.splice(itemIndex, 1)[0]);
      return { items: newItems };
    }

    const textIndex = state.texts.findIndex(t => t.id === state.selectedId);
    if (textIndex > -1) {
      const newTexts = [...state.texts];
      newTexts.unshift(newTexts.splice(textIndex, 1)[0]);
      return { texts: newTexts };
    }
    return state;
  }),

  clearCanvas: () => set({ walls: [], items: [], texts: [], selectedId: null }),
}));