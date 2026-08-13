"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceItem } from "./workspaces";

type MatchResult = {
  candidate_profile: { headline: string; seniority: string; skills: string[] };
  job: { company: string; role: string; summary: string };
  score: number;
  verdict: string;
  score_breakdown: Array<{
    category: string;
    score: number;
    maximum: number;
    reason: string;
  }>;
  mandatory_requirements: Array<{
    requirement: string;
    status: string;
    evidence: string;
  }>;
  strengths: string[];
  gaps: string[];
  recruiter_objections: string[];
  resume_changes: Array<{
    section: string;
    priority: string;
    change: string;
    reason: string;
  }>;
  interview_preparation: string[];
  application_recommendation: string;
  integrity_note: string;
};
type Analysis = {
  id: string;
  title: string;
  result: MatchResult;
  created_at: string;
};

export function AIHub({
  items,
  notify,
}: {
  items: WorkspaceItem[];
  notify: (message: string) => void;
}) {
  const resumes = items.filter(
    (item) => item.kind === "resume" && typeof item.data.file_path === "string",
  );
  const [resumeId, setResumeId] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [selected, setSelected] = useState<Analysis | null>(null);
  useEffect(() => {
    createClient()
      .from("ai_analyses")
      .select("id, title, result, created_at")
      .eq("analysis_type", "jd_match")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setHistory(data as Analysis[]);
          setSelected((data[0] as Analysis) || null);
        }
      });
  }, []);
  async function analyze(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeItemId: resumeId, jobDescription: jd }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) return notify(payload.error || "Analysis failed");
    const analysis = payload.analysis as Analysis;
    setHistory((current) => [analysis, ...current]);
    setSelected(analysis);
    notify("Recruiter analysis completed");
  }
  const result = selected?.result;
  return (
    <div className="workspace-page ai-page">
      <header className="workspace-header">
        <div>
          <p>CAREEROS INTELLIGENCE</p>
          <h1>AI Match Lab</h1>
          <span>
            Compare an actual resume against a job description with
            evidence-grounded recruiter scoring.
          </span>
        </div>
      </header>
      <div className="ai-layout">
        <section className="workspace-card ai-input">
          <h2>New analysis</h2>
          <p>
            Select the resume you would genuinely submit, then paste the
            complete job description.
          </p>
          {resumes.length ? (
            <form onSubmit={analyze}>
              <label>
                Resume version
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  required
                >
                  <option value="">Select a resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} — {String(resume.data.file_name || "file")}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Job description
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  minLength={120}
                  required
                  placeholder="Paste the full job description, including responsibilities, required skills and eligibility…"
                />
              </label>
              <small>
                CareerOS never invents experience. Suggestions must remain
                supported by your resume.
              </small>
              <button className="ai-submit" disabled={loading}>
                {loading ? "Thinking like a recruiter…" : "Analyze my fit"}
              </button>
            </form>
          ) : (
            <div className="ai-empty">
              <strong>Upload a resume first</strong>
              <p>
                Use Resume Lab to upload the PDF or Word file you want CareerOS
                to analyze.
              </p>
            </div>
          )}
          <div className="analysis-history">
            <h3>History</h3>
            {history.map((analysis) => (
              <button
                className={selected?.id === analysis.id ? "selected" : ""}
                key={analysis.id}
                onClick={() => setSelected(analysis)}
              >
                <span>{analysis.title}</span>
                <small>
                  {new Date(analysis.created_at).toLocaleDateString()}
                </small>
              </button>
            ))}
            {!history.length && <p>No completed analyses yet.</p>}
          </div>
        </section>
        <section className="ai-report">
          {result ? (
            <>
              <article className="ai-hero">
                <div
                  className={`score-ring ${result.verdict}`}
                  style={{
                    background: `conic-gradient(#ed7049 ${result.score}%, #ffffff18 0)`,
                  }}
                >
                  <strong>{result.score}</strong>
                  <span>/100</span>
                </div>
                <div>
                  <small>{result.verdict.replaceAll("_", " ")}</small>
                  <h2>{result.job.role}</h2>
                  <p>
                    {result.job.company} · {result.job.summary}
                  </p>
                </div>
              </article>
              <article className="workspace-card">
                <h2>Transparent score</h2>
                {result.score_breakdown.map((row) => (
                  <div className="score-row" key={row.category}>
                    <div>
                      <strong>{row.category}</strong>
                      <span>{row.reason}</span>
                    </div>
                    <b>
                      {row.score}/{row.maximum}
                    </b>
                  </div>
                ))}
              </article>
              <div className="ai-two">
                <ListCard
                  title="Evidence-backed strengths"
                  items={result.strengths}
                  tone="positive"
                />
                <ListCard
                  title="Gaps and weak evidence"
                  items={result.gaps}
                  tone="warning"
                />
              </div>
              <article className="workspace-card">
                <h2>Mandatory requirements</h2>
                {result.mandatory_requirements.map((row) => (
                  <div className="requirement" key={row.requirement}>
                    <i className={row.status}>{row.status}</i>
                    <div>
                      <strong>{row.requirement}</strong>
                      <span>{row.evidence}</span>
                    </div>
                  </div>
                ))}
              </article>
              <article className="workspace-card">
                <h2>Resume changes before applying</h2>
                {result.resume_changes.map((change, index) => (
                  <div
                    className="resume-change"
                    key={`${change.section}-${index}`}
                  >
                    <i>{change.priority}</i>
                    <div>
                      <strong>{change.section}</strong>
                      <p>{change.change}</p>
                      <small>{change.reason}</small>
                    </div>
                  </div>
                ))}
              </article>
              <div className="ai-two">
                <ListCard
                  title="Likely recruiter objections"
                  items={result.recruiter_objections}
                  tone="warning"
                />
                <ListCard
                  title="Prepare for interview"
                  items={result.interview_preparation}
                  tone="neutral"
                />
              </div>
              <article className="recommendation">
                <small>APPLICATION RECOMMENDATION</small>
                <p>{result.application_recommendation}</p>
                <span>{result.integrity_note}</span>
              </article>
            </>
          ) : (
            <div className="workspace-empty ai-placeholder">
              <div>AI</div>
              <h2>Your recruiter report will appear here</h2>
              <p>
                The report includes an auditable score, requirements evidence,
                gaps, objections and resume changes.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: string;
}) {
  return (
    <article className={`workspace-card list-card ${tone}`}>
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
