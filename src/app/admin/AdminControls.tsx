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

export function SendInvoiceButton({
  bookingId,
  alreadySent,
}: {
  bookingId: string;
  alreadySent: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    alreadySent ? "sent" : "idle"
  );
  const [msg, setMsg] = useState("");

  const send = async () => {
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/admin/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMsg(data.error || "Failed to send.");
        return;
      }
      setState("sent");
      router.refresh();
    } catch {
      setState("error");
      setMsg("Network error.");
    }
  };

  if (state === "sent") {
    return <span className="text-xs text-sage-dark">Invoice sent</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={send}
        disabled={state === "sending"}
        className="text-xs px-3 py-1.5 rounded-full bg-sage-dark text-white hover:bg-sage-deep transition-colors disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : alreadySent ? "Resend invoice" : "Send balance invoice"}
      </button>
      {state === "error" && <span className="text-xs text-error">{msg}</span>}
    </div>
  );
}
