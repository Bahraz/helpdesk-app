const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');

router.get('/', ticketController.getTickets);
router.get('/create', ticketController.getCreateTicketForm);
router.get('/:id', ticketController.getTicketDetails);


router.post('/:id/reply', ticketController.postTicketReply);
router.post('/', ticketController.createTicket);
/* router.get('/:id', ticketController.getTicketDetails);

router.post('/', ticketController.createTicket);

router.put('/:id', ticketController.updateTicket);

router.delete('/:id', ticketController.deleteTicket);
 */

module.exports = router;