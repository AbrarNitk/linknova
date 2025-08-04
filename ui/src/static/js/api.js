// API communication module for LinkNova
const API = {
    // Base configuration - using /-/ln prefix for all routes
    baseURL: '/-/ln', // All API routes will use /-/ln prefix

    // Request timeout in milliseconds
    timeout: 10000,

    /**
     * Make HTTP request with error handling and loading states
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise} Response data
     */
    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const config = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                signal: controller.signal,
                // Note: Using default redirect behavior - no manual interference
                ...options
            };

            // Add body for non-GET requests
            if (config.method !== 'GET' && options.data) {
                config.body = JSON.stringify(options.data);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, config);

            clearTimeout(timeoutId);

            console.log(`📋 Response details: status=${response.status}, type=${response.type}, redirected=${response.redirected}, url=${response.url}`);

            // Note: Removed automatic redirect detection for login
            // Let the backend response be processed normally

            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new APIError(
                    data.message || `HTTP ${response.status}: ${response.statusText}`,
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', 408);
            }

            if (error instanceof APIError) {
                throw error;
            }

            // Network or other errors
            throw new APIError(
                error.message || 'Network error occurred',
                0,
                { originalError: error }
            );
        }
    },

    // Topic Management APIs
    topics: {
        /**
         * Get all topics
         * @param {Object} params - Query parameters
         * @returns {Promise<Array>} List of topics
         */
        async getAll(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/v1/api/topic${queryString ? `?${queryString}` : ''}`;
            return API.request(endpoint);
        },

        /**
         * Get topic by name
         * @param {string} name - Topic name
         * @returns {Promise<Object>} Topic data
         */
        async getByName(name) {
            return API.request(`/v1/api/topic/${encodeURIComponent(name)}`);
        },

        /**
         * Create new topic
         * @param {Object} data - Topic data
         * @returns {Promise<Object>} Created topic
         */
        async create(data) {
            return API.request('/v1/api/topic', {
                method: 'POST',
                data
            });
        },

        /**
         * Update topic
         * @param {string} name - Topic name
         * @param {Object} data - Updated topic data
         * @returns {Promise<Object>} Updated topic
         */
        async update(name, data) {
            return API.request(`/v1/api/topic/${encodeURIComponent(name)}`, {
                method: 'PUT',
                data
            });
        },

        /**
         * Delete topic
         * @param {string} name - Topic name
         * @returns {Promise<Object>} Deletion result
         */
        async delete(name) {
            return API.request(`/v1/api/topic/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });
        }
    },

    // Category Management APIs
    categories: {
        /**
         * Get all categories
         * @param {Object} params - Query parameters
         * @returns {Promise<Array>} List of categories
         */
        async getAll(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/v1/api/cat${queryString ? `?${queryString}` : ''}`;
            return API.request(endpoint);
        },

        /**
         * Get category by name
         * @param {string} name - Category name
         * @returns {Promise<Object>} Category data
         */
        async getByName(name) {
            return API.request(`/v1/api/cat/${encodeURIComponent(name)}`);
        },

        /**
         * Create new category
         * @param {Object} data - Category data
         * @returns {Promise<Object>} Created category
         */
        async create(data) {
            return API.request('/v1/api/cat', {
                method: 'POST',
                data
            });
        },

        /**
         * Update category
         * @param {string} name - Category name
         * @param {Object} data - Updated category data
         * @returns {Promise<Object>} Updated category
         */
        async update(name, data) {
            return API.request(`/v1/api/cat/${encodeURIComponent(name)}`, {
                method: 'PUT',
                data
            });
        },

        /**
         * Delete category
         * @param {string} name - Category name
         * @returns {Promise<Object>} Deletion result
         */
        async delete(name) {
            return API.request(`/v1/api/cat/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });
        },

        /**
         * Add topic to category
         * @param {string} categoryName - Category name
         * @param {string} topicName - Topic name
         * @returns {Promise<Object>} Result
         */
        async addTopic(categoryName, topicName) {
            return API.request(`/v1/api/cat/${encodeURIComponent(categoryName)}/${encodeURIComponent(topicName)}`, {
                method: 'POST'
            });
        },

        /**
         * Remove topic from category
         * @param {string} categoryName - Category name
         * @param {string} topicName - Topic name
         * @returns {Promise<Object>} Result
         */
        async removeTopic(categoryName, topicName) {
            return API.request(`/v1/api/cat/${encodeURIComponent(categoryName)}/${encodeURIComponent(topicName)}`, {
                method: 'DELETE'
            });
        }
    },

    // Bookmark Management APIs
    bookmarks: {
        /**
         * Get all bookmarks
         * @param {Object} params - Query parameters
         * @returns {Promise<Array>} List of bookmarks
         */
        async getAll(params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const endpoint = `/v1/api/bm${queryString ? `?${queryString}` : ''}`;
            return API.request(endpoint);
        },

        /**
         * Get bookmark by ID
         * @param {string} id - Bookmark ID
         * @returns {Promise<Object>} Bookmark data
         */
        async getById(id) {
            return API.request(`/v1/api/bm/${id}`);
        },

        /**
         * Create new bookmark
         * @param {Object} data - Bookmark data
         * @returns {Promise<Object>} Created bookmark
         */
        async create(data) {
            return API.request('/v1/api/bm', {
                method: 'POST',
                data
            });
        },

        /**
         * Update bookmark
         * @param {string} id - Bookmark ID
         * @param {Object} data - Updated bookmark data
         * @returns {Promise<Object>} Updated bookmark
         */
        async update(id, data) {
            return API.request(`/v1/api/bm/${id}`, {
                method: 'PUT',
                data
            });
        },

        /**
         * Delete bookmark
         * @param {string} id - Bookmark ID
         * @returns {Promise<Object>} Deletion result
         */
        async delete(id) {
            return API.request(`/v1/api/bm/${id}`, {
                method: 'DELETE'
            });
        },

        /**
         * Search bookmarks
         * @param {string} query - Search query
         * @param {Object} filters - Search filters
         * @returns {Promise<Array>} Search results
         */
        async search(query, filters = {}) {
            return API.request('/v1/api/bm/search', {
                method: 'POST',
                data: { query, ...filters }
            });
        }
    },

    // Stats and Analytics APIs
    stats: {
        /**
         * Get dashboard statistics
         * @returns {Promise<Object>} Dashboard stats
         */
        async getDashboard() {
            return API.request('/v1/api/stats/dashboard');
        },

        /**
         * Get topic statistics
         * @param {string} topicName - Topic name (optional)
         * @returns {Promise<Object>} Topic stats
         */
        async getTopics(topicName = null) {
            const endpoint = topicName ? `/v1/api/stats/topics/${encodeURIComponent(topicName)}` : '/v1/api/stats/topics';
            return API.request(endpoint);
        },

        /**
         * Get category statistics
         * @param {string} categoryName - Category name (optional)
         * @returns {Promise<Object>} Category stats
         */
        async getCategories(categoryName = null) {
            const endpoint = categoryName ? `/v1/api/stats/categories/${encodeURIComponent(categoryName)}` : '/v1/api/stats/categories';
            return API.request(endpoint);
        }
    },

    // Authentication APIs
    auth: {
        /**
         * Check authentication status (replaces client-side token checking)
         * @returns {Promise<Object>} Authentication status and redirect info
         */
        async checkStatus() {
            return API.request('/v1/api/auth/status');
        },

        /**
         * User login
         * @param {Object} credentials - Login credentials
         * @returns {Promise<Object>} Authentication response with redirect URL
         */
        async login(credentials) {
            return API.request('/v1/api/auth/login', {
                method: 'POST',
                data: credentials
            });
        },

        /**
         * User logout
         * @returns {Promise<Object>} Logout response with redirect URL
         */
        async logout() {
            return API.request('/v1/api/auth/logout', {
                method: 'POST'
            });
        },

        /**
         * Get current user profile (authenticated request)
         * @returns {Promise<Object>} User data
         */
        async getProfile() {
            return API.request('/v1/api/auth/profile');
        },

        /**
         * Update user profile
         * @param {Object} data - Profile updates
         * @returns {Promise<Object>} Updated profile
         */
        async updateProfile(data) {
            return API.request('/v1/api/auth/profile', {
                method: 'PUT',
                data
            });
        }
    },

    // Utility APIs
    utils: {
        /**
         * Fetch URL metadata
         * @param {string} url - URL to fetch metadata for
         * @returns {Promise<Object>} URL metadata
         */
        async fetchMetadata(url) {
            return API.request('/v1/api/utils/metadata', {
                method: 'POST',
                data: { url }
            });
        },

        /**
         * Health check
         * @returns {Promise<Object>} Health status
         */
        async health() {
            return API.request('/v1/api/health');
        }
    }
};

// Custom error class for API errors
class APIError extends Error {
    constructor(message, status = 0, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }

    get isNetworkError() {
        return this.status === 0;
    }

    get isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    get isServerError() {
        return this.status >= 500;
    }

    get isTimeout() {
        return this.status === 408;
    }
}

// Make APIError available globally
window.APIError = APIError;
