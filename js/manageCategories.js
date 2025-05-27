class CategoryManager {
    constructor() {
        this.apiEndpoint = '/CompareIt/The-Superkeys/api.php';
        this.apikey = this.getApiKey();
        this.categories = [];
        this.editingCategory = null;
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
            this.showError('Please log in to manage categories.');
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

        this.setupEventListeners();
        this.showLoading();
        
        // Test if API key works by trying to get categories
        await this.loadCategories();
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
        // Set up event listeners for new HTML structure
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => this.openModal());
        }

        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        const addFieldBtn = document.getElementById('addFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => {
                this.addAttributeRow();
                // Add a little visual feedback
                addFieldBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    addFieldBtn.style.transform = 'scale(1)';
                }, 150);
            });
        }

        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => this.submitCategory());
        }

        // Close modal button
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchCategories());
        }

        // Event delegation for edit and delete buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const categoryName = e.target.getAttribute('data-category-name');
                this.editCategory(categoryName);
            } else if (e.target.classList.contains('delete-btn')) {
                const categoryName = e.target.getAttribute('data-category-name');
                this.deleteCategory(categoryName);
            }
        });

        // Close modal when clicking outside
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
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

    async loadCategories() {
        try {
            this.showLoading();

            // First try GetCategories, if that fails, use a fallback approach
            let response;
            try {
                response = await this.makeApiRequest({
                    type: 'GetCategories',
                    apikey: this.apikey
                });
            } catch (error) {
                console.log('GetCategories failed, trying fallback approach...');
                // Fallback: For now, show empty state and let user add categories
                this.categories = [];
                this.renderCategories();
                this.updateCategoryCount();
                this.showFeedback('Categories loaded. You can add new categories using the Add Category button.', "info");
                return;
            }

            console.log('Categories API Response:', response);

            if (response.status === 'success') {
                this.categories = response.data || [];
                this.renderCategories();
                this.updateCategoryCount();
                this.showFeedback(`Successfully loaded ${this.categories.length} categories`, "success");
            } else {
                this.showError(response.message || 'Failed to load categories');
                
                // If unauthorized, redirect to login
                if (response.message && response.message.includes('Invalid Credentials')) {
                    setTimeout(() => {
                        window.location.href = 'login.php';
                    }, 2000);
                }
            }
        } catch (error) {
            this.showError('Failed to load categories. Please try again.');
            console.error('Load categories error:', error);
        }
    }

    searchCategories() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.renderCategories();
            return;
        }

        const filteredCategories = this.categories.filter(category => {
            const categoryName = (category.category || '').toLowerCase();
            const attributes = (category.attributes || []).join(' ').toLowerCase();

            return categoryName.includes(searchTerm) || attributes.includes(searchTerm);
        });

        this.renderCategories(filteredCategories);
        
        if (filteredCategories.length === 0) {
            this.showFeedback(`No categories found matching "${searchTerm}"`, "info");
        }
    }

    renderCategories(categoriesToRender = null) {
        const tbody = document.querySelector('.category-table tbody');
        if (!tbody) return;

        let categories = categoriesToRender || this.categories;

        if (!categories || categories.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="no-categories">No categories found</td></tr>';
            return;
        }

        tbody.innerHTML = categories.map((category) => this.createCategoryRow(category)).join('');
    }

    createCategoryRow(category) {
        const categoryName = category.category || 'Unknown';
        const attributes = category.attributes || [];
        
        // Filter out product_id from attributes display
        const displayAttributes = attributes.filter(attr => attr !== 'product_id').join(', ') || 'None';
        const description = `Fields: ${displayAttributes}`;
        const status = attributes.length > 1 ? 'Active' : 'Empty'; // More than just product_id

        return `
            <tr class="category-row" data-category-name="${categoryName}">
                <td>
                    <div class="category-name">
                        <strong>${categoryName}</strong>
                    </div>
                </td>
                <td>${description}</td>
                <td class="status ${status.toLowerCase()}">${status}</td>
                <td>
                    <button class="btn btn-sm edit-btn" data-category-name="${categoryName}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-category-name="${categoryName}">Delete</button>
                </td>
            </tr>
        `;
    }

    openModal() {
        this.editingCategory = null;
        const modal = document.getElementById("categoryModal");
        const modalTitle = document.getElementById("modalTitle");
        const categoryName = document.getElementById("categoryName");
        const fieldsContainer = document.getElementById("fieldsContainer");
        
        if (modal) modal.style.display = "block";
        if (modalTitle) modalTitle.textContent = 'Add New Category';
        if (categoryName) {
            categoryName.value = "";
            categoryName.readOnly = false;
            categoryName.placeholder = "e.g., Electronics, Clothing, Books";
        }
        if (fieldsContainer) {
            fieldsContainer.innerHTML = `
                <div class="help-section" style="background-color: #e9f7ff; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #0066cc;">Category Fields Guide</h4>
                    <p style="margin: 0 0 10px 0; font-size: 14px;">Add attributes/fields for this category. Each product in this category will have these fields.</p>
                    <div style="font-size: 13px; color: #666;">
                        <strong>Examples:</strong><br>
                        • <strong>Electronics:</strong> Brand, Model, Warranty, Power_Rating<br>
                        • <strong>Clothing:</strong> Size, Color, Material, Care_Instructions<br>
                        • <strong>Books:</strong> Author, Publisher, Genre, ISBN<br>
                        • <strong>Furniture:</strong> Dimensions, Material, Weight_Limit, Assembly_Required
                    </div>
                </div>
            `;
            // Add one initial field row
            this.addAttributeRow();
        }
    }

    closeModal() {
        const modal = document.getElementById("categoryModal");
        const categoryName = document.getElementById("categoryName");
        const fieldsContainer = document.getElementById("fieldsContainer");
        
        if (modal) {
            modal.style.display = "none";
            // Remove any validation errors
            const validationError = modal.querySelector('.validation-error');
            if (validationError) {
                validationError.remove();
            }
        }
        if (categoryName) categoryName.value = "";
        if (fieldsContainer) fieldsContainer.innerHTML = "";
        this.editingCategory = null;
    }

    addAttributeRow() {
        const container = document.getElementById("fieldsContainer");
        if (!container) return;

        const row = document.createElement("div");
        row.classList.add("field-row");
        row.style.cssText = `
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
            align-items: end;
        `;
        
        row.innerHTML = `
            <div class="form-group" style="flex: 1;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Field Name:</label>
                <input type="text" placeholder="e.g., Brand, Color, Size" class="attr-name" required
                       style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px;">
            </div>
            <div class="form-group" style="flex: 1;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Data Type:</label>
                <select class="attr-type" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px;">
                    <option value="VARCHAR(255)">Text (Short)</option>
                    <option value="TEXT">Text (Long)</option>
                    <option value="INT">Whole Number</option>
                    <option value="DECIMAL(10,2)">Decimal Number</option>
                    <option value="DATE">Date</option>
                    <option value="BOOLEAN">Yes/No</option>
                </select>
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-sm btn-danger remove-field-btn" 
                        style="padding: 8px 12px; background-color: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;"
                        onclick="this.parentElement.parentElement.remove()">
                    Remove
                </button>
            </div>
        `;

        container.appendChild(row);

        // Update field count
        this.updateFieldCount();

        // Add some helpful examples in placeholder when user focuses
        const nameInput = row.querySelector('.attr-name');
        if (nameInput) {
            const examples = [
                'Brand', 'Model', 'Color', 'Size', 'Weight', 'Material', 
                'Warranty', 'Price_Range', 'Condition', 'Rating'
            ];
            nameInput.addEventListener('focus', function() {
                if (!this.value) {
                    const randomExample = examples[Math.floor(Math.random() * examples.length)];
                    this.placeholder = `e.g., ${randomExample}`;
                }
            });
        }

        // Add event listener to remove button to update count
        const removeBtn = row.querySelector('.remove-field-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                setTimeout(() => this.updateFieldCount(), 100); // Small delay for DOM update
            });
        }
    }

    updateFieldCount() {
        const fieldCount = document.querySelectorAll('.field-row').length;
        const addFieldBtn = document.getElementById('addFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.textContent = fieldCount === 0 ? 'Add Field' : `Add Another Field (${fieldCount} added)`;
        }
    }

    async submitCategory() {
        const categoryName = document.getElementById("categoryName").value.trim();
        if (!categoryName) {
            this.showValidationError("Please enter a category name.");
            return;
        }

        // Validate category name (no spaces, special characters)
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(categoryName)) {
            this.showValidationError("Category name must start with a letter and contain only letters, numbers, and underscores. No spaces allowed.");
            return;
        }

        // Check if category already exists (for new categories)
        if (!this.editingCategory && this.categories.some(cat => cat.category.toLowerCase() === categoryName.toLowerCase())) {
            this.showValidationError(`Category "${categoryName}" already exists. Please choose a different name.`);
            return;
        }

        const attributes = [];
        const datatypes = [];
        const fieldNames = new Set(); // To check for duplicates
        
        const fieldRows = document.querySelectorAll('.field-row');
        
        if (fieldRows.length === 0) {
            this.showValidationError("Please add at least one field for this category.");
            return;
        }

        let hasValidationError = false;
        
        fieldRows.forEach((row, index) => {
            const name = row.querySelector('.attr-name').value.trim();
            const type = row.querySelector('.attr-type').value;
            
            if (name) {
                // Validate field name
                if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
                    this.showValidationError(`Field "${name}" is invalid. Must start with a letter and contain only letters, numbers, and underscores.`);
                    hasValidationError = true;
                    return;
                }
                
                // Check for duplicate field names
                if (fieldNames.has(name.toLowerCase())) {
                    this.showValidationError(`Duplicate field name "${name}". Each field must have a unique name.`);
                    hasValidationError = true;
                    return;
                }
                
                fieldNames.add(name.toLowerCase());
                attributes.push(name);
                datatypes.push(type);
            } else if (fieldRows.length === 1) {
                // If there's only one row and it's empty, that's an error
                this.showValidationError("Please enter a field name or remove the empty field.");
                hasValidationError = true;
                return;
            }
        });

        if (hasValidationError) return;

        if (attributes.length === 0) {
            this.showValidationError("Please add at least one valid field.");
            return;
        }

        try {
            const submitBtn = document.getElementById('saveCategoryBtn');
            if (submitBtn) {
                submitBtn.textContent = this.editingCategory ? 'Updating...' : 'Creating...';
                submitBtn.disabled = true;
            }

            let response;
            if (this.editingCategory) {
                // Update existing category
                response = await this.makeApiRequest({
                    type: 'UpdateCategory',
                    apikey: this.apikey,
                    category_name: categoryName,
                    fields: attributes,
                    datatypes: datatypes
                });
            } else {
                // Create new category
                response = await this.makeApiRequest({
                    type: 'CreateCategory',
                    apikey: this.apikey,
                    category_name: categoryName,
                    fields: attributes,
                    datatypes: datatypes
                });
            }

            console.log('Category operation response:', response);

            if (response.status === 'success') {
                const action = this.editingCategory ? 'updated' : 'created';
                this.showFeedback(`Category "${categoryName}" ${action} successfully with ${attributes.length} field(s)!`, "success");
                this.closeModal();
                await this.loadCategories();
            } else {
                this.showError(response.message || `Failed to ${this.editingCategory ? 'update' : 'create'} category`);
            }
        } catch (error) {
            console.error('Category operation error:', error);
            this.showError(`Failed to ${this.editingCategory ? 'update' : 'create'} category. Please try again.`);
        } finally {
            const submitBtn = document.getElementById('saveCategoryBtn');
            if (submitBtn) {
                submitBtn.textContent = 'Save Category';
                submitBtn.disabled = false;
            }
        }
    }

    showValidationError(message) {
        // Create a temporary validation error message
        const modal = document.getElementById('categoryModal');
        if (!modal) return;

        // Remove any existing validation error
        const existingError = modal.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }

        // Create new validation error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.cssText = `
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px;
            border: 1px solid #f5c6cb;
            border-radius: 5px;
            margin-bottom: 15px;
            font-size: 14px;
        `;
        errorDiv.textContent = message;

        // Insert after the modal header
        const modalContent = modal.querySelector('.modal-content');
        const form = modal.querySelector('#categoryForm');
        if (modalContent && form) {
            modalContent.insertBefore(errorDiv, form);
        }

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    async editCategory(categoryName) {
        const category = this.categories.find(c => c.category === categoryName);
        if (!category) {
            this.showError('Category not found');
            return;
        }

        this.editingCategory = categoryName;
        
        // Open modal and set up for editing
        const modal = document.getElementById("categoryModal");
        const modalTitle = document.getElementById("modalTitle");
        const categoryNameInput = document.getElementById("categoryName");
        const fieldsContainer = document.getElementById("fieldsContainer");
        
        if (modal) modal.style.display = "block";
        if (modalTitle) modalTitle.textContent = 'Edit Category';
        if (categoryNameInput) {
            categoryNameInput.value = categoryName;
            categoryNameInput.readOnly = true; // Prevent changing category name
        }

        // Clear existing attributes
        if (fieldsContainer) fieldsContainer.innerHTML = "";

        // Add existing attributes
        const attributes = category.attributes || [];
        attributes.forEach(attr => {
            if (attr !== 'product_id') { // Don't show product_id as it's always present
                this.addAttributeRow();
                const rows = document.querySelectorAll('.field-row');
                const lastRow = rows[rows.length - 1];
                if (lastRow) {
                    const nameInput = lastRow.querySelector('.attr-name');
                    const typeSelect = lastRow.querySelector('.attr-type');
                    if (nameInput) nameInput.value = attr;
                    // Note: We can't determine the exact datatype from the API response,
                    // so we'll default to VARCHAR(255). User can change if needed.
                    if (typeSelect) typeSelect.value = 'VARCHAR(255)';
                }
            }
        });

        // Update field count after adding existing fields
        this.updateFieldCount();
    }

    async deleteCategory(categoryName) {
        if (!categoryName) {
            alert('Invalid category name');
            return;
        }

        if (!confirm(`Are you sure you want to delete the "${categoryName}" category? This will also delete all associated product data and cannot be undone.`)) {
            return;
        }

        try {
            const deleteBtn = document.querySelector(`[data-category-name="${categoryName}"].delete-btn`);
            if (deleteBtn) {
                deleteBtn.textContent = 'Deleting...';
                deleteBtn.disabled = true;
            }

            const response = await this.makeApiRequest({
                type: 'RemoveCategory',
                apikey: this.apikey,
                category_name: categoryName
            });

            console.log('Delete Response:', response);

            if (response.status === 'success') {
                this.categories = this.categories.filter(c => c.category !== categoryName);
                
                const row = document.querySelector(`[data-category-name="${categoryName}"]`);
                if (row) {
                    row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    row.style.opacity = '0';
                    row.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        row.remove();
                        this.updateCategoryCount();
                    }, 300);
                }

                this.showFeedback(`Category "${categoryName}" deleted successfully`, "success");
                
                // Apply current search filter if any
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value.trim() !== '') {
                    this.searchCategories();
                }
            } else {
                if (deleteBtn) {
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.disabled = false;
                }
                this.showFeedback(response.message || 'Failed to delete category', "error");
            }
        } catch (error) {
            console.error('Delete category error:', error);
            this.showFeedback('Failed to delete category. Please try again.', "error");
            
            const deleteBtn = document.querySelector(`[data-category-name="${categoryName}"].delete-btn`);
            if (deleteBtn) {
                deleteBtn.textContent = 'Delete';
                deleteBtn.disabled = false;
            }
        }
    }

    updateCategoryCount() {
        const countElement = document.getElementById('categoryCount');
        if (countElement) {
            countElement.textContent = `Total Categories: ${this.categories.length}`;
        }
    }

    showLoading() {
        const tbody = document.querySelector('.category-table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading categories...</td></tr>';
        }
        
        const countElement = document.getElementById('categoryCount');
        if (countElement) {
            countElement.textContent = 'Loading...';
        }
    }

    showError(message) {
        this.showFeedback(message, "error");
    }

    showFeedback(message, type) {
        // Use existing feedback element
        let feedback = document.getElementById('category-feedback');
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
        await this.loadCategories();
    }
}

// Debug functions - call from browser console
window.debugCategoryAPI = function() {
    if (window.categoryManager) {
        return window.categoryManager.testApiConnection();
    }
};

window.debugCategorySession = function() {
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
    
    if (window.categoryManager) {
        console.log('Category Manager API Key:', window.categoryManager.apikey);
    }
};

// Initialize when page loads
window.onload = function() {
    console.log("Manage Categories page loaded");
    window.categoryManager = new CategoryManager();
};

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Press F5 or Ctrl+R to refresh categories
    if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        if (window.categoryManager) {
            window.categoryManager.refresh();
        }
    }
    
    // Press Escape to close modal
    if (event.key === 'Escape') {
        if (window.categoryManager) {
            window.categoryManager.closeModal();
        }
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryManager;
}