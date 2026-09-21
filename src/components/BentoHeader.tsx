import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { formatDateHeader } from '../utils/formatters';
import { LogoStatic } from './AnimatedLogo';
import { BouncingPressable } from './common/BouncingPressable';

interface BentoHeaderProps {
  onOpenQuickExpense: () => void;
  onOpenSettings?: () => void;
}

export const BentoHeader: React.FC<BentoHeaderProps> = ({
  onOpenQuickExpense,
  onOpenSettings,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.container}>
      <View style={styles.titleColumn}>
        <View style={styles.brandRow}>
          <LogoStatic width={42} color={colors.textPrimary} />
          <Text style={styles.title}>Zest</Text>
        </View>
        <Text style={styles.subtitle}>{formatDateHeader(new Date())}</Text>
      </View>

      <View style={styles.actionsRow}>
        <BouncingPressable
          style={styles.iconButton}
          scaleTo={0.9}
          onPress={onOpenSettings}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="settings-outline" size={19} color={colors.textPrimary} />
        </BouncingPressable>

        <BouncingPressable
          style={styles.iconButton}
          scaleTo={0.9}
          onPress={onOpenQuickExpense}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </BouncingPressable>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorTheme, isDark: boolean) =>
  StyleSheet.create({
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
      color: colors.textPrimary,
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
      backgroundColor: colors.bentoCard,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.bentoBorder,
    },
  });
