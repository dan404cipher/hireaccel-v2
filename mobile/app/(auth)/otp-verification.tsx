/**
 * OTP Verification Screen
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { COLORS } from '@/constants/config';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleVerify = async () => {
    setError('');
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      router.replace('/(tabs)/dashboard');
    } catch (err: any) {
      setError(err?.detail || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccessMessage('');
    setResending(true);

    try {
      await apiClient.resendOTP(email);
      setSuccessMessage('OTP sent successfully!');
    } catch (err: any) {
      setError(err?.detail || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text variant="headlineLarge" style={styles.title}>
              Verify Email
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              We've sent a 6-digit code to
            </Text>
            <Text variant="bodyMedium" style={styles.email}>
              {email}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              label="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              mode="outlined"
              keyboardType="number-pad"
              maxLength={6}
              disabled={loading || resending}
              style={styles.input}
            />

            {error ? (
              <HelperText type="error" visible={true}>
                {error}
              </HelperText>
            ) : null}

            {successMessage ? (
              <HelperText type="info" visible={true}>
                {successMessage}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleVerify}
              loading={loading}
              disabled={loading || resending}
              style={styles.verifyButton}
            >
              Verify
            </Button>

            <View style={styles.resendContainer}>
              <Text variant="bodyMedium">Didn't receive the code? </Text>
              <Button
                mode="text"
                onPress={handleResend}
                loading={resending}
                disabled={loading || resending}
                compact
              >
                Resend
              </Button>
            </View>

            <Button
              mode="text"
              onPress={() => router.back()}
              disabled={loading || resending}
              style={styles.backButton}
            >
              Back to Signup
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  email: {
    fontWeight: '600',
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  backButton: {
    marginTop: 8,
  },
});

