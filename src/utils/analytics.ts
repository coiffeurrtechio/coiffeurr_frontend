/**
 * Analytics utility for user behavior tracking.
 * 
 * This module provides:
 * - Event tracking with automatic metadata
 * - Session management
 * - Batch processing with retry
 * - Device metadata extraction
 * - Error handling to prevent UI breakage
 * 
 * @module analytics
 */

// Types
export type EventType = 
  | 'page_view'
  | 'button_click'
  | 'link_click'
  | 'form_submit'
  | 'custom_event'
  | 'session_start'
  | 'session_end'
  | 'search'
  | 'login'
  | 'signup'
  | 'purchase'
  | 'booking'
  | 'error';

export interface DeviceMetadata {
  user_agent: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  screen_resolution: string;
  viewport_size: string;
  language: string;
  timezone: string;
  is_bot: boolean;
}

export interface TrackingEvent {
  event_type: EventType;
  page: string;
  session_id: string;
  user_id?: string;
  timestamp: string;
  metadata: DeviceMetadata;
  event_data?: Record<string, any>;
  ip_address?: string;
  referrer?: string;
}

export interface TrackingResponse {
  success: boolean;
  message: string;
  events_processed: number;
  batch_id?: string;
}

// Configuration
const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8000/api/v1/analytics/track';
const BATCH_SIZE = 10;
const BATCH_INTERVAL = 5000; // 5 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// State
let sessionId: string;
let userId: string | null = null;
let eventQueue: TrackingEvent[] = [];
let batchTimer: NodeJS.Timeout | null = null;
let isOnline = navigator.onLine;

// Initialize session
function initializeSession(): void {
  const storedSession = sessionStorage.getItem('analytics_session_id');
  if (storedSession) {
    sessionId = storedSession;
  } else {
    sessionId = generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
    trackEvent('session_start', { page: window.location.pathname });
  }
  
  // Get user ID from localStorage if available
  const storedUserId = localStorage.getItem('user_id');
  if (storedUserId) {
    userId = storedUserId;
  }
}

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Extract device metadata
function extractDeviceMetadata(): DeviceMetadata {
  const userAgent = navigator.userAgent;
  
  // Parse browser
  let browser = 'Unknown';
  let browserVersion = 'Unknown';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
    const match = userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }
  
  // Parse OS
  let os = 'Unknown';
  let osVersion = 'Unknown';
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  
  if (userAgent.includes('Windows')) {
    os = 'Windows';
    if (userAgent.includes('Windows NT 10.0')) osVersion = '10/11';
    else if (userAgent.includes('Windows NT 6.1')) osVersion = '7';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+[_\.]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    deviceType = 'mobile';
    const match = userAgent.match(/Android (\d+\.\d+)/);
    if (match) osVersion = match[1];
  } else if (userAgent.includes('iPhone')) {
    os = 'iOS';
    deviceType = 'mobile';
    const match = userAgent.match(/OS (\d+[_\.]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (userAgent.includes('iPad')) {
    os = 'iOS';
    deviceType = 'tablet';
    const match = userAgent.match(/OS (\d+[_\.]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }
  
  // Bot detection
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i, /curl/i, /wget/i,
    /python-requests/i, /java/i, /headless/i, /phantom/i,
    /selenium/i, /puppeteer/i, /playwright/i, /slurp/i,
    /googlebot/i, /bingbot/i, /yahoo/i, /baiduspider/i
  ];
  const isBot = botPatterns.some(pattern => pattern.test(userAgent));
  
  return {
    user_agent: userAgent,
    browser,
    browser_version: browserVersion,
    os,
    os_version: osVersion,
    device_type: deviceType,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    is_bot: isBot
  };
}

// Create tracking event
function createTrackingEvent(
  eventType: EventType,
  eventData?: Record<string, any>,
  page?: string
): TrackingEvent {
  // Get user details from localStorage if available
  const authState = localStorage.getItem('authState');
  let userDetails: Record<string, any> = {};
  let currentUserId = userId;
  
  if (authState) {
    try {
      const auth = JSON.parse(authState);
      if (auth.user) {
        // Use the user ID from auth state if available
        if (auth.user.id) {
          currentUserId = String(auth.user.id);
        } else if (auth.user._id) {
          currentUserId = String(auth.user._id);
        }
        
        userDetails = {
          user_name: auth.user.name || auth.user.username || '',
          user_email: auth.user.email || '',
          username: auth.user.username || '',
        };
        
        console.log('User details captured for analytics:', userDetails);
      }
    } catch (e) {
      console.error('Error parsing authState for analytics:', e);
    }
  }
  
  return {
    event_type: eventType,
    page: page || window.location.pathname,
    session_id: sessionId,
    user_id: currentUserId || undefined,
    timestamp: new Date().toISOString(),
    metadata: extractDeviceMetadata(),
    event_data: {
      ...eventData,
      ...userDetails,
    },
    referrer: document.referrer || undefined
  };
}

// Send event to backend
async function sendEvent(event: TrackingEvent): Promise<boolean> {
  try {
    const response = await fetch(`${ANALYTICS_API_URL}/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      keepalive: true // Send even if page is unloading
    });
    
    const result: TrackingResponse = await response.json();
    return result.success;
  } catch (error) {
    console.warn('Failed to send analytics event:', error);
    return false;
  }
}

// Send batch of events
async function sendBatch(events: TrackingEvent[]): Promise<boolean> {
  try {
    const response = await fetch(`${ANALYTICS_API_URL}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
      keepalive: true
    });
    
    const result: TrackingResponse = await response.json();
    return result.success;
  } catch (error) {
    console.warn('Failed to send analytics batch:', error);
    return false;
  }
}

// Retry mechanism
async function sendWithRetry(
  sendFn: () => Promise<boolean>,
  retries: number = MAX_RETRIES
): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    const success = await sendFn();
    if (success) return true;
    
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
    }
  }
  return false;
}

// Process event queue
async function processQueue(): Promise<void> {
  if (eventQueue.length === 0) return;
  
  const eventsToSend = eventQueue.splice(0, BATCH_SIZE);
  
  if (eventsToSend.length === 1) {
    await sendWithRetry(() => sendEvent(eventsToSend[0]));
  } else {
    await sendWithRetry(() => sendBatch(eventsToSend));
  }
  
  // Process remaining events if any
  if (eventQueue.length > 0) {
    batchTimer = setTimeout(processQueue, BATCH_INTERVAL);
  }
}

// Queue event
function queueEvent(event: TrackingEvent): void {
  eventQueue.push(event);
  
  // Process immediately if queue is full
  if (eventQueue.length >= BATCH_SIZE) {
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    processQueue();
  } else if (!batchTimer) {
    // Start batch timer
    batchTimer = setTimeout(processQueue, BATCH_INTERVAL);
  }
}

// Check if current page should be tracked (exclude admin/dashboard pages)
function shouldTrackPage(path: string): boolean {
  const excludedPaths = [
    '/dashboard',
    '/super-admin',
    '/salon-owner'
  ];
  
  return !excludedPaths.some(excluded => path.startsWith(excluded));
}

// Main tracking function
export function trackEvent(
  eventType: EventType,
  eventData?: Record<string, any>,
  page?: string
): void {
  const currentPage = page || window.location.pathname;
  
  // Skip tracking for admin/dashboard pages
  if (!shouldTrackPage(currentPage)) {
    return;
  }
  
  if (!isOnline) {
    // Queue event when offline
    eventQueue.push(createTrackingEvent(eventType, eventData, page));
    return;
  }
  
  // Check if bot
  const metadata = extractDeviceMetadata();
  if (metadata.is_bot) {
    return; // Don't track bots
  }
  
  const event = createTrackingEvent(eventType, eventData, page);
  queueEvent(event);
}

// Set user ID
export function setUserId(id: string): void {
  userId = id;
  localStorage.setItem('user_id', id);
}

// Clear user ID (on logout)
export function clearUserId(): void {
  userId = null;
  localStorage.removeItem('user_id');
}

// Flush all queued events immediately
export async function flushEvents(): Promise<void> {
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
  await processQueue();
}

// Track page view
export function trackPageView(path?: string): void {
  const currentPage = path || window.location.pathname;
  
  // Skip tracking for admin/dashboard pages
  if (!shouldTrackPage(currentPage)) {
    return;
  }
  
  trackEvent('page_view', { referrer: document.referrer }, path);
}

// Track button click
export function trackButtonClick(buttonId: string, additionalData?: Record<string, any>): void {
  trackEvent('button_click', { button_id: buttonId, ...additionalData });
}

// Track link click
export function trackLinkClick(linkUrl: string, linkText?: string): void {
  trackEvent('link_click', { link_url: linkUrl, link_text: linkText });
}

// Track form submit
export function trackFormSubmit(formId: string, additionalData?: Record<string, any>): void {
  trackEvent('form_submit', { form_id: formId, ...additionalData });
}

// Track custom event
export function trackCustomEvent(eventName: string, data?: Record<string, any>): void {
  trackEvent('custom_event', { event_name: eventName, ...data });
}

// Track search
export function trackSearch(query: string, resultsCount?: number): void {
  trackEvent('search', { query, results_count: resultsCount });
}

// Track error
export function trackError(error: Error, context?: Record<string, any>): void {
  trackEvent('error', {
    error_message: error.message,
    error_stack: error.stack,
    ...context
  });
}

// Initialize analytics on load
if (typeof window !== 'undefined') {
  initializeSession();
  
  // Track initial page view
  trackPageView();
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    isOnline = true;
    processQueue();
  });
  
  window.addEventListener('offline', () => {
    isOnline = false;
  });
  
  // Flush events before page unload
  window.addEventListener('beforeunload', () => {
    flushEvents();
  });
  
  // Track visibility changes (for session duration)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushEvents();
    }
  });
}

// Export for testing
export const __test__ = {
  generateSessionId,
  extractDeviceMetadata,
  createTrackingEvent,
  sendEvent,
  sendBatch,
  processQueue,
  queueEvent
};
