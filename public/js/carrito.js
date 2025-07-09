// carritoManager.js
document.addEventListener('DOMContentLoaded', () => {
    const contadorCarrito = document.getElementById('carrito-contador');
    const lista = document.getElementById('lista-carrito');
    const btnLimpiar = document.getElementById('btn-limpiar-carrito');
    const contenedor = document.getElementById('cursos-container');
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Actualizar contador
    function actualizarContador() {
        if (contadorCarrito) contadorCarrito.textContent = carrito.length;
    }

    actualizarContador();

    // Delegar clicks en "Añadir al carrito"
    if (contenedor) {
        contenedor.addEventListener('click', (e) => {
            const boton = e.target.closest('.btn-carrito');
            if (!boton) return;

            const { id, nombre, precio } = boton.dataset;
            if (!carrito.some(c => c.id === id)) {
                carrito.push({ id, nombre, precio });
                localStorage.setItem('carrito', JSON.stringify(carrito));
                actualizarContador();
            }
        });
    }

    // Mostrar carrito en página de pago
    if (lista) {
        if (carrito.length === 0) {
            lista.innerHTML = '<p>No hay cursos en tu carrito.</p>';
        } else {
            let total = 0;
            const ul = document.createElement('ul');
            ul.className = 'list-group';

            carrito.forEach(({ nombre, precio }) => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `<span>${nombre}</span><span>S/ ${precio}</span>`;
                ul.appendChild(li);
                total += parseFloat(precio);
            });

            const totalDiv = document.createElement('div');
            totalDiv.className = 'mt-3 text-end fw-bold';
            totalDiv.textContent = `Total: S/ ${total.toFixed(2)}`;

            lista.appendChild(ul);
            lista.appendChild(totalDiv);
        }
    }

    // Botón para limpiar carrito
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            localStorage.removeItem('carrito');
            location.reload();
        });
    }
});
