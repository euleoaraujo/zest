import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme/typography';
import { useAuthStore } from '../store/useAuthStore';
import { LogoStatic } from './AnimatedLogo';
import { BouncingPressable } from './common/BouncingPressable';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type AuthView = 'login' | 'signup' | 'forgot' | 'new_password';

interface AuthScreenProps {
  initialView?: AuthView;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialView = 'signup' }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { login, signup, resetPassword, loginWithSocial } = useAuthStore();

  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginNotFound, setLoginNotFound] = useState<boolean>(false);

  // Animação de transição suave entre telas
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchView = (targetView: AuthView) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -10,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentView(targetView);
      slideAnim.setValue(14);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          bounciness: 5,
          speed: 24,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Campos de Formulário
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');

  // Visibilidade de Senhas
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Ação de Login
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Informe o seu e-mail e sua senha.');
      return;
    }

    try {
      setLoading(true);
      setLoginNotFound(false);
      const res = await login(email, password);
      if (!res.success) {
        if (res.notFound) {
          setLoginNotFound(true);
        } else {
          Alert.alert('Falha ao Entrar', res.message || 'Credenciais inválidas.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Ação de Cadastro
  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Senhas Diferentes', 'A confirmação de senha não coincide com a senha digitada.');
      return;
    }

    try {
      setLoading(true);
      const res = await signup(name, email, password);
      if (!res.success) {
        Alert.alert('Falha no Cadastro', res.message || 'Não foi possível criar a conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Ação de Esqueci a Senha (Avança direto para criar nova senha, pulando verificação de email)
  const handleForgotPassword = () => {
    if (!resetEmail.trim()) {
      Alert.alert('Atenção', 'Digite o e-mail cadastrado para redefinir.');
      return;
    }
    setPassword('');
    setConfirmPassword('');
    switchView('new_password');
  };

  // Ação de Salvar Nova Senha
  const handleSaveNewPassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Atenção', 'Digite e confirme a nova senha.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Senhas Diferentes', 'A confirmação de senha não coincide com a nova senha.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(resetEmail, password);
      if (res.success) {
        Alert.alert('Sucesso', 'Sua senha foi redefinida com sucesso! Faça login com a nova senha.', [
          {
            text: 'Ir para o Login',
            onPress: () => {
              setEmail(resetEmail);
              setPassword('');
              switchView('login');
            },
          },
        ]);
      } else {
        Alert.alert('Erro', res.message || 'Não foi possível redefinir a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'apple' | 'google') => {
    try {
      setLoading(true);
      await loginWithSocial(provider);
    } catch {
      Alert.alert('Erro', 'Falha ao autenticar com rede social.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header com Logo Centralizada e Botão < Back */}
        <View style={styles.topHeader}>
          {currentView !== 'login' && (
            <BouncingPressable
              style={styles.backButton}
              scaleTo={0.92}
              onPress={() => {
                if (currentView === 'new_password') {
                  switchView('forgot');
                } else {
                  switchView('login');
                }
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              <Text style={styles.backText}>Voltar</Text>
            </BouncingPressable>
          )}

          <View style={styles.brandRow}>
            <LogoStatic width={38} color={colors.textPrimary} />
            <Text style={styles.brandText}>Zest</Text>
          </View>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* TELA 1: LOGIN (Olá, Bem-vindo de volta) */}
        {/* ------------------------------------------------------------- */}
        {currentView === 'login' && (
          <Animated.View
            style={[
              styles.viewContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleSection}>
              <Text style={styles.largeTitle}>Olá,</Text>
              <Text style={styles.largeTitle}>Bem-vindo</Text>
              <Text style={styles.largeTitle}>de volta</Text>
            </View>

            <View style={styles.formSection}>
              {/* Input Email */}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (loginNotFound) setLoginNotFound(false);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Input Password */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (loginNotFound) setLoginNotFound(false);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Link Esqueci a Senha */}
              <BouncingPressable
                style={styles.forgotLinkContainer}
                scaleTo={0.96}
                onPress={() => {
                  setResetEmail(email);
                  switchView('forgot');
                }}
              >
                <Text style={styles.forgotLinkText}>Esqueceu a senha?</Text>
              </BouncingPressable>

              {/* Alerta Visual de Conta Não Encontrada com Botão para Cadastrar */}
              {loginNotFound && (
                <View style={styles.notFoundCard}>
                  <View style={styles.notFoundHeader}>
                    <View style={styles.notFoundIconCircle}>
                      <Ionicons name="alert-circle" size={20} color="#F87171" />
                    </View>
                    <View style={styles.notFoundTextCol}>
                      <Text style={styles.notFoundTitle}>Conta não encontrada</Text>
                      <Text style={styles.notFoundMessage}>
                        Nenhum cadastro encontrado para "{email.trim()}".
                      </Text>
                    </View>
                  </View>

                  <BouncingPressable
                    style={styles.notFoundButton}
                    scaleTo={0.96}
                    onPress={() => {
                      setLoginNotFound(false);
                      setPassword('');
                      setConfirmPassword('');
                      switchView('signup');
                    }}
                  >
                    <Ionicons name="person-add-outline" size={16} color={colors.white} />
                    <Text style={styles.notFoundButtonText}>Cadastre-se com este e-mail</Text>
                  </BouncingPressable>
                </View>
              )}

              {/* Botão Principal Entrar */}
              <BouncingPressable
                style={styles.primaryButton}
                scaleTo={0.96}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.primaryButtonText}>Entrar</Text>
                )}
              </BouncingPressable>

              {/* Divisor "ou" */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Botões Sociais */}
              <BouncingPressable
                style={styles.socialButton}
                scaleTo={0.96}
                onPress={() => handleSocial('apple')}
                disabled={loading}
              >
                <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
                <Text style={styles.socialButtonText}>Continuar com Apple</Text>
              </BouncingPressable>

              <BouncingPressable
                style={styles.socialButton}
                scaleTo={0.96}
                onPress={() => handleSocial('google')}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.socialButtonText}>Continuar com Google</Text>
              </BouncingPressable>
            </View>

            {/* Link Rodapé para Cadastro */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Não tem uma conta? </Text>
              <BouncingPressable onPress={() => switchView('signup')} scaleTo={0.93}>
                <Text style={styles.footerAction}>Cadastre-se</Text>
              </BouncingPressable>
            </View>
          </Animated.View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TELA 2: CADASTRO (Vamos Começar) */}
        {/* ------------------------------------------------------------- */}
        {currentView === 'signup' && (
          <Animated.View
            style={[
              styles.viewContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleSection}>
              <Text style={styles.largeTitle}>Vamos</Text>
              <Text style={styles.largeTitle}>Começar</Text>
            </View>

            <View style={styles.formSection}>
              {/* Input Nome */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              {/* Input Email */}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor={colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Input Password */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Input Confirm Password */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar senha"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Botão Principal Cadastrar */}
              <BouncingPressable
                style={styles.primaryButton}
                scaleTo={0.96}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.primaryButtonText}>Cadastrar</Text>
                )}
              </BouncingPressable>

              {/* Divisor "ou" */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Botões Sociais */}
              <BouncingPressable
                style={styles.socialButton}
                scaleTo={0.96}
                onPress={() => handleSocial('apple')}
                disabled={loading}
              >
                <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
                <Text style={styles.socialButtonText}>Continuar com Apple</Text>
              </BouncingPressable>

              <BouncingPressable
                style={styles.socialButton}
                scaleTo={0.96}
                onPress={() => handleSocial('google')}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.socialButtonText}>Continuar com Google</Text>
              </BouncingPressable>
            </View>

            {/* Link Rodapé para Login */}
            <View style={styles.footerRow}>
              <Text style={styles.footerPrompt}>Já possui uma conta? </Text>
              <BouncingPressable onPress={() => switchView('login')} scaleTo={0.93}>
                <Text style={styles.footerAction}>Entrar</Text>
              </BouncingPressable>
            </View>
          </Animated.View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TELA 3: ESQUECI A SENHA (Digite seu e-mail) */}
        {/* ------------------------------------------------------------- */}
        {currentView === 'forgot' && (
          <Animated.View
            style={[
              styles.viewContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleSection}>
              <Text style={styles.largeTitle}>Esqueceu a</Text>
              <Text style={styles.largeTitle}>Senha?</Text>
              <Text style={styles.subtitleText}>Digite seu endereço de e-mail</Text>
            </View>

            <View style={styles.formSection}>
              {/* Input Email */}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor={colors.textMuted}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Botão Enviar */}
              <BouncingPressable
                style={[styles.primaryButton, { marginTop: 14 }]}
                scaleTo={0.96}
                onPress={handleForgotPassword}
              >
                <Text style={styles.primaryButtonText}>Enviar</Text>
              </BouncingPressable>
            </View>
          </Animated.View>
        )}

        {/* ------------------------------------------------------------- */}
        {/* TELA 4: CRIAR NOVA SENHA */}
        {/* ------------------------------------------------------------- */}
        {currentView === 'new_password' && (
          <Animated.View
            style={[
              styles.viewContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.titleSection}>
              <Text style={styles.largeTitle}>Criar</Text>
              <Text style={styles.largeTitle}>Nova senha</Text>
              <Text style={styles.subtitleText}>
                Sua nova senha deve ser diferente da senha usada anteriormente
              </Text>
            </View>

            <View style={styles.formSection}>
              {/* Input Nova Senha */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nova senha"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Input Confirmar Nova Senha */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={19} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar nova senha"
                  placeholderTextColor={colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Botão Salvar */}
              <BouncingPressable
                style={[styles.primaryButton, { marginTop: 14 }]}
                scaleTo={0.96}
                onPress={handleSaveNewPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.buttonText} />
                ) : (
                  <Text style={styles.primaryButtonText}>Salvar</Text>
                )}
              </BouncingPressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ColorTheme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'ios' ? 54 : 36,
      paddingBottom: 40,
      justifyContent: 'space-between',
    },
    topHeader: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      marginBottom: 28,
    },
    backButton: {
      position: 'absolute',
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      zIndex: 10,
    },
    backText: {
      fontSize: 16,
      fontFamily: typography.medium,
      color: colors.textPrimary,
    },
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    brandText: {
      fontSize: 26,
      fontFamily: typography.bold,
      color: colors.textPrimary,
      letterSpacing: -0.5,
    },
    viewContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    titleSection: {
      marginBottom: 32,
      gap: 2,
    },
    largeTitle: {
      fontSize: 34,
      fontFamily: typography.bold,
      color: colors.textPrimary,
      lineHeight: 40,
      letterSpacing: -0.6,
    },
    subtitleText: {
      fontSize: 14,
      fontFamily: typography.medium,
      color: colors.textSecondary,
      marginTop: 10,
      lineHeight: 20,
    },
    formSection: {
      gap: 14,
      marginBottom: 28,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bentoCard,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 54,
      borderWidth: 1,
      borderColor: colors.bentoBorder,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontFamily: typography.medium,
      color: colors.textPrimary,
      padding: 0,
    },
    forgotLinkContainer: {
      alignSelf: 'flex-end',
      marginTop: -4,
      marginBottom: 6,
    },
    forgotLinkText: {
      fontSize: 13,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    notFoundCard: {
      backgroundColor: 'rgba(239, 68, 68, 0.12)',
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.35)',
      marginTop: 4,
      marginBottom: 8,
      gap: 12,
    },
    notFoundHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    notFoundIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(239, 68, 68, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    notFoundTextCol: {
      flex: 1,
    },
    notFoundTitle: {
      fontSize: 14,
      fontFamily: typography.bold,
      color: '#FCA5A5',
    },
    notFoundMessage: {
      fontSize: 12,
      fontFamily: typography.medium,
      color: colors.textSecondary,
      marginTop: 2,
      lineHeight: 16,
    },
    notFoundButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.45)',
      height: 42,
      borderRadius: 12,
    },
    notFoundButtonText: {
      fontSize: 13,
      fontFamily: typography.bold,
      color: '#FFFFFF',
    },
    primaryButton: {
      backgroundColor: colors.buttonBg,
      height: 52,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 6,
    },
    primaryButtonText: {
      fontSize: 16,
      fontFamily: typography.bold,
      color: colors.buttonText,
      letterSpacing: -0.2,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.bentoBorder,
    },
    dividerText: {
      fontSize: 13,
      fontFamily: typography.medium,
      color: colors.textMuted,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bentoCard,
      height: 50,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.bentoBorder,
      gap: 10,
    },
    socialButtonText: {
      fontSize: 15,
      fontFamily: typography.medium,
      color: colors.textPrimary,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    footerPrompt: {
      fontSize: 14,
      fontFamily: typography.medium,
      color: colors.textSecondary,
    },
    footerAction: {
      fontSize: 14,
      fontFamily: typography.bold,
      color: colors.textPrimary,
    },
  });
