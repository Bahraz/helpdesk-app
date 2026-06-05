const ticketRepository = require("../repositories/ticket.repository");

class TicketService {
    async getTickets(filters) {
        const tickets = await ticketRepository.getTickets(filters);
        return tickets;
    }
}

module.exports = new TicketService();