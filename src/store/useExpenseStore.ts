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
import { apiAddExpense, apiDeleteExpense } from '../services/api';

interface ExpenseState {
  currentUserId: number | null;
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
  loadInitialData: (userId?: number) => Promise<void>;
  clearExpenses: () => void;
  refreshToday: (userId?: number) => Promise<void>;
  refreshAllExpenses: (userId?: number) => Promise<void>;
  createExpense: (amount: number, categoryId: number, description?: string) => Promise<void>;
  removeExpense: (id: number) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  currentUserId: null,
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

  clearExpenses: () => {
    set({
      currentUserId: null,
      todayExpenses: [],
      todayTotal: 0,
      monthTotal: 0,
      allExpenses: [],
      allTotal: 0,
      isLoading: false,
    });
  },

  loadInitialData: async (userId?: number) => {
    set({ isLoading: true });
    try {
      const categories = await fetchCategories();
      const targetUserId = userId !== undefined ? userId : get().currentUserId;

      if (!targetUserId) {
        set({
          currentUserId: null,
          categories,
          todayExpenses: [],
          todayTotal: 0,
          monthTotal: 0,
          allExpenses: [],
          allTotal: 0,
          isLoading: false,
        });
        return;
      }

      set({ currentUserId: targetUserId });

      const [todayExpenses, todayTotal, allExpenses, allTotal, monthTotal] = await Promise.all([
        fetchTodayExpenses(targetUserId),
        fetchTodayTotal(targetUserId),
        fetchAllExpenses(targetUserId),
        fetchAllTotal(targetUserId),
        fetchMonthTotal(targetUserId),
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

  refreshToday: async (userId?: number) => {
    const targetUserId = userId || get().currentUserId || undefined;
    if (!targetUserId) return;
    const [todayExpenses, todayTotal, monthTotal] = await Promise.all([
      fetchTodayExpenses(targetUserId),
      fetchTodayTotal(targetUserId),
      fetchMonthTotal(targetUserId),
    ]);
    set({ todayExpenses, todayTotal, monthTotal });
  },

  refreshAllExpenses: async (userId?: number) => {
    const targetUserId = userId || get().currentUserId || undefined;
    if (!targetUserId) return;
    const [allExpenses, allTotal, monthTotal] = await Promise.all([
      fetchAllExpenses(targetUserId),
      fetchAllTotal(targetUserId),
      fetchMonthTotal(targetUserId),
    ]);
    set({ allExpenses, allTotal, monthTotal });
  },

  createExpense: async (amount: number, categoryId: number, description?: string) => {
    const targetUserId = get().currentUserId || undefined;
    try {
      await apiAddExpense(amount, categoryId, description, targetUserId);
    } catch {}
    await insertExpense(amount, categoryId, description, targetUserId);
    await Promise.all([get().refreshToday(targetUserId), get().refreshAllExpenses(targetUserId)]);
  },

  removeExpense: async (id: number) => {
    const targetUserId = get().currentUserId || undefined;
    try {
      await apiDeleteExpense(id, targetUserId);
    } catch {}
    await deleteExpenseById(id, targetUserId);
    await Promise.all([get().refreshToday(targetUserId), get().refreshAllExpenses(targetUserId)]);
  },
}));
