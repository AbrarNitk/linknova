// Load bookmarks and show them
async function loadPage() {
    try {
        const response = await fetch('/-/ln/v1/api/bm');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle different response formats
        let bookmarks = [];
        if (Array.isArray(data)) {
            bookmarks = data;
        } else if (data && Array.isArray(data.data)) {
            bookmarks = data.data;
        } else if (data && Array.isArray(data.bookmarks)) {
            bookmarks = data.bookmarks;
        }
        
        const grid = document.getElementById('bookmarks-grid');
        const loading = document.getElementById('bookmarks-loading');
        const empty = document.getElementById('bookmarks-empty');
        
        loading.classList.add('hidden');
        
        if (bookmarks.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        
        grid.innerHTML = bookmarks.map(bookmark => `
            <div class="card">
                <div class="card-body">
                    <h3 class="font-semibold mb-2">
                        <a href="${bookmark.url || '#'}" target="_blank" class="text-blue-600 hover:text-blue-700">${bookmark.title || bookmark.url || 'Untitled'}
                        </a>
                    </h3>
                    <p class="text-sm text-gray-600 mb-2">${bookmark.description || ''}</p>
                    <div class="text-xs text-gray-500">
                        ${bookmark.created_on ? new Date(bookmark.created_on).toLocaleDateString() : 'Unknown date'}
                    </div>
                </div>
            </div>
        `).join('');
        
        grid.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        document.getElementById('bookmarks-loading').innerHTML = '<p class="text-red-600">Error loading bookmarks: ' + error.message + '</p>';
    }
}

// Simple functions
function showCreateModal() {
    alert('Create bookmark - implement later');
}

// Load when page loads
document.addEventListener('DOMContentLoaded', loadPage);

// Global functions
window.showCreateModal = showCreateModal;
window.toggleUserMenu = () => document.getElementById('user-dropdown')?.classList.toggle('hidden');
window.logout = () => window.location.href = '/-/ln/logout';