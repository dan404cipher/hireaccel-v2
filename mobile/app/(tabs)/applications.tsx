/**
 * Applications Screen - View and manage job applications (Candidate view)
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { COLORS } from '@/constants/config';
import { formatRelativeTime } from '@/utils/helpers';
import { ScrollView } from 'react-native-gesture-handler';

export default function ApplicationsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['applications', searchQuery, statusFilter],
    queryFn: () =>
      apiClient.getApplications({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        limit: 50,
      }),
  });

  const applications = data?.data || [];

  const renderApplication = ({ item: application }: { item: any }) => (
    <Card style={styles.applicationCard} onPress={() => router.push(`/applications/${application.id}`)}>
      <View style={styles.applicationHeader}>
        <Text variant="titleMedium" style={styles.jobTitle}>
          {application.job?.title}
        </Text>
        <Badge label={application.status} type="status" />
      </View>

      <Text variant="bodyMedium" style={styles.company}>
        {application.job?.company}
      </Text>
      <Text variant="bodySmall" style={styles.location}>
        📍 {application.job?.location}
      </Text>

      <View style={styles.stageSection}>
        <Text variant="bodySmall" style={styles.stageLabel}>
          Stage:
        </Text>
        <Chip compact mode="outlined">
          {application.stage}
        </Chip>
      </View>

      <Text variant="bodySmall" style={styles.appliedDate}>
        Applied {formatRelativeTime(application.appliedAt)}
      </Text>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading applications..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load applications" onRetry={() => refetch()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search applications..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          <Chip
            selected={statusFilter === ''}
            onPress={() => setStatusFilter('')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={statusFilter === 'pending'}
            onPress={() => setStatusFilter('pending')}
            style={styles.filterChip}
          >
            Pending
          </Chip>
          <Chip
            selected={statusFilter === 'reviewing'}
            onPress={() => setStatusFilter('reviewing')}
            style={styles.filterChip}
          >
            Reviewing
          </Chip>
          <Chip
            selected={statusFilter === 'accepted'}
            onPress={() => setStatusFilter('accepted')}
            style={styles.filterChip}
          >
            Accepted
          </Chip>
          <Chip
            selected={statusFilter === 'rejected'}
            onPress={() => setStatusFilter('rejected')}
            style={styles.filterChip}
          >
            Rejected
          </Chip>
        </ScrollView>
      </View>

      {applications.length === 0 ? (
        <EmptyState
          icon="file-document-outline"
          title="No Applications"
          message="You haven't applied to any jobs yet"
          actionLabel="Browse Jobs"
          onAction={() => router.push('/(tabs)/jobs')}
        />
      ) : (
        <FlatList
          data={applications}
          renderItem={renderApplication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
  },
  applicationCard: {
    marginBottom: 16,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  company: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  location: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  stageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  stageLabel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  appliedDate: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

