import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface ShortcutGridProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({
  categories,
  onSelectCategory,
}) => {
  const shortcutList = categories.filter((cat) => cat.is_shortcut === 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atalhos Rápidos</Text>
        <Text style={styles.subtitle}>Toque para registrar instantaneamente</Text>
      </View>

      <View style={styles.grid}>
        {shortcutList.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.card}
            activeOpacity={0.7}
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
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: colors.white,
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
    color: colors.white,
    textAlign: 'center',
  },
});
