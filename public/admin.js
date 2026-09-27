const listEl = document.getElementById('admin-list');
const form = document.getElementById('add-form');

async function loadAdminDresses() {
  const res = await fetch('/api/admin/dresses');
  const dresses = await res.json();

  if (dresses.length === 0) {
    listEl.innerHTML = '<p>No dresses added yet.</p>';
    return;
  }

  listEl.innerHTML = dresses.map(d => `
    <div class="admin-item">
      <img src="${d.image}" alt="${d.name}">
      <div class="details">
        <strong>${d.name}</strong><br>
        KSh ${d.price.toLocaleString()}<br>
        ${d.sold ? '<span class="sold-tag">SOLD</span>' : ''}
      </div>
      <div>
        ${d.sold
          ? `<button class="btn-unsold" onclick="markUnsold('${d._id}')">Mark Available</button>`
          : `<button class="btn-sold" onclick="markSold('${d._id}')">Mark Sold</button>`}
        <button class="btn-delete" onclick="deleteDress('${d._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('name', document.getElementById('name').value);
  formData.append('price', document.getElementById('price').value);
  formData.append('image', document.getElementById('image').files[0]);

  await fetch('/api/admin/dresses', { method: 'POST', body: formData });
  form.reset();
  loadAdminDresses();
});

async function markSold(id) {
  await fetch(`/api/admin/dresses/${id}/sold`, { method: 'PUT' });
  loadAdminDresses();
}

async function markUnsold(id) {
  await fetch(`/api/admin/dresses/${id}/unsold`, { method: 'PUT' });
  loadAdminDresses();
}

async function deleteDress(id) {
  if (!confirm('Delete this dress permanently?')) return;
  await fetch(`/api/admin/dresses/${id}`, { method: 'DELETE' });
  loadAdminDresses();
}

loadAdminDresses();