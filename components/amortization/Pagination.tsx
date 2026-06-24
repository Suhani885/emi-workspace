"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  totalRows,
  rowsPerPage,
  onPageChange,
}: PaginationProps) {
  const start = (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalRows);

  const btnClass = "py-2 px-3 sm:py-1.5 sm:px-3.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-input)] text-[var(--color-text-secondary)] text-[0.75rem] font-semibold cursor-pointer font-[inherit] transition-all duration-150 hover:border-[var(--color-principal)] hover:text-[var(--color-principal)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text-secondary)]";

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3 pt-3.5 px-1 pb-0 border-t border-[var(--color-border)] mt-1">
      <span className="text-[0.72rem] text-[var(--color-text-muted)]">
        Showing{" "}
        <span className="text-[var(--color-text-secondary)] font-semibold">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="text-[var(--color-text-secondary)] font-semibold">
          {totalRows}
        </span>{" "}
        months
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={btnClass}
        >
          ← Prev
        </button>

        <div className="flex items-center gap-1 py-1 px-2.5 bg-[var(--color-bg-input)] rounded-lg border border-[var(--color-border)]">
          <span className="text-[0.78rem] font-bold text-[var(--color-principal)]">
            {page}
          </span>
          <span className="text-[0.72rem] text-[var(--color-text-muted)]">/ {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={btnClass}
        >
          Next →
        </button>
      </div>
    </div>
  );
}