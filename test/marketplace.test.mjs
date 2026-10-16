import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bodyPath, dependencyOrder, loadMarketplace, relativePath, safeFile } from '../scripts/catalog.mjs';
import { buildIndex } from '../scripts/build-index.mjs';
import { safeAssetPath, validateCatalog, searchCatalog, parseRoute, installationOrder } from '../site/src/catalog.mjs';
import { renderMarkdown, sourceUrl } from '../site/src/markdown.mjs';
import createDOMPurify from '../site/node_modules/dompurify/dist/purify.es.mjs';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const plugin = (name, dependencies = []) => ({ name, version: '1.0.0', description: 'A portable tool', author: { name: 'Fixture author' }, license: 'MIT', dependencies });
async function fixture(t, definitions = [plugin('foundation')]) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'marketplace-test-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const put = async (filename, content) => { const target = path.join(temp, filename); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, typeof content === 'string' ? content : JSON.stringify(content)); };
  await put('.claude-plugin/marketplace.json', { name: 'fixture-market', owner: { name: 'Fixture' }, plugins: definitions.map(item => ({ name: item.name, source: `./plugins/${item.name}` })) });
  await put('.agents/plugins/marketplace.json', { name: 'fixture-market', plugins: definitions.map(item => ({ name: item.name, source: { source: 'local', path: `./plugins/${item.name}` } })) });
  await put('README.md', '# Fixture install\nA test guide.');
  for (const item of definitions) {
    await put(`plugins/${item.name}/.claude-plugin/plugin.json`, item);
    await put(`plugins/${item.name}/README.md`, '# Readme\nActual package content.');
    await put(`plugins/${item.name}/CHANGELOG.md`, '## 1.0.0 — 2026-10-16\n\nA concrete initial release.');
    await put(`plugins/${item.name}/skills/rules/SKILL.md`, '---\nname: rules\ndescription: Read the target boundaries\n---\nUse the repository architecture. Evidence is path:line.');
  }
  return { root: temp, put };
}

test('real package index derives all versions, bodies, counts and ordered dependencies from source', async t => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'catalog-output-')); t.after(() => rm(temp, { recursive: true, force: true }));
  const actual = await loadMarketplace(root), result = await buildIndex(root, temp);
  assert.equal(result.stats.plugins, actual.plugins.length);
  assert.equal(result.stats.components, actual.artifacts.length);
  assert.equal(result.stats.skills + result.stats.agents, result.stats.components);
  assert.deepEqual(result.index.dependencyOrder, actual.order);
  for (const artifact of result.index.artifacts) {
    assert.equal(artifact.version, actual.plugins.find(plugin => plugin.name === artifact.plugin).version);
    assert.equal((await readFile(path.join(temp, safeAssetPath(artifact.body)), 'utf8')).trim(), actual.artifacts.find(item => item.id === artifact.id).content);
    assert(!artifact.body.includes(artifact.name));
  }
  assert(result.releases.every(release => actual.plugins.some(plugin => plugin.name === release.plugin)));
  assert.deepEqual(validateCatalog(JSON.parse(await readFile(path.join(temp, 'index.json'), 'utf8'))), result.index);
});
test('source changes propagate into body search and deterministic content-addressed asset filenames', async t => {
  const example = await fixture(t);
  const first = await buildIndex(example.root);
  await example.put('plugins/foundation/skills/rules/SKILL.md', '---\nname: rules\ndescription: Same description\n---\nSPECIAL_BOUNDARY_MARKER with <script>alert(1)</script>');
  const second = await buildIndex(example.root);
  assert.notEqual(first.index.artifacts[0].body, second.index.artifacts[0].body);
  assert.equal(searchCatalog(second.index, 'special_boundary_marker', 'skill')[0].name, 'rules');
  assert.equal(searchCatalog(second.index, 'special_boundary_marker', 'plugin').length, 0);
  assert.equal(searchCatalog(second.index, '["malicious]*').length, 0);
  assert.match(bodyPath('../../<script>"', 'content'), /^bodies\/[a-f0-9]{64}\.md$/);
  const filenames = await readdir(path.join(example.root, 'site/public/bodies'));
  assert(filenames.every(filename => /^[a-f0-9]{64}\.md$/.test(filename)));
});
test('relative paths reject traversal, Windows/UNC/absolute paths and control characters', () => {
  for (const input of ['../secret', 'a/../../secret', '/tmp/a', 'C:/a', 'C:\\a', '\\\\server\\share', '//host/a', 'a\\b', 'a/./b', 'a//b', 'a\0b', 'a?b']) assert.throws(() => relativePath(input), /Unsafe/);
  assert.equal(relativePath('./plugins/foundation'), 'plugins/foundation');
});
test('marketplace paths and names cannot become escaping or script filenames', async t => {
  const example = await fixture(t);
  await example.put('.claude-plugin/marketplace.json', { name: 'fixture-market', plugins: [{ name: 'foundation', source: '../../outside' }] });
  await assert.rejects(loadMarketplace(example.root), /Unsafe relative path/);
  await example.put('.claude-plugin/marketplace.json', { name: 'fixture-market', plugins: [{ name: 'bad"><script>', source: './plugins/foundation' }] });
  await assert.rejects(loadMarketplace(example.root), /Invalid\/duplicate plugin name/);
});
test('mirrored runtime marketplaces must resolve the same local plugin sources', async t => {
  const example = await fixture(t);
  await example.put('.agents/plugins/marketplace.json', { name: 'fixture-market', plugins: [{ name: 'foundation', source: { source: 'local', path: './plugins/other' } }] });
  await assert.rejects(loadMarketplace(example.root), /Codex marketplace path mismatch/);
});
test('SemVer dependency resolution rejects cycles, unknown dependencies, invalid ranges and mismatches', () => {
  assert.throws(() => dependencyOrder([plugin('first', [{ name: 'second', version: '^1.0.0' }]), plugin('second', [{ name: 'first', version: '^1.0.0' }])]), /cycle/);
  assert.throws(() => dependencyOrder([plugin('first', [{ name: 'absent', version: '^1.0.0' }])]), /Missing dependency/);
  assert.throws(() => dependencyOrder([plugin('first', [{ name: 'second', version: 'nope' }]), plugin('second')]), /Invalid dependency range/);
  assert.throws(() => dependencyOrder([plugin('first', [{ name: 'second', version: '^2.0.0' }]), plugin('second')]), /range mismatch/);
  const definitions = [plugin('consumer', [{ name: 'base', version: '^1.0.0' }]), plugin('base')];
  assert.deepEqual(dependencyOrder(definitions), ['base', 'consumer']);
  assert.deepEqual(installationOrder({ plugins: definitions }, 'consumer'), ['base', 'consumer']);
});
test('invalid plugin version and duplicate artifacts fail before index generation', async t => {
  const example = await fixture(t, [{ ...plugin('foundation'), version: 'latest' }]);
  await assert.rejects(loadMarketplace(example.root), /Invalid plugin manifest/);
  await example.put('plugins/foundation/.claude-plugin/plugin.json', plugin('foundation'));
  await example.put('plugins/foundation/agents/rules.md', '---\nname: rules\ndescription: Read-only checker\nmodel: inherit\ntools: [Read]\n---\nNo edits.');
  await assert.rejects(loadMarketplace(example.root), /Duplicate namespaced artifact/);
});
test('metadata cannot select an executable frontmatter engine or inject an install command through repository URLs', async t => {
  const example = await fixture(t);
  await example.put('plugins/foundation/skills/rules/SKILL.md', '---js\n({name: "rules", description: process.exit(99)})\n---\nNever execute metadata.');
  await assert.rejects(loadMarketplace(example.root), /Only YAML frontmatter/);
  await example.put('plugins/foundation/skills/rules/SKILL.md', '---\nname: rules\ndescription: Rules\n---\nUse the target boundaries.');
  await example.put('plugins/foundation/.claude-plugin/plugin.json', { ...plugin('foundation'), repository: 'https://github.com/owner/repo; touch marker' });
  await assert.rejects(loadMarketplace(example.root), /Unsafe install repository/);
});
test('citation path:line is ordinary prose; real namespaced references must exist and declare dependencies', async t => {
  const example = await fixture(t, [plugin('foundation'), plugin('consumer', [{ name: 'foundation', version: '^1.0.0' }])]);
  await example.put('plugins/consumer/skills/rules/SKILL.md', '---\nname: rules\ndescription: Consumer\n---\nCite path:line; use foundation:rules.');
  assert.equal((await loadMarketplace(example.root)).artifacts.length, 2);
  await example.put('plugins/consumer/skills/rules/SKILL.md', '---\nname: rules\ndescription: Consumer\n---\nUse foundation:missing.');
  await assert.rejects(loadMarketplace(example.root), /Unresolved namespaced reference foundation:missing/);
  await example.put('plugins/consumer/skills/rules/SKILL.md', '---\nname: rules\ndescription: Consumer\n---\nUse foundation:rules.');
  await example.put('plugins/consumer/.claude-plugin/plugin.json', plugin('consumer'));
  await assert.rejects(loadMarketplace(example.root), /Undeclared dependency/);
});
test('read-only agent tools reject direct writers, unrestricted execution and delegated writers', async t => {
  const example = await fixture(t);
  for (const tool of ['Write', 'Edit', 'Bash', 'Task', 'Agent']) {
    await example.put('plugins/foundation/agents/auditor.md', `---\nname: auditor\ndescription: Read-only reviewer\nmodel: inherit\ntools: [Read, ${tool}]\n---\nReturn evidence only. No edits.`);
    await assert.rejects(loadMarketplace(example.root), /Read-only role has write\/execution\/delegation permissions/);
  }
  await example.put('plugins/foundation/agents/auditor.md', '---\nname: auditor\ndescription: Read-only reviewer\nmodel: inherit\ntools: [Read, Glob, Grep]\n---\nReturn evidence only. No edits.');
  assert.equal((await loadMarketplace(example.root)).artifacts.filter(item => item.kind === 'agent').length, 1);
});
test('portable component paths reject workstation imports, missing resources and escaped support links while allowing documentation URLs', async t => {
  const example = await fixture(t);
  const header = '---\nname: rules\ndescription: Rules\n---\n';
  for (const content of ['Read C:\\Users\\someone\\app.ts', '[missing](references/missing.md)', '[escape](../../../../secret.md)', '[encoded](%2e%2e/secret.md)']) {
    await example.put('plugins/foundation/skills/rules/SKILL.md', header + content);
    await assert.rejects(loadMarketplace(example.root));
  }
  await example.put('plugins/foundation/skills/rules/SKILL.md', header + '[Install](https://example.test/docs/install) [Home](https://example.test/home/docs)');
  assert.equal((await loadMarketplace(example.root)).artifacts.length, 1);
});
test('filesystem reads refuse linked paths rather than following them outside the marketplace', async t => {
  const example = await fixture(t);
  const outside = await mkdtemp(path.join(os.tmpdir(), 'marketplace-outside-')); t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(path.join(outside, 'secret.md'), 'private');
  await symlink(outside, path.join(example.root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(safeFile(example.root, 'linked/secret.md'), /Linked path/);
});
test('generated asset fetch paths reject remote URLs, encoded traversal, script names and unexpected bodies', () => {
  for (const path of ['../index.json', 'https://evil.test/index.json', '//evil/body.md', 'bodies/../../secret', 'bodies/%2e%2e.md', 'bodies/<img>.md', 'bodies/a.md', 'index.json?redirect=x']) assert.throws(() => safeAssetPath(path), /unsafe/);
  assert.equal(safeAssetPath(bodyPath('id', 'body')), bodyPath('id', 'body'));
});
test('runtime catalog validation rejects unsafe body URLs before any Markdown fetch', async t => {
  const example = await fixture(t); const { index } = await buildIndex(example.root);
  assert.throws(() => validateCatalog({ ...index, plugins: [{ ...index.plugins[0], body: 'https://evil.test/body.md' }] }), /unsafe/);
  assert.throws(() => validateCatalog({ ...index, artifacts: [{ ...index.artifacts[0], id: '../../escape' }] }), /invalid component/);
});
test('hash routes safely handle unknown/deleted artifacts, malformed encoding and query text', () => {
  assert.deepEqual(parseRoute('#/plugin/foundation'), { page: 'plugin', id: 'foundation' });
  assert.deepEqual(parseRoute('#/artifact/foundation%3Askill%3Arules'), { page: 'artifact', id: 'foundation:skill:rules' });
  assert.deepEqual(parseRoute('#/search?q=%3Cscript%3E'), { page: 'search', query: '<script>' });
  for (const hash of ['#/plugin/%ZZ', '#//evil.test', '#/artifact/../../x', '#/plugin/a%2Fb', '#/unknown']) assert.equal(parseRoute(hash).page, 'unknown');
  assert.equal(parseRoute('#/').page, 'home');
});
test('Markdown removes executable HTML/URLs while retaining actual prose, fenced code and safe source links', () => {
  const window = new JSDOM('').window, purifier = createDOMPurify(window);
  const html = renderMarkdown('# Policy\n\n<script>alert(1)</script><img src=x onerror="alert(1)"><iframe src="https://evil.test"></iframe>\n\n[bad](javascript:alert(1)) [guide](references/guide.md)\n\n```sh\nrm -rf example\n```', purifier, 'https://github.com/owner/repo/blob/main/skills/demo/SKILL.md');
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelector('script,iframe'), null);
  assert.equal(document.querySelector('[onerror]'), null);
  assert.equal(document.querySelector('a[href^="javascript:"]'), null);
  assert.equal(document.querySelector('pre code').textContent.trim(), 'rm -rf example');
  assert.equal([...document.querySelectorAll('a')].find(anchor => anchor.textContent === 'guide').href, 'https://github.com/owner/repo/blob/main/skills/demo/references/guide.md');
  assert.equal(sourceUrl('javascript:alert(1)', 'file.md'), undefined);
  assert.equal(sourceUrl('https://github.com/owner/repo', '../escape.md'), undefined);
  window.close();
});
