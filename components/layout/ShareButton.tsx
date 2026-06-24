"use client";

import { useAppContext } from "@/context/useAppContext";
import { useCopyLink } from "@/hooks/useCopyLink";

function LinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export default function ShareButton() {
  const { state } = useAppContext();
  const { copy, status } = useCopyLink(state.loan);

  const isCopied = status === "copied";
  const isError = status === "error";

  return (
    <div className="relative group flex items-center justify-center">
      <button
        id="share-link-button"
        onClick={copy}
        aria-label={
          isCopied
            ? "Link copied!"
            : isError
            ? "Failed to copy"
            : "Copy shareable link"
        }
        className={`
          relative flex items-center gap-[6px]
          h-10 sm:h-9 px-3 sm:px-3.5
          rounded-[10px] border
          text-[0.8rem] font-bold
          overflow-hidden
          transition-all duration-200
          shrink-0
          ${
            isCopied
              ? "border-[var(--color-interest)] bg-[color-mix(in_srgb,var(--color-interest)_12%,transparent)] text-[var(--color-interest)]"
              : isError
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-principal)] hover:text-[var(--color-principal)] active:scale-[0.92]"
          }
        `}
      >
        {isCopied && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 20%, color-mix(in srgb, var(--color-interest) 30%, transparent) 50%, transparent 80%)",
              animation: "share-shimmer 0.6s ease-out forwards",
            }}
          />
        )}

        <span
          className="flex items-center justify-center transition-all duration-200"
          style={{ transform: isCopied ? "scale(1.1)" : "scale(1)" }}
        >
          {isCopied ? <CheckIcon /> : isError ? <AlertIcon /> : <LinkIcon />}
        </span>

        <span className="hidden sm:inline whitespace-nowrap leading-none">
          {isCopied ? "Copied!" : isError ? "Failed" : "Share"}
        </span>
      </button>

      <div className="absolute top-full right-0 mt-2 px-2.5 py-1.5 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] text-[0.72rem] font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg z-50">
        {isCopied
          ? "✓ Link copied to clipboard"
          : isError
          ? "Could not copy — try manually"
          : "Copy shareable link"}
      </div>

      <style>{`
        @keyframes share-shimmer {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
