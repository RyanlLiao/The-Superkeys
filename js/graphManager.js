src="https://cdn.jsdelivr.net/npm/chart.js"

const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [{
        label: 'Number of products per rating',
        data: [19, 30, 5, 2, 3],        //VALUES CAN BE CHANGED FROM HERE
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });