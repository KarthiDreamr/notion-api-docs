/**
 * Notion API Wrapper
 * Comprehensive client for the Notion API with error handling, retries, and rate limiting
 */

import axios from 'axios';

/**
 * NotionAPI class that handles all API interactions
 */
export class NotionAPI {
  constructor() {
    this.token = null;
    this.version = '2022-06-28';
    // Use proxy in development to avoid CORS issues, direct API in production
    this.baseURL = import.meta.env.DEV 
      ? '/api/notion/v1' 
      : 'https://api.notion.com/v1';
    this.retryAttempts = 3;
    this.retryDelay = 1000; // ms
    
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Setup request/response interceptors
    this.setupInterceptors();
  }

  /**
   * Set the API token
   */
  setToken(token) {
    this.token = token;
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
    this.client.defaults.headers['Notion-Version'] = this.version;
  }

  /**
   * Setup axios interceptors for request/response handling
   */
  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Format API errors into user-friendly messages
   */
  formatError(error) {
    if (!error.response) {
      // Log the full error for debugging
      console.error('Network error details:', error);
      
      // More specific error handling for different types of network issues
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return new Error('Request timeout: The API request took too long to complete');
      }
      if (error.message?.includes('ERR_CONNECTION_REFUSED')) {
        return new Error('Connection refused: Unable to reach the Notion API servers');
      }
      if (error.code === 'ERR_NETWORK') {
        // Check if we're in development vs production
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDev) {
          return new Error('CORS Error: Direct API requests from localhost are blocked. Please restart the dev server or deploy to a hosted domain.');
        } else {
          return new Error('Network Error: Unable to connect to Notion API. Please check your token and internet connection.');
        }
      }
      
      // Generic network error as fallback
      return new Error(`Connection error: ${error.message || 'Unable to connect to Notion API'}. Please check your API token and try again.`);
    }

    const { status, data } = error.response;
    
    // Handle specific error codes
    switch (status) {
      case 400:
        return new Error(`Bad Request: ${data?.message || 'Invalid request parameters'}`);
      case 401:
        return new Error('Authentication failed: Please check your API token');
      case 403:
        return new Error('Access denied: Insufficient permissions for this resource');
      case 404:
        return new Error('Resource not found: The requested item does not exist or is not accessible');
      case 409:
        return new Error(`Conflict: ${data?.message || 'Resource conflict'}`);
      case 429:
        return new Error('Rate limit exceeded: Please wait before making more requests');
      case 500:
      case 502:
      case 503:
      case 504:
        return new Error('Server error: Notion API is temporarily unavailable');
      default:
        return new Error(`API Error (${status}): ${data?.message || 'Unknown error occurred'}`);
    }
  }

  /**
   * Make a request with retry logic
   */
  async makeRequest(config, attempt = 1) {
    try {
      const response = await this.client(config);
      return response.data;
    } catch (error) {
      // Retry on specific errors
      if (
        attempt < this.retryAttempts && 
        (error.response?.status >= 500 || error.response?.status === 429)
      ) {
        console.warn(`⚠️ Retrying request (${attempt}/${this.retryAttempts}) after ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest(config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  /**
   * List all users in the workspace
   */
  async listUsers(startCursor = null, pageSize = 100) {
    const params = { page_size: pageSize };
    if (startCursor) params.start_cursor = startCursor;

    return this.makeRequest({
      method: 'GET',
      url: '/users',
      params
    });
  }

  /**
   * Retrieve a specific user by ID
   */
  async getUser(userId) {
    return this.makeRequest({
      method: 'GET',
      url: `/users/${userId}`
    });
  }

  /**
   * Get information about the bot user
   */
  async getBotUser() {
    return this.makeRequest({
      method: 'GET',
      url: '/users/me'
    });
  }

  // ============================================================================
  // DATABASE ENDPOINTS
  // ============================================================================

  /**
   * Retrieve a database by ID
   */
  async getDatabase(databaseId) {
    return this.makeRequest({
      method: 'GET',
      url: `/databases/${databaseId}`
    });
  }

  /**
   * Query a database with filters and sorting
   */
  async queryDatabase(databaseId, options = {}) {
    const {
      filter = null,
      sorts = null,
      startCursor = null,
      pageSize = 100
    } = options;

    const data = { page_size: pageSize };
    if (filter) data.filter = filter;
    if (sorts) data.sorts = sorts;
    if (startCursor) data.start_cursor = startCursor;

    return this.makeRequest({
      method: 'POST',
      url: `/databases/${databaseId}/query`,
      data
    });
  }

  /**
   * Create a new database
   */
  async createDatabase(parentPageId, title, properties, options = {}) {
    const data = {
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: title } }],
      properties,
      ...options
    };

    return this.makeRequest({
      method: 'POST',
      url: '/databases',
      data
    });
  }

  /**
   * Update a database
   */
  async updateDatabase(databaseId, updates) {
    return this.makeRequest({
      method: 'PATCH',
      url: `/databases/${databaseId}`,
      data: updates
    });
  }

  // ============================================================================
  // PAGE ENDPOINTS
  // ============================================================================

  /**
   * Retrieve a page by ID
   */
  async getPage(pageId) {
    return this.makeRequest({
      method: 'GET',
      url: `/pages/${pageId}`
    });
  }

  /**
   * Create a new page
   */
  async createPage(parent, properties, children = []) {
    const data = {
      parent,
      properties
    };
    
    if (children.length > 0) {
      data.children = children;
    }

    return this.makeRequest({
      method: 'POST',
      url: '/pages',
      data
    });
  }

  /**
   * Update page properties
   */
  async updatePage(pageId, properties, archived = null) {
    const data = { properties };
    if (archived !== null) data.archived = archived;

    return this.makeRequest({
      method: 'PATCH',
      url: `/pages/${pageId}`,
      data
    });
  }

  /**
   * Archive a page
   */
  async archivePage(pageId) {
    return this.updatePage(pageId, {}, true);
  }

  /**
   * Retrieve a page property item
   */
  async getPageProperty(pageId, propertyId, startCursor = null, pageSize = 25) {
    const params = { page_size: pageSize };
    if (startCursor) params.start_cursor = startCursor;

    return this.makeRequest({
      method: 'GET',
      url: `/pages/${pageId}/properties/${propertyId}`,
      params
    });
  }

  // ============================================================================
  // BLOCK ENDPOINTS
  // ============================================================================

  /**
   * Retrieve block children
   */
  async getBlockChildren(blockId, startCursor = null, pageSize = 100) {
    const params = { page_size: pageSize };
    if (startCursor) params.start_cursor = startCursor;

    return this.makeRequest({
      method: 'GET',
      url: `/blocks/${blockId}/children`,
      params
    });
  }

  /**
   * Append block children
   */
  async appendBlockChildren(blockId, children) {
    return this.makeRequest({
      method: 'PATCH',
      url: `/blocks/${blockId}/children`,
      data: { children }
    });
  }

  /**
   * Retrieve a block
   */
  async getBlock(blockId) {
    return this.makeRequest({
      method: 'GET',
      url: `/blocks/${blockId}`
    });
  }

  /**
   * Update a block
   */
  async updateBlock(blockId, updates) {
    return this.makeRequest({
      method: 'PATCH',
      url: `/blocks/${blockId}`,
      data: updates
    });
  }

  /**
   * Delete a block
   */
  async deleteBlock(blockId) {
    return this.makeRequest({
      method: 'DELETE',
      url: `/blocks/${blockId}`
    });
  }

  // ============================================================================
  // SEARCH ENDPOINT
  // ============================================================================

  /**
   * Search across the workspace
   */
  async search(query = '', options = {}) {
    const {
      filter = null,
      sort = null,
      startCursor = null,
      pageSize = 100
    } = options;

    const data = {
      page_size: pageSize
    };

    if (query) data.query = query;
    if (filter) data.filter = filter;
    if (sort) data.sort = sort;
    if (startCursor) data.start_cursor = startCursor;

    return this.makeRequest({
      method: 'POST',
      url: '/search',
      data
    });
  }

  // ============================================================================
  // COMMENT ENDPOINTS
  // ============================================================================

  /**
   * Retrieve comments for a page or discussion
   */
  async getComments(pageId, startCursor = null, pageSize = 100) {
    const data = {
      page_size: pageSize,
      page_id: pageId
    };
    
    if (startCursor) data.start_cursor = startCursor;

    return this.makeRequest({
      method: 'GET',
      url: '/comments',
      params: data
    });
  }

  /**
   * Create a comment
   */
  async createComment(pageId, richText, discussionId = null) {
    const data = {
      parent: { page_id: pageId },
      rich_text: richText
    };

    if (discussionId) {
      data.discussion_id = discussionId;
    }

    return this.makeRequest({
      method: 'POST',
      url: '/comments',
      data
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create rich text object from plain text
   */
  createRichText(text, options = {}) {
    return [{
      type: 'text',
      text: { content: text, link: options.link || null },
      annotations: {
        bold: options.bold || false,
        italic: options.italic || false,
        strikethrough: options.strikethrough || false,
        underline: options.underline || false,
        code: options.code || false,
        color: options.color || 'default'
      }
    }];
  }

  /**
   * Create a paragraph block
   */
  createParagraphBlock(text, options = {}) {
    return {
      type: 'paragraph',
      paragraph: {
        rich_text: Array.isArray(text) ? text : this.createRichText(text, options),
        color: options.color || 'default'
      }
    };
  }

  /**
   * Create a heading block
   */
  createHeadingBlock(text, level = 1, options = {}) {
    const headingType = `heading_${level}`;
    return {
      type: headingType,
      [headingType]: {
        rich_text: Array.isArray(text) ? text : this.createRichText(text, options),
        color: options.color || 'default',
        is_toggleable: options.toggleable || false
      }
    };
  }

  /**
   * Create a bulleted list item block
   */
  createBulletedListBlock(text, options = {}) {
    return {
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: Array.isArray(text) ? text : this.createRichText(text, options),
        color: options.color || 'default',
        children: options.children || []
      }
    };
  }

  /**
   * Create a code block
   */
  createCodeBlock(code, language = 'javascript') {
    return {
      type: 'code',
      code: {
        rich_text: this.createRichText(code),
        language: language,
        caption: []
      }
    };
  }

  /**
   * Create a callout block
   */
  createCalloutBlock(text, icon = '💡', options = {}) {
    return {
      type: 'callout',
      callout: {
        rich_text: Array.isArray(text) ? text : this.createRichText(text, options),
        icon: { type: 'emoji', emoji: icon },
        color: options.color || 'default'
      }
    };
  }

  /**
   * Extract plain text from rich text array
   */
  extractPlainText(richText) {
    if (!Array.isArray(richText)) return '';
    return richText.map(item => item.plain_text || item.text?.content || '').join('');
  }

  /**
   * Format database property value for display
   */
  formatPropertyValue(property) {
    if (!property) return '';

    switch (property.type) {
      case 'title':
        return this.extractPlainText(property.title);
      case 'rich_text':
        return this.extractPlainText(property.rich_text);
      case 'number':
        return property.number?.toString() || '';
      case 'select':
        return property.select?.name || '';
      case 'multi_select':
        return property.multi_select?.map(item => item.name).join(', ') || '';
      case 'date':
        if (!property.date) return '';
        const start = property.date.start;
        const end = property.date.end;
        return end ? `${start} → ${end}` : start;
      case 'checkbox':
        return property.checkbox ? '✓' : '✗';
      case 'url':
        return property.url || '';
      case 'email':
        return property.email || '';
      case 'phone_number':
        return property.phone_number || '';
      case 'people':
        return property.people?.map(person => person.name).join(', ') || '';
      case 'files':
        return property.files?.length > 0 ? `${property.files.length} file(s)` : '';
      case 'created_time':
      case 'last_edited_time':
        return new Date(property[property.type]).toLocaleString();
      case 'created_by':
      case 'last_edited_by':
        return property[property.type]?.name || '';
      case 'formula':
        return this.formatPropertyValue({ type: property.formula?.type, [property.formula?.type]: property.formula?.[property.formula?.type] });
      case 'relation':
        return property.relation?.length > 0 ? `${property.relation.length} relation(s)` : '';
      case 'rollup':
        return property.rollup?.array?.length > 0 ? `${property.rollup.array.length} item(s)` : '';
      default:
        return JSON.stringify(property);
    }
  }

  /**
   * Get workspace statistics
   */
  async getWorkspaceStats() {
    try {
      const [usersResult, searchResult] = await Promise.all([
        this.listUsers(),
        this.search()
      ]);

      const stats = {
        totalUsers: usersResult.results?.length || 0,
        totalPages: 0,
        totalDatabases: 0
      };

      // Count pages and databases
      searchResult.results?.forEach(item => {
        if (item.object === 'page') stats.totalPages++;
        if (item.object === 'database') stats.totalDatabases++;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get workspace stats:', error);
      return null;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      await this.getBotUser();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
} 