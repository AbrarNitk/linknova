// Category Management Page for LinkNova
let categories = [];
let topics = [];
let filteredCategories = [];

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initializePage();
    setupEventListeners();
});

/**
 * Initialize the page by loading data and setting up UI
 */
async function initializePage() {
    try {
        await Promise.all([loadCategories(), loadTopics()]);
        renderCategories();
    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Failed to initialize page: ' + error.message);
    }
}

/**
 * Setup event listeners for the page
 */
function setupEventListeners() {
    const searchInput = document.getElementById('category-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    const sortSelect = document.getElementById('category-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    const sortDirectionBtn = document.getElementById('sort-direction-btn');
    if (sortDirectionBtn) {
        sortDirectionBtn.addEventListener('click', toggleSortDirection);
    }
}

/**
 * Load all categories from the API
 */
async function loadCategories() {
    const loading = document.getElementById('categories-loading');
    loading.classList.remove('hidden');

    try {
        const response = await API.categories.getAll();
        categories = Array.isArray(response) ? response : (response?.data || []);
        filteredCategories = [...categories];
        console.log('Loaded categories:', categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Failed to load categories: ' + error.message);
        categories = [];
        filteredCategories = [];
    } finally {
        loading.classList.add('hidden');
    }
}

/**
 * Load all topics for use in selectors
 */
async function loadTopics() {
    try {
        const response = await API.topics.getAll();
        topics = Array.isArray(response) ? response : (response?.data || []);
        console.log('Loaded topics:', topics);
    } catch (error) {
        console.error('Error loading topics:', error);
        topics = [];
    }
}

/**
 * Render categories in the grid
 */
function renderCategories() {
    const grid = document.getElementById('categories-grid');
    const empty = document.getElementById('categories-empty');
    const loading = document.getElementById('categories-loading');

    loading.classList.add('hidden');

    if (filteredCategories.length === 0) {
        grid.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.classList.remove('hidden');
    grid.innerHTML = filteredCategories.map(category => createCategoryCard(category)).join('');
}

/**
 * Create HTML for a category card
 */
function createCategoryCard(category) {
    const topicsCount = category.topics ? category.topics.length : 0;
    const displayName = category.display_name || category.name;
    const description = category.description || '';
    const priority = category.priority || 0;
    const isPublic = category.public || false;
    const createdDate = category.created_on ? new Date(category.created_on).toLocaleDateString() : '';

    return `
        <div class="card hover:shadow-medium transition-shadow duration-200" data-category="${category.name}">
            <div class="card-body">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                            ${escapeHtml(displayName)}
                        </h3>
                        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            ${escapeHtml(description)}
                        </p>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        ${isPublic ? 
                            '<span class="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full">Public</span>' : 
                            '<span class="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 rounded-full">Private</span>'
                        }
                        <div class="flex items-center space-x-1">
                            <button onclick="editCategory('${category.name}')" class="p-1 text-neutral-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title="Edit category">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button onclick="deleteCategory('${category.name}')" class="p-1 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete category">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                    <span>Priority: ${priority}</span>
                    <span>${createdDate}</span>
                </div>

                <div class="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Topics (${topicsCount})
                        </h4>
                        <button onclick="manageTopics('${category.name}')" class="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium">
                            Manage
                        </button>
                    </div>
                    
                    <div class="flex flex-wrap gap-1">
                        ${category.topics && category.topics.length > 0 ? 
                            category.topics.slice(0, 6).map(topic => 
                                `<span class="px-2 py-1 text-xs bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-full">
                                    ${escapeHtml(topic)}
                                </span>`
                            ).join('') : 
                            '<span class="text-xs text-neutral-400 italic">No topics assigned</span>'
                        }
                        ${category.topics && category.topics.length > 6 ? 
                            `<span class="px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full">
                                +${category.topics.length - 6} more
                            </span>` : ''
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handle search functionality
 */
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (!query) {
        filteredCategories = [...categories];
    } else {
        filteredCategories = categories.filter(category => 
            category.name.toLowerCase().includes(query) ||
            (category.display_name && category.display_name.toLowerCase().includes(query)) ||
            (category.description && category.description.toLowerCase().includes(query)) ||
            (category.topics && category.topics.some(topic => topic.toLowerCase().includes(query)))
        );
    }
    
    renderCategories();
}

/**
 * Handle sorting
 */
function handleSort() {
    const sortBy = document.getElementById('category-sort').value;
    const isAscending = !document.getElementById('sort-direction-btn').classList.contains('rotate-180');
    
    filteredCategories.sort((a, b) => {
        let aVal, bVal;
        
        switch (sortBy) {
            case 'name':
                aVal = (a.display_name || a.name).toLowerCase();
                bVal = (b.display_name || b.name).toLowerCase();
                break;
            case 'created_on':
                aVal = new Date(a.created_on || 0);
                bVal = new Date(b.created_on || 0);
                break;
            case 'priority':
                aVal = a.priority || 0;
                bVal = b.priority || 0;
                break;
            default:
                return 0;
        }
        
        if (aVal < bVal) return isAscending ? -1 : 1;
        if (aVal > bVal) return isAscending ? 1 : -1;
        return 0;
    });
    
    renderCategories();
}

/**
 * Toggle sort direction
 */
function toggleSortDirection() {
    const btn = document.getElementById('sort-direction-btn');
    btn.classList.toggle('rotate-180');
    handleSort();
}

/**
 * Show create category modal
 */
function showCreateModal() {
    const modal = createCategoryModal();
    document.body.appendChild(modal);
}

/**
 * Show edit category modal
 */
function editCategory(categoryName) {
    const category = categories.find(c => c.name === categoryName);
    if (!category) {
        showError('Category not found');
        return;
    }
    
    const modal = createCategoryModal(category);
    document.body.appendChild(modal);
}

/**
 * Create category modal (for both create and edit)
 */
function createCategoryModal(category = null) {
    const isEdit = category !== null;
    const title = isEdit ? 'Edit Category' : 'Create Category';
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-neutral-800 rounded-lg max-w-lg w-full max-h-90vh overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">${title}</h2>
                <button onclick="this.closest('.fixed').remove()" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <form id="category-form" class="p-6 space-y-4">
                <div>
                    <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Name ${isEdit ? '(cannot be changed)' : '*'}
                    </label>
                    <input type="text" id="category-name" 
                           class="form-input w-full ${isEdit ? 'bg-neutral-100 dark:bg-neutral-700' : ''}" 
                           value="${category?.name || ''}" 
                           ${isEdit ? 'readonly' : 'required'} 
                           placeholder="Category name">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Display Name
                    </label>
                    <input type="text" id="category-display-name" 
                           class="form-input w-full" 
                           value="${category?.display_name || ''}" 
                           placeholder="Display name (optional)">
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Description
                    </label>
                    <textarea id="category-description" 
                              class="form-input w-full h-20 resize-none" 
                              placeholder="Category description (optional)">${category?.description || ''}</textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        About
                    </label>
                    <textarea id="category-about" 
                              class="form-input w-full h-24 resize-none" 
                              placeholder="Additional information (optional)">${category?.about || ''}</textarea>
                </div>
                
                <div class="flex items-center justify-between">
                    <div>
                        <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Priority
                        </label>
                        <input type="number" id="category-priority" 
                               class="form-input w-24" 
                               value="${category?.priority || 0}" 
                               min="0" max="1000">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="category-public" 
                               class="form-checkbox mr-2" 
                               ${category?.public ? 'checked' : ''}>
                        <label for="category-public" class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Public
                        </label>
                    </div>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button type="button" onclick="this.closest('.fixed').remove()" 
                            class="btn-ghost">
                        Cancel
                    </button>
                    <button type="submit" class="btn-primary">
                        ${isEdit ? 'Update' : 'Create'} Category
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Handle form submission
    modal.querySelector('#category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCategorySubmit(isEdit, category?.name);
        modal.remove();
    });
    
    return modal;
}

/**
 * Handle category form submission
 */
async function handleCategorySubmit(isEdit, originalName) {
    const data = {
        name: document.getElementById('category-name').value.trim(),
        display_name: document.getElementById('category-display-name').value.trim() || null,
        description: document.getElementById('category-description').value.trim() || null,
        about: document.getElementById('category-about').value.trim() || null,
        priority: parseInt(document.getElementById('category-priority').value) || 0,
        public: document.getElementById('category-public').checked
    };
    
    try {
        if (isEdit) {
            const updateData = {
                display_name: data.display_name,
                description: data.description,
                about: data.about,
                priority: data.priority,
                public: data.public
            };
            await API.categories.update(originalName, updateData);
            showSuccess(`Category "${data.display_name || originalName}" updated successfully`);
        } else {
            await API.categories.create(data);
            showSuccess(`Category "${data.display_name || data.name}" created successfully`);
        }
        
        await loadCategories();
        renderCategories();
    } catch (error) {
        console.error('Error saving category:', error);
        showError(`Failed to ${isEdit ? 'update' : 'create'} category: ` + error.message);
    }
}

/**
 * Delete category with confirmation
 */
async function deleteCategory(categoryName) {
    const category = categories.find(c => c.name === categoryName);
    if (!category) return;
    
    const displayName = category.display_name || category.name;
    
    if (!confirm(`Are you sure you want to delete the category "${displayName}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await API.categories.delete(categoryName);
        showSuccess(`Category "${displayName}" deleted successfully`);
        await loadCategories();
        renderCategories();
    } catch (error) {
        console.error('Error deleting category:', error);
        showError('Failed to delete category: ' + error.message);
    }
}

/**
 * Show topic management modal
 */
function manageTopics(categoryName) {
    const category = categories.find(c => c.name === categoryName);
    if (!category) return;
    
    const modal = createTopicManagementModal(category);
    document.body.appendChild(modal);
}

/**
 * Create topic management modal
 */
function createTopicManagementModal(category) {
    const assignedTopics = category.topics || [];
    const availableTopics = topics.filter(topic => !assignedTopics.includes(topic.name));
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-neutral-800 rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Manage Topics for "${category.display_name || category.name}"
                </h2>
                <button onclick="this.closest('.fixed').remove()" class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <div class="p-6 space-y-6">
                <div>
                    <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                        Assigned Topics (${assignedTopics.length})
                    </h3>
                    <div id="assigned-topics" class="space-y-2 max-h-40 overflow-y-auto">
                        ${assignedTopics.length > 0 ? 
                            assignedTopics.map(topicName => `
                                <div class="flex items-center justify-between p-2 bg-brand-50 dark:bg-brand-900/10 rounded-lg">
                                    <span class="text-sm font-medium text-brand-900 dark:text-brand-100">${escapeHtml(topicName)}</span>
                                    <button onclick="removeTopic('${category.name}', '${topicName}')" 
                                            class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>
                            `).join('') : 
                            '<p class="text-sm text-neutral-500 dark:text-neutral-400 italic">No topics assigned</p>'
                        }
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                        Add Topics (${availableTopics.length} available)
                    </h3>
                    <div id="available-topics" class="space-y-2 max-h-40 overflow-y-auto">
                        ${availableTopics.length > 0 ? 
                            availableTopics.map(topic => `
                                <div class="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                                    <span class="text-sm text-neutral-900 dark:text-neutral-100">${escapeHtml(topic.display_name || topic.name)}</span>
                                    <button onclick="addTopic('${category.name}', '${topic.name}')" 
                                            class="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                    </button>
                                </div>
                            `).join('') : 
                            '<p class="text-sm text-neutral-500 dark:text-neutral-400 italic">No topics available to add</p>'
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

/**
 * Add topic to category
 */
async function addTopic(categoryName, topicName) {
    try {
        await API.categories.addTopic(categoryName, topicName);
        showSuccess(`Topic "${topicName}" added to category`);
        
        await loadCategories();
        renderCategories();
        
        document.querySelector('.fixed')?.remove();
        setTimeout(() => manageTopics(categoryName), 100);
    } catch (error) {
        console.error('Error adding topic:', error);
        showError('Failed to add topic: ' + error.message);
    }
}

/**
 * Remove topic from category
 */
async function removeTopic(categoryName, topicName) {
    try {
        await API.categories.removeTopic(categoryName, topicName);
        showSuccess(`Topic "${topicName}" removed from category`);
        
        await loadCategories();
        renderCategories();
        
        document.querySelector('.fixed')?.remove();
        setTimeout(() => manageTopics(categoryName), 100);
    } catch (error) {
        console.error('Error removing topic:', error);
        showError('Failed to remove topic: ' + error.message);
    }
}

/**
 * Utility functions
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in-right`;
    
    const icon = type === 'success' ? 
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' :
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    
    toast.innerHTML = `
        <div class="flex items-center">
            ${icon}
            <span class="ml-2">${escapeHtml(message)}</span>
        </div>
        <button onclick="this.parentElement.remove()" class="ml-4 text-current opacity-70 hover:opacity-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('animate-slide-out-right');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Global functions
window.showCreateModal = showCreateModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.manageTopics = manageTopics;
window.addTopic = addTopic;
window.removeTopic = removeTopic;
window.toggleUserMenu = () => document.getElementById('user-dropdown')?.classList.toggle('hidden');
window.logout = () => window.location.href = '/-/ln/logout';
