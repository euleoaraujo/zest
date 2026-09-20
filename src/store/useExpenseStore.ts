import { create } from 'zustand';
import { Category, ExpenseWithCategory } from '../types';
import {
  fetchCategories,
  fetchTodayExpenses,
  fetchTodayTotal,
  fetchAllExpenses,
  fetchAllTotal,
  fetchMonthTotal,
  insertExpense,
  deleteExpenseById,
} from '../database/db';

interface ExpenseState {
  categories: Category[];
  todayExpenses: ExpenseWithCategory[];
  todayTotal: number;
  monthTotal: number;
  allExpenses: ExpenseWithCategory[];
  allTotal: number;
  isLoading: boolean;
  isQuickExpenseOpen: boolean;
  isAllExpensesOpen: boolean;
  selectedCategory: Category | null;
  openQuickExpense: (category?: Category) => void;
  closeQuickExpense: () => void;
  openAllExpenses: () => void;
  closeAllExpenses: () => void;
  setSelectedCategory: (category: Category | null) => void;
  loadInitialData: () => Promise<void>;
  refreshToday: () => Promise<void>;
  refreshAllExpenses: () => Promise<void>;
  createExpense: (amount: number, categoryId: number, description?: string) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  categories: [],
  todayExpenses: [],
  todayTotal: 0,
  monthTotal: 0,
  allExpenses: [],
  allTotal: 0,
  isLoading: true,
  isQuickExpenseOpen: false,
  isAllExpensesOpen: false,
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

  openAllExpenses: async () => {
    await get().refreshAllExpenses();
    set({ isAllExpensesOpen: true });
  },

  closeAllExpenses: () => {
    set({ isAllExpensesOpen: false });
  },

  setSelectedCategory: (category: Category | null) => {
    set({ selectedCategory: category });
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    try {
      const categories = await fetchCategories();
      const [todayExpenses, todayTotal, allExpenses, allTotal, monthTotal] = await Promise.all([
        fetchTodayExpenses(),
        fetchTodayTotal(),
        fetchAllExpenses(),
        fetchAllTotal(),
        fetchMonthTotal(),
      ]);
      set({
        categories,
        todayExpenses,
        todayTotal,
        monthTotal,
        allExpenses,
        allTotal,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  refreshToday: async () => {
    const [todayExpenses, todayTotal, monthTotal] = await Promise.all([
      fetchTodayExpenses(),
      fetchTodayTotal(),
      fetchMonthTotal(),
    ]);
    set({ todayExpenses, todayTotal, monthTotal });
  },

  refreshAllExpenses: async () => {
    const [allExpenses, allTotal, monthTotal] = await Promise.all([
      fetchAllExpenses(),
      fetchAllTotal(),
      fetchMonthTotal(),
    ]);
    set({ allExpenses, allTotal, monthTotal });
  },

  createExpense: async (amount: number, categoryId: number, description?: string) => {
    await insertExpense(amount, categoryId, description);
    await Promise.all([get().refreshToday(), get().refreshAllExpenses()]);
  },

  removeExpense: async (id: number) => {
    await deleteExpenseById(id);
    await Promise.all([get().refreshToday(), get().refreshAllExpenses()]);
  },
}));
