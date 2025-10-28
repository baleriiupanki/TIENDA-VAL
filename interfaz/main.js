document.addEventListener('DOMContentLoaded', () => {
  // Mostrar u ocultar panel admin según token
  const token = localStorage.getItem('token');
  const adminPanel = document.getElementById('admin-panel');
  if (adminPanel) {  // para prevenir errores si no existe el panel en esta página
    adminPanel.style.display = token ? 'block' : 'none';
  }
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('token');
      if (adminPanel) adminPanel.style.display = 'none';
      alert('Has cerrado sesión.');
      window.location.href = 'index.html';  // Ajusta la ruta según tu estructura
    });
  }

  // Aquí continúa tu código original
  cargarCategorias();
  cargarProductos();
  llenarSelectCategorias();

  // Evento para registrar nuevo producto
  document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('input-nombre').value.trim();
    const precio = parseFloat(document.getElementById('input-precio').value);
    if (isNaN(precio)) {
      alert('Precio inválido');
      return;
    }

    const categoria_id = document.getElementById('input-categoria-id').value;
    const descripcion = document.getElementById('input-descripcion').value.trim();

    // Obtener todas las URLs de imágenes
    const urls = Array.from(document.querySelectorAll('.input-imagen'))
      .map(input => input.value.trim())
      .filter(url => url !== '');

    if (urls.length === 0) {
      alert('Debes agregar al menos una imagen válida');
      return;
    }

    try {
      const resProducto = await fetch('http://localhost:3000/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, precio, categoria_id, descripcion })
      });

      if (!resProducto.ok) {
        const errorTexto = await resProducto.text();
        throw new Error(`Error al crear producto: ${resProducto.status} - ${errorTexto}`);
      }

      const producto = await resProducto.json();

      for (const url of urls) {
        await fetch('http://localhost:3000/imagenes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, producto_id: producto.id })
        });
      }

      alert('Producto creado con éxito');
      document.getElementById('form-producto').reset();

      // Reiniciar inputs de imagen a 1 solo vacío
      const contenedorImagenes = document.getElementById('contenedor-imagenes-admin');
      contenedorImagenes.innerHTML = `
        <div class="input-group mb-2">
          <input type="url" class="form-control input-imagen" placeholder="URL de imagen" required />
          <button type="button" class="btn btn-outline-danger btn-eliminar-imagen" title="Eliminar imagen">✖</button>
        </div>
      `;

      cargarProductos();

    } catch (error) {
      console.error('Error al crear producto o imágenes:', error);
      alert(error.message);
    }
  });

  // Botón para agregar input de imagen
  const btnAgregarImagen =
  document.getElementById('btn-agregar-imagen') ||
  document.getElementById('btn-agregar-imagen-admin') ||
  document.getElementById('btn-agregar-imagen-publico');

  if (btnAgregarImagen) {
    btnAgregarImagen.addEventListener('click', () => {
      const contenedor =
        document.getElementById('contenedor-imagenes') ||
        document.getElementById('contenedor-imagenes-admin') ||
        document.getElementById('contenedor-imagenes-publico');

      if (!contenedor) return;

      const grupo = document.createElement('div');
      grupo.className = 'input-group mb-2';
      grupo.innerHTML = `
        <input type="url" class="form-control input-imagen" placeholder="URL de imagen" required />
        <button type="button" class="btn btn-outline-danger btn-eliminar-imagen" title="Eliminar imagen">✖</button>
      `;
      contenedor.appendChild(grupo);
    });
  }

  // Delegación para eliminar inputs de imagen (deja mínimo 1)
  document.getElementById('contenedor-imagenes-admin').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar-imagen')) {
      const contenedor = document.getElementById('contenedor-imagenes-admin');
      if (contenedor.children.length > 1) {
        e.target.parentElement.remove();
      } else {
        alert('Debe quedar al menos una imagen.');
      }
    }
  });

  async function cargarCategorias() {
    try {
      const res = await fetch('http://localhost:3000/categorias');
      const categorias = await res.json();
      const menu = document.getElementById('menu-categorias');
      menu.innerHTML = '';

      const liInicio = document.createElement('li');
      liInicio.classList.add('nav-item');
      const aInicio = document.createElement('a');
      aInicio.classList.add('nav-link');
      aInicio.href = '#';
      aInicio.id = 'link-inicio'; // para poder usarlo en el event listener
      aInicio.textContent = 'Inicio';
      aInicio.addEventListener('click', e => {
        e.preventDefault();
        cargarProductos();
      });
      liInicio.appendChild(aInicio);
      menu.appendChild(liInicio);

      categorias.forEach(cat => {
        const li = document.createElement('li');
        li.classList.add('nav-item');

        const a = document.createElement('a');
        a.classList.add('nav-link');
        a.href = '#';
        a.textContent = cat.nombre;
        a.dataset.nombre = cat.nombre;

        a.addEventListener('click', (e) => {
          e.preventDefault(); // Evita que recargue la página
          cargarProductosPorCategoria(cat.nombre);
        });

        li.appendChild(a);
        menu.appendChild(li);
      });
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  async function cargarProductos() {
    try {
      const res = await fetch('http://localhost:3000/productos');
      const productos = await res.json();
      mostrarProductos(productos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  async function cargarProductosPorCategoria(categoriaNombre) {
    try {
      const res = await fetch(`http://localhost:3000/productos?categoria=${encodeURIComponent(categoriaNombre)}`);
      const productos = await res.json();
      mostrarProductos(productos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }

  async function mostrarProductos(productos) {
    const contenedor = document.getElementById('lista-productos');
    contenedor.innerHTML = '';

    if (productos.length === 0) {
      contenedor.textContent = 'No hay productos en esta categoría.';
      return;
    }

    const tarjetas = await Promise.all(productos.map(async producto => {
      try {
        const res = await fetch(`http://localhost:3000/imagenes?producto_id=${producto.id}`);
        const imagenes = await res.json();
        const primeraImagen = imagenes.length > 0 ? imagenes[0].url : 'https://via.placeholder.com/150';

        const card = document.createElement('div');
        card.classList.add('card', 'm-2');
        card.style.width = '18rem';
        card.innerHTML = `
          <img src="${primeraImagen}" class="card-img-top" alt="${producto.nombre}">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            <p class="card-text">Precio: $${producto.precio}</p>
            <a href="#" class="btn btn-primary" data-id="${producto.id}">Ver detalle</a>
          </div>
        `;
        return card;
      } catch (err) {
        console.error('Error cargando imágenes:', err);
        return null;
      }
    }));

    tarjetas.filter(card => card !== null).forEach(card => contenedor.appendChild(card));

    const botones = contenedor.querySelectorAll('.btn-primary');
    botones.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const id = btn.getAttribute('data-id');
        mostrarDetalle(id);
      });
    });
  }

  async function mostrarDetalle(id) {
    try {
      const res = await fetch(`http://localhost:3000/productos/${id}`);
      const prod = await res.json();

      // Asignar contenido al modal
      document.getElementById('detalle-nombre').textContent = prod.nombre;
      document.getElementById('detalle-precio').textContent = `Precio: $${prod.precio}`;
      document.getElementById('detalle-descripcion').textContent = prod.descripcion || 'Sin descripción.';

      const detalle = document.getElementById('detalle-imagenes');
      detalle.innerHTML = '';

      prod.imagenes.forEach(img => {
        const col = document.createElement('div');
        col.className = 'col-6';
        col.innerHTML = `<img src="${img.url}" class="img-fluid" alt="Imagen de ${prod.nombre}" />`;
        detalle.appendChild(col);
      });

      const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
      modal.show();
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    }
  }

  async function llenarSelectCategorias() {
    try {
      const res = await fetch('http://localhost:3000/categorias');
      const categorias = await res.json();
      const select = document.getElementById('input-categoria-id');
      select.innerHTML = `<option value="">Seleccione categoría</option>`;
      categorias.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.nombre;
        select.appendChild(opt);
      });
    } catch (error) {
      console.error('Error al llenar select:', error);
    }
  }

  // === Login Modal ===

  document.getElementById('btn-login').addEventListener('click', (e) => {
    e.preventDefault();
    const modalLogin = new bootstrap.Modal(document.getElementById('modalLogin'));
    document.getElementById('form-login').reset();
    document.getElementById('login-error').style.display = 'none';
    modalLogin.show();
  });

  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('inputUsuario').value;
    const password = document.getElementById('inputPassword').value;
    const loginError = document.getElementById('login-error');

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });

      const data = await res.json();

      if (!res.ok) {
        loginError.textContent = data.message || 'Credenciales incorrectas';
        loginError.style.display = 'block';
        return;
      }

      // Guardar el token en localStorage
      localStorage.setItem('token', data.token);

      // Redirigir al panel de administración
      window.location.href = 'admin.html';

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      loginError.textContent = 'Error de conexión con el servidor.';
      loginError.style.display = 'block';
    }
  });

  // === Registro Usuario ===
  const btnRegistrar = document.getElementById('btn-registrar');
  const modalRegistro = new bootstrap.Modal(document.getElementById('modalRegistro'));
  const formUsuario = document.getElementById('form-usuario');
  const mensajeRegistro = document.getElementById('mensaje-registro');

  btnRegistrar.addEventListener('click', (e) => {
    e.preventDefault();
    mensajeRegistro.style.display = 'none';
    formUsuario.reset();
    modalRegistro.show();
  });

  formUsuario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuario = document.getElementById('input-usuario').value.trim();
    const password = document.getElementById('input-password').value.trim();

    if (!usuario || !password) {
      mensajeRegistro.textContent = 'Por favor, complete todos los campos.';
      mensajeRegistro.style.color = 'red';
      mensajeRegistro.style.display = 'block';
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/auth/register', { // Ajusta URL según tu backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });

      const data = await res.json();

      if (!res.ok) {
        mensajeRegistro.textContent = data.message || 'Error al registrar usuario';
        mensajeRegistro.style.color = 'red';
        mensajeRegistro.style.display = 'block';
        return;
      }

      mensajeRegistro.textContent = 'Usuario registrado con éxito. Puedes iniciar sesión.';
      mensajeRegistro.style.color = 'green';
      mensajeRegistro.style.display = 'block';

      setTimeout(() => {
        modalRegistro.hide();
      }, 2000);

    } catch (error) {
      console.error('Error al registrar usuario:', error);
      mensajeRegistro.textContent = 'Error de conexión con el servidor.';
      mensajeRegistro.style.color = 'red';
      mensajeRegistro.style.display = 'block';
    }
  });

});
