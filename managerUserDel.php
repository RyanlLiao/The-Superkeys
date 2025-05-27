<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Users</title>
    <link rel="stylesheet" href="css/delete-user.css">
</head>

<body>
    <?php include 'header.php'; ?>

    <main class="manage-users-wrapper">
        <h1>Manage & Delete Users</h1>

        <div class="action-buttons">
            <button class="btn btn-secondary" id="refreshBtn">Refresh Users</button>
        </div>

        <div class="user-count" id="userCount">Loading...</div>

        <div class="search-section">
            <label for="searchInput">Search Users:</label>
            <input type="text" id="searchInput" placeholder="Search by name, username, or email">
        </div>

        <table class="user-table">
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Name & Phone</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="5" class="loading">Loading users...</td>
                </tr>
            </tbody>
        </table>

        <div id="delete-feedback" class="feedback"></div>
    </main>

    <script src="js/user-management.js"></script>
</body>
</html>