/**
 * Create Job Screen
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, RadioButton, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { COLORS } from '@/constants/config';

export default function CreateJobScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    type: 'full-time',
    workType: 'wfo',
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    skills: '',
    experience: 'mid',
    benefits: '',
    applicationDeadline: '',
    interviewRounds: '2',
    estimatedDuration: '2-3 weeks',
    duration: '',
    numberOfOpenings: '1',
    companyId: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Dialog states
  const [companyDialogVisible, setCompanyDialogVisible] = useState(false);
  const [typeDialogVisible, setTypeDialogVisible] = useState(false);
  const [workTypeDialogVisible, setWorkTypeDialogVisible] = useState(false);
  const [currencyDialogVisible, setCurrencyDialogVisible] = useState(false);
  const [experienceDialogVisible, setExperienceDialogVisible] = useState(false);
  const [timelineDialogVisible, setTimelineDialogVisible] = useState(false);

  // Fetch companies
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiClient.getCompanies({ limit: 100 }),
  });

  const companies = companiesData?.data || [];

  // Check if HR has companies
  useEffect(() => {
    if (!companiesLoading && user?.role === 'hr' && companies.length === 0) {
      Alert.alert(
        'Add a Company First',
        'Please add your company before posting jobs.',
        [
          {
            text: 'Go to Companies',
            onPress: () => router.push('/(tabs)/companies'),
          },
          {
            text: 'Cancel',
            onPress: () => router.back(),
            style: 'cancel',
          },
        ]
      );
    }
  }, [companiesLoading, companies.length, user?.role]);

  // Auto-fill location when company is selected
  useEffect(() => {
    if (formData.companyId && companies.length > 0) {
      const selectedCompany = companies.find((c: any) => c.id === formData.companyId);
      if (selectedCompany?.address) {
        setFormData((prev) => ({
          ...prev,
          location: selectedCompany.address.city || selectedCompany.location || '',
          address: {
            street: selectedCompany.address.street || '',
            city: selectedCompany.address.city || '',
            state: selectedCompany.address.state || '',
            zipCode: selectedCompany.address.zipCode || '',
            country: selectedCompany.address.country || '',
          },
        }));
      }
    }
  }, [formData.companyId, companies]);

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData: any) => apiClient.createJob(jobData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      Alert.alert('Success', 'Job created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      console.error('Job creation error:', error);
      Alert.alert('Error', error?.message || 'Failed to create job. Please try again.');
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Job title is required';
    if (!formData.description.trim()) errors.description = 'Job description is required';
    if (!formData.companyId) errors.companyId = 'Company selection is required';
    if (!formData.skills.trim()) errors.skills = 'At least one skill is required';
    if (!formData.salaryMin.trim()) errors.salaryMin = 'Minimum salary is required';
    if (!formData.salaryMax.trim()) errors.salaryMax = 'Maximum salary is required';
    if (!formData.estimatedDuration) errors.estimatedDuration = 'Estimated timeline is required';

    if (formData.salaryMin && formData.salaryMax) {
      const min = parseInt(formData.salaryMin);
      const max = parseInt(formData.salaryMax);
      if (min > max) {
        errors.salaryMax = 'Maximum salary must be greater than minimum';
      }
    }

    if (
      (formData.type === 'contract' || formData.type === 'internship') &&
      !formData.duration.trim()
    ) {
      errors.duration = 'Duration is required for contract/internship positions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateJob = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const jobData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        zipCode: formData.address.zipCode.trim(),
        country: formData.address.country.trim(),
      },
      type: formData.type,
      workType: formData.workType,
      duration:
        formData.type === 'contract' || formData.type === 'internship'
          ? formData.duration
          : undefined,
      numberOfOpenings: parseInt(formData.numberOfOpenings) || 1,
      companyId: formData.companyId,
      salaryRange: {
        min: parseInt(formData.salaryMin),
        max: parseInt(formData.salaryMax),
        currency: formData.currency,
      },
      requirements: {
        skills: formData.skills
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean),
        experience: formData.experience,
      },
      benefits: formData.benefits
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean),
      applicationDeadline: formData.applicationDeadline
        ? new Date(formData.applicationDeadline).toISOString()
        : undefined,
      interviewProcess: {
        rounds: parseInt(formData.interviewRounds),
        estimatedDuration: formData.estimatedDuration,
      },
    };

    createJobMutation.mutate(jobData);
  };

  if (companiesLoading) {
    return <LoadingSpinner message="Loading companies..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text variant="headlineMedium" style={styles.title}>
            Post New Job
          </Text>

        {/* Company Selection */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Company <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.selector, formErrors.companyId && styles.fieldError]}
            onPress={() => setCompanyDialogVisible(true)}
          >
            <Text style={formData.companyId ? styles.selectorText : styles.selectorPlaceholder}>
              {formData.companyId
                ? companies.find((c: any) => c.id === formData.companyId)?.name
                : 'Select Company'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {formErrors.companyId && (
            <Text style={styles.errorText}>{formErrors.companyId}</Text>
          )}
        </View>

        {/* Job Title */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Job Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g. Senior Software Engineer"
            style={styles.input}
            error={!!formErrors.title}
          />
          {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
        </View>

        {/* Job Description */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Job Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe the role, responsibilities, and requirements..."
            multiline
            numberOfLines={6}
            style={[styles.input, styles.textArea]}
            error={!!formErrors.description}
          />
          {formErrors.description && (
            <Text style={styles.errorText}>{formErrors.description}</Text>
          )}
        </View>

        {/* Job Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Job Type</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setTypeDialogVisible(true)}
          >
            <Text style={styles.selectorText}>
              {formData.type === 'full-time'
                ? 'Full Time'
                : formData.type === 'part-time'
                ? 'Part Time'
                : formData.type === 'contract'
                ? 'Contract'
                : 'Internship'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Work Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Work Type</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setWorkTypeDialogVisible(true)}
          >
            <Text style={styles.selectorText}>
              {formData.workType === 'wfo'
                ? 'Work From Office'
                : formData.workType === 'wfh'
                ? 'Work From Home'
                : 'Hybrid'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Duration (for contract/internship) */}
        {(formData.type === 'contract' || formData.type === 'internship') && (
          <View style={styles.field}>
            <Text style={styles.label}>
              Duration <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              placeholder="e.g. 6 months"
              style={styles.input}
              error={!!formErrors.duration}
            />
            {formErrors.duration && <Text style={styles.errorText}>{formErrors.duration}</Text>}
          </View>
        )}

        {/* Salary Range */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>
              Min Salary <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={formData.salaryMin}
              onChangeText={(text) => setFormData({ ...formData, salaryMin: text })}
              placeholder="e.g. 50000"
              keyboardType="numeric"
              style={styles.input}
              error={!!formErrors.salaryMin}
            />
            {formErrors.salaryMin && (
              <Text style={styles.errorText}>{formErrors.salaryMin}</Text>
            )}
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>
              Max Salary <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={formData.salaryMax}
              onChangeText={(text) => setFormData({ ...formData, salaryMax: text })}
              placeholder="e.g. 80000"
              keyboardType="numeric"
              style={styles.input}
              error={!!formErrors.salaryMax}
            />
            {formErrors.salaryMax && (
              <Text style={styles.errorText}>{formErrors.salaryMax}</Text>
            )}
          </View>
        </View>

        {/* Currency */}
        <View style={styles.field}>
          <Text style={styles.label}>Currency</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setCurrencyDialogVisible(true)}
          >
            <Text style={styles.selectorText}>
              {formData.currency === 'INR'
                ? 'INR (₹)'
                : formData.currency === 'USD'
                ? 'USD ($)'
                : 'EUR (€)'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Skills */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Skills (comma separated) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.skills}
            onChangeText={(text) => setFormData({ ...formData, skills: text })}
            placeholder="e.g. React, Node.js, TypeScript"
            style={styles.input}
            error={!!formErrors.skills}
          />
          {formErrors.skills && <Text style={styles.errorText}>{formErrors.skills}</Text>}
        </View>

        {/* Experience Level */}
        <View style={styles.field}>
          <Text style={styles.label}>Experience Level</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setExperienceDialogVisible(true)}
          >
            <Text style={styles.selectorText}>
              {formData.experience === 'entry'
                ? 'Entry Level'
                : formData.experience === 'mid'
                ? 'Mid Level'
                : 'Senior Level'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={styles.field}>
          <Text style={styles.label}>Benefits (comma separated)</Text>
          <TextInput
            value={formData.benefits}
            onChangeText={(text) => setFormData({ ...formData, benefits: text })}
            placeholder="e.g. Health Insurance, PTO, Remote Work"
            style={styles.input}
          />
        </View>

        {/* Number of Openings */}
        <View style={styles.field}>
          <Text style={styles.label}>Number of Openings</Text>
          <TextInput
            value={formData.numberOfOpenings}
            onChangeText={(text) => setFormData({ ...formData, numberOfOpenings: text })}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        {/* Interview Rounds */}
        <View style={styles.field}>
          <Text style={styles.label}>Interview Rounds</Text>
          <TextInput
            value={formData.interviewRounds}
            onChangeText={(text) => setFormData({ ...formData, interviewRounds: text })}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        {/* Estimated Timeline */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Estimated Hiring Timeline <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setTimelineDialogVisible(true)}
          >
            <Text style={styles.selectorText}>{formData.estimatedDuration}</Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
            disabled={createJobMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateJob}
            style={styles.button}
            loading={createJobMutation.isPending}
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending ? 'Creating...' : 'Create Job'}
          </Button>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Dialogs */}
      <Portal>
        {/* Company Dialog */}
        <Dialog visible={companyDialogVisible} onDismiss={() => setCompanyDialogVisible(false)}>
          <Dialog.Title>Select Company</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <RadioButton.Group
                onValueChange={(value) => {
                  setFormData({ ...formData, companyId: value });
                  setCompanyDialogVisible(false);
                }}
                value={formData.companyId}
              >
                {companies.map((company: any) => (
                  <TouchableOpacity
                    key={company.id}
                    style={styles.radioItem}
                    onPress={() => {
                      setFormData({ ...formData, companyId: company.id });
                      setCompanyDialogVisible(false);
                    }}
                  >
                    <RadioButton value={company.id} />
                    <Text style={styles.radioLabel}>{company.name}</Text>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>

        {/* Job Type Dialog */}
        <Dialog visible={typeDialogVisible} onDismiss={() => setTypeDialogVisible(false)}>
          <Dialog.Title>Select Job Type</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData({ ...formData, type: value });
                setTypeDialogVisible(false);
              }}
              value={formData.type}
            >
              {[
                { label: 'Full Time', value: 'full-time' },
                { label: 'Part Time', value: 'part-time' },
                { label: 'Contract', value: 'contract' },
                { label: 'Internship', value: 'internship' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => {
                    setFormData({ ...formData, type: option.value });
                    setTypeDialogVisible(false);
                  }}
                >
                  <RadioButton value={option.value} />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>

        {/* Work Type Dialog */}
        <Dialog visible={workTypeDialogVisible} onDismiss={() => setWorkTypeDialogVisible(false)}>
          <Dialog.Title>Select Work Type</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData({ ...formData, workType: value });
                setWorkTypeDialogVisible(false);
              }}
              value={formData.workType}
            >
              {[
                { label: 'Work From Office', value: 'wfo' },
                { label: 'Work From Home', value: 'wfh' },
                { label: 'Hybrid', value: 'hybrid' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => {
                    setFormData({ ...formData, workType: option.value });
                    setWorkTypeDialogVisible(false);
                  }}
                >
                  <RadioButton value={option.value} />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>

        {/* Currency Dialog */}
        <Dialog visible={currencyDialogVisible} onDismiss={() => setCurrencyDialogVisible(false)}>
          <Dialog.Title>Select Currency</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData({ ...formData, currency: value });
                setCurrencyDialogVisible(false);
              }}
              value={formData.currency}
            >
              {[
                { label: 'INR (₹)', value: 'INR' },
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => {
                    setFormData({ ...formData, currency: option.value });
                    setCurrencyDialogVisible(false);
                  }}
                >
                  <RadioButton value={option.value} />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>

        {/* Experience Dialog */}
        <Dialog
          visible={experienceDialogVisible}
          onDismiss={() => setExperienceDialogVisible(false)}
        >
          <Dialog.Title>Select Experience Level</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData({ ...formData, experience: value });
                setExperienceDialogVisible(false);
              }}
              value={formData.experience}
            >
              {[
                { label: 'Entry Level', value: 'entry' },
                { label: 'Mid Level', value: 'mid' },
                { label: 'Senior Level', value: 'senior' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => {
                    setFormData({ ...formData, experience: option.value });
                    setExperienceDialogVisible(false);
                  }}
                >
                  <RadioButton value={option.value} />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>

        {/* Timeline Dialog */}
        <Dialog visible={timelineDialogVisible} onDismiss={() => setTimelineDialogVisible(false)}>
          <Dialog.Title>Select Timeline</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData({ ...formData, estimatedDuration: value });
                setTimelineDialogVisible(false);
              }}
              value={formData.estimatedDuration}
            >
              {[
                { label: '1-2 weeks', value: '1-2 weeks' },
                { label: '2-3 weeks', value: '2-3 weeks' },
                { label: '3-4 weeks', value: '3-4 weeks' },
                { label: '1-2 months', value: '1-2 months' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => {
                    setFormData({ ...formData, estimatedDuration: option.value });
                    setTimelineDialogVisible(false);
                  }}
                >
                  <RadioButton value={option.value} />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    color: COLORS.text,
  },
  field: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  textArea: {
    minHeight: 120,
  },
  selector: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectorPlaceholder: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  fieldError: {
    borderColor: '#ef4444',
  },
  dialogScrollArea: {
    maxHeight: 400,
    paddingHorizontal: 0,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
  },
});

