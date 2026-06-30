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
  type: 'door' | 'window' | 'plumbing' | 'electrical' | 'furniture' | 'bed' | 'stove' | 'toilet' | 'sink' | 'stairs';
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

// Brought in from our room engine
import { detectRooms, type Room } from '../utils/roomEngine';

interface Snapshot {
  walls: Wall[];
  items: CanvasItem[];
  texts: CanvasText[];
}

// NEW: Define the visibility state for our 5 main layers
export interface LayerVisibility {
  structural: boolean; // Walls, Doors, Windows, Stairs, Rooms
  furniture: boolean;  // Beds, Sofas, Stoves
  plumbing: boolean;   // Sinks, Toilets, HVAC
  electrical: boolean; // Outlets/Wiring
  annotations: boolean;// Text Labels
}

interface CanvasState {
  walls: Wall[];
  items: CanvasItem[];
  texts: CanvasText[];
  rooms: Room[]; 

  selectedId: string | null;
  activeTool: ToolType;
  wallThickness: number;
  exportTrigger: number;

  // NEW: Layer state and toggle action
  layerVisibility: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;

  save: () => void;
  undo: () => void;
  redo: () => void;

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

  exportProject: () => void;
  importProject: (jsonData: string) => void;
  
  autoDetectRooms: () => void;
}

const history = createHistory();

export const useCanvasStore = create<CanvasState>((set, get) => ({
  walls: [],
  items: [],
  texts: [],
  rooms: [],

  selectedId: null,
  activeTool: 'draw_wall',
  wallThickness: 9,
  exportTrigger: 0,

  // NEW: All layers are visible by default
  layerVisibility: {
    structural: true,
    furniture: true,
    plumbing: true,
    electrical: true,
    annotations: true,
  },

  // NEW: Toggle function
  toggleLayer: (layer) => set((state) => ({
    layerVisibility: {
      ...state.layerVisibility,
      [layer]: !state.layerVisibility[layer]
    }
  })),

  save: () => {
    const { walls, items, texts } = get();
    history.push({
      walls: structuredClone(walls),
      items: structuredClone(items),
      texts: structuredClone(texts),
    });
  },

  undo: () => {
    const current = { walls: get().walls, items: get().items, texts: get().texts };
    const prev = history.undo(current);
    set({ walls: prev.walls, items: prev.items, texts: prev.texts, selectedId: null });
  },

  redo: () => {
    const current = { walls: get().walls, items: get().items, texts: get().texts };
    const next = history.redo(current);
    set({ walls: next.walls, items: next.items, texts: next.texts, selectedId: null });
  },

  addWall: (wall) => {
    get().save();
    set((state) => ({ walls: [...state.walls, wall] }));
  },

  updateWall: (id, updates) => {
    get().save();
    set((state) => ({
      walls: state.walls.map((w) => w.id === id ? { ...w, ...updates } : w),
    }));
  },

  addItem: (item) => {
    get().save();
    set((state) => ({ items: [...state.items, item] }));
  },

  updateItem: (id, updates) => {
    get().save();
    set((state) => ({
      items: state.items.map((i) => i.id === id ? { ...i, ...updates } : i),
    }));
  },

  addText: (text) => {
    get().save();
    set((state) => ({ texts: [...state.texts, text] }));
  },

  updateText: (id, updates) => {
    get().save();
    set((state) => ({
      texts: state.texts.map((t) => t.id === id ? { ...t, ...updates } : t),
    }));
  },

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

  bringToFront: () => {
    get().save();
    const id = get().selectedId;
    if (!id) return;
    set((state) => {
      const itemIdx = state.items.findIndex(i => i.id === id);
      if (itemIdx > -1) {
        const newItems = [...state.items];
        newItems.push(newItems.splice(itemIdx, 1)[0]);
        return { items: newItems };
      }
      const textIdx = state.texts.findIndex(t => t.id === id);
      if (textIdx > -1) {
        const newTexts = [...state.texts];
        newTexts.push(newTexts.splice(textIdx, 1)[0]);
        return { texts: newTexts };
      }
      return state;
    });
  },

  sendToBack: () => {
    get().save();
    const id = get().selectedId;
    if (!id) return;
    set((state) => {
      const itemIdx = state.items.findIndex(i => i.id === id);
      if (itemIdx > -1) {
        const newItems = [...state.items];
        newItems.unshift(newItems.splice(itemIdx, 1)[0]);
        return { items: newItems };
      }
      const textIdx = state.texts.findIndex(t => t.id === id);
      if (textIdx > -1) {
        const newTexts = [...state.texts];
        newTexts.unshift(newTexts.splice(textIdx, 1)[0]);
        return { texts: newTexts };
      }
      return state;
    });
  },

  clearCanvas: () => {
    get().save();
    set({ walls: [], items: [], texts: [], selectedId: null });
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setWallThickness: (t) => set({ wallThickness: t }),
  triggerDownload: () => set((state) => ({ exportTrigger: state.exportTrigger + 1 })),

  exportProject: () => {
    const data = { walls: get().walls, items: get().items, texts: get().texts };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buildsure-project.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  importProject: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      get().save();
      set({
        walls: data.walls || [],
        items: data.items || [],
        texts: data.texts || [],
        selectedId: null,
      });
    } catch (e) {
      console.error('Invalid project file', e);
      alert("Error: Invalid project file format.");
    }
  },

  autoDetectRooms: () => {
    const { walls } = get();
    const detectedRooms = detectRooms(walls);
    set({ rooms: detectedRooms });
  },
}));