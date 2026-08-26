// Permite conexiones HTTPS ignorando interceptaciones del firewall corporativo
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const path = require('path');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para procesar JSON y datos de formularios
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));

// === RUTAS DE LA API DE TICKETS ===

// 1. Obtener todos los tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const snapshot = await db.collection('tickets').get();
    const tickets = [];
    
    snapshot.forEach(doc => {
      tickets.push({ id: doc.id, ...doc.data() });
    });

    res.json(tickets);
  } catch (error) {
    console.error('⚠️ Error consultando tickets:', error.message);
    res.status(500).json({ error: 'Error consultando tickets en la base de datos' });
  }
});

// 2. Crear un nuevo ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const nuevoTicket = {
      usuario: req.body.usuario || 'Anónimo',
      asunto: req.body.asunto || 'Sin asunto',
      estado: req.body.estado || 'Abierto',
      prioridad: req.body.prioridad || 'Media',
      fecha_creacion_formateada: req.body.fecha_creacion_formateada || new Date().toLocaleString('es-PE'),
      descripcion_html: req.body.descripcion_html || '',
      archivo_zip: req.body.archivo_zip || null,
      creadoEn: new Date().toISOString()
    };

    const docRef = await db.collection('tickets').add(nuevoTicket);
    console.log('✅ Ticket guardado exitosamente con ID:', docRef.id);
    
    res.status(201).json({ id: docRef.id, ...nuevoTicket });
  } catch (error) {
    console.error('⚠️ Error al guardar ticket:', error.message);
    res.status(500).json({ error: 'Error al intentar registrar el ticket' });
  }
});

// Ruta principal para servir la vista de tickets
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tickets.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Mesa de Ayuda corriendo en http://localhost:${PORT}`);
});