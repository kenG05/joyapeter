// Configuración de conexión a tu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBjLT-8QHzVNqNX8Cn5ee0MdIkq2IXqUfs",
  authDomain: "catalogo-joyapeter.firebaseapp.com",
  projectId: "catalogo-joyapeter",
  storageBucket: "catalogo-joyapeter.firebasestorage.app",
  messagingSenderId: "1061050802779",
  appId: "1:1061050802779:web:50581dfb2238df8305157e"
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const productosRef = db.collection('productos');

// Referencias a elementos del HTML
const contenedorProductos = document.getElementById('contenedor-productos');
const formProducto = document.getElementById('form-producto');
const listaAdminProductos = document.getElementById('lista-admin-productos');

// Sincronización en tiempo real con Firestore
productosRef.onSnapshot((snapshot) => {
  const productos = [];
  snapshot.forEach((doc) => {
    productos.push({ id: doc.id, ...doc.data() });
  });

  // Si estamos en la página principal (index.html)
  if (contenedorProductos) {
    renderizarCatalogo(productos);
  }

  // Si estamos en la página de administración (admin.html)
  if (listaAdminProductos) {
    renderizarListaAdmin(productos);
  }
}, (error) => {
  console.error("Error al conectar con Firestore:", error);
});

// Función para mostrar el catálogo público (index.html)
function renderizarCatalogo(productos) {
  contenedorProductos.innerHTML = '';

  if (productos.length === 0) {
    contenedorProductos.innerHTML = `<p class="mensaje-vacio">No hay joyas disponibles en el catálogo.</p>`;
    return;
  }

  productos.forEach((prod) => {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta-producto';

    const precioFormateado = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(prod.precio || 0);

    const mensajeWa = encodeURIComponent(`Hola, estoy interesado en la joya: ${prod.nombre} (${precioFormateado})`);
    const urlWa = `https://wa.me/?text=${mensajeWa}`;

    tarjeta.innerHTML = `
      <div class="imagen-container">
        <img src="${prod.imagen || 'https://via.placeholder.com/300'}" alt="${prod.nombre}">
      </div>
      <div class="info-producto">
        <h3>${prod.nombre}</h3>
        <p class="descripcion">${prod.descripcion || ''}</p>
        <p class="precio">${precioFormateado}</p>
        <a href="${urlWa}" target="_blank" rel="noopener" class="btn-whatsapp">Consultar por WhatsApp</a>
      </div>
    `;
    contenedorProductos.appendChild(tarjeta);
  });
}

// Función para mostrar la lista en el panel de administración (admin.html)
function renderizarListaAdmin(productos) {
  listaAdminProductos.innerHTML = '';

  if (productos.length === 0) {
    listaAdminProductos.innerHTML = `<p>No hay productos registrados en la base de datos.</p>`;
    return;
  }

  productos.forEach((prod) => {
    const item = document.createElement('div');
    item.className = 'item-admin';
    item.innerHTML = `
      <div class="info-admin">
        <img src="${prod.imagen || 'https://via.placeholder.com/50'}" alt="${prod.nombre}" width="50" height="50">
        <div>
          <strong>${prod.nombre}</strong> - $${prod.precio}
          <p>${prod.categoria || 'Joyas'}</p>
        </div>
      </div>
      <button onclick="eliminarProducto('${prod.id}')" class="btn-eliminar">Eliminar</button>
    `;
    listaAdminProductos.appendChild(item);
  });
}

// Evento para agregar un nuevo producto desde el formulario (admin.html)
if (formProducto) {
  formProducto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const precio = Number(document.getElementById('precio').value);
    const descripcion = document.getElementById('descripcion').value;
    const imagen = document.getElementById('imagen').value;
    const categoria = document.getElementById('categoria') ? document.getElementById('categoria').value : 'Anillos';

    try {
      await productosRef.add({
        nombre,
        precio,
        descripcion,
        imagen,
        categoria,
        creado: firebase.firestore.FieldValue.serverTimestamp()
      });

      formProducto.reset();
      alert('¡Joya guardada exitosamente en la nube!');
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert('Hubo un error al intentar guardar el producto.');
    }
  });
}

// Función global para eliminar joyas directamente de Firestore
window.eliminarProducto = async function(id) {
  if (confirm('¿Estás seguro de que deseas eliminar esta joya del catálogo?')) {
    try {
      await productosRef.doc(id).delete();
      alert('Joya eliminada correctamente.');
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      alert('Hubo un error al intentar eliminar la joya.');
    }
  }
};
