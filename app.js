// Permite conexiones HTTPS ignorando interceptaciones de red/firewall
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const path = require('path');
const xlsx = require('xlsx');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));


// ==========================================
// 1. RUTAS DE VISTAS (NAVEGACIÓN)
// ==========================================

// La raíz '/' ahora abre directamente el Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/inventario.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'inventario.html'));
});

app.get('/api/inventory/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'inventario.html'));
});

app.get('/ordenes_compra.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ordenes_compra.html'));
});

app.get('/tickets.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tickets.html'));
});


// ==========================================
// 2. API: TICKETS DE SOPORTE
// ==========================================

// Obtener todos los tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const snapshot = await db.collection('tickets').get();
    const tickets = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      tickets.push({
        id: doc.id,
        docId: doc.id,
        codigoTicket: data.codigoTicket || data.correlativo || doc.id,
        usuario: data.usuario || data.cliente || 'Anónimo',
        cliente: data.cliente || data.usuario || 'Anónimo',
        titulo: data.asunto || data.titulo || 'Sin asunto',
        asunto: data.asunto || data.titulo || 'Sin asunto',
        descripcion: data.descripcion || data.descripcion_html || '',
        categoria: data.categoria || 'General',
        prioridad: data.prioridad || 'Media',
        estado: data.estado || 'Abierto',
        fechaCreacion: data.fecha_creacion_formateada || data.creadoEn || new Date().toLocaleString('es-PE'),
        fecha: data.fecha || data.fecha_creacion_formateada || data.creadoEn || new Date().toLocaleString('es-PE'),
        archivo_zip: data.archivo_zip || null
      });
    });

    console.log(`[TICKETS] Registros recuperados: ${tickets.length}`);
    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
});

// Crear nuevo ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const nuevoTicket = {
      codigoTicket: req.body.codigoTicket || `TCK-${Date.now().toString().slice(-5)}`,
      usuario: req.body.usuario || req.body.cliente || 'Anónimo',
      cliente: req.body.cliente || req.body.usuario || 'Anónimo',
      asunto: req.body.asunto || req.body.titulo || 'Sin asunto',
      titulo: req.body.titulo || req.body.asunto || 'Sin asunto',
      estado: req.body.estado || 'Abierto',
      prioridad: req.body.prioridad || 'Media',
      categoria: req.body.categoria || 'General',
      descripcion: req.body.descripcion || req.body.descripcion_html || '',
      descripcion_html: req.body.descripcion_html || req.body.descripcion || '',
      fecha_creacion_formateada: req.body.fecha_creacion_formateada || new Date().toLocaleString('es-PE'),
      archivo_zip: req.body.archivo_zip || null,
      creadoEn: new Date().toISOString()
    };

    const docRef = await db.collection('tickets').add(nuevoTicket);
    res.status(201).json({ id: docRef.id, ...nuevoTicket });
  } catch (error) {
    console.error('Error al guardar ticket:', error.message);
    res.status(500).json({ error: 'Error al registrar ticket' });
  }
});

// Actualizar ticket existente
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = { actualizadoEn: new Date().toISOString(), ...req.body };
    await db.collection('tickets').doc(id).update(actualizacion);
    res.json({ ok: true, mensaje: 'Ticket actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar ticket:', error);
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
});


// ==========================================
// 3. API: ACTIVOS E INVENTARIO (FIRESTORE)
// ==========================================

// Función auxiliar para obtener todos los activos (busca en 'activos' e 'inventario')
async function obtenerTodosLosActivos() {
  const activos = [];

  // 1. Consultar colección 'activos'
  const snapshotActivos = await db.collection('activos').get();
  snapshotActivos.forEach(doc => {
    const data = doc.data();
    activos.push({
      id: doc.id,
      docId: doc.id,
      tipo: data.tipo || data.item || 'Equipo TI',
      marca: data.marca || '',
      modelo: data.modelo || '',
      numeroSerie: data.numeroSerie || data.serie || 'SIN SERIE',
      codigoActivo: data.codigoActivo || `ACT-${doc.id}`,
      ubicacion: data.ubicacion || data.sede || 'Almacén Principal',
      estado: data.estado || 'OPERATIVO',
      usuarioAsignado: data.usuarioAsignado || data.usuario || 'Sin Asignar',
      nombreEquipo: data.nombreEquipo || '',
      empresa: data.empresa || 'ALPINA',
      ordenCompra: data.ordenCompra || '',
      observaciones: data.observaciones || ''
    });
  });

  // 2. Consultar colección 'inventario' (por si existen registros guardados allí)
  const snapshotInventario = await db.collection('inventario').get();
  snapshotInventario.forEach(doc => {
    const data = doc.data();
    // Evitar duplicados por id
    if (!activos.some(a => a.id === doc.id)) {
      activos.push({
        id: doc.id,
        docId: doc.id,
        tipo: data.tipo || 'Equipo TI',
        marca: data.marca || '',
        modelo: data.modelo || '',
        numeroSerie: data.numeroSerie || 'SIN SERIE',
        codigoActivo: data.codigoActivo || `ACT-${doc.id}`,
        ubicacion: data.ubicacion || 'Almacén Principal',
        estado: data.estado || 'Disponible',
        usuarioAsignado: data.usuarioAsignado || 'Sin Asignar',
        nombreEquipo: data.nombreEquipo || '',
        empresa: data.empresa || 'ALPINA',
        ordenCompra: data.ordenCompra || '',
        observaciones: data.observaciones || ''
      });
    }
  });

  return activos;
}

// Obtener lista completa de activos
app.get('/api/activos', async (req, res) => {
  try {
    const activos = await obtenerTodosLosActivos();
    console.log(`[ACTIVOS] Registros recuperados: ${activos.length}`);
    res.json(activos);
  } catch (error) {
    console.error('Error al obtener activos:', error);
    res.status(500).json({ error: 'Error al consultar activos' });
  }
});

// Endpoint alternativo /api/inventory para compatibilidad
app.get('/api/inventory', async (req, res) => {
  try {
    const activos = await obtenerTodosLosActivos();
    res.json(activos);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    res.status(500).json({ error: 'Error al consultar inventario' });
  }
});

// Guardar activo individual manualmente
app.post('/api/inventory', async (req, res) => {
  try {
    const body = req.body;
    const nuevoActivo = {
      tipo: body.tipo || '',
      marca: body.marca || '',
      modelo: body.modelo || '',
      numeroSerie: body.numeroSerie || '',
      codigoActivo: body.codigoActivo || `ACT-${Date.now()}`,
      ubicacion: body.ubicacion || 'Almacén Principal',
      estado: body.estado || 'Disponible',
      ordenCompra: body.ordenCompra || '',
      fechaCreacion: new Date()
    };

    const docRef = await db.collection('activos').add(nuevoActivo);
    res.json({ id: docRef.id, message: "Equipo agregado con éxito" });
  } catch (error) {
    console.error("Error al guardar equipo:", error);
    res.status(500).json({ error: "Error de servidor al guardar equipo" });
  }
});

// Carga Masiva desde Excel
app.post('/api/activos/cargar-excel', async (req, res) => {
  try {
    const { base64File } = req.body;
    if (!base64File) return res.status(400).json({ error: 'No se envió archivo Excel' });

    const buffer = Buffer.from(base64File, 'base64');
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 1. Obtener filas
    const rawMatrix = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (!rawMatrix || rawMatrix.length === 0) {
      return res.status(400).json({ error: 'El archivo Excel está completamente vacío.' });
    }

    // 2. Buscar encabezados
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, rawMatrix.length); i++) {
      const rowStr = rawMatrix[i].map(cell => String(cell).toUpperCase()).join(' ');
      if (rowStr.includes('ITEM') || rowStr.includes('MARCA') || rowStr.includes('SERIE') || rowStr.includes('EMPRESA')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) headerRowIndex = 0;

    // 3. Extraer datos
    const rawRows = xlsx.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: '' });

    const batch = db.batch();
    let procesados = 0;

    rawRows.forEach((rawRow, index) => {
      const row = {};
      Object.keys(rawRow).forEach(key => {
        const cleanKey = key
          .trim()
          .toUpperCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        row[cleanKey] = String(rawRow[key]).trim();
      });

      const getVal = (...keys) => {
        for (const k of keys) {
          const searchKey = k.trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (row[searchKey] !== undefined && row[searchKey] !== '') {
            return row[searchKey];
          }
        }
        return '';
      };

      const item = getVal('ITEM', 'TIPO', 'EQUIPO');
      const serie = getVal('SERIE', 'SN', 'N/S', 'NUMERO DE SERIE');
      const marca = getVal('MARCA');
      const modelo = getVal('MODELO');
      const nombreEquipo = getVal('NOMBRE DE EQUIPO', 'NOMBRE EQUIPO', 'HOSTNAME');
      const usuario = getVal('USUARIO', 'RESPONSABLE');

      if (!item && !serie && !marca && !nombreEquipo && !usuario) return;

      const docRef = db.collection('activos').doc();
      const activoData = {
        tipo: item || 'Equipo TI',
        empresa: getVal('EMPRESA') || 'ALPINA',
        sede: getVal('SEDE') || '',
        contacto: getVal('CONTACTO') || '',
        usuarioAsignado: usuario || 'Sin Asignar',
        nombreEquipo: nombreEquipo || '',
        marca: marca || '',
        modelo: modelo || '',
        numeroSerie: (serie && serie !== 'SD' && serie !== 'SIN SERIE') ? serie : 'SIN SERIE',
        imei: getVal('IMEI') || 'SD',
        anioFabricacion: getVal('ANO FABRICACION', 'AÑO FABRICACION') || null,
        fechaAdquisicion: getVal('ADQUISICION', 'FECHA DE ADQUISICION') || '',
        valorCompra: getVal('VALOR DE COMPRA', 'PRECIO', 'COSTO') || '',
        estado: getVal('ESTADO OPERATIVO/INOPERATIVO', 'ESTADO') || 'OPERATIVO',
        observaciones: getVal('OBS', 'OBSERVACIONES') || '',
        segundoUso: getVal('SEGUNDO USO') || 'NO',
        usuarioSegundoUso: getVal('USUARIO SEGUNDO USO') || '',
        desechado: getVal('DESECHADO SI/NO', 'DESECHADO') || 'NO',
        fechaDesecho: getVal('FECHA DE DESECHO', 'FECHA DESECHO') || '',
        usuarioLocal: getVal('USUARIO LOCAL') || '',
        credencialesLocal: getVal('CONTRASENA', 'CONTRASEÑA') || '',
        ubicacion: getVal('UBICACION', 'SEDE') || 'Almacén',
        
        licencias: {
          windows: getVal('LICENCIA WINDOWS', 'KEY WINDOWS') || 'De Fábrica / OEM',
          office: getVal('LICENCIA OFFICE', 'KEY OFFICE') || '',
          autocad: getVal('LICENCIA AUTOCAD') || '',
          otras: getVal('OTRAS LICENCIAS') || ''
        },

        codigoActivo: (serie && serie !== 'SD' && serie !== 'SIN SERIE')
          ? `ACT-${serie}`
          : `MNG-HER-${Date.now()}-${index}`,
        esHeredado: true,
        fechaCreacion: new Date()
      };

      batch.set(docRef, activoData);
      procesados++;
    });

    if (procesados === 0) {
      return res.status(400).json({ error: 'No se encontraron filas con datos de equipos en el archivo.' });
    }

    await batch.commit();
    res.json({ ok: true, mensaje: `¡Éxito! Se importaron ${procesados} activos correctamente a Firestore.` });

  } catch (error) {
    console.error('Error al importar Excel:', error);
    res.status(500).json({ error: 'Error al procesar el archivo Excel: ' + error.message });
  }
});

// Vaciar inventario de Firestore
app.delete('/api/activos/vaciar', async (req, res) => {
  try {
    const snapshotActivos = await db.collection('activos').get();
    const snapshotInventario = await db.collection('inventario').get();

    if (snapshotActivos.empty && snapshotInventario.empty) {
      return res.json({ ok: true, mensaje: 'El inventario ya está vacío.' });
    }

    const batch = db.batch();
    snapshotActivos.docs.forEach(doc => batch.delete(doc.ref));
    snapshotInventario.docs.forEach(doc => batch.delete(doc.ref));

    await batch.commit();
    res.json({ ok: true, mensaje: 'Se han eliminado todos los activos correctamente.' });
  } catch (error) {
    console.error('Error al vaciar inventario:', error);
    res.status(500).json({ error: 'Error al vaciar la base de datos de activos' });
  }
});


// ==========================================
// 4. API: ÓRDENES DE COMPRA
// ==========================================

// Obtener todas las órdenes de compra
app.get('/api/ordenes-compra', async (req, res) => {
  try {
    const snapshot = await db.collection('ordenes_compra').get();
    const ordenes = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      let itemsProcesados = [];
      if (typeof data.items === 'string' && data.items.trim() !== '') {
        try { itemsProcesados = JSON.parse(data.items); } catch(e) { itemsProcesados = []; }
      } else if (Array.isArray(data.items)) {
        itemsProcesados = data.items;
      }

      ordenes.push({
        id: doc.id,
        docId: doc.id,
        numeroOC: data.numeroOC || '',
        proveedor: data.proveedor || '',
        rucProveedor: data.rucProveedor || '',
        montoTotalUSD: parseFloat(data.montoTotalUSD || 0),
        fechaEmision: data.fechaEmision || '',
        estado: data.estado || 'Registrada',
        pdfCotizacionZip: data.pdfCotizacionZip || null,
        items: itemsProcesados
      });
    });

    console.log(`[ÓRDENES COMPRA] Registros recuperados: ${ordenes.length}`);
    res.json(ordenes);
  } catch (error) {
    console.error('Error al obtener ordenes de compra:', error);
    res.status(500).json({ error: 'Error al consultar órdenes de compra' });
  }
});

// Crear nueva orden de compra
app.post('/api/ordenes-compra', async (req, res) => {
  try {
    const body = req.body;
    const nuevaOC = {
      numeroOC: body.numeroOC || '',
      proveedor: body.proveedor || '',
      rucProveedor: body.rucProveedor || '',
      montoTotalUSD: Number(body.montoTotalUSD) || 0,
      fechaEmision: body.fechaEmision || '',
      estado: 'Registrada',
      pdfCotizacionZip: body.pdfCotizacionZip || '',
      items: body.items || [],
      fechaCreacion: new Date()
    };

    const docRef = await db.collection('ordenes_compra').add(nuevaOC);
    res.json({ id: docRef.id, message: "Orden de compra guardada exitosamente" });
  } catch (error) {
    console.error("Error guardando OC:", error);
    res.status(500).json({ error: "Error de servidor al guardar la orden" });
  }
});

// Recepcionar equipos de una Orden de Compra e ingresarlos automáticamente al Inventario
app.post('/api/ordenes-compra/:id/recepcionar', async (req, res) => {
  try {
    const docId = req.params.id;
    const { activosAIngresar } = req.body;

    if (!Array.isArray(activosAIngresar)) {
      return res.status(400).json({ error: "Se requiere la lista de activos a ingresar" });
    }

    const batch = db.batch();

    // 1. Registrar cada activo en la colección 'activos'
    for (const activo of activosAIngresar) {
      const docRef = db.collection('activos').doc();
      batch.set(docRef, {
        tipo: activo.tipo || 'Equipo TI',
        marca: activo.marca || '',
        modelo: activo.modelo || '',
        numeroSerie: activo.numeroSerie || 'SIN SERIE',
        codigoActivo: activo.codigoActivo || `ACT-${Date.now()}`,
        ubicacion: activo.ubicacion || 'Almacén Principal',
        estado: activo.estado || 'Disponible',
        ordenCompra: activo.ordenCompra || '',
        fechaCreacion: new Date()
      });
    }

    // 2. Actualizar el estado de la Orden de Compra a 'Recepcionada'
    const ocRef = db.collection('ordenes_compra').doc(docId);
    batch.update(ocRef, { estado: 'Recepcionada' });

    await batch.commit();
    res.json({ message: "Recepción procesada e inventario actualizado." });
  } catch (error) {
    console.error("Error recepcionando orden:", error);
    res.status(500).json({ error: "Error al procesar la recepción" });
  }
});


// ==========================================
// 5. INICIALIZACIÓN DEL SERVIDOR
// ==========================================

app.listen(PORT, () => {
  console.log(`✅ Conexión con Firestore restablecida mediante SDK oficial.`);
  console.log(`🚀 Servidor ManagerTI corriendo en http://localhost:${PORT}`);
});