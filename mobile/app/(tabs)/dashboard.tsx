/**
 * Dashboard Screen - Shows role-specific dashboard
 */

import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { COLORS } from '@/constants/config';
import { formatRelativeTime } from '@/utils/helpers';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats', user?.role],
    queryFn: async () => {
      if (user?.role === 'agent') {
        return await apiClient.getAgentDashboard();
      }
      return await apiClient.getDashboardStats();
    },
    enabled: !!user,
  });

  const { data: recentJobs } = useQuery({
    queryKey: ['recent-jobs'],
    queryFn: () => apiClient.getJobs({ limit: 5 }),
    enabled: user?.role !== 'candidate',
  });

  const { data: recentApplications } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: () => apiClient.getApplications({ limit: 5 }),
    enabled: user?.role === 'candidate',
  });

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load dashboard" onRetry={() => refetch()} />;
  }

  const statsData = stats?.data || {};

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall">Welcome back,</Text>
          <Text variant="headlineMedium" style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Badge label={user?.role || 'User'} />
        </View>
        <View style={styles.headerActions}>
          <IconButton icon="bell" size={24} onPress={() => {}} badge={unreadCount} />
          <IconButton icon="logout" size={24} onPress={handleLogout} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {user?.role === 'candidate' && (
            <>
              <Card style={styles.statCard}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {statsData.activeApplications || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Active Applications
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {statsData.scheduledInterviews || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Upcoming Interviews
                </Text>
              </Card>
            </>
          )}

          {(user?.role === 'hr' || user?.role === 'admin') && (
            <>
              <Card style={styles.statCard}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {statsData.totalJobs || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Active Jobs
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {statsData.totalCandidates || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Candidates
                </Text>
              </Card>
            </>
          )}

          {user?.role === 'agent' && (
            <>
              <Card style={styles.statCard}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {statsData.assignedCandidates || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Assigned Candidates
                </Text>
              </Card>
              <Card style={styles.statCard}>
                <Text variant="headlineMedium" style={styles.statValue}>
                  {statsData.availableJobs || 0}
                </Text>
                <Text variant="bodyMedium" style={styles.statLabel}>
                  Available Jobs
                </Text>
              </Card>
            </>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recent Activity
          </Text>

          {user?.role === 'candidate' && recentApplications?.data?.length > 0 && (
            <>
              {recentApplications.data.slice(0, 5).map((application: any) => (
                <Card key={application.id} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <Text variant="titleMedium">{application.job?.title}</Text>
                    <Badge label={application.status} type="status" />
                  </View>
                  <Text variant="bodyMedium" style={styles.activityCompany}>
                    {application.job?.company}
                  </Text>
                  <Text variant="bodySmall" style={styles.activityTime}>
                    Applied {formatRelativeTime(application.appliedAt)}
                  </Text>
                </Card>
              ))}
            </>
          )}

          {user?.role !== 'candidate' && recentJobs?.data?.length > 0 && (
            <>
              {recentJobs.data.slice(0, 5).map((job: any) => (
                <Card
                  key={job.id}
                  style={styles.activityCard}
                  onPress={() => router.push(`/jobs/${job.id}`)}
                >
                  <View style={styles.activityHeader}>
                    <Text variant="titleMedium">{job.title}</Text>
                    <Badge label={job.urgency} type="urgency" />
                  </View>
                  <Text variant="bodyMedium" style={styles.activityCompany}>
                    {job.company}
                  </Text>
                  <View style={styles.jobFooter}>
                    <Text variant="bodySmall">{job.applicants} applicants</Text>
                    <Text variant="bodySmall">{formatRelativeTime(job.createdAt)}</Text>
                  </View>
                </Card>
              ))}
            </>
          )}
        </View>

        {/* Admin Tools */}
        {user?.role === 'admin' && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Admin Tools
            </Text>
            <View style={styles.quickActions}>
              <Button
                mode="contained"
                icon="account-network"
                onPress={() => router.push('/admin/agent-allocation')}
                style={styles.actionButton}
              >
                Agent Allocation
              </Button>
              <Button
                mode="contained"
                icon="office-building"
                onPress={() => router.push('/(tabs)/companies')}
                style={styles.actionButton}
              >
                Company Management
              </Button>
              <Button
                mode="contained"
                icon="account-group"
                onPress={() => router.push('/admin/user-management')}
                style={styles.actionButton}
              >
                User Management
              </Button>
              <Button
                mode="contained"
                icon="image"
                onPress={() => router.push('/admin/banner-management')}
                style={styles.actionButton}
              >
                Post Ads
              </Button>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            {user?.role === 'candidate' && (
              <>
                <Button
                  mode="contained"
                  icon="magnify"
                  onPress={() => router.push('/(tabs)/jobs')}
                  style={styles.actionButton}
                >
                  Browse Jobs
                </Button>
                <Button
                  mode="outlined"
                  icon="account-edit"
                  onPress={() => router.push('/(tabs)/profile')}
                  style={styles.actionButton}
                >
                  Edit Profile
                </Button>
              </>
            )}

            {(user?.role === 'hr' || user?.role === 'admin') && (
              <>
                <Button
                  mode="contained"
                  icon="plus"
                  onPress={() => router.push('/jobs/create')}
                  style={styles.actionButton}
                >
                  Post New Job
                </Button>
                <Button
                  mode="outlined"
                  icon="account-group"
                  onPress={() => router.push('/(tabs)/candidates')}
                  style={styles.actionButton}
                >
                  View Candidates
                </Button>
              </>
            )}

            {user?.role === 'agent' && (
              <>
                <Button
                  mode="contained"
                  icon="briefcase"
                  onPress={() => router.push('/(tabs)/jobs')}
                  style={styles.actionButton}
                >
                  View Jobs
                </Button>
                <Button
                  mode="outlined"
                  icon="account-multiple"
                  onPress={() => router.push('/(tabs)/candidates')}
                  style={styles.actionButton}
                >
                  My Candidates
                </Button>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userName: {
    fontWeight: 'bold',
    marginVertical: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityCompany: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  activityTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
});

