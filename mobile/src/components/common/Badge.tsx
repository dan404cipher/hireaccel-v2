import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { getStatusColor, getUrgencyColor } from '@/utils/helpers';

interface BadgeProps {
  label: string;
  type?: 'status' | 'urgency' | 'default';
  color?: string;
}

export function Badge({ label, type = 'default', color }: BadgeProps) {
  const getColor = () => {
    if (color) return color;
    if (type === 'status') return getStatusColor(label);
    if (type === 'urgency') return getUrgencyColor(label);
    return '#6b7280';
  };

  const backgroundColor = getColor();

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

