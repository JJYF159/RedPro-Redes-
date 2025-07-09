document.addEventListener('DOMContentLoaded', () => {
    fetch('/get-usuario')
        .then(res => res.json())
        .then(data => {
            const nombre = data.nombre;
            if (nombre) {
                const bienvenida = document.querySelector('.bienvenida strong');
                if (bienvenida) {
                    bienvenida.innerHTML = `BIENVENIDO ${nombre.toUpperCase()} ¡EXPLORA TUS CONOCIMIENTOS!`;
                }

                document.getElementById('btn-logout').style.display = 'inline-block';
                document.getElementById('btn-registrarse').style.display = 'none';
                document.getElementById('btn-iniciar').style.display = 'none';
            }
        });

    window.cerrarSesion = function () {
        fetch('/logout', {
            method: 'POST',
        }).then(() => {
            window.location.href = 'IniciarSesion.html';
        }).catch(err => console.error('Error al cerrar sesión:', err));
    };
});
