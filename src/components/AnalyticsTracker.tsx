/**
 * Global click tracking component.
 * 
 * This component automatically tracks:
 * - Button clicks
 * - Link clicks
 * - Elements with data-analytics attributes
 * - Form submissions
 * 
 * Place this component in your App.tsx to enable global tracking.
 */

import React, { useEffect } from 'react';
import { trackButtonClick, trackLinkClick, trackFormSubmit, trackCustomEvent } from '../utils/analytics';

// Check if current page should be tracked (exclude admin/dashboard pages)
function shouldTrackPage(path: string): boolean {
  const excludedPaths = [
    '/dashboard',
    '/super-admin',
    '/salon-owner'
  ];
  
  return !excludedPaths.some(excluded => path.startsWith(excluded));
}

const AnalyticsTracker: React.FC = () => {
  useEffect(() => {
    // Handle click events globally
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Skip tracking for admin/dashboard pages
      if (!shouldTrackPage(window.location.pathname)) {
        return;
      }
      
      // Check if element should be tracked
      if (shouldTrackClick(target)) {
        const analyticsData = extractAnalyticsData(target);
        
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          const button = target.tagName === 'BUTTON' ? target : target.closest('button');
          const buttonId = button?.id || button?.getAttribute('data-analytics-id') || 'unknown';
          trackButtonClick(buttonId, analyticsData);
        } else if (target.tagName === 'A' || target.closest('a')) {
          const link = target.tagName === 'A' ? target : target.closest('a') as HTMLAnchorElement;
          trackLinkClick(link.href, link.textContent || undefined);
        } else if (target.hasAttribute('data-analytics')) {
          const eventType = target.getAttribute('data-analytics') || 'custom_event';
          trackCustomEvent(eventType, analyticsData);
        }
      }
    };

    // Handle form submissions globally
    const handleSubmit = (event: Event) => {
      const target = event.target as HTMLFormElement;
      const formId = target.id || target.getAttribute('data-analytics-id') || 'unknown';
      
      // Skip tracking for admin/dashboard pages
      if (!shouldTrackPage(window.location.pathname)) {
        return;
      }
      
      if (shouldTrackElement(target)) {
        const analyticsData = extractAnalyticsData(target);
        trackFormSubmit(formId, analyticsData);
      }
    };

    // Add event listeners
    document.addEventListener('click', handleClick, true); // Use capture phase
    document.addEventListener('submit', handleSubmit, true);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, []);

  return null; // This component doesn't render anything
};

// Helper function to check if element should be tracked
function shouldTrackClick(element: HTMLElement): boolean {
  // Skip if element or its parents have data-analytics-ignore
  if (element.closest('[data-analytics-ignore]')) {
    return false;
  }

  // Track buttons
  if (element.tagName === 'BUTTON' || element.closest('button')) {
    return true;
  }

  // Track links
  if (element.tagName === 'A' || element.closest('a')) {
    return true;
  }

  // Track elements with data-analytics attribute
  if (element.hasAttribute('data-analytics')) {
    return true;
  }

  // Track elements with data-track attribute
  if (element.hasAttribute('data-track')) {
    return true;
  }

  return false;
}

// Helper function to check if element should be tracked
function shouldTrackElement(element: HTMLElement): boolean {
  // Skip if element or its parents have data-analytics-ignore
  if (element.closest('[data-analytics-ignore]')) {
    return false;
  }

  // Track elements with data-analytics attribute
  if (element.hasAttribute('data-analytics')) {
    return true;
  }

  // Track elements with data-track attribute
  if (element.hasAttribute('data-track')) {
    return true;
  }

  return false;
}

// Extract analytics data from element attributes
function extractAnalyticsData(element: HTMLElement): Record<string, any> {
  const data: Record<string, any> = {};

  // Extract data-analytics-* attributes
  const attributes = element.attributes;
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.name.startsWith('data-analytics-')) {
      const key = attr.name.replace('data-analytics-', '');
      data[key] = attr.value;
    }
  }

  // Extract data-track-* attributes
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.name.startsWith('data-track-')) {
      const key = attr.name.replace('data-track-', '');
      data[key] = attr.value;
    }
  }

  return data;
}

export default AnalyticsTracker;
