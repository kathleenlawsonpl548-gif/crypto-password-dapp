# Crypto Password DApp

A decentralized password generator and encrypted password vault built on Ethereum.

## ⚠️ Security Notice
- Password generation on-chain is for **demonstration only**. True cryptographic security happens **client-side** using Web Crypto API.
- Never store plaintext passwords on-chain.
- Encryption must happen in the browser before storing.

## Features
- On-chain pseudo-random password generator (using keccak256 + entropy)
- Decentralized password vault (stores only encrypted data)
- MetaMask wallet connection
- Client-side AES-GCM encryption (recommended)

## Tech Stack
- **Smart Contract**: Solidity ^0.8.20 + Hardhat
- **Frontend**: React + TypeScript + ethers.js / viem
- **Encryption**: Web Crypto API (AES-GCM)

## Quick Start

### Smart Contract
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
