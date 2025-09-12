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

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
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
    
    console.log('🔍 Rendering notification:', {
      type: notification.type,
      metadata,
      hasCompanyName: !!metadata?.companyName,
      hasCreatorName: !!metadata?.creatorName,
      fullMetadata: metadata
    });
    
    // Handle company creation notifications
    if (notification.type === 'company_create' && metadata?.companyName && metadata?.creatorName) {
      console.log('✅ Rendering enhanced company notification with clickable elements');
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
      console.log('✅ Rendering enhanced job notification with clickable elements');
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
    
    // Default message for other notification types
    return <span>{message}</span>;
  };

  const navigateToUserProfile = (userId: string, userRole: string) => {
    console.log('🔍 Navigating to user profile:', { userId, userRole });
    
    // Get current user role to determine appropriate navigation
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserRole = currentUser?.role;
    
    console.log('🔍 Current user role:', currentUserRole);
    
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
        // Agent profile route doesn't exist, navigate to agent dashboard
        navigate(`/dashboard/agent-dashboard`);
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

