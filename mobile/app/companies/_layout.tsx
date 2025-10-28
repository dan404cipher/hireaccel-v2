/**
 * Companies section layout
 */

import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/config';

export default function CompaniesLayout() {
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
          title: 'Add Company',
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}

