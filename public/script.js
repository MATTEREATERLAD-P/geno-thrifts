const WHATSAPP_NUMBER = "254717644143";

async function loadDresses() {
  const grid = document.getElementById('dress-grid');
  try {
    const res = await fetch('/api/dresses');
    const dresses = await res.json();

    if (dresses.length === 0) {
      grid.innerHTML = '<p id="loading">No dresses available right now. Check back soon.</p>';
      return;
    }

    grid.innerHTML = dresses.map(d => `
      <div class="dress-card">
        <img src="${d.image}" alt="${d.name}">
        <div class="dress-info">
          <h3>${d.name}</h3>
          <p class="price">KSh ${d.price.toLocaleString()}</p>
          <a class="whatsapp-btn" target="_blank" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I would like to buy the ' + d.name + ' priced at KSh ' + d.price)}">Order on WhatsApp</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p id="loading">Could not load dresses. Please refresh.</p>';
  }
}

loadDresses();