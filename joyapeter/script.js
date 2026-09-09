const TELEFONO_WHATSAPP = "56944001454"; // Tu teléfono con código de país
let productos = [];
let categoriaActual = "todos";

document.addEventListener("DOMContentLoaded", () => {
  const guardados = localStorage.getItem("mis_joyas_catalogo");
  if (guardados) {
    productos = JSON.parse(guardados);
  } else {
    productos = [];
  }
  renderizarProductos(productos);
});

// Función para asegurar formato $ XXX.XXX / Kg
function formatearPrecioCLP(precio) {
  if (!precio) return "Consultar precio";
  let limpio = precio.toString().replace('$', '').replace('/ Kg', '').trim();
  return `$${limpio} / Kg`;
}

function renderizarProductos(lista) {
  const contenedor = document.getElementById("grid-productos");
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 20px;'>No hay joyas registradas en el catálogo.</p>";
    return;
  }

  lista.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const esAgotado = item.stock === "Agotado";
    const claseStock = esAgotado ? "stock-agotado" : "stock-disponible";
    const textoStock = esAgotado ? "Agotado" : "En Stock";

    card.innerHTML = `
  <div class="card-img-wrapper">
    <img src="${item.imagen}" alt="${item.nombre}">
  </div>
  <div class="card-info">
    <h3>${item.nombre}</h3>
    <p class="material">${item.material}</p>
    
    <div class="detalles-comerciales">
      <p class="precio-kg">${formatearPrecioCLP(item.precioKg)}</p>
      <span class="badge-stock ${claseStock}">${textoStock}</span>
    </div>

    <button class="btn-ver" onclick="abrirModal('${item.id}')">Ver Detalle</button>
  </div>
`;
    contenedor.appendChild(card);
  });
}

function abrirModal(id) {
  const joya = productos.find(p => p.id === id);
  if (!joya) return;

  const esAgotado = joya.stock === "Agotado";
  const textoPrecio = formatearPrecioCLP(joya.precioKg);

  document.getElementById("modal-img").src = joya.imagen;
  document.getElementById("modal-codigo").innerText = "CÓDIGO: " + joya.id;
  document.getElementById("modal-titulo").innerText = joya.nombre;
  document.getElementById("modal-material").innerText = joya.material;
  
  document.getElementById("modal-descripcion").innerHTML = `
    <p style="margin-bottom: 8px;"><b>Precio/Kg:</b> ${textoPrecio}</p>
    <p style="margin-bottom: 12px;"><b>Disponibilidad:</b> <span style="color:${esAgotado ? '#c62828' : '#2e7d32'}; font-weight:bold;">${esAgotado ? 'Agotado' : 'Disponible'}</span></p>
    <p style="color: #666; font-size: 0.85rem;">${joya.descripcion}</p>
  `;

  const mensaje = `Hola! Me interesa cotizar este producto de tu catálogo:\n\n` +
                  `*Producto:* ${joya.nombre}\n` +
                  `*Código:* ${joya.id}\n` +
                  `*Material:* ${joya.material}\n` +
                  `*Precio/Kg:* ${textoPrecio}\n` +
                  `*Estado:* ${esAgotado ? 'Agotado' : 'Disponible'}`;

  const linkWhatsapp = `https://api.whatsapp.com/send?phone=${TELEFONO_WHATSAPP}&text=${encodeURIComponent(mensaje)}`;
  document.getElementById("btn-whatsapp").onclick = () => window.open(linkWhatsapp, "_blank");

  document.getElementById("modal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) cerrarModal();
}

function filtrarCategoria(cat, elemento) {
  categoriaActual = cat;
  document.querySelectorAll(".btn-filtro").forEach(b => b.classList.remove("activo"));
  elemento.classList.add("activo");
  filtrarProductos();
}

function filtrarProductos() {
  const textoBusqueda = document.getElementById("buscador").value.toLowerCase();
  const resultados = productos.filter(joya => {
    const coincideCategoria = (categoriaActual === "todos") || (joya.categoria === categoriaActual);
    const coincideTexto = joya.nombre.toLowerCase().includes(textoBusqueda) || 
                           joya.material.toLowerCase().includes(textoBusqueda) ||
                           joya.id.toLowerCase().includes(textoBusqueda);
    return coincideCategoria && coincideTexto;
  });
  renderizarProductos(resultados);
}