// Bookmark Management System for LinkNova
// Professional bookmark management with search, filtering, and category management

const BookmarksManager = {
    // Manager state
    state: {
        bookmarks: [],
        filteredBookmarks: [],
        categories: [],
        topics: [],
        searchQuery: '',
        filters: {
            category: '',
            topic: '',
            sortBy: 'created_on',
            sortDirection: 'desc'
        },
        isLoading: false,
        pendingCategoryChanges: new Map() // Track pending category changes per bookmark
    },

    /**
     * Initialize the bookmarks manager
     */
    async init() {
        console.log('BookmarksManager: Initializing...');
        
        this.setupEventListeners();
        await this.loadInitialData();
        this.filterAndRenderBookmarks();
        
        console.log('BookmarksManager: Initialization complete');
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('bookmark-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.state.searchQuery = e.target.value;
                this.filterAndRenderBookmarks();
            }, 300));
        }

        // Filter dropdowns
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.state.filters.category = e.target.value;
                this.filterAndRenderBookmarks();
            });
        }

        const topicFilter = document.getElementById('topic-filter');
        if (topicFilter) {
            topicFilter.addEventListener('change', (e) => {
                this.state.filters.topic = e.target.value;
                this.filterAndRenderBookmarks();
            });
        }

        // Sort dropdown
        const sortSelect = document.getElementById('bookmark-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.state.filters.sortBy = e.target.value;
                this.filterAndRenderBookmarks();
            });
        }

        // Sort direction button
        const sortDirectionBtn = document.getElementById('sort-direction-btn');
        if (sortDirectionBtn) {
            sortDirectionBtn.addEventListener('click', () => {
                this.state.filters.sortDirection = this.state.filters.sortDirection === 'asc' ? 'desc' : 'asc';
                this.updateSortDirectionButton();
                this.filterAndRenderBookmarks();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                Utils.theme.toggle();
            });
        }

        console.log('BookmarksManager: Event listeners setup complete');
    },

    /**
     * Load initial data (bookmarks, categories, topics)
     */
    async loadInitialData() {
        this.state.isLoading = true;
        this.showLoadingState();

        try {
            // Load data in parallel
            const [bookmarks, categories, topics] = await Promise.all([
                BookmarkAPI.getAll(),
                Category.getAll(),
                API.topics.getAll()
            ]);

            this.state.bookmarks = bookmarks || [];
            this.state.categories = categories || [];
            this.state.topics = topics || [];

            console.log('BookmarksManager: Loaded data:', {
                bookmarks: this.state.bookmarks.length,
                categories: this.state.categories.length,
                topics: this.state.topics.length
            });

            // Debug: Log first few bookmarks to check data structure
            if (this.state.bookmarks.length > 0) {
                console.log('BookmarksManager: Sample bookmark data:', this.state.bookmarks[0]);
            } else {
                console.log('BookmarksManager: No bookmarks found in response');
            }

            this.populateFilterDropdowns();

        } catch (error) {
            console.error('Error loading initial data:', error);
            Utils.showToast('Error loading bookmarks: ' + error.message, 'error');
            this.showErrorState(error.message);
        } finally {
            this.state.isLoading = false;
        }
    },

    /**
     * Populate filter dropdowns with data
     */
    populateFilterDropdowns() {
        // Categories dropdown
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter && this.state.categories.length > 0) {
            const currentValue = categoryFilter.value;
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                this.state.categories
                    .sort((a, b) => (a.display_name || a.name).localeCompare(b.display_name || b.name))
                    .map(cat => `<option value="${Utils.escapeHTML(cat.name)}">${Utils.escapeHTML(cat.display_name || cat.name)}</option>`)
                    .join('');
            categoryFilter.value = currentValue;
        }

        // Topics dropdown
        const topicFilter = document.getElementById('topic-filter');
        if (topicFilter && this.state.topics.length > 0) {
            const currentValue = topicFilter.value;
            topicFilter.innerHTML = '<option value="">All Topics</option>' +
                this.state.topics
                    .sort((a, b) => (a.display_name || a.name).localeCompare(b.display_name || b.name))
                    .map(topic => `<option value="${Utils.escapeHTML(topic.name)}">${Utils.escapeHTML(topic.display_name || topic.name)}</option>`)
                    .join('');
            topicFilter.value = currentValue;
        }
    },

    /**
     * Filter and render bookmarks
     */
    async filterAndRenderBookmarks() {
        console.log('BookmarksManager: Starting filter and render with', this.state.bookmarks.length, 'bookmarks');
        
        let filtered = [...this.state.bookmarks];

        // Apply topic filter first (requires API call)
        if (this.state.filters.topic) {
            try {
                filtered = await BookmarkAPI.getByTopic(this.state.filters.topic);
            } catch (error) {
                console.error('Error filtering by topic:', error);
                Utils.showToast('Error filtering by topic', 'error');
            }
        }

        // Apply other filters
        filtered = BookmarkAPI.filterBookmarks(filtered, this.state.searchQuery, {
            category: this.state.filters.category
        });

        // Sort bookmarks
        filtered = BookmarkAPI.sortBookmarks(filtered, this.state.filters.sortBy, this.state.filters.sortDirection);

        console.log('BookmarksManager: After filtering, have', filtered.length, 'bookmarks to display');

        this.state.filteredBookmarks = filtered;
        this.renderBookmarks();
    },

    /**
     * Render bookmarks in the grid
     */
    renderBookmarks() {
        const grid = document.getElementById('bookmarks-grid');
        const loading = document.getElementById('bookmarks-loading');
        const empty = document.getElementById('bookmarks-empty');

        if (!grid || !loading || !empty) {
            console.error('BookmarksManager: Required DOM elements not found');
            return;
        }

        // Hide loading state
        loading.classList.add('hidden');

        // Show empty state if no bookmarks
        if (this.state.filteredBookmarks.length === 0) {
            grid.classList.add('hidden');
            empty.classList.remove('hidden');
            return;
        }

        // Hide empty state and show grid
        empty.classList.add('hidden');
        grid.classList.remove('hidden');

        // Render bookmark cards
        grid.innerHTML = this.state.filteredBookmarks.map(bookmark => this.renderBookmarkCard(bookmark)).join('');

        console.log(`BookmarksManager: Rendered ${this.state.filteredBookmarks.length} bookmarks`);
    },

    /**
     * Render a single bookmark card
     * @param {Object} bookmark - Bookmark data
     * @returns {string} HTML for bookmark card
     */
    renderBookmarkCard(bookmark) {
        const domain = Utils.extractDomain(bookmark.url);
        const title = bookmark.title || Utils.truncateText(bookmark.url, 50);
        const categories = bookmark.categories || [];
        const createdDate = Utils.formatRelativeTime(bookmark.created_on);
        
        return `
            <div class="card hover:shadow-medium transition-all duration-200" data-bookmark-id="${bookmark.id}">
                <div class="card-body">
                    <!-- Header with title and actions -->
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="font-semibold text-lg text-neutral-900 dark:text-neutral-100 leading-tight flex-1 mr-3">
                            <a href="${Utils.escapeHTML(bookmark.url)}" target="_blank" 
                               class="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                                ${Utils.escapeHTML(title)}
                            </a>
                        </h3>
                        <div class="flex items-center space-x-2 flex-shrink-0">
                            <button onclick="BookmarksManager.showEditModal(${bookmark.id})" 
                                    class="p-1.5 text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    title="Edit bookmark">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="BookmarksManager.showDeleteModal(${bookmark.id})" 
                                    class="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    title="Delete bookmark">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- URL and domain -->
                    <div class="mb-3">
                        <div class="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                            </svg>
                            <span class="font-medium">${Utils.escapeHTML(domain)}</span>
                        </div>
                        <div class="mt-1 text-xs text-neutral-500 dark:text-neutral-500 break-all">
                            ${Utils.escapeHTML(Utils.truncateText(bookmark.url, 60))}
                        </div>
                    </div>

                    <!-- Content/Description -->
                    ${bookmark.content ? `
                        <div class="mb-3">
                            <p class="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2">
                                ${Utils.escapeHTML(Utils.truncateText(bookmark.content, 120))}
                            </p>
                        </div>
                    ` : ''}

                    <!-- Categories -->
                    <div class="mb-3">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Categories</span>
                            <button onclick="BookmarksManager.showCategoryModal(${bookmark.id})" 
                                    class="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium">
                                Manage
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-1.5" id="bookmark-categories-${bookmark.id}">
                            ${categories.length > 0 ? categories.map(cat => `
                                <span class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
                                    ${Utils.escapeHTML(cat)}
                                </span>
                            `).join('') : `
                                <span class="text-xs text-neutral-500 dark:text-neutral-400 italic">No categories assigned</span>
                            `}
                        </div>
                    </div>

                    <!-- Footer with metadata -->
                    <div class="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                        <div class="flex items-center">
                            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span title="${Utils.formatDate(bookmark.created_on)}">
                                ${createdDate}
                            </span>
                        </div>
                        <div class="flex items-center space-x-2">
                            ${bookmark.status ? `
                                <span class="px-2 py-0.5 rounded-full text-xs font-medium ${this.getStatusStyle(bookmark.status)}">
                                    ${Utils.escapeHTML(this.getStatusLabel(bookmark.status))}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show loading state
     */
    showLoadingState() {
        const loading = document.getElementById('bookmarks-loading');
        const grid = document.getElementById('bookmarks-grid');
        const empty = document.getElementById('bookmarks-empty');

        if (loading) loading.classList.remove('hidden');
        if (grid) grid.classList.add('hidden');
        if (empty) empty.classList.add('hidden');
    },

    /**
     * Show error state
     * @param {string} message - Error message
     */
    showErrorState(message) {
        const loading = document.getElementById('bookmarks-loading');
        if (loading) {
            loading.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Error Loading Bookmarks</h3>
                    <p class="text-neutral-600 dark:text-neutral-400 mb-6">${Utils.escapeHTML(message)}</p>
                    <button onclick="BookmarksManager.init()" class="btn-primary">
                        Try Again
                    </button>
                </div>
            `;
        }
    },

    /**
     * Update sort direction button appearance
     */
    updateSortDirectionButton() {
        const btn = document.getElementById('sort-direction-btn');
        if (btn) {
            const isAsc = this.state.filters.sortDirection === 'asc';
            btn.innerHTML = `
                <svg class="w-4 h-4 ${isAsc ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                </svg>
            `;
            btn.title = `Sort ${isAsc ? 'ascending' : 'descending'}`;
        }
    },

    /**
     * Show create bookmark modal
     */
    showCreateModal() {
        const modal = this.createModal('create-bookmark-modal', 'Add New Bookmark', BookmarkModals.renderCreateBookmarkForm());
        BookmarkModals.attachCreateBookmarkHandlers(modal);
    },

    /**
     * Show edit bookmark modal
     * @param {number} bookmarkId - Bookmark ID
     */
    async showEditModal(bookmarkId) {
        try {
            const bookmark = await BookmarkAPI.getById(bookmarkId);
            const modal = this.createModal('edit-bookmark-modal', 'Edit Bookmark', BookmarkModals.renderEditBookmarkForm(bookmark));
            BookmarkModals.attachEditBookmarkHandlers(modal, bookmark);
        } catch (error) {
            console.error('Error loading bookmark for edit:', error);
            Utils.showToast('Error loading bookmark: ' + error.message, 'error');
        }
    },

    /**
     * Show delete confirmation modal
     * @param {number} bookmarkId - Bookmark ID
     */
    showDeleteModal(bookmarkId) {
        const bookmark = this.state.bookmarks.find(b => b.id === bookmarkId);
        if (!bookmark) {
            Utils.showToast('Bookmark not found', 'error');
            return;
        }

        const modal = this.createModal('delete-bookmark-modal', 'Delete Bookmark', BookmarkModals.renderDeleteBookmarkForm(bookmark));
        BookmarkModals.attachDeleteBookmarkHandlers(modal, bookmarkId);
    },

    /**
     * Show category management modal
     * @param {number} bookmarkId - Bookmark ID
     */
    showCategoryModal(bookmarkId) {
        const bookmark = this.state.bookmarks.find(b => b.id === bookmarkId);
        if (!bookmark) {
            Utils.showToast('Bookmark not found', 'error');
            return;
        }

        const modal = this.createModal('category-bookmark-modal', 'Manage Categories', BookmarkModals.renderCategoryManagementForm(bookmark));
        BookmarkModals.attachCategoryManagementHandlers(modal, bookmark);
    },

    /**
     * Create a modal with given content
     * @param {string} modalId - Modal ID
     * @param {string} title - Modal title
     * @param {string} content - Modal content HTML
     * @returns {HTMLElement} Modal element
     */
    createModal(modalId, title, content) {
        // Remove existing modal
        const existing = document.getElementById(modalId);
        if (existing) {
            existing.remove();
        }

        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-neutral-800 rounded-lg shadow-strong max-w-2xl w-full max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">${Utils.escapeHTML(title)}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    ${content}
                </div>
            </div>
        `;

        // Add to container and show
        const container = document.getElementById('bookmark-modals-container');
        if (container) {
            container.appendChild(modal);
        } else {
            document.body.appendChild(modal);
        }

        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    },

    /**
     * Get status label for display
     * @param {string} status - Status code
     * @returns {string} Display label
     */
    getStatusLabel(status) {
        const statusMap = {
            'UN': 'Unread',
            'RD': 'Read', 
            'AR': 'Archived'
        };
        return statusMap[status] || status;
    },

    /**
     * Get status styling classes
     * @param {string} status - Status code
     * @returns {string} CSS classes
     */
    getStatusStyle(status) {
        const styleMap = {
            'UN': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            'RD': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            'AR': 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
        };
        return styleMap[status] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
    },

    /**
     * Refresh bookmarks data
     */
    async refresh() {
        await this.loadInitialData();
        this.filterAndRenderBookmarks();
        Utils.showToast('Bookmarks refreshed', 'success');
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    BookmarksManager.init();
});

// Global functions for compatibility
window.showCreateModal = () => BookmarksManager.showCreateModal();
window.toggleUserMenu = () => document.getElementById('user-dropdown')?.classList.toggle('hidden');
window.logout = () => window.location.href = '/-/ln/logout';
