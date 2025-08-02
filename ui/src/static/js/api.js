// API communication module for LinkNova
const API = {
    // Base configuration
    baseURL: 'http://localhost:8080', // Update this to match your backend URL
    
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
                ...options
            };

            // Add body for non-GET requests
            if (config.method !== 'GET' && options.data) {
                config.body = JSON.stringify(options.data);
            }

            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            clearTimeout(timeoutId);

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
            const endpoint = `/api/topics${queryString ? `?${queryString}` : ''}`;
            return API.request(endpoint);
        },

        /**
         * Get topic by ID
         * @param {string} id - Topic ID
         * @returns {Promise<Object>} Topic data
         */
        async getById(id) {
            return API.request(`/api/topics/${id}`);
        },

        /**
         * Create new topic
         * @param {Object} data - Topic data
         * @returns {Promise<Object>} Created topic
         */
        async create(data) {
            return API.request('/api/topics', {
                method: 'POST',
                data
            });
        },

        /**
         * Update topic
         * @param {string} id - Topic ID
         * @param {Object} data - Updated topic data
         * @returns {Promise<Object>} Updated topic
         */
        async update(id, data) {
            return API.request(`/api/topics/${id}`, {
                method: 'PUT',
                data
            });
        },

        /**
         * Delete topic
         * @param {string} id - Topic ID
         * @returns {Promise<Object>} Deletion result
         */
        async delete(id) {
            return API.request(`/api/topics/${id}`, {
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
            const endpoint = `/api/categories${queryString ? `?${queryString}` : ''}`;
            return API.request(endpoint);
        },

        /**
         * Get category by ID
         * @param {string} id - Category ID
         * @returns {Promise<Object>} Category data
         */
        async getById(id) {
            return API.request(`/api/categories/${id}`);
        },

        /**
         * Create new category
         * @param {Object} data - Category data
         * @returns {Promise<Object>} Created category
         */
        async create(data) {
            return API.request('/api/categories', {
                method: 'POST',
                data
            });
        },

        /**
         * Update category
         * @param {string} id - Category ID
         * @param {Object} data - Updated category data
         * @returns {Promise<Object>} Updated category
         */
        async update(id, data) {
            return API.request(`/api/categories/${id}`, {
                method: 'PUT',
                data
            });
        },

        /**
         * Delete category
         * @param {string} id - Category ID
         * @returns {Promise<Object>} Deletion result
         */
        async delete(id) {
            return API.request(`/api/categories/${id}`, {
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
            const endpoint = `/api/bookmarks${queryString ? `?${queryString}` : ''}`;
            return API.request(endpoint);
        },

        /**
         * Get bookmark by ID
         * @param {string} id - Bookmark ID
         * @returns {Promise<Object>} Bookmark data
         */
        async getById(id) {
            return API.request(`/api/bookmarks/${id}`);
        },

        /**
         * Create new bookmark
         * @param {Object} data - Bookmark data
         * @returns {Promise<Object>} Created bookmark
         */
        async create(data) {
            return API.request('/api/bookmarks', {
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
            return API.request(`/api/bookmarks/${id}`, {
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
            return API.request(`/api/bookmarks/${id}`, {
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
            return API.request('/api/bookmarks/search', {
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
            return API.request('/api/stats/dashboard');
        },

        /**
         * Get topic statistics
         * @param {string} topicId - Topic ID (optional)
         * @returns {Promise<Object>} Topic stats
         */
        async getTopics(topicId = null) {
            const endpoint = topicId ? `/api/stats/topics/${topicId}` : '/api/stats/topics';
            return API.request(endpoint);
        },

        /**
         * Get category statistics
         * @param {string} categoryId - Category ID (optional)
         * @returns {Promise<Object>} Category stats
         */
        async getCategories(categoryId = null) {
            const endpoint = categoryId ? `/api/stats/categories/${categoryId}` : '/api/stats/categories';
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
            return API.request('/api/auth/status');
        },

        /**
         * User login
         * @param {Object} credentials - Login credentials
         * @returns {Promise<Object>} Authentication response with redirect URL
         */
        async login(credentials) {
            return API.request('/api/auth/login', {
                method: 'POST',
                data: credentials
            });
        },

        /**
         * User logout
         * @returns {Promise<Object>} Logout response with redirect URL
         */
        async logout() {
            return API.request('/api/auth/logout', {
                method: 'POST'
            });
        },

        /**
         * Get current user profile (authenticated request)
         * @returns {Promise<Object>} User data
         */
        async getProfile() {
            return API.request('/api/auth/profile');
        },

        /**
         * Update user profile
         * @param {Object} data - Profile updates
         * @returns {Promise<Object>} Updated profile
         */
        async updateProfile(data) {
            return API.request('/api/auth/profile', {
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
            return API.request('/api/utils/metadata', {
                method: 'POST',
                data: { url }
            });
        },

        /**
         * Health check
         * @returns {Promise<Object>} Health status
         */
        async health() {
            return API.request('/api/health');
        }
    },

    // Convenience methods that match the component expectations
    async getTopics(params = {}) {
        return this.topics.getAll(params);
    },

    async getTopic(id) {
        return this.topics.getById(id);
    },

    async createTopic(data) {
        return this.topics.create(data);
    },

    async updateTopic(id, data) {
        return this.topics.update(id, data);
    },

    async deleteTopic(id) {
        return this.topics.delete(id);
    },

    async getCategories(params = {}) {
        return this.categories.getAll(params);
    },

    async getCategory(id) {
        return this.categories.getById(id);
    },

    async createCategory(data) {
        return this.categories.create(data);
    },

    async updateCategory(id, data) {
        return this.categories.update(id, data);
    },

    async deleteCategory(id) {
        return this.categories.delete(id);
    },

    async getBookmarks(params = {}) {
        return this.bookmarks.getAll(params);
    },

    async getBookmark(id) {
        return this.bookmarks.getById(id);
    },

    async createBookmark(data) {
        return this.bookmarks.create(data);
    },

    async updateBookmark(id, data) {
        return this.bookmarks.update(id, data);
    },

    async deleteBookmark(id) {
        return this.bookmarks.delete(id);
    },

    async searchBookmarks(query, filters = {}) {
        return this.bookmarks.search(query, filters);
    },

    async getStats() {
        return this.stats.getDashboard();
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

// Development mode helpers
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
    console.log('🔧 Development mode: Using mock API data');
    
    // Mock data for development
    const mockData = {
        topics: [
            {
                id: '1',
                name: 'Web Development',
                description: 'Resources for web development and programming',
                categories: [
                    { id: '1', name: 'Frontend' },
                    { id: '2', name: 'Backend' }
                ],
                categoryCount: 2,
                bookmarkCount: 15,
                createdAt: new Date('2024-01-15').toISOString()
            },
            {
                id: '2',
                name: 'Design',
                description: 'UI/UX design resources and inspiration',
                categories: [
                    { id: '3', name: 'UI Design' },
                    { id: '4', name: 'UX Research' }
                ],
                categoryCount: 2,
                bookmarkCount: 8,
                createdAt: new Date('2024-01-10').toISOString()
            }
        ],
        categories: [
            {
                id: '1',
                name: 'Frontend',
                description: 'Frontend development resources',
                color: 'tech',
                topics: [
                    { id: '1', name: 'Web Development' }
                ],
                topicCount: 1,
                bookmarkCount: 10,
                createdAt: new Date('2024-01-15').toISOString()
            },
            {
                id: '2',
                name: 'Backend',
                description: 'Backend development and APIs',
                color: 'business',
                topics: [
                    { id: '1', name: 'Web Development' }
                ],
                topicCount: 1,
                bookmarkCount: 5,
                createdAt: new Date('2024-01-12').toISOString()
            },
            {
                id: '3',
                name: 'UI Design',
                description: 'User interface design resources',
                color: 'design',
                topics: [
                    { id: '2', name: 'Design' }
                ],
                topicCount: 1,
                bookmarkCount: 6,
                createdAt: new Date('2024-01-10').toISOString()
            }
        ],
        stats: {
            bookmarks: 23,
            categories: 3,
            topics: 2,
            lastUpdated: new Date().toISOString()
        }
    };

    // Override API methods with mock data in development
    API.getTopics = async (params = {}) => {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return mockData.topics;
    };

    API.getCategories = async (params = {}) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockData.categories;
    };

    API.getStats = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockData.stats;
    };

    // Mock secure authentication for development
    // Simulate backend setting HttpOnly cookies and providing redirect URLs
    
    let mockAuthenticatedUser = null; // Simulate server-side session
    
    API.auth.checkStatus = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (mockAuthenticatedUser) {
            return {
                isAuthenticated: true,
                user: mockAuthenticatedUser,
                redirectUrl: '../index.html'
            };
        } else {
            throw new APIError('Not authenticated', 401);
        }
    };
    
    API.auth.login = async (credentials) => {
        console.log('🔐 Mock API: Login called with:', credentials.username);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        
        // Mock users for testing
        const validUsers = [
            { username: 'admin', password: 'admin123', name: 'Admin User', email: 'admin@linknova.com' },
            { username: 'demo', password: 'demo123', name: 'Demo User', email: 'demo@linknova.com' },
            { username: 'test@example.com', password: 'test123', name: 'Test User', email: 'test@example.com' }
        ];

        const user = validUsers.find(u => 
            (u.username === credentials.username || u.email === credentials.username) && 
            u.password === credentials.password
        );

        if (user) {
            // Simulate backend setting session and cookies
            mockAuthenticatedUser = {
                id: user.username,
                username: user.username,
                name: user.name,
                email: user.email
            };
            
            return {
                success: true,
                user: mockAuthenticatedUser,
                redirectUrl: '../index.html', // Backend provides redirect URL
                message: 'Login successful'
            };
        } else {
            throw new APIError('Invalid username or password', 401);
        }
    };

    API.auth.logout = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        mockAuthenticatedUser = null; // Clear server-side session
        return { 
            success: true, 
            redirectUrl: './components/login.html' // Backend provides logout redirect
        };
    };

    API.auth.getProfile = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (mockAuthenticatedUser) {
            return mockAuthenticatedUser;
        } else {
            throw new APIError('Not authenticated', 401);
        }
    };

    API.createTopic = async (data) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newTopic = {
            id: String(mockData.topics.length + 1),
            ...data,
            categoryCount: data.categories?.length || 0,
            bookmarkCount: 0,
            categories: data.categories ? mockData.categories.filter(c => data.categories.includes(c.id)) : [],
            createdAt: new Date().toISOString()
        };
        mockData.topics.push(newTopic);
        return newTopic;
    };

    API.createCategory = async (data) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newCategory = {
            id: String(mockData.categories.length + 1),
            ...data,
            topicCount: data.topics?.length || 0,
            bookmarkCount: 0,
            topics: data.topics ? mockData.topics.filter(t => data.topics.includes(t.id)) : [],
            createdAt: new Date().toISOString()
        };
        mockData.categories.push(newCategory);
        return newCategory;
    };

    API.updateTopic = async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const index = mockData.topics.findIndex(t => t.id === id);
        if (index >= 0) {
            mockData.topics[index] = {
                ...mockData.topics[index],
                ...data,
                categories: data.categories ? mockData.categories.filter(c => data.categories.includes(c.id)) : mockData.topics[index].categories
            };
            return mockData.topics[index];
        }
        throw new APIError('Topic not found', 404);
    };

    API.updateCategory = async (id, data) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const index = mockData.categories.findIndex(c => c.id === id);
        if (index >= 0) {
            mockData.categories[index] = {
                ...mockData.categories[index],
                ...data,
                topics: data.topics ? mockData.topics.filter(t => data.topics.includes(t.id)) : mockData.categories[index].topics
            };
            return mockData.categories[index];
        }
        throw new APIError('Category not found', 404);
    };

    API.deleteTopic = async (id) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const index = mockData.topics.findIndex(t => t.id === id);
        if (index >= 0) {
            mockData.topics.splice(index, 1);
            return { success: true };
        }
        throw new APIError('Topic not found', 404);
    };

    API.deleteCategory = async (id) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const index = mockData.categories.findIndex(c => c.id === id);
        if (index >= 0) {
            mockData.categories.splice(index, 1);
            return { success: true };
        }
        throw new APIError('Category not found', 404);
    };

    console.log('✅ Mock API loaded successfully');
}