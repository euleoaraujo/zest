import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const handleStubPress = (title: string) => {
    Alert.alert(
      title,
      'Esta opção de perfil estará disponível na próxima atualização!',
      [{ text: 'OK' }]
    );
  };

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

        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />

          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Configurações</Text>
              <Text style={styles.modalSubtitle}>Perfil & Preferências</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Card de Perfil */}
            <TouchableOpacity
              style={styles.profileCard}
              activeOpacity={0.8}
              onPress={() => handleStubPress('Editar Perfil')}
            >
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={26} color={colors.primary} />
              </View>

              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>Usuário Zest</Text>
                  <View style={styles.badgePro}>
                    <Text style={styles.badgeProText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.profileEmail}>usuario@zest.app</Text>
              </View>

              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Seção 1: Conta e Perfil */}
            <Text style={styles.sectionTitle}>CONTA & PERFIL</Text>
            <View style={styles.settingsGroup}>
              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
                onPress={() => handleStubPress('Dados Pessoais')}
              >
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="person-outline" size={18} color={colors.white} />
                </View>
                <Text style={styles.settingLabel}>Dados Pessoais</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.itemDivider} />

              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
                onPress={() => handleStubPress('Moeda')}
              >
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="cash-outline" size={18} color={colors.white} />
                </View>
                <Text style={styles.settingLabel}>Moeda Padrão</Text>
                <Text style={styles.settingValue}>BRL (R$)</Text>
              </TouchableOpacity>

              <View style={styles.itemDivider} />

              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
                onPress={() => handleStubPress('Meta Diária')}
              >
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="flag-outline" size={18} color={colors.primary} />
                </View>
                <Text style={styles.settingLabel}>Meta Diária de Gastos</Text>
                <Text style={styles.settingValue}>R$ 350,00</Text>
              </TouchableOpacity>
            </View>

            {/* Seção 2: Preferências */}
            <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
            <View style={styles.settingsGroup}>
              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
                onPress={() => handleStubPress('Notificações')}
              >
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="notifications-outline" size={18} color={colors.white} />
                </View>
                <Text style={styles.settingLabel}>Lembretes Diários</Text>
                <Text style={styles.settingValue}>Ativados</Text>
              </TouchableOpacity>

              <View style={styles.itemDivider} />

              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
                onPress={() => handleStubPress('Tema')}
              >
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="moon-outline" size={18} color={colors.white} />
                </View>
                <Text style={styles.settingLabel}>Tema Visual</Text>
                <Text style={styles.settingValue}>Dark Bento</Text>
              </TouchableOpacity>
            </View>

            {/* Seção 3: Dados & Sistema */}
            <Text style={styles.sectionTitle}>DADOS & SISTEMA</Text>
            <View style={styles.settingsGroup}>
              <TouchableOpacity
                style={styles.settingItem}
                activeOpacity={0.7}
                onPress={() => handleStubPress('Exportar')}
              >
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="download-outline" size={18} color={colors.white} />
                </View>
                <Text style={styles.settingLabel}>Exportar Extrato (CSV)</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
              </TouchableOpacity>

              <View style={styles.itemDivider} />

              <View style={styles.settingItem}>
                <View style={styles.settingIconWrapper}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                </View>
                <Text style={styles.settingLabel}>Versão</Text>
                <Text style={styles.settingValue}>1.0.0 (Expo SDK 57)</Text>
              </View>
            </View>
          </ScrollView>
        </View>
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
    maxHeight: '85%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 36,
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
    marginBottom: 16,
  },
  headerLeft: {
    gap: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: typography.bold,
    color: colors.white,
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
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bentoCard,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.bentoBorder,
    marginBottom: 6,
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: colors.white,
  },
  badgePro: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeProText: {
    fontSize: 9,
    fontFamily: typography.bold,
    color: colors.background,
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: typography.bold,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginLeft: 4,
    marginTop: 6,
  },
  settingsGroup: {
    backgroundColor: colors.bentoCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bentoBorder,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.medium,
    color: colors.white,
  },
  settingValue: {
    fontSize: 13,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  itemDivider: {
    height: 1,
    backgroundColor: colors.bentoBorder,
    marginLeft: 60,
  },
});
