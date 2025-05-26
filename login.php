<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/products.css">
    <script src="js/login.js"></script>
</head>
<body>

    <?php include 'header.php'; ?>

    <div class="form-container">
        <h1>Login</h1>

        <form id="loginForm">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required><br>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required><br>

            <button type="submit" id="submitBtn">Login</button>
        </form>

        <div id="error-message" style="display: none;"></div>

        <p>Don't have an account? <a href="signup.php">Sign up here</a></p>
    </div>

    
</body>


</html>