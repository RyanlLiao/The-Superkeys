
<?php
session_start();
$userName = $_SESSION['user_name'] ?? 'Valued Customer';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Customer Dashboard</title>
    <link rel="stylesheet" href="css/customerDashboard.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/graphManager.js" defer></script>
</head>
<body>
    <?php include 'header.php'; ?>

    <div class="dashboard-container">

        <div class="cards-row">
            <div class="card">
                <h2><a href="wishlist.php" class="card-title-link">Wishlist</a></h2>
            </div>

            <div class="card">
                <h2><a href="topRated.php" class="card-title-link">Top Rated Products</a></h2>
            </div>
        </div>

        <div class="card full-width" id="chart-container">
            <canvas id="myChart"></canvas>
        </div>

    </div>
</body>
</html>