// buscador.js
document.addEventListener('DOMContentLoaded', () => {
    const inputBusqueda = document.getElementById('input-busqueda');
    const contenedorResultados = document.getElementById('resultados-busqueda');
    const contadorCarrito = document.getElementById('carrito-contador');
    let cursosData = [];

    fetch('/cursos')
        .then(res => res.json())
        .then(data => {
            cursosData = data;
            window.cursosData = data; // También hacerlo disponible globalmente
            console.log('🔍 BUSCADOR: Cursos cargados desde la API:', data);
            console.log('🔍 BUSCADOR: Primer curso:', data[0]);
            console.log('🔍 BUSCADOR: Estructura del primer curso:', Object.keys(data[0] || {}));
        })
        .catch(error => {
            console.error('❌ BUSCADOR: Error al cargar cursos:', error);
        });

    if (inputBusqueda && contenedorResultados) {
        inputBusqueda.addEventListener('input', () => {
            const texto = inputBusqueda.value.toLowerCase();
            contenedorResultados.innerHTML = '';
            if (texto === '') {
                contenedorResultados.style.display = 'none';
                return;
            }

            let encontrados = 0;
            cursosData.forEach((curso, index) => {
                if (curso.Titulo.toLowerCase().includes(texto)) {
                    // Generar ID único para cada curso
                    const idUnico = curso.ID || `buscador-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    
                    const item = document.createElement('div');
                    item.className = 'resultado-item';
                    item.innerHTML = `
                        <strong>${curso.Titulo}</strong><br>
                        <small>${curso.Autor}</small><br>
                        <span>S/ ${curso.Precio}</span>
                    `;
                    item.addEventListener('click', () => {
                        console.log('🔍 BUSCADOR: Agregando curso al carrito:', curso);
                        console.log('🔍 BUSCADOR: Estructura completa del curso desde SQL:', Object.keys(curso));
                        console.log('🔍 BUSCADOR: Valores específicos:', {
                            ID: curso.ID,
                            Titulo: curso.Titulo,
                            Precio: curso.Precio,
                            tipoID: typeof curso.ID,
                            tipoTitulo: typeof curso.Titulo,
                            tipoPrecio: typeof curso.Precio
                        });
                        
                        // Preparar el objeto del curso con conversiones explícitas y ID único
                        const cursoParaAgregar = {
                            id: String(idUnico), // Usar el ID único generado
                            nombre: String(curso.Titulo || curso.titulo || ''), // Asegurar que sea string
                            precio: parseFloat(curso.Precio || curso.precio) || 0, // Asegurar que sea number
                            cantidad: 1
                        };
                        
                        console.log('📦 BUSCADOR: Objeto del curso preparado con conversiones:', cursoParaAgregar);
                        console.log('🔍 BUSCADOR: ID único usado:', idUnico);
                        
                        // NUEVA LÓGICA: Verificar si el curso ya existe ANTES de intentar agregarlo
                        let cursoYaExiste = false;
                        
                        if (window.CarritoManager) {
                            const carritoActual = window.CarritoManager.obtenerCarrito();
                            cursoYaExiste = carritoActual.some(item => item.id === cursoParaAgregar.id);
                        } else {
                            const carritoLS = JSON.parse(localStorage.getItem('carrito')) || [];
                            cursoYaExiste = carritoLS.some(item => item.id === cursoParaAgregar.id);
                        }
                        
                        console.log('🔍 BUSCADOR: ¿Curso ya existe en el carrito?', cursoYaExiste);
                        
                        if (cursoYaExiste) {
                            console.log('⚠️ BUSCADOR: El curso ya está en el carrito, no se agregará nuevamente');
                            
                            // Mostrar notificación diferente
                            if (window.mostrarNotificacion) {
                                window.mostrarNotificacion(`${curso.Titulo} ya está en el carrito`);
                            } else {
                                alert(`"${curso.Titulo}" ya está en el carrito.`);
                            }
                            
                            // Limpiar la búsqueda y salir
                            inputBusqueda.value = '';
                            contenedorResultados.style.display = 'none';
                            return;
                        }
                        
                        // Intentar ambos métodos para asegurar que funcione
                        let agregadoExitoso = false;
                        
                        // Método 1: Usar CarritoManager si está disponible
                        if (window.CarritoManager) {
                            console.log('✅ BUSCADOR: Usando CarritoManager');
                            try {
                                // Como ya verificamos que no existe, simplemente agregarlo como nuevo
                                const carritoActual = window.CarritoManager.obtenerCarrito();
                                carritoActual.push(cursoParaAgregar);
                                
                                // Guardar el carrito actualizado
                                if (window.CarritoManager.guardarCarrito) {
                                    window.CarritoManager.guardarCarrito(carritoActual);
                                } else {
                                    // Fallback: usar el método de agregar normal pero con verificación
                                    window.CarritoManager.agregarItem(cursoParaAgregar);
                                }
                                
                                console.log('📋 BUSCADOR: Carrito después de agregar (CarritoManager):', window.CarritoManager.obtenerCarrito());
                                console.log('💰 BUSCADOR: Total del carrito:', window.CarritoManager.calcularTotal());
                                agregadoExitoso = true;
                            } catch (error) {
                                console.error('❌ BUSCADOR: Error con CarritoManager:', error);
                            }
                        }
                        
                        // Método 2: Método tradicional como backup
                        if (!agregadoExitoso) {
                            console.log('⚠️ BUSCADOR: Usando método tradicional de localStorage');
                            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                            
                            // Como ya verificamos que no existe, simplemente agregarlo
                            carrito.push(cursoParaAgregar);
                            console.log('🆕 BUSCADOR: Curso nuevo agregado directamente (sin verificar duplicados)');
                            
                            // Guardar en localStorage
                            localStorage.setItem('carrito', JSON.stringify(carrito));
                            console.log('📋 BUSCADOR: Carrito guardado en localStorage:', carrito);
                            agregadoExitoso = true;
                        }
                        
                        // Solo continuar si se agregó exitosamente
                        if (!agregadoExitoso) {
                            console.error('❌ BUSCADOR: No se pudo agregar el curso al carrito');
                            alert('Error: No se pudo agregar el curso al carrito');
                            return;
                        }
                        
                        console.log('✅ BUSCADOR: Curso agregado exitosamente, actualizando UI...');
                        
                        // Actualizar contador de manera más robusta
                        console.log('🔄 BUSCADOR: Actualizando contador...');
                        if (contadorCarrito) {
                            let totalItems = 0;
                            
                            if (window.CarritoManager) {
                                totalItems = window.CarritoManager.obtenerCantidadTotal();
                            } else {
                                const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
                                totalItems = carrito.reduce((total, item) => total + (parseInt(item.cantidad) || 1), 0);
                            }
                            
                            contadorCarrito.textContent = totalItems;
                            contadorCarrito.style.display = totalItems > 0 ? 'inline' : 'none';
                            console.log('🔢 BUSCADOR: Contador actualizado a:', totalItems);
                        }
                        
                        // Actualizar sidebar de manera MUY agresiva
                        console.log('🔄 BUSCADOR: Forzando actualización del sidebar...');
                        
                        // Método 1: Función directa
                        if (typeof renderSidebarCarrito === 'function') {
                            console.log('✅ BUSCADOR: Llamando renderSidebarCarrito directamente');
                            renderSidebarCarrito();
                        }
                        
                        // Método 2: Disparar eventos del CarritoManager
                        if (window.CarritoManager && window.CarritoManager.EVENTOS) {
                            console.log('✅ BUSCADOR: Disparando eventos del CarritoManager');
                            
                            // Disparar múltiples eventos para asegurar que se actualice
                            const eventos = [
                                window.CarritoManager.EVENTOS.ACTUALIZADO,
                                window.CarritoManager.EVENTOS.ITEM_AGREGADO
                            ];
                            
                            eventos.forEach(evento => {
                                if (evento) {
                                    window.dispatchEvent(new CustomEvent(evento, {
                                        detail: { 
                                            carrito: window.CarritoManager.obtenerCarrito(),
                                            total: window.CarritoManager.calcularTotal()
                                        }
                                    }));
                                }
                            });
                        }
                        
                        // Método 3: Forzar con múltiples delays
                        [50, 100, 200, 500].forEach(delay => {
                            setTimeout(() => {
                                console.log(`⏰ BUSCADOR: Forzando actualización con delay ${delay}ms...`);
                                if (typeof renderSidebarCarrito === 'function') {
                                    renderSidebarCarrito();
                                }
                            }, delay);
                        });
                        
                        // Método 4: Disparar evento de storage
                        setTimeout(() => {
                            console.log('🔄 BUSCADOR: Disparando evento de storage...');
                            window.dispatchEvent(new StorageEvent('storage', {
                                key: 'carrito',
                                newValue: localStorage.getItem('carrito'),
                                storageArea: localStorage
                            }));
                        }, 100);
                        
                        // Limpiar la búsqueda y ocultar resultados
                        inputBusqueda.value = '';
                        contenedorResultados.style.display = 'none';
                        
                        // Mostrar notificación más elegante en vez de alert
                        if (window.mostrarNotificacion) {
                            window.mostrarNotificacion(`${curso.Titulo} añadido al carrito`);
                        } else {
                            // Fallback a alert si no existe la función
                            alert(`"${curso.Titulo}" añadido al carrito.`);
                        }
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

// Función global para debugging del buscador
window.debugBuscador = function() {
    console.log('🔍 DEBUG BUSCADOR INICIADO...');
    
    const input = document.getElementById('input-busqueda');
    const resultados = document.getElementById('resultados-busqueda');
    
    console.log('Elementos encontrados:', {
        input: input,
        resultados: resultados,
        CarritoManager: window.CarritoManager,
        renderSidebarCarrito: typeof renderSidebarCarrito
    });
    
    if (input) {
        console.log('Simulando búsqueda "wi"...');
        input.value = 'wi';
        input.dispatchEvent(new Event('input'));
        
        setTimeout(() => {
            console.log('Resultados después de la búsqueda:', resultados.innerHTML);
            const primerResultado = resultados.querySelector('.resultado-item');
            if (primerResultado) {
                console.log('Haciendo click en el primer resultado...');
                primerResultado.click();
            } else {
                console.log('❌ No se encontró ningún resultado');
            }
        }, 1000);
    }
};

// Función global para verificar sincronización del carrito
window.verificarSincronizacionCarrito = function() {
    console.log('🔍 VERIFICANDO SINCRONIZACIÓN DEL CARRITO...');
    
    console.log('1. CarritoManager disponible:', !!window.CarritoManager);
    if (window.CarritoManager) {
        console.log('   - Carrito CarritoManager:', window.CarritoManager.obtenerCarrito());
        console.log('   - Total CarritoManager:', window.CarritoManager.calcularTotal());
        console.log('   - Cantidad total:', window.CarritoManager.obtenerCantidadTotal());
    }
    
    console.log('2. localStorage carrito:', localStorage.getItem('carrito'));
    const carritoLS = JSON.parse(localStorage.getItem('carrito')) || [];
    console.log('   - Carrito parseado:', carritoLS);
    console.log('   - Cantidad total LS:', carritoLS.reduce((total, item) => total + (parseInt(item.cantidad) || 1), 0));
    
    console.log('3. Elementos UI:');
    const contador = document.getElementById('carrito-contador');
    console.log('   - Contador:', contador, contador ? contador.textContent : 'No encontrado');
    
    const sidebar = document.getElementById('sidebar-carrito');
    console.log('   - Sidebar:', sidebar ? 'Encontrado' : 'No encontrado');
    
    const itemsContainer = document.getElementById('sidebar-carrito-items');
    console.log('   - Items container:', itemsContainer ? itemsContainer.innerHTML : 'No encontrado');
    
    console.log('4. Funciones disponibles:');
    console.log('   - renderSidebarCarrito:', typeof renderSidebarCarrito);
    
    // Forzar actualización
    console.log('5. Forzando actualización completa...');
    if (typeof renderSidebarCarrito === 'function') {
        renderSidebarCarrito();
        console.log('   - renderSidebarCarrito ejecutado');
    }
    
    console.log('✅ VERIFICACIÓN COMPLETA');
};

// Función para debuggear datos de SQL
window.debugCursosSQL = function() {
    console.log('🗄️ DEBUG CURSOS SQL INICIADO...');
    
    console.log('📊 Datos cargados en cursosData:', window.cursosData || 'No disponible');
    
    if (window.cursosData && window.cursosData.length > 0) {
        const primerCurso = window.cursosData[0];
        console.log('🎯 Primer curso completo:', primerCurso);
        console.log('🔍 Propiedades del primer curso:', Object.keys(primerCurso));
        console.log('📝 Valores:', {
            ID: primerCurso.ID,
            Titulo: primerCurso.Titulo,
            Autor: primerCurso.Autor,
            Precio: primerCurso.Precio,
            Categoria: primerCurso.Categoria
        });
        console.log('🔢 Tipos de datos:', {
            ID: typeof primerCurso.ID,
            Titulo: typeof primerCurso.Titulo,
            Precio: typeof primerCurso.Precio
        });
    } else {
        console.log('❌ No hay cursos cargados desde SQL');
    }
    
    // Intentar hacer fetch directo para ver la respuesta
    fetch('/cursos')
        .then(res => res.json())
        .then(data => {
            console.log('📡 Respuesta directa de /cursos:', data);
            if (data.length > 0) {
                console.log('📋 Primer curso de la respuesta:', data[0]);
            }
        })
        .catch(error => {
            console.error('❌ Error en fetch directo:', error);
        });
};

// Función para limpiar carrito completamente y probar
window.limpiarYProbarBuscador = function() {
    console.log('🧹 LIMPIANDO CARRITO COMPLETAMENTE...');
    
    // Limpiar localStorage
    localStorage.removeItem('carrito');
    localStorage.setItem('carrito', '[]');
    
    // Limpiar CarritoManager si existe
    if (window.CarritoManager) {
        window.CarritoManager.limpiarCarrito();
    }
    
    // Actualizar UI
    const contador = document.getElementById('carrito-contador');
    if (contador) {
        contador.textContent = '0';
        contador.style.display = 'none';
    }
    
    // Forzar renderizado del sidebar
    if (typeof renderSidebarCarrito === 'function') {
        renderSidebarCarrito();
    }
    
    console.log('✅ Carrito limpiado. Ahora probando buscador...');
    
    // Esperar un poco y probar el buscador
    setTimeout(() => {
        window.debugBuscador();
    }, 500);
};

// Hacer los datos disponibles globalmente para debugging
window.cursosData = [];
