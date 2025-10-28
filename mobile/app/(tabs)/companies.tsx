/**
 * Companies Screen - Browse and manage companies
 */

import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
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
import type { Company } from '@/types';

export default function CompaniesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterDialogVisible, setFilterDialogVisible] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['companies', searchQuery, statusFilter],
    queryFn: () =>
      apiClient.getCompanies({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
      }),
  });

  const companies = data?.data || [];
  const canManageCompanies = user?.role === 'hr' || user?.role === 'admin';

  // Calculate stats
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c: any) => c.status === 'active').length;
  const totalJobs = companies.reduce((sum: number, c: any) => sum + (c.totalJobs || 0), 0);
  const totalHires = companies.reduce((sum: number, c: any) => sum + (c.totalHires || 0), 0);

  const getPartnershipColor = (partnership: string) => {
    switch (partnership) {
      case 'enterprise': return '#8b5cf6';
      case 'premium': return '#f59e0b';
      case 'standard': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'suspended': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderCompany = ({ item: company }: { item: any }) => (
    <Card style={styles.companyCard} onPress={() => router.push('/(tabs)/companies' as any)}>
      <View style={styles.companyHeader}>
        <View style={styles.companyIconContainer}>
          <MaterialCommunityIcons name="domain" size={32} color={COLORS.primary} />
        </View>
        <View style={styles.companyHeaderInfo}>
          <Text variant="titleMedium" style={styles.companyName}>
            {company.name}
          </Text>
          <View style={styles.badges}>
            <Badge label={company.partnership} />
            <Badge
              label={company.status}
              type="status"
            />
          </View>
        </View>
      </View>

      {company.industry && (
        <Text variant="bodySmall" style={styles.industry}>
          🏭 {company.industry}
        </Text>
      )}

      {company.location && (
        <Text variant="bodySmall" style={styles.location}>
          📍 {company.address?.city && company.address?.state
            ? `${company.address.city}, ${company.address.state}`
            : company.location}
        </Text>
      )}

      {company.website && (
        <Text variant="bodySmall" style={styles.website}>
          🌐 {company.website}
        </Text>
      )}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="briefcase" size={16} color={COLORS.primary} />
          <Text variant="bodySmall" style={styles.statText}>
            {company.totalJobs || 0} jobs
          </Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="account-check" size={16} color={COLORS.success} />
          <Text variant="bodySmall" style={styles.statText}>
            {company.totalHires || 0} hires
          </Text>
        </View>
        {company.rating > 0 && (
          <View style={styles.stat}>
            <MaterialCommunityIcons name="star" size={16} color="#f59e0b" />
            <Text variant="bodySmall" style={styles.statText}>
              {company.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.companyFooter}>
        <View style={styles.tags}>
          <Chip mode="outlined" style={styles.chip} textStyle={styles.chipText}>
            {company.size || 'N/A'}
          </Chip>
        </View>
        <Text variant="bodySmall" style={styles.metaText}>
          {formatRelativeTime(company.createdAt)}
        </Text>
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner message="Loading companies..." />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load companies" onRetry={() => refetch()} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          {searchExpanded ? (
            <View style={styles.searchBarExpanded}>
              <Searchbar
                placeholder="Search companies..."
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
                style={[styles.filterIcon, statusFilter !== 'all' && styles.filterIconActive]}
              >
                <MaterialCommunityIcons 
                  name="filter-variant" 
                  size={24} 
                  color={statusFilter !== 'all' ? COLORS.primary : COLORS.textSecondary} 
                />
                {statusFilter !== 'all' && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>
              {canManageCompanies && (
                <TouchableOpacity
                  onPress={() => router.push('/companies/create')}
                  style={[styles.postButtonWrapper, { flex: 1 }]}
                >
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.postButton}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color="white" />
                    <Text style={styles.postButtonText}>Add Company</Text>
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
              <MaterialCommunityIcons name="domain" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalCompanies}</Text>
              <Text style={styles.statLabel}>Companies</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#10b981' }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{activeCompanies}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#f59e0b' }]}>
              <MaterialCommunityIcons name="briefcase" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalJobs}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#faf5ff' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: '#8b5cf6' }]}>
              <MaterialCommunityIcons name="account-check" size={20} color="white" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{totalHires}</Text>
              <Text style={styles.statLabel}>Total Hires</Text>
            </View>
          </View>
        </View>
    </View>

      {companies.length === 0 ? (
        <EmptyState
          icon="domain"
          title="No Companies Found"
          message="There are no companies matching your criteria"
          actionLabel={canManageCompanies ? 'Add a Company' : undefined}
          onAction={canManageCompanies ? () => router.push('/companies/create') : undefined}
        />
      ) : (
        <FlatList
          data={companies as any[]}
          renderItem={renderCompany}
          keyExtractor={(item: any) => item._id || item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        />
      )}

      {/* Filter Dialog */}
      <Portal>
        <Dialog visible={filterDialogVisible} onDismiss={() => setFilterDialogVisible(false)}>
          <Dialog.Title>Filter by Status</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <RadioButton.Group 
                onValueChange={value => setStatusFilter(value)} 
                value={statusFilter}
              >
                <TouchableOpacity 
                  style={styles.radioItem}
                  onPress={() => setStatusFilter('all')}
                >
                  <RadioButton value="all" />
                  <Text style={styles.radioLabel}>All Companies</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioItem}
                  onPress={() => setStatusFilter('active')}
                >
                  <RadioButton value="active" />
                  <Text style={styles.radioLabel}>Active</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.radioItem}
                  onPress={() => setStatusFilter('pending')}
                >
                  <RadioButton value="pending" />
                  <Text style={styles.radioLabel}>Pending</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.radioItem}
                  onPress={() => setStatusFilter('inactive')}
                >
                  <RadioButton value="inactive" />
                  <Text style={styles.radioLabel}>Inactive</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.radioItem}
                  onPress={() => setStatusFilter('suspended')}
                >
                  <RadioButton value="suspended" />
                  <Text style={styles.radioLabel}>Suspended</Text>
                </TouchableOpacity>
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => {
              setStatusFilter('all');
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
  companyCard: {
    marginBottom: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyHeaderInfo: {
    flex: 1,
  },
  companyName: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  industry: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  location: {
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  website: {
    color: COLORS.primary,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: COLORS.textSecondary,
  },
  companyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    height: 36,
    paddingHorizontal: 12,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 20,
  },
  metaText: {
    color: COLORS.textSecondary,
  },
});
