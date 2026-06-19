import { create } from 'zustand';
import { createHistory } from './history';

export type ToolType = 'select' | 'draw_wall' | 'pan';

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

interface Snapshot {
  walls: Wall[];
  items: CanvasItem[];
  texts: CanvasText[];
}

// --- Store Interface ---
interface CanvasState {
  walls: Wall[];
  items: CanvasItem[];
  texts: CanvasText[];

  selectedId: string | null;

  activeTool: ToolType;
  wallThickness: number;

  exportTrigger: number;

  // history
  save: () => void;
  undo: () => void;
  redo: () => void;

  // actions
  addWall: (wall: Wall) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;

  addItem: (item: CanvasItem) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;

  addText: (text: CanvasText) => void;
  updateText: (id: string, updates: Partial<CanvasText>) => void;

  setSelectedId: (id: string | null) => void;
  deleteSelected: () => void;

  bringToFront: () => void;
  sendToBack: () => void;

  clearCanvas: () => void;

  setActiveTool: (tool: ToolType) => void;
  setWallThickness: (t: number) => void;

  triggerDownload: () => void;
}

const history = createHistory();

export const useCanvasStore = create<CanvasState>((set, get) => ({

  walls: [],
  items: [],
  texts: [],

  selectedId: null,

  activeTool: 'draw_wall',
  wallThickness: 9,

  exportTrigger: 0,

  // ---------------------------
  // HISTORY CORE
  // ---------------------------
  save: () => {
    const { walls, items, texts } = get();

    const snapshot: Snapshot = {
      walls: structuredClone(walls),
      items: structuredClone(items),
      texts: structuredClone(texts),
    };

    history.push(snapshot);
  },

  undo: () => {
    const current = {
      walls: get().walls,
      items: get().items,
      texts: get().texts,
    };

    const prev = history.undo(current);

    set({
      walls: prev.walls,
      items: prev.items,
      texts: prev.texts,
      selectedId: null,
    });
  },

  redo: () => {
    const current = {
      walls: get().walls,
      items: get().items,
      texts: get().texts,
    };

    const next = history.redo(current);

    set({
      walls: next.walls,
      items: next.items,
      texts: next.texts,
      selectedId: null,
    });
  },

  // ---------------------------
  // WALLS
  // ---------------------------
  addWall: (wall) => {
    get().save();
    set((state) => ({
      walls: [...state.walls, wall],
    }));
  },

  updateWall: (id, updates) => {
    get().save();
    set((state) => ({
      walls: state.walls.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  },

  // ---------------------------
  // ITEMS
  // ---------------------------
  addItem: (item) => {
    get().save();
    set((state) => ({
      items: [...state.items, item],
    }));
  },

  updateItem: (id, updates) => {
    get().save();
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));
  },

  // ---------------------------
  // TEXT
  // ---------------------------
  addText: (text) => {
    get().save();
    set((state) => ({
      texts: [...state.texts, text],
    }));
  },

  updateText: (id, updates) => {
    get().save();
    set((state) => ({
      texts: state.texts.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },

  // ---------------------------
  // SELECTION
  // ---------------------------
  setSelectedId: (id) => set({ selectedId: id }),

  deleteSelected: () => {
    get().save();

    const id = get().selectedId;

    set((state) => ({
      walls: state.walls.filter((w) => w.id !== id),
      items: state.items.filter((i) => i.id !== id),
      texts: state.texts.filter((t) => t.id !== id),
      selectedId: null,
    }));
  },

  // ---------------------------
  // ARRANGE (PLACEHOLDERS)
  // ---------------------------
  bringToFront: () => {
    // implement z-index system later if needed
  },

  sendToBack: () => {
    // implement z-index system later if needed
  },

  // ---------------------------
  // CLEAR
  // ---------------------------
  clearCanvas: () => {
    get().save();
    set({
      walls: [],
      items: [],
      texts: [],
      selectedId: null,
    });
  },

  // ---------------------------
  // TOOLING
  // ---------------------------
  setActiveTool: (tool) => set({ activeTool: tool }),

  setWallThickness: (t) => set({ wallThickness: t }),

  triggerDownload: () =>
    set((state) => ({
      exportTrigger: state.exportTrigger + 1,
    })),
}));