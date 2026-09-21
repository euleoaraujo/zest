import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { useAuthStore } from '../store/useAuthStore';
import {
  useSettingsStore,
  SupportedCurrency,
  CURRENCY_OPTIONS,
} from '../store/useSettingsStore';
import { formatCurrency } from '../utils/formatters';
import { BouncingPressable } from './common/BouncingPressable';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

type SettingsView = 'main' | 'personal_data' | 'appearance';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { user, logout, updateProfile } = useAuthStore();
  const {
    currency,
    dailyGoal,
    setCurrency,
    setDailyGoal,
    getCurrencyLabel,
    getCurrencySymbol,
  } = useSettingsStore();

  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Estados dos campos de edição de dados pessoais
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPassword, setEditPassword] = useState<string>('');
  const [editConfirmPassword, setEditConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Estado para modal de input da Meta Diária
  const [isGoalModalVisible, setIsGoalModalVisible] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<string>('');

  // Estado e ref para o Popover Menu Nativo de Moedas do iPhone
  const currencyButtonRef = useRef<View>(null);
  const [isCurrencyMenuVisible, setIsCurrencyMenuVisible] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 320, right: 20 });

  // Animações de transição de telas internas (Main <-> Dados Pessoais / Aparência)
  const viewFadeAnim = useRef(new Animated.Value(1)).current;
  const viewSlideAnim = useRef(new Animated.Value(0)).current;

  const navigateToView = (targetView: SettingsView) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const direction = targetView === 'main' ? -1 : 1;
    Animated.parallel([
      Animated.timing(viewFadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(viewSlideAnim, {
        toValue: -15 * direction,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentView(targetView);
      viewSlideAnim.setValue(15 * direction);
      Animated.parallel([
        Animated.timing(viewFadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(viewSlideAnim, {
          toValue: 0,
          bounciness: 4,
          speed: 24,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Animações de Popover de Moeda
  const popoverScaleAnim = useRef(new Animated.Value(0.85)).current;
  const popoverFadeAnim = useRef(new Animated.Value(0)).current;

  // Animações do Modal de Meta
  const goalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const goalFadeAnim = useRef(new Animated.Value(0)).current;

  // Sincroniza dados do usuário ao abrir modal ou trocar de view
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
    if (!visible) {
      setCurrentView('main');
      setIsEditing(false);
      setEditPassword('');
      setEditConfirmPassword('');
      setIsGoalModalVisible(false);
      setIsCurrencyMenuVisible(false);
    }
  }, [user, visible]);

  const handleStubPress = (title: string) => {
    Alert.alert(
      title,
      'Esta opção de perfil estará disponível na próxima atualização!',
      [{ text: 'OK' }]
    );
  };

  // Abre o Popover Menu Nativo de Moedas do iPhone com animação suave
  const handleOpenCurrencyMenu = () => {
    currencyButtonRef.current?.measureInWindow((x, y, width, height) => {
      if (y && height) {
        setMenuPosition({
          top: y + height + 6,
          right: 20,
        });
      }
      setIsCurrencyMenuVisible(true);
      popoverScaleAnim.setValue(0.85);
      popoverFadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(popoverScaleAnim, {
          toValue: 1,
          bounciness: 5,
          speed: 28,
          useNativeDriver: true,
        }),
        Animated.timing(popoverFadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleCloseCurrencyMenu = (onFinished?: () => void) => {
    Animated.parallel([
      Animated.timing(popoverScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(popoverFadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsCurrencyMenuVisible(false);
      onFinished?.();
    });
  };

  // Seleciona a moeda e fecha o popover menu
  const handleSelectCurrency = (code: SupportedCurrency) => {
    setCurrency(code);
    handleCloseCurrencyMenu();
  };

  // Abre input da Meta Diária com animação suave de spring
  const handleOpenGoalModal = () => {
    setIsCurrencyMenuVisible(false);
    setGoalInput(dailyGoal > 0 ? dailyGoal.toString() : '350');
    setIsGoalModalVisible(true);
    goalScaleAnim.setValue(0.9);
    goalFadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(goalScaleAnim, {
        toValue: 1,
        bounciness: 6,
        speed: 26,
        useNativeDriver: true,
      }),
      Animated.timing(goalFadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseGoalModal = () => {
    Animated.parallel([
      Animated.timing(goalScaleAnim, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(goalFadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsGoalModalVisible(false);
    });
  };

  // Salva a nova Meta Diária
  const handleSaveGoal = async () => {
    const clean = goalInput.replace(',', '.').replace(/[^0-9.]/g, '');
    const parsed = parseFloat(clean);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Valor Inválido', 'Por favor, insira um valor válido maior que zero.');
      return;
    }
    await setDailyGoal(parsed, user?.id);
    if (user) {
      useAuthStore.setState({ user: { ...user, daily_goal: parsed } });
    }
    handleCloseGoalModal();
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Deseja realmente encerrar sua sessão no Zest?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await logout();
          },
        },
      ]
    );
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
    setEditPassword('');
    setEditConfirmPassword('');
    setShowPassword(false);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Atenção', 'Nome e e-mail não podem ficar vazios.');
      return;
    }

    if (editPassword.trim().length > 0) {
      if (editPassword !== editConfirmPassword) {
        Alert.alert('Senhas Diferentes', 'A confirmação de senha não coincide com a nova senha digitada.');
        return;
      }
      if (editPassword.length < 4) {
        Alert.alert('Senha Curta', 'A nova senha deve ter no mínimo 4 caracteres.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const res = await updateProfile(
        editName.trim(),
        editEmail.trim(),
        editPassword.trim() ? editPassword.trim() : undefined
      );

      if (res.success) {
        Alert.alert('Sucesso', 'Seus dados foram atualizados com sucesso no banco de dados!');
        setIsEditing(false);
        setEditPassword('');
        setEditConfirmPassword('');
      } else {
        Alert.alert('Falha ao Salvar', res.message || 'Não foi possível atualizar seus dados.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.name || 'Usuário Zest';
  const displayEmail = user?.email || 'usuario@zest.app';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
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
            style={styles.keyboardContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.dragHandle} />

              {/* Cabeçalho do Modal com Suporte a Navegação de Voltar */}
              {currentView === 'appearance' ? (
                <View style={styles.appearanceHeaderRow}>
                  <BouncingPressable
                    style={styles.circularBackButton}
                    scaleTo={0.9}
                    onPress={() => navigateToView('main')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                  </BouncingPressable>

                  <Text style={styles.appearanceHeaderTitle}>Aparência</Text>

                  <BouncingPressable
                    onPress={onClose}
                    style={styles.closeButton}
                    scaleTo={0.9}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </BouncingPressable>
                </View>
              ) : (
                <View style={styles.modalHeader}>
                  <View style={styles.headerLeft}>
                    {currentView === 'personal_data' ? (
                      <BouncingPressable
                        style={styles.backButton}
                        scaleTo={0.92}
                        onPress={() => {
                          handleCancelEdit();
                          navigateToView('main');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                        <Text style={styles.backButtonText}>Voltar</Text>
                      </BouncingPressable>
                    ) : (
                      <Text style={styles.modalTitle}>Configurações</Text>
                    )}
                    <Text style={styles.modalSubtitle}>
                      {currentView === 'personal_data'
                        ? 'Dados Pessoais & Acesso'
                        : 'Perfil & Preferências'}
                    </Text>
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
              )}

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* ========================================================= */}
                {/* TELA 1: CONFIGURAÇÕES PRINCIPAIS (MAIN)                  */}
                {/* ========================================================= */}
                {currentView === 'main' && (
                  <Animated.View
                    style={{
                      opacity: viewFadeAnim,
                      transform: [{ translateX: viewSlideAnim }],
                    }}
                  >
                    {/* Card de Perfil */}
                    <BouncingPressable
                      style={styles.profileCard}
                      scaleTo={0.97}
                      onPress={() => {
                        setIsCurrencyMenuVisible(false);
                        navigateToView('personal_data');
                      }}
                    >
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>{displayInitial}</Text>
                      </View>

                      <View style={styles.profileInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.profileName} numberOfLines={1}>
                            {displayName}
                          </Text>
                          <View style={styles.badgePro}>
                            <Text style={styles.badgeProText}>CONECTADO</Text>
                          </View>
                        </View>
                        <Text style={styles.profileEmail} numberOfLines={1}>
                          {displayEmail}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                    </BouncingPressable>

                    {/* Seção 1: Conta e Perfil */}
                    <Text style={styles.sectionTitle}>CONTA & PERFIL</Text>
                    <View style={styles.settingsGroup}>
                      <BouncingPressable
                        style={styles.settingItem}
                        scaleTo={0.98}
                        onPress={() => {
                          setIsCurrencyMenuVisible(false);
                          navigateToView('personal_data');
                        }}
                      >
                        <View style={styles.settingIconWrapper}>
                          <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.settingLabel}>Dados Pessoais</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                      </BouncingPressable>

                      <View style={styles.itemDivider} />

                      {/* Item: Moeda Padrão com Popover Menu Nativo do iPhone */}
                      <BouncingPressable
                        ref={currencyButtonRef as any}
                        style={styles.settingItem}
                        scaleTo={0.98}
                        onPress={handleOpenCurrencyMenu}
                      >
                        <View style={styles.settingIconWrapper}>
                          <Ionicons name="cash-outline" size={18} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.settingLabel}>Moeda Padrão</Text>
                        <View style={styles.valueRow}>
                          <View style={styles.currencyBadgeActive}>
                            <Text style={styles.currencyBadgeActiveText}>{getCurrencySymbol()}</Text>
                          </View>
                          <Text style={styles.settingValueHighlight}>{getCurrencyLabel()}</Text>
                          <Ionicons name="chevron-expand" size={14} color={colors.textSecondary} />
                        </View>
                      </BouncingPressable>

                      <View style={styles.itemDivider} />

                      {/* Item: Meta Diária de Gastos com Input ao clicar */}
                      <BouncingPressable
                        style={styles.settingItem}
                        scaleTo={0.98}
                        onPress={handleOpenGoalModal}
                      >
                        <View style={styles.settingIconWrapper}>
                          <Ionicons name="flag-outline" size={18} color={isDark ? colors.primary : colors.textPrimary} />
                        </View>
                        <Text style={styles.settingLabel}>Meta Diária de Gastos</Text>
                        <View style={styles.valueRow}>
                          <Text style={styles.settingValue}>{formatCurrency(dailyGoal, currency)}</Text>
                          <Ionicons name="pencil" size={13} color={isDark ? colors.primary : colors.textPrimary} style={{ marginLeft: 4 }} />
                        </View>
                      </BouncingPressable>
                    </View>

                    {/* Seção 2: Preferências */}
                    <Text style={styles.sectionTitle}>PREFERÊNCIAS</Text>
                    <View style={styles.settingsGroup}>
                      <BouncingPressable
                        style={styles.settingItem}
                        scaleTo={0.98}
                        onPress={() => handleStubPress('Notificações')}
                      >
                        <View style={styles.settingIconWrapper}>
                          <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.settingLabel}>Lembretes Diários</Text>
                        <Text style={styles.settingValue}>Ativados</Text>
                      </BouncingPressable>

                      <View style={styles.itemDivider} />

                      {/* Item: Tema Visual -> Abre a tela de Aparência com seta para a direita */}
                      <BouncingPressable
                        style={styles.settingItem}
                        scaleTo={0.98}
                        onPress={() => {
                          setIsCurrencyMenuVisible(false);
                          navigateToView('appearance');
                        }}
                      >
                        <View style={styles.settingIconWrapper}>
                          <Ionicons
                            name={
                              themeMode === 'dark'
                                ? 'moon-outline'
                                : themeMode === 'light'
                                ? 'sunny-outline'
                                : 'phone-portrait-outline'
                            }
                            size={18}
                            color={colors.textPrimary}
                          />
                        </View>
                        <Text style={styles.settingLabel}>Tema Visual</Text>
                        <View style={styles.valueRow}>
                          <Text style={styles.settingValue}>
                            {themeMode === 'system'
                              ? `Automático (${isDark ? 'Escuro' : 'Claro'})`
                              : themeMode === 'dark'
                              ? 'Escuro'
                              : 'Claro'}
                          </Text>
                          <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
                        </View>
                      </BouncingPressable>
                    </View>

                    {/* Seção 3: Dados & Sistema */}
                    <Text style={styles.sectionTitle}>DADOS & SISTEMA</Text>
                    <View style={styles.settingsGroup}>
                      <BouncingPressable
                        style={styles.settingItem}
                        scaleTo={0.98}
                        onPress={() => handleStubPress('Exportar')}
                      >
                        <View style={styles.settingIconWrapper}>
                          <Ionicons name="download-outline" size={18} color={colors.textPrimary} />
                        </View>
                        <Text style={styles.settingLabel}>Exportar Extrato (CSV)</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
                      </BouncingPressable>

                      <View style={styles.itemDivider} />

                      <View style={styles.settingItem}>
                        <View style={styles.settingIconWrapper}>
                          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                        </View>
                        <Text style={styles.settingLabel}>Versão</Text>
                        <Text style={styles.settingValue}>1.0.0 (Expo SDK 57)</Text>
                      </View>
                    </View>

                    {/* Botão Sair da Conta (Logout) */}
                    <BouncingPressable
                      style={styles.logoutButton}
                      scaleTo={0.96}
                      onPress={handleLogout}
                    >
                      <Ionicons name="log-out-outline" size={19} color={colors.danger} />
                      <Text style={styles.logoutButtonText}>Sair da Conta</Text>
                    </BouncingPressable>
                  </Animated.View>
                )}

                {/* ========================================================= */}
                {/* TELA 2: SUBPAGE DADOS PESSOAIS                           */}
                {/* ========================================================= */}
                {currentView === 'personal_data' && (
                  <Animated.View
                    style={{
                      opacity: viewFadeAnim,
                      transform: [{ translateX: viewSlideAnim }],
                    }}
                  >
                    {/* Cabeçalho Visual com Avatar */}
                    <View style={styles.personalAvatarHeader}>
                      <View style={styles.avatarCircleLarge}>
                        <Text style={styles.avatarInitialLarge}>{displayInitial}</Text>
                      </View>
                      <Text style={styles.personalNameText}>{displayName}</Text>
                      <Text style={styles.personalEmailText}>{displayEmail}</Text>
                    </View>

                    {/* CARD SEPARADO DE DADOS PESSOAIS COM LÁPIS NO TOPO DIREITO */}
                    <Text style={styles.sectionTitle}>INFORMAÇÕES DA CONTA</Text>
                    <View style={styles.settingsGroup}>
                      {/* Topo do Card com Título e Ícone do Lápis */}
                      <View style={styles.cardHeaderBar}>
                        <View style={styles.cardHeaderLeft}>
                          <View style={styles.miniIconBadge}>
                            <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
                          </View>
                          <Text style={styles.cardHeaderTitle}>Dados Cadastrais</Text>
                        </View>

                        {/* ÍCONE DE LÁPIS NO TOPO DIREITO */}
                        <BouncingPressable
                          style={[
                            styles.pencilIconButton,
                            isEditing && styles.pencilIconButtonActive,
                          ]}
                          scaleTo={0.9}
                          onPress={() => {
                            if (isEditing) {
                              handleCancelEdit();
                            } else {
                              setIsEditing(true);
                            }
                          }}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={isEditing ? 'close' : 'pencil'}
                            size={16}
                            color={isEditing ? colors.danger : colors.primary}
                          />
                        </BouncingPressable>
                      </View>

                      <View style={styles.itemDividerFull} />

                      {/* CAMPO 1: NOME */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Nome Completo</Text>
                        {isEditing ? (
                          <View style={styles.editInputWrapper}>
                            <Ionicons
                              name="person-outline"
                              size={18}
                              color={colors.textSecondary}
                              style={styles.editInputIcon}
                            />
                            <TextInput
                              style={styles.editInput}
                              value={editName}
                              onChangeText={setEditName}
                              placeholder="Seu nome completo"
                              placeholderTextColor={colors.textMuted}
                              autoCapitalize="words"
                            />
                          </View>
                        ) : (
                          <Text style={styles.fieldValueText}>{user?.name || 'Não informado'}</Text>
                        )}
                      </View>

                      <View style={styles.itemDividerFull} />

                      {/* CAMPO 2: E-MAIL */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Endereço de E-mail</Text>
                        {isEditing ? (
                          <View style={styles.editInputWrapper}>
                            <Ionicons
                              name="mail-outline"
                              size={18}
                              color={colors.textSecondary}
                              style={styles.editInputIcon}
                            />
                            <TextInput
                              style={styles.editInput}
                              value={editEmail}
                              onChangeText={setEditEmail}
                              placeholder="seu.email@exemplo.com"
                              placeholderTextColor={colors.textMuted}
                              autoCapitalize="none"
                              keyboardType="email-address"
                            />
                          </View>
                        ) : (
                          <Text style={styles.fieldValueText}>{user?.email || 'Não informado'}</Text>
                        )}
                      </View>

                      <View style={styles.itemDividerFull} />

                      {/* CAMPO 3: SENHA */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>
                          {isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha de Acesso'}
                        </Text>
                        {isEditing ? (
                          <>
                            <View style={styles.editInputWrapper}>
                              <Ionicons
                                name="lock-closed-outline"
                                size={18}
                                color={colors.textSecondary}
                                style={styles.editInputIcon}
                              />
                              <TextInput
                                style={styles.editInput}
                                value={editPassword}
                                onChangeText={setEditPassword}
                                placeholder="Digite uma nova senha"
                                placeholderTextColor={colors.textMuted}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                              />
                              <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              >
                                <Ionicons
                                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                  size={18}
                                  color={colors.textMuted}
                                />
                              </TouchableOpacity>
                            </View>

                            {editPassword.length > 0 && (
                              <View style={[styles.editInputWrapper, { marginTop: 10 }]}>
                                <Ionicons
                                  name="lock-closed-outline"
                                  size={18}
                                  color={colors.textSecondary}
                                  style={styles.editInputIcon}
                                />
                                <TextInput
                                  style={styles.editInput}
                                  value={editConfirmPassword}
                                  onChangeText={setEditConfirmPassword}
                                  placeholder="Confirme a nova senha"
                                  placeholderTextColor={colors.textMuted}
                                  secureTextEntry={!showPassword}
                                  autoCapitalize="none"
                                />
                              </View>
                            )}
                          </>
                        ) : (
                          <Text style={styles.fieldValueText}>••••••••••••</Text>
                        )}
                      </View>
                    </View>

                    {/* Ações quando estiver editando */}
                    {isEditing && (
                      <View style={styles.editActionsContainer}>
                        <BouncingPressable
                          style={styles.saveButton}
                          scaleTo={0.96}
                          onPress={handleSaveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <ActivityIndicator color={colors.buttonText} />
                          ) : (
                            <>
                              <Ionicons name="checkmark" size={19} color={colors.buttonText} />
                              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
                            </>
                          )}
                        </BouncingPressable>

                        <BouncingPressable
                          style={styles.cancelButton}
                          scaleTo={0.96}
                          onPress={handleCancelEdit}
                          disabled={isSaving}
                        >
                          <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </BouncingPressable>
                      </View>
                    )}
                  </Animated.View>
                )}

                {/* ========================================================= */}
                {/* TELA 3: SUBPAGE APARÊNCIA (Automático | Escuro | Claro)  */}
                {/* ========================================================= */}
                {currentView === 'appearance' && (
                  <Animated.View
                    style={{
                      opacity: viewFadeAnim,
                      transform: [{ translateX: viewSlideAnim }],
                    }}
                  >
                    <View style={styles.appearanceCard}>
                      {/* Opção 1: Automático */}
                      <BouncingPressable
                        style={styles.appearanceOptionRow}
                        scaleTo={0.98}
                        onPress={() => setThemeMode('system')}
                      >
                        <Text style={styles.appearanceOptionLabel}>Automático</Text>
                        {themeMode === 'system' && (
                          <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
                        )}
                      </BouncingPressable>

                      <View style={styles.appearanceDivider} />

                      {/* Opção 2: Escuro */}
                      <BouncingPressable
                        style={styles.appearanceOptionRow}
                        scaleTo={0.98}
                        onPress={() => setThemeMode('dark')}
                      >
                        <Text style={styles.appearanceOptionLabel}>Escuro</Text>
                        {themeMode === 'dark' && (
                          <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
                        )}
                      </BouncingPressable>

                      <View style={styles.appearanceDivider} />

                      {/* Opção 3: Claro */}
                      <BouncingPressable
                        style={styles.appearanceOptionRow}
                        scaleTo={0.98}
                        onPress={() => setThemeMode('light')}
                      >
                        <Text style={styles.appearanceOptionLabel}>Claro</Text>
                        {themeMode === 'light' && (
                          <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
                        )}
                      </BouncingPressable>
                    </View>
                  </Animated.View>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
          {/* OVERLAY 1: INPUT PARA A META DIÁRIA DE GASTOS */}
          {isGoalModalVisible && (
            <Animated.View style={[styles.goalModalOverlayWrapper, { opacity: goalFadeAnim }]}>
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={handleCloseGoalModal}
              />

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.goalKeyboardWrapper}
              >
                <Animated.View
                  style={[
                    styles.goalCardContainer,
                    { transform: [{ scale: goalScaleAnim }] },
                  ]}
                >
                  <View style={styles.goalModalHeader}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.goalModalTitle}>Meta Diária de Gastos</Text>
                      <Text style={styles.goalModalSubtitle}>
                        Defina o valor limite que você deseja gastar por dia
                      </Text>
                    </View>
                    <BouncingPressable
                      style={styles.closeButtonSmall}
                      scaleTo={0.9}
                      onPress={handleCloseGoalModal}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={18} color={colors.textSecondary} />
                    </BouncingPressable>
                  </View>

                  {/* Input com Símbolo da Moeda Atual */}
                  <View style={styles.goalInputRow}>
                    <View style={styles.goalCurrencyBadge}>
                      <Text style={styles.goalCurrencyBadgeText}>{getCurrencySymbol()}</Text>
                    </View>
                    <TextInput
                      style={styles.goalTextInput}
                      value={goalInput}
                      onChangeText={setGoalInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      autoFocus={true}
                      selectTextOnFocus={true}
                    />
                  </View>

                  {/* Chips de Atalhos Rápidos */}
                  <View style={styles.presetChipsRow}>
                    {[100, 250, 350, 500].map((val) => (
                      <BouncingPressable
                        key={val}
                        style={[
                          styles.presetChip,
                          goalInput === val.toString() && styles.presetChipActive,
                        ]}
                        scaleTo={0.93}
                        onPress={() => setGoalInput(val.toString())}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            goalInput === val.toString() && styles.presetChipTextActive,
                          ]}
                        >
                          {getCurrencySymbol()} {val}
                        </Text>
                      </BouncingPressable>
                    ))}
                  </View>

                  {/* Botões de Ação */}
                  <View style={styles.goalActionButtons}>
                    <BouncingPressable
                      style={styles.saveGoalButton}
                      scaleTo={0.96}
                      onPress={handleSaveGoal}
                    >
                      <Ionicons name="checkmark" size={18} color={colors.buttonText} />
                      <Text style={styles.saveGoalButtonText}>Salvar Meta</Text>
                    </BouncingPressable>

                    <BouncingPressable
                      style={styles.cancelGoalButton}
                      scaleTo={0.96}
                      onPress={handleCloseGoalModal}
                    >
                      <Text style={styles.cancelGoalButtonText}>Cancelar</Text>
                    </BouncingPressable>
                  </View>
                </Animated.View>
              </KeyboardAvoidingView>
            </Animated.View>
          )}

          {/* OVERLAY 2: POPOVER MENU FLUTUANTE DE MOEDAS (NATIVO iOS) */}
          {isCurrencyMenuVisible && (
            <Animated.View
              style={[
                styles.currencyPopoverOverlayWrapper,
                { opacity: popoverFadeAnim },
              ]}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={() => handleCloseCurrencyMenu()}
              />
              <Animated.View
                style={[
                  styles.iosPopoverContainer,
                  {
                    top: menuPosition.top,
                    right: menuPosition.right,
                    transform: [{ scale: popoverScaleAnim }],
                  },
                ]}
              >
                {CURRENCY_OPTIONS.map((opt, index) => {
                  const isSelected = opt.code === currency;
                  const isLast = index === CURRENCY_OPTIONS.length - 1;
                  return (
                    <BouncingPressable
                      key={opt.code}
                      style={[
                        styles.iosPopoverItem,
                        isLast && { borderBottomWidth: 0 },
                      ]}
                      scaleTo={0.97}
                      onPress={() => handleSelectCurrency(opt.code)}
                    >
                      <View style={styles.iosPopoverCheckCol}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={17} color={colors.textPrimary} />
                        )}
                      </View>
                      <Text style={styles.iosPopoverItemLabel}>
                        {opt.name} ({opt.code} - {opt.symbol})
                      </Text>
                    </BouncingPressable>
                  );
                })}
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </>
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
    keyboardContainer: {
      justifyContent: 'flex-end',
    },
    modalContent: {
      maxHeight: '90%',
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
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 2,
    },
    backButtonText: {
      fontSize: 18,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    modalTitle: {
      fontSize: 22,
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
    scrollContent: {
      paddingBottom: 30,
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
      borderColor: isDark ? colors.primary : colors.bentoBorder,
    },
    avatarInitial: {
      fontSize: 22,
      fontFamily: typography.bold,
      color: isDark ? colors.primary : colors.textPrimary,
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
      color: colors.textPrimary,
    },
    badgePro: {
      backgroundColor: isDark ? colors.primary : colors.buttonBg,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeProText: {
      fontSize: 9,
      fontFamily: typography.bold,
      color: isDark ? colors.black : colors.white,
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
      color: colors.textPrimary,
    },
    settingValue: {
      fontSize: 13,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    settingValueHighlight: {
      fontSize: 13,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    settingItemActive: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
    },
    currencyBadgeActive: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: colors.surfaceHighlight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currencyBadgeActiveText: {
      fontSize: 11,
      fontFamily: typography.bold,
      color: isDark ? colors.primary : colors.textPrimary,
    },
    popoverBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    iosPopoverContainer: {
      position: 'absolute',
      width: 265,
      backgroundColor: isDark ? '#26262A' : '#FFFFFF',
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.45 : 0.15,
      shadowRadius: 18,
      elevation: 16,
      overflow: 'hidden',
    },
    iosPopoverItem: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      paddingHorizontal: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
    },
    iosPopoverCheckCol: {
      width: 24,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    iosPopoverItemLabel: {
      fontSize: 14,
      fontFamily: typography.medium,
      color: colors.textPrimary,
    },
    itemDivider: {
      height: 1,
      backgroundColor: colors.bentoBorder,
      marginLeft: 60,
    },
    itemDividerFull: {
      height: 1,
      backgroundColor: colors.bentoBorder,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 16,
      height: 50,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.25)',
      marginTop: 10,
    },
    logoutButtonText: {
      fontSize: 15,
      fontFamily: typography.bold,
      color: colors.danger,
    },

    // -------------------------------------------------------------
    // ESTILOS DA SUBPAGE: APARÊNCIA (Referência iOS: Automático, Escuro, Claro)
    // -------------------------------------------------------------
    appearanceHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 2,
    },
    circularBackButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    appearanceHeaderTitle: {
      fontSize: 18,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    appearanceCard: {
      backgroundColor: colors.card,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      overflow: 'hidden',
      marginTop: 8,
    },
    appearanceOptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      height: 56,
    },
    appearanceOptionLabel: {
      fontSize: 16,
      fontFamily: typography.medium,
      color: colors.textPrimary,
    },
    appearanceDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.cardDivider,
      marginLeft: 20,
    },

    // -------------------------------------------------------------
    // ESTILOS DA SUBPAGE: DADOS PESSOAIS
    // -------------------------------------------------------------
    personalAvatarHeader: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 4,
    },
    avatarCircleLarge: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: isDark ? colors.primary : colors.bentoBorder,
      marginBottom: 6,
    },
    avatarInitialLarge: {
      fontSize: 28,
      fontFamily: typography.bold,
      color: isDark ? colors.primary : colors.textPrimary,
    },
    personalNameText: {
      fontSize: 18,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    personalEmailText: {
      fontSize: 13,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    cardHeaderBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    miniIconBadge: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(18, 18, 20, 0.08)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardHeaderTitle: {
      fontSize: 14,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    pencilIconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.bentoBorder,
    },
    pencilIconButtonActive: {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    fieldContainer: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 6,
    },
    fieldLabel: {
      fontSize: 12,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    fieldValueText: {
      fontSize: 15,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    editInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.background : colors.surfaceHighlight,
      borderRadius: 14,
      paddingHorizontal: 12,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 2,
    },
    editInputIcon: {
      marginRight: 10,
    },
    editInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: typography.medium,
      color: colors.textPrimary,
      padding: 0,
    },
    securePasswordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    secureBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    secureBadgeText: {
      fontSize: 11,
      fontFamily: typography.bold,
      color: isDark ? colors.primary : colors.textPrimary,
    },
    editActionsContainer: {
      gap: 10,
      marginTop: 4,
    },
    saveButton: {
      backgroundColor: colors.buttonBg,
      height: 50,
      borderRadius: 25,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    saveButtonText: {
      fontSize: 15,
      fontFamily: typography.bold,
      color: colors.buttonText,
    },
    cancelButton: {
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.bentoBorder,
      backgroundColor: colors.bentoCard,
    },
    cancelButtonText: {
      fontSize: 14,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },

    goalModalOverlayWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.backdrop,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      zIndex: 1000,
      elevation: 1000,
    },
    currencyPopoverOverlayWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1100,
      elevation: 1100,
    },
    goalModalOverlay: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    goalKeyboardWrapper: {
      width: '100%',
      maxWidth: 380,
    },
    goalCardContainer: {
      backgroundColor: colors.surface,
      borderRadius: 26,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 16,
    },
    goalModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    goalModalTitle: {
      fontSize: 19,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
    goalModalSubtitle: {
      fontSize: 12,
      fontFamily: typography.medium,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },
    closeButtonSmall: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.surfaceHighlight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    goalInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.background : colors.surfaceHighlight,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      height: 56,
    },
    goalCurrencyBadge: {
      backgroundColor: colors.surfaceHighlight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      marginRight: 10,
    },
    goalCurrencyBadgeText: {
      fontSize: 15,
      fontFamily: typography.bold,
      color: isDark ? colors.primary : colors.textPrimary,
    },
    goalTextInput: {
      flex: 1,
      fontSize: 22,
      fontFamily: typography.bold,
      color: colors.textPrimary,
      padding: 0,
    },
    presetChipsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 6,
    },
    presetChip: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: colors.bentoCard,
      borderWidth: 1,
      borderColor: colors.bentoBorder,
      alignItems: 'center',
    },
    presetChipActive: {
      backgroundColor: isDark ? colors.primary : colors.buttonBg,
      borderColor: isDark ? colors.primary : colors.buttonBg,
    },
    presetChipText: {
      fontSize: 11,
      fontFamily: typography.bold,
      color: colors.textSecondary,
    },
    presetChipTextActive: {
      color: isDark ? colors.black : colors.white,
    },
    goalActionButtons: {
      gap: 8,
      marginTop: 4,
    },
    saveGoalButton: {
      backgroundColor: colors.buttonBg,
      height: 48,
      borderRadius: 24,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    saveGoalButtonText: {
      fontSize: 15,
      fontFamily: typography.bold,
      color: colors.buttonText,
    },
    cancelGoalButton: {
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelGoalButtonText: {
      fontSize: 13,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
  });
