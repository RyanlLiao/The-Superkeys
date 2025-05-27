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

<div class ="container">

  <div class="view-container">
    <div class="left-column">

      <div class="carousel">
        <img src="img/placeholder.png" class="carousel-img active" alt="Product Image 1">
        <img src="img/placeholder.png" class="carousel-img" alt="Product Image 2">
        <img src="img/placeholder.png" class="carousel-img" alt="Product Image 3">
      </div>

      <div class="reviews">

        <h3>User Reviews</h3>

        <button class="add-category-btn" onclick="openModal()">+ Add Review</button>

        
      </div>

    </div>

    <div class="modal-overlay" id="categoryModal">
        <div class="modal">

        <h2>Submit a Review</h2>

    
        <label for="brandSelect"><span style="color:red">**</span>Brand :</label>
        <select id="brandSelect" required>
            <option value="">-- Select a Brand --</option>
        </select>

    
        <label for="ratingSelect">Rating:</label>
        <select id="ratingSelect">
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
        </select>

    
        <label for="reviewComment">Comment:</label>
        <textarea id="reviewComment" placeholder="Write your review here..." rows="4"></textarea>

        <div class="btn-group">
            <button class="cancel-btn" onclick="closeModal()">Cancel</button>
            <button class="save-btn" onclick="submitReview()">Submit Review</button>
        </div>
        </div>
    </div>

    <div class="right-column">

      <div class="product-details">
        <h1></h1>
        <p></p>
        <p></p>   
      </div>
      <div class="category-table">
        <h2>Price Comparison</h2>
        <table>
          <thead>
            <tr>
              <th>Retailer</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>

    </div>
 </div>
</div>

<script src = "js\view.js"></script>
</body>
</html>




  