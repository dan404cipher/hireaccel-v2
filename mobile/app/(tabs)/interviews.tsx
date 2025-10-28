/**
 * Interviews Screen - View and manage interviews
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { Text, Searchbar, Chip, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { COLORS } from '@/constants/config';
import { formatDate, formatRelativeTime } from '@/utils/helpers';

export default function InterviewsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['interviews', searchQuery, statusFilter],
    queryFn: () =>
      apiClient.getInterviews({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        limit: 50,
      }),
  });

  const interviews = data?.data || [];
  const canCreateInterview = user?.role === 'hr' || user?.role === 'admin' || user?.role === 'agent';

  const renderInterview = ({ item: interview }: { item: any }) => (
    <Card
      style={styles.interviewCard}
      onPress={() => router.push(`/interviews/${interview._id}`)}
    >
      <View style={styles.interviewHeader}>
        <View style={styles.interviewTitle}>
          <Text variant="titleMedium" style={styles.jobTitle}>
            {interview.applicationId?.jobId?.title || 'Interview'}
          </Text>
          <Badge label={interview.status} type="status" />
        </View>
        <Badge label={interview.type} />
      </View>

      <Text variant="bodyMedium" style={styles.company}>
        {interview.applicationId?.jobId?.companyId?.name || 'Company'}
      </Text>

      <View style={styles.interviewDetails}>
        <View style={styles.detailRow}>
          <Text variant="bodySmall" style={styles.detailLabel}>
            📅 Date:
          </Text>
          <Text variant="bodySmall" style={styles.detailValue}>
            {formatDate(interview.scheduledAt, 'PP')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="bodySmall" style={styles.detailLabel}>
            🕐 Time:
          </Text>
          <Text variant="bodySmall" style={styles.detailValue}>
            {formatDate(interview.scheduledAt, 'p')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="bodySmall" style={styles.detailLabel}>
            ⏱️ Duration:
          </Text>
          <Text variant="bodySmall" style={styles.detailValue}>
            {interview.duration} minutes
          </Text>
        </View>
      </View>

      {interview.applicationId?.candidateId?.userId && (
        <Text variant="bodySmall" style={styles.candidate}>
          👤 Candidate: {interview.applicationId.candidateId.userId.firstName}{' '}
          {interview.applicationId.candidateId.userId.lastName}
        </Text>
      )}

      <View style={styles.interviewFooter}>
        <Chip compact mode="outlined">
          {interview.round}
        </Chip>
        <Text variant="bodySmall" style={styles.createdDate}>
          Created {formatRelativeTime(interview.createdAt)}
        </Text>
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading interviews..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load interviews" onRetry={() => refetch()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search interviews..."
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
            selected={statusFilter === 'scheduled'}
            onPress={() => setStatusFilter('scheduled')}
            style={styles.filterChip}
          >
            Scheduled
          </Chip>
          <Chip
            selected={statusFilter === 'confirmed'}
            onPress={() => setStatusFilter('confirmed')}
            style={styles.filterChip}
          >
            Confirmed
          </Chip>
          <Chip
            selected={statusFilter === 'completed'}
            onPress={() => setStatusFilter('completed')}
            style={styles.filterChip}
          >
            Completed
          </Chip>
          <Chip
            selected={statusFilter === 'cancelled'}
            onPress={() => setStatusFilter('cancelled')}
            style={styles.filterChip}
          >
            Cancelled
          </Chip>
        </ScrollView>
      </View>

      {interviews.length === 0 ? (
        <EmptyState
          icon="calendar-clock"
          title="No Interviews"
          message="No interviews scheduled yet"
          actionLabel={canCreateInterview ? 'Schedule Interview' : undefined}
          onAction={canCreateInterview ? () => router.push('/interviews/create') : undefined}
        />
      ) : (
        <FlatList
          data={interviews}
          renderItem={renderInterview}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        />
      )}

      {canCreateInterview && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/interviews/create')}
          label="Schedule"
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
  interviewCard: {
    marginBottom: 16,
  },
  interviewHeader: {
    marginBottom: 8,
  },
  interviewTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  company: {
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  interviewDetails: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    color: COLORS.text,
  },
  candidate: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  interviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  createdDate: {
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

