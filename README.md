# Snap'n Invest

> **See it. Snap it. Own it.**

Snap a photo of any product → AI identifies the brand → buy tokenized stock on-chain in one tap.

Built on [Robinhood Chain Testnet](https://chain.robinhood.com) for the Robinhood hackathon.

**Live app:** [snapninvest.xyz](https://snapninvest.xyz)

---

## How it works

1. **Snap** — point your camera at any product, logo, or storefront
2. **Identify** — Claude AI (Haiku) recognizes the brand and maps it to a US stock ticker
3. **Buy** — swap testnet ETH for tokenized stock via the MockSwap DEX directly on Robinhood Chain

No sign-up. No password. Just connect your wallet and snap.

---

## Features

- **AI brand recognition** — Claude Haiku vision model identifies brands from photos
- **Real on-chain swaps** — MockSwap DEX with 536 tokenized stock/ETH liquidity pools
- **536 tokenized stocks** — AAPL, TSLA, AMZN, GOOGL, and 532 more
- **ConnectKit wallet** — MetaMask, WalletConnect; auto-switches to Robinhood Chain
- **Live feed** — community snaps with captured photos and on-chain tx links
- **Portfolio** — live on-chain token balances + purchase history with snap photos
- **Chain helper** — one-tap "Add Chain" button to add Robinhood Chain to any wallet

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| Wallet | wagmi + viem + ConnectKit |
| AI | Claude Haiku (`claude-haiku-4-5-20251001`) |
| Blockchain | Robinhood Chain Testnet (chainId 46630), ethers v6 |
| DEX | MockSwap — constant product AMM, direct ETH→token swaps |
| Backend | Vercel API routes (Node.js TypeScript) |
| Database | Neon Postgres (holdings, beta signups) |
| Storage | Vercel Blob (captured snap photos) |

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — live tokenizations marquee + CTA |
| `/camera` | Camera capture |
| `/result` | AI brand identification |
| `/confirm` | Swap preview + confirm (real on-chain) |
| `/portfolio` | On-chain token balances + purchase history |
| `/feed` | Community feed of all snaps |
| `/landing` | Original landing page (preserved) |

---

## Robinhood Chain

- **Chain ID:** 46630 (0xB636)
- **Type:** Arbitrum Orbit L2
- **RPC:** `https://rpc.testnet.chain.robinhood.com`
- **Explorer:** `https://explorer.testnet.chain.robinhood.com`
- **DEX:** MockSwap — 536 stock/ETH pairs, factory at `0xE9a696F428725134AB06454A0CB2E7434e3deC4c`

---

## Local development

```bash
npm install
npm run dev
```

API routes require Vercel env vars. Run `npx vercel env pull .env.local` after linking the project with `npx vercel link`.

---

## Hackathon

Tag [`hackathon-start`](https://github.com/tekr9d3r/SnapnInvest/compare/hackathon-start...main) marks the state of the project at the start of the hackathon. The compare link shows all commits made during the hackathon.
