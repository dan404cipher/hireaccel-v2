/**
 * Admin screens layout
 */

import React from 'react';
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/config';

export default function AdminLayout() {
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
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen 
        name="agent-allocation" 
        options={{ 
          title: 'Agent Allocation',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="company-management" 
        options={{ 
          title: 'Company Management',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="user-management" 
        options={{ 
          title: 'User Management',
          headerBackTitle: 'Back',
        }} 
      />
      <Stack.Screen 
        name="banner-management" 
        options={{ 
          title: 'Post Ads',
          headerBackTitle: 'Back',
        }} 
      />
    </Stack>
  );
}

