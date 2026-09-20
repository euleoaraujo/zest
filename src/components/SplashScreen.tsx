import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { AnimatedLogo, LogoLoaderController } from './AnimatedLogo';

interface SplashScreenProps {
  isReady: boolean;
  onFinish: () => void;
  strokeDuration?: number;
  width?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  isReady,
  onFinish,
  strokeDuration = 1400,
  width = 150,
}) => {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoRef = useRef<LogoLoaderController>(null);

  const readyRef = useRef(isReady);
  const strokeFinishedRef = useRef(false);

  readyRef.current = isReady;

  const finishSplash = () => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const handleCycleComplete = () => {
    strokeFinishedRef.current = true;
    if (readyRef.current) {
      finishSplash();
    }
  };

  useEffect(() => {
    if (isReady && strokeFinishedRef.current) {
      finishSplash();
    }
  }, [isReady]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.centerBox}>
        <AnimatedLogo
          ref={logoRef}
          width={width}
          color={colors.white}
          strokeDuration={strokeDuration}
          holdDuration={150}
          loop={false}
          onCycleComplete={handleCycleComplete}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  centerBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
