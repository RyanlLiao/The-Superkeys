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
            <input type="text" name="q" placeholder="Search products..." class="search_input" onkeyup = " search()">
            <button  type="button" onclick="search()" ><img src="img/search.png"/>Search </button>
            <!-- On click to trigger search... -->
        </form>
    </div>

    <div class="filters">
            <select name="category" onchange="categoryFilter(value)">
                <option value="">All Categories</option>
                <option value="computing">Computing Devices</option>
                <option value="audio">Audio-Visual</option>
                <option value="accessories">Accessories</option>
            </select>

            <select name="type"  onchange="typeFilter(value)">
                <option value="">All Types</option>
                <option value="Headphones">Headphones</option>
                <option value="Watch">Watch</option>
                <option value="Laptops">Laptops</option>
            </select>

            <select name="brand" onchange="brandFilter(value)">
                <option value="">All Brands</option>
                <option value="samsung">Samsung</option>
                <option value="apple">Apple</option>
                <option value="sony">Sony</option>
            </select>

            <select name="filter-by-price"  onchange="priceFilter(value)">
                <option value="">Range</option>
                <option value="100-200">0-5000</option>
                <option value="200-300">5000-10000</option>
                <option value="300-400">10000-20000</option>
                <option value="300-400">20000-20000</option>
            </select>

            

            <select name="sort-by-price">
                <option value="">Sort By</option>
                <option value="ASC">Low to High</option>
                <option value="DESC">High to Low</option>
            </select>
    </div>
</div>
    
<div class ="product-container">
    <div class = "product-grid" ><div class = "not-found" style="display: none;" >Product not found</div></div>
</div> 
<script src = "js\products.js"></script>
</body>


</html>