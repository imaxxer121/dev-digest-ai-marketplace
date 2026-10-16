export const validName = name => typeof name === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(name);
export const validArtifact = id => typeof id === 'string' && /^[a-z][a-z0-9-]{0,63}:(skill|agent):[a-z][a-z0-9-]{0,63}$/.test(id);
export function safeAssetPath(value) {
  if (typeof value !== 'string' || !/^(index\.json|releases\.json|stats\.json|bodies\/[a-f0-9]{64}\.md)$/.test(value))
    throw new Error('The catalog contains an unsafe generated asset path.');
  return value;
}
export function parseRoute(hash) {
  try {
    const value = hash.replace(/^#/, '') || '/';
    if (!value.startsWith('/') || value.startsWith('//')) return { page: 'unknown' };
    const [pathname, query = ''] = value.split('?');
    const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);
    if (!parts.length) return { page: 'home' };
    if (parts.length === 1 && ['search', 'whats-new', 'getting-started'].includes(parts[0]))
      return { page: parts[0], query: new URLSearchParams(query).get('q')?.slice(0, 512) ?? '' };
    if (parts.length === 2 && parts[0] === 'plugin' && validName(parts[1])) return { page: 'plugin', id: parts[1] };
    if (parts.length === 2 && parts[0] === 'artifact' && validArtifact(parts[1])) return { page: 'artifact', id: parts[1] };
    return { page: 'unknown' };
  } catch { return { page: 'unknown' }; }
}
export function validateCatalog(data) {
  if (!data || data.schemaVersion !== 1 || !validName(data.marketplace) || !Array.isArray(data.plugins) || !Array.isArray(data.artifacts)) throw new Error('The catalog index has an unsupported format.');
  const names = new Set();
  for (const plugin of data.plugins) {
    if (!validName(plugin.name) || names.has(plugin.name) || typeof plugin.description !== 'string' || typeof plugin.version !== 'string' || typeof plugin.owner !== 'string' || !Array.isArray(plugin.dependencies) || plugin.dependencies.some(dependency => !validName(dependency.name) || typeof dependency.version !== 'string') || (plugin.repository !== null && !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(plugin.repository))) throw new Error('The catalog contains an invalid plugin.');
    names.add(plugin.name); safeAssetPath(plugin.body);
    if (plugin.compatibility) safeAssetPath(plugin.compatibility.body);
    if (plugin.changelog) safeAssetPath(plugin.changelog.body);
  }
  const ids = new Set();
  for (const artifact of data.artifacts) {
    if (!validArtifact(artifact.id) || ids.has(artifact.id) || !names.has(artifact.plugin) || !validName(artifact.name) || !['skill', 'agent'].includes(artifact.kind) || typeof artifact.description !== 'string' || typeof artifact.searchText !== 'string' || !Array.isArray(artifact.tools) || artifact.tools.some(tool => typeof tool !== 'string')) throw new Error('The catalog contains an invalid component.');
    ids.add(artifact.id); safeAssetPath(artifact.body);
  }
  for (const ref of Object.values(data.docs ?? {})) safeAssetPath(ref.body);
  for (const plugin of data.plugins) installationOrder(data, plugin.name);
  return data;
}
export function searchCatalog(catalog, query, kind = 'all') {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return [...catalog.plugins.map(plugin => ({ ...plugin, kind: 'plugin', id: plugin.name })), ...catalog.artifacts]
    .filter(item => (kind === 'all' || kind === item.kind) && terms.every(term => `${item.name} ${item.description} ${item.searchText ?? ''}`.toLowerCase().includes(term)))
    .sort((a, b) => Number(b.name.includes(query.toLowerCase())) - Number(a.name.includes(query.toLowerCase())) || a.name.localeCompare(b.name));
}
export function installationOrder(catalog, selected) {
  const visited = new Set(), active = new Set(), result = [];
  const visit = name => {
    if (visited.has(name)) return;
    if (active.has(name)) throw new Error('The catalog dependency graph is cyclic.');
    const plugin = catalog.plugins.find(item => item.name === name);
    if (!plugin) throw new Error(`Missing dependency: ${name}`);
    active.add(name); for (const dependency of plugin.dependencies) visit(dependency.name);
    active.delete(name); visited.add(name); result.push(name);
  };
  visit(selected); return result;
}
