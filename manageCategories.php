<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manage Categories</title>
    <link rel="stylesheet" href="css/manageCategories.css">
</head>
<body>
    <?php include 'header.php'; ?>

    <div class="manage-category-wrapper">
        <h1>Manage Product Categories</h1>

        <button class="add-category-btn" onclick="openModal()">+ Add Category</button>

        <table class="category-table">
            <thead>
                <tr>
                    <th>Category ID</th>
                    <th>Name</th>
                    <th>Attributes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <!-- Dummy data for now -->
                <tr>
                    <td>1</td>
                    <td>Electronics</td>
                    <td>Brand, Model, Warranty</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Clothing</td>
                    <td>Size, Color, Material</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="categoryModal">
        <div class="modal">
            <h2>Add New Category</h2>
            <label>Category Name:</label>
            <input type="text" id="categoryName" placeholder="e.g., Shoes">

            <div id="fieldsContainer">
                <h3>Attributes</h3>
            </div>

            <button class="action-btn" onclick="addAttributeRow()">+ Add Attribute</button>

            <div class="btn-group">
                <button class="cancel-btn" onclick="closeModal()">Cancel</button>
                <button class="save-btn" onclick="submitCategory()">Save</button>
            </div>
        </div>
    </div>

    <script>
        function openModal() {
            document.getElementById("categoryModal").style.display = "flex";
        }

        function closeModal() {
            document.getElementById("categoryModal").style.display = "none";
            document.getElementById("categoryName").value = "";
            document.getElementById("fieldsContainer").innerHTML = "<h3>Attributes</h3>";
        }

        function addAttributeRow() {
            const container = document.getElementById("fieldsContainer");

            const row = document.createElement("div");
            row.classList.add("attribute-row");
            row.innerHTML = `
                <input type="text" placeholder="Field Name" class="attr-name" required>
                <select class="attr-type">
                    <option value="VARCHAR(255)">Text</option>
                    <option value="INT">Integer</option>
                    <option value="DECIMAL(10,2)">Decimal</option>
                    <option value="DATE">Date</option>
                </select>
                <button onclick="this.parentElement.remove()" style="margin-left:10px;">🗑️</button>
            `;

            container.appendChild(row);
        }

        function submitCategory() {
            const categoryName = document.getElementById("categoryName").value.trim();
            if (!categoryName) {
                alert("Please enter a category name.");
                return;
            }

            const attributes = [];
            document.querySelectorAll('.attribute-row').forEach(row => {
                const name = row.querySelector('.attr-name').value.trim();
                const type = row.querySelector('.attr-type').value;
                if (name) attributes.push({ name, type });
            });

            if (attributes.length === 0) {
                alert("Please add at least one attribute.");
                return;
            }

            fetch('add_category.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryName, attributes })
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || 'Category added!');
                closeModal();
                // Optional: Reload or update the category list
            })
            .catch(err => {
                console.error(err);
                alert('Error adding category.');
            });
        }
    </script>
</body>
</html>