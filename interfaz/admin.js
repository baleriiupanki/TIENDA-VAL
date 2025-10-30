document.addEventListener('DOMContentLoaded', () => {
  initAdmin();
});

async function initAdmin() {
  // 🌍 Detectar si estamos en local o en Render
  const API_URL = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://tienda-val.onrender.com'; // 🔹 cambia si tu backend tiene otro nombre

  const token = localStorage.getItem('token');
  if (!token) {
    alert('No has iniciado sesión. Redirigiendo al login...');
    window.location.href = 'index.html';
    return;
  }

  try {
    await Promise.all([
      cargarCategorias(API_URL, token),
      cargarProductos(API_URL, token),
      llenarSelectCategorias(API_URL, token)
    ]);
  } catch (error) {
    alert('Error de autorización o conexión. Inicia sesión de nuevo.');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  document.getElementById('form-categoria').addEventListener('submit', e => manejadorCategoria(e, API_URL));
  document.getElementById('form-producto').addEventListener('submit', e => manejadorProducto(e, API_URL));
  document.getElementById('btn-agregar-imagen').addEventListener('click', agregarCampoImagen);
  document.getElementById('contenedor-imagenes').addEventListener('click', e => {
    if (e.target.classList.contains('btn-eliminar-imagen')) {
      e.target.parentElement.remove();
    }
  });
}

async function manejadorCategoria(e, API_URL) {
  e.preventDefault();
  const nombre = e.target['input-categoria'].value.trim();
  if (!nombre) return alert('Ingresa un nombre válido');

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre })
    });

    if (!res.ok) throw new Error('Error al crear categoría');

    e.target.reset();
    await Promise.all([
      cargarCategorias(API_URL, token),
      llenarSelectCategorias(API_URL, token),
      cargarProductos(API_URL, token)
    ]);
  } catch (err) {
    alert(err.message);
  }
}

async function manejadorProducto(e, API_URL) {
  e.preventDefault();
  const form = e.target;
  const nombre = form['input-nombre'].value.trim();
  const precio = parseFloat(form['input-precio'].value);
  const categoria_id = form['input-categoria-id'].value;
  const descripcion = form['input-descripcion'].value.trim();
  const urls = Array.from(form.querySelectorAll('.input-imagen'))
    .map(input => input.value.trim())
    .filter(url => url !== '');

  if (!nombre || isNaN(precio) || !categoria_id || urls.length === 0)
    return alert('Completa todos los campos e ingresa al menos una imagen');

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/productos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ nombre, precio, categoria_id, descripcion })
    });
    if (!res.ok) throw new Error('Error al crear producto');
    const prod = await res.json();

    for (const url of urls) {
      const resImg = await fetch(`${API_URL}/imagenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url, producto_id: prod.id })
      });
      if (!resImg.ok) throw new Error('Error al crear imagen');
    }

    alert('✅ Producto creado con éxito');
    form.reset();
    document.getElementById('contenedor-imagenes').innerHTML = '';
    agregarCampoImagen();
    cargarProductos(API_URL, token);
  } catch (err) {
    console.error(err);
    alert(err.message || 'Error al guardar el producto');
  }
}

function agregarCampoImagen() {
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="url" class="form-control input-imagen" placeholder="URL de imagen" required />
    <button type="button" class="btn btn-outline-danger btn-eliminar-imagen" title="Eliminar imagen">✖</button>
  `;
  document.getElementById('contenedor-imagenes').appendChild(div);
}

async function cargarCategorias(API_URL, token) {
  const res = await fetch(`${API_URL}/categorias`);
  const cats = await res.json();
  const ul = document.getElementById('lista-categorias');
  ul.innerHTML = '';
  cats.forEach(cat => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = cat.nombre;
    const del = document.createElement('button');
    del.className = 'btn btn-sm btn-danger';
    del.textContent = 'Eliminar';
    del.onclick = async () => {
      if (confirm(`¿Eliminar "${cat.nombre}"?`)) {
        const resDel = await fetch(`${API_URL}/categorias/${cat.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resDel.ok) return alert('Error al eliminar categoría');
        await Promise.all([
          cargarCategorias(API_URL, token),
          llenarSelectCategorias(API_URL, token),
          cargarProductos(API_URL, token)
        ]);
      }
    };
    li.appendChild(del);
    ul.appendChild(li);
  });
}

async function cargarProductos(API_URL, token) {
  const res = await fetch(`${API_URL}/productos`);
  const prods = await res.json();
  const tbody = document.querySelector('#tabla-productos tbody');
  tbody.innerHTML = '';
  prods.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${prod.nombre}</td>
      <td>$${Number(prod.precio).toFixed(2)}</td>
      <td>${prod.categoria || '—'}</td>
      <td><button class="btn btn-sm btn-danger eliminar">Eliminar</button></td>`;
    tbody.appendChild(tr);
    tr.querySelector('.eliminar').onclick = async () => {
      if (confirm(`¿Eliminar "${prod.nombre}"?`)) {
        const resDel = await fetch(`${API_URL}/productos/${prod.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!resDel.ok) return alert('Error al eliminar producto');
        cargarProductos(API_URL, token);
      }
    };
  });
}

async function llenarSelectCategorias(API_URL, token) {
  const res = await fetch(`${API_URL}/categorias`);
  const cats = await res.json();
  const sel = document.getElementById('input-categoria-id');
  sel.innerHTML = '<option value="">Seleccione</option>';
  cats.forEach(cat => {
    const o = document.createElement('option');
    o.value = cat.id;
    o.textContent = cat.nombre;
    sel.appendChild(o);
  });
}
