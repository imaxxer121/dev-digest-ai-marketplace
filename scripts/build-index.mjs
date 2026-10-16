import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadMarketplace } from './catalog.mjs';

export async function buildIndex(root, output = path.join(root, 'site/public')) {
  const source = await loadMarketplace(root);
  const { marketplace, plugins, artifacts, docs, order } = source;
  const index = { schemaVersion: 1, marketplace: marketplace.name, owner: marketplace.owner.name, plugins,
    artifacts: artifacts.map(({ content, ...artifact }) => ({ ...artifact, searchText: `${artifact.name} ${artifact.description} ${content}`.toLowerCase() })), docs, dependencyOrder: order };
  const releases = [];
  for (const plugin of plugins) {
    const content = source.bodies.find(body => body.path === plugin.changelog?.body)?.content ?? '';
    const entries = [...content.matchAll(/^##\s+(\d+\.\d+\.\d+(?:-[\w.-]+)?)\s*[—-]\s*(\d{4}-\d{2}-\d{2})\s*\r?$/gm)];
    for (let i = 0; i < entries.length; i++) releases.push({ plugin: plugin.name, version: entries[i][1], date: entries[i][2],
      content: content.slice(entries[i].index + entries[i][0].length, entries[i + 1]?.index ?? content.length).trim() });
  }
  releases.sort((a, b) => b.date.localeCompare(a.date) || a.plugin.localeCompare(b.plugin));
  const stats = { plugins: plugins.length, skills: artifacts.filter(artifact => artifact.kind === 'skill').length,
    agents: artifacts.filter(artifact => artifact.kind === 'agent').length, components: artifacts.length };
  await mkdir(path.join(output, 'bodies'), { recursive: true });
  for (const body of source.bodies) await writeFile(path.join(output, body.path), body.content, 'utf8');
  for (const [filename, data] of [['index.json', index], ['releases.json', releases], ['stats.json', stats]])
    await writeFile(path.join(output, filename), JSON.stringify(data, null, 2) + '\n', 'utf8');
  return { index, releases, stats };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  try { const result = await buildIndex(root); console.log(`Indexed ${result.stats.plugins} plugins and ${result.stats.components} components.`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
