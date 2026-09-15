// inventoryRoutes.js
const express = require('express');
const router = express.Router();
const InventoryModel = require('../models/Inventory');

// Endpoint para actualizar activo y licencias
router.put('/api/activos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[PUT /api/activos/${id}] Recibiendo datos:`, req.body);

    if (!id) {
      return res.status(400).json({ error: 'El ID del activo es requerido' });
    }

    const { estado, usuarioAsignado, ubicacion, observaciones, licencias } = req.body;

    const datosActualizados = {
      estado: estado || 'OPERATIVO',
      usuarioAsignado: usuarioAsignado || 'Sin Asignar',
      ubicacion: ubicacion || 'Almacén',
      observaciones: observaciones || '',
      licencias: {
        windows: licencias?.windows || 'N/A',
        office: licencias?.office || 'N/A',
        autocad: licencias?.autocad || 'N/A'
      }
    };

    const activoActualizado = await InventoryModel.update(id, datosActualizados);

    console.log(`[PUT /api/activos/${id}] Actualización exitosa.`);
    return res.json({
      mensaje: 'Activo y licencias actualizados con éxito',
      activo: activoActualizado
    });

  } catch (error) {
    console.error('[PUT /api/activos] Error en backend:', error);
    return res.status(500).json({ 
      error: 'Ocurrió un error al guardar los cambios en la base de datos',
      detalle: error.message 
    });
  }
});

module.exports = router;