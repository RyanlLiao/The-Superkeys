async function loadCounts() {
  try {
    const countTypes = ['Users', 'Products', 'Reviews'];
    // const countTypes = ['Reviews'];
    // const countTypes = ['Products'];
    // const countTypes = ['Users'];
    
    const responseData = {};
    const apiKey = localStorage.getItem("api_key"); 

    for (const typeToCount of countTypes) {
      const requestBody = {
        type: "Count", 
        count_type: "count",
        count: typeToCount, 
        apikey: apiKey
      };

      let response;
      try {
        response = await fetch('http://localhost/The-Superkeys/backend/api.php', {
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
            errorInfo = `Server error for ${typeToCount}: ${errorData.message || JSON.stringify(errorData)}`;
          } catch (e) { 
            try {
              const errorText = await response.text();
              errorInfo += ` Server response (text): ${errorText.substring(0, 200)}...`;
            } catch (textError) { /* Stick with status */ }
          }
          throw new Error(errorInfo);
        }

        const apiResult = await response.json();

        if (apiResult.status === 'success' && typeof apiResult.data !== 'undefined') {
          responseData[typeToCount] = (apiResult.data === null) ? 0 : apiResult.data;
        } else if (apiResult.status === 'success' && (apiResult.data === null || typeof apiResult.data === 'undefined')) {
          console.warn(`Count for ${typeToCount} was explicitly null or undefined by API, treating as 0. API Message: ${apiResult.message || ''}`);
          responseData[typeToCount] = 0;
        } else {
          console.warn(`Could not retrieve count for ${typeToCount}: ${apiResult.message || 'API issue or non-success status.'}`);
          responseData[typeToCount] = 'N/A';
        }

      } catch (errorInLoop) {
        console.error(`Error processing count for ${typeToCount}:`, errorInLoop.message);
        
        if (errorInLoop instanceof SyntaxError && response) {
            console.error("This usually means the server (PHP) sent HTML (an error message) instead of JSON.");
            try {
                const clonedResponse = response.clone();
                const errorHtml = await clonedResponse.text();
                console.error("Raw server response (likely PHP error HTML):", errorHtml.substring(0, 500) + "...");
            } catch (textReadError) {
                console.error("Could not read the raw server response text after JSON parse error.", textReadError);
            }
        }
        responseData[typeToCount] = 'Error';
      }
    }

    document.getElementById('count-products').textContent = responseData.Products ?? 'N/A';
    document.getElementById('count-users').textContent = responseData.Users ?? 'N/A';
    document.getElementById('count-reviews').textContent = responseData.Reviews ?? 'N/A';

  } catch (error) { // Outer catch block for errors not handled per type or re-thrown
    console.error('Failed to load counts (outer catch):', error.message);
    document.getElementById('count-products').textContent = 'Error';
    document.getElementById('count-users').textContent = 'Error';
    document.getElementById('count-reviews').textContent = 'Error';
  }
}

window.addEventListener('DOMContentLoaded', loadCounts);