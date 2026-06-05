const Ticket = require("../models/ticket.model");

class TicketRespository {
    async getTickets(filters) {
        const tickets = await Ticket.find(
            { where: filters },
            "tickets_view"
        );
        return tickets || [];
    }
}

module.exports = new TicketRespository();