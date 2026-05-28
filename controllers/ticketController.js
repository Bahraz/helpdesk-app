exports.getIndex = (req, res) => {
  res.send("Moduł zgłoszeń działa! Tutaj wkrótce pojawi się lista ticketów.");
};

exports.getPending = (req, res) => {
  // Tutaj docelowo będzie np.: const tickets = await Ticket.find({ status: 'Nowe' });
  const mockTickets = [
    {
      id: 101,
      tytul: "Brak dostępu do serwera plików",
      opis: "Po aktualizacji systemu Windows nie mogę połączyć się z dyskiem Z.",
      priorytet: "Wysoki",
      tworca_nazwa: "Anna Kowalska",
      czas_zalozenia: "09:15, Dziś",
    },
    {
      id: 102,
      tytul: "Wymiana tonera w drukarce",
      opis: "Drukarka na 2 piętrze zgłasza niski poziom czarnego tonera.",
      priorytet: "Niski",
      tworca_nazwa: "Piotr Nowak",
      czas_zalozenia: "08:30, Dziś",
    },
    {
      id: 100,
      tytul: "Niedziałający monitor",
      opis: "Brak zasilania w jednym z monitorów co utrudnia i spowalnia pracę.",
      priorytet: "Średni",
      tworca_nazwa: "Kamil Wiśniewski",
      czas_zalozenia: "Wczoraj",
    },
  ];

  res.render("index", {
    user: { role: "admin", name: "Admin IT" },
    page: "pages/admin/tickets-pending",
    tickets: mockTickets,
  });
};
