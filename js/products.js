var a_key = '1a8eeccd5b43834a18870560a229cc4a6862ef492e808536a65055ca46eaba4f';

//console.log(data); var a_key = '1a8eeccd5b43834a18870560a229cc4a6862ef492e808536a65055ca46eaba4f';

function displayProducts(data) {
    // console.log("Displaying products")
    var container = document.querySelector(".product-grid");
    if (!container) {
        console.error("Product grid container not found");
        return;
    }

    container.innerHTML = "";

    container.innerHTML += "<div class='not-found' style='display:none;'>Product not found</div>";

    // console.log(data);

    for (var i = 0; i < data.length; i++) {
        var product = data[i];
        
        
        var images = JSON.parse(product.images);
        console.log(typeof images);

        if(typeof images == "string")
            images = [images];

        var mainImage = images.length > 0 ? images[0] : "img/placeholder.jpg";

        var category = JSON.parse(product.Category);

        var card = ''
            + '<div class="product" '
            + 'data-brand="' + product.retailer_name + '" data-category="' + category[0] + '" data-type="' + category[1] + '" data-id="' + product.product_id + '">'
            + '<a href="view.php?id=' + product.product_id + '"><img src="' + mainImage + '"alt="' + product.product_name + '" class="productImg"></a>'
            + '<a href="view.php?id=' + product.product_id + '"><h2 id="product_name">' + product.product_name + '</h2> </a>'
            + '<h3 id="product_price">R' + product.price + '</h3>'
            + '<a href="view.php?id=' + product.product_id + '"> <p>Tap for more</p> </a>'
            + '<button class="add" ">Add to Wishlist</button>'
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
            // callback(response.data);
        }
        else
            console.error("Error: ", types.responseText);
    }

    types.send(body);
}

function getRetailers(callback) {
    var ret = new XMLHttpRequest();
    ret.open("POST", "/CompareIt/The-Superkeys/api.php", true);
    ret.setRequestHeader("Content-type", "application/json");

    var body = JSON.stringify({
        "type": "GetDistinct",
        "apikey": a_key,
        'distinct': 'retailer'
    });

    ret.onload = function () {
        if (ret.readyState === 4 && ret.status === 200) {
            var response = JSON.parse(ret.responseText);
            callback(response.data);
        }
        else
            console.error("Error: ", ret.responseText);
    }

    ret.send(body);
}

function fetchProducts(callback) {

    var requestBody = {
        type: "GetAllProducts",
        apikey: a_key,
        return: "*"
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/CompareIt/The-Superkeys/api.php", true);  //CompareIt/The-Superkeys

    xhr.onreadystatechange = function () {

        //console.log("Current state:", xhr.readyState, "Current status:", xhr.status);

        if (xhr.readyState == 4 && xhr.status == 200) {
            // console.log("condition accepted");
            //console.log("Raw response: ", xhr.responseText);


            var response = JSON.parse(xhr.responseText);
            // console.log(response);
            if (response.status == 'success') {
                var data = response.data;

                // console.log("condition accepted");
                // products = data;

                // console.log("Products fetched, calling DISPLAY");

                displayProducts(data);
                callback();

            } else {
                console.log("API returned error:", response.message);
            }
        } else {
            // console.log("Failed to fetch products. Status:", xhr.status, xhr.readyState);
            //console.log("response", xhr.responseText);
        }

    };

    xhr.send(JSON.stringify(requestBody));
}

function addWishlist(button) {
    var apiKey = localStorage.getItem("api_key");
    if (apiKey == null) {
        alert("Please log in.");
        window.location.href = "login.php";
    }

    //var button = event.currentTarget;
    var pid = button.closest(".product").getAttribute("data-id");

    var wish = new XMLHttpRequest();
    wish.open("POST", "/CompareIt/The-Superkeys/api.php", true);
    wish.setRequestHeader("Content-type", "application/json");

    var body = JSON.stringify({
        "type": "AddWishlist",
        "apikey": localStorage.getItem("api_key"),
        "pid": pid
    });
    //need to redirect is they aren't logged in
    wish.onload = () => {
        console.log(wish.responseText);

        var response = JSON.parse(wish.responseText);

        if (wish.readyState == 4 && wish.status == 200) {

            try {

                if (response.status === "success") {
                    alert(response.data);
                } else {
                    alert(response.message);
                }
            } catch (e) {
                console.error("Invalid JSON response", e);
                alert("An unexpected error occurred.");
            }

        }
        else {
            // alert(response.data);
            console.log(response.message);
            if (response.message == "Product already in wishlist") {
                alert("Product already in wishlist :)");
                return;
            }
            alert("Request failed. Please try again.");
            console.log(wish.responseText);
        }
    }

    wish.send(body);

}

window.onload = function () {
    // console.log("Page loaded. Fetching products...");
    fetchProducts(() => {
        var button = document.querySelectorAll(".add");
        button.forEach((item) => {
            // console.log(item);

            item.addEventListener("click", () => {
                // console.log("HERE");
                addWishlist(item);

            });
        });
    });

    //Retailer filter
    getRetailers(function (names) {

        names = names.map(retailer => retailer.name);

        // console.log(names);
        var brandFilter = document.querySelector("[name='brand']");

        names.sort((a, b) => a.localeCompare(b));
        // console.log(names);

        for (var i = 0; i < names.length; i++) {
            //    console.log(names[i]);
            var option = document.createElement("option");
            option.value = names[i];
            option.innerText = names[i];

            brandFilter.appendChild(option);
        }
    });

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
    //console.log("not found");
    var none = document.querySelector(".not-found");

    if (!none) {
        var container = document.querySelector(".product-grid");
        container.innerHTML += "<div class='not-found' style='display:none;'>Product not found</div>";
        none = document.querySelector(".not-found");
    }

    if (!found) {
        none.style.removeProperty("display");
    }
    else {
        none.style.display = 'none';
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
    var max = parseInt(range.substring(range.indexOf('-') + 1));
    var product = document.querySelectorAll(".product");
    var found = false;

    // console.log("min: " + min + "\nmax: " + max);

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
    // console.log(brand);
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
        // console.log(typeList);
        typeList.forEach(type => {
            type.Category = JSON.parse(type.Category);
            // console.log(type.Category[1]);
            types.push(type.Category[1]);
        });

        // console.log(types);
        var typeFilter = document.querySelector("[name='type']");
        typeFilter.innerHTML = "";

        var default_option = document.createElement("option");
        default_option.value = "";
        default_option.innerText = "All Types";
        typeFilter.appendChild(default_option);

        for (var i = 0; i < types.length; i++) {
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

    notfound(true);
}

///SORTING

function priceSort(sort) {
    //console.log("sorting...");
    var product = document.querySelectorAll(".product");
    var array = Array.from(product);

    array.sort(function (a, b) {
        var priceA = parseFloat((a.querySelector("#product_price").innerText).substring(1));
        var priceB = parseFloat((b.querySelector("#product_price").innerText).substring(1));

        if (sort == "ASC")
            return priceA - priceB;
        else if (sort == "DESC")
            return priceB - priceA;
    });

    var container = document.querySelector(".product-grid");
    container.innerHTML = "";

    array.forEach(item => {
        container.appendChild(item);
    });
}
