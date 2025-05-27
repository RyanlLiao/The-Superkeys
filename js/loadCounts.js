async function loadCounts() {
  try {
    const countTypes = ['Users', 'Products', 'Reviews'];
    // const countTypes = ['Reviews'];
    const responseData = {};

    const apiKey = "1a8eeccd5b43834a18870560a229cc4a6862ef492e808536a65055ca46eaba4f";

    for (const typeToCount of countTypes) {
      const requestBody = {
        type: "Count", 
        count_type: "count",
        count: typeToCount, 
        apikey: apiKey

      };




      const response = await fetch('http://localhost/The-Superkeys/backend/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorInfo = `Network error while fetching count for ${typeToCount}. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorInfo = errorData.message || JSON.stringify(errorData);
        } catch (e) { /* Response might not be JSON, stick with status text */ }
        throw new Error(errorInfo);
      }

      const apiResult = await response.json();

      if (apiResult.status === 'success' && typeof apiResult.data !== 'undefined') {
        // If data might be 0, and you want to display 0, this is fine.
        // If data could be null from the API and you want to treat it as 0:
        responseData[typeToCount] = (apiResult.data === null) ? 0 : Number(apiResult.data);
      } else if (apiResult.status === 'success' && (apiResult.data === null || typeof apiResult.data === 'undefined')) {
        // This handles cases where API reports success but data is explicitly null or undefined
        console.warn(`Count for ${typeToCount} was explicitly null or undefined by API, treating as 0. API Message: ${apiResult.message || ''}`);
        responseData[typeToCount] = 0;
      }
      else {
        console.warn(`Could not retrieve count for ${typeToCount}: ${apiResult.message || 'API issue or non-success status.'}`);
        responseData[typeToCount] = 'N/A'; // Or 0
      }
    }

    document.getElementById('count-products').textContent = responseData.Products ?? 'N/A';
    document.getElementById('count-users').textContent = responseData.Users ?? 'N/A';
    document.getElementById('count-reviews').textContent = responseData.Reviews ?? 'N/A';

  } catch (error) {
    console.error('Failed to load counts:', error.message);
    document.getElementById('count-products').textContent = 'Error';
    document.getElementById('count-users').textContent = 'Error';
    document.getElementById('count-reviews').textContent = 'Error';
  }
}

window.addEventListener('DOMContentLoaded', loadCounts);