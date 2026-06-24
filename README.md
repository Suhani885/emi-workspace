# EMI Calculator Workspace

A state-of-the-art, interactive, and highly responsive web application built to calculate EMIs, map amortization schedules, evaluate the impact of prepayments, and offer seamless real-time session synchronization across multiple browser tabs. 

Designed with a premium UI/UX, the EMI Workspace brings institutional-grade loan analytics to a beautiful, consumer-friendly interface.

---

## ✨ Key Features

- **📊 Dynamic EMI Calculation**: Instantly computes Monthly EMI, Total Interest Payable, and Total Amount Payable based on principal, interest rate, and tenure.
- **📅 Interactive Prepayment Planner**: Schedule prepayments for any specific month. Visualize live metrics such as **Interest Saved** and **Tenure Reduced** (months saved).
- **⚖️ Scenario Comparison**: Compare multiple loan configurations (e.g., varying interest rates or tenures) side-by-side to make the best financial decisions.
- **📈 Sensitivity Analysis**: View a detailed grid mapping out monthly EMI variations against dynamic interest rates (vertical axis) and loan tenures (horizontal axis).
- **🔄 Real-time Multi-Tab Sync**: Leveraging the native Web `BroadcastChannel` API, all input values, active tabs, themes, and prepayments are instantly synced across all open browser tabs in real-time.
- **↩️ Shared Undo History**: Confidently experiment with numbers. The app tracks state history for global undo action (via header buttons or standard `Ctrl+Z` shortcut).
- **🔗 Shareable Links**: The current state can be encoded into the URL, allowing you to copy a link and share your exact EMI scenario and prepayment schedule with others.
- **🌗 Premium Dark/Light Mode**: Smooth theme transitions built natively into the app, featuring curated colors and micro-animations for an elevated user experience.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16 (App Router)
- **Library**: [React](https://react.dev/) 19
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts/Visualizations**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

Follow these instructions to run the project on your local machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) and `npm`, installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Suhani885/emi-workspace.git
   cd emi-workspace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the App:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser. Open the same URL in a second tab to experience the real-time Broadcast API synchronization!

---

## Architecture & State Management

### Real-Time Sync (`BroadcastChannel`)
This project implements a custom real-time state synchronization system using the browser's native **BroadcastChannel API**. 

Instead of relying on WebSockets or a backend database, state changes are broadcasted locally across all tabs of the same origin.
- **`useBroadcast.ts`**: Manages the channel connection and payload dispatching.
- **`usePresence.ts`**: Tracks which tabs are active, assigning a "leader" tab to handle source-of-truth actions.
- **`useUrlState.ts`**: Hydrates state from and syncs state to the URL search parameters, enabling easy deep-linking.

### Amortization & Financial Logic
Complex financial calculations are extracted into custom, heavily tested hooks (`useEMI.ts`, `useAmortization.ts`). They handle compounding interest, mid-schedule prepayments, and recalculate break-even points natively.

