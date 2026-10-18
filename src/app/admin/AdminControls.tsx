"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="text-sm text-medium-gray hover:text-charcoal transition-colors"
    >
      Sign out
    </button>
  );
}

/**
 * Sends a booking's /pay link (or re-sends it — the link stays the same), and
 * once it exists, keeps it on the card to copy and text.
 */
export function RequestPaymentButton({
  bookingId,
  url: initialUrl,
  requestedAt,
  hasEmail,
}: {
  bookingId: string;
  url: string | null;
  requestedAt: string | null;
  hasEmail: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const send = async () => {
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/admin/request-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("idle");
        setMsg(data.error || "Failed to send.");
        return;
      }
      setUrl(data.url);
      setState(data.emailed ? "sent" : "idle");
      if (data.warning) setMsg(data.warning);
      router.refresh();
    } catch {
      setState("idle");
      setMsg("Network error.");
    }
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the link is visible on the pay page */
    }
  };

  const requested = requestedAt
    ? new Date(requestedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })
    : null;
  const pill = "text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={send}
        disabled={state === "sending"}
        className={`${pill} bg-olive text-white hover:bg-olive-dark`}
      >
        {state === "sending"
          ? "Sending…"
          : state === "sent"
            ? "Sent ✓"
            : !hasEmail
              ? "Create payment link"
              : url
                ? "Resend payment link"
                : "Request final payment"}
      </button>
      {url && (
        <button
          type="button"
          onClick={copy}
          className={`${pill} border border-charcoal/20 text-charcoal hover:bg-charcoal hover:text-white`}
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      )}
      {requested && state !== "sent" && <span className="text-xs text-medium-gray">Requested {requested}</span>}
      {msg && <span className="text-xs text-error w-full">{msg}</span>}
    </div>
  );
}
