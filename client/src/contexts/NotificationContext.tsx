import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { apiClient } from '@/services/api';

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any>;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  archiveNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('accessToken');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && token) {
      console.log('🔑 Attempting Socket.IO connection with token:', token ? 'Token exists' : 'No token');
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3002', {
        auth: { token },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to notification server');
        newSocket.emit('subscribe:notifications');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket.IO disconnected:', reason);
      });

      newSocket.on('notification:new', (notification: Notification) => {
        console.log('🔔 Received new notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.off('notification:new');
        newSocket.close();
      };
    }
  }, [user, token]);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  const fetchNotifications = async (pageToFetch = 0) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        offset: (pageToFetch * limit).toString(),
        limit: limit.toString(),
        includeArchived: 'false'
      });
      
      const response = await apiClient.get(`/api/v1/notifications?${queryParams}`);

      const responseData = (response.data || response) as any;
      const { notifications: newNotifications, hasMore: more } = responseData;

      setNotifications(prev => 
        pageToFetch === 0 ? newNotifications : [...prev, ...newNotifications]
      );
      setHasMore(more);
      setPage(pageToFetch);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/api/v1/notifications/unread');
      const responseData = (response.data || response) as any;
      setUnreadCount(responseData.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchNotifications(page + 1);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.put(`/api/v1/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/api/v1/notifications/read-all');
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  const archiveNotification = async (id: string) => {
    try {
      await apiClient.put(`/api/v1/notifications/${id}/archive`);
      setNotifications(prev =>
        prev.filter(notification => notification._id !== id)
      );
      if (!notifications.find(n => n._id === id)?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error archiving notification:', err);
      throw err;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        loadMore,
        hasMore,
        markAsRead,
        markAllAsRead,
        archiveNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

