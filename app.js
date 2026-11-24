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
const seededDate=today();
function newTask(title,category,owner,day,opts={}) {
 return {id:uid(),title,category,assignee:owner,repeat:opts.repeat||'weekly',days:day===null?[]:[day],nth:opts.nth||1,month:opts.month||1,dueDate:opts.dueDate||seededDate,createdAt:seededDate,active:true,notes:opts.notes||'',pairId:opts.pairId||'',mealRole:opts.mealRole||'',mealKey:opts.mealKey||''};
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
 add('Lavadora de ropa 1 (incluye tender y doblar)','Ropa','José',2);
 add('Lavadora de ropa 2 (incluye tender y doblar)','Ropa','Alicia',4);
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
 add('Lavadora de ropa 3 (solo si hace falta)','Ropa','José',0,{notes:'Si no hay suficiente ropa, se puede omitir esta repetición.'});
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
 return {version:1,startedAt:seededDate,tasks,occurrences:{},events:[],shopping:[],settings:{reminders:false,reminderTime:'19:00'}};
}
const STORAGE='nuestro_hogar_v1';
function loadLocal(){try{const s=JSON.parse(localStorage.getItem(STORAGE));return s?.version===1?s:makeSeed();}catch{return makeSeed();}}
let state=loadLocal();
let currentUser=localStorage.getItem('hogar_user')==='José'?'José':'Alicia';
let tab='today', selectedDay=today(), selectedWeek=weekStart(today()), taskFilter='Todas', modal=null, showDone=false;
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
    tx.set(cloud.docRef,reduceState(prior,action));
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
   if(newer.mealRole==='cook' && newer.pairId){const pair=s.tasks.find(x=>x.id===newer.pairId);if(pair && pair.active)pair.assignee=newer.assignee==='Alicia'?'José':'Alicia';}
   if(newer.mealRole==='clean' && newer.pairId){const pair=s.tasks.find(x=>x.id===newer.pairId);if(pair && pair.active)pair.assignee=newer.assignee==='Alicia'?'José':'Alicia';}
   break;
  }
  case 'archiveTask': {
   const t=s.tasks.find(x=>x.id===a.id);if(t){t.active=false;t.archivedAt=a.date;}break;
  }
  case 'activateManual': s.occurrences[a.id]={...s.occurrences[a.id],assignee:a.assignee,activated:true};break;
  case 'complete': {
   if(s.occurrences[a.id]?.done)break;
   s.occurrences[a.id]={...s.occurrences[a.id],done:{at:a.at,by:a.by,title:a.title,due:a.due,category:a.category}};break;
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
 if(t.repeat==='weekly')return (t.days||[]).includes(wd);
 if(t.repeat==='daily')return true;
 if(t.repeat==='monthly')return nthWeekday(date,Number(t.nth||1),(t.days||[6])[0]);
 if(t.repeat==='yearly')return d.getMonth()+1===Number(t.month||1)&&nthWeekday(date,Number(t.nth||2),(t.days||[6])[0]);
 if(t.repeat==='once')return t.dueDate===date;
 return false;
}
function makeOccurrence(t,date){const id=`${t.id}@${date}`;const o=state.occurrences[id]||{};return {id,task:t,date,title:t.title,category:t.category,assignee:o.assignee||t.assignee,done:o.done||null,skipped:!!o.skipped,late:Math.max(0,diffDays(date,today())),pairId:t.pairId};}
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
function score(){const points={Alicia:0,'José':0};const breakdown={Alicia:{onTime:0,late:0,reassign:0},'José':{onTime:0,late:0,reassign:0}};
 const all=allUpTo(today());
 for(const o of all){
  if(o.skipped)continue;
  if(o.done && dateISO(new Date(o.done.at))<=o.date){points[o.done.by]=(points[o.done.by]||0)+1;breakdown[o.done.by].onTime++;}
  if(o.date<today()&&(!o.done||dateISO(new Date(o.done.at))>o.date)){
   // Si se reasignó después del vencimiento, penaliza a quien era responsable en el vencimiento.
   const events=state.events.filter(e=>e.type==='reassign'&&e.occId===o.id&&dateISO(new Date(e.at))<=o.date).sort((a,b)=>a.at.localeCompare(b.at));
   const accountable=events.length?events[events.length-1].to:o.task.assignee;
   points[accountable]=(points[accountable]||0)-1;breakdown[accountable].late++;
  }
 }
 for(const ev of state.events.filter(x=>x.type==='reassign')){points[ev.from]=(points[ev.from]||0)-1;breakdown[ev.from].reassign++;}
 return {points,breakdown};
}
function icon(name){const icons={home:'⌂',week:'▦',tasks:'☷',shopping:'▣',points:'★',settings:'⚙',plus:'+',back:'‹',next:'›',bell:'♧'};return icons[name]||name;}
function usernameButtons(){return `<div class="segmented"><button data-user="Alicia" class="${currentUser==='Alicia'?'selected':''}">Alicia</button><button data-user="José" class="${currentUser==='José'?'selected':''}">José</button></div>`;}
function statusBadge(o){if(o.done)return `<span class="pill success">Hecha</span>`;if(o.skipped)return `<span class="pill muted">Omitida</span>`;if(o.late>0)return `<span class="pill warn">${o.late} ${o.late===1?'día':'días'} de retraso</span>`;return `<span class="pill neutral">${o.date===today()?'Hoy':pretty(o.date)}</span>`;}
function itemHTML(o,{editable=true}={}){
 const done=!!o.done, skipped=o.skipped;
 return `<article class="task-card ${done?'is-done':''} ${o.late&&!done&&!skipped?'is-late':''}">
 <button class="check ${done?'checked':''}" data-act="${done?'uncomplete':'complete'}" data-id="${esc(o.id)}" aria-label="${done?'Desmarcar':'Completar'} tarea">${done?'✓':''}</button>
 <div class="task-main"><div class="task-name">${esc(o.title)}</div><div class="task-meta"><span>${esc(o.category)}</span><span>·</span><span>${esc(o.assignee)}</span><span>·</span><span>${pretty(o.date)}</span></div>${statusBadge(o)}</div>
 ${editable&&!done&&!skipped?`<button class="dots" aria-label="Opciones de tarea" data-act="options" data-id="${esc(o.id)}">···</button>`:''}
 </article>`;
}
function heading(t,sub='',action=''){return `<div class="page-heading"><div><h1>${t}</h1>${sub?`<p>${sub}</p>`:''}</div>${action}</div>`;}
function viewToday(){const mine=outstanding().filter(o=>o.assignee===currentUser);const late=mine.filter(o=>o.late>0),fresh=mine.filter(o=>o.late===0);const done=allUpTo(today()).filter(o=>o.done&&dateISO(new Date(o.done.at))===today()&&o.done.by===currentUser);
 return `${heading('Mi día',new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}))}
 <section class="user-select"><span>Estoy viendo las tareas de</span>${usernameButtons()}</section>
 <div class="stat-row"><div class="stat"><b>${fresh.length}</b><span>Para hoy</span></div><div class="stat"><b>${late.length}</b><span>Atrasadas</span></div><div class="stat"><b>${done.length}</b><span>Hechas hoy</span></div></div>
 ${late.length?`<div class="section-label"><h2>Pendientes atrasadas</h2><span class="warning-text">${late.length} por resolver</span></div><div class="task-list">${late.map(o=>itemHTML(o)).join('')}</div>`:''}
 <div class="section-label"><h2>Tareas de hoy</h2><span>${fresh.length} pendientes</span></div>
 <div class="task-list">${fresh.length?fresh.map(o=>itemHTML(o)).join(''):`<div class="empty"><div class="empty-icon">✓</div><strong>¡Todo al día!</strong><p>No hay tareas pendientes para ${esc(currentUser)}.</p></div>`}</div>
 <div class="section-label"><h2>Completadas hoy</h2><button class="link-button" data-act="toggleDone">${showDone?'Ocultar':'Mostrar'} (${done.length})</button></div>
 ${showDone?`<div class="task-list">${done.map(o=>itemHTML(o,{editable:false})).join('')||'<div class="empty small">Aún no hay tareas completadas.</div>'}</div>`:''}`;
}
function viewWeek(){const days=Array.from({length:7},(_,i)=>plusDays(selectedWeek,i));const end=days[6];const os=occurrencesBetween(selectedWeek,end,{includePast:true});
 return `${heading('Planning semanal','Todas las tareas, día por día')}<section class="week-control"><button data-act="weekPrev" aria-label="Semana anterior">‹</button><strong>${pretty(selectedWeek)} — ${pretty(end)}</strong><button data-act="weekNext" aria-label="Semana siguiente">›</button><button class="btn-plain" data-act="weekNow">Hoy</button></section>
 <div class="week-grid">${days.map(date=>{const d=parseDate(date);const list=os.filter(o=>o.date===date);return `<button class="day-pill ${selectedDay===date?'active':''} ${date===today()?'today':''}" data-day="${date}"><span>${shortdays[d.getDay()]}</span><b>${d.getDate()}</b><small>${list.length}</small></button>`;}).join('')}</div>
 <div class="section-label"><h2>${weekdays[parseDate(selectedDay).getDay()]} ${pretty(selectedDay)}</h2><span>${os.filter(o=>o.date===selectedDay).length} tareas</span></div>
 <div class="task-list">${['Alicia','José'].map(person=>{const group=os.filter(o=>o.date===selectedDay&&o.assignee===person);return `<div class="day-person"><span class="avatar ${person==='José'?'jose':''}">${person[0]}</span><strong>${person}</strong><span class="count">${group.length}</span></div>${group.length?group.map(o=>itemHTML(o)).join(''):'<p class="empty-inline">Sin tareas asignadas</p>'}`;}).join('')}</div>
 ${[5,6,0].includes(parseDate(selectedDay).getDay())?'<p class="hint">Las comidas y cenas del viernes noche, sábado y domingo no se planifican: se improvisan y quien cocina no recoge.</p>':''}`;
}
function repeatLabel(t){if(t.repeat==='daily')return 'Diaria';if(t.repeat==='weekly')return 'Semanal · '+(t.days||[]).map(d=>shortdays[d]).join(', ');if(t.repeat==='monthly')return `Mensual · ${t.nth}º ${shortdays[(t.days||[6])[0]]}`;if(t.repeat==='yearly')return `Anual · ${t.nth}º ${shortdays[(t.days||[6])[0]]} de ${new Date(2026,t.month-1,1).toLocaleDateString('es-ES',{month:'long'})}`;if(t.repeat==='once')return `Puntual · ${pretty(t.dueDate)}`;return 'Según necesidad';}
function viewTasks(){const tasks=activeTasks().filter(t=>taskFilter==='Todas'||t.category===taskFilter).sort((a,b)=>a.category.localeCompare(b.category)||a.title.localeCompare(b.title));
 return `${heading('Todas las tareas','Catálogo global editable',`<button class="button primary" data-act="newTask">+ Nueva</button>`)}
 <div class="filter-strip">${['Todas',...cats].map(c=>`<button class="filter ${taskFilter===c?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
 <div class="task-directory">${tasks.map(t=>`<article class="directory-card"><div><span class="category">${esc(t.category)}</span><h3>${esc(t.title)}</h3><p>${esc(t.assignee)} · ${esc(repeatLabel(t))}</p></div><div class="directory-actions">${t.repeat==='manual'?`<button class="edit-button manual" data-act="manualAdd" data-id="${esc(t.id)}">Hacer hoy</button>`:''}<button class="edit-button" data-act="editTask" data-id="${esc(t.id)}" aria-label="Editar ${esc(t.title)}">Editar</button></div></article>`).join('')}</div>
 <p class="hint">Las habitaciones personales quedan fuera del planning. Los cambios de responsable en una tarea de cocina actualizan también su tarea vinculada de recogida.</p>`;
}
function viewShopping(){const list=[...state.shopping].sort((a,b)=>Number(a.done)-Number(b.done));const undone=list.filter(x=>!x.done).length;
 return `${heading('Lista de la compra','Compartida entre Alicia y José')}<form class="shopping-form" id="shoppingForm"><input name="product" maxlength="100" required placeholder="Añadir producto…" aria-label="Producto"><input name="quantity" maxlength="35" placeholder="Cantidad" aria-label="Cantidad"><button class="button primary" type="submit">Añadir</button></form>
 <div class="section-label"><h2>Productos</h2><span>${undone} pendientes</span></div>
 <div class="shopping-list">${list.length?list.map(i=>`<div class="shopping-item ${i.done?'bought':''}"><button class="check ${i.done?'checked':''}" data-act="shoppingToggle" data-id="${esc(i.id)}" aria-label="Marcar comprado">${i.done?'✓':''}</button><div><strong>${esc(i.name)}</strong>${i.quantity?`<small>${esc(i.quantity)}</small>`:''}</div><button class="dots" data-act="shoppingDelete" data-id="${esc(i.id)}" aria-label="Eliminar producto">×</button></div>`).join(''):`<div class="empty"><div class="empty-icon">▣</div><strong>Lista vacía</strong><p>Añade lo que haga falta comprar.</p></div>`}</div>
 ${list.some(x=>x.done)?`<button class="button light wide" data-act="shoppingClear">Eliminar productos comprados</button>`:''}`;
}
function viewPoints(){const p=score();const rows=names.map(n=>({name:n,score:p.points[n]||0,...p.breakdown[n]})).sort((a,b)=>b.score-a.score);
 return `${heading('Puntos','Cumplimiento y responsabilidad compartida')}<div class="score-hero"><span class="eyebrow">Marcador actual</span><div class="score-grid">${rows.map((x,i)=>`<div class="score-person"><div class="score-avatar ${x.name==='José'?'jose':''}">${x.name[0]}</div><span>${x.name}</span><strong>${x.score>0?'+':''}${x.score}</strong></div>`).join('')}</div></div>
 <div class="section-label"><h2>Desglose</h2></div><div class="breakdown">${rows.map(x=>`<article><h3>${x.name}</h3><div><span>Completadas a tiempo</span><b class="good">+${x.onTime}</b></div><div><span>Retrasos</span><b class="bad">−${x.late}</b></div><div><span>Reasignaciones</span><b class="bad">−${x.reassign}</b></div></article>`).join('')}</div>
 <div class="info"><strong>Reglas</strong><p>+1 por tarea completada dentro de plazo. −1 por tarea atrasada (una sola vez por ocurrencia). −1 a quien cede una tarea al reasignarla. Las tareas realizadas fuera de plazo no suman punto positivo. Las tareas omitidas se excluyen del marcador.</p></div>`;
}
function viewSettings(){return `${heading('Ajustes','Preferencias de vuestro hogar')}<div class="settings-card"><h2>Acceso</h2><p>Perfil activo</p>${usernameButtons()}<div class="setting-row"><div><b>Almacenamiento</b><small>${cloudReady?'Firebase · sincronizado':'Local · solo este dispositivo'}</small></div><span class="dot ${cloudReady?'connected':''}"></span></div>${cloudReady?'<button class="button light" data-act="logout">Cerrar sesión compartida</button>':'<p class="hint">Para compartir datos entre dos iPhone, configura Firebase siguiendo README.md.</p>'}</div>
 <div class="settings-card"><h2>Recordatorios</h2><p>La aplicación puede avisar de tareas pendientes cuando está abierta. Los avisos en segundo plano requieren configurar un servicio push adicional.</p><label class="toggle-row"><span>Activar avisos en la app</span><input id="reminders" type="checkbox" ${state.settings.reminders?'checked':''}></label><label class="toggle-row"><span>Hora del recordatorio</span><input type="time" id="reminderTime" value="${esc(state.settings.reminderTime||'19:00')}"></label><button class="button light" data-act="requestNotify">Permitir notificaciones</button></div>
 <div class="info"><strong>Sobre el reparto</strong><p>Las tareas personales no están incluidas. El robot funciona automáticamente y solo se programa su limpieza semanal. Las comidas de fin de semana no se asignan.</p></div>`;}
const navItems=[['today','Hoy','⌂'],['week','Semana','▦'],['tasks','Tareas','☷'],['shopping','Compra','▣'],['points','Puntos','★'],['settings','Ajustes','⚙']];
function modalHTML(){if(!modal)return '';
 if(modal.kind==='options'){const o=findOccurrence(modal.id);if(!o)return '';
 return `<div class="overlay" data-act="closeModal"><div class="sheet" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${esc(o.title)}</h2><p class="muted">${esc(o.assignee)} · Vencimiento: ${pretty(o.date)}${o.late?` · ${o.late} día(s) tarde`:''}</p><div class="field"><label>Reasignar esta repetición a</label><select id="assignTo"><option value="Alicia" ${o.assignee==='Alicia'?'selected':''}>Alicia</option><option value="José" ${o.assignee==='José'?'selected':''}>José</option></select></div><button class="button primary wide" data-act="saveAssignment" data-id="${esc(o.id)}">Guardar responsable (−1 al anterior)</button>${o.pairId?'<p class="hint">Si esta tarea es de cocina o recogida, también se actualizará su pareja de ese día para respetar la regla.</p>':''}<button class="button light wide" data-act="skip" data-id="${esc(o.id)}">Omitir esta repetición (no puntúa)</button><button class="button text wide" data-act="closeModal">Cancelar</button></div></div>`;
 }
 const t=modal.kind==='edit'?state.tasks.find(x=>x.id===modal.id):null;const v=t||newTask('','Limpieza',currentUser,parseDate(today()).getDay());
 return `<div class="overlay" data-act="closeModal"><div class="sheet edit-sheet" role="dialog" aria-modal="true" onclick="event.stopPropagation()"><div class="sheet-handle"></div><h2>${t?'Editar tarea':'Nueva tarea'}</h2><form id="taskForm" class="form-fields"><label>Nombre<input name="title" maxlength="120" required value="${esc(v.title)}" placeholder="Nombre de la tarea"></label><div class="two-col"><label>Categoría<select name="category">${cats.map(c=>`<option ${v.category===c?'selected':''}>${c}</option>`).join('')}</select></label><label>Responsable<select name="assignee">${names.map(n=>`<option ${v.assignee===n?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="two-col"><label>Repetición<select name="repeat" id="taskRepeat">${[['weekly','Semanal'],['daily','Diaria'],['monthly','Mensual'],['yearly','Anual'],['once','Una vez'],['manual','Según necesidad']].map(([key,text])=>`<option value="${key}" ${v.repeat===key?'selected':''}>${text}</option>`).join('')}</select></label><label>Día habitual<select name="day">${weekdays.map((d,i)=>`<option value="${i}" ${(v.days||[1])[0]===i?'selected':''}>${d}</option>`).join('')}</select></label></div><div class="two-col"><label>Semana del mes<select name="nth">${[1,2,3,4].map(x=>`<option value="${x}" ${Number(v.nth)===x?'selected':''}>${x}ª</option>`).join('')}</select></label><label>Mes (si es anual)<select name="month">${Array.from({length:12},(_,i)=>`<option value="${i+1}" ${Number(v.month)===i+1?'selected':''}>${new Date(2026,i,1).toLocaleDateString('es-ES',{month:'long'})}</option>`).join('')}</select></label></div><label>Fecha (si es puntual)<input type="date" name="dueDate" value="${esc(v.dueDate||today())}"></label><label>Notas<textarea name="notes" rows="2">${esc(v.notes||'')}</textarea></label><button class="button primary wide" type="submit">${t?'Guardar cambios':'Crear tarea'}</button></form>${t?`<button class="button danger wide" data-act="archiveTask" data-id="${esc(t.id)}">Archivar tarea</button>`:''}<button class="button text wide" data-act="closeModal">Cancelar</button><p class="hint">Diaria: todos los días. Semanal: día habitual. Mensual: n.º día de semana. Anual: mes y n.º día de semana. Puntual: fecha concreta.</p></div></div>`;
}
function render(){
 if(cloud && !cloudReady){renderLogin();return;}
 const content={today:viewToday,week:viewWeek,tasks:viewTasks,shopping:viewShopping,points:viewPoints,settings:viewSettings}[tab]();
 el.innerHTML=`<div class="shell"><header class="topbar"><div class="brand"><div class="brand-logo">⌂</div><div><strong>Nuestro Hogar</strong><span>Alicia & José</span></div></div><div class="top-right"><span class="sync-status ${cloudReady?'online':''}" title="${cloudReady?'Sincronización conectada':'Modo local'}"></span><button class="profile-dot ${currentUser==='José'?'jose':''}" data-act="switchUser" aria-label="Cambiar usuario">${currentUser[0]}</button></div></header><main>${content}</main><nav class="bottom-nav">${navItems.map(([key,label,glyph])=>`<button data-tab="${key}" class="${tab===key?'active':''}"><span class="nav-icon">${glyph}</span><span>${label}</span></button>`).join('')}</nav></div><div id="toast" class="toast" role="status"></div>${modalHTML()}`;
}
function findOccurrence(id){const at=id.lastIndexOf('@');if(at===-1)return null;const t=state.tasks.find(x=>x.id===id.slice(0,at));if(!t)return null;return makeOccurrence(t,id.slice(at+1));}
function reassignOccurrence(o,to){if(o.assignee===to)return;const at=new Date().toISOString();mutate({type:'reassign',id:o.id,from:o.assignee,to,at,due:o.date,eventId:uid()});
 // Las tareas de cocina y fregado del mismo turno siempre tienen propietarios opuestos.
 if(o.task.pairId){const other=state.tasks.find(t=>t.id===o.task.pairId);if(other){const pair=findOccurrence(`${other.id}@${o.date}`);if(pair&&!pair.done&&!pair.skipped){const opposite=to==='Alicia'?'José':'Alicia';if(pair.assignee!==opposite)mutate({type:'reassign',id:pair.id,from:pair.assignee,to:opposite,at:new Date().toISOString(),due:pair.date,eventId:uid()});}}}
}
function handleClick(e){const btn=e.target.closest('button,[data-act],[data-tab],[data-user],[data-filter],[data-day]');if(!btn)return;
 if(btn.dataset.tab){tab=btn.dataset.tab;render();return;}
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
  case 'complete':{const o=findOccurrence(id);if(o&&!o.done){mutate({type:'complete',id,at:new Date().toISOString(),by:o.assignee,title:o.title,due:o.date,category:o.category});toast(o.late?'Completada fuera de plazo.':'¡Tarea completada! +1 punto.');}break;}
  case 'uncomplete':if(confirm('¿Desmarcar esta tarea como completada?'))mutate({type:'uncomplete',id});break;
  case 'options':modal={kind:'options',id};render();break;
  case 'closeModal':modal=null;render();break;
  case 'saveAssignment':{const o=findOccurrence(id),to=$('#assignTo')?.value;if(o&&to){reassignOccurrence(o,to);modal=null;render();toast('Responsable actualizado.');}break;}
  case 'skip':if(confirm('¿Omitir esta repetición sin puntuar?')){mutate({type:'skip',id});modal=null;render();}break;
  case 'manualAdd':{const t=state.tasks.find(t=>t.id===id);if(t){const iid=`${t.id}@${today()}`;if(state.occurrences[iid]?.done){toast('Ya se ha completado hoy.');}else{mutate({type:'activateManual',id:iid,assignee:t.assignee});tab='today';render();toast('Tarea añadida para hoy.');}}break;}
  case 'newTask':modal={kind:'new'};render();break;
  case 'editTask':modal={kind:'edit',id};render();break;
  case 'archiveTask':if(confirm('¿Archivar esta tarea? Dejará de aparecer en el planning futuro.')){mutate({type:'archiveTask',id,date:today()});modal=null;render();}break;
  case 'shoppingToggle':mutate({type:'shoppingToggle',id});break;
  case 'shoppingDelete':mutate({type:'shoppingDelete',id});break;
  case 'shoppingClear':mutate({type:'shoppingClear'});break;
  case 'requestNotify':if('Notification' in window){Notification.requestPermission().then(p=>toast(p==='granted'?'Notificaciones permitidas.':'No se concedió permiso.'));}else toast('Este navegador no ofrece notificaciones.');break;
  case 'logout':if(cloud)cloud.api.signOut(cloud.auth);break;
 }
}
function handleSubmit(e){if(e.target.id==='shoppingForm'){e.preventDefault();const f=new FormData(e.target);const name=String(f.get('product')||'').trim();if(name){mutate({type:'shoppingAdd',item:{id:uid(),name,quantity:String(f.get('quantity')||'').trim(),done:false}});toast('Producto añadido.');}return;}
 if(e.target.id==='taskForm'){e.preventDefault();const f=new FormData(e.target);const title=String(f.get('title')||'').trim();if(!title)return;
 const prev=modal?.kind==='edit'?state.tasks.find(x=>x.id===modal.id):null;
 const t=prev?{...prev}:newTask(title,String(f.get('category')),String(f.get('assignee')),Number(f.get('day')));
 Object.assign(t,{title,category:String(f.get('category')),assignee:String(f.get('assignee')),repeat:String(f.get('repeat')),days:[Number(f.get('day'))],nth:Number(f.get('nth')),month:Number(f.get('month')),dueDate:String(f.get('dueDate')),notes:String(f.get('notes')||'')});
 mutate({type:prev?'editTask':'addTask',task:t});modal=null;render();toast(prev?'Tarea actualizada.':'Tarea creada.');return;}
 if(e.target.id==='loginForm'){e.preventDefault();const f=new FormData(e.target);const email=String(f.get('email')||'');const pass=String(f.get('password')||'');const b=$('#loginButton');if(b)b.disabled=true;
 cloud.api.signInWithEmailAndPassword(cloud.auth,email,pass).catch(err=>{const div=$('#loginError');if(div)div.textContent='No se pudo iniciar sesión. Comprueba correo, contraseña y Firebase Authentication.';if(b)b.disabled=false;});return;}
}
function handleChange(e){if(e.target.id==='reminders'){mutate({type:'settings',settings:{reminders:e.target.checked}});if(e.target.checked)runReminders();}
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
    unsubscribe=fs.onSnapshot(cloud.docRef,snap=>{if(snap.exists()){state=snap.data();storeLocal();cloudReady=true;render();}},err=>{console.error(err);toast('Error de sincronización de Firebase.');});
   }catch(err){console.error(err);cloudReady=false;renderLogin();const error=$('#loginError');if(error)error.textContent='No se puede acceder a Firestore. Revisa las reglas del proyecto.';}
  });
 }catch(err){console.error(err);render();setTimeout(()=>toast('No se pudo cargar Firebase; se mantiene la copia local.'),500);}
}
if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(console.warn);
setInterval(()=>{if(!cloud||cloudReady){runReminders();if(tab==='today'||tab==='points')render();}},60000);
initCloud();
