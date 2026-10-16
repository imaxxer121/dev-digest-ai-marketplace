export interface BodyRef { body: string; sourcePath: string }
export interface Dependency { name: string; version: string }
export interface Plugin extends BodyRef { name: string; version: string; description: string; owner: string; license: string | null; repository: string | null; dependencies: Dependency[]; compatibility: BodyRef | null; changelog: BodyRef | null; searchText: string }
export interface Artifact extends BodyRef { id: string; name: string; plugin: string; kind: 'skill' | 'agent'; version: string; description: string; model: string | null; tools: string[]; searchText: string }
export interface Catalog { schemaVersion: number; marketplace: string; owner: string; plugins: Plugin[]; artifacts: Artifact[]; docs: Record<string, BodyRef>; dependencyOrder: string[] }
export interface Release { plugin: string; version: string; date: string; content: string }
export interface Stats { plugins: number; skills: number; agents: number; components: number }
export interface Data { catalog: Catalog; releases: Release[]; stats: Stats }
