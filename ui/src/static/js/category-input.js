// CategoryInput Component for LinkNova
// Handles adding/removing categories with autocomplete functionality

const CategoryInput = {
    // Component state
    state: {
        inputId: null,
        containerId: null,
        onCategoryAction: null,
        onCategoryRemove: null,
        currentCategories: [],
        allCategories: [],
        isLoading: false
    },

    /**
     * Initialize the category input component
     * @param {string} inputId - ID of the input element
     * @param {string} containerId - ID of the container for displaying categories
     * @param {Function} onCategoryAction - Callback for category add/remove actions
     * @param {Function} onCategoryRemove - Callback specifically for category removal
     * @param {Array} currentCategories - Array of currently assigned category names
     */
    init(inputId, containerId, onCategoryAction, onCategoryRemove, currentCategories = []) {
        this.state.inputId = inputId;
        this.state.containerId = containerId;
        this.state.onCategoryAction = onCategoryAction;
        this.state.onCategoryRemove = onCategoryRemove;
        this.state.currentCategories = [...currentCategories];

        console.log('CategoryInput initialized with:', {
            inputId,
            containerId,
            currentCategories: this.state.currentCategories
        });

        this.setupEventListeners();
        this.loadAllCategories();
    },

    /**
     * Setup event listeners for the input
     */
    setupEventListeners() {
        const input = document.getElementById(this.state.inputId);
        if (!input) {
            console.error('CategoryInput: Input element not found:', this.state.inputId);
            return;
        }

        // Handle Enter and Tab keys
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                this.handleAddCategory();
            } else if (e.key === 'Escape') {
                input.value = '';
                this.hideAutocomplete();
            }
        });

        // Handle input changes for autocomplete
        input.addEventListener('input', Utils.debounce((e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                this.showAutocomplete(query);
            } else {
                this.hideAutocomplete();
            }
        }, 300));

        // Hide autocomplete when clicking outside
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !e.target.closest('.autocomplete-dropdown')) {
                this.hideAutocomplete();
            }
        });

        console.log('CategoryInput event listeners setup complete');
    },

    /**
     * Load all available categories for autocomplete
     */
    async loadAllCategories() {
        try {
            this.state.isLoading = true;
            this.state.allCategories = await Category.getAll();
            console.log('Loaded categories for autocomplete:', this.state.allCategories.length);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.state.allCategories = [];
        } finally {
            this.state.isLoading = false;
        }
    },

    /**
     * Handle adding a category
     */
    handleAddCategory() {
        const input = document.getElementById(this.state.inputId);
        if (!input) {return;}

        const categoryName = input.value.trim();
        if (!categoryName) {return;}

        // Check if category is already added
        if (this.state.currentCategories.includes(categoryName)) {
            Utils.showToast(`Category "${categoryName}" is already added`, 'warning');
            input.value = '';
            this.hideAutocomplete();
            return;
        }

        // Add category
        this.state.currentCategories.push(categoryName);
        input.value = '';
        this.hideAutocomplete();

        // Trigger callback
        if (this.state.onCategoryAction) {
            this.state.onCategoryAction(categoryName, 'add');
        }

        console.log('Category added:', categoryName);
    },

    /**
     * Handle removing a category
     * @param {string} categoryName - Name of category to remove
     */
    handleRemoveCategory(categoryName) {
        const index = this.state.currentCategories.indexOf(categoryName);
        if (index > -1) {
            this.state.currentCategories.splice(index, 1);
        }

        // Trigger callback
        if (this.state.onCategoryRemove) {
            this.state.onCategoryRemove(categoryName);
        }

        console.log('Category removed:', categoryName);
    },

    /**
     * Show autocomplete dropdown
     * @param {string} query - Search query
     */
    showAutocomplete(query) {
        const input = document.getElementById(this.state.inputId);
        if (!input || this.state.allCategories.length === 0) {return;}

        // Filter categories based on query
        const filtered = this.state.allCategories.filter(category => {
            const name = category.name.toLowerCase();
            const displayName = (category.display_name || '').toLowerCase();
            const queryLower = query.toLowerCase();

            // Don't show already added categories
            if (this.state.currentCategories.includes(category.name)) {
                return false;
            }

            return name.includes(queryLower) || displayName.includes(queryLower);
        }).slice(0, 8); // Limit to 8 suggestions

        if (filtered.length === 0) {
            this.hideAutocomplete();
            return;
        }

        this.renderAutocomplete(input, filtered, query);
    },

    /**
     * Render autocomplete dropdown
     * @param {HTMLElement} input - Input element
     * @param {Array} categories - Filtered categories
     * @param {string} query - Original query
     */
    renderAutocomplete(input, categories, query) {
        // Remove existing dropdown
        this.hideAutocomplete();

        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-strong border border-neutral-200 dark:border-neutral-700 max-h-48 overflow-y-auto';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.right = '0';

        const items = categories.map(category => {
            const displayName = category.display_name || category.name;
            return `
                <div class="autocomplete-item px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-100 dark:border-neutral-700 last:border-b-0"
                     data-category-name="${Utils.escapeHTML(category.name)}">
                    <div class="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        ${Utils.escapeHTML(displayName)}
                    </div>
                    ${category.name !== displayName ? `
                        <div class="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                            ${Utils.escapeHTML(category.name)}
                        </div>
                    ` : ''}
                    ${category.description ? `
                        <div class="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                            ${Utils.escapeHTML(category.description)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Add option to create new category if query doesn't match exactly
        const exactMatch = categories.find(cat =>
            cat.name.toLowerCase() === query.toLowerCase() ||
            (cat.display_name && cat.display_name.toLowerCase() === query.toLowerCase())
        );

        if (!exactMatch && query.length > 0) {
            const createOption = `
                <div class="autocomplete-item px-3 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/20 cursor-pointer border-t border-neutral-200 dark:border-neutral-600"
                     data-category-name="${Utils.escapeHTML(query)}"
                     data-is-new="true">
                    <div class="flex items-center text-sm">
                        <svg class="w-4 h-4 mr-2 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        <span class="font-medium text-brand-900 dark:text-brand-100">
                            Create "${Utils.escapeHTML(query)}"
                        </span>
                    </div>
                </div>
            `;
            dropdown.innerHTML = items + createOption;
        } else {
            dropdown.innerHTML = items;
        }

        // Position dropdown relative to input
        const inputRect = input.getBoundingClientRect();
        const inputParent = input.offsetParent || input.parentElement;

        // Make input parent relative positioned if not already
        const parentStyle = window.getComputedStyle(inputParent);
        if (parentStyle.position === 'static') {
            inputParent.style.position = 'relative';
        }

        inputParent.appendChild(dropdown);

        // Add click handlers
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.autocomplete-item');
            if (item) {
                const categoryName = item.dataset.categoryName;
                input.value = categoryName;
                this.handleAddCategory();
            }
        });
    },

    /**
     * Hide autocomplete dropdown
     */
    hideAutocomplete() {
        const existing = document.querySelector('.autocomplete-dropdown');
        if (existing) {
            existing.remove();
        }
    },

    /**
     * Render existing categories in the container
     * @param {HTMLElement} container - Container element
     * @param {Array} categories - Array of category names
     * @param {Function} onRemove - Callback for category removal
     */
    renderExistingCategories(container, categories, onRemove) {
        if (!container) {
            console.error('CategoryInput: Container not found for rendering categories');
            return;
        }

        console.log('renderExistingCategories called with:', categories);

        if (!categories || categories.length === 0) {
            container.innerHTML = `
                <div class="text-sm text-neutral-500 dark:text-neutral-400 italic py-2">
                    No categories assigned. Start typing to add categories.
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="flex flex-wrap gap-2">
                ${categories.map(categoryName => `
                    <span class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-300 group">
                        <span>${Utils.escapeHTML(categoryName)}</span>
                        <button class="ml-2 hover:text-red-600 dark:hover:text-red-400 category-remove-btn" 
                                data-category-name="${Utils.escapeHTML(categoryName)}"
                                title="Remove category">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </span>
                `).join('')}
            </div>
        `;

        // Add event listeners for remove buttons
        container.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.category-remove-btn');
            if (removeBtn) {
                const categoryName = removeBtn.dataset.categoryName;
                if (onRemove) {
                    onRemove(categoryName);
                }
            }
        });

        console.log('Categories rendered successfully');
    }
};
