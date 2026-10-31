# BlockSphere

A blockchain-based event ticket booking prototype built with React and Solidity. It connects a browser wallet to an Ethereum-compatible smart contract and demonstrates event creation, ticket booking, cancellation, refunds, and organizer withdrawals on a local Hardhat network.

> **Project status:** Academic/local-development prototype. The documented transaction flow and tests use a local Hardhat chain. This repository is not deployed to Ethereum mainnet or a public testnet, and it is not a production ticketing service.

## Overview

BlockSphere explores how a web application can use a smart contract to manage ticket inventory and payments. Users can browse sample events, select tickets, connect MetaMask, and interact with the booking contract.

## Features

### Frontend
- Browse sample events in a React interface.
- Search and filter event listings.
- Select an event and ticket quantity.
- Connect a browser wallet through MetaMask.
- Submit a booking transaction and check its receipt before displaying confirmation.

### Smart contract
The `EventTicketBooking.sol` contract includes functions to:
- Create an event with a future date, ticket price, and ticket supply.
- Book one or multiple tickets with the exact payment required.
- Cancel a ticket before the event and issue a refund.
- Allow the event organizer to withdraw proceeds after the event.
- Track event and ticket data, including booking and cancellation status.

## Screenshots

### Event listing
![BlockSphere homepage](ss/homepage.png)

### Booking preview
![Ticket booking preview](ss/booking-preview.png)

### Transaction result
![Booking transaction result](ss/transaction-result.png)

## Technology stack

| Technology | Role |
|---|---|
| React 19 + Vite | Frontend application and development server |
| JavaScript, HTML, CSS | Application logic and interface |
| Solidity | Ticket booking smart contract |
| Hardhat 2 + Hardhat Toolbox | Local blockchain development, compilation, and tests |
| ethers.js 6 | Contract and wallet interaction |
| MetaMask | Browser wallet connection and transaction approval |

## Architecture

```text
User
  |
  v
React + Vite frontend
  |
  v
MetaMask wallet
  |
  v
ethers.js
  |
  v
Hardhat local network
  |
  v
EventTicketBooking.sol
  |
  v
Transaction receipt and UI confirmation
```

## Repository structure

```text
BlockSphere/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── contract.js
│   └── package.json
├── blockchain/
│   ├── contracts/
│   │   └── EventTicketBooking.sol
│   ├── test/
│   │   └── EventTicketBooking.js
│   ├── ignition/
│   │   └── modules/
│   ├── hardhat.config.js
│   └── package.json
├── ss/
└── README.md
```

## Run locally

### Prerequisites
- Node.js and npm
- Git
- MetaMask browser extension

### 1. Clone the repository

```bash
git clone https://github.com/Jitin7Coder/BlockSphere.git
cd BlockSphere
```

### 2. Install blockchain dependencies and compile

```bash
cd blockchain
npm install
npx hardhat compile
```

Compilation generates the contract artifact imported by the frontend.

### 3. Run the smart contract tests

From the `blockchain` directory:

```bash
npx hardhat test
```

The `EventTicketBooking` test suite covers event creation, successful booking, incorrect payment, sold-out inventory, cancellation and refunds, ticket ownership, and organizer withdrawals.

### 4. Start a local Hardhat node

From the `blockchain` directory, open a terminal and run:

```bash
npx hardhat node
```

Keep the node running. Hardhat's local network uses `http://127.0.0.1:8545` and chain ID `31337` by default.

### 5. Configure and start the frontend

The frontend reads the contract ABI from the compiled artifact and the address from `frontend/src/contract.js`.

Before using the UI, deploy `EventTicketBooking.sol` to your local Hardhat node and set `CONTRACT_ADDRESS` in that file to the deployed contract address. The repository currently does not include a dedicated deployment script or Ignition module for `EventTicketBooking`; the existing Ignition module is for the sample `Lock` contract.

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite. Connect MetaMask to the local Hardhat network (chain ID `31337`) and use a local development account.

> **Security note:** Hardhat accounts and private keys are for local development only. Never use them with real funds or commit private keys, seed phrases, or secret environment files to GitHub.

## Test evidence

A local booking transaction was recorded with these details:

| Item | Recorded value |
|---|---|
| Event | Champions Football Night |
| Quantity | 1 ticket |
| Transaction value | 0.003 ETH |
| Network | Hardhat Local |
| Chain ID | `31337` |
| Receipt status | `1` (successful) |
| Block | `12` |

This is evidence from a local development chain only; it is not a public-chain transaction.

## Scope and limitations

- Local development prototype; no public deployment is claimed.
- No production hosting or venue-entry validation.
- The repository does not yet include a dedicated deployment module for `EventTicketBooking`.
- The current implementation should not be treated as a production ticketing or payment platform.

## Planned improvements

- Add a dedicated, reproducible deployment workflow for `EventTicketBooking`.
- Add a public testnet deployment and contract verification.
- Host the frontend for remote demonstrations.
- Expand automated frontend and end-to-end tests.
- Improve mobile usability and ticket lifecycle handling.

## Author

**Jitin Jadwani** — [GitHub profile](https://github.com/Jitin7Coder)

---

If you explore the project, feedback and issue reports are welcome.
