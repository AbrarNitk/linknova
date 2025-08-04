/**
 * Global Application Utilities for LinkNova
 * Simplified version without SPA routing - handles only essential functions
 */

const App = {
    // Application state
    state: {
        isAuthenticated: false,
        user: null
    },

    /**
     * Initialize essential application features
     */
    async init() {
        console.log('🚀 Initializing LinkNova utilities...');

        try {
            // Initialize theme system
            Utils.theme.init();

            // Check authentication status
            await this.checkAuthentication();

            // Setup global event listeners
            this.setupEventListeners();

            console.log('✅ LinkNova utilities initialized');

        } catch (error) {
            console.error('❌ Failed to initialize LinkNova utilities:', error);
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
    },

    /**
     * Handle user logout
     */
    async logout() {
        try {
            // Call backend logout endpoint
            await API.auth.logout();

            // Clear local state
            this.clearAuthentication();

            // Redirect to login page
            window.location.href = '/-/ln/login';

        } catch (error) {
            console.error('Logout error:', error);
            Utils.showToast('Error during logout', 'error');

            // Force redirect to login even if logout API fails
            window.location.href = '/-/ln/login';
        }
    },

    /**
     * Update user interface with authentication info
     */
    updateUserInterface() {
        if (!this.state.user) {return;}

        // Update user name in header
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
            userNameEl.textContent = this.state.user.name || this.state.user.username || 'User';
        }

        // Update user initial
        const userInitialEl = document.getElementById('user-initial');
        if (userInitialEl) {
            const name = this.state.user.name || this.state.user.username || 'U';
            userInitialEl.textContent = name.charAt(0).toUpperCase();
        }
    },

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Global error handling
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);

            // Show user-friendly error message
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

        // Theme toggle functionality
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = Utils.theme.toggle();
                Utils.showToast(`Switched to ${newTheme} theme`, 'info', 2000);
            });
        }
    }
};

// Global utility functions for backward compatibility
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown?.classList.toggle('hidden');
}

// Initialize when DOM is ready (only if not on a dedicated page)
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize global utilities if we're not on a dedicated page
    // Dedicated pages (category, topic, bookmark) handle their own initialization
    const isDedicatedPage = document.body.classList.contains('dedicated-page') ||
                           window.location.pathname.includes('/-/ln/category') ||
                           window.location.pathname.includes('/-/ln/topic') ||
                           window.location.pathname.includes('/-/ln/bookmark');

    if (!isDedicatedPage) {
        App.init();
    }
});
