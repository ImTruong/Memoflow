import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface DonutChartData {
  value: number;
  color: string;
  label?: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string | number;
  centerSubLabel?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  strokeWidth = 20,
  centerLabel,
  centerValue,
  centerSubLabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  let currentOffset = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {data.map((item, index) => {
          if (item.value === 0 || totalValue === 0) return null;
          const strokeDashoffset = circumference - (item.value / totalValue) * circumference;
          const rotation = (currentOffset / totalValue) * 360;
          currentOffset += item.value;

          return (
            <Circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              fill="transparent"
              transform={`rotate(${rotation}, ${size / 2}, ${size / 2})`}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
      {(centerLabel || centerValue !== undefined || centerSubLabel) && (
        <View style={styles.centerTextContainer}>
          {centerLabel && <Text style={styles.centerLabel}>{centerLabel}</Text>}
          {centerValue !== undefined && <Text style={styles.centerValue}>{centerValue}</Text>}
          {centerSubLabel && <Text style={styles.centerSubLabel}>{centerSubLabel}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  centerTextContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  centerLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', letterSpacing: 0.5 },
  centerValue: { fontSize: 36, fontWeight: '900', color: '#1E293B', marginVertical: -2 },
  centerSubLabel: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
});
