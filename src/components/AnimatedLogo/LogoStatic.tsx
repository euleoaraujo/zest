import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import {
  LOGO_VIEWBOX,
  LOGO_TRANSFORM,
  LOGO_FILL_PATH_D,
  LOGO_ASPECT_RATIO,
} from './logoPaths';

export interface LogoStaticProps {
  width?: number;
  height?: number;
  color?: string;
}

export const LogoStatic: React.FC<LogoStaticProps> = ({
  width = 54,
  height,
  color = '#FFFFFF',
}) => {
  const computedHeight = height || Math.round(width / LOGO_ASPECT_RATIO);

  return (
    <Svg viewBox={LOGO_VIEWBOX} width={width} height={computedHeight}>
      <G id="logo-root" transform={LOGO_TRANSFORM}>
        <Path d={LOGO_FILL_PATH_D} fill={color} />
      </G>
    </Svg>
  );
};
