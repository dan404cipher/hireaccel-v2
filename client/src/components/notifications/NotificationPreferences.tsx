import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { apiClient } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const notificationTypesSchema = z.object({
  user_signup: z.boolean(),
  user_update: z.boolean(),
  user_role_change: z.boolean(),
  user_status_change: z.boolean(),
  company_create: z.boolean(),
  company_update: z.boolean(),
  company_status_change: z.boolean(),
  job_create: z.boolean(),
  job_update: z.boolean(),
  job_status_change: z.boolean(),
  job_close: z.boolean(),
  candidate_assign: z.boolean(),
  candidate_status_change: z.boolean(),
  candidate_document_upload: z.boolean(),
  candidate_profile_update: z.boolean(),
  hr_assign: z.boolean(),
  agent_assign: z.boolean(),
  role_reassign: z.boolean(),
  interview_schedule: z.boolean(),
  interview_update: z.boolean(),
  interview_cancel: z.boolean(),
  system_maintenance: z.boolean(),
  system_update: z.boolean(),
});

const channelPreferencesSchema = z.object({
  in_app: z.boolean(),
  email: z.boolean(),
  push: z.boolean(),
});

const formSchema = z.object({
  channelPreferences: channelPreferencesSchema,
  typePreferences: notificationTypesSchema,
});

type FormValues = z.infer<typeof formSchema>;

const notificationGroups = [
  {
    title: 'User Notifications',
    description: 'Notifications about user account activities',
    types: [
      { key: 'user_signup', label: 'New User Signup' },
      { key: 'user_update', label: 'User Profile Updates' },
      { key: 'user_role_change', label: 'User Role Changes' },
      { key: 'user_status_change', label: 'User Status Changes' },
    ],
  },
  {
    title: 'Company Notifications',
    description: 'Notifications about company-related activities',
    types: [
      { key: 'company_create', label: 'New Company Creation' },
      { key: 'company_update', label: 'Company Updates' },
      { key: 'company_status_change', label: 'Company Status Changes' },
    ],
  },
  {
    title: 'Job Notifications',
    description: 'Notifications about job postings and updates',
    types: [
      { key: 'job_create', label: 'New Job Postings' },
      { key: 'job_update', label: 'Job Updates' },
      { key: 'job_status_change', label: 'Job Status Changes' },
      { key: 'job_close', label: 'Job Closures' },
    ],
  },
  {
    title: 'Candidate Notifications',
    description: 'Notifications about candidate activities',
    types: [
      { key: 'candidate_assign', label: 'Candidate Assignments' },
      { key: 'candidate_status_change', label: 'Candidate Status Updates' },
      { key: 'candidate_document_upload', label: 'Document Uploads' },
      { key: 'candidate_profile_update', label: 'Profile Updates' },
    ],
  },
  {
    title: 'HR/Agent Notifications',
    description: 'Notifications about HR and Agent activities',
    types: [
      { key: 'hr_assign', label: 'HR Assignments' },
      { key: 'agent_assign', label: 'Agent Assignments' },
      { key: 'role_reassign', label: 'Role Reassignments' },
    ],
  },
  {
    title: 'Interview Notifications',
    description: 'Notifications about interview scheduling and updates',
    types: [
      { key: 'interview_schedule', label: 'Interview Scheduling' },
      { key: 'interview_update', label: 'Interview Updates' },
      { key: 'interview_cancel', label: 'Interview Cancellations' },
    ],
  },
  {
    title: 'System Notifications',
    description: 'System-wide notifications and updates',
    types: [
      { key: 'system_maintenance', label: 'System Maintenance' },
      { key: 'system_update', label: 'System Updates' },
    ],
  },
];

export const NotificationPreferences: React.FC = () => {
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channelPreferences: {
        in_app: true,
        email: true,
        push: true,
      },
      typePreferences: {
        user_signup: true,
        user_update: true,
        user_role_change: true,
        user_status_change: true,
        company_create: true,
        company_update: true,
        company_status_change: true,
        job_create: true,
        job_update: true,
        job_status_change: true,
        job_close: true,
        candidate_assign: true,
        candidate_status_change: true,
        candidate_document_upload: true,
        candidate_profile_update: true,
        hr_assign: true,
        agent_assign: true,
        role_reassign: true,
        interview_schedule: true,
        interview_update: true,
        interview_cancel: true,
        system_maintenance: true,
        system_update: true,
      },
    },
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await apiClient.get('/api/v1/notifications/preferences');
        form.reset(response.data);
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [form]);

  const onSubmit = async (data: FormValues) => {
    try {
      await apiClient.put('/api/v1/notifications/preferences', data);
      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully',
      });
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="channelPreferences.in_app"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <div>
                    <FormLabel>In-App Notifications</FormLabel>
                    <FormDescription>
                      Receive notifications within the application
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channelPreferences.email"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <div>
                    <FormLabel>Email Notifications</FormLabel>
                    <FormDescription>
                      Receive notifications via email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="channelPreferences.push"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <div>
                    <FormLabel>Push Notifications</FormLabel>
                    <FormDescription>
                      Receive push notifications on your device
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {notificationGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.types.map((type) => (
                <FormField
                  key={type.key}
                  control={form.control}
                  name={`typePreferences.${type.key}` as any}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <FormLabel>{type.label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button type="submit">Save Preferences</Button>
        </div>
      </form>
    </Form>
  );
};

