<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Delete User</title>
    <link rel="stylesheet" href="css/delete-user.css">
</head>
<body>
    <?php include 'header.php'; ?>
    
    <div class="delete-user-wrapper">
        <h1>Manage & Delete Users</h1>

        <div class="search-section">
            <label for="searchInput">Search Users:</label>
            <input type="text" id="searchInput" placeholder="Search by email">
        </div>

        <table class="user-table">
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                <!-- Will be dynamically loaded from the database later -->
                <tr>
                    <td>1</td>
                    <td>Ayesha Patel</td>
                    <td>ayeshap</td>
                    <td>ayesha@example.com</td>
                    <td>Customer</td>
                    <td><button class="delete-btn">Delete</button></td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>John Dlamini</td>
                    <td>johnd</td>
                    <td>john.d@example.com</td>
                    <td>Customer</td>
                    <td><button class="delete-btn">Delete</button></td>
                </tr>
                <tr>
                    <td>3</td>
                    <td>Leah Mokoena</td>
                    <td>leahm</td>
                    <td>leah.m@example.com</td>
                    <td>Admin</td>
                    <td><button class="delete-btn">Delete</button></td>
                </tr>
            </tbody>
        </table>

        <div id="delete-feedback" class="feedback"></div>
    </div>

</body>
</html>
