class WishlistManager {
    constructor() {
        this.apiEndpoint = "/CompareIt/The-Superkeys/api.php"; 
        // Fixed: Check API key storage like products.js (api_key is primary)
        this.apikey = localStorage.getItem('api_key') || 
                     localStorage.getItem('apikey') || 
                     sessionStorage.getItem('api_key') || 
                     sessionStorage.getItem('apikey') || 
                     null;
        
        // Default placeholder image - consistent with products.js
        this.defaultImage = 'img/placeholder.jpg';
        
        this.init();
    }

    async init() {
        if (!this.apikey) {
            this.showError('Please log in to view your wishlist');
            this.showLoginButton();
            return;
        }

        this.showLoading();
        try {
            await this.loadWishlist();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize wishlist');
        }
    }

    showLoading() {
        const grid = document.querySelector('.wishlist-grid');
        grid.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading your wishlist...</p>
            </div>
        `;
    }

    showError(message) {
        const grid = document.querySelector('.wishlist-grid');
        grid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
            </div>
        `;
    }

    showLoginButton() {
        const grid = document.querySelector('.wishlist-grid');
        grid.innerHTML = `
            <div class="login-prompt">
                <p>Please log in to view your wishlist</p>
                <button onclick="window.location.href='login.php'" class="login-btn">
                    Go to Login
                </button>
            </div>
        `;
    }

    async makeApiRequest(data) {
        try {
            console.log('Making API request:', data);
            
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
            console.log('API response:', result);
            
            return result;
        } catch (error) {
            console.error('API request failed:', error);
            throw new Error(`Network error: ${error.message}`);
        }
    }

    async loadWishlist() {
        try {
            const response = await this.makeApiRequest({
                type: 'GetWishlist',
                apikey: this.apikey
            });

            if (response.status === 'success') {
                this.renderWishlist(response.data);
            } else {
                if (response.message && response.message.includes('Invalid')) {
                    this.handleInvalidCredentials();
                } else {
                    this.showError(response.message || 'Failed to load wishlist');
                }
            }
        } catch (error) {
            console.error('Load wishlist error:', error);
            this.showError('Failed to load wishlist. Please check your connection and try again.');
        }
    }

    handleInvalidCredentials() {
        // Clear invalid API key from all possible storage locations (same as products.js)
        localStorage.removeItem('api_key');
        localStorage.removeItem('apikey');
        sessionStorage.removeItem('api_key');
        sessionStorage.removeItem('apikey');
        
        this.apikey = null;
        this.showError('Your session has expired. Please log in again.');
        this.showLoginButton();
    }

    renderWishlist(items) {
        const grid = document.querySelector('.wishlist-grid');
        
        if (!items || items.length === 0) {
            grid.innerHTML = `
                <div class="empty-wishlist">
                    <div class="empty-icon">🛒</div>
                    <h3>Your wishlist is empty</h3>
                    <p>Start adding products you love!</p>
                    <button onclick="window.location.href='products.php'" class="browse-btn">
                        Browse Products
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = items.map(item => this.createWishlistItemHTML(item)).join('');
    }

    createWishlistItemHTML(item) {
    // Parse images exactly like in products.js
    let images;
    try {
        images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
    } catch (e) {
        images = [item.images]; // fallback if parsing fails
    }
    
    const imageUrl = (images && images.length > 0) ? images[0] : this.defaultImage;
    
    // Parse category exactly like in products.js
    let category;
    try {
        category = typeof item.Category === 'string' ? JSON.parse(item.Category) : item.Category;
    } catch (e) {
        category = [item.Category]; // fallback if parsing fails
    }
    
    const productName = this.escapeHtml(item.product_name || 'Unknown Product');
    const description = this.escapeHtml(item.description || '');
    const productId = item.product_id;
    const availability = item.availability;

    // Modified structure without price and retailer info
    return `
        <div class="wishlist-item product" 
             data-product-id="${productId}" 
             data-id="${productId}"
             data-category="${category ? category[0] : ''}" 
             data-type="${category ? category[1] : ''}">
            <div class="wishlist-image">
                <a href="view.php?id=${productId}">
                    <img src="${imageUrl}" 
                         alt="${productName}" 
                         onerror="this.src='${this.defaultImage}'; this.onerror=null;"
                         loading="lazy"
                         class="productImg">
                </a>
            </div>
            <div class="wishlist-details">
                <a href="view.php?id=${productId}">
                    <h2 id="product_name">${productName}</h2>
                </a>
                ${description ? `<p class="wishlist-description">${description}</p>` : ''}
                <p class="wishlist-availability">
                    <span class="availability-status ${availability ? 'in-stock' : 'out-of-stock'}">
                        ${availability ? '✅ In Stock' : '❌ Out of Stock'}
                    </span>
                </p>
                <a href="view.php?id=${productId}"><p>Tap for more</p></a>
                <div class="wishlist-actions" style="display: flex; justify-content: center; margin-top: 10px;">
                    <button class="remove-btn" data-product-id="${productId}" title="Remove from wishlist" 
                            style="padding: 8px 16px; border-radius: 4px; border: none; background-color: #dc3545; color: white; cursor: pointer;">
                        🗑️ Remove
                    </button>
                </div>
            </div>
        </div>
    `;
}

    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const productId = e.target.getAttribute('data-product-id');
                this.removeFromWishlist(productId);
            }
        });

        // Add refresh button listener if it exists
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }
    }

    async removeFromWishlist(productId) {
        if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
            return;
        }

        const itemElement = document.querySelector(`[data-product-id="${productId}"]`);
        const removeBtn = itemElement.querySelector('.remove-btn');
        const originalText = removeBtn.innerHTML;
        
        // Show loading state
        removeBtn.innerHTML = '⏳ Removing...';
        removeBtn.disabled = true;

        try {
            const response = await this.makeApiRequest({
                type: 'RemoveWishlist',
                apikey: this.apikey,
                pid: parseInt(productId)
            });

            if (response.status === 'success') {
                // Animate removal
                itemElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                itemElement.style.opacity = '0';
                itemElement.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    itemElement.remove();

                    // Check if wishlist is now empty
                    const remainingItems = document.querySelectorAll('.wishlist-item');
                    if (remainingItems.length === 0) {
                        this.renderWishlist([]);
                    }
                }, 300);

                this.showSuccessMessage('Item removed from wishlist');
                
                // Update wishlist count
                if (typeof updateWishlistCount === 'function') {
                    updateWishlistCount();
                }
            } else {
                if (response.message && response.message.includes('Invalid')) {
                    this.handleInvalidCredentials();
                } else {
                    throw new Error(response.message || 'Failed to remove item from wishlist');
                }
            }
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            
            // Restore button state
            removeBtn.innerHTML = originalText;
            removeBtn.disabled = false;
            
            this.showErrorMessage(error.message || 'Failed to remove item. Please try again.');
        }
    }

    async addToWishlist(productId) {
        if (!this.apikey) {
            this.redirectToLogin();
            return;
        }

        try {
            const response = await this.makeApiRequest({
                type: 'AddWishlist',
                apikey: this.apikey,
                pid: parseInt(productId)
            });

            if (response.status === 'success') {
                this.showSuccessMessage('Product added to wishlist!');
                
                // Update wishlist count
                if (typeof updateWishlistCount === 'function') {
                    updateWishlistCount();
                }
                
                await this.refresh(); // Refresh the wishlist
            } else {
                if (response.message && response.message.includes('Invalid')) {
                    this.handleInvalidCredentials();
                } else if (response.message && response.message.includes('already in wishlist')) {
                    this.showErrorMessage('Product is already in your wishlist');
                } else {
                    throw new Error(response.message || 'Failed to add product to wishlist');
                }
            }
        } catch (error) {
            console.error('Add to wishlist error:', error);
            this.showErrorMessage(error.message || 'Failed to add product to wishlist');
        }
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="notification-close">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    redirectToLogin() {
        if (confirm('Please log in to manage your wishlist. Go to login page?')) {
            window.location.href = 'login.php';
        }
    }

    async refresh() {
        if (!this.apikey) {
            this.showError('Please log in to view your wishlist');
            return;
        }

        this.showLoading();
        await this.loadWishlist();
    }

    // Method to get wishlist count (useful for header display)
    async getWishlistCount() {
        if (!this.apikey) return 0;

        try {
            const response = await this.makeApiRequest({
                type: 'GetWishlist',
                apikey: this.apikey
            });

            if (response.status === 'success' && response.data) {
                return response.data.length;
            }
            return 0;
        } catch (error) {
            console.error('Error getting wishlist count:', error);
            return 0;
        }
    }
}

// Unified global functions that work with both products.js and wishlist
function viewProduct(productId) {
    window.location.href = `view.php?id=${productId}`;
}



// Unified global function to add product to wishlist (works from any page)
async function addToWishlist(productId) {
    // Get API key using the same priority as products.js
    const apikey = localStorage.getItem('api_key') || 
                   localStorage.getItem('apikey') || 
                   sessionStorage.getItem('api_key') || 
                   sessionStorage.getItem('apikey');

    if (!apikey) {
        if (confirm('Please log in to manage your wishlist. Go to login page?')) {
            window.location.href = 'login.php';
        }
        return;
    }

    // Find the product element and button (works for both products.js and wishlist.js)
    const productElement = document.querySelector(`[data-id="${productId}"]`);
    const addButton = productElement ? productElement.querySelector('.add') : null;
    
    if (addButton) {
        const originalText = addButton.textContent;
        addButton.textContent = 'Adding...';
        addButton.disabled = true;
    }

    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'AddWishlist',
                apikey: apikey,
                pid: parseInt(productId)
            })
        });

        const result = await response.json();
        
        if (result.status === 'success') {
            if (typeof showNotification === 'function') {
                showNotification('Product added to wishlist! ❤️', 'success');
            } else {
                alert('Product added to wishlist!');
            }
            
            // Update wishlist count in header if function exists
            if (typeof updateWishlistCount === 'function') {
                updateWishlistCount();
            }
            
            // Update button text to show it's added
            if (addButton) {
                addButton.textContent = 'Added to Wishlist!';
                addButton.style.backgroundColor = '#28a745';
                setTimeout(() => {
                    if (addButton.textContent === 'Added to Wishlist!') {
                        addButton.textContent = originalText || 'Add to Wishlist';
                        addButton.style.backgroundColor = '';
                        addButton.disabled = false;
                    }
                }, 2000);
            }
            
        } else {
            if (result.message && result.message.includes('already in wishlist')) {
                if (typeof showNotification === 'function') {
                    showNotification('Product is already in your wishlist', 'error');
                } else {
                    alert('Product is already in your wishlist');
                }
            } else if (result.message && result.message.includes('Invalid')) {
                // Clear invalid credentials using same method as products.js
                localStorage.removeItem('apikey');
                localStorage.removeItem('api_key');
                sessionStorage.removeItem('apikey');
                sessionStorage.removeItem('api_key');
                if (confirm('Your session has expired. Please log in again.')) {
                    window.location.href = 'login.php';
                }
            } else {
                throw new Error(result.message || 'Failed to add product to wishlist');
            }
            
            // Restore button state
            if (addButton) {
                addButton.textContent = originalText || 'Add to Wishlist';
                addButton.disabled = false;
            }
        }
    } catch (error) {
        console.error('Add to wishlist error:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to add product to wishlist', 'error');
        } else {
            alert('Failed to add product to wishlist');
        }
        
        // Restore button state
        if (addButton) {
            addButton.textContent = originalText || 'Add to Wishlist';
            addButton.disabled = false;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize wishlist manager on wishlist page
    if (document.querySelector('.wishlist-grid')) {
        window.wishlistManager = new WishlistManager();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishlistManager;
}