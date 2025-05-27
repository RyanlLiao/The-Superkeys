  async function loadCounts() {
    try {
      const response = await fetch("http://localhost/The-Superkeys/backend/api.php"); // adjust path if needed
      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      document.getElementById('count-products').textContent = data.Products ?? '0';
      document.getElementById('count-users').textContent = data.Users ?? '0';
      document.getElementById('count-reviews').textContent = data.Reviews ?? '0';

    } catch (error) {
      console.error('Failed to load counts:', error);
      document.getElementById('count-products').textContent = 'Error';
      document.getElementById('count-users').textContent = 'Error';
      document.getElementById('count-reviews').textContent = 'Error';
    }
  }

  // Load counts on page load
  loadCounts();