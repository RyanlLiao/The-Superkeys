var a_key = '1a8eeccd5b43834a18870560a229cc4a6862ef492e808536a65055ca46eaba4f';

function loadTopRatedProducts() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/CompareIt/The-Superkeys/api.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    var requestBody = {
        type: "GetAllProducts",
        apikey: a_key,
        return: "*"
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.status === "success") {
                    var products = response.data;

                    
                    var highRated = products.filter(function (p) {
                        return parseFloat(p.average_rating) >= 4.9;
                    });

                    
                    highRated.sort(function (a, b) {
                        return parseFloat(b.average_rating) - parseFloat(a.average_rating);
                    });

                    
                    var topRated = highRated.slice(0, 9);

                    renderTopRated(topRated);
                } else {
                    console.error("Failed to load top-rated products:", response.message);
                }
            } catch (err) {
                console.error("Error parsing response:", err);
            }
        }
    };

    xhr.send(JSON.stringify(requestBody));
}


function renderTopRated(products) {
    var container = document.querySelector(".product-grid");
    container.innerHTML = ""; 

    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var images = JSON.parse(product.images || "[]");
        var mainImage = images.length > 0 ? images[0] : "img/placeholder.png";
        var rating = parseFloat(product.average_rating);
        var stars = renderStars(rating);

        var card = ''
            + '<div class="product-card">'
            + '<a href="view.php?id=' + product.product_id + '">'
            + '<img src="' + mainImage + '" alt="' + product.product_name + '">'
            + '</a>'
            + '<h2>' + product.product_name + '</h2>'
            + '<div class="rating">' + stars + ' (' + rating.toFixed(1) + ')</div>'
            + '<p>From: R' + product.price + '</p>'
            + '</div>';

        container.innerHTML += card;
    }
}

function renderStars(rating) {
    var full = Math.floor(rating);
    var half = (rating % 1 >= 0.5) ? 1 : 0;
    var empty = 5 - full - half;

    return '★'.repeat(full) + '☆'.repeat(empty); 
}

window.onload = function () {
    loadTopRatedProducts();
};
