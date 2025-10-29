/**
 * Jobs Screen - Browse and manage job postings
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Text, Searchbar, Button, Chip, RadioButton, Portal, Dialog } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { formatRelativeTime } from '@/utils/helpers';
import type { Job } from '@/types';

export default function JobsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', searchQuery, companyFilter],
    queryFn: () =>
      apiClient.getJobs({
        search: searchQuery || undefined,
        companyId: companyFilter !== 'all' ? companyFilter : undefined,
        limit: 50,
      }),
  });

  // Fetch companies for filter
  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.getCompanies({ limit: 100 }),
  });

  // Fetch job stats
  const { data: statsData } = useQuery({
    queryKey: ['job-stats'],
    queryFn: () => apiClient.getJobs({ limit: 1000 }), // Get all jobs to calculate stats
  });

  // Fetch applications for stats
  const { data: applicationsData } = useQuery({
    queryKey: ['applications-stats'],
    queryFn: () => apiClient.getApplications({ limit: 1000 }),
  });

  const jobs = data?.data || [];
  const companies = companiesData?.data || [];
  const canPostJobs = user?.role === 'hr' || user?.role === 'admin';

  // Calculate stats
  const allJobs = statsData?.data || [];
  const totalJobs = allJobs.length;
  const openJobs = allJobs.filter((job: any) => job.status === 'open').length;
  const totalApplications = applicationsData?.data?.length || 0;
  const acceptedApplications = applicationsData?.data?.filter((app: any) => 
    app.status === 'accepted'
  ).length || 0;

  const renderJob = ({ item: job }: { item: Job }) => {
    // Handle both _id (MongoDB) and id formats
    const jobId = (job as any)._id || job.id;
    
    return (
      <Card style={styles.jobCard} onPress={() => router.push(`/jobs/${jobId}`)}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleSection}>
            <Text variant="titleMedium" style={styles.jobTitle}>
              {job.title}
            </Text>
            <Badge label={job.urgency} type="urgency" />
          </View>
          <Badge label={job.status} type="status" />
        </View>

        <Text variant="bodyMedium" style={styles.company}>
          🏢 {job.company || (job.companyId as any)?.name || 'Company'}
        </Text>
        <Text variant="bodySmall" style={styles.location}>
          📍 {job.location} {job.isRemote ? '• Remote' : ''}
        </Text>

        <Text variant="bodyMedium" style={styles.salary}>
          💰 {job.salary || (job.salaryRange 
            ? `${job.salaryRange.currency} ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}`
            : 'Not specified')}
        </Text>

        <View style={styles.jobFooter}>
          <View style={styles.tags}>
            <Badge label={job.type} />
          </View>
          <View style={styles.meta}>
            <Text variant="bodySmall" style={styles.metaText}>
              {job.applicants || job.applications || 0} applicants
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              {formatRelativeTime(job.createdAt)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading jobs..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load jobs" onRetry={() => refetch()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          {searchExpanded ? (
            <View style={styles.searchBarExpanded}>
              <Searchbar
                placeholder="Search jobs..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                autoFocus
              />
              <TouchableOpacity
                onPress={() => {
                  setSearchExpanded(false);
                  setSearchQuery('');
                }}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setSearchExpanded(true)}
                style={styles.searchIcon}
              >
                <MaterialCommunityIcons name="magnify" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFilterDialogVisible(true)}
                style={[styles.filterIcon, companyFilter !== 'all' && styles.filterIconActive]}
              >
                <MaterialCommunityIcons 
                  name="filter-variant" 
                  size={24} 
                  color={companyFilter !== 'all' ? COLORS.primary : COLORS.textSecondary} 
                />
                {companyFilter !== 'all' && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
              {canPostJobs && (
                <TouchableOpacity
                  onPress={() => router.push('/jobs/create')}
                  style={[styles.postButtonWrapper, { flex: 1 }]}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.postButton}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color="white" />
                    <Text style={styles.postButtonText}>Post New Job</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#3b82f6' }]}>
              <MaterialCommunityIcons name="briefcase" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalJobs}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#10b981' }]}>
              <MaterialCommunityIcons name="briefcase-check" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{openJobs}</Text>
              <Text style={styles.statLabel}>Open Jobs</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b' }]}>
              <MaterialCommunityIcons name="file-document-multiple" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalApplications}</Text>
              <Text style={styles.statLabel}>Applications</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#faf5ff' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#8b5cf6' }]}>
              <MaterialCommunityIcons name="account-check" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{acceptedApplications}</Text>
              <Text style={styles.statLabel}>Accepted</Text>
            </View>
          </View>
        </View>
      </View>

      {jobs.length === 0 ? (
        <EmptyState
          icon="briefcase-search"
          title="No Jobs Found"
          message="There are no jobs matching your criteria"
          actionLabel={canPostJobs ? 'Post a Job' : undefined}
          onAction={canPostJobs ? () => router.push('/jobs/create') : undefined}
        />
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => (item as any)._id || item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        />
      )}

      {/* Filter Dialog */}
      <Portal>
        <Dialog visible={filterDialogVisible} onDismiss={() => setFilterDialogVisible(false)}>
          <Dialog.Title>Filter by Company</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <RadioButton.Group 
                onValueChange={value => setCompanyFilter(value)} 
                value={companyFilter}
              >
                <TouchableOpacity 
                  style={styles.radioItem}
                  onPress={() => setCompanyFilter('all')}
                >
                  <RadioButton value="all" />
                  <Text style={styles.radioLabel}>All Companies</Text>
                </TouchableOpacity>
                
                {companies.map((company: any) => (
                  <TouchableOpacity 
                    key={company.id}
                    style={styles.radioItem}
                    onPress={() => setCompanyFilter(company.id)}
                  >
                    <RadioButton value={company.id} />
                    <Text style={styles.radioLabel}>{company.name}</Text>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => {
              setCompanyFilter('all');
              setFilterDialogVisible(false);
            }}>
              Clear
            </Button>
            <Button onPress={() => setFilterDialogVisible(false)}>
              Done
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    lineHeight: 28,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  searchSection: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  filterIconActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dialogScrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  searchBarExpanded: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
  },
  closeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  postButton: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  postButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  jobTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  company: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  location: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  salary: {
    fontWeight: '600',
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    gap: 8,
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    height: 36,
    paddingHorizontal: 12,
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 0,
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  metaText: {
    color: COLORS.textSecondary,
  },
});

