class UserManager {
    constructor() {
        this.apiEndpoint = 'api.php';
        this.apikey = this.getApiKey();
        this.users = [];
        this.init();
    }

    getApiKey() {
        return localStorage.getItem('apikey') || sessionStorage.getItem('apikey');
    }

    async init() {
        if (!this.apikey) {
            this.showError('Please log in to manage users.');
            return;
        }

        this.setupEventListeners();
        this.showLoading();
        await this.loadUsers();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchByInput());
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const userId = e.target.getAttribute('data-user-id');
                this.deleteUser(userId);
            }
        });

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadUsers());
        }
    }

    searchByInput() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase().trim();
        const users = document.querySelectorAll('.user-row');

        users.forEach((user) => {
            const emailElement = user.querySelector('.user-email');
            const nameElement = user.querySelector('.user-name');
            const usernameElement = user.querySelector('.user-username');
            
            if (emailElement && nameElement && usernameElement) {
                const email = emailElement.textContent.toLowerCase();
                const name = nameElement.textContent.toLowerCase();
                const username = usernameElement.textContent.toLowerCase();
                
                if (email.includes(query) || name.includes(query) || username.includes(query)) {
                    user.style.display = '';
                } else {
                    user.style.display = 'none';
                }
            }
        });
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

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error('Network error occurred');
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
            } else {
                this.showError(response.message || 'Failed to load users');
            }
        } catch (error) {
            this.showError('Failed to load users. Please try again.');
            console.error('Load users error:', error);
        }
    }

    renderUsers(usersToRender = null) {
        const tbody = document.querySelector('.user-table tbody');
        if (!tbody) return;

        const users = usersToRender || this.users;

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-users">No users found</td></tr>';
            return;
        }

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
                <td>${userId}</td>
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
        if (!userId) {
            alert('Invalid user ID');
            return;
        }

        if (!confirm(`Are you sure you want to delete user ID: ${userId}?`)) {
            return;
        }

        try {
            const deleteBtn = document.querySelector(`[data-user-id="${userId}"].delete-btn`);
            if (deleteBtn) {
                deleteBtn.textContent = 'Deleting...';
                deleteBtn.disabled = true;
            }

            const response = await this.makeApiRequest({
                type: 'DeleteUser',
                apikey: this.apikey,
                user_id: userId
            });

            if (response.status === 'success') {
                this.users = this.users.filter(u => u.id != userId);
                
                const row = document.querySelector(`[data-user-id="${userId}"]`);
                if (row) {
                    row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        row.remove();
                        this.updateUserCount();
                    }, 300);
                }

                this.showSuccessMessage('User deleted successfully');
            } else {
                if (deleteBtn) {
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.disabled = false;
                }
                alert(response.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            alert('Failed to delete user. Please try again.');
            
            const deleteBtn = document.querySelector(`[data-user-id="${userId}"].delete-btn`);
            if (deleteBtn) {
                deleteBtn.textContent = 'Delete';
                deleteBtn.disabled = false;
            }
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
        const feedback = document.getElementById('delete-feedback');
        if (feedback) {
            feedback.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    showSuccessMessage(message) {
        const feedback = document.getElementById('delete-feedback');
        if (feedback) {
            feedback.innerHTML = `<div class="success-message">${message}</div>`;
            setTimeout(() => {
                feedback.innerHTML = '';
            }, 3000);
        }
    }

    async refresh() {
        await this.loadUsers();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.userManager = new UserManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}