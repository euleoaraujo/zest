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

  strokeDuration?: number;

  holdDuration?: number;

  fadeOutDuration?: number;

  pauseDuration?: number;

  loop?: boolean;

  strokeEasing?: 'linear' | 'ease' | 'ease-in-out' | string;

  fadeEasing?: string;

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
