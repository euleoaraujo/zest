import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { colors } from '../theme/colors';

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>Atalhos Rápidos</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3s</Text>
          </View>
        </View>
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
                { backgroundColor: `${category.color}22` },
              ]}
            >
              <Ionicons
                name={category.icon as any}
                size={24}
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
    marginBottom: 20,
  },
  header: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.background,
  },
  subtitle: {
    fontSize: 13,
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
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
