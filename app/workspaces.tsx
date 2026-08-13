"use client";

import { useEffect, useMemo, useState } from "react";

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
  createdAt?: string;
};

type Props = {
  active: string;
  applications: WorkspaceApplication[];
  items: WorkspaceItem[];
  query: string;
  onAddApplication: (seed?: {
    company?: string;
    role?: string;
    location?: string;
    match?: number;
    sourceUrl?: string;
  }) => void;
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
  if (props.active === "Offers") return <OfferComparison {...props} />;
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

const fallbackJobs = [
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

type JobCard = (typeof fallbackJobs)[number] & {
  description?: string;
  url?: string;
  updatedAt?: string;
  source?: string;
};

function JobsBoard(props: Props) {
  const preference = props.items.find((item) => item.kind === "preference");
  const initial = (preference?.data || {}) as {
    roles?: string;
    locations?: string;
    modes?: string[];
    companyTypes?: string[];
    minimumSalary?: string;
    idealSalary?: string;
    dreamSalary?: string;
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
  const [companyTypes, setCompanyTypes] = useState<string[]>(
    initial.companyTypes || ["Product", "Startup", "Finance"],
  );
  const [minimumSalary, setMinimumSalary] = useState(
    initial.minimumSalary || "",
  );
  const [idealSalary, setIdealSalary] = useState(initial.idealSalary || "");
  const [dreamSalary, setDreamSalary] = useState(initial.dreamSalary || "");
  const [editing, setEditing] = useState(false);
  const [liveJobs, setLiveJobs] = useState<JobCard[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [feedNote, setFeedNote] = useState("Loading direct employer feeds…");
  const [personalized, setPersonalized] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ roles, locations });
    fetch(`/api/jobs?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Could not load live jobs");
        setLiveJobs(payload.jobs || []);
        setPersonalized(Boolean(payload.personalized));
        setFeedNote(
          `${payload.jobs?.length || 0} current openings · refreshed ${new Date(payload.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFeedNote(error.message);
      })
      .finally(() => setLoadingJobs(false));
    return () => controller.abort();
  }, [locations, roles]);
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
  const catalog: JobCard[] = liveJobs.length
    ? liveJobs
    : loadingJobs
      ? []
      : fallbackJobs;
  const visible = catalog
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
          <span>{liveJobs.length ? "live matches" : "starter matches"}</span>
        </div>
        <p>
          Roles: {roles}
          <br />
          Locations: {locations}
        </p>
        <button onClick={() => setEditing(true)}>Tune recommendations</button>
      </div>
      <div className="feed-status">
        <span className={liveJobs.length ? "live-dot" : ""} />
        {feedNote}. Rankings use your preferences
        {personalized ? " and resume profile" : ""}.
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
            {job.updatedAt && (
              <small>
                Updated {new Date(job.updatedAt).toLocaleDateString()} ·{" "}
                {job.source}
              </small>
            )}
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
                      url: job.url || null,
                      source: job.source || "CareerOS starter catalog",
                    },
                  })
                }
              >
                {saved.has(job.id) ? "Saved" : "Save"}
              </button>
              <button
                className="primary"
                onClick={() =>
                  props.onAddApplication({
                    company: job.company,
                    role: job.role,
                    location: `${job.location} · ${job.mode}`,
                    match: job.match,
                    sourceUrl: job.url,
                  })
                }
              >
                Track
              </button>
              {job.url && (
                <a href={job.url} target="_blank" rel="noreferrer">
                  Apply ↗
                </a>
              )}
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
                if (
                  await props.onSavePreferences({
                    roles,
                    locations,
                    modes,
                    companyTypes,
                    minimumSalary,
                    idealSalary,
                    dreamSalary,
                  })
                )
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
              <fieldset>
                <legend>Preferred company types</legend>
                <div className="check-grid">
                  {[
                    "Product",
                    "Consulting",
                    "Finance",
                    "Service",
                    "Startup",
                    "Government",
                  ].map((type) => (
                    <label key={type}>
                      <input
                        type="checkbox"
                        checked={companyTypes.includes(type)}
                        onChange={(event) =>
                          setCompanyTypes((current) =>
                            event.target.checked
                              ? [...current, type]
                              : current.filter((value) => value !== type),
                          )
                        }
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="form-grid">
                <label>
                  Minimum salary
                  <input
                    value={minimumSalary}
                    onChange={(event) => setMinimumSalary(event.target.value)}
                    placeholder="₹10 LPA"
                  />
                </label>
                <label>
                  Ideal salary
                  <input
                    value={idealSalary}
                    onChange={(event) => setIdealSalary(event.target.value)}
                    placeholder="₹16 LPA"
                  />
                </label>
                <label>
                  Dream salary
                  <input
                    value={dreamSalary}
                    onChange={(event) => setDreamSalary(event.target.value)}
                    placeholder="₹24 LPA"
                  />
                </label>
              </div>
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

function OfferComparison(props: Props) {
  const [showForm, setShowForm] = useState(false);
  const offers = props.items.filter((item) => item.kind === "offer");
  return (
    <div className="workspace-page">
      <WorkspaceHeader
        eyebrow="DECISION CENTER"
        title="Offer comparison"
        description="Compare total compensation, growth, learning, culture, commute, and confidence before deciding."
        action="Add offer"
        onAction={() => setShowForm(true)}
      />
      {offers.length ? (
        <div className="offer-table workspace-card">
          <div className="offer-row offer-head">
            <span>Company</span>
            <span>Compensation</span>
            <span>Growth</span>
            <span>Learning</span>
            <span>Culture</span>
            <span>Overall</span>
            <span />
          </div>
          {offers.map((offer) => (
            <div className="offer-row" key={offer.id}>
              <span>
                <strong>{offer.title}</strong>
                <small>{offer.subtitle}</small>
              </span>
              <span>
                {String(offer.data.base || "—")}
                <small>{String(offer.data.bonus || "No bonus listed")}</small>
              </span>
              {["growth", "learning", "culture"].map((field) => (
                <span key={field}>{String(offer.data[field] || 0)}/5</span>
              ))}
              <span className="offer-score">
                {String(offer.data.overall || 0)}
              </span>
              <button onClick={() => props.onDeleteItem(offer)}>×</button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No offers to compare"
          text="Add an offer when a pipeline reaches the decision stage."
          action="Add offer"
          onAction={() => setShowForm(true)}
        />
      )}
      {showForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
          <div
            className="modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setShowForm(false)}>
              ×
            </button>
            <span className="modal-kicker">OFFER DETAILS</span>
            <h2>Add an offer</h2>
            <p>Use the same 1–5 scale so the comparison stays honest.</p>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const ratings = [
                  "growth",
                  "learning",
                  "culture",
                  "commute",
                ].map((key) => Number(form.get(key) || 0));
                const overall = Math.round(
                  (ratings.reduce((a, b) => a + b, 0) / 20) * 100,
                );
                if (
                  await props.onAddItem({
                    kind: "offer",
                    title: String(form.get("company") || ""),
                    subtitle: `${String(form.get("role") || "")} · ${String(form.get("location") || "")}`,
                    status: "Considering",
                    due_date: String(form.get("decision_date") || "") || null,
                    data: {
                      base: String(form.get("base") || ""),
                      bonus: String(form.get("bonus") || ""),
                      stocks: String(form.get("stocks") || ""),
                      location: String(form.get("location") || ""),
                      growth: ratings[0],
                      learning: ratings[1],
                      culture: ratings[2],
                      commute: ratings[3],
                      overall,
                      notes: String(form.get("notes") || ""),
                    },
                  })
                )
                  setShowForm(false);
              }}
            >
              <label>
                Company
                <input name="company" required />
              </label>
              <label>
                Role
                <input name="role" required />
              </label>
              <div className="form-grid">
                <label>
                  Base salary
                  <input name="base" placeholder="₹18 LPA" />
                </label>
                <label>
                  Bonus
                  <input name="bonus" />
                </label>
                <label>
                  Stocks / equity
                  <input name="stocks" />
                </label>
                <label>
                  Location
                  <input name="location" />
                </label>
              </div>
              <div className="form-grid">
                {["growth", "learning", "culture", "commute"].map((field) => (
                  <label key={field}>
                    {field[0].toUpperCase() + field.slice(1)}
                    <select name={field} defaultValue="3">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
              <label>
                Decision date
                <input type="date" name="decision_date" />
              </label>
              <label>
                Notes
                <textarea name="notes" />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button>Add offer</button>
              </div>
            </form>
          </div>
        </div>
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
  const applied = applications.filter((a) => a.stage !== "Saved").length;
  const responses = applications.filter((a) =>
    ["OA", "Interview", "Offer", "Rejected"].includes(a.stage),
  ).length;
  const grouped = (values: string[]) =>
    Object.entries(
      values.reduce<Record<string, number>>((result, value) => {
        const key = value.trim() || "Not specified";
        result[key] = (result[key] || 0) + 1;
        return result;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  const roleGroups = grouped(
    applications.map((application) => application.role),
  );
  const locationGroups = grouped(
    applications.map((application) =>
      application.location.split("·")[0].trim(),
    ),
  );
  const weekGroups = grouped(
    applications.map((application) => {
      const date = new Date(application.createdAt || "1970-01-01T00:00:00Z");
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay());
      return start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }),
  );
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
          <strong>
            {applied ? Math.round((responses / applied) * 100) : 0}%
          </strong>
          <span>Response rate</span>
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
      <div className="analytics-grid analytics-breakdowns">
        <Breakdown
          title="Applications by role"
          rows={roleGroups}
          total={total}
        />
        <Breakdown
          title="Applications by location"
          rows={locationGroups}
          total={total}
        />
        <Breakdown
          title="Applications by week"
          rows={weekGroups}
          total={total}
        />
        <article className="workspace-card">
          <h2>Portfolio breadth</h2>
          <div className="health-score">{roles.length}</div>
          <p>
            distinct roles across{" "}
            {
              new Set(applications.map((application) => application.company))
                .size
            }{" "}
            companies.
          </p>
        </article>
      </div>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  total,
}: {
  title: string;
  rows: Array<[string, number]>;
  total: number;
}) {
  return (
    <article className="workspace-card">
      <h2>{title}</h2>
      {rows.length ? (
        rows.map(([label, count]) => (
          <div className="bar-row" key={label}>
            <span>{label}</span>
            <i>
              <b
                style={{
                  width: `${Math.max(5, (count / Math.max(total, 1)) * 100)}%`,
                }}
              />
            </i>
            <strong>{count}</strong>
          </div>
        ))
      ) : (
        <p>No data yet.</p>
      )}
    </article>
  );
}
