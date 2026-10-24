import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDependencySnapshot,
  manifestFromLockfile,
} from "./dependency-snapshot.mjs";

test("inventory preserves scoped names, distinct installed versions and development scope", () => {
  const result = manifestFromLockfile(
    {
      lockfileVersion: 3,
      packages: {
        "": {
          dependencies: { "@scope/runtime": "^1.0.0" },
          devDependencies: { tool: "^2.0.0" },
        },
        "node_modules/@scope/runtime": { version: "1.0.0" },
        "node_modules/tool": { version: "2.0.0", dev: true },
        "node_modules/tool/node_modules/shared": {
          version: "1.0.0",
          dev: true,
        },
        "node_modules/shared": { version: "2.0.0" },
      },
    },
    "frontend/package-lock.json",
  );
  assert.equal(result.file.source_location, "frontend/package-lock.json");
  assert.deepEqual(result.resolved["pkg:npm/%40scope/runtime@1.0.0"], {
    package_url: "pkg:npm/%40scope/runtime@1.0.0",
    relationship: "direct",
    scope: "runtime",
  });
  assert.equal(result.resolved["pkg:npm/tool@2.0.0"].scope, "development");
  assert.equal(
    result.resolved["pkg:npm/shared@1.0.0"].relationship,
    "indirect",
  );
  assert.equal(result.resolved["pkg:npm/shared@2.0.0"].scope, "runtime");
});

test("a dependency shared by development and runtime is conservatively classified as runtime", () => {
  const result = manifestFromLockfile(
    {
      lockfileVersion: 3,
      packages: {
        "": { dependencies: { shared: "^1.0.0" } },
        "node_modules/tool/node_modules/shared": {
          version: "1.0.0",
          dev: true,
        },
        "node_modules/shared": { version: "1.0.0" },
      },
    },
    "package-lock.json",
  );
  assert.equal(Object.keys(result.resolved).length, 1);
  assert.equal(result.resolved["pkg:npm/shared@1.0.0"].scope, "runtime");
  assert.equal(result.resolved["pkg:npm/shared@1.0.0"].relationship, "direct");
});

test("incomplete inventories and invalid commit context fail instead of submitting a false clean result", async () => {
  assert.throws(() =>
    manifestFromLockfile({ lockfileVersion: 1 }, "package-lock.json"),
  );
  assert.throws(() =>
    manifestFromLockfile(
      { lockfileVersion: 3, packages: { "": {} } },
      "package-lock.json",
    ),
  );
  await assert.rejects(
    buildDependencySnapshot({
      sha: "main",
      repository: "owner/repo",
      runId: "1",
    }),
  );
});

test("the real snapshot includes every lockfile and both runtime and development dependencies", async () => {
  const snapshot = await buildDependencySnapshot({
    sha: "a".repeat(40),
    repository: "SerhatSoruklu/serhat-soruklu-web",
    runId: "123",
    scanned: "2026-10-24T00:00:00.000Z",
  });
  assert.equal(snapshot.ref, "refs/heads/main");
  assert.deepEqual(Object.keys(snapshot.manifests), [
    "package-lock.json",
    "frontend/package-lock.json",
    "backend/package-lock.json",
  ]);
  assert.ok(
    Object.values(
      snapshot.manifests["frontend/package-lock.json"].resolved,
    ).some((pkg) => pkg.scope === "development"),
  );
  assert.ok(
    Object.values(
      snapshot.manifests["backend/package-lock.json"].resolved,
    ).some((pkg) => pkg.scope === "runtime"),
  );
});
