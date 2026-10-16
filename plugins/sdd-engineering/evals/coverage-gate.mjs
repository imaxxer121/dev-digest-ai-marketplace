import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export function checkCoverage(document) {
  const errors=[];
  if(!document||!Array.isArray(document.requirements)||!document.requirements.length||!Array.isArray(document.acceptance)||!document.acceptance.length)return {pass:false,errors:['Expected nonempty requirements and acceptance arrays']};
  const requirements=new Map(),acceptance=new Set(),covered=new Set();
  for(const r of document.requirements){
    if(!r||typeof r.id!=='string'||!r.id.trim()||typeof r.mandatory!=='boolean'||typeof r.statement!=='string'||!r.statement.trim()){errors.push('Malformed requirement');continue;}
    if(requirements.has(r.id))errors.push('Duplicate requirement:'+r.id);
    requirements.set(r.id,r);
  }
  for(const ac of document.acceptance){
    if(!ac||typeof ac.id!=='string'||!ac.id.trim()||typeof ac.criterion!=='string'||!ac.criterion.trim()||!Array.isArray(ac.requirement_ids)||!ac.requirement_ids.length){errors.push('Malformed acceptance criterion');continue;}
    if(acceptance.has(ac.id))errors.push('Duplicate AC:'+ac.id);acceptance.add(ac.id);
    for(const id of ac.requirement_ids){if(typeof id!=='string'||!requirements.has(id))errors.push('Unknown requirement:'+String(id));else covered.add(id);}
  }
  for(const [id,r] of requirements)if(r.mandatory&&!covered.has(id))errors.push('Mandatory requirement without AC:'+id);
  return {pass:errors.length===0,errors,requirements:requirements.size,acceptance:acceptance.size,mandatory:[...requirements.values()].filter(r=>r.mandatory).length};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{
  const raw=await readFile(process.argv[2],'utf8');if(Buffer.byteLength(raw)>1_048_576)throw new Error('Input exceeds 1 MiB');
  const result=checkCoverage(JSON.parse(raw));console.log(JSON.stringify(result,null,2));process.exitCode=result.pass?0:2;
 }catch(error){console.error(error.message);process.exitCode=2;}
}
