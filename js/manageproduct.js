class ProductManager {
    constructor() {
        this.apiEndpoint = '/CompareIt/The-Superkeys/api.php';
        this.apikey = this.getApiKey();
        this.products = [];
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
            this.showError('Please log in to manage products.');
            // Redirect to login page after showing error
            setTimeout(() => {
                window.location.href = 'login.php';
            }, 2000);
            return;
        }

        // Debug: Check what's actually stored
        console.log('=== DEBUGGING STORAGE ===');
        console.log('localStorage user_type:', localStorage.getItem('user_type'));
        console.log('sessionStorage user_type:', sessionStorage.getItem('user_type'));
        console.log('localStorage api_key:', localStorage.getItem('api_key'));
        console.log('Current apikey:', this.apikey);
        
        // Check if user is a manager - specifically look for user_type = "Manager"
        const userType = localStorage.getItem('user_type') || sessionStorage.getItem('user_type');
        console.log('User type from storage:', userType);
        
        // If user_type is not stored or not "Manager", verify via API call
        if (userType !== 'Manager') {
            console.log('User type not "Manager" or not found, verifying via API...');
            
            // Try to test manager privileges by attempting to get all users (manager-only function)
            try {
                const testResponse = await this.makeApiRequest({
                    type: 'GetAllUsers',
                    apikey: this.apikey
                });
                
                console.log('Manager test response:', testResponse);
                
                // If this succeeds, user is a manager
                if (testResponse.status === 'success') {
                    console.log('API confirms user is a manager, proceeding...');
                    // Store the correct user type for future use
                    localStorage.setItem('user_type', 'Manager');
                } else if (testResponse.message && testResponse.message.includes('NOT A MANAGER')) {
                    this.showError('Access denied. Manager privileges required.');
                    setTimeout(() => {
                        window.location.href = 'products.php';
                    }, 2000);
                    return;
                } else {
                    this.showError('Unable to verify manager status. Please try logging in again.');
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 2000);
                    return;
                }
            } catch (error) {
                console.error('Error verifying manager status:', error);
                this.showError('Unable to verify permissions. Please try logging in again.');
                setTimeout(() => {
                    window.location.href = 'login.php';
                }, 2000);
                return;
            }
        } else {
            console.log('User type is "Manager", proceeding...');
        }

        // Test API connection first
        console.log('Testing API connection with key:', this.apikey);
        
        this.setupEventListeners();
        this.showLoading();
        
        // Test if API key works by trying to get products
        await this.loadProducts();
    }

    // Debug function to test API connection
    async testApiConnection() {
        try {
            console.log('Testing API connection...');
            const response = await this.makeApiRequest({
                type: 'GetAllProducts',
                apikey: this.apikey,
                return: '*'
            });
            
            console.log('API Test Response:', response);
            return response;
        } catch (error) {
            console.error('API Test Failed:', error);
            return { status: 'error', message: error.message };
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchProducts());
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const productId = e.target.getAttribute('data-product-id');
                this.deleteProduct(productId);
            }
        });

        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadProducts());
        }
    }

    searchProducts() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.renderProducts();
            return;
        }

        const filteredProducts = this.products.filter(product => {
            const productName = (product.product_name || '').toLowerCase();
            const productId = (product.product_id || '').toString();
            const category = (product.Category || '').toLowerCase();
            const description = (product.description || '').toLowerCase();

            return productName.includes(searchTerm) || 
                   productId.includes(searchTerm) || 
                   category.includes(searchTerm) ||
                   description.includes(searchTerm);
        });

        this.renderProducts(filteredProducts);
        
        if (filteredProducts.length === 0) {
            this.showFeedback(`No products found matching "${searchTerm}"`, "info");
        }
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

            console.log('Response status:', response.status);
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
            }

            try {
                const result = JSON.parse(responseText);
                console.log('Parsed response:', result);
                return result;
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                console.error('Response text:', responseText);
                throw new Error('Invalid JSON response from server');
            }
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async loadProducts() {
        try {
            this.showLoading();

            const response = await this.makeApiRequest({
                type: 'GetAllProducts',
                apikey: this.apikey,
                return: '*'
            });

            console.log('API Response:', response);

            if (response.status === 'success') {
                this.products = response.data || [];
                this.renderProducts();
                this.updateProductCount();
                this.showFeedback(`Successfully loaded ${this.products.length} products`, "success");
            } else {
                this.showError(response.message || 'Failed to load products');
                
                // If unauthorized, redirect to login
                if (response.message && response.message.includes('Invalid Credentials')) {
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 2000);
                }
            }
        } catch (error) {
            this.showError('Failed to load products. Please try again.');
            console.error('Load products error:', error);
        }
    }

    renderProducts(productsToRender = null) {
        const tbody = document.querySelector('.user-table tbody');
        if (!tbody) return;

        let products = productsToRender || this.products;

        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-products">No products found</td></tr>';
            return;
        }

        // Sort products by product_id in ascending order
        products = [...products].sort((a, b) => {
            const idA = parseInt(a.product_id) || 0;
            const idB = parseInt(b.product_id) || 0;
            return idA - idB;
        });

        tbody.innerHTML = products.map(product => this.createProductRow(product)).join('');
    }

    createProductRow(product) {
        const productId = product.product_id || '';
        const productName = product.product_name || 'Unknown Product';
        
        // Parse category if it's JSON string
        let category = product.Category || product.category || 'Unknown';
        try {
            if (typeof category === 'string' && category.startsWith('[')) {
                const parsedCategory = JSON.parse(category);
                category = Array.isArray(parsedCategory) ? parsedCategory[0] : parsedCategory;
            }
        } catch (e) {
            // If parsing fails, use original value
        }

        const price = product.price ? `R${parseFloat(product.price).toFixed(2)}` : 'N/A';
        const availability = product.availability ? 'In Stock' : 'Out of Stock';
        const availabilityClass = product.availability ? 'in-stock' : 'out-of-stock';
        const description = product.description || '';

        return `
            <tr class="product-row" data-product-id="${productId}">
                <td><strong>${productId}</strong></td>
                <td>
                    <div class="product-name">
                        <h3>${productName}</h3>
                    </div>
                    <div class="product-description">${description}</div>
                </td>
                <td>${category}</td>
                <td class="${availabilityClass}">${availability}</td>
                <td class="price">${price}</td>
                <td>
                    <button class="delete-btn" data-product-id="${productId}">Delete</button>
                </td>
            </tr>
        `;
    }

    async deleteProduct(productId) {
        if (!productId) {
            alert('Invalid product ID');
            return;
        }

        const product = this.products.find(p => p.product_id == productId);
        const productName = product ? product.product_name : `Product ${productId}`;

        if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const deleteBtn = document.querySelector(`[data-product-id="${productId}"].delete-btn`);
            if (deleteBtn) {
                deleteBtn.textContent = 'Deleting...';
                deleteBtn.disabled = true;
            }

            const response = await this.makeApiRequest({
                type: 'RemoveProduct',
                apikey: this.apikey,
                product_id: parseInt(productId)
            });

            console.log('Delete Response:', response);

            if (response.status === 'success') {
                this.products = this.products.filter(p => p.product_id != productId);
                
                const row = document.querySelector(`[data-product-id="${productId}"]`);
                if (row) {
                    row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        row.remove();
                        this.updateProductCount();
                    }, 300);
                }

                this.showFeedback(`Product "${productName}" deleted successfully`, "success");
                
                // Apply current search filter if any
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim() !== '') {
                    this.searchProducts();
                }
            } else {
                if (deleteBtn) {
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.disabled = false;
                }
                this.showFeedback(response.message || 'Failed to delete product', "error");
            }
        } catch (error) {
            console.error('Delete product error:', error);
            this.showFeedback('Failed to delete product. Please try again.', "error");
            
            const deleteBtn = document.querySelector(`[data-product-id="${productId}"].delete-btn`);
            if (deleteBtn) {
                deleteBtn.textContent = 'Delete';
                deleteBtn.disabled = false;
            }
        }
    }

    async addProduct() {
        const form = document.getElementById('addProductForm');
        if (!form) return;

        const formData = new FormData(form);
        
        // Validate required fields
        const productName = formData.get('product_name');
        const category = formData.get('category');
        const price = formData.get('price');
        const retailerId = formData.get('retailer_id');
        
        if (!productName || !category || !price || !retailerId) {
            this.showFeedback('Please fill in all required fields', "error");
            return;
        }

        const productData = {
            type: 'AddProduct',
            apikey: this.apikey,
            product_name: productName,
            description: formData.get('description') || '',
            availability: formData.get('availability') === 'true' ? 1 : 0,
            images: formData.get('images') || '',
            category: [category],
            retailer_id: parseInt(retailerId),
            price: parseFloat(price),
            url: formData.get('url') || '',
            parameters: {}
        };

        // Add category-specific parameters
        if (category === 'Audio_Visual_Equipment') {
            productData.parameters = {
                kHz: formData.get('kHz') || '0',
                resolution: formData.get('resolution') || ''
            };
        } else if (category === 'Electronic_Accessoried') {
            productData.parameters = {
                accessory_type: formData.get('accessory_type') || '',
                compatibility: formData.get('compatibility') || ''
            };
        } else if (category === 'Computing_Devices') {
            productData.parameters = {
                cpu: formData.get('cpu') || '',
                operating_system: formData.get('operating_system') || '',
                storage: formData.get('storage') || '0'
            };
        }

        console.log('Sending product data:', productData);

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Adding...';
                submitBtn.disabled = true;
            }

            const response = await this.makeApiRequest(productData);

            console.log('Add Product Response:', response);

            if (response.status === 'success') {
                this.showFeedback('Product added successfully', "success");
                form.reset();
                await this.loadProducts();
                this.hideAddProductForm();
            } else {
                this.showFeedback(response.message || 'Failed to add product', "error");
                console.error('API Error Details:', response);
            }
        } catch (error) {
            console.error('Add product error:', error);
            this.showFeedback('Failed to add product. Please try again.', "error");
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Add Product';
                submitBtn.disabled = false;
            }
        }
    }

    showAddProductForm() {
        const modal = document.getElementById('addProductModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideAddProductForm() {
        const modal = document.getElementById('addProductModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateProductCount() {
        const countElement = document.getElementById('productCount');
        if (countElement) {
            countElement.textContent = `Total Products: ${this.products.length}`;
        }
    }

    showLoading() {
        const tbody = document.querySelector('.user-table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">Loading products...</td></tr>';
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
        await this.loadProducts();
    }
}

// Global functions for form handling
function showAddProductForm() {
    if (window.productManager) {
        window.productManager.showAddProductForm();
    }
}

function hideAddProductForm() {
    if (window.productManager) {
        window.productManager.hideAddProductForm();
    }
}

function editProduct(productId) {
    console.log('Edit product:', productId);
    alert('Edit functionality - to be implemented');
}

// Debug functions - call from browser console
window.debugAPI = function() {
    if (window.productManager) {
        return window.productManager.testApiConnection();
    }
};

window.debugSession = function() {
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
    
    if (window.productManager) {
        console.log('Product Manager API Key:', window.productManager.apikey);
    }
};

window.debugAddProduct = function(testData = null) {
    const defaultData = {
        type: 'AddProduct',
        apikey: window.productManager ? window.productManager.apikey : 'test',
        product_name: 'Test Product',
        description: 'Test Description',
        availability: 1,
        images: '',
        category: ['Audio_Visual_Equipment', 'lighting'],  // Updated to include type
        retailer_id: 1,
        price: 99.99,
        url: '',
        parameters: {
            kHz: '20',
            resolution: '1080p'
        }
    };
    
    const data = testData || defaultData;
    console.log('Testing add product with data:', data);
    
    if (window.productManager) {
        return window.productManager.makeApiRequest(data);
    }
};

// Initialize when page loads
window.onload = function() {
    console.log("Manage Products page loaded");
    window.productManager = new ProductManager();
};

// Optional: Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Press F5 or Ctrl+R to refresh products
    if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        if (window.productManager) {
            window.productManager.refresh();
        }
    }
    
    // Press Escape to clear search or close modal
    if (event.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            if (window.productManager) {
                window.productManager.searchProducts();
            }
        }
        hideAddProductForm();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
}