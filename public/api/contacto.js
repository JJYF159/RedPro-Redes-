ap.post('/api/contacto', async (req, res) => {
  const { name, email, message } = req.body;

  // Configurar el transportador de nodemailer
    try {
        const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
      user: 'kirito159489@gmail.com',
      pass: 'gwbx wscx jhqw uajj'
      }
    });  
  
    await transporter.sendMail({
      from: 'Formulario Web RedesPro <${email}>',
      to: 'kirito159489@gmail.com',
      subject: 'Nuevo mensaje de ${name}',
      html: `<p>Nombre: ${name}</p><p>Email: ${email}</p><p>Mensaje: ${message}</p>`
    });

    await sql.connect(config);
    await sql.query`INSERT INTO Mensajes (Nombre, Email, Mensaje) VALUES (${name}, ${email}, ${message})`;

    res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar el mensaje:', error);
    res.status(500).json({ success: false, message: 'Error al enviar el mensaje' });
  }

});
    
