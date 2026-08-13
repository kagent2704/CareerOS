"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceItem } from "./workspaces";
type MailEvent = {
  id: string;
  sender: string;
  subject: string;
  received_at: string | null;
  category: string;
  confidence: number;
  action_status: string;
};
export function MailTracker({
  notify,
  onAddItem,
}: {
  notify: (message: string) => void;
  onAddItem: (item: Omit<WorkspaceItem, "id">) => Promise<boolean>;
}) {
  const [connection, setConnection] = useState<{
    email: string;
    last_synced_at: string | null;
  } | null>(null);
  const [events, setEvents] = useState<MailEvent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = createClient();
    Promise.all([
      client
        .from("mailbox_connections")
        .select("email,last_synced_at")
        .eq("provider", "google")
        .maybeSingle(),
      client
        .from("mailbox_events")
        .select(
          "id,sender,subject,received_at,category,confidence,action_status",
        )
        .order("received_at", { ascending: false })
        .limit(50),
    ]).then(([connected, mail]) => {
      if (connected.data) setConnection(connected.data);
      if (mail.data) setEvents(mail.data);
      setLoading(false);
    });
  }, []);
  async function setStatus(id: string, action_status: "approved" | "ignored") {
    const { error } = await createClient()
      .from("mailbox_events")
      .update({ action_status })
      .eq("id", id);
    if (error) return notify(error.message);
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, action_status } : event,
      ),
    );
    notify(`Mail event ${action_status}`);
  }
  async function sync() {
    const response = await fetch("/api/mail/sync", { method: "POST" });
    const payload = await response.json();
    if (!response.ok) return notify(payload.error || "Sync failed");
    notify(`${payload.imported} career messages imported; refresh to review`);
  }
  async function addToWorkspace(event: MailEvent) {
    const kind =
      event.category === "interview"
        ? "interview"
        : event.category === "job_alert"
          ? "job"
          : "task";
    const saved = await onAddItem({
      kind,
      title: event.subject,
      subtitle: event.sender,
      status: event.category === "rejection" ? "Closed" : "Needs review",
      due_date: null,
      data: {
        source: "gmail_metadata",
        mail_event_id: event.id,
        category: event.category,
        received_at: event.received_at,
        confidence: event.confidence,
      },
    });
    if (saved) notify("Mail signal added to your workspace for review");
  }
  return (
    <div className="workspace-page mail-page">
      <header className="workspace-header">
        <div>
          <p>INBOX INTELLIGENCE</p>
          <h1>Mail Tracker</h1>
          <span>
            Review job-search signals from message headers. CareerOS never reads
            message bodies.
          </span>
        </div>
      </header>
      <section className="workspace-card mailbox-connection">
        <div>
          <small>GOOGLE MAIL</small>
          <h2>
            {connection ? connection.email : "Connect your job-search inbox"}
          </h2>
          <p>
            {connection
              ? `Connected · ${connection.last_synced_at ? `last checked ${new Date(connection.last_synced_at).toLocaleString()}` : "ready for first sync"}`
              : "Uses sender, subject, date and labels only. Nothing enters your tracker without review."}
          </p>
        </div>
        {connection ? (
          <button onClick={sync}>Sync now</button>
        ) : (
          <a className="mail-connect" href="/api/mail/connect">
            Connect Gmail metadata
          </a>
        )}
      </section>
      <section className="workspace-card">
        <div className="workspace-card-head">
          <div>
            <h2>Detected career events</h2>
            <p>{events.length} messages</p>
          </div>
        </div>
        {loading ? (
          <div className="workspace-empty">
            <p>Loading inbox signals…</p>
          </div>
        ) : events.length ? (
          events.map((event) => (
            <article className="mail-event" key={event.id}>
              <div>
                <small>
                  {event.category.replaceAll("_", " ")} · {event.confidence}%
                  confidence
                </small>
                <strong>{event.subject}</strong>
                <span>
                  {event.sender} ·{" "}
                  {event.received_at
                    ? new Date(event.received_at).toLocaleString()
                    : "Date unavailable"}
                </span>
              </div>
              <div>
                {event.action_status === "review" ? (
                  <>
                    <button onClick={() => setStatus(event.id, "ignored")}>
                      Ignore
                    </button>
                    <button
                      className="primary"
                      onClick={() => setStatus(event.id, "approved")}
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <>
                    <b>{event.action_status}</b>
                    {event.action_status === "approved" && (
                      <button
                        className="primary"
                        onClick={() => addToWorkspace(event)}
                      >
                        Add to workspace
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="workspace-empty">
            <h2>No inbox signals yet</h2>
            <p>
              Connect Gmail to review application, assessment, interview, offer
              and rejection messages.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
