/**
 * Profile Screen - User profile and settings
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Avatar, List, Button, Divider, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { COLORS, APP_NAME } from '@/constants/config';
import { getInitials, formatDate } from '@/utils/helpers';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={getInitials(user?.firstName || 'U', user?.lastName || 'U')}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.name}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text variant="bodyMedium" style={styles.email}>
                {user?.email}
              </Text>
              {user?.phoneNumber && (
                <Text variant="bodySmall" style={styles.phone}>
                  📞 {user.phoneNumber}
                </Text>
              )}
              <View style={styles.badges}>
                <Badge label={user?.role || 'User'} />
                <Badge label={user?.status || 'Active'} type="status" />
              </View>
            </View>
          </View>

          {user?.emailVerified && (
            <View style={styles.verifiedBadge}>
              <Text variant="bodySmall" style={styles.verifiedText}>
                ✓ Email Verified
              </Text>
            </View>
          )}

          <Button
            mode="outlined"
            onPress={() => router.push('/profile/edit')}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </Card>

        {/* Account Information */}
        <Card style={styles.sectionCard}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          <List.Item
            title="User ID"
            description={user?.customId}
            left={(props) => <List.Icon {...props} icon="identifier" />}
          />
          <List.Item
            title="Member Since"
            description={formatDate(user?.createdAt || new Date().toISOString(), 'PP')}
            left={(props) => <List.Icon {...props} icon="calendar" />}
          />
          {user?.lastLoginAt && (
            <List.Item
              title="Last Login"
              description={formatDate(user.lastLoginAt, 'PPp')}
              left={(props) => <List.Icon {...props} icon="login" />}
            />
          )}
        </Card>

        {/* Settings */}
        <Card style={styles.sectionCard}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Settings
          </Text>
          <List.Item
            title="Notifications"
            description="Receive push notifications"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Change Password"
            description="Update your password"
            left={(props) => <List.Icon {...props} icon="lock" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/profile/change-password')}
          />
          <Divider />
          <List.Item
            title="Privacy Settings"
            description="Manage your privacy"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push('/profile/privacy')}
          />
        </Card>

        {/* Support */}
        <Card style={styles.sectionCard}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Support
          </Text>
          <List.Item
            title="Help Center"
            description="Get help and support"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="About {APP_NAME}"
            description="Version 1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card>

        {/* Logout */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor={COLORS.error}
          icon="logout"
        >
          Logout
        </Button>

        <Text variant="bodySmall" style={styles.footer}>
          © 2025 {APP_NAME}. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  phone: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  verifiedBadge: {
    backgroundColor: COLORS.success + '20',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  verifiedText: {
    color: COLORS.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButton: {
    marginTop: 8,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    marginVertical: 16,
    paddingVertical: 6,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 32,
  },
});

