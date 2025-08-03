// Simple login functionality
const LoginPage = {
    state: {
        isLoading: false,
        showPassword: false
    },

    init() {
        this.setupEventListeners();
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }
    },

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                Utils.theme.toggle();
            });
        }

        // Enter key handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.state.isLoading) {
                const loginButton = document.getElementById('login-button');
                if (loginButton && !loginButton.disabled) {
                    loginButton.click();
                }
            }
        });
    },

    async handleLogin() {
        if (this.state.isLoading) return;

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberMeInput = document.getElementById('remember-me');
        
        const username = usernameInput?.value?.trim() || '';
        const password = passwordInput?.value || '';
        const rememberMe = rememberMeInput?.checked || false;

        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        try {
            this.setLoading(true);
            this.hideError();

            // Simple POST to login API - let server handle redirect
            const response = await fetch('/-/ln/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    rememberMe: rememberMe
                })
            });


            console.log(response.url);

            // Let the server handle redirect naturally
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }

            const data = await response.json();
            
            if (response.ok) {
                // Success - but no redirect, show message
                Utils.showToast('Login successful!', 'success');
            } else {
                this.showError(data.message || 'Login failed');
            }

        } catch (error) {
            this.showError('Login failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    },

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

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        const loginButton = document.getElementById('login-button');
        const loginText = document.getElementById('login-text');
        const loginSpinner = document.getElementById('login-spinner');

        if (isLoading) {
            loginButton.disabled = true;
            loginText.textContent = 'Signing in...';
            loginSpinner.classList.remove('hidden');
        } else {
            loginButton.disabled = false;
            loginText.textContent = 'Sign in';
            loginSpinner.classList.add('hidden');
        }
    },

    showError(message) {
        const errorAlert = document.getElementById('error-alert');
        const errorMessage = document.getElementById('error-message');
        
        errorMessage.textContent = message;
        errorAlert.classList.remove('hidden');
    },

    hideError() {
        const errorAlert = document.getElementById('error-alert');
        errorAlert.classList.add('hidden');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LoginPage.init();
});