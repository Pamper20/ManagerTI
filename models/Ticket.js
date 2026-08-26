// models/Ticket.js
const db = require('../config/database');

class TicketModel {
  static async create(ticketData) {
    const newTicket = {
      ...ticketData,
      status: 'open',
      created_at: new Date().toISOString(),
      sla_due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 horas
    };
    const docRef = await db.collection('tickets').add(newTicket);
    return { id: docRef.id, ...newTicket };
  }

  static async getDashboardMetrics() {
    const snapshot = await db.collection('tickets').get();
    let abiertos = 0;
    let en_proceso = 0;
    let resueltos = 0;
    let sla_vencido = 0;
    const now = new Date().toISOString();

    snapshot.forEach(doc => {
      const ticket = doc.data();
      if (ticket.status === 'open') abiertos++;
      if (ticket.status === 'in_progress') en_proceso++;
      if (ticket.status === 'resolved') resueltos++;
      if (ticket.sla_due_date < now && ticket.status !== 'resolved') sla_vencido++;
    });

    return { abiertos, en_proceso, resueltos, sla_vencido };
  }
}

module.exports = TicketModel;