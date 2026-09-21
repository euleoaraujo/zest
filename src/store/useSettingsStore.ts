import { create } from 'zustand';
import { updateUserDailyGoal } from '../database/db';
import { apiUpdateDailyGoal } from '../services/api';

export type SupportedCurrency = 'BRL' | 'USD' | 'EUR' | 'GBP';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface CurrencyOption {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  label: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileiro', label: 'BRL (R$)' },
  { code: 'USD', symbol: '$', name: 'Dólar Americano', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina', label: 'GBP (£)' },
];

export interface ThemeOption {
  mode: ThemeMode;
  title: string;
  icon: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { mode: 'dark', title: 'Escuro', icon: 'moon-outline', description: 'Tema Dark Bento' },
  { mode: 'light', title: 'Claro', icon: 'sunny-outline', description: 'Tema Light Bento (#EDFCD4)' },
  { mode: 'system', title: 'Automático', icon: 'phone-portrait-outline', description: 'Conforme o sistema' },
];

interface SettingsState {
  currency: SupportedCurrency;
  dailyGoal: number;
  themeMode: ThemeMode;
  setCurrency: (currency: SupportedCurrency) => void;
  setDailyGoal: (goal: number, userId?: number) => Promise<void>;
  setThemeMode: (themeMode: ThemeMode) => void;
  getCurrencyLabel: () => string;
  getCurrencySymbol: () => string;
  getThemeLabel: () => string;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currency: 'BRL',
  dailyGoal: 350,
  themeMode: 'dark',

  setCurrency: (currency: SupportedCurrency) => {
    set({ currency });
  },

  setDailyGoal: async (dailyGoal: number, userId?: number) => {
    const safeGoal = Math.max(0, dailyGoal);
    set({ dailyGoal: safeGoal });

    if (userId && userId > 0) {
      try {
        await updateUserDailyGoal(userId, safeGoal);
      } catch (e) {
        console.warn('Erro ao salvar meta diária no SQLite:', e);
      }

      try {
        await apiUpdateDailyGoal(userId, safeGoal);
      } catch (e) {
        console.warn('Erro ao salvar meta diária no MySQL:', e);
      }
    }
  },

  setThemeMode: (themeMode: ThemeMode) => {
    set({ themeMode });
  },

  getCurrencyLabel: () => {
    const current = get().currency;
    const found = CURRENCY_OPTIONS.find((c) => c.code === current);
    return found ? found.label : 'BRL (R$)';
  },

  getCurrencySymbol: () => {
    const current = get().currency;
    const found = CURRENCY_OPTIONS.find((c) => c.code === current);
    return found ? found.symbol : 'R$';
  },

  getThemeLabel: () => {
    const current = get().themeMode;
    const found = THEME_OPTIONS.find((t) => t.mode === current);
    return found ? found.title : 'Escuro';
  },
}));
