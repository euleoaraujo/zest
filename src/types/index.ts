export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  is_shortcut: number;
}

export interface Expense {
  id: number;
  amount: number;
  category_id: number;
  description?: string | null;
  created_at: string;
}

export interface ExpenseWithCategory extends Expense {
  category_name: string;
  category_icon: string;
  category_color: string;
}

export interface CreateExpensePayload {
  amount: number;
  categoryId: number;
  description?: string;
}
