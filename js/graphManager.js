var a_key = 'f61891d740ceb2539535bd06a1c7936f';

function fetchAndGraphRatings() {
    var requestBody = {
        type: "GetAllProducts",
        apikey: a_key,
        return: "*"
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/The-Superkeys/backend/api.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.status === "success") {
                var data = response.data;
                var ratingCounts = countRatings(data);
                console.log("Rating counts:", ratingCounts);
                renderChart(ratingCounts);
            } else {
                console.error("API returned error:", response.message);
            }
        }
    };

    xhr.send(JSON.stringify(requestBody));
}

function countRatings(products) {
    var ratingCounts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };

    for (var i = 0; i < products.length; i++) {
        var rating = Math.round(parseFloat(products[i].average_rating));
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
        }
    }

    return ratingCounts;
}

function renderChart(ratingCounts) {
    var ctx = document.getElementById('myChart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of products per rating',
                data: [
                    ratingCounts[1],
                    ratingCounts[2],
                    ratingCounts[3],
                    ratingCounts[4],
                    ratingCounts[5]
                ],
                backgroundColor: [
                    '#ff4d4d', '#ff944d', '#ffe44d', '#a3ff4d', '#4dff88'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            }
        }
    });
}

window.onload = function () {
    fetchAndGraphRatings();
};