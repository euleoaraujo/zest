import * as SQLite from 'expo-sqlite';
import { Category, ExpenseWithCategory } from '../types';
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
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );
  `);

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

export async function fetchCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Category>(
    'SELECT id, name, icon, color, is_shortcut FROM categories ORDER BY is_shortcut DESC, id ASC;'
  );
  return rows;
}

export async function fetchTodayExpenses(): Promise<ExpenseWithCategory[]> {
  const db = await getDatabase();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const rows = await db.getAllAsync<ExpenseWithCategory>(
    `SELECT 
      e.id,
      e.amount,
      e.category_id,
      e.description,
      e.created_at,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color
    FROM expenses e
    INNER JOIN categories c ON e.category_id = c.id
    WHERE e.created_at >= ? AND e.created_at <= ?
    ORDER BY e.created_at DESC;`,
    [startOfDay.toISOString(), endOfDay.toISOString()]
  );
  return rows;
}

export async function insertExpense(
  amount: number,
  categoryId: number,
  description?: string
): Promise<number> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO expenses (amount, category_id, description, created_at) VALUES (?, ?, ?, ?);',
    [amount, categoryId, description?.trim() || null, now]
  );
  return result.lastInsertRowId;
}

export async function deleteExpenseById(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM expenses WHERE id = ?;', [id]);
}

export async function fetchTodayTotal(): Promise<number> {
  const db = await getDatabase();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM expenses WHERE created_at >= ? AND created_at <= ?;',
    [startOfDay.toISOString(), endOfDay.toISOString()]
  );

  return result?.total || 0;
}

export async function fetchAllExpenses(): Promise<ExpenseWithCategory[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExpenseWithCategory>(
    `SELECT 
      e.id,
      e.amount,
      e.category_id,
      e.description,
      e.created_at,
      c.name AS category_name,
      c.icon AS category_icon,
      c.color AS category_color
    FROM expenses e
    INNER JOIN categories c ON e.category_id = c.id
    ORDER BY e.created_at DESC;`
  );
  return rows;
}

export async function fetchAllTotal(): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM expenses;'
  );

  return result?.total || 0;
}

export async function fetchMonthTotal(): Promise<number> {
  const db = await getDatabase();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT SUM(amount) as total FROM expenses WHERE created_at >= ? AND created_at <= ?;',
    [startOfMonth, endOfMonth]
  );

  return result?.total || 0;
}


