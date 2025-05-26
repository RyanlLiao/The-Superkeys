class ProductManager {
    constructor() {
        this.apiEndpoint = 'api.php';
        this.apikey = this.getApiKey();
        this.products = [];
        this.init();
    }

    getApiKey() {
        return localStorage.getItem('apikey') || sessionStorage.getItem('apikey');
    }

    async init() {
        if (!this.apikey) {
            this.showError('Please log in to manage products.');
            return;
        }

        this.setupEventListeners();
        this.showLoading();
        await this.loadProducts();
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchByInput());
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

    searchByInput() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const query = searchInput.value.toLowerCase().trim();
        const products = document.querySelectorAll('.product-row');

        products.forEach((product) => {
            const productNameElement = product.querySelector('h3');
            if (productNameElement) {
                const productName = productNameElement.textContent.toLowerCase();
                if (productName.includes(query)) {
                    product.style.display = '';
                } else {
                    product.style.display = 'none';
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

    async loadProducts() {
        try {
            this.showLoading();

            const response = await this.makeApiRequest({
                type: 'GetAllProducts',
                apikey: this.apikey,
                return: '*'
            });

            if (response.status === 'success') {
                this.products = response.data || [];
                this.renderProducts();
                this.updateProductCount();
            } else {
                this.showError(response.message || 'Failed to load products');
            }
        } catch (error) {
            this.showError('Failed to load products. Please try again.');
            console.error('Load products error:', error);
        }
    }

    renderProducts(productsToRender = null) {
        const tbody = document.querySelector('.user-table tbody');
        if (!tbody) return;

        const products = productsToRender || this.products;

        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-products">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => this.createProductRow(product)).join('');
    }

    createProductRow(product) {
        const productId = product.product_id || '';
        const productName = product.product_name || 'Unknown Product';
        const category = product.Category || product.category || 'Unknown';
        const price = product.price ? `R${parseFloat(product.price).toFixed(2)}` : 'N/A';
        const availability = product.availability ? 'In Stock' : 'Out of Stock';
        const description = product.description || '';

        return `
            <tr class="product-row" data-product-id="${productId}">
                <td>${productId}</td>
                <td>
                    <div class="product-name">
                        <h3>${productName}</h3>
                    </div>
                    <div class="product-description">${description}</div>
                </td>
                <td>${category}</td>
                <td>
                    <span class="availability ${availability === 'In Stock' ? 'in-stock' : 'out-of-stock'}">
                        ${availability}
                    </span>
                </td>
                <td class="price">${price}</td>
                <td>
                    <button class="delete-btn" data-product-id="${productId}">Delete</button>
                    <button class="edit-btn" data-product-id="${productId}" onclick="editProduct(${productId})">Edit</button>
                </td>
            </tr>
        `;
    }

    async deleteProduct(productId) {
        if (!productId) {
            alert('Invalid product ID');
            return;
        }

        if (!confirm(`Are you sure you want to delete product ID: ${productId}?`)) {
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
                product_id: productId
            });

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

                this.showSuccessMessage('Product deleted successfully');
            } else {
                if (deleteBtn) {
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.disabled = false;
                }
                alert(response.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Delete product error:', error);
            alert('Failed to delete product. Please try again.');
            
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
        
        const productData = {
            type: 'AddProduct',
            apikey: this.apikey,
            product_name: formData.get('product_name'),
            description: formData.get('description'),
            availability: formData.get('availability') === 'true',
            images: formData.get('images'),
            category: [formData.get('category')],
            retailer_id: parseInt(formData.get('retailer_id')),
            price: parseFloat(formData.get('price')),
            url: formData.get('url'),
            parameters: {}
        };

        const category = formData.get('category');
        if (category === 'Audio_Visual_Equipment') {
            productData.parameters = {
                kHz: formData.get('kHz'),
                resolution: formData.get('resolution')
            };
        } else if (category === 'Electronic_Accessoried') {
            productData.parameters = {
                accessory_type: formData.get('accessory_type'),
                compatibility: formData.get('compatibility')
            };
        } else if (category === 'Computing_Devices') {
            productData.parameters = {
                cpu: formData.get('cpu'),
                operating_system: formData.get('operating_system'),
                storage: formData.get('storage')
            };
        }

        try {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Adding...';
                submitBtn.disabled = true;
            }

            const response = await this.makeApiRequest(productData);

            if (response.status === 'success') {
                this.showSuccessMessage('Product added successfully');
                form.reset();
                await this.loadProducts();
                this.hideAddProductForm();
            } else {
                alert(response.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Add product error:', error);
            alert('Failed to add product. Please try again.');
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Add Product';
                submitBtn.disabled = false;
            }
        }
    }

    showAddProductForm() {
        const form = document.getElementById('addProductModal');
        if (form) {
            form.style.display = 'block';
        }
    }

    hideAddProductForm() {
        const form = document.getElementById('addProductModal');
        if (form) {
            form.style.display = 'none';
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
        await this.loadProducts();
    }
}

function editProduct(productId) {
    console.log('Edit product:', productId);
    alert('Edit functionality - to be implemented');
}

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

document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductManager;
}