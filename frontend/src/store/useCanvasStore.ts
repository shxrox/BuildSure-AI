import { create } from 'zustand';

// 1. Define the architectural properties of a wall
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

// 2. NEW: Define drag-and-drop items (Doors, Windows, etc.)
export interface CanvasItem {
  id: string;
  x: number;
  y: number;
  type: 'door' | 'window' | 'plumbing' | 'electrical';
  rotation: number;
  width: number;
  height: number;
}

// 3. NEW: Define text annotations
export interface CanvasText {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  isEditing?: boolean; // Tracks if the user is currently typing
}

// Define the available actions for our drawing engine
interface CanvasState {
  walls: Wall[];
  items: CanvasItem[];
  texts: CanvasText[];
  
  // Wall Actions
  addWall: (wall: Wall) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;

  // Item Actions
  addItem: (item: CanvasItem) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  removeItem: (id: string) => void;

  // Text Actions
  addText: (text: CanvasText) => void;
  updateText: (id: string, updates: Partial<CanvasText>) => void;
  removeText: (id: string) => void;

  // Global Actions
  clearCanvas: () => void;
}

// Create the global store
export const useCanvasStore = create<CanvasState>((set) => ({
  walls: [],
  items: [],
  texts: [],
  
  // --- Wall Logic ---
  addWall: (wall) => 
    set((state) => ({ walls: [...state.walls, wall] })),
  updateWall: (id, updates) =>
    set((state) => ({
      walls: state.walls.map((wall) => wall.id === id ? { ...wall, ...updates } : wall),
    })),
  removeWall: (id) =>
    set((state) => ({ walls: state.walls.filter((wall) => wall.id !== id) })),

  // --- Item Logic ---
  addItem: (item) => 
    set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) => item.id === id ? { ...item, ...updates } : item),
    })),
  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

  // --- Text Logic ---
  addText: (text) => 
    set((state) => ({ texts: [...state.texts, text] })),
  updateText: (id, updates) =>
    set((state) => ({
      texts: state.texts.map((text) => text.id === id ? { ...text, ...updates } : text),
    })),
  removeText: (id) =>
    set((state) => ({ texts: state.texts.filter((text) => text.id !== id) })),

  // --- Global Logic ---
  clearCanvas: () => set({ walls: [], items: [], texts: [] }),
}));