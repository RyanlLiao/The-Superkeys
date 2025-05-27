<link rel="stylesheet" href="css/header.css">
<link rel="stylesheet" href="css/products.css">

 <header class="headerrr">
                <div class="header-container">
                    <img src="img/logo.png" alt="Logo" class="pLogo">
                    <nav class="navBar">
                        <ul>
                            <li id="signup-link"><a href="signup.php"><img src="img/SignUp.png" alt="Order"
                                        class="icon"> <br> Sign Up</a></li>
                            <li id="logout-link" style="display: none;"> <a href="products.php"><img src="img/Login.png" alt="Login" class="icon"> <br> Logout</a></li>
                            
                            <li id="login-link"><a href="login.php"><img src="img/Login.png" alt="Login" class="icon">
                                    <br> Login</a></li>
                            <li id="products-link"><a href="products.php"><img src="img/produucts.png" alt="Order"
                                        class="icon"> <br>Products</a></li>
                            <li id="wishlist-link"><a href="wishlist.php"><img src="img/wishlist.png" alt="Order"
                                        class="icon"> <br> Wishlist</a></li>
                            <li id="dashboard-link" style="display: none;"><a href="managerDashboard.php"><img src="img/dashboard.png" alt="Order"
                                        class="icon"> <br>Dashboard</a></li>    
                            <!-- Dashboard is a logged in feature? -->
                            <li id="theme toggle"><a href=""><img src="img/light_mode.png" alt="Order"
                                        class="icon"> <br>Themes</a></li>
                            <!-- On click for theme!!!! -->
                        </ul>
                    </nav>
                </div>
    </header>

    <script>
    document.addEventListener("DOMContentLoaded", function () {
    const isLoggedIn = localStorage.getItem("api_key") !== null;
    const userType = localStorage.getItem("user_type");
    
    const loginLink = document.getElementById("login-link");
    const signupLink = document.getElementById("signup-link");
    const logoutLink = document.getElementById("logout-link");
    const dashboardLink = document.getElementById("dashboard-link");

    if (isLoggedIn) {
        loginLink.style.display = "none";
        signupLink.style.display = "none";
        logoutLink.style.display = "block";

       
        dashboardLink.style.display = "block";

        logoutLink.addEventListener("click", function () {
            localStorage.clear();
            window.location.href = "products.php";
        });
    } else {
        loginLink.style.display = "block";
        signupLink.style.display = "block";
        logoutLink.style.display = "none";
        dashboardLink.style.display = "none";
    }
});
</script>


<!-- <hr> -->

