import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatCurrency, formatDateHeader } from '../utils/formatters';
import { LogoStatic } from './AnimatedLogo';

interface HeaderProps {
  total: number;
  count: number;
}

export const Header: React.FC<HeaderProps> = ({ total, count }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandTitleContainer}>
          <LogoStatic width={44} color={colors.primary} />
          <Text style={styles.brandName}>Zest</Text>
        </View>
        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.dateText}>{formatDateHeader()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSubtitle}>GASTOS DE HOJE</Text>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Hoje</Text>
          </View>
        </View>

        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.metricItem}>
            <Ionicons name="receipt-outline" size={16} color={colors.primary} />
            <Text style={styles.metricText}>
              {count === 0
                ? 'Nenhum registro'
                : `${count} ${count === 1 ? 'micro-gasto' : 'micro-gastos'}`}
            </Text>
          </View>
          <View style={styles.speedTag}>
            <Ionicons name="flash" size={12} color={colors.primary} />
            <Text style={styles.speedText}>Fluxo de 3s</Text>
          </View>
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
    fontWeight: '800',
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(226, 241, 99, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  liveText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  speedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});
