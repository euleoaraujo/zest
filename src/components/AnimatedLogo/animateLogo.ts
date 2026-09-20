/**
 * animateLogo.ts
 * --------------------------------------------------------------------------
 * Anima a logo (logo.svg) como se estivesse sendo desenhada à mão num traço
 * só, já com a espessura e a cor reais da marca: começa no topo,
 * faz a volta do "α" à esquerda, cruza e termina na ponta do "Z" à direita.
 * Se `loop: true`, ao terminar ela desaparece suavemente e o ciclo recomeça
 * — funcionando como loading.
 */

export interface LogoAnimationOptions {
  /** Duração do traço sendo desenhado (ms). Padrão: 4200 (ou configurável) */
  strokeDuration?: number;
  /** Tempo que a logo fica completa, parada, antes de sumir (ms). Padrão: 1000 */
  holdDuration?: number;
  /** Duração do fade-out antes de reiniciar o loop (ms). Padrão: 900 */
  fadeOutDuration?: number;
  /** Pausa "vazia" entre um ciclo e outro (ms). Padrão: 450 */
  pauseDuration?: number;
  /** Se true, repete infinitamente até `stop()` ser chamado. Padrão: true */
  loop?: boolean;
  /** Easing do traço sendo desenhado. Padrão "linear" */
  strokeEasing?: 'linear' | 'ease' | 'ease-in-out' | string;
  /** Easing do fade-out/fade-in entre ciclos */
  fadeEasing?: string;
  /** Chamado toda vez que um ciclo completo termina */
  onCycleComplete?: () => void;
}

export type RequiredLogoOptions = Required<LogoAnimationOptions>;

export const DEFAULT_LOGO_ANIMATION_OPTIONS: RequiredLogoOptions = {
  strokeDuration: 4200,
  holdDuration: 1000,
  fadeOutDuration: 900,
  pauseDuration: 450,
  loop: true,
  strokeEasing: 'linear',
  fadeEasing: 'cubic-bezier(0.37, 0, 0.63, 1)',
  onCycleComplete: () => {},
};

export interface LogoLoaderController {
  play: () => Promise<void> | void;
  stop: (options?: { finish?: boolean }) => void;
  reset: () => void;
}
