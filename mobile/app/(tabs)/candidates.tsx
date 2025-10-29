/**
 * Candidates Screen - Candidate Assignments Management (based on SharedCandidates)
 */

import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text, Searchbar, Avatar, Chip, IconButton, Portal, Dialog, Button, TextInput, RadioButton, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { COLORS } from '@/constants/config';
import { getInitials, formatRelativeTime } from '@/utils/helpers';

interface CandidateAssignment {
  _id: string;
  candidateId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
      customId: string;
    };
    profile: {
      skills: string[];
      summary: string;
      location?: string;
      phoneNumber: string;
    };
  };
  assignedBy: {
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
  };
  jobId?: {
    title: string;
    companyId: {
      _id: string;
      name: string;
    };
    location?: string;
  };
  status: 'active' | 'completed' | 'rejected' | 'withdrawn';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  candidateStatus?: string;
  notes?: string;
  assignedAt: string;
  dueDate?: string;
  feedback?: string;
}

export default function CandidatesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<CandidateAssignment | null>(null);
  
  // Dialog states
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);
  const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [feedbackDialogVisible, setFeedbackDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [priorityDialogVisible, setPriorityDialogVisible] = useState(false);
  
  // Form states
  const [updateNotes, setUpdateNotes] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Fetch candidate assignments based on user role
  const { data: assignmentsData, isLoading, error, refetch } = useQuery({
    queryKey: ['candidate-assignments'],
    queryFn: () => {
      if (user?.role === 'agent') {
        return apiClient.getCandidateAssignments({
          assignedBy: user.id,
          sortBy: 'assignedAt',
          sortOrder: 'desc',
          limit: 100,
        });
      } else if (user?.role === 'admin') {
        return apiClient.getCandidateAssignments({
          sortBy: 'assignedAt',
          sortOrder: 'desc',
          limit: 100,
        });
      } else {
        // HR role
        return apiClient.getCandidateAssignments({
          assignedTo: user?.id,
          sortBy: 'assignedAt',
          sortOrder: 'desc',
          limit: 100,
        });
      }
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['candidate-assignment-stats'],
    queryFn: () => apiClient.getCandidateAssignmentStats(),
  });

  const assignments = (assignmentsData as any)?.data || [];
  const stats = (statsData as any)?.data || {};

  // Update assignment mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      apiClient.updateCandidateAssignment(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-assignment-stats'] });
      Alert.alert('Success', 'Assignment updated successfully');
      closeAllDialogs();
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.detail || 'Failed to update assignment');
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCandidateAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['candidate-assignment-stats'] });
      Alert.alert('Success', 'Assignment removed successfully');
      setDetailsDialogVisible(false);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.detail || 'Failed to remove assignment');
    },
  });

  const closeAllDialogs = () => {
    setUpdateDialogVisible(false);
    setFeedbackDialogVisible(false);
    setStatusDialogVisible(false);
    setPriorityDialogVisible(false);
    setUpdateNotes('');
    setFeedbackText('');
  };

  // Get unique companies and jobs for filters
  const companies = useMemo(() => {
    const companyMap = new Map();
    assignments.forEach((assignment: CandidateAssignment) => {
      if (assignment.jobId?.companyId) {
        companyMap.set(assignment.jobId.companyId._id, assignment.jobId.companyId.name);
      }
    });
    return Array.from(companyMap.entries()).map(([id, name]) => ({ id, name }));
  }, [assignments]);

  const jobs = useMemo(() => {
    const jobMap = new Map();
    assignments.forEach((assignment: CandidateAssignment) => {
      if (assignment.jobId) {
        jobMap.set(assignment.jobId.title, assignment.jobId.title);
      }
    });
    return Array.from(jobMap.values());
  }, [assignments]);

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((assignment: CandidateAssignment) => {
        const firstName = assignment.candidateId?.userId?.firstName || '';
        const lastName = assignment.candidateId?.userId?.lastName || '';
        const email = assignment.candidateId?.userId?.email || '';
        const jobTitle = assignment.jobId?.title || '';
        const companyName = assignment.jobId?.companyId?.name || '';

        return (
          firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          companyName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter(
        (assignment: CandidateAssignment) => assignment.jobId?.companyId?._id === companyFilter
      );
    }

    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(
        (assignment: CandidateAssignment) => assignment.jobId?.title === jobFilter
      );
    }

    // Candidate status filter
    if (candidateStatusFilter !== 'all') {
      filtered = filtered.filter(
        (assignment: CandidateAssignment) => assignment.candidateStatus === candidateStatusFilter
      );
    }

    return filtered;
  }, [assignments, searchQuery, companyFilter, jobFilter, candidateStatusFilter]);

  const handleUpdateStatus = () => {
    if (selectedAssignment && selectedStatus) {
      updateMutation.mutate({
        id: selectedAssignment._id,
        updates: { candidateStatus: selectedStatus },
      });
    }
  };

  const handleUpdatePriority = () => {
    if (selectedAssignment && selectedPriority) {
      updateMutation.mutate({
        id: selectedAssignment._id,
        updates: { priority: selectedPriority },
      });
    }
  };

  const handleAddNotes = () => {
    if (selectedAssignment && updateNotes.trim()) {
      updateMutation.mutate({
        id: selectedAssignment._id,
        updates: { notes: updateNotes },
      });
    }
  };

  const handleAddFeedback = () => {
    if (selectedAssignment && feedbackText.trim()) {
      updateMutation.mutate({
        id: selectedAssignment._id,
        updates: { feedback: feedbackText },
      });
    }
  };

  const handleDelete = (assignment: CandidateAssignment) => {
    Alert.alert(
      'Remove Assignment',
      'Are you sure you want to remove this candidate assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(assignment._id),
        },
      ]
    );
  };

  const openDetails = (assignment: CandidateAssignment) => {
    setSelectedAssignment(assignment);
    setDetailsDialogVisible(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      new: '#6b7280',
      reviewed: '#3b82f6',
      shortlisted: '#8b5cf6',
      interview_scheduled: '#f59e0b',
      interviewed: '#06b6d4',
      offer_sent: '#10b981',
      hired: '#059669',
      rejected: '#ef4444',
    };
    return statusMap[status] || COLORS.textSecondary;
  };

  const renderAssignment = ({ item: assignment }: { item: CandidateAssignment }) => {
    const candidate = assignment.candidateId;
    const user = candidate?.userId;
    const profile = candidate?.profile;

    return (
      <Card style={styles.assignmentCard} onPress={() => openDetails(assignment)}>
        <View style={styles.assignmentHeader}>
          <Avatar.Text
            size={48}
            label={getInitials(user?.firstName || 'U', user?.lastName || 'U')}
            style={[styles.avatar, { backgroundColor: getPriorityColor(assignment.priority) }]}
          />
          <View style={styles.candidateInfo}>
            <Text variant="titleMedium" style={styles.candidateName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text variant="bodySmall" style={styles.candidateEmail}>
              {user?.email}
            </Text>
            {profile?.phoneNumber && (
              <Text variant="bodySmall" style={styles.candidatePhone}>
                📞 {profile.phoneNumber}
              </Text>
            )}
          </View>
          <View style={styles.priorityBadge}>
            <MaterialCommunityIcons
              name="flag"
              size={16}
              color={getPriorityColor(assignment.priority)}
            />
            <Text style={[styles.priorityText, { color: getPriorityColor(assignment.priority) }]}>
              {assignment.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        {assignment.jobId && (
          <View style={styles.jobInfo}>
            <MaterialCommunityIcons name="briefcase" size={16} color={COLORS.primary} />
            <Text variant="bodySmall" style={styles.jobTitle}>
              {assignment.jobId.title}
            </Text>
          </View>
        )}

        {assignment.jobId?.companyId && (
          <View style={styles.companyInfo}>
            <MaterialCommunityIcons name="domain" size={16} color={COLORS.primary} />
            <Text variant="bodySmall" style={styles.companyName}>
              {assignment.jobId.companyId.name}
            </Text>
          </View>
        )}

        {profile?.location && (
          <View style={styles.locationInfo}>
            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.textSecondary} />
            <Text variant="bodySmall" style={styles.locationText}>
              {profile.location}
            </Text>
          </View>
        )}

        {assignment.candidateStatus && (
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(assignment.candidateStatus)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(assignment.candidateStatus) }]}>
                {assignment.candidateStatus.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.assignmentFooter}>
          <Text variant="bodySmall" style={styles.footerText}>
            Assigned {formatRelativeTime(assignment.assignedAt)}
          </Text>
          {profile?.skills && profile.skills.length > 0 && (
            <Text variant="bodySmall" style={styles.skillsCount}>
              {profile.skills.length} skills
            </Text>
          )}
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading candidates..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load candidates" onRetry={() => refetch()} />;
  }

  const activeFiltersCount = [candidateStatusFilter, companyFilter, jobFilter].filter(f => f !== 'all').length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <Searchbar
            placeholder="Search candidates..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          <TouchableOpacity
            style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
            onPress={() => setFilterDialogVisible(true)}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={24}
              color={activeFiltersCount > 0 ? COLORS.primary : COLORS.textSecondary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <MaterialCommunityIcons name="account-group" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{stats.total || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
            <MaterialCommunityIcons name="account-check" size={24} color="#10b981" />
            <Text style={styles.statValue}>{stats.active || 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <MaterialCommunityIcons name="calendar-clock" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.interviewed || 0}</Text>
            <Text style={styles.statLabel}>Interviewed</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#059669" />
            <Text style={styles.statValue}>{stats.hired || 0}</Text>
            <Text style={styles.statLabel}>Hired</Text>
          </View>
        </View>
      </View>

      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon="account-group"
          title="No Candidates"
          message="No candidate assignments found matching your criteria"
        />
      ) : (
        <FlatList
          data={filteredAssignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        />
      )}

      {/* Filter Dialog */}
      <Portal>
        <Dialog visible={filterDialogVisible} onDismiss={() => setFilterDialogVisible(false)}>
          <Dialog.Title>Filters</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <Text style={styles.filterSectionTitle}>Candidate Status</Text>
              <RadioButton.Group
                onValueChange={setCandidateStatusFilter}
                value={candidateStatusFilter}
              >
                {['all', 'new', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_sent', 'hired', 'rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.radioItem}
                    onPress={() => setCandidateStatusFilter(status)}
                  >
                    <RadioButton value={status} />
                    <Text style={styles.radioLabel}>
                      {status === 'all' ? 'All Statuses' : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>

              {companies.length > 0 && (
                <>
                  <Divider style={styles.filterDivider} />
                  <Text style={styles.filterSectionTitle}>Company</Text>
                  <RadioButton.Group onValueChange={setCompanyFilter} value={companyFilter}>
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
                </>
              )}

              {jobs.length > 0 && (
                <>
                  <Divider style={styles.filterDivider} />
                  <Text style={styles.filterSectionTitle}>Job</Text>
                  <RadioButton.Group onValueChange={setJobFilter} value={jobFilter}>
                    <TouchableOpacity
                      style={styles.radioItem}
                      onPress={() => setJobFilter('all')}
                    >
                      <RadioButton value="all" />
                      <Text style={styles.radioLabel}>All Jobs</Text>
                    </TouchableOpacity>
                    {jobs.map((job: string) => (
                      <TouchableOpacity
                        key={job}
                        style={styles.radioItem}
                        onPress={() => setJobFilter(job)}
                      >
                        <RadioButton value={job} />
                        <Text style={styles.radioLabel}>{job}</Text>
                      </TouchableOpacity>
                    ))}
                  </RadioButton.Group>
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setCandidateStatusFilter('all');
                setCompanyFilter('all');
                setJobFilter('all');
                setFilterDialogVisible(false);
              }}
            >
              Clear All
            </Button>
            <Button onPress={() => setFilterDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Details Dialog */}
        <Dialog
          visible={detailsDialogVisible}
          onDismiss={() => setDetailsDialogVisible(false)}
          style={styles.detailsDialog}
        >
          <Dialog.Title>Candidate Details</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              {selectedAssignment && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Candidate</Text>
                    <Text style={styles.detailValue}>
                      {selectedAssignment.candidateId?.userId?.firstName}{' '}
                      {selectedAssignment.candidateId?.userId?.lastName}
                    </Text>
                    <Text style={styles.detailSecondary}>
                      {selectedAssignment.candidateId?.userId?.email}
                    </Text>
                  </View>

                  {selectedAssignment.jobId && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Job</Text>
                      <Text style={styles.detailValue}>{selectedAssignment.jobId.title}</Text>
                      <Text style={styles.detailSecondary}>
                        {selectedAssignment.jobId.companyId?.name}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Status & Priority</Text>
                    <View style={styles.detailRow}>
                      <Badge label={selectedAssignment.candidateStatus || 'new'} />
                      <Badge
                        label={selectedAssignment.priority}
                        style={{ backgroundColor: getPriorityColor(selectedAssignment.priority) }}
                      />
                    </View>
                  </View>

                  {selectedAssignment.candidateId?.profile?.skills && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Skills</Text>
                      <View style={styles.skillsContainer}>
                        {selectedAssignment.candidateId.profile.skills.map((skill, index) => (
                          <Chip key={index} mode="outlined" style={styles.skillChip}>
                            {skill}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}

                  {selectedAssignment.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Notes</Text>
                      <Text style={styles.detailValue}>{selectedAssignment.notes}</Text>
                    </View>
                  )}

                  {selectedAssignment.feedback && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Feedback</Text>
                      <Text style={styles.detailValue}>{selectedAssignment.feedback}</Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Assigned</Text>
                    <Text style={styles.detailValue}>
                      {formatRelativeTime(selectedAssignment.assignedAt)}
                    </Text>
                    <Text style={styles.detailSecondary}>
                      by {selectedAssignment.assignedBy?.firstName}{' '}
                      {selectedAssignment.assignedBy?.lastName}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button
              icon="note-plus"
              onPress={() => {
                setUpdateNotes(selectedAssignment?.notes || '');
                setUpdateDialogVisible(true);
              }}
            >
              Notes
            </Button>
            <Button
              icon="comment"
              onPress={() => {
                setFeedbackText(selectedAssignment?.feedback || '');
                setFeedbackDialogVisible(true);
              }}
            >
              Feedback
            </Button>
            <Button
              icon="flag"
              onPress={() => {
                setSelectedPriority(selectedAssignment?.priority || 'medium');
                setPriorityDialogVisible(true);
              }}
            >
              Priority
            </Button>
            <Button
              icon="checkbox-marked-circle"
              onPress={() => {
                setSelectedStatus(selectedAssignment?.candidateStatus || 'new');
                setStatusDialogVisible(true);
              }}
            >
              Status
            </Button>
            <Button
              icon="delete"
              textColor={COLORS.error}
              onPress={() => selectedAssignment && handleDelete(selectedAssignment)}
            >
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Update Notes Dialog */}
        <Dialog visible={updateDialogVisible} onDismiss={() => setUpdateDialogVisible(false)}>
          <Dialog.Title>Update Notes</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Notes"
              value={updateNotes}
              onChangeText={setUpdateNotes}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUpdateDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddNotes} loading={updateMutation.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog visible={feedbackDialogVisible} onDismiss={() => setFeedbackDialogVisible(false)}>
          <Dialog.Title>Add Feedback</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Feedback"
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFeedbackDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddFeedback} loading={updateMutation.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Status Dialog */}
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Update Status</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setSelectedStatus} value={selectedStatus}>
              {['new', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_sent', 'hired', 'rejected'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.radioItem}
                  onPress={() => setSelectedStatus(status)}
                >
                  <RadioButton value={status} />
                  <Text style={styles.radioLabel}>
                    {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setStatusDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateStatus} loading={updateMutation.isPending}>
              Update
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Priority Dialog */}
        <Dialog visible={priorityDialogVisible} onDismiss={() => setPriorityDialogVisible(false)}>
          <Dialog.Title>Update Priority</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={setSelectedPriority} value={selectedPriority}>
              {['low', 'medium', 'high', 'urgent'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={styles.radioItem}
                  onPress={() => setSelectedPriority(priority)}
                >
                  <RadioButton value={priority} />
                  <View style={styles.priorityOption}>
                    <Text style={styles.radioLabel}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                    <View
                      style={[
                        styles.priorityIndicator,
                        { backgroundColor: getPriorityColor(priority) },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPriorityDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdatePriority} loading={updateMutation.isPending}>
              Update
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
  searchBar: {
    flex: 1,
  },
  filterButton: {
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
  filterButtonActive: {
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
  statsContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  list: {
    padding: 16,
  },
  assignmentCard: {
    marginBottom: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatar: {
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
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  jobTitle: {
    flex: 1,
    color: COLORS.text,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  companyName: {
    flex: 1,
    color: COLORS.textSecondary,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    color: COLORS.textSecondary,
  },
  statusRow: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    color: COLORS.textSecondary,
  },
  skillsCount: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  dialogScrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 24,
    color: COLORS.text,
  },
  filterDivider: {
    marginVertical: 12,
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
    color: COLORS.text,
  },
  detailsDialog: {
    maxHeight: '80%',
  },
  detailSection: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  detailSecondary: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 4,
  },
  textArea: {
    minHeight: 100,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
