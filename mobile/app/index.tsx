/**
 * App entry screen - Redirects to auth or main app
 */

import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}

