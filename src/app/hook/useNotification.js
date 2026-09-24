// src/app/hook/useNotification.js
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '../api/notification';
import { supabase } from '@/utils/supabaseClient';

// Backed by Supabase now (notifications table + Realtime), replacing the old
// code360.pro + socket.io backend. Public interface (notifications,
// unreadCount, handleMarkRead, handleMarkAllRead, loading, refresh) is kept
// identical so NotificationBell didn't need a rewrite.
export const useNotification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef(null);

  // 1. Fetch notification history from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await notificationApi.getNotifications(user.id, user.role);
      setNotifications(data);
      setUnreadCount(data.filter((n) => n.status === 'unread').length);
    } catch (err) {
      console.error("Failed to load notification history:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  // 2. Realtime: listen for new rows inserted for this user, instead of the
  // old socket.io "join a room by email" pattern.
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new;
          const shaped = {
            _id: row.id,
            title:
              row.type === 'milestone_6month'
                ? '6-Month Probation Milestone'
                : row.type === 'milestone_1year'
                ? '1-Year Work Anniversary'
                : 'Notification',
            message: row.message,
            status: row.status,
            createdAt: row.created_at,
            link: user.role === 'SuperAdmin' ? '/super-admin/reports' : '/admin/reports',
          };
          setNotifications((prev) => [shaped, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.role]);

  // 3. Mark a single notification as Read
  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, status: 'read' } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // 4. Mark all notifications as Read
  const handleMarkAllRead = async () => {
    if (!user?.id) return;

    try {
      await notificationApi.markAllRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Initial load once the user is available
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    handleMarkRead,
    handleMarkAllRead,
    refresh: fetchNotifications,
  };
};
