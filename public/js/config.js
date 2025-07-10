/**
 * CONFIG.JS - Configuración de URLs y constantes
 */

// =====================================================
// CONFIGURACIÓN DE URLs
// =====================================================

const CONFIG = {
    // URL del backend local
    API_URL: 'http://localhost:3000',
    
    ENDPOINTS: {
        CURSOS: '/cursos',
        CONTACTO: '/contacto',
        LOGIN: '/login',
        REGISTRO: '/registro',
        LOGOUT: '/logout',
        PROCESAR_ORDEN: '/procesar-orden',
        GET_USUARIO: '/get-usuario'
    },
    
    APP: {
        NAME: 'RedPro Academy',
        VERSION: '2.0.0',
        AUTOR: 'JJYF27'
    }
};

window.CONFIG = CONFIG;

window.buildApiUrl = function(endpoint) {
    return CONFIG.API_URL + endpoint;
};

console.log('✅ CONFIG inicializado:', CONFIG);
