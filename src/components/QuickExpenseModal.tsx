import React, { useState, useEffect } from 'react';
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
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/formatters';

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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);
  const [centsValue, setCentsValue] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setSelectedCategory(initialCategory || categories[0] || null);
      setCentsValue(0);
      setDescription('');
      setIsSubmitting(false);
    }
  }, [visible, initialCategory, categories]);

  const currentAmount = centsValue / 100;

  const handleDigitPress = (digit: string) => {
    if (centsValue.toString().length >= 8) return;
    const nextString = centsValue === 0 ? digit : `${centsValue}${digit}`;
    setCentsValue(parseInt(nextString, 10) || 0);
  };

  const handleBackspace = () => {
    const stringVal = centsValue.toString();
    if (stringVal.length <= 1) {
      setCentsValue(0);
    } else {
      setCentsValue(parseInt(stringVal.slice(0, -1), 10) || 0);
    }
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
              <Text style={styles.modalSubtitle}>Entrada em 1 clique</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.categoryScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    activeOpacity={0.7}
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
                        isSelected && { color: cat.color, fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.displayCard}>
            <Text style={styles.amountLabel}>VALOR</Text>
            <Text style={styles.amountDisplay}>
              {formatCurrency(currentAmount)}
            </Text>
          </View>

          <View style={styles.presetsRow}>
            {quickPresets.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.presetButton}
                activeOpacity={0.7}
                onPress={() => handleQuickAdd(preset)}
              >
                <Text style={styles.presetText}>+{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.descriptionRow}>
            <Ionicons name="create-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.descriptionInput}
              placeholder="Descrição opcional (ex.: Café expresso)"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              maxLength={40}
              returnKeyType="done"
            />
          </View>

          <View style={styles.keypad}>
            <View style={styles.keypadRow}>
              {['1', '2', '3'].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  activeOpacity={0.5}
                  onPress={() => handleDigitPress(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keypadRow}>
              {['4', '5', '6'].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  activeOpacity={0.5}
                  onPress={() => handleDigitPress(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keypadRow}>
              {['7', '8', '9'].map((key) => (
                <TouchableOpacity
                  key={key}
                  style={styles.key}
                  activeOpacity={0.5}
                  onPress={() => handleDigitPress(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keypadRow}>
              <TouchableOpacity
                style={[styles.key, styles.clearKey]}
                activeOpacity={0.5}
                onPress={() => setCentsValue(0)}
              >
                <Text style={styles.clearKeyText}>C</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.key}
                activeOpacity={0.5}
                onPress={() => handleDigitPress('0')}
              >
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.key, styles.backspaceKey]}
                activeOpacity={0.5}
                onPress={handleBackspace}
              >
                <Ionicons name="backspace-outline" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              currentAmount <= 0 && styles.submitButtonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={currentAmount <= 0 || isSubmitting}
          >
            <Ionicons name="checkmark-circle" size={20} color={colors.background} />
            <Text style={styles.submitButtonText}>
              {currentAmount > 0
                ? `Registrar ${formatCurrency(currentAmount)}`
                : 'Informe o valor'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 28,
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
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  displayCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  amountDisplay: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
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
    fontWeight: '700',
    color: colors.textPrimary,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  descriptionInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  keypad: {
    gap: 8,
    marginBottom: 14,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  clearKey: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  clearKeyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.danger,
  },
  backspaceKey: {
    backgroundColor: colors.surfaceHighlight,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.surfaceHighlight,
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
});
