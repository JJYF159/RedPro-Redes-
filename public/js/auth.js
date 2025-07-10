/**
 * AUTH.JS - Funcionalidad de autenticación
 * 
 * Secciones:
 * - Registro de usuarios
 * - Inicio de sesión
 * - Cerrar sesión
 * - Verificación de estado de autenticación
 * - Actualización de interfaz
 */

// =====================================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// =====================================================

const AUTH_ENDPOINTS = {
    REGISTRO: '/registro',
    LOGIN: '/login',
    LOGOUT: '/logout',
    GET_USUARIO: '/get-usuario'
};

// =====================================================
// FUNCIONES DE REGISTRO
// =====================================================

function configurarFormularioRegistro() {
    const form = document.querySelector('#form-registro');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('🎯 Iniciando proceso de registro...');
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        const datos = {
            nombres: formData.get('nombres'),
            apellidos: formData.get('apellidos'),
            email: formData.get('email'),
            celular: formData.get('celular'),
            password: formData.get('password'),
            confirmar: formData.get('confirmar')
        };
        
        console.log('📋 Datos del formulario:', datos);
        
        // Validaciones del lado cliente
        if (!validarDatosRegistro(datos)) {
            return;
        }
        
        // Mostrar loading
        mostrarCargando('Registrando usuario...');
        
        try {
            console.log('📡 Enviando petición al servidor...');
            
            const response = await fetch('/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos),
                credentials: 'include'
            });
            
            console.log('📥 Respuesta del servidor recibida:', response.status);
            
            // Ocultar loading INMEDIATAMENTE después de recibir respuesta
            ocultarCargando();
            
            if (response.ok) {
                const resultado = await response.json();
                console.log('✅ Registro exitoso:', resultado);
                
                mostrarExito('¡Registro exitoso! Bienvenido a RedPro Academy.');
                
                // Redirigir a login después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'IniciarSesion.html';
                }, 2000);
                
            } else {
                console.log('❌ Error en la respuesta del servidor');
                let errorMsg = 'Error al registrarse';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.message || errorMsg;
                } catch (e) {
                    errorMsg = await response.text() || errorMsg;
                }
                mostrarError('Error: ' + errorMsg);
            }
            
        } catch (error) {
            console.error('❌ Error en la petición:', error);
            ocultarCargando();
            mostrarError('Error de conexión. Verifica que el servidor esté funcionando.');
        }
    });
}

function validarDatosRegistro(datos) {
    // Validar campos requeridos
    if (!datos.nombres || !datos.apellidos || !datos.email || !datos.celular || !datos.password) {
        mostrarError('Todos los campos son obligatorios');
        return false;
    }
    
    // Validar contraseñas
    if (datos.password !== datos.confirmar) {
        mostrarError('Las contraseñas no coinciden');
        return false;
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datos.email)) {
        mostrarError('El email no tiene un formato válido');
        return false;
    }
    
    // Validar longitud de contraseña
    if (datos.password.length < 6) {
        mostrarError('La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    // Validar términos y condiciones
    const terminos = document.querySelector('input[name="terminos"]');
    if (terminos && !terminos.checked) {
        mostrarError('Debes aceptar los términos y condiciones');
        return false;
    }
    
    return true;
}

// =====================================================
// FUNCIONES DE INICIO DE SESIÓN
// =====================================================

function configurarFormularioLogin() {
    const form = document.querySelector('#form-login');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        const datos = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        // Validación básica
        if (!datos.email || !datos.password) {
            mostrarError('Por favor completa todos los campos');
            return;
        }
        
        // Mostrar loading
        mostrarCargando('Iniciando sesión...');
        
        try {
            const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos),
                credentials: 'include'
            });
            
            if (response.ok) {
                const resultado = await response.json();
                ocultarCargando();
                
                // Guardar datos del usuario
                localStorage.setItem('usuarioLogueado', 'true');
                localStorage.setItem('nombreUsuario', resultado.user);
                
                mostrarExito('¡Bienvenido! Has iniciado sesión correctamente.');
                
                // Actualizar interfaz inmediatamente
                actualizarInterfazAutenticacion();
                
                // Redirigir después de 1 segundo
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } else {
                const error = await response.text();
                ocultarCargando();
                mostrarError('Error: ' + error);
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            ocultarCargando();
            mostrarError('Error de conexión. Intenta nuevamente.');
        }
    });
}

// =====================================================
// FUNCIONES DE CERRAR SESIÓN
// =====================================================

async function cerrarSesion() {
    try {
        const response = await fetch(AUTH_ENDPOINTS.LOGOUT, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            // Limpiar localStorage
            localStorage.removeItem('usuarioLogueado');
            localStorage.removeItem('nombreUsuario');
            
            // Actualizar interfaz
            actualizarInterfazAutenticacion();
            
            mostrarExito('Sesión cerrada correctamente');
            
            // Redirigir a inicio
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mostrarError('Error al cerrar sesión');
    }
}

// =====================================================
// VERIFICACIÓN DE ACCESO A PÁGINAS PROTEGIDAS
// =====================================================

function verificarAccesoPago() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado') === 'true';
    const paginaActual = window.location.pathname;
    
    // Si está en la página de pago y no está logueado, redirigir
    if (paginaActual.includes('Pago.html') && !usuarioLogueado) {
        mostrarError('Debes iniciar sesión para acceder a la página de pago');
        setTimeout(() => {
            window.location.href = 'IniciarSesion.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// =====================================================
// VERIFICACIÓN DE ESTADO DE AUTENTICACIÓN
// =====================================================

async function verificarEstadoAutenticacion() {
    try {
        const response = await fetch(AUTH_ENDPOINTS.GET_USUARIO, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.nombre) {
                // Usuario autenticado
                localStorage.setItem('usuarioLogueado', 'true');
                localStorage.setItem('nombreUsuario', data.nombre);
                return true;
            } else {
                // Usuario no autenticado
                localStorage.removeItem('usuarioLogueado');
                localStorage.removeItem('nombreUsuario');
                return false;
            }
        }
        
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        return false;
    }
}

// =====================================================
// VERIFICACIÓN DE ACCESO A PÁGINAS PROTEGIDAS
// =====================================================

function verificarAccesoPago() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado') === 'true';
    const paginaActual = window.location.pathname;
    
    // Si está en la página de pago y no está logueado, redirigir
    if (paginaActual.includes('Pago.html') && !usuarioLogueado) {
        mostrarError('Debes iniciar sesión para acceder a la página de pago');
        setTimeout(() => {
            window.location.href = 'IniciarSesion.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// =====================================================
// ACTUALIZACIÓN DE INTERFAZ
// =====================================================

function actualizarInterfazAutenticacion() {
    const usuarioLogueado = localStorage.getItem('usuarioLogueado') === 'true';
    const nombreUsuario = localStorage.getItem('nombreUsuario');
    
    // Elementos de navegación usando IDs específicos
    const btnRegistrarse = document.querySelector('#btn-registrarse, a[href="Registrarse.html"]');
    const btnIniciarSesion = document.querySelector('#btn-iniciar, a[href="IniciarSesion.html"]');
    const btnLogout = document.querySelector('#btn-logout');
    const btnPago = document.querySelector('a[href="Pago.html"]');
    
    // Contenedor de usuario (si existe)
    let contenedorUsuario = document.querySelector('#usuario-info');
    
    if (usuarioLogueado && nombreUsuario) {
        // Usuario autenticado
        
        // Ocultar botones de registro e inicio de sesión
        if (btnRegistrarse) btnRegistrarse.style.display = 'none';
        if (btnIniciarSesion) btnIniciarSesion.style.display = 'none';
        
        // Mostrar botón de logout
        if (btnLogout) btnLogout.style.display = 'inline-block';
        
        // Habilitar botón de pago
        if (btnPago) {
            btnPago.style.display = 'inline-block';
            btnPago.style.pointerEvents = 'auto';
            btnPago.style.opacity = '1';
        }
        
        // Crear o actualizar contenedor de usuario
        if (!contenedorUsuario) {
            contenedorUsuario = document.createElement('div');
            contenedorUsuario.id = 'usuario-info';
            contenedorUsuario.className = 'usuario-info';
            
            // Buscar donde insertar (típicamente en la navbar)
            const authButtons = document.querySelector('.auth-buttons');
            if (authButtons) {
                authButtons.appendChild(contenedorUsuario);
            }
        }
        
        contenedorUsuario.innerHTML = `
            <div class="user-welcome">
                <span class="user-greeting">
                    <i class="fas fa-user-circle me-2"></i>
                    Hola, ${nombreUsuario}
                </span>
            </div>
        `;
        
    } else {
        // Usuario no autenticado
        
        // Mostrar botones de registro e inicio de sesión
        if (btnRegistrarse) btnRegistrarse.style.display = 'inline-block';
        if (btnIniciarSesion) btnIniciarSesion.style.display = 'inline-block';
        
        // Ocultar botón de logout
        if (btnLogout) btnLogout.style.display = 'none';
        
        // Deshabilitar botón de pago
        if (btnPago) {
            btnPago.style.pointerEvents = 'none';
            btnPago.style.opacity = '0.5';
            btnPago.title = 'Debes iniciar sesión para acceder al pago';
        }
        
        // Remover contenedor de usuario
        if (contenedorUsuario) {
            contenedorUsuario.remove();
        }
    }
    
    // Actualizar botón del carrito si existe la función
    if (typeof configurarBotonIrCarrito === 'function') {
        configurarBotonIrCarrito();
    }
}

// =====================================================
// FUNCIONES DE UI (LOADING, MENSAJES)
// =====================================================

function mostrarCargando(mensaje = 'Cargando...') {
    // Crear o actualizar modal de loading
    let modal = document.querySelector('#loading-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loading-modal';
        modal.innerHTML = `
            <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5);" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-body text-center py-4">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <p class="mb-0" id="loading-mensaje">${mensaje}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        document.querySelector('#loading-mensaje').textContent = mensaje;
        modal.querySelector('.modal').style.display = 'block';
    }
}

function ocultarCargando() {
    const modal = document.querySelector('#loading-modal');
    if (modal) {
        modal.remove();
    }
}

function mostrarExito(mensaje) {
    mostrarNotificacion(mensaje, 'success');
}

function mostrarError(mensaje) {
    mostrarNotificacion(mensaje, 'error');
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear un toast simple si no existe la función global
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 9999;
        max-width: 400px;
        background: ${tipo === 'success' ? '#28a745' : tipo === 'error' ? '#dc3545' : '#007bff'};
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    toast.textContent = mensaje;
    
    document.body.appendChild(toast);
    
    // Eliminar después de 4 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar estado de autenticación al cargar la página
    await verificarEstadoAutenticacion();
    
    // Verificar acceso a páginas protegidas
    if (!verificarAccesoPago()) {
        return; // Detener ejecución si no tiene acceso
    }
    
    // Actualizar interfaz
    actualizarInterfazAutenticacion();
    
    // Configurar formularios según la página actual
    configurarFormularioRegistro();
    configurarFormularioLogin();
});

// Hacer la función de cerrar sesión disponible globalmente
window.cerrarSesion = cerrarSesion;
