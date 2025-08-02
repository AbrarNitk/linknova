// Login page functionality for LinkNova
const LoginPage = {
    
    // State management
    state: {
        isLoading: false,
        showPassword: false
    },

    /**
     * Initialize login page functionality
     */
    async init() {
        console.log('🔐 Initializing login page...');
        
        // Check if user is already authenticated via backend
        try {
            const authStatus = await API.auth.checkStatus();
            if (authStatus.isAuthenticated) {
                // Backend tells us where to redirect
                window.location.href = authStatus.redirectUrl || '/';
                return;
            }
        } catch (error) {
            // User is not authenticated, continue with login page
            console.log('User not authenticated, showing login form');
        }

        // Setup event listeners
        this.setupEventListeners();
        
        // Focus username field
        document.getElementById('username').focus();
        
        console.log('✅ Login page initialized');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                Utils.theme.toggle();
            });
        }

        // Form validation on input
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        usernameInput.addEventListener('input', () => this.validateField('username'));
        passwordInput.addEventListener('input', () => this.validateField('password'));

        // Enter key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.state.isLoading) {
                const form = document.getElementById('login-form');
                if (form) {
                    form.requestSubmit();
                }
            }
        });
    },

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.state.isLoading) return;

        const formData = new FormData(event.target);
        const credentials = {
            username: formData.get('username').trim(),
            password: formData.get('password'),
            rememberMe: formData.get('remember-me') === 'on'
        };

        // Validate inputs (field errors are already shown by validateForm method)
        if (!this.validateForm(credentials)) {
            return;
        }

        try {
            this.setLoading(true);
            this.hideError();

            // Send login request to backend
            // Backend will set secure HttpOnly cookies and handle session
            const response = await API.auth.login(credentials);
            
            if (response.success) {
                // Backend handles all authentication logic
                this.handleLoginSuccess(response);
            } else {
                this.showError(response.message || 'Login failed');
            }

        } catch (error) {
            console.error('Login error:', error);
            
            if (error instanceof APIError) {
                if (error.status === 401) {
                    this.showError('Invalid username or password');
                } else if (error.status === 429) {
                    this.showError('Too many login attempts. Please try again later.');
                } else if (error.isNetworkError) {
                    this.showError('Network error. Please check your connection.');
                } else {
                    this.showError(error.message || 'Login failed');
                }
            } else {
                this.showError('An unexpected error occurred. Please try again.');
            }
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Validate form inputs
     */
    validateForm(credentials) {
        let isValid = true;

        // Username validation
        if (!credentials.username) {
            this.showFieldError('username', 'Username is required');
            isValid = false;
        } else if (credentials.username.length < 3) {
            this.showFieldError('username', 'Username must be at least 3 characters');
            isValid = false;
        } else {
            this.clearFieldError('username');
        }

        // Password validation
        if (!credentials.password) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        } else if (credentials.password.length < 6) {
            this.showFieldError('password', 'Password must be at least 6 characters');
            isValid = false;
        } else {
            this.clearFieldError('password');
        }

        return isValid;
    },

    /**
     * Validate individual field
     */
    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const value = field.value.trim();

        switch (fieldName) {
            case 'username':
                if (value && value.length >= 3) {
                    this.clearFieldError('username');
                }
                break;
            case 'password':
                if (value && value.length >= 6) {
                    this.clearFieldError('password');
                }
                break;
        }
    },

    /**
     * Show field-specific error
     */
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        field.classList.add('border-error-300', 'focus:border-error-500', 'focus:ring-error-500');
        field.classList.remove('border-neutral-300', 'focus:border-brand-500', 'focus:ring-brand-500');
        
        // Add error message below field if not exists
        let errorElement = document.getElementById(`${fieldName}-error`);
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.id = `${fieldName}-error`;
            errorElement.className = 'mt-1 text-sm text-error-600 dark:text-error-400';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    },

    /**
     * Clear field error
     */
    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        field.classList.remove('border-error-300', 'focus:border-error-500', 'focus:ring-error-500');
        field.classList.add('border-neutral-300', 'focus:border-brand-500', 'focus:ring-brand-500');
        
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.remove();
        }
    },

    /**
     * Handle successful login
     */
    handleLoginSuccess(response) {
        console.log('✅ Login successful');

        // Backend has already set secure HttpOnly cookies
        // Backend provides user info and redirect URL
        
        // Show success message briefly
        const userName = response.user?.name || response.user?.username || 'User';
        Utils.showToast(`Welcome back, ${userName}!`, 'success', 2000);

        // Redirect to URL provided by backend after brief delay
        setTimeout(() => {
            const redirectUrl = response.redirectUrl || '../index.html';
            window.location.href = redirectUrl;
        }, 1000);
    },

    // Client-side authentication checking removed - now handled by backend
    // Authentication status is checked via API.auth.checkStatus() in init()

    /**
     * Toggle password visibility
     */
    togglePassword() {
        const passwordInput = document.getElementById('password');
        const eyeOpen = document.getElementById('eye-open');
        const eyeClosed = document.getElementById('eye-closed');

        this.state.showPassword = !this.state.showPassword;

        if (this.state.showPassword) {
            passwordInput.type = 'text';
            eyeOpen.classList.add('hidden');
            eyeClosed.classList.remove('hidden');
        } else {
            passwordInput.type = 'password';
            eyeOpen.classList.remove('hidden');
            eyeClosed.classList.add('hidden');
        }
    },

    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        const loginButton = document.getElementById('login-button');
        const loginText = document.getElementById('login-text');
        const loginSpinner = document.getElementById('login-spinner');
        const form = document.getElementById('login-form');

        if (isLoading) {
            loginButton.disabled = true;
            loginText.textContent = 'Signing in...';
            loginSpinner.classList.remove('hidden');
            form.classList.add('pointer-events-none', 'opacity-70');
        } else {
            loginButton.disabled = false;
            loginText.textContent = 'Sign in';
            loginSpinner.classList.add('hidden');
            form.classList.remove('pointer-events-none', 'opacity-70');
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        const errorAlert = document.getElementById('error-alert');
        const errorMessage = document.getElementById('error-message');
        
        errorMessage.textContent = message;
        errorAlert.classList.remove('hidden');
        
        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideError();
        }, 10000);
    },

    /**
     * Hide error message
     */
    hideError() {
        const errorAlert = document.getElementById('error-alert');
        errorAlert.classList.add('hidden');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LoginPage.init();
});