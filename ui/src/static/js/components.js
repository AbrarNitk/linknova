// Reusable UI components for LinkNova
const Components = {
    /**
     * Create a modal component
     * @param {Object} options - Modal configuration
     * @returns {Object} Modal control methods
     */
    modal(options = {}) {
        const defaults = {
            title: 'Modal',
            content: '',
            size: 'md', // sm, md, lg, xl
            closable: true,
            onShow: null,
            onHide: null,
            onConfirm: null,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            showConfirm: false,
            showCancel: true
        };

        const config = { ...defaults, ...options };
        const modalId = 'modal-' + Utils.generateId();

        // Size classes
        const sizeClasses = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl'
        };

        // Create modal HTML
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay hidden" onclick="Components.modalInstances['${modalId}'].handleOverlayClick(event)">
                <div class="modal-content ${sizeClasses[config.size]}">
                    <div class="card-header flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            ${config.title}
                        </h3>
                        ${config.closable ? `
                            <button class="btn-ghost p-1" onclick="Components.modalInstances['${modalId}'].hide()">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                    <div class="card-body">
                        ${config.content}
                    </div>
                    ${config.showConfirm || config.showCancel ? `
                        <div class="card-footer flex items-center justify-end space-x-3">
                            ${config.showCancel ? `
                                <button class="btn-secondary" onclick="Components.modalInstances['${modalId}'].hide()">
                                    ${config.cancelText}
                                </button>
                            ` : ''}
                            ${config.showConfirm ? `
                                <button class="btn-primary" onclick="Components.modalInstances['${modalId}'].confirm()">
                                    ${config.confirmText}
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add to container
        const container = document.getElementById('modal-container') || document.body;
        container.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById(modalId);

        // Modal control object
        const modal = {
            element: modalElement,
            id: modalId,
            
            show() {
                modalElement.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
                
                // Focus trap
                const focusableElements = modalElement.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
                
                if (config.onShow) config.onShow(modal);
                
                return this;
            },
            
            hide() {
                modalElement.classList.add('hidden');
                document.body.style.overflow = '';
                
                if (config.onHide) config.onHide(modal);
                
                return this;
            },
            
            destroy() {
                this.hide();
                modalElement.remove();
                delete Components.modalInstances[modalId];
                
                return this;
            },
            
            confirm() {
                if (config.onConfirm) {
                    const result = config.onConfirm(modal);
                    if (result !== false) this.hide();
                } else {
                    this.hide();
                }
                
                return this;
            },
            
            updateContent(content) {
                const contentDiv = modalElement.querySelector('.card-body');
                if (contentDiv) {
                    contentDiv.innerHTML = content;
                }
                
                return this;
            },
            
            updateTitle(title) {
                const titleElement = modalElement.querySelector('.card-header h3');
                if (titleElement) {
                    titleElement.textContent = title;
                }
                
                return this;
            },

            handleOverlayClick(event) {
                if (config.closable && event.target === event.currentTarget) {
                    this.hide();
                }
            }
        };

        // Store instance for cleanup
        Components.modalInstances = Components.modalInstances || {};
        Components.modalInstances[modalId] = modal;

        // Handle escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && config.closable && !modalElement.classList.contains('hidden')) {
                modal.hide();
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Cleanup on destroy
        const originalDestroy = modal.destroy;
        modal.destroy = function() {
            document.removeEventListener('keydown', escapeHandler);
            return originalDestroy.call(this);
        };

        return modal;
    },

    /**
     * Create a confirmation dialog
     * @param {Object} options - Dialog configuration
     * @returns {Promise} Promise that resolves to true/false
     */
    confirm(options = {}) {
        return new Promise((resolve) => {
            const modal = this.modal({
                title: options.title || 'Confirm Action',
                content: options.message || 'Are you sure you want to continue?',
                showConfirm: true,
                showCancel: true,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                onConfirm: () => {
                    resolve(true);
                    return true; // Allow modal to close
                },
                onHide: () => {
                    resolve(false);
                }
            });
            
            modal.show();
        });
    },

    /**
     * Create an alert dialog
     * @param {Object} options - Dialog configuration
     * @returns {Promise} Promise that resolves when dismissed
     */
    alert(options = {}) {
        return new Promise((resolve) => {
            const modal = this.modal({
                title: options.title || 'Alert',
                content: options.message || '',
                showConfirm: true,
                showCancel: false,
                confirmText: options.confirmText || 'OK',
                onConfirm: () => {
                    resolve();
                    return true;
                },
                onHide: () => {
                    resolve();
                }
            });
            
            modal.show();
        });
    },

    /**
     * Create a loading spinner component
     * @param {Object} options - Spinner configuration
     * @returns {Object} Spinner control methods
     */
    spinner(options = {}) {
        const defaults = {
            size: 'md', // sm, md, lg
            color: 'brand',
            text: null,
            container: null
        };

        const config = { ...defaults, ...options };
        const spinnerId = 'spinner-' + Utils.generateId();

        // Size classes
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-6 h-6',
            lg: 'w-8 h-8'
        };

        // Color classes
        const colorClasses = {
            brand: 'border-brand-600',
            accent: 'border-accent-600',
            success: 'border-success-600',
            error: 'border-error-600',
            neutral: 'border-neutral-600'
        };

        const spinnerHTML = `
            <div id="${spinnerId}" class="flex items-center justify-center space-x-2">
                <div class="animate-spin rounded-full ${sizeClasses[config.size]} border-2 border-gray-200 ${colorClasses[config.color]}"></div>
                ${config.text ? `<span class="text-sm text-neutral-600 dark:text-neutral-400">${config.text}</span>` : ''}
            </div>
        `;

        const container = config.container || document.body;
        container.insertAdjacentHTML('beforeend', spinnerHTML);

        const spinnerElement = document.getElementById(spinnerId);

        return {
            element: spinnerElement,
            id: spinnerId,
            
            show() {
                spinnerElement.classList.remove('hidden');
                return this;
            },
            
            hide() {
                spinnerElement.classList.add('hidden');
                return this;
            },
            
            destroy() {
                spinnerElement.remove();
                return this;
            },
            
            updateText(text) {
                const textElement = spinnerElement.querySelector('span');
                if (textElement) {
                    textElement.textContent = text;
                } else if (text) {
                    spinnerElement.insertAdjacentHTML('beforeend', 
                        `<span class="text-sm text-neutral-600 dark:text-neutral-400">${text}</span>`
                    );
                }
                return this;
            }
        };
    },

    /**
     * Create a dropdown component
     * @param {Object} options - Dropdown configuration
     * @returns {Object} Dropdown control methods
     */
    dropdown(options = {}) {
        const defaults = {
            trigger: null,
            items: [],
            position: 'bottom-left', // bottom-left, bottom-right, top-left, top-right
            closeOnClick: true,
            onSelect: null
        };

        const config = { ...defaults, ...options };
        const dropdownId = 'dropdown-' + Utils.generateId();

        if (!config.trigger) {
            throw new Error('Dropdown requires a trigger element');
        }

        // Position classes
        const positionClasses = {
            'bottom-left': 'top-full left-0 mt-1',
            'bottom-right': 'top-full right-0 mt-1',
            'top-left': 'bottom-full left-0 mb-1',
            'top-right': 'bottom-full right-0 mb-1'
        };

        // Create dropdown HTML
        const dropdownHTML = `
            <div id="${dropdownId}" class="absolute ${positionClasses[config.position]} min-w-48 bg-white rounded-lg shadow-strong border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 z-50 hidden">
                <div class="py-1">
                    ${config.items.map((item, index) => {
                        if (item.divider) {
                            return '<div class="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>';
                        }
                        
                        return `
                            <button class="dropdown-item w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 flex items-center ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}" 
                                    data-index="${index}" 
                                    ${item.disabled ? 'disabled' : ''}>
                                ${item.icon ? `<span class="mr-2">${item.icon}</span>` : ''}
                                ${item.label}
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Add dropdown to trigger's parent
        config.trigger.style.position = 'relative';
        config.trigger.insertAdjacentHTML('afterend', dropdownHTML);

        const dropdownElement = document.getElementById(dropdownId);

        // Click handlers
        const handleTriggerClick = (e) => {
            e.stopPropagation();
            dropdown.toggle();
        };

        const handleItemClick = (e) => {
            e.stopPropagation();
            const index = parseInt(e.currentTarget.dataset.index);
            const item = config.items[index];
            
            if (item && !item.disabled) {
                if (config.onSelect) config.onSelect(item, index);
                if (config.closeOnClick) dropdown.hide();
            }
        };

        const handleOutsideClick = (e) => {
            if (!config.trigger.contains(e.target) && !dropdownElement.contains(e.target)) {
                dropdown.hide();
            }
        };

        // Add event listeners
        config.trigger.addEventListener('click', handleTriggerClick);
        dropdownElement.addEventListener('click', handleItemClick);
        document.addEventListener('click', handleOutsideClick);

        const dropdown = {
            element: dropdownElement,
            id: dropdownId,
            
            show() {
                dropdownElement.classList.remove('hidden');
                return this;
            },
            
            hide() {
                dropdownElement.classList.add('hidden');
                return this;
            },
            
            toggle() {
                dropdownElement.classList.toggle('hidden');
                return this;
            },
            
            destroy() {
                config.trigger.removeEventListener('click', handleTriggerClick);
                dropdownElement.removeEventListener('click', handleItemClick);
                document.removeEventListener('click', handleOutsideClick);
                dropdownElement.remove();
                return this;
            },
            
            updateItems(items) {
                config.items = items;
                const container = dropdownElement.querySelector('.py-1');
                container.innerHTML = items.map((item, index) => {
                    if (item.divider) {
                        return '<div class="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>';
                    }
                    
                    return `
                        <button class="dropdown-item w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 flex items-center ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}" 
                                data-index="${index}" 
                                ${item.disabled ? 'disabled' : ''}>
                            ${item.icon ? `<span class="mr-2">${item.icon}</span>` : ''}
                            ${item.label}
                        </button>
                    `;
                }).join('');
                return this;
            }
        };

        return dropdown;
    },

    /**
     * Create a tabs component
     * @param {Object} options - Tabs configuration
     * @returns {Object} Tabs control methods
     */
    tabs(options = {}) {
        const defaults = {
            container: null,
            tabs: [],
            activeTab: 0,
            onChange: null
        };

        const config = { ...defaults, ...options };
        const tabsId = 'tabs-' + Utils.generateId();

        if (!config.container) {
            throw new Error('Tabs requires a container element');
        }

        // Create tabs HTML
        const tabsHTML = `
            <div id="${tabsId}" class="tabs-component">
                <div class="tabs-nav border-b border-neutral-200 dark:border-neutral-700">
                    <nav class="flex space-x-8">
                        ${config.tabs.map((tab, index) => `
                            <button class="tab-button py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                index === config.activeTab 
                                    ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
                            }" data-index="${index}">
                                ${tab.icon ? `<span class="mr-2">${tab.icon}</span>` : ''}
                                ${tab.label}
                            </button>
                        `).join('')}
                    </nav>
                </div>
                <div class="tabs-content mt-6">
                    ${config.tabs.map((tab, index) => `
                        <div class="tab-pane ${index === config.activeTab ? '' : 'hidden'}" data-index="${index}">
                            ${tab.content || ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        config.container.innerHTML = tabsHTML;
        const tabsElement = config.container.querySelector(`#${tabsId}`);

        // Click handler
        const handleTabClick = (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            tabs.setActive(index);
        };

        // Add event listeners
        tabsElement.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', handleTabClick);
        });

        const tabs = {
            element: tabsElement,
            id: tabsId,
            activeIndex: config.activeTab,
            
            setActive(index) {
                if (index < 0 || index >= config.tabs.length) return this;
                
                // Update buttons
                tabsElement.querySelectorAll('.tab-button').forEach((button, i) => {
                    if (i === index) {
                        button.classList.add('border-brand-500', 'text-brand-600', 'dark:text-brand-400');
                        button.classList.remove('border-transparent', 'text-neutral-500', 'dark:text-neutral-400');
                    } else {
                        button.classList.remove('border-brand-500', 'text-brand-600', 'dark:text-brand-400');  
                        button.classList.add('border-transparent', 'text-neutral-500', 'dark:text-neutral-400');
                    }
                });
                
                // Update panes
                tabsElement.querySelectorAll('.tab-pane').forEach((pane, i) => {
                    if (i === index) {
                        pane.classList.remove('hidden');
                    } else {
                        pane.classList.add('hidden');
                    }
                });
                
                this.activeIndex = index;
                
                if (config.onChange) config.onChange(index, config.tabs[index]);
                
                return this;
            },
            
            getActive() {
                return this.activeIndex;
            },
            
            updateContent(index, content) {
                const pane = tabsElement.querySelector(`.tab-pane[data-index="${index}"]`);
                if (pane) {
                    pane.innerHTML = content;
                }
                return this;
            },
            
            destroy() {
                tabsElement.querySelectorAll('.tab-button').forEach(button => {
                    button.removeEventListener('click', handleTabClick);
                });
                return this;
            }
        };

        return tabs;
    }
};

// Initialize modal instances storage
Components.modalInstances = {};