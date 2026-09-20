import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';
import { ExpenseWithCategory } from '../types';

interface BentoGridProps {
  todayTotal: number;
  todayCount: number;
  monthTotal: number;
  allTotal: number;
  allCount: number;
  todayExpenses?: ExpenseWithCategory[];
  onOpenAllExpenses: () => void;
  onOpenQuickExpense: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  todayTotal,
  monthTotal,
  todayExpenses = [],
  onOpenAllExpenses,
}) => {
  // Cálculo da meta de gastos diários (base de R$ 350,00 ou ajustada dinamicamente)
  const dailyGoal = 350;
  const isOverGoal = todayTotal > dailyGoal;
  const remaining = Math.max(0, dailyGoal - todayTotal);
  const progressPercent = Math.min(100, Math.round((todayTotal / dailyGoal) * 100));

  // Agrupamento dos gastos de hoje por categoria para colorir a barra de progresso
  const categorySegments = useMemo(() => {
    if (!todayExpenses || todayExpenses.length === 0) return [];

    const grouped: Record<number, { name: string; color: string; total: number }> = {};
    for (const exp of todayExpenses) {
      if (!grouped[exp.category_id]) {
        grouped[exp.category_id] = {
          name: exp.category_name,
          color: exp.category_color,
          total: 0,
        };
      }
      grouped[exp.category_id].total += exp.amount;
    }

    const baseTotal = todayTotal > dailyGoal ? todayTotal : dailyGoal;

    return Object.entries(grouped).map(([id, data]) => ({
      id,
      name: data.name,
      color: data.color,
      total: data.total,
      percent: baseTotal > 0 ? (data.total / baseTotal) * 100 : 0,
    }));
  }, [todayExpenses, todayTotal, dailyGoal]);

  // Dados para o widget de data estilo iPhone
  const now = new Date();
  const weekdays = [
    'DOMINGO',
    'SEGUNDA',
    'TERÇA',
    'QUARTA',
    'QUINTA',
    'SEXTA',
    'SÁBADO',
  ];
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const weekdayName = weekdays[now.getDay()];
  const dayNumber = now.getDate();
  const currentMonthName = months[now.getMonth()];

  return (
    <View style={styles.container}>
      {/* 1. CARD MAIOR NA PARTE DE CIMA */}
      <View style={styles.topLargeCard}>
        {/* Cabeçalho do Card com Subtítulo e Ícone de Lista no canto superior direito */}
        <View style={styles.cardTopRow}>
          <Text style={styles.cardSubtitle}>GASTOS DE HOJE</Text>
          <TouchableOpacity
            style={styles.listIconButton}
            activeOpacity={0.7}
            onPress={onOpenAllExpenses}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="list-outline" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Valor Gasto no Dia */}
        <Text style={styles.totalValue}>{formatCurrency(todayTotal)}</Text>

        {/* Linha Divisória */}
        <View style={styles.cardDivider} />

        {/* Meta de Gastos */}
        <View style={styles.goalRow}>
          <View style={styles.goalLeft}>
            <Text style={styles.goalLabel}>Meta de gastos</Text>
            <Text
              style={[
                styles.goalStatus,
                isOverGoal ? styles.goalStatusOver : styles.goalStatusOk,
              ]}
            >
              {isOverGoal
                ? `+${formatCurrency(todayTotal - dailyGoal)} acima`
                : `restam ${formatCurrency(remaining)}`}
            </Text>
          </View>
          <View style={styles.goalRight}>
            <Text style={styles.goalValue}>{formatCurrency(dailyGoal)}</Text>
            <Text style={styles.goalPercentText}>{progressPercent}%</Text>
          </View>
        </View>

        {/* Barra de progresso segmentada com as cores de cada gasto/categoria */}
        <View style={styles.progressTrack}>
          {categorySegments.length === 0 ? (
            <View style={styles.emptyProgressBar} />
          ) : (
            categorySegments.map((segment, index) => (
              <View
                key={segment.id}
                style={[
                  styles.progressSegment,
                  {
                    width: `${segment.percent}%`,
                    backgroundColor: segment.color,
                    marginRight: index < categorySegments.length - 1 ? 1.5 : 0,
                  },
                ]}
              />
            ))
          )}
        </View>

        {/* Legenda com as cores das categorias gastas */}
        {categorySegments.length > 0 && (
          <View style={styles.legendContainer}>
            {categorySegments.map((segment) => (
              <View key={segment.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                <Text style={styles.legendText}>
                  {segment.name} ({formatCurrency(segment.total)})
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 2. CARDS MENORES EM BAIXO (LADO A LADO) */}
      <View style={styles.bottomRow}>
        {/* Card da Esquerda: Gasto Acumulado do Mês */}
        <TouchableOpacity
          style={styles.cardHalf}
          activeOpacity={0.8}
          onPress={onOpenAllExpenses}
        >
          <View style={styles.smallCardHeader}>
            <View style={styles.monthBadge}>
              <Ionicons name="wallet-outline" size={14} color={colors.primary} />
              <Text style={styles.monthBadgeText}>{currentMonthName.toUpperCase()}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </View>

          <View style={styles.smallCardContent}>
            <Text style={styles.monthTotalValue}>{formatCurrency(monthTotal)}</Text>
            <Text style={styles.monthLabel}>Gasto do Mês</Text>
            <Text style={styles.monthSubtext}>Acumulado mensal</Text>
          </View>
        </TouchableOpacity>

        {/* Card da Direita: Data Estilo Widget do iPhone */}
        <View style={styles.cardHalfWidget}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetWeekday}>{weekdayName}</Text>
          </View>

          <View style={styles.widgetCenter}>
            <Text style={styles.widgetDayNumber}>{dayNumber}</Text>
          </View>

          <View style={styles.widgetFooter}>
            <Text style={styles.widgetMonth}>{currentMonthName}</Text>
            <View style={styles.widgetDot} />
            <Text style={styles.widgetTodayText}>Hoje</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 14,
    marginBottom: 20,
  },
  // Card Maior de Cima
  topLargeCard: {
    backgroundColor: colors.bentoCard,
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.bentoBorder,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    fontFamily: typography.medium,
    color: colors.cardTextMuted,
    letterSpacing: 1.2,
  },
  listIconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.bentoCardHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bentoBorder,
  },
  totalValue: {
    fontSize: 38,
    fontFamily: typography.bold,
    color: colors.white,
    letterSpacing: -0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.cardDivider,
    marginVertical: 14,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalLeft: {
    flex: 1,
    marginRight: 12,
    gap: 2,
  },
  goalLabel: {
    fontSize: 12,
    fontFamily: typography.medium,
    color: colors.cardTextSecondary,
  },
  goalStatus: {
    fontSize: 11,
    fontFamily: typography.medium,
  },
  goalStatusOk: {
    color: colors.cardTextMuted,
  },
  goalStatusOver: {
    color: colors.danger,
  },
  goalRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    paddingRight: 6,
    gap: 1,
  },
  goalValue: {
    fontSize: 15,
    fontFamily: typography.bold,
    color: colors.white,
    paddingRight: 2,
    textAlign: 'right',
  },
  goalPercentText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.cardTextMuted,
    paddingRight: 2,
  },
  progressTrack: {
    height: 7,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3.5,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressSegment: {
    height: '100%',
  },
  emptyProgressBar: {
    width: 0,
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 11,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },

  // Linha dos Cards Menores de Baixo
  bottomRow: {
    flexDirection: 'row',
    gap: 14,
  },
  cardHalf: {
    flex: 1,
    minHeight: 155,
    backgroundColor: colors.bentoCard,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.bentoBorder,
  },
  smallCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bentoCardHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  monthBadgeText: {
    fontSize: 10,
    fontFamily: typography.bold,
    color: colors.primary,
    letterSpacing: 0.8,
  },
  smallCardContent: {
    gap: 2,
    marginTop: 10,
  },
  monthTotalValue: {
    fontSize: 22,
    fontFamily: typography.bold,
    color: colors.white,
    letterSpacing: -0.5,
  },
  monthLabel: {
    fontSize: 13,
    fontFamily: typography.bold,
    color: colors.white,
    marginTop: 2,
  },
  monthSubtext: {
    fontSize: 11,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },

  // Card Widget de Data estilo iPhone
  cardHalfWidget: {
    flex: 1,
    minHeight: 155,
    backgroundColor: colors.bentoCard,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.bentoBorder,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetWeekday: {
    fontSize: 11,
    fontFamily: typography.bold,
    color: '#FF453A',
    letterSpacing: 0.8,
  },
  widgetCenter: {
    marginVertical: 2,
  },
  widgetDayNumber: {
    fontSize: 48,
    fontFamily: typography.bold,
    color: colors.white,
    lineHeight: 52,
    letterSpacing: -1,
  },
  widgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  widgetMonth: {
    fontSize: 12,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  widgetDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
  },
  widgetTodayText: {
    fontSize: 12,
    fontFamily: typography.medium,
    color: colors.textMuted,
  },
});
