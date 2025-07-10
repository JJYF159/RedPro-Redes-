// js/sidebar-carrito.js
// Lógica simplificada para el sidebar de resumen de compra

function toggleSidebarCarrito() {
    console.log('🛒 Ejecutando toggleSidebarCarrito...');
    const sidebar = document.getElementById('sidebar-carrito');
    if (sidebar) {
        console.log('✅ Sidebar encontrado, activando toggle...');
        console.log('Estado actual del sidebar:', {
            display: sidebar.style.display,
            right: sidebar.style.right,
            classes: sidebar.className
        });
        
        sidebar.classList.toggle('open');
        
        if (sidebar.classList.contains('open')) {
            console.log('📖 Abriendo sidebar...');
            sidebar.style.display = 'flex';
            sidebar.style.right = '0';
            sidebar.style.opacity = '1';
            sidebar.style.visibility = 'visible';
        } else {
            console.log('📕 Cerrando sidebar...');
            sidebar.style.right = '-370px';
        }
    } else {
        console.error('❌ Sidebar no encontrado en toggleSidebarCarrito');
    }
}

// Inicialización del sidebar
function initSidebarCarrito() {
    console.log('🛒 Iniciando sidebar del carrito...');
    
    const sidebar = document.getElementById('sidebar-carrito');
    if(sidebar) {
        console.log('✅ Sidebar encontrado:', sidebar);
        
        // Configurar estilos iniciales de forma más agresiva
        Object.assign(sidebar.style, {
            position: 'fixed',
            top: '0',
            right: '-370px',
            width: '370px',
            height: '100vh',
            zIndex: '999999',
            backgroundColor: '#fff',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'right 0.3s ease'
        });
        
        // Configurar botón X
        setupCloseButton(sidebar);
    } else {
        console.error('❌ No se encontró el sidebar con ID: sidebar-carrito');
    }
    
    // Configurar ícono del carrito con múltiples selectores
    let cartIcon = document.querySelector('.cart-icon');
    
    // Intentar múltiples formas de encontrar el ícono del carrito
    if (!cartIcon) {
        cartIcon = document.querySelector('[class*="cart"]');
        console.log('🔍 Intentando selector alternativo para carrito:', cartIcon);
    }
    
    if (!cartIcon) {
        cartIcon = document.querySelector('i.fa-shopping-cart');
        console.log('🔍 Intentando selector de ícono FA:', cartIcon);
    }
    
    if (!cartIcon) {
        // Buscar por el contenedor padre que contenga el ícono del carrito
        const cartElements = document.querySelectorAll('*');
        for (let el of cartElements) {
            if (el.innerHTML && el.innerHTML.includes('fa-shopping-cart')) {
                cartIcon = el;
                console.log('🔍 Encontrado contenedor del carrito:', cartIcon);
                break;
            }
        }
    }
    
    if(cartIcon) {
        console.log('✅ Ícono del carrito encontrado:', cartIcon);
        
        // Remover todos los eventos previos clonando el elemento
        const newCartIcon = cartIcon.cloneNode(true);
        cartIcon.parentNode.replaceChild(newCartIcon, cartIcon);
        cartIcon = newCartIcon;
        
        // Agregar nuevo evento con múltiples tipos de eventos
        ['click', 'touchstart'].forEach(eventType => {
            cartIcon.addEventListener(eventType, handleCartIconClick, { passive: false });
        });
        
        // Hacer el elemento más clickeable
        cartIcon.style.cursor = 'pointer';
        cartIcon.style.userSelect = 'none';
        
        console.log('✅ Event listeners agregados al ícono del carrito');
    } else {
        console.error('❌ No se pudo encontrar el ícono del carrito');
        console.log('🔍 Elementos disponibles:', document.querySelectorAll('[class*="cart"], [id*="cart"], .fa-shopping-cart'));
    }
    
    // Configurar botón "Ir al carrito"
    const btnIrCarrito = document.getElementById('sidebar-ir-carrito');
    if (btnIrCarrito) {
        console.log('✅ Botón "Ir al carrito" encontrado');
        // La lógica de autenticación se maneja más abajo en el DOMContentLoaded
    } else {
        console.error('❌ No se encontró el botón "Ir al carrito" con ID: sidebar-ir-carrito');
    }
}

// Función separada para manejar el click del ícono del carrito
function handleCartIconClick(e) {
    console.log('🛒 Click en ícono del carrito detectado');
    console.log('Event target:', e.target);
    console.log('Event currentTarget:', e.currentTarget);
    
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Forzar que el evento se procese
    setTimeout(() => {
        console.log('⏰ Ejecutando toggle con delay...');
        toggleSidebarCarrito();
        renderSidebarCarrito();
    }, 10);
    
    // También ejecutar inmediatamente
    toggleSidebarCarrito();
    renderSidebarCarrito();
    
    return false;
}

// Configurar botón de cierre
function setupCloseButton(sidebar) {
    let closeButton = sidebar.querySelector('.close-sidebar');
    if (!closeButton) {
        const sidebarHeader = sidebar.querySelector('.sidebar-header');
        if (sidebarHeader) {
            closeButton = document.createElement('button');
            closeButton.className = 'close-sidebar';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', 'Cerrar');
            sidebarHeader.appendChild(closeButton);
        }
    }
    
    if (closeButton) {
        // Limpiar eventos previos
        const newBtn = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newBtn, closeButton);
        
        // Estilos
        newBtn.style.fontSize = '2.5rem';
        newBtn.style.cursor = 'pointer';
        newBtn.style.background = 'transparent';
        newBtn.style.border = 'none';
        newBtn.style.color = '#fff';
        newBtn.style.padding = '0 10px';
        
        // Evento de cierre
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebarCarrito();
        });
    }
}

// Ejecutar inicialización cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', function() {
    initSidebarCarrito();
    
    // Conectar con CarritoManager si está disponible
    if (window.CarritoManager) {
        // Escuchar eventos del CarritoManager
        window.addEventListener(window.CarritoManager.EVENTOS.ACTUALIZADO, renderSidebarCarrito);
        window.addEventListener(window.CarritoManager.EVENTOS.ITEM_AGREGADO, renderSidebarCarrito);
        window.addEventListener(window.CarritoManager.EVENTOS.ITEM_ELIMINADO, renderSidebarCarrito);
        window.addEventListener(window.CarritoManager.EVENTOS.ITEM_ACTUALIZADO, renderSidebarCarrito);
    }
    
    // Renderizar inicialmente
    renderSidebarCarrito();
});

// Asegurarse de que se inicialice incluso si el evento DOMContentLoaded ya pasó
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('🔄 DOM ya está listo, inicializando inmediatamente...');
    setTimeout(function() {
        initSidebarCarrito();
        renderSidebarCarrito();
    }, 100);
} else {
    console.log('⏳ Esperando a que el DOM esté listo...');
}

// También intentar inicializar cuando la página esté completamente cargada
window.addEventListener('load', function() {
    console.log('🔄 Página completamente cargada, re-inicializando...');
    setTimeout(function() {
        initSidebarCarrito();
        renderSidebarCarrito();
    }, 200);
});

// Renderizar productos del carrito en el sidebar
function renderSidebarCarrito() {
    console.log('🛒 Renderizando sidebar del carrito...');
    
    // Usar el CarritoManager para obtener los datos
    const carrito = window.CarritoManager ? window.CarritoManager.obtenerCarrito() : [];
    const total = window.CarritoManager ? window.CarritoManager.calcularTotal() : 0;
    
    console.log('Datos del carrito:', { carrito, total });
    
    const itemsContainer = document.getElementById('sidebar-carrito-items');
    const totalSpan = document.getElementById('sidebar-carrito-total');
    
    if (!itemsContainer) {
        console.error('❌ No se encontró el contenedor de items: sidebar-carrito-items');
        return;
    }
    if (!totalSpan) {
        console.error('❌ No se encontró el elemento total: sidebar-carrito-total');
        return;
    }
    
    console.log('✅ Elementos del sidebar encontrados');
    
    if (carrito.length === 0) {
        console.log('Carrito vacío, mostrando mensaje');
        itemsContainer.innerHTML = '<p class="text-center text-muted">El carrito está vacío</p>';
        totalSpan.textContent = 'S/ 0.00';
        return;
    }
    
    itemsContainer.innerHTML = '';
    carrito.forEach((item, index) => {
        console.log(`🎯 Renderizando item ${index}:`, item);
        
        const div = document.createElement('div');
        div.className = 'sidebar-item';
        div.innerHTML = `
            <div class="sidebar-item-info">
                <span class="sidebar-item-title">${item.nombre || 'Sin nombre'}</span>
                <span class="sidebar-item-cantidad">x${item.cantidad || 1}</span>
            </div>
            <div class="sidebar-item-actions">
                <div class="sidebar-item-precio">S/ ${(item.precio * (item.cantidad || 1)).toFixed(2)}</div>
                <button class="btn-eliminar-item" data-id="${item.id}" title="Eliminar producto">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        itemsContainer.appendChild(div);
        
        // Agregar evento al botón eliminar
        const btnEliminar = div.querySelector('.btn-eliminar-item');
        if (btnEliminar) {
            btnEliminar.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                eliminarDelCarrito(id);
            });
        }
    });
    totalSpan.textContent = 'S/ ' + total.toFixed(2);
}

// Actualizar sidebar cuando cambie el carrito
window.addEventListener('storage', function(e) {
    if (e.key === 'carrito') renderSidebarCarrito();
});

// También escuchar eventos personalizados del CarritoManager
if (window.CarritoManager) {
    window.addEventListener(window.CarritoManager.EVENTOS.ACTUALIZADO, renderSidebarCarrito);
}

// Función para eliminar un elemento del carrito
function eliminarDelCarrito(id) {
    if (window.CarritoManager) {
        // Usar el CarritoManager
        window.CarritoManager.eliminarItem(id);
    } else {
        // Fallback al método antiguo
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(item => item.id != id);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderSidebarCarrito();
        
        // Actualizar contador
        const contador = document.getElementById('carrito-contador');
        if (contador) {
            const totalItems = carrito.reduce((total, item) => total + (parseInt(item.cantidad) || 1), 0);
            contador.textContent = totalItems;
        }
    }
    
    console.log('Elemento eliminado del carrito:', id);
}

// Interceptar botón Ir al carrito para usuarios no logueados
function configurarBotonIrCarrito() {
    const btnIrCarrito = document.getElementById('sidebar-ir-carrito');
    const infoElement = document.querySelector('.sidebar-info');
    
    if (btnIrCarrito) {
        // Verificar estado de autenticación
        const usuarioLogueado = localStorage.getItem('usuarioLogueado') === 'true';
        
        if (usuarioLogueado) {
            // Usuario logueado - habilitar botón
            btnIrCarrito.style.display = 'block';
            btnIrCarrito.style.pointerEvents = 'auto';
            btnIrCarrito.style.opacity = '1';
            btnIrCarrito.innerHTML = '<i class="fas fa-lock me-2"></i>Finalizar compra';
            
            // Ocultar mensaje de info
            if (infoElement) {
                infoElement.style.display = 'none';
            }
            
            // Configurar evento para ir al pago
            btnIrCarrito.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'Pago.html';
            };
            
        } else {
            // Usuario no logueado - deshabilitar botón
            btnIrCarrito.style.display = 'block';
            btnIrCarrito.style.pointerEvents = 'none';
            btnIrCarrito.style.opacity = '0.6';
            btnIrCarrito.innerHTML = '<i class="fas fa-lock me-2"></i>Iniciar sesión para comprar';
            
            // Mostrar mensaje de info
            if (infoElement) {
                infoElement.style.display = 'block';
            }
            
            // Configurar evento para ir al login
            btnIrCarrito.onclick = function(e) {
                e.preventDefault();
                if (window.mostrarNotificacion) {
                    window.mostrarNotificacion('Debes iniciar sesión para finalizar tu compra', 'info');
                } else {
                    alert('Debes iniciar sesión para finalizar tu compra');
                }
                setTimeout(() => {
                    window.location.href = 'IniciarSesion.html';
                }, 1500);
            };
        }
    }
}

window.addEventListener('DOMContentLoaded', function() {
    // Configurar botón según estado de autenticación
    configurarBotonIrCarrito();
    
    // Configurar botón X (cerrar) del sidebar
    const closeButtons = document.querySelectorAll('.close-sidebar');
    closeButtons.forEach(function(btn) {
        // Remover eventos antiguos para evitar duplicados
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Agregar nuevo evento directamente en JavaScript en lugar de depender del atributo onclick
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Clic en botón cerrar (X) detectado');
            toggleSidebarCarrito();
        });
    });
    
    // Verificar si se agregó correctamente el evento al botón X
    console.log('Botones de cierre encontrados y configurados:', closeButtons.length);
});

// Función global simple para abrir/cerrar sidebar
window.toggleSidebar = function() {
    console.log('🔥 FUNCIÓN GLOBAL: Forzando toggle del sidebar...');
    const sidebar = document.getElementById('sidebar-carrito');
    if (!sidebar) {
        console.error('❌ Sidebar no encontrado');
        return false;
    }
    
    // Verificar si está abierto
    const isOpen = sidebar.classList.contains('open') || sidebar.style.right === '0px';
    
    if (isOpen) {
        // Cerrar
        sidebar.style.right = '-370px';
        sidebar.classList.remove('open');
        console.log('📕 Sidebar cerrado');
    } else {
        // Abrir
        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.right = '0';
        sidebar.style.width = '370px';
        sidebar.style.height = '100vh';
        sidebar.style.zIndex = '999999';
        sidebar.style.backgroundColor = '#fff';
        sidebar.style.boxShadow = '-4px 0 24px rgba(0,0,0,0.2)';
        sidebar.style.display = 'flex';
        sidebar.style.flexDirection = 'column';
        sidebar.classList.add('open');
        console.log('📖 Sidebar abierto');
        
        // Renderizar contenido
        if (typeof renderSidebarCarrito === 'function') {
            renderSidebarCarrito();
        }
    }
    
    return true;
};
