import { readFile, readdir, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import semver from 'semver';

export const NAME = /^[a-z][a-z0-9-]{0,63}$/;
export const READ_TOOLS = new Set(['Read', 'Glob', 'Grep']);
const TOOLS = new Set([...READ_TOOLS, 'Write', 'Edit', 'Bash', 'Task', 'Agent']);
const check = (condition, message) => { if (!condition) throw new Error(message); };
export function relativePath(value) {
  check(typeof value === 'string' && value.length > 0 && !/[\\\x00-\x1f\x7f:#?]/.test(value), `Unsafe relative path: ${value}`);
  const clean = value.startsWith('./') ? value.slice(2) : value;
  check(!path.posix.isAbsolute(clean) && clean.split('/').every(segment => segment && segment !== '.' && segment !== '..'), `Unsafe relative path: ${value}`);
  return clean;
}
export async function safeFile(root, relative) {
  const clean = relativePath(relative);
  const resolvedRoot = await realpath(root);
  let current = resolvedRoot;
  for (const segment of clean.split('/')) {
    current = path.join(current, segment);
    const info = await lstat(current);
    check(!info.isSymbolicLink(), `Linked path is not portable: ${clean}`);
  }
  const resolved = await realpath(current);
  check(resolved.startsWith(resolvedRoot + path.sep), `Path escapes marketplace: ${clean}`);
  return resolved;
}
async function text(root, relative) {
  const filename = await safeFile(root, relative);
  const info = await lstat(filename);
  check(info.isFile() && info.size <= 1_048_576, `Not a bounded regular source file: ${relative}`);
  return readFile(filename, 'utf8');
}
async function optionalText(root, relative) {
  try { return await text(root, relative); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
const json = async (root, filename) => JSON.parse(await text(root, filename));
const ownerName = value => typeof value === 'string' ? value : value?.name;
export const bodyPath = (identity, content) => `bodies/${createHash('sha256').update(identity).update('\0').update(content).digest('hex')}.md`;

export function dependencyOrder(plugins) {
  const map = new Map(plugins.map(plugin => [plugin.name, plugin]));
  const visited = new Set(), active = new Set(), order = [];
  const visit = name => {
    check(!active.has(name), `Dependency cycle at ${name}`);
    if (visited.has(name)) return;
    const plugin = map.get(name); check(plugin, `Missing dependency: ${name}`);
    active.add(name);
    for (const dependency of plugin.dependencies ?? []) {
      check(NAME.test(dependency.name) && typeof dependency.version === 'string' && semver.validRange(dependency.version), `Invalid dependency range in ${name}`);
      const target = map.get(dependency.name); check(target, `Missing dependency: ${dependency.name}`);
      check(semver.satisfies(target.version, dependency.version), `Dependency range mismatch: ${name} needs ${dependency.name}@${dependency.version}, found ${target.version}`);
      visit(dependency.name);
    }
    active.delete(name); visited.add(name); order.push(name);
  };
  for (const plugin of plugins) visit(plugin.name);
  return order;
}

function validateArtifact(artifact, filename) {
  check(NAME.test(artifact.name) && artifact.description?.trim() && artifact.content.trim(), `Invalid artifact frontmatter/body: ${filename}`);
  check(!/(?:(?<![\w])(?:[A-Z]:[\\/]|\\\\[^\s])|(?<![:/\w])\/(?:Users|home|mnt|tmp)\/|file:\/\/\/)/i.test(artifact.content), `Nonportable workstation path in ${filename}`);
  if (artifact.kind === 'agent') {
    check(artifact.model === 'inherit', `Agent must inherit the available model: ${filename}`);
    check(Array.isArray(artifact.tools) && artifact.tools.length > 0 && artifact.tools.every(tool => TOOLS.has(tool)), `Unsupported agent tool permissions: ${filename}`);
    const readOnly = /\bread[- ]only\b|\bno edits\b/i.test(`${artifact.description}\n${artifact.content}`);
    check(!readOnly || artifact.tools.every(tool => READ_TOOLS.has(tool)), `Read-only role has write/execution/delegation permissions: ${filename}`);
  }
}

export async function loadMarketplace(root) {
  const marketplace = await json(root, '.claude-plugin/marketplace.json');
  const codex = await json(root, '.agents/plugins/marketplace.json');
  check(NAME.test(marketplace.name) && Array.isArray(marketplace.plugins) && marketplace.plugins.length > 0, 'Invalid marketplace name/plugins');
  check(codex.name === marketplace.name && Array.isArray(codex.plugins), 'Marketplace names must match');
  const names = new Set(), artifacts = [], plugins = [], bodies = [];
  const saveBody = (identity, content, sourcePath) => { const file = bodyPath(identity, content); bodies.push({ path: file, content }); return { body: file, sourcePath }; };
  for (const entry of marketplace.plugins) {
    check(NAME.test(entry.name) && !names.has(entry.name), `Invalid/duplicate plugin name: ${entry.name}`); names.add(entry.name);
    const source = relativePath(entry.source);
    check(source === `plugins/${entry.name}`, `Marketplace source must match plugin: ${entry.name}`);
    const mirror = codex.plugins.filter(plugin => plugin.name === entry.name);
    check(mirror.length === 1 && mirror[0].source?.source === 'local' && relativePath(mirror[0].source.path) === source, `Codex marketplace path mismatch: ${entry.name}`);
    const manifest = await json(root, `${source}/.claude-plugin/plugin.json`);
    check(manifest.name === entry.name && semver.valid(manifest.version) && typeof manifest.description === 'string' && manifest.description.trim() && typeof ownerName(manifest.author) === 'string' && ownerName(manifest.author).trim(), `Invalid plugin manifest: ${entry.name}`);
    check(manifest.repository === undefined || /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(manifest.repository), `Unsafe install repository: ${entry.name}`);
    check(manifest.dependencies === undefined || Array.isArray(manifest.dependencies), `Dependencies must be an array: ${entry.name}`);
    const readme = await text(root, `${source}/README.md`);
    const changelog = await optionalText(root, `${source}/CHANGELOG.md`);
    const compatibility = await optionalText(root, `${source}/COMPATIBILITY.md`);
    const plugin = { name: manifest.name, version: manifest.version, description: manifest.description,
      owner: ownerName(manifest.author), license: manifest.license ?? null, repository: manifest.repository ?? null,
      dependencies: manifest.dependencies ?? [], source, ...saveBody(entry.name, readme, `${source}/README.md`),
      compatibility: compatibility ? saveBody(`${entry.name}:compatibility`, compatibility, `${source}/COMPATIBILITY.md`) : null,
      changelog: changelog ? saveBody(`${entry.name}:changelog`, changelog, `${source}/CHANGELOG.md`) : null,
      searchText: `${entry.name} ${manifest.description} ${readme} ${compatibility ?? ''}`.toLowerCase() };
    plugins.push(plugin);
    for (const kind of ['skill', 'agent']) {
      const folder = `${source}/${kind}s`;
      let children;
      try { children = await readdir(await safeFile(root, folder), { withFileTypes: true }); }
      catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      for (const child of children.sort((a, b) => a.name.localeCompare(b.name))) {
        check(!child.isSymbolicLink(), `Linked artifact: ${folder}/${child.name}`);
        if (kind === 'skill' ? !child.isDirectory() : !child.isFile() || !child.name.endsWith('.md')) continue;
        const filename = kind === 'skill' ? `${folder}/${child.name}/SKILL.md` : `${folder}/${child.name}`;
        const raw = await text(root, filename);
        // gray-matter also supports executable JavaScript engines. Only plain YAML
        // delimiters are a supported component contract; never select an engine from input.
        check(/^---\r?\n/.test(raw), `Only YAML frontmatter is supported: ${filename}`);
        const parsed = matter(raw);
        const artifact = { id: `${entry.name}:${kind}:${parsed.data.name}`, plugin: entry.name, kind,
          name: parsed.data.name, description: parsed.data.description, model: parsed.data.model ?? null,
          tools: parsed.data.tools ?? [], content: parsed.content.trim(), version: manifest.version,
          ...saveBody(`${entry.name}:${kind}:${parsed.data.name}`, parsed.content.trim(), filename) };
        validateArtifact(artifact, filename);
        check(artifact.name === (kind === 'skill' ? child.name : child.name.slice(0, -3)), `Artifact name/path mismatch: ${filename}`);
        check(!artifacts.some(existing => existing.plugin === entry.name && existing.name === artifact.name), `Duplicate namespaced artifact: ${entry.name}:${artifact.name}`);
        // Validate local Markdown support links; HTTP install/documentation links remain portable.
        for (const match of parsed.content.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)) {
          const target = match[1];
          if (/^(https?:|mailto:|#)/.test(target)) continue;
          const clean = relativePath(decodeURIComponent(target.split('#')[0]));
          const linked = path.posix.join(path.posix.dirname(filename), clean);
          check(linked.startsWith(source + '/'), `Artifact support path escapes plugin: ${filename}`);
          await safeFile(root, linked);
        }
        artifacts.push(artifact);
      }
    }
  }
  check(codex.plugins.length === plugins.length, 'Codex marketplace contains unlisted plugins');
  const order = dependencyOrder(plugins);
  for (const artifact of artifacts) for (const match of artifact.content.matchAll(/\b([a-z][a-z0-9-]*):([a-z][a-z0-9-]*)\b/g)) {
    const [reference, pluginName, componentName] = match;
    // Citation notation (path:line) and ordinary prose are not plugin references.
    // Package prefixes come from the validated marketplace/dependency graph.
    if (!plugins.some(plugin => plugin.name === pluginName)) continue;
    check(artifacts.some(candidate => candidate.plugin === pluginName && candidate.name === componentName), `Unresolved namespaced reference ${reference} in ${artifact.sourcePath}`);
    const owner = plugins.find(plugin => plugin.name === artifact.plugin);
    check(pluginName === owner.name || owner.dependencies.some(dependency => dependency.name === pluginName), `Undeclared dependency for ${reference} in ${artifact.sourcePath}`);
  }
  const docs = {};
  for (const [name, filename] of [['gettingStarted', 'README.md'], ['security', 'docs/SECURITY.md'], ['releases', 'docs/RELEASES.md']]) {
    const content = await optionalText(root, filename);
    if (content) docs[name] = saveBody(`doc:${name}`, content, filename);
  }
  return { marketplace, plugins, artifacts, bodies, docs, order };
}
