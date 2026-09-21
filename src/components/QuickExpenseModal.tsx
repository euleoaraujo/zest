import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { ColorTheme } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/formatters';
import { useSettingsStore } from '../store/useSettingsStore';
import { BouncingPressable } from './common/BouncingPressable';

interface QuickExpenseModalProps {
  visible: boolean;
  categories: Category[];
  initialCategory: Category | null;
  onClose: () => void;
  onSubmit: (amount: number, categoryId: number, description?: string) => Promise<void>;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  visible,
  categories,
  initialCategory,
  onClose,
  onSubmit,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { currency, getCurrencySymbol } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);
  const [centsValue, setCentsValue] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const amountInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setSelectedCategory(initialCategory || categories[0] || null);
      setCentsValue(0);
      setDescription('');
      setIsSubmitting(false);

      // Foca automaticamente no campo de valor com o teclado numérico nativo do iPhone
      const timer = setTimeout(() => {
        amountInputRef.current?.focus();
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [visible, initialCategory, categories]);

  const currentAmount = centsValue / 100;

  const handleAmountChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    if (digitsOnly.length > 8) return;
    const parsed = parseInt(digitsOnly, 10);
    setCentsValue(isNaN(parsed) ? 0 : parsed);
  };

  const handleQuickAdd = (valueInReais: number) => {
    setCentsValue((prev) => prev + valueInReais * 100);
  };

  const handleSave = async () => {
    if (!selectedCategory || currentAmount <= 0 || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(currentAmount, selectedCategory.id, description);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickPresets = [2, 5, 10, 20, 50];

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

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContent}
        >
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Novo Registro</Text>
              <Text style={styles.modalSubtitle}>Entrada rápida</Text>
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

          {/* Seleção Horizontal de Categorias */}
          <View style={styles.categoryScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <BouncingPressable
                    key={cat.id}
                    scaleTo={0.93}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        backgroundColor: `${cat.color}25`,
                        borderColor: cat.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color={isSelected ? cat.color : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && { color: cat.color, fontFamily: typography.bold },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </BouncingPressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Card de Valor com TextInput e Teclado Numérico Nativo do iPhone */}
          <TouchableOpacity
            style={styles.displayCard}
            activeOpacity={0.9}
            onPress={() => amountInputRef.current?.focus()}
          >
            <Text style={styles.amountLabel}>VALOR</Text>

            <View style={styles.amountInputRow}>
              <TextInput
                ref={amountInputRef}
                style={styles.amountInput}
                keyboardType="number-pad"
                value={centsValue === 0 ? '' : formatCurrency(currentAmount, currency)}
                placeholder={`${getCurrencySymbol()} 0,00`}
                placeholderTextColor={isDark ? 'rgba(226, 241, 99, 0.4)' : colors.textMuted}
                onChangeText={handleAmountChange}
                maxLength={14}
              />

              {centsValue > 0 && (
                <BouncingPressable
                  style={styles.clearAmountButton}
                  scaleTo={0.88}
                  onPress={() => setCentsValue(0)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                </BouncingPressable>
              )}
            </View>
          </TouchableOpacity>

          {/* Atalhos de Valores Rápidos (+2, +5, +10, etc.) */}
          <View style={styles.presetsRow}>
            {quickPresets.map((preset) => (
              <BouncingPressable
                key={preset}
                style={styles.presetButton}
                scaleTo={0.93}
                onPress={() => handleQuickAdd(preset)}
              >
                <Text style={styles.presetText}>+{preset}</Text>
              </BouncingPressable>
            ))}
          </View>

          {/* Campo de Descrição com Teclado Normal Alfanumérico */}
          <TouchableOpacity
            style={styles.descriptionRow}
            activeOpacity={0.9}
            onPress={() => descriptionInputRef.current?.focus()}
          >
            <Ionicons name="create-outline" size={18} color={colors.textMuted} />
            <TextInput
              ref={descriptionInputRef}
              style={styles.descriptionInput}
              placeholder="Descrição opcional (ex.: Farmácia, Café)"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              maxLength={40}
              keyboardType="default"
              returnKeyType="done"
            />
          </TouchableOpacity>

          {/* Botão de Concluir Registro */}
          <BouncingPressable
            style={[
              styles.submitButton,
              currentAmount <= 0 && styles.submitButtonDisabled,
            ]}
            scaleTo={0.96}
            onPress={handleSave}
            disabled={currentAmount <= 0 || isSubmitting}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.buttonText} />
            <Text style={styles.submitButtonText}>
              {currentAmount > 0
                ? `Registrar ${formatCurrency(currentAmount, currency)}`
                : 'Informe o valor'}
            </Text>
          </BouncingPressable>
        </KeyboardAvoidingView>
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
      backgroundColor: colors.surface,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingTop: 12,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === 'ios' ? 24 : 20,
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
      marginBottom: 12,
    },
    headerLeft: {
      gap: 2,
    },
    modalTitle: {
      fontSize: 18,
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
    categoryScrollWrapper: {
      marginHorizontal: -20,
      marginBottom: 12,
    },
    categoryScroll: {
      paddingHorizontal: 20,
      gap: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: colors.surfaceHighlight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipText: {
      fontSize: 13,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    displayCard: {
      backgroundColor: colors.surfaceHighlight,
      borderRadius: 18,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    amountLabel: {
      fontSize: 11,
      fontFamily: typography.bold,
      color: colors.textMuted,
      letterSpacing: 1,
      marginBottom: 2,
    },
    amountInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'relative',
    },
    amountInput: {
      fontSize: 34,
      fontFamily: typography.bold,
      color: isDark ? colors.primary : colors.textPrimary,
      letterSpacing: -0.5,
      textAlign: 'center',
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
    clearAmountButton: {
      position: 'absolute',
      right: 4,
    },
    presetsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      gap: 6,
    },
    presetButton: {
      flex: 1,
      backgroundColor: colors.surfaceHighlight,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    presetText: {
      fontSize: 13,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    descriptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.surfaceHighlight,
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    descriptionInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: typography.medium,
      color: colors.textPrimary,
      padding: 0,
    },
    submitButton: {
      backgroundColor: colors.buttonBg,
      height: 52,
      borderRadius: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonDisabled: {
      backgroundColor: colors.surfaceHighlight,
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: 16,
      fontFamily: typography.bold,
      color: colors.buttonText,
    },
  });
