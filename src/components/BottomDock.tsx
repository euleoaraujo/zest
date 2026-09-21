import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ColorTheme } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export type DockTab = 'dashboard' | 'timeline' | 'stats' | 'settings';

interface BottomDockProps {
  currentTab: DockTab;
  onTabChange: (tab: DockTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.dockContainer}>
        {/* Tab 1: Bento Dashboard (Grid) */}
        <TouchableOpacity
          style={styles.tabButton}
          activeOpacity={0.7}
          onPress={() => onTabChange('dashboard')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={currentTab === 'dashboard' ? 'grid' : 'grid-outline'}
            size={22}
            color={currentTab === 'dashboard' ? colors.dockActive : colors.dockInactive}
          />
        </TouchableOpacity>

        {/* Tab 2: Calendário / Linha do Tempo */}
        <TouchableOpacity
          style={styles.tabButton}
          activeOpacity={0.7}
          onPress={() => onTabChange('timeline')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={currentTab === 'timeline' ? 'calendar' : 'calendar-outline'}
            size={22}
            color={currentTab === 'timeline' ? colors.dockActive : colors.dockInactive}
          />
        </TouchableOpacity>

        {/* Tab 3: Estatísticas / Gráficos */}
        <TouchableOpacity
          style={styles.tabButton}
          activeOpacity={0.7}
          onPress={() => onTabChange('stats')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={currentTab === 'stats' ? 'stats-chart' : 'stats-chart-outline'}
            size={22}
            color={currentTab === 'stats' ? colors.dockActive : colors.dockInactive}
          />
        </TouchableOpacity>

        {/* Tab 4: Configurações / Ajustes */}
        <TouchableOpacity
          style={styles.tabButton}
          activeOpacity={0.7}
          onPress={() => onTabChange('settings')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={currentTab === 'settings' ? 'options' : 'options-outline'}
            size={22}
            color={currentTab === 'settings' ? colors.dockActive : colors.dockInactive}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorTheme, isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      bottom: 22,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99,
    },
    dockContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.dockBg,
      paddingHorizontal: 26,
      height: 58,
      borderRadius: 29,
      borderWidth: 1,
      borderColor: colors.dockBorder,
      gap: 32,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
    tabButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
