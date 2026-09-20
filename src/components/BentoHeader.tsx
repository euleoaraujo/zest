import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { formatDateHeader } from '../utils/formatters';
import { LogoStatic } from './AnimatedLogo';

interface BentoHeaderProps {
  onOpenQuickExpense: () => void;
  onOpenSettings?: () => void;
}

export const BentoHeader: React.FC<BentoHeaderProps> = ({
  onOpenQuickExpense,
  onOpenSettings,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleColumn}>
        <View style={styles.brandRow}>
          <LogoStatic width={42} color={colors.white} />
          <Text style={styles.title}>Zest</Text>
        </View>
        <Text style={styles.subtitle}>{formatDateHeader(new Date())}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onOpenSettings}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="settings-outline" size={19} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onOpenQuickExpense}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleColumn: {
    gap: 3,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 34,
    fontFamily: typography.bold,
    color: colors.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.bentoCardHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.bentoBorder,
  },
});
