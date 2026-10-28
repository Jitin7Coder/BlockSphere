
const { ethers } = require("hardhat");

async function main() {
  const [organizer] = await ethers.getSigners();

  const Factory = await ethers.getContractFactory("EventTicketBooking");
  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("Contract deployed to:", address);
  console.log("Organizer:", organizer.address);

  // Dates must be future dates when this script is run.
  const eventData = [
    {
      name: "Neon Nights Music Festival",
      location: "Mumbai",
      date: "2026-11-29T19:00:00",
      price: "0.001",
      tickets: 100,
    },
    {
      name: "The Comedy Club",
      location: "Mumbai",
      date: "2027-09-15T20:00:00",
      price: "0.002",
      tickets: 80,
    },
    {
      name: "Champions Football Night",
      location: "Pune",
      date: "2027-04-10T18:30:00",
      price: "0.003",
      tickets: 200,
    },
    {
      name: "Theatre Under The Stars",
      location: "Mumbai",
      date: "2027-07-25T19:30:00",
      price: "0.0015",
      tickets: 60,
    },
    {
      name: "Electric Sunset",
      location: "Nashik",
      date: "2027-10-30T17:00:00",
      price: "0.0025",
      tickets: 150,
    },
    {
      name: "Creative Minds Workshop",
      location: "Pune",
      date: "2028-02-12T11:00:00",
      price: "0.001",
      tickets: 50,
    },
  ];

  for (const event of eventData) {
    const eventTimestamp = Math.floor(
      new Date(event.date).getTime() / 1000
    );

    // Avoid deploying events that are already in the past.
    if (eventTimestamp <= Math.floor(Date.now() / 1000)) {
      throw new Error(
        `Event date is in the past: ${event.name} (${event.date})`
      );
    }

    const tx = await contract.createEvent(
      event.name,
      event.location,
      eventTimestamp,
      ethers.parseEther(event.price),
      event.tickets
    );

    await tx.wait();

    console.log(
      `Created event #${eventData.indexOf(event) + 1}:`,
      event.name,
      "|",
      event.date
    );
  }

  console.log("\nCONTRACT_ADDRESS =", address);
  console.log("All events created successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
