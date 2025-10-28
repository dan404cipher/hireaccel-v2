import React, { ReactNode } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: any;
}

export function Card({ children, onPress, style }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <PaperCard style={[styles.card, style]}>
          <PaperCard.Content>{children}</PaperCard.Content>
        </PaperCard>
      </TouchableOpacity>
    );
  }

  return (
    <PaperCard style={[styles.card, style]}>
      <PaperCard.Content>{children}</PaperCard.Content>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 2,
  },
});

