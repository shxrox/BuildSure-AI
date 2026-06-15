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


interface CanvasState {
  walls: Wall[];
  addWall: (wall: Wall) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  clearCanvas: () => void;
}


export const useCanvasStore = create<CanvasState>((set) => ({
  walls: [],
  
  addWall: (wall) => 
    set((state) => ({ walls: [...state.walls, wall] })),
    
  updateWall: (id, updates) =>
    set((state) => ({
      walls: state.walls.map((wall) =>
        wall.id === id ? { ...wall, ...updates } : wall
      ),
    })),
    
  removeWall: (id) =>
    set((state) => ({
      walls: state.walls.filter((wall) => wall.id !== id),
    })),
    
  clearCanvas: () => set({ walls: [] }),
}));