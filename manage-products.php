<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Products</title>
    <link rel="stylesheet" href="css/delete-user.css">
    
</head>
<header>
    <?php include 'header.php'; ?>
</header>

<body>
    

    <main class="manage-products-wrapper">
        <h1>Manage & Delete Products</h1>

        <div class="action-buttons">
            <button class="btn" onclick="showAddProductForm()">Add New Product</button>
            <button class="btn btn-secondary" id="refreshBtn">Refresh Products</button>
        </div>

        <div class="product-count" id="productCount">Loading...</div>

        <div class="search-section">
            <label for="searchInput">Search Products:</label>
            <input type="text" id="searchInput" placeholder="Search by name, category, ID, or description">
        </div>

        <table class="user-table">
            <thead>
                <tr>
                    <th>Product ID</th>
                    <th>Name & Description</th>
                    <th>Category</th>
                    <th>Availability</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="6" class="loading">Loading products...</td>
                </tr>
            </tbody>
        </table>

        <div id="delete-feedback" class="feedback"></div>
    </main>

    <div id="addProductModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Add New Product</h2>
                <span class="close" onclick="hideAddProductForm()">&times;</span>
            </div>

            <form id="addProductForm">
                <div class="form-group">
                    <label for="product_name">Product Name *</label>
                    <input type="text" id="product_name" name="product_name" required>
                </div>

                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" name="description" placeholder="Product description..."></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="category">Category *</label>
                        <select id="category" name="category" required onchange="toggleCategoryFields()">
                            <option value="">Select Category</option>
                            <option value="Audio_Visual_Equipment">Audio Visual Equipment</option>
                            <option value="Electronic_Accessories">Electronic Accessories</option>
                            <option value="Computing_Devices">Computing Devices</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="availability">Availability *</label>
                        <select id="availability" name="availability" required>
                            <option value="true">In Stock</option>
                            <option value="false">Out of Stock</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="price">Price (R) *</label>
                        <input type="number" id="price" name="price" step="0.01" min="0" required>
                    </div>

                    <div class="form-group">
                        <label for="retailer_id">Retailer ID *</label>
                        <input type="number" id="retailer_id" name="retailer_id" min="1" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="images">Image URL</label>
                    <input type="url" id="images" name="images" placeholder="https://example.com/image.jpg">
                </div>

                <div class="form-group">
                    <label for="url">Product URL</label>
                    <input type="url" id="url" name="url" placeholder="https://example.com/product">
                </div>

                <div id="audioVisualFields" class="category-fields" style="display: none;">
                    <h3>Audio Visual Specifications</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="kHz">Frequency (kHz)</label>
                            <input type="number" id="kHz" name="kHz" step="0.1">
                        </div>
                        <div class="form-group">
                            <label for="resolution">Resolution</label>
                            <input type="text" id="resolution" name="resolution" placeholder="e.g., 1920x1080">
                        </div>
                    </div>
                </div>

                <div id="accessoryFields" class="category-fields" style="display: none;">
                    <h3>Accessory Specifications</h3>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="accessory_type">Accessory Type</label>
                            <input type="text" id="accessory_type" name="accessory_type" placeholder="e.g., Cable, Adapter">
                        </div>
                        <div class="form-group">
                            <label for="compatibility">Compatibility</label>
                            <input type="text" id="compatibility" name="compatibility" placeholder="e.g., USB-C, Lightning">
                        </div>
                    </div>
                </div>

                <div id="computingFields" class="category-fields" style="display: none;">
                    <h3>Computing Specifications</h3>
                    <div class="form-group">
                        <label for="cpu">CPU</label>
                        <input type="text" id="cpu" name="cpu" placeholder="e.g., Intel Core i7">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="operating_system">Operating System</label>
                            <input type="text" id="operating_system" name="operating_system" placeholder="e.g., Windows 11">
                        </div>
                        <div class="form-group">
                            <label for="storage">Storage (GB)</label>
                            <input type="number" id="storage" name="storage" min="1" placeholder="e.g., 512">
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-top: 30px;">
                    <button type="submit" class="btn" style="width: 100%;">Add Product</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/manageproduct.js"></script>
    
    <script>
        function toggleCategoryFields() {
            const category = document.getElementById('category').value;
            const audioFields = document.getElementById('audioVisualFields');
            const accessoryFields = document.getElementById('accessoryFields');
            const computingFields = document.getElementById('computingFields');

            audioFields.style.display = 'none';
            accessoryFields.style.display = 'none';
            computingFields.style.display = 'none';

            if (category === 'Audio_Visual_Equipment') {
                audioFields.style.display = 'block';
            } else if (category === 'Electronic_Accessoried') {
                accessoryFields.style.display = 'block';
            } else if (category === 'Computing_Devices') {
                computingFields.style.display = 'block';
            }
        }

        window.onclick = function(event) {
            const modal = document.getElementById('addProductModal');
            if (event.target === modal) {
                hideAddProductForm();
            }
        }

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                hideAddProductForm();
            }
        });
    </script>
</body>
</html>