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

        var category = JSON.parse(product.Category);

        var card = ''
            + '<div class="product" '
            + 'data-brand="' + product.retailer_id + '" data-category="' + category[0] + '" data-type="' + category[1] + '">'
            + '<a href="view.php?id=' + product.product_id + '"><img src="' + mainImage + '"alt="' + product.product_name + '" class="productImg"></a>'
            + '<a href="view.phpid=' + product.product_id + '"><h2 id="product_name">' + product.product_name + '</h2> </a>'
            + '<h3 id="product_price">From: R' + product.price + '</h3>'
            + '<a href="view.php?id=' + product.product_id + '"> <p>Tap for more</p> </a>'
            + '<a href="wishlist.php"><button class = "add">Add to Wishlist</button></a>'
            + '</div>';
        //edit add to wishlist functionality
        container.innerHTML += card;
    }

}

function getTypes(category, callback) {
    var types = new XMLHttpRequest();
    types.open("POST", "/CompareIt/The-Superkeys/api.php", true);
    types.setRequestHeader("Content-type", "application/json");

    var body = JSON.stringify({
        "type": "GetDistinct",
        "apikey": a_key,
        "category": category
    });

    types.onload = function () {
        if (types.readyState === 4 && types.status === 200) {
            var response = JSON.parse(types.responseText);
            callback(response);
        }
        else
            console.error("Error: ", types.responseText);
    }

    types.send(body);
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
        type: "GetAllProducts",
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
    xhr.open("POST", "/CompareIt/The-Superkeys/api.php", true);  //CompareIt/The-Superkeys

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
            //console.log("response", xhr.responseText);
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

function search() {
    //console.log("Searching...");
    var input = document.querySelector(".search_input").value;
    var searchString = input.toLowerCase();

    var products = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < products.length; i++) {
        var compare = products[i].querySelector("#product_name").innerText.toLowerCase();

        if (!compare.includes(searchString))
            products[i].style.display = "none";
        else {
            products[i].style.removeProperty("display");
            found = true;
        }
    }

    notfound(found);
}

function notfound(found) {
    var none = document.querySelector(".not-found");


    if (none) {
        if (!found) {
            none.style.removeProperty("display");
        }
        else {
            none.style.display = 'none';
        }
    }

}


// function applyFilter() {
//     var price = document.querySelector("[name='filter-by-price']").value;
//     var brand = document.querySelector("[name='brand']").value;
//     var category = document.querySelector("[name='category']").value;
//     var type = document.querySelector("[name='type']").value;

//     if (price !== "")
//         priceFilter(price);

//     if (brand !== "")
//         brandFilter(brand);

//     if (category !== "")
//         categoryFilter(category);

//     if (type !== "")
//         typeFilter(type);
// }

function priceFilter(range) {
    var min = parseInt(range.substring(0, range.indexOf('-')));
    var max = parseInt(range.substring(range.indexOf('-')));
    var product = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < product.length; i++) {
        var price = parseFloat((product[i].querySelector("#product_price").innerText).substring(1));

        if (min <= price && price <= max) {
            product[i].style.removeProperty("display");
            found = true;
        }
        else
            product[i].style.display = "none";
    }

    notfound(found);
}

function brandFilter(brand) {
    var product = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < product.length; i++) {
        var productBrand = product[i].getAttribute("data-brand");

        if (brand.toLowerCase() == productBrand.toLowerCase()) {
            product[i].style.removeProperty("display");
            found = true;
        }
        else
            product[i].style.display = "none";
    }

    notfound(found);
}

function categoryFilter(category) {
    console.log("Filtering by category...");
    console.log(category);
    var product = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < product.length; i++) {
        var productCat = product[i].getAttribute("data-category");

        if (category.toLowerCase() == productCat.toLowerCase()) {
            product[i].style.removeProperty("display");
            found = true;
        }
        else
            product[i].style.display = "none";
    }

    notfound(found);
}

function typeFilter(type) {
    var product = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < product.length; i++) {
        var productType = product[i].getAttribute("data-type");

        if (type.toLowerCase() == productType.toLowerCase()) {
            product[i].style.removeProperty("display");
            found = true;
        }
        else
            product[i].style.display = "none";
    }

    notfound(found);
}

