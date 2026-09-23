// src/app/hook/useNotification.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import { notificationApi } from '../api/notification';

// Replace with your actual backend URL if different
const SOCKET_URL = 'https://code360.pro';
const socket = io(SOCKET_URL);

export const useNotification = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Notification History from MongoDB
  const fetchNotifications = useCallback(async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      // Calling the simplified API (No token passed)
      const data = await notificationApi.getNotifications(user.email);
      
      if (Array.isArray(data)) {
        setNotifications(data);
        const unread = data.filter(n => n.status === 'unread').length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("❌ Failed to load notification history:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  // 2. Real-time Socket.io Listener
  useEffect(() => {
    if (!user?.email) return;

    // Join the private room based on user email
    socket.emit('join_notification_room', user.email);
    console.log(`📡 Socket: Joined room ${user.email}`);

    // Listen for real-time events from the backend triggerNotification
    socket.on('new_notification', (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Optional: You could trigger a browser sound or toast here
      console.log("🔔 New Real-time Notification:", newNotif);
    });

    // Cleanup on unmount
    return () => {
      socket.off('new_notification');
      console.log("🔌 Socket: Disconnected from notification room");
    };
  }, [user?.email]);

  // 3. Mark a single notification as Read
  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, status: 'read' } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("❌ Failed to mark notification as read:", err);
    }
  };

  // 4. Mark all notifications as Read
  const handleMarkAllRead = async () => {
    if (!user?.email) return;
    
    try {
      await notificationApi.markAllRead(user.email);
      
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
      setUnreadCount(0);
    } catch (err) {
      console.error("❌ Failed to mark all as read:", err);
    }
  };

  // Initial load when user email becomes available
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    handleMarkRead,
    handleMarkAllRead,
    refresh: fetchNotifications
  };
};