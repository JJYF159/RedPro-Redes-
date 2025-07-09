const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// Middleware para leer formularios y JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// 📁 Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, '..', 'public'))); // Desde /public/server → sube a /public

// 🔒 Configura la conexión a SQL Server
const dbConfig = {
  user: 'sa',
  password: '123456789',
  server: 'localhost',
  port: 1433,
  database: 'RedesProBD',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// 🚪 Ruta raíz: muestra index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 📝 Ruta para registrar usuarios
app.post('/registro', async (req, res) => {
  const { nombres, apellidos, email, celular, password, confirmar } = req.body;

  if (password !== confirmar) {
    return res.status(400).send("Las contraseñas no coinciden");
  }

  try {
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO Usuarios (Nombres, Apellidos, Email, Celular, Contrasena)
      VALUES (${nombres}, ${apellidos}, ${email}, ${celular}, ${password})
    `;
    res.redirect('/index.html');
  } catch (err) {
    console.error("❌ Error al registrar usuario:", err);
    res.status(500).send("Error al registrar usuario");
  }
});

// 📚 Obtener cursos (con soporte para limit)
app.get('/cursos', async (req, res) => {
  try {
    await sql.connect(dbConfig);

    let query = 'SELECT * FROM Cursos';
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(limit) && limit > 0) {
      query = `SELECT TOP (${limit}) * FROM Cursos`;
    }

    const result = await sql.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al obtener cursos:", err);
    res.status(500).send("Error al obtener cursos");
  }
});
// Manejo de errores globales
process.on('uncaughtException', err => {
  console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', err => {
  console.error('❌ Promesa no manejada:', err);
});

const cookieParser = require('cookie-parser');
app.use(cookieParser()); // Solo una vez, al inicio

//========= Ruta para iniciar sesión ==========//
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT * FROM Usuarios WHERE Email = ${email} AND Contrasena = ${password}
    `;

    if (result.recordset.length === 0) {
      return res.status(401).send("Correo o contraseña incorrectos");
    }

    const usuario = result.recordset[0];

    // Guardar el nombre del usuario en una cookie
    res.cookie('nombreUsuario', usuario.Nombres, { httpOnly: false });
    res.redirect('/Index.html');

  } catch (err) {
    console.error("Error al iniciar sesión:", err);
    res.status(500).send("Error en el servidor");
  }
});

//========= Ruta para obtener el usuario (nombre) =========//
app.get('/get-usuario', (req, res) => {
  const nombre = req.cookies?.nombreUsuario || null;
  res.json({ nombre });
});

//========= Ruta para cerrar sesión ==========//
app.post('/logout', (req, res) => {
  res.clearCookie('nombreUsuario');
  res.redirect('/IniciarSesion.html');
});
//========= Ruta para enviar mensajes de contacto ==========//
app.post('/contacto', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Guardar en SQL Server
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO Mensajes (Nombre, Email, Mensaje)
      VALUES (${name}, ${email}, ${message})
    `;

    // Enviar correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kirito159489@gmail.com',
        pass: 'gwbx wscx jhqw uajj'
      }
    });

    await transporter.sendMail({
      from: `"Formulario Web RedPro" <${email}>`,
      to: 'kirito159489@gmail.com',
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensaje:</strong><br>${message}</p>
      `
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error al enviar el mensaje:", err);
    res.status(500).json({ success: false });
  }

  
});

// 🚀 Inicia el servidor
app.listen(3000, () => {
  console.log('✅ Servidor corriendo en: http://localhost:3000');
});


