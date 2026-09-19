import { Category } from '../types';

export const initialCategories: Omit<Category, 'id'>[] = [
  { name: 'Café', icon: 'cafe', color: '#D97706', is_shortcut: 1 },
  { name: 'Lanche', icon: 'fast-food', color: '#F97316', is_shortcut: 1 },
  { name: 'Transporte', icon: 'car', color: '#3B82F6', is_shortcut: 1 },
  { name: 'Estacionamento', icon: 'car-sport', color: '#6366F1', is_shortcut: 1 },
  { name: 'Mercado', icon: 'cart', color: '#10B981', is_shortcut: 1 },
  { name: 'Farmácia', icon: 'medkit', color: '#EC4899', is_shortcut: 1 },
  { name: 'Lazer', icon: 'game-controller', color: '#8B5CF6', is_shortcut: 0 },
  { name: 'Outros', icon: 'pricetag', color: '#64748B', is_shortcut: 0 },
];
