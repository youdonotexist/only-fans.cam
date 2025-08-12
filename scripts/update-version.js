#!/usr/bin/env node
/*
 Updates front-end/src/version.json with a version string composed of local date-time and commit hash.
 Runs after a commit (post-commit hook) or can be run manually.
*/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitRoot(startDir) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    dir = path.dirname(dir);
  }
  return startDir;
}

function main() {
  try {
    const repoRoot = getGitRoot(process.cwd());
    const options = { cwd: repoRoot };
    // short hash of HEAD
    const hash = execSync('git rev-parse --short HEAD', options).toString().trim();
    // ISO local date-time without seconds timezone weirdness; format YYYY-MM-DD HH:mm
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const version = `${dateStr} - ${hash}`;

    const versionObj = { version };
    const versionPath = path.join(repoRoot, 'front-end', 'src', 'version.json');
    const json = JSON.stringify(versionObj, null, 2) + '\n';

    // Ensure directory exists
    fs.mkdirSync(path.dirname(versionPath), { recursive: true });
    fs.writeFileSync(versionPath, json, 'utf8');

    // Also log to console for visibility
    console.log(`Updated version file at ${path.relative(repoRoot, versionPath)} -> ${version}`);
  } catch (err) {
    console.error('Failed to update version:', err.message);
    process.exit(0); // do not fail commits due to version update
  }
}

main();
