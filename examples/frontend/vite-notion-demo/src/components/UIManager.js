/**
 * UI Manager
 * Manages all UI components and tab interfaces for the Notion API demo
 */

export class UIManager {
  constructor() {
    this.currentTab = null;
    this.modalContainer = null;
    this.tabContent = null;
  }

  /**
   * Initialize the UI manager
   */
  async init() {
    this.tabContent = document.getElementById('tab-content');
    this.modalContainer = document.getElementById('modal-container');
    
    if (!this.tabContent) {
      throw new Error('Tab content container not found');
    }
  }

  /**
   * Load content for a specific tab
   */
  async loadTabContent(tabName, api) {
    this.currentTab = tabName;
    
    switch (tabName) {
      case 'users':
        await this.renderUsersTab(api);
        break;
      case 'databases':
        await this.renderDatabasesTab(api);
        break;
      case 'pages':
        await this.renderPagesTab(api);
        break;
      case 'blocks':
        await this.renderBlocksTab(api);
        break;
      case 'search':
        await this.renderSearchTab(api);
        break;
      case 'comments':
        await this.renderCommentsTab(api);
        break;
      default:
        this.renderErrorTab(`Unknown tab: ${tabName}`);
    }
  }

  /**
   * Render Users tab interface
   */
  async renderUsersTab(api) {
    const content = `
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Users API</h2>
          <p class="mt-2 text-gray-600">Interact with users in your Notion workspace</p>
        </div>

        <!-- Actions Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- List Users -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">List All Users</h3>
            <p class="text-sm text-gray-600 mb-4">Get all users in the workspace</p>
            <button id="list-users-btn" class="btn-primary w-full">
              List Users
            </button>
          </div>

          <!-- Get Bot User -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Bot User Info</h3>
            <p class="text-sm text-gray-600 mb-4">Get information about your integration's bot user</p>
            <button id="get-bot-user-btn" class="btn-primary w-full">
              Get Bot User
            </button>
          </div>

          <!-- Get Specific User -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Get User by ID</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="user-id-input"
                placeholder="User ID (e.g., 6794760a-1f15-45cd-9c65-0dfe42f5135a)"
                class="form-input w-full"
              />
              <button id="get-user-btn" class="btn-primary w-full">
                Get User
              </button>
            </div>
          </div>

          <!-- Workspace Stats -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Workspace Statistics</h3>
            <p class="text-sm text-gray-600 mb-4">Get overview statistics for your workspace</p>
            <button id="workspace-stats-btn" class="btn-primary w-full">
              Get Stats
            </button>
          </div>
        </div>

        <!-- Results -->
        <div id="users-results" class="hidden">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Results</h3>
          <div id="users-results-content" class="result-container">
            <!-- Results will be inserted here -->
          </div>
        </div>
      </div>
    `;

    this.tabContent.innerHTML = content;
    this.setupUsersEventListeners(api);
  }

  /**
   * Setup event listeners for Users tab
   */
  setupUsersEventListeners(api) {
    // List Users
    document.getElementById('list-users-btn')?.addEventListener('click', async () => {
      await this.executeApiCall('List Users', () => api.listUsers(), 'users-results');
    });

    // Get Bot User
    document.getElementById('get-bot-user-btn')?.addEventListener('click', async () => {
      await this.executeApiCall('Bot User Info', () => api.getBotUser(), 'users-results');
    });

    // Get Specific User
    document.getElementById('get-user-btn')?.addEventListener('click', async () => {
      const userId = document.getElementById('user-id-input')?.value?.trim();
      if (!userId) {
        window.notionApiDemo.toast.warning('Please enter a user ID');
        return;
      }
      await this.executeApiCall('Get User', () => api.getUser(userId), 'users-results');
    });

    // Workspace Stats
    document.getElementById('workspace-stats-btn')?.addEventListener('click', async () => {
      await this.executeApiCall('Workspace Stats', () => api.getWorkspaceStats(), 'users-results');
    });
  }

  /**
   * Render Databases tab interface
   */
  async renderDatabasesTab(api) {
    const content = `
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Databases API</h2>
          <p class="mt-2 text-gray-600">Manage and query Notion databases</p>
        </div>

        <!-- Actions Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Get Database -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Retrieve Database</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="database-id-input"
                placeholder="Database ID"
                class="form-input w-full"
              />
              <button id="get-database-btn" class="btn-primary w-full">
                Get Database
              </button>
            </div>
          </div>

          <!-- Query Database -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Query Database</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="query-database-id-input"
                placeholder="Database ID"
                class="form-input w-full"
              />
              <div class="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  id="query-page-size-input"
                  placeholder="Page Size (default: 100)"
                  class="form-input"
                  min="1"
                  max="100"
                />
                <select id="query-sort-direction" class="form-select">
                  <option value="">No Sorting</option>
                  <option value="ascending">Ascending</option>
                  <option value="descending">Descending</option>
                </select>
              </div>
              <button id="query-database-btn" class="btn-primary w-full">
                Query Database
              </button>
            </div>
          </div>

          <!-- Advanced Query -->
          <div class="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Advanced Query with Filters</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div class="space-y-3">
                <input
                  type="text"
                  id="advanced-database-id-input"
                  placeholder="Database ID"
                  class="form-input w-full"
                />
                <input
                  type="text"
                  id="filter-property-input"
                  placeholder="Property Name (e.g., Status)"
                  class="form-input w-full"
                />
                <input
                  type="text"
                  id="filter-value-input"
                  placeholder="Filter Value (e.g., Done)"
                  class="form-input w-full"
                />
              </div>
              <div class="space-y-3">
                <select id="filter-type" class="form-select w-full">
                  <option value="equals">Equals</option>
                  <option value="does_not_equal">Does Not Equal</option>
                  <option value="contains">Contains</option>
                  <option value="does_not_contain">Does Not Contain</option>
                </select>
                <select id="property-type" class="form-select w-full">
                  <option value="select">Select</option>
                  <option value="multi_select">Multi-Select</option>
                  <option value="title">Title</option>
                  <option value="rich_text">Rich Text</option>
                  <option value="checkbox">Checkbox</option>
                </select>
                <button id="advanced-query-btn" class="btn-primary w-full">
                  Advanced Query
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div id="databases-results" class="hidden">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Results</h3>
          <div id="databases-results-content" class="result-container">
            <!-- Results will be inserted here -->
          </div>
        </div>
      </div>
    `;

    this.tabContent.innerHTML = content;
    this.setupDatabasesEventListeners(api);
  }

  /**
   * Setup event listeners for Databases tab
   */
  setupDatabasesEventListeners(api) {
    // Get Database
    document.getElementById('get-database-btn')?.addEventListener('click', async () => {
      const databaseId = document.getElementById('database-id-input')?.value?.trim();
      if (!databaseId) {
        window.notionApiDemo.toast.warning('Please enter a database ID');
        return;
      }
      await this.executeApiCall('Get Database', () => api.getDatabase(databaseId), 'databases-results');
    });

    // Query Database
    document.getElementById('query-database-btn')?.addEventListener('click', async () => {
      const databaseId = document.getElementById('query-database-id-input')?.value?.trim();
      if (!databaseId) {
        window.notionApiDemo.toast.warning('Please enter a database ID');
        return;
      }

      const pageSize = parseInt(document.getElementById('query-page-size-input')?.value) || 100;
      const sortDirection = document.getElementById('query-sort-direction')?.value;

      const options = { pageSize };
      if (sortDirection) {
        options.sorts = [{ property: 'Name', direction: sortDirection }];
      }

      await this.executeApiCall('Query Database', () => api.queryDatabase(databaseId, options), 'databases-results');
    });

    // Advanced Query
    document.getElementById('advanced-query-btn')?.addEventListener('click', async () => {
      const databaseId = document.getElementById('advanced-database-id-input')?.value?.trim();
      const propertyName = document.getElementById('filter-property-input')?.value?.trim();
      const filterValue = document.getElementById('filter-value-input')?.value?.trim();
      const filterType = document.getElementById('filter-type')?.value;
      const propertyType = document.getElementById('property-type')?.value;

      if (!databaseId || !propertyName || !filterValue) {
        window.notionApiDemo.toast.warning('Please fill in all filter fields');
        return;
      }

      const filter = {
        property: propertyName,
        [propertyType]: { [filterType]: filterValue }
      };

      await this.executeApiCall('Advanced Query', () => api.queryDatabase(databaseId, { filter }), 'databases-results');
    });
  }

  /**
   * Render Pages tab interface
   */
  async renderPagesTab(api) {
    const content = `
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Pages API</h2>
          <p class="mt-2 text-gray-600">Create, retrieve, and update Notion pages</p>
        </div>

        <!-- Actions Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Get Page -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Retrieve Page</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="page-id-input"
                placeholder="Page ID"
                class="form-input w-full"
              />
              <button id="get-page-btn" class="btn-primary w-full">
                Get Page
              </button>
            </div>
          </div>

          <!-- Get Page Property -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Get Page Property</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="page-property-page-id-input"
                placeholder="Page ID"
                class="form-input w-full"
              />
              <input
                type="text"
                id="page-property-id-input"
                placeholder="Property ID"
                class="form-input w-full"
              />
              <button id="get-page-property-btn" class="btn-primary w-full">
                Get Property
              </button>
            </div>
          </div>

          <!-- Create Page -->
          <div class="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Create New Page</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div class="space-y-3">
                <input
                  type="text"
                  id="create-page-parent-id-input"
                  placeholder="Parent Page/Database ID"
                  class="form-input w-full"
                />
                <input
                  type="text"
                  id="create-page-title-input"
                  placeholder="Page Title"
                  class="form-input w-full"
                />
                <select id="create-page-parent-type" class="form-select w-full">
                  <option value="page_id">Parent is a Page</option>
                  <option value="database_id">Parent is a Database</option>
                </select>
              </div>
              <div class="space-y-3">
                <textarea
                  id="create-page-content-input"
                  placeholder="Page content (optional)"
                  rows="4"
                  class="form-textarea w-full"
                ></textarea>
                <button id="create-page-btn" class="btn-primary w-full">
                  Create Page
                </button>
              </div>
            </div>
          </div>

          <!-- Update Page -->
          <div class="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Update Page Properties</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="update-page-id-input"
                placeholder="Page ID"
                class="form-input w-full"
              />
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <input
                  type="text"
                  id="update-property-name-input"
                  placeholder="Property Name"
                  class="form-input"
                />
                <input
                  type="text"
                  id="update-property-value-input"
                  placeholder="New Value"
                  class="form-input"
                />
              </div>
              <div class="flex space-x-3">
                <button id="update-page-btn" class="btn-primary flex-1">
                  Update Page
                </button>
                <button id="archive-page-btn" class="btn-danger">
                  Archive Page
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Results -->
        <div id="pages-results" class="hidden">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Results</h3>
          <div id="pages-results-content" class="result-container">
            <!-- Results will be inserted here -->
          </div>
        </div>
      </div>
    `;

    this.tabContent.innerHTML = content;
    this.setupPagesEventListeners(api);
  }

  /**
   * Setup event listeners for Pages tab
   */
  setupPagesEventListeners(api) {
    // Get Page
    document.getElementById('get-page-btn')?.addEventListener('click', async () => {
      const pageId = document.getElementById('page-id-input')?.value?.trim();
      if (!pageId) {
        window.notionApiDemo.toast.warning('Please enter a page ID');
        return;
      }
      await this.executeApiCall('Get Page', () => api.getPage(pageId), 'pages-results');
    });

    // Get Page Property
    document.getElementById('get-page-property-btn')?.addEventListener('click', async () => {
      const pageId = document.getElementById('page-property-page-id-input')?.value?.trim();
      const propertyId = document.getElementById('page-property-id-input')?.value?.trim();
      
      if (!pageId || !propertyId) {
        window.notionApiDemo.toast.warning('Please enter both page ID and property ID');
        return;
      }
      
      await this.executeApiCall('Get Page Property', () => api.getPageProperty(pageId, propertyId), 'pages-results');
    });

    // Create Page
    document.getElementById('create-page-btn')?.addEventListener('click', async () => {
      const parentId = document.getElementById('create-page-parent-id-input')?.value?.trim();
      const title = document.getElementById('create-page-title-input')?.value?.trim();
      const parentType = document.getElementById('create-page-parent-type')?.value;
      const content = document.getElementById('create-page-content-input')?.value?.trim();

      if (!parentId || !title) {
        window.notionApiDemo.toast.warning('Please enter parent ID and page title');
        return;
      }

      const parent = { type: parentType, [parentType]: parentId };
      const properties = {
        title: {
          title: api.createRichText(title)
        }
      };

      const children = content ? [api.createParagraphBlock(content)] : [];

      await this.executeApiCall('Create Page', () => api.createPage(parent, properties, children), 'pages-results');
    });

    // Update Page
    document.getElementById('update-page-btn')?.addEventListener('click', async () => {
      const pageId = document.getElementById('update-page-id-input')?.value?.trim();
      const propertyName = document.getElementById('update-property-name-input')?.value?.trim();
      const propertyValue = document.getElementById('update-property-value-input')?.value?.trim();

      if (!pageId) {
        window.notionApiDemo.toast.warning('Please enter a page ID');
        return;
      }

      const properties = {};
      if (propertyName && propertyValue) {
        properties[propertyName] = {
          rich_text: api.createRichText(propertyValue)
        };
      }

      await this.executeApiCall('Update Page', () => api.updatePage(pageId, properties), 'pages-results');
    });

    // Archive Page
    document.getElementById('archive-page-btn')?.addEventListener('click', async () => {
      const pageId = document.getElementById('update-page-id-input')?.value?.trim();
      if (!pageId) {
        window.notionApiDemo.toast.warning('Please enter a page ID');
        return;
      }

      const confirmed = confirm('Are you sure you want to archive this page?');
      if (confirmed) {
        await this.executeApiCall('Archive Page', () => api.archivePage(pageId), 'pages-results');
      }
    });
  }

  /**
   * Render Search tab interface
   */
  async renderSearchTab(api) {
    const content = `
      <div class="space-y-6">
        <!-- Header -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Search API</h2>
          <p class="mt-2 text-gray-600">Search across your Notion workspace</p>
        </div>

        <!-- Search Forms -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Basic Search -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Search</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="basic-search-input"
                placeholder="Search query..."
                class="form-input w-full"
              />
              <input
                type="number"
                id="search-page-size-input"
                placeholder="Page Size (default: 100)"
                class="form-input w-full"
                min="1"
                max="100"
              />
              <button id="basic-search-btn" class="btn-primary w-full">
                Search
              </button>
            </div>
          </div>

          <!-- Filtered Search -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Filtered Search</h3>
            <div class="space-y-3">
              <input
                type="text"
                id="filtered-search-input"
                placeholder="Search query..."
                class="form-input w-full"
              />
              <select id="search-object-type" class="form-select w-full">
                <option value="">All Objects</option>
                <option value="page">Pages Only</option>
                <option value="database">Databases Only</option>
              </select>
              <select id="search-sort-direction" class="form-select w-full">
                <option value="">No Sorting</option>
                <option value="ascending">Last Edited (Ascending)</option>
                <option value="descending">Last Edited (Descending)</option>
              </select>
              <button id="filtered-search-btn" class="btn-primary w-full">
                Filtered Search
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Searches -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Searches</h3>
          <div id="recent-searches" class="flex flex-wrap gap-2">
            <!-- Recent searches will be inserted here -->
          </div>
        </div>

        <!-- Results -->
        <div id="search-results" class="hidden">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Search Results</h3>
          <div id="search-results-content" class="result-container">
            <!-- Results will be inserted here -->
          </div>
        </div>
      </div>
    `;

    this.tabContent.innerHTML = content;
    this.setupSearchEventListeners(api);
    this.loadRecentSearches();
  }

  /**
   * Setup event listeners for Search tab
   */
  setupSearchEventListeners(api) {
    // Basic Search
    document.getElementById('basic-search-btn')?.addEventListener('click', async () => {
      const query = document.getElementById('basic-search-input')?.value?.trim();
      const pageSize = parseInt(document.getElementById('search-page-size-input')?.value) || 100;
      
      if (!query) {
        window.notionApiDemo.toast.warning('Please enter a search query');
        return;
      }

      // Save to recent searches
      window.notionApiDemo.storage.saveRecentSearch(query);
      this.loadRecentSearches();

      await this.executeApiCall('Basic Search', () => api.search(query, { pageSize }), 'search-results');
    });

    // Filtered Search
    document.getElementById('filtered-search-btn')?.addEventListener('click', async () => {
      const query = document.getElementById('filtered-search-input')?.value?.trim();
      const objectType = document.getElementById('search-object-type')?.value;
      const sortDirection = document.getElementById('search-sort-direction')?.value;

      if (!query) {
        window.notionApiDemo.toast.warning('Please enter a search query');
        return;
      }

      const options = {};
      
      if (objectType) {
        options.filter = { value: objectType, property: 'object' };
      }
      
      if (sortDirection) {
        options.sort = { direction: sortDirection, timestamp: 'last_edited_time' };
      }

      // Save to recent searches
      window.notionApiDemo.storage.saveRecentSearch(query);
      this.loadRecentSearches();

      await this.executeApiCall('Filtered Search', () => api.search(query, options), 'search-results');
    });

    // Enter key search
    ['basic-search-input', 'filtered-search-input'].forEach(inputId => {
      document.getElementById(inputId)?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const btnId = inputId === 'basic-search-input' ? 'basic-search-btn' : 'filtered-search-btn';
          document.getElementById(btnId)?.click();
        }
      });
    });
  }

  /**
   * Load and display recent searches
   */
  loadRecentSearches() {
    const recentSearches = window.notionApiDemo.storage.getRecentSearches();
    const container = document.getElementById('recent-searches');
    
    if (!container) return;

    if (recentSearches.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-sm">No recent searches</p>';
      return;
    }

    container.innerHTML = recentSearches.map(search => `
      <button
        class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
        onclick="document.getElementById('basic-search-input').value = '${this.escapeHtml(search)}'; document.getElementById('basic-search-btn').click();"
      >
        ${this.escapeHtml(search)}
      </button>
    `).join('');
  }

  /**
   * Render Blocks tab interface (simplified version)
   */
  async renderBlocksTab(api) {
    const content = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Blocks API</h2>
          <p class="mt-2 text-gray-600">Manage content blocks within pages</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Get Block Children</h3>
            <div class="space-y-3">
              <input type="text" id="block-id-input" placeholder="Block/Page ID" class="form-input w-full" />
              <button id="get-block-children-btn" class="btn-primary w-full">Get Children</button>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Get Block Info</h3>
            <div class="space-y-3">
              <input type="text" id="get-block-id-input" placeholder="Block ID" class="form-input w-full" />
              <button id="get-block-btn" class="btn-primary w-full">Get Block</button>
            </div>
          </div>
        </div>

        <div id="blocks-results" class="hidden">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Results</h3>
          <div id="blocks-results-content" class="result-container"></div>
        </div>
      </div>
    `;

    this.tabContent.innerHTML = content;

    // Event listeners
    document.getElementById('get-block-children-btn')?.addEventListener('click', async () => {
      const blockId = document.getElementById('block-id-input')?.value?.trim();
      if (!blockId) {
        window.notionApiDemo.toast.warning('Please enter a block/page ID');
        return;
      }
      await this.executeApiCall('Get Block Children', () => api.getBlockChildren(blockId), 'blocks-results');
    });

    document.getElementById('get-block-btn')?.addEventListener('click', async () => {
      const blockId = document.getElementById('get-block-id-input')?.value?.trim();
      if (!blockId) {
        window.notionApiDemo.toast.warning('Please enter a block ID');
        return;
      }
      await this.executeApiCall('Get Block', () => api.getBlock(blockId), 'blocks-results');
    });
  }

  /**
   * Render Comments tab interface (simplified version)
   */
  async renderCommentsTab(api) {
    const content = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Comments API</h2>
          <p class="mt-2 text-gray-600">Manage comments on pages</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Get Comments</h3>
            <div class="space-y-3">
              <input type="text" id="comments-page-id-input" placeholder="Page ID" class="form-input w-full" />
              <button id="get-comments-btn" class="btn-primary w-full">Get Comments</button>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Add Comment</h3>
            <div class="space-y-3">
              <input type="text" id="add-comment-page-id-input" placeholder="Page ID" class="form-input w-full" />
              <textarea id="comment-text-input" placeholder="Comment text..." rows="3" class="form-textarea w-full"></textarea>
              <button id="add-comment-btn" class="btn-primary w-full">Add Comment</button>
            </div>
          </div>
        </div>

        <div id="comments-results" class="hidden">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Results</h3>
          <div id="comments-results-content" class="result-container"></div>
        </div>
      </div>
    `;

    this.tabContent.innerHTML = content;

    // Event listeners
    document.getElementById('get-comments-btn')?.addEventListener('click', async () => {
      const blockId = document.getElementById('comments-page-id-input')?.value?.trim();
      if (!blockId) {
        window.notionApiDemo.toast.warning('Please enter a page ID');
        return;
      }
      await this.executeApiCall('Get Comments', () => api.getComments(blockId), 'comments-results');
    });

    document.getElementById('add-comment-btn')?.addEventListener('click', async () => {
      const pageId = document.getElementById('add-comment-page-id-input')?.value?.trim();
      const commentText = document.getElementById('comment-text-input')?.value?.trim();
      
      if (!pageId || !commentText) {
        window.notionApiDemo.toast.warning('Please enter both page ID and comment text');
        return;
      }

      const richText = api.createRichText(commentText);
      await this.executeApiCall('Add Comment', () => api.createComment(pageId, richText), 'comments-results');
    });
  }

  /**
   * Execute an API call with loading state and error handling
   */
  async executeApiCall(operationName, apiCall, resultsContainerId) {
    const resultsContainer = document.getElementById(resultsContainerId);
    const resultsContent = document.getElementById(`${resultsContainerId}-content`);

    if (!resultsContainer || !resultsContent) {
      console.error('Results container not found:', resultsContainerId);
      return;
    }

    try {
      // Show loading state
      resultsContainer.classList.remove('hidden');
      resultsContent.className = 'result-container loading';
      resultsContent.innerHTML = `
        <div class="flex items-center justify-center py-8">
          <div class="text-center">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-notion-600 border-r-transparent"></div>
            <p class="mt-4 text-gray-600">Executing ${operationName}...</p>
          </div>
        </div>
      `;

      const startTime = Date.now();
      const result = await apiCall();
      const duration = Date.now() - startTime;

      // Show success result
      resultsContent.className = 'result-container success';
      resultsContent.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-green-800">${operationName} - Success</h4>
            <span class="text-sm text-green-600">${duration}ms</span>
          </div>
          <div class="json-viewer custom-scrollbar">
            <pre>${JSON.stringify(result, null, 2)}</pre>
          </div>
          <div class="flex space-x-2">
            <button onclick="navigator.clipboard.writeText(JSON.stringify(${JSON.stringify(result)}, null, 2))" class="btn-secondary text-xs">
              Copy JSON
            </button>
            <button onclick="this.parentElement.parentElement.querySelector('.json-viewer').classList.toggle('expanded')" class="btn-secondary text-xs">
              Toggle Expand
            </button>
          </div>
        </div>
      `;

      window.notionApiDemo.toast.success(`${operationName} completed successfully`);

    } catch (error) {
      // Show error result
      resultsContent.className = 'result-container error';
      resultsContent.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-medium text-red-800">${operationName} - Error</h4>
            <button onclick="location.reload()" class="btn-secondary text-xs">Retry</button>
          </div>
          <div class="text-red-700">
            <p class="font-medium">Error Message:</p>
            <p class="mt-1">${error.message}</p>
          </div>
          ${error.stack ? `
            <details class="text-sm">
              <summary class="cursor-pointer text-red-600">Stack Trace</summary>
              <pre class="mt-2 text-xs text-red-500">${error.stack}</pre>
            </details>
          ` : ''}
        </div>
      `;

      window.notionApiDemo.toast.error(`${operationName} failed: ${error.message}`);
    }
  }

  /**
   * Render error tab
   */
  renderErrorTab(message) {
    this.tabContent.innerHTML = `
      <div class="text-center py-12">
        <div class="mx-auto h-12 w-12 text-red-400">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p class="mt-1 text-sm text-gray-500">${this.escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * Show modal
   */
  showModal(content, onShow = null) {
    if (!this.modalContainer) return;

    this.modalContainer.className = 'fixed inset-0 z-50 overflow-y-auto';
    this.modalContainer.innerHTML = `
      <div class="modal-overlay" onclick="this.parentElement.classList.add('hidden')"></div>
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        ${content}
      </div>
    `;

    if (onShow) onShow();
  }

  /**
   * Close modal
   */
  closeModal() {
    if (this.modalContainer) {
      this.modalContainer.classList.add('hidden');
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
} 