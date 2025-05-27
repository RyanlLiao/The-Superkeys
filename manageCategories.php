<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Categories</title>
    <link rel="stylesheet" href="css/manageCategories.css">
</head>

<body>
    <?php include 'header.php'; ?>

    <main class="manage-categories-wrapper">
        <h1>Manage Product Categories</h1>

        <div class="action-buttons">
            <button class="btn" id="addCategoryBtn">Add Category</button>
            <button class="btn btn-secondary" id="refreshBtn">Refresh Categories</button>
        </div>

        <div class="category-count" id="categoryCount">Loading...</div>

        <div class="search-section">
            <label for="searchInput">Search Categories:</label>
            <input type="text" id="searchInput" placeholder="Search by category name">
        </div>

        <table class="category-table">
            <thead>
                <tr>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="4" class="loading">Loading categories...</td>
                </tr>
            </tbody>
        </table>

        <div id="category-feedback" class="feedback"></div>
    </main>

    <div id="categoryModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title" id="modalTitle">Add Category</h2>
                <span class="close">&times;</span>
            </div>
            
            <form id="categoryForm">
                <div class="form-group">
                    <label for="categoryName">Category Name:</label>
                    <input type="text" id="categoryName" required>
                </div>

                <div class="form-group">
                    <label>Category Fields:</label>
                    <div id="fieldsContainer"></div>
                    <button type="button" id="addFieldBtn" class="btn btn-secondary">Add Field</button>
                </div>

                <div class="modal-actions">
                    <button type="button" id="saveCategoryBtn" class="btn">Save Category</button>
                </div>
            </form>
        </div>
    </div>

    <script src="js/manageCategories.js"></script>
</body>
</html>