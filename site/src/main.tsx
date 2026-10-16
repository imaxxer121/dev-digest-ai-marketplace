import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { parseRoute, safeAssetPath, searchCatalog, validateCatalog, installationOrder } from './catalog.mjs';
import { renderMarkdown, sourceUrl } from './markdown.mjs';
import type { Artifact, BodyRef, Catalog, Data, Plugin, Release, Stats } from './types';
import './styles.css';

const BASE = import.meta.env.BASE_URL;
const title = (name: string) => name.split('-').map(word => word[0]?.toUpperCase() + word.slice(1)).join(' ');
const pluginHref = (name: string) => `#/plugin/${encodeURIComponent(name)}`;
const artifactHref = (id: string) => `#/artifact/${encodeURIComponent(id)}`;
const repository = 'https://github.com/imaxxer121/dev-digest-ai-marketplace';
const categories: Record<string, string> = { 'sdd-engineering': 'Workflow', 'engineering-paved-path': 'Foundations', 'research-tools': 'Research', 'architecture-review': 'Quality' };

async function fetchAsset(file: string, signal?: AbortSignal) {
  const response = await fetch(`${BASE}${safeAssetPath(file)}`, { signal });
  if (!response.ok) throw new Error(`Could not load ${file.endsWith('.md') ? 'this document' : 'the catalog'} (HTTP ${response.status}).`);
  return response;
}
function Arrow({ diagonal = false }: { diagonal?: boolean }) { return <span aria-hidden="true">{diagonal ? '↗' : '↗'}</span>; }
function Glyph({ type }: { type: string }) { return <span className={`glyph ${type}`} aria-hidden="true">{type === 'sdd-engineering' ? '⌘' : type === 'research-tools' ? '⌕' : type === 'architecture-review' ? '◇' : '⌑'}</span>; }
function Pill({ children }: { children: React.ReactNode }) { return <span className="pill">{children}</span>; }
function Empty({ title: heading, children, retry }: { title: string; children: React.ReactNode; retry?: () => void }) {
  return <div className="empty"><span className="empty-icon" aria-hidden="true">⌕</span><h2>{heading}</h2><p>{children}</p>{retry && <button className="button secondary" onClick={retry}>Try again</button>}</div>;
}
function Copy({ value, label = 'Copy commands' }: { value: string; label?: string }) {
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  async function copy() {
    setPending(true);
    try { if (!navigator.clipboard) throw new Error(); await navigator.clipboard.writeText(value); setStatus('Copied to clipboard'); }
    catch { setStatus('Copy unavailable. Select the command below.'); }
    finally { setPending(false); }
  }
  return <><button className="copy" onClick={() => void copy()} disabled={pending}>{status === 'Copied to clipboard' ? '✓ Copied' : label} <span aria-hidden="true">⧉</span></button><span className="sr-only" role="status">{status}</span>{status.startsWith('Copy unavailable') && <p className="copy-error">{status}</p>}</>;
}
function Markdown({ reference, repo = repository }: { reference: BodyRef; repo?: string }) {
  const [state, setState] = useState<{ path: string; body?: string; error?: string }>({ path: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setState({ path: reference.body });
    fetchAsset(reference.body, controller.signal).then(response => response.text()).then(body => setState({ path: reference.body, body }))
      .catch(error => { if (!controller.signal.aborted) setState({ path: reference.body, error: error.message }); });
    return () => controller.abort();
  }, [reference.body, attempt]);
  if (state.path !== reference.body || (state.body === undefined && !state.error)) return <p className="loading" role="status">Loading document…</p>;
  if (state.error) return <div role="alert"><Empty title="Document unavailable" retry={() => setAttempt(value => value + 1)}>{state.error}</Empty></div>;
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(state.body ?? '', undefined, sourceUrl(repo, reference.sourcePath)) }} />;
}
function SearchForm({ query = '', compact = false }: { query?: string; compact?: boolean }) {
  return <form className={`search-form ${compact ? 'compact' : ''}`} role="search" onSubmit={event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); location.hash = `/search?q=${encodeURIComponent(String(form.get('q') ?? ''))}`;
  }}><span aria-hidden="true">⌕</span><label className="sr-only" htmlFor={compact ? 'nav-search' : 'catalog-search'}>Search plugins, skills and agents</label>
    <input id={compact ? 'nav-search' : 'catalog-search'} name="q" type="search" placeholder="Search plugins, skills, agents…" defaultValue={query} key={query} maxLength={512} />
    <button type="submit" aria-label="Search catalog">↵</button></form>;
}
function Header({ page }: { page: string }) {
  const [menu, setMenu] = useState(false);
  return <header className="header"><div className="header-inner"><a className="brand" href="#/" aria-label="SDD Engineering home"><span className="brand-mark">s<span>↗</span></span><span>SDD <b>Engineering</b><small>PLUGIN MARKETPLACE</small></span></a>
    <button className="menu-button" aria-expanded={menu} aria-controls="primary-nav" onClick={() => setMenu(!menu)}>Menu <span aria-hidden="true">☰</span></button>
    <nav id="primary-nav" className={menu ? 'open' : ''} aria-label="Primary navigation" onClick={() => setMenu(false)}>
      <a href="#/" aria-current={['home', 'plugin', 'artifact', 'search'].includes(page) ? 'page' : undefined}>Browse</a><a href="#/whats-new" aria-current={page === 'whats-new' ? 'page' : undefined}>What’s new</a><a href="#/getting-started" aria-current={page === 'getting-started' ? 'page' : undefined}>Getting started</a>
      <a href={repository} target="_blank" rel="noreferrer" className="github">GitHub <Arrow /></a>
    </nav></div></header>;
}
function PluginCard({ plugin, catalog, featured = false }: { plugin: Plugin; catalog: Catalog; featured?: boolean }) {
  const artifacts = catalog.artifacts.filter(item => item.plugin === plugin.name);
  const skills = artifacts.filter(item => item.kind === 'skill').length, agents = artifacts.length - skills;
  return <a className={`plugin-card ${featured ? 'featured' : ''}`} href={pluginHref(plugin.name)}><div className="card-top"><Glyph type={plugin.name} /><Pill>{categories[plugin.name] ?? 'Plugin'}</Pill></div>
    <div className="card-heading"><h3>{title(plugin.name)}</h3><span className="version">v{plugin.version}</span></div><p>{plugin.description}</p>
    <div className="card-footer"><span>{skills > 0 && `${skills} skills`}{skills > 0 && agents > 0 && ' · '}{agents > 0 && `${agents} agents`}</span><span className="card-arrow"><Arrow /></span></div></a>;
}
function Home({ catalog, stats }: { catalog: Catalog; stats: Stats }) {
  const featured = catalog.plugins.find(plugin => plugin.name === 'sdd-engineering');
  return <><section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="live-dot" /> BUILT FOR THE WAY YOU BUILD</div><h1>Your workflow.<br /><span>A stronger foundation.</span></h1><p>Thoughtful skills and focused agents for better software.<br className="desktop-break" /> Open source. Portable. Ready for your next project.</p>
    <div className="hero-actions"><button className="button primary" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>Explore the collection <Arrow /></button><a className="text-link" href="#/getting-started">Get started <span aria-hidden="true">→</span></a></div><div className="hero-note"><span aria-hidden="true">✦</span> Made for Claude Code & Codex</div></div>
    <div className="workflow" aria-label="Workflow: research, specify, plan, build and verify"><div className="workflow-top"><span><span className="live-dot" /> THE SDD WORKFLOW</span><span>v1.0</span></div>
      {['Research the context', 'Specify the outcome', 'Make a clear plan', 'Build. Verify. Improve.'].map((step, i) => <div className={`workflow-step step-${i}`} key={step}><span className="step-number">0{i + 1}</span><span>{step}<small>{['Source-backed, read-only discovery', 'Requirements with acceptance criteria', 'Owned tasks and explicit boundaries', 'Independent review. Bounded repairs.'][i]}</small></span><span className="step-check">{i === 3 ? '↗' : '✓'}</span></div>)}
      <div className="workflow-bottom"><span>From intent to evidence.</span><span aria-hidden="true">└─→</span></div></div></section>
    <div className="stats-strip"><span><strong>{String(stats.plugins).padStart(2, '0')}</strong> curated plugins</span><span><strong>{String(stats.components).padStart(2, '0')}</strong> skills & agents</span><span><strong>MIT</strong> open source</span><span className="stat-note">Small packages. Clear responsibilities.</span></div>
    <section className="collection" id="collection"><div className="section-heading"><div><div className="eyebrow">THE COLLECTION</div><h2>Good tools. Better together.</h2><p>Install what you need. Keep your own way of working.</p></div><a href="#/search" className="text-link">Browse all components <span aria-hidden="true">→</span></a></div>
      <SearchForm compact /><div className="plugin-grid">{featured && <PluginCard plugin={featured} catalog={catalog} featured />}{catalog.plugins.filter(plugin => plugin !== featured).map(plugin => <PluginCard key={plugin.name} plugin={plugin} catalog={catalog} />)}</div></section>
    <section className="closing"><span className="closing-icon" aria-hidden="true">↳</span><div><h2>Your repository stays yours.</h2><p>Local instructions lead. Skills load when they’re useful. Every package has a clear boundary.</p></div><a className="button secondary" href="#/getting-started">Start building <Arrow /></a></section></>;
}
function InstallBox({ plugin, catalog }: { plugin: Plugin; catalog: Catalog }) {
  const [runtime, setRuntime] = useState('claude');
  const order = installationOrder(catalog, plugin.name) as string[];
  const slug = plugin.repository ? new URL(plugin.repository).pathname.replace(/^\//, '').replace(/\/$/, '') : 'imaxxer121/dev-digest-ai-marketplace';
  const command = runtime === 'claude' ? `claude plugin marketplace add ${slug}\nclaude plugin install ${plugin.name}@${catalog.marketplace} --scope project`
    : `codex plugin marketplace add ${slug}\n${order.map(name => `codex plugin add ${name}@${catalog.marketplace}`).join('\n')}`;
  return <aside className="install-panel"><div className="eyebrow">ADD TO YOUR TOOLKIT</div><h2>Install the plugin</h2><div className="runtime-switch" role="group" aria-label="Installation runtime">{['claude', 'codex'].map(value => <button key={value} aria-pressed={runtime === value} onClick={() => setRuntime(value)}>{value === 'claude' ? 'Claude Code' : 'Codex'}</button>)}</div>
    <div className="code-label"><span>TERMINAL</span><Copy value={command} label="Copy install" /></div><pre className="install-code"><code>{command}</code></pre><p>Run in your target repository, then start a fresh session. Copying never executes a command.</p><dl className="metadata"><div><dt>Version</dt><dd>{plugin.version}</dd></div><div><dt>Maintainer</dt><dd>{plugin.owner}</dd></div><div><dt>License</dt><dd>{plugin.license ?? 'See source'}</dd></div><div><dt>Dependencies</dt><dd>{plugin.dependencies.length}</dd></div></dl></aside>;
}
function ComponentList({ artifacts }: { artifacts: Artifact[] }) {
  return <div className="component-list">{artifacts.map(artifact => <a key={artifact.id} href={artifactHref(artifact.id)}><span className={`component-symbol ${artifact.kind}`} aria-hidden="true">{artifact.kind === 'skill' ? '✦' : '◇'}</span><span><strong>{artifact.name}</strong><p>{artifact.description}</p></span><Pill>{artifact.kind}</Pill><Arrow /></a>)}</div>;
}
function PluginPage({ plugin, catalog }: { plugin: Plugin; catalog: Catalog }) {
  const artifacts = catalog.artifacts.filter(artifact => artifact.plugin === plugin.name);
  return <><div className="breadcrumbs"><a href="#/">Collection</a><span>/</span><span>{plugin.name}</span></div><div className="detail-title"><Glyph type={plugin.name} /><div><div className="eyebrow">{categories[plugin.name] ?? 'PLUGIN'} · v{plugin.version}</div><h1>{title(plugin.name)}</h1><p>{plugin.description}</p></div></div><div className="detail-grid"><div className="detail-content"><div className="section-heading tight"><h2>Inside the package</h2><span className="muted">{artifacts.length} components</span></div><ComponentList artifacts={artifacts} />
    <section className="document-section"><h2>Overview</h2><Markdown reference={plugin} repo={plugin.repository ?? repository} /></section>
    <section className="document-section"><h2>Dependencies</h2>{plugin.dependencies.length ? <div className="dependency-list">{plugin.dependencies.map(dependency => <a href={pluginHref(dependency.name)} key={dependency.name}><span>{dependency.name}</span><code>{dependency.version}</code><Arrow /></a>)}</div> : <p className="muted">This plugin has no package dependencies.</p>}</section>
    <section className="document-section"><h2>Compatibility</h2>{plugin.compatibility ? <Markdown reference={plugin.compatibility} /> : <p className="muted">No additional runtime constraints are declared in this package. Follow the marketplace installation guide and your runtime’s plugin support.</p>}</section>
  </div><InstallBox key={plugin.name} plugin={plugin} catalog={catalog} /></div></>;
}
function ArtifactPage({ artifact, catalog }: { artifact: Artifact; catalog: Catalog }) {
  const plugin = catalog.plugins.find(plugin => plugin.name === artifact.plugin)!;
  const href = sourceUrl(plugin.repository ?? repository, artifact.sourcePath);
  return <><div className="breadcrumbs"><a href="#/">Collection</a><span>/</span><a href={pluginHref(plugin.name)}>{plugin.name}</a><span>/</span><span>{artifact.name}</span></div><div className="page-title"><div className="eyebrow">{artifact.kind.toUpperCase()} · v{artifact.version}</div><h1>{title(artifact.name)}</h1><p>{artifact.description}</p><div className="artifact-meta"><Pill>{artifact.plugin}:{artifact.name}</Pill>{artifact.model && <Pill>Model: {artifact.model}</Pill>}{href && <a className="text-link" href={href} target="_blank" rel="noreferrer">View source <Arrow /></a>}</div></div>
    <div className="detail-grid"><article className="document-panel"><Markdown reference={artifact} repo={plugin.repository ?? repository} /></article><aside className="artifact-aside"><h2>Part of {title(plugin.name)}</h2><p>Install the parent plugin to make this {artifact.kind} available in your repository.</p><a className="button secondary" href={pluginHref(plugin.name)}>View plugin <Arrow /></a>{artifact.tools.length > 0 && <><h3>Declared tools</h3><div className="tool-list">{artifact.tools.map(tool => <code key={tool}>{tool}</code>)}</div><p className="small muted">Tool declarations describe the profile. Your runtime and sandbox enforce access.</p></>}</aside></div></>;
}
function SearchPage({ catalog, query }: { catalog: Catalog; query: string }) {
  const [kind, setKind] = useState('all');
  const results = searchCatalog(catalog, query, kind) as { id: string; name: string; kind: string; version: string; description: string; plugin?: string }[];
  return <><div className="page-title"><div className="eyebrow">FIND YOUR NEXT TOOL</div><h1>Search the collection.</h1><p>Look through plugins, skills, agents and the instructions they contain.</p></div><SearchForm query={query} /><div className="search-toolbar"><div className="filters" role="group" aria-label="Filter results">{['all', 'plugin', 'skill', 'agent'].map(value => <button key={value} aria-pressed={kind === value} onClick={() => setKind(value)}>{value === 'all' ? 'Everything' : `${title(value)}s`}</button>)}</div><span className="muted" role="status">{results.length} results{query && <> for “{query}”</>}</span></div>
    {results.length ? <div className="search-results">{results.map(item => <a href={item.kind === 'plugin' ? pluginHref(item.name) : artifactHref(item.id)} key={item.id}><span className={`component-symbol ${item.kind}`} aria-hidden="true">{item.kind === 'plugin' ? '⌑' : item.kind === 'skill' ? '✦' : '◇'}</span><div><div className="result-heading"><h2>{item.name}</h2><Pill>{item.kind}</Pill><span className="version">v{item.version}</span></div><p>{item.description}</p>{item.plugin && <small>{item.plugin}</small>}</div><Arrow /></a>)}</div> : <Empty title="No matches yet">Try a broader term, or switch the component filter. Every result comes from the actual package content.</Empty>}</>;
}
function ReleasesPage({ releases }: { releases: Release[] }) {
  return <><div className="page-title"><div className="eyebrow">THE CHANGELOG</div><h1>A little better, release by release.</h1><p>Changes from the packages’ own changelogs. Versions are published independently.</p></div>{releases.length ? <div className="release-list">{releases.map(release => <article className="release" key={`${release.plugin}:${release.version}`}><div className="release-date"><span className="live-dot" /><time dateTime={release.date}>{new Date(release.date + 'T00:00:00Z').toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time></div><div><Pill>v{release.version}</Pill><h2><a href={pluginHref(release.plugin)}>{title(release.plugin)} <Arrow /></a></h2><div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(release.content) }} /></div></article>)}</div> : <Empty title="No release notes available">This catalog has no dated changelog entries yet.</Empty>}</>;
}
function GettingStarted({ catalog }: { catalog: Catalog }) {
  return <><div className="page-title"><div className="eyebrow">A SMALL SETUP. A BETTER START.</div><h1>Bring your own project.</h1><p>Add the marketplace, install a package and start a fresh session.<br />Your repository’s instructions and tests stay in charge.</p></div><div className="getting-grid"><article className="document-panel">{catalog.docs.gettingStarted ? <Markdown reference={catalog.docs.gettingStarted} /> : <Empty title="Guide unavailable">Open the repository README for installation instructions.</Empty>}</article><aside className="artifact-aside"><h2>Start with the workflow</h2><ol className="guide-steps"><li><span>01</span>Research the existing project</li><li><span>02</span>Create an agreed specification</li><li><span>03</span>Write an executable plan</li><li><span>04</span>Implement and verify evidence</li></ol><a href={pluginHref('sdd-engineering')} className="button secondary">Explore SDD Engineering <Arrow /></a><p className="small muted">CLI installation, model execution and measured quality are different evidence. See the repository’s verification report for observed results.</p></aside></div></>;
}
function App() {
  const [route, setRoute] = useState(parseRoute(location.hash));
  const [data, setData] = useState<Data>(); const [error, setError] = useState(''); const [attempt, setAttempt] = useState(0);
  useEffect(() => { const changed = () => { setRoute(parseRoute(location.hash)); window.scrollTo(0, 0); }; window.addEventListener('hashchange', changed); return () => window.removeEventListener('hashchange', changed); }, []);
  useEffect(() => {
    const controller = new AbortController(); setError('');
    Promise.all(['index.json', 'releases.json', 'stats.json'].map(file => fetchAsset(file, controller.signal).then(response => response.json()))).then(([index, releases, stats]) => {
      const catalog = validateCatalog(index) as Catalog;
      if (!Array.isArray(releases) || releases.some(item => !catalog.plugins.some(plugin => plugin.name === item.plugin) || typeof item.version !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || typeof item.content !== 'string')) throw new Error('Release data is invalid.');
      if (!stats || ['plugins', 'components', 'skills', 'agents'].some(key => !Number.isSafeInteger(stats[key]) || stats[key] < 0)) throw new Error('Catalog statistics are invalid.');
      setData({ catalog, releases, stats: stats as Stats });
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => { document.title = `${route.page === 'plugin' || route.page === 'artifact' ? title(route.id?.split(':').at(-1) ?? 'Catalog') : route.page === 'whats-new' ? 'What’s new' : route.page === 'getting-started' ? 'Getting started' : route.page === 'search' ? 'Search' : 'Plugin marketplace'} · SDD Engineering`; }, [route]);
  let content: React.ReactNode;
  if (error) content = <div role="alert"><Empty title="The catalog couldn’t load" retry={() => setAttempt(value => value + 1)}>{error}</Empty></div>;
  else if (!data) content = <div className="initial-loading" role="status"><span className="loading-dot" />Loading the collection…</div>;
  else if (route.page === 'home') content = <Home catalog={data.catalog} stats={data.stats} />;
  else if (route.page === 'search') content = <SearchPage key={route.query} catalog={data.catalog} query={route.query ?? ''} />;
  else if (route.page === 'whats-new') content = <ReleasesPage releases={data.releases} />;
  else if (route.page === 'getting-started') content = <GettingStarted catalog={data.catalog} />;
  else if (route.page === 'plugin' && data.catalog.plugins.some(plugin => plugin.name === route.id)) content = <PluginPage key={route.id} plugin={data.catalog.plugins.find(plugin => plugin.name === route.id)!} catalog={data.catalog} />;
  else if (route.page === 'artifact' && data.catalog.artifacts.some(artifact => artifact.id === route.id)) content = <ArtifactPage key={route.id} artifact={data.catalog.artifacts.find(artifact => artifact.id === route.id)!} catalog={data.catalog} />;
  else content = <Empty title="This page isn’t in the collection">The link may be outdated. <a href="#/">Return to the collection →</a></Empty>;
  return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a><Header page={route.page} /><main id="main-content" tabIndex={-1}>{content}</main><footer className="footer"><a className="footer-brand" href="#/">s↗ <span>SDD Engineering</span></a><span>Small tools. Thoughtful software.</span><div><span>Built by {data?.catalog.owner ?? 'Milad'}</span><a href={`${repository}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT License <Arrow /></a></div></footer></>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
