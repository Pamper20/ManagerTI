const db = require('../config/database');

// 1. Obtener tareas del día y calcular porcentaje de avance
exports.getDailyTasks = async (req, res) => {
  try {
    const { usuarioId } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let query = db.collection('tareas_rutinarias');
    if (usuarioId) {
      query = query.where('usuarioId', '==', usuarioId);
    }

    const snapshot = await query.get();
    const tareas = [];
    let completadas = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const ultimaEjecucion = data.historialCumplimiento?.[data.historialCumplimiento.length - 1];
      const esCompletadaHoy = ultimaEjecucion && ultimaEjecucion.fecha === today && ultimaEjecucion.completado;

      if (esCompletadaHoy) completadas++;

      tareas.push({
        id: doc.id,
        ...data,
        completadaHoy: Boolean(esCompletadaHoy)
      });
    });

    const total = tareas.length;
    const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      resumen: {
        total,
        completadas,
        porcentaje
      },
      data: tareas
    });
  } catch (error) {
    console.error('Error al obtener tareas diarias:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Crear una nueva rutina o tarea programada
exports.createTask = async (req, res) => {
  try {
    const { titulo, descripcion, frecuencia, diasProgramados, puesto, usuarioId } = req.body;

    if (!titulo || !frecuencia) {
      return res.status(400).json({
        success: false,
        message: 'El título y la frecuencia son obligatorios.'
      });
    }

    const nuevaTarea = {
      titulo,
      descripcion: descripcion || '',
      frecuencia, // 'diaria', 'semanal', 'mensual', 'anual', 'personalizado'
      diasProgramados: diasProgramados || [],
      puesto: puesto || 'General',
      usuarioId: usuarioId || 'usr_default',
      estado: 'activa',
      creadoEn: new Date().toISOString(),
      historialCumplimiento: []
    };

    const docRef = await db.collection('tareas_rutinarias').add(nuevaTarea);

    return res.status(201).json({
      success: true,
      id: docRef.id,
      data: nuevaTarea
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Marcar o desmarcar tarea realizada hoy (Toggle)
exports.toggleTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { completado } = req.body; // boolean
    const today = new Date().toISOString().split('T')[0];

    const taskRef = db.collection('tareas_rutinarias').doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada.' });
    }

    const data = doc.data();
    let historial = data.historialCumplimiento || [];

    // Remover registro previo de hoy si existe
    historial = historial.filter(h => h.fecha !== today);

    // Si se marca como realizada, agregar entrada de hoy
    if (completado) {
      historial.push({
        fecha: today,
        completado: true,
        hora: new Date().toLocaleTimeString('es-ES')
      });
    }

    await taskRef.update({ historialCumplimiento: historial });

    return res.status(200).json({
      success: true,
      message: completado ? 'Tarea completada' : 'Tarea desmarcada',
      historial
    });
  } catch (error) {
    console.error('Error al actualizar estado de tarea:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Generar reporte por rango de fechas (diario, semanal, mensual o personalizado)
exports.getTaskReport = async (req, res) => {
  try {
    const { usuarioId, fechaInicio, fechaFin, tipo } = req.query;

    let inicio = fechaInicio;
    let fin = fechaFin;
    const hoy = new Date();

    // Si no pasan fechas específicas, calculamos según el "tipo"
    if (!inicio || !fin) {
      if (tipo === 'semanal') {
        // Últimos 7 días
        const hace7dias = new Date(hoy);
        hace7dias.setDate(hoy.getDate() - 6);
        inicio = hace7dias.toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
      } else if (tipo === 'mensual') {
        // Primer y último día del mes actual
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
      } else {
        // Diario (por defecto HOY)
        inicio = hoy.toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
      }
    }

    let query = db.collection('tareas_rutinarias');
    if (usuarioId) {
      query = query.where('usuarioId', '==', usuarioId);
    }

    const snapshot = await query.get();
    
    let totalEsperadas = 0;
    let totalCompletadas = 0;
    const reporteDetallado = [];

    snapshot.forEach(doc => {
      const task = doc.data();
      const historial = task.historialCumplimiento || [];

      // Filtramos las ejecuciones completadas que caen dentro del rango
      const ejecucionesEnRango = historial.filter(h => 
        h.completado && h.fecha >= inicio && h.fecha <= fin
      );

      const completadasCount = ejecucionesEnRango.length;
      
      // Cálculo de días en el rango para el total esperado
      const dInicio = new Date(inicio);
      const dFin = new Date(fin);
      const diasEnRango = Math.floor((dFin - dInicio) / (1000 * 60 * 60 * 24)) + 1;

      totalEsperadas += diasEnRango;
      totalCompletadas += completadasCount;

      reporteDetallado.push({
        id: doc.id,
        titulo: task.titulo,
        frecuencia: task.frecuencia,
        puesto: task.puesto,
        usuarioId: task.usuarioId,
        completadasEnRango: completadasCount,
        fechasCompletadas: ejecucionesEnRango.map(e => e.fecha)
      });
    });

    const porcentajeGlobal = totalEsperadas > 0 
      ? Math.round((totalCompletadas / totalEsperadas) * 100) 
      : 0;

    return res.status(200).json({
      success: true,
      periodo: {
        tipo: tipo || 'personalizado',
        fechaInicio: inicio,
        fechaFin: fin
      },
      resumenGlobal: {
        totalTareasConfiguradas: snapshot.size,
        totalCumplimientos: totalCompletadas,
        porcentajeCumplimiento: porcentajeGlobal
      },
      data: reporteDetallado
    });

  } catch (error) {
    console.error('Error al generar el reporte:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};