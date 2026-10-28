
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicketBooking", function () {
  async function setup() {
    const [owner, organizer, buyer, other] =
      await ethers.getSigners();

const Factory = await ethers.getContractFactory(
  "contracts/EventTicketBooking.sol:EventTicketBooking"
);
   const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const latest = await ethers.provider.getBlock("latest");
    const eventDate = latest.timestamp + 3600;
    const price = ethers.parseEther("0.1");

    await contract.connect(organizer).createEvent(
      "Live Concert",
      "Nashik",
      eventDate,
      price,
      2
    );

    return { contract, owner, organizer, buyer, other, eventDate, price };
  }

  it("creates an event", async function () {
    const { contract } = await setup();
    const event = await contract.events(1);

    expect(event.name).to.equal("Live Concert");
    expect(event.totalTickets).to.equal(2n);
    expect(event.active).to.equal(true);
  });

  it("books a ticket with the correct payment", async function () {
    const { contract, buyer, price } = await setup();

    await contract.connect(buyer).bookTicket(1, { value: price });

    const ticket = await contract.tickets(1);
    const event = await contract.events(1);

    expect(ticket.buyer).to.equal(buyer.address);
    expect(event.ticketsSold).to.equal(1n);
    expect(event.proceeds).to.equal(price);
  });

  it("rejects an incorrect payment", async function () {
    const { contract, buyer } = await setup();

    await expect(
      contract.connect(buyer).bookTicket(1, {
        value: ethers.parseEther("0.01")
      })
    ).to.be.revertedWith("Incorrect payment");
  });

  it("rejects bookings when tickets are sold out", async function () {
    const { contract, buyer, other, price } = await setup();

    await contract.connect(buyer).bookTicket(1, { value: price });
    await contract.connect(other).bookTicket(1, { value: price });

    await expect(
      contract.connect(buyer).bookTicket(1, { value: price })
    ).to.be.revertedWith("Sold out");
  });

  it("refunds a buyer who cancels before the event", async function () {
    const { contract, buyer, price } = await setup();

    await contract.connect(buyer).bookTicket(1, { value: price });

    const before = await ethers.provider.getBalance(buyer.address);
    const tx = await contract.connect(buyer).cancelTicket(1);
    const receipt = await tx.wait();
    const after = await ethers.provider.getBalance(buyer.address);

    const gas = receipt.gasUsed * receipt.gasPrice;

    expect(after + gas - before).to.equal(price);

    const ticket = await contract.tickets(1);
    const event = await contract.events(1);

    expect(ticket.cancelled).to.equal(true);
    expect(ticket.refunded).to.equal(true);
    expect(event.ticketsSold).to.equal(0n);
    expect(event.proceeds).to.equal(0n);
  });

  it("prevents another person cancelling the ticket", async function () {
    const { contract, buyer, other, price } = await setup();

    await contract.connect(buyer).bookTicket(1, { value: price });

    await expect(
      contract.connect(other).cancelTicket(1)
    ).to.be.revertedWith("Not your ticket");
  });

  it("lets only the organizer withdraw their event proceeds after the event", async function () {
    const { contract, organizer, buyer, price, eventDate } = await setup();

    await contract.connect(buyer).bookTicket(1, { value: price });

    await expect(
      contract.connect(organizer).withdrawProceeds(1)
    ).to.be.revertedWith("Event not finished");

    await ethers.provider.send("evm_setNextBlockTimestamp", [eventDate + 1]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      contract.connect(organizer).withdrawProceeds(1)
    ).to.emit(contract, "ProceedsWithdrawn")
      .withArgs(1, price);

    expect((await contract.events(1)).proceeds).to.equal(0n);
  });
});
