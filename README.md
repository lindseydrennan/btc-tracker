# Bitcoin Return Tracker

**See your real Bitcoin returns — not just the current price.**

Most apps show you the price of Bitcoin. None of them show you *your* actual return — because that requires calculating every purchase you've made at different prices to get your true cost basis. This does that.

## Why this exists

If you've been dollar-cost averaging into Bitcoin, you have no easy way to answer: **"Am I actually up or down, and by how much?"**

Exchanges show individual trade history, but they don't roll it up into a single cost basis and return number. Portfolio trackers want your API keys. Nothing just lets you punch in your buys and see the math.

This tracker calculates:
- **Total cost basis** across all your purchases at different prices
- **Weighted average price** you've paid per BTC
- **Current value** using live Bitcoin price from CoinGecko
- **Actual gain/loss** in dollars and percentage

You can also **change the BTC price manually** to see what your portfolio would be worth at any price — useful for modeling "what if BTC hits $150k?" scenarios.

## Features

- Live BTC price via CoinGecko (free, no API key needed)
- All data stored in your browser's localStorage — **nothing leaves your machine**
- CSV import for bulk transaction entry
- Tracks Buy, Income, Interest, and Credit Card Reward transactions separately
- Sortable transaction table
- Manual price override for hypothetical modeling

## Getting started

```bash
git clone https://github.com/YOUR_USERNAME/btc-tracker.git
cd btc-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start adding your transactions.

## CSV format

You can bulk import transactions from a CSV file with these columns:

```
Date,Type,USD,BTC
2025-01-15,Buy,500,0.00512
2025-02-10,Buy,250,0.00261
2025-03-01,Income,0,0.00015
```

## Tech stack

Next.js · React · TypeScript · Tailwind CSS

## Privacy

Zero backend. Zero accounts. Zero tracking. Your transaction data lives in your browser's localStorage and never touches a server. Clone it, run it locally, own your data.

## License

MIT
