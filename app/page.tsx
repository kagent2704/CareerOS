"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { WorkspaceItem, WorkspaceView } from "./workspaces";
import "./dashboard.css";

type Application = {
  id: string;
  company: string;
  initials: string;
  color: string;
  role: string;
  location: string;
  stage: string;
  date: string;
  match: number;
};

type ApplicationRow = {
  id: string;
  company: string;
  role: string;
  location: string;
  stage: string;
  match_score: number;
  deadline: string | null;
};

const demoApplications: Omit<Application, "id">[] = [
  {
    company: "Razorpay",
    initials: "RZ",
    color: "#5b5bd6",
    role: "Backend Engineer",
    location: "Bengaluru · Hybrid",
    stage: "Interview",
    date: "Aug 12",
    match: 94,
  },
  {
    company: "Atlassian",
    initials: "AT",
    color: "#1769e0",
    role: "Graduate Software Engineer",
    location: "Bengaluru · Remote",
    stage: "Applied",
    date: "Aug 6",
    match: 91,
  },
  {
    company: "Zepto",
    initials: "ZP",
    color: "#7f38c7",
    role: "Data Engineer",
    location: "Mumbai · On-site",
    stage: "OA",
    date: "Aug 9",
    match: 88,
  },
  {
    company: "CRED",
    initials: "CR",
    color: "#151515",
    role: "Software Engineer I",
    location: "Bengaluru · Hybrid",
    stage: "Saved",
    date: "Aug 15",
    match: 84,
  },
];

const companyColors = ["#5b5bd6", "#1769e0", "#7f38c7", "#151515", "#ef6a3a"];

function formatApplication(row: ApplicationRow): Application {
  const colorIndex =
    [...row.company].reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % companyColors.length;
  return {
    id: row.id,
    company: row.company,
    initials: row.company.slice(0, 2).toUpperCase(),
    color: companyColors[colorIndex],
    role: row.role,
    location: row.location,
    stage: row.stage,
    date: row.deadline
      ? new Intl.DateTimeFormat("en", {
          month: "short",
          day: "numeric",
        }).format(new Date(`${row.deadline}T00:00:00`))
      : "No date",
    match: row.match_score,
  };
}

const nav = [
  "Overview",
  "Applications",
  "Jobs",
  "Companies",
  "Interviews",
  "Network",
];

export default function Home() {
  const router = useRouter();
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [utilityPanel, setUtilityPanel] = useState<
    "notifications" | "calendar" | "coach" | null
  >(null);
  const [toast, setToast] = useState("");
  const [storedApplications, setStoredApplications] = useState<Application[]>(
    [],
  );
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [workspaceItems, setWorkspaceItems] = useState<WorkspaceItem[]>([]);
  const [profile, setProfile] = useState({
    fullName: "CareerOS User",
    headline: "Building my next opportunity",
    location: "",
    email: "",
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setProfile({
        fullName:
          user.user_metadata.full_name ||
          user.user_metadata.name ||
          user.email?.split("@")[0] ||
          "CareerOS User",
        headline: user.user_metadata.headline || "Building my next opportunity",
        location: user.user_metadata.location || "",
        email: user.email || "",
      });
      let { data, error } = await supabase
        .from("applications")
        .select("id, company, role, location, stage, match_score, deadline")
        .order("created_at", { ascending: false });
      if (
        !error &&
        data?.length === 0 &&
        user.email?.toLowerCase() === "kashmirasanjaypatil@gmail.com"
      ) {
        const seeded = await supabase
          .from("applications")
          .insert(
            demoApplications.map((application) => ({
              user_id: user.id,
              company: application.company,
              role: application.role,
              location: application.location,
              stage: application.stage,
              match_score: application.match,
              deadline: `2026-${application.date === "Aug 6" ? "08-06" : application.date === "Aug 9" ? "08-09" : application.date === "Aug 12" ? "08-12" : "08-15"}`,
            })),
          )
          .select("id, company, role, location, stage, match_score, deadline");
        data = seeded.data;
        error = seeded.error;
      }
      if (error) {
        setToast(`Could not load applications: ${error.message}`);
        window.setTimeout(() => setToast(""), 4000);
      } else setStoredApplications((data || []).map(formatApplication));
      const workspaceResult = await supabase
        .from("workspace_items")
        .select("id, kind, title, subtitle, status, due_date, data")
        .order("created_at", { ascending: false });
      if (!workspaceResult.error)
        setWorkspaceItems((workspaceResult.data || []) as WorkspaceItem[]);
      setApplicationsLoading(false);
    });
  }, []);

  const firstName = profile.fullName.trim().split(/\s+/)[0] || "there";
  const initials =
    profile.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CU";
  const isDemoAccount =
    profile.email.toLowerCase() === "kashmirasanjaypatil@gmail.com";
  const applicationCount = storedApplications.length;
  const pipeline = [
    {
      n: storedApplications.filter((item) => item.stage === "Saved").length,
      l: "Saved",
      c: "gray",
    },
    {
      n: storedApplications.filter((item) => item.stage === "Applied").length,
      l: "Applied",
      c: "blue",
    },
    {
      n: storedApplications.filter((item) => item.stage === "OA").length,
      l: "OA",
      c: "purple",
    },
    {
      n: storedApplications.filter((item) => item.stage === "Interview").length,
      l: "Interview",
      c: "orange",
    },
    {
      n: storedApplications.filter((item) => item.stage === "Offer").length,
      l: "Offer",
      c: "green",
    },
  ];

  const rows = useMemo(
    () =>
      storedApplications.filter((item) =>
        `${item.company} ${item.role} ${item.location}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [storedApplications, query],
  );

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  async function addApplication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return notify("Please sign in again before adding an application");
    const { data: created, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company: String(data.get("company") || "").trim(),
        role: String(data.get("role") || "").trim(),
        location: String(data.get("location") || "").trim(),
        stage: String(data.get("stage") || "Saved"),
        deadline: String(data.get("deadline") || "") || null,
      })
      .select("id, company, role, location, stage, match_score, deadline")
      .single();
    if (error || !created)
      return notify(error?.message || "Could not save application");
    setStoredApplications((current) => [
      formatApplication(created),
      ...current,
    ]);
    setShowModal(false);
    notify("Application saved permanently");
  }

  async function signOut() {
    if (!isSupabaseConfigured()) return notify("Supabase is not connected yet");
    await createClient().auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  async function addWorkspaceItem(item: Omit<WorkspaceItem, "id">) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      notify("Please sign in again");
      return false;
    }
    const { data, error } = await supabase
      .from("workspace_items")
      .insert({ ...item, user_id: user.id })
      .select("id, kind, title, subtitle, status, due_date, data")
      .single();
    if (error || !data) {
      notify(error?.message || "Could not save item");
      return false;
    }
    setWorkspaceItems((current) => [data as WorkspaceItem, ...current]);
    notify("Saved to your workspace");
    return true;
  }

  async function deleteWorkspaceItem(id: string) {
    const { error } = await createClient()
      .from("workspace_items")
      .delete()
      .eq("id", id);
    if (error) return notify(error.message);
    setWorkspaceItems((current) => current.filter((item) => item.id !== id));
    notify("Item deleted");
  }

  async function updateApplication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedApplication) return;
    const form = new FormData(e.currentTarget);
    const changes = {
      company: String(form.get("company") || "").trim(),
      role: String(form.get("role") || "").trim(),
      location: String(form.get("location") || "").trim(),
      stage: String(form.get("stage") || "Saved"),
      match_score: Number(form.get("match_score") || 0),
      deadline: String(form.get("deadline") || "") || null,
    };
    const { data, error } = await createClient()
      .from("applications")
      .update(changes)
      .eq("id", selectedApplication.id)
      .select("id, company, role, location, stage, match_score, deadline")
      .single();
    if (error || !data)
      return notify(error?.message || "Could not update application");
    const formatted = formatApplication(data as ApplicationRow);
    setStoredApplications((current) =>
      current.map((item) => (item.id === formatted.id ? formatted : item)),
    );
    setSelectedApplication(null);
    notify("Application updated");
  }

  async function deleteApplication() {
    if (
      !selectedApplication ||
      !window.confirm(
        `Delete ${selectedApplication.company} — ${selectedApplication.role}?`,
      )
    )
      return;
    const { error } = await createClient()
      .from("applications")
      .delete()
      .eq("id", selectedApplication.id);
    if (error) return notify(error.message);
    setStoredApplications((current) =>
      current.filter((item) => item.id !== selectedApplication.id),
    );
    setSelectedApplication(null);
    notify("Application deleted");
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nextProfile = {
      ...profile,
      fullName: String(data.get("fullName") || "").trim(),
      headline: String(data.get("headline") || "").trim(),
      location: String(data.get("location") || "").trim(),
    };
    const { error } = await createClient().auth.updateUser({
      data: {
        full_name: nextProfile.fullName,
        headline: nextProfile.headline,
        location: nextProfile.location,
      },
    });
    if (error) return notify(error.message);
    setProfile(nextProfile);
    setShowProfile(false);
    notify("Profile updated");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="CareerOS home">
          <span className="brand-mark">C</span>
          <span>
            Career<span>OS</span>
          </span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {nav.map((item, index) => (
            <button
              key={item}
              className={active === item ? "active" : ""}
              onClick={() => setActive(item)}
            >
              <span className="nav-icon" aria-hidden="true">
                {["⌂", "▣", "⌕", "◇", "◉", "♧"][index]}
              </span>
              {item}
              {item === "Applications" && (
                <span className="count">{applicationCount}</span>
              )}
            </button>
          ))}
          <p className="nav-label tools-label">Your tools</p>
          {["Resume Lab", "Interview Prep", "Documents", "Analytics"].map(
            (item, index) => (
              <button
                key={item}
                className={active === item ? "active" : ""}
                onClick={() => setActive(item)}
              >
                <span className="nav-icon" aria-hidden="true">
                  {["▤", "✦", "□", "↗"][index]}
                </span>
                {item}
              </button>
            ),
          )}
        </nav>
        <div className="coach-card">
          <div className="coach-orb">✦</div>
          <strong>Career Coach</strong>
          <p>Get a focused plan for your week.</p>
          <button onClick={() => setUtilityPanel("coach")}>
            Plan my week <span>→</span>
          </button>
        </div>
        <button
          className="profile"
          onClick={() => setShowProfile(true)}
          title="Edit profile"
        >
          <span className="avatar">{initials}</span>
          <span>
            <strong>{profile.fullName}</strong>
            <small>{profile.headline}</small>
          </span>
          <span className="dots">↗</span>
        </button>
      </aside>

      <section className="content" id="top">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">C</span> CareerOS
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, companies, people…"
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setUtilityPanel("notifications")}
            >
              ♢<span className="notification-dot" />
            </button>
            <button className="add-button" onClick={() => setShowModal(true)}>
              <span>＋</span> Add application
            </button>
          </div>
        </header>

        {active === "Overview" ? (
          <div className="page-wrap">
            <section className="welcome">
              <div>
                <p className="eyebrow">FRIDAY, AUGUST 7</p>
                <h1>Good morning, {firstName}.</h1>
                <p>Here’s where your job search stands today.</p>
              </div>
              <div className="week-chip">
                <span>↗</span>
                <div>
                  <strong>Strong week</strong>
                  <small>12% more activity</small>
                </div>
              </div>
            </section>

            <section className="metrics" aria-label="Job search metrics">
              <article>
                <div className="metric-top">
                  <span className="metric-icon coral">↗</span>
                  <span className={isDemoAccount ? "trend up" : "trend"}>
                    {isDemoAccount ? "+4 this week" : "Start tracking"}
                  </span>
                </div>
                <strong>{applicationCount}</strong>
                <p>Applications sent</p>
              </article>
              <article>
                <div className="metric-top">
                  <span className="metric-icon blue">◷</span>
                  <span className="trend">
                    {isDemoAccount ? "3 active" : "No active roles"}
                  </span>
                </div>
                <strong>{isDemoAccount ? 6 : 0}</strong>
                <p>In progress</p>
              </article>
              <article>
                <div className="metric-top">
                  <span className="metric-icon amber">⌁</span>
                  <span className={isDemoAccount ? "trend up" : "trend"}>
                    {isDemoAccount ? "+5.2%" : "No data yet"}
                  </span>
                </div>
                <strong>{isDemoAccount ? "37.5%" : "0%"}</strong>
                <p>Response rate</p>
              </article>
              <article>
                <div className="metric-top">
                  <span className="metric-icon green">✦</span>
                  <span className="trend">This month</span>
                </div>
                <strong>{isDemoAccount ? 2 : 0}</strong>
                <p>Interviews</p>
              </article>
            </section>

            <section className="grid-main">
              <article className="panel pipeline-panel">
                <div className="panel-head">
                  <div>
                    <h2>Application pipeline</h2>
                    <p>Your progress across every stage</p>
                  </div>
                  <button
                    onClick={() => {
                      setActive("Applications");
                      notify("Showing all applications");
                    }}
                  >
                    View all <span>→</span>
                  </button>
                </div>
                <div className="pipeline-stats">
                  {pipeline.map((item) => (
                    <div key={item.l}>
                      <strong>{item.n}</strong>
                      <span>
                        <i className={item.c} />
                        {item.l}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  className="pipeline-bar"
                  aria-label="Pipeline distribution"
                >
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <div className="conversion">
                  <span>Application → interview conversion</span>
                  <strong>
                    {isDemoAccount ? (
                      <>
                        20.8% <em>↑ 3.1%</em>
                      </>
                    ) : (
                      "0%"
                    )}
                  </strong>
                </div>
              </article>

              {isDemoAccount ? (
                <article className="panel focus-panel">
                  <div className="focus-top">
                    <span className="spark">✦</span>
                    <span>Today’s focus</span>
                    <small>3 tasks</small>
                  </div>
                  <h2>Small steps, big momentum.</h2>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        e.currentTarget.parentElement?.classList.toggle(
                          "done",
                          e.currentTarget.checked,
                        )
                      }
                    />
                    <span>
                      Prepare for Razorpay technical round
                      <small>Tomorrow, 11:00 AM</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        e.currentTarget.parentElement?.classList.toggle(
                          "done",
                          e.currentTarget.checked,
                        )
                      }
                    />
                    <span>
                      Complete Zepto online assessment<small>Due Aug 9</small>
                    </span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        e.currentTarget.parentElement?.classList.toggle(
                          "done",
                          e.currentTarget.checked,
                        )
                      }
                    />
                    <span>
                      Follow up with Priya at Atlassian
                      <small>Last contacted 5 days ago</small>
                    </span>
                  </label>
                </article>
              ) : (
                <article className="panel focus-panel">
                  <div className="focus-top">
                    <span className="spark">✦</span>
                    <span>Today’s focus</span>
                    <small>0 tasks</small>
                  </div>
                  <h2>Your fresh start begins here.</h2>
                  <p className="focus-empty">
                    Add an application to begin building your weekly plan.
                  </p>
                </article>
              )}
            </section>

            <section className="grid-main lower-grid">
              <article className="panel applications-panel">
                <div className="panel-head">
                  <div>
                    <h2>Recent applications</h2>
                    <p>
                      {applicationsLoading
                        ? "Loading your applications…"
                        : query
                          ? `${rows.length} matching results`
                          : "Your latest activity"}
                    </p>
                  </div>
                  <button onClick={() => setActive("Applications")}>
                    View all <span>→</span>
                  </button>
                </div>
                <div className="application-list">
                  {rows.map((item, index) => (
                    <button
                      className="application-row"
                      key={`${item.company}-${index}`}
                      onClick={() => setSelectedApplication(item)}
                    >
                      <span
                        className="company-logo"
                        style={{ background: item.color }}
                      >
                        {item.initials}
                      </span>
                      <span className="job-info">
                        <strong>{item.role}</strong>
                        <small>
                          {item.company} · {item.location}
                        </small>
                      </span>
                      <span className={`status ${item.stage.toLowerCase()}`}>
                        {item.stage}
                      </span>
                      <span className="match">
                        <strong>{item.match}%</strong>
                        <small>match</small>
                      </span>
                      <span className="date">{item.date}</span>
                      <span className="chevron">›</span>
                    </button>
                  ))}
                  {rows.length === 0 && (
                    <div className="empty">
                      {query
                        ? `No applications match “${query}”.`
                        : "No applications yet. Add your first opportunity to get started."}
                    </div>
                  )}
                </div>
              </article>

              <aside className="side-stack">
                <article className="panel deadline-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Coming up</h2>
                      <p>Deadlines & events</p>
                    </div>
                    <button
                      aria-label="Open calendar"
                      onClick={() => setUtilityPanel("calendar")}
                    >
                      ▦
                    </button>
                  </div>
                  {isDemoAccount ? (
                    <>
                      <div className="event">
                        <div className="date-box urgent">
                          <strong>08</strong>
                          <small>AUG</small>
                        </div>
                        <div>
                          <strong>Razorpay interview</strong>
                          <small>11:00 AM · Google Meet</small>
                        </div>
                        <span className="event-dot coral-bg" />
                      </div>
                      <div className="event">
                        <div className="date-box">
                          <strong>09</strong>
                          <small>AUG</small>
                        </div>
                        <div>
                          <strong>Zepto OA deadline</strong>
                          <small>11:59 PM · HackerRank</small>
                        </div>
                        <span className="event-dot purple-bg" />
                      </div>
                      <div className="event">
                        <div className="date-box">
                          <strong>12</strong>
                          <small>AUG</small>
                        </div>
                        <div>
                          <strong>Referral follow-up</strong>
                          <small>Priya · Atlassian</small>
                        </div>
                        <span className="event-dot blue-bg" />
                      </div>
                    </>
                  ) : (
                    <div className="empty">No upcoming deadlines yet.</div>
                  )}
                </article>
                {isDemoAccount && (
                  <article className="insight-card">
                    <span className="insight-icon">↗</span>
                    <div>
                      <small>CAREER INSIGHT</small>
                      <strong>Your response rate is rising.</strong>
                      <p>
                        Backend roles are getting <b>2.4×</b> more responses
                        than your other applications.
                      </p>
                      <button
                        onClick={() => notify("Analytics insight opened")}
                      >
                        See full insight →
                      </button>
                    </div>
                  </article>
                )}
              </aside>
            </section>
          </div>
        ) : (
          <WorkspaceView
            active={active}
            applications={storedApplications}
            items={workspaceItems}
            query={query}
            onAddApplication={() => setShowModal(true)}
            onSelectApplication={(application) =>
              setSelectedApplication(application as Application)
            }
            onAddItem={addWorkspaceItem}
            onDeleteItem={deleteWorkspaceItem}
          />
        )}
      </section>

      {showModal && (
        <div className="modal-backdrop" onMouseDown={() => setShowModal(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>
            <span className="modal-kicker">NEW OPPORTUNITY</span>
            <h2 id="modal-title">Add an application</h2>
            <p>Start with the essentials. You can add details later.</p>
            <form onSubmit={addApplication}>
              <label>
                Company
                <input
                  name="company"
                  placeholder="e.g. Microsoft"
                  required
                  autoFocus
                />
              </label>
              <label>
                Role
                <input
                  name="role"
                  placeholder="e.g. Software Engineer"
                  required
                />
              </label>
              <label>
                Location
                <input name="location" placeholder="e.g. Bengaluru · Hybrid" />
              </label>
              <label>
                Stage
                <select name="stage" defaultValue="Saved">
                  <option>Saved</option>
                  <option>Applied</option>
                  <option>OA</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </label>
              <label>
                Deadline
                <input name="deadline" type="date" />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add to pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showProfile && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowProfile(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowProfile(false)}
            >
              ×
            </button>
            <span className="modal-kicker">YOUR PROFILE</span>
            <h2 id="profile-title">Edit profile</h2>
            <p>Keep your CareerOS identity current.</p>
            <form onSubmit={saveProfile}>
              <label>
                Full name
                <input
                  name="fullName"
                  defaultValue={profile.fullName}
                  required
                  autoFocus
                />
              </label>
              <label>
                Professional headline
                <input
                  name="headline"
                  defaultValue={profile.headline}
                  placeholder="e.g. Backend engineer"
                />
              </label>
              <label>
                Location
                <input
                  name="location"
                  defaultValue={profile.location}
                  placeholder="e.g. Bengaluru, India"
                />
              </label>
              <label>
                Email address
                <input value={profile.email} disabled />
              </label>
              <div className="profile-session">
                <button
                  type="button"
                  className="sign-out-button"
                  onClick={signOut}
                >
                  Sign out
                </button>
                <span>Email is managed by your sign-in provider.</span>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowProfile(false)}>
                  Cancel
                </button>
                <button type="submit">Save profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {selectedApplication && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedApplication(null)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedApplication(null)}
            >
              ×
            </button>
            <span className="modal-kicker">APPLICATION DETAILS</span>
            <h2>{selectedApplication.company}</h2>
            <p>Update the opportunity as it moves through your pipeline.</p>
            <form onSubmit={updateApplication}>
              <label>
                Company
                <input
                  name="company"
                  defaultValue={selectedApplication.company}
                  required
                />
              </label>
              <label>
                Role
                <input
                  name="role"
                  defaultValue={selectedApplication.role}
                  required
                />
              </label>
              <label>
                Location
                <input
                  name="location"
                  defaultValue={selectedApplication.location}
                />
              </label>
              <label>
                Stage
                <select name="stage" defaultValue={selectedApplication.stage}>
                  {[
                    "Saved",
                    "Applied",
                    "OA",
                    "Interview",
                    "Offer",
                    "Rejected",
                  ].map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </label>
              <label>
                Match score
                <input
                  name="match_score"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedApplication.match}
                />
              </label>
              <label>
                Deadline
                <input name="deadline" type="date" />
              </label>
              <div className="modal-actions split-actions">
                <button
                  type="button"
                  className="danger-button"
                  onClick={deleteApplication}
                >
                  Delete
                </button>
                <span />
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                >
                  Cancel
                </button>
                <button type="submit">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {utilityPanel && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setUtilityPanel(null)}
        >
          <div
            className="modal utility-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setUtilityPanel(null)}
            >
              ×
            </button>
            <span className="modal-kicker">
              {utilityPanel === "coach"
                ? "CAREER COACH"
                : utilityPanel === "calendar"
                  ? "CAREER CALENDAR"
                  : "NOTIFICATIONS"}
            </span>
            <h2>
              {utilityPanel === "coach"
                ? "Your focused plan"
                : utilityPanel === "calendar"
                  ? "Upcoming dates"
                  : "What needs attention"}
            </h2>
            <p>
              {utilityPanel === "coach"
                ? "A practical plan generated from the current state of your workspace."
                : "Live reminders derived from your applications and workspace records."}
            </p>
            <div className="utility-list">
              {utilityPanel === "coach" ? (
                <>
                  <article>
                    <strong>1. Move one role forward</strong>
                    <span>
                      {storedApplications.find((item) =>
                        ["Saved", "Applied"].includes(item.stage),
                      )
                        ? `Review ${storedApplications.find((item) => ["Saved", "Applied"].includes(item.stage))?.company} and complete the next action.`
                        : "Add a target role and capture its deadline."}
                    </span>
                  </article>
                  <article>
                    <strong>2. Prepare deliberately</strong>
                    <span>
                      {storedApplications.some((item) =>
                        ["OA", "Interview"].includes(item.stage),
                      )
                        ? "Create a focused question set for your active round."
                        : "Build a reusable preparation set for your highest-priority role."}
                    </span>
                  </article>
                  <article>
                    <strong>3. Strengthen your network</strong>
                    <span>
                      Add or follow up with one recruiter, alumnus, or
                      hiring-team contact.
                    </span>
                  </article>
                </>
              ) : (
                <>
                  {[
                    ...storedApplications
                      .filter((item) => item.date !== "No date")
                      .map((item) => ({
                        id: item.id,
                        title: `${item.company} — ${item.role}`,
                        detail: `${item.stage} · ${item.date}`,
                      })),
                    ...workspaceItems
                      .filter((item) => item.due_date)
                      .map((item) => ({
                        id: item.id,
                        title: item.title,
                        detail: `${item.kind} · ${new Date(`${item.due_date}T00:00:00`).toLocaleDateString()}`,
                      })),
                  ]
                    .slice(0, 8)
                    .map((item) => (
                      <article key={item.id}>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                      </article>
                    ))}
                  {!storedApplications.some(
                    (item) => item.date !== "No date",
                  ) &&
                    !workspaceItems.some((item) => item.due_date) && (
                      <div className="empty">Nothing needs attention yet.</div>
                    )}
                </>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setUtilityPanel(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>✓</span>
          {toast}
        </div>
      )}
    </main>
  );
}
