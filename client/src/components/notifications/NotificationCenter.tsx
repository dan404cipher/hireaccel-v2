import React from 'react';
import { format } from 'date-fns';
import { Check, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const candidateStatusLabels: Record<string, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview Scheduled',
  interviewed: 'Interviewed',
  offer_sent: 'Offer Sent',
  hired: 'Hired',
  rejected: 'Rejected',
};

const candidateStatusClasses: Record<string, string> = {
  new: 'bg-gray-100 text-gray-800',
  reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  interview_scheduled: 'bg-orange-100 text-orange-800',
  interviewed: 'bg-yellow-100 text-yellow-800',
  offer_sent: 'bg-indigo-100 text-indigo-800',
  hired: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const currentUserRole = currentUser?.role;
  const {
    notifications,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onOpenChange(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMore();
    }
  };

  const renderNotificationMessage = (notification: Notification) => {
    const { message, metadata } = notification;
    
    // Handle candidate status change notifications with role-specific messaging
    if (notification.type === 'candidate_status_change') {
      // Candidates should continue to see the original message from the backend
      if (currentUserRole === 'candidate') {
        return message;
      }

      const candidateName = metadata?.candidateName || 'candidate';
      const candidateRouteId = metadata?.candidateCustomId || metadata?.candidateId;
      const newStatusRaw = (metadata?.newStatus || '').toString().toLowerCase();
      const statusLabel =
        candidateStatusLabels[newStatusRaw] || (metadata?.newStatus || 'Updated');
      const statusClass =
        candidateStatusClasses[newStatusRaw] || 'bg-blue-100 text-blue-800';
      const jobTitle = metadata?.jobTitle;
      const jobRouteId = metadata?.jobCustomId || metadata?.jobId;

      const candidateLink = (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
          onClick={(e) => {
            e.stopPropagation();
            if (candidateRouteId) {
              navigate(`/dashboard/candidates/${candidateRouteId}`);
              onOpenChange(false);
            }
          }}
        >
          {candidateName}
        </span>
      );

      const statusBadge = (
        <span
          className={cn(
            'ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
            statusClass
          )}
        >
          {statusLabel}
        </span>
      );

      const jobLink = jobTitle ? (
        <>
          {' '}
          for{' '}
          <span
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (jobRouteId) {
                navigate(`/dashboard/jobs/${jobRouteId}`);
                onOpenChange(false);
              }
            }}
          >
            {jobTitle}
          </span>
        </>
      ) : null;

      if (currentUserRole === 'hr') {
        return (
          <div>
            You changed {candidateLink} to
            {statusBadge}
            {jobLink}.
          </div>
        );
      }

      return (
        <div>
          Candidate {candidateLink} status changed to
          {statusBadge}
          {jobLink}.
        </div>
      );
    }
    
    // Handle company creation notifications
    if (notification.type === 'company_create' && metadata?.companyName && metadata?.creatorName) {
      return (
        <div>
          A new company has been created:{' '}
          <span 
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/companies/${metadata.companyCustomId || notification.entityId}`);
            }}
          >
            {metadata.companyName}
          </span>
          {' '}by{' '}
          <span 
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigateToUserProfile(metadata.creatorCustomId || metadata.creatorId, metadata.creatorRole);
            }}
          >
            {metadata.creatorName}
          </span>
        </div>
      );
    }
    
    // Handle job creation notifications
    if (notification.type === 'job_create' && metadata?.jobTitle && metadata?.creatorName) {
      return (
        <div>
          A new job has been posted:{' '}
          <span 
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/dashboard/jobs/${metadata.jobCustomId || notification.entityId}`);
            }}
          >
            {metadata.jobTitle}
          </span>
          {' '}by{' '}
          <span 
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              navigateToUserProfile(metadata.creatorCustomId || metadata.creatorId, metadata.creatorRole);
            }}
          >
            {metadata.creatorName}
          </span>
        </div>
      );
    }

    if (notification.type === 'candidate_assign') {
      const jobTitle = metadata?.jobTitle || 'a new job';
      const companyName = metadata?.companyName;
      const jobId = metadata?.jobId || notification.entityId;

      return (
        <div>
          You have been assigned to{' '}
          <span
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (jobId) {
                navigate(`/dashboard/jobs/${jobId}`);
                onOpenChange(false);
              } else {
                navigate('/dashboard/candidate-applications');
                onOpenChange(false);
              }
            }}
          >
            {jobTitle}
          </span>
          {companyName ? ` at ${companyName}.` : '.'}
        </div>
      );
    }

    if (notification.type === 'candidate_status_change') {
      const jobTitle = metadata?.jobTitle || 'your application';
      const jobId = metadata?.jobId || notification.entityId;
      const statusKey = (metadata?.newStatus || '').toLowerCase();
      const statusLabel = candidateStatusLabels[statusKey] || metadata?.newStatus || 'updated';
      const statusClass = candidateStatusClasses[statusKey] || 'bg-gray-100 text-gray-800';

      return (
        <div className="flex flex-wrap items-center gap-1">
          <span>Your application for</span>
          <span
            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (jobId) {
                navigate(`/dashboard/jobs/${jobId}`);
                onOpenChange(false);
              } else {
                navigate('/dashboard/candidate-applications');
                onOpenChange(false);
              }
            }}
          >
            {jobTitle}
          </span>
          <span>is now</span>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
              statusClass
            )}
          >
            {statusLabel}
          </span>
          <span>.</span>
        </div>
      );
    }
    
    // Default message for other notification types
    return <span>{message}</span>;
  };

  const navigateToUserProfile = (userId: string, userRole: string) => {
    
    // Get current user role to determine appropriate navigation
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserRole = currentUser?.role;
    
    
    switch (userRole) {
      case 'admin':
        // Admin profile route doesn't have customId parameter, just navigate to admin profile
        navigate(`/dashboard/admin-profile`);
        break;
      case 'hr':
        // HR profile route has customId parameter - both HR and admin can access
        navigate(`/dashboard/hr-profile/${userId}`);
        break;
      case 'agent':
        // Agent profile route has customId parameter - both agent and admin can access
        navigate(`/dashboard/agent-profile/${userId}`);
        break;
      case 'candidate':
        // Use different routes based on current user role
        if (currentUserRole === 'candidate') {
          // Candidates use candidate-profile route
          navigate(`/dashboard/candidate-profile/${userId}`);
        } else {
          // Admin, HR, and agents use candidates route
          navigate(`/dashboard/candidates/${userId}`);
        }
        break;
      default:
        console.warn('Unknown user role for navigation:', userRole);
        navigate(`/dashboard`);
        break;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-sm"
            >
              Mark all as read
            </Button>
          </div>
        </SheetHeader>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-8rem)]" onScroll={handleScroll}>
          {notifications.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={cn(
                    'group relative rounded-lg border p-4 transition-colors hover:bg-accent',
                    !notification.isRead && 'bg-accent/50'
                  )}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {renderNotificationMessage(notification)}
                    </div>
                  </div>

                  <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => markAsRead(notification._id)}
                      >
                        <Check className="h-4 w-4" />
                        <span className="sr-only">Mark as read</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => archiveNotification(notification._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Archive</span>
                    </Button>
                  </div>

                  {notification.priority === 'high' && (
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-destructive" />
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}

              {!loading && hasMore && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => loadMore()}
                >
                  Load more
                </Button>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

