// Bookmark API Module for LinkNova
// Provides bookmark management and category relationship functions

const BookmarkAPI = {
    /**
     * Handle API response with standard structure
     * @param {Object} response - API response
     * @returns {*} Data from response
     * @throws {Error} If response indicates failure
     */
    _handleResponse(response) {
        console.log('BookmarkAPI: Raw response:', response);
        
        // Handle both direct data responses and {success, data, error} format
        if (response && typeof response === 'object' && response.hasOwnProperty('success')) {
            if (!response.success) {
                throw new Error(response.error || 'API request failed');
            }
            console.log('BookmarkAPI: Extracted data from success response:', response.data);
            return response.data;
        }
        
        // Handle direct array responses (legacy format)
        if (Array.isArray(response)) {
            console.log('BookmarkAPI: Direct array response:', response.length, 'items');
            return response;
        }
        
        // Return response directly if it's not in the standard format
        console.log('BookmarkAPI: Returning response as-is:', response);
        return response;
    },

    /**
     * Get all bookmarks
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} List of bookmarks
     */
    async getAll(params = {}) {
        const response = await API.bookmarks.getAll(params);
        return this._handleResponse(response);
    },

    /**
     * Get bookmark by ID
     * @param {string|number} id - Bookmark ID
     * @returns {Promise<Object>} Bookmark data
     */
    async getById(id) {
        const response = await API.bookmarks.getById(id);
        return this._handleResponse(response);
    },

    /**
     * Create new bookmark
     * @param {Object} data - Bookmark data
     * @returns {Promise<Object>} Created bookmark
     */
    async create(data) {
        const response = await API.bookmarks.create(data);
        return this._handleResponse(response);
    },

    /**
     * Update bookmark
     * @param {string|number} id - Bookmark ID
     * @param {Object} data - Updated bookmark data
     * @returns {Promise<Object>} Updated bookmark
     */
    async update(id, data) {
        const response = await API.bookmarks.update(id, data);
        return this._handleResponse(response);
    },

    /**
     * Delete bookmark
     * @param {string|number} id - Bookmark ID
     * @returns {Promise<Object>} Deletion result
     */
    async delete(id) {
        const response = await API.bookmarks.delete(id);
        return this._handleResponse(response);
    },

    /**
     * Add categories to a bookmark
     * @param {string|number} bookmarkId - Bookmark ID
     * @param {Array<string>} categories - Array of category names to add
     * @returns {Promise<Object>} Result
     */
    async addCategories(bookmarkId, categories) {
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('Categories must be a non-empty array');
        }

        const response = await API.request(`/v1/api/bm/add-cats/${bookmarkId}`, {
            method: 'PUT',
            data: { categories }
        });

        return this._handleResponse(response);
    },

    /**
     * Remove categories from a bookmark
     * @param {string|number} bookmarkId - Bookmark ID
     * @param {Array<string>} categories - Array of category names to remove
     * @returns {Promise<Object>} Result
     */
    async removeCategories(bookmarkId, categories) {
        if (!Array.isArray(categories) || categories.length === 0) {
            throw new Error('Categories must be a non-empty array');
        }

        const response = await API.request(`/v1/api/bm/remove-cats/${bookmarkId}`, {
            method: 'DELETE',
            data: { categories }
        });

        return this._handleResponse(response);
    },

    /**
     * Search bookmarks by query
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Search results
     */
    async search(query, filters = {}) {
        const response = await API.bookmarks.search(query, filters);
        return this._handleResponse(response);
    },

    /**
     * Get bookmarks by category
     * @param {string} categoryName - Category name
     * @returns {Promise<Array>} Filtered bookmarks
     */
    async getByCategory(categoryName) {
        const allBookmarks = await this.getAll();
        return allBookmarks.filter(bookmark => 
            bookmark.categories && bookmark.categories.includes(categoryName)
        );
    },

    /**
     * Get bookmarks by topic (through categories)
     * @param {string} topicName - Topic name
     * @returns {Promise<Array>} Filtered bookmarks
     */
    async getByTopic(topicName) {
        try {
            // Get categories for this topic
            const topicData = await API.topics.getByName(topicName);
            const topicCategories = topicData.categories || [];
            
            if (topicCategories.length === 0) {
                return [];
            }

            // Get all bookmarks and filter by topic categories
            const allBookmarks = await this.getAll();
            return allBookmarks.filter(bookmark => {
                if (!bookmark.categories || bookmark.categories.length === 0) {
                    return false;
                }
                // Check if bookmark has any category from this topic
                return bookmark.categories.some(cat => topicCategories.includes(cat));
            });
        } catch (error) {
            console.error('Error getting bookmarks by topic:', error);
            return [];
        }
    },

    /**
     * Client-side search and filtering
     * @param {Array} bookmarks - Bookmarks to search
     * @param {string} query - Search query
     * @param {Object} filters - Filters to apply
     * @returns {Array} Filtered bookmarks
     */
    filterBookmarks(bookmarks, query = '', filters = {}) {
        let filtered = [...bookmarks];

        // Text search across title, url, content
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim();
            filtered = filtered.filter(bookmark => {
                const title = (bookmark.title || '').toLowerCase();
                const url = (bookmark.url || '').toLowerCase();
                const content = (bookmark.content || '').toLowerCase();
                const host = Utils.extractDomain(bookmark.url).toLowerCase();
                
                return title.includes(searchTerm) ||
                       url.includes(searchTerm) ||
                       content.includes(searchTerm) ||
                       host.includes(searchTerm) ||
                       (bookmark.categories && bookmark.categories.some(cat => 
                           cat.toLowerCase().includes(searchTerm)
                       ));
            });
        }

        // Filter by category
        if (filters.category && filters.category !== '') {
            filtered = filtered.filter(bookmark => 
                bookmark.categories && bookmark.categories.includes(filters.category)
            );
        }

        // Filter by topic (through categories)
        if (filters.topic && filters.topic !== '') {
            // This requires topic data to be available in the calling context
            // For now, we'll skip this filter in client-side filtering
            console.log('Topic filtering requires server-side or additional data');
        }

        return filtered;
    },

    /**
     * Sort bookmarks
     * @param {Array} bookmarks - Bookmarks to sort
     * @param {string} sortBy - Sort field
     * @param {string} direction - Sort direction ('asc' or 'desc')
     * @returns {Array} Sorted bookmarks
     */
    sortBookmarks(bookmarks, sortBy = 'created_on', direction = 'desc') {
        return [...bookmarks].sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'title':
                    aVal = (a.title || a.url || '').toLowerCase();
                    bVal = (b.title || b.url || '').toLowerCase();
                    break;
                case 'url':
                    aVal = (a.url || '').toLowerCase();
                    bVal = (b.url || '').toLowerCase();
                    break;
                case 'created_on':
                case 'updated_on':
                    aVal = new Date(a[sortBy] || 0);
                    bVal = new Date(b[sortBy] || 0);
                    break;
                default:
                    aVal = a[sortBy] || '';
                    bVal = b[sortBy] || '';
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
};