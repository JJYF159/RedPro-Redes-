document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value,
  };

  const response = await fetch('/api/contacto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (result.success) {
    alert('¡Mensaje enviado correctamente!');
    e.target.reset();
  } else {
    alert('Hubo un error al enviar el mensaje.');
  }
});
