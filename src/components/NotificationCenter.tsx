import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Clock, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSalonApi } from '../API/Salon_Owner_API/SalonOwnerAPI';
import { useApi } from '../API/SalonsAPIs/ALLSalonAPI';
import { useTranslation } from 'react-i18next';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: string;
}

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

interface NotificationCenterProps {
  userType?: 'salon' | 'customer';
  iconColor?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userType = 'salon', iconColor }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const salonApi = useSalonApi();
  const customerApi = useApi();
  
  // Use appropriate API based on user type
  const apiRequest = userType === 'salon' 
    ? salonApi.apiSalonRequest 
    : customerApi.apiRequest;
  const apiPost = userType === 'salon'
    ? salonApi.apiSalonPost
    : customerApi.apiPost;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastQueue, setToastQueue] = useState<ToastNotification[]>([]);
  const previousUnreadCount = useRef(0);
  const previousNotifications = useRef<Notification[]>([]);

  // Request notification permission and initialize audio
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestNotificationPermission();
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant chime sound - two tones
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.frequency.setValueAtTime(1109, audioContext.currentTime + 0.1); // C#6
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
    } catch (err) {
      console.log('Audio play failed:', err);
    }
  };

  // Remove toast from queue
  const removeToast = (toastId: string) => {
    setToastQueue(prev => prev.filter(t => t.id !== toastId));
  };

  // Detect new notifications and show toasts
  useEffect(() => {
    if (notifications.length > 0 && previousNotifications.current.length > 0) {
      // Find new notifications (not in previous list)
      const newNotifs = notifications.filter(
        n => !previousNotifications.current.some(pn => pn.id === n.id)
      );

      if (newNotifs.length > 0) {
        // Play sound for new notifications
        playNotificationSound();

        // Add toasts for each new notification
        const newToasts: ToastNotification[] = newNotifs.map(n => ({
          id: `toast-${n.id}-${Date.now()}`,
          title: n.title,
          message: n.message,
          type: n.type
        }));
        
        setToastQueue(prev => [...prev, ...newToasts]);

        // Auto-remove toasts after 5 seconds
        newToasts.forEach(toast => {
          setTimeout(() => removeToast(toast.id), 5000);
        });

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          newNotifs.forEach(n => {
            new Notification(n.title, {
              body: n.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `notif-${n.id}`,
              requireInteraction: false
            });
          });
        }
      }
    }
    
    previousNotifications.current = notifications;
    previousUnreadCount.current = unreadCount;
  }, [notifications, unreadCount]);

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      // JWT token in apiRequest already identifies the user
      // No need to send X-User-Id header - backend gets user from JWT
      const res = await apiRequest<NotificationListResponse>('/notifications/?limit=20&offset=0&unread_only=false');
      console.log('[NotificationCenter] API response:', res);
      console.log('[NotificationCenter] Response data:', res.data);
      
      if (res.status === 403) {
        setError('Authentication required');
        setNotifications([]);
        setUnreadCount(0);
        return;
      }
      
      if (res.data) {
        console.log('[NotificationCenter] Notifications count:', res.data.notifications?.length);
        console.log('[NotificationCenter] Unread count:', res.data.unreadCount);
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } else {
        console.log('[NotificationCenter] No data in response');
      }
    } catch (error) {
      console.error('[NotificationCenter] Error fetching notifications:', error);
      setError('Failed to load notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId?: string) => {
    try {
      // JWT token already identifies the user - no need for X-User-Id header
      await apiPost('/notifications/mark-read', {
        notificationIds: notificationId ? [notificationId] : null
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
      // JWT token already identifies the user - no need for X-User-Id header
      const res = await apiRequest<{ deletedCount: number }>('/notifications/', {
        method: 'DELETE'
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
    console.log('[NotificationCenter] Component mounted, fetching notifications...');
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // TEST: Add a test notification to verify UI is working
  const addTestNotification = () => {
    const testNotif: Notification = {
      id: `test-${Date.now()}`,
      type: 'SALON_NEW_BOOKING',
      title: 'New Booking Request!',
      message: 'Test customer has requested a booking for Haircut on 2026-04-30 at 14:30.',
      isRead: false,
      createdAt: new Date().toISOString(),
      data: { bookingId: 'TEST123', price: 500 }
    };
    setNotifications(prev => [testNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Trigger toast
    setToastQueue(prev => [...prev, {
      id: `toast-test-${Date.now()}`,
      title: testNotif.title,
      message: testNotif.message,
      type: testNotif.type
    }]);
    
    // Play sound
    playNotificationSound();
    
    // Auto-remove toast
    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => !t.id.includes('toast-test')));
    }, 5000);
  };

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
        style={{ color: iconColor || '#D4AF37' }}
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
          <div className="absolute right-0 top-10 w-64 sm:w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-50 max-h-[350px] flex flex-col" style={{ boxShadow: "rgba(0,0,0,0.15) 0 8px 32px" }}>
            {/* Header */}
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>{t('common.notifications')}</h3>
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
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  {t('common.loading')}
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 text-xs mb-1">{error}</p>
                  <button
                    onClick={fetchNotifications}
                    className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Retry
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-xs">
                  {t('common.noNotifications')}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        // Mark notification as read
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        // Navigate to booking page if bookingId exists
                        if (notification.data?.bookingId) {
                          const bookingPath = userType === 'salon' ? '/dashboard/booking' : '/bookings';
                          navigate(bookingPath);
                        }
                        // Close notification panel
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-gray-100 rounded-full flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="font-bold text-[11px] text-gray-800 truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-600 mb-0.5 line-clamp-2 leading-tight">
                            {notification.message}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold">
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
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={clearNotifications}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-700 py-1.5 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t('common.clear')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast Notifications - Popup alerts for new notifications */}
      <AnimatePresence>
        {toastQueue.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed top-20 right-3 z-[100] max-w-[280px] w-full sm:max-w-sm"
          >
            <div
              className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border-l-4 p-3 flex items-start gap-2.5 cursor-pointer hover:shadow-3xl transition-shadow"
              style={{
                borderLeftColor: toast.type.includes('CANCELLED') ? '#EF4444' :
                                toast.type.includes('CONFIRMED') ? '#10B981' :
                                toast.type.includes('RESCHEDULED') ? '#F59E0B' : '#D4AF37',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
              }}
              onClick={() => {
                setIsOpen(true);
                removeToast(toast.id);
              }}
            >
              <div
                className="p-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: toast.type.includes('CANCELLED') ? 'rgba(239, 68, 68, 0.1)' :
                                  toast.type.includes('CONFIRMED') ? 'rgba(16, 185, 129, 0.1)' :
                                  toast.type.includes('RESCHEDULED') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(212, 175, 55, 0.1)'
                }}
              >
                <Bell
                  className="w-4 h-4"
                  style={{
                    color: toast.type.includes('CANCELLED') ? '#EF4444' :
                           toast.type.includes('CONFIRMED') ? '#10B981' :
                           toast.type.includes('RESCHEDULED') ? '#F59E0B' : '#D4AF37'
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-gray-900 mb-0.5">{toast.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{toast.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
