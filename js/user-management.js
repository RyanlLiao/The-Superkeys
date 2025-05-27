class UserManager {
    constructor() {
        this.apiEndpoint = 'api.php';
        this.apikey = this.getApiKey();
        this.users = [];
        this.init();
    }

        getApiKey() {
        // Try to get API key from sessionStorage first
        let storedKey = sessionStorage.getItem('userApiKey');
        if (storedKey) {
            console.log('Using sessionStorage userApiKey:', storedKey);
            return storedKey;
        }
        
        // Try sessionStorage with alternative key
        storedKey = sessionStorage.getItem('apikey');
        if (storedKey) {
            console.log('Using sessionStorage apikey:', storedKey);
            return storedKey;
        }
        
        // Try localStorage with keys that login.js actually uses
        storedKey = localStorage.getItem('api_key');
        if (storedKey) {
            console.log('Using localStorage api_key:', storedKey);
            return storedKey;
        }
        
        // Try localStorage with alternative key
        storedKey = localStorage.getItem('apikey');
        if (storedKey) {
            console.log('Using localStorage apikey:', storedKey);
            return storedKey;
        }
        
        // Check URL parameters for API key (for testing)
        const urlParams = new URLSearchParams(window.location.search);
        const urlApiKey = urlParams.get('apikey');
        if (urlApiKey) {
            console.log('Using URL API key:', urlApiKey);
            // Store it for future use
            sessionStorage.setItem('userApiKey', urlApiKey);
            return urlApiKey;
        }
        
        // Prompt user for API key if none found
        const apikey = prompt('Please enter your manager API key:');
        if (apikey) {
            // Save it using the same key as login.js would use
            sessionStorage.setItem('userApiKey', apikey);
            localStorage.setItem('api_key', apikey);
            console.log('Using provided API key:', apikey);
            return apikey;
        }
        
        console.error('No API key available');
        return null;
        }

     async init() {
        if (!this.apikey) {
            this.showError('Please log in to manage users.');
            setTimeout(() => {
                window.location.href = 'login.php';
            }, 2000);
            return;
        }

        console.log('=== DEBUGGING STORAGE ===');
        console.log('localStorage user_type:', localStorage.getItem('user_type'));
        console.log('Current apikey:', this.apikey);
        
        // Verify manager access
        try {
            const testResponse = await this.makeApiRequest({
                type: 'GetAllUsers',
                apikey: this.apikey
            });
            
            console.log('Manager test response:', testResponse);
            
            if (testResponse.status === 'success') {
                console.log('API confirms user is a manager');
                localStorage.setItem('user_type', 'Manager');
                this.setupEventListeners();
                await this.loadUsers(); // Load initial users
            } else {
                this.showError('Access denied. Manager privileges required.');
                setTimeout(() => {
                    window.location.href = 'login.php';
                }, 2000);
            }
        } catch (error) {
            console.error('Error verifying manager status:', error);
            this.showError('Unable to verify permissions. Please try logging in again.');
            setTimeout(() => {
                window.location.href = 'login.php';
            }, 2000);
        }
    }

    async makeApiRequest(data) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => this.searchUsers());
    }

    // Delete user functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const userId = e.target.getAttribute('data-user-id');
            if (userId) {
                this.deleteUser(userId);
            }
        }
    });

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => this.loadUsers());
    }
}

    async loadUsers() {
        try {
            this.showLoading();
            const response = await this.makeApiRequest({
                type: 'GetAllUsers',
                apikey: this.apikey
            });

            if (response.status === 'success') {
                this.users = response.data || [];
                this.renderUsers();
                this.updateUserCount();
                this.showFeedback('Users loaded successfully', 'success');
            } else {
                this.showError(response.message || 'Failed to load users');
            }
        } catch (error) {
            console.error('Load users error:', error);
            this.showError('Failed to load users. Please try again.');
        }
    }

    searchUsers() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.renderUsers();
            return;
        }

        const filteredUsers = this.users.filter(user => {
            const fullName = `${user.first_names || ''} ${user.last_name || ''}`.toLowerCase();
            const username = (user.username || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const phone = (user.phone_number || '').toLowerCase();

            return fullName.includes(searchTerm) || 
                   username.includes(searchTerm) || 
                   email.includes(searchTerm) ||
                   phone.includes(searchTerm);
        });

        this.renderUsers(filteredUsers);
    }

    renderUsers(usersToRender = null) {
        const tbody = document.querySelector('.user-table tbody');
        if (!tbody) return;

        let users = usersToRender || this.users;

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-users">No users found</td></tr>';
            return;
        }

        // Sort users by user ID in ascending order
        users = [...users].sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idA - idB;
        });

        tbody.innerHTML = users.map(user => this.createUserRow(user)).join('');
    }

    createUserRow(user) {
        const userId = user.id || '';
        const firstName = user.first_names || '';
        const lastName = user.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const username = user.username || 'N/A';
        const email = user.email || 'N/A';
        const phone = user.phone_number || 'N/A';

        return `
            <tr class="user-row" data-user-id="${userId}">
                <td><strong>${userId}</strong></td>
                <td>
                    <div class="user-name">${fullName}</div>
                    <div class="user-phone">${phone}</div>
                </td>
                <td class="user-username">${username}</td>
                <td class="user-email">${email}</td>
                <td>
                    <button class="delete-btn" data-user-id="${userId}">Delete</button>
                </td>
            </tr>
        `;
    }

    async deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await this.makeApiRequest({
            type: 'DeleteUser',
            apikey: this.apikey,
            user_id: userId
        });

        if (response.status === 'success') {
            // Remove user from the local array
            this.users = this.users.filter(user => user.id != userId);
            
            // Re-render the table
            this.renderUsers();
            
            // Update count
            this.updateUserCount();
            
            // Show success message
            this.showFeedback('User deleted successfully', 'success');
        } else {
            this.showError(response.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Delete user error:', error);
        this.showError('Failed to delete user. Please try again.');
    }
}

    updateUserCount() {
        const countElement = document.getElementById('userCount');
        if (countElement) {
            countElement.textContent = `Total Users: ${this.users.length}`;
        }
    }

    showLoading() {
        const tbody = document.querySelector('.user-table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading users...</td></tr>';
        }
    }

    showError(message) {
        this.showFeedback(message, "error");
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('delete-feedback');
        if (!feedback) {
            console.error("Feedback div not found");
            return;
        }

        feedback.textContent = message;
        feedback.className = 'feedback ' + type;
        
        // Auto-clear success and info messages after 3 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                feedback.textContent = '';
                feedback.className = 'feedback';
            }, 3000);
        }
    }

    async refresh() {
        await this.loadUsers();
    }
}

// Debug functions - call from browser console
window.debugUserAPI = function() {
    if (window.userManager) {
        return window.userManager.makeApiRequest({
            type: 'GetAllUsers',
            apikey: window.userManager.apikey
        });
    }
};

window.debugUserSession = function() {
    console.log('Session Storage Contents:');
    console.log('userApiKey:', sessionStorage.getItem('userApiKey'));
    console.log('userName:', sessionStorage.getItem('userName'));
    console.log('userType:', sessionStorage.getItem('userType'));
    console.log('userId:', sessionStorage.getItem('userId'));
    
    console.log('Local Storage Contents:');
    console.log('api_key:', localStorage.getItem('api_key'));
    console.log('apikey:', localStorage.getItem('apikey'));
    console.log('user_type:', localStorage.getItem('user_type'));
    console.log('username:', localStorage.getItem('username'));
    
    if (window.userManager) {
        console.log('User Manager API Key:', window.userManager.apikey);
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("User Management page loaded");
    window.userManager = new UserManager();
});

// Optional: Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Press F5 or Ctrl+R to refresh users
    if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        if (window.userManager) {
            window.userManager.refresh();
        }
    }
    
    // Press Escape to clear search
    if (event.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            if (window.userManager) {
                window.userManager.searchUsers(); // Changed from searchByInput to searchUsers
            }
        }
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}