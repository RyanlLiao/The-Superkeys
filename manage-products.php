<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manage Products</title>
    <link rel="stylesheet" href="css/delete-user.css"> 
</head>
<body>
    
    <?php include 'header.php'; ?>
    
    <div class="delete-user-wrapper">
        <h1>Manage & Delete Products</h1>

        <div class="search-section">
            <label for="searchInput">Search Products:</label>
            <input type="text" id="searchInput" placeholder="Search by name, category, or ID">
        </div>

        <table class="user-table">
            <thead>
                <tr>
                    <th>Product ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                <!--will change soon soon -->
                <tr>
                    <td>101</td>
                    <td>Wireless Headphones</td>
                    <td>Electronics</td>
                    <td>Sony</td>
                    <td>R1999.99</td>
                    <td><button class="delete-btn">Delete</button></td>
                </tr>
                <tr>
                    <td>102</td>
                    <td>Organic Green Tea</td>
                    <td>Grocery</td>
                    <td>Nature's Best</td>
                    <td>R49.95</td>
                    <td><button class="delete-btn">Delete</button></td>
                </tr>
                <tr>
                    <td>103</td>
                    <td>Gaming Mouse</td>
                    <td>Electronics</td>
                    <td>Logitech</td>
                    <td>R699.00</td>
                    <td><button class="delete-btn">Delete</button></td>
                </tr>
            </tbody>
        </table>

        <div id="delete-feedback" class="feedback"></div>
    </div>

</body>
</html>
