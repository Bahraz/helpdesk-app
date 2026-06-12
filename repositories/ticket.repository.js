const Ticket = require("../models/ticket.model.js");

class TicketRepository {
    async getTickets(filters) {
        const tickets = await Ticket.find(
            { where: filters },
            "v_tickets"
        );
        return tickets || [];
    }

    async getTicketById(id) {
        const tickets = await Ticket.find(
            { where: { id } },
            "v_tickets"
        );
        return tickets[0] || null;
    }

    async createTicket(data) {
        const newTicket = await new Ticket(data).create();
        return newTicket;
    }

    async updateTicket(id, data) {
        return await Ticket.updateById(id, data);
    }
}

module.exports = new TicketRepository();