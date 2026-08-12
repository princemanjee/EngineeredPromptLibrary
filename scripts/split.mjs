#!/usr/bin/env node
/**
 * Regenerate the child prompt-library plugins from the monolith.
 *
 * The monolith at prompt-library-plugin/skills is the single source of truth.
 * Child plugins under plugins/ are DERIVED and are wiped and rebuilt on every run,
 * so never hand-edit a skill inside plugins/. Edit the monolith, then re-run this.
 *
 * Usage:
 *   node scripts/split.mjs           build
 *   node scripts/split.mjs --check   validate the mapping only, write nothing
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MONOLITH = path.join(ROOT, 'prompt-library-plugin');
const MONOLITH_SKILLS = path.join(MONOLITH, 'skills');
const OUT = path.join(ROOT, 'plugins');
const GROUPS_FILE = path.join(ROOT, 'groups.json');
const MARKETPLACE = path.join(ROOT, '.claude-plugin', 'marketplace.json');

const checkOnly = process.argv.includes('--check');

const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const listDirs = d =>
  fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();

const cfg = read(GROUPS_FILE);
const groups = cfg.groups;
const monolithSkills = listDirs(MONOLITH_SKILLS);
const monolithSet = new Set(monolithSkills);

/* ---------- validate ---------- */

const seen = new Map(); // skill -> [groups]
for (const [g, meta] of Object.entries(groups)) {
  for (const s of meta.skills) {
    if (!seen.has(s)) seen.set(s, []);
    seen.get(s).push(g);
  }
}

const unassigned = monolithSkills.filter(s => !seen.has(s));
const duplicated = [...seen.entries()].filter(([, gs]) => gs.length > 1);
const phantom = [...seen.keys()].filter(s => !monolithSet.has(s));

let fatal = false;
if (unassigned.length) {
  fatal = true;
  console.error(`\nFAIL: ${unassigned.length} skill(s) in the monolith are not assigned to any group:`);
  for (const s of unassigned) console.error(`  - ${s}`);
  console.error('  Add each to a group in groups.json.');
}
if (duplicated.length) {
  fatal = true;
  console.error(`\nFAIL: ${duplicated.length} skill(s) assigned to more than one group:`);
  for (const [s, gs] of duplicated) console.error(`  - ${s} -> ${gs.join(', ')}`);
}
if (phantom.length) {
  fatal = true;
  console.error(`\nFAIL: ${phantom.length} skill(s) in groups.json do not exist in the monolith:`);
  for (const s of phantom) console.error(`  - ${s}`);
}
if (fatal) process.exit(1);

console.log(`OK: ${monolithSkills.length} skills mapped across ${Object.keys(groups).length} plugins, each exactly once.`);
if (checkOnly) process.exit(0);

/* ---------- build ---------- */

const monolithPkg = read(path.join(MONOLITH, '.claude-plugin', 'plugin.json'));
const version = monolithPkg.version || '1.0.0';

fs.mkdirSync(OUT, { recursive: true });

for (const [name, meta] of Object.entries(groups)) {
  const dir = path.join(OUT, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, '.claude-plugin'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'skills'), { recursive: true });

  for (const s of meta.skills) {
    fs.cpSync(path.join(MONOLITH_SKILLS, s), path.join(dir, 'skills', s), { recursive: true });
  }

  fs.writeFileSync(
    path.join(dir, '.claude-plugin', 'plugin.json'),
    JSON.stringify(
      {
        name,
        description: meta.description,
        version,
        author: monolithPkg.author,
        license: monolithPkg.license,
        keywords: ['skills', 'prompts', 'personas', 'context-engineering'],
      },
      null,
      2,
    ) + '\n',
  );

  const rows = meta.skills.slice().sort().map(s => `- \`${s}\``).join('\n');
  fs.writeFileSync(
    path.join(dir, 'README.md'),
    `# ${meta.title}\n\n${meta.description}\n\n` +
      `${meta.skills.length} skills:\n\n${rows}\n\n---\n\n` +
      `Generated from \`prompt-library-plugin\` by \`scripts/split.mjs\`. ` +
      `Do not edit skills here; edit the monolith and re-run the script.\n`,
  );

  console.log(`  built ${name.padEnd(24)} ${String(meta.skills.length).padStart(3)} skills`);
}

/* ---------- marketplace ---------- */

const mk = read(MARKETPLACE);
const monolithEntry = mk.plugins.find(p => p.name === 'prompt-library');
const children = Object.entries(groups).map(([name, meta]) => ({
  name,
  description: meta.description,
  category: meta.category,
  source: `./plugins/${name}`,
}));

mk.plugins = [monolithEntry, ...children].filter(Boolean);
mk.description =
  `${monolithSkills.length} context-engineered persona skills, available as one monolith plugin ` +
  `or as ${children.length} task-scoped plugins you can enable individually`;
fs.writeFileSync(MARKETPLACE, JSON.stringify(mk, null, 2) + '\n');

console.log(`\nmarketplace.json: 1 monolith + ${children.length} child plugins`);
