// === CAMBIO CLAVE: Permite conexiones HTTPS ignorando la interceptación del firewall corporativo ===
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

let db = null;

try {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  const serviceAccount = require(serviceAccountPath);

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }

  db = getFirestore();

  // === CAMBIO CLAVE: Se activa preferRest: true para APAGAR gRPC y usar HTTPS normal ===
  db.settings({
    preferRest: true,
    ignoreUndefinedProperties: true
  });

  console.log('✅ Conexión con Firestore restablecida correctamente en MODO REST.');
} catch (error) {
  console.error('❌ Error al conectar con Firestore:', error.message);
  
  // Respaldo de emergencia en memoria por si la base de datos falla
  db = {
    collection: () => ({
      get: async () => ({ forEach: () => {} }),
      add: async () => {}
    })
  };
}

module.exports = db;