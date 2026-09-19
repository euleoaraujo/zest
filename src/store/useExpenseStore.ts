import { create } from 'zustand';
import { Category, ExpenseWithCategory } from '../types';
import {
  fetchCategories,
  fetchTodayExpenses,
  fetchTodayTotal,
  insertExpense,
  deleteExpenseById,
} from '../database/db';

interface ExpenseState {
  categories: Category[];
  todayExpenses: ExpenseWithCategory[];
  todayTotal: number;
  isLoading: boolean;
  isQuickExpenseOpen: boolean;
  selectedCategory: Category | null;
  openQuickExpense: (category?: Category) => void;
  closeQuickExpense: () => void;
  setSelectedCategory: (category: Category | null) => void;
  loadInitialData: () => Promise<void>;
  refreshToday: () => Promise<void>;
  createExpense: (amount: number, categoryId: number, description?: string) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  categories: [],
  todayExpenses: [],
  todayTotal: 0,
  isLoading: true,
  isQuickExpenseOpen: false,
  selectedCategory: null,

  openQuickExpense: (category?: Category) => {
    const fallbackCategory = category || get().categories[0] || null;
    set({
      isQuickExpenseOpen: true,
      selectedCategory: fallbackCategory,
    });
  },

  closeQuickExpense: () => {
    set({
      isQuickExpenseOpen: false,
    });
  },

  setSelectedCategory: (category: Category | null) => {
    set({ selectedCategory: category });
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const categories = await fetchCategories();
      const [todayExpenses, todayTotal] = await Promise.all([
        fetchTodayExpenses(),
        fetchTodayTotal(),
      ]);
      set({
        categories,
        todayExpenses,
        todayTotal,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  refreshToday: async () => {
    const [todayExpenses, todayTotal] = await Promise.all([
      fetchTodayExpenses(),
      fetchTodayTotal(),
    ]);
    set({ todayExpenses, todayTotal });
  },

  createExpense: async (amount: number, categoryId: number, description?: string) => {
    await insertExpense(amount, categoryId, description);
    await get().refreshToday();
  },

  removeExpense: async (id: number) => {
    await deleteExpenseById(id);
    await get().refreshToday();
  },
}));
