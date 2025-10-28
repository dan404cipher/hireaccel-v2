/**
 * Jobs section layout
 */

import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/config';

export default function JobsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen 
        name="create" 
        options={{ 
          title: 'Create Job',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Job Details',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}

