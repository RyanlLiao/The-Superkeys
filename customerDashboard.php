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
</head>
<body>
    <?php include 'header.php'; ?>
    <div class="dashboard-container">
        <div class="card welcome-card">
            <h2>Welcome back, <?php echo htmlspecialchars($userName); ?>!</h2>
            <p>We're glad to see you again.</p>
        </div>

        <div class="dashboard-content">
            <div class="card stat-card">
                <h3>Price History</h3>
                <p>Click here to view</p>
            </div>
        </div>

        <div class="card stat-card">
                <h3>Top Rated Products</h3>
                <p>Click here to view</p>
            </div>

       

        <!-- Wishlist -->
        <div class="card">
            <h2>Your Wishlist</h2>
            <ul class="wishlist">
                <li>Product A <button>Add to Cart</button></li>
                <li>Product B <button>Add to Cart</button></li>
            </ul>
        </div>

        <!-- Recommended Products -->
        <!-- <div class="card">
            <h2>Recommended for You</h2>
            <div class="recommended-products">
                <div class="product-card">
                    <img src="product1.jpg" alt="Product 1">
                    <p>Product 1</p>
                    <button>View</button>
                </div>
                <div class="product-card">
                    <img src="product2.jpg" alt="Product 2">
                    <p>Product 2</p>
                    <button>View</button>
                </div>
            </div>
        </div> -->

      
    </div>
</body>
</html>