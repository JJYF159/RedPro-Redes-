// buscador.js
document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('input-busqueda');
    const contenedorResultados = document.getElementById('resultados-busqueda');
    const contadorCarrito = document.getElementById('carrito-contador');
    let cursosData = [];

    fetch('/cursos')
        .then(res => res.json())
        .then(data => cursosData = data);

    if (inputBusqueda && contenedorResultados) {
        inputBusqueda.addEventListener('input', () => {
            const texto = inputBusqueda.value.toLowerCase();
            contenedorResultados.innerHTML = '';
            if (texto === '') {
                contenedorResultados.style.display = 'none';
                return;
            }

            let encontrados = 0;
            cursosData.forEach(curso => {
                if (curso.Titulo.toLowerCase().includes(texto)) {
                    const item = document.createElement('div');
                    item.className = 'resultado-item';
                    item.innerHTML = `
                        <strong>${curso.Titulo}</strong><br>
                        <small>${curso.Autor}</small><br>
                        <span>S/ ${curso.Precio}</span>
                    `;
                    item.addEventListener('click', () => {
                        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                        if (!carrito.some(c => c.id === curso.ID)) {
                            carrito.push({
                                id: curso.ID,
                                nombre: curso.Titulo,
                                precio: curso.Precio
                            });
                            localStorage.setItem('carrito', JSON.stringify(carrito));
                        }
                        if (contadorCarrito) contadorCarrito.textContent = carrito.length;
                        inputBusqueda.value = '';
                        contenedorResultados.style.display = 'none';
                        alert(`"${curso.Titulo}" añadido al carrito.`);
                    });
                    contenedorResultados.appendChild(item);
                    encontrados++;
                }
            });

            if (encontrados === 0) {
                contenedorResultados.innerHTML = `<div id="mensaje-no-resultados">No se encontraron resultados</div>`;
            }

            contenedorResultados.style.display = 'block';
        });
    }
});
