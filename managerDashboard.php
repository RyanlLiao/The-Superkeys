<?php
// session_start();
// if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'manager') {
//     header("Location: login.php");
//     exit();
// }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manager Dashboard</title>
    <link rel="stylesheet" href="css/dashboard.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/graphManager.js" defer></script>
</head>
<body>

<?php include 'header.php'; ?>

<div class="dashboard-container">
    <div class="card full-width">
        <h2>Manager Actions</h2>
        <div class="shortcut-buttons">
            <a href="manageCategories.php" class="btn">Manage Categories</a>
            <a href="manage-products.php" class="btn">Manage Products</a>
            <a href="manageUserDel.php" class="btn">Manage Users</a>
        </div>
    </div>

<div class="dashboard-content">
    <div class="card">
        <h2>Top Rated Products</h2>
        <ul>
            <li>Product A 4.9</li>
            <li>Product B 4.8</li>
            <li>Product C 4.7</li>
        </ul>
    </div>

    <div class="card">
        <h2>System Stats</h2>
        <ul>
            <li>Total Products: 150</li>
            <li>Total Users: 80</li>
            <li>Total Reviews: 420</li>
        </ul>
    </div>

    <!-- <div class="card">
        <h2>Recent Activity</h2>
        <ul>
            <li>User "jane_doe" added a review</li>
            <li>Admin updated Product A price</li>
            <li>New stockist registered</li>
        </ul>
    </div> -->
    <!-- Implement Later... -->

    <div class="card">
        <h2>Price History</h2>
        <p>Chart or detailed insights can go here.</p>
    </div>

    <div>
        <canvas id="myChart"></canvas>
    </div>
</div>

</body>
</html>