/**
 * CURSO-PREVIEW.JS - Vista previa de cursos estilo Udemy
 * 
 * Secciones:
 * - Inicialización y creación del modal
 * - Configuración de datos del curso
 * - Gestión de eventos
 * - Funciones auxiliares
 */

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('curso-preview-modal')) {
        const modalHTML = `
        <div class="modal fade" id="curso-preview-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-body p-0">
                        <button type="button" class="btn-close curso-preview-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        <div class="curso-preview-container">
                            <div class="curso-preview-hero">
                                <img src="" alt="" class="curso-preview-img">
                                <div class="curso-preview-overlay">
                                    <div class="curso-preview-play">
                                        <i class="fas fa-play-circle"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="curso-preview-content row">
                                <div class="col-md-8">
                                    <h2 class="curso-preview-title"></h2>
                                    <div class="curso-preview-meta">
                                        <div class="curso-preview-rating">
                                            <span class="stars-container"></span>
                                            <span class="rating-value"></span>
                                            <span class="rating-count"></span>
                                        </div>
                                        <div class="curso-preview-students">
                                            <i class="fas fa-users"></i> <span class="students-count"></span> estudiantes
                                        </div>
                                    </div>
                                    
                                    <div class="curso-preview-instructor">
                                        <p><strong>Creado por:</strong> <span class="instructor-name"></span></p>
                                    </div>
                                    
                                    <div class="curso-preview-details">
                                        <div class="curso-preview-detail">
                                            <i class="far fa-calendar-alt"></i> <span class="detail-label">Última actualización:</span> <span class="update-date"></span>
                                        </div>
                                        <div class="curso-preview-detail">
                                            <i class="fas fa-globe"></i> <span class="detail-label">Idioma:</span> <span class="course-language">Español</span>
                                        </div>
                                        <div class="curso-preview-detail">
                                            <i class="fas fa-closed-captioning"></i> <span class="detail-label">Subtítulos:</span> <span class="subtitles">Español</span>
                                        </div>
                                    </div>
                                    
                                    <div class="curso-preview-description"></div>
                                    
                                    <div class="curso-preview-what-will-learn">
                                        <h4>¿Qué aprenderás?</h4>
                                        <ul class="what-will-learn-list">
                                            <!-- Items dinámicos -->
                                        </ul>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="curso-preview-sidebar">
                                        <div class="curso-preview-price">
                                            <span class="current-price">S/ <span class="price-value"></span></span>
                                            <span class="old-price"></span>
                                        </div>
                                        
                                        <div class="curso-preview-actions">
                                            <button class="btn btn-primary btn-lg w-100 mb-3 btn-agregar-carrito">
                                                <i class="fas fa-cart-plus"></i> Agregar al carrito
                                            </button>
                                            <button class="btn btn-outline-primary btn-lg w-100 mb-3 btn-comprar-ahora">
                                                <i class="fas fa-bolt"></i> Comprar ahora
                                            </button>
                                        </div>
                                        
                                        <div class="curso-preview-info">
                                            <h5>Este curso incluye:</h5>
                                            <ul>
                                                <li><i class="fas fa-video"></i> <span class="hours-video">30 horas</span> de vídeo bajo demanda</li>
                                                <li><i class="fas fa-file-alt"></i> <span class="resources-count">15</span> recursos descargables</li>
                                                <li><i class="fas fa-tasks"></i> <span class="exercises-count">40</span> ejercicios prácticos</li>
                                                <li><i class="fas fa-certificate"></i> Certificado de finalización</li>
                                                <li><i class="fas fa-infinity"></i> Acceso de por vida</li>
                                                <li><i class="fas fa-mobile-alt"></i> Acceso en dispositivos móviles</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Configurar los eventos para los botones de vista previa de cursos
    configurarEventosCursoPreview();
});

function configurarEventosCursoPreview() {
    // Buscar todos los contenedores de cursos en la página
    const cursosContainer = document.getElementById('cursos-container');
    
    if (cursosContainer) {
        // Usar delegación de eventos para manejar clics en tarjetas de cursos
        cursosContainer.addEventListener('click', function(event) {
            // Verificar si el clic fue en una tarjeta de curso (o su imagen o título)
            const cursoCard = event.target.closest('.modern-course-card') || event.target.closest('.curso-card');
            
            // Solo abrir preview si el clic NO fue en el botón de agregar al carrito
            if (cursoCard && !event.target.closest('.btn-carrito')) {
                event.preventDefault();
                
                // Extraer información del curso
                const titulo = cursoCard.querySelector('.course-title, h3').textContent;
                const autor = cursoCard.querySelector('.course-instructor, .instructor')?.textContent.trim() || 'Instructor RedPro';
                const precio = cursoCard.querySelector('.current-price, .precio strong')?.textContent.replace('S/', '').trim() || '299.99';
                const precioAntiguo = cursoCard.querySelector('.old-price, del')?.textContent.replace('S/', '').trim() || '';
                
                // Obtener la ruta de imagen
                let imagen = '';
                const imgEl = cursoCard.querySelector('img');
                if (imgEl) {
                    imagen = imgEl.src;
                }
                
                // Estudiantes y valoraciones (usar valores por defecto o extraer)
                const estudiantes = cursoCard.querySelector('.students, .feature')?.textContent.trim() || '250+ estudiantes';
                const valoracion = 4.8; // Valor por defecto

                // Mostrar el preview con los datos obtenidos directamente (sin mensajes de desarrollo)
                abrirCursoPreview({
                    titulo,
                    autor,
                    precio,
                    precioAntiguo,
                    imagen,
                    estudiantes,
                    valoracion,
                    duracion: '40 horas',
                    descripcion: `<p>Este curso de <strong>${titulo}</strong> te brinda todas las herramientas y conocimientos necesarios para dominar esta tecnología desde cero hasta un nivel avanzado. Aprenderás a través de ejercicios prácticos, casos reales y proyectos que podrás aplicar inmediatamente en tu trabajo o estudios.</p>
                    <p>Ideal tanto para principiantes como para profesionales que desean actualizar sus habilidades en el área de redes y ciberseguridad.</p>`,
                    aprendizajes: [
                        'Dominar los conceptos fundamentales y avanzados',
                        'Implementar soluciones en entornos reales',
                        'Prepararte para certificaciones oficiales',
                        'Resolver problemas comunes en el ámbito profesional',
                        'Desarrollar proyectos prácticos de principio a fin'
                    ],
                    fechaActualizacion: 'Noviembre 2023'
                });
            }
        });
    }
    
    // Configurar eventos para los botones dentro del modal
    const modal = document.getElementById('curso-preview-modal');
    if (modal) {
        // Botón Agregar al carrito
        const btnAgregar = modal.querySelector('.btn-agregar-carrito');
        if (btnAgregar) {
            btnAgregar.addEventListener('click', function() {
                const titulo = modal.querySelector('.curso-preview-title').textContent;
                const precio = modal.querySelector('.price-value').textContent;
                
                // Agregar al carrito usando el mismo formato que el sitio
                agregarCursoAlCarrito({
                    id: 'preview-' + Date.now(), // ID temporal
                    nombre: titulo,
                    precio: parseFloat(precio)
                });
                
                // Mostrar notificación más suave en lugar de alert
                mostrarNotificacion(`${titulo} agregado al carrito`);
                
                // Cerrar el modal
                cerrarModal();
            });
        }
        
        // Botón Comprar ahora
        const btnComprar = modal.querySelector('.btn-comprar-ahora');
        if (btnComprar) {
            btnComprar.addEventListener('click', function() {
                const titulo = modal.querySelector('.curso-preview-title').textContent;
                const precio = modal.querySelector('.price-value').textContent;
                
                // Agregar al carrito y redirigir a la página de pago
                agregarCursoAlCarrito({
                    id: 'preview-' + Date.now(), // ID temporal
                    nombre: titulo,
                    precio: parseFloat(precio)
                });
                
                // Redirigir a pago
                window.location.href = 'Pago.html';
            });
        }
    }
}

function agregarCursoAlCarrito(curso) {
    // Asegurarse de que el objeto curso tenga los campos requeridos
    const cursoValidado = {
        id: curso.id || `curso-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: curso.nombre || 'Curso',
        precio: parseFloat(curso.precio) || 0,
        cantidad: 1
    };
    
    // Usar CarritoManager si está disponible
    if (window.CarritoManager) {
        window.CarritoManager.agregarItem(cursoValidado);
    } 
    // Fallback al método tradicional si CarritoManager no está disponible
    else {
        // Obtener carrito actual
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar si el curso ya existe en el carrito por ID, no por nombre
        const existingItemIndex = carrito.findIndex(item => item.id === cursoValidado.id);
        
        if (existingItemIndex >= 0) {
            // Si ya existe, incrementar cantidad
            carrito[existingItemIndex].cantidad = (parseInt(carrito[existingItemIndex].cantidad) || 1) + 1;
        } else {
            // Si no existe, agregarlo con cantidad 1
            carrito.push(cursoValidado);
        }
        
        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar sidebar si existe la función
        if (typeof renderSidebarCarrito === 'function') {
            renderSidebarCarrito();
        }
    }
    
    // Actualizar contador usando la función global si existe
    if (typeof actualizarContadorCarrito === 'function') {
        actualizarContadorCarrito();
    } else {
        // Actualización manual del contador
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            const totalItems = window.CarritoManager 
                ? window.CarritoManager.obtenerCantidadTotal()
                : (JSON.parse(localStorage.getItem('carrito')) || []).reduce((total, item) => total + (parseInt(item.cantidad) || 1), 0);
            contador.textContent = totalItems;
        }
    }
}

function abrirCursoPreview(curso) {
    const modal = document.getElementById('curso-preview-modal');
    if (!modal) return;
    
    // Llenar datos en el modal
    modal.querySelector('.curso-preview-title').textContent = curso.titulo;
    modal.querySelector('.curso-preview-img').src = curso.imagen;
    modal.querySelector('.curso-preview-img').alt = curso.titulo;
    modal.querySelector('.instructor-name').textContent = curso.autor;
    modal.querySelector('.price-value').textContent = curso.precio;
    modal.querySelector('.update-date').textContent = curso.fechaActualizacion;
    
    // Descripción HTML
    modal.querySelector('.curso-preview-description').innerHTML = curso.descripcion;
    
    // Precio antiguo (si existe)
    const oldPriceElement = modal.querySelector('.old-price');
    if (curso.precioAntiguo && curso.precioAntiguo.trim() !== '') {
        oldPriceElement.textContent = `S/ ${curso.precioAntiguo}`;
        oldPriceElement.style.display = 'inline-block';
    } else {
        oldPriceElement.style.display = 'none';
    }
    
    // Estudiantes
    modal.querySelector('.students-count').textContent = curso.estudiantes.replace('+', '').replace(' estudiantes', '');
    
    // Valoración
    const starsContainer = modal.querySelector('.stars-container');
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const starIcon = document.createElement('i');
        starIcon.className = i <= curso.valoracion ? 'fas fa-star' : 'far fa-star';
        starsContainer.appendChild(starIcon);
    }
    modal.querySelector('.rating-value').textContent = curso.valoracion;
    modal.querySelector('.rating-count').textContent = `(${Math.floor(Math.random() * 500) + 100} valoraciones)`;
    
    // Lo que aprenderás
    const aprendizajesList = modal.querySelector('.what-will-learn-list');
    aprendizajesList.innerHTML = '';
    curso.aprendizajes.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check"></i> ${item}`;
        aprendizajesList.appendChild(li);
    });
    
    // Añadir clase para evitar mensajes de desarrollo
    modal.classList.add('production-mode');
    
    // Abrir modal usando Bootstrap (sin mostrar diálogos de confirmación)
    try {
        // Inicializar directamente sin alertas
        const modalInstance = new bootstrap.Modal(modal, {
            backdrop: 'static', // Prevenir cierre al hacer clic fuera
            keyboard: true,     // Permitir cerrar con ESC
            focus: true         // Enfocar el modal al abrir
        });
        
        // Mostrar el modal
        modalInstance.show();
        
        // Almacenar referencia al modal para cerrarlo después
        window.cursoPreviewModalInstance = modalInstance;
    } catch (error) {
        console.error('Error al abrir vista previa:', error);
    }
}

function cerrarModal() {
    if (window.cursoPreviewModalInstance) {
        window.cursoPreviewModalInstance.hide();
    }
}

// Función para mostrar notificaciones elegantes en lugar de alertas
function mostrarNotificacion(mensaje) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'curso-notificacion';
    notificacion.innerHTML = `
        <div class="curso-notificacion-contenido">
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    // Estilos inline para la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #00B8C4;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        max-width: 350px;
    `;
    
    // Estilos para el contenido
    const contenido = notificacion.querySelector('.curso-notificacion-contenido');
    contenido.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    // Estilo para el icono
    const icono = notificacion.querySelector('i');
    icono.style.cssText = `
        font-size: 22px;
    `;
    
    // Añadir al DOM
    document.body.appendChild(notificacion);
    
    // Forzar reflow para que la transición funcione
    void notificacion.offsetWidth;
    
    // Mostrar con animación
    notificacion.style.opacity = '1';
    notificacion.style.transform = 'translateY(0)';
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateY(-20px)';
        
        // Eliminar del DOM después de la transición
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}
