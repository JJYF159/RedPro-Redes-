// slider.js
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Swiper !== "undefined") {
        new Swiper('.swiper', {
            loop: true,
            autoplay: { delay: 3000 },
        });
    }
});
