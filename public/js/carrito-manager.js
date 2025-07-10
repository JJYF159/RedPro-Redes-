/**
 * CARRITO-MANAGER.JS - Gestión centralizada del carrito de compras
 * 
 * Secciones:
 * - Configuración y constantes
 * - Funciones de persistencia (localStorage)
 * - Validaciones de datos
 * - Gestión de items (agregar, eliminar, actualizar)
 * - Cálculos y totales
 * - Reparación y mantenimiento
 * - Eventos y sincronización
 * - API pública
 */

// =====================================================
// CONFIGURACIÓN Y CONSTANTES
// =====================================================

const CarritoManager = (function() {
    const STORAGE_KEY = 'carrito';
    
    const ITEM_SCHEMA = {
        id: { type: 'string', required: true },
        nombre: { type: 'string', required: true },
        precio: { type: 'number', required: true },
        cantidad: { type: 'number', default: 1 },
        imagen: { type: 'string', required: false }
    };
    
    const EVENTOS = {
        ACTUALIZADO: 'carritoActualizado',
        ITEM_AGREGADO: 'carritoItemAgregado',
        ITEM_ELIMINADO: 'carritoItemEliminado',
        ITEM_ACTUALIZADO: 'carritoItemActualizado',
        ERROR: 'carritoError'
    };

// =====================================================
// FUNCIONES DE PERSISTENCIA
// =====================================================
    
    /**
     * Obtiene el carrito actual del localStorage
     */
    function obtenerCarrito() {
        try {
            const carrito = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            return Array.isArray(carrito) ? carrito : [];
        } catch (error) {
            console.error('Error al obtener el carrito:', error);
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error al obtener el carrito', error });
            return [];
        }
    }
    
    /**
     * Guarda el carrito en localStorage
     */
    function guardarCarrito(carrito) {
        try {
            console.log('💾 GUARDANDO CARRITO:', JSON.stringify(carrito, null, 2));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
            dispararEvento(EVENTOS.ACTUALIZADO, { carrito });
            console.log('✅ Carrito guardado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error al guardar el carrito:', error);
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error al guardar el carrito', error });
            return false;
        }
    }

// =====================================================
// VALIDACIONES DE DATOS
// =====================================================
    
    /**
     * Valida un item según el esquema
     */
    function validarItem(item) {
        console.log('🔍 VALIDANDO ITEM:', item);
        
        if (!item || typeof item !== 'object') {
            throw new Error('El item debe ser un objeto válido');
        }
        
        const itemValidado = { ...item };
        
        console.log('📋 Item original:', item);
        console.log('📋 Item copiado:', itemValidado);
        
        for (const [campo, config] of Object.entries(ITEM_SCHEMA)) {
            if (config.required && (itemValidado[campo] === undefined || itemValidado[campo] === null)) {
                throw new Error(`El campo "${campo}" es obligatorio`);
            }
            
            if (itemValidado[campo] !== undefined && itemValidado[campo] !== null) {
                switch (config.type) {
                    case 'string':
                        if (typeof itemValidado[campo] !== 'string') {
                            console.log(`⚠️ Convirtiendo ${campo} a string:`, itemValidado[campo]);
                            itemValidado[campo] = String(itemValidado[campo]);
                        }
                        break;
                    case 'number':
                        const num = Number(itemValidado[campo]);
                        if (isNaN(num)) {
                            throw new Error(`El campo "${campo}" debe ser un número válido`);
                        }
                        if (itemValidado[campo] !== num) {
                            console.log(`⚠️ Convirtiendo ${campo} a número:`, itemValidado[campo], '->', num);
                        }
                        itemValidado[campo] = num;
                        break;
                }
            }
            
            if (itemValidado[campo] === undefined && config.default !== undefined) {
                console.log(`⚠️ Aplicando valor por defecto para ${campo}:`, config.default);
                itemValidado[campo] = config.default;
            }
        }
        
        console.log('✅ Item validado final:', itemValidado);
        return itemValidado;
    }

// =====================================================
// GESTIÓN DE ITEMS
// =====================================================
    
    /**
     * Agrega un item al carrito o incrementa su cantidad si ya existe
     */
    function agregarItem(item) {
        try {
            console.log('🛒 CarritoManager: Agregando item', item);
            
            const itemValidado = validarItem(item);
            console.log('✅ Item validado:', itemValidado);
            
            const carrito = obtenerCarrito();
            console.log('📦 Carrito actual:', carrito);
            
            const indiceExistente = carrito.findIndex(i => i.id === itemValidado.id);
            
            console.log('🔍 Buscando item existente con ID:', itemValidado.id);
            console.log('🔍 IDs en el carrito actual:', carrito.map(i => ({ id: i.id, nombre: i.nombre })));
            console.log('🔍 ¿Item ya existe?', indiceExistente >= 0 ? `SÍ en índice ${indiceExistente}` : 'NO');
            
            if (indiceExistente >= 0) {
                console.log('📈 Incrementando cantidad del item existente:', carrito[indiceExistente]);
                carrito[indiceExistente].cantidad = (carrito[indiceExistente].cantidad || 1) + 1;
                console.log('📝 Item actualizado:', carrito[indiceExistente]);
                dispararEvento(EVENTOS.ITEM_ACTUALIZADO, { item: carrito[indiceExistente] });
            } else {
                carrito.push(itemValidado);
                console.log('➕ Nuevo item agregado:', itemValidado);
                dispararEvento(EVENTOS.ITEM_AGREGADO, { item: itemValidado });
            }
            
            const resultado = guardarCarrito(carrito);
            console.log('💾 Resultado de guardar:', resultado);
            
            return resultado;
        } catch (error) {
            console.error('❌ Error al agregar item al carrito:', error);
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error al agregar item al carrito', error });
            return false;
        }
    }
    
    /**
     * Elimina un item del carrito por su ID
     */
    function eliminarItem(id) {
        try {
            const carrito = obtenerCarrito();
            const indiceExistente = carrito.findIndex(i => i.id === id);
            
            if (indiceExistente >= 0) {
                const itemEliminado = carrito[indiceExistente];
                carrito.splice(indiceExistente, 1);
                dispararEvento(EVENTOS.ITEM_ELIMINADO, { item: itemEliminado });
                return guardarCarrito(carrito);
            }
            
            return true;
        } catch (error) {
            console.error('Error al eliminar item del carrito:', error);
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error al eliminar item del carrito', error });
            return false;
        }
    }
    
    /**
     * Actualiza la cantidad de un item específico
     */
    function actualizarCantidad(id, cantidad) {
        try {
            const cantidadNum = Number(cantidad);
            if (isNaN(cantidadNum) || cantidadNum < 1) {
                throw new Error('La cantidad debe ser un número válido mayor a cero');
            }
            
            const carrito = obtenerCarrito();
            const indiceExistente = carrito.findIndex(i => i.id === id);
            
            if (indiceExistente >= 0) {
                carrito[indiceExistente].cantidad = cantidadNum;
                dispararEvento(EVENTOS.ITEM_ACTUALIZADO, { item: carrito[indiceExistente] });
                return guardarCarrito(carrito);
            }
            
            return false;
        } catch (error) {
            console.error('Error al actualizar cantidad del item:', error);
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error al actualizar cantidad', error });
            return false;
        }
    }

// =====================================================
// CÁLCULOS Y TOTALES
// =====================================================
    
    /**
     * Calcula el total del carrito
     */
    function calcularTotal() {
        try {
            const carrito = obtenerCarrito();
            
            return carrito.reduce((total, item) => {
                const precio = Number(item.precio) || 0;
                const cantidad = Number(item.cantidad) || 1;
                return total + (precio * cantidad);
            }, 0);
        } catch (error) {
            console.error('Error al calcular total del carrito:', error);
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error al calcular total', error });
            return 0;
        }
    }

    /**
     * Obtiene la cantidad total de items en el carrito
     */
    function obtenerCantidadTotal() {
        try {
            const carrito = obtenerCarrito();
            return carrito.reduce((total, item) => total + (Number(item.cantidad) || 1), 0);
        } catch (error) {
            console.error('Error al obtener cantidad total:', error);
            return 0;
        }
    }

// =====================================================
// REPARACIÓN Y MANTENIMIENTO
// =====================================================
    
    /**
     * Limpia todos los items del carrito
     */
    function limpiarCarrito() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
            dispararEvento(EVENTOS.ACTUALIZADO, { carrito: [] });
            return true;
        } catch (error) {
            console.error('Error al limpiar el carrito:', error);
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error al limpiar el carrito', error });
            return false;
        }
    }
    
    /**
     * Repara inconsistencias en el carrito
     */
    function repararCarrito() {
        try {
            const carrito = obtenerCarrito();
            const carritoReparado = [];
            let hayErrores = false;
            
            for (const item of carrito) {
                try {
                    const itemReparado = validarItem({
                        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        nombre: item.nombre || 'Curso sin nombre',
                        precio: Number(item.precio) || 0,
                        cantidad: Number(item.cantidad) || 1,
                        imagen: item.imagen
                    });
                    
                    carritoReparado.push(itemReparado);
                } catch (itemError) {
                    console.warn('Item descartado durante reparación:', item, itemError);
                    hayErrores = true;
                }
            }
            
            const idsVistos = new Set();
            const carritoSinDuplicados = [];
            
            for (const item of carritoReparado) {
                if (!idsVistos.has(item.id)) {
                    idsVistos.add(item.id);
                    carritoSinDuplicados.push(item);
                } else {
                    hayErrores = true;
                }
            }
            
            if (hayErrores || carritoSinDuplicados.length !== carrito.length) {
                guardarCarrito(carritoSinDuplicados);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error al reparar el carrito:', error);
            limpiarCarrito();
            dispararEvento(EVENTOS.ERROR, { mensaje: 'Error grave al reparar el carrito, se ha limpiado', error });
            return false;
        }
    }

// =====================================================
// EVENTOS Y SINCRONIZACIÓN
// =====================================================
    
    /**
     * Dispara un evento personalizado
     */
    function dispararEvento(tipo, detalle) {
        const evento = new CustomEvent(tipo, { 
            detail: detalle,
            bubbles: true,
            cancelable: true
        });
        
        window.dispatchEvent(evento);
        actualizarContadorCarrito();
        
        if (tipo === EVENTOS.ACTUALIZADO) {
            try {
                window.dispatchEvent(new StorageEvent('storage', {
                    key: STORAGE_KEY,
                    newValue: localStorage.getItem(STORAGE_KEY),
                    url: window.location.href
                }));
            } catch (error) {
                console.warn('No se pudo disparar evento storage:', error);
            }
        }
    }
    
    /**
     * Actualiza el contador del carrito en la interfaz
     */
    function actualizarContadorCarrito() {
        const contadorElement = document.getElementById('carrito-contador');
        if (!contadorElement) return;
        
        const totalItems = obtenerCantidadTotal();
        contadorElement.textContent = totalItems;
        contadorElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }

// =====================================================
// INICIALIZACIÓN Y LISTENERS
// =====================================================
    
    window.addEventListener('DOMContentLoaded', function() {
        repararCarrito();
        actualizarContadorCarrito();
    });
    
    window.addEventListener('storage', function(e) {
        if (e.key === STORAGE_KEY) {
            actualizarContadorCarrito();
        }
    });

// =====================================================
// API PÚBLICA
// =====================================================
    
    return {
        obtenerCarrito,
        agregarItem,
        eliminarItem,
        actualizarCantidad,
        limpiarCarrito,
        repararCarrito,
        calcularTotal,
        obtenerCantidadTotal,
        actualizarContadorCarrito,
        EVENTOS
    };
})();

window.CarritoManager = CarritoManager;

console.log('✅ CarritoManager inicializado correctamente');
