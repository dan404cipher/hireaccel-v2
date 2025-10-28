/**
 * Job Details Screen
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Button, Chip, IconButton, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { COLORS } from '@/constants/config';
import { formatDate } from '@/utils/helpers';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: jobResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['job', id],
    queryFn: () => apiClient.getJob(id!),
    enabled: !!id,
  });

  const job = jobResponse?.data || jobResponse;

  const deleteJobMutation = useMutation({
    mutationFn: (jobId: string) => apiClient.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      Alert.alert('Success', 'Job deleted successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.detail || 'Failed to delete job');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteJobMutation.mutate(id!),
        },
      ]
    );
  };

  const formatSalary = (job: any) => {
    if (job.salaryRange?.min && job.salaryRange?.max) {
      const currency = job.salaryRange.currency || 'USD';
      const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : currency;
      return `${symbol}${(job.salaryRange.min / 1000).toFixed(0)}k - ${symbol}${(job.salaryRange.max / 1000).toFixed(0)}k`;
    }
    return job.salary || 'Salary TBD';
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading job details..." />;
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="briefcase-remove" size={64} color={COLORS.textSecondary} />
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Job Not Found
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            The job you're looking for doesn't exist or has been removed.
          </Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
            Back to Jobs
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const canEdit = user?.role === 'hr' || user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.companyLogo}>
              <MaterialCommunityIcons name="domain" size={32} color={COLORS.primary} />
            </View>
            {canEdit && (
              <View style={styles.headerActions}>
                <IconButton
                  icon="pencil"
                  size={20}
                  onPress={() => router.push(`/jobs/edit/${id}`)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={COLORS.error}
                  onPress={handleDelete}
                />
              </View>
            )}
          </View>

          <Text variant="headlineSmall" style={styles.jobTitle}>
            {job.title}
          </Text>

          <Text variant="bodyLarge" style={styles.companyName}>
            🏢 {job.companyId?.name || job.company || 'Company'}
          </Text>

          <View style={styles.badges}>
            <Badge label={job.status} type="status" />
            <Badge label={job.urgency} type="urgency" />
            {job.type && <Badge label={job.type} />}
          </View>
        </Card>

        {/* Quick Info */}
        <Card style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Information
          </Text>
          <Divider style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{job.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="cash" size={20} color={COLORS.success} />
            <Text style={styles.infoLabel}>Salary:</Text>
            <Text style={styles.infoValue}>{formatSalary(job)}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="briefcase" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={[styles.infoValue, styles.capitalize]}>{job.type}</Text>
          </View>

          {job.workType && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="laptop" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Work Type:</Text>
              <Text style={[styles.infoValue, styles.capitalize]}>
                {job.workType === 'wfo' ? 'Work From Office' : job.workType === 'wfh' ? 'Work From Home' : 'Hybrid'}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-group" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Applicants:</Text>
            <Text style={styles.infoValue}>{job.applications || job.applicants || 0}</Text>
          </View>

          {job.numberOfOpenings && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account-multiple-plus" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Openings:</Text>
              <Text style={styles.infoValue}>{job.numberOfOpenings}</Text>
            </View>
          )}
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Job Description
          </Text>
          <Divider style={styles.divider} />
          <Text style={styles.description}>{job.description || 'No description available.'}</Text>
        </Card>

        {/* Requirements */}
        {job.requirements && (
          <Card style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Requirements
            </Text>
            <Divider style={styles.divider} />

            {job.requirements.experience && (
              <View style={styles.requirementSection}>
                <Text style={styles.requirementLabel}>Experience Level</Text>
                <Badge label={job.requirements.experience} style={styles.requirementBadge} />
              </View>
            )}

            {job.requirements.skills && job.requirements.skills.length > 0 && (
              <View style={styles.requirementSection}>
                <Text style={styles.requirementLabel}>Required Skills</Text>
                <View style={styles.skillsContainer}>
                  {job.requirements.skills.map((skill: string, index: number) => (
                    <Chip key={index} mode="outlined" style={styles.skillChip}>
                      {skill}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {job.requirements.education && job.requirements.education.length > 0 && (
              <View style={styles.requirementSection}>
                <Text style={styles.requirementLabel}>Education</Text>
                {job.requirements.education.map((edu: string, index: number) => (
                  <Text key={index} style={styles.listItem}>
                    • {edu}
                  </Text>
                ))}
              </View>
            )}

            {job.requirements.languages && job.requirements.languages.length > 0 && (
              <View style={styles.requirementSection}>
                <Text style={styles.requirementLabel}>Languages</Text>
                <View style={styles.skillsContainer}>
                  {job.requirements.languages.map((lang: string, index: number) => (
                    <Chip key={index} mode="outlined" style={styles.skillChip}>
                      {lang}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <Card style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Benefits & Perks
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.skillsContainer}>
              {job.benefits.map((benefit: string, index: number) => (
                <Chip key={index} mode="outlined" style={styles.benefitChip}>
                  {benefit}
                </Chip>
              ))}
            </View>
          </Card>
        )}

        {/* Interview Process */}
        {job.interviewProcess && (
          <Card style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Interview Process
            </Text>
            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="counter" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Rounds:</Text>
              <Text style={styles.infoValue}>{job.interviewProcess.rounds}</Text>
            </View>

            {job.interviewProcess.estimatedDuration && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Timeline:</Text>
                <Text style={styles.infoValue}>{job.interviewProcess.estimatedDuration}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Important Dates */}
        <Card style={styles.card}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Important Dates
          </Text>
          <Divider style={styles.divider} />

          {job.postedAt && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-check" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Posted:</Text>
              <Text style={styles.infoValue}>{formatDate(job.postedAt, 'PP')}</Text>
            </View>
          )}

          {job.applicationDeadline && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="calendar-alert" size={20} color={COLORS.error} />
              <Text style={styles.infoLabel}>Deadline:</Text>
              <Text style={styles.infoValue}>{formatDate(job.applicationDeadline, 'PP')}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Created:</Text>
            <Text style={styles.infoValue}>{formatDate(job.createdAt, 'PP')}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-edit" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Updated:</Text>
            <Text style={styles.infoValue}>{formatDate(job.updatedAt, 'PP')}</Text>
          </View>
        </Card>

        {/* Posted By */}
        {job.createdBy && (
          <Card style={styles.card}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Posted By
            </Text>
            <Divider style={styles.divider} />
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="account" size={20} color={COLORS.primary} />
              <Text style={styles.infoValue}>
                {job.createdBy.firstName && job.createdBy.lastName
                  ? `${job.createdBy.firstName} ${job.createdBy.lastName}`
                  : job.createdBy.email || 'Unknown'}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Apply Button (for candidates) */}
      {user?.role === 'candidate' && job.status === 'open' && (
        <View style={styles.applyButtonContainer}>
          <Button
            mode="contained"
            icon="send"
            onPress={() => {
              // TODO: Navigate to application screen
              Alert.alert('Apply', 'Application functionality coming soon');
            }}
            style={styles.applyButton}
          >
            Apply for this Job
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  jobTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  companyName: {
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  divider: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontWeight: '600',
    color: COLORS.textSecondary,
    minWidth: 80,
  },
  infoValue: {
    flex: 1,
    color: COLORS.text,
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  description: {
    lineHeight: 24,
    color: COLORS.text,
  },
  requirementSection: {
    marginBottom: 16,
  },
  requirementLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  requirementBadge: {
    alignSelf: 'flex-start',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 4,
  },
  benefitChip: {
    marginBottom: 4,
    borderColor: COLORS.success,
  },
  listItem: {
    marginBottom: 4,
    color: COLORS.text,
    lineHeight: 20,
  },
  applyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applyButton: {
    paddingVertical: 4,
  },
});

