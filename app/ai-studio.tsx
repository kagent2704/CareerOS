"use client";
import { useState } from "react";
import type { WorkspaceItem } from "./workspaces";
type AssetResult = {
  tool: string;
  title: string;
  summary: string;
  sections: Array<{ heading: string; content: string }>;
  checklist: string[];
  integrity_note: string;
};
type Asset = {
  id: string;
  title: string;
  result: AssetResult;
  created_at: string;
};
const toolCopy = {
  cover_letter: {
    label: "Cover letter",
    prompt:
      "Paste the complete job description and any company or motivation context.",
  },
  recruiter_message: {
    label: "Recruiter message",
    prompt:
      "Paste the role, company, recruiter context, and what you want to ask for.",
  },
  interview_plan: {
    label: "Interview plan",
    prompt:
      "Paste the job description, round format, and any known interview details.",
  },
} as const;
export function AIStudio({
  items,
  notify,
  onAddItem,
}: {
  items: WorkspaceItem[];
  notify: (message: string) => void;
  onAddItem: (item: Omit<WorkspaceItem, "id">) => Promise<boolean>;
}) {
  const resumes = items.filter(
    (item) => item.kind === "resume" && item.data.file_path,
  );
  const [tool, setTool] = useState<keyof typeof toolCopy>("cover_letter");
  const [resumeItemId, setResumeItemId] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const stored = items
    .filter((item) => item.data.source === "ai_studio" && item.data.result)
    .map((item) => ({
      id: item.id,
      title: item.title,
      result: item.data.result as AssetResult,
      created_at: String(item.data.created_at || ""),
    }));
  const [history, setHistory] = useState<Asset[]>(stored);
  const [selected, setSelected] = useState<Asset | null>(stored[0] || null);
  async function generate(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tool,
        resumeItemId: resumeItemId || undefined,
        context,
      }),
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) return notify(payload.error || "Generation failed");
    const asset = payload.asset as Asset;
    const saved = await onAddItem({
      kind: tool === "interview_plan" ? "preparation" : "document",
      title: asset.title,
      subtitle: toolCopy[tool].label,
      status: "Draft",
      due_date: null,
      data: {
        source: "ai_studio",
        tool,
        result: asset.result,
        context,
        resume_item_id: resumeItemId || null,
        created_at: asset.created_at,
      },
    });
    if (!saved) return;
    setHistory((current) => [asset, ...current]);
    setSelected(asset);
    notify(`${toolCopy[tool].label} generated and saved`);
  }
  async function copyAsset() {
    if (!selected) return;
    const text = selected.result.sections
      .map((section) => `${section.heading}\n${section.content}`)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    notify("Copied to clipboard");
  }
  return (
    <div className="workspace-page ai-page">
      <header className="workspace-header">
        <div>
          <p>APPLICATION ASSET STUDIO</p>
          <h1>AI Studio</h1>
          <span>
            Turn real resume evidence and role context into truthful, reusable
            career assets.
          </span>
        </div>
      </header>
      <div className="ai-layout">
        <section className="workspace-card ai-input">
          <h2>Create an asset</h2>
          <form onSubmit={generate}>
            <label>
              Tool
              <select
                value={tool}
                onChange={(event) =>
                  setTool(event.target.value as keyof typeof toolCopy)
                }
              >
                {Object.entries(toolCopy).map(([value, copy]) => (
                  <option value={value} key={value}>
                    {copy.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Resume evidence
              <select
                value={resumeItemId}
                onChange={(event) => setResumeItemId(event.target.value)}
              >
                <option value="">No resume attached</option>
                {resumes.map((resume) => (
                  <option value={resume.id} key={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Context
              <textarea
                minLength={80}
                required
                value={context}
                onChange={(event) => setContext(event.target.value)}
                placeholder={toolCopy[tool].prompt}
              />
            </label>
            <small>
              CareerOS will leave verification notes instead of inventing
              missing evidence.
            </small>
            <button className="ai-submit" disabled={loading}>
              {loading
                ? "Creating…"
                : `Generate ${toolCopy[tool].label.toLowerCase()}`}
            </button>
          </form>
          <div className="analysis-history">
            <h3>Saved assets</h3>
            {history.map((asset) => (
              <button
                key={asset.id}
                className={selected?.id === asset.id ? "selected" : ""}
                onClick={() => setSelected(asset)}
              >
                <span>{asset.title}</span>
                <small>{new Date(asset.created_at).toLocaleDateString()}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="ai-report">
          {selected ? (
            <>
              <article className="workspace-card asset-hero">
                <small>{selected.result.tool.replaceAll("_", " ")}</small>
                <h2>{selected.result.title}</h2>
                <p>{selected.result.summary}</p>
                <button onClick={copyAsset}>Copy asset</button>
              </article>
              {selected.result.sections.map((section) => (
                <article
                  className="workspace-card asset-section"
                  key={section.heading}
                >
                  <h2>{section.heading}</h2>
                  <div>{section.content}</div>
                </article>
              ))}
              <article className="workspace-card list-card neutral">
                <h2>Before using</h2>
                <ul>
                  {selected.result.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{selected.result.integrity_note}</p>
              </article>
            </>
          ) : (
            <div className="workspace-empty ai-placeholder">
              <div>AI</div>
              <h2>Your generated asset appears here</h2>
              <p>
                Select a tool and provide enough context for specific, grounded
                output.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
