const db = require('../config/database');

// Obtener todos los tickets
exports.getAllTickets = async (req, res) => {
  try {
    const snapshot = await db.collection('tickets').get();
    const tickets = [];

    if (snapshot && typeof snapshot.forEach === 'function') {
      snapshot.forEach(doc => {
        tickets.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }

    return res.json(tickets);
  } catch (error) {
    console.error("⚠️ Error consultando tickets:", error.message);
    return res.json([]);
  }
};

// Crear un nuevo ticket en Firestore
exports.createTicket = async (req, res) => {
  try {
    const { usuario, asunto, estado, prioridad, fecha_creacion_formateada, descripcion_html, archivo_zip } = req.body;

    const nuevoTicket = {
      usuario: usuario || 'Anónimo',
      asunto: asunto || 'Sin Asunto',
      estado: estado || 'Abierto',
      prioridad: prioridad || 'Media',
      fecha_creacion_formateada: fecha_creacion_formateada || new Date().toLocaleString(),
      fecha_creacion: new Date(),
      descripcion_html: descripcion_html || '',
      archivo_zip: archivo_zip || null,
      sla_vencido: false
    };

    const docRef = await db.collection('tickets').add(nuevoTicket);

    return res.status(201).json({
      mensaje: 'Ticket registrado correctamente',
      id: docRef.id
    });
  } catch (error) {
    console.error("⚠️ Error al crear ticket:", error.message);
    return res.status(500).json({ error: "No se pudo registrar el ticket." });
  }
};

// Obtener métricas
exports.getMetrics = async (req, res) => {
  try {
    const snapshot = await db.collection('tickets').get();
    let abiertos = 0, en_proceso = 0, sla_vencido = 0;

    if (snapshot && typeof snapshot.forEach === 'function') {
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.estado === 'Abierto') abiertos++;
        if (data.estado === 'En Proceso') en_proceso++;
        if (data.sla_vencido === true) sla_vencido++;
      });
    }

    return res.json({ abiertos, en_proceso, sla_vencido, alertas_stock: 0 });
  } catch (error) {
    console.error("⚠️ Error consultando métricas:", error.message);
    return res.json({ abiertos: 0, en_proceso: 0, sla_vencido: 0, alertas_stock: 0 });
  }
};