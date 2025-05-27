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
                <option value="Computing_Devices">Computing Devices</option>
                <option value="Audio_Visual_Equipment">Audio-Visual</option>
                <option value="Electronic_Accessories">Accessories</option>
            </select>

            <select name="type"  onchange="typeFilter(value)">
                <option value="">All Types</option>
                <option value="Headphones">Headphones</option>
                <option value="Watch">Watch</option>
                <option value="Laptops">Laptops</option>
            </select>

            <select name="brand" onchange="brandFilter(value)">
                <option value="">All Retailers</option>
            </select>

            <select name="filter-by-price"  onchange="priceFilter(value)">
                <option value="">Price Range (R)</option>
                <option value="0-2500">0-2500</option>
                <option value="2500-5000">2500-5000</option>
                <option value="5000-10000">5000-10000</option>
                <option value="10000-20000">10000-20000</option>
                <option value="20000-30000">20000-30000</option>
                <option value="30000-40000">30000-40000</option>
                <option value="40000-50000">40000-50000</option>
                <option value="50000-60000">50000-60000</option>
            </select>

            

            <select name="sort-by-price"  onchange = "priceSort(value)">
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