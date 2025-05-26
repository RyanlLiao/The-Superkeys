var a_key = 'f61891d740ceb2539535bd06a1c7936f';

function displayProducts(data) {
    console.log("Displaying products")
    var container = document.querySelector(".product-grid");
    if (!container) {
        console.error("Product grid container not found");
        return;
    }

    container.innerHTML = "";

    console.log(data);

    for (var i = 0; i < data.length; i++) {
        var product = data[i];

         var images = JSON.parse(product.images);
         var mainImage = images.length > 0 ? images[0] : "img/placeholder.jpg";

        var card = ''
            + '<div class="product">'
            + '<a href="view.php?id=' +  product.product_id + '"><img src="' + mainImage + '"alt="' + product.product_name + '" class="productImg"></a>'
            + '<a href="view.phpid=' + product.product_id + '"><h2>' + product.product_name + '</h2> </a>'
            + '<h3>R' + product.price + '</h3>'
            + '<a href="view.php?id=' + product.product_id + '"> <p>Tap for more</p> </a>'
            + '<a href="wishlist.php"><button class = "add">Add to Wishlist</button></a>'
            + '</div>';
        //edit add to wishlist functionality
        container.innerHTML += card;
    }

}

function fetchProducts() {

    var searchInput = document.querySelector(".search-box input[name='q']").value.toLowerCase();
    var categoryFilter = document.querySelector("select[name='category']").value;
    var typeFilter = document.querySelector("select[name='type']").value;
    var brandFilter = document.querySelector("select[name='brand']").value;
    var priceFilter = document.querySelector("select[name='filter-by-price']").value;
    var sortByPrice = document.querySelector("select[name='sort-by-price']").value;

    // var sortField = "title";
    // var sortOrder = "ASC";

    // if (sortPrice === "Low to High") {
    //     sortField = "final_price";
    //     sortOrder = "ASC";
    // } else if (sortOption === "High to Low") {
    //     sortField = "final_price";
    //     sortOrder = "DESC";
    // }

    // AMAAIIIIII!!!!????

    var requestBody = {
        type: "Products",
        apikey: a_key,
        return: "*"
    };

    if (searchInput) {
        requestBody.search = {
            title: searchInput,
            brand: searchInput
        };
    }



    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/CompareIt/The-Superkeys/api.php", true);

    xhr.onreadystatechange = function () {

        console.log("Current state:", xhr.readyState, "Current status:", xhr.status);

        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("condition accepted");
            console.log("Raw response: ", xhr.responseText);


            var response = JSON.parse(xhr.responseText);
            console.log(response);
            if (response.status == 'success') {
                var data = response.data;

                //FILTER LOGIC

                console.log("condition accepted");
                products = data;

                console.log("Products fetched, calling DISPLAY");

                displayProducts(products);

            } else {
                console.log("API returned error:", response.message);
            }
        } else {
            console.log("Failed to fetch products. Status:", xhr.status, xhr.readyState);
        }

    };

    xhr.send(JSON.stringify(requestBody));
}

window.onload = function () {
    console.log("Page loaded. Fetching products...");
    fetchProducts();


    // document.getElementById("search-input").addEventListener("keyup", function (event) {
    //     if (event.keyCode === 13) fetchProducts();
    // });
    // document.getElementById("brand-filter").addEventListener("change", fetchProducts);
    // document.getElementById("price-filter").addEventListener("change", fetchProducts);
    // document.getElementById("sortBtn").addEventListener("change", fetchProducts);
    // document.getElementById("country-filter").addEventListener("change", fetchProducts);

};
