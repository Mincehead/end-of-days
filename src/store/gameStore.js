import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';

const initialState = {
  hp: 100,
  hunger: 100,
  thirst: 100,
  isDead: false,
  inventory: {
    scrap: 0,
    wood: 0,
    water: 0,
  },
  structures: [],
  isBuildMode: false,
  selectedBuildItem: 'shelter',
};

export const useGameStore = create((set) => ({
  // Player State
  ...initialState,

  // Actions
  addItem: (type, amount = 1) => set((state) => ({
    inventory: {
      ...state.inventory,
      [type]: (state.inventory[type] || 0) + amount
    }
  })),

  removeItem: (type, amount = 1) => set((state) => ({
    inventory: {
      ...state.inventory,
      [type]: Math.max(0, (state.inventory[type] || 0) - amount)
    }
  })),

  takeDamage: (amount) => set((state) => {
    const newHp = Math.max(0, state.hp - amount);
    return { hp: newHp, isDead: newHp === 0 };
  }),

  // Building State
  isBuildMode: false,
  selectedBuildItem: 'shelter', // 'shelter', 'fire'
  toggleBuildMode: () => set((state) => ({ isBuildMode: !state.isBuildMode })),
  setBuildItem: (item) => set({ selectedBuildItem: item }),

  // Structures World Data
  structures: [],
  addStructure: (position, type) => set((state) => ({
    structures: [...state.structures, { id: uuidv4(), position, type }]
  })),

  // Game Loop
  tick: () => set((state) => {
    if (state.isDead) return {};

    // Decay rates
    let newHunger = Math.max(0, state.hunger - 0.005); // Much slower
    let newThirst = Math.max(0, state.thirst - 0.008);
    let newHp = state.hp;

    // Damage from starvation/dehydration
    if (newHunger === 0 || newThirst === 0) {
      newHp = Math.max(0, state.hp - 0.1);
    }

    return {
      hunger: newHunger,
      thirst: newThirst,
      hp: newHp,
      isDead: newHp === 0
    };
  }),

  resetGame: () => set(initialState),

  // Persistence
  saveGame: async () => {
    const state = useGameStore.getState();
    const saveData = {
      hp: state.hp,
      inventory: state.inventory,
      structures: state.structures,
    };

    // Assuming a 'saves' table with 'user_id' (or just a single row for demo)
    // For specific user auth, we'd use supabase.auth.getUser()
    // Here we'll just upsert to a row acting as a "global save" for this demo or use a fixed ID

    console.log("Saving...", saveData);
    try {
      const { data, error } = await supabase
        .from('saves')
        .upsert({ id: 1, ...saveData })
        .select();

      if (error) throw error;
      console.log("Saved!", data);
      alert("Game Saved!");
    } catch (e) {
      console.error("Save failed", e);
      alert("Save failed, check console/credentials");
    }
  },

  loadGame: async () => {
    try {
      const { data, error } = await supabase
        .from('saves')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;

      if (data) {
        set((state) => ({
          ...state,
          hp: data.hp,
          inventory: data.inventory,
          structures: data.structures
        }));
        console.log("Loaded!", data);
        alert("Game Loaded!");
      }
    } catch (e) {
      console.error("Load failed", e);
      alert("Load failed or no save found");
    }
  }
}));
