/**
 * Notion API Demo - Main Entry Point
 * A comprehensive Vite + Vanilla JavaScript frontend for the Notion API
 */

import './styles/main.css';
import { NotionAPI } from './utils/api.js';
import { UIManager } from './components/UIManager.js';
import { ToastManager } from './components/ToastManager.js';
import { StorageManager } from './utils/storage.js';

/**
 * Application class that orchestrates the entire demo
 */
class NotionAPIDemo {
  constructor() {
    this.api = new NotionAPI();
    this.ui = new UIManager();
    this.toast = new ToastManager();
    this.storage = new StorageManager();
    this.currentTab = 'users';
    this.isInitialized = false;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Notion API Demo...');
      
      // Show loading screen
      this.showLoadingScreen();
      
      // Initialize storage
      this.storage.init();
      
      // Load saved token if exists
      const savedToken = this.storage.getToken();
      if (savedToken) {
        this.api.setToken(savedToken);
        this.hideTokenSetup();
        this.updateConnectionStatus(true);
      }
      
      // Initialize UI components
      await this.ui.init();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize the current tab
      await this.loadTab(this.currentTab);
      
      // Hide loading screen and show app
      this.hideLoadingScreen();
      
      this.isInitialized = true;
      
      // Show welcome message
      this.toast.show('Welcome to Notion API Demo! 🎉', 'success');
      
      console.log('✅ Notion API Demo initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Notion API Demo:', error);
      this.toast.show('Failed to initialize application: ' + error.message, 'error');
      this.hideLoadingScreen();
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Token setup
    const tokenInput = document.getElementById('token-input');
    const saveTokenBtn = document.getElementById('save-token-btn');
    
    saveTokenBtn?.addEventListener('click', () => this.handleTokenSave());
    tokenInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleTokenSave();
    });

    // Tab navigation
    const tabs = document.querySelectorAll('.api-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn?.addEventListener('click', () => this.showSettingsModal());

    // Global error handling
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.toast.show('An unexpected error occurred: ' + event.reason.message, 'error');
    });

    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.toast.show('An unexpected error occurred: ' + event.error.message, 'error');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus token input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        tokenInput?.focus();
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        this.ui.closeModal();
      }
    });
  }

  /**
   * Handle token save action
   */
  async handleTokenSave() {
    const tokenInput = document.getElementById('token-input');
    const token = tokenInput?.value?.trim();
    
    if (!token) {
      this.toast.show('Please enter a valid Notion API token', 'warning');
      return;
    }

    if (!token.startsWith('secret_') && !token.startsWith('ntn_')) {
      this.toast.show('Notion API tokens should start with "secret_" or "ntn_"', 'warning');
      return;
    }

    try {
      // Show loading state
      const saveBtn = document.getElementById('save-token-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Validating...';
      saveBtn.disabled = true;

      // Set token and validate
      this.api.setToken(token);
      
      // Test the token by fetching bot user info
      await this.api.getBotUser();
      
      // Save token and update UI
      this.storage.saveToken(token);
      this.hideTokenSetup();
      this.updateConnectionStatus(true);
      
      // Clear input
      tokenInput.value = '';
      
      this.toast.show('Token saved and validated successfully! 🎉', 'success');
      
      // Reload current tab to show data
      await this.loadTab(this.currentTab);
      
    } catch (error) {
      console.error('Token validation failed:', error);
      this.toast.show('Invalid token: ' + error.message, 'error');
      this.updateConnectionStatus(false);
    } finally {
      // Reset button state
      const saveBtn = document.getElementById('save-token-btn');
      saveBtn.textContent = 'Save Token';
      saveBtn.disabled = false;
    }
  }

  /**
   * Switch to a different tab
   */
  async switchTab(tabName) {
    if (this.currentTab === tabName) return;
    
    // Update tab UI
    const tabs = document.querySelectorAll('.api-tab');
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('border-notion-500', 'text-notion-600');
        tab.classList.remove('border-transparent', 'text-gray-500');
      } else {
        tab.classList.remove('border-notion-500', 'text-notion-600');
        tab.classList.add('border-transparent', 'text-gray-500');
      }
    });
    
    this.currentTab = tabName;
    await this.loadTab(tabName);
  }

  /**
   * Load content for a specific tab
   */
  async loadTab(tabName) {
    try {
      const tabContent = document.getElementById('tab-content');
      if (!tabContent) return;
      
      // Show loading state
      tabContent.innerHTML = `
        <div class="flex items-center justify-center py-12">
          <div class="text-center">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-notion-600 border-r-transparent"></div>
            <p class="mt-4 text-gray-600">Loading ${tabName} interface...</p>
          </div>
        </div>
      `;
      
      // Load the appropriate component
      await this.ui.loadTabContent(tabName, this.api);
      
    } catch (error) {
      console.error(`Failed to load ${tabName} tab:`, error);
      this.toast.show(`Failed to load ${tabName}: ${error.message}`, 'error');
    }
  }

  /**
   * Show/hide loading screen
   */
  showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    loadingScreen?.classList.remove('hidden');
    app?.classList.add('hidden');
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');
    
    loadingScreen?.classList.add('hidden');
    app?.classList.remove('hidden');
  }

  /**
   * Show/hide token setup banner
   */
  hideTokenSetup() {
    const tokenSetup = document.getElementById('token-setup');
    tokenSetup?.classList.add('hidden');
  }

  showTokenSetup() {
    const tokenSetup = document.getElementById('token-setup');
    tokenSetup?.classList.remove('hidden');
  }

  /**
   * Update connection status indicator
   */
  updateConnectionStatus(isConnected) {
    const statusIndicator = document.querySelector('#connection-status div');
    const statusText = document.querySelector('#connection-status span');
    
    if (isConnected) {
      statusIndicator?.classList.remove('bg-red-500');
      statusIndicator?.classList.add('bg-green-500');
      if (statusText) statusText.textContent = 'Connected';
    } else {
      statusIndicator?.classList.remove('bg-green-500');
      statusIndicator?.classList.add('bg-red-500');
      if (statusText) statusText.textContent = 'Disconnected';
    }
  }

  /**
   * Show settings modal
   */
  showSettingsModal() {
    const modalContent = `
      <div class="modal-panel">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Settings</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              API Token
            </label>
            <div class="flex space-x-2">
              <input
                type="password"
                id="settings-token"
                placeholder="secret_xxxxx... or ntn_xxxxx..."
                value="${this.storage.getToken() || ''}"
                class="form-input flex-1"
              />
              <button
                id="update-token-btn"
                class="btn-primary"
              >
                Update
              </button>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Actions
            </label>
            <div class="flex space-x-2">
              <button id="clear-storage-btn" class="btn-danger">
                Clear All Data
              </button>
              <button id="export-logs-btn" class="btn-secondary">
                Export Logs
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-6 flex justify-end space-x-3">
          <button id="close-settings-btn" class="btn-secondary">
            Close
          </button>
        </div>
      </div>
    `;
    
    this.ui.showModal(modalContent, () => {
      // Setup modal event listeners
      document.getElementById('update-token-btn')?.addEventListener('click', () => {
        const token = document.getElementById('settings-token')?.value;
        if (token) {
          document.getElementById('token-input').value = token;
          this.handleTokenSave();
          this.ui.closeModal();
        }
      });
      
      document.getElementById('clear-storage-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all stored data?')) {
          this.storage.clear();
          this.toast.show('All data cleared', 'info');
          window.location.reload();
        }
      });
      
      document.getElementById('export-logs-btn')?.addEventListener('click', () => {
        // Export console logs or app state
        this.exportAppState();
      });
      
      document.getElementById('close-settings-btn')?.addEventListener('click', () => {
        this.ui.closeModal();
      });
    });
  }

  /**
   * Export application state for debugging
   */
  exportAppState() {
    const state = {
      timestamp: new Date().toISOString(),
      version: __APP_VERSION__,
      currentTab: this.currentTab,
      hasToken: !!this.storage.getToken(),
      isInitialized: this.isInitialized,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notion-api-demo-state-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    this.toast.show('App state exported successfully', 'success');
  }
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Create global app instance
  window.notionApiDemo = new NotionAPIDemo();
  
  // Initialize the app
  await window.notionApiDemo.init();
  
  // Add development helpers in non-production environments
  if (import.meta.env.DEV) {
    console.log('🔧 Development mode enabled');
    console.log('App instance available at window.notionApiDemo');
    
    // Expose utilities for debugging
    window.debugUtils = {
      clearStorage: () => window.notionApiDemo.storage.clear(),
      getStorage: () => window.notionApiDemo.storage.getAll(),
      showToast: (msg, type) => window.notionApiDemo.toast.show(msg, type),
      api: window.notionApiDemo.api
    };
  }
}); 