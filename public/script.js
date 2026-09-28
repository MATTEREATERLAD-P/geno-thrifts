const WHATSAPP_NUMBER = "254717644143";
let allDresses = [];

function whatsappLink(d) {
  const msg = 'Hi, I would like to buy the ' + d.name + ' priced at KSh ' + d.price;
  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadDresses() {
  const grid = document.getElementById('dress-grid');
  try {
    const res = await fetch('/api/dresses');
    allDresses = await res.json();

    if (allDresses.length === 0) {
      grid.innerHTML = '<p id="loading">No dresses available right now. Check back soon.</p>';
      return;
    }

    grid.innerHTML = allDresses.map((d, i) => `
      <div class="dress-card">
        <img src="${d.image}" alt="${escapeHtml(d.name)}" data-index="${i}">
        <div class="dress-info">
          <h3>${escapeHtml(d.name)}</h3>
          <p class="price">KSh ${d.price.toLocaleString()}</p>
          <a class="whatsapp-btn" target="_blank" href="${whatsappLink(d)}">Order on WhatsApp</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = '<p id="loading">Could not load dresses. Please refresh.</p>';
  }
}

const lightbox = document.getElementById('lightbox');

function openLightbox(d) {
  document.getElementById('lightbox-img').src = d.image;
  document.getElementById('lightbox-img').alt = d.name;
  document.getElementById('lightbox-name').textContent = d.name;
  document.getElementById('lightbox-price').textContent = 'KSh ' + d.price.toLocaleString();
  document.getElementById('lightbox-btn').href = whatsappLink(d);
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
}

document.getElementById('dress-grid').addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG' && e.target.dataset.index !== undefined) {
    openLightbox(allDresses[e.target.dataset.index]);
  }
});

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

loadDresses();