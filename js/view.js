var a_key = '1a8eeccd5b43834a18870560a229cc4a6862ef492e808536a65055ca46eaba4f';
var imageList = [];

function getProductIdFromURL() {
    var query = window.location.search.substring(1);
    var params = query.split("&");

    for (var i = 0; i < params.length; i++) {
        var pair = params[i].split("=");
        if (pair[0] == "id") {
            return pair[1];
        }
    }

    return null;
}

function openModal() {
    document.getElementById("categoryModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("categoryModal").style.display = "none";
    document.getElementById("brandSelect").value = "";
    document.getElementById("ratingSelect").value = "";
    document.getElementById("reviewComment").value = "";
}

function submitReview() {
    const apiKey = localStorage.getItem("api_key");
    const userType = localStorage.getItem("user_type");
    console.log(apiKey);
    console.log(userType);
    // console.log(localStorage.getItem("logged_in"));

    if (!apiKey || userType != "User") {
        alert("You must be a logged in user to submit a review.");
        // return;
    }
    var id = getProductIdFromURL();

    const brand = document.getElementById('brandSelect').value.trim();
    const rating = document.getElementById('ratingSelect').value;
    const comment = document.getElementById('reviewComment').value.trim();

    if (!brand || !rating || !comment) {
        alert("Please fill in all required fields.");
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/CompareIt/The-Superkeys/api.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log("Review submission response:", xhr.responseText);

            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log("Parsed response:", response);
                    alert("Review submitted successfully!");
                } catch (e) {
                    console.error("Invalid JSON response:", e);
                    // alert("Error: Could not parse server response.");
                }
            } else {
                console.error("Submission failed with status:", xhr.status);
                alert("Failed to submit review. Please try again.");
            }

            closeModal();
        }
    };
    console.log(localStorage.getItem("api_key"));

    const reviewBody = {
        type: "AddReview",
        apikey: apiKey,
        pid: id,
        date: today,
        rating: rating,
        comment: comment,

    };

    console.log("Submitting review:", reviewBody);

    xhr.send(JSON.stringify(reviewBody));

}

function loadReviews(id) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/CompareIt/The-Superkeys/api.php", true);

    var requestBody = {
        apikey: a_key,
        type: "GetReviews",
        pid: id
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
            var response = JSON.parse(xhr.responseText);

            console.log(response.data.length);
            console.log(response.data);

            if (response.status == "success" && response.data.length > 0) {
                const reviews = response.data;

                var reviewsContainer = document.querySelector(".reviews");

                for (var j = 0; j < reviews.length; j++) {
                    var review = reviews[j];
                    var reviewDiv = document.createElement("div");
                    reviewDiv.className = "review";

                    var reviewHTML = ''
                        + '<div class="review-text">'
                        + '<strong>' + review.username + '</strong>: ' + review.comments
                        + '</div>'
                        + '<div class="review-meta">'
                        + '<span class="brand">Date: ' + review.date + '</span>'
                        + '<span class="rating">Rating: ' + renderStars(review.rating) + '</span>'
                        + '</div>';

                    reviewDiv.innerHTML = reviewHTML;
                    reviewsContainer.appendChild(reviewDiv);
                }



            }
        }
    };

    xhr.send(JSON.stringify(requestBody));

}

function renderStars(rating) {
    const rounded = Math.round(rating);
    const full = rounded;
    const empty = 5 - full;

    return '★'.repeat(full) + '☆'.repeat(empty);
}

function populateRetailers(data) {
    const brandSelect = document.getElementById("brandSelect");
    brandSelect.innerHTML = '<option value="">-- Select a Retailer ID --</option>';

    const seen = new Set();

    data.forEach(entry => {
        const retailerId = entry.retailer_name;
        if (!seen.has(retailerId)) {
            seen.add(retailerId);

            const option = document.createElement("option");
            option.value = retailerId;
            option.textContent = `${retailerId}`;
            brandSelect.appendChild(option);
        }
    });
}

window.onload = function () {
    var id = getProductIdFromURL();
    console.log("ID:", id);

    var container = document.querySelector(".view-container")

    if (!id) {
        container.innerHTML = "<p>No product selected.</p>";
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/CompareIt/The-Superkeys/api.php", true);

    var requestBody = {
        apikey: a_key,
        type: "GetProduct",
        product_id: id
    };

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {

            var response = JSON.parse(xhr.responseText);

            console.log(response.data.length);
            console.log(response.data);

            if (response.status == "success" && response.data.length > 0) {


                const product = response.data[0];
                const prices = response.data;

                populateRetailers(prices);

                const imgCont = document.querySelector(".carousel");
                var images = JSON.parse(product.images || "[]");
               
                console.log(images);
                if (typeof images == "string")
                    images = [images];

                console.log(images);
                imgCont.innerHTML = images.map((src, i) =>
                    `<img src="${src}" class="carousel-img ${i === 0 ? 'active' : ''}" alt="Product Image ${i + 1}">`
                ).join('');


                var container = document.querySelector(".right-column .product-details");

                var html = ''
                    + '<h1>' + product.product_name + '</h1>'
                    + '<p><strong>Description:</strong> ' + product.description + '</p>'
                    + '<p><strong>Average rating:</strong> ' + renderStars(product.average_rating) + ' (' + product.average_rating + ')</p>'
                    + '<button class="add-category-btn" onclick="addWishlist()" >Add to Wishlist</button>';

                container.innerHTML = html;


                var priceTableBody = document.querySelector(".category-table tbody");
                var rows = [];

                for (var i = 0; i < prices.length; i++) {
                    var entry = prices[i];
                    var row = ''
                        + '<tr>'
                        + '<td><a href="' + entry.url + '" target="_blank">' + entry.retailer_name + '</a></td>'
                        + '<td>R' + entry.price.toFixed(2) + '</td>'
                        + '</tr>';
                    rows.push(row);
                }

                priceTableBody.innerHTML = rows.join('');
            }
        }
    };

    xhr.send(JSON.stringify(requestBody));

    loadReviews(id);
};

function addWishlist() {
    var apiKey = localStorage.getItem("api_key");
    if (apiKey == null) {
        alert("Please log in.");
        window.location.href = "login.php";
    }

    //var button = event.currentTarget;
    var pid = getProductIdFromURL();

    var wish = new XMLHttpRequest();
    wish.open("POST", "/CompareIt/The-Superkeys/api.php", true);
    wish.setRequestHeader("Content-type", "application/json");

    var body = JSON.stringify({
        "type": "AddWishlist",
        "apikey": localStorage.getItem("api_key"),
        "pid": pid
    });
    //need to redirect if they aren't logged in
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

