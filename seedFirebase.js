const db = require('./config/database');

async function seedTickets() {
  try {
    const ticketsRef = db.collection('tickets');
    
    await ticketsRef.add({
      usuario: 'Ana Martinez',
      asunto: 'Falla de conexión a la red local',
      estado: 'Abierto',
      prioridad: 'Alta',
      sla_vencido: false,
      fecha_creacion: new Date()
    });

    await ticketsRef.add({
      usuario: 'Carlos Mendoza',
      asunto: 'Solicitud de acceso a carpeta compartida',
      estado: 'En Proceso',
      prioridad: 'Media',
      sla_vencido: false,
      fecha_creacion: new Date()
    });

    console.log('🌱 Datos sembrados correctamente en Firestore.');
  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
  }
}

seedTickets();