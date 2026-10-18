"use client";

import { useState } from "react";
import {
  TIP_RATES,
  suggestedTipCents,
  tipBaseCents,
  maxTipCents,
  dollarsToCents,
  formatCents,
} from "@/lib/payments";

type Choice = "none" | "custom" | number; // number = index into TIP_RATES

type Props = {
  token: string;
  dueCents: number;
  booking: { total: number; balance: number; paidInFull: boolean; tipEnabled: boolean };
};

export function PayPanel({ token, dueCents, booking }: Props) {
  const [choice, setChoice] = useState<Choice>("none");
  const [custom, setCustom] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const suggested = suggestedTipCents(booking);
  const customCents = dollarsToCents(custom);
  const customError =
    choice !== "custom" || custom.trim() === ""
      ? ""
      : customCents === null
        ? "Enter an amount like 25 or 25.50."
        : customCents > maxTipCents(booking)
          ? "That's more than the session itself — double-check the amount?"
          : "";

  const tipCents =
    !booking.tipEnabled || choice === "none"
      ? 0
      : choice === "custom"
        ? customError
          ? 0
          : customCents ?? 0
        : suggested[choice];
  const totalCents = dueCents + tipCents;

  async function pay() {
    if (customError) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/pay/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipCents }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout. Please try again.");
      setPaying(false);
    }
  }

  const option = (value: Choice, top: string, bottom?: string) => (
    <label className="block cursor-pointer">
      <input
        type="radio"
        name="tip"
        className="peer sr-only"
        checked={choice === value}
        onChange={() => setChoice(value)}
      />
      <span className="flex flex-col items-center justify-center min-h-[64px] rounded-md border border-beige px-2 py-3 text-center transition-colors hover:border-olive/60 peer-checked:border-olive peer-checked:bg-olive/10 peer-focus-visible:ring-2 peer-focus-visible:ring-olive/40">
        <span className="text-charcoal">{top}</span>
        {bottom && <span className="text-xs text-medium-gray mt-0.5">{bottom}</span>}
      </span>
    </label>
  );

  return (
    <div>
      {booking.tipEnabled && (
        <fieldset className="mb-8">
          <legend className="font-display text-xl text-charcoal mb-1">Add a tip?</legend>
          <p className="text-sm text-medium-gray mb-4">
            Completely optional — always appreciated, never expected. Suggested amounts are based
            on your {formatCents(tipBaseCents(booking))} session.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {option("none", "No tip")}
            {TIP_RATES.map((rate, i) => (
              <div key={rate}>{option(i, `${Math.round(rate * 100)}%`, formatCents(suggested[i]))}</div>
            ))}
          </div>
          <div className="mt-2">{option("custom", "Custom amount")}</div>

          {choice === "custom" && (
            <div className="mt-3">
              <label htmlFor="custom-tip" className="sr-only">
                Custom tip amount in dollars
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-gray">$</span>
                <input
                  id="custom-tip"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  autoFocus
                  placeholder="0.00"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="form-input pl-7 text-base"
                  aria-invalid={!!customError}
                  aria-describedby={customError ? "custom-tip-error" : undefined}
                />
              </div>
              {customError && (
                <p id="custom-tip-error" className="text-error text-sm mt-1">
                  {customError}
                </p>
              )}
            </div>
          )}
        </fieldset>
      )}

      <dl className="space-y-2 text-sm border-t border-beige pt-6 mb-6">
        {tipCents > 0 && (
          <>
            <div className="flex justify-between">
              <dt className="text-medium-gray">Balance</dt>
              <dd className="text-charcoal/80">{formatCents(dueCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-medium-gray">Tip</dt>
              <dd className="text-charcoal/80">{formatCents(tipCents)}</dd>
            </div>
          </>
        )}
        <div className="flex justify-between items-baseline pt-1">
          <dt className="font-display text-lg text-charcoal">Total today</dt>
          <dd className="font-display text-3xl text-olive">{formatCents(totalCents)}</dd>
        </div>
      </dl>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-md p-3 text-sm mb-4" role="alert">
          {error}
        </div>
      )}
      <button
        onClick={pay}
        disabled={paying || !!customError}
        className="btn-olive w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {paying ? "Redirecting to secure checkout…" : `Pay ${formatCents(totalCents)} securely`}
      </button>
      <p className="text-xs text-medium-gray mt-4 text-center">
        🔒 Secure payment powered by Stripe. Your card details are never stored.
      </p>
    </div>
  );
}
