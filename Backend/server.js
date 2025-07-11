/**
 * SERVER.JS - Servidor backend Express para RedPro Academy
 * 
 * Secciones:
 * - Configuración inicial y middlewares
 * - Configuración de base de datos
 * - Rutas de autenticación
 * - Rutas de cursos
 * - Rutas de contacto
 * - Rutas de órdenes de compra
 * - Configuración del servidor
 */

// =====================================================
// CONFIGURACIÓN INICIAL
// =====================================================

const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '..', 'public')));

// =====================================================
// CONFIGURACIÓN DE BASE DE DATOS Y ALMACENAMIENTO TEMPORAL
// =====================================================
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456789',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || 'RedesProBD',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Almacenamiento temporal en memoria para desarrollo
let usuariosTemp = [
  {
    id: 1,
    nombres: 'Usuario',
    apellidos: 'Demo',
    email: 'demo@redpro.com',
    celular: '987654321',
    contrasena: '123456'
  }
];

let mensajesTemp = [];
let ordenesTemp = [];

// =====================================================
// RUTAS PRINCIPALES
// =====================================================

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// API status endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 RedPro Academy API Server',
    version: '2.0.0',
    status: 'active',
    endpoints: {
      auth: ['/login', '/registro', '/logout', '/get-usuario'],
      data: ['/cursos', '/contacto', '/procesar-orden']
    }
  });
});

// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================

// Ruta para registrar usuarios
app.post('/registro', async (req, res) => {
  console.log('🔍 Datos recibidos en /registro:', req.body);
  const { nombres, apellidos, email, celular, password, confirmar } = req.body;

  if (password !== confirmar) {
    console.log('❌ Error: Las contraseñas no coinciden');
    return res.status(400).json({ success: false, error: "Las contraseñas no coinciden" });
  }

  // Verificar si el email ya existe en almacenamiento temporal
  const usuarioExistente = usuariosTemp.find(u => u.email === email);
  if (usuarioExistente) {
    console.log('❌ Error: Email ya registrado');
    return res.status(400).json({ success: false, error: "Este email ya está registrado" });
  }

  try {
    console.log('📡 Intentando conectar a la base de datos...');
    await sql.connect(dbConfig);
    console.log('✅ Conexión a BD exitosa');
    
    console.log('💾 Insertando usuario en la BD...');
    await sql.query`
      INSERT INTO Usuarios (Nombres, Apellidos, Email, Celular, Contrasena)
      VALUES (${nombres}, ${apellidos}, ${email}, ${celular}, ${password})
    `;
    console.log('✅ Usuario insertado en BD exitosamente');
    
    res.json({ success: true, message: 'Usuario registrado exitosamente en BD' });
  } catch (err) {
    console.error("⚠️ Error de BD, usando almacenamiento temporal:", err.message);
    
    // Fallback: Guardar en almacenamiento temporal
    const nuevoUsuario = {
      id: usuariosTemp.length + 1,
      nombres,
      apellidos,
      email,
      celular,
      contrasena: password
    };
    
    usuariosTemp.push(nuevoUsuario);
    console.log('✅ Usuario guardado en almacenamiento temporal');
    console.log('👥 Usuarios actuales:', usuariosTemp.map(u => ({ id: u.id, email: u.email, nombres: u.nombres })));
    
    res.json({ success: true, message: 'Usuario registrado exitosamente (modo desarrollo)' });
  }
});

app.get('/cursos', async (req, res) => {
  try {
    await sql.connect(dbConfig);

    let query = 'SELECT * FROM Cursos';
    const limit = parseInt(req.query.limit, 10);

    if (!isNaN(limit) && limit > 0) {
      query = `SELECT TOP (${limit}) * FROM Cursos`;
    }

    const result = await sql.query(query);
    
    // Si no hay cursos en la BD, usar datos de ejemplo
    if (result.recordset.length === 0) {
      console.log("⚠️ No se encontraron cursos en la BD, usando datos de ejemplo");
      return res.json(getCursosEjemplo(limit));
    }
    
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al obtener cursos:", err);
    console.log("🔄 Usando cursos de ejemplo como fallback");
    
    // En caso de error, devolver cursos de ejemplo
    const limit = parseInt(req.query.limit, 10);
    res.json(getCursosEjemplo(limit));
  }
});

// Función para obtener cursos de ejemplo
function getCursosEjemplo(limit) {
  const cursosEjemplo = [
    {
      ID: 1,
      Titulo: "CCNA 200-301: Fundamentos de Redes",
      Autor: "Laura Martínez",
      Precio: 299.99,
      Descuento: 399.99,
      Imagen: "Imagenes/ccna.jpg",
      Categoria: "Cisco",
      Duracion: "40h",
      Estudiantes: "1,200+"
    },
    {
      ID: 2,
      Titulo: "Ethical Hacking y Pentesting",
      Autor: "Carlos Herrera",
      Precio: 349.99,
      Descuento: 449.99,
      Imagen: "Imagenes/curso2.jpg",
      Categoria: "Ciberseguridad",
      Duracion: "35h",
      Estudiantes: "850+"
    },
    {
      ID: 3,
      Titulo: "Seguridad en Redes Empresariales",
      Autor: "Ana Torres",
      Precio: 279.99,
      Descuento: 379.99,
      Imagen: "Imagenes/curso3.jpg",
      Categoria: "Seguridad",
      Duracion: "30h",
      Estudiantes: "650+"
    },
    {
      ID: 4,
      Titulo: "Cloud Security AWS/Azure",
      Autor: "Miguel Santos",
      Precio: 399.99,
      Descuento: 499.99,
      Imagen: "Imagenes/curso4.jpg",
      Categoria: "Cloud",
      Duracion: "45h",
      Estudiantes: "920+"
    },
    {
      ID: 5,
      Titulo: "FortiGate Firewall Administration",
      Autor: "Sofia Rodriguez",
      Precio: 259.99,
      Descuento: 359.99,
      Imagen: "Imagenes/curso5.jpg",
      Categoria: "Firewall",
      Duracion: "25h",
      Estudiantes: "580+"
    },
    {
      ID: 6,
      Titulo: "Python para Administradores de Red",
      Autor: "David Castro",
      Precio: 229.99,
      Descuento: 329.99,
      Imagen: "Imagenes/curso6.jpg",
      Categoria: "Programación",
      Duracion: "35h",
      Estudiantes: "750+"
    },
    {
      ID: 7,
      Titulo: "Redes Inalámbricas y WiFi 6",
      Autor: "Valeria León",
      Precio: 199.99,
      Descuento: 299.99,
      Imagen: "Imagenes/curso7.jpg",
      Categoria: "Wireless",
      Duracion: "28h",
      Estudiantes: "620+"
    },
    {
      ID: 8,
      Titulo: "Monitoreo con Wireshark",
      Autor: "Roberto Mendez",
      Precio: 179.99,
      Descuento: 249.99,
      Imagen: "Imagenes/curso8.jpg",
      Categoria: "Monitoreo",
      Duracion: "20h",
      Estudiantes: "480+"
    },
    {
      ID: 9,
      Titulo: "Docker y Containers Networking",
      Autor: "Elena Vasquez",
      Precio: 319.99,
      Descuento: 419.99,
      Imagen: "Imagenes/curso9.jpg",
      Categoria: "DevOps",
      Duracion: "32h",
      Estudiantes: "390+"
    },
    {
      ID: 10,
      Titulo: "Kubernetes Network Policies",
      Autor: "Fernando Ramos",
      Precio: 369.99,
      Descuento: 469.99,
      Imagen: "Imagenes/curso10.jpg",
      Categoria: "DevOps",
      Duracion: "38h",
      Estudiantes: "310+"
    },
    {
      ID: 11,
      Titulo: "OSPF y BGP Routing Protocols",
      Autor: "Gabriela Muñoz",
      Precio: 289.99,
      Descuento: 389.99,
      Imagen: "Imagenes/curso11.jpg",
      Categoria: "Routing",
      Duracion: "42h",
      Estudiantes: "420+"
    },
    {
      ID: 12,
      Titulo: "Network Automation con Ansible",
      Autor: "Jorge Palacios",
      Precio: 339.99,
      Descuento: 439.99,
      Imagen: "Imagenes/curso12.jpg",
      Categoria: "Automatización",
      Duracion: "36h",
      Estudiantes: "290+"
    }
  ];

  if (!isNaN(limit) && limit > 0) {
    return cursosEjemplo.slice(0, limit);
  }
  
  return cursosEjemplo;
}
// Manejo de errores globales
process.on('uncaughtException', err => {
  console.error('❌ Error no capturado:', err);
});

process.on('unhandledRejection', err => {
  console.error('❌ Promesa no manejada:', err);
});

//========= Ruta para iniciar sesión ==========//
app.post('/login', async (req, res) => {
  console.log('🔐 Intento de login:', { email: req.body.email });
  const { email, password } = req.body;

  try {
    console.log('📡 Intentando autenticar con BD...');
    await sql.connect(dbConfig);
    const result = await sql.query`
      SELECT * FROM Usuarios WHERE Email = ${email} AND Contrasena = ${password}
    `;

    if (result.recordset.length === 0) {
      console.log('❌ Usuario no encontrado en BD');
      throw new Error('Usuario no encontrado en BD');
    }

    const usuario = result.recordset[0];
    console.log('✅ Login exitoso desde BD');

    // Guardar el nombre del usuario en una cookie
    res.cookie('nombreUsuario', usuario.Nombres, { httpOnly: false });
    res.json({ success: true, message: 'Inicio de sesión exitoso', user: usuario.Nombres });

  } catch (err) {
    console.log("⚠️ Error de BD, intentando con almacenamiento temporal:", err.message);
    
    // Fallback: Buscar en almacenamiento temporal
    const usuario = usuariosTemp.find(u => u.email === email && u.contrasena === password);
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado en almacenamiento temporal');
      return res.status(401).json({ success: false, error: "Correo o contraseña incorrectos" });
    }
    
    console.log('✅ Login exitoso desde almacenamiento temporal');
    console.log('👤 Usuario logueado:', { nombres: usuario.nombres, email: usuario.email });
    
    // Guardar el nombre del usuario en una cookie
    res.cookie('nombreUsuario', usuario.nombres, { httpOnly: false });
    res.json({ success: true, message: 'Inicio de sesión exitoso (modo desarrollo)', user: usuario.nombres });
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
  res.json({ success: true, message: 'Sesión cerrada exitosamente' });
});
//========= Ruta para enviar mensajes de contacto ==========//
app.post('/contacto', async (req, res) => {
  const { name, email, message } = req.body;

  // Validar datos de entrada
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Todos los campos son obligatorios' 
    });
  }

  try {
    // Guardar en SQL Server
    await sql.connect(dbConfig);
    await sql.query`
      INSERT INTO Mensajes (Nombre, Email, Mensaje)
      VALUES (${name}, ${email}, ${message})
    `;
    
    console.log('✅ Mensaje guardado en la base de datos');

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'kirito159489@gmail.com',
        pass: process.env.EMAIL_PASS || 'gwbx wscx jhqw uajj'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verificar conexión del transporter
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada');

    // Configurar el correo
    const mailOptions = {
      from: '"Formulario Web RedPro" <kirito159489@gmail.com>',
      to: 'kirito159489@gmail.com',
      replyTo: email,
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nuevo mensaje desde RedPro Academy</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensaje:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 3px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Este mensaje fue enviado desde el formulario de contacto de RedPro Academy.
          </p>
        </div>
      `
    };

    // Enviar el correo al administrador
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado al administrador:', info.messageId);

    // Configurar y enviar correo de confirmación al usuario
    const confirmationOptions = {
      from: '"RedPro Academy" <kirito159489@gmail.com>',
      to: email,
      subject: 'Confirmación de mensaje recibido - RedPro Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">RedPro Academy</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Educación de calidad en redes y tecnología</p>
            </div>
            
            <h2 style="color: #27ae60; margin-bottom: 20px;">¡Mensaje recibido exitosamente!</h2>
            
            <p style="color: #34495e; line-height: 1.6;">Hola <strong>${name}</strong>,</p>
            
            <p style="color: #34495e; line-height: 1.6;">
              Hemos recibido tu mensaje y queremos confirmarte que llegó correctamente a nuestro equipo. 
              Nos pondremos en contacto contigo lo antes posible.
            </p>
            
            <div style="background: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Resumen de tu mensaje:</h3>
              <p style="margin: 10px 0;"><strong>Nombre:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Mensaje:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 3px; margin-top: 10px; color: #2c3e50;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">
              <strong>Tiempo de respuesta estimado:</strong> 24-48 horas hábiles
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #7f8c8d; font-size: 14px;">
                Mientras tanto, puedes explorar nuestros cursos en:
              </p>
              <a href="https://TU-SITIO-NETLIFY.netlify.app/Cursos.html" 
                 style="display: inline-block; background: #3498db; color: white; padding: 12px 25px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">
                Ver Cursos
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">
                Este es un correo automático, por favor no responder a esta dirección.
              </p>
              <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">
                © 2025 RedPro Academy - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Enviar correo de confirmación
    const confirmationInfo = await transporter.sendMail(confirmationOptions);
    console.log('✅ Correo de confirmación enviado al usuario:', confirmationInfo.messageId);

    res.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente y confirmación enviada a tu email',
      messageId: info.messageId,
      confirmationId: confirmationInfo.messageId
    });

  } catch (err) {
    console.error("❌ Error al enviar el mensaje:", err);
    
    // Log más detallado del error
    if (err.code) {
      console.error("Código de error:", err.code);
    }
    if (err.response) {
      console.error("Respuesta del servidor:", err.response);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

//========= Ruta para procesar órdenes de compra ==========//
app.post('/procesar-orden', async (req, res) => {
  console.log('🛒 Datos de orden recibidos:', JSON.stringify(req.body, null, 2));
  
  const { customer, items, total, paymentMethod, discount } = req.body;

  // Validar datos de entrada
  if (!customer || !customer.name || !customer.email || !items || items.length === 0) {
    console.log('❌ Datos de orden incompletos:', { customer, items });
    return res.status(400).json({ 
      success: false, 
      error: 'Datos de orden incompletos' 
    });
  }

  try {
    // Generar número de orden único
    const orderNumber = 'RP' + Date.now();
    console.log(`🔢 Número de orden generado: ${orderNumber}`);
    
    // Intentar conectar y guardar en SQL Server
    try {
      console.log('📡 Intentando conectar a la base de datos para orden...');
      await sql.connect(dbConfig);
      console.log('✅ Conexión a BD exitosa para orden');
      
      // Verificar si las tablas existen, si no, usar almacenamiento temporal
      try {
        const orderResult = await sql.query`
          INSERT INTO Ordenes (NumeroOrden, NombreCliente, EmailCliente, TelefonoCliente, DNICliente, 
                              Total, MetodoPago, Descuento, FechaOrden, Estado)
          VALUES (${orderNumber}, ${customer.name}, ${customer.email}, ${customer.phone}, 
                  ${customer.dni}, ${total}, ${paymentMethod}, ${discount || 0}, 
                  GETDATE(), 'Pendiente')
          SELECT SCOPE_IDENTITY() as OrderId
        `;

        const orderId = orderResult.recordset[0].OrderId;
        console.log(`💾 Orden insertada con ID: ${orderId}`);

        // Guardar items de la orden
        for (const item of items) {
          await sql.query`
            INSERT INTO OrdenItems (OrdenId, CursoId, NombreCurso, Precio, Cantidad)
            VALUES (${orderId}, ${item.id}, ${item.nombre}, ${item.precio}, ${item.cantidad || 1})
          `;
        }

        console.log(`✅ Orden ${orderNumber} guardada en la base de datos`);
      } catch (dbError) {
        console.log('⚠️ Error con tablas de órdenes, usando almacenamiento temporal:', dbError.message);
        
        // Guardar en memoria temporal si las tablas no existen
        if (!global.ordenesTemporales) {
          global.ordenesTemporales = [];
        }
        
        const ordenTemporal = {
          numeroOrden: orderNumber,
          customer,
          items,
          total,
          paymentMethod,
          discount: discount || 0,
          fecha: new Date().toISOString(),
          estado: 'Pendiente'
        };
        
        global.ordenesTemporales.push(ordenTemporal);
        console.log(`📝 Orden ${orderNumber} guardada temporalmente`);
      }
    } catch (connectionError) {
      console.log('⚠️ Error de conexión BD, usando almacenamiento temporal:', connectionError.message);
      
      // Almacenamiento temporal si no hay conexión a BD
      if (!global.ordenesTemporales) {
        global.ordenesTemporales = [];
      }
      
      const ordenTemporal = {
        numeroOrden: orderNumber,
        customer,
        items,
        total,
        paymentMethod,
        discount: discount || 0,
        fecha: new Date().toISOString(),
        estado: 'Pendiente'
      };
      
      global.ordenesTemporales.push(ordenTemporal);
      console.log(`📝 Orden ${orderNumber} guardada temporalmente`);
    }

    // Configurar correo de confirmación de orden
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'kirito159489@gmail.com',
        pass: process.env.EMAIL_PASS || 'gwbx wscx jhqw uajj'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Generar HTML de la orden
    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.nombre}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad || 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">S/ ${item.precio}</td>
      </tr>
    `).join('');

    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.precio) * (item.cantidad || 1)), 0);
    const discountAmount = subtotal * ((discount || 0) / 100);
    const igv = (subtotal - discountAmount) * 0.18;
    const finalTotal = subtotal - discountAmount + igv;

    // Correo al cliente
    const customerMailOptions = {
      from: '"RedPro Academy" <kirito159489@gmail.com>',
      to: customer.email,
      subject: `Confirmación de compra #${orderNumber} - RedPro Academy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">RedPro Academy</h1>
              <p style="color: #7f8c8d; margin: 5px 0;">Confirmación de compra</p>
            </div>
            
            <h2 style="color: #27ae60; margin-bottom: 20px;">¡Gracias por tu compra!</h2>
            
            <p style="color: #34495e; line-height: 1.6;">Hola <strong>${customer.name}</strong>,</p>
            
            <p style="color: #34495e; line-height: 1.6;">
              Hemos recibido tu orden exitosamente. A continuación encontrarás los detalles de tu compra:
            </p>
            
            <div style="background: #ecf0f1; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">Orden #${orderNumber}</h3>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-PE')}</p>
              <p><strong>Método de pago:</strong> ${paymentMethod === 'tarjeta' ? 'Tarjeta de crédito/débito' : 
                                                   paymentMethod === 'yape' ? 'Yape' : 'Transferencia bancaria'}</p>
            </div>
            
            <h3 style="color: #2c3e50;">Cursos adquiridos:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #34495e; color: white;">
                  <th style="padding: 10px; text-align: left;">Curso</th>
                  <th style="padding: 10px; text-align: center;">Cantidad</th>
                  <th style="padding: 10px; text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
              <p>Subtotal: S/ ${subtotal.toFixed(2)}</p>
              ${discount ? `<p style="color: #27ae60;">Descuento (${discount}%): -S/ ${discountAmount.toFixed(2)}</p>` : ''}
              <p>IGV (18%): S/ ${igv.toFixed(2)}</p>
              <h3 style="color: #2c3e50;">Total: S/ ${finalTotal.toFixed(2)}</h3>
            </div>
            
            <div style="background: #3498db; color: white; padding: 20px; border-radius: 5px; margin: 30px 0; text-align: center;">
              <h4 style="margin: 0;">¡Ya puedes acceder a tus cursos!</h4>
              <p style="margin: 10px 0;">Inicia sesión en tu cuenta para comenzar a aprender</p>
              <a href="https://TU-SITIO-NETLIFY.netlify.app/IniciarSesion.html" 
                 style="display: inline-block; background: white; color: #3498db; padding: 10px 20px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">
                Acceder a mis cursos
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">
                Si tienes alguna pregunta, contáctanos en kirito159489@gmail.com
              </p>
              <p style="color: #7f8c8d; font-size: 12px; margin: 5px 0;">
                © 2025 RedPro Academy - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Correo al administrador
    const adminMailOptions = {
      from: '"Sistema RedPro" <kirito159489@gmail.com>',
      to: 'kirito159489@gmail.com',
      subject: `Nueva orden de compra #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nueva orden recibida</h2>
          <p><strong>Número de orden:</strong> ${orderNumber}</p>
          <p><strong>Cliente:</strong> ${customer.name}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Teléfono:</strong> ${customer.phone}</p>
          <p><strong>DNI:</strong> ${customer.dni}</p>
          <p><strong>Total:</strong> S/ ${finalTotal.toFixed(2)}</p>
          <p><strong>Método de pago:</strong> ${paymentMethod}</p>
          
          <h3>Items:</h3>
          <ul>
            ${items.map(item => `<li>${item.nombre} - S/ ${item.precio}</li>`).join('')}
          </ul>
        </div>
      `
    };

    // Enviar correos
    // Intentar enviar correos (opcional)
    try {
      console.log('📧 Intentando enviar correos de confirmación...');
      await transporter.sendMail(customerMailOptions);
      await transporter.sendMail(adminMailOptions);
      console.log(`✅ Correos de confirmación enviados para orden ${orderNumber}`);
    } catch (emailError) {
      console.log('⚠️ Error al enviar correos (continuando con la orden):', emailError.message);
      // No detener el proceso si hay error en correos
    }

    // Respuesta siempre exitosa si llegamos aquí
    console.log(`🎉 Orden ${orderNumber} procesada exitosamente`);
    res.json({ 
      success: true, 
      orderNumber: orderNumber,
      message: 'Orden procesada exitosamente'
    });

  } catch (err) {
    console.error("❌ Error al procesar orden:", err);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor al procesar la orden'
    });
  }
});

// 🚀 Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`);
});


