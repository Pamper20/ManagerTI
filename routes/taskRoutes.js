const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Endpoints de Tareas Rutinarias
router.get('/', taskController.getDailyTasks);
router.post('/', taskController.createTask);
router.patch('/:id/toggle', taskController.toggleTaskStatus);

// 🆕 Nueva ruta para reportes
router.get('/reporte', taskController.getTaskReport);

module.exports = router;