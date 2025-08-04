// Category API Module for LinkNova
// Provides topic-category relationship management functions

const Category = {
    /**
     * Handle API response with standard structure
     * @param {Object} response - API response
     * @returns {*} Data from response
     * @throws {Error} If response indicates failure
     */
    _handleResponse(response) {
        // Handle both direct data responses and {success, data, error} format
        if (response && typeof response === 'object' && response.hasOwnProperty('success')) {
            if (!response.success) {
                throw new Error(response.error || 'API request failed');
            }
            return response.data;
        }
        // Return response directly if it's not in the standard format
        return response;
    },

    /**
     * Add categories to a topic
     * @param {string} topicName - Topic name
     * @param {Array<string>} categories - Array of category names to add
     * @returns {Promise<Object>} Result
     */
    async addToTopic(topicName, categories) {
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('Categories must be a non-empty array');
        }

        const response = await API.request(`/v1/api/topic/${encodeURIComponent(topicName)}/add-cats`, {
            method: 'PUT',
            data: { categories }
        });

        return this._handleResponse(response);
    },

    /**
     * Remove categories from a topic
     * @param {string} topicName - Topic name  
     * @param {Array<string>} categories - Array of category names to remove
     * @returns {Promise<Object>} Result
     */
    async removeFromTopic(topicName, categories) {
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('Categories must be a non-empty array');
        }

        const response = await API.request(`/v1/api/topic/${encodeURIComponent(topicName)}/remove-cats`, {
            method: 'DELETE',
            data: { categories }
        });

        return this._handleResponse(response);
    },

    /**
     * Get all categories
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} List of categories
     */
    async getAll(params = {}) {
        const response = await API.categories.getAll(params);
        return this._handleResponse(response);
    },

    /**
     * Get category by name
     * @param {string} name - Category name
     * @returns {Promise<Object>} Category data
     */
    async getByName(name) {
        const response = await API.categories.getByName(name);
        return this._handleResponse(response);
    },

    /**
     * Create new category
     * @param {Object} data - Category data
     * @returns {Promise<Object>} Created category
     */
    async create(data) {
        const response = await API.categories.create(data);
        return this._handleResponse(response);
    },

    /**
     * Update category
     * @param {string} name - Category name
     * @param {Object} data - Updated category data
     * @returns {Promise<Object>} Updated category
     */
    async update(name, data) {
        const response = await API.categories.update(name, data);
        return this._handleResponse(response);
    },

    /**
     * Delete category
     * @param {string} name - Category name
     * @returns {Promise<Object>} Deletion result
     */
    async delete(name) {
        const response = await API.categories.delete(name);
        return this._handleResponse(response);
    },

    /**
     * Search categories by name (client-side filtering)
     * @param {string} query - Search query
     * @param {number} limit - Maximum results to return
     * @returns {Promise<Array>} Filtered categories
     */
    async search(query, limit = 10) {
        const allCategories = await this.getAll();
        
        if (!query || query.trim() === '') {
            return allCategories.slice(0, limit);
        }

        const searchTerm = query.toLowerCase().trim();
        const filtered = allCategories.filter(category => 
            category.name.toLowerCase().includes(searchTerm) ||
            (category.display_name && category.display_name.toLowerCase().includes(searchTerm)) ||
            (category.description && category.description.toLowerCase().includes(searchTerm))
        );

        return filtered.slice(0, limit);
    }
};