"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Tooltip from "@/components/ui/Tooltip";

interface SliderInputProps {
  label: string;
  helperText?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  formatDisplay?: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
  accentColor?: string;
}

function formatBubbleValue(
  value: number,
  prefix?: string,
  suffix?: string,
  formatDisplay?: (v: number) => string
): string {
  if (formatDisplay) return formatDisplay(value);
  if (prefix === "₹") {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  }
  return `${value}${suffix ?? ""}`;
}

function ChevronUp() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix,
  suffix,
  formatDisplay,
  minLabel,
  maxLabel,
  helperText,
  accentColor = "var(--color-principal)",
}: SliderInputProps) {
  const inputId = useId();
  const sliderId = useId();
  const numberInputRef = useRef<HTMLInputElement>(null);

  const clamp = useCallback(
    (val: number) => Math.min(max, Math.max(min, val)),
    [min, max]
  );

  const [localValue, setLocalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [liveValue, setLiveValue] = useState(value);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setLiveValue(value);
    }
  }, [value]);

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalValue(raw);
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(clamp(parsed));
      }
    },
    [onChange, clamp]
  );

  const handleNumberBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseFloat(localValue);
    if (isNaN(parsed) || localValue === "") {
      onChange(min);
    } else {
      onChange(clamp(parsed));
    }
  }, [localValue, onChange, clamp, min]);

  const handleNumberFocus = useCallback(() => {
    setIsFocused(true);
    setLocalValue(String(value));
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const newVal = clamp(liveValue + step);
        setLiveValue(newVal);
        onChange(newVal);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newVal = clamp(liveValue - step);
        setLiveValue(newVal);
        onChange(newVal);
      }
    },
    [liveValue, step, clamp, onChange]
  );

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const newVal = clamp(liveValue + step);
      setLiveValue(newVal);
      onChange(newVal);
    },
    [liveValue, step, clamp, onChange]
  );

  const handleDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const newVal = clamp(liveValue - step);
      setLiveValue(newVal);
      onChange(newVal);
    },
    [liveValue, step, clamp, onChange]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      setLiveValue(v);
      onChange(v);
    },
    [onChange]
  );

  const startDrag = useCallback(() => {
    isDraggingRef.current = true;
    setIsDragging(true);
  }, []);

  const endDrag = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  const fillPercent = ((liveValue - min) / (max - min)) * 100;
  const bubbleLabel = formatBubbleValue(liveValue, prefix, suffix, formatDisplay);
  const sliderBackground = `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${fillPercent}%, var(--color-border) ${fillPercent}%, var(--color-border) 100%)`;

  const displayValue = isFocused
    ? localValue
    : formatDisplay
    ? formatDisplay(liveValue)
    : String(liveValue);

  const showSuffix = suffix && (!formatDisplay || isFocused);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          {helperText ? (
            <Tooltip content={helperText} className="w-max">
              <label
                htmlFor={inputId}
                className="text-[0.78rem] sm:text-[0.9rem] font-bold text-[var(--color-text-primary)] tracking-[0.01em] border-b border-dashed border-[var(--color-text-muted)] pb-[1px]"
              >
                {label}
              </label>
            </Tooltip>
          ) : (
            <label
              htmlFor={inputId}
              className="text-[0.78rem] sm:text-[0.9rem] font-bold text-[var(--color-text-primary)] tracking-[0.01em] cursor-default"
            >
              {label}
            </label>
          )}
        </div>

        <div className="group flex items-center gap-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[10px] sm:rounded-[12px] px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-200 focus-within:border-[var(--color-principal)] focus-within:shadow-[0_0_0_3px_var(--color-principal-light)]">
          {prefix && (
            <span className="text-[0.72rem] sm:text-[0.8rem] text-[var(--color-text-muted)] select-none mr-0.5">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            ref={numberInputRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleNumberChange}
            onFocus={handleNumberFocus}
            onBlur={handleNumberBlur}
            onKeyDown={handleKeyDown}
            placeholder={String(value)}
            className="w-[58px] sm:w-[72px] bg-transparent border-none outline-none text-[0.88rem] sm:text-[1rem] font-extrabold text-[var(--color-principal)] text-right font-[inherit]"
            aria-label={label}
          />
          {showSuffix && (
            <span className="text-[0.72rem] sm:text-[0.8rem] text-[var(--color-text-muted)] select-none ml-0.5">
              {suffix}
            </span>
          )}

          <div className="flex flex-col shrink-0 ml-1 gap-px opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={handleIncrement}
              className="w-[18px] h-[14px] flex items-center justify-center rounded-[4px] text-[var(--color-text-muted)] hover:text-[var(--color-principal)] hover:bg-[var(--color-principal-light)] transition-colors duration-100"
              aria-label={`Increase ${label}`}
            >
              <ChevronUp />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={handleDecrement}
              className="w-[18px] h-[14px] flex items-center justify-center rounded-[4px] text-[var(--color-text-muted)] hover:text-[var(--color-principal)] hover:bg-[var(--color-principal-light)] transition-colors duration-100"
              aria-label={`Decrease ${label}`}
            >
              <ChevronDown />
            </button>
          </div>
        </div>
      </div>

      <div className="relative py-1 mt-1">
        {isDragging && (
          <div
            className="absolute bottom-[calc(100%+8px)] pointer-events-none z-10"
            style={{
              left: `calc(${fillPercent}% + ${12 - fillPercent * 0.24}px)`,
              transform: "translateX(-50%)",
            }}
          >
            <div
              className="px-2.5 py-1.5 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] rounded-lg text-[0.75rem] font-medium whitespace-nowrap shadow-lg"
            >
              {bubbleLabel}
            </div>
            <div
              className="w-0 h-0 mx-auto border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[var(--color-text-primary)]"
            />
          </div>
        )}

        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={liveValue}
          onChange={handleSliderChange}
          onMouseDown={startDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={startDrag}
          onTouchEnd={endDrag}
          className={`relative w-full${isDragging ? " is-dragging" : ""}`}
          style={{ background: sliderBackground }}
          aria-label={label}
        />
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-[0.65rem] sm:text-[0.75rem] font-medium text-[var(--color-text-muted)]">
          {minLabel ?? String(min)}
        </span>
        <span className="text-[0.65rem] sm:text-[0.75rem] font-medium text-[var(--color-text-muted)]">
          {maxLabel ?? String(max)}
        </span>
      </div>
    </div>
  );
}
