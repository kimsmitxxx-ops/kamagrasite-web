"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, UserRound, Loader2, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const SHOP_DASH_URL = process.env.NEXT_PUBLIC_SHOP_DASH_URL || "https://shop-dash-ruby.vercel.app";
const SHOP_ID = "209efc65-a11e-499c-a74a-3d1c5043758f"; // kamagrasite
const LS_CHAT_ID = "apo_chat_id";
const LS_VISITOR = "apo_chat_visitor";
const POLL_MS = 7000;

type Role = "visitor" | "ai" | "admin";
interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  created_at: string;
}

export interface ChatFabProps {
  variant?: "fab" | "inline";
  pulse?: boolean;
  label?: string;
  className?: string;
}

export function ChatFab({ variant = "fab", pulse, label = "Start chat", className }: ChatFabProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const trigger = variant === "inline" ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "inline-flex items-center gap-2 rounded bg-accent px-5 h-11 text-accent-foreground font-medium hover:bg-accent-muted transition-colors",
        className,
      )}
    >
      <MessageCircle size={18} /> {label}
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={label}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5rem)" }}
      className={cn(
        "fixed right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground ring-2 ring-accent-soft/40 shadow-lift hover:bg-accent-muted transition-colors md:!bottom-5",
        pulse && "after:absolute after:inset-0 after:rounded-full after:bg-accent after:opacity-40 after:animate-ping",
        className,
      )}
    >
      <MessageCircle size={26} strokeWidth={2.25} />
    </button>
  );

  return (
    <>
      {trigger}
      {mounted && <ChatPanel open={open} onOpenChange={setOpen} />}
    </>
  );
}

function ChatPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState<"intake" | "thread">("intake");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escalating, setEscalating] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage on first open
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const storedId = localStorage.getItem(LS_CHAT_ID);
    const storedVisitor = localStorage.getItem(LS_VISITOR);
    if (storedVisitor) {
      try {
        const v = JSON.parse(storedVisitor);
        setName(v.name || "");
        setEmail(v.email || "");
      } catch {}
    }
    if (storedId) {
      setConversationId(storedId);
      setStep("thread");
      void fetchThread(storedId);
    }
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Polling for new messages while panel open + thread active
  useEffect(() => {
    if (!open || !conversationId) return;
    const id = setInterval(() => {
      void fetchThread(conversationId, { silent: true });
    }, POLL_MS);
    return () => clearInterval(id);
  }, [open, conversationId]);

  async function fetchThread(id: string, opts: { silent?: boolean } = {}) {
    if (!opts.silent) setPolling(true);
    try {
      const res = await fetch(`${SHOP_DASH_URL}/api/support/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      setMessages(j.messages || []);
      setEscalated(j.conversation?.status === "escalated");
    } catch {
      // silent - keep prior state
    } finally {
      if (!opts.silent) setPolling(false);
    }
  }

  async function startConversation(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${SHOP_DASH_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: SHOP_ID,
          visitorName: name.trim() || null,
          visitorEmail: email.trim() || null,
          message: input.trim(),
          subject: input.trim().slice(0, 80),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Versturen mislukt (${res.status})`);
      }
      const j = await res.json();
      const newId = j.conversationId as string;
      if (typeof window !== "undefined") {
        localStorage.setItem(LS_CHAT_ID, newId);
        localStorage.setItem(LS_VISITOR, JSON.stringify({ name, email }));
      }
      setConversationId(newId);
      setStep("thread");
      setInput("");
      // refresh full thread from server (so we get IDs + AI reply in order)
      await fetchThread(newId);
    } catch (err: any) {
      setError(err.message || "Kon bericht niet versturen");
    } finally {
      setSending(false);
    }
  }

  async function sendFollowUp(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !conversationId) return;
    setSending(true);
    setError(null);
    const text = input.trim();
    // Optimistic insert
    setMessages((m) => [
      ...m,
      { id: `local-${Date.now()}`, role: "visitor", content: text, created_at: new Date().toISOString() },
    ]);
    setInput("");
    try {
      const res = await fetch(`${SHOP_DASH_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Versturen mislukt (${res.status})`);
      }
      await fetchThread(conversationId, { silent: true });
    } catch (err: any) {
      setError(err.message || "Kon bericht niet versturen");
    } finally {
      setSending(false);
    }
  }

  async function escalate() {
    if (!conversationId || escalating || escalated) return;
    setEscalating(true);
    setError(null);
    try {
      const res = await fetch(`${SHOP_DASH_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, action: "escalate" }),
      });
      if (!res.ok) throw new Error("Kon niet escaleren");
      await fetchThread(conversationId, { silent: true });
      setEscalated(true);
    } catch (err: any) {
      setError(err.message || "Kon niet escaleren");
    } finally {
      setEscalating(false);
    }
  }

  function resetThread() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LS_CHAT_ID);
    }
    setConversationId(null);
    setMessages([]);
    setEscalated(false);
    setStep("intake");
    setInput("");
    setError(null);
  }

  const submit = step === "intake" ? startConversation : sendFollowUp;
  const hasAiReply = messages.some((m) => m.role === "ai");
  const hasAdminReply = messages.some((m) => m.role === "admin");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-background">
        <header className="px-5 py-4 border-b border-border flex items-center gap-2">
          <MessageCircle size={18} className="text-accent" />
          <SheetTitle className="font-display text-lg">Live chat</SheetTitle>
          <span className="ml-auto text-xs text-text-muted">
            {polling ? "verversen…" : escalated ? "wacht op medewerker" : hasAdminReply ? "medewerker actief" : hasAiReply ? "AI-antwoord" : "Antwoord binnen 1 uur"}
          </span>
        </header>

        {step === "intake" ? (
          <form onSubmit={submit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            <p className="text-sm text-text-muted">
              Vraag over een product, een dosering of je bestelling? Stuur een bericht - we reageren
              tussen 09:00 en 21:00. Standaardvragen krijg je meteen antwoord op, specifieke
              vragen zetten we door naar een medewerker en beantwoorden we via e-mail.
            </p>
            <label className="block">
              <span className="text-xs font-medium text-text mb-1 block">Naam (optioneel)</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded border border-border bg-surface text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text mb-1 block">
                E-mail <span className="text-danger">*</span>
                <span className="ml-1 text-text-subtle font-normal">- voor het antwoord van onze medewerker</span>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jij@voorbeeld.nl"
                className="w-full h-10 px-3 rounded border border-border bg-surface text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text mb-1 block">Bericht</span>
              <textarea
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={5}
                placeholder="Wat is je vraag?"
                className="w-full px-3 py-2.5 rounded border border-border bg-surface text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-none"
              />
            </label>
            {error && <p className="text-sm text-danger flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
            <button
              type="submit"
              disabled={sending || !input.trim() || !email.trim() || !email.includes("@")}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 h-11 text-sm font-semibold text-accent-foreground hover:bg-accent-soft disabled:opacity-50"
            >
              {sending ? (<><Loader2 size={15} className="animate-spin" /> Versturen…</>) : (<><Send size={15} /> Start chat</>)}
            </button>
            <p className="text-[11px] text-text-subtle">
              We beantwoorden algemene vragen automatisch. Krijgen we jouw vraag niet
              instant beantwoord, dan sturen we een persoonlijk antwoord naar je e-mail -
              meestal binnen een uur tijdens openingstijden.
            </p>
          </form>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-sm text-text-muted py-6">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-text-subtle" />
                  <p className="mt-2">Bericht laden…</p>
                </div>
              )}
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {escalated && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 flex items-start gap-2">
                  <UserRound size={14} className="shrink-0 mt-0.5" />
                  <span>Doorgezet naar medewerker. Antwoord komt zo snel mogelijk (max 1 uur tijdens openingstijden).</span>
                </div>
              )}
            </div>
            <div className="border-t border-border px-3 py-3 space-y-2">
              {!escalated && hasAiReply && !hasAdminReply && (
                <button
                  type="button"
                  onClick={escalate}
                  disabled={escalating}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded border border-border-strong px-3 py-2 text-xs font-medium text-text hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  <UserRound size={13} /> {escalating ? "Doorzetten…" : "Praat met medewerker"}
                </button>
              )}
              <form onSubmit={submit} className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submit(e as any);
                    }
                  }}
                  rows={2}
                  placeholder="Bericht…"
                  className="flex-1 resize-none rounded border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded bg-accent text-accent-foreground hover:bg-accent-soft disabled:opacity-50"
                  aria-label="Verstuur"
                >
                  {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </form>
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="button"
                onClick={resetThread}
                className="text-[10px] text-text-subtle hover:text-text-muted"
              >
                Begin nieuw gesprek
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isVisitor = message.role === "visitor";
  const isAdmin = message.role === "admin";
  return (
    <div className={cn("flex", isVisitor ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isVisitor && "bg-accent text-accent-foreground",
          isAdmin && "bg-primary text-primary-foreground",
          !isVisitor && !isAdmin && "bg-paper-soft text-text border border-paper-border",
        )}
      >
        {!isVisitor && (
          <p className={cn(
            "text-[10px] uppercase tracking-wider font-semibold mb-1 opacity-70",
          )}>
            {isAdmin ? "Medewerker" : "Kamagra Site AI"}
          </p>
        )}
        {message.content}
      </div>
    </div>
  );
}

export const WhatsAppFab = ChatFab;
export default ChatFab;
