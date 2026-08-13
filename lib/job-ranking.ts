export type RankableJob = {
  role: string;
  location: string;
  skills: string;
  description: string;
};
export function normalizedTerms(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((term) => term.length > 2);
}
export function rankJob(
  job: RankableJob,
  roles: string[],
  locations: string[],
  skills: string[],
) {
  const haystack =
    `${job.role} ${job.location} ${job.skills} ${job.description}`.toLowerCase();
  const roleHits = roles.filter((role) =>
    haystack.includes(role.toLowerCase()),
  ).length;
  const locationHits = locations.filter((location) =>
    haystack.includes(location.toLowerCase()),
  ).length;
  const skillHits = skills.filter((skill) =>
    haystack.includes(skill.toLowerCase()),
  ).length;
  return Math.min(
    98,
    35 +
      Math.min(35, roleHits * 18) +
      Math.min(10, locationHits * 10) +
      Math.min(18, skillHits * 3),
  );
}
export function isRelevantJob(
  job: RankableJob,
  roles: string[],
  locations: string[],
) {
  const haystack =
    `${job.role} ${job.location} ${job.description}`.toLowerCase();
  const roleMatch = roles.some(
    (role) =>
      haystack.includes(role.toLowerCase()) ||
      normalizedTerms(role).some((term) => haystack.includes(term)),
  );
  const locationMatch = locations.some((location) =>
    haystack.includes(location.toLowerCase()),
  );
  return (
    (roleMatch && locationMatch) || (roleMatch && haystack.includes("remote"))
  );
}
