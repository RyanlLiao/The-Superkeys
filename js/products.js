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
            callback(response.data);
        }
        else
            console.error("Error: ", types.responseText);
    }

    types.send(body);
}

function fetchProducts() {

    var requestBody = {
        type: "GetAllProducts",
        apikey: a_key,
        return: "*"
    };

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

var priceHidden = [];
var brandHidden = [];
var categoryHidden = [];
var typeHidden = [];

function priceFilter(range) {
    if (range === "") {
        clearFilter(priceHidden);
        return;
    }

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
        else {
            product[i].style.display = "none";
            priceHidden.push(product[i]);
        }
    }

    notfound(found);
}

function brandFilter(brand) {
    if (brand === "") {
        clearFilter(brandHidden);
        return;
    }

    var product = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < product.length; i++) {
        var productBrand = product[i].getAttribute("data-brand");

        if (brand.toLowerCase() == productBrand.toLowerCase()) {
            product[i].style.removeProperty("display");
            found = true;
        }
        else {
            product[i].style.display = "none";
            brandHidden.push(product[i]);
        }
    }

    notfound(found);
}

function categoryFilter(category) {
    if (category == "") {
        clearFilter(categoryHidden);
        return;
    }

    var product = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < product.length; i++) {
        var productCat = product[i].getAttribute("data-category");

        if (category.toLowerCase() == productCat.toLowerCase()) {
            product[i].style.removeProperty("display");
            found = true;
        }
        else {
            product[i].style.display = "none";
            categoryHidden.push(product[i]);
        }
    }

    //setup types based on the category selected
    getTypes(category, function (typeList) {
        var types = [];

        typeList.forEach(type => {
            type.Category = JSON.parse(type.Category);
            types.push(type.Category[1]);
        });

        // console.log(types);
        var typeFilter = document.querySelector("[name='type']");
        typeFilter.innerHTML = "";

        var default_option = document.createElement("option");
        default_option.value = "";
        default_option.innerText = "All Types";
        typeFilter.appendChild(default_option);

        for (var i = 0; i < typeList.length; i++) {
            var option = document.createElement("option");
            option.value = types[i];
            option.innerText = types[i].replace("_", " ");

            typeFilter.appendChild(option);
        }
    });

    notfound(found);
}

function typeFilter(type) {
    if (type === "") {
        clearFilter(typeHidden);
        return;
    }

    var product = document.querySelectorAll(".product");
    var found = false;

    for (var i = 0; i < product.length; i++) {
        var productType = product[i].getAttribute("data-type");

        if (type.toLowerCase() == productType.toLowerCase()) {
            product[i].style.removeProperty("display");
            found = true;
        }
        else {
            product[i].style.display = "none";
            typeHidden.push(product[i]);
        }
    }

    notfound(found);
}

function clearFilter(products) {
    for (var i = 0; i < products.length; i++) {
        products[i].style.removeProperty("display");
        products.pop(products[i]);
    }
}

///SORTING

function priceSort(sort) {
    //console.log("sorting...");
    var product = document.querySelectorAll(".product");
    var array = Array.from(product);

    array.sort(function(a,b){
        var priceA = parseFloat((a.querySelector("#product_price").innerText).substring(1));
        var priceB = parseFloat((b.querySelector("#product_price").innerText).substring(1));

        if(sort == "ASC")
            return priceA - priceB;
        else if(sort == "DESC")
            return priceB - priceA;
    });

    var container = document.querySelector(".product-grid");
    container.innerHTML = "";

    array.forEach(item => {
        container.appendChild(item);
    });
}

