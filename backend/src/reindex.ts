// backend/src/reindex.ts
// Re-ingests all bugs from bugs.json into Cognee
// Use when Cognee graph is empty but bugs.json has data
// Run with: bun run reindex

import { readFileSync, existsSync } from "fs";

const BASE_URL = process.env.COGNEE_BASE_URL ?? "http://localhost:8000";
const STORE_PATH = "./data/bugs.json";
const DELAY_MS = 90_000;

async function reindex() {
  if (!existsSync(STORE_PATH)) {
    console.error("❌ bugs.json not found — nothing to reindex");
    process.exit(1);
  }

  const store = JSON.parse(readFileSync(STORE_PATH, "utf-8"));
  const bugs = Object.values(store) as any[];

  console.log(`🔄 Re-indexing ${bugs.length} bugs into Cognee...`);
  console.log(`⏱  ~${Math.ceil((bugs.length * DELAY_MS) / 60000)} minutes total\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < bugs.length; i++) {
    const bug = bugs[i];
    const num = `[${i + 1}/${bugs.length}]`;

    process.stdout.write(
      `${num} ${bug.language}/${bug.projectId} — ${bug.id.slice(0, 8)}... `
    );

    try {
      // Format bug as document
      const document = `
BUG REPORT [ID: ${bug.id}]
Project: ${bug.projectId}
Language: ${bug.language}${bug.framework ? ` / ${bug.framework}` : ""}
Tags: ${(bug.tags ?? []).join(", ")}

ERROR:
${bug.normalizedError ?? bug.rawError}

ROOT CAUSE AND FIX:
${bug.fix}

Logged: ${bug.createdAt}
      `.trim();

      const datasetName = `debugmind_${bug.projectId}`;

      // Step 1: add
      const formData = new FormData();
      const fileBlob = new Blob([document], { type: "text/plain" });
      formData.append("data", fileBlob, `bug_${bug.id}.txt`);
      formData.append("datasetName", datasetName);

      const addRes = await fetch(`${BASE_URL}/api/v1/add`, {
        method: "POST",
        body: formData,
      });

      const addBody = await addRes.json().catch(() => ({}));

      if (!addRes.ok) {
        throw new Error(`add failed: ${JSON.stringify(addBody)}`);
      }

      // Step 2: cognify
      const cognifyRes = await fetch(`${BASE_URL}/api/v1/cognify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasets: [datasetName] }),
      });

      const cognifyBody = await cognifyRes.json().catch(() => ({}));

      if (!cognifyRes.ok) {
        throw new Error(`cognify failed: ${JSON.stringify(cognifyBody)}`);
      }

      console.log(`✅`);
      success++;

    } catch (err: any) {
      console.log(`❌ ${err.message}`);
      failed++;
    }

    // Wait between bugs to respect Gemini free tier RPM limits
    if (i < bugs.length - 1) {
      const remaining = bugs.length - i - 1;
      const mins = Math.ceil((remaining * DELAY_MS) / 60000);
      process.stdout.write(
        `    ⏳ Waiting ${DELAY_MS / 1000}s... (${remaining} left, ~${mins}m remaining)\r`
      );
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Success: ${success}/${bugs.length}`);
  if (failed > 0) {
    console.log(`❌ Failed:  ${failed}/${bugs.length} — re-run to retry`);
  }
}

reindex().catch(console.error);