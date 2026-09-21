import * as SQLite from 'expo-sqlite';
import { Category, ExpenseWithCategory, User } from '../types';
import { initialCategories } from './seed';

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databaseInstance) {
    databaseInstance = await SQLite.openDatabaseAsync('zest.db');
    await setupDatabase(databaseInstance);
  }
  return databaseInstance;
}

async function setupDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      is_shortcut INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL DEFAULT 1,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      daily_goal REAL NOT NULL DEFAULT 350,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  // Migração automática para adicionar user_id caso a tabela expenses já exista
  try {
    const tableInfo = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(expenses);'
    );
    const hasUserId = tableInfo.some((col) => col.name === 'user_id');
    if (!hasUserId) {
      await db.execAsync('ALTER TABLE expenses ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1;');
    }
  } catch {}

  // Migração automática para adicionar daily_goal caso a tabela users já exista
  try {
    const userTableInfo = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(users);'
    );
    const hasDailyGoal = userTableInfo.some((col) => col.name === 'daily_goal');
    if (!hasDailyGoal) {
      await db.execAsync('ALTER TABLE users ADD COLUMN daily_goal REAL NOT NULL DEFAULT 350;');
    }
  } catch {}

  const categoryCountResult = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories;'
  );

  if (!categoryCountResult || categoryCountResult.count === 0) {
    for (const cat of initialCategories) {
      await db.runAsync(
        'INSERT INTO categories (name, icon, color, is_shortcut) VALUES (?, ?, ?, ?);',
        [cat.name, cat.icon, cat.color, cat.is_shortcut]
      );
    }
  } else {
    await db.runAsync("UPDATE categories SET color = '#EF4444' WHERE name = 'Farmácia' AND color = '#EC4899';");
  }
}

async function resolveUserId(userId?: number): Promise<number> {
  if (userId && userId > 0) return userId;
  const session = await getActiveSession();
  return session?.id || 1;
}

export async function fetchCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Category>(
    'SELECT id, name, icon, color, is_shortcut FROM categories ORDER BY is_shortcut DESC, id ASC;'
  );
  return rows;
}

export async function fetchTodayExpenses(userId?: number): Promise<ExpenseWithCategory[]> {
  const db = await getDatabase();
  const activeUserId = await resolveUserId(userId);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db.getAllAsync<ExpenseWithCategory>(
    `SELECT 
      e.id,
      e.user_id,
      e.amount,
      e.category_id,
      e.description,
      e.created_at,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color
    FROM expenses e
    INNER JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ? AND e.created_at >= ? AND e.created_at <= ?
    ORDER BY e.created_at DESC;`,
    [activeUserId, startOfDay.toISOString(), endOfDay.toISOString()]
  );
  return rows;
}

export async function insertExpense(
  amount: number,
  categoryId: number,
  description?: string,
  userId?: number
): Promise<number> {
  const db = await getDatabase();
  const activeUserId = await resolveUserId(userId);
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO expenses (user_id, amount, category_id, description, created_at) VALUES (?, ?, ?, ?, ?);',
    [activeUserId, amount, categoryId, description?.trim() || null, now]
  );
  return result.lastInsertRowId;
}

export async function deleteExpenseById(id: number, userId?: number): Promise<void> {
  const db = await getDatabase();
  if (userId && userId > 0) {
    await db.runAsync('DELETE FROM expenses WHERE id = ? AND user_id = ?;', [id, userId]);
  } else {
    await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
  }
}

export async function fetchTodayTotal(userId?: number): Promise<number> {
  const db = await getDatabase();
  const activeUserId = await resolveUserId(userId);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND created_at >= ? AND created_at <= ?;',
    [activeUserId, startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return result?.total || 0;
}

export async function fetchAllExpenses(userId?: number): Promise<ExpenseWithCategory[]> {
  const db = await getDatabase();
  const activeUserId = await resolveUserId(userId);
  const rows = await db.getAllAsync<ExpenseWithCategory>(
    `SELECT 
      e.id,
      e.user_id,
      e.amount,
      e.category_id,
      e.description,
      e.created_at,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color
    FROM expenses e
    INNER JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ?
    ORDER BY e.created_at DESC;`,
    [activeUserId]
  );
  return rows;
}

export async function fetchAllTotal(userId?: number): Promise<number> {
  const db = await getDatabase();
  const activeUserId = await resolveUserId(userId);
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?;',
    [activeUserId]
  );

  return result?.total || 0;
}

export async function fetchMonthTotal(userId?: number): Promise<number> {
  const db = await getDatabase();
  const activeUserId = await resolveUserId(userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND created_at >= ? AND created_at <= ?;',
    [activeUserId, startOfMonth, endOfMonth]
  );

  return result?.total || 0;
}

// -------------------------------------------------------------
// Funções de Autenticação e Usuário
// -------------------------------------------------------------

export async function createUser(
  name: string,
  email: string,
  password: string,
  dailyGoal: number = 350
): Promise<User> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db.runAsync(
    'INSERT INTO users (name, email, password, daily_goal, created_at) VALUES (?, ?, ?, ?, ?);',
    [name.trim(), normalizedEmail, password, dailyGoal, now]
  );

  return {
    id: result.lastInsertRowId,
    name: name.trim(),
    email: normalizedEmail,
    daily_goal: dailyGoal,
    created_at: now,
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const db = await getDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  const user = await db.getFirstAsync<User>(
    'SELECT id, name, email, daily_goal, created_at FROM users WHERE email = ? AND password = ?;',
    [normalizedEmail, password]
  );

  return user || null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  const user = await db.getFirstAsync<User>(
    'SELECT id, name, email, daily_goal, created_at FROM users WHERE email = ?;',
    [normalizedEmail]
  );

  return user || null;
}

export async function updateUserPassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  const db = await getDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db.runAsync(
    'UPDATE users SET password = ? WHERE email = ?;',
    [newPassword, normalizedEmail]
  );

  return result.changes > 0;
}

export async function updateUserDailyGoal(
  userId: number,
  dailyGoal: number
): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'UPDATE users SET daily_goal = ? WHERE id = ?;',
    [dailyGoal, userId]
  );
  return result.changes > 0;
}

export async function updateUserProfile(
  id: number,
  name: string,
  email: string,
  newPassword?: string
): Promise<User | null> {
  const db = await getDatabase();
  const normalizedEmail = email.trim().toLowerCase();

  if (newPassword && newPassword.trim().length > 0) {
    await db.runAsync(
      'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?;',
      [name.trim(), normalizedEmail, newPassword.trim(), id]
    );
  } else {
    await db.runAsync(
      'UPDATE users SET name = ?, email = ? WHERE id = ?;',
      [name.trim(), normalizedEmail, id]
    );
  }

  const updated = await db.getFirstAsync<User>(
    'SELECT id, name, email, daily_goal, created_at FROM users WHERE id = ?;',
    [id]
  );

  return updated || null;
}

export async function getActiveSession(): Promise<User | null> {
  const db = await getDatabase();
  const session = await db.getFirstAsync<{ user_id: number }>(
    'SELECT user_id FROM session WHERE id = 1;'
  );

  if (!session) return null;

  const user = await db.getFirstAsync<User>(
    'SELECT id, name, email, daily_goal, created_at FROM users WHERE id = ?;',
    [session.user_id]
  );

  return user || null;
}

export async function saveSession(userId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO session (id, user_id) VALUES (1, ?);',
    [userId]
  );
}

export async function clearSession(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM session WHERE id = 1;');
}

