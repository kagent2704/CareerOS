"use client";

import { useMemo, useState } from "react";

export type WorkspaceItem = {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  status: string;
  due_date: string | null;
  data: Record<string, unknown>;
};

export type WorkspaceApplication = {
  id: string;
  company: string;
  role: string;
  location: string;
  stage: string;
  date: string;
  match: number;
};

type Props = {
  active: string;
  applications: WorkspaceApplication[];
  items: WorkspaceItem[];
  query: string;
  onAddApplication: () => void;
  onSelectApplication: (application: WorkspaceApplication) => void;
  onAddItem: (item: Omit<WorkspaceItem, "id">) => Promise<boolean>;
  onDeleteItem: (item: WorkspaceItem) => Promise<void>;
  onUploadResume: (
    file: File,
    title: string,
    details: string,
  ) => Promise<boolean>;
  onOpenItem: (item: WorkspaceItem) => Promise<void>;
};

const moduleCopy: Record<
  string,
  {
    kind: string;
    eyebrow: string;
    title: string;
    description: string;
    add: string;
  }
> = {
  Jobs: {
    kind: "job",
    eyebrow: "OPPORTUNITY DATABASE",
    title: "Jobs",
    description:
      "Save and prioritize openings before they become applications.",
    add: "Save job",
  },
  Companies: {
    kind: "company",
    eyebrow: "COMPANY CRM",
    title: "Companies",
    description:
      "Research employers, capture notes, and build your target list.",
    add: "Add company",
  },
  Interviews: {
    kind: "interview",
    eyebrow: "INTERVIEW HUB",
    title: "Interviews",
    description: "Track every round, deadline, preparation plan, and outcome.",
    add: "Schedule interview",
  },
  Network: {
    kind: "contact",
    eyebrow: "NETWORKING CRM",
    title: "Network",
    description:
      "Remember recruiters, referrals, follow-ups, and conversations.",
    add: "Add contact",
  },
  "Resume Lab": {
    kind: "resume",
    eyebrow: "RESUME MANAGEMENT",
    title: "Resume Lab",
    description:
      "Manage targeted resume versions and measure which one converts.",
    add: "Add resume version",
  },
  "Interview Prep": {
    kind: "preparation",
    eyebrow: "PREPARATION LIBRARY",
    title: "Interview Prep",
    description: "Build reusable question banks and preparation plans by role.",
    add: "Add prep set",
  },
  Documents: {
    kind: "document",
    eyebrow: "CAREER VAULT",
    title: "Documents",
    description:
      "Catalog resumes, certificates, offer letters, and portfolio assets.",
    add: "Add document",
  },
};

export function WorkspaceView(props: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("All");
  const config = moduleCopy[props.active];
  const relevant = useMemo(() => {
    if (!config) return [];
    const q = props.query.toLowerCase();
    return props.items.filter(
      (item) =>
        item.kind === config.kind &&
        `${item.title} ${item.subtitle} ${item.status}`
          .toLowerCase()
          .includes(q) &&
        (filter === "All" || item.status === filter),
    );
  }, [config, filter, props.items, props.query]);

  if (props.active === "Applications") {
    const apps = props.applications.filter((item) =>
      `${item.company} ${item.role} ${item.location} ${item.stage}`
        .toLowerCase()
        .includes(props.query.toLowerCase()),
    );
    return (
      <div className="workspace-page">
        <WorkspaceHeader
          eyebrow="APPLICATION TRACKER"
          title="Applications"
          description="Move every opportunity from discovery to decision."
          action="Add application"
          onAction={props.onAddApplication}
        />
        <div className="workspace-stats">
          {["Saved", "Applied", "OA", "Interview", "Offer", "Rejected"].map(
            (stage) => (
              <article key={stage}>
                <strong>
                  {props.applications.filter((a) => a.stage === stage).length}
                </strong>
                <span>{stage}</span>
              </article>
            ),
          )}
        </div>
        <div className="workspace-card table-card">
          <div className="workspace-card-head">
            <div>
              <h2>All applications</h2>
              <p>{apps.length} records</p>
            </div>
          </div>
          {apps.length ? (
            <div className="data-table">
              <div className="data-row data-head">
                <span>Opportunity</span>
                <span>Stage</span>
                <span>Match</span>
                <span>Deadline</span>
                <span />
              </div>
              {apps.map((app) => (
                <button
                  className="data-row"
                  key={app.id}
                  onClick={() => props.onSelectApplication(app)}
                >
                  <span>
                    <strong>{app.role}</strong>
                    <small>
                      {app.company} · {app.location}
                    </small>
                  </span>
                  <span>
                    <i className="status-pill">{app.stage}</i>
                  </span>
                  <span>{app.match}%</span>
                  <span>{app.date}</span>
                  <span>›</span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No applications found"
              text="Add an opportunity or clear your search."
              action="Add application"
              onAction={props.onAddApplication}
            />
          )}
        </div>
      </div>
    );
  }

  if (props.active === "Analytics")
    return <Analytics applications={props.applications} />;
  if (!config) return null;

  const inferred =
    props.active === "Companies"
      ? [...new Set(props.applications.map((a) => a.company))].filter(
          (name) =>
            !relevant.some(
              (item) => item.title.toLowerCase() === name.toLowerCase(),
            ),
        )
      : [];
  const statuses = [
    ...new Set(
      props.items.filter((i) => i.kind === config.kind).map((i) => i.status),
    ),
  ];

  return (
    <div className="workspace-page">
      <WorkspaceHeader
        {...config}
        onAction={() => setShowForm(true)}
        action={config.add}
      />
      <div className="workspace-toolbar">
        <div className="filter-tabs">
          {["All", ...statuses].map((value) => (
            <button
              className={filter === value ? "selected" : ""}
              key={value}
              onClick={() => setFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <span>{relevant.length + inferred.length} items</span>
      </div>
      <div className="workspace-grid">
        {relevant.map((item) => (
          <article className="record-card" key={item.id}>
            <div className="record-icon">
              {item.title.slice(0, 2).toUpperCase()}
            </div>
            <div className="record-main">
              <small>{item.status}</small>
              <h3>{item.title}</h3>
              <p>{item.subtitle || "No additional details yet."}</p>
              {typeof item.data.file_name === "string" && (
                <button
                  className="file-link"
                  onClick={() => props.onOpenItem(item)}
                >
                  Open {item.data.file_name}
                </button>
              )}
              {item.due_date && (
                <time>
                  Due{" "}
                  {new Date(`${item.due_date}T00:00:00`).toLocaleDateString()}
                </time>
              )}
            </div>
            <button
              className="record-delete"
              aria-label={`Delete ${item.title}`}
              onClick={() => props.onDeleteItem(item)}
            >
              ×
            </button>
          </article>
        ))}
        {inferred.map((company) => (
          <article className="record-card" key={company}>
            <div className="record-icon">
              {company.slice(0, 2).toUpperCase()}
            </div>
            <div className="record-main">
              <small>From applications</small>
              <h3>{company}</h3>
              <p>
                {props.applications.filter((a) => a.company === company).length}{" "}
                tracked opportunities
              </p>
            </div>
          </article>
        ))}
      </div>
      {!relevant.length && !inferred.length && (
        <EmptyState
          title={`Your ${config.title.toLowerCase()} workspace is ready`}
          text={config.description}
          action={config.add}
          onAction={() => setShowForm(true)}
        />
      )}
      {showForm && (
        <ItemModal
          config={config}
          onClose={() => setShowForm(false)}
          onUploadResume={props.onUploadResume}
          onSubmit={async (item) => {
            if (await props.onAddItem(item)) setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function WorkspaceHeader({
  eyebrow,
  title,
  description,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <header className="workspace-header">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>{description}</span>
      </div>
      <button onClick={onAction}>＋ {action}</button>
    </header>
  );
}

function EmptyState({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="workspace-empty">
      <div>✦</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <button onClick={onAction}>{action}</button>
    </div>
  );
}

function ItemModal({
  config,
  onClose,
  onSubmit,
  onUploadResume,
}: {
  config: (typeof moduleCopy)[string];
  onClose: () => void;
  onSubmit: (item: Omit<WorkspaceItem, "id">) => Promise<void>;
  onUploadResume: (
    file: File,
    title: string,
    details: string,
  ) => Promise<boolean>;
}) {
  const [uploading, setUploading] = useState(false);
  const isResume = config.kind === "resume";
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <span className="modal-kicker">{config.eyebrow}</span>
        <h2>{isResume ? "Upload resume" : config.add}</h2>
        <p>
          {isResume
            ? "Upload a private PDF, DOC, or DOCX file up to 10 MB."
            : "Add it to your private CareerOS workspace."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const title = String(form.get("title") || "");
            const details = String(form.get("subtitle") || "");
            if (isResume) {
              const file = form.get("file");
              if (!(file instanceof File) || !file.size) return;
              setUploading(true);
              const saved = await onUploadResume(file, title, details);
              setUploading(false);
              if (saved) onClose();
              return;
            }
            await onSubmit({
              kind: config.kind,
              title,
              subtitle: details,
              status: String(form.get("status") || "Active"),
              due_date: String(form.get("due_date") || "") || null,
              data: {},
            });
          }}
        >
          <label>
            Name
            <input
              name="title"
              required
              autoFocus
              placeholder={
                isResume
                  ? "e.g. Backend Resume v2"
                  : `e.g. ${config.title === "Network" ? "Priya Sharma" : config.title === "Jobs" ? "Backend Engineer at Acme" : "My new item"}`
              }
            />
          </label>
          {isResume && (
            <label>
              Resume file
              <input
                name="file"
                className="file-input"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
              />
            </label>
          )}
          <label>
            Details
            <input
              name="subtitle"
              placeholder={
                isResume
                  ? "Target role, keywords, or version notes"
                  : "Company, location, notes, or link"
              }
            />
          </label>
          {!isResume && (
            <>
              <label>
                Status
                <select name="status">
                  <option>Active</option>
                  <option>Priority</option>
                  <option>Waiting</option>
                  <option>Completed</option>
                  <option>Archived</option>
                </select>
              </label>
              <label>
                Due date
                <input name="due_date" type="date" />
              </label>
            </>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : isResume ? "Upload resume" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Analytics({ applications }: { applications: WorkspaceApplication[] }) {
  const total = applications.length;
  const interviews = applications.filter(
    (a) => a.stage === "Interview" || a.stage === "Offer",
  ).length;
  const offers = applications.filter((a) => a.stage === "Offer").length;
  const roles = [...new Set(applications.map((a) => a.role))];
  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="CAREER ANALYTICS"
        title="Analytics"
        description="Understand where your search is working and where it needs attention."
        action="Add application"
        onAction={() =>
          document.querySelector<HTMLButtonElement>(".add-button")?.click()
        }
      />
      <div className="workspace-stats analytics-stats">
        <article>
          <strong>{total}</strong>
          <span>Total applications</span>
        </article>
        <article>
          <strong>{total ? Math.round((interviews / total) * 100) : 0}%</strong>
          <span>Interview conversion</span>
        </article>
        <article>
          <strong>{total ? Math.round((offers / total) * 100) : 0}%</strong>
          <span>Offer conversion</span>
        </article>
        <article>
          <strong>{roles.length}</strong>
          <span>Roles targeted</span>
        </article>
      </div>
      <div className="analytics-grid">
        <article className="workspace-card">
          <h2>Stage distribution</h2>
          {["Saved", "Applied", "OA", "Interview", "Offer", "Rejected"].map(
            (stage) => {
              const count = applications.filter(
                (a) => a.stage === stage,
              ).length;
              return (
                <div className="bar-row" key={stage}>
                  <span>{stage}</span>
                  <i>
                    <b
                      style={{
                        width: `${total ? Math.max(4, (count / total) * 100) : 0}%`,
                      }}
                    />
                  </i>
                  <strong>{count}</strong>
                </div>
              );
            },
          )}
        </article>
        <article className="workspace-card">
          <h2>Search health</h2>
          <div className="health-score">
            {total ? Math.min(100, 35 + total * 5 + interviews * 12) : 0}
          </div>
          <p>
            {total
              ? "Keep applications moving and follow up on waiting opportunities."
              : "Add applications to unlock meaningful analytics."}
          </p>
        </article>
      </div>
    </div>
  );
}
