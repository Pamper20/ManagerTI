const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/metrics', ticketController.getMetrics);
router.get('/', ticketController.getAllTickets);
router.post('/', ticketController.createTicket);

module.exports = router;