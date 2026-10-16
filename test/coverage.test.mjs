import test from 'node:test';
import assert from 'node:assert/strict';
import {checkCoverage} from '../plugins/sdd-engineering/evals/coverage-gate.mjs';
const valid=()=>({requirements:[{id:'R1',mandatory:true,statement:'Reject invalid limits'},{id:'R2',mandatory:false,statement:'Optional color'}],acceptance:[{id:'AC1',requirement_ids:['R1'],criterion:'Invalid limit exits 2 on stderr'}]});
test('covers mandatory behavior without silently making optional work mandatory',()=>assert.equal(checkCoverage(valid()).pass,true));
test('rejects a realistic spec that omits a mandatory error requirement',()=>{const x=valid();x.requirements.push({id:'R3',mandatory:true,statement:'Reject duplicate flags'});const r=checkCoverage(x);assert.equal(r.pass,false);assert.ok(r.errors.some(e=>e.includes('R3')));});
test('does not credit a dangling or duplicate identifier as valid coverage',()=>{const x=valid();x.acceptance[0].requirement_ids=['unknown'];x.requirements.push({...x.requirements[0]});x.acceptance.push({...x.acceptance[0]});assert.equal(checkCoverage(x).pass,false);});
test('a heading or empty criteria cannot stand in for observable acceptance',()=>{const x=valid();x.acceptance[0].criterion=' ';assert.equal(checkCoverage(x).pass,false);assert.equal(checkCoverage({requirements:[],acceptance:[]}).pass,false);});
