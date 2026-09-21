import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { ColorTheme } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { BouncingPressable } from './common/BouncingPressable';

interface ShortcutGridProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({
  categories,
  onSelectCategory,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const shortcutList = categories.filter((cat) => cat.is_shortcut === 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atalhos Rápidos</Text>
        <Text style={styles.subtitle}>Toque para registrar instantaneamente</Text>
      </View>

      <View style={styles.grid}>
        {shortcutList.map((category) => (
          <BouncingPressable
            key={category.id}
            style={styles.card}
            scaleTo={0.93}
            onPress={() => onSelectCategory(category)}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: `${category.color}20` },
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={22}
                color={category.color}
              />
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>
              {category.name}
            </Text>
          </BouncingPressable>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorTheme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    header: {
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 12,
      fontFamily: typography.medium,
      color: colors.textSecondary,
      marginTop: 2,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    card: {
      width: '30.5%',
      backgroundColor: colors.bentoCard,
      borderRadius: 22,
      paddingVertical: 16,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.bentoBorder,
    },
    iconWrapper: {
      width: 48,
      height: 48,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 12,
      fontFamily: typography.medium,
      color: colors.textPrimary,
      textAlign: 'center',
    },
  });
