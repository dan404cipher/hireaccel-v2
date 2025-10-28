/**
 * Edit Jobs section layout
 */

import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/config';

export default function EditJobsLayout() {
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
        name="[id]" 
        options={{ 
          title: 'Edit Job',
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}

