/**
 * Centralized notification system for the extension
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showIcon?: boolean;
}

class NotificationManager {
  private container: HTMLElement | null = null;
  private notifications: Map<string, HTMLElement> = new Map();

  constructor() {
    this.createContainer();
  }

  private createContainer() {
    if (typeof document === 'undefined') return;

    this.container = document.createElement('div');
    this.container.id = 'jobmate-notifications';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Add styles for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .jobmate-notification {
        animation: slideInRight 0.3s ease;
        margin-bottom: 10px;
        pointer-events: auto;
      }
      .jobmate-notification.removing {
        animation: slideOutRight 0.3s ease;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.container);
  }

  public show(
    message: string, 
    type: NotificationType = 'info', 
    options: NotificationOptions = {}
  ): string {
    if (!this.container) {
      this.createContainer();
    }

    const {
      duration = 4000,
      position = 'top-right',
      showIcon = true
    } = options;

    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = this.createNotificationElement(message, type, showIcon);
    notification.id = id;
    
    this.notifications.set(id, notification);
    this.container?.appendChild(notification);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  public remove(id: string): void {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.classList.add('removing');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.notifications.delete(id);
    }, 300);
  }

  public clear(): void {
    this.notifications.forEach((_, id) => {
      this.remove(id);
    });
  }

  private createNotificationElement(
    message: string, 
    type: NotificationType, 
    showIcon: boolean
  ): HTMLElement {
    const notification = document.createElement('div');
    notification.className = 'jobmate-notification';
    
    const colors = {
      success: { bg: '#10b981', icon: '✓' },
      error: { bg: '#ef4444', icon: '✕' },
      warning: { bg: '#f59e0b', icon: '⚠' },
      info: { bg: '#3b82f6', icon: 'ℹ' }
    };

    const { bg, icon } = colors[type];

    notification.style.cssText = `
      background: ${bg};
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      word-wrap: break-word;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    if (showIcon) {
      const iconSpan = document.createElement('span');
      iconSpan.textContent = icon;
      iconSpan.style.cssText = `
        font-size: 16px;
        flex-shrink: 0;
      `;
      notification.appendChild(iconSpan);
    }

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);

    // Add click to dismiss
    notification.addEventListener('click', () => {
      this.remove(notification.id);
    });

    notification.style.cursor = 'pointer';

    return notification;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Export convenience functions
export const showNotification = (
  message: string, 
  type: NotificationType = 'info', 
  options?: NotificationOptions
): string => {
  return notificationManager.show(message, type, options);
};

export const removeNotification = (id: string): void => {
  notificationManager.remove(id);
};

export const clearNotifications = (): void => {
  notificationManager.clear();
};

// Export the manager for advanced usage
export { notificationManager };