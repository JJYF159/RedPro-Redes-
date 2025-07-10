/**
 * SLIDER.JS - Gestión del slider hero principal
 * 
 * Secciones:
 * - Inicialización del Swiper
 * - Configuración de autoplay y navegación
 * - Configuración responsiva
 */

// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Swiper !== "undefined") {
        const heroSwiper = new Swiper('.hero-swiper', {
            loop: true,
            autoplay: { 
                delay: 5000,
                disableOnInteraction: false
            },
            effect: 'slide',
            speed: 800,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            grabCursor: true,
            keyboard: {
                enabled: true
            },
            breakpoints: {
                640: { slidesPerView: 1 },
                768: { slidesPerView: 1 },
                1024: { slidesPerView: 1 }
            }
        });
    } else {
        console.error('Error: Swiper no está definido. Asegúrate de incluir la biblioteca Swiper.');
    }
});
