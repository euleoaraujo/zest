import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseWithCategory } from '../types';
import { colors } from '../theme/colors';
import { formatCurrency, formatTime } from '../utils/formatters';

interface ExpenseTimelineProps {
  expenses: ExpenseWithCategory[];
  onDeleteExpense: (id: number) => void;
}

export const ExpenseTimeline: React.FC<ExpenseTimelineProps> = ({
  expenses,
  onDeleteExpense,
}) => {
  const confirmDelete = (expense: ExpenseWithCategory) => {
    Alert.alert(
      'Excluir registro',
      `Deseja remover o gasto de ${formatCurrency(expense.amount)} em ${expense.category_name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDeleteExpense(expense.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Linha do Tempo</Text>
        <Text style={styles.countBadge}>{expenses.length} hoje</Text>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="sparkles-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Sem gastos registrados hoje</Text>
          <Text style={styles.emptySubtitle}>
            Toque em um atalho acima para registrar sua primeira micro-despesa em 3 segundos.
          </Text>
        </View>
      ) : (
        <View style={styles.timelineList}>
          {expenses.map((expense, index) => {
            const isLast = index === expenses.length - 1;

            return (
              <View key={expense.id} style={styles.timelineRow}>
                <View style={styles.leftColumn}>
                  <Text style={styles.timeText}>{formatTime(expense.created_at)}</Text>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${expense.category_color}22` },
                    ]}
                  >
                    <Ionicons
                      name={expense.category_icon as any}
                      size={18}
                      color={expense.category_color}
                    />
                  </View>
                  {!isLast && <View style={styles.connectorLine} />}
                </View>

                <View style={styles.contentCard}>
                  <View style={styles.infoCol}>
                    <Text style={styles.categoryTitle}>
                      {expense.category_name}
                    </Text>
                    {expense.description ? (
                      <Text style={styles.descriptionText} numberOfLines={1}>
                        {expense.description}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.actionCol}>
                    <Text style={styles.amountText}>
                      {formatCurrency(expense.amount)}
                    </Text>
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => confirmDelete(expense)}
                      style={styles.deleteButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(226, 241, 99, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  timelineList: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  leftColumn: {
    alignItems: 'center',
    width: 44,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  descriptionText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  deleteButton: {
    padding: 2,
  },
});
