
 // SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EventTicketBooking {
    struct Event {
        string name;
        string location;
        uint256 eventDate;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 ticketsSold;
        uint256 proceeds;
        address organizer;
        bool active;
    }

    struct Ticket {
        address buyer;
        uint256 eventId;
        bool cancelled;
        bool refunded;
    }

    uint256 public eventCount;
    uint256 public ticketCount;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;

    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed organizer
    );

    event TicketBooked(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed buyer
    );

    event TicketCancelled(uint256 indexed ticketId);

    event ProceedsWithdrawn(
        uint256 indexed eventId,
        uint256 amount
    );

    function createEvent(
        string memory name,
        string memory location,
        uint256 eventDate,
        uint256 ticketPrice,
        uint256 totalTickets
    ) external {
        require(bytes(name).length > 0, "Name required");
        require(eventDate > block.timestamp, "Event date must be future");
        require(ticketPrice > 0, "Price must be positive");
        require(totalTickets > 0, "Tickets must be positive");

        eventCount++;

        events[eventCount] = Event({
            name: name,
            location: location,
            eventDate: eventDate,
            ticketPrice: ticketPrice,
            totalTickets: totalTickets,
            ticketsSold: 0,
            proceeds: 0,
            organizer: msg.sender,
            active: true
        });

        emit EventCreated(eventCount, name, msg.sender);
    }

    // Books multiple tickets in ONE blockchain transaction.
    // Each ticket receives a different ticket ID.
    function bookTickets(
        uint256 eventId,
        uint256 quantity
    ) external payable {
        require(
            eventId > 0 && eventId <= eventCount,
            "Event not found"
        );

        require(quantity > 0, "Quantity must be positive");

        Event storage eventItem = events[eventId];

        require(eventItem.active, "Event inactive");
        require(
            block.timestamp < eventItem.eventDate,
            "Event has already started"
        );

        require(
            eventItem.totalTickets - eventItem.ticketsSold >= quantity,
            "Not enough tickets remaining"
        );

        uint256 totalPayment = eventItem.ticketPrice * quantity;

        require(msg.value == totalPayment, "Incorrect payment");

        for (uint256 i = 0; i < quantity; i++) {
            ticketCount++;

            tickets[ticketCount] = Ticket({
                buyer: msg.sender,
                eventId: eventId,
                cancelled: false,
                refunded: false
            });

            emit TicketBooked(ticketCount, eventId, msg.sender);
        }

        eventItem.ticketsSold += quantity;
        eventItem.proceeds += totalPayment;
    }

    // Retains support for booking one ticket.
    function bookTicket(uint256 eventId) external payable {
        require(
            eventId > 0 && eventId <= eventCount,
            "Event not found"
        );

        Event storage eventItem = events[eventId];

        require(eventItem.active, "Event inactive");
        require(
            block.timestamp < eventItem.eventDate,
            "Event has already started"
        );

        require(
            eventItem.ticketsSold < eventItem.totalTickets,
            "Sold out"
        );

        require(
            msg.value == eventItem.ticketPrice,
            "Incorrect payment"
        );

        ticketCount++;

        tickets[ticketCount] = Ticket({
            buyer: msg.sender,
            eventId: eventId,
            cancelled: false,
            refunded: false
        });

        eventItem.ticketsSold++;
        eventItem.proceeds += msg.value;

        emit TicketBooked(ticketCount, eventId, msg.sender);
    }

    function cancelTicket(uint256 ticketId) external {
        require(
            ticketId > 0 && ticketId <= ticketCount,
            "Ticket not found"
        );

        Ticket storage ticket = tickets[ticketId];

        require(ticket.buyer == msg.sender, "Not your ticket");
        require(!ticket.cancelled, "Ticket already cancelled");

        Event storage eventItem = events[ticket.eventId];

        require(
            block.timestamp < eventItem.eventDate,
            "Event has already started"
        );

        ticket.cancelled = true;
        ticket.refunded = true;

        eventItem.ticketsSold--;
        eventItem.proceeds -= eventItem.ticketPrice;

        (bool success, ) = payable(ticket.buyer).call{
            value: eventItem.ticketPrice
        }("");

        require(success, "Refund failed");

        emit TicketCancelled(ticketId);
    }

    function withdrawProceeds(uint256 eventId) external {
        require(
            eventId > 0 && eventId <= eventCount,
            "Event not found"
        );

        Event storage eventItem = events[eventId];

        require(
            msg.sender == eventItem.organizer,
            "Not the organizer"
        );

        require(
            block.timestamp >= eventItem.eventDate,
            "Event not finished"
        );

        uint256 amount = eventItem.proceeds;

        require(amount > 0, "No proceeds");

        eventItem.proceeds = 0;

        (bool success, ) = payable(eventItem.organizer).call{
            value: amount
        }("");

        require(success, "Withdrawal failed");

        emit ProceedsWithdrawn(eventId, amount);
    }
}
