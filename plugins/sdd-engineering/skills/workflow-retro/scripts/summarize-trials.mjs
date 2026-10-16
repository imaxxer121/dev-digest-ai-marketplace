import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export function summarize(trials) {
  if (!Array.isArray(trials) || trials.length === 0) throw new Error('No trials');
  for (const t of trials) {
    for (const k of ['input_tokens','output_tokens','cached_input_tokens','duration_ms']) {
      if (!Number.isFinite(t[k]) || t[k] < 0) throw new Error(`Invalid ${k}`);
    }
    if (t.cached_input_tokens > t.input_tokens || typeof t.success !== 'boolean') throw new Error('Invalid trial');
  }
  const successes=trials.filter(t=>t.success).length;
  const sum=k=>trials.reduce((n,t)=>n+t[k],0);
  const durations=trials.map(t=>t.duration_ms).sort((a,b)=>a-b);
  const m=Math.floor(durations.length/2);
  return {trials:trials.length,successes,success_rate:successes/trials.length,
    median_duration_ms:durations.length%2?durations[m]:(durations[m-1]+durations[m])/2,
    input_tokens:sum('input_tokens'),cached_input_tokens:sum('cached_input_tokens'),
    output_tokens:sum('output_tokens'),
    uncached_input_tokens_per_success:successes?(sum('input_tokens')-sum('cached_input_tokens'))/successes:null,
    all_tokens_per_success:successes?(sum('input_tokens')+sum('output_tokens'))/successes:null,
    billed_usd_per_success:null,billing_reason:'Subscription CLI does not expose billed USD; tokens are a cost proxy.'};
}
if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(summarize(JSON.parse(await readFile(process.argv[2],'utf8'))),null,2));
}
