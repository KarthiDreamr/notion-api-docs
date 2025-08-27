/**
 * Toast Manager
 * Handles toast notifications with different types and animations
 */

export class ToastManager {
  constructor() {
    this.toasts = new Map();
    this.defaultDuration = 5000; // 5 seconds
    this.maxToasts = 5;
    this.container = null;
    this.init();
  }

  /**
   * Initialize the toast manager
   */
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      console.warn('Toast container not found, creating one...');
      this.createContainer();
    }
  }

  /**
   * Create toast container if it doesn't exist
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed bottom-4 right-4 z-50 space-y-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)]';
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast notification
   */
  show(message, type = 'info', options = {}) {
    const {
      duration = this.defaultDuration,
      persistent = false,
      actions = [],
      title = null
    } = options;

    // Limit number of toasts
    if (this.toasts.size >= this.maxToasts) {
      this.removeOldest();
    }

    const toastId = this.generateId();
    const toast = this.createToast(toastId, message, type, { title, actions, persistent });

    this.toasts.set(toastId, {
      element: toast,
      type,
      timestamp: Date.now(),
      persistent
    });

    this.container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('animate-fade-in');
    });

    // Auto-remove if not persistent
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.hide(toastId);
      }, duration);
    }

    return toastId;
  }

  /**
   * Create toast element
   */
  createToast(id, message, type, options) {
    const toast = document.createElement('div');
    toast.id = `toast-${id}`;
    toast.className = `toast ${type}`;

    const icon = this.getIcon(type);
    const color = this.getColor(type);

    toast.innerHTML = `
      <div class="p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            ${icon}
          </div>
          <div class="ml-3 flex-1 min-w-0">
            ${options.title ? `
              <p class="text-sm font-medium text-gray-900 break-words">
                ${this.escapeHtml(options.title)}
              </p>
            ` : ''}
            <p class="${options.title ? 'mt-1' : ''} text-sm text-gray-500 break-words">
              ${this.escapeHtml(message)}
            </p>
            ${options.actions && options.actions.length > 0 ? `
              <div class="mt-3 flex space-x-2">
                ${options.actions.map(action => `
                  <button
                    type="button"
                    class="btn-secondary text-xs py-1 px-2"
                    onclick="window.toastAction('${id}', '${action.key}')"
                  >
                    ${this.escapeHtml(action.label)}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              class="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onclick="window.notionApiDemo.toast.hide('${id}')"
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Store action callbacks
    if (options.actions) {
      window.toastAction = (toastId, actionKey) => {
        const action = options.actions.find(a => a.key === actionKey);
        if (action && action.callback) {
          action.callback();
        }
        this.hide(toastId);
      };
    }

    return toast;
  }

  /**
   * Hide a toast notification
   */
  hide(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    const element = toast.element;
    
    // Animate out
    element.style.animation = 'toast-exit 0.3s ease-out forwards';
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  /**
   * Remove the oldest toast
   */
  removeOldest() {
    let oldestId = null;
    let oldestTime = Date.now();

    for (const [id, toast] of this.toasts) {
      if (toast.timestamp < oldestTime && !toast.persistent) {
        oldestTime = toast.timestamp;
        oldestId = id;
      }
    }

    if (oldestId) {
      this.hide(oldestId);
    }
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    for (const [id] of this.toasts) {
      this.hide(id);
    }
  }

  /**
   * Get icon for toast type
   */
  getIcon(type) {
    const icons = {
      success: `
        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
      `,
      error: `
        <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
      `,
      warning: `
        <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
      `,
      info: `
        <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
      `
    };

    return icons[type] || icons.info;
  }

  /**
   * Get color scheme for toast type
   */
  getColor(type) {
    const colors = {
      success: 'green',
      error: 'red',
      warning: 'yellow',
      info: 'blue'
    };

    return colors[type] || colors.info;
  }

  /**
   * Generate unique ID for toasts
   */
  generateId() {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  /**
   * Show success toast
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  /**
   * Show error toast
   */
  error(message, options = {}) {
    return this.show(message, 'error', { 
      duration: 8000, // Longer duration for errors
      ...options 
    });
  }

  /**
   * Show warning toast
   */
  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  /**
   * Show info toast
   */
  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Show loading toast
   */
  loading(message, options = {}) {
    return this.show(message, 'info', {
      persistent: true,
      title: 'Loading...',
      ...options
    });
  }

  /**
   * Show API error toast with retry option
   */
  apiError(message, retryCallback, options = {}) {
    const actions = retryCallback ? [{
      key: 'retry',
      label: 'Retry',
      callback: retryCallback
    }] : [];

    return this.show(message, 'error', {
      title: 'API Error',
      actions,
      duration: 10000,
      ...options
    });
  }

  /**
   * Show confirmation toast with actions
   */
  confirm(message, onConfirm, onCancel = null, options = {}) {
    const actions = [
      {
        key: 'confirm',
        label: 'Confirm',
        callback: onConfirm
      }
    ];

    if (onCancel) {
      actions.push({
        key: 'cancel',
        label: 'Cancel',
        callback: onCancel
      });
    }

    return this.show(message, 'warning', {
      title: 'Confirm Action',
      actions,
      persistent: true,
      ...options
    });
  }

  /**
   * Show progress toast (updates existing toast)
   */
  progress(message, progress = 0, toastId = null) {
    if (toastId && this.toasts.has(toastId)) {
      // Update existing toast
      const toast = this.toasts.get(toastId);
      const messageElement = toast.element.querySelector('.text-gray-500');
      if (messageElement) {
        messageElement.textContent = `${message} (${Math.round(progress)}%)`;
      }
      return toastId;
    } else {
      // Create new progress toast
      return this.show(`${message} (${Math.round(progress)}%)`, 'info', {
        persistent: true,
        title: 'Progress'
      });
    }
  }

  /**
   * Show code snippet toast
   */
  code(code, language = 'javascript', options = {}) {
    const formattedCode = `<pre class="code-block"><code>${this.escapeHtml(code)}</code></pre>`;
    
    return this.show(formattedCode, 'info', {
      title: `${language.toUpperCase()} Code`,
      duration: 15000, // Longer duration for code
      ...options
    });
  }

  /**
   * Show JSON data toast
   */
  json(data, title = 'JSON Data', options = {}) {
    const jsonString = JSON.stringify(data, null, 2);
    
    return this.show(
      `<pre class="json-viewer text-xs max-h-32 overflow-auto">${this.escapeHtml(jsonString)}</pre>`,
      'info',
      {
        title,
        duration: 15000,
        ...options
      }
    );
  }

  /**
   * Get active toast count
   */
  getActiveCount() {
    return this.toasts.size;
  }

  /**
   * Get all active toasts
   */
  getActiveToasts() {
    return Array.from(this.toasts.entries()).map(([id, toast]) => ({
      id,
      type: toast.type,
      timestamp: toast.timestamp,
      persistent: toast.persistent
    }));
  }
} 