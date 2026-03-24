#!/usr/bin/env node
/**
 * update-docs-changelog.js
 *
 * Reads CHANGELOG.json and package.json, then injects the generated
 * changelog HTML (with separate "New" and "Fixes" sections) into
 * public/docs/index.html between the injection markers:
 *
 *   <!-- CHANGELOG_START -->
 *   <!-- CHANGELOG_END -->
 *
 * Also replaces the Knowledge Base version marker:
 *   <!-- KB_VERSION -->
 *
 * Run manually:   node scripts/update-docs-changelog.js
 * Runs as part of build via the "prebuild" npm hook.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Paths ─────────────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const CHANGELOG = resolve(ROOT, 'CHANGELOG.json');
const PKG       = resolve(ROOT, 'package.json');
const DOCS      = resolve(ROOT, 'public', 'docs', 'index.html');

// ── Load data ─────────────────────────────────────────────────────────────────
const changelog = JSON.parse(readFileSync(CHANGELOG, 'utf8'));
const pkg       = JSON.parse(readFileSync(PKG, 'utf8'));

const appVersion = pkg.version || '0.0.0';
const versions   = changelog.versions || [];

// Determine which version is the "latest" (first in array)
const latestVersion = versions.length > 0 ? versions[0].version : appVersion;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters in a plain-text string.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Build the HTML for a single list of items under a labelled heading.
 * Returns an empty string when the list is empty.
 *
 * @param {'new'|'fixes'} type
 * @param {string[]} items
 * @returns {string}
 */
function buildItemList(type, items) {
  if (!items || items.length === 0) return '';

  const isNew = type === 'new';
  const icon  = isNew ? '🆕' : '🔧';
  const label = isNew ? 'New Features' : 'Bug Fixes';
  const cls   = isNew ? 'cl-label-new' : 'cl-label-fix';

  const lis = items.map(item => `      <li>${escHtml(item)}</li>`).join('\n');
  return `    <div class="${cls}">
      <span class="cl-item-label">${icon} ${label}</span>
      <ul>
${lis}
      </ul>
    </div>`;
}

/**
 * Build a single changelog entry block.
 *
 * @param {{ version: string, date: string, new: string[], fixes: string[] }} entry
 * @param {boolean} isLatest
 * @returns {string}
 */
function buildEntry(entry, isLatest) {
  const latestBadge = isLatest
    ? ' <span class="badge badge-green">Latest</span>'
    : '';

  const newSection   = buildItemList('new',   entry.new   || []);
  const fixesSection = buildItemList('fixes', entry.fixes || []);

  // If both sections are empty fall back to a placeholder
  const body = (newSection || fixesSection)
    ? [newSection, fixesSection].filter(Boolean).join('\n')
    : '    <p class="cl-empty">No entries for this release.</p>';

  return `  <div class="cl-entry">
    <div class="cl-version">v${escHtml(entry.version)}${latestBadge}</div>
    <div class="cl-date">${escHtml(entry.date)}</div>
${body}
  </div>`;
}

// ── Generate changelog HTML ───────────────────────────────────────────────────
const entriesHtml = versions
  .map(entry => buildEntry(entry, entry.version === latestVersion))
  .join('\n\n');

// ── Inject into docs HTML ─────────────────────────────────────────────────────
let html = readFileSync(DOCS, 'utf8');

// Replace changelog block
const clStart = '<!-- CHANGELOG_START -->';
const clEnd   = '<!-- CHANGELOG_END -->';
const clStartIdx = html.indexOf(clStart);
const clEndIdx   = html.indexOf(clEnd);

if (clStartIdx === -1 || clEndIdx === -1) {
  console.error(
    '[update-docs-changelog] ERROR: Injection markers not found in public/docs/index.html.\n' +
    '  Add <!-- CHANGELOG_START --> and <!-- CHANGELOG_END --> around the changelog entries.'
  );
  process.exit(1);
}

html =
  html.slice(0, clStartIdx + clStart.length) +
  '\n' +
  entriesHtml +
  '\n' +
  html.slice(clEndIdx);

// Replace Knowledge Base version marker  (<!-- KB_VERSION -->)
// Matches the marker followed by optional "v" and a semantic version number.
html = html.replace(/<!-- KB_VERSION -->v?[\d.]+/g, `<!-- KB_VERSION -->v${appVersion}`);

writeFileSync(DOCS, html, 'utf8');

console.log(
  `[update-docs-changelog] ✓ Changelog updated in public/docs/index.html ` +
  `(${versions.length} version${versions.length !== 1 ? 's' : ''}, latest: v${latestVersion})`
);

