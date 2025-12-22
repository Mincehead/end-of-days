import { create } from 'zustand';

export const useInputStore = create((set) => ({
    move: { x: 0, y: 0 },
    look: { x: 0, y: 0 },
    actions: {
        attack: false,
        build: false,
        jump: false,
    },

    setMove: (x, y) => set({ move: { x, y } }),
    setLook: (x, y) => set({ look: { x, y } }),
    setAction: (action, value) => set((state) => ({
        actions: { ...state.actions, [action]: value }
    })),
}));
