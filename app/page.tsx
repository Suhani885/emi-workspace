"use client";

import { useAppContext } from "@/context/useAppContext";
import { useEMI } from "@/hooks/useEMI";
import { useAmortization } from "@/hooks/useAmortization";
import LoanInputs from "@/components/calculator/LoanInputs";
import SummaryCards from "@/components/calculator/SummaryCards";
import SensitivityTable from "@/components/sensitivity/SensitivityTable";
import AmortizationSection from "@/components/amortization/AmortizationSection";
import CompareScenarios from "@/components/compare/CompareScenarios";
import TabIndicator from "@/components/TabIndicator";
import PrepaymentPlanner from "@/components/prepayment/PrepaymentPlanner";

type Tab = "single" | "compare" | "prepayment";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "single",
    label: "Calculator",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="10" x2="10" y2="10" />
        <line x1="14" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="10" y2="14" />
        <line x1="14" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="16" y2="18" />
      </svg>
    ),
  },
  {
    id: "compare",
    label: "Compare",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "prepayment",
    label: "Prepayment",
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Page() {
  const { tabId, activeTabs, isLeader, state, dispatch } = useAppContext();
  const { loan, mode, theme } = state;

  const { emi } = useEMI(loan.amount, loan.rate, loan.tenure);
  const { schedule, breakEvenMonth } = useAmortization(
    loan.amount,
    loan.rate,
    loan.tenure,
    emi,
    [],
  );

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)]">
      <header className="px-4 md:px-6 sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg-base)] backdrop-blur-[20px] h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[8px] sm:rounded-[10px] bg-[var(--color-principal)] flex items-center justify-center shadow-[0_4px_16px_var(--color-principal-glow)] shrink-0">
            <svg
              width="16"
              height="16"
              className="sm:w-[18px] sm:h-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-[0.8rem] sm:text-[0.9rem] font-bold text-[var(--color-text-primary)] leading-[1.2] whitespace-nowrap">
              EMI Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <TabIndicator />

          <div className="relative group flex items-center justify-center">
            <button
              onClick={() => dispatch({ type: "UNDO" })}
              disabled={!state.past || state.past.length === 0}
              className={`w-9 h-9 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-card)] cursor-pointer flex items-center justify-center transition-all duration-200 shrink-0 ${
                !state.past || state.past.length === 0
                  ? "opacity-50 cursor-not-allowed text-[var(--color-text-muted)]"
                  : "text-[var(--color-text-secondary)] hover:border-[var(--color-principal)] hover:text-[var(--color-principal)]"
              }`}
              aria-label="Undo last action"
            >
              <UndoIcon />
            </button>
            <div className="absolute top-full right-0 mt-2 px-2.5 py-1.5 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] text-[0.75rem] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
              Undo
            </div>
          </div>

          <div className="relative group flex items-center justify-center">
            <button
              onClick={() =>
                dispatch({
                  type: "SET_THEME",
                  payload: theme === "light" ? "dark" : "light",
                })
              }
              className="w-9 h-9 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] cursor-pointer flex items-center justify-center transition-all duration-200 ease-in hover:border-[var(--color-principal)] hover:text-[var(--color-principal)] shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </button>
            <div className="absolute top-full right-0 mt-2 px-2.5 py-1.5 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] text-[0.75rem] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
              Toggle theme
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto py-6 px-4 md:px-6">
        <div className="flex gap-1 p-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-[14px] shadow-sm w-max max-w-full mb-6 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: "SET_MODE", payload: tab.id })}
              className={`flex items-center gap-[6px] py-2 px-[14px] rounded-[10px] text-[0.8rem] font-bold border-none cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] whitespace-nowrap shrink-0 ${
                mode === tab.id
                  ? "bg-[var(--color-principal)] text-white shadow-[0_4px_16px_var(--color-principal-glow)] transform scale-105"
                  : "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-input)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {mode === "single" && (
          <div className="animate-fade-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 mb-6">
              <LoanInputs />
              <div className="flex flex-col gap-6">
                <SummaryCards />
                <SensitivityTable />
              </div>
            </div>
            <AmortizationSection
              schedule={schedule}
              breakEvenMonth={breakEvenMonth}
              showPrepayment={false}
            />
          </div>
        )}

        {mode === "compare" && (
          <div className="animate-fade-slide-up">
            <CompareScenarios />
          </div>
        )}

        {mode === "prepayment" && (
          <div className="animate-fade-slide-up">
            <PrepaymentPlanner />
          </div>
        )}
      </div>
    </main>
  );
}
