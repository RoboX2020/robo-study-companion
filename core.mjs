export const words = s => (s.toLowerCase().match(/[a-z0-9_\/]+/g)||[]).filter(x=>x.length>2 && !new Set(['the','and','for','with','that','this','how','what','does','why','from','can','you','are','was','into','about','should','would']).has(x));
export function retrieve(query, units, count=4) {
 const q=[...new Set(words(query))]; if(!q.length) return [];
 const df=Object.fromEntries(q.map(w=>[w,units.filter(u=>words(u.text+' '+u.title).includes(w)).length]));
 return units.map(u=>{ const t=words(u.text), title=words(u.title); let score=0, hits=0;
 for(const w of q) {const f=t.filter(v=>v===w).length;if(f||title.includes(w))hits++;score+=(f?f/(f+1.2*(.25+.75*t.length/180)):0)*Math.log(1+(units.length-df[w]+.5)/(df[w]+.5))+(title.includes(w)?1.1:0);}
 return {...u,score,coverage:hits/q.length};}).filter(u=>u.score>.8 && u.coverage>=.34).sort((a,b)=>b.score-a.score).slice(0,count);
}
export function extractive(query,units) {
 const hits=retrieve(query,units); if(!hits.length) return {answer:'I could not find support for this in your course material. Try a course concept or add a source. I will not fill the gap with outside knowledge.',refused:true,citations:[]};
 const q=words(query); const sentences=hits.flatMap(u=>{
  const lines=u.text.split(/(?<=[.!?])\s+|\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('```')),chunks=[];
  for(let i=0;i<lines.length;i++){let text=lines[i];
   // Preserve short labels, code, formulae and the line after an introductory colon.
   while(i+1<lines.length&&(text.length<55||text.endsWith(':')))text+='\n'+lines[++i];
   chunks.push({text,id:u.id,score:q.filter(w=>words(text).includes(w)).length});}
  return chunks;
 });
 const selected=sentences.sort((a,b)=>b.score-a.score).slice(0,3);
 return {answer:'Source excerpts (offline search, not a generated explanation):\n\n'+selected.map(x=>x.text).join('\n\n'),citations:[...new Set(selected.map(s=>s.id))],refused:false};
}
export function masteryUpdate(prior,correct,confidence=1) {
 // Bayesian knowledge tracing. Guess=.25, slip=.10, learn=.12.
 const p=Math.max(.03,Math.min(.97,prior??.25)), g=.25,s=.1;
 const post=correct?p*(1-s)/(p*(1-s)+(1-p)*g):p*s/(p*s+(1-p)*(1-g));
 return Math.max(.03,Math.min(.97,p+(post+(1-post)*.12-p)*confidence));
}
export function nextQuestion(bank,state,scope='all') {
 const candidates=bank.filter(q=>(scope==='all'||q.topic===scope)&&!(state.seen||[]).includes(q.id));
 return candidates.sort((a,b)=>((state.mastery?.[a.topic]??.25)-(state.mastery?.[b.topic]??.25))||a.difficulty-b.difficulty)[0]||null;
}
export function grade(q,input) {
 if(q.type==='mcq') return {correct:String(input)===String(q.answer),feedback:q.explanation};
 if(q.type==='numerical') {const n=Number(String(input).replace(/[a-zΩ ]+$/i,'')); return {correct:Number.isFinite(n)&&Math.abs(n-Number(q.answer))<=Math.max(.001,Math.abs(Number(q.answer))*.025),feedback:q.explanation};}
 const text=String(input).toLowerCase(); return {correct:q.keywords.every(group=>group.some(x=>text.includes(x.toLowerCase()))),feedback:q.explanation+' Short answers use a transparent keyword check, not semantic grading.'};
}
export function validateQuestion(q,units) {
 const u=units.find(u=>u.id===q.source); if(!u||!q.evidence||!u.text.includes(q.evidence))return false;
 if(!['mcq','short','numerical'].includes(q.type)||!q.topic||!q.id)return false;
 if(q.type==='mcq')return Array.isArray(q.options)&&q.options.length===4&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4;
 if(q.type==='numerical') return Number.isFinite(Number(q.answer));
 return Array.isArray(q.keywords)&&q.keywords.length>0;
}
export function safeModelAnswer(result,units) {
 if(!result || !Array.isArray(result.evidence)) throw Error('The model did not return source evidence.');
 const valid=result.evidence.filter(e=>e&&typeof e.quote==='string'&&e.quote.trim().length>=5&&units.some(u=>u.id===e.id&&u.text.includes(e.quote)));
 if(valid.length!==result.evidence.length)throw Error('The answer contained an invalid citation.');
 if(result.refused||!valid.length)return {answer:'The material does not support an answer with verifiable excerpts. I am declining rather than guessing.',refused:true,citations:[]};
 return {answer:String(result.answer),refused:false,citations:[...new Set(valid.map(e=>e.id))],evidence:valid};
}

export function classifyUnit(text) {
 const categories=[['Circuits & Arduino',['voltage','resistor','ohm','led','breadboard','digitalwrite','pinmode']],['Sensors & motion',['servo','infrared','sensor','motor','gate','l293d','h-bridge']],['ROS 2 & Isaac Sim',['ros2','ros 2','isaac','turtlebot','cmd_vel','clock','omnigraph','usd','odometry','nav2','lidar','twist']]];
 const scores=categories.map(([topic,terms])=>({topic,score:terms.filter(t=>text.toLowerCase().includes(t)).length})).sort((a,b)=>b.score-a.score);
 return scores[0].score?scores[0].topic:'Other course concepts';
}
export function assessmentBatch(bank,state,scope='all',limit=5) {
 const copy={...state,seen:[...(state.seen||[])]},selected=[];
 while(selected.length<limit){let pool=bank;if(scope==='all'){const counts=Object.fromEntries([...new Set(bank.map(q=>q.topic))].map(t=>[t,selected.filter(q=>q.topic===t).length]));const min=Math.min(...Object.values(counts));const balanced=bank.filter(q=>counts[q.topic]===min&&!(copy.seen||[]).includes(q.id));if(balanced.length)pool=balanced;}const q=nextQuestion(pool,copy,scope);if(!q)break;selected.push(q);copy.seen.push(q.id);}return selected;
}
export function lessonPlan(units,mastery){
 return [...new Set(units.map(u=>u.topic))].sort((a,b)=>(mastery[a]??.25)-(mastery[b]??.25)).map(t=>({topic:t,mastery:mastery[t]??.25,review:units.filter(u=>u.topic===t).slice(0,2).map(u=>u.id)}));
}
