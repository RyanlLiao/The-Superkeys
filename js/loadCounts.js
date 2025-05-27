async function loadCounts() {
  try {
    const counts = ['Users', 'Products', 'Reviews'];
    const responseData = {};

    for (const type of counts) {
      const response = await fetch('http://localhost/The-Superkeys/backend/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          count_type: 'count',
          count: type
        })
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      responseData[type] = data.count ?? 0;
    }

    document.getElementById('count-products').textContent = responseData.Products;
    document.getElementById('count-users').textContent = responseData.Users;
    document.getElementById('count-reviews').textContent = responseData.Reviews;

  } catch (error) {
    console.error('Failed to load counts:', error);
    document.getElementById('count-products').textContent = 'Error';
    document.getElementById('count-users').textContent = 'Error';
    document.getElementById('count-reviews').textContent = 'Error';
  }
}

window.addEventListener('DOMContentLoaded', loadCounts);