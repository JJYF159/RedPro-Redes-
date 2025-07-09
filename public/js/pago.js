// pago.js
document.addEventListener('DOMContentLoaded', () => {
    const metodoRadios = document.querySelectorAll('input[name="metodo"]');
    const tarjetaSection = document.getElementById('pago-tarjeta');
    const yapeSection = document.getElementById('pago-yape');

    if (tarjetaSection && yapeSection) {
        tarjetaSection.style.display = 'block';
        yapeSection.style.display = 'none';

        metodoRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                tarjetaSection.style.display = radio.value === 'tarjeta' ? 'block' : 'none';
                yapeSection.style.display = radio.value === 'yape' ? 'block' : 'none';
            });
        });
    }

    const formPago = document.getElementById('form-pago');
    if (formPago) {
        formPago.addEventListener('submit', e => {
            e.preventDefault();
            const metodo = document.querySelector('input[name="metodo"]:checked').value;

            if (metodo === 'tarjeta') {
                const tarjeta = document.getElementById('tarjeta').value.trim();
                const fecha = document.getElementById('fecha').value;
                const cvv = document.getElementById('cvv').value;

                if (!/^\d{16}$/.test(tarjeta)) return alert("Número de tarjeta inválido");
                if (!fecha) return alert("Ingresa la fecha de expiración");
                if (!/^\d{3,4}$/.test(cvv)) return alert("CVV inválido");
            } else if (metodo === 'yape') {
                const telefono = document.getElementById('telefono').value.trim();
                const codigo = document.getElementById('codigo-yape').value.trim();

                if (!/^\d{9}$/.test(telefono)) return alert("Número de Yape inválido");
                if (!/^\d{6}$/.test(codigo)) return alert("Código de confirmación inválido");
            }

            document.getElementById('mensaje-exito').classList.remove('d-none');
            localStorage.removeItem('carrito');
        });
    }

    const btnLimpiar = document.getElementById('btn-limpiar-carrito');
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            localStorage.removeItem('carrito');
            location.reload();
        });
    }
});
