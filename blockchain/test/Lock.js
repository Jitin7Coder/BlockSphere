const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicketBooking", function () {
  let booking;
  let owner, organizer, buyer, other;

  async function createFutureEvent() {
    const latestBlock = await ethers.provider.getBlock("latest");
    const futureDate = latestBlock.timestamp + 86400;

    await booking.connect(organizer).createEvent(
      "Concert",
      "College Ground",
      futureDate,
      ethers.parseEther("1"),
      2
    );
  }

  beforeEach(async function () {
    [owner, organizer, buyer, other] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory(
      "contracts/EventTicketBooking.sol:EventTicketBooking"
    );

    booking = await Factory.deploy();
    await booking.waitForDeployment();
  });

  it("deploys the contract successfully", async function () {
    expect(await booking.getAddress()).to.not.equal(ethers.ZeroAddress);
  });

  it("creates an event", async function () {
    await createFutureEvent();

    expect(await booking.eventCount()).to.equal(1);

    const event = await booking.events(1);
    expect(event.name).to.equal("Concert");
    expect(event.location).to.equal("College Ground");
    expect(event.organizer).to.equal(organizer.address);
  });

  it("books a ticket with correct payment", async function () {
    await createFutureEvent();

    await booking.connect(buyer).bookTicket(1, {
      value: ethers.parseEther("1"),
    });

    expect(await booking.ticketCount()).to.equal(1);

    const ticket = await booking.tickets(1);
    expect(ticket.buyer).to.equal(buyer.address);
    expect(ticket.eventId).to.equal(1);
  });

  it("rejects incorrect payment", async function () {
    await createFutureEvent();

    await expect(
      booking.connect(buyer).bookTicket(1, {
        value: ethers.parseEther("0.5"),
      })
    ).to.be.revertedWith("Incorrect payment");
  });

  it("rejects booking when sold out", async function () {
    await createFutureEvent();

    await booking.connect(buyer).bookTicket(1, {
      value: ethers.parseEther("1"),
    });

    await booking.connect(other).bookTicket(1, {
      value: ethers.parseEther("1"),
    });

    await expect(
      booking.connect(owner).bookTicket(1, {
        value: ethers.parseEther("1"),
      })
    ).to.be.revertedWith("Sold out");
  });

  it("refunds a cancelled ticket", async function () {
    await createFutureEvent();

    await booking.connect(buyer).bookTicket(1, {
      value: ethers.parseEther("1"),
    });

    await expect(
      booking.connect(buyer).cancelTicket(1)
    )
      .to.emit(booking, "TicketCancelled")
      .withArgs(1);

    const ticket = await booking.tickets(1);
    expect(ticket.cancelled).to.equal(true);
    expect(ticket.refunded).to.equal(true);
  });

  it("prevents another person cancelling a ticket", async function () {
    await createFutureEvent();

    await booking.connect(buyer).bookTicket(1, {
      value: ethers.parseEther("1"),
    });

    await expect(
      booking.connect(other).cancelTicket(1)
    ).to.be.revertedWith("Not your ticket");
  });

  it("allows organizer to withdraw after event", async function () {
    await createFutureEvent();

    await booking.connect(buyer).bookTicket(1, {
      value: ethers.parseEther("1"),
    });

    await ethers.provider.send("evm_increaseTime", [86401]);
    await ethers.provider.send("evm_mine", []);

    await expect(
      booking.connect(organizer).withdrawProceeds(1)
    ).not.to.be.reverted;
  });
});