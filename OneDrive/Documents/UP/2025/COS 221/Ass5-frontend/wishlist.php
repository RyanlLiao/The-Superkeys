<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Wishlist</title>
    <link rel="stylesheet" href="css/wishlist.css">
    <!--will edit css in future-->
   
</head>
<body>

<?php include 'header.php'; ?>


    <div class="wishlist-wrapper">
        <h1>Your Wishlist</h1>
        <div class="wishlist-grid">
           
            <div class="wishlist-item">
                <img src="img" alt="Product 1">
                <div class="wishlist-details">
                    <p class="wishlist-title">Product Name 1</p>
                    <p class="wishlist-price">R</p>
                    <button class="remove-btn">Remove</button>
                </div>
            </div>
            
           
            <div class="wishlist-item">
                <img src="img" alt="Product 2">
                <div class="wishlist-details">
                    <p class="wishlist-title">Product Name 2</p>
                    <p class="wishlist-price">R2</p>
                    <button class="remove-btn">Remove</button>
                </div>
            </div>

             <!-- will need to dynamically add products, this is just an outline so far-->
          
        </div>
    </div>

</body>
</html>
