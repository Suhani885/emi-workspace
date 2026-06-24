# EMI Calculator Workspace

An interactive EMI calculator with real-time shared workspace capabilities, allowing users to analyze loans, plan prepayments, compare scenarios, and collaborate seamlessly across multiple browser tabs.

## Features

- 📊 EMI, Total Interest, and Total Payment calculations
- 💰 Prepayment planner with Interest Saved and Tenure Reduced metrics
- 📅 Detailed amortization schedule
- ⚖️ Compare multiple loan scenarios side-by-side
- 📈 Sensitivity analysis for varying interest rates and tenures
- 🔄 Real-time multi-tab synchronization using BroadcastChannel API
- ↩️ Shared undo history (`Ctrl + Z` support)
- 🔗 Shareable URLs with encoded application state
- 🌗 Dark and Light theme support

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **State Management:** Context API + Reducer
- **Sync:** BroadcastChannel API

## Getting Started

```bash
git clone https://github.com/Suhani885/emi-workspace.git
cd emi-workspace

npm install
npm run dev
```

Open `http://localhost:3000` in your browser.
