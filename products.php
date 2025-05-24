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

            <select name="filter-by-price">
                <option value="">Range</option>
                <option value="100-200">100-200</option>
                <option value="200-300">200-300</option>
                <option value="300-400">300-400</option>
            </select>

            <!-- WHAT PRICE ARE THESE BASED OFF OF ... minimum price -->

            <select name="sort-by-price">
                <option value="">Sort By</option>
                <option value="ASC">Low to High</option>
                <option value="DESC">High to Low</option>
            </select>
    </div>
</div>
    
<div class ="product-container">
    <div class = "product-grid" ></div>
</div> 
<script src = "js\products.js"></script>
</body>


</html>