import { NativeModules, Platform } from 'react-native';
import { Category, ExpenseWithCategory, User } from '../types';

/**
 * Detecta o endereço IP do servidor de desenvolvimento (onde o XAMPP / Apache / MySQL estão rodando).
 * Em dispositivos físicos conectados pelo Expo Go, scriptURL contém o IP do computador na rede local.
 */
export const getDevServerIp = (): string => {
  try {
    const scriptURL: string | undefined = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const hostWithPort = scriptURL.split('://')[1]?.split('/')[0];
      const host = hostWithPort?.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return host;
      }
    }
  } catch {
    // Ignora erro e usa fallback
  }

  // Emulador Android usa 10.0.2.2 para acessar o localhost do host
  if (Platform.OS === 'android' && !NativeModules.SourceCode?.scriptURL) {
    return '10.0.2.2';
  }

  // IP local padrão do PC na rede Wi-Fi
  return '192.168.10.7';
};

export const API_BASE_URL = `http://${getDevServerIp()}/estacio-android/api`;

const DEFAULT_TIMEOUT_MS = 6000;

/**
 * Helper para fetch com timeout configurável
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// -------------------------------------------------------------
// ENDPOINTS DE AUTENTICAÇÃO (MySQL / Apache)
// -------------------------------------------------------------

export async function apiSignup(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth.php?action=signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: `Não foi possível conectar ao servidor MySQL (${API_BASE_URL}). Verifique se o Apache e MySQL estão rodando no XAMPP.`,
    };
  }
}

export async function apiLogin(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; message?: string; notFound?: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth.php?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao conectar com o banco de dados MySQL (${API_BASE_URL}).`,
    };
  }
}

export async function apiResetPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth.php?action=reset_password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: 'Erro ao conectar ao banco MySQL.' };
  }
}

export async function apiSocialLogin(
  provider: 'apple' | 'google'
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth.php?action=social_login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: 'Erro de conexão com o banco MySQL.' };
  }
}

export async function apiUpdateProfile(
  id: number,
  name: string,
  email: string,
  password?: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth.php?action=update_profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, email, password: password || '' }),
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return { success: false, message: 'Erro ao conectar ao banco MySQL.' };
  }
}

export async function apiCheckSession(): Promise<{ success: boolean; authenticated: boolean; user?: User | null }> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE_URL}/auth.php?action=check_session`,
      {
        method: 'GET',
      },
      1200
    );
    return await res.json();
  } catch {
    return { success: false, authenticated: false, user: null };
  }
}

export async function apiLogout(): Promise<{ success: boolean }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth.php?action=logout`, {
      method: 'POST',
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

export async function apiUpdateDailyGoal(
  userId: number,
  dailyGoal: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/auth.php?action=update_goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, daily_goal: dailyGoal }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Erro ao conectar ao banco MySQL.' };
  }
}

// -------------------------------------------------------------
// ENDPOINTS DE DESPESAS (MySQL / Apache)
// -------------------------------------------------------------

export async function apiAddExpense(
  amount: number,
  categoryId: number,
  description?: string,
  userId?: number
): Promise<{ success: boolean; expense?: ExpenseWithCategory; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/expenses.php?action=add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, category_id: categoryId, description, user_id: userId }),
    });
    return await res.json();
  } catch {
    return { success: false, message: 'Erro ao salvar no MySQL' };
  }
}

export async function apiDeleteExpense(id: number, userId?: number): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/expenses.php?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_id: userId }),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}
