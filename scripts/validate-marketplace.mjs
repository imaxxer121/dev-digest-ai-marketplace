import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadMarketplace } from './catalog.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
try {
  const catalog = await loadMarketplace(root);
  console.log(`Validated ${catalog.plugins.length} plugins, ${catalog.artifacts.length} artifacts and dependency order: ${catalog.order.join(' → ')}`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
