#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Runs one of Ranger's vela:* scripts against this working tree.
//
// Vela's build and test scripts run from the root of a Ranger checkout: they
// use its compiler (dist/rgrc.js), and the chart's EVG bridge and the
// PDF/PNG tools import gallery/game_engine and gallery/pdf_writer. So the
// package (vela/) is copied to the checkout's gallery/vela -- what Ranger's
// `npm run deps -- --from=<this repo>` does -- and the script runs there.
//
//   node scripts/ranger.mjs vela:test              # npm test
//   node scripts/ranger.mjs vela:web -- --out D
//
// The checkout is RANGER_ROOT, else ../Ranger or ../ranger, with
// `npm ci` already run in it. `npm run deps` there puts the pinned commit
// back in gallery/vela.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function findRanger() {
  const candidates = process.env.RANGER_ROOT
    ? [path.resolve(process.env.RANGER_ROOT)]
    : [path.resolve(ROOT, "../Ranger"), path.resolve(ROOT, "../ranger")];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "dist/rgrc.js")) && fs.existsSync(path.join(dir, "scripts/deps.mjs"))) return dir;
  }
  console.error(`no Ranger checkout at ${candidates.join(" or ")}; set RANGER_ROOT`);
  process.exit(1);
}

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}

const [script, ...rest] = process.argv.slice(2);
if (!script) {
  console.error("usage: node scripts/ranger.mjs <vela:script> [-- args]");
  process.exit(1);
}
const ranger = findRanger();

// A Ranger whose ranger.lock does not name vela still has gallery/vela in
// its own tree; that copy is replaced in place.
const lock = JSON.parse(fs.readFileSync(path.join(ranger, "ranger.lock"), "utf8"));
if (lock.packages && lock.packages.vela) {
  run(process.execPath, ["scripts/deps.mjs", `--from=${ROOT}`], ranger);
} else {
  const dst = path.join(ranger, "gallery/vela");
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(path.join(ROOT, "vela"), dst, { recursive: true, filter: (s) => !/[\\/](bin|dist|node_modules)$/.test(s) });
  console.log(`vela  working tree -> ${dst} (this Ranger does not take vela from ranger.lock)`);
}

const args = rest[0] === "--" ? rest.slice(1) : rest;
run("npm", ["run", script, ...(args.length ? ["--", ...args] : [])], ranger);
