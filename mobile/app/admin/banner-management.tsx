/**
 * Banner Management Screen - Upload and manage ads
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { Text, Button, Dialog, Portal, TextInput, FAB, Chip, Switch, RadioButton } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { COLORS } from '@/constants/config';

export default function BannerManagementScreen() {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<'hr' | 'candidate'>('hr');
  const [uploadDialogVisible, setUploadDialogVisible] = useState(false);
  const [textAdDialogVisible, setTextAdDialogVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [textAdData, setTextAdData] = useState({
    title: '',
    subtitle: '',
    content: '',
    titleColor: '#000000',
    backgroundColor: '#ffffff',
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['banners', category],
    queryFn: () => apiClient.getBanners(category),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ uri, category }: any) => {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      const formData = new FormData();
      formData.append('media', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await fetch(`${apiClient['baseURL']}/api/v1/banners`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${await apiClient['token']}`,
        },
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setUploadDialogVisible(false);
      setSelectedImage(null);
      Alert.alert('Success', 'Banner uploaded successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to upload banner');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ bannerId, isActive }: any) =>
      apiClient.updateBannerStatus(bannerId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (bannerId: string) => apiClient.deleteBanner(bannerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      Alert.alert('Success', 'Banner deleted successfully');
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setUploadDialogVisible(true);
    }
  };

  const handleUpload = () => {
    if (!selectedImage) return;
    uploadMutation.mutate({ uri: selectedImage.uri, category });
  };

  const handleDelete = (banner: any) => {
    Alert.alert('Delete Banner', 'Are you sure you want to delete this banner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(banner._id),
      },
    ]);
  };

  const handleToggleStatus = (banner: any) => {
    updateStatusMutation.mutate({
      bannerId: banner._id,
      isActive: !banner.isActive,
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading banners..." />;
  }

  const banners = data?.data || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Post Ads
        </Text>
        <View style={styles.categorySelector}>
          <Chip
            selected={category === 'hr'}
            onPress={() => setCategory('hr')}
            style={styles.categoryChip}
          >
            HR Dashboard
          </Chip>
          <Chip
            selected={category === 'candidate'}
            onPress={() => setCategory('candidate')}
            style={styles.categoryChip}
          >
            Candidate Dashboard
          </Chip>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {category === 'hr' ? 'HR' : 'Candidate'} Banners ({banners.length})
        </Text>

        {banners.length === 0 ? (
          <EmptyState
            icon="image"
            title="No Banners"
            message="No banners uploaded yet"
            actionLabel="Upload Banner"
            onAction={pickImage}
          />
        ) : (
          banners.map((banner: any) => (
            <Card key={banner._id} style={styles.bannerCard}>
              {banner.mediaUrl && (
                <Image source={{ uri: banner.mediaUrl }} style={styles.bannerImage} />
              )}
              {banner.isTextBased && (
                <View style={styles.textBanner}>
                  <Text variant="titleLarge">{banner.title}</Text>
                  {banner.subtitle && <Text variant="titleSmall">{banner.subtitle}</Text>}
                  {banner.content && <Text variant="bodyMedium">{banner.content}</Text>}
                </View>
              )}
              <View style={styles.bannerInfo}>
                <View style={styles.bannerHeader}>
                  <Badge label={banner.isTextBased ? 'Text Ad' : 'Image'} />
                  <Badge
                    label={banner.isActive ? 'Active' : 'Inactive'}
                    type="status"
                  />
                </View>
                <View style={styles.bannerActions}>
                  <View style={styles.switchContainer}>
                    <Text variant="bodySmall">Active</Text>
                    <Switch
                      value={banner.isActive}
                      onValueChange={() => handleToggleStatus(banner)}
                    />
                  </View>
                  <Button
                    mode="outlined"
                    onPress={() => handleDelete(banner)}
                    textColor={COLORS.error}
                    compact
                  >
                    Delete
                  </Button>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <FAB
          icon="text"
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => setTextAdDialogVisible(true)}
          label="Text Ad"
          size="small"
        />
        <FAB
          icon="image"
          style={styles.fab}
          onPress={pickImage}
          label="Upload"
        />
      </View>

      {/* Upload Dialog */}
      <Portal>
        <Dialog visible={uploadDialogVisible} onDismiss={() => setUploadDialogVisible(false)}>
          <Dialog.Title>Upload Banner</Dialog.Title>
          <Dialog.Content>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
              />
            )}
            <Text variant="bodyMedium" style={styles.uploadInfo}>
              Uploading to: {category === 'hr' ? 'HR' : 'Candidate'} Dashboard
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUploadDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleUpload} loading={uploadMutation.isPending}>
              Upload
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Text Ad Dialog */}
        <Dialog
          visible={textAdDialogVisible}
          onDismiss={() => setTextAdDialogVisible(false)}
        >
          <Dialog.Title>Create Text Ad</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <TextInput
                label="Title *"
                value={textAdData.title}
                onChangeText={(text) =>
                  setTextAdData({ ...textAdData, title: text })
                }
                style={styles.input}
              />
              <TextInput
                label="Subtitle"
                value={textAdData.subtitle}
                onChangeText={(text) =>
                  setTextAdData({ ...textAdData, subtitle: text })
                }
                style={styles.input}
              />
              <TextInput
                label="Content"
                value={textAdData.content}
                onChangeText={(text) =>
                  setTextAdData({ ...textAdData, content: text })
                }
                style={styles.input}
                multiline
                numberOfLines={3}
              />
              <Text variant="labelMedium" style={styles.label}>
                Category
              </Text>
              <RadioButton.Group
                onValueChange={(value) => setCategory(value as 'hr' | 'candidate')}
                value={category}
              >
                <RadioButton.Item label="HR Dashboard" value="hr" />
                <RadioButton.Item label="Candidate Dashboard" value="candidate" />
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setTextAdDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={() => {
                if (!textAdData.title) {
                  Alert.alert('Error', 'Title is required');
                  return;
                }
                apiClient
                  .createTextAd({ ...textAdData, category })
                  .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['banners'] });
                    setTextAdDialogVisible(false);
                    setTextAdData({
                      title: '',
                      subtitle: '',
                      content: '',
                      titleColor: '#000000',
                      backgroundColor: '#ffffff',
                    });
                    Alert.alert('Success', 'Text ad created');
                  })
                  .catch(() => Alert.alert('Error', 'Failed to create text ad'));
              }}
            >
              Create
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
    padding: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bannerCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  textBanner: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  bannerInfo: {
    padding: 12,
  },
  bannerHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  bannerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 8,
  },
  fab: {
    backgroundColor: COLORS.primary,
    marginBottom: 8,
  },
  fabSecondary: {
    backgroundColor: COLORS.secondary,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  uploadInfo: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
  },
});

