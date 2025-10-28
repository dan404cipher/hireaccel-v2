/**
 * Candidates Screen - View and manage candidates (HR/Agent view)
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Searchbar, Avatar } from 'react-native-paper';
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
import { getInitials } from '@/utils/helpers';

export default function CandidatesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['candidates', searchQuery],
    queryFn: async () => {
      if (user?.role === 'agent') {
        return await apiClient.getAgentCandidates({
          search: searchQuery || undefined,
          limit: 50,
        });
      }
      return await apiClient.getUsers({
        role: 'candidate',
        search: searchQuery || undefined,
        limit: 50,
      });
    },
  });

  const candidates = data?.data || [];

  const renderCandidate = ({ item: candidate }: { item: any }) => (
    <Card
      style={styles.candidateCard}
      onPress={() => router.push(`/candidates/${candidate.id}`)}
    >
      <View style={styles.candidateHeader}>
        <Avatar.Text
          size={48}
          label={getInitials(candidate.firstName || candidate.userId?.firstName || 'U', candidate.lastName || candidate.userId?.lastName || 'U')}
          style={styles.avatar}
        />
        <View style={styles.candidateInfo}>
          <Text variant="titleMedium" style={styles.candidateName}>
            {candidate.firstName || candidate.userId?.firstName} {candidate.lastName || candidate.userId?.lastName}
          </Text>
          <Text variant="bodySmall" style={styles.candidateEmail}>
            {candidate.email || candidate.userId?.email}
          </Text>
          {candidate.phone && (
            <Text variant="bodySmall" style={styles.candidatePhone}>
              📞 {candidate.phone}
            </Text>
          )}
        </View>
        <Badge label={candidate.status || 'active'} type="status" />
      </View>

      {candidate.location && (
        <Text variant="bodySmall" style={styles.location}>
          📍 {candidate.location}
        </Text>
      )}

      {candidate.skills && candidate.skills.length > 0 && (
        <View style={styles.skills}>
          {candidate.skills.slice(0, 3).map((skill: string, index: number) => (
            <Badge key={index} label={skill} style={styles.skillBadge} />
          ))}
          {candidate.skills.length > 3 && (
            <Text variant="bodySmall" style={styles.moreSkills}>
              +{candidate.skills.length - 3} more
            </Text>
          )}
        </View>
      )}
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading candidates..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load candidates" onRetry={() => refetch()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search candidates..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {candidates.length === 0 ? (
        <EmptyState
          icon="account-group"
          title="No Candidates"
          message="No candidates found matching your criteria"
        />
      ) : (
        <FlatList
          data={candidates}
          renderItem={renderCandidate}
          keyExtractor={(item) => item.id || item._id}
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
    marginBottom: 0,
  },
  list: {
    padding: 16,
  },
  candidateCard: {
    marginBottom: 16,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  candidateEmail: {
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  candidatePhone: {
    color: COLORS.textSecondary,
  },
  location: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillBadge: {
    marginRight: 4,
    marginBottom: 4,
  },
  moreSkills: {
    color: COLORS.textSecondary,
    alignSelf: 'center',
  },
});

