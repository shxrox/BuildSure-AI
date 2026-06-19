export const createHistory = () => {
  let past: any[] = [];
  let future: any[] = [];

  return {
    push: (state: any) => {
      past.push(state);
      future = []; // New action clears redo history
    },
    undo: (currentState: any) => {
      if (past.length === 0) return currentState;
      const previous = past.pop();
      future.push(currentState);
      return previous;
    },
    redo: (currentState: any) => {
      if (future.length === 0) return currentState;
      const next = future.pop();
      past.push(currentState);
      return next;
    }
  };
};