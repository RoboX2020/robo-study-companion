import assert from 'node:assert/strict';
import fs from 'node:fs';
import {retrieve,extractive,masteryUpdate,nextQuestion,grade,validateQuestion,safeModelAnswer} from './core.mjs';
const units=JSON.parse(fs.readFileSync('data/sources.json')),bank=JSON.parse(fs.readFileSync('data/questions.json'));
for(const q of bank){assert(validateQuestion(q,units),q.id);assert(grade(q,q.type==='short'?q.keywords.map(k=>k[0]).join(' '):q.answer).correct,q.id);}
assert(masteryUpdate(.25,true)>.25);assert(masteryUpdate(.8,false)<.8);
assert(extractive('What is the weather in Paris?',units).refused);
assert(retrieve('ROS2 Publish Clock topic',units).some(u=>u.id==='lab-19-0'));
assert(retrieve('LED resistor resistance',units).some(u=>u.id.startsWith('play-')));
assert.throws(()=>safeModelAnswer({answer:'invented',evidence:[{id:units[0].id,quote:'not present'}]},units));
const seen=[];let state={mastery:{},seen};while(true){const q=nextQuestion(bank,state);if(!q)break;assert(!seen.includes(q.id));seen.push(q.id);}assert.equal(seen.length,bank.length);
console.log(`Passed: ${bank.length} source and answer validations; BKT; refusal; retrieval; citation rejection; no-repeat selection.`);
const {classifyUnit,assessmentBatch}=await import('./core.mjs');
assert.equal(classifyUnit('Voltage resistor Ohm LED'),'Circuits & Arduino');
assert.equal(classifyUnit('ROS2 Isaac Sim /clock /cmd_vel'),'ROS 2 & Isaac Sim');
assert.equal(assessmentBatch(bank,{seen:[],mastery:{}},'all',5).length,5);
assert.equal(new Set(assessmentBatch(bank,{seen:[],mastery:{}},'all',5).map(q=>q.id)).size,5);
console.log('Topic tagging and mock exam checks passed.');

assert(extractive('What topic publishes simulation time?',units).answer.includes('/clock'));
assert(extractive('Resistance calculated', [{id:'a',title:'Ohm',text:'Resistance is calculated as:\nR = (V - V_LED) / I.',topic:'Circuits'},...Array.from({length:20},(_,i)=>({id:'d'+i,title:'Other',text:'unrelated topic',topic:'Other'}))]).answer.includes('R ='));
assert.throws(()=>safeModelAnswer({answer:'x',evidence:[{id:units[0].id,quote:''}]},units));
console.log('Short code/formula excerpt preservation and empty-quote rejection passed.');

const {validateConceptMap}=await import('./core.mjs');
const graph={nodes:[{id:'c',label:'Clock',evidence:[{id:'lab-19-0',quote:'Topic Name = /clock'}]},{id:'d',label:'Playback',evidence:[{id:'lab-20-0',quote:'Press Play in Isaac Sim.'}]}],edges:[{from:'d',to:'c',reason:'Playback drives simulation.'}]};
assert.equal(validateConceptMap(graph,units).nodes.length,2);
assert.throws(()=>validateConceptMap({...graph,edges:[...graph.edges,{from:'c',to:'d',reason:'bad'}]},units));
assert.throws(()=>validateConceptMap({...graph,edges:[{from:'missing',to:'c',reason:'bad'}]},units));
assert.throws(()=>validateConceptMap({nodes:[{id:'x',label:'invented',evidence:[{id:'lab-19-0',quote:'fabricated'}]}],edges:[]},units));
console.log('Evidence-backed concept graph, cycle and missing-node rejection passed.');

const {contextSample}=await import('./core.mjs');assert.equal(contextSample(units,12).length,12);assert.equal(new Set(contextSample(units,12).map(u=>u.topic)).size,new Set(units.map(u=>u.topic)).size);console.log('Representative context sampling passed.');
