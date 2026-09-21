import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatCurrency, formatDateHeader } from '../utils/formatters';
import { LogoStatic } from './AnimatedLogo';
import { useSettingsStore } from '../store/useSettingsStore';

interface HeaderProps {
  total: number;
  count: number;
  onOpenAllExpenses?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ total, onOpenAllExpenses }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const { dailyGoal, currency } = useSettingsStore();

  const isOverGoal = total > dailyGoal;
  const remaining = Math.max(0, dailyGoal - total);
  const progressPercent = Math.min(100, Math.round((total / (dailyGoal || 1)) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandTitleContainer}>
          <LogoStatic width={42} color={colors.white} />
          <Text style={styles.brandName}>Zest</Text>
        </View>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
          <Text style={styles.dateText}>{formatDateHeader(new Date(), isSmallScreen)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardSubtitle}>GASTOS DE HOJE</Text>
          <TouchableOpacity
            style={styles.listIconButton}
            activeOpacity={0.7}
            onPress={onOpenAllExpenses}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="list-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.totalValue}>{formatCurrency(total, currency)}</Text>

        <View style={styles.cardDivider} />

        <View style={styles.goalRow}>
          <View style={styles.goalLeft}>
            <Text style={styles.goalLabel}>Meta de gastos</Text>
            <Text style={[styles.goalStatus, isOverGoal ? styles.goalStatusOver : styles.goalStatusOk]}>
              {isOverGoal
                ? `+${formatCurrency(total - dailyGoal, currency)} acima`
                : `restam ${formatCurrency(remaining, currency)}`}
            </Text>
          </View>
          <View style={styles.goalRight}>
            <Text style={styles.goalValue}>{formatCurrency(dailyGoal, currency)}</Text>
            <Text style={styles.goalPercentText}>{progressPercent}%</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progressPercent}%`,
                backgroundColor: isOverGoal ? colors.danger : colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 22,
    fontFamily: typography.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalValue: {
    fontSize: 38,
    fontFamily: typography.bold,
    color: colors.cardTextPrimary,
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
    color: colors.cardTextPrimary,
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
    height: 4,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
