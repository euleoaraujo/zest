export interface ColorTheme {
  background: string;
  surface: string;
  surfaceHighlight: string;
  card: string;
  cardBorder: string;
  cardDivider: string;
  cardTextPrimary: string;
  cardTextSecondary: string;
  cardTextMuted: string;
  border: string;
  primary: string;
  primaryDark: string;
  buttonBg: string;
  buttonText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
  dangerLight: string;
  success: string;
  white: string;
  black: string;
  backdrop: string;

  // Bento Theme Tokens
  bentoCard: string;
  bentoCardHighlight: string;
  bentoBorder: string;
  bentoSubtleBorder: string;
  dotActive: string;
  dotInactive: string;
  dockBg: string;
  dockBorder: string;
  dockActive: string;
  dockInactive: string;
  brandLime: string;
}

export const darkColors: ColorTheme = {
  background: '#000000',
  surface: '#121214',
  surfaceHighlight: '#1A1A1E',
  card: '#161618',
  cardBorder: '#242428',
  cardDivider: '#222226',
  cardTextPrimary: '#FFFFFF',
  cardTextSecondary: '#8E8E93',
  cardTextMuted: '#636366',
  border: '#242428',
  primary: '#E2F163',
  primaryDark: '#B4C438',
  buttonBg: '#E2F163',
  buttonText: '#000000',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#636366',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  success: '#10B981',
  white: '#FFFFFF',
  black: '#000000',
  backdrop: 'rgba(0, 0, 0, 0.75)',

  bentoCard: '#161618',
  bentoCardHighlight: '#1C1C1F',
  bentoBorder: '#26262A',
  bentoSubtleBorder: 'rgba(255, 255, 255, 0.07)',
  dotActive: '#FFFFFF',
  dotInactive: '#26262B',
  dockBg: '#161618',
  dockBorder: '#28282D',
  dockActive: '#FFFFFF',
  dockInactive: '#636366',
  brandLime: '#E2F163',
};

export const lightColors: ColorTheme = {
  // Fundo cinza/off-white padrão iOS, cards em branco puro com bordas sutis
  background: '#F2F2F7',
  surface: '#F2F2F7',
  surfaceHighlight: '#E5E5EA',
  card: '#FFFFFF',
  cardBorder: '#E5E5EA',
  cardDivider: '#E5E5EA',
  cardTextPrimary: '#121214',
  cardTextSecondary: '#6C6C70',
  cardTextMuted: '#8E8E93',
  border: '#E5E5EA',
  primary: '#121214',
  primaryDark: '#000000',
  buttonBg: '#121214',
  buttonText: '#FFFFFF',
  textPrimary: '#121214',
  textSecondary: '#6C6C70',
  textMuted: '#8E8E93',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.12)',
  success: '#10B981',
  white: '#FFFFFF',
  black: '#000000',
  backdrop: 'rgba(0, 0, 0, 0.45)',

  bentoCard: '#FFFFFF',
  bentoCardHighlight: '#F8F8FA',
  bentoBorder: '#E5E5EA',
  bentoSubtleBorder: 'rgba(0, 0, 0, 0.05)',
  dotActive: '#121214',
  dotInactive: '#D1D1D6',
  dockBg: '#FFFFFF',
  dockBorder: '#E5E5EA',
  dockActive: '#121214',
  dockInactive: '#8E8E93',
  brandLime: '#10B981',
};

// Objeto de cores padrão para compatibilidade
export const colors = darkColors;
