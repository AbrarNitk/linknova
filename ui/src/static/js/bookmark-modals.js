// Bookmark Modal Components for LinkNova
// Handles modal forms and interactions for bookmark management

const BookmarkModals = {
    /**
     * Render create bookmark form
     * @returns {string} Form HTML
     */
    renderCreateBookmarkForm() {
        return `
            <form id="create-bookmark-form" class="space-y-6">
                <div>
                    <label for="create-url" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        URL <span class="text-red-500">*</span>
                    </label>
                    <input type="url" id="create-url" name="url" required
                           class="form-input w-full" 
                           placeholder="https://example.com">
                </div>

                <div>
                    <label for="create-title" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Title
                    </label>
                    <input type="text" id="create-title" name="title"
                           class="form-input w-full" 
                           placeholder="Bookmark title (auto-detected from URL if empty)">
                </div>

                <div>
                    <label for="create-content" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Description
                    </label>
                    <textarea id="create-content" name="content" rows="3"
                              class="form-input w-full" 
                              placeholder="Optional description or notes"></textarea>
                </div>

                <div>
                    <label for="create-referrer" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Referrer
                    </label>
                    <input type="url" id="create-referrer" name="referrer"
                           class="form-input w-full" 
                           placeholder="Where did you find this link? (optional)">
                </div>

                <div>
                    <label for="create-status" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Status
                    </label>
                    <select id="create-status" name="status" class="form-input w-full">
                        <option value="">Select status</option>
                        <option value="UN">UN - Unread</option>
                        <option value="RD">RD - Read</option>
                        <option value="AR">AR - Archived</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Categories
                    </label>
                    <div class="space-y-3">
                        <div class="relative">
                            <input type="text" id="create-category-input" 
                                   class="form-input w-full" 
                                   placeholder="Start typing to add categories...">
                        </div>
                        <div id="create-categories-display" class="min-h-[2rem]"></div>
                    </div>
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="btn-ghost">
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Bookmark
                    </button>
                </div>
            </form>
        `;
    },

    /**
     * Render edit bookmark form
     * @param {Object} bookmark - Bookmark data
     * @returns {string} Form HTML
     */
    renderEditBookmarkForm(bookmark) {
        return `
            <form id="edit-bookmark-form" class="space-y-6">
                <div>
                    <label for="edit-url" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        URL <span class="text-red-500">*</span>
                    </label>
                    <input type="url" id="edit-url" name="url" required
                           class="form-input w-full" 
                           value="${Utils.escapeHTML(bookmark.url || '')}">
                </div>

                <div>
                    <label for="edit-title" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Title
                    </label>
                    <input type="text" id="edit-title" name="title"
                           class="form-input w-full" 
                           value="${Utils.escapeHTML(bookmark.title || '')}"
                           placeholder="Bookmark title">
                </div>

                <div>
                    <label for="edit-content" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Description
                    </label>
                    <textarea id="edit-content" name="content" rows="3"
                              class="form-input w-full" 
                              placeholder="Optional description or notes">${Utils.escapeHTML(bookmark.content || '')}</textarea>
                </div>

                <div>
                    <label for="edit-referrer" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Referrer
                    </label>
                    <input type="url" id="edit-referrer" name="referrer"
                           class="form-input w-full" 
                           value="${Utils.escapeHTML(bookmark.referrer || '')}"
                           placeholder="Where did you find this link?">
                </div>

                <div>
                    <label for="edit-status" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Status
                    </label>
                    <select id="edit-status" name="status" class="form-input w-full">
                        <option value="">Select status</option>
                        <option value="UN" ${bookmark.status === 'UN' ? 'selected' : ''}>UN - Unread</option>
                        <option value="RD" ${bookmark.status === 'RD' ? 'selected' : ''}>RD - Read</option>
                        <option value="AR" ${bookmark.status === 'AR' ? 'selected' : ''}>AR - Archived</option>
                    </select>
                </div>

                <div class="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="btn-ghost">
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        Update Bookmark
                    </button>
                </div>
            </form>
        `;
    },

    /**
     * Render delete bookmark confirmation
     * @param {Object} bookmark - Bookmark data
     * @returns {string} Form HTML
     */
    renderDeleteBookmarkForm(bookmark) {
        const title = bookmark.title || Utils.truncateText(bookmark.url, 50);
        return `
            <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                    <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Delete Bookmark</h3>
                <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                    Are you sure you want to delete this bookmark? This action cannot be undone.
                </p>
                
                <div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 mb-6 text-left">
                    <div class="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        ${Utils.escapeHTML(title)}
                    </div>
                    <div class="text-sm text-neutral-600 dark:text-neutral-400 break-all">
                        ${Utils.escapeHTML(bookmark.url)}
                    </div>
                    ${bookmark.categories && bookmark.categories.length > 0 ? `
                        <div class="mt-2 flex flex-wrap gap-1">
                            ${bookmark.categories.map(cat => `
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
                                    ${Utils.escapeHTML(cat)}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="flex justify-center space-x-3">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="btn-ghost">
                        Cancel
                    </button>
                    <button type="button" id="confirm-delete-btn" class="btn-danger">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        Delete Bookmark
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Render category management form
     * @param {Object} bookmark - Bookmark data
     * @returns {string} Form HTML
     */
    renderCategoryManagementForm(bookmark) {
        const title = bookmark.title || Utils.truncateText(bookmark.url, 50);
        return `
            <div>
                <div class="mb-6">
                    <h3 class="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                        ${Utils.escapeHTML(title)}
                    </h3>
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 break-all">
                        ${Utils.escapeHTML(bookmark.url)}
                    </p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Add Categories
                        </label>
                        <div class="relative">
                            <input type="text" id="category-management-input" 
                                   class="form-input w-full" 
                                   placeholder="Start typing to add categories...">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Current Categories
                        </label>
                        <div id="category-management-display" class="min-h-[3rem] p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800"></div>
                    </div>

                    <div id="category-changes-preview" class="hidden">
                        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Pending Changes
                        </label>
                        <div class="p-3 border border-brand-200 dark:border-brand-700 rounded-lg bg-brand-50 dark:bg-brand-900/20">
                            <div id="changes-summary"></div>
                        </div>
                    </div>
                </div>

                <div class="flex justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                    <button type="button" onclick="this.closest('.fixed').remove()" class="btn-ghost">
                        Cancel
                    </button>
                    <button type="button" id="save-categories-btn" class="btn-primary" disabled>
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Save Changes
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Attach handlers for create bookmark form
     * @param {HTMLElement} modal - Modal element
     */
    attachCreateBookmarkHandlers(modal) {
        const form = modal.querySelector('#create-bookmark-form');
        const categoryInput = modal.querySelector('#create-category-input');
        const categoriesDisplay = modal.querySelector('#create-categories-display');

        // Initialize category input
        let selectedCategories = [];
        
        CategoryInput.init(
            'create-category-input',
            'create-categories-display',
            (categoryName, action) => {
                console.log('Category action:', action, categoryName);
                if (action === 'add') {
                    selectedCategories.push(categoryName);
                    this.renderCategoriesDisplay(categoriesDisplay, selectedCategories, (catName) => {
                        selectedCategories = selectedCategories.filter(c => c !== catName);
                        this.renderCategoriesDisplay(categoriesDisplay, selectedCategories, arguments.callee);
                    });
                }
            },
            (categoryName) => {
                selectedCategories = selectedCategories.filter(c => c !== categoryName);
                this.renderCategoriesDisplay(categoriesDisplay, selectedCategories, arguments.callee);
            },
            selectedCategories
        );

        // Initial render
        this.renderCategoriesDisplay(categoriesDisplay, selectedCategories, (catName) => {
            selectedCategories = selectedCategories.filter(c => c !== catName);
            this.renderCategoriesDisplay(categoriesDisplay, selectedCategories, arguments.callee);
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                url: formData.get('url'),
                title: formData.get('title') || null,
                content: formData.get('content') || null,
                referrer: formData.get('referrer') || null,
                status: formData.get('status') || null,
                categories: selectedCategories
            };

            try {
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a6 6 0 110 11.292M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Creating...';

                await BookmarkAPI.create(data);
                Utils.showToast('Bookmark created successfully!', 'success');
                modal.remove();
                await BookmarksManager.refresh();
            } catch (error) {
                console.error('Error creating bookmark:', error);
                Utils.showToast('Error creating bookmark: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>Add Bookmark';
            }
        });
    },

    /**
     * Attach handlers for edit bookmark form
     * @param {HTMLElement} modal - Modal element
     * @param {Object} bookmark - Bookmark data
     */
    attachEditBookmarkHandlers(modal, bookmark) {
        const form = modal.querySelector('#edit-bookmark-form');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {
                url: formData.get('url'),
                title: formData.get('title') || null,
                content: formData.get('content') || null,
                referrer: formData.get('referrer') || null,
                status: formData.get('status') || null
            };

            try {
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a6 6 0 110 11.292M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Updating...';

                await BookmarkAPI.update(bookmark.id, data);
                Utils.showToast('Bookmark updated successfully!', 'success');
                modal.remove();
                await BookmarksManager.refresh();
            } catch (error) {
                console.error('Error updating bookmark:', error);
                Utils.showToast('Error updating bookmark: ' + error.message, 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>Update Bookmark';
            }
        });
    },

    /**
     * Attach handlers for delete bookmark confirmation
     * @param {HTMLElement} modal - Modal element
     * @param {number} bookmarkId - Bookmark ID
     */
    attachDeleteBookmarkHandlers(modal, bookmarkId) {
        const deleteBtn = modal.querySelector('#confirm-delete-btn');

        deleteBtn.addEventListener('click', async () => {
            try {
                deleteBtn.disabled = true;
                deleteBtn.innerHTML = '<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a6 6 0 110 11.292M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Deleting...';

                await BookmarkAPI.delete(bookmarkId);
                Utils.showToast('Bookmark deleted successfully!', 'success');
                modal.remove();
                await BookmarksManager.refresh();
            } catch (error) {
                console.error('Error deleting bookmark:', error);
                Utils.showToast('Error deleting bookmark: ' + error.message, 'error');
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>Delete Bookmark';
            }
        });
    },

    /**
     * Attach handlers for category management
     * @param {HTMLElement} modal - Modal element
     * @param {Object} bookmark - Bookmark data
     */
    attachCategoryManagementHandlers(modal, bookmark) {
        const categoryInput = modal.querySelector('#category-management-input');
        const categoriesDisplay = modal.querySelector('#category-management-display');
        const changesPreview = modal.querySelector('#category-changes-preview');
        const changesSummary = modal.querySelector('#changes-summary');
        const saveBtn = modal.querySelector('#save-categories-btn');

        let currentCategories = [...(bookmark.categories || [])];
        let pendingAdd = [];
        let pendingRemove = [];

        console.log('BookmarkModals: Category management for bookmark:', bookmark.id, 'with categories:', currentCategories);

        // Update changes preview function
        const updateCategoryChanges = () => {
            const hasChanges = pendingAdd.length > 0 || pendingRemove.length > 0;
            
            if (hasChanges) {
                changesPreview.classList.remove('hidden');
                saveBtn.disabled = false;
                
                let summary = '';
                if (pendingAdd.length > 0) {
                    summary += `<div class="text-green-700 dark:text-green-300 mb-2">
                        <strong>Add:</strong> ${pendingAdd.map(cat => Utils.escapeHTML(cat)).join(', ')}
                    </div>`;
                }
                if (pendingRemove.length > 0) {
                    summary += `<div class="text-red-700 dark:text-red-300">
                        <strong>Remove:</strong> ${pendingRemove.map(cat => Utils.escapeHTML(cat)).join(', ')}
                    </div>`;
                }
                changesSummary.innerHTML = summary;
            } else {
                changesPreview.classList.add('hidden');
                saveBtn.disabled = true;
            }
        };

        this.updateCategoryChanges = updateCategoryChanges;

        // Initialize category input
        CategoryInput.init(
            'category-management-input',
            'category-management-display',
            (categoryName, action) => {
                if (action === 'add' && !currentCategories.includes(categoryName)) {
                    pendingAdd.push(categoryName);
                    updateCategoryChanges();
                }
            },
            (categoryName) => {
                if (currentCategories.includes(categoryName)) {
                    pendingRemove.push(categoryName);
                    updateCategoryChanges();
                }
            },
            currentCategories
        );

        // Initial render of current categories
        console.log('BookmarkModals: Rendering initial categories:', currentCategories);
        if (categoriesDisplay) {
            this.renderCategoriesDisplay(categoriesDisplay, currentCategories, (catName) => {
                console.log('BookmarkModals: Category remove requested:', catName);
                if (currentCategories.includes(catName)) {
                    pendingRemove.push(catName);
                    updateCategoryChanges();
                }
            });
        } else {
            console.error('BookmarkModals: categoriesDisplay element not found');
        }

        // Save changes
        saveBtn.addEventListener('click', async () => {
            try {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<svg class="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a6 6 0 110 11.292M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Saving...';

                // Execute changes
                if (pendingAdd.length > 0) {
                    await BookmarkAPI.addCategories(bookmark.id, pendingAdd);
                }
                if (pendingRemove.length > 0) {
                    await BookmarkAPI.removeCategories(bookmark.id, pendingRemove);
                }

                Utils.showToast('Categories updated successfully!', 'success');
                modal.remove();
                await BookmarksManager.refresh();
            } catch (error) {
                console.error('Error updating categories:', error);
                Utils.showToast('Error updating categories: ' + error.message, 'error');
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Save Changes';
            }
        });
    },

    /**
     * Render categories display for forms
     * @param {HTMLElement} container - Container element
     * @param {Array} categories - Categories to display
     * @param {Function} onRemove - Remove handler
     */
    renderCategoriesDisplay(container, categories, onRemove) {
        CategoryInput.renderExistingCategories(container, categories, onRemove);
    }
};