// controllers/inventoryController.js
const Inventory = require('../models/Inventory');

exports.getInventory = async (req, res) => {
  try {
    const items = await Inventory.getAll();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener inventario', error: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.getLowStockAlerts();
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en alertas de stock', error: error.message });
  }
};

exports.registerMovement = async (req, res) => {
  try {
    const { itemId, sourceWarehouseId, targetWarehouseId, movementType, userId } = req.body;
    const movement = await Inventory.createMovement(itemId, sourceWarehouseId, targetWarehouseId, movementType, userId);
    res.status(201).json({ success: true, data: movement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al registrar movimiento', error: error.message });
  }
};