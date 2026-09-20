import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, Mask, G, Path } from 'react-native-svg';
import {
  LOGO_VIEWBOX,
  LOGO_TRANSFORM,
  LOGO_PATH_TOTAL_LENGTH,
  LOGO_REVEAL_PATH_D,
  LOGO_FILL_PATH_D,
  LOGO_ASPECT_RATIO,
} from './logoPaths';
import { LogoLoaderController } from './animateLogo';

export interface AnimatedLogoProps {
  /** Largura desejada do SVG (padrão: 280) */
  width?: number;
  /** Altura desejada do SVG (calculada automaticamente a partir da proporção ~2.64 se omitida) */
  height?: number;
  /** Cor de preenchimento da logo revelada (padrão: #FFFFFF) */
  color?: string;
  /** Duração do traço sendo desenhado (ms). Padrão: 3200ms */
  strokeDuration?: number;
  /** Tempo que a logo fica completa, visível, antes de sumir (ms). Padrão: 1000ms */
  holdDuration?: number;
  /** Duração do fade-out antes de reiniciar o loop (ms). Padrão: 800ms */
  fadeOutDuration?: number;
  /** Pausa "vazia" entre um ciclo e outro (ms). Padrão: 400ms */
  pauseDuration?: number;
  /** Se true, repete infinitamente até stop() ser chamado. Padrão: true */
  loop?: boolean;
  /** Se inicia a animação imediatamente ao montar. Padrão: true */
  autoPlay?: boolean;
  /** Chamado toda vez que o traço termina de ser desenhado */
  onCycleComplete?: () => void;
  /** Chamado quando a animação encerra */
  onFinish?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const AnimatedLogo = forwardRef<LogoLoaderController, AnimatedLogoProps>(
  (
    {
      width = 280,
      height,
      color = '#FFFFFF',
      strokeDuration = 3200,
      holdDuration = 1000,
      fadeOutDuration = 800,
      pauseDuration = 400,
      loop = true,
      autoPlay = true,
      onCycleComplete,
      onFinish,
      style,
    },
    ref
  ) => {
    const computedHeight = height || Math.round(width / LOGO_ASPECT_RATIO);

    // Animação de offset do traço na máscara
    const strokeAnim = useRef(new Animated.Value(LOGO_PATH_TOTAL_LENGTH)).current;
    // Animação de opacidade do container (fade-out entre ciclos)
    const opacityAnim = useRef(new Animated.Value(1)).current;

    // Estado reativo para garantir que o strokeDashoffset atualize continuamente no SVG
    const [dashOffset, setDashOffset] = useState<number>(LOGO_PATH_TOTAL_LENGTH);

    const isCancelledRef = useRef<boolean>(false);
    const finishAfterCycleRef = useRef<boolean>(false);
    const isRunningRef = useRef<boolean>(false);

    useEffect(() => {
      const listenerId = strokeAnim.addListener(({ value }) => {
        setDashOffset(value);
      });
      return () => {
        strokeAnim.removeListener(listenerId);
      };
    }, [strokeAnim]);

    const waitMs = (ms: number) =>
      new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

    const resetToStart = () => {
      opacityAnim.setValue(1);
      strokeAnim.setValue(LOGO_PATH_TOTAL_LENGTH);
      setDashOffset(LOGO_PATH_TOTAL_LENGTH);
    };

    const runCycle = async () => {
      isRunningRef.current = true;
      isCancelledRef.current = false;
      finishAfterCycleRef.current = false;

      while (!isCancelledRef.current) {
        resetToStart();

        // 1) Desenha o traço contínuo do início ao fim
        await new Promise<void>((resolve) => {
          Animated.timing(strokeAnim, {
            toValue: 0,
            duration: strokeDuration,
            easing: Easing.linear,
            useNativeDriver: false,
          }).start(() => resolve());
        });

        if (isCancelledRef.current) break;

        // 2) Segura a logo completa visível
        if (onCycleComplete) {
          onCycleComplete();
        }
        await waitMs(holdDuration);

        if (isCancelledRef.current) break;

        // Se não for loop ou foi solicitado finalizar após o ciclo atual
        if (!loop || finishAfterCycleRef.current) {
          if (onFinish) {
            onFinish();
          }
          break;
        }

        // 3) Fade-out suave antes de reiniciar
        await new Promise<void>((resolve) => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: fadeOutDuration,
            easing: Easing.bezier(0.37, 0, 0.63, 1),
            useNativeDriver: true,
          }).start(() => resolve());
        });

        if (isCancelledRef.current) break;

        // 4) Pausa entre ciclos
        await waitMs(pauseDuration);
      }

      isRunningRef.current = false;
    };

    const play = () => {
      if (!isRunningRef.current) {
        runCycle();
      }
    };

    const stop = (options?: { finish?: boolean }) => {
      if (options?.finish) {
        finishAfterCycleRef.current = true;
      } else {
        isCancelledRef.current = true;
        strokeAnim.stopAnimation();
        opacityAnim.stopAnimation();
      }
    };

    const reset = () => {
      stop();
      resetToStart();
    };

    useImperativeHandle(ref, () => ({
      play,
      stop,
      reset,
    }));

    useEffect(() => {
      if (autoPlay) {
        play();
      }
      return () => {
        isCancelledRef.current = true;
        strokeAnim.stopAnimation();
        opacityAnim.stopAnimation();
      };
    }, [autoPlay]);

    return (
      <View style={[styles.container, { width, height: computedHeight }, style]}>
        <Animated.View style={[{ opacity: opacityAnim }, StyleSheet.absoluteFill]}>
          <Svg
            viewBox={LOGO_VIEWBOX}
            width={width}
            height={computedHeight}
            style={styles.svg}
          >
            <Defs>
              <Mask
                id="logo-reveal-mask"
                maskUnits="userSpaceOnUse"
                x="-1000"
                y="3000"
                width="13000"
                height="6500"
              >
                <Path
                  id="logo-reveal"
                  d={LOGO_REVEAL_PATH_D}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={1000}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={[LOGO_PATH_TOTAL_LENGTH, LOGO_PATH_TOTAL_LENGTH]}
                  strokeDashoffset={dashOffset}
                />
              </Mask>
            </Defs>

            <G
              id="logo-root"
              transform={LOGO_TRANSFORM}
            >
              <Path
                id="logo-fill"
                d={LOGO_FILL_PATH_D}
                fill={color}
                mask="url(#logo-reveal-mask)"
              />
            </G>
          </Svg>
        </Animated.View>
      </View>
    );
  }
);

AnimatedLogo.displayName = 'AnimatedLogo';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
});
