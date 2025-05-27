var a_key = localStorage.getItem("api_key"); 

function fetchAndGraphRatings() {
    if (!a_key) {
        console.error("API key not found in localStorage. Please log in.");
        var chartContainer = document.getElementById('myChart');
        if (chartContainer) {
            var parent = chartContainer.parentNode;
            var errorMessage = document.createElement('p');
            errorMessage.textContent = "API key not found. Please log in to view the graph.";
            errorMessage.style.color = "red";
            errorMessage.style.textAlign = "center";
            if (parent) {
                parent.insertBefore(errorMessage, chartContainer);
                if(chartContainer.style) chartContainer.style.display = 'none';
            }
        }
        return; 
    }

    var requestBody = {
        type: "GetAllProducts",
        apikey: a_key,
        return: "*" 
    };

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost/The-Superkeys/backend/api.php", true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) { 
            if (xhr.status == 200) {
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.status === "success" && response.data) {
                        var data = response.data;
                        var ratingCounts = countRatingsByRange(data); 
                        console.log("Rating counts by range:", ratingCounts);
                        renderRangeChart(ratingCounts); 
                    } else {
                        console.error("API returned error or no data:", response.message || "No data received");
                    }
                } catch (e) {
                    console.error("Failed to parse API response:", e);
                    console.error("Raw response:", xhr.responseText);
                }
            } else {
                console.error("API request failed with status:", xhr.status, xhr.statusText);
                try {
                    const errorJson = JSON.parse(xhr.responseText);
                    if (errorJson && errorJson.message) {
                        console.error("Server error message:", errorJson.message);
                    } else {
                        console.error("Raw error response:", xhr.responseText);
                    }
                } catch (e) {
                    console.error("Raw error response (not JSON):", xhr.responseText);
                }
            }
        }
    };

    xhr.send(JSON.stringify(requestBody));
}

function countRatingsByRange(products) {
    var ratingCounts = {
        "0-1": 0, 
        "1-2": 0,
        "2-3": 0,
        "3-4": 0, 
        "4-5": 0  
    };

    if (!Array.isArray(products)) {
        console.warn("Products data is not an array:", products);
        return ratingCounts; 
    }

    for (var i = 0; i < products.length; i++) {
        if (products[i] && typeof products[i].average_rating !== 'undefined') {
            var rating = parseFloat(products[i].average_rating);

            if (isNaN(rating)) continue; 

            if (rating >= 0 && rating < 1) {
                ratingCounts["0-1"]++;
            } else if (rating >= 1 && rating < 2) {
                ratingCounts["1-2"]++;
            } else if (rating >= 2 && rating < 3) {
                ratingCounts["2-3"]++;
            } else if (rating >= 3 && rating < 4) {
                ratingCounts["3-4"]++;
            } else if (rating >= 4 && rating <= 5) { 
                ratingCounts["4-5"]++;
            }
    
        }
    }
    return ratingCounts;
}

// Renamed and updated renderChart function
function renderRangeChart(ratingCounts) {
    var canvas = document.getElementById('myChart');
    if (!canvas) {
        console.error("Canvas element 'myChart' not found.");
        return;
    }
    var ctx = canvas.getContext('2d');

    // If a chart instance already exists on this canvas, destroy it
    if (window.myProductRatingRangeChart instanceof Chart) {
        window.myProductRatingRangeChart.destroy();
    }

    window.myProductRatingRangeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-1 Stars', '1-2 Stars', '2-3 Stars', '3-4 Stars', '4-5 Stars'],
            datasets: [{
                label: 'Number of products per rating range',
                data: [
                    ratingCounts["0-1"] || 0,
                    ratingCounts["1-2"] || 0,
                    ratingCounts["2-3"] || 0,
                    ratingCounts["3-4"] || 0,
                    ratingCounts["4-5"] || 0
                ],
                backgroundColor: [ 
                    '#ff6384', 
                    '#ff9f40', 
                    '#ffcd56',
                    '#4bc0c0',
                    '#36a2eb' 
                    // Original colors: '#ff4d4d', '#ff944d', '#ffe44d', '#a3ff4d', '#4dff88'
                ],
                borderColor: [
                    '#ff6384',
                    '#ff9f40',
                    '#ffcd56',
                    '#4bc0c0',
                    '#36a2eb'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0 
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Product Count by Rating Range'
                }
            }
        }
    });
}

window.onload = function () {
    if (document.getElementById('myChart')) {
        fetchAndGraphRatings();
    } else {
        console.log("Chart canvas 'myChart' not found on this page. Skipping rating graph initialization.");
    }
};