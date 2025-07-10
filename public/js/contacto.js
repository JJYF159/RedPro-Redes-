/**
 * CONTACTO.JS - Gestión del formulario de contacto
 * 
 * Secciones:
 * - Envío del formulario
 * - Validación de datos
 * - Gestión de respuesta
 * - UI feedback
 */

// =====================================================
// GESTIÓN DEL FORMULARIO
// =====================================================

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
  };

  const submitBtn = e.target.querySelector('.btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Enviando...';
  submitBtn.disabled = true;

  try {
    const response = await fetch('/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      const responseDiv = document.getElementById('form-response');
      responseDiv.style.display = 'block';
      responseDiv.style.color = 'green';
      responseDiv.style.background = '#d4edda';
      responseDiv.style.border = '1px solid #c3e6cb';
      responseDiv.style.padding = '15px';
      responseDiv.style.borderRadius = '5px';
      responseDiv.innerHTML = `
        <strong>¡Mensaje enviado exitosamente!</strong><br>
        📧 Hemos enviado una confirmación a tu correo electrónico.<br>
        ⏰ Te responderemos en 24-48 horas hábiles.
      `;
      
      e.target.reset();
      
      setTimeout(() => {
        responseDiv.style.display = 'none';
      }, 8000);
    } else {
      const responseDiv = document.getElementById('form-response');
      responseDiv.style.display = 'block';
      responseDiv.style.color = 'red';
      responseDiv.textContent = result.error || 'Hubo un error al enviar el mensaje.';
    }
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    const responseDiv = document.getElementById('form-response');
    responseDiv.style.display = 'block';
    responseDiv.style.color = 'red';
    responseDiv.textContent = 'Ocurrió un error al conectar con el servidor.';
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
