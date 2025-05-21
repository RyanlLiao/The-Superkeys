<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products</title>
    <link rel="stylesheet" href="css/products.css">
</head>

    <header class="headerrr">
                <div class="header-container">
                    <img src="img/logo.png" alt="Logo" class="pLogo">
                    <nav class="navBar">
                        <ul>
                            <li id="logout-link" style="display: none;"><img src="img/Login.png" alt="Login" class="icon"> <br> Logout</a></li>
                            <!-- on click function for logginhh out! -->
                            <li id="login-link"><a href="login.php"><img src="img/Login.png" alt="Login" class="icon">
                                    <br> Login</a></li>
                            <li id="wishlist-link"><a href="wishlist.php"><img src="img/wishlist.png" alt="Order"
                                        class="icon"> <br> Wishlist</a></li>
                            <li id="signup-link"><a href="signup.php"><img src="img/SignUp.png" alt="Order"
                                        class="icon"> <br> Sign Up</a></li>
                            <li id="theme-link"><img src="img/light_mode.png" alt="Order"
                                        class="icon"> <br>Theme</li>
                            <!-- On click for theme!!!! -->
                        </ul>
                    </nav>
                </div>
    </header>
    

<body>
    <div class = "products-filter">
        <img src="img/mobile_devices.png" alt="Mobile Devices" />
        <img src="img/laptops.webp" alt="Laptops" />
        <img src="img/speakers.webp" alt="Speakers" />
        <img src="img/headphones.webp" alt="Headphones" />
        <img src="img/Data_Storage.webp" alt="Data Storage" />
        <img src="img/monitors.jpg" alt="Monitors" />
        <img src="img/accessories3.jpg" alt="Accessories" />
    </div>

    <!-- ON CLICK FUNCTIONS FOR FILTERING -->

    <div class = "brands-filter">
        <img src="img/amzon.png" alt="Amazon" />
        <img src="img/apple.png" alt="Apple" />
        <img src="img/asus.png" alt="Asus" />
        <img src="img/Dell.png" alt="Dell" />
        <img src="img/hauwei.png" alt="Hauwei" />
        <img src="img/samsung.png" alt="Samsung" />
        <img src="img/takealot.jpg" alt="Takealot" />
    </div>

    <div class="search-container">
        <form class="search-box">
            <input type="text" name="q" placeholder="Search products...">
            <button type="submit"><img src="img/search.png"/>Search </button>
            <!-- On click to trigger search... -->
        </form>
    </div>

    <p>PRODUCTS LOADED FROM API...</p>
    



</body>
</html>