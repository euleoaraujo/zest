import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseWithCategory } from '../types';
import { ColorTheme } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { formatCurrency, formatExpenseDateTime } from '../utils/formatters';
import { useSettingsStore } from '../store/useSettingsStore';
import { BouncingPressable } from './common/BouncingPressable';

interface AllExpensesModalProps {
  visible: boolean;
  expenses: ExpenseWithCategory[];
  total: number;
  onClose: () => void;
  onDeleteExpense: (id: number) => void;
}

export const AllExpensesModal: React.FC<AllExpensesModalProps> = ({
  visible,
  expenses,
  total,
  onClose,
  onDeleteExpense,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { currency } = useSettingsStore();

  const confirmDelete = (expense: ExpenseWithCategory) => {
    Alert.alert(
      'Excluir registro',
      `Deseja remover o gasto de ${formatCurrency(expense.amount, currency)} em ${expense.category_name}?`,
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Gastos Totais</Text>
              <Text style={styles.modalSubtitle}>Histórico completo acumulado</Text>
            </View>
            <BouncingPressable
              onPress={onClose}
              style={styles.closeButton}
              scaleTo={0.9}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </BouncingPressable>
          </View>

          {/* Card Resumo do Total Acumulado */}
          <View style={styles.totalCard}>
            <View>
              <Text style={styles.totalLabel}>TOTAL ACUMULADO</Text>
              <Text style={styles.totalAmount}>{formatCurrency(total, currency)}</Text>
            </View>
            <View style={styles.countBadge}>
              <Ionicons name="receipt-outline" size={14} color={isDark ? colors.primary : colors.textPrimary} />
              <Text style={styles.countBadgeText}>{expenses.length} {expenses.length === 1 ? 'registro' : 'registros'}</Text>
            </View>
          </View>

          {/* Lista de todos os gastos */}
          {expenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="sparkles-outline" size={32} color={isDark ? colors.primary : colors.textPrimary} />
              </View>
              <Text style={styles.emptyTitle}>Nenhum gasto registrado ainda</Text>
              <Text style={styles.emptySubtitle}>
                Seus registros acumulados aparecerão aqui em ordem cronológica.
              </Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.expenseItem,
                    { borderLeftWidth: 3.5, borderLeftColor: item.category_color },
                  ]}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${item.category_color}22` },
                    ]}
                  >
                    <Ionicons
                      name={item.category_icon as any}
                      size={20}
                      color={item.category_color}
                    />
                  </View>

                  <View style={styles.infoCol}>
                    <Text style={styles.categoryTitle}>{item.category_name}</Text>
                    {item.description ? (
                      <Text style={styles.descriptionText} numberOfLines={1}>
                        {item.description}
                      </Text>
                    ) : null}
                    <Text style={styles.dateText}>{formatExpenseDateTime(item.created_at)}</Text>
                  </View>

                  <View style={styles.actionCol}>
                    <Text style={styles.amountText}>{formatCurrency(item.amount, currency)}</Text>
                    <BouncingPressable
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      scaleTo={0.88}
                      onPress={() => confirmDelete(item)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={15} color={colors.textMuted} />
                    </BouncingPressable>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ColorTheme, isDark: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.backdrop,
    },
    backdrop: {
      flex: 1,
    },
    modalContent: {
      maxHeight: '85%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: 36,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.textMuted,
      alignSelf: 'center',
      marginBottom: 12,
      opacity: 0.5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    headerLeft: {
      gap: 2,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    modalSubtitle: {
      fontSize: 12,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.bentoCard,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: colors.bentoBorder,
      marginBottom: 16,
    },
    totalLabel: {
      fontSize: 10,
      fontFamily: typography.bold,
      color: colors.cardTextMuted,
      letterSpacing: 1.2,
      marginBottom: 2,
    },
    totalAmount: {
      fontSize: 26,
      fontFamily: typography.bold,
      color: isDark ? colors.primary : colors.textPrimary,
      letterSpacing: -0.5,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surfaceHighlight,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    countBadgeText: {
      fontSize: 11,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    listContent: {
      paddingBottom: 20,
      gap: 10,
    },
    expenseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bentoCard,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.bentoBorder,
      gap: 12,
    },
    iconCircle: {
      width: 42,
      height: 42,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoCol: {
      flex: 1,
      gap: 2,
    },
    categoryTitle: {
      fontSize: 14,
      fontFamily: typography.bold,
      color: colors.cardTextPrimary,
    },
    descriptionText: {
      fontSize: 12,
      fontFamily: typography.medium,
      color: colors.cardTextSecondary,
    },
    dateText: {
      fontSize: 11,
      fontFamily: typography.medium,
      color: colors.cardTextMuted,
      marginTop: 2,
    },
    actionCol: {
      alignItems: 'flex-end',
      gap: 6,
    },
    amountText: {
      fontSize: 15,
      fontFamily: typography.bold,
      color: colors.cardTextPrimary,
    },
    deleteButton: {
      padding: 2,
    },
    emptyContainer: {
      backgroundColor: colors.bentoCard,
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.bentoBorder,
      borderStyle: 'dashed',
      marginVertical: 20,
    },
    emptyIconCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? 'rgba(226, 241, 99, 0.12)' : 'rgba(18, 18, 20, 0.06)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 16,
      fontFamily: typography.bold,
      color: colors.cardTextPrimary,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      fontFamily: typography.medium,
      color: colors.cardTextSecondary,
      textAlign: 'center',
      lineHeight: 19,
    },
  });
