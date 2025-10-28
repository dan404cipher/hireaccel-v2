/**
 * Create Company Screen
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, RadioButton, Portal, Dialog } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { COLORS } from '@/constants/config';

export default function CreateCompanyScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    size: '1-10',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
    website: '',
    foundedYear: new Date().getFullYear().toString(),
    partnership: 'basic',
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Dialog states
  const [sizeDialogVisible, setSizeDialogVisible] = useState(false);
  const [partnershipDialogVisible, setPartnershipDialogVisible] = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (companyData: any) => apiClient.createCompany(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      Alert.alert('Success', 'Company created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      console.error('Company creation error:', error);
      Alert.alert('Error', error?.message || error?.detail || 'Failed to create company. Please try again.');
    },
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Company name is required';
    if (!formData.industry.trim()) errors.industry = 'Industry is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.size) errors.size = 'Company size is required';
    if (!formData.address.street.trim()) errors.addressStreet = 'Street address is required';
    if (!formData.address.city.trim()) errors.addressCity = 'City is required';
    if (!formData.address.zipCode.trim()) errors.addressZipCode = 'ZIP/PIN code is required';
    if (!formData.foundedYear.trim()) errors.foundedYear = 'Founded year is required';

    // Validate website URL if provided
    if (formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        errors.website = 'Please enter a valid URL (e.g., https://www.company.com)';
      }
    }

    // Validate founded year
    const year = parseInt(formData.foundedYear);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1800 || year > currentYear) {
      errors.foundedYear = `Please enter a valid year between 1800 and ${currentYear}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCompany = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    const companyData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      industry: formData.industry.trim(),
      size: formData.size,
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        zipCode: formData.address.zipCode.trim(),
        country: formData.address.country.trim(),
      },
      website: formData.website.trim() || undefined,
      foundedYear: parseInt(formData.foundedYear),
      partnership: formData.partnership,
      status: formData.status,
      contacts: [],
    };

    createCompanyMutation.mutate(companyData);
  };

  const companySizes = [
    { label: '1-10 employees', value: '1-10' },
    { label: '11-25 employees', value: '11-25' },
    { label: '26-50 employees', value: '26-50' },
    { label: '51-100 employees', value: '51-100' },
    { label: '101-250 employees', value: '101-250' },
    { label: '251-500 employees', value: '251-500' },
    { label: '501-1000 employees', value: '501-1000' },
    { label: '1000+ employees', value: '1000+' },
  ];

  const partnershipLevels = [
    { label: 'Basic', value: 'basic' },
    { label: 'Standard', value: 'standard' },
    { label: 'Premium', value: 'premium' },
    { label: 'Enterprise', value: 'enterprise' },
  ];

  const statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending' },
    { label: 'Inactive', value: 'inactive' },
  ];

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
            Add New Company
          </Text>

        {/* Company Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Company Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g. TechCorp Inc."
            style={styles.input}
            error={!!formErrors.name}
          />
          {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
        </View>

        {/* Industry */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Industry <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.industry}
            onChangeText={(text) => setFormData({ ...formData, industry: text })}
            placeholder="e.g. Technology, Finance, Healthcare"
            style={styles.input}
            error={!!formErrors.industry}
          />
          {formErrors.industry && <Text style={styles.errorText}>{formErrors.industry}</Text>}
        </View>

        {/* Company Size */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Company Size <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.selector, formErrors.size && styles.fieldError]}
            onPress={() => setSizeDialogVisible(true)}
          >
            <Text style={styles.selectorText}>
              {companySizes.find(s => s.value === formData.size)?.label || 'Select size'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {formErrors.size && <Text style={styles.errorText}>{formErrors.size}</Text>}
        </View>

        {/* Address Section */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Company Address
        </Text>

        {/* Street Address */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Street Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.address.street}
            onChangeText={(text) => setFormData({ ...formData, address: { ...formData.address, street: text } })}
            placeholder="e.g. 123 Main Street"
            style={styles.input}
            error={!!formErrors.addressStreet}
          />
          {formErrors.addressStreet && <Text style={styles.errorText}>{formErrors.addressStreet}</Text>}
        </View>

        {/* City and State */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>
              City <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={formData.address.city}
              onChangeText={(text) => setFormData({ ...formData, address: { ...formData.address, city: text } })}
              placeholder="City"
              style={styles.input}
              error={!!formErrors.addressCity}
            />
            {formErrors.addressCity && <Text style={styles.errorText}>{formErrors.addressCity}</Text>}
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              value={formData.address.state}
              onChangeText={(text) => setFormData({ ...formData, address: { ...formData.address, state: text } })}
              placeholder="State"
              style={styles.input}
            />
          </View>
        </View>

        {/* ZIP Code and Country */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>
              ZIP/PIN Code <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={formData.address.zipCode}
              onChangeText={(text) => setFormData({ ...formData, address: { ...formData.address, zipCode: text } })}
              placeholder="ZIP/PIN"
              style={styles.input}
              error={!!formErrors.addressZipCode}
            />
            {formErrors.addressZipCode && <Text style={styles.errorText}>{formErrors.addressZipCode}</Text>}
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              value={formData.address.country}
              onChangeText={(text) => setFormData({ ...formData, address: { ...formData.address, country: text } })}
              placeholder="Country"
              style={styles.input}
            />
          </View>
        </View>

        {/* Website */}
        <View style={styles.field}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            value={formData.website}
            onChangeText={(text) => setFormData({ ...formData, website: text })}
            placeholder="https://www.company.com"
            style={styles.input}
            keyboardType="url"
            autoCapitalize="none"
            error={!!formErrors.website}
          />
          {formErrors.website && <Text style={styles.errorText}>{formErrors.website}</Text>}
        </View>

        {/* Founded Year */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Founded Year <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.foundedYear}
            onChangeText={(text) => setFormData({ ...formData, foundedYear: text })}
            placeholder="e.g. 2020"
            keyboardType="numeric"
            style={styles.input}
            error={!!formErrors.foundedYear}
          />
          {formErrors.foundedYear && <Text style={styles.errorText}>{formErrors.foundedYear}</Text>}
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe the company's business and services..."
            multiline
            numberOfLines={6}
            style={[styles.input, styles.textArea]}
            error={!!formErrors.description}
          />
          {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
        </View>

        {/* Partnership Level */}
        <View style={styles.field}>
          <Text style={styles.label}>Partnership Level</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setPartnershipDialogVisible(true)}
          >
            <Text style={styles.selectorText}>
              {partnershipLevels.find(p => p.value === formData.partnership)?.label || 'Basic'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setStatusDialogVisible(true)}
          >
            <Text style={styles.selectorText}>
              {statuses.find(s => s.value === formData.status)?.label || 'Active'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            mode="outlined"
            onPress={() => router.back()}
            style={styles.button}
            disabled={createCompanyMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleCreateCompany}
            style={styles.button}
            loading={createCompanyMutation.isPending}
            disabled={createCompanyMutation.isPending}
          >
            {createCompanyMutation.isPending ? 'Creating...' : 'Create Company'}
          </Button>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Dialogs */}
      <Portal>
        {/* Size Dialog */}
        <Dialog visible={sizeDialogVisible} onDismiss={() => setSizeDialogVisible(false)}>
          <Dialog.Title>Select Company Size</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <RadioButton.Group
                onValueChange={(value) => {
                  setFormData({ ...formData, size: value });
                  setSizeDialogVisible(false);
                }}
                value={formData.size}
              >
                {companySizes.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioItem}
                    onPress={() => {
                      setFormData({ ...formData, size: option.value });
                      setSizeDialogVisible(false);
                    }}
                  >
                    <RadioButton value={option.value} />
                    <Text style={styles.radioLabel}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>

        {/* Partnership Dialog */}
        <Dialog visible={partnershipDialogVisible} onDismiss={() => setPartnershipDialogVisible(false)}>
          <Dialog.Title>Select Partnership Level</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData({ ...formData, partnership: value });
                setPartnershipDialogVisible(false);
              }}
              value={formData.partnership}
            >
              {partnershipLevels.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => {
                    setFormData({ ...formData, partnership: option.value });
                    setPartnershipDialogVisible(false);
                  }}
                >
                  <RadioButton value={option.value} />
                  <Text style={styles.radioLabel}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>

        {/* Status Dialog */}
        <Dialog visible={statusDialogVisible} onDismiss={() => setStatusDialogVisible(false)}>
          <Dialog.Title>Select Status</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => {
                setFormData({ ...formData, status: value });
                setStatusDialogVisible(false);
              }}
              value={formData.status}
            >
              {statuses.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => {
                    setFormData({ ...formData, status: option.value });
                    setStatusDialogVisible(false);
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
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
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

