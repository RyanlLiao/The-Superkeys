<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Wishlist</title>
    <link rel="stylesheet" href="css/wishlist.css">
    
</head>
<body>
    <?php include 'header.php'; ?>
    
    <div class="wishlist-wrapper">
        <h1>Your Wishlist</h1>
        
        
        <div class="wishlist-grid">
            <div class="loading">Loading your wishlist...</div>
        </div>
        
        <div class="refresh-container">
            <button onclick="window.wishlistManager?.refresh()" class="refresh-btn">
                Refresh Wishlist
            </button>
        </div>
    </div>
    <script src="js/wishlist.js"></script>
    
   
    <script>
        function redirectToLogin() 
        {
            alert('Please log in to manage your wishlist.');
            window.location.href = 'login.php';
        }
        async function addToWishlist(productId) 
        {
            if (!window.wishlistManager) {
                console.error('Wishlist manager not initialized');
                return;
            }

            const apikey = localStorage.getItem('apikey') || sessionStorage.getItem('apikey');
            if (!apikey) {
                redirectToLogin();
                return;
            }

            try {
                const response = await fetch('api.php', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'AddWishlist',
                        apikey: apikey,
                        pid: productId
                    })
                });

                const result = await response.json();
                
                if (result.status === 'success') {
                    alert('Product added to wishlist!');
                    if (window.wishlistManager) {
                        window.wishlistManager.refresh();
                    }
                } else {
                    alert(result.message || 'Failed to add product to wishlist');
                }
            } catch (error) {
                console.error('Add to wishlist error:', error);
                alert('Failed to add product to wishlist');
            }
        }
        window.addToWishlist = addToWishlist;
    </script>
</body>
</html>