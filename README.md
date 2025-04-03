# Fizk Protocol UI

The **zkUSD Protocol UI** provides the web-based graphical user interface for the **fizk protocol**, built with TypeScript and Next.js. It interacts seamlessly with the fizk protocol's `core` module, which contains smart contract logic and transaction management.

Our mission is to catalyze Mina's growth into a vibrant, self-sustaining financial ecosystem while staying true to Mina's core principles: low-cost network security and decentralization.

---

## Table of Contents

- [About zkUSD](#about-zkusd)
- [Current Status](#current-status)
- [Repository Structure](#repository-structure)
- [How to Contribute](#how-to-contribute)
- [Community & Resources](#community--resources)
- [License](#license)

---

## About zkUSD

zkUSD is a **fully collateralized algorithmic stablecoin** backed by MINA tokens. It is governed by smart contracts written in `o1js` utilizing zkApps on the Mina blockchain.

Specifically designed for Mina’s unique architecture, zkUSD protocol leverages:

- **Collateralized Debt Positions (CDPs)** to issue zkUSD.
- **Decentralized oracles** providing off-chain zk-proof price feeds.
- Built-in **liquidation mechanics**, reserve management, and incentive structures.
- Planned support for **negative interest rate loans**.
- Native governance capabilities and DAO-driven upgradeability.
- A roadmap incorporating multi-collateral options and real-world asset integrations.

For an in-depth explanation, please refer to our [whitepaper](https://github.com/zkUSD-Protocol/whitepaper).

---

## Current Status

The zkUSD protocol is currently live and operational as a **proof-of-concept deployed on Mina's devnet**. Core functionalities such as vault creation, collateral handling, and debt minting are fully functional through the UI. Note that liquidations are currently unavailable via the UI.

Current and planned areas of development include:

- Legal and compliance considerations.
- Development of **governance modules**, including on-chain upgrades and DAO integration.
- Building a **decentralized CLI** and additional developer tools.
- Preparations for a **mainnet launch**.
- Conducting **security audits** of the core protocol components.
- Ongoing improvements and optimizations.

Although the protocol is at an early stage, the foundations are solid. We actively encourage feedback, contributions, and further community development.

---

## How to Run

A live, configured version of the zkUSD GUI is available at [https://devnet.fizk.xyz/app](https://devnet.fizk.xyz/app).

To experiment locally:

- Set up your own `.env` configuration.
- If you encounter any issues or need guidance, please reach out.

We will continuously improve the developer experience as the project matures.

---

## How to Contribute

We're developing openly and actively welcome contributors of all kinds:

- Testers and security auditors
- Documentation contributors
- zkApp integrators
- Economic model and governance reviewers

Contribution guidelines:

1. Fork the repository.
2. Create a branch: `git checkout -b your-username/feature/your-feature`.
3. Make your changes, commit clearly, and push to your fork.
4. Open a pull request detailing your changes.

Specific contribution guidelines and coding conventions will be introduced as the project evolves.

---

## Community & Resources

- 🌐 **Website:** [https://devnet.fizk.xyz](https://devnet.fizk.xyz)
- 📄 **Whitepaper v0.1:** [Read here](https://drive.google.com/file/d/1MINcUqeLzxskjdB8Cq2O38emFrjgVY0q/view)
- 📚 **Documentation:** [https://docs.fizk.xyz](https://docs.fizk.xyz)
- 💬 **Discord:** [Join the community](https://discord.gg/3fxFtxQK)
- 🐦 **Twitter/X:** [Follow us](https://x.com/fizk_protocol)
- 📢 **Telegram:** [Chat with us](https://t.me/fizk_protocol)
- 💻 **GitHub:** [https://github.com/zkUSD-Protocol](https://github.com/zkUSD-Protocol)

---

## License

This project is licensed under the [Apache 2.0 License](./LICENSE).
