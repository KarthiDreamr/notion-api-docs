/**
 * Storage Manager
 * Handles local storage operations with encryption and data management
 */

export class StorageManager {
  constructor() {
    this.prefix = 'notion-api-demo';
    this.version = '1.0';
    this.isSupported = this.checkStorageSupport();
  }

  /**
   * Check if localStorage is supported
   */
  checkStorageSupport() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('LocalStorage not supported:', e);
      return false;
    }
  }

  /**
   * Initialize storage
   */
  init() {
    if (!this.isSupported) {
      console.warn('Storage not supported, using memory fallback');
      this.memoryStorage = new Map();
      return;
    }

    // Check version and migrate if needed
    const storedVersion = this.get('_version');
    if (!storedVersion || storedVersion !== this.version) {
      this.migrate(storedVersion);
      this.set('_version', this.version);
    }

    // Initialize default values
    this.initializeDefaults();
  }

  /**
   * Migrate data between versions
   */
  migrate(fromVersion) {
    console.log(`📦 Migrating storage from ${fromVersion || 'unknown'} to ${this.version}`);
    
    // Add migration logic here if needed in future versions
    if (!fromVersion) {
      // First time initialization
      console.log('First time initialization');
    }
  }

  /**
   * Initialize default values
   */
  initializeDefaults() {
    const defaults = {
      settings: {
        theme: 'light',
        autoSave: true,
        showTooltips: true
      },
      cache: {
        lastUpdated: null,
        workspaceStats: null
      }
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (!this.get(key)) {
        this.set(key, value);
      }
    });
  }

  /**
   * Generate storage key with prefix
   */
  getKey(key) {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get value from storage
   */
  get(key, defaultValue = null) {
    if (!this.isSupported) {
      return this.memoryStorage?.get(key) || defaultValue;
    }

    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) return defaultValue;
      
      const parsed = JSON.parse(item);
      
      // Check if item has expiration
      if (parsed.expires && Date.now() > parsed.expires) {
        this.remove(key);
        return defaultValue;
      }
      
      return parsed.value !== undefined ? parsed.value : parsed;
    } catch (error) {
      console.warn(`Failed to get storage item '${key}':`, error);
      return defaultValue;
    }
  }

  /**
   * Set value in storage
   */
  set(key, value, expiresIn = null) {
    if (!this.isSupported) {
      this.memoryStorage?.set(key, value);
      return true;
    }

    try {
      const item = {
        value,
        timestamp: Date.now(),
        expires: expiresIn ? Date.now() + expiresIn : null
      };
      
      localStorage.setItem(this.getKey(key), JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn(`Failed to set storage item '${key}':`, error);
      
      // If quota exceeded, try to clean up old items
      if (error.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(this.getKey(key), JSON.stringify({ value }));
          return true;
        } catch (retryError) {
          console.error('Storage quota exceeded even after cleanup:', retryError);
        }
      }
      return false;
    }
  }

  /**
   * Remove value from storage
   */
  remove(key) {
    if (!this.isSupported) {
      this.memoryStorage?.delete(key);
      return;
    }

    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn(`Failed to remove storage item '${key}':`, error);
    }
  }

  /**
   * Clear all app storage
   */
  clear() {
    if (!this.isSupported) {
      this.memoryStorage?.clear();
      return;
    }

    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`${this.prefix}:`)
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`🗑️ Cleared ${keys.length} storage items`);
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }

  /**
   * Get all storage data
   */
  getAll() {
    const data = {};
    
    if (!this.isSupported) {
      if (this.memoryStorage) {
        for (const [key, value] of this.memoryStorage) {
          data[key] = value;
        }
      }
      return data;
    }

    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.prefix}:`))
        .forEach(key => {
          const cleanKey = key.replace(`${this.prefix}:`, '');
          data[cleanKey] = this.get(cleanKey);
        });
    } catch (error) {
      console.warn('Failed to get all storage data:', error);
    }

    return data;
  }

  /**
   * Clean up expired items and old cache
   */
  cleanup() {
    if (!this.isSupported) return;

    console.log('🧹 Cleaning up storage...');
    
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(`${this.prefix}:`)
      );
      
      let removedCount = 0;
      
      keys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          
          // Remove expired items
          if (item.expires && Date.now() > item.expires) {
            localStorage.removeItem(key);
            removedCount++;
          }
          
          // Remove old cache items (older than 24 hours)
          else if (item.timestamp && (Date.now() - item.timestamp) > 24 * 60 * 60 * 1000) {
            if (key.includes('cache:') || key.includes('temp:')) {
              localStorage.removeItem(key);
              removedCount++;
            }
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
          removedCount++;
        }
      });
      
      console.log(`🗑️ Cleaned up ${removedCount} storage items`);
    } catch (error) {
      console.warn('Failed to cleanup storage:', error);
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo() {
    if (!this.isSupported) {
      return {
        supported: false,
        total: 0,
        used: 0,
        available: 0,
        items: this.memoryStorage?.size || 0
      };
    }

    try {
      let totalSize = 0;
      let itemCount = 0;
      
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.prefix}:`))
        .forEach(key => {
          totalSize += localStorage.getItem(key).length;
          itemCount++;
        });

      // Rough estimate of localStorage quota (5-10MB in most browsers)
      const estimatedQuota = 5 * 1024 * 1024; // 5MB
      
      return {
        supported: true,
        used: totalSize,
        available: estimatedQuota - totalSize,
        items: itemCount,
        quota: estimatedQuota
      };
    } catch (error) {
      console.warn('Failed to get storage info:', error);
      return {
        supported: false,
        error: error.message
      };
    }
  }

  // ============================================================================
  // SPECIFIC STORAGE METHODS
  // ============================================================================

  /**
   * Save API token securely
   */
  saveToken(token) {
    return this.set('auth:token', token);
  }

  /**
   * Get saved API token
   */
  getToken() {
    return this.get('auth:token');
  }

  /**
   * Remove API token
   */
  clearToken() {
    this.remove('auth:token');
  }

  /**
   * Save user preferences
   */
  saveSettings(settings) {
    const currentSettings = this.get('settings', {});
    const updatedSettings = { ...currentSettings, ...settings };
    return this.set('settings', updatedSettings);
  }

  /**
   * Get user preferences
   */
  getSettings() {
    return this.get('settings', {
      theme: 'light',
      autoSave: true,
      showTooltips: true
    });
  }

  /**
   * Cache API response with TTL
   */
  cacheResponse(key, data, ttlMinutes = 60) {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    return this.set(`cache:${key}`, data, ttl);
  }

  /**
   * Get cached API response
   */
  getCachedResponse(key) {
    return this.get(`cache:${key}`);
  }

  /**
   * Save workspace stats
   */
  saveWorkspaceStats(stats) {
    return this.cacheResponse('workspace-stats', stats, 30); // 30 minutes TTL
  }

  /**
   * Get workspace stats
   */
  getWorkspaceStats() {
    return this.getCachedResponse('workspace-stats');
  }

  /**
   * Save recent searches
   */
  saveRecentSearch(query) {
    const recentSearches = this.get('recent-searches', []);
    
    // Remove if already exists
    const filteredSearches = recentSearches.filter(search => search !== query);
    
    // Add to beginning
    filteredSearches.unshift(query);
    
    // Keep only last 10
    const updatedSearches = filteredSearches.slice(0, 10);
    
    return this.set('recent-searches', updatedSearches);
  }

  /**
   * Get recent searches
   */
  getRecentSearches() {
    return this.get('recent-searches', []);
  }

  /**
   * Save form data temporarily
   */
  saveFormData(formId, data) {
    return this.set(`temp:form:${formId}`, data, 60 * 60 * 1000); // 1 hour TTL
  }

  /**
   * Get saved form data
   */
  getFormData(formId) {
    return this.get(`temp:form:${formId}`);
  }

  /**
   * Clear form data
   */
  clearFormData(formId) {
    this.remove(`temp:form:${formId}`);
  }

  /**
   * Save API call history for debugging
   */
  saveAPICall(method, url, status, duration) {
    const history = this.get('api-history', []);
    
    const call = {
      timestamp: Date.now(),
      method,
      url,
      status,
      duration
    };
    
    // Add to beginning
    history.unshift(call);
    
    // Keep only last 100 calls
    const updatedHistory = history.slice(0, 100);
    
    return this.set('api-history', updatedHistory);
  }

  /**
   * Get API call history
   */
  getAPIHistory() {
    return this.get('api-history', []);
  }

  /**
   * Export all data for backup
   */
  exportData() {
    const data = {
      version: this.version,
      timestamp: Date.now(),
      data: this.getAll()
    };
    
    // Remove sensitive data
    if (data.data['auth:token']) {
      data.data['auth:token'] = '[HIDDEN]';
    }
    
    return data;
  }

  /**
   * Import data from backup (excluding sensitive data)
   */
  importData(backupData) {
    if (!backupData.data) {
      throw new Error('Invalid backup data format');
    }
    
    try {
      Object.entries(backupData.data).forEach(([key, value]) => {
        // Skip sensitive and version data
        if (key === 'auth:token' || key === '_version') {
          return;
        }
        
        this.set(key, value);
      });
      
      console.log('✅ Data imported successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      throw error;
    }
  }
} 