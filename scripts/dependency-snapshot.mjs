import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const lockfiles = [
  "package-lock.json",
  "frontend/package-lock.json",
  "backend/package-lock.json",
];

export function manifestFromLockfile(lock, source) {
  if (![2, 3].includes(lock.lockfileVersion) || !lock.packages?.[""]) {
    throw new Error(`Unsupported or incomplete npm lockfile: ${source}`);
  }
  const root = lock.packages[""];
  const direct = new Set([
    ...Object.keys(root.dependencies ?? {}),
    ...Object.keys(root.devDependencies ?? {}),
    ...Object.keys(root.optionalDependencies ?? {}),
  ]);
  const resolved = Object.create(null);
  for (const [location, pkg] of Object.entries(lock.packages)) {
    if (!location || pkg.link || !pkg.version) continue;
    const installedName = location.split("node_modules/").at(-1);
    if (!installedName || installedName === location) {
      throw new Error(`Unexpected package location in ${source}: ${location}`);
    }
    const name = pkg.name ?? installedName;
    const encodedName = name.split("/").map(encodeURIComponent).join("/");
    const purl = `pkg:npm/${encodedName}@${encodeURIComponent(pkg.version)}`;
    const previous = resolved[purl];
    const isDirect =
      direct.has(installedName) && location === `node_modules/${installedName}`;
    resolved[purl] = {
      package_url: purl,
      relationship:
        isDirect || previous?.relationship === "direct" ? "direct" : "indirect",
      scope:
        !pkg.dev || previous?.scope === "runtime" ? "runtime" : "development",
    };
  }
  if (!Object.keys(resolved).length)
    throw new Error(`No resolved dependencies in ${source}`);
  return { name: source, file: { source_location: source }, resolved };
}

export async function buildDependencySnapshot({
  sha,
  runId,
  repository,
  scanned,
  root = repositoryRoot,
}) {
  if (!/^[a-f0-9]{40}$/.test(sha ?? ""))
    throw new Error("An exact verified commit SHA is required.");
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository ?? ""))
    throw new Error("A GitHub repository is required.");
  if (!/^\d+$/.test(runId ?? ""))
    throw new Error("A GitHub Actions run ID is required.");
  const manifests = Object.create(null);
  for (const source of lockfiles) {
    const lock = JSON.parse(await readFile(resolve(root, source), "utf8"));
    manifests[source] = manifestFromLockfile(lock, source);
  }
  return {
    version: 0,
    sha,
    ref: "refs/heads/main",
    job: {
      id: runId,
      correlator: "serhatsoruklu-npm-lockfiles",
      html_url: `https://github.com/${repository}/actions/runs/${runId}`,
    },
    detector: {
      name: "serhatsoruklu-npm-lockfiles",
      version: "1.0.0",
      url: `https://github.com/${repository}/blob/main/scripts/dependency-snapshot.mjs`,
    },
    scanned: scanned ?? new Date().toISOString(),
    manifests,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  if (!process.argv[2]) throw new Error("Provide an output JSON path.");
  const snapshot = await buildDependencySnapshot({
    sha: process.env.SNAPSHOT_SHA,
    repository: process.env.GITHUB_REPOSITORY,
    runId: process.env.GITHUB_RUN_ID,
  });
  await writeFile(process.argv[2], JSON.stringify(snapshot, null, 2) + "\n");
  console.log(
    "Created dependency inventory for all three lockfiles, including development dependencies.",
  );
}
