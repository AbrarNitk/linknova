// Load categories and show them
async function loadPage() {
    try {
        const response = await fetch('/-/ln/v1/api/cat');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle different response formats
        let categories = [];
        if (Array.isArray(data)) {
            categories = data;
        } else if (data && Array.isArray(data.data)) {
            categories = data.data;
        } else if (data && Array.isArray(data.categories)) {
            categories = data.categories;
        }
        
        const grid = document.getElementById('categories-grid');
        const loading = document.getElementById('categories-loading');
        const empty = document.getElementById('categories-empty');
        
        loading.classList.add('hidden');
        
        if (categories.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        
        grid.innerHTML = categories.map(cat => `
            <div class="card">
                <div class="card-body">
                    <h3 class="font-semibold mb-2">${cat.display_name || cat.name || 'Unnamed'}</h3>
                    <p class="text-sm text-gray-600 mb-2">${cat.description || ''}</p>
                    <div class="text-xs text-gray-500">
                        Priority: ${cat.priority || 0} | ${cat.created_on ? new Date(cat.created_on).toLocaleDateString() : 'Unknown date'}
                    </div>
                </div>
            </div>
        `).join('');
        
        grid.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categories-loading').innerHTML = '<p class="text-red-600">Error loading categories: ' + error.message + '</p>';
    }
}

// Simple functions
function showCreateModal() {
    alert('Create category - implement later');
}

// Load when page loads
document.addEventListener('DOMContentLoaded', loadPage);

// Global functions
window.showCreateModal = showCreateModal;
window.toggleUserMenu = () => document.getElementById('user-dropdown')?.classList.toggle('hidden');
window.logout = () => window.location.href = '/-/ln/logout';