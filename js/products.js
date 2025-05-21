var a_key = 'bee2edb3fb146ef46d8bcdf1ec4cf9f7';
var s_num = 'u24730841';

function displayProducts(data) {
    console.log("Displaying products")
    var container = document.getElementById("product-list");
    // var container = document.getElementById("product-grid");
    if (!container) {
        console.error("Product list container not found");
        return;
    }

    container.innerHTML = "";

    for (var i = 0; i < data.length; i++) {
        var product = data[i];
        var price = (product.final_price);
        console.log(product.brand);
        var card = ''
            + '<div class="product">'
            + ' <a href="view.php?id=' + product.id + '"><img src="' + product.image_url + '"alt="' + product.title + '" class="productImg"></a>'
            + '<p style = "font-size: large; font-family: Monaco; ">' + product.title + ' <br><br> ~Brand: ' + product.brand + '</p>'
            + '<p style = "font-size: large; font-family: Monaco; ">' + currentCurrency + ' ' + price + '</p>'
            + '<div class="product-actions">'
            + '<a href="cart.php"><button class="add-to-cart"><img src="img/cart1.png" class="icon"> Add to Cart</button></a>'
            + '<a href="wishlist.php"><button class="wishlist"><img src="img/heartV.png" class="icon"> Wishlist</button></a>'
            + '</div>'
            + '</div>';
        container.innerHTML += card;
    }

    var currentTheme = localStorage.getItem("theme");
    if (currentTheme) {
        setTheme(currentTheme);
    }

    hideLoader();
}

function fetchProducts() {
    showLoader();

    var searchInput = document.getElementById("search-input").value.toLowerCase();
    var brandFilter = document.getElementById("brand-filter").value;
    var priceFilter = document.getElementById("price-filter").value;
    var sortOption = document.getElementById("sortBtn").value;
    var countryFilter = document.getElementById("country-filter").value;

    var sortField = "title";
    var sortOrder = "ASC";

    if (sortOption === "Price: Low to High") {
        sortField = "final_price";
        sortOrder = "ASC";
    } else if (sortOption === "Price: High to Low") {
        sortField = "final_price";
        sortOrder = "DESC";
    } else if (sortOption === "Newest Arrivals") {
        sortField = "date_first_available";
        sortOrder = "DESC";
    }

    var requestBody = {
        apikey: a_key,
        type: "GetAllProducts",
        return: ["id", "brand", "title", "image_url", "department", "final_price", "country_of_origin", "date_first_available", "categories"],
        limit: 50,
        sort: sortField,
        order: sortOrder
    };

    if (searchInput) {
        requestBody.search = {
            title: searchInput,
            brand: searchInput
        };
    }



    var xhr = new XMLHttpRequest();
    xhr.open("POST", "../../api.php", true);

    xhr.onreadystatechange = function () {

        console.log("Current state:", xhr.readyState, "Current status:", xhr.status);

        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("condition accepted");

            var response = JSON.parse(xhr.responseText);
            console.log(response);
            if (response.status == 'success') {
                var data = response.data;

                if (priceFilter === "Under R1000") {
                    data = data.filter(function (p) { return p.final_price < 1000; });
                } else if (priceFilter === "R1000 - R1500") {
                    data = data.filter(function (p) { return p.final_price >= 1000 && p.final_price <= 1500; });
                } else if (priceFilter === "Above R1500") {
                    data = data.filter(function (p) { return p.final_price > 1500; });
                }

                if (brandFilter && brandFilter !== "Filter by Brand") {
                    data = data.filter(function (p) {
                        return p.brand && p.brand.toLowerCase() === brandFilter.toLowerCase();
                    });
                }

                if (countryFilter && countryFilter !== "Filter by Country") {
                    data = data.filter(function (p) {
                        return p.country_of_origin && p.country_of_origin.toLowerCase() === countryFilter.toLowerCase();
                    });
                }  

                console.log("condition accepted");
                // products = response.data;
                products = data;

                // console.log(products[1].final_price);
                // console.log(products[1].title);
                console.log("Products fetched, calling DISPLAY");

                displayProducts(products);

                //fetchConversionRates();
            } else {
                console.log("API returned error:", response.message);
                // hideLoader();
            }
        } else {
            console.log("Failed to fetch products. Status:", xhr.status, xhr.readyState);
            // hideLoader();
        }
        hideLoader();
    };

    xhr.send(JSON.stringify(requestBody));
}

window.onload = function () {
    console.log("Page loaded. Fetching products...");
    
    var apikey = localStorage.getItem("apikey");
  var username = localStorage.getItem("username");

  if (!apikey || !username) {
      window.location.href = "login.php";
      return; 
  }

  var userDisplay = document.getElementById("user-display");
  var userLink = document.getElementById("user-link");

  if (userDisplay && userLink) {
      userDisplay.style.display = "inline-block";
      userLink.textContent = "Welcome, " + username
  }

  document.getElementById("logout-link").style.display = "inline-block";
  document.getElementById("signup-link").style.display = "none";
  document.getElementById("login-link").style.display = "none";
    
    fetchProducts();

    var currencySelector = document.getElementById("currency-selector");

    document.getElementById("search-input").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) fetchProducts();
    });
    loadFilterOptions();

    document.getElementById("brand-filter").addEventListener("change", fetchProducts);
    document.getElementById("price-filter").addEventListener("change", fetchProducts);
    document.getElementById("sortBtn").addEventListener("change", fetchProducts);
    document.getElementById("country-filter").addEventListener("change", fetchProducts);


    if (currencySelector) {
        currencySelector.addEventListener("change", function () {
            currentCurrency = this.value;
            displayProducts(products);
        });
    } else {
        console.error("Currency selector not found");
    }

};
