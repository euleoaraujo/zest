import { create } from 'zustand';
import { User } from '../types';
import {
  createUser,
  authenticateUser,
  findUserByEmail,
  updateUserPassword,
  updateUserProfile,
  getActiveSession,
  saveSession,
  clearSession,
} from '../database/db';
import {
  apiSignup,
  apiLogin,
  apiResetPassword,
  apiSocialLogin,
  apiCheckSession,
  apiLogout,
  apiUpdateProfile,
} from '../services/api';
import { useExpenseStore } from './useExpenseStore';
import { useSettingsStore } from './useSettingsStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; notFound?: boolean }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  updateProfile: (name: string, email: string, newPassword?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  loginWithSocial: (provider: 'apple' | 'google') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkSession: async () => {
    try {
      set({ isLoading: true });

      // 1. Tenta recuperar sessão no MySQL primeiro
      const remote = await apiCheckSession();
      if (remote.success && remote.authenticated && remote.user) {
        set({ user: remote.user, isAuthenticated: true, isLoading: false });
        useSettingsStore.setState({ dailyGoal: remote.user.daily_goal ?? 350 });
        await useExpenseStore.getState().loadInitialData(remote.user.id);
        return;
      }

      // 2. Fallback para sessão local no SQLite
      const user = await getActiveSession();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        useSettingsStore.setState({ dailyGoal: user.daily_goal ?? 350 });
        await useExpenseStore.getState().loadInitialData(user.id);
      } else {
        useExpenseStore.getState().clearExpenses();
        useSettingsStore.setState({ dailyGoal: 350 });
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      useExpenseStore.getState().clearExpenses();
      useSettingsStore.setState({ dailyGoal: 350 });
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      if (!email.trim() || !password.trim()) {
        return { success: false, notFound: false, message: 'Preencha o e-mail e a senha.' };
      }

      // 1. Autentica no MySQL via API PHP
      const apiRes = await apiLogin(email, password);
      if (apiRes.success && apiRes.user) {
        const user = apiRes.user;
        try {
          const localExists = await findUserByEmail(email);
          if (!localExists) {
            await createUser(user.name, user.email, password);
          }
          await saveSession(user.id);
        } catch {}

        set({ user, isAuthenticated: true });
        useSettingsStore.setState({ dailyGoal: user.daily_goal ?? 350 });
        await useExpenseStore.getState().loadInitialData(user.id);
        return { success: true };
      }

      // Conta não existe no MySQL
      if (apiRes.notFound) {
        return { success: false, notFound: true, message: 'Conta não encontrada com este e-mail.' };
      }

      // Se a API deu erro de credenciais inválidas (ex: senha incorreta)
      if (apiRes.message && !apiRes.message.includes('Erro ao conectar') && !apiRes.message.includes('Não foi possível conectar')) {
        return { success: false, notFound: false, message: apiRes.message };
      }

      // 2. Fallback para SQLite local
      const localExists = await findUserByEmail(email);
      if (!localExists) {
        return { success: false, notFound: true, message: 'Conta não encontrada com este e-mail.' };
      }

      const localUser = await authenticateUser(email, password);
      if (!localUser) {
        return { success: false, notFound: false, message: 'Senha incorreta. Verifique e tente novamente.' };
      }

      await saveSession(localUser.id);
      set({ user: localUser, isAuthenticated: true });
      useSettingsStore.setState({ dailyGoal: localUser.daily_goal ?? 350 });
      await useExpenseStore.getState().loadInitialData(localUser.id);
      return { success: true };
    } catch {
      return { success: false, notFound: false, message: 'Erro ao realizar login. Tente novamente.' };
    }
  },

  signup: async (name: string, email: string, password: string) => {
    try {
      if (!name.trim() || !email.trim() || !password.trim()) {
        return { success: false, message: 'Preencha todos os campos.' };
      }

      // 1. Envia para o MySQL (XAMPP) via API PHP
      const apiRes = await apiSignup(name, email, password);
      if (!apiRes.success || !apiRes.user) {
        return { success: false, message: apiRes.message || 'Erro ao cadastrar no banco MySQL.' };
      }

      const newUser: User = apiRes.user;

      // 2. Mantém o SQLite local sincronizado para redundância
      try {
        const localExists = await findUserByEmail(email);
        if (!localExists) {
          await createUser(name, email, password);
        }
        await saveSession(newUser.id);
      } catch {}

      set({ user: newUser, isAuthenticated: true });
      useSettingsStore.setState({ dailyGoal: newUser.daily_goal ?? 350 });
      await useExpenseStore.getState().loadInitialData(newUser.id);
      return { success: true };
    } catch {
      return { success: false, message: 'Erro ao criar conta. Tente novamente.' };
    }
  },

  resetPassword: async (email: string, newPassword: string) => {
    try {
      if (!email.trim() || !newPassword.trim()) {
        return { success: false, message: 'Preencha o e-mail e a nova senha.' };
      }

      // 1. Atualiza no MySQL
      const apiRes = await apiResetPassword(email, newPassword);
      if (!apiRes.success) {
        return { success: false, message: apiRes.message || 'Erro ao redefinir a senha no MySQL.' };
      }

      // 2. Atualiza no SQLite local
      try {
        await updateUserPassword(email, newPassword);
      } catch {}

      return { success: true };
    } catch {
      return { success: false, message: 'Erro ao redefinir a senha. Tente novamente.' };
    }
  },

  updateProfile: async (name: string, email: string, newPassword?: string) => {
    const currentUser = get().user;
    if (!currentUser) {
      return { success: false, message: 'Nenhum usuário conectado.' };
    }

    try {
      // 1. Atualiza no MySQL (XAMPP)
      const apiRes = await apiUpdateProfile(currentUser.id, name, email, newPassword);
      if (apiRes.success && apiRes.user) {
        const updated = apiRes.user;
        try {
          await updateUserProfile(currentUser.id, name, email, newPassword);
        } catch {}

        set({ user: updated });
        return { success: true, message: 'Dados atualizados com sucesso!' };
      }

      // Se der erro de conexão com MySQL, tenta atualizar localmente no SQLite
      if (apiRes.message && !apiRes.message.includes('Erro ao conectar')) {
        return { success: false, message: apiRes.message };
      }

      const localUpdated = await updateUserProfile(currentUser.id, name, email, newPassword);
      if (localUpdated) {
        set({ user: localUpdated });
        return { success: true, message: 'Dados atualizados localmente!' };
      }

      return { success: false, message: apiRes.message || 'Erro ao atualizar dados.' };
    } catch {
      return { success: false, message: 'Erro ao salvar alterações.' };
    }
  },

  logout: async () => {
    try {
      await apiLogout();
    } catch {}
    await clearSession();
    useExpenseStore.getState().clearExpenses();
    useSettingsStore.setState({ dailyGoal: 350 });
    set({ user: null, isAuthenticated: false });
  },

  loginWithSocial: async (provider: 'apple' | 'google') => {
    try {
      const apiRes = await apiSocialLogin(provider);
      if (apiRes.success && apiRes.user) {
        set({ user: apiRes.user, isAuthenticated: true });
        useSettingsStore.setState({ dailyGoal: apiRes.user.daily_goal ?? 350 });
        await useExpenseStore.getState().loadInitialData(apiRes.user.id);
        return;
      }
    } catch {}

    const email = provider === 'apple' ? 'usuario.apple@zest.app' : 'usuario.google@zest.app';
    const name = provider === 'apple' ? 'Usuário Apple' : 'Usuário Google';

    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser(name, email, 'social_login_auth');
    }

    await saveSession(user.id);
    set({ user, isAuthenticated: true });
    useSettingsStore.setState({ dailyGoal: user.daily_goal ?? 350 });
    await useExpenseStore.getState().loadInitialData(user.id);
  },
}));

