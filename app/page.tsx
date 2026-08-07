"use client";

import { useMemo, useState } from "react";
import "./dashboard.css";

const applications = [
  { company: "Razorpay", initials: "RZ", color: "#5b5bd6", role: "Backend Engineer", location: "Bengaluru · Hybrid", stage: "Technical", date: "Aug 12", match: 94 },
  { company: "Atlassian", initials: "AT", color: "#1769e0", role: "Graduate Software Engineer", location: "Bengaluru · Remote", stage: "Applied", date: "Aug 6", match: 91 },
  { company: "Zepto", initials: "ZP", color: "#7f38c7", role: "Data Engineer", location: "Mumbai · On-site", stage: "OA", date: "Aug 9", match: 88 },
  { company: "CRED", initials: "CR", color: "#151515", role: "Software Engineer I", location: "Bengaluru · Hybrid", stage: "Saved", date: "Aug 15", match: 84 },
];

const nav = ["Overview", "Applications", "Jobs", "Companies", "Interviews", "Network"];

export default function Home() {
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [added, setAdded] = useState<typeof applications>([]);

  const rows = useMemo(() => [...added, ...applications].filter((item) =>
    `${item.company} ${item.role} ${item.location}`.toLowerCase().includes(query.toLowerCase())
  ), [added, query]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function addApplication(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const company = String(data.get("company") || "New company");
    setAdded((current) => [{ company, initials: company.slice(0, 2).toUpperCase(), color: "#ef6a3a", role: String(data.get("role") || "New role"), location: "Pune · Hybrid", stage: "Saved", date: "Today", match: 82 }, ...current]);
    setShowModal(false);
    notify("Application added to your pipeline");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="CareerOS home">
          <span className="brand-mark">C</span><span>Career<span>OS</span></span>
        </a>
        <nav className="main-nav" aria-label="Primary navigation">
          <p className="nav-label">Workspace</p>
          {nav.map((item, index) => (
            <button key={item} className={active === item ? "active" : ""} onClick={() => { setActive(item); notify(`${item} view selected`); }}>
              <span className="nav-icon" aria-hidden="true">{["⌂", "▣", "⌕", "◇", "◉", "♧"][index]}</span>{item}
              {item === "Applications" && <span className="count">24</span>}
            </button>
          ))}
          <p className="nav-label tools-label">Your tools</p>
          {["Resume Lab", "Interview Prep", "Documents", "Analytics"].map((item, index) => (
            <button key={item} onClick={() => notify(`${item} is ready for your next step`)}>
              <span className="nav-icon" aria-hidden="true">{["▤", "✦", "□", "↗"][index]}</span>{item}
            </button>
          ))}
        </nav>
        <div className="coach-card">
          <div className="coach-orb">✦</div>
          <strong>Career Coach</strong>
          <p>Get a focused plan for your week.</p>
          <button onClick={() => notify("Your weekly plan is being prepared")}>Plan my week <span>→</span></button>
        </div>
        <button className="profile" onClick={() => notify("Profile menu opened")}>
          <span className="avatar">KM</span><span><strong>Kashish Mehta</strong><small>Student plan</small></span><span className="dots">•••</span>
        </button>
      </aside>

      <section className="content" id="top">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">C</span> CareerOS</div>
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs, companies, people…" /><kbd>⌘ K</kbd></label>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notifications" onClick={() => notify("You’re all caught up")}>♢<span className="notification-dot" /></button>
            <button className="add-button" onClick={() => setShowModal(true)}><span>＋</span> Add application</button>
          </div>
        </header>

        <div className="page-wrap">
          <section className="welcome">
            <div><p className="eyebrow">FRIDAY, AUGUST 7</p><h1>Good morning, Kashish.</h1><p>Here’s where your job search stands today.</p></div>
            <div className="week-chip"><span>↗</span><div><strong>Strong week</strong><small>12% more activity</small></div></div>
          </section>

          <section className="metrics" aria-label="Job search metrics">
            <article><div className="metric-top"><span className="metric-icon coral">↗</span><span className="trend up">+4 this week</span></div><strong>24</strong><p>Applications sent</p></article>
            <article><div className="metric-top"><span className="metric-icon blue">◷</span><span className="trend">3 active</span></div><strong>6</strong><p>In progress</p></article>
            <article><div className="metric-top"><span className="metric-icon amber">⌁</span><span className="trend up">+5.2%</span></div><strong>37.5%</strong><p>Response rate</p></article>
            <article><div className="metric-top"><span className="metric-icon green">✦</span><span className="trend">This month</span></div><strong>2</strong><p>Interviews</p></article>
          </section>

          <section className="grid-main">
            <article className="panel pipeline-panel">
              <div className="panel-head"><div><h2>Application pipeline</h2><p>Your progress across every stage</p></div><button onClick={() => { setActive("Applications"); notify("Showing all applications"); }}>View all <span>→</span></button></div>
              <div className="pipeline-stats">
                {[{n:9,l:"Saved",c:"gray"},{n:8,l:"Applied",c:"blue"},{n:3,l:"OA",c:"purple"},{n:2,l:"Interview",c:"orange"},{n:1,l:"Offer",c:"green"}].map((item) => <div key={item.l}><strong>{item.n}</strong><span><i className={item.c} />{item.l}</span></div>)}
              </div>
              <div className="pipeline-bar" aria-label="Pipeline distribution"><i /><i /><i /><i /><i /></div>
              <div className="conversion"><span>Application → interview conversion</span><strong>20.8% <em>↑ 3.1%</em></strong></div>
            </article>

            <article className="panel focus-panel">
              <div className="focus-top"><span className="spark">✦</span><span>Today’s focus</span><small>3 tasks</small></div>
              <h2>Small steps, big momentum.</h2>
              <label><input type="checkbox" onChange={(e) => e.currentTarget.parentElement?.classList.toggle("done", e.currentTarget.checked)} /><span>Prepare for Razorpay technical round<small>Tomorrow, 11:00 AM</small></span></label>
              <label><input type="checkbox" onChange={(e) => e.currentTarget.parentElement?.classList.toggle("done", e.currentTarget.checked)} /><span>Complete Zepto online assessment<small>Due Aug 9</small></span></label>
              <label><input type="checkbox" onChange={(e) => e.currentTarget.parentElement?.classList.toggle("done", e.currentTarget.checked)} /><span>Follow up with Priya at Atlassian<small>Last contacted 5 days ago</small></span></label>
            </article>
          </section>

          <section className="grid-main lower-grid">
            <article className="panel applications-panel">
              <div className="panel-head"><div><h2>Recent applications</h2><p>{query ? `${rows.length} matching results` : "Your latest activity"}</p></div><button onClick={() => setActive("Applications")}>View all <span>→</span></button></div>
              <div className="application-list">
                {rows.map((item, index) => <button className="application-row" key={`${item.company}-${index}`} onClick={() => notify(`${item.company} application opened`)}>
                  <span className="company-logo" style={{background:item.color}}>{item.initials}</span>
                  <span className="job-info"><strong>{item.role}</strong><small>{item.company} · {item.location}</small></span>
                  <span className={`status ${item.stage.toLowerCase()}`}>{item.stage}</span>
                  <span className="match"><strong>{item.match}%</strong><small>match</small></span>
                  <span className="date">{item.date}</span><span className="chevron">›</span>
                </button>)}
                {rows.length === 0 && <div className="empty">No applications match “{query}”.</div>}
              </div>
            </article>

            <aside className="side-stack">
              <article className="panel deadline-panel">
                <div className="panel-head"><div><h2>Coming up</h2><p>Deadlines & events</p></div><button aria-label="Open calendar" onClick={() => notify("Calendar opened")}>▦</button></div>
                <div className="event"><div className="date-box urgent"><strong>08</strong><small>AUG</small></div><div><strong>Razorpay interview</strong><small>11:00 AM · Google Meet</small></div><span className="event-dot coral-bg" /></div>
                <div className="event"><div className="date-box"><strong>09</strong><small>AUG</small></div><div><strong>Zepto OA deadline</strong><small>11:59 PM · HackerRank</small></div><span className="event-dot purple-bg" /></div>
                <div className="event"><div className="date-box"><strong>12</strong><small>AUG</small></div><div><strong>Referral follow-up</strong><small>Priya · Atlassian</small></div><span className="event-dot blue-bg" /></div>
              </article>
              <article className="insight-card">
                <span className="insight-icon">↗</span><div><small>CAREER INSIGHT</small><strong>Your response rate is rising.</strong><p>Backend roles are getting <b>2.4×</b> more responses than your other applications.</p><button onClick={() => notify("Analytics insight opened")}>See full insight →</button></div>
              </article>
            </aside>
          </section>
        </div>
      </section>

      {showModal && <div className="modal-backdrop" onMouseDown={() => setShowModal(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowModal(false)}>×</button><span className="modal-kicker">NEW OPPORTUNITY</span><h2 id="modal-title">Add an application</h2><p>Start with the essentials. You can add details later.</p><form onSubmit={addApplication}><label>Company<input name="company" placeholder="e.g. Microsoft" required autoFocus /></label><label>Role<input name="role" placeholder="e.g. Software Engineer" required /></label><div className="modal-actions"><button type="button" onClick={() => setShowModal(false)}>Cancel</button><button type="submit">Add to pipeline</button></div></form></div></div>}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </main>
  );
}
