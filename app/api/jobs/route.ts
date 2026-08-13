import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isRelevantJob, normalizedTerms, rankJob } from "@/lib/job-ranking";

export const revalidate = 900;

type LiveJob = {
  id: string;
  company: string;
  role: string;
  location: string;
  mode: string;
  type: string;
  skills: string;
  description: string;
  url: string;
  updatedAt: string;
  source: string;
  match: number;
};
type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  location?: { name?: string };
  content?: string;
};
const defaultBoards = ["postman", "mongodb", "cloudflare", "stripe"];

function textOnly(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Sign in to load jobs." },
      { status: 401 },
    );
  const url = new URL(request.url);
  const { data: profileRow } = await supabase
    .from("ai_analyses")
    .select("result")
    .eq("analysis_type", "resume_profile")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const profile = (profileRow?.result || {}) as {
    target_roles?: string[];
    skills?: string[];
  };
  const requestedRoles = (
    url.searchParams.get("roles") ||
    "software engineer,data analyst,product analyst"
  )
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const roles = Array.from(
    new Set([...requestedRoles, ...(profile.target_roles || [])]),
  );
  const locations = (
    url.searchParams.get("locations") ||
    "india,remote,bengaluru,pune,mumbai,hyderabad"
  )
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const skills = Array.from(
    new Set([
      ...(url.searchParams.get("skills") || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      ...(profile.skills || []),
    ]),
  );
  const boards = (process.env.GREENHOUSE_BOARDS || defaultBoards.join(","))
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 10);
  const responses = await Promise.allSettled(
    boards.map(async (board) => {
      const response = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board)}/jobs?content=true`,
        { next: { revalidate: 900 } },
      );
      if (!response.ok) throw new Error(`${board}: ${response.status}`);
      const payload = (await response.json()) as { jobs?: GreenhouseJob[] };
      return (payload.jobs || []).map((job): LiveJob => {
        const description = textOnly(job.content).slice(0, 1800);
        const location = job.location?.name || "Location not listed";
        const mode = /remote/i.test(`${location} ${description}`)
          ? "Remote"
          : /hybrid/i.test(description)
            ? "Hybrid"
            : "On-site";
        const live = {
          id: `greenhouse:${board}:${job.id}`,
          company: board.replace(/(^|[-_])\w/g, (m) =>
            m.replace(/[-_]/, " ").toUpperCase(),
          ),
          role: job.title,
          location,
          mode,
          type: "Direct employer",
          skills: Array.from(new Set(normalizedTerms(description)))
            .slice(0, 8)
            .join(", "),
          description,
          url: job.absolute_url,
          updatedAt: job.updated_at,
          source: "Greenhouse",
          match: 0,
        };
        live.match = rankJob(live, roles, locations, skills);
        return live;
      });
    }),
  );
  const all = responses.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const relevant = all
    .filter((job) => isRelevantJob(job, roles, locations))
    .sort(
      (a, b) =>
        b.match - a.match || Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    )
    .slice(0, 60);
  return NextResponse.json({
    jobs: relevant,
    fetchedAt: new Date().toISOString(),
    sources: boards,
    personalized: Boolean(profileRow),
    partial: responses.some((x) => x.status === "rejected"),
  });
}
