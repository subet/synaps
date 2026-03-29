import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '../../constants';

interface DonutChartProps {
  total: number;
  reviewed: number;
  size?: number;
}

export function DonutChart({ total, reviewed, size = 120 }: DonutChartProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? reviewed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.borderLight}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        {progress > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.learning}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        )}
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.number}>{total}</Text>
        <Text style={styles.label}>cards</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  label: {
    ...typography.small,
    color: colors.textMuted,
  },
});
