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
  onUploadFile: (
    kind: "resume" | "document" | "preparation",
    file: File,
    title: string,
    details: string,
  ) => Promise<boolean>;
  onOpenItem: (item: WorkspaceItem) => Promise<void>;
  onSavePreferences: (data: Record<string, unknown>) => Promise<boolean>;
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

  if (props.active === "Jobs") return <JobsBoard {...props} />;
  if (props.active === "Interviews") return <InterviewCalendar {...props} />;
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
          onUploadFile={props.onUploadFile}
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
  onUploadFile,
}: {
  config: (typeof moduleCopy)[string];
  onClose: () => void;
  onSubmit: (item: Omit<WorkspaceItem, "id">) => Promise<void>;
  onUploadFile: (
    kind: "resume" | "document" | "preparation",
    file: File,
    title: string,
    details: string,
  ) => Promise<boolean>;
}) {
  const [uploading, setUploading] = useState(false);
  const isResume = config.kind === "resume";
  const isFileWorkspace = ["resume", "document", "preparation"].includes(
    config.kind,
  );
  if (config.kind === "company" || config.kind === "contact") {
    return (
      <DomainForm kind={config.kind} onClose={onClose} onSubmit={onSubmit} />
    );
  }
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <span className="modal-kicker">{config.eyebrow}</span>
        <h2>
          {isResume
            ? "Upload resume"
            : isFileWorkspace
              ? `Upload ${config.title === "Documents" ? "document" : "prep material"}`
              : config.add}
        </h2>
        <p>
          {isFileWorkspace
            ? `Upload a private ${isResume ? "PDF, DOC, or DOCX file up to 10 MB" : "PDF, DOC, DOCX, TXT, PNG, or JPG file up to 15 MB"}.`
            : "Add it to your private CareerOS workspace."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const title = String(form.get("title") || "");
            const details = String(form.get("subtitle") || "");
            if (isFileWorkspace) {
              const file = form.get("file");
              if (!(file instanceof File) || !file.size) return;
              setUploading(true);
              const saved = await onUploadFile(
                config.kind as "resume" | "document" | "preparation",
                file,
                title,
                details,
              );
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
                isFileWorkspace
                  ? "e.g. Backend Resume v2"
                  : `e.g. ${config.title === "Network" ? "Priya Sharma" : config.title === "Jobs" ? "Backend Engineer at Acme" : "My new item"}`
              }
            />
          </label>
          {isFileWorkspace && (
            <label>
              {isResume ? "Resume file" : "File"}
              <input
                name="file"
                className="file-input"
                type="file"
                accept={
                  isResume
                    ? ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    : ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/png,image/jpeg"
                }
                required
              />
            </label>
          )}
          <label>
            Details
            <input
              name="subtitle"
              placeholder={
                isFileWorkspace
                  ? "Target role, keywords, or version notes"
                  : "Company, location, notes, or link"
              }
            />
          </label>
          {!isFileWorkspace && (
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
              {uploading
                ? "Uploading…"
                : isResume
                  ? "Upload resume"
                  : isFileWorkspace
                    ? "Upload file"
                    : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DomainForm({
  kind,
  onClose,
  onSubmit,
}: {
  kind: "company" | "contact" | "interview";
  onClose: () => void;
  onSubmit: (item: Omit<WorkspaceItem, "id">) => Promise<void>;
}) {
  const labels =
    kind === "company"
      ? {
          kicker: "COMPANY CRM",
          title: "Add a target company",
          description:
            "Create one reusable company record for research, jobs, contacts, and applications.",
        }
      : kind === "contact"
        ? {
            kicker: "NETWORKING CRM",
            title: "Add a professional contact",
            description:
              "Capture the relationship and the next follow-up—not just a name.",
          }
        : {
            kicker: "INTERVIEW CALENDAR",
            title: "Schedule an interview round",
            description:
              "Add the round to your calendar with the context you need to prepare.",
          };
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal domain-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <span className="modal-kicker">{labels.kicker}</span>
        <h2>{labels.title}</h2>
        <p>{labels.description}</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (kind === "company")
              await onSubmit({
                kind,
                title: String(f.get("company")),
                subtitle: `${f.get("industry")} · ${f.get("locations")}`,
                status: String(f.get("priority")),
                due_date: null,
                data: {
                  industry: f.get("industry"),
                  locations: f.get("locations"),
                  website: f.get("website"),
                  career_page: f.get("career_page"),
                  rating: f.get("rating"),
                  notes: f.get("notes"),
                },
              });
            if (kind === "contact")
              await onSubmit({
                kind,
                title: String(f.get("name")),
                subtitle: `${f.get("role")} at ${f.get("company")}`,
                status: String(f.get("relationship")),
                due_date: String(f.get("follow_up")) || null,
                data: {
                  company: f.get("company"),
                  role: f.get("role"),
                  email: f.get("email"),
                  linkedin: f.get("linkedin"),
                  notes: f.get("notes"),
                },
              });
            if (kind === "interview")
              await onSubmit({
                kind,
                title: `${f.get("company")} — ${f.get("round")}`,
                subtitle: String(f.get("role")),
                status: "Scheduled",
                due_date: String(f.get("date")) || null,
                data: {
                  company: f.get("company"),
                  role: f.get("role"),
                  round: f.get("round"),
                  time: f.get("time"),
                  format: f.get("format"),
                  link: f.get("link"),
                  notes: f.get("notes"),
                },
              });
          }}
        >
          {kind === "company" && (
            <>
              <div className="form-grid">
                <label>
                  Company name
                  <input
                    name="company"
                    required
                    autoFocus
                    placeholder="e.g. Atlassian"
                  />
                </label>
                <label>
                  Industry
                  <select name="industry">
                    <option>Product</option>
                    <option>Consulting</option>
                    <option>Finance</option>
                    <option>Fintech</option>
                    <option>Startup</option>
                    <option>Service</option>
                    <option>Government</option>
                  </select>
                </label>
              </div>
              <label>
                Locations
                <input
                  name="locations"
                  placeholder="Pune, Bengaluru, Hyderabad"
                />
              </label>
              <div className="form-grid">
                <label>
                  Website
                  <input
                    name="website"
                    type="url"
                    placeholder="https://company.com"
                  />
                </label>
                <label>
                  Career page
                  <input
                    name="career_page"
                    type="url"
                    placeholder="https://company.com/careers"
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Dream rating
                  <select name="rating">
                    <option>5 — Dream company</option>
                    <option>4 — High priority</option>
                    <option>3 — Interested</option>
                    <option>2 — Consider</option>
                    <option>1 — Low priority</option>
                  </select>
                </label>
                <label>
                  Pipeline priority
                  <select name="priority">
                    <option>Target</option>
                    <option>Researching</option>
                    <option>Watching</option>
                    <option>Archived</option>
                  </select>
                </label>
              </div>
              <label>
                Research notes
                <textarea
                  name="notes"
                  placeholder="Products, culture, tech stack, referral opportunities…"
                />
              </label>
            </>
          )}
          {kind === "contact" && (
            <>
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    name="name"
                    required
                    autoFocus
                    placeholder="e.g. Priya Sharma"
                  />
                </label>
                <label>
                  Company
                  <input name="company" required placeholder="e.g. Atlassian" />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Role
                  <input
                    name="role"
                    placeholder="Recruiter, Engineer, Alumni…"
                  />
                </label>
                <label>
                  Relationship stage
                  <select name="relationship">
                    <option>To contact</option>
                    <option>Messaged</option>
                    <option>Replied</option>
                    <option>Referral offered</option>
                    <option>Interview scheduled</option>
                    <option>Keep warm</option>
                  </select>
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                  />
                </label>
                <label>
                  LinkedIn
                  <input
                    name="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/…"
                  />
                </label>
              </div>
              <label>
                Next follow-up
                <input name="follow_up" type="date" />
              </label>
              <label>
                Relationship notes
                <textarea
                  name="notes"
                  placeholder="Context, last conversation, what to follow up about…"
                />
              </label>
            </>
          )}
          {kind === "interview" && (
            <>
              <div className="form-grid">
                <label>
                  Company
                  <input
                    name="company"
                    required
                    autoFocus
                    placeholder="e.g. Razorpay"
                  />
                </label>
                <label>
                  Role
                  <input name="role" required placeholder="Backend Engineer" />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Round
                  <input
                    name="round"
                    required
                    placeholder="Technical round 1"
                  />
                </label>
                <label>
                  Format
                  <select name="format">
                    <option>Video call</option>
                    <option>Phone</option>
                    <option>On-site</option>
                    <option>Online assessment</option>
                  </select>
                </label>
              </div>
              <div className="form-grid">
                <label>
                  Date
                  <input name="date" type="date" required />
                </label>
                <label>
                  Time
                  <input name="time" type="time" required />
                </label>
              </div>
              <label>
                Meeting or assessment link
                <input
                  name="link"
                  type="url"
                  placeholder="https://meet.google.com/…"
                />
              </label>
              <label>
                Preparation notes
                <textarea
                  name="notes"
                  placeholder="Topics, interviewer, questions to prepare…"
                />
              </label>
            </>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              {kind === "company"
                ? "Add company"
                : kind === "contact"
                  ? "Add contact"
                  : "Schedule round"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const curatedJobs = [
  {
    id: "j1",
    company: "Atlassian",
    role: "Graduate Software Engineer",
    location: "Bengaluru",
    mode: "Hybrid",
    type: "Product",
    skills: "Java, TypeScript, distributed systems",
    match: 94,
  },
  {
    id: "j2",
    company: "Razorpay",
    role: "Backend Engineer",
    location: "Bengaluru",
    mode: "Hybrid",
    type: "Fintech",
    skills: "Java, Go, APIs, SQL",
    match: 92,
  },
  {
    id: "j3",
    company: "Mastercard",
    role: "Data Engineer I",
    location: "Pune",
    mode: "Hybrid",
    type: "Finance",
    skills: "Python, SQL, Spark",
    match: 90,
  },
  {
    id: "j4",
    company: "Druva",
    role: "Software Engineer",
    location: "Pune",
    mode: "Hybrid",
    type: "Product",
    skills: "Python, cloud, data structures",
    match: 88,
  },
  {
    id: "j5",
    company: "Microsoft",
    role: "Software Engineer",
    location: "Hyderabad",
    mode: "On-site",
    type: "Product",
    skills: "C++, Azure, algorithms",
    match: 87,
  },
  {
    id: "j6",
    company: "Zepto",
    role: "Analytics Engineer",
    location: "Mumbai",
    mode: "On-site",
    type: "Startup",
    skills: "SQL, dbt, Python",
    match: 84,
  },
  {
    id: "j7",
    company: "PhonePe",
    role: "Business Analyst",
    location: "Bengaluru",
    mode: "Hybrid",
    type: "Fintech",
    skills: "SQL, experimentation, dashboards",
    match: 82,
  },
  {
    id: "j8",
    company: "Canonical",
    role: "Graduate Software Engineer",
    location: "Remote",
    mode: "Remote",
    type: "Product",
    skills: "Linux, Python, open source",
    match: 80,
  },
];

function JobsBoard(props: Props) {
  const preference = props.items.find((item) => item.kind === "preference");
  const initial = (preference?.data || {}) as {
    roles?: string;
    locations?: string;
    modes?: string[];
  };
  const [roles, setRoles] = useState(
    initial.roles || "Software Engineer, Backend Engineer, Data Engineer",
  );
  const [locations, setLocations] = useState(
    initial.locations || "Pune, Bengaluru, Mumbai, Remote",
  );
  const [modes, setModes] = useState<string[]>(
    initial.modes || ["Remote", "Hybrid", "On-site"],
  );
  const [editing, setEditing] = useState(false);
  const roleTerms = roles
    .toLowerCase()
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const locationTerms = locations
    .toLowerCase()
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const visible = curatedJobs
    .filter(
      (job) =>
        (!roleTerms.length ||
          roleTerms.some(
            (term) =>
              job.role.toLowerCase().includes(term) ||
              term.includes(job.role.toLowerCase()),
          )) &&
        (!locationTerms.length ||
          locationTerms.includes(job.location.toLowerCase())) &&
        modes.includes(job.mode) &&
        `${job.company} ${job.role} ${job.location} ${job.skills}`
          .toLowerCase()
          .includes(props.query.toLowerCase()),
    )
    .sort((a, b) => b.match - a.match);
  const saved = new Set(
    props.items
      .filter((item) => item.kind === "job")
      .map((item) => String(item.data.catalog_id || "")),
  );
  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="CURATED OPPORTUNITIES"
        title="Jobs"
        description="A focused board ranked around your target roles, locations, and work preferences."
        action="Edit preferences"
        onAction={() => setEditing(true)}
      />
      <div className="job-board-summary">
        <div>
          <strong>{visible.length}</strong>
          <span>curated matches</span>
        </div>
        <p>
          Roles: {roles}
          <br />
          Locations: {locations}
        </p>
        <button onClick={() => setEditing(true)}>Tune recommendations</button>
      </div>
      <div className="job-board-grid">
        {visible.map((job) => (
          <article className="job-card" key={job.id}>
            <div className="job-card-top">
              <div className="record-icon">
                {job.company.slice(0, 2).toUpperCase()}
              </div>
              <span className="match-badge">{job.match}% match</span>
            </div>
            <small>
              {job.company} · {job.type}
            </small>
            <h2>{job.role}</h2>
            <p>
              {job.location} · {job.mode}
            </p>
            <div className="skill-line">{job.skills}</div>
            <div className="job-actions">
              <button
                disabled={saved.has(job.id)}
                onClick={() =>
                  props.onAddItem({
                    kind: "job",
                    title: job.role,
                    subtitle: `${job.company} · ${job.location} · ${job.mode}`,
                    status: "Saved",
                    due_date: null,
                    data: {
                      catalog_id: job.id,
                      company: job.company,
                      skills: job.skills,
                      match: job.match,
                    },
                  })
                }
              >
                {saved.has(job.id) ? "Saved" : "Save"}
              </button>
              <button className="primary" onClick={props.onAddApplication}>
                Track application
              </button>
            </div>
          </article>
        ))}
      </div>
      {editing && (
        <div className="modal-backdrop" onMouseDown={() => setEditing(false)}>
          <div
            className="modal preferences-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setEditing(false)}>
              ×
            </button>
            <span className="modal-kicker">JOB PREFERENCES</span>
            <h2>Tune your job board</h2>
            <p>
              CareerOS will rank and filter the curated catalog using these
              priorities.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (await props.onSavePreferences({ roles, locations, modes }))
                  setEditing(false);
              }}
            >
              <label>
                Preferred roles
                <textarea
                  value={roles}
                  onChange={(e) => setRoles(e.target.value)}
                  placeholder="Backend Engineer, Data Engineer"
                />
              </label>
              <label>
                Preferred locations
                <textarea
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  placeholder="Pune, Bengaluru, Remote"
                />
              </label>
              <fieldset>
                <legend>Work modes</legend>
                <div className="check-grid">
                  {["Remote", "Hybrid", "On-site"].map((mode) => (
                    <label key={mode}>
                      <input
                        type="checkbox"
                        checked={modes.includes(mode)}
                        onChange={(e) =>
                          setModes((current) =>
                            e.target.checked
                              ? [...current, mode]
                              : current.filter((value) => value !== mode),
                          )
                        }
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button type="submit">Save preferences</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewCalendar(props: Props) {
  const [showForm, setShowForm] = useState(false);
  const interviews = props.items.filter((item) => item.kind === "interview");
  const dated = new Map(
    interviews
      .filter((item) => item.due_date)
      .map((item) => [item.due_date, item]),
  );
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="INTERVIEW CALENDAR"
        title="Interviews"
        description="See every round in time, then capture preparation, format, and outcome."
        action="Schedule interview"
        onAction={() => setShowForm(true)}
      />
      <div className="calendar-layout">
        <article className="workspace-card calendar-card">
          <div className="calendar-title">
            <h2>
              {now.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <span>{interviews.length} scheduled</span>
          </div>
          <div className="calendar-grid">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <b key={day}>{day}</b>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <i key={`blank-${i}`} />
            ))}
            {Array.from({ length: days }, (_, i) => i + 1).map((day) => {
              const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const event = dated.get(key);
              return (
                <button
                  key={day}
                  className={`${day === now.getDate() ? "today" : ""} ${event ? "has-event" : ""}`}
                  onClick={() => event && props.onOpenItem(event)}
                >
                  <span>{day}</span>
                  {event && <small>{event.title}</small>}
                </button>
              );
            })}
          </div>
        </article>
        <aside className="workspace-card agenda">
          <h2>Upcoming rounds</h2>
          {interviews.length ? (
            interviews
              .sort((a, b) =>
                (a.due_date || "").localeCompare(b.due_date || ""),
              )
              .map((item) => (
                <article key={item.id}>
                  <time>
                    {item.due_date
                      ? new Date(
                          `${item.due_date}T00:00:00`,
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "TBD"}
                  </time>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                    <small>
                      {String(item.data.time || "Time TBD")} ·{" "}
                      {String(item.data.format || "Format TBD")}
                    </small>
                  </div>
                  <button onClick={() => props.onDeleteItem(item)}>×</button>
                </article>
              ))
          ) : (
            <div className="empty">No interviews scheduled.</div>
          )}
        </aside>
      </div>
      {showForm && (
        <DomainForm
          kind="interview"
          onClose={() => setShowForm(false)}
          onSubmit={async (item) => {
            if (await props.onAddItem(item)) setShowForm(false);
          }}
        />
      )}
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
