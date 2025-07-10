/**
 * CURSOS-MODERN.JS - Funcionalidades modernas para la página de cursos
 * 
 * Secciones:
 * - Configuración inicial y elementos DOM
 * - Gestión de filtros
 * - Cambio de vista (grid/list)
 * - Carga y renderizado de cursos
 * - Funciones auxiliares
 * - Búsqueda y animaciones
 * - Estilos dinámicos
 */

// =====================================================
// CONFIGURACIÓN INICIAL
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    const filterCategoria = document.getElementById('filter-categoria');
    const filterNivel = document.getElementById('filter-nivel');
    const filterPrecio = document.getElementById('filter-precio');
    const resetButton = document.getElementById('reset-filters');
    const coursesCount = document.getElementById('courses-count');
    const viewButtons = document.querySelectorAll('.view-btn');
    const cursosContainer = document.getElementById('cursos-container');
    
    let allCursos = [];
    let filteredCursos = [];
    
    initializeFilters();
    initializeViewToggle();
    loadCourses();

// =====================================================
// GESTIÓN DE FILTROS
// =====================================================
    
    function initializeFilters() {
        if (filterCategoria) {
            filterCategoria.addEventListener('change', applyFilters);
        }
        if (filterNivel) {
            filterNivel.addEventListener('change', applyFilters);
        }
        if (filterPrecio) {
            filterPrecio.addEventListener('change', applyFilters);
        }
        if (resetButton) {
            resetButton.addEventListener('click', resetFilters);
        }
    }

    function applyFilters() {
        const categoria = filterCategoria ? filterCategoria.value : '';
        const nivel = filterNivel ? filterNivel.value : '';
        const precio = filterPrecio ? filterPrecio.value : '';
        
        console.log('Aplicando filtros:', { categoria, nivel, precio });
        
        filteredCursos = allCursos.filter(curso => {
            let matchCategoria = true;
            let matchNivel = true;
            let matchPrecio = true;
            
            if (categoria) {
                matchCategoria = curso.Categoria && curso.Categoria.toLowerCase() === categoria.toLowerCase();
            }
            
            if (nivel) {
                const tituloLower = curso.Titulo.toLowerCase();
                switch(nivel) {
                    case 'principiante':
                        matchNivel = tituloLower.includes('básico') || tituloLower.includes('introducción') || tituloLower.includes('fundamentos');
                        break;
                    case 'intermedio':
                        matchNivel = tituloLower.includes('intermedio') || tituloLower.includes('avanzado') || tituloLower.includes('ccna');
                        break;
                    case 'avanzado':
                        matchNivel = tituloLower.includes('profesional') || tituloLower.includes('expert') || tituloLower.includes('ccnp');
                        break;
                    default:
                        matchNivel = true;
                }
            }
            
            if (precio) {
                const precioNum = parseFloat(curso.Precio);
                switch(precio) {
                    case 'gratis':
                        matchPrecio = precioNum === 0;
                        break;
                    case '0-50':
                        matchPrecio = precioNum > 0 && precioNum <= 50;
                        break;
                    case '50-100':
                        matchPrecio = precioNum > 50 && precioNum <= 100;
                        break;
                    case '100+':
                        matchPrecio = precioNum > 100;
                        break;
                    default:
                        matchPrecio = true;
                }
            }
            
            return matchCategoria && matchNivel && matchPrecio;
        });
        
        renderCourses(filteredCursos);
        updateCoursesCount();
        showFilterFeedback();
    }
    
    function resetFilters() {
        if (filterCategoria) filterCategoria.value = '';
        if (filterNivel) filterNivel.value = '';
        if (filterPrecio) filterPrecio.value = '';
        
        filteredCursos = allCursos;
        renderCourses(filteredCursos);
        updateCoursesCount();
        
        const notification = document.createElement('div');
        notification.className = 'filter-notification';
        notification.innerHTML = '<i class="fas fa-check"></i> Filtros restablecidos';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

// =====================================================
// CAMBIO DE VISTA
// =====================================================
    
    function initializeViewToggle() {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                viewButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const view = this.dataset.view;
                toggleView(view);
            });
        });
    }
    
    function toggleView(view) {
        if (!cursosContainer) return;
        
        if (view === 'list') {
            cursosContainer.classList.remove('modern-grid');
            cursosContainer.classList.add('list-view');
        } else {
            cursosContainer.classList.add('modern-grid');
            cursosContainer.classList.remove('list-view');
        }
    }

// =====================================================
// CARGA Y RENDERIZADO DE CURSOS
// =====================================================
    
    
    function loadCourses() {
        if (!cursosContainer) return;
        fetch('/cursos')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('Cursos cargados:', data.length);
                allCursos = data;
                filteredCursos = data;
                renderCourses(filteredCursos);
                updateCoursesCount();
            })
            .catch(err => {
                console.error('Error al cargar cursos:', err);
                cursosContainer.innerHTML = `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Error al cargar cursos</h3>
                        <p>No se pudieron cargar los cursos. Por favor, intenta recargar la página.</p>
                        <button onclick="location.reload()" class="btn btn-primary">
                            <i class="fas fa-refresh"></i> Recargar
                        </button>
                    </div>
                `;
            });
    }
    
    // Renderizar cursos
    function renderCourses(cursos) {
        if (!cursosContainer) return;
        
        cursosContainer.innerHTML = '';
        
        if (cursos.length === 0) {
            cursosContainer.innerHTML = `
                <div class="no-courses">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron cursos</h3>
                    <p>Intenta ajustar los filtros para ver más resultados.</p>
                    <button onclick="resetFilters()" class="btn btn-outline-primary">
                        <i class="fas fa-refresh"></i> Limpiar filtros
                    </button>
                </div>
            `;
            return;
        }
        
        cursos.forEach((curso, index) => {
            const div = document.createElement('div');
            div.className = 'curso-card';
            div.style.animationDelay = `${index * 0.1}s`;
            div.classList.add('fade-in');
            
            div.innerHTML = `
                <div class="course-image-container">
                    <img src="${curso.Imagen}" alt="${curso.Titulo}" loading="lazy">
                    <div class="course-overlay">
                        <div class="course-rating">
                            <i class="fas fa-star"></i>
                            <span>4.8</span>
                        </div>
                    </div>
                </div>
                <div class="course-info">
                    <div class="course-category">
                        <span class="badge bg-primary">${curso.Categoria || 'Redes'}</span>
                    </div>
                    <h3>${curso.Titulo}</h3>
                    <p class="instructor">
                        <i class="fas fa-user-tie"></i>
                        ${curso.Autor}
                    </p>
                    <div class="course-meta">
                        <span class="duration">
                            <i class="fas fa-clock"></i>
                            ${curso.Duracion || '40h'}
                        </span>
                        <span class="students">
                            <i class="fas fa-users"></i>
                            ${curso.Estudiantes || '250+'} estudiantes
                        </span>
                    </div>
                    <p class="precio">
                        <strong>S/ ${curso.Precio}</strong> 
                        ${curso.Descuento ? `<del>S/ ${curso.Descuento}</del>` : ''}
                    </p>
                    <div class="Botones">
                        <button class="btn-carrito" 
                            data-id="${curso.ID}" 
                            data-nombre="${curso.Titulo}" 
                            data-precio="${curso.Precio}">
                            <i class="fas fa-cart-plus"></i>
                            Añadir al carrito
                        </button>
                        <button class="btn-preview" onclick="previewCourse('${curso.ID}')">
                            <i class="fas fa-play"></i>
                            Vista previa
                        </button>
                    </div>
                </div>
            `;
            
            cursosContainer.appendChild(div);
        });
        
        // Reinicializar eventos del carrito después de renderizar
        if (window.initializeCartButtons) {
            window.initializeCartButtons();
        }
    }
    
    // Cargar contador de cursos
    function loadCoursesCount() {
        // Esta función ya no es necesaria, se maneja en loadCourses()
    }
    
    // Actualizar contador de cursos
    function updateCoursesCount() {
        if (!coursesCount) return;
        
        const count = filteredCursos.length;
        const total = allCursos.length;
        
        if (count === total) {
            coursesCount.textContent = `Mostrando ${count} curso${count !== 1 ? 's' : ''}`;
        } else {
            coursesCount.textContent = `Mostrando ${count} de ${total} curso${total !== 1 ? 's' : ''}`;
        }
    }
    
    // Mostrar feedback de filtros
    function showFilterFeedback() {
        const activeFilters = [];
        
        if (filterCategoria && filterCategoria.value) {
            activeFilters.push(`Categoría: ${filterCategoria.options[filterCategoria.selectedIndex].text}`);
        }
        if (filterNivel && filterNivel.value) {
            activeFilters.push(`Nivel: ${filterNivel.options[filterNivel.selectedIndex].text}`);
        }
        if (filterPrecio && filterPrecio.value) {
            activeFilters.push(`Precio: ${filterPrecio.options[filterPrecio.selectedIndex].text}`);
        }
        
        if (activeFilters.length > 0) {
            console.log('Filtros activos:', activeFilters.join(', '));
        }
    }
    
    // Funciones globales para usar desde HTML
    window.resetFilters = resetFilters;
    window.previewCourse = function(courseId) {
        console.log('Vista previa del curso:', courseId);
        // Aquí puedes implementar la funcionalidad de vista previa
        alert('Función de vista previa en desarrollo');
    };
    
    // Función para búsqueda de texto
    window.searchCourses = function(searchTerm) {
        if (!searchTerm) {
            filteredCursos = allCursos;
        } else {
            filteredCursos = allCursos.filter(curso => 
                curso.Titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                curso.Autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (curso.Categoria && curso.Categoria.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        renderCourses(filteredCursos);
        updateCoursesCount();
    };
    
    // Animaciones y efectos
    function addCourseCardAnimations() {
        const cards = document.querySelectorAll('.curso-card');
        
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    }
    
    // Observador para cargar cursos cuando aparezcan
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                addCourseCardAnimations();
            }
        });
    });
    
    if (cursosContainer) {
        observer.observe(cursosContainer, { childList: true });
    }
});

// Agregar estilos dinámicos
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    .loading-spinner {
        text-align: center;
        padding: 50px;
        color: #00B8C4;
        font-size: 18px;
        grid-column: 1 / -1;
    }
    
    .loading-spinner::before {
        content: "";
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #00B8C4;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 10px;
        vertical-align: middle;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .no-courses, .error-message {
        text-align: center;
        padding: 50px 20px;
        color: #666;
        grid-column: 1 / -1;
        background: #f8f9fa;
        border-radius: 15px;
        border: 1px solid #dee2e6;
        margin: 20px 0;
    }
    
    .error-message i, .no-courses i {
        font-size: 48px;
        color: #dc3545;
        margin-bottom: 20px;
        display: block;
    }
    
    .error-message h3, .no-courses h3 {
        color: #495057;
        margin-bottom: 15px;
    }
    
    .error-message p, .no-courses p {
        margin-bottom: 25px;
    }
    
    .filter-notification {
        animation: slideIn 0.3s ease;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .fade-in {
        animation: fadeInUp 0.6s ease forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .list-view {
        display: flex !important;
        flex-direction: column;
        gap: 20px;
    }
    
    .list-view .curso-card {
        display: flex;
        align-items: center;
        max-width: none;
    }
    
    .list-view .course-image-container {
        flex: 0 0 200px;
        height: 120px;
    }
    
    .list-view .course-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .curso-card .btn-preview {
        background: transparent;
        border: 2px solid #00B8C4;
        color: #00B8C4;
        padding: 8px 16px;
        border-radius: 5px;
        margin-left: 10px;
        transition: all 0.3s ease;
    }
    
    .curso-card .btn-preview:hover {
        background: #00B8C4;
        color: white;
    }
    
    .course-category {
        margin-bottom: 10px;
    }
    
    .course-category .badge {
        font-size: 12px;
        padding: 4px 8px;
    }
`;
document.head.appendChild(styleSheet);
