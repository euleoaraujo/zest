import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useExpenseStore } from './src/store/useExpenseStore';
import { colors } from './src/theme/colors';
import { BentoHeader } from './src/components/BentoHeader';
import { BentoGrid } from './src/components/BentoGrid';
import { ShortcutGrid } from './src/components/ShortcutGrid';
import { ExpenseTimeline } from './src/components/ExpenseTimeline';
import { QuickExpenseModal } from './src/components/QuickExpenseModal';
import { AllExpensesModal } from './src/components/AllExpensesModal';
import { SettingsModal } from './src/components/SettingsModal';
import { SplashScreen } from './src/components/SplashScreen';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'SFPro-Medium': require('./assets/fonts/SF-Pro-Display-Medium.otf'),
    'SFPro-Regular': require('./assets/fonts/SF-Pro-Display-Regular.otf'),
    'SFPro-Bold': require('./assets/fonts/SF-Pro-Display-Bold.otf'),
  });

  const {
    categories,
    todayExpenses,
    todayTotal,
    monthTotal,
    allExpenses,
    allTotal,
    isLoading,
    isQuickExpenseOpen,
    isAllExpensesOpen,
    selectedCategory,
    openQuickExpense,
    closeQuickExpense,
    openAllExpenses,
    closeAllExpenses,
    loadInitialData,
    refreshToday,
    refreshAllExpenses,
    createExpense,
    removeExpense,
  } = useExpenseStore();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshToday(), refreshAllExpenses()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {isSplashVisible && (
          <SplashScreen
            isReady={!isLoading && (fontsLoaded || !!fontError)}
            onFinish={() => setIsSplashVisible(false)}
          />
        )}

        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.white}
                colors={[colors.white]}
              />
            }
          >
            {/* Header estilo Bento Dark Mode com ações no topo direito */}
            <BentoHeader
              onOpenQuickExpense={() => openQuickExpense()}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* Grid Bento Principal com card maior em cima e dois menores embaixo */}
            <BentoGrid
              todayTotal={todayTotal}
              todayCount={todayExpenses.length}
              monthTotal={monthTotal}
              allTotal={allTotal}
              allCount={allExpenses.length}
              todayExpenses={todayExpenses}
              onOpenAllExpenses={openAllExpenses}
              onOpenQuickExpense={() => openQuickExpense()}
            />

            {/* Atalhos Rápidos estilizados em mini-cards Bento */}
            <ShortcutGrid
              categories={categories}
              onSelectCategory={(category) => openQuickExpense(category)}
            />

            {/* Linha do Tempo exclusiva para os gastos diários */}
            <ExpenseTimeline
              expenses={todayExpenses}
              onDeleteExpense={removeExpense}
            />
          </ScrollView>

          {/* Modal de Registro Rápido */}
          <QuickExpenseModal
            visible={isQuickExpenseOpen}
            categories={categories}
            initialCategory={selectedCategory}
            onClose={closeQuickExpense}
            onSubmit={createExpense}
          />

          {/* Modal de Gastos Totais (Histórico Completo) */}
          <AllExpensesModal
            visible={isAllExpensesOpen}
            expenses={allExpenses}
            total={allTotal}
            onClose={closeAllExpenses}
            onDeleteExpense={removeExpense}
          />

          {/* Modal de Configurações do App / Perfil (Stub) */}
          <SettingsModal
            visible={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
