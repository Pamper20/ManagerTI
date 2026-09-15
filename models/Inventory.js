// models/Inventory.js
const db = require('../config/database');

class InventoryModel {
  // Obtener todo el inventario
  static async getAll() {
    const snapshot = await db.collection('inventory_items').get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }

  // Actualizar activo por ID (incluye estado, usuario, ubicación, observaciones y licencias)
  static async update(id, updateData) {
    const docRef = db.collection('inventory_items').doc(id);
    
    // Si se envían licencias, las fusionamos con la estructura existente en Firestore
    const dataToUpdate = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToUpdate, { merge: true });
    
    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  // Obtener alertas de stock bajo
  static async getLowStockAlerts() {
    const categoriesSnapshot = await db.collection('asset_categories').get();
    const alerts = [];

    for (const doc of categoriesSnapshot.docs) {
      const category = doc.data();
      // Buscar items disponibles de esta categoría
      const itemsSnapshot = await db.collection('inventory_items')
        .where('category', '==', category.name)
        .where('status', '==', 'available')
        .get();

      const stockActual = itemsSnapshot.size;
      if (stockActual <= category.min_stock_alert) {
        alerts.push({
          categoria: category.name,
          stock_actual: stockActual,
          min_stock_alert: category.min_stock_alert
        });
      }
    }
    return alerts;
  }

  // Registrar movimiento de kardex
  static async createMovement(data) {
    const docRef = await db.collection('stock_movements').add({
      ...data,
      timestamp: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  }
}

module.exports = InventoryModel;