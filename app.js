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
// Obtener todos los tickets ordenados por fecha de creación ascendente
app.get('/api/tickets', async (req, res) => {
  try {
    const snapshot = await db.collection('tickets').orderBy('creadoEn', 'asc').get();
    const tickets = [];
    
    snapshot.forEach(doc => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
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
// Actualizar estado, tiempos y ventana de trabajo de un ticket
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      estado, 
      tiempoTrabajadoSegundos, 
      ultimaAccionTiempo, 
      ventanaInicio, 
      ventanaFin, 
      notaCoordinacion 
    } = req.body;

    const actualizacion = {
      actualizadoEn: new Date()
    };

    if (estado !== undefined) actualizacion.estado = estado;
    if (tiempoTrabajadoSegundos !== undefined) actualizacion.tiempoTrabajadoSegundos = tiempoTrabajadoSegundos;
    if (ultimaAccionTiempo !== undefined) actualizacion.ultimaAccionTiempo = ultimaAccionTiempo;
    if (ventanaInicio !== undefined) actualizacion.ventanaInicio = ventanaInicio;
    if (ventanaFin !== undefined) actualizacion.ventanaFin = ventanaFin;
    if (notaCoordinacion !== undefined) actualizacion.notaCoordinacion = notaCoordinacion;

    await db.collection('tickets').doc(id).update(actualizacion);

    res.json({ ok: true, mensaje: 'Ticket actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
});