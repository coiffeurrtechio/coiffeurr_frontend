import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSalonApi } from '../API/Salon_Owner_API/SalonOwnerAPI';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

const NotificationCenter: React.FC = () => {
  const { t } = useTranslation();
  const { apiSalonRequest, apiSalonPost } = useSalonApi();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const previousUnreadCount = useRef(0);

  // Get user ID from auth state
  const getUserId = () => {
    const authData = localStorage.getItem("authState");
    if (!authData) return null;
    const parsed = JSON.parse(authData);
    return parsed?.user?.user?.id || parsed?.user?.id || parsed?.user?._id;
  };

  // Request notification permission and initialize audio
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestNotificationPermission();
  }, []);

  // Play notification sound when unread count increases
  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      // Play sound using Web Audio API
      const playNotificationSound = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (err) {
          console.log('Audio play failed:', err);
        }
      };
      
      playNotificationSound();
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Booking', {
          body: `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'booking-notification',
          requireInteraction: false
        });
      }
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const userId = getUserId();
      const res = await apiSalonRequest<NotificationListResponse>('/notifications/?limit=20&offset=0&unread_only=false', {
        headers: { "X-User-Id": userId || '' }
      });
      if (res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty state on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId?: string) => {
    try {
      const userId = getUserId();
      await apiSalonPost('/notifications/mark-read', {
        notificationIds: notificationId ? [notificationId] : null
      }, {
        headers: { "X-User-Id": userId || '' }
      });
      if (notificationId) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      const userId = getUserId();
      const res = await apiSalonRequest<{ deletedCount: number }>('/notifications/', {
        method: 'DELETE',
        headers: { "X-User-Id": userId || '' }
      });
      if (res.data) {
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'BOOKING_CANCELLED':
        return <X className="w-4 h-4 text-red-500" />;
      case 'BOOKING_RESCHEDULED':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C10.3431 2 9 3.34315 9 5V6C6.23858 6 4 8.23858 4 11V15L2 17V18H22V17L20 15V11C20 8.23858 17.7614 6 15 6V5C15 3.34315 13.6569 2 12 2Z" />
          <path d="M10 21C10 21.5523 10.4477 22 11 22H13C13.5523 22 14 21.5523 14 21" />
        </svg>;
    }
  };

  // Initial fetch and polling for new notifications
  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Custom Gold Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl transition-all"
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -5, 5, -5, 5, 0],
          transition: { duration: 0.4 }
        }}
        style={{ color: '#D4AF37' }}
      >
        {/* Custom Minimalist Bell SVG in Polished Gold */}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C10.3431 2 9 3.34315 9 5V6C6.23858 6 4 8.23858 4 11V15L2 17V18H22V17L20 15V11C20 8.23858 17.7614 6 15 6V5C15 3.34315 13.6569 2 12 2Z" />
          <path d="M10 21C10 21.5523 10.4477 22 11 22H13C13.5523 22 14 21.5523 14 21" />
        </svg>
        
        {/* Glowing Amber Dot for unread count */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, #FFB347, #FF8C00)',
                boxShadow: '0 0 8px rgba(255, 179, 71, 0.8), 0 0 16px rgba(255, 140, 0, 0.4)'
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              exit={{ scale: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel - Tech-Luxury Design */}
          <div className="absolute right-0 top-12 w-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 z-50 max-h-[500px] flex flex-col" style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>{t('common.notifications')}</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAsRead()}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                  >
                    {t('common.markAllRead')}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  {t('common.loading')}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  {t('common.noNotifications')}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-bold text-sm text-gray-800 truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100">
              <button 
                onClick={clearNotifications}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 py-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {t('common.clear')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
