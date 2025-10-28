/**
 * User Management Screen - Full CRUD for users
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, Button, Searchbar, Dialog, Portal, TextInput, FAB, Chip, RadioButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { COLORS } from '@/constants/config';
import { formatDate } from '@/utils/helpers';

export default function UserManagementScreen() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'candidate',
    password: '',
    status: 'active',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users', searchTerm, roleFilter, statusFilter],
    queryFn: () => apiClient.getUsers({
      search: searchTerm || undefined,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      limit: 100,
    }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateDialogVisible(false);
      resetForm();
      Alert.alert('Success', 'User created successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.detail || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => apiClient.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditDialogVisible(false);
      Alert.alert('Success', 'User updated successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.detail || 'Failed to update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert('Success', 'User deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: 'candidate',
      password: '',
      status: 'active',
    });
  };

  const handleCreate = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Error', 'All required fields must be filled');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    const { password, ...updateData } = formData;
    updateMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const handleDelete = (user: any) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(user.id),
        },
      ]
    );
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      password: '',
      status: user.status,
    });
    setEditDialogVisible(true);
  };

  const openViewDialog = (user: any) => {
    setSelectedUser(user);
    setViewDialogVisible(true);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  const users = data?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchTerm}
          value={searchTerm}
          style={styles.searchBar}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          <Chip selected={roleFilter === ''} onPress={() => setRoleFilter('')} style={styles.filterChip}>
            All Roles
          </Chip>
          <Chip selected={roleFilter === 'admin'} onPress={() => setRoleFilter('admin')} style={styles.filterChip}>
            Admin
          </Chip>
          <Chip selected={roleFilter === 'hr'} onPress={() => setRoleFilter('hr')} style={styles.filterChip}>
            HR
          </Chip>
          <Chip selected={roleFilter === 'agent'} onPress={() => setRoleFilter('agent')} style={styles.filterChip}>
            Agent
          </Chip>
          <Chip selected={roleFilter === 'candidate'} onPress={() => setRoleFilter('candidate')} style={styles.filterChip}>
            Candidate
          </Chip>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {users.length === 0 ? (
          <EmptyState
            icon="account-group"
            title="No Users"
            message="No users found"
            actionLabel="Add User"
            onAction={() => setCreateDialogVisible(true)}
          />
        ) : (
          users.map((user: any) => (
            <Card key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text variant="titleMedium" style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text variant="bodySmall" style={styles.userEmail}>
                    {user.email}
                  </Text>
                </View>
                <View style={styles.badges}>
                  <Badge label={user.role} />
                  <Badge label={user.status} type="status" />
                </View>
              </View>
              {user.phoneNumber && (
                <Text variant="bodySmall" style={styles.phone}>
                  📞 {user.phoneNumber}
                </Text>
              )}
              <View style={styles.userMeta}>
                <Text variant="bodySmall" style={styles.meta}>
                  ID: {user.customId}
                </Text>
                <Text variant="bodySmall" style={styles.meta}>
                  Last login: {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                </Text>
              </View>
              <View style={styles.actions}>
                <Button mode="outlined" onPress={() => openViewDialog(user)} compact>
                  View
                </Button>
                <Button mode="outlined" onPress={() => openEditDialog(user)} compact>
                  Edit
                </Button>
                <Button mode="outlined" onPress={() => handleDelete(user)} textColor={COLORS.error} compact>
                  Delete
                </Button>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          resetForm();
          setCreateDialogVisible(true);
        }}
        label="Add User"
      />

      {/* Create Dialog */}
      <Portal>
        <Dialog visible={createDialogVisible} onDismiss={() => setCreateDialogVisible(false)}>
          <Dialog.Title>Create User</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                label="First Name *"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                style={styles.input}
              />
              <TextInput
                label="Last Name *"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                style={styles.input}
              />
              <TextInput
                label="Email *"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                style={styles.input}
                keyboardType="phone-pad"
              />
              <TextInput
                label="Password *"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                style={styles.input}
                secureTextEntry
              />
              <Text variant="labelMedium" style={styles.label}>
                Role *
              </Text>
              <RadioButton.Group onValueChange={(value) => setFormData({ ...formData, role: value })} value={formData.role}>
                <RadioButton.Item label="Admin" value="admin" />
                <RadioButton.Item label="HR" value="hr" />
                <RadioButton.Item label="Agent" value="agent" />
                <RadioButton.Item label="Candidate" value="candidate" />
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setCreateDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreate} loading={createMutation.isPending}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit User</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                style={styles.input}
              />
              <TextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                style={styles.input}
              />
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                style={styles.input}
                keyboardType="phone-pad"
              />
              <Text variant="labelMedium" style={styles.label}>
                Role
              </Text>
              <RadioButton.Group onValueChange={(value) => setFormData({ ...formData, role: value })} value={formData.role}>
                <RadioButton.Item label="Admin" value="admin" />
                <RadioButton.Item label="HR" value="hr" />
                <RadioButton.Item label="Agent" value="agent" />
                <RadioButton.Item label="Candidate" value="candidate" />
              </RadioButton.Group>
              <Text variant="labelMedium" style={styles.label}>
                Status
              </Text>
              <RadioButton.Group onValueChange={(value) => setFormData({ ...formData, status: value })} value={formData.status}>
                <RadioButton.Item label="Active" value="active" />
                <RadioButton.Item label="Inactive" value="inactive" />
                <RadioButton.Item label="Suspended" value="suspended" />
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleEdit} loading={updateMutation.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* View Dialog */}
        <Dialog visible={viewDialogVisible} onDismiss={() => setViewDialogVisible(false)}>
          <Dialog.Title>User Details</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={styles.viewContent}>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Name:</Text>
                <Text>
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </Text>
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Email:</Text>
                <Text>{selectedUser?.email}</Text>
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Phone:</Text>
                <Text>{selectedUser?.phoneNumber || 'N/A'}</Text>
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">User ID:</Text>
                <Text>{selectedUser?.customId}</Text>
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Role:</Text>
                <Badge label={selectedUser?.role} />
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Status:</Text>
                <Badge label={selectedUser?.status} type="status" />
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Email Verified:</Text>
                <Text>{selectedUser?.emailVerified ? 'Yes' : 'No'}</Text>
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Last Login:</Text>
                <Text>{selectedUser?.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}</Text>
              </View>
              <View style={styles.viewRow}>
                <Text variant="labelMedium">Created:</Text>
                <Text>{selectedUser?.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}</Text>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setViewDialogVisible(false)}>Close</Button>
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
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: COLORS.textSecondary,
  },
  badges: {
    gap: 4,
    alignItems: 'flex-end',
  },
  phone: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  userMeta: {
    marginBottom: 12,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
  viewContent: {
    padding: 8,
  },
  viewRow: {
    marginBottom: 12,
  },
});

