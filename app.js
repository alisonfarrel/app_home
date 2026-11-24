/* Nuestro Hogar — aplicación sin dependencias locales. */
const $ = (s,root=document)=>root.querySelector(s);
const esc = v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names=['Alicia','José'];
const cats=['Cocina','Platos','Limpieza','Ropa','Compra','Planificación','Mantenimiento'];
const weekdays=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const shortdays=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const dateISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>dateISO(new Date());
const parseDate=s=>new Date(`${s}T12:00:00`);
const plusDays=(s,n)=>{const d=parseDate(s);d.setDate(d.getDate()+n);return dateISO(d);};
const weekStart=s=>plusDays(s,-(parseDate(s).getDay()+6)%7);
const pretty=s=>parseDate(s).toLocaleDateString('es-ES',{day:'numeric',month:'short'});
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36);
const noonMillis=s=>parseDate(s).getTime();
const diffDays=(from,to)=>Math.round((noonMillis(to)-noonMillis(from))/86400000);
// Minutos de trabajo activo estimado. Los ciclos automáticos no cuentan.
function defaultMinutes(title,category){
 const t=String(title||'').toLowerCase();
 if(/poner (la )?lavadora/.test(t))return 5;
 if(/recoger (la )?(lavadora|colada)|tender.*doblar/.test(t))return 15;
 if(/lavadora de ropa/.test(t))return 20; // Compatibilidad con tareas antiguas
 if(/limpiar baño/.test(t))return 30;
 if(/batch cooking/.test(t))return 75;
 if(/hacer la compra/.test(t))return 60;
 if(/revisar existencias/.test(t))return 20;
 if(/planificar menú/.test(t))return 25;
 if(/planchar/.test(t))return 40;
 if(/preparar comida|preparar cena/.test(t))return 30;
 if(/recoger y fregar/.test(t))return 20;
 if(/limpieza semanal de cocina/.test(t))return 30;
 if(/cambiar y lavar toallas/.test(t))return 15;
 if(/lavar sábanas/.test(t))return 10;
 if(/cambiar sábanas/.test(t))return 15;
 if(/fregar suelos/.test(t))return 25;
 if(/limpiar polvo|limpiar habitación común/.test(t))return 20;
 if(/repasar terraza/.test(t))return 15;
 if(/robot aspirador/.test(t))return 10;
 if(/basura|reciclaje/.test(t))return 5;
 if(/revisar planificación/.test(t))return 15;
 if(/revisar mantenimiento/.test(t))return 10;
 if(/frigorífico|congelador|campana|cristales|horno|microondas|armarios|desagües|grifería/.test(t))return 35;
 if(/profunda|organizar almacenaje|mantas|cortinas|rodapiés/.test(t))return 45;
 return {Cocina:30,Platos:20,Limpieza:25,Ropa:15,Compra:30,Planificación:20,Mantenimiento:15}[category]||20;
}
function legacyMinutes(v,title,category){
 // La versión anterior guardaba una escala 1/2/3/5; migramos usando la tarea, no una conversión arbitraria.
 const n=Number(v);
 return Number.isFinite(n)&&n>5?n:defaultMinutes(title,category);
}
function minutes(t){const n=Number(t?.minutes);return Number.isFinite(n)&&n>=1?n:defaultMinutes(t?.title||'',t?.category||'');}
function occurrenceMinutes(o){
 const n=Number(o?.done?.minutes);
 return Number.isFinite(n)&&n>0?n:minutes(o.task);
}
function formatMinutes(n){const v=Math.round(n);return v>=60?`${Math.floor(v/60)} h${v%60?` ${v%60} min`:''}`:`${v} min`;}
const seededDate=today();
function newTask(title,category,owner,day,opts={}) {
 return {id:uid(),title,category,assignee:owner,repeat:opts.repeat||'weekly',days:day===null?[]:[day],nth:opts.nth||1,month:opts.month||1,dueDate:opts.dueDate||seededDate,createdAt:seededDate,active:true,minutes:opts.minutes??defaultMinutes(title,category),notes:opts.notes||'',pairId:opts.pairId||'',mealRole:opts.mealRole||'',mealKey:opts.mealKey||''};
}
// Each weekly slot specifies its weekday and owner independently.
function weeklySlots(t){
 if(Array.isArray(t.weeklySlots)&&t.weeklySlots.length)return t.weeklySlots.map(x=>({day:Number(x.day),assignee:names.includes(x.assignee)?x.assignee:t.assignee}));
 return (t.days||[1]).map(day=>({day:Number(day),assignee:t.assignee}));
}
function ownerOn(t,date){
 if(t.repeat==='weekly')return weeklySlots(t).find(slot=>slot.day===parseDate(date).getDay())?.assignee||t.assignee;
 return t.assignee;
}
function makeSeed(){
 const tasks=[];
 const add=(title,cat,owner,day,opts)=>{const t=newTask(title,cat,owner,day,opts);tasks.push(t);return t;};
 const meals=[
  [1,'comida','Alicia'],[1,'cena','Alicia'],[2,'comida','Alicia'],[2,'cena','José'],
  [3,'comida','José'],[3,'cena','Alicia'],[4,'comida','Alicia'],[4,'cena','José'],[5,'comida','José']
 ];
 for(const [day,meal,owner] of meals){
  const key=`${day}-${meal}`;const c=add(`Preparar ${meal}`, 'Cocina', owner,day,{mealRole:'cook',mealKey:key,notes:'Puede servirse comida preparada previamente.'});
  const other=owner==='Alicia'?'José':'Alicia';
  const w=add(`Recoger y fregar después de ${meal}`, 'Platos',other,day,{mealRole:'clean',mealKey:key,notes:'Mesa, platos, ollas, utensilios, encimera y fregadero.'});
  c.pairId=w.id;w.pairId=c.id;
 }
 add('Limpiar baño 1','Limpieza','Alicia',2);
 add('Limpiar baño 2','Limpieza','José',2);
 add('Poner lavadora de ropa 1','Ropa','José',2,{minutes:5});
 add('Recoger lavadora de ropa 1 (tender, doblar y guardar)','Ropa','José',2,{minutes:15});
 add('Poner lavadora de ropa 2','Ropa','Alicia',4,{minutes:5});
 add('Recoger lavadora de ropa 2 (tender, doblar y guardar)','Ropa','Alicia',4,{minutes:15});
 add('Limpiar polvo del salón','Limpieza','Alicia',4);
 add('Limpiar habitación común','Limpieza','Alicia',4);
 add('Limpieza semanal de cocina','Limpieza','José',4);
 add('Repasar terraza','Limpieza','José',4);
 add('Planchar ropa necesaria','Ropa','Alicia',5);
 add('Cambiar y lavar toallas y trapos','Ropa','Alicia',5);
 add('Revisar existencias y preparar lista de compra','Compra','Alicia',5);
 add('Planificar menú de lunes a viernes','Planificación','Alicia',5);
 add('Limpiar el robot aspirador','Mantenimiento','José',5);
 add('Revisar basura y reciclaje','Mantenimiento','José',5);
 add('Hacer la compra y colocarla','Compra','Alicia',6);
 add('Lavar sábanas','Ropa','Alicia',6);
 add('Cambiar sábanas y preparar camas','Ropa','José',6);
 add('Fregar suelos compartidos','Limpieza','José',6);
 add('Batch cooking para la semana','Cocina','Alicia',0);
 add('Recoger y fregar después de batch cooking','Platos','José',0);
 add('Poner lavadora de ropa 3 (si hace falta)','Ropa','José',0,{minutes:5,notes:'Si no hay suficiente ropa, se puede omitir esta repetición.'});
 add('Recoger lavadora de ropa 3 (si hace falta)','Ropa','José',0,{minutes:15,notes:'Tender, doblar y guardar. Omitir si no se puso esta lavadora.'});
 add('Revisar planificación semanal','Planificación','Alicia',0);
 add('Revisar mantenimiento pendiente','Mantenimiento','José',0);
 add('Sacar basura cuando se necesite','Mantenimiento','José',null,{repeat:'manual',notes:'Se puede registrar desde el listado global, cuando se realice.'});
 const monthly=[
  ['Limpiar frigorífico, congelador y caducidades','Alicia',1],['Campana, filtros y cubos de basura','José',1],
  ['Cristales interiores y espejos','Alicia',2],['Cristales de terraza, marcos y carriles','José',2],
  ['Armarios comunes y estanterías','Alicia',3],['Desagües, grifería y cal','José',3],
  ['Horno y microondas a fondo','Alicia',4],['Revisar lavadora y robot a fondo','José',4]
 ];
 for(const [title,owner,nth] of monthly)add(title,'Limpieza',owner,6,{repeat:'monthly',nth});
 const quarterly=[
  ['Lavar mantas y textiles comunes','Alicia',1],['Limpiar rodapiés y detrás de muebles','José',1],
  ['Organizar almacenaje compartido','Alicia',4],['Limpieza profunda de terraza','José',4],
  ['Organizar despensa a fondo','Alicia',7],['Revisar rejillas, filtros y equipos','José',7],
  ['Cortinas y textiles de temporada','Alicia',10],['Revisiones de equipos para el invierno','José',10]
 ];
 for(const [title,owner,month] of quarterly)add(title,owner==='José'?'Mantenimiento':'Limpieza',owner,6,{repeat:'yearly',month,nth:2});
 return {version:1,minutesMigrationV5:true,startedAt:seededDate,tasks,occurrences:{},events:[],shopping:[],settings:{reminders:false,reminderTime:'19:00'}};
}
function migrateToMinutes(s){
 if(!s||!Array.isArray(s.tasks))return s;
 if(s.minutesMigrationV5)return s;
 const extra=[];
 for(const t of s.tasks){
  const oldTitle=t.title;
  t.minutes=Number.isFinite(Number(t.minutes))&&Number(t.minutes)>=1?Number(t.minutes):defaultMinutes(oldTitle,t.category);
  delete t.effort;
  const match=oldTitle.match(/^Lavadora de ropa ([123]) \(incluye tender y doblar\)$/);
  if(match){
   const idx=match[1];
   t.title=`Poner lavadora de ropa ${idx}`;t.minutes=5;
   extra.push({...t,id:uid(),title:`Recoger lavadora de ropa ${idx} (tender, doblar y guardar)`,minutes:15});
  }else if(oldTitle==='Lavadora de ropa 3 (solo si hace falta)'){
   t.title='Poner lavadora de ropa 3 (si hace falta)';t.minutes=5;
   extra.push({...t,id:uid(),title:'Recoger lavadora de ropa 3 (si hace falta)',minutes:15});
  }
 }
 s.tasks.push(...extra);
 for(const [id,o] of Object.entries(s.occurrences||{})){
  if(o.done){
   const task=s.tasks.find(t=>id.startsWith(`${t.id}@`));
   o.done.minutes=Number.isFinite(Number(o.done.minutes))&&Number(o.done.minutes)>=1?Number(o.done.minutes):defaultMinutes(o.done.title||task?.title,o.done.category||task?.category);
   delete o.done.effort;
  }
 }
 s.minutesMigrationV5=true;
 return s;
}
const STORAGE='nuestro_hogar_v1';
function loadLocal(){try{const s=JSON.parse(localStorage.getItem(STORAGE));return s?.version===1?migrateToMinutes(s):makeSeed();}catch{return makeSeed();}}
// Snapshot de seguridad creado ANTES de que Firestore pueda sustituir el estado local.
// No se modifica en sincronizaciones posteriores.
const LOCAL_BACKUP_KEY='nuestro_hogar_backup_pre_firebase_v91';
try {
 const stored=localStorage.getItem('nuestro_hogar_v1');
 if(stored && !localStorage.getItem(LOCAL_BACKUP_KEY)) {
  const parsed=JSON.parse(stored);
  if(parsed && parsed.version===1 && Array.isArray(parsed.tasks)) localStorage.setItem(LOCAL_BACKUP_KEY, stored);
 }
} catch(err) { console.warn('No se pudo preparar copia local',err); }
function downloadLocalBackup(){
 const json=localStorage.getItem(LOCAL_BACKUP_KEY)||localStorage.getItem('nuestro_hogar_v1');
 if(!json){toast('No hay una copia local para descargar.');return;}
 const blob=new Blob([json],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');
 link.href=url; link.download='nuestro-hogar-copia-local-'+new Date().toISOString().slice(0,10)+'.json';
 document.body.appendChild(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),12000);
 toast('Copia local preparada. Guárdala en Archivos.');
}
let state=loadLocal();
let currentUser=localStorage.getItem('hogar_user')==='José'?'José':'Alicia';
let tab='today', selectedDay=today(), selectedWeek=weekStart(today()), taskFilter='Todas', overviewRange='week', modal=null, showDone=false;
let cloud=null, cloudReady=false, unsubscribe=null, cloudQueue=Promise.resolve(), notificationTick=null;
let toastTimer;
const el=$('#app');
function toast(s){const t=$('#toast');if(!t)return; t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3200);}
function storeLocal(){localStorage.setItem(STORAGE,JSON.stringify(state));}
function mutate(action){
 state=reduceState(state,action);storeLocal();render();
 if(cloudReady){
  cloudQueue=cloudQueue.then(async()=>{
   await cloud.api.runTransaction(cloud.db,async tx=>{
    const snap=await tx.get(cloud.docRef);
    const prior=snap.exists()?snap.data():makeSeed();
    tx.set(cloud.docRef,reduceState(migrateToMinutes(prior),action));
   });
  }).catch(e=>{console.error(e);toast('No se pudo sincronizar: revisa la conexión.');});
 }
}
function reduceState(s,a){
 s=structuredClone(s);
 switch(a.type){
  case 'addTask': s.tasks.push(a.task);break;
  case 'editTask': {
   const idx=s.tasks.findIndex(t=>t.id===a.task.id);if(idx<0)break;
   const old=s.tasks[idx];s.tasks[idx]={...old,...a.task};
   const newer=s.tasks[idx];
   // Keep meal preparation and washing-up assigned to opposite people on each weekday.
   if(newer.pairId && newer.mealRole && newer.repeat==='weekly'){
    const pair=s.tasks.find(x=>x.id===newer.pairId);
    if(pair && pair.active){
     pair.repeat='weekly';
     pair.weeklySlots=weeklySlots(newer).map(slot=>({day:slot.day,assignee:slot.assignee==='Alicia'?'José':'Alicia'}));
     pair.days=pair.weeklySlots.map(slot=>slot.day);
     pair.assignee=pair.weeklySlots[0].assignee;
    }
   }
   
   
   break;
  }
  case 'archiveTask': {
   const t=s.tasks.find(x=>x.id===a.id);if(t){t.active=false;t.archivedAt=a.date;}break;
  }
  case 'deleteTask': {
   // Permanent deletion of a template and every occurrence, including scores.
   // Do not inadvertently delete the linked cooking/washing-up template.
   const exists=s.tasks.some(t=>t.id===a.id);if(!exists)break;
   s.tasks=s.tasks.filter(t=>t.id!==a.id).map(t=>t.pairId===a.id?{...t,pairId:'',mealRole:'',mealKey:''}:t);
   for(const id of Object.keys(s.occurrences||{}))if(id.startsWith(a.id+'@'))delete s.occurrences[id];
   s.events=(s.events||[]).filter(ev=>ev.occId!==a.id&&!String(ev.occId||'').startsWith(a.id+'@'));
   break;
  }
  case 'activateManual': s.occurrences[a.id]={...s.occurrences[a.id],assignee:a.assignee,activated:true};break;
  case 'complete': {
   if(s.occurrences[a.id]?.done)break;
   s.occurrences[a.id]={...s.occurrences[a.id],done:{at:a.at,by:a.by,title:a.title,due:a.due,category:a.category,minutes:a.minutes}};break;
  }
  case 'uncomplete': {
   if(s.occurrences[a.id])delete s.occurrences[a.id].done;break;
  }
  case 'skip': s.occurrences[a.id]={...s.occurrences[a.id],skipped:true};break;
  case 'unskip': if(s.occurrences[a.id])delete s.occurrences[a.id].skipped;break;
  case 'reassign': {
   if(a.from===a.to)break;
   s.occurrences[a.id]={...s.occurrences[a.id],assignee:a.to};
   s.events.push({id:a.eventId,type:'reassign',occId:a.id,from:a.from,to:a.to,at:a.at,due:a.due});
   break;
  }
  case 'shoppingAdd': s.shopping.push(a.item);break;
  case 'shoppingToggle': {const x=s.shopping.find(i=>i.id===a.id);if(x)x.done=!x.done;break;}
  case 'shoppingDelete': s.shopping=s.shopping.filter(i=>i.id!==a.id);break;
  case 'shoppingClear': s.shopping=s.shopping.filter(i=>!i.done);break;
  case 'settings':s.settings={...s.settings,...a.settings};break;
  case 'reset':return makeSeed();
 }
 return s;
}
function nthWeekday(date,nth,day){const d=parseDate(date);const first=new Date(d.getFullYear(),d.getMonth(),1,12);const offset=(day-first.getDay()+7)%7;return 1+offset+7*(nth-1)===d.getDate();}
function isDue(t,date){
 const d=parseDate(date), wd=d.getDay();
 if(t.repeat==='weekly')return weeklySlots(t).some(slot=>slot.day===wd);
 if(t.repeat==='daily')return true;
 if(t.repeat==='monthly')return nthWeekday(date,Number(t.nth||1),(t.days||[6])[0]);
 if(t.repeat==='yearly')return d.getMonth()+1===Number(t.month||1)&&nthWeekday(date,Number(t.nth||2),(t.days||[6])[0]);
 if(t.repeat==='once')return t.dueDate===date;
 return false;
}
function makeOccurrence(t,date){const id=`${t.id}@${date}`;const o=state.occurrences[id]||{};return {id,task:t,date,title:t.title,category:t.category,assignee:o.assignee||ownerOn(t,date),done:o.done||null,skipped:!!o.skipped,late:Math.max(0,diffDays(date,today())),pairId:t.pairId};}
function occurrencesBetween(from,to,{includePast=false}={}){
 const list=[];
 for(const t of state.tasks){if(!t.active||t.repeat==='manual')continue;
  const start=includePast?from:[from,t.createdAt||state.startedAt].sort().pop();
  for(let d=start;d<=to;d=plusDays(d,1))if(isDue(t,d))list.push(makeOccurrence(t,d));
 }
 return list.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
}
function allUpTo(date=today()){
 const items=occurrencesBetween(state.startedAt||today(),date);
 for(const t of state.tasks.filter(t=>!t.active&&t.archivedAt)){
  for(let d=t.createdAt||state.startedAt;d<=date&&d<=t.archivedAt;d=plusDays(d,1))if(isDue(t,d))items.push(makeOccurrence(t,d));
 }
 for(const [id,entry] of Object.entries(state.occurrences)){
  if(!entry.activated)continue;
  const o=findOccurrence(id);
  if(o&&o.date<=date)items.push(o);
 }
 return items;
}
function activeTasks(){return state.tasks.filter(x=>x.active);}
function outstanding(){return allUpTo(today()).filter(x=>!x.done&&!x.skipped&&x.date<=today()).sort((a,b)=>a.date.localeCompare(b.date));}
// Ledger is the single source of truth for both the total score and its breakdown.
// Late tasks are penalized once (the day after their due date), not once per late day.
function score(){
 const points={Alicia:0,'José':0};
 const breakdown={Alicia:{onTime:0,late:0,reassign:0},'José':{onTime:0,late:0,reassign:0}};
 const ledger=[];
 const add=(person,type,pointsDelta,date,title,id)=>{
  if(!names.includes(person))return;
  points[person]+=pointsDelta;
  breakdown[person][type]++;
  ledger.push({person,type,points:pointsDelta,date,title,id});
 };
 for(const o of allUpTo(today())){
  if(o.skipped)continue;
  const completedDate=o.done?dateISO(new Date(o.done.at)):null;
  if(o.done&&completedDate<=o.date){
   add(o.done.by,'onTime',1,completedDate,o.done.title||o.title,o.id);
  }
  if(o.date<today()&&(!o.done||completedDate>o.date)){
   // If reassigned before/on the due date, the new owner bears the late penalty.
   const reassignments=state.events.filter(e=>e.type==='reassign'&&e.occId===o.id&&dateISO(new Date(e.at))<=o.date)
     .sort((a,b)=>a.at.localeCompare(b.at));
   const responsible=reassignments.length?reassignments[reassignments.length-1].to:ownerOn(o.task,o.date);
   add(responsible,'late',-1,plusDays(o.date,1),o.title,o.id);
  }
 }
 for(const ev of state.events.filter(x=>x.type==='reassign')){
  const t=state.tasks.find(t=>ev.occId===t.id||String(ev.occId||'').startsWith(t.id+'@'));
  add(ev.from,'reassign',-1,dateISO(new Date(ev.at)),t?.title||'Tarea reasignada',ev.occId);
 }
 ledger.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
 return {points,breakdown,ledger};
}

function icon(name){const icons={home:'⌂',week:'▦',tasks:'☷',shopping:'▣',points:'★',settings:'⚙',plus:'+',back:'‹',next:'›',bell:'♧'};return icons[name]||name;}
function usernameButtons(){return `<div class="segmented"><button data-user="Alicia" class="${currentUser==='Alicia'?'selected':''}">Alicia</button><button data-user="José" class="${currentUser==='José'?'selected':''}">José</button></div>`;}
function statusBadge(o){if(o.done)return `<span class="pill success">Hecha</span>`;if(o.skipped)return `<span class="pill muted">Omitida</span>`;if(o.late>0)return `<span class="pill warn">${o.late} ${o.late===1?'día':'días'} de retraso</span>`;return `<span class="pill neutral">${o.date===today()?'Hoy':pretty(o.date)}</span>`;}
function categorySymbol(category){return ({Cocina:'🍳',Platos:'🫧',Limpieza:'✨',Ropa:'🧺',Compra:'🛒',Planificación:'🗓️',Mantenimiento:'🪴'})[category]||'⭐';}
function cheerCard(mine,done){
 const due=mine.filter(o=>o.late===0).length;
 const late=mine.filter(o=>o.late>0).length;
 const achieved=done.length;
 const total=achieved+due+late;
 const pct=total?Math.round(achieved/total*100):100;
 const phrase=late>0?'¡Vamos a rescatar esos pendientes!':due===0?'¡Misión del día cumplida!':achieved===0?'Cada pequeño paso cuenta.':pct>=70?'¡La casa va viento en popa!':'¡Ya hay tareas tachadas!';
 const icon=late>0?'🧹':due===0?'🎉':pct>=70?'🚀':'🌼';
 return `<section class="cheer-card" aria-label="Progreso personal"><div class="cheer-head"><span class="cheer-icon" aria-hidden="true">${icon}</span><div><span class="cheer-overline">MINI MISIÓN DE ${esc(currentUser).toUpperCase()}</span><h2>${phrase}</h2><p>${achieved} de ${total} tareas resueltas hoy o pendientes</p></div><strong class="cheer-percent">${pct}%</strong></div><div class="cheer-track" role="progressbar" aria-label="Progreso personal" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div></section>`;
}
function celebrate(){
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const host=document.createElement('div');host.className='celebration';host.setAttribute('aria-hidden','true');
 const glyphs=['✦','★','●','✿','✧','◆'];
 for(let i=0;i<22;i++){
  const bit=document.createElement('span');bit.textContent=glyphs[i%glyphs.length];
  bit.style.setProperty('--x',`${5+(i*43)%90}%`);
  bit.style.setProperty('--delay',`${(i%7)*42}ms`);
  bit.style.setProperty('--drift',`${(i%2?-1:1)*(22+(i*13)%65)}px`);
  bit.style.setProperty('--c',['#e9ad4d','#ef889b','#76b7b0','#a39ce3','#76aa74'][i%5]);
  host.append(bit);
 }
 document.body.append(host);setTimeout(()=>host.remove(),1700);
}
function itemHTML(o,{editable=true}={}){
 const done=!!o.done, skipped=o.skipped;
 return `<article class="task-card ${done?'is-done':''} ${o.late&&!done&&!skipped?'is-late':''}">
 <button class="check ${done?'checked':''}" data-act="${done?'uncomplete':'complete'}" data-id="${esc(o.id)}" aria-label="${done?'Desmarcar':'Completar'} tarea">${done?'✓':''}</button>
 <div class="task-main"><div class="task-name"><span class="task-emoji" aria-hidden="true">${categorySymbol(o.category)}</span>${esc(o.title)}</div><div class="task-meta"><span>${esc(o.category)}</span><span>·</span><span>${formatMinutes(occurrenceMinutes(o))}</span><span>·</span><span>${esc(o.assignee)}</span><span>·</span><span>${pretty(o.date)}</span></div>${statusBadge(o)}</div>
 ${editable&&!done&&!skipped?`<button class="dots" aria-label="Opciones de tarea" data-act="options" data-id="${esc(o.id)}">···</button>`:''}
 </article>`;
}
function heading(t,sub='',action=''){return `<div class="page-heading"><div><h1>${t}</h1>${sub?`<p>${sub}</p>`:''}</div>${action}</div>`;}
function todayPoints(){
 const p=score();
 const reason={onTime:'Completada a tiempo',late:'Fuera de plazo',reassign:'Tarea reasignada'};
 const totals=names.map(n=>{
  const b=p.breakdown[n];
  return `<div class="points-detail-person"><h3>${esc(n)}</h3><div><span>Completadas a tiempo</span><strong class="good">+${b.onTime}</strong></div><div><span>Retrasos</span><strong class="bad">−${b.late}</strong></div><div><span>Reasignaciones</span><strong class="bad">−${b.reassign}</strong></div><div class="points-detail-total"><span>Total</span><strong>${p.points[n]>0?'+':''}${p.points[n]}</strong></div></div>`;
 }).join('');
 const events=p.ledger.slice(0,40);
 const history=events.map(ev=>`<div class="points-event"><span class="points-event-delta ${ev.points>0?'good':'bad'}">${ev.points>0?'+':''}${ev.points}</span><div><strong>${esc(ev.title)}</strong><small>${esc(ev.person)} · ${esc(reason[ev.type])} · ${pretty(ev.date)}</small></div></div>`).join('');
 return `<section class="today-points" aria-label="Marcador de puntos"><div class="points-sparkle" aria-hidden="true">✦</div><div class="today-points-head"><h2>🏆 Nuestro marcador</h2><small>+1 a tiempo · −1 retraso o reasignación</small></div><div class="today-points-grid">${names.map(n=>`<div class="today-points-person ${currentUser===n?'highlight':''}"><span>${esc(n)}</span><strong>${p.points[n]>0?'+':''}${p.points[n]||0}</strong></div>`).join('')}</div></section>
 <details class="points-details"><summary>Ver desglose e historial de puntos <span aria-hidden="true">⌄</span></summary><div class="points-detail-content"><div class="points-detail-grid">${totals}</div><h3 class="points-history-title">Últimos movimientos</h3>${history||'<p class="points-history-empty">Aún no hay movimientos de puntos.</p>'}${p.ledger.length>40?`<p class="points-history-empty">Mostrando los 40 movimientos más recientes de ${p.ledger.length}.</p>`:''}<p class="points-history-note">Cada retraso resta una sola vez por repetición. Una tarea terminada tarde no suma punto positivo. Los puntos y los minutos de trabajo son métricas diferentes.</p></div></details>`;
}
function viewToday(){const mine=outstanding().filter(o=>o.assignee===currentUser);const late=mine.filter(o=>o.late>0),fresh=mine.filter(o=>o.late===0);const done=allUpTo(today()).filter(o=>o.done&&dateISO(new Date(o.done.at))===today()&&o.done.by===currentUser);
 return `${heading('Mi día',new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))}
 <section class="user-select"><span>Estoy viendo las tareas de</span>${usernameButtons()}</section>
 ${todayPoints()}
 ${cheerCard(mine,done)}
 <div class="stat-row"><div class="stat"><b>${fresh.length}</b><span>Para hoy</span></div><div class="stat"><b>${late.length}</b><span>Atrasadas</span></div><div class="stat"><b>${done.length}</b><span>Hechas hoy</span></div></div>
 ${late.length?`<div class="section-label"><h2>🧹 Rescates pendientes</h2><span class="warning-text">${late.length} por resolver</span></div><div class="task-list">${late.map(o=>itemHTML(o)).join('')}</div>`:''}
 <div class="section-label"><h2>✨ Misiones de hoy</h2><span>${fresh.length} pendientes</span></div>
 <div class="task-list">${fresh.length?fresh.map(o=>itemHTML(o)).join(''):`<div class="empty"><div class="empty-icon">🎉</div><strong>¡Todo al día!</strong><p>No hay tareas pendientes para ${esc(currentUser)}.</p></div>`}</div>
 <div class="section-label"><h2>🌟 Misiones completadas</h2><button class="link-button" data-act="toggleDone">${showDone?'Ocultar':'Mostrar'} (${done.length})</button></div>
 ${showDone?`<div class="task-list">${done.map(o=>itemHTML(o,{editable:false})).join('')||'<div class="empty small">Aún no hay tareas completadas.</div>'}</div>`:''}`;
}
function repeatLabel(t){if(t.repeat==='daily')return 'Diaria';if(t.repeat==='weekly')return weeklySlots(t).length+'× semana · '+weeklySlots(t).map(slot=>shortdays[slot.day]+' ('+slot.assignee+')').join(', ');if(t.repeat==='monthly')return `Mensual · ${t.nth}º ${shortdays[(t.days||[6])[0]]}`;if(t.repeat==='yearly')return `Anual · ${t.nth}º ${shortdays[(t.days||[6])[0]]} de ${new Date(2026,t.month-1,1).toLocaleDateString('es-ES',{month:'long'})}`;if(t.repeat==='once')return `Puntual · ${pretty(t.dueDate)}`;return 'Según necesidad';}
function viewTasks(){const tasks=activeTasks().filter(t=>taskFilter==='Todas'||t.category===taskFilter).sort((a,b)=>a.category.localeCompare(b.category)||a.title.localeCompare(b.title));
 return `${heading('Todas las tareas','Pulsa Editar → Repetición: Semanal → Veces por semana (1 a 7)',`<button class="button primary" data-act="newTask">+ Nueva</button>`)}
 <div class="filter-strip">${['Todas',...cats].map(c=>`<button class="filter ${taskFilter===c?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
 <div class="task-directory">${tasks.map(t=>`<article class="directory-card"><div><span class="category">${esc(t.category)}</span><h3>${esc(t.title)}</h3><p>${esc(t.assignee)} · ${esc(repeatLabel(t))} · ${formatMinutes(minutes(t))}</p></div><div class="directory-actions">${t.repeat==='manual'?`<button class="edit-button manual" data-act="manualAdd" data-id="${esc(t.id)}">Hacer hoy</button>`:''}<button class="edit-button" data-act="editTask" data-id="${esc(t.id)}" aria-label="Editar ${esc(t.title)}">Editar</button><button class="edit-button" data-act="deleteTask" data-id="${esc(t.id)}" aria-label="Eliminar ${esc(t.title)}">Eliminar</button></div></article>`).join('')}</div>
 <p class="hint">Las habitaciones personales quedan fuera del planning. Los cambios de responsable en una tarea de cocina actualizan también su tarea vinculada de recogida.</p>`;
}
function viewShopping(){const list=[...state.shopping].sort((a,b)=>Number(a.done)-Number(b.done));const undone=list.filter(x=>!x.done).length;
 return `${heading('Lista de la compra','Compartida entre Alicia y José')}<form class="shopping-form" id="shoppingForm"><input name="product" maxlength="100" required placeholder="Añadir producto…" aria-label="Producto"><input name="quantity" maxlength="35" placeholder="Cantidad" aria-label="Cantidad"><button class="button primary" type="submit">Añadir</button></form>
 <div class="section-label"><h2>Productos</h2><span>${undone} pendientes</span></div>
 <div class="shopping-list">${list.length?list.map(i=>`<div class="shopping-item ${i.done?'bought':''}"><button class="check ${i.done?'checked':''}" data-act="shoppingToggle" data-id="${esc(i.id)}" aria-label="Marcar comprado">${i.done?'✓':''}</button><div><strong>${esc(i.name)}</strong>${i.quantity?`<small>${esc(i.quantity)}</small>`:''}</div><button class="dots" data-act="shoppingDelete" data-id="${esc(i.id)}" aria-label="Eliminar producto">×</button></div>`).join(''):`<div class="empty"><div class="empty-icon">▣</div><strong>Lista vacía</strong><p>Añade lo que haga falta comprar.</p></div>`}</div>
 ${list.some(x=>x.done)?`<button class="button light wide" data-act="shoppingClear">Eliminar productos comprados</button>`:''}`;
}
function overviewStats(){
 const end=today();
 const from=overviewRange==='month'?plusDays(end,-27):overviewRange==='all'?(state.startedAt||end):weekStart(end);
 const os=allUpTo(end).filter(o=>o.date>=from && o.date<=end && !o.skipped);
 const stats=Object.fromEntries(names.map(n=>[n,{assigned:0,completed:0,pending:0,overdue:0,onTime:0,categories:{}}]));
 for(const o of os){
  const owner=stats[o.assignee];
  if(owner){owner.assigned++;owner.categories[o.category]=(owner.categories[o.category]||0)+1;if(!o.done){owner.pending++;if(o.date<end)owner.overdue++;}}
  if(o.done && stats[o.done.by]){stats[o.done.by].completed++;if(dateISO(new Date(o.done.at))<=o.date)stats[o.done.by].onTime++;}
 }
 const backlog=Object.fromEntries(names.map(n=>[n,outstanding().filter(o=>o.assignee===n&&o.date<from).length]));
 return {from,end,os,stats,backlog};
}
function splitBar(a,b){const total=a+b;return `<div class="split-bar" role="img" aria-label="Alicia ${a}, José ${b}"><span style="width:${total?100*a/total:50}%"></span><span style="width:${total?100*b/total:50}%"></span></div>`;}
function weeklyMiniTask(o){
 const status=o.done?'Hecha':o.skipped?'Omitida':o.date<today()?`${diffDays(o.date,today())}d tarde`:o.date===today()?'Hoy':'Programada';
 return `<div class="weekly-mini ${o.done?'done':''} ${!o.done&&!o.skipped&&o.date<today()?'late':''}">
 <button class="check ${o.done?'checked':''}" data-act="${o.done?'uncomplete':'complete'}" data-id="${esc(o.id)}" aria-label="${o.done?'Desmarcar':'Completar'} ${esc(o.title)}">${o.done?'✓':''}</button>
 <div class="weekly-mini-body"><span class="weekly-mini-title">${esc(o.title)}</span><small>${esc(o.category)} · ${formatMinutes(occurrenceMinutes(o))} · ${status}</small></div>
 ${!o.done&&!o.skipped?`<button class="weekly-options" data-act="options" data-id="${esc(o.id)}" aria-label="Reasignar u omitir tarea">···</button>`:''}</div>`;
}
function viewOverview(){
 const start=selectedWeek,end=plusDays(start,6),days=Array.from({length:7},(_,i)=>plusDays(start,i));
 const os=occurrencesBetween(start,end,{includePast:true}).filter(o=>!o.skipped);
 const counts=Object.fromEntries(names.map(n=>[n,{assigned:0,done:0,late:0,load:0,finished:0,remaining:0}]));
 for(const o of os){
  const n=counts[o.assignee];if(!n)continue;
  const units=occurrenceMinutes(o);n.assigned++;n.load+=units;
  if(o.done){n.done++;}else{n.remaining+=units;if(o.date<today())n.late++;}
  if(o.done&&counts[o.done.by])counts[o.done.by].finished+=units;
 }
 const a=counts.Alicia,j=counts['José'],completed=os.filter(o=>o.done).length;
 const total=a.load+j.load;
 const pct=n=>total?Math.round(100*n/total):50;
 const backlogs=start<=today()?outstanding().filter(o=>o.date<start):[];
 const backlogUnits=Object.fromEntries(names.map(n=>[n,backlogs.filter(o=>o.assignee===n).reduce((sum,o)=>sum+occurrenceMinutes(o),0)]));
 return `${heading('Semana en equipo','¡La casa se lleva entre dos! · Reparto por minutos')}
 <section class="week-control"><button data-act="weekPrev" aria-label="Semana anterior">‹</button><strong>${pretty(start)} — ${pretty(end)}</strong><button data-act="weekNext" aria-label="Semana siguiente">›</button><button class="btn-plain" data-act="weekNow">Hoy</button></section>
 <section class="overview-panel weekly-summary"><div class="section-label"><h2>⏱️ Nuestro reparto semanal</h2><span>${completed}/${os.length} hechas</span></div>
 ${splitBar(a.load,j.load)}
 <div class="effort-percentages"><strong>Alicia ${pct(a.load)}%</strong><strong>José ${pct(j.load)}%</strong></div>
 <div class="weekly-totals"><div><span class="weekly-name"><i class="legend-a"></i>Alicia</span><b>${formatMinutes(a.load)} asignados</b><small>${a.assigned} tareas · ${formatMinutes(a.finished)} hechos · ${formatMinutes(a.remaining)} pendientes</small><small>${a.late} atrasadas</small></div><div><span class="weekly-name"><i class="legend-j"></i>José</span><b>${formatMinutes(j.load)} asignados</b><small>${j.assigned} tareas · ${formatMinutes(j.finished)} hechos · ${formatMinutes(j.remaining)} pendientes</small><small>${j.late} atrasadas</small></div></div>
 <p class="hint">El porcentaje compara los <strong>minutos activos estimados asignados esta semana</strong>, no el número de tareas. El tiempo realizado se atribuye a quien completa la tarea. Los ciclos automáticos de lavadora y robot no cuentan. Las pendientes anteriores se muestran aparte.</p></section>
 ${backlogs.length?`<section class="weekly-backlog"><div class="section-label"><h2>Arrastradas de semanas anteriores</h2><span class="warning-text">Alicia ${formatMinutes(backlogUnits.Alicia)} · José ${formatMinutes(backlogUnits['José'])} pendientes</span></div><div class="weekly-backlog-list">${backlogs.map(weeklyMiniTask).join('')}</div></section>`:''}
 <div class="weekly-days">${days.map(date=>{const dayOS=os.filter(o=>o.date===date),d=parseDate(date);return `<section class="weekly-day ${date===today()?'current':''}"><div class="weekly-day-head"><h2>${weekdays[d.getDay()]} <span>${pretty(date)}</span></h2><span>${dayOS.filter(o=>o.done).length}/${dayOS.length} hechas</span></div><div class="weekly-columns">${names.map(person=>{const mine=dayOS.filter(o=>o.assignee===person);const units=mine.reduce((sum,o)=>sum+occurrenceMinutes(o),0);return `<div class="weekly-person"><div class="weekly-person-title"><span class="avatar ${person==='José'?'jose':''}">${person[0]}</span><strong>${person}</strong><small>${formatMinutes(units)}</small></div>${mine.length?mine.map(weeklyMiniTask).join(''):'<p class="weekly-none">Sin tareas</p>'}</div>`;}).join('')}</div></section>`;}).join('')}</div>
 `;
}
function viewPoints(){const p=score();const rows=names.map(n=>({name:n,score:p.points[n]||0,...p.breakdown[n]})).sort((a,b)=>b.score-a.score);
 return `${heading('Puntos','Cumplimiento y responsabilidad compartida')}<div class="score-hero"><span class="eyebrow">Marcador actual</span><div class="score-grid">${rows.map((x,i)=>`<div class="score-person"><div class="score-avatar ${x.name==='José'?'jose':''}">${x.name[0]}</div><span>${x.name}</span><strong>${x.score>0?'+':''}${x.score}</strong></div>`).join('')}</div></div>
 <div class="section-label"><h2>Desglose</h2></div><div class="breakdown">${rows.map(x=>`<article><h3>${x.name}</h3><div><span>Completadas a tiempo</span><b class="good">+${x.onTime}</b></div><div><span>Retrasos</span><b class="bad">−${x.late}</b></div><div><span>Reasignaciones</span><b class="bad">−${x.reassign}</b></div></article>`).join('')}</div>
 <div class="info"><strong>Reglas</strong><p>+1 por tarea completada dentro de plazo. −1 por tarea atrasada (una sola vez por ocurrencia). −1 a quien cede una tarea al reasignarla. Las tareas realizadas fuera de plazo no suman punto positivo. Las tareas omitidas se excluyen del marcador.</p></div>`;
}
function viewSettings(){return `${heading('Ajustes','Preferencias de vuestro hogar')}<div class="settings-card"><h2>Acceso</h2><p>Perfil activo</p>${usernameButtons()}<div class="setting-row"><div><b>Almacenamiento</b><small>${cloudReady?'Firebase · sincronizado':'Local · solo este dispositivo'}</small></div><span class="dot ${cloudReady?'connected':''}"></span></div>${cloudReady?'<button class="button light" data-act="logout">Cerrar sesión compartida</button>':'<p class="hint">Para compartir datos entre dos iPhone, configura Firebase siguiendo README.md.</p>'}</div>
 <div class="settings-card"><h2>Proteger tus datos</h2><p>Antes de migrar a Firebase, guarda una copia de las tareas que tenías en este dispositivo. Esta copia se creó antes de la primera sincronización con esta versión y no se borra al conectarse.</p><button class="button light wide" data-act="downloadLocalBackup">Descargar copia local (.json)</button><p class="hint">La copia descargada no se sube automáticamente a Firebase. Consérvala hasta verificar qué tareas hay en la nube.</p></div><div class="settings-card"><h2>Recordatorios</h2><p>La aplicación puede avisar de tareas pendientes cuando está abierta. Los avisos en segundo plano requieren configurar un servicio push adicional.</p><label class="toggle-row"><span>Activar avisos en la app</span><input id="reminders" type="checkbox" ${state.settings.reminders?'checked':''}></label><label class="toggle-row"><span>Hora del recordatorio</span><input type="time" id="reminderTime" value="${esc(state.settings.reminderTime||'19:00')}"></label><button class="button light" data-act="requestNotify">Permitir notificaciones</button></div>
 <div class="info"><strong>Sobre el reparto</strong><p>Las tareas personales no están incluidas. El robot funciona automáticamente y solo se programa su limpieza semanal. Las comidas de fin de semana no se asignan.</p></div>`;}
const icons={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h3M15 14h2"/>',
 list:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 9 1.5 1.5L11 8M13 9h5m-11 6 1.5 1.5L11 14m2 1h5"/>',
 cart:'<path d="M3 4h2l2.2 11h11.4l2-8H6M9 20h.01M18 20h.01"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
 settings:'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="m19.4 15 .8 1.4-2 2-.9-.5a2 2 0 0 0-2.8 1.1l-.3 1H10l-.3-1a2 2 0 0 0-2.8-1.1l-.9.5-2-2 .8-1.4a2 2 0 0 0 0-2l-.8-1.4 2-2 .9.5a2 2 0 0 0 2.8-1.1l.3-1h4.2l.3 1a2 2 0 0 0 2.8 1.1l.9-.5 2 2-.8 1.4a2 2 0 0 0 0 2Z" transform="translate(0 -2)"/>',
};
function svgIcon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.home}</svg>`;}
const navItems=[['today','Hoy','home'],['overview','Semana global','calendar'],['tasks','Tareas','list'],['shopping','Compra','cart'],['settings','Ajustes','settings']];
function modalHTML(){if(!modal)return '';
 if(modal.kind==='options'){const o=findOccurrence(modal.id);if(!o)return '';
 return `<div class="overlay" data-act="closeModal"><div class="sheet" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${esc(o.title)}</h2><p class="muted">${esc(o.assignee)} · Vencimiento: ${pretty(o.date)}${o.late?` · ${o.late} día(s) tarde`:''}</p><div class="field"><label>Reasignar esta repetición a</label><select id="assignTo"><option value="Alicia" ${o.assignee==='Alicia'?'selected':''}>Alicia</option><option value="José" ${o.assignee==='José'?'selected':''}>José</option></select></div><button class="button primary wide" data-act="saveAssignment" data-id="${esc(o.id)}">Guardar responsable (−1 al anterior)</button>${o.pairId?'<p class="hint">Si esta tarea es de cocina o recogida, también se actualizará su pareja de ese día para respetar la regla.</p>':''}<button class="button light wide" data-act="skip" data-id="${esc(o.id)}">Omitir esta repetición (no puntúa)</button><button class="button text wide" data-act="closeModal">Cancelar</button></div></div>`;
 }
 const t=modal.kind==='edit'?state.tasks.find(x=>x.id===modal.id):null;const v=t||newTask('','Limpieza',currentUser,parseDate(today()).getDay());
 const slots=weeklySlots(v);const slotCount=Math.min(7,Math.max(1,slots.length));
 const weeklyFields=`<div id="weeklySlots" class="weekly-slot-panel" style="${v.repeat==='weekly'?'':'display:none'}"><label>Veces por semana<select name="weeklyCount" id="weeklyCount">${[1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${n===slotCount?'selected':''}>${n} ${n===1?'vez':'veces'}</option>`).join('')}</select></label><p class="hint">Elige un día diferente y quién hace cada repetición. Son tareas independientes.</p>${[0,1,2,3,4,5,6].map(i=>`<div class="weekly-slot-row" data-slot-row="${i}" style="${i<slotCount?'':'display:none'}"><strong>Repetición ${i+1}</strong><div class="two-col"><label>Día<select name="slotDay${i}">${weekdays.map((d,n)=>`<option value="${n}" ${n===(slots[i]?.day??[1,2,3,4,5,6,0][i])?'selected':''}>${d}</option>`).join('')}</select></label><label>Responsable<select name="slotOwner${i}">${names.map(n=>`<option value="${n}" ${n===(slots[i]?.assignee||v.assignee)?'selected':''}>${n}</option>`).join('')}</select></label></div></div>`).join('')}</div>`;
 return `<div class="overlay" data-act="closeModal"><div class="sheet edit-sheet" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${t?'Editar tarea':'Nueva tarea'}</h2><form id="taskForm" class="form-fields"><label>Nombre<input name="title" maxlength="120" required value="${esc(v.title)}" placeholder="Nombre de la tarea"></label><div class="two-col"><label>Categoría<select name="category">${cats.map(c=>`<option ${v.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Responsable<select name="assignee">${names.map(n=>`<option ${v.assignee===n?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="two-col"><label>Repetición<select name="repeat" id="taskRepeat">${[['weekly','Semanal'],['daily','Diaria'],['monthly','Mensual'],['yearly','Anual'],['once','Una vez'],['manual','Según necesidad']].map(([key,text])=>`<option value="${key}" ${v.repeat===key?'selected':''}>${text}</option>`).join('')}</select></label><label>Día habitual<select name="day">${weekdays.map((d,i)=>`<option value="${i}" ${(v.days||[1])[0]===i?'selected':''}>${d}</option>`).join('')}</select></label></div>${weeklyFields}<div class="two-col"><label>Semana del mes<select name="nth">${[1,2,3,4].map(x=>`<option value="${x}" ${Number(v.nth)===x?'selected':''}>${x}ª</option>`).join('')}</select></label><label>Mes (si es anual)<select name="month">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${Number(v.month)===i+1?'selected':''}>${new Date(2026,i,1).toLocaleDateString('es-ES',{month:'long'})}</option>`).join('')}</select></label></div><label>Tiempo activo estimado (minutos)<input type="number" name="minutes" min="1" max="1440" step="1" required value="${minutes(v)}"></label><label>Fecha (si es puntual)<input type="date" name="dueDate" value="${esc(v.dueDate||today())}"></label><label>Notas<textarea name="notes" rows="2">${esc(v.notes||'')}</textarea></label><button class="button primary wide" type="submit">${t?'Guardar cambios':'Crear tarea'}</button></form>${t?`<button class="button danger wide" data-act="archiveTask" data-id="${esc(t.id)}">Archivar tarea</button><button class="button danger wide" data-act="deleteTask" data-id="${esc(t.id)}">Eliminar definitivamente</button>`:''}<button class="button text wide" data-act="closeModal">Cancelar</button><p class="hint">Diaria: todos los días. Semanal: 1-7 días independientes con responsable propio. Mensual: n.º día de semana. Anual: mes y n.º día de semana. Puntual: fecha concreta.</p></div></div>`;
}
function render(){
 if(cloud && !cloudReady){renderLogin();return;}
 const content={today:viewToday,tasks:viewTasks,shopping:viewShopping,overview:viewOverview,settings:viewSettings}[tab]();
 el.innerHTML=`<div class="shell"><header class="topbar"><div class="brand"><div class="brand-logo">${svgIcon('home')}</div><div><strong>Nuestro Hogar</strong><span>Alicia & José · v9.1</span></div></div><div class="top-right"><span class="sync-status ${cloudReady?'online':''}" title="${cloudReady?'Sincronización conectada':'Modo local'}"></span><button class="profile-dot ${currentUser==='José'?'jose':''}" data-act="switchUser" aria-label="Cambiar usuario">${currentUser[0]}</button></div></header><main>${content}</main><nav class="bottom-nav">${navItems.map(([key,label,glyph])=>`<button data-tab="${key}" class="${tab===key?'active':''}"><span class="nav-icon">${svgIcon(glyph)}</span><span>${label}</span></button>`).join('')}</nav></div><div id="toast" class="toast" role="status"></div>${modalHTML()}`;
}
function findOccurrence(id){const at=id.lastIndexOf('@');if(at===-1)return null;const t=state.tasks.find(x=>x.id===id.slice(0,at));if(!t)return null;return makeOccurrence(t,id.slice(at+1));}
function reassignOccurrence(o,to){if(o.assignee===to)return;const at=new Date().toISOString();mutate({type:'reassign',id:o.id,from:o.assignee,to,at,due:o.date,eventId:uid()});
 // Las tareas de cocina y fregado del mismo turno siempre tienen propietarios opuestos.
 if(o.task.pairId){const other=state.tasks.find(t=>t.id===o.task.pairId);if(other){const pair=findOccurrence(`${other.id}@${o.date}`);if(pair&&!pair.done&&!pair.skipped){const opposite=to==='Alicia'?'José':'Alicia';if(pair.assignee!==opposite)mutate({type:'reassign',id:pair.id,from:pair.assignee,to:opposite,at:new Date().toISOString(),due:pair.date,eventId:uid()});}}}
}
function handleClick(e){const btn=e.target.closest('button,[data-act],[data-tab],[data-user],[data-filter],[data-day]');if(!btn)return;
 if(btn.dataset.tab){tab=btn.dataset.tab;render();return;}
 if(btn.dataset.range){overviewRange=btn.dataset.range;render();return;}
 if(btn.dataset.user){currentUser=btn.dataset.user;localStorage.setItem('hogar_user',currentUser);render();return;}
 if(btn.dataset.filter){taskFilter=btn.dataset.filter;render();return;}
 if(btn.dataset.day){selectedDay=btn.dataset.day;render();return;}
 const action=btn.dataset.act,id=btn.dataset.id;
 switch(action){
  case 'switchUser':currentUser=currentUser==='Alicia'?'José':'Alicia';localStorage.setItem('hogar_user',currentUser);render();break;
  case 'weekPrev':selectedWeek=plusDays(selectedWeek,-7);selectedDay=selectedWeek;render();break;
  case 'weekNext':selectedWeek=plusDays(selectedWeek,7);selectedDay=selectedWeek;render();break;
  case 'weekNow':selectedWeek=weekStart(today());selectedDay=today();render();break;
  case 'toggleDone':showDone=!showDone;render();break;
  case 'complete':{const o=findOccurrence(id);if(o&&!o.done){mutate({type:'complete',id,at:new Date().toISOString(),by:o.assignee,title:o.title,due:o.date,category:o.category,minutes:occurrenceMinutes(o)});if(!o.late)celebrate();toast(o.late?'¡Hecha! Un pendiente menos 🧹':'¡Misión cumplida! +1 punto ✨');}break;}
  case 'uncomplete':if(confirm('¿Desmarcar esta tarea como completada?'))mutate({type:'uncomplete',id});break;
  case 'options':modal={kind:'options',id};render();break;
  case 'closeModal':modal=null;render();break;
  case 'saveAssignment':{const o=findOccurrence(id),to=$('#assignTo')?.value;if(o&&to){reassignOccurrence(o,to);modal=null;render();toast('Responsable actualizado.');}break;}
  case 'skip':if(confirm('¿Omitir esta repetición sin puntuar?')){mutate({type:'skip',id});modal=null;render();}break;
  case 'manualAdd':{const t=state.tasks.find(t=>t.id===id);if(t){const iid=`${t.id}@${today()}`;if(state.occurrences[iid]?.done){toast('Ya se ha completado hoy.');}else{mutate({type:'activateManual',id:iid,assignee:t.assignee});tab='today';render();toast('Tarea añadida para hoy.');}}break;}
  case 'newTask':modal={kind:'new'};render();break;
  case 'editTask':modal={kind:'edit',id};render();break;
  case 'archiveTask':if(confirm('¿Archivar esta tarea? Dejará de aparecer en el planning futuro.')){mutate({type:'archiveTask',id,date:today()});modal=null;render();}break;
  case 'deleteTask': {
   const t=state.tasks.find(x=>x.id===id);if(!t)break;
   const warning=`¿Eliminar definitivamente «${t.title}»?\n\nSe borrarán todas sus repeticiones (pasadas, actuales y futuras), sus registros de finalización y sus penalizaciones/puntos asociados. No se puede deshacer.\n\nSi solo quieres que deje de programarse, utiliza Archivar.\n\n${t.pairId?'La tarea vinculada de cocina/recogida se conservará, pero quedará desvinculada.\n\n':''}¿Confirmas la eliminación?`;
   if(confirm(warning)){mutate({type:'deleteTask',id});modal=null;render();toast('Tarea eliminada definitivamente.');}
   break;
  }
  case 'shoppingToggle':mutate({type:'shoppingToggle',id});break;
  case 'shoppingDelete':mutate({type:'shoppingDelete',id});break;
  case 'shoppingClear':mutate({type:'shoppingClear'});break;
  case 'requestNotify':if('Notification' in window){Notification.requestPermission().then(p=>toast(p==='granted'?'Notificaciones permitidas.':'No se concedió permiso.'));}else toast('Este navegador no ofrece notificaciones.');break;
  case 'downloadLocalBackup':downloadLocalBackup();break;
  case 'logout':if(cloud)cloud.api.signOut(cloud.auth);break;
 }
}
function handleSubmit(e){if(e.target.id==='shoppingForm'){e.preventDefault();const f=new FormData(e.target);const name=String(f.get('product')||'').trim();if(name){mutate({type:'shoppingAdd',item:{id:uid(),name,quantity:String(f.get('quantity')||'').trim(),done:false}});toast('Producto añadido.');}return;}
 if(e.target.id==='taskForm'){e.preventDefault();const f=new FormData(e.target);const title=String(f.get('title')||'').trim();if(!title)return;
 const prev=modal?.kind==='edit'?state.tasks.find(x=>x.id===modal.id):null;
 const t=prev?{...prev}:newTask(title,String(f.get('category')),String(f.get('assignee')),Number(f.get('day')));
 Object.assign(t,{title,category:String(f.get('category')),assignee:String(f.get('assignee')),repeat:String(f.get('repeat')),days:[Number(f.get('day'))],nth:Number(f.get('nth')),month:Number(f.get('month')),dueDate:String(f.get('dueDate')),minutes:Math.max(1,Math.min(1440,Math.round(Number(f.get('minutes'))||1))),notes:String(f.get('notes')||'')});
 if(t.repeat==='weekly'){
  const count=Math.max(1,Math.min(7,Number(f.get('weeklyCount'))||1));
  const slots=Array.from({length:count},(_,i)=>({day:Number(f.get('slotDay'+i)),assignee:String(f.get('slotOwner'+i))}));
  if(new Set(slots.map(x=>x.day)).size!==slots.length){toast('Elige días diferentes para cada repetición.');return;}
  if(slots.some(x=>!Number.isInteger(x.day)||x.day<0||x.day>6||!names.includes(x.assignee))){toast('Revisa los días y responsables.');return;}
  t.weeklySlots=slots;t.days=slots.map(x=>x.day);t.assignee=slots[0].assignee;
 }else{delete t.weeklySlots;}
 mutate({type:prev?'editTask':'addTask',task:t});modal=null;render();toast(prev?'Tarea actualizada.':'Tarea creada.');return;}
 if(e.target.id==='loginForm'){e.preventDefault();const f=new FormData(e.target);const email=String(f.get('email')||'');const pass=String(f.get('password')||'');const b=$('#loginButton');if(b)b.disabled=true;
 cloud.api.signInWithEmailAndPassword(cloud.auth,email,pass).catch(err=>{const div=$('#loginError');if(div)div.textContent='No se pudo iniciar sesión. Comprueba correo, contraseña y Firebase Authentication.';if(b)b.disabled=false;});return;}
}
function handleChange(e){
 if(e.target.id==='taskRepeat'){
  const panel=$('#weeklySlots');if(panel)panel.style.display=e.target.value==='weekly'?'':'none';
 }
 if(e.target.id==='weeklyCount'){
  const count=Number(e.target.value);
  document.querySelectorAll('[data-slot-row]').forEach(row=>row.style.display=Number(row.dataset.slotRow)<count?'':'none');
 }
 if(e.target.id==='reminders'){mutate({type:'settings',settings:{reminders:e.target.checked}});if(e.target.checked)runReminders();}
 if(e.target.id==='reminderTime')mutate({type:'settings',settings:{reminderTime:e.target.value}});
}
el.addEventListener('click',handleClick);el.addEventListener('submit',handleSubmit);el.addEventListener('change',handleChange);
function runReminders(){if(!state.settings.reminders)return;const now=new Date();const hhmm=now.toTimeString().slice(0,5);if(hhmm<(state.settings.reminderTime||'19:00'))return;
 const key=`hogar_notify_${today()}_${currentUser}`;if(localStorage.getItem(key))return;const pending=outstanding().filter(o=>o.assignee===currentUser);if(!pending.length)return;
 localStorage.setItem(key,'1');if('Notification' in window && Notification.permission==='granted')new Notification('Nuestro Hogar',{body:`${currentUser}: tienes ${pending.length} tarea(s) pendiente(s).`,icon:'./icons/icon-192.png'});
 else toast(`Tienes ${pending.length} tareas pendientes hoy.`);
}
function renderLogin(){el.innerHTML=`<div class="login-page"><div class="login-card"><div class="big-logo">⌂</div><h1>Nuestro Hogar</h1><p>Acceso compartido de Alicia y José</p><form id="loginForm"><label>Correo compartido<input name="email" type="email" autocomplete="username" required placeholder="correo@ejemplo.com"></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" required placeholder="••••••••"></label><button id="loginButton" class="button primary wide" type="submit">Entrar</button><div id="loginError" class="login-error" role="alert"></div></form><p class="hint">El selector Alicia/José aparece después de entrar. Este acceso compartido es intencional; no ofrece identidades separadas.</p></div></div>`;}
async function initCloud(){if(!window.HOGAR_FIREBASE_CONFIG?.apiKey){render();return;}
 try{
  const ver='11.10.0';
  const [fb,authModule,fs]=await Promise.all([import(`https://www.gstatic.com/firebasejs/${ver}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${ver}/firebase-auth.js`),import(`https://www.gstatic.com/firebasejs/${ver}/firebase-firestore.js`)]);
  const app=fb.initializeApp(window.HOGAR_FIREBASE_CONFIG);const auth=authModule.getAuth(app);const db=fs.getFirestore(app);
  cloud={api:{...authModule,...fs},auth,db,docRef:null};renderLogin();
  authModule.onAuthStateChanged(auth,async user=>{
   if(unsubscribe){unsubscribe();unsubscribe=null;}
   if(!user){cloudReady=false;renderLogin();return;}
   cloud.docRef=fs.doc(db,'households',user.uid,'state','main');
   try{const snap=await fs.getDoc(cloud.docRef);if(!snap.exists())await fs.setDoc(cloud.docRef,makeSeed());
    else if(!snap.data().minutesMigrationV5)await fs.runTransaction(db,async tx=>{const current=await tx.get(cloud.docRef);if(current.exists()&&!current.data().minutesMigrationV5)tx.set(cloud.docRef,migrateToMinutes(current.data()));});
    unsubscribe=fs.onSnapshot(cloud.docRef,snap=>{if(snap.exists()){state=migrateToMinutes(snap.data());storeLocal();cloudReady=true;render();}},err=>{console.error(err);toast('Error de sincronización de Firebase.');});
   }catch(err){console.error(err);cloudReady=false;renderLogin();const error=$('#loginError');if(error)error.textContent='No se puede acceder a Firestore. Revisa las reglas del proyecto.';}
  });
 }catch(err){console.error(err);render();setTimeout(()=>toast('No se pudo cargar Firebase; se mantiene la copia local.'),500);}
}
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js?v=9.1', {updateViaCache:'none'}).then(reg=>reg.update()).catch(console.warn);
setInterval(()=>{if(!cloud||cloudReady){runReminders();if(tab==='today'||tab==='overview')render();}},60000);
initCloud();
