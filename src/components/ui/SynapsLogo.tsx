import React from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

interface SynapsLogoProps {
  /** Rendered width in points. Height is derived from the 4:1 aspect ratio. */
  width?: number;
}

export function SynapsLogo({ width = 120 }: SynapsLogoProps) {
  const height = (width / 2400) * 600;

  return (
    <Svg width={width} height={height} viewBox="0 0 2400 600">
      <Defs>
        <LinearGradient id="sl_bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4361EE" />
          <Stop offset="50%" stopColor="#7C3AED" />
          <Stop offset="100%" stopColor="#EC4899" />
        </LinearGradient>
        <LinearGradient id="sl_cg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#4361EE" />
          <Stop offset="50%" stopColor="#7C3AED" />
          <Stop offset="100%" stopColor="#EC4899" />
        </LinearGradient>
        <LinearGradient id="sl_text" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#4361EE" />
          <Stop offset="50%" stopColor="#7C3AED" />
          <Stop offset="100%" stopColor="#EC4899" />
        </LinearGradient>
      </Defs>

      {/* Icon */}
      <G transform="translate(120, 60)">
        <Rect x="0" y="0" width="480" height="480" rx="110" fill="url(#sl_bg)" />
        <Circle cx="240" cy="240" r="165" fill="#fff" opacity="0.04" />

        <Line x1="240" y1="240" x2="108" y2="108" stroke="#fff" strokeWidth="19" strokeLinecap="round" opacity="0.45" />
        <Line x1="240" y1="240" x2="372" y2="93"  stroke="#fff" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
        <Line x1="240" y1="240" x2="405" y2="262" stroke="#fff" strokeWidth="13.5" strokeLinecap="round" opacity="0.3" />
        <Line x1="240" y1="240" x2="87"  y2="312" stroke="#fff" strokeWidth="13.5" strokeLinecap="round" opacity="0.3" />
        <Line x1="240" y1="240" x2="175" y2="394" stroke="#fff" strokeWidth="16" strokeLinecap="round" opacity="0.4" />
        <Line x1="240" y1="240" x2="372" y2="377" stroke="#fff" strokeWidth="12" strokeLinecap="round" opacity="0.25" />

        <Circle cx="174" cy="174" r="15" fill="#fff" opacity="0.85" />
        <Circle cx="306" cy="166" r="12" fill="#fff" opacity="0.7" />
        <Circle cx="207" cy="317" r="12" fill="#fff" opacity="0.65" />
        <Circle cx="306" cy="308" r="10" fill="#fff" opacity="0.45" />

        <Circle cx="108" cy="108" r="25" fill="#fff" opacity="0.95" />
        <Circle cx="372" cy="93"  r="21" fill="#fff" opacity="0.85" />
        <Circle cx="405" cy="262" r="19" fill="#fff" opacity="0.7" />
        <Circle cx="87"  cy="312" r="19" fill="#fff" opacity="0.7" />
        <Circle cx="175" cy="394" r="22" fill="#fff" opacity="0.9" />
        <Circle cx="372" cy="377" r="17" fill="#fff" opacity="0.6" />

        <Circle cx="240" cy="240" r="55" fill="#fff" />
        <Circle cx="240" cy="240" r="34" fill="none" stroke="url(#sl_cg)" strokeWidth="10" opacity="0.5" />
        <Circle cx="240" cy="240" r="17" fill="url(#sl_cg)" opacity="0.35" />
      </G>

      {/* Wordmark */}
      <SvgText
        x="720"
        y="365"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontSize="280"
        fontWeight="400"
        fill="url(#sl_text)"
        letterSpacing="-6"
      >
        synaps
      </SvgText>
    </Svg>
  );
}
