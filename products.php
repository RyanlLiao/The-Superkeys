<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products</title>
    <link rel="stylesheet" href="css/products.css">
</head>

<?php include 'header.php'; ?>
    

<body>

<div class ="search-and-filter">
    <div class="search-container">
        <form class="search-box">
            <input type="text" name="q" placeholder="Search products...">
            <button type="submit"><img src="img/search.png"/>Search </button>
            <!-- On click to trigger search... -->
        </form>
    </div>

    <div class="filters">
            <select name="category">
                <option value="">All Categories</option>
                <option value="computing">Computing Devices</option>
                <option value="audio">Audio-Visual</option>
                <option value="accessories">Accessories</option>
            </select>

            <select name="type">
                <option value="">All Types</option>
                <option value="Headphones">Headphones</option>
                <option value="Watch">Watch</option>
                <option value="Laptops">Laptops</option>
            </select>

            <select name="brand">
                <option value="">All Brands</option>
                <option value="samsung">Samsung</option>
                <option value="apple">Apple</option>
                <option value="sony">Sony</option>
            </select>

            <select name="sort-by-price">
                <option value="">Range</option>
                <option value="100-200">100-200</option>
                <option value="200-300">200-300</option>
                <option value="300-400">300-400</option>
            </select>
    </div>
</div>
    
<div class ="product-ontainer">
    <div class = "product-grid" >

    <div class="product">
        <a href="view.php"><img src="img/accessories.jpg" alt="Product 1" class="productImg"> </a>
        <h2>Product Name</h2>
        <h3>R299.00</h3>
        <a href="view.php"> <p>Tap for more</p> </a>
        <button class = "add">Add to Wishlist</button>
    </div>

    </div>
</div> 



</body>
</html>