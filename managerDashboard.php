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
    <script src="js/loadCounts.js"></script>
</head>
<body>

<?php include 'header.php'; ?>

<div class="dashboard-container">
    <div class="card full-width">
        <h2>Manager Actions</h2>
        <div class="shortcut-buttons">
            <a href="manageCategories.php" class="btn">Manage Categories</a>
            <a href="manage-products.php" class="btn">Manage Products</a>
            <a href="managerUserDel.php" class="btn">Manage Users</a>
        </div>
    </div>

    <div class="dashboard-content">
        <div class="card">
            <h2>Top Rated Products</h2>
            <ul>
                <h4><a href="topRated.php" class="card-title-link">Click here</a></h4>
            </ul>
    </div>

    <div class="card">
        <h2>System Stats</h2>
        <ul>
            <!-- <li>Total Products: 150</li>
            <li>Total Users: 80</li>
            <li>Total Reviews: 420</li> -->
                <li>Total Products: <span id="count-products">Loading...</span></li>
                <li>Total Users: <span id="count-users">Loading...</span></li>
                <li>Total Reviews: <span id="count-reviews">Loading...</span></li>
        </ul>
    </div>
</div>

    <div class="card full-width" id="chart-container">
        <canvas id="myChart"></canvas>
    </div>

</body>
</html>