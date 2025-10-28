/**
 * Agent Allocation Screen - Admin assigns HRs and Candidates to Agents
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Button, Searchbar, Dialog, Portal, Chip, Checkbox, List } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { COLORS } from '@/constants/config';

export default function AgentAllocationScreen() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [assignDialogVisible, setAssignDialogVisible] = useState(false);
  const [selectedHRs, setSelectedHRs] = useState<Set<string>>(new Set());
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  // Fetch agents
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['users', { role: 'agent' }],
    queryFn: () => apiClient.getUsers({ role: 'agent', limit: 100 }),
  });

  // Fetch HRs
  const { data: hrsData } = useQuery({
    queryKey: ['users', { role: 'hr' }],
    queryFn: () => apiClient.getUsers({ role: 'hr', limit: 100 }),
  });

  // Fetch Candidates
  const { data: candidatesData } = useQuery({
    queryKey: ['users', { role: 'candidate' }],
    queryFn: () => apiClient.getUsers({ role: 'candidate', limit: 100 }),
  });

  // Fetch agent assignments
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['agent-assignments'],
    queryFn: () => apiClient.getAgentAssignmentsList(),
  });

  // Create assignment mutation
  const createAssignment = useMutation({
    mutationFn: (data: any) => apiClient.createAgentAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-assignments'] });
      setAssignDialogVisible(false);
      setSelectedHRs(new Set());
      setSelectedCandidates(new Set());
      setSelectedAgent(null);
      Alert.alert('Success', 'Assignment created successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.detail || 'Failed to create assignment');
    },
  });

  const handleCreateAssignment = () => {
    if (!selectedAgent) return;

    createAssignment.mutate({
      agentId: selectedAgent._id,
      hrIds: Array.from(selectedHRs),
      candidateIds: Array.from(selectedCandidates),
    });
  };

  const toggleHRSelection = (hrId: string) => {
    const newSet = new Set(selectedHRs);
    if (newSet.has(hrId)) {
      newSet.delete(hrId);
    } else {
      newSet.add(hrId);
    }
    setSelectedHRs(newSet);
  };

  const toggleCandidateSelection = (candidateId: string) => {
    const newSet = new Set(selectedCandidates);
    if (newSet.has(candidateId)) {
      newSet.delete(candidateId);
    } else {
      newSet.add(candidateId);
    }
    setSelectedCandidates(newSet);
  };

  if (isLoading || agentsLoading) {
    return <LoadingSpinner message="Loading agent allocations..." />;
  }

  const agents = agentsData?.data || [];
  const hrs = hrsData?.data || [];
  const candidates = candidatesData?.data || [];
  const assignments = assignmentsData?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Agent Allocation
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => setAssignDialogVisible(true)}
          style={styles.addButton}
        >
          Assign
        </Button>
      </View>

      <Searchbar
        placeholder="Search agents..."
        onChangeText={setSearchTerm}
        value={searchTerm}
        style={styles.searchBar}
      />

      <ScrollView style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Agent Assignments ({assignments.length})
        </Text>

        {assignments.map((assignment: any) => (
          <Card key={assignment._id} style={styles.assignmentCard}>
            <View style={styles.agentHeader}>
              <Text variant="titleMedium" style={styles.agentName}>
                {assignment.agentId.firstName} {assignment.agentId.lastName}
              </Text>
              <Badge label="Agent" />
            </View>
            <Text variant="bodySmall" style={styles.agentEmail}>
              {assignment.agentId.email}
            </Text>

            <View style={styles.assignmentSection}>
              <Text variant="titleSmall" style={styles.assignmentLabel}>
                Assigned HRs ({assignment.assignedHRs?.length || 0})
              </Text>
              <View style={styles.chipContainer}>
                {assignment.assignedHRs?.slice(0, 3).map((hr: any) => (
                  <Chip key={hr._id} compact style={styles.chip}>
                    {hr.firstName} {hr.lastName}
                  </Chip>
                ))}
                {assignment.assignedHRs?.length > 3 && (
                  <Chip compact>+{assignment.assignedHRs.length - 3} more</Chip>
                )}
              </View>
            </View>

            <View style={styles.assignmentSection}>
              <Text variant="titleSmall" style={styles.assignmentLabel}>
                Assigned Candidates ({assignment.assignedCandidates?.length || 0})
              </Text>
              <View style={styles.chipContainer}>
                {assignment.assignedCandidates?.slice(0, 3).map((candidate: any) => (
                  <Chip key={candidate._id} compact style={styles.chip}>
                    {candidate.firstName} {candidate.lastName}
                  </Chip>
                ))}
                {assignment.assignedCandidates?.length > 3 && (
                  <Chip compact>+{assignment.assignedCandidates.length - 3} more</Chip>
                )}
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Assignment Dialog */}
      <Portal>
        <Dialog visible={assignDialogVisible} onDismiss={() => setAssignDialogVisible(false)}>
          <Dialog.Title>Create Agent Assignment</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.dialogContent}>
              <Text variant="titleSmall" style={styles.dialogLabel}>
                Select Agent
              </Text>
              {agents.map((agent: any) => (
                <List.Item
                  key={agent._id}
                  title={`${agent.firstName} ${agent.lastName}`}
                  description={agent.email}
                  left={() => (
                    <Checkbox
                      status={selectedAgent?._id === agent._id ? 'checked' : 'unchecked'}
                      onPress={() => setSelectedAgent(agent)}
                    />
                  )}
                  onPress={() => setSelectedAgent(agent)}
                />
              ))}

              <Text variant="titleSmall" style={[styles.dialogLabel, styles.mt]}>
                Select HRs
              </Text>
              {hrs.map((hr: any) => (
                <List.Item
                  key={hr._id}
                  title={`${hr.firstName} ${hr.lastName}`}
                  description={hr.email}
                  left={() => (
                    <Checkbox
                      status={selectedHRs.has(hr._id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleHRSelection(hr._id)}
                    />
                  )}
                  onPress={() => toggleHRSelection(hr._id)}
                />
              ))}

              <Text variant="titleSmall" style={[styles.dialogLabel, styles.mt]}>
                Select Candidates
              </Text>
              {candidates.map((candidate: any) => (
                <List.Item
                  key={candidate._id}
                  title={`${candidate.firstName} ${candidate.lastName}`}
                  description={candidate.email}
                  left={() => (
                    <Checkbox
                      status={selectedCandidates.has(candidate._id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleCandidateSelection(candidate._id)}
                    />
                  )}
                  onPress={() => toggleCandidateSelection(candidate._id)}
                />
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setAssignDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={handleCreateAssignment}
              disabled={!selectedAgent || createAssignment.isPending}
            >
              {createAssignment.isPending ? 'Creating...' : 'Create'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontWeight: 'bold',
  },
  addButton: {
    marginLeft: 8,
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  assignmentCard: {
    marginBottom: 16,
  },
  agentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agentName: {
    fontWeight: 'bold',
    flex: 1,
  },
  agentEmail: {
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  assignmentSection: {
    marginTop: 12,
  },
  assignmentLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  dialogContent: {
    maxHeight: 400,
  },
  dialogLabel: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  mt: {
    marginTop: 24,
  },
});

