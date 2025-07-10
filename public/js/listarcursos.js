// listarCursos.js
document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('cursos-container');
    const path = window.location.pathname;
    const isIndex = path.endsWith('index.html') || path === '/' || path === '' || path.endsWith('/');

    if (contenedor) {
        const url = isIndex ? '/cursos?limit=4' : '/cursos';
        
        // Mostrar indicador de carga
        contenedor.innerHTML = '<div class="loading-spinner">Cargando cursos...</div>';

        fetch(url)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                contenedor.innerHTML = '';
                
                if (data.length === 0) {
                    contenedor.innerHTML = '<div class="no-courses">No se encontraron cursos disponibles.</div>';
                    return;
                }
                
                data.forEach((curso, index) => {
                    // Generar ID único para evitar duplicados de la BD
                    const idUnico = curso.ID || `curso-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    
                    const div = document.createElement('div');
                    
                    if (isIndex) {
                        // Para index.html - cards modernas con Bootstrap
                        div.className = 'col-lg-3 col-md-6 mb-4';
                        div.innerHTML = `
                            <div class="course-card modern-course-card">
                                <div class="course-image">
                                    <img src="${curso.Imagen}" alt="${curso.Titulo}" class="img-fluid">
                                    <div class="course-overlay">
                                        <div class="course-rating">
                                            <i class="fas fa-star"></i>
                                            <span>4.8</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="course-content">
                                    <div class="course-category">
                                        <span class="badge bg-primary">${curso.Categoria || 'Redes'}</span>
                                    </div>
                                    <h4 class="course-title">${curso.Titulo}</h4>
                                    <p class="course-instructor">
                                        <i class="fas fa-user-tie"></i>
                                        ${curso.Autor}
                                    </p>
                                    <div class="course-features">
                                        <span class="feature">
                                            <i class="fas fa-clock"></i>
                                            ${curso.Duracion || '40h'}
                                        </span>
                                        <span class="feature">
                                            <i class="fas fa-users"></i>
                                            ${curso.Estudiantes || '250+'} estudiantes
                                        </span>
                                    </div>
                                    <div class="course-footer">
                                        <div class="course-price">
                                            <span class="current-price">S/ ${curso.Precio}</span>
                                            ${curso.Descuento ? `<span class="old-price">S/ ${curso.Descuento}</span>` : ''}
                                        </div>
                                        <button class="btn-carrito btn btn-primary" 
                                            data-id="${idUnico}" 
                                            data-nombre="${curso.Titulo}" 
                                            data-precio="${curso.Precio}">
                                            <i class="fas fa-cart-plus"></i>
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        // Para Cursos.html - mantener el diseño existente pero mejorado
                        div.className = 'curso-card';
                        div.innerHTML = `
                            <div class="course-image-container">
                                <img src="${curso.Imagen}" alt="${curso.Titulo}">
                                <div class="course-overlay">
                                    <div class="course-rating">
                                        <i class="fas fa-star"></i>
                                        <span>4.8</span>
                                    </div>
                                </div>
                            </div>
                            <div class="course-info">
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
                                        ${curso.Estudiantes || '250+'}
                                    </span>
                                </div>
                                <p class="precio">
                                    <strong>S/ ${curso.Precio}</strong> 
                                    ${curso.Descuento ? `<del>S/ ${curso.Descuento}</del>` : ''}
                                </p>
                                <div class="Botones">
                                    <button class="btn-carrito" 
                                        data-id="${idUnico}" 
                                        data-nombre="${curso.Titulo}" 
                                        data-precio="${curso.Precio}">
                                        <i class="fas fa-cart-plus"></i>
                                        Añadir al carrito
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                    contenedor.appendChild(div);
                });

                // Agregar event listeners para los botones de carrito después de crear los elementos
                const botonesCarrito = contenedor.querySelectorAll('.btn-carrito');
                console.log(`🔧 Configurando ${botonesCarrito.length} botones de carrito...`);
                
                botonesCarrito.forEach((boton, index) => {
                    console.log(`🔧 Configurando botón ${index}:`, {
                        elemento: boton,
                        atributos: {
                            'data-id': boton.getAttribute('data-id'),
                            'data-nombre': boton.getAttribute('data-nombre'),
                            'data-precio': boton.getAttribute('data-precio')
                        }
                    });
                    
                    // Obtener los datos directamente del DOM al momento del click (evita problemas de closure)
                    boton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('🎯 CLICK EN BOTÓN - Elemento clickeado:', this);
                        console.log('🎯 Atributos en el momento del click:', {
                            'data-id': this.getAttribute('data-id'),
                            'data-nombre': this.getAttribute('data-nombre'),
                            'data-precio': this.getAttribute('data-precio')
                        });
                        
                        // Obtener datos del atributo data- del botón al momento del click
                        const clickId = this.getAttribute('data-id');
                        const clickNombre = this.getAttribute('data-nombre');
                        const clickPrecio = parseFloat(this.getAttribute('data-precio')) || 0;
                        
                        console.log('🛒 DATOS EXTRAÍDOS:', { 
                            clickId, 
                            clickNombre, 
                            clickPrecio,
                            tipoDatos: {
                                id: typeof clickId,
                                nombre: typeof clickNombre,
                                precio: typeof clickPrecio
                            }
                        });
                        
                        // Validar que los datos sean correctos
                        if (!clickId || !clickNombre || isNaN(clickPrecio)) {
                            console.error('❌ Datos del curso inválidos:', { clickId, clickNombre, clickPrecio });
                            alert('Error: Datos del curso inválidos');
                            return;
                        }
                        
                        console.log('✅ Datos validados correctamente, procediendo a agregar al carrito');
                        
                        // Usar la misma función que funciona en curso-preview.js
                        agregarCursoAlCarrito({
                            id: clickId,
                            nombre: clickNombre,
                            precio: clickPrecio
                        });
                    });
                });
            })
            .catch(err => {
                console.error("❌ Error al cargar cursos:", err);
                contenedor.innerHTML = `
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
    } else {
        console.error('❌ No se encontró el contenedor de cursos con ID: cursos-container');
        console.log('🔍 Contenedores disponibles:', document.querySelectorAll('[id*="curso"]'));
    }
});

// Función para agregar curso al carrito (copiada de curso-preview.js)
function agregarCursoAlCarrito(curso) {
    console.log('🛒 agregarCursoAlCarrito llamada con:', curso);
    
    // Asegurarse de que el objeto curso tenga los campos requeridos
    const cursoValidado = {
        id: curso.id || `curso-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        nombre: curso.nombre || 'Curso',
        precio: parseFloat(curso.precio) || 0,
        cantidad: 1
    };
    
    console.log('📝 Curso validado:', cursoValidado);
    
    // NUEVA LÓGICA: Verificar si el curso ya existe ANTES de intentar agregarlo
    let cursoYaExiste = false;
    
    if (window.CarritoManager) {
        const carritoActual = window.CarritoManager.obtenerCarrito();
        cursoYaExiste = carritoActual.some(item => item.id === cursoValidado.id);
    } else {
        const carritoLS = JSON.parse(localStorage.getItem('carrito')) || [];
        cursoYaExiste = carritoLS.some(item => item.id === cursoValidado.id);
    }
    
    console.log('🔍 LISTARCURSOS: ¿Curso ya existe en el carrito?', cursoYaExiste);
    
    if (cursoYaExiste) {
        console.log('⚠️ LISTARCURSOS: El curso ya está en el carrito, no se agregará nuevamente');
        
        // Mostrar notificación diferente
        if (typeof mostrarNotificacion === 'function') {
            mostrarNotificacion(`${cursoValidado.nombre} ya está en el carrito`);
        } else {
            console.log(`⚠️ ${cursoValidado.nombre} ya está en el carrito`);
        }
        return; // Salir sin agregar
    }
    
    // Si llegamos aquí, el curso NO existe, así que lo agregamos
    console.log('✅ LISTARCURSOS: Curso no existe, procediendo a agregar...');
    
    // Usar CarritoManager si está disponible
    if (window.CarritoManager) {
        console.log('✅ Usando CarritoManager para agregar el curso');
        
        // Agregar directamente sin verificar duplicados (ya lo hicimos arriba)
        const carritoActual = window.CarritoManager.obtenerCarrito();
        carritoActual.push(cursoValidado);
        
        // Guardar usando CarritoManager
        if (window.CarritoManager.guardarCarrito) {
            window.CarritoManager.guardarCarrito(carritoActual);
        } else {
            // Fallback: forzar guardado directo
            localStorage.setItem('carrito', JSON.stringify(carritoActual));
            // Disparar eventos manualmente
            if (window.CarritoManager.EVENTOS) {
                window.dispatchEvent(new CustomEvent(window.CarritoManager.EVENTOS.ACTUALIZADO, {
                    detail: { carrito: carritoActual }
                }));
            }
        }
    } 
    // Fallback al método tradicional si CarritoManager no está disponible
    else {
        console.log('⚠️ CarritoManager no disponible, usando método tradicional');
        // Obtener carrito actual
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Agregar directamente (ya verificamos que no existe)
        carrito.push(cursoValidado);
        console.log('🆕 Curso nuevo agregado al carrito');
        
        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar sidebar si existe la función
        if (typeof renderSidebarCarrito === 'function') {
            renderSidebarCarrito();
        }
    }
    
    // Mostrar notificación de éxito
    if (typeof mostrarNotificacion === 'function') {
        mostrarNotificacion(`${cursoValidado.nombre} agregado al carrito`);
    } else {
        console.log(`✅ ${cursoValidado.nombre} agregado al carrito`);
    }
    
    // Forzar actualización del sidebar
    if (typeof renderSidebarCarrito === 'function') {
        setTimeout(() => renderSidebarCarrito(), 100);
    }
}

// Función para mostrar notificaciones (copiada de curso-preview.js)
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

// Agregar estilos para mensajes de estado
const style = document.createElement('style');
style.textContent = `
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
    }
    
    .error-message {
        background: #f8f9fa;
        border-radius: 15px;
        border: 1px solid #dee2e6;
    }
    
    .error-message i {
        font-size: 48px;
        color: #dc3545;
        margin-bottom: 20px;
    }
    
    .error-message h3 {
        color: #495057;
        margin-bottom: 15px;
    }
    
    .error-message p {
        margin-bottom: 25px;
    }
`;
document.head.appendChild(style);

// Función global para testing desde la consola
window.testearCarritoDesdeCards = function() {
    console.log('🧪 INICIANDO PRUEBA DEL CARRITO DESDE CARDS...');
    
    // Limpiar carrito primero
    if (window.limpiarCarritoCompleto) {
        window.limpiarCarritoCompleto();
    }
    
    console.log('🔍 Buscando botones de carrito en las cards...');
    const botones = document.querySelectorAll('.btn-carrito');
    console.log(`📊 Encontrados ${botones.length} botones de carrito`);
    
    if (botones.length > 0) {
        const primerBoton = botones[0];
        console.log('🎯 Datos del primer botón:', {
            'data-id': primerBoton.getAttribute('data-id'),
            'data-nombre': primerBoton.getAttribute('data-nombre'),
            'data-precio': primerBoton.getAttribute('data-precio')
        });
        
        console.log('🖱️ Simulando click en el primer botón...');
        primerBoton.click();
        
        // Verificar después de 1 segundo
        setTimeout(() => {
            if (window.CarritoManager) {
                const carrito = window.CarritoManager.obtenerCarrito();
                console.log('📋 Estado del carrito después del click:', carrito);
                
                if (carrito.length > 0) {
                    console.log('✅ ¡PRUEBA EXITOSA! El curso se agregó correctamente');
                    console.log('📝 Producto agregado:', carrito[0]);
                } else {
                    console.log('❌ PRUEBA FALLIDA: El carrito sigue vacío');
                }
            }
            
            // Abrir sidebar para ver visualmente
            if (window.toggleSidebar) {
                window.toggleSidebar();
            }
        }, 1000);
    } else {
        console.log('❌ No se encontraron botones de carrito en la página actual');
    }
}

// Función de debugging específica para index.html
window.debugIndexCursos = function() {
    console.log('🔍 DEBUGGING INDEX.HTML CURSOS...');
    console.log('Path actual:', window.location.pathname);
    console.log('Es index?:', window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.endsWith('/'));
    console.log('Contenedor cursos-container:', document.getElementById('cursos-container'));
    console.log('Contenido actual del contenedor:', document.getElementById('cursos-container')?.innerHTML);
    
    // Forzar carga de cursos
    const contenedor = document.getElementById('cursos-container');
    if (contenedor) {
        console.log('🔄 Forzando carga de cursos...');
        contenedor.innerHTML = '<div class="loading-spinner">Forzando carga...</div>';
        
        fetch('/cursos?limit=4')
            .then(res => res.json())
            .then(data => {
                console.log('📊 Datos recibidos:', data);
                console.log('📊 Cantidad de cursos:', data.length);
            })
            .catch(err => console.error('❌ Error:', err));
    }
};

// Función para limpiar completamente y probar la corrección de IDs
window.probarCorreccionIDs = function() {
    console.log('🧪 PROBANDO CORRECCIÓN DE IDs DE CURSOS...');
    
    // 1. Limpiar carrito completamente
    console.log('🧹 Limpiando carrito...');
    localStorage.removeItem('carrito');
    localStorage.setItem('carrito', '[]');
    
    if (window.CarritoManager) {
        window.CarritoManager.limpiarCarrito();
    }
    
    // 2. Actualizar UI
    const contador = document.getElementById('carrito-contador');
    if (contador) {
        contador.textContent = '0';
        contador.style.display = 'none';
    }
    
    if (typeof renderSidebarCarrito === 'function') {
        renderSidebarCarrito();
    }
    
    console.log('✅ Carrito limpiado');
    
    // 3. Verificar botones de carrito
    setTimeout(() => {
        const botones = document.querySelectorAll('.btn-carrito');
        console.log(`🔍 Encontrados ${botones.length} botones de carrito`);
        
        if (botones.length >= 3) {
            console.log('🎯 Verificando IDs de los primeros 3 botones:');
            for (let i = 0; i < 3; i++) {
                console.log(`Botón ${i + 1}:`, {
                    id: botones[i].getAttribute('data-id'),
                    nombre: botones[i].getAttribute('data-nombre'),
                    precio: botones[i].getAttribute('data-precio')
                });
            }
            
            console.log('🖱️ Agregando primer curso...');
            botones[0].click();
            
            setTimeout(() => {
                console.log('🖱️ Agregando segundo curso...');
                botones[1].click();
                
                setTimeout(() => {
                    console.log('🖱️ Agregando tercer curso...');
                    botones[2].click();
                    
                    setTimeout(() => {
                        console.log('📋 Estado final del carrito:');
                        if (window.CarritoManager) {
                            console.log(window.CarritoManager.obtenerCarrito());
                        } else {
                            console.log(JSON.parse(localStorage.getItem('carrito') || '[]'));
                        }
                    }, 500);
                }, 1000);
            }, 1000);
        }
    }, 1000);
};