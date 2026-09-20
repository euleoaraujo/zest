import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseStore } from './src/store/useExpenseStore';
import { colors } from './src/theme/colors';
import { Header } from './src/components/Header';
import { ShortcutGrid } from './src/components/ShortcutGrid';
import { ExpenseTimeline } from './src/components/ExpenseTimeline';
import { QuickExpenseModal } from './src/components/QuickExpenseModal';
import { FloatingAddButton } from './src/components/FloatingAddButton';
import { SplashScreen } from './src/components/SplashScreen';

export default function App() {
  const {
    categories,
    todayExpenses,
    todayTotal,
    isLoading,
    isQuickExpenseOpen,
    selectedCategory,
    openQuickExpense,
    closeQuickExpense,
    loadInitialData,
    refreshToday,
    createExpense,
    removeExpense,
  } = useExpenseStore();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isSplashVisible, setIsSplashVisible] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshToday();
    setRefreshing(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {isSplashVisible && (
          <SplashScreen
            isReady={!isLoading}
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
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
          >
            <Header total={todayTotal} count={todayExpenses.length} />

            <ShortcutGrid
              categories={categories}
              onSelectCategory={(category) => openQuickExpense(category)}
            />

            <ExpenseTimeline
              expenses={todayExpenses}
              onDeleteExpense={removeExpense}
            />
          </ScrollView>

          <FloatingAddButton onPress={() => openQuickExpense()} />

          <QuickExpenseModal
            visible={isQuickExpenseOpen}
            categories={categories}
            initialCategory={selectedCategory}
            onClose={closeQuickExpense}
            onSubmit={createExpense}
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
