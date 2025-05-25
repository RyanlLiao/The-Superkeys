<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View</title>
    <link rel="stylesheet" href="css/products.css">
    <link rel="stylesheet" href="css/view.css">
</head>

<?php include 'header.php'; ?>


<body>
  <div class="product-container">
    <div class="left-column">
      <div class="carousel">
        <img src="img/placeholder.png" class="carousel-img active" alt="Product Image 1">
        <img src="img/placeholder.png" class="carousel-img" alt="Product Image 2">
        <img src="img/placeholder.png" class="carousel-img" alt="Product Image 3">
      </div>
      <div class="reviews">
        <h3>User Reviews</h3>
        <div class="review">
          <strong>Jane Doe</strong>: Great product, highly recommend!
        </div>
        <div class="review">
          <strong>John Smith</strong>: Not bad, but delivery was slow.
        </div>
      </div>
    </div>

    <div class="right-column">
      <div class="product-details">
        <h2>Awesome Headphones</h2>
        <p>High-fidelity audio with noise-cancellation and long battery life.</p>
      </div>
      <div class="price-table">
        <h3>Price Comparison</h3>
        <table>
          <thead>
            <tr>
              <th>Retailer</th>
              <th>Price</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Retailer A</td>
              <td>$99.99</td>
              <td><a href="https://example.com/a" target="_blank">Visit</a></td>
            </tr>
            <tr>
              <td>Retailer B</td>
              <td>$95.50</td>
              <td><a href="https://example.com/b" target="_blank">Visit</a></td>
            </tr>
            <tr>
              <td>Retailer C</td>
              <td>$105.00</td>
              <td><a href="https://example.com/c" target="_blank">Visit</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>


</body>
</html>




  