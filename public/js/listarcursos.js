// listarCursos.js
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('cursos-container');
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path === '/';

    if (contenedor) {
        const url = isIndex ? '/cursos?limit=4' : '/cursos';

        fetch(url)
            .then(res => res.json())
            .then(data => {
                contenedor.innerHTML = '';
                data.forEach(curso => {
                    const div = document.createElement('div');
                    div.className = 'curso-card';
                    div.innerHTML = `
                        <img src="${curso.Imagen}" alt="${curso.Titulo}">
                        <h3>${curso.Titulo}</h3>
                        <p>${curso.Autor}</p>
                        <p class="rating">⭐ 4.5</p>
                        <p class="precio"><strong>S/${curso.Precio}</strong> <del>S/${curso.Descuento}</del></p>
                        <div class="Botones">
                            <button class="btn-carrito" 
                                data-id="${curso.ID}" 
                                data-nombre="${curso.Titulo}" 
                                data-precio="${curso.Precio}">Añadir al carrito</button>
                        </div>
                    `;
                    contenedor.appendChild(div);
                });
            })
            .catch(err => console.error("❌ Error al cargar cursos:", err));
    }
});
