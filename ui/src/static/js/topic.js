// Topic API and Management Module for LinkNova
const Topic = {
    /**
     * Handle API response with standard structure
     * @param {Object} response - API response
     * @returns {*} Data from response
     * @throws {Error} If response indicates failure
     */
    _handleResponse(response) {
        if (!response.success) {
            throw new Error(response.error || 'API request failed');
        }
        return response.data;
    },

    /**
     * Get all topics
     * @returns {Promise<Array>} List of topics
     */
    async getAll() {
        const response = await API.request('/v1/api/topic');
        return this._handleResponse(response);
    },

    /**
     * Get topic by name
     * @param {string} name - Topic name
     * @returns {Promise<Object>} Topic data
     */
    async getByName(name) {
        const response = await API.request(`/v1/api/topic/${encodeURIComponent(name)}`);
        return this._handleResponse(response);
    },

    /**
     * Create new topic
     * @param {Object} data - Topic data
     * @returns {Promise<Object>} Created topic
     */
    async create(data) {
        const response = await API.request('/v1/api/topic', {
            method: 'POST',
            data
        });
        return this._handleResponse(response);
    },

    /**
     * Update topic
     * @param {string} name - Topic name
     * @param {Object} data - Updated topic data
     * @returns {Promise<Object>} Updated topic
     */
    async update(name, data) {
        const response = await API.request(`/v1/api/topic/${encodeURIComponent(name)}`, {
            method: 'PUT',
            data
        });
        return this._handleResponse(response);
    },

    /**
     * Delete topic
     * @param {string} name - Topic name
     * @returns {Promise<Object>} Deletion result
     */
    async delete(name) {
        const response = await API.request(`/v1/api/topic/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        return this._handleResponse(response);
    }
};

// Topics Management Component
const TopicsManager = {
    // Component state
    state: {
        topics: [],
        filteredTopics: [],
        currentTopic: null,
        isLoading: false,
        searchQuery: '',
        sortBy: 'name', // name, priority, created_on, updated_on
        sortOrder: 'asc' // asc, desc
    },

    /**
     * Initialize the topics manager
     */
    async init() {
        console.log('🚀 Initializing Topics Manager...');
        
        try {
            await this.loadTopics();
            this.setupEventListeners();
            this.render();
            
            console.log('✅ Topics Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Topics Manager:', error);
            Utils.showToast('Failed to load topics', 'error');
        }
    },

    /**
     * Load all topics from API
     */
    async loadTopics() {
        this.setLoading(true);
        
        try {
            const topics = await Topic.getAll();
            this.state.topics = topics || [];
            this.state.filteredTopics = [...this.state.topics];
            this.applyFiltersAndSort();
        } catch (error) {
            console.error('Error loading topics:', error);
            Utils.showToast('Failed to load topics', 'error');
            this.state.topics = [];
            this.state.filteredTopics = [];
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        // Update loading indicators
        const loadingElements = document.querySelectorAll('.topics-loading');
        loadingElements.forEach(el => {
            if (isLoading) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('topics-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('topics-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                this.handleSort(sortBy, sortOrder);
            });
        }
    },

    /**
     * Handle search
     */
    handleSearch(query) {
        this.state.searchQuery = query.toLowerCase().trim();
        this.applyFiltersAndSort();
        this.renderTopicsList();
    },

    /**
     * Handle sort
     */
    handleSort(sortBy, sortOrder) {
        this.state.sortBy = sortBy;
        this.state.sortOrder = sortOrder;
        this.applyFiltersAndSort();
        this.renderTopicsList();
    },

    /**
     * Apply filters and sorting
     */
    applyFiltersAndSort() {
        let filtered = [...this.state.topics];

        // Apply search filter
        if (this.state.searchQuery) {
            filtered = filtered.filter(topic => 
                topic.name.toLowerCase().includes(this.state.searchQuery) ||
                (topic.display_name && topic.display_name.toLowerCase().includes(this.state.searchQuery)) ||
                (topic.description && topic.description.toLowerCase().includes(this.state.searchQuery)) ||
                topic.categories.some(cat => cat.toLowerCase().includes(this.state.searchQuery))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal, bVal;
            
            switch (this.state.sortBy) {
                case 'priority':
                    aVal = a.priority;
                    bVal = b.priority;
                    break;
                case 'created_on':
                    aVal = new Date(a.created_on);
                    bVal = new Date(b.created_on);
                    break;
                case 'updated_on':
                    aVal = new Date(a.updated_on);
                    bVal = new Date(b.updated_on);
                    break;
                default: // name
                    aVal = (a.display_name || a.name).toLowerCase();
                    bVal = (b.display_name || b.name).toLowerCase();
            }

            if (aVal < bVal) return this.state.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.state.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        this.state.filteredTopics = filtered;
    },

    /**
     * Render the topics page
     */
    render() {
        const container = document.getElementById('page-content');
        if (!container) return;

        container.innerHTML = this.getTopicsPageHTML();
        this.setupEventListeners();
    },

    /**
     * Get topics page HTML
     */
    getTopicsPageHTML() {
        return `
            <div class="topics-page">
                <!-- Page Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Topics</h1>
                        <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                            Manage and organize your bookmark topics
                        </p>
                    </div>
                    <div class="mt-4 sm:mt-0">
                        <button onclick="TopicsManager.showCreateModal()" class="btn-primary">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Create Topic
                        </button>
                    </div>
                </div>

                <!-- Filters and Controls -->
                <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-soft border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                        <!-- Search -->
                        <div class="flex-1 max-w-md">
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                <input type="text" id="topics-search" 
                                       placeholder="Search topics..." 
                                       class="form-input pl-10 pr-4 py-2 w-full text-sm"
                                       value="${this.state.searchQuery}">
                            </div>
                        </div>

                        <!-- Sort -->
                        <div class="flex items-center space-x-4">
                            <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Sort by:</label>
                            <select id="topics-sort" class="form-select text-sm py-2 pl-3 pr-8">
                                <option value="name-asc" ${this.state.sortBy === 'name' && this.state.sortOrder === 'asc' ? 'selected' : ''}>Name (A-Z)</option>
                                <option value="name-desc" ${this.state.sortBy === 'name' && this.state.sortOrder === 'desc' ? 'selected' : ''}>Name (Z-A)</option>
                                <option value="priority-desc" ${this.state.sortBy === 'priority' && this.state.sortOrder === 'desc' ? 'selected' : ''}>Priority (High-Low)</option>
                                <option value="priority-asc" ${this.state.sortBy === 'priority' && this.state.sortOrder === 'asc' ? 'selected' : ''}>Priority (Low-High)</option>
                                <option value="created_on-desc" ${this.state.sortBy === 'created_on' && this.state.sortOrder === 'desc' ? 'selected' : ''}>Created (Newest)</option>
                                <option value="created_on-asc" ${this.state.sortBy === 'created_on' && this.state.sortOrder === 'asc' ? 'selected' : ''}>Created (Oldest)</option>
                                <option value="updated_on-desc" ${this.state.sortBy === 'updated_on' && this.state.sortOrder === 'desc' ? 'selected' : ''}>Updated (Recent)</option>
                            </select>
                        </div>

                        <!-- Stats -->
                        <div class="text-sm text-neutral-600 dark:text-neutral-400">
                            ${this.state.filteredTopics.length} of ${this.state.topics.length} topics
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div class="topics-loading ${this.state.isLoading ? '' : 'hidden'} flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    <span class="ml-3 text-neutral-600 dark:text-neutral-400">Loading topics...</span>
                </div>

                <!-- Topics List -->
                <div id="topics-list" class="${this.state.isLoading ? 'hidden' : ''}">
                    ${this.getTopicsListHTML()}
                </div>
            </div>
        `;
    },

    /**
     * Get topics list HTML
     */
    getTopicsListHTML() {
        if (this.state.filteredTopics.length === 0) {
            return this.getEmptyStateHTML();
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.state.filteredTopics.map(topic => this.getTopicCardHTML(topic)).join('')}
            </div>
        `;
    },

    /**
     * Get topic card HTML
     */
    getTopicCardHTML(topic) {
        const displayName = topic.display_name || topic.name;
        const createdDate = new Date(topic.created_on).toLocaleDateString();
        const updatedDate = new Date(topic.updated_on).toLocaleDateString();

        return `
            <div class="topic-card bg-white dark:bg-neutral-800 rounded-lg shadow-soft border border-neutral-200 dark:border-neutral-700 hover:shadow-medium transition-shadow duration-200 cursor-pointer"
                 onclick="TopicsManager.viewTopic('${topic.name}')">
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                                ${Utils.escapeHTML(displayName)}
                            </h3>
                            ${topic.name !== displayName ? `
                                <p class="text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                                    ${Utils.escapeHTML(topic.name)}
                                </p>
                            ` : ''}
                        </div>
                        
                        <!-- Priority Badge -->
                        <div class="flex items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${topic.priority >= 80 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                  topic.priority >= 60 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                  topic.priority >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                  topic.priority >= 20 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                  'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'}">
                                Priority ${topic.priority}
                            </span>
                        </div>
                    </div>

                    <!-- Description -->
                    ${topic.description ? `
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                            ${Utils.escapeHTML(topic.description)}
                        </p>
                    ` : ''}

                    <!-- Categories -->
                    ${topic.categories && topic.categories.length > 0 ? `
                        <div class="mb-4">
                            <div class="flex flex-wrap gap-1">
                                ${topic.categories.slice(0, 3).map(category => `
                                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
                                        ${Utils.escapeHTML(category)}
                                    </span>
                                `).join('')}
                                ${topic.categories.length > 3 ? `
                                    <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400">
                                        +${topic.categories.length - 3} more
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Footer -->
                    <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <div class="flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Created ${createdDate}
                        </div>
                        
                        <!-- Public/Private indicator -->
                        <div class="flex items-center">
                            ${topic.public ? `
                                <svg class="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                                    <path d="M9 12l2 2 4-4"/>
                                </svg>
                                Public
                            ` : `
                                <svg class="w-3 h-3 mr-1 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 17a2 2 0 0 0 2-2c0-1.11-.89-2-2-2a2 2 0 0 0-2 2c0 1.11.89 2 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5 5 5 0 0 1 5 5v2h1m-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3Z"/>
                                </svg>
                                Private
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get empty state HTML
     */
    getEmptyStateHTML() {
        const hasSearchQuery = this.state.searchQuery.length > 0;
        
        return `
            <div class="text-center py-16">
                <div class="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
                    <svg class="w-12 h-12 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                </div>
                
                <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    ${hasSearchQuery ? 'No topics found' : 'No topics yet'}
                </h3>
                
                <p class="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                    ${hasSearchQuery 
                        ? `No topics match your search "${this.state.searchQuery}". Try adjusting your search terms.`
                        : 'Get started by creating your first topic to organize your bookmarks.'
                    }
                </p>
                
                ${hasSearchQuery ? `
                    <button onclick="TopicsManager.handleSearch('')" class="btn-secondary mr-3">
                        Clear Search
                    </button>
                ` : ''}
                
                <button onclick="TopicsManager.showCreateModal()" class="btn-primary">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Create Topic
                </button>
            </div>
        `;
    },

    /**
     * Render only the topics list (for updates)
     */
    renderTopicsList() {
        const container = document.getElementById('topics-list');
        if (!container) return;

        container.innerHTML = this.getTopicsListHTML();
    },

    /**
     * View topic details
     */
    async viewTopic(topicName) {
        try {
            this.setLoading(true);
            const topic = await Topic.getByName(topicName);
            this.showTopicDetailModal(topic);
        } catch (error) {
            console.error('Error loading topic:', error);
            Utils.showToast('Failed to load topic details', 'error');
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Show topic detail modal
     */
    showTopicDetailModal(topic) {
        const modal = Components.modal({
            title: topic.display_name || topic.name,
            size: 'lg',
            content: this.getTopicDetailHTML(topic),
            showConfirm: false,
            showCancel: false,
            closable: true
        });

        modal.show();

        // Setup detail modal event listeners
        setTimeout(() => {
            this.setupTopicDetailEventListeners(topic, modal);
        }, 100);
    },

    /**
     * Get topic detail HTML
     */
    getTopicDetailHTML(topic) {
        const createdDate = new Date(topic.created_on).toLocaleDateString();
        const updatedDate = new Date(topic.updated_on).toLocaleDateString();

        return `
            <div class="topic-detail">
                <!-- Basic Info -->
                <div class="mb-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h2 class="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                                ${Utils.escapeHTML(topic.display_name || topic.name)}
                            </h2>
                            ${topic.name !== (topic.display_name || topic.name) ? `
                                <p class="text-sm text-neutral-500 dark:text-neutral-400 font-mono mb-2">
                                    ID: ${Utils.escapeHTML(topic.name)}
                                </p>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center space-x-2">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${topic.priority >= 80 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                  topic.priority >= 60 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                  topic.priority >= 40 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                  topic.priority >= 20 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                  'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'}">
                                Priority ${topic.priority}
                            </span>
                            
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${topic.public 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300'
                                }">
                                ${topic.public ? 'Public' : 'Private'}
                            </span>
                        </div>
                    </div>

                    ${topic.description ? `
                        <div class="mb-4">
                            <h4 class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</h4>
                            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                                ${Utils.escapeHTML(topic.description)}
                            </p>
                        </div>
                    ` : ''}

                    ${topic.about ? `
                        <div class="mb-4">
                            <h4 class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">About</h4>
                            <p class="text-sm text-neutral-600 dark:text-neutral-400">
                                ${Utils.escapeHTML(topic.about)}
                            </p>
                        </div>
                    ` : ''}
                </div>

                <!-- Categories -->
                ${topic.categories && topic.categories.length > 0 ? `
                    <div class="mb-6">
                        <h4 class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Categories</h4>
                        <div class="flex flex-wrap gap-2">
                            ${topic.categories.map(category => `
                                <span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
                                    ${Utils.escapeHTML(category)}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Timestamps -->
                <div class="mb-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-neutral-700 dark:text-neutral-300">Created:</span>
                        <span class="text-neutral-600 dark:text-neutral-400 ml-2">${createdDate}</span>
                    </div>
                    <div>
                        <span class="font-medium text-neutral-700 dark:text-neutral-300">Updated:</span>
                        <span class="text-neutral-600 dark:text-neutral-400 ml-2">${updatedDate}</span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button onclick="TopicsManager.editTopic('${topic.name}')" class="btn-secondary">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Edit
                    </button>
                    <button onclick="TopicsManager.deleteTopic('${topic.name}')" class="btn-danger">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Setup topic detail event listeners
     */
    setupTopicDetailEventListeners(topic, modal) {
        // Any additional event listeners for the detail modal can be added here
    },

    /**
     * Show create topic modal
     */
    showCreateModal() {
        const modal = Components.modal({
            title: 'Create New Topic',
            size: 'lg',
            content: this.getCreateTopicFormHTML(),
            showConfirm: true,
            showCancel: true,
            confirmText: 'Create Topic',
            onConfirm: () => this.handleCreateTopic(modal)
        });

        modal.show();
    },

    /**
     * Get create topic form HTML
     */
    getCreateTopicFormHTML() {
        return `
            <form id="create-topic-form" class="space-y-4">
                <div>
                    <label for="topic-name" class="form-label">
                        Topic Name <span class="text-error-500">*</span>
                    </label>
                    <input type="text" id="topic-name" name="name" class="form-input" 
                           placeholder="e.g., web-development" required>
                    <p class="form-help">Use lowercase with hyphens (a-z, 0-9, -)</p>
                </div>

                <div>
                    <label for="topic-display-name" class="form-label">Display Name</label>
                    <input type="text" id="topic-display-name" name="display_name" class="form-input" 
                           placeholder="e.g., Web Development">
                    <p class="form-help">Human-friendly name for display</p>
                </div>

                <div>
                    <label for="topic-description" class="form-label">Description</label>
                    <textarea id="topic-description" name="description" class="form-input" rows="3"
                              placeholder="Brief description of this topic..."></textarea>
                </div>

                <div>
                    <label for="topic-about" class="form-label">About</label>
                    <textarea id="topic-about" name="about" class="form-input" rows="4"
                              placeholder="Detailed information about this topic..."></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="topic-priority" class="form-label">Priority</label>
                        <input type="number" id="topic-priority" name="priority" class="form-input" 
                               min="0" max="100" value="50" placeholder="50">
                        <p class="form-help">0-100 (higher = more important)</p>
                    </div>

                    <div>
                        <label class="form-label">Visibility</label>
                        <div class="mt-2 space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="public" value="true" class="form-radio" checked>
                                <span class="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Public</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="public" value="false" class="form-radio">
                                <span class="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Private</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        `;
    },

    /**
     * Handle create topic
     */
    async handleCreateTopic(modal) {
        const form = document.getElementById('create-topic-form');
        const formData = new FormData(form);
        
        const data = {
            name: formData.get('name').trim(),
            display_name: formData.get('display_name').trim() || null,
            description: formData.get('description').trim() || null,
            about: formData.get('about').trim() || null,
            priority: parseInt(formData.get('priority')) || 50,
            public: formData.get('public') === 'true'
        };

        try {
            // Validate required fields
            if (!data.name) {
                Utils.showToast('Topic name is required', 'error');
                return;
            }

            // Validate name format (lowercase, alphanumeric, hyphens)
            if (!/^[a-z0-9-]+$/.test(data.name)) {
                Utils.showToast('Topic name must be lowercase with hyphens only', 'error');
                return;
            }

            await Topic.create(data);
            Utils.showToast('Topic created successfully', 'success');
            modal.hide();
            
            // Reload topics list
            await this.loadTopics();
            this.renderTopicsList();
            
        } catch (error) {
            console.error('Error creating topic:', error);
            Utils.showToast(error.message || 'Failed to create topic', 'error');
        }
    },

    /**
     * Edit topic
     */
    async editTopic(topicName) {
        try {
            // First close any existing modals
            const existingModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
            existingModals.forEach(modal => modal.classList.add('hidden'));
            
            // Load fresh topic data
            const topic = await Topic.getByName(topicName);
            this.showEditModal(topic);
        } catch (error) {
            console.error('Error loading topic for edit:', error);
            Utils.showToast('Failed to load topic for editing', 'error');
        }
    },

    /**
     * Show edit topic modal
     */
    showEditModal(topic) {
        const modal = Components.modal({
            title: `Edit Topic: ${topic.display_name || topic.name}`,
            size: 'lg',
            content: this.getEditTopicFormHTML(topic),
            showConfirm: true,
            showCancel: true,
            confirmText: 'Update Topic',
            onConfirm: () => this.handleUpdateTopic(topic.name, modal)
        });

        modal.show();
    },

    /**
     * Get edit topic form HTML
     */
    getEditTopicFormHTML(topic) {
        return `
            <form id="edit-topic-form" class="space-y-4">
                <div>
                    <label for="edit-topic-name" class="form-label">
                        Topic Name <span class="text-error-500">*</span>
                    </label>
                    <input type="text" id="edit-topic-name" name="name" class="form-input bg-neutral-100 dark:bg-neutral-700" 
                           value="${Utils.escapeHTML(topic.name)}" readonly>
                    <p class="form-help">Topic name cannot be changed</p>
                </div>

                <div>
                    <label for="edit-topic-display-name" class="form-label">Display Name</label>
                    <input type="text" id="edit-topic-display-name" name="display_name" class="form-input" 
                           value="${Utils.escapeHTML(topic.display_name || '')}" 
                           placeholder="e.g., Web Development">
                </div>

                <div>
                    <label for="edit-topic-description" class="form-label">Description</label>
                    <textarea id="edit-topic-description" name="description" class="form-input" rows="3"
                              placeholder="Brief description of this topic...">${Utils.escapeHTML(topic.description || '')}</textarea>
                </div>

                <div>
                    <label for="edit-topic-about" class="form-label">About</label>
                    <textarea id="edit-topic-about" name="about" class="form-input" rows="4"
                              placeholder="Detailed information about this topic...">${Utils.escapeHTML(topic.about || '')}</textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="edit-topic-priority" class="form-label">Priority</label>
                        <input type="number" id="edit-topic-priority" name="priority" class="form-input" 
                               min="0" max="100" value="${topic.priority}" placeholder="50">
                        <p class="form-help">0-100 (higher = more important)</p>
                    </div>

                    <div>
                        <label class="form-label">Visibility</label>
                        <div class="mt-2 space-y-2">
                            <label class="flex items-center">
                                <input type="radio" name="public" value="true" class="form-radio" ${topic.public ? 'checked' : ''}>
                                <span class="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Public</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="public" value="false" class="form-radio" ${!topic.public ? 'checked' : ''}>
                                <span class="ml-2 text-sm text-neutral-700 dark:text-neutral-300">Private</span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        `;
    },

    /**
     * Handle update topic
     */
    async handleUpdateTopic(topicName, modal) {
        const form = document.getElementById('edit-topic-form');
        const formData = new FormData(form);
        
        const data = {
            display_name: formData.get('display_name').trim() || null,
            description: formData.get('description').trim() || null,
            about: formData.get('about').trim() || null,
            priority: parseInt(formData.get('priority')) || 50,
            public: formData.get('public') === 'true'
        };

        try {
            await Topic.update(topicName, data);
            Utils.showToast('Topic updated successfully', 'success');
            modal.hide();
            
            // Reload topics list
            await this.loadTopics();
            this.renderTopicsList();
            
        } catch (error) {
            console.error('Error updating topic:', error);
            Utils.showToast(error.message || 'Failed to update topic', 'error');
        }
    },

    /**
     * Delete topic
     */
    async deleteTopic(topicName) {
        const topic = this.state.topics.find(t => t.name === topicName);
        const displayName = topic ? (topic.display_name || topic.name) : topicName;

        const confirmModal = Components.modal({
            title: 'Delete Topic',
            content: `
                <div class="text-center">
                    <div class="w-12 h-12 mx-auto mb-4 bg-error-100 rounded-full flex items-center justify-center dark:bg-error-900/20">
                        <svg class="w-6 h-6 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        Delete "${Utils.escapeHTML(displayName)}"?
                    </h3>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                        This action cannot be undone. All bookmarks associated with this topic will lose this topic association.
                    </p>
                </div>
            `,
            showConfirm: true,
            showCancel: true,
            confirmText: 'Delete Topic',
            onConfirm: async () => {
                try {
                    // Close any existing modals first
                    const existingModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
                    existingModals.forEach(modal => modal.classList.add('hidden'));
                    
                    await Topic.delete(topicName);
                    Utils.showToast('Topic deleted successfully', 'success');
                    
                    // Reload topics list
                    await this.loadTopics();
                    this.renderTopicsList();
                    
                } catch (error) {
                    console.error('Error deleting topic:', error);
                    Utils.showToast(error.message || 'Failed to delete topic', 'error');
                }
            }
        });

        confirmModal.show();
    }
};