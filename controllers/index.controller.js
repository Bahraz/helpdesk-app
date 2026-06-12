const ticketService = require("../services/ticket.service");

function getLoggedUser(req) {
  return req.session.user || null;
}

exports.getHome = async (req, res) => {
  const user = getLoggedUser(req);

  if (!user) return res.redirect("auth/login");

  const [unassignedTickets, myTickets] = await Promise.all([
    ticketService.getTickets({ agent_id: null }),
    ticketService.getTickets({ agent_id: user.id })
  ]);

  res.render("index", {
    user,
    myTickets,
    unassignedTickets,
  });
};