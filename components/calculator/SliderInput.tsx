"use client";

import { useCallback, useId, useState } from "react";

interface SliderInputProps {
  label: string;
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

export default function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix,
  suffix,
  minLabel,
  maxLabel,
  accentColor = "var(--color-principal)",
}: SliderInputProps) {
  const inputId = useId();
  const sliderId = useId();

  const clamp = useCallback(
    (val: number) => Math.min(max, Math.max(min, val)),
    [min, max]
  );

  const [localValue, setLocalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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

  const handleNumberBlur = useCallback(
    () => {
      setIsFocused(false);
      const parsed = parseFloat(localValue);
      if (isNaN(parsed)) {
        onChange(min);
      } else {
        onChange(clamp(parsed));
      }
    },
    [localValue, onChange, clamp, min]
  );

  const handleNumberFocus = useCallback(() => {
    setIsFocused(true);
    setLocalValue(value.toString());
  }, [value]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  const fillPercent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className="text-[0.8rem] font-semibold text-[var(--color-text-secondary)] tracking-[0.01em]"
        >
          {label}
        </label>

        <div
          className="flex items-center gap-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-[10px] px-3 py-1.5 transition-all duration-200 focus-within:border-[var(--color-principal)] focus-within:shadow-[0_0_0_3px_var(--color-principal-light)]"
        >
          {prefix && (
            <span className="text-[0.8rem] text-[var(--color-text-muted)] select-none">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            type="number"
            value={isFocused ? localValue : value}
            min={min}
            max={max}
            step={step}
            onChange={handleNumberChange}
            onFocus={handleNumberFocus}
            onBlur={handleNumberBlur}
            className="w-20 bg-transparent border-none outline-none text-[0.875rem] font-bold text-[var(--color-text-primary)] text-right font-[inherit] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label={label}
          />
          {suffix && (
            <span className="text-[0.8rem] text-[var(--color-text-muted)] select-none">
              {suffix}
            </span>
          )}
        </div>
      </div>

      <div className="relative py-0.5">
        <div
          className="absolute top-1/2 left-0 h-[3px] rounded-full -translate-y-1/2 pointer-events-none transition-[width] duration-[50ms] ease-out"
          style={{
            width: `${fillPercent}%`,
            background: accentColor,
          }}
        />
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="relative w-full"
          aria-label={label}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-[0.7rem] text-[var(--color-text-muted)]">
          {minLabel ?? String(min)}
        </span>
        <span className="text-[0.7rem] text-[var(--color-text-muted)]">
          {maxLabel ?? String(max)}
        </span>
      </div>
    </div>
  );
}