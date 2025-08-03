// Category API and Management Module for LinkNova
const Category = {
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
     * Get all categories
     * @returns {Promise<Array>} List of categories
     */
    async getAll() {
        const response = await API.request('/v1/api/cat');
        return this._handleResponse(response);
    },

    /**
     * Get category by name
     * @param {string} name - Category name
     * @returns {Promise<Object>} Category data
     */
    async getByName(name) {
        const response = await API.request(`/v1/api/cat/${encodeURIComponent(name)}`);
        return this._handleResponse(response);
    },

    /**
     * Search categories by name (for autocomplete)
     * @param {string} query - Search query
     * @returns {Promise<Array>} Matching categories
     */
    async search(query) {
        if (!query || query.trim().length < 1) return [];
        
        try {
            const response = await API.request(`/v1/api/cat/search?q=${encodeURIComponent(query.trim())}`);
            return this._handleResponse(response);
        } catch (error) {
            // If search endpoint doesn't exist, fall back to filtering all categories
            console.log('Category search endpoint not available, using local filtering');
            try {
                const allCategories = await this.getAll();
                const queryLower = query.toLowerCase().trim();
                return allCategories.filter(category => 
                    category.name.toLowerCase().includes(queryLower) ||
                    (category.display_name && category.display_name.toLowerCase().includes(queryLower))
                );
            } catch (fallbackError) {
                console.error('Category search fallback failed:', fallbackError);
                return [];
            }
        }
    },

    /**
     * Add categories to a topic
     * @param {string} topicName - Topic name
     * @param {Array<string>} categoryNames - List of category names to add
     * @returns {Promise<Object>} Result
     */
    async addToTopic(topicName, categoryNames) {
        const response = await API.request(`/v1/api/topic/${encodeURIComponent(topicName)}/add-cats`, {
            method: 'PUT',
            data: { categories: categoryNames }
        });
        return this._handleResponse(response);
    },

    /**
     * Remove categories from a topic
     * @param {string} topicName - Topic name
     * @param {Array<string>} categoryNames - List of category names to remove
     * @returns {Promise<Object>} Result
     */
    async removeFromTopic(topicName, categoryNames) {
        const response = await API.request(`/v1/api/topic/${encodeURIComponent(topicName)}/remove-cats`, {
            method: 'DELETE',
            data: { categories: categoryNames }
        });
        return this._handleResponse(response);
    },

    /**
     * Create new category
     * @param {Object} data - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(data) {
        const response = await API.request('/v1/api/cat', {
            method: 'POST',
            data
        });
        return this._handleResponse(response);
    },

    /**
     * Update category
     * @param {string} name - Category name
     * @param {Object} data - Updated category data
     * @returns {Promise<Object>} Updated category
     */
    async update(name, data) {
        const response = await API.request(`/v1/api/cat/${encodeURIComponent(name)}`, {
            method: 'PUT',
            data
        });
        return this._handleResponse(response);
    },

    /**
     * Delete category
     * @param {string} name - Category name
     * @returns {Promise<Object>} Deletion result
     */
    async delete(name) {
        const response = await API.request(`/v1/api/cat/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        return this._handleResponse(response);
    }
};

// Category Input Component with Autocomplete
const CategoryInput = {
    // Store for autocomplete data
    cache: {
        categories: [],
        lastFetch: 0,
        searchResults: new Map()
    },
    
    // Store callbacks and categories for each input instance
    inputCallbacks: {},
    inputCategories: {},

    /**
     * Initialize category input with autocomplete
     * @param {string} inputId - Input element ID
     * @param {string} containerId - Container element ID
     * @param {Function} onAdd - Callback when category is added
     * @param {Function} onRemove - Callback when category is removed
     * @param {Array<string>} existingCategories - Currently assigned categories
     */
    init(inputId, containerId, onAdd, onRemove, existingCategories = []) {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);
        
        if (!input || !container) {
            console.error('CategoryInput: Required elements not found');
            return;
        }

        // Store callbacks and categories for this input instance
        this.inputCallbacks[inputId] = { onAdd, onRemove };
        this.inputCategories[inputId] = existingCategories;

        this.setupKeyboardHandlers(input, container, onAdd, existingCategories);
        this.renderExistingCategories(container, existingCategories, onRemove);
    },

    /**
     * Setup keyboard handlers for category input
     */
    setupKeyboardHandlers(input, container, onAdd, existingCategories) {
        // Handle Enter and Tab keys to add categories
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                const query = input.value.trim();
                if (query) {
                    e.preventDefault();
                    this.addCategory(query, input, container, onAdd, existingCategories);
                }
            }
        });
    },

    /**
     * Show autocomplete suggestions
     */
    showSuggestions(container, suggestions, query, input, onAdd, existingCategories) {
        if (suggestions.length === 0 && query.trim()) {
            // Show option to create new category
            container.innerHTML = `
                <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-strong max-h-48 overflow-y-auto">
                    <div class="p-2">
                        <button class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md flex items-center" 
                                onclick="CategoryInput.addCategoryFromSuggestion('${Utils.escapeHTML(query)}', '${input.id}')" 
                                data-query="${Utils.escapeHTML(query)}">
                            <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Create "<span class="font-medium">${Utils.escapeHTML(query)}</span>"
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Filter out already assigned categories
            const availableSuggestions = suggestions.filter(cat => 
                !existingCategories.includes(cat.name)
            );

            if (availableSuggestions.length === 0) {
                this.hideSuggestions(container);
                return;
            }

            container.innerHTML = `
                <div class="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-strong max-h-48 overflow-y-auto">
                    <div class="p-2">
                        ${availableSuggestions.map(category => `
                            <button class="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md flex items-center justify-between" 
                                    onclick="CategoryInput.addCategoryFromSuggestion('${Utils.escapeHTML(category.name)}', '${input.id}')">
                                <div>
                                    <div class="font-medium text-neutral-900 dark:text-neutral-100">${Utils.escapeHTML(category.display_name || category.name)}</div>
                                    ${category.description ? `<div class="text-xs text-neutral-500 dark:text-neutral-400">${Utils.escapeHTML(category.description)}</div>` : ''}
                                </div>
                                <svg class="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.classList.remove('hidden');
    },

    /**
     * Hide suggestions
     */
    hideSuggestions(container) {
        container.classList.add('hidden');
    },

    /**
     * Add category to the list
     */
    addCategory(categoryName, input, container, onAdd, existingCategories) {
        if (!categoryName.trim() || existingCategories.includes(categoryName)) {
            return;
        }

        // Clear input
        input.value = '';
        
        // Hide suggestions
        const suggestionsContainer = document.getElementById(`${input.id}-suggestions`);
        if (suggestionsContainer) {
            this.hideSuggestions(suggestionsContainer);
        }

        // Add to existing categories
        existingCategories.push(categoryName);

        // Re-render categories
        this.renderExistingCategories(container, existingCategories, (catName) => {
            const index = existingCategories.indexOf(catName);
            if (index > -1) {
                existingCategories.splice(index, 1);
                this.renderExistingCategories(container, existingCategories, arguments.callee);
            }
            if (onAdd) onAdd(catName, 'remove');
        });

        // Call callback
        if (onAdd) onAdd(categoryName, 'add');
    },

    /**
     * Render existing categories with remove buttons
     */
    renderExistingCategories(container, categories, onRemove) {
        console.log('CategoryInput.renderExistingCategories called with:', categories);
        
        if (!categories || categories.length === 0) {
            console.log('No categories to render, showing empty state');
            container.innerHTML = `
                <div class="text-sm text-neutral-500 dark:text-neutral-400 italic py-2">
                    No categories assigned. Start typing to add categories.
                </div>
            `;
            return;
        }

        console.log('Rendering', categories.length, 'categories in CategoryInput');
        container.innerHTML = `
            <div class="flex flex-wrap gap-2">
                ${categories.map(category => `
                    <span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300 group">
                        <span>${Utils.escapeHTML(category)}</span>
                        <button class="ml-2 hover:text-red-600 dark:hover:text-red-400" 
                                onclick="CategoryInput.removeCategoryFromList('${Utils.escapeHTML(category)}', this)"
                                title="Remove category">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </span>
                `).join('')}
            </div>
        `;
    },

    /**
     * Remove category from the list
     */
    removeCategory(categoryName, buttonElement, onRemove) {
        // Find and remove the category element
        const categoryElement = buttonElement.closest('span');
        if (categoryElement) {
            categoryElement.remove();
        }

        // Call callback
        if (onRemove) onRemove(categoryName);
    },

    /**
     * Add category from suggestion (called from HTML onclick)
     */
    addCategoryFromSuggestion(categoryName, inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const container = input.closest('.category-management').querySelector('.categories-list');
        const callbacks = this.inputCallbacks[inputId];
        const existingCategories = this.inputCategories[inputId];

        if (callbacks && existingCategories) {
            this.addCategory(categoryName, input, container, callbacks.onAdd, existingCategories);
        }
    },

    /**
     * Remove category from list (called from HTML onclick)
     */
    removeCategoryFromList(categoryName, buttonElement) {
        const container = buttonElement.closest('.categories-list');
        const input = container.closest('.category-management').querySelector('input');
        
        if (!input) return;

        const callbacks = this.inputCallbacks[input.id];
        const existingCategories = this.inputCategories[input.id];

        if (callbacks && existingCategories) {
            // Remove from categories array
            const index = existingCategories.indexOf(categoryName);
            if (index > -1) {
                existingCategories.splice(index, 1);
            }

            // Re-render categories
            this.renderExistingCategories(container, existingCategories, (catName) => {
                const catIndex = existingCategories.indexOf(catName);
                if (catIndex > -1) {
                    existingCategories.splice(catIndex, 1);
                    this.renderExistingCategories(container, existingCategories, arguments.callee);
                }
                if (callbacks.onAdd) callbacks.onAdd(catName, 'remove');
            });

            // Call remove callback
            if (callbacks.onRemove) callbacks.onRemove(categoryName);
        }
    },

    // Store callbacks and categories for each input
    inputCallbacks: {},
    inputCategories: {}
};

// Categories Management Component
const CategoriesManager = {
    // Component state
    state: {
        categories: [],
        filteredCategories: [],
        currentCategory: null,
        isLoading: false,
        searchQuery: '',
        sortBy: 'name', // name, priority, created_on, updated_on
        sortOrder: 'asc' // asc, desc
    },

    /**
     * Initialize the categories manager
     */
    async init() {
        console.log('🚀 Initializing Categories Manager...');
        
        try {
            await this.loadCategories();
            this.setupEventListeners();
            this.render();
            
            console.log('✅ Categories Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Categories Manager:', error);
            Utils.showToast('Failed to load categories', 'error');
        }
    },

    /**
     * Load all categories from API
     */
    async loadCategories() {
        this.setLoading(true);
        
        try {
            const categories = await Category.getAll();
            this.state.categories = categories || [];
            this.state.filteredCategories = [...this.state.categories];
            this.applyFiltersAndSort();
        } catch (error) {
            console.error('Error loading categories:', error);
            Utils.showToast('Failed to load categories', 'error');
            this.state.categories = [];
            this.state.filteredCategories = [];
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
        const loadingElements = document.querySelectorAll('.categories-loading');
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
        const searchInput = document.getElementById('categories-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.state.searchQuery = e.target.value.trim();
                this.applyFiltersAndSort();
                this.renderList();
            }, 300));
        }

        // Sort functionality
        const sortSelect = document.getElementById('categories-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                this.state.sortBy = sortBy;
                this.state.sortOrder = sortOrder;
                this.applyFiltersAndSort();
                this.renderList();
            });
        }

        // Create category button
        const createBtn = document.getElementById('categories-create-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.showCreateModal();
            });
        }
    },

    /**
     * Apply filters and sorting
     */
    applyFiltersAndSort() {
        let filtered = [...this.state.categories];

        // Apply search filter
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            filtered = filtered.filter(category => 
                category.name.toLowerCase().includes(query) ||
                (category.display_name && category.display_name.toLowerCase().includes(query)) ||
                (category.description && category.description.toLowerCase().includes(query))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let valueA, valueB;

            switch (this.state.sortBy) {
                case 'name':
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
                    break;
                case 'priority':
                    valueA = a.priority || 0;
                    valueB = b.priority || 0;
                    break;
                case 'created_on':
                    valueA = new Date(a.created_on);
                    valueB = new Date(b.created_on);
                    break;
                case 'updated_on':
                    valueA = new Date(a.updated_on);
                    valueB = new Date(b.updated_on);
                    break;
                default:
                    valueA = a.name.toLowerCase();
                    valueB = b.name.toLowerCase();
            }

            if (this.state.sortOrder === 'desc') {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            } else {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            }
        });

        this.state.filteredCategories = filtered;
    },

    /**
     * Render the categories interface
     */
    render() {
        const container = document.getElementById('categories-page-placeholder');
        if (!container) {
            // If placeholder isn't there, try the main page content
            const pageContent = document.getElementById('page-content');
            if(pageContent) pageContent.innerHTML = this.getMainHTML();
            return;
        }

        container.innerHTML = this.getMainHTML();
        this.renderList();
        this.setupEventListeners();
    },

    /**
     * Get main categories interface HTML
     */
    getMainHTML() {
        return `
            <div class="space-y-6" id="categories-container">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Categories</h1>
                        <p class="text-neutral-600 dark:text-neutral-400">Organize your links with categories</p>
                    </div>
                    <button id="categories-create-btn" class="btn-primary">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        Create Category
                    </button>
                </div>

                <!-- Controls -->
                <div class="card">
                    <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <!-- Search -->
                        <div class="flex-1 max-w-md">
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                <input type="text" id="categories-search" 
                                       placeholder="Search categories..." 
                                       class="form-input pl-10 pr-4 py-2 w-full text-sm"
                                       value="${this.state.searchQuery}">
                            </div>
                        </div>

                        <!-- Sort -->
                        <div class="flex items-center space-x-3">
                            <label class="text-sm font-medium text-neutral-600 dark:text-neutral-400">Sort by:</label>
                            <select id="categories-sort" class="form-select text-sm py-2 pl-3 pr-8 rounded-lg border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:border-brand-500 dark:focus:border-brand-400">
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
                            ${this.state.filteredCategories.length} of ${this.state.categories.length} categories
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div class="categories-loading ${this.state.isLoading ? '' : 'hidden'} flex items-center justify-center py-12">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    <span class="ml-3 text-neutral-600 dark:text-neutral-400">Loading categories...</span>
                </div>

                <!-- Categories List -->
                <div id="categories-list" class="${this.state.isLoading ? 'hidden' : ''}">
                </div>
            </div>
        `;
    },

    /**
     * Get categories list HTML
     */
    getCategoriesListHTML() {
        if (this.state.filteredCategories.length === 0) {
            return this.getEmptyStateHTML();
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.state.filteredCategories.map(category => this.getCategoryCardHTML(category)).join('')}
            </div>
        `;
    },

    /**
     * Get category card HTML
     */
    getCategoryCardHTML(category) {
        const isPublic = category.public;
        const priority = category.priority || 0;
        
        return `
            <div class="card hover:shadow-medium transition-shadow duration-200 cursor-pointer" 
                 onclick="CategoriesManager.viewCategory('${Utils.escapeHTML(category.name)}')">
                <div class="p-6">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                                ${Utils.escapeHTML(category.display_name || category.name)}
                            </h3>
                            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                ${Utils.escapeHTML(category.name)}
                            </p>
                        </div>
                        <div class="flex items-center space-x-2 ml-2">
                            ${isPublic ? `
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Public
                                </span>
                            ` : `
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                    Private
                                </span>
                            `}
                            ${priority > 0 ? `
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800 dark:bg-accent-900/20 dark:text-accent-300">
                                    Priority ${priority}
                                </span>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Description -->
                    ${category.description ? `
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                            ${Utils.escapeHTML(category.description)}
                        </p>
                    ` : ''}

                    <!-- Footer -->
                    <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>Created ${Utils.formatRelativeTime(category.created_on)}</span>
                        <span>Updated ${Utils.formatRelativeTime(category.updated_on)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get empty state HTML
     */
    getEmptyStateHTML() {
        const hasSearch = this.state.searchQuery.length > 0;
        
        return `
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    ${hasSearch ? 'No categories found' : 'No categories'}
                </h3>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    ${hasSearch 
                        ? `No categories match your search "${this.state.searchQuery}".`
                        : 'Get started by creating your first category.'
                    }
                </p>
                ${!hasSearch ? `
                    <div class="mt-6">
                        <button class="btn-primary" onclick="CategoriesManager.showCreateModal()">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            Create Category
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render categories list
     */
    renderList() {
        const listContainer = document.getElementById('categories-list');
        if (listContainer) {
            listContainer.innerHTML = this.getCategoriesListHTML();
        }
    },

    /**
     * View category details
     */
    viewCategory(categoryName) {
        // This would typically navigate to a category detail page
        // For now, we'll show a simple modal or redirect
        console.log(`Viewing category: ${categoryName}`);
        Utils.showToast(`Viewing category: ${categoryName}`, 'info');
    },

    /**
     * Show create category modal
     */
    showCreateModal() {
        // This would open a modal or redirect to create page
        console.log('Opening create category modal');
        Utils.showToast('Create category modal would open here', 'info');
    }
};