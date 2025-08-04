// Load topics and show them
async function loadPage() {
    try {
        const response = await fetch('/-/ln/v1/api/topic');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Handle different response formats
        let topics = [];
        if (Array.isArray(data)) {
            topics = data;
        } else if (data && Array.isArray(data.data)) {
            topics = data.data;
        } else if (data && Array.isArray(data.topics)) {
            topics = data.topics;
        }
        
        const grid = document.getElementById('topics-grid');
        const loading = document.getElementById('topics-loading');
        const empty = document.getElementById('topics-empty');
        
        loading.classList.add('hidden');
        
        if (topics.length === 0) {
            empty.classList.remove('hidden');
            return;
        }
        
        grid.innerHTML = topics.map(topic => `
            <div class="card">
                <div class="card-body">
                    <h3 class="font-semibold mb-2">${topic.display_name || topic.name || 'Unnamed'}</h3>
                    <p class="text-sm text-gray-600 mb-2">${topic.description || ''}</p>
                    <div class="text-xs text-gray-500">
                        Priority: ${topic.priority || 0} | ${topic.created_on ? new Date(topic.created_on).toLocaleDateString() : 'Unknown date'}
                    </div>
                </div>
            </div>
        `).join('');
        
        grid.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading topics:', error);
        document.getElementById('topics-loading').innerHTML = '<p class="text-red-600">Error loading topics: ' + error.message + '</p>';
    }
}

// Simple functions
function showCreateModal() {
    alert('Create topic - implement later');
}

// Load when page loads
document.addEventListener('DOMContentLoaded', loadPage);

// Global functions
window.showCreateModal = showCreateModal;
window.toggleUserMenu = () => document.getElementById('user-dropdown')?.classList.toggle('hidden');
window.logout = () => window.location.href = '/-/ln/logout';