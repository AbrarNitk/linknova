// Main application module for LinkNova
const App = {
    // Application state
    state: {
        currentPage: 'bookmarks',
        isLoading: false,
        user: null,
        isAuthenticated: false,
        data: {
            bookmarks: [],
            topics: [],
            categories: [],
            stats: {}
        }
    },

    // Page components mapping
    pages: {
        bookmarks: 'BookmarksPage',
        topics: 'TopicsManager', 
        categories: 'CategoriesManager',
        admin: 'AdminDashboard'
    },

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 Initializing LinkNova...');
        
        try {
            // Initialize utilities and theme
            Utils.theme.init();
            

        // Note: Removed automatic redirect to login - let backend handle authentication
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Initialize routing
            this.initRouting();
            
            // Navigate to initial page
            const initialPage = this.getInitialPage();
            await this.navigateTo(initialPage);
            
            console.log('✅ LinkNova initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize LinkNova:', error);
            Utils.showToast('Failed to initialize application', 'error');
        }
    },

    /**
     * Check authentication status via backend
     */
    async checkAuthentication() {
        try {
            // Ask backend if user is authenticated (checks HttpOnly cookies)
            const authStatus = await API.auth.checkStatus();
            
            if (authStatus.isAuthenticated) {
                this.state.isAuthenticated = true;
                this.state.user = authStatus.user;
                
                // Update UI with user information
                this.updateUserInterface();
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            // User is not authenticated or session expired
            console.log('User not authenticated:', error.message);
            this.clearAuthentication();
            return false;
        }
    },

    /**
     * Clear local authentication state
     */
    clearAuthentication() {
        this.state.isAuthenticated = false;
        this.state.user = null;
        
        // No client-side storage or cookies to clear
        // Backend handles all authentication data via HttpOnly cookies
    },

    /**
     * Handle user logout
     */
    async logout() {
        try {
            // Call logout API - backend clears HttpOnly cookies and session
            const response = await API.auth.logout();
            
            // Clear local state
            this.clearAuthentication();
            
            // Show logout message
            Utils.showToast('You have been logged out', 'info', 3000);
            
            // Note: Removed automatic redirect - let backend handle logout redirect
            
        } catch (error) {
            console.error('Logout failed:', error);
            
            // If logout API fails, still clear local state and redirect
            this.clearAuthentication();
            Utils.showToast('Logout failed, but redirecting to login', 'warning');
            
            // Note: Removed automatic redirect on logout failure
        }
    },

    /**
     * Redirect to login page - REMOVED
     * Note: Frontend no longer handles redirects automatically
     */
    redirectToLogin() {
        console.log('⚠️ redirectToLogin called but redirect logic removed');
        // Redirect logic removed - let backend handle authentication
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            }
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = Utils.theme.toggle();
                Utils.showToast(`Switched to ${newTheme} theme`, 'info', 2000);
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Global search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.handleGlobalSearch(e.target.value);
            }, 300));

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleGlobalSearch(e.target.value);
                }
            });
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || this.getInitialPage();
            this.navigateTo(page, false); // Don't push to history
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            Utils.showToast('Back online', 'success', 3000);
        });

        window.addEventListener('offline', () => {
            Utils.showToast('You are offline', 'warning', 5000);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            
            if (e.reason instanceof APIError) {
                if (e.reason.isNetworkError) {
                    Utils.showToast('Network error. Please check your connection.', 'error');
                } else if (e.reason.isServerError) {
                    Utils.showToast('Server error. Please try again later.', 'error');
                } else {
                    Utils.showToast(e.reason.message, 'error');
                }
            } else {
                Utils.showToast('An unexpected error occurred', 'error');
            }
        });

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            const userDropdown = document.getElementById('user-dropdown');
            
            if (userMenu && userDropdown && !userMenu.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    },

    /**
     * Load initial application data
     */
    async loadInitialData() {
        this.setLoading(true);
        
        try {
            // Load basic stats and configuration
            const stats = await API.getStats();
            this.state.data.stats = stats;
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            // Don't show error toast here, let individual components handle their errors
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Initialize routing system
     */
    initRouting() {
        // Parse initial URL
        const path = window.location.pathname;
        const page = this.parsePageFromPath(path);
        this.state.currentPage = page;
    },

    /**
     * Get initial page based on URL or default
     */
    getInitialPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        
        if (pageParam && this.pages[pageParam]) {
            return pageParam;
        }
        
        // Check localStorage for last visited page
        const lastPage = Utils.storage.get('lastPage');
        if (lastPage && this.pages[lastPage]) {
            return lastPage;
        }
        
        return 'bookmarks'; // Default page
    },

    /**
     * Parse page from URL path
     */
    parsePageFromPath(path) {
        const segments = path.split('/').filter(Boolean);
        const page = segments[0] || 'bookmarks';
        return this.pages[page] ? page : 'bookmarks';
    },

    /**
     * Navigate to a specific page
     */
    async navigateTo(page, pushState = true) {
        if (!this.pages[page]) {
            console.warn(`Page "${page}" not found`);
            return;
        }

        try {
            this.setLoading(true);
            
            // Update navigation active states
            this.updateNavigation(page);
            
            // Load page content
            await this.loadPage(page);
            
            // Update browser history
            if (pushState) {
                const url = new URL(window.location);
                url.searchParams.set('page', page);
                window.history.pushState({ page }, '', url);
            }
            
            // Update state
            this.state.currentPage = page;
            
            // Save to localStorage
            Utils.storage.set('lastPage', page);
            
        } catch (error) {
            console.error(`Error navigating to ${page}:`, error);
            Utils.showToast(`Failed to load ${page}`, 'error');
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Update navigation active states
     */
    updateNavigation(activePage) {
        // Update main navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            const page = link.dataset.page;
            if (page === activePage) {
                link.classList.remove('nav-link');
                link.classList.add('nav-link-active');
            } else {
                link.classList.remove('nav-link-active');
                link.classList.add('nav-link');
            }
        });

        // Update page title
        const pageTitle = {
            bookmarks: 'Bookmarks',
            topics: 'Topics',
            categories: 'Categories',
            admin: 'Admin'
        };
        
        document.title = `LinkNova - ${pageTitle[activePage] || 'Bookmark Manager'}`;
    },

    /**
     * Load page content
     */
    async loadPage(page) {
        const contentContainer = document.getElementById('page-content');
        if (!contentContainer) {
            throw new Error('Page content container not found');
        }

        // Show loading state
        this.showLoadingState(contentContainer);

        try {
            let content = '';
            
            switch (page) {
                case 'bookmarks':
                    content = await this.loadBookmarksPage();
                    break;
                case 'topics':
                    content = await this.loadTopicsPage();
                    break;
                case 'categories':
                    content = await this.loadCategoriesPage();
                    break;
                case 'admin':
                    content = await this.loadAdminPage();
                    break;
                default:
                    content = '<div class="text-center py-12"><h2>Page not found</h2></div>';
            }
            
            contentContainer.innerHTML = content;
            
            // Initialize page-specific functionality
            await this.initializePage(page);
            
        } catch (error) {
            console.error(`Error loading ${page} page:`, error);
            contentContainer.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-error-600 mb-4">
                        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Failed to load page</h2>
                    <p class="text-neutral-600 dark:text-neutral-400 mb-4">Sorry, we couldn't load this page.</p>
                    <button class="btn-primary" onclick="App.navigateTo('${page}')">Try Again</button>
                </div>
            `;
        }
    },

    /**
     * Show loading state in container
     */
    showLoadingState(container) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
        `;
    },

    /**
     * Load bookmarks page content
     */
    async loadBookmarksPage() {
        return `
            <div class="bookmarks-page">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                            My Bookmarks
                        </h1>
                        <p class="mt-2 text-neutral-600 dark:text-neutral-400">
                            Organize and manage your saved links
                        </p>
                    </div>
                    <button class="btn-primary" onclick="BookmarksPage.showCreateModal()">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Bookmark
                    </button>
                </div>
                
                <!-- Filters and Search -->
                <div class="card mb-6">
                    <div class="card-body">
                        <div class="flex flex-col lg:flex-row gap-4">
                            <div class="flex-1">
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg class="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                        </svg>
                                    </div>
                                    <input type="text" id="bookmark-search" 
                                           placeholder="Search bookmarks..." 
                                           class="form-input pl-10 pr-4 py-2 w-full">
                                </div>
                            </div>
                            <div class="flex items-center space-x-4">
                                <select id="topic-filter" class="form-input">
                                    <option value="">All Topics</option>
                                </select>
                                <select id="category-filter" class="form-input">
                                    <option value="">All Categories</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Bookmarks Grid -->
                <div id="bookmarks-container">
                    <div id="bookmarks-loading" class="flex items-center justify-center py-12">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    </div>
                    
                    <div id="bookmarks-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
                        <!-- Bookmarks will be populated here -->
                    </div>
                    
                    <div id="bookmarks-empty" class="text-center py-12 hidden">
                        <svg class="w-16 h-16 mx-auto mb-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                        <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">No bookmarks found</h3>
                        <p class="text-neutral-600 dark:text-neutral-400 mb-6">Start building your collection by adding your first bookmark</p>
                        <button class="btn-primary" onclick="BookmarksPage.showCreateModal()">
                            Add Your First Bookmark
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Load topics page content
     */
    async loadTopicsPage() {
        const response = await fetch('/-/ln/admin/topics/index.html');
        return await response.text();
    },

    /**
     * Load categories page content
     */
    async loadCategoriesPage() {
        const response = await fetch('/-/ln/admin/cats/index.html');
        return await response.text();
    },

    /**
     * Load admin page content
     */
    async loadAdminPage() {
        const response = await fetch('/-/ln/admin/index.html');
        return await response.text();
    },

    /**
     * Initialize page-specific functionality
     */
    async initializePage(page) {
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        switch (page) {
            case 'bookmarks':
                if (typeof BookmarksPage !== 'undefined' && BookmarksPage.init) {
                    await BookmarksPage.init();
                }
                break;
            case 'topics':
                if (typeof TopicsManager !== 'undefined' && TopicsManager.init) {
                    await TopicsManager.init();
                }
                break;
            case 'categories':
                if (typeof CategoriesManager !== 'undefined' && CategoriesManager.init) {
                    await CategoriesManager.init();
                }
                break;
            case 'admin':
                if (typeof AdminDashboard !== 'undefined' && AdminDashboard.init) {
                    await AdminDashboard.init();
                }
                break;
        }
    },

    /**
     * Handle global search
     */
    async handleGlobalSearch(query) {
        if (!query.trim()) return;
        
        try {
            this.setLoading(true);
            
            // If we're not on bookmarks page, navigate there first
            if (this.state.currentPage !== 'bookmarks') {
                await this.navigateTo('bookmarks');
            }
            
            // Trigger search in bookmarks page
            if (typeof BookmarksPage !== 'undefined' && BookmarksPage.search) {
                await BookmarksPage.search(query);
            }
            
        } catch (error) {
            console.error('Global search error:', error);
            Utils.showToast('Search failed', 'error');
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Set application loading state
     */
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        // Update UI loading indicators
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(el => {
            if (isLoading) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    },

    /**
     * Get current application state
     */
    getState() {
        return { ...this.state };
    },

    /**
     * Update application state
     */
    setState(updates) {
        this.state = { ...this.state, ...updates };
    },

    /**
     * Update user interface with user information
     */
    updateUserInterface() {
        if (!this.state.user) return;

        const userInitial = document.getElementById('user-initial');
        const userName = document.getElementById('user-name');
        
        if (userInitial) {
            const initial = this.state.user.name ? 
                this.state.user.name.charAt(0).toUpperCase() : 
                this.state.user.username.charAt(0).toUpperCase();
            userInitial.textContent = initial;
        }
        
        if (userName) {
            userName.textContent = this.state.user.name || this.state.user.username;
        }
    },

    /**
     * Refresh current page
     */
    async refresh() {
        await this.navigateTo(this.state.currentPage, false);
    }
};

// Global function for user menu toggle (called from HTML)
function toggleUserMenu() {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.classList.toggle('hidden');
    }
}

// Placeholder for BookmarksPage (to be implemented)
const BookmarksPage = {
    async init() {
        console.log('BookmarksPage initialized');
        // TODO: Implement bookmarks page functionality
    },
    
    async search(query) {
        console.log('Searching bookmarks for:', query);
        // TODO: Implement search functionality
    },
    
    showCreateModal() {
        Utils.showToast('Bookmark creation coming soon!', 'info');
        // TODO: Implement bookmark creation modal
    }
};

// Admin App helpers (for quick actions in admin dashboard)
const AdminApp = {
    showCreateTopicModal() {
        if (typeof TopicsManager !== 'undefined' && TopicsManager.showCreateModal) {
            TopicsManager.showCreateModal();
        } else {
            App.navigateTo('topics');
        }
    },
    
    showCreateCategoryModal() {
        if (typeof CategoriesManager !== 'undefined' && CategoriesManager.showCreateModal) {
            CategoriesManager.showCreateModal();
        } else {
            App.navigateTo('categories');
        }
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App available globally for debugging
window.App = App;