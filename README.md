# 📌 PROYECTO: MANAGER TI (SISTEMA DE GESTIÓN INTEGRAL DE TI)

## 1. 🎯 PROPÓSITO DEL SISTEMA
Plataforma web ERP/ITSM para la gestión centralizada de infraestructura de TI, Helpdesk (Mesa de Ayuda), Inventario de Activos (Hardware, Software y Licenciamiento) y Gestión/Recepción automatizada de Órdenes de Compra.

---

## 2. 📂 ESTRUCTURA DEL PROYECTO (ARQUITECTURA MVC)

```text
ManagerTI/
├── config/
│   └── database.js               # Conexión con Firebase Admin SDK / Firestore
├── controllers/
│   ├── inventoryController.js    # Lógica de negocio para Gestión de Activos y Licencias
│   └── ticketController.js       # Lógica de negocio para Mesa de Ayuda (Tickets)
├── models/
│   ├── Inventory.js              # Esquema/Modelo para colección 'activos' e 'inventario'
│   └── Ticket.js                 # Esquema/Modelo para colección 'tickets'
├── routes/
│   ├── inventoryRoutes.js        # Definición de endpoints de Inventario (/api/activos)
│   └── ticketRoutes.js           # Definición de endpoints de Tickets (/api/tickets)
├── views/
│   ├── images/
│   │   ├── logo.png              # Isotipo del sistema
│   │   └── logoAlpina_positivo.jpeg
│   ├── dashboard.html            # Vista principal / Panel de Métricas e Indicadores
│   ├── inventario.html           # Vista del módulo de Inventario y Carga Masiva
│   ├── ordenes_compra.html       # Vista del módulo de Órdenes de Compra
│   ├── reportes.html             # Módulo de Reportes y KPIs
│   └── tickets.html              # Vista de la Mesa de Ayuda (Helpdesk)
├── app.js                        # Servidor principal Node.js / Express y ruteo principal
├── seedFirebase.js               # Script de sembrado / migración inicial a Firestore
├── serviceAccountKey.json        # Credenciales GCP / Firebase (SECRET - Omitir en Git)
├── package.json                  # Dependencias y scripts del proyecto
├── package-lock.json             # Bloqueo de versiones
├── .gitignore                    # Reglas de exclusión de repositorio
└── node_modules/                 # Dependencias instaladas (omitidas en control de versiones)


3. 🛠️ STACK TECNOLÓGICO Y DEPENDENCIAS (package.json)
Backend & Servidor: Node.js (CommonJS), Express v5.2.1.

Bases de Datos:

Cloud Firestore (firebase-admin v14.3.0, @google-cloud/firestore v9.0.0).

PostgreSQL (pg v8.23.0 - Soporte DB relacional/migración).

Seguridad & Autenticación: jsonwebtoken (v9.0.3), bcryptjs (v3.0.3).

Utilidades & Parser: xlsx (v0.18.5 - Importación/Exportación Excel), cors (v2.8.6), dotenv (v17.4.2).

4. 🗄️ COLECCIONES PRINCIPALES (FIRESTORE)
activos / inventario: Guarda laptops, PCs, periféricos, sedes, responsables y estructura de licencias (windows, office, autocad).

tickets: Almacena casos de soporte, prioridades (Alta, Media, Baja), estados y archivos adjuntos ZIP.

ordenes_compra: Contiene OCs, montos en USD, proveedor y flujo de auto-recepción e ingreso a inventario.

5. 🔌 ENDPOINTS Y FLUJOS CLAVE (app.js)
GET /api/activos -> Lectura con fallback dual (activos + inventario).

POST /api/activos/cargar-excel -> Parser inteligente de archivos Excel con mapeo dinámico de encabezados.

POST /api/ordenes-compra/:id/recepcionar -> Transacción por lotes (db.batch()) que traslada los ítems de una OC a la colección activos automáticamente.

6. 📝 HISTORIAL DE ESTADO Y COMMITS
Estado Actual:
Estrategia de carga masiva de Excel implementada con normalización de caracteres (NFD).

Flujo de Órdenes de Compra vinculado a recepción de inventario.

Servidor Express configurado con vistas estáticas en /views.

Backlog / Tareas Pendientes:
[ ] Implementar fragmentación de db.batch() en bloques de 500 para cargas masivas de Excel mayores a 500 filas.

[ ] Desacoplar las rutas inline de app.js hacia los controladores en controllers/ y routes/.

[ ] Integrar el flujo de autenticación JWT usando jsonwebtoken y bcryptjs.

### 📋 Módulo de Tareas Rutinarias y Checklist Diario (Nuevo) 28/09/2026
- [x] **Modelo en Firestore**: Colección `tareas_rutinarias` para la gestión de tareas recurrentes por puesto o usuario.
- [x] **Controlador & Rutas API**: Endpoints integrados en `controllers/taskController.js` y `routes/taskRoutes.js` para crear, consultar y marcar el estado de avance diario (`/api/tareas/toggle`).
- [x] **Widget de Progreso en Dashboard**: Barra de avance dinámico (% de cumplimiento diario) con micro-interacciones visuales.
- [x] **Módulo de Exportación**: Capacidad para descargar reportes de cumplimiento de tareas en formato Excel (`.xlsx`) y PDF directamente desde la interfaz.