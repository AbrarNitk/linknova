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

        // Basic form validation before submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                const username = document.getElementById('username')?.value?.trim() || '';
                const password = document.getElementById('password')?.value || '';
                
                if (!username || !password) {
                    e.preventDefault(); // Only prevent if validation fails
                    this.showError('Please enter both username and password');
                    return false;
                }

                // If validation passes, let the form submit naturally
                // The server will handle the redirect and cookie setting
                this.setLoading(true);
                this.hideError();
            });
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
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');

        if (errorText) {
            errorText.textContent = message;
        }
        if (errorMessage) {
            errorMessage.classList.remove('hidden');
        }
    },

    hideError() {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LoginPage.init();
});
