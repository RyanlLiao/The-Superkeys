class WishlistManager {
    constructor() {
        this.apiEndpoint = "/CompareIt/The-Superkeys/api.php"; 
        this.apikey = localStorage.getItem('api_key') || null;
        this.init();
    }

    
    async init() {
        if (!this.apikey) 
        {
            this.showError('Please log in to view your wishlist');
            return;
        }

        this.showLoading();
        await this.loadWishlist();
        this.setupEventListeners();
    }

    showLoading() {
        const grid = document.querySelector('.wishlist-grid');
        grid.innerHTML = '<div class="loading">Loading your wishlist...</div>';
    }

    showError(message) 
    {
        const grid = document.querySelector('.wishlist-grid');
        grid.innerHTML = `<div class="error-message">${message}</div>`;
    }

    async makeApiRequest(data) {

       
        try {
            const response = await fetch(this.apiEndpoint, 
                {
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

    async loadWishlist() {
        try {
            const response = await this.makeApiRequest({
                type: 'GetWishlist',
                apikey: this.apikey
            });

            if (response.status === 'success') {
                this.renderWishlist(response.data);
            } else {
                this.showError(response.message || 'Failed to load wishlist');
            }
        } catch (error) {
            this.showError('Failed to load wishlist. Please try again.');
            console.error('Load wishlist error:', error);
        }
    }


    renderWishlist(items) {
        const grid = document.querySelector('.wishlist-grid');
        
        if (!items || items.length === 0) {
            grid.innerHTML = '<div class="empty-wishlist">Your wishlist is empty</div>';
            return;
        }

        grid.innerHTML = items.map(item => this.createWishlistItemHTML(item)).join('');
    }

    createWishlistItemHTML(item) {
        const imageUrl = item.images || 'img/default-product.jpg';
        const productName = item.product_name || 'Unknown Product';
        const price = item.price ? `R${parseFloat(item.price).toFixed(2)}` : 'Price not available';
        const productId = item.product_id;

        return `
            <div class="wishlist-item" data-product-id="${productId}">
                <img src="${imageUrl}" alt="${productName}" onerror="this.src='img/default-product.jpg'">
                <div class="wishlist-details">
                    <p class="wishlist-title">${productName}</p>
                    <p class="wishlist-description">${item.description || ''}</p>
                    <p class="wishlist-price">${price}</p>
                    <p class="wishlist-availability">
                        <span class="availability-status ${item.availability ? 'in-stock' : 'out-of-stock'}">
                            ${item.availability ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </p>
                    <div class="wishlist-actions">
                        <button class="remove-btn" data-product-id="${productId}">Remove from Wishlist</button>
                        <button class="view-btn" onclick="viewProduct(${productId})">View Product</button>
                    </div>
                </div>
            </div>
        `;
    }
    setupEventListeners() 
    {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const productId = e.target.getAttribute('data-product-id');
                this.removeFromWishlist(productId);
            }
        });
    }

    async removeFromWishlist(productId) {
        if (!confirm('Are you sure you want to remove this item from your wishlist?')) {
            return;
        }

        try {
            
            const itemElement = document.querySelector(`[data-product-id="${productId}"]`);
            const removeBtn = itemElement.querySelector('.remove-btn');
            const originalText = removeBtn.textContent;
            removeBtn.textContent = 'Removing...';
            removeBtn.disabled = true;

            const response = await this.makeApiRequest({
                type: 'RemoveWishlist',
                apikey: this.apikey,
                pid: productId
            });

            if (response.status === 'success') {
                
                itemElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                itemElement.style.opacity = '0';
                itemElement.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    itemElement.remove();

                    const remainingItems = document.querySelectorAll('.wishlist-item');
                    if (remainingItems.length === 0) {
                        const grid = document.querySelector('.wishlist-grid');
                        grid.innerHTML = '<div class="empty-wishlist">Your wishlist is empty</div>';
                    }
                }, 300);

                this.showSuccessMessage('Item removed from wishlist');
            } else {
               
                removeBtn.textContent = originalText;
                removeBtn.disabled = false;
                alert(response.message || 'Failed to remove item from wishlist');
            }
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            alert('Failed to remove item. Please try again.');
            
            
            const removeBtn = document.querySelector(`[data-product-id="${productId}"] .remove-btn`);
            if (removeBtn) {
                removeBtn.textContent = 'Remove from Wishlist';
                removeBtn.disabled = false;
            }
        }
    }

    
    showSuccessMessage(message) {
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
    async refresh() {
        await this.loadWishlist();
    }
}

function viewProduct(productId) {
    window.location.href = `product.php?id=${productId}`;
}


document.addEventListener('DOMContentLoaded', () => {
    window.wishlistManager = new WishlistManager();
});


if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishlistManager;
}