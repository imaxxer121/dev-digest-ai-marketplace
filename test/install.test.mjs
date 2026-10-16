import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadMarketplace } from '../scripts/catalog.mjs';
import { installationGuide } from '../site/src/catalog.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
async function actualCatalog() {
  const source = await loadMarketplace(root);
  return { marketplace: source.marketplace.name, plugins: source.plugins };
}
function setupFiles(guide) {
  assert.deepEqual(guide.files.map(file => file.path), ['.agents/plugins/marketplace.json', '.codex/config.toml']);
  return { marketplace: JSON.parse(guide.files[0].content), config: guide.files[1].content };
}
function enabledPluginIds(config) {
  // Parse the deliberately minimal TOML output, rejecting any extra settings or incomplete tables.
  const tables = config.trim().split('\n\n');
  return tables.map(table => {
    const match = table.match(/^\[plugins\.("(?:[^"\\]|\\.)*")\]\nenabled = true$/);
    assert.ok(match, `Unexpected enable table: ${table}`);
    return JSON.parse(match[1]);
  });
}

test('Codex setup for a standalone plugin contains exactly its remote release and enable flag', async () => {
  const catalog = await actualCatalog();
  const guide = installationGuide(catalog, 'research-tools', 'codex');
  const { marketplace, config } = setupFiles(guide);
  assert.equal(marketplace.name, catalog.marketplace);
  assert.deepEqual(marketplace.plugins.map(plugin => plugin.name), ['research-tools']);
  assert.deepEqual(enabledPluginIds(config), [`research-tools@${catalog.marketplace}`]);
  assert.equal(guide.label, 'SETUP');
  assert.equal(guide.copyLabel, 'Copy setup');
});

test('Codex setup derives the deduplicated dependency closure and canonical version tags from actual manifests', async () => {
  const catalog = await actualCatalog();
  const { marketplace, config } = setupFiles(installationGuide(catalog, 'sdd-engineering', 'codex'));
  const expected = ['engineering-paved-path', 'research-tools', 'architecture-review', 'sdd-engineering'];
  assert.deepEqual(marketplace.plugins.map(plugin => plugin.name), expected);
  assert.deepEqual(enabledPluginIds(config), expected.map(name => `${name}@${catalog.marketplace}`));
  for (const plugin of marketplace.plugins) {
    const manifest = JSON.parse(await readFile(new URL(`../plugins/${plugin.name}/.claude-plugin/plugin.json`, import.meta.url), 'utf8'));
    assert.deepEqual(plugin.source, {
      source: 'git-subdir', url: `${manifest.repository}.git`, path: `plugins/${manifest.name}`, ref: `${manifest.name}--v${manifest.version}`,
    });
    assert.deepEqual(plugin.policy, { installation: 'AVAILABLE', authentication: 'ON_USE' });
    assert.equal(plugin.category, 'Productivity');
    assert.ok(!('sha' in plugin.source));
  }
  const architectureOnly = setupFiles(installationGuide(catalog, 'architecture-review', 'codex'));
  assert.deepEqual(architectureOnly.marketplace.plugins.map(plugin => plugin.name), ['engineering-paved-path', 'architecture-review']);
});

test('Codex copy text includes merge-safe files, explicit dependency installation and a fresh session without CLI inventions', async () => {
  const catalog = await actualCatalog();
  const guide = installationGuide(catalog, 'sdd-engineering', 'codex');
  for (const file of guide.files) {
    assert.ok(guide.text.includes(file.path));
    assert.ok(guide.text.includes(file.content.trimEnd()));
  }
  assert.match(guide.text, /existing files/);
  assert.match(guide.text, /Preserve unrelated settings/);
  assert.match(guide.text, /update matching entries or tables/);
  assert.match(guide.text, /different name.*enabled plugin IDs/);
  assert.match(guide.text, /\/plugins/);
  assert.match(guide.text, /explicitly install each plugin/);
  assert.match(guide.text, /engineering-paved-path, research-tools, architecture-review, sdd-engineering/);
  assert.match(guide.text, /fresh Codex session/);
  assert.match(guide.text, /trusted projects/);
  assert.doesNotMatch(guide.text, /codex\s+plugin\s/i);
  assert.doesNotMatch(guide.text, /claude\s+plugin\s/i);
  assert.equal((await readFile(new URL('../site/src/main.tsx', import.meta.url), 'utf8')).includes('codex plugin'), false);
});

test('Codex source tags follow each plugin version rather than a shared version or dependency range', async () => {
  const catalog = structuredClone(await actualCatalog());
  catalog.plugins.find(plugin => plugin.name === 'research-tools').version = '2.3.4';
  const { marketplace } = setupFiles(installationGuide(catalog, 'sdd-engineering', 'codex'));
  assert.equal(marketplace.plugins.find(plugin => plugin.name === 'research-tools').source.ref, 'research-tools--v2.3.4');
  assert.equal(marketplace.plugins.find(plugin => plugin.name === 'sdd-engineering').source.ref, `sdd-engineering--v${catalog.plugins.find(plugin => plugin.name === 'sdd-engineering').version}`);
});

test('Claude retains its two actual CLI commands and project scope', async () => {
  const catalog = await actualCatalog();
  for (const selected of ['research-tools', 'sdd-engineering']) {
    const guide = installationGuide(catalog, selected, 'claude');
    assert.equal(guide.text, `claude plugin marketplace add imaxxer121/dev-digest-ai-marketplace\nclaude plugin install ${selected}@dev-digest-ai-marketplace --scope project`);
    assert.equal(guide.label, 'TERMINAL');
    assert.equal(guide.copyLabel, 'Copy install');
    assert.deepEqual(guide.files, []);
  }
});

test('unknown runtimes, missing plugins and unsafe release metadata cannot produce setup instructions', async () => {
  const catalog = await actualCatalog();
  assert.throws(() => installationGuide(catalog, 'sdd-engineering', 'other'), /Unsupported installation runtime/);
  assert.throws(() => installationGuide(catalog, 'missing', 'codex'), /Missing dependency/);
  for (const [field, value] of [['version', '1.0.0\nmalicious'], ['repository', 'https://evil.test/repo']]) {
    const invalid = structuredClone(catalog);
    invalid.plugins.find(plugin => plugin.name === 'research-tools')[field] = value;
    assert.throws(() => installationGuide(invalid, 'sdd-engineering', 'codex'), /Invalid.*(release identity|repository)/);
  }
});
