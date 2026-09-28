async function appMain() {
  const {createInitialState, loadState, saveState, localDate, makeId, stats, exportBackup, validateBackup} = await import('./src/data.js?v=11');
  const APP = document.getElementById('app');
  const MODAL = document.getElementById('modal-root');
  const TOAST = document.getElementById('toast-root');
  const CATEGORIES = ['Career','Money','Love','Health','Home','Travel','Personal Growth'];
  const STICKERS = [
    ['sunrise-intention','New intention','Personal Growth'],
    ['one-small-step','One small step','Personal Growth'],
    ['growing-sprout','Growing','Health'],
    ['open-heart','Open heart','Love'],
    ['guiding-star','Guiding star','Personal Growth'],
    ['gratitude-bouquet','Gratitude','Personal Growth'],
    ['milestone-flag','Milestone','Career'],
    ['cozy-home','Cozy home','Home'],
    ['travel-suitcase','Travel dreams','Travel'],
    ['abundance-seeds','Abundance','Money'],
    ['evidence-win','A small win','Career'],
    ['open-journal','My story','Personal Growth']
  ];
  const JOURNAL_TYPES = ['Manifestation Journal','Gratitude','Scripting','Future Self','Evidence / Wins','Lessons','Brain Dump'];
  const AFFIRMATION_CATEGORIES = ['General','Money','Confidence','Career','Relationships','Health'];
  const SCRIPTING_PROMPTS = ['It is December ' + (new Date().getFullYear() + 1) + ' and…','My ideal day looks like…','I am grateful that…','My life changed when…','The version of me who already has this…'];
  // Original AurelyStudio palettes; new materials and colors follow the user's Pinterest visual briefs.
  const THEMES = [
    {id:'warm-sage',name:'Warm Sage',mood:'Grounded and gentle',main:'#53735c',accent:'#b88770',bg:'#fcf8f5',paper:'#fffdfc',ink:'#2f3a34',hero:'#1f2a2430'},
    {id:'soft-sanctuary',name:'Soft Sanctuary',mood:'Sunlit sage and warm ivory',main:'#41665d',accent:'#b97258',bg:'#eee9df',paper:'#fbf8ef',ink:'#293b35',hero:'#ffffff18'},
    {id:'dawn-blush',name:'Dawn Blush',mood:'Soft hope and intention',main:'#8c6a6c',accent:'#c98f7a',bg:'#fbf5f2',paper:'#fffdfb',ink:'#3b2f31',hero:'#2b202328'},
    {id:'pink-bloom',name:'Pink Bloom',mood:'A rosy space for every page',main:'#984a6d',accent:'#c75d8e',bg:'#f7cfe0',paper:'#ffe4ee',ink:'#442334',hero:'#44233428'},
    {id:'midnight-ink',name:'Midnight Ink',mood:'Quiet focus and depth',main:'#243447',accent:'#b88a5a',bg:'#f4f1ec',paper:'#fcfaf7',ink:'#1f2730',hero:'#141b2450'},
    {id:'desert-clay',name:'Desert Clay',mood:'Earthy, steady action',main:'#8a5a44',accent:'#6e7b5d',bg:'#faf4ee',paper:'#fffdf9',ink:'#382d28',hero:'#2a211c30'},
    {id:'coastal-mist',name:'Coastal Mist',mood:'Airy and clear',main:'#5f7880',accent:'#a88d74',bg:'#f5f8f8',paper:'#ffffff',ink:'#2b373a',hero:'#1d272a2e'},
    {id:'golden-ember',name:'Golden Ember',mood:'Warm evening momentum',main:'#4a4038',accent:'#c49a52',bg:'#f8f2ea',paper:'#fffdf8',ink:'#2f2924',hero:'#19151238'},
    {id:'rose-quartz',name:'Rose Quartz',mood:'Rose pink with a warm berry accent',main:'#884662',accent:'#aa637b',bg:'#f3cede',paper:'#fff0f5',ink:'#422635',hero:'#44233428'},
    {id:'lavender-haze',name:'Lavender Haze',mood:'Soft lilac for a quiet writing ritual',main:'#65517f',accent:'#92819c',bg:'#e5dcf1',paper:'#f8f3ff',ink:'#342b45',hero:'#342b4528'},
    {id:'blue-opal',name:'Blue Opal',mood:'Powder blue with a clear ocean accent',main:'#3b6878',accent:'#8f8583',bg:'#d4e7ed',paper:'#f1f9fc',ink:'#233c48',hero:'#233c4828'},
    {id:'peach-aura',name:'Peach Aura',mood:'Apricot warmth and grounded terracotta',main:'#93543e',accent:'#7c795b',bg:'#f5dfce',paper:'#fff5ec',ink:'#442c23',hero:'#442c2328'},
    {id:'porcelain-garden',name:'Porcelain Garden',mood:'Ivory, botanical green, and ceramic warmth',main:'#41685b',accent:'#b68563',bg:'#e7eee2',paper:'#f8faf0',ink:'#293b30',hero:'#293b3028'}
  ];
  const APPEARANCES = [
    ['normal','Normal','Clean, familiar surfaces.'],
    ['glass','3D Glass','Translucent edges and luminous depth.'],
    ['sculpted','Sculpted 3D','Raised porcelain, soft volume, and inset details.']
  ];
  function appearanceMode(){
    const t=state.theme||{};
    if(APPEARANCES.some(([id])=>id===t.appearance))return t.appearance;
    const id=t.themeId||t.preset;
    return ['soft-sanctuary','rose-quartz','lavender-haze','blue-opal','peach-aura'].includes(id)?'glass':id==='porcelain-garden'?'sculpted':'normal';
  }
  const WRITING_FONTS = [
    ['nunito','Clean Sans'],['lora','Classic Serif'],['caveat','Caveat'],
    ['kalam','Kalam'],['patrick','Patrick Hand'],['dancing','Dancing Script'],['sacramento','Sacramento']
  ];
  const MENU_STYLES = [
    ['sidebar','Classic sidebar','The familiar full menu.'],
    ['compact','Compact icons','More room for your pages.'],
    ['top','Top navigation','Your sections across the top.']
  ];
  const TECHNIQUES = [
    {id:'369',name:'369 Method',tag:'Writing rhythm',time:'Across the day',summary:'Return to one believable statement in three short writing moments.',steps:['Choose one statement that feels supportive and possible.','Write it 3 times in the morning, 6 in the afternoon, and 9 in the evening.','Choose one small action connected to the intention.']},
    {id:'scripting',name:'Scripting',tag:'Future scene',time:'5–10 min',summary:'Write an ordinary future day as if you are living it, then bridge back to today.',steps:['Set a future date and describe a specific ordinary scene.','Notice what you did along the way, not only the result.','Name one step you can take today.'],fields:[['scene','The future scene','It is December '+(new Date().getFullYear()+1)+', and an ordinary day looks like…'],['bridge','How did you get there?','What choices or habits helped?'],['action','One small action today','What is the first manageable step?']]},
    {id:'visualization',name:'Process Visualization',tag:'Mental rehearsal',time:'2–3 min',summary:'Picture the first minutes of doing the work, then take that step.',steps:['Picture the outcome you care about for a moment.','Rehearse the first five minutes of the real task.','Write what you will do next and when.'],fields:[['outcome','What are you working toward?','Describe the outcome in a sentence.'],['firstMinutes','What do the first five minutes look like?','See yourself opening the document, making the call, or starting the walk.'],['action','Your next real action','A five-minute step you can do today.']]},
    {id:'future-letter',name:'Future-Self Letter',tag:'Identity practice',time:'10–15 min',summary:'Let your future self describe the habits that helped you move forward.',steps:['Write a short letter from a future version of you.','Name one daily behavior that made a difference.','Try that behavior in a small way today.'],fields:[['letter','A letter from future me','Dear present me, the small habit that mattered was…'],['habit','A behavior I can practice','What does future you do regularly?'],['action','One small action today','How can you practice it today?']]},
    {id:'gratitude-evidence',name:'Gratitude + Evidence',tag:'Notice the real',time:'3–5 min',summary:'Pair gratitude with one thing that actually happened or moved forward.',steps:['Name three specific things you appreciate.','Record one real sign of progress, however small.','Choose what to repeat or build on tomorrow.'],fields:[['gratitude1','Gratitude 1','A person, moment, or resource you appreciate.'],['gratitude2','Gratitude 2','Something specific from today.'],['gratitude3','Gratitude 3','One more thing that feels real.'],['proof','Evidence of progress','What did you actually do or notice?'],['action','What will you build on?','Your next small step.']]},
    {id:'wish-plan',name:'Wish → Obstacle → Plan',tag:'Action bridge',time:'3–5 min',summary:'Name the wish, a real obstacle, and an if–then response you can use.',steps:['Write a meaningful wish and what reaching it would look like.','Identify an obstacle within your influence.','Make an if–then plan, then put the response into Action Plan.'],fields:[['wish','My wish','What matters to you?'],['outcome','A good outcome','What would change if this moved forward?'],['obstacle','An obstacle I can influence','What usually gets in the way for you?'],['ifThen','If–then plan','If [obstacle], then I will [specific response].'],['action','The action to add to my plan','A specific step you can take.']]},
    {id:'55x5',name:'55×5 Writing',tag:'Optional repetition',time:'5 days · at your pace',summary:'A repetition ritual for people who enjoy it. The numbers do not promise an outcome.',steps:['Choose one short, believable statement.','Write it up to 55 times today, one line at a time.','Repeat on up to five days if useful; keep one real action beside it.'],fields:[['statement','My statement','Choose a phrase you can return to.'],['repetitions','Today’s repetitions','Write one repetition per line.'],['action','One action beyond writing','What can you do in the real world?']]}
  ];
  const MAIN_NAV = [['today','Today','home'],['calendar','Calendar','calendar'],['manifestations','Manifestations','target'],['vision','Vision Board','image'],['actions','Action Plan','list'],['journal','Journal','book'],['habits','Habits','check'],['progress','Progress','chart']];
  const TOOL_NAV = [['affirmations','Affirmations','spark'],['techniques','Techniques','sun'],['future','Future Self','user'],['weekly','Weekly Review','calendar']];
  const SVG = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-7h6v7"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/><path d="m12 12 8-8"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    list:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    check:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m7 12 3 3 7-7"/>',
    book:'<path d="M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zM12 6v15"/>',
    chart:'<path d="M4 20V13h3v7zM10 20V8h3v12zM16 20V4h3v16z"/>',
    spark:'<path d="m12 2 1.5 7.5L21 12l-7.5 2.5L12 22l-1.5-7.5L3 12l7.5-2.5z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    chevron:'<path d="m6 9 6 6 6-6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    search:'<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 9h18c0-1-3-2-3-9M10 21h4"/>',
    close:'<path d="M5 5l14 14M19 5 5 19"/>',
    leaf:'<path d="M20 4C9 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-5 11-16zM4 20c2-5 6-8 11-10"/>',
    bolt:'<path d="m13 2-9 11h7l-1 9 10-12h-7z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    download:'<path d="M12 3v12m-4-4 4 4 4-4M4 18v3h16v-3"/>',
    upload:'<path d="M12 17V5m-4 4 4-4 4 4M4 18v3h16v-3"/>',
    print:'<path d="M6 9V3h12v6M6 18H4V9h16v9h-2M6 15h12v6H6z"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
    edit:'<path d="m4 17 10-10 3 3-10 10H4zM14 7l2-2a2 2 0 0 1 3 3l-2 2"/>',
    heart:'<path d="M20 8c0 5-8 12-8 12S4 13 4 8a4 4 0 0 1 8-1 4 4 0 0 1 8 1z"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>'
  };
  const icon = (name,size=20) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SVG[name]||SVG.spark}</svg>`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const attr = esc;
  const blank = value => !String(value ?? '').trim();
  const pct = value => Math.max(0,Math.min(100,Number(value)||0));
  const fmtDate = value => { if(!value)return 'Any time';const raw=String(value),isDay=/^\d{4}-\d{2}-\d{2}$/.test(raw),d=new Date(isDay?`${raw}T12:00:00Z`:raw);return Number.isNaN(d.getTime())?'Any time':new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric',...(isDay?{timeZone:'UTC'}:{})}).format(d); };
  const addDays = (date,n) => {const d=new Date(`${date}T12:00:00Z`);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
  const monthKey = date => date.slice(0,7);
  const weekStart = date => {const d=new Date(`${date}T12:00:00Z`);return addDays(date,-((d.getUTCDay()+6)%7));};
  const weekDates = date => Array.from({length:7},(_,i)=>addDays(weekStart(date),i));
  const dayOrdinal = date => Date.parse(`${date}T00:00:00Z`) / 86_400_000;
  function journeyPosition(date){
    const start=state.journey.startDate;
    if(!start)return 0;
    const position=dayOrdinal(date)-dayOrdinal(start)+1;
    return Number.isFinite(position)?position:0;
  }
  function journeyLabel(date){
    if(!state.journey.startDate)return 'Journey not started';
    const position=journeyPosition(date);
    if(position<1)return 'Before your 30-day journey';
    if(position>30)return '30-day journey finished';
    return `Day ${position} of 30`;
  }
  function monthlyHabitPercent(month){
    const active=state.habits.filter(h=>h.active!==false);
    if(!active.length)return 0;
    const today=localDate(),end=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate();
    let possible=0,done=0;
    for(const habit of active){
      const created=habit.createdAt?localDate(new Date(habit.createdAt)):'0000-01-01';
      for(let day=1;day<=end;day++){
        const date=month+'-'+String(day).padStart(2,'0');
        if(date>today||date<created)continue;
        possible++;if(habit.completions?.[date])done++;
      }
    }
    return possible?Math.round(done/possible*100):0;
  }
  function habitStreak(habit){
    let date=localDate(),count=0;
    if(!habit.completions?.[date])date=addDays(date,-1);
    while(habit.completions?.[date]){count++;date=addDays(date,-1);}
    return count;
  }
  const timeGreeting = () => {const h=new Date().getHours();return h<12?'Good morning':h<18?'Good afternoon':'Good evening';};
  const nowTime = () => new Date().toTimeString().slice(0,5);
  let state = loadState();
  let visitName = '';
  let selectedDate = localDate();
  let calendarMonth = monthKey(selectedDate);
  let observedLocalDate = selectedDate;
  let habitWeek = selectedDate;
  let actionFilter = 'all';
  let visionFilter = 'All';
  let journalFilter = 'All';
  let affirmationFilter = 'All';
  let installPrompt = null;
  let searchValue = '';
  let currentRoute = routeFromHash();
  let toastTimer;
  let draftTimer;
  let visionViewer=null;
  let welcomeController=null;
  let welcomeBlocking=true;
  let focusSession=null;
  function syncAppInert(){APP.inert=welcomeBlocking||Boolean(MODAL.firstElementChild);MODAL.inert=welcomeBlocking;const focusRoot=document.getElementById('focus-root');if(focusRoot)focusRoot.inert=welcomeBlocking||Boolean(MODAL.firstElementChild);}
  new MutationObserver(()=>{if(visionViewer&&!MODAL.querySelector('.vision-viewer'))closeVisionViewer(false,false);syncAppInert();}).observe(MODAL,{childList:true});
  function routeFromHash(){try{const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean).map(part=>decodeURIComponent(part));return {page:parts[0]||'today',id:parts[1]||''};}catch{return {page:'today',id:''};}}
  function go(page,id='',preserveDate=false){closeVisionViewer(false);if(page==='today'&&!preserveDate)selectedDate=localDate();if(page==='calendar'&&currentRoute.page!=='calendar')calendarMonth=monthKey(selectedDate);location.hash=`#/${page}${id?`/${encodeURIComponent(id)}`:''}`;currentRoute=routeFromHash();MODAL.innerHTML='';render();window.scrollTo({top:0,behavior:'instant'});}
  function toast(message,error=false){TOAST.innerHTML=`<div class="toast${error?' error':''}" role="status">${esc(message)}</div>`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>TOAST.innerHTML='',4000);}
  function commit(message='Saved in this browser'){
    try{state=saveState(state);render();toast(message);return true;}
    catch(error){state=loadState();render();toast(`Could not save: ${error.message}`,true);return false;}
  }
  function persist(){try{state=saveState(state);}catch(error){toast(`Could not save: ${error.message}`,true);}}
  function dayRecord(date=selectedDate){state.days[date] ||= {calendarNote:'',intention:'',callingIn:'',smallAction:'',mood:'',energy:'',morningAffirmation:'',eveningReflection:'',journey:{intention:'',visualization:'',action:'',gratitude:'',reflection:'',completed:false}};state.days[date].journey ||= {intention:'',visualization:'',action:'',gratitude:'',reflection:'',completed:false};return state.days[date];}
  function renderNav(list){return list.map(([page,label,ico])=>`<a href="#/${page}" class="nav-link${currentRoute.page===page?' active':''}" aria-label="${attr(label)}" title="${attr(label)}" aria-current="${currentRoute.page===page?'page':'false'}" data-nav="${page}">${icon(ico)}<span>${label}</span></a>`).join('');}
  function shell(content){
    const name=state.profile.name?.trim()||visitName||'Friend';
    const logo='<img src="assets/logo.svg" alt="AurelyStudio logo">';
    const brandMark=appearanceMode()!=='normal'?`<span class="brand-mark">${logo}</span>`:logo;
    const title=MAIN_NAV.concat(TOOL_NAV,[['monthly','Monthly Reset','calendar'],['themes','Themes','settings'],['data','Data & Print','download']]).find(x=>x[0]===currentRoute.page)?.[1]||'Today';
    return `<div class="app-shell" id="app-shell"><aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="brand">${brandMark}<strong>AurelyStudio</strong><small>Manifestation &amp;<br>Action Planner</small></div>
      <nav class="nav-group" aria-label="Main">${renderNav(MAIN_NAV)}</nav>
      <div class="nav-group-label">Tools</div><nav class="nav-group" aria-label="Tools">${renderNav(TOOL_NAV)}</nav>
      <div class="nav-group-label">Your space</div><nav class="nav-group" aria-label="Settings">${renderNav([['themes','Themes','settings'],['data','Data & Print','download']])}</nav>
      <div class="sidebar-quote">A more<br>aligned you<br>creates a brighter<br>world.<small>♡</small></div>
    </aside><button class="sidebar-scrim" data-act="close-menu" aria-label="Close menu" hidden></button>
    <main class="main-area"><header class="topbar">
      <button class="mobile-menu" data-act="menu" aria-label="Open menu" aria-expanded="false" aria-controls="sidebar">${icon('menu')}</button><div class="mobile-brand">${brandMark}<span><strong>AurelyStudio</strong><small>Manifestation &amp; Action Planner</small></span></div><button class="mobile-search-btn" data-act="mobile-search" aria-label="Search saved records">${icon('search')}</button>
      <form class="topbar-search" id="search-form" role="search">${icon('search')}<input id="global-search" type="search" placeholder="Search your goals, actions, or inspiration…" value="${attr(searchValue)}" aria-label="Search all saved records"></form>
      <div class="topbar-actions"><button class="icon-btn" data-act="notification" aria-label="Today's reminder">${icon('bell')}</button><button class="profile-button" data-act="profile" aria-label="Edit your name"><span class="avatar">${esc(name[0].toUpperCase())}</span><span class="greeting"><small>${timeGreeting()},</small>${esc(name)}</span>${icon('chevron',16)}</button></div>
    </header><nav class="mobile-shortcuts" aria-label="Main sections">${renderNav(MAIN_NAV)}</nav><div class="mobile-page-label">${icon(MAIN_NAV.concat(TOOL_NAV).find(x=>x[0]===currentRoute.page)?.[2]||'spark',17)} ${esc(title)}</div>
    <div class="workspace">${content}</div></main></div>`;
  }
  function panel(title,body,action='',classes=''){return `<section class="panel ${classes}"><div class="panel-head"><h2>${title}</h2>${action}</div>${body}</section>`;}
  function empty(title,description,button='',action=''){return `<div class="empty-state">${icon('spark',31)}<h3>${title}</h3><p>${description}</p>${button?`<button class="btn btn-primary" data-act="${action}">${icon('plus',16)}${button}</button>`:''}</div>`;}
  function pageHead(kicker,title,subtitle,actions=''){return `<div class="page-head"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${subtitle}</p></div><div class="chip-row">${actions}</div></div>`;}
  function writingFontControl(compact=false){
    return `<div class="writing-font-control${compact?' compact':''}"><label><span>Writing font</span><select data-writing-font aria-label="Writing font">${WRITING_FONTS.map(([id,label])=>`<option value="${id}" ${state.theme.writingFont===id?'selected':''}>${label}</option>`).join('')}</select></label>${compact?'':'<p class="writing-font-preview">A little progress, one page at a time.</p>'}</div>`;
  }
  function ring(label,value,color='var(--sage)'){return `<div class="ring-group"><div class="ring" style="--progress:${pct(value)}%;--ring-color:${color}"><span>${pct(value)}%</span></div><span>${label}</span></div>`;}
  function actionSort(a,b){const score=x=>({high:3,medium:2,low:1}[x.priority]||0);return score(b)-score(a)||String(a.deadline||'9999').localeCompare(String(b.deadline||'9999'))||String(a.dueTime||'99:99').localeCompare(String(b.dueTime||'99:99'));}
  function suggestedActions(){const energy=state.days[selectedDate]?.energy;return state.actions.filter(a=>!a.done&&(!a.deadline||a.deadline<=selectedDate)).sort((a,b)=>{const ad=a.deadline&&a.deadline<=selectedDate?1:0,bd=b.deadline&&b.deadline<=selectedDate?1:0,am=a.energy===energy?1:0,bm=b.energy===energy?1:0;return bd-ad||bm-am||actionSort(a,b)||a.minutes-b.minutes;});}
  function actionRow(a,compact=false){return `<div class="list-row action-row" data-record-id="${attr(a.id)}" tabindex="-1"><input type="checkbox" data-toggle-action="${attr(a.id)}" aria-label="${a.done?'Reopen':'Complete'} ${attr(a.title)}" ${a.done?'checked':''}><div class="row-copy"><strong class="${a.done?'done':''}">${esc(a.title)}</strong>${compact?'':`<small><button class="action-timer-link" type="button" data-act="focus-action" data-id="${attr(a.id)}" aria-label="Open a ${attr(a.minutes)} minute timer for ${attr(a.title)}"><span aria-hidden="true">◷</span> ${esc(a.minutes)} min</button> · ${esc(a.energy)} energy${a.deadline?` · ${fmtDate(a.deadline)}${a.dueTime?` at ${esc(a.dueTime)}`:''}`:''}</small>`}</div>${compact?'':`<button class="icon-btn" data-act="edit-action" data-id="${attr(a.id)}" aria-label="Edit ${attr(a.title)}">${icon('edit',16)}</button><button class="icon-btn" data-act="delete-action" data-id="${attr(a.id)}" aria-label="Delete ${attr(a.title)}">${icon('trash',16)}</button>`}</div>`;}
  function habitMatrix(compact=false){const dates=weekDates(habitWeek),habits=state.habits.filter(h=>h.active!==false);if(!habits.length)return empty('A gentle rhythm starts here','Add up to eight practices you want to return to.','Add a habit','new-habit');return `<table class="habit-table"><thead><tr><th scope="col"></th>${dates.map(d=>`<th scope="col" title="${fmtDate(d)}">${new Intl.DateTimeFormat('en',{weekday:'narrow'}).format(new Date(`${d}T12:00:00`))}</th>`).join('')}</tr></thead><tbody>${habits.map(h=>`<tr><td>${esc(h.title)}</td>${dates.map(d=>`<td><button class="habit-dot ${h.completions?.[d]?'done':''}" data-toggle-habit="${attr(h.id)}" data-date="${d}" aria-label="${h.completions?.[d]?'Clear':'Mark'} ${attr(h.title)} on ${fmtDate(d)}" aria-pressed="${!!h.completions?.[d]}"></button></td>`).join('')}</tr>`).join('')}</tbody></table>${compact?'':`<p class="small-note">Tap a day to mark a practice. This week: ${stats(state).habitsPercent}% complete.</p>`}`;}
  function visionImageButton(item){return `<button type="button" class="vision-image-button" data-open-vision="${attr(item.id)}" aria-label="View ${attr(item.title||'vision image')} larger"><img src="${attr(item.image)}" alt="${attr(item.title||'Vision Board image')}" loading="lazy"><span class="vision-image-hint" aria-hidden="true">${icon('search',16)}</span></button>`;}
  function renderToday(){
    const s=stats(state),d=state.days[selectedDate]||{},manifestations=state.manifestations.slice(0,4),viewingToday=selectedDate===localDate();
    const todayActions=state.actions.filter(a=>!a.done&&(viewingToday?(a.deadline?a.deadline<=selectedDate:a.period==='today'):a.deadline===selectedDate)).sort(actionSort).slice(0,5);
    const vision=state.visionBoard.slice(0,5);
    const goalRows=manifestations.length?manifestations.map((m,i)=>`<div class="list-row goal-row"><div class="list-thumb goal-thumb color-${i%4}">${icon(['target','leaf','sun','spark'][i%4],22)}</div><div class="row-copy"><strong>${esc(m.title)}</strong><small>${esc(m.category||'Personal Growth')}</small></div><div class="progress-track" aria-label="${pct(s.projectProgress[m.id])}% progress"><span style="--progress:${pct(s.projectProgress[m.id])}%"></span></div><span class="progress-number">${pct(s.projectProgress[m.id])}%</span></div>`).join(''):empty('Begin with one dream','Give a wish a name, a reason, and a first small step.','New manifestation','new-manifestation');
    const visionStrip=vision.length?vision.map(v=>`<div class="vision-cell">${v.image?visionImageButton(v):`<div class="text-tile">${esc(v.title)}</div>`}</div>`).join(''):`<div class="text-tile">I am becoming</div><img src="assets/hero-sunset.png" alt="Sunset coast inspiration"><div class="text-tile">Dream · Plan · Do</div><img src="assets/botanical-still.png" alt="Botanical inspiration"><div class="text-tile">One step today ♡</div>`;
    const topThree=state.actions.filter(a=>!a.done&&(a.deadline?a.deadline===selectedDate:viewingToday&&(a.period==='today'||a.period==='week'))).sort(actionSort).slice(0,3);
    return `<div class="hero-grid"><section class="hero">${appearanceMode()==='sculpted'?'<span class="sculpted-scene" aria-hidden="true"><i class="sculpted-arch"></i><i class="sculpted-orb"></i><i class="sculpted-leaf"></i></span>':''}<div class="hero-content"><h1>Your Dreams<br>Deserve a Plan</h1><p>Manifest the life you love — with inspired action.</p><button class="btn btn-primary hero-button" data-act="new-manifestation">${icon('plus',17)} New Manifestation</button></div><div class="hero-script">Big dreams<br>Small steps<br>Real change<br>♥</div></section><aside class="quote-card"><blockquote>The life you want is on the other side of consistent action.</blockquote><cite>A gentle reminder</cite></aside></div>
    <div class="feature-grid"><button class="feature-tile" data-go="vision"><span class="feature-icon">${icon('target',34)}</span><span class="feature-copy"><strong>Visualize</strong><small>Get clear on what you want</small></span></button><button class="feature-tile" data-go="manifestations"><span class="feature-icon">${icon('leaf',34)}</span><span class="feature-copy"><strong>Plan</strong><small>Break it down into steps</small></span></button><button class="feature-tile" data-go="actions"><span class="feature-icon">${icon('bolt',34)}</span><span class="feature-copy"><strong>Take Action</strong><small>Do the next right thing</small></span></button><button class="feature-tile" data-go="progress"><span class="feature-icon">${icon('chart',34)}</span><span class="feature-copy"><strong>Track &amp; Grow</strong><small>Celebrate your progress</small></span></button></div>
    <div class="dashboard-grid">
      ${panel('My Manifestations',goalRows,`<button data-go="manifestations">View All ${icon('arrow',15)}</button>`,'goals-panel')}
      ${panel(viewingToday?"Today's Actions":`Actions on ${fmtDate(selectedDate)}`,todayActions.length?todayActions.map(a=>actionRow(a,true)).join(''):`<div class="empty-state compact"><p>No actions set for this day yet.</p></div>`, `<button data-go="actions">See All ${icon('arrow',15)}</button>`,'actions-panel') .replace('</section>',`<button class="link-add" data-act="new-action">${icon('plus',18)} Add a new action</button></section>`)}
      ${panel('Habit Tracker',habitMatrix(true),`<button data-go="habits">This Week ${icon('chevron',14)}</button>`,'habit-panel')}
      ${panel('Vision Board',`<div class="vision-strip">${visionStrip}</div>`,`<button data-go="vision">View All ${icon('arrow',15)}</button>`,'vision-panel')}
      ${panel('My Progress',`<div class="rings">${ring('Goals',s.goalsPercent)}${ring('Habits',s.habitsPercent)}${ring('Actions',s.actionsPercent,'#bc8a80')}</div>`,`<button data-go="progress">This Month ${icon('chevron',14)}</button>`,'progress-panel')}
      <div class="photo-quote"><span>Progress<br>over<br>perfection ♡</span></div>
    </div>
    <div class="today-heading">${pageHead('Your daily practice','Today, one step at a time',`${journeyLabel(selectedDate)} · Current streak: ${s.streakDays} day${s.streakDays===1?'':'s'} · ${fmtDate(selectedDate)}`,`<button class="btn" data-act="prev-day" aria-label="Previous day">←</button><input type="date" class="date-picker" id="selected-date" value="${selectedDate}" aria-label="Choose a day"><button class="btn" data-act="today-date">Today</button><button class="btn" data-act="next-day" aria-label="Next day">→</button>`)}</div>
    ${writingFontControl()}<div class="section-grid daily-grid">
      ${panel("Today's Intention",`<div class="form-grid"><label class="field full">What matters most today?<textarea data-day-field="intention" placeholder="I choose to focus on…">${esc(d.intention)}</textarea></label><label class="field full">What am I calling in?<textarea data-day-field="callingIn" placeholder="I am making space for…">${esc(d.callingIn)}</textarea></label><label class="field full">One Small Action<input data-day-field="smallAction" value="${attr(d.smallAction)}" placeholder="The smallest helpful step I can take"></label><button class="btn btn-quiet" data-act="turn-small-action">Add this to Action Plan</button></div>`,'','daily-intention')}
      ${panel('Top 3 Actions',`${topThree.length?topThree.map(a=>actionRow(a)).join(''):empty('Choose the next right thing','Give yourself one clear action for today.','Add an action','new-action')}<div class="form-grid"><label class="field">Mood<select data-day-field="mood"><option value="">Choose mood</option>${['Hopeful','Calm','Focused','Tired','Anxious','Joyful','Other'].map(x=>`<option ${d.mood===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="field">Energy<select data-day-field="energy"><option value="">Choose energy</option>${['low','medium','high'].map(x=>`<option value="${x}" ${d.energy===x?'selected':''}>${x[0].toUpperCase()+x.slice(1)}</option>`).join('')}</select></label></div><p class="small-note">Your next step adapts to the energy you chose: <strong>${esc(suggestedActions()[0]?.title||'Add an action to see it here.')}</strong></p>`,'','daily-actions')}
      ${panel('Morning Affirmation',`<label class="field">Words to start with<input data-day-field="morningAffirmation" value="${attr(d.morningAffirmation)}" placeholder="I trust my next small step."></label><button class="btn btn-quiet" data-go="affirmations">${icon('spark',16)} Browse affirmations</button>`,'','daily-morning')}
      ${panel('Evening Reflection',`<label class="field">What moved forward today?<textarea data-day-field="eveningReflection" placeholder="What went well? What did I learn?">${esc(d.eveningReflection)}</textarea></label><button class="btn btn-quiet" data-act="new-evidence">${icon('plus',16)} Add evidence of progress</button>`,'','daily-evening')}
      ${renderJourneyCard(d,s)}
    </div>`;
  }
  function renderJourneyCard(d,s){
    const j=d.journey||{},started=!!state.journey.startDate;
    const position=journeyPosition(selectedDate),todayPosition=journeyPosition(localDate());
    const inWindow=started&&position>=1&&position<=30;
    const hasSavedEntry=j.completed||['intention','visualization','action','gratitude','reflection'].some(key=>!blank(j[key]));
    const offerStart=!started||todayPosition<1||todayPosition>30;
    const status=!started?'Ready when you are':todayPosition>30?`${s.journeyCompletedDays}/30 in your previous journey`:todayPosition<1?`Begins ${fmtDate(state.journey.startDate)}`:`${s.journeyCompletedDays}/30 days complete`;
    const fields=[['intention','Intention','What are you inviting in?'],['visualization','Visualization','What would this look and feel like?'],['action','One Action','What can you do today?'],['gratitude','Gratitude','What are you grateful for?'],['reflection','Reflection','What did you notice?']];
    const dayStart=Math.max(1,Math.min(position-3,24));
    return `<section class="panel full journey-panel"><div class="panel-head"><h2>30-Day Manifestation Journey</h2><span class="chip">${status}</span></div>
      <p class="muted">A five-part daily practice: intention → visualization → one action → gratitude → reflection.</p>
      ${started?`<div class="journey-track"><div class="progress-track"><span style="--progress:${s.journeyPercent}%"></span></div><small>${s.journeyPercent}%</small></div>`:''}
      ${offerStart?`<p class="small-note">${started?'Your dated entries stay in your history when you begin again.':'Begin a fresh 30-day practice from today.'}</p><button class="btn btn-primary" data-act="start-journey">${!started?'Start your 30 days':todayPosition>30?'Start a new 30 days':'Start today'}</button>`:''}
      ${inWindow?`<div class="journey-days">${Array.from({length:7},(_,i)=>dayStart+i).map(day=>`<span class="journey-day ${position===day?'current':''}">${String(day).padStart(2,'0')}</span>`).join('')}</div>`:''}
      ${started&&!inWindow?`<p class="small-note">${hasSavedEntry?'A saved journey entry from this date is shown below.':'This date is outside your current 30-day journey.'}</p>`:''}
      ${inWindow||hasSavedEntry?`<div class="form-grid">${fields.map(([key,label,placeholder])=>`<label class="field ${key==='reflection'?'full':''}">${label}<textarea data-journey-field="${key}" placeholder="${placeholder}">${esc(j[key])}</textarea></label>`).join('')}</div>`:''}
      ${inWindow?(selectedDate>localDate()?'<p class="small-note">Return on this date to complete the day.</p>':`<button class="btn ${j.completed?'btn-quiet':'btn-primary'}" data-act="complete-journey">${icon('check',16)} ${j.completed?'Day complete — reopen':'Complete this day'}</button>`):''}
    </section>`;
  }
  function renderManifestations(){
    if(currentRoute.id)return renderManifestationDetail(currentRoute.id);
    const cards=state.manifestations.map(m=>{const p=stats(state).projectProgress[m.id]||0;return `<article class="panel manifestation-card"><div class="manifestation-card-top"><span class="chip">${esc(m.category||'Your dream')}</span><span class="chip">${m.status==='completed'?'Completed':'In progress'}</span></div><h2>${esc(m.title)}</h2><p>${esc(m.want||'Add a clear description of what you want to create.')}</p><div class="progress-track"><span style="--progress:${p}%"></span></div><div class="card-foot"><small>${p}% progress · ${m.targetDate?fmtDate(m.targetDate):'No target date'}</small><button class="btn btn-quiet" data-detail="${attr(m.id)}">Open project ${icon('arrow',15)}</button></div></article>`;}).join('');
    return `${pageHead('Dream → Goal → Milestones → Next Action','My Manifestations','Each manifestation is a project with a clear why, a visible path, and room to evolve.',`<button class="btn btn-primary" data-act="new-manifestation">${icon('plus',16)} New Manifestation</button>`)}${state.manifestations.length?`<div class="section-grid">${cards}</div>`:panel('Start with a dream',empty('What are you calling in?','Name a dream, describe why it matters, then choose the first small action.','Create a manifestation','new-manifestation'))}`;
  }
  function renderManifestationDetail(id){
    const m=state.manifestations.find(x=>x.id===id);if(!m)return `${pageHead('My Manifestations','Project not found','This manifestation may have been removed.')}<button class="btn" data-go="manifestations">Back to manifestations</button>`;
    const related=state.actions.filter(a=>a.manifestationId===id),p=stats(state).projectProgress[id]||0,images=state.visionBoard.filter(v=>v.manifestationId===id),affs=state.affirmations.filter(a=>a.manifestationId===id);
    const next=related.filter(a=>!a.done).sort(actionSort)[0];
    return `<button class="btn btn-quiet" data-go="manifestations">← All manifestations</button>${pageHead(m.category||'Your manifestation',esc(m.title),esc(m.why||'Give this dream a reason that matters to you.'),`<button class="btn" data-act="edit-manifestation" data-id="${attr(id)}">${icon('edit',16)} Edit</button><button class="btn btn-primary" data-act="new-action" data-manifestation="${attr(id)}">${icon('plus',16)} Next Action</button>`)}
      <div class="section-grid"><section class="panel full project-lead"><div class="panel-head"><h2>Dream → Action</h2><span class="chip">${p}% progress</span></div><div class="progress-track"><span style="--progress:${p}%"></span></div><div class="ladder"><div><small>DREAM</small><strong>${esc(m.want||m.title)}</strong></div><div><small>90-DAY GOAL</small><strong>${esc(m.goal90||'Set a focused goal')}</strong></div><div><small>MILESTONES</small><strong>${m.milestones.length} step${m.milestones.length===1?'':'s'} planned</strong></div><div><small>THIS WEEK</small><strong>${esc(m.thisWeek||'Choose a weekly focus')}</strong></div><div><small>TODAY’S NEXT ACTION</small><strong>${esc(next?.title||'Choose a small step')}</strong></div></div></section>
      ${panel('The vision',`<dl class="detail-list"><dt>What do I want?</dt><dd>${esc(m.want||'—')}</dd><dt>Why does this matter?</dt><dd>${esc(m.why||'—')}</dd><dt>Desired date</dt><dd>${fmtDate(m.targetDate)}</dd><dt>How will I know?</dt><dd>${esc(m.measure||'—')}</dd><dt>Future self</dt><dd>${esc(m.futureSelf||'—')}</dd></dl>`)}
      ${panel('Milestones',`${m.milestones.length?m.milestones.map(ms=>`<div class="list-row"><input type="checkbox" data-toggle-milestone="${attr(ms.id)}" data-id="${attr(id)}" ${ms.done?'checked':''} aria-label="Complete ${attr(ms.title)}"><div class="row-copy"><strong class="${ms.done?'done':''}">${esc(ms.title)}</strong></div></div>`).join(''):empty('Map the middle','Milestones bridge the dream and today’s next step.')}<button class="link-add" data-act="new-milestone" data-id="${attr(id)}">${icon('plus',16)} Add milestone</button>`)}
      ${panel('Action steps',`${related.length?related.map(a=>actionRow(a)).join(''):empty('Make it real','Add a 5, 15, or 30 minute action.')}<button class="link-add" data-act="new-action" data-manifestation="${attr(id)}">${icon('plus',16)} Add action</button>`)}
      ${panel('Images & affirmations',`<div class="vision-strip small">${images.map(v=>v.image?visionImageButton(v):`<div class="text-tile">${esc(v.title)}</div>`).join('')}</div>${affs.length?affs.map(a=>`<p class="affirmation-line">“${esc(a.text)}”</p>`).join(''):'<p class="muted">Add imagery and affirmations to keep this vision close.</p>'}<div class="chip-row"><button class="btn btn-quiet" data-act="new-vision" data-manifestation="${attr(id)}">Add image</button><button class="btn btn-quiet" data-act="new-affirmation" data-manifestation="${attr(id)}">Add affirmation</button></div>`)}
      <div class="full card-foot"><button class="btn" data-act="toggle-manifestation" data-id="${attr(id)}">${m.status==='completed'?'Reopen manifestation':'Mark manifestation complete'}</button><button class="btn btn-danger" data-act="delete-manifestation" data-id="${attr(id)}">${icon('trash',16)} Delete project</button></div></div>`;
  }
  function stickerLibrary(){
    return panel('A little extra inspiration',`<p class="muted">Choose an original sticker to add to your board. You can remove it any time.</p><div class="sticker-grid">${STICKERS.map(([slug,label,category])=>`<button class="sticker-option" data-sticker="${attr(slug)}" aria-label="Add ${attr(label)} sticker"><img src="assets/stickers/${slug}.svg" alt=""><span>${esc(label)}</span></button>`).join('')}</div>`,'','sticker-library');
  }
  function renderVision(){
    const items=state.visionBoard,visible=items.filter(v=>visionFilter==='All'||v.category===visionFilter);
    return `${pageHead('See it clearly','Vision Board','Collect images and words for the life you are building. Choose a category for every piece.',`<button class="btn btn-primary" data-act="new-vision">${icon('plus',16)} Add to board</button>`)}<div class="chip-row category-row">${['All',...CATEGORIES].map(c=>`<button class="chip ${visionFilter===c?'selected':''}" data-vision-filter="${attr(c)}">${c}</button>`).join('')}</div>${visible.length?`<div class="vision-board-grid">${visible.map(v=>`<article class="vision-card">${v.image?visionImageButton(v):`<div class="vision-words">${esc(v.title)}</div>`}<div><strong>${esc(v.title)}</strong><small>${esc(v.category)}</small><button class="icon-btn" data-act="delete-vision" data-id="${attr(v.id)}" aria-label="Remove ${attr(v.title)}">${icon('trash',16)}</button></div></article>`).join('')}</div>`:panel('Your board',empty('A place for your images','Upload meaningful photos or add a word card. Everything stays in this browser.','Add your first piece','new-vision'))}${stickerLibrary()}`;
  }
  function calendarHasDailyContent(day){
    if(!day)return false;
    return ['calendarNote','intention','callingIn','smallAction','mood','energy','morningAffirmation','eveningReflection'].some(key=>!blank(day[key]))
      ||day.journey?.completed===true
      ||['intention','visualization','action','gratitude','reflection'].some(key=>!blank(day.journey?.[key]));
  }
  function calendarIndex(){
    const entries=new Map();
    const entry=date=>{if(!entries.has(date))entries.set(date,{actions:[],journals:[],wins:[],techniques:[],logs369:[],day:null});return entries.get(date);};
    for(const action of state.actions)if(action.deadline)entry(action.deadline).actions.push(action);
    for(const journal of state.journals)if(journal.date)entry(journal.date).journals.push(journal);
    for(const win of state.evidence)if(win.date)entry(win.date).wins.push(win);
    for(const session of state.techniqueSessions)if(session.date)entry(session.date).techniques.push(session);
    for(const log of state.logs369)if(log.date)entry(log.date).logs369.push(log);
    for(const [date,day] of Object.entries(state.days))if(calendarHasDailyContent(day))entry(date).day=day;
    return entries;
  }
  function renderCalendar(){
    const now=new Date(),today=localDate(now),timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time';
    const readableDate=date=>new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date(`${date}T12:00:00`));
    const clockTime=date=>new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(date);
    const monthDate=new Date(`${calendarMonth}-01T12:00:00`);
    const firstDay=`${calendarMonth}-01`,offset=(monthDate.getDay()+6)%7;
    const lastDay=new Date(monthDate);lastDay.setMonth(lastDay.getMonth()+1);lastDay.setDate(0);
    const daysInMonth=lastDay.getDate();
    const cellCount=Math.max(35,Math.ceil((offset+daysInMonth)/7)*7);
    const start=addDays(firstDay,-offset),entries=calendarIndex();
    const count=e=>e?(e.actions.length+e.journals.length+e.wins.length+e.techniques.length+e.logs369.length+(e.day?1:0)):0;
    const selected=entries.get(selectedDate)||{actions:[],journals:[],wins:[],techniques:[],logs369:[],day:state.days[selectedDate]||{}};
    const actions=selected.actions.slice().sort((a,b)=>String(a.dueTime||'99:99').localeCompare(String(b.dueTime||'99:99'))||actionSort(a,b));
    const dayName=readableDate(selectedDate);
    const eventList=[
      ...actions.map(a=>`<div class="calendar-event" data-record-id="${attr(a.id)}"><span class="calendar-event-time">${a.dueTime?esc(a.dueTime):'Anytime'}</span><div><div class="chip-row"><input type="checkbox" data-toggle-action="${attr(a.id)}" aria-label="${a.done?'Reopen':'Complete'} ${attr(a.title)}" ${a.done?'checked':''}><strong class="${a.done?'done':''}">${esc(a.title)}</strong></div><small>Action · ${esc(a.minutes)} min · ${esc(a.priority)} priority</small><button class="text-button" data-act="edit-action" data-id="${attr(a.id)}">Edit action</button></div></div>`),
      ...selected.journals.map(j=>`<div class="calendar-event"><span class="calendar-event-time">Journal</span><div><strong>${esc(j.title||j.type)}</strong><small>${esc(j.type)}</small><button class="text-button" data-act="edit-journal" data-id="${attr(j.id)}">Open entry</button></div></div>`),
      ...selected.wins.map(w=>`<div class="calendar-event"><span class="calendar-event-time">Win</span><div><strong>${esc(w.title)}</strong>${w.note?`<small>${esc(w.note)}</small>`:''}</div></div>`),
      ...selected.techniques.map(session=>`<div class="calendar-event"><span class="calendar-event-time">Practice</span><div><strong>${esc(TECHNIQUES.find(t=>t.id===session.technique)?.name||'Manifestation practice')}</strong><small>${session.completed?'Completed':'Draft saved'}</small></div></div>`),
      ...selected.logs369.map(log=>`<div class="calendar-event"><span class="calendar-event-time">369</span><div><strong>369 Method</strong><small>${log.completed?'Completed':'Draft saved'}</small></div></div>`)
    ].join('');
    const day=selected.day||state.days[selectedDate]||{};
    const dailyLines=[['Intention',day.intention],['One small action',day.smallAction],['Evening reflection',day.eveningReflection]].filter(([,value])=>!blank(value));
    const monthEntries=[...entries].filter(([date])=>monthKey(date)===calendarMonth);
    const monthCounts=monthEntries.reduce((totals,[,item])=>({actions:totals.actions+item.actions.length,journals:totals.journals+item.journals.length,wins:totals.wins+item.wins.length}),{actions:0,journals:0,wins:0});
    return `${pageHead('Your life, day by day','Calendar','Plan with the real date and time on your device. Your dated pages remain available beyond the 30-day journey.',`<button class="btn btn-primary" data-act="calendar-today">${icon('calendar',16)} Go to today</button>`)}
      <div class="calendar-live"><div><span class="eyebrow">LIVE LOCAL DATE</span><strong id="calendar-live-date">${esc(readableDate(today))}</strong><small>Your device sets the date and time.</small></div><div><strong><time id="calendar-live-clock" datetime="${attr(now.toISOString())}">${esc(clockTime(now))}</time></strong><small id="calendar-timezone">${esc(timeZone)}</small></div></div>
      <div class="calendar-layout"><section class="calendar-panel"><div class="calendar-header"><h2>${esc(new Intl.DateTimeFormat('en',{month:'long',year:'numeric'}).format(monthDate))}</h2><div class="chip-row"><button class="btn" data-act="calendar-prev" aria-label="Previous month">←</button><input type="month" class="date-picker" id="calendar-month" value="${attr(calendarMonth)}" aria-label="Choose month and year"><button class="btn" data-act="calendar-next" aria-label="Next month">→</button></div></div>
      <div class="calendar-weekdays" aria-hidden="true">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<span>${x}</span>`).join('')}</div>
      <div class="calendar-grid">${Array.from({length:cellCount},(_,i)=>{const date=addDays(start,i),entry=entries.get(date),n=count(entry),outside=monthKey(date)!==calendarMonth;return `<button type="button" class="calendar-day${outside?' outside':''}${date===today?' today':''}${date===selectedDate?' selected':''}${n?' has-events':''}" data-calendar-date="${date}" aria-label="${attr(readableDate(date))}${date===today?', today':''}${n?`, ${n} saved item${n===1?'':'s'}`:''}" aria-pressed="${date===selectedDate}"><span class="calendar-day-number">${Number(date.slice(-2))}</span><span class="calendar-day-dots" aria-hidden="true">${Array.from({length:Math.min(n,3)},()=>'<i></i>').join('')}</span>${entry?.actions[0]?`<small>${esc(entry.actions[0].title)}</small>`:''}</button>`;}).join('')}</div>
      <div class="calendar-summary"><div><strong>${monthCounts.actions}</strong><small>Dated actions</small></div><div><strong>${monthCounts.journals}</strong><small>Journal entries</small></div><div><strong>${monthCounts.wins}</strong><small>Wins recorded</small></div></div></section>
      <aside class="calendar-day-detail"><span class="eyebrow">SELECTED DAY</span><h2>${esc(dayName)}</h2><p>${selectedDate===today?'Today':selectedDate<today?'A saved day in your history':'A day ahead'} · ${esc(journeyLabel(selectedDate))}</p><div class="chip-row"><button class="btn btn-primary" data-act="calendar-add-action">${icon('plus',15)} Add dated action</button><button class="btn" data-act="calendar-open-day">Open daily page</button></div>
      <label class="field calendar-note">Notes for this day<textarea data-calendar-note rows="3" placeholder="What matters on this date?">${esc(day.calendarNote||'')}</textarea></label>
      ${dailyLines.map(([label,value])=>`<div class="calendar-event"><span class="calendar-event-time">${esc(label)}</span><div><strong>${esc(value)}</strong></div></div>`).join('')}
      ${day.journey?.completed?`<div class="calendar-event"><span class="calendar-event-time">Journey</span><div><strong>30-day practice complete</strong><small>Your dated entry remains here.</small></div></div>`:''}
      ${eventList||dailyLines.length||day.journey?.completed?'':'<p class="small-note">No dated actions or entries yet. Add a note or plan one small step for this day.</p>'}
      ${eventList}</aside></div>`;
  }
  function renderActions(){
    const groups=[['today','Today'],['week','This Week'],['month','This Month'],['later','Later'],['done','Done']];
    const filtered=state.actions.filter(a=>actionFilter==='all'||a.energy===actionFilter||a.priority===actionFilter||String(a.minutes)===actionFilter);
    const next=suggestedActions()[0];
    return `${pageHead('Dreams need movement','Action Plan','Choose a small, practical step that fits your time and energy.',`<button class="btn" data-act="focus-timer">Focus timer</button><button class="btn btn-primary" data-act="new-action">${icon('plus',16)} New Action</button>`)}<section class="panel next-step"><span class="eyebrow">TODAY’S NEXT STEP</span><h2>${esc(next?.title||'Your next step begins with one action.')}</h2><p>${next?`${next.minutes} minutes · ${next.energy} energy · ${next.priority} priority`:'Add a practical task, then come back for a clear suggestion.'}</p>${next?`<button class="btn btn-primary" data-act="focus-action" data-id="${attr(next.id)}">Focus on this</button>`:''}</section><div class="toolbar"><div class="chip-row">${['all','low','medium','high','5','15','30'].map(x=>`<button class="chip ${actionFilter===x?'selected':''}" data-action-filter="${x}">${x==='all'?'All':/^\d/.test(x)?`${x} min`:`${x[0].toUpperCase()+x.slice(1)}`}</button>`).join('')}</div><small class="muted">${state.actions.filter(a=>a.done).length}/${state.actions.length} completed</small></div><div class="section-grid">${groups.map(([key,label])=>panel(label,filtered.filter(a=>key==='done'?a.done:a.period===key&&!a.done).sort(actionSort).map(a=>actionRow(a)).join('')||`<p class="muted">Nothing here yet.</p>`)).join('')}</div>`;
  }
  function renderJournal(){
    const entries=state.journals.filter(j=>journalFilter==='All'||j.type===journalFilter).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    return `${pageHead('A place to return to','Journal','Capture intentions, gratitude, scripting, lessons, and the evidence you are growing.',`<button class="btn btn-primary" data-act="new-journal">${icon('plus',16)} New Entry</button>`)}${writingFontControl()}<div class="chip-row category-row">${['All',...JOURNAL_TYPES].map(t=>`<button class="chip ${journalFilter===t?'selected':''}" data-journal-filter="${attr(t)}">${t}</button>`).join('')}</div><div class="section-grid"><section class="panel"><div class="panel-head"><h2>Scripting prompts</h2></div><p class="muted">Write from the perspective of the future you are creating.</p>${SCRIPTING_PROMPTS.map(p=>`<button class="prompt-line" data-act="script-prompt" data-prompt="${attr(p)}">${icon('edit',15)} ${esc(p)}</button>`).join('')}</section><section class="panel"><div class="panel-head"><h2>Entries</h2></div>${entries.length?entries.map(j=>`<article class="journal-row" data-record-id="${attr(j.id)}" tabindex="-1"><span class="chip">${esc(j.type)}</span><small>${fmtDate(j.date)}</small><h3>${esc(j.title||j.body?.slice(0,44)||'Untitled entry')}</h3><p class="writing-preview" data-entry-font="${attr(j.font||'')}">${esc(j.body?.slice(0,175))}</p><div class="chip-row"><button class="btn btn-quiet" data-act="edit-journal" data-id="${attr(j.id)}">Open entry</button><button class="btn btn-quiet" data-act="delete-journal" data-id="${attr(j.id)}">Delete</button></div></article>`).join(''):empty('Your pages begin here','Choose a type or use a prompt. Your dated entries will stay available year after year.','Write an entry','new-journal')}</section></div>`;
  }
  function renderHabits(){
    const habits=state.habits.filter(h=>h.active!==false),s=stats(state);
    return `${pageHead('Keep it gentle','Habit Tracker','A small, sustainable set of practices. Add up to eight and mark the days you show up.',`<button class="btn btn-primary" data-act="new-habit" ${habits.length>=8?'disabled':''}>${icon('plus',16)} Add Habit</button>`)}<div class="section-grid"><section class="panel full"><div class="panel-head"><h2>Weekly rhythm</h2><div class="chip-row"><button class="btn" data-act="prev-week">←</button><span class="chip">${fmtDate(weekStart(habitWeek))}–${fmtDate(addDays(weekStart(habitWeek),6))}</span><button class="btn" data-act="next-week">→</button></div></div>${habitMatrix()}</section><section class="panel"><div class="panel-head"><h2>Your habits</h2><span class="chip">${habits.length}/8</span></div>${habits.length?habits.map(h=>`<div class="list-row"><div class="row-copy"><strong>${esc(h.title)}</strong><small>${Object.values(h.completions||{}).filter(Boolean).length} ${Object.values(h.completions||{}).filter(Boolean).length===1?'day':'days'} completed · ${habitStreak(h)} day streak</small></div><button class="icon-btn" data-act="delete-habit" data-id="${attr(h.id)}" aria-label="Delete ${attr(h.title)}">${icon('trash',16)}</button></div>`).join(''):empty('Start with one','A single practice is enough to begin.')}</section><section class="panel"><div class="panel-head"><h2>Ideas to begin</h2></div><div class="chip-row">${['Meditation','Reading','Exercise','Visualization','Gratitude'].map(x=>`<button class="chip" data-act="preset-habit" data-title="${x}" ${habits.length>=8||habits.some(h=>h.title===x)?'disabled':''}>${icon('plus',13)} ${x}</button>`).join('')}</div><p class="small-note">This week’s consistency: ${s.habitsPercent}% across ${s.habitOpportunities} possible check-ins.</p></section></div>`;
  }
  function renderProgress(){
    const s=stats(state),wins=state.evidence.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))),completed=state.manifestations.filter(m=>m.status==='completed');
    return `${pageHead('Notice what is changing','Progress','Your numbers reflect only the goals, actions, habits, and journey days you have actually saved.',`<button class="btn" data-go="monthly">Monthly Reset ${icon('arrow',16)}</button><button class="btn btn-primary" data-act="new-evidence">${icon('plus',16)} Add Evidence</button>`)}<div class="section-grid three"><section class="panel metric-card">${ring('Goals',s.goalsPercent)}<small>${s.completedGoals}/${s.goalCount} completed manifestations</small></section><section class="panel metric-card">${ring('Actions',s.actionsPercent)}<small>${s.completedActions}/${s.actionCount} actions done</small></section><section class="panel metric-card">${ring('Habits',s.habitsPercent)}<small>${s.habitCompletions}/${s.habitOpportunities} check-ins this week</small></section></div><div class="section-grid progress-lower">${panel('30-Day Journey',`<div class="big-number">${s.journeyCompletedDays}<small> / 30 days completed</small></div><div class="progress-track"><span style="--progress:${s.journeyPercent}%"></span></div><p class="small-note">Current day: ${journeyLabel(localDate())} · Daily streak: ${s.streakDays} day${s.streakDays===1?'':'s'}</p><button class="btn btn-quiet" data-go="today">Continue today ${icon('arrow',15)}</button>`)}${panel('Completed Manifestations',completed.length?completed.map(m=>`<div class="list-row"><div class="row-copy"><strong>${esc(m.title)}</strong><small>${fmtDate(m.completedAt)}</small></div></div>`).join(''):empty('Your archive is growing','Completed projects will appear here.'))}${panel('Evidence that I’m moving forward',wins.length?wins.map(w=>`<article class="win-row" data-record-id="${attr(w.id)}" tabindex="-1"><span class="win-icon">${icon('spark',16)}</span><div><strong>${esc(w.title)}</strong><small>${fmtDate(w.date)}${w.note?` · ${esc(w.note)}`:''}</small></div><button class="icon-btn" data-act="delete-evidence" data-id="${attr(w.id)}" aria-label="Delete ${attr(w.title)}">${icon('trash',15)}</button></article>`).join(''):empty('Small wins count','First attempts, finished drafts, brave conversations — collect your proof.','Add evidence','new-evidence'),`<button data-act="new-evidence">Add Win ${icon('plus',15)}</button>`,'full')}</div>`;
  }
  function renderAffirmations(){
    const list=state.affirmations.filter(a=>affirmationFilter==='All'||a.category===affirmationFilter),today=localDate();
    return `${pageHead('Words that support action','Affirmations','Create your own phrases, save favorites, and choose one for the morning.',`<button class="btn btn-primary" data-act="new-affirmation">${icon('plus',16)} New Affirmation</button>`)}<div class="chip-row category-row">${['All',...AFFIRMATION_CATEGORIES].map(c=>`<button class="chip ${affirmationFilter===c?'selected':''}" data-affirmation-filter="${c}">${c}</button>`).join('')}</div>${list.length?`<div class="section-grid">${list.map(a=>`<article class="panel affirmation-card" data-record-id="${attr(a.id)}" tabindex="-1"><div class="panel-head"><span class="chip">${esc(a.category)}</span><button class="icon-btn ${a.favorite?'fav':''}" data-act="favorite-affirmation" data-id="${attr(a.id)}" aria-label="${a.favorite?'Unfavorite':'Favorite'} affirmation">${icon('heart',18)}</button></div><blockquote>“${esc(a.text)}”</blockquote><div class="card-foot"><button class="btn btn-quiet" data-act="set-morning-affirmation" data-id="${attr(a.id)}">Use this morning</button><button class="btn ${a.completedDates?.[today]?'btn-primary':''}" data-act="complete-affirmation" data-id="${attr(a.id)}">${a.completedDates?.[today]?'Completed today ✓':'Mark completed today'}</button><button class="icon-btn" data-act="delete-affirmation" data-id="${attr(a.id)}" aria-label="Delete affirmation">${icon('trash',15)}</button></div></article>`).join('')}</div>`:panel('Your affirmations',empty('Write words that feel true and useful','Keep them personal, grounded, and connected to what you can do.','Add affirmation','new-affirmation'))}`;
  }
  function techniqueTabs(active=''){
    return `<div class="technique-method-tabs" role="navigation" aria-label="Choose a technique"><button type="button" data-go="techniques" class="${active?'':'active'}">All techniques</button>${TECHNIQUES.map(method=>`<button type="button" class="${active===method.id?'active':''}" data-technique="${method.id}">${esc(method.name)}</button>`).join('')}</div>`;
  }
  function techniqueSession(technique,date=selectedDate,create=false){
    let session=state.techniqueSessions.find(item=>item.technique===technique&&item.date===date);
    if(!session&&create){const now=new Date().toISOString();session={id:makeId(),technique,date,manifestationId:'',fields:{},completed:false,createdAt:now,updatedAt:now};state.techniqueSessions.push(session);}
    return session;
  }
  const lineCount=value=>String(value||'').split('\n').filter(line=>line.trim()).length;
  function renderTechniques(){
    const method=TECHNIQUES.find(item=>item.id===currentRoute.id);
    if(method?.id==='369')return render369();
    if(method){
      const session=techniqueSession(method.id),fields=session?.fields||{},history=state.techniqueSessions.filter(item=>item.technique===method.id&&item.date!==selectedDate).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,6);
      return `<button class="btn btn-quiet" data-go="techniques">← All techniques</button>${pageHead(method.tag,method.name,method.summary,`<input type="date" class="date-picker" id="selected-date" value="${selectedDate}" aria-label="Choose a practice date">`)}${techniqueTabs(method.id)}${writingFontControl()}<div class="section-grid"><section class="technique-card technique-guide"><span class="technique-badge">${esc(method.time)}</span><h2>A little guidance</h2><ol class="technique-steps">${method.steps.map(step=>`<li class="technique-step"><span>${esc(step)}</span></li>`).join('')}</ol><p>Use this practice to clarify your intention and choose a practical next step. A writing ritual does not guarantee an outcome.</p></section><section class="technique-practice"><div class="panel-head"><h2>Your practice · ${fmtDate(selectedDate)}</h2><span class="chip">${session?.completed?'Completed':session?'Draft':'Not started'}</span></div>${writingFontControl(true)}<form id="technique-form" data-form="technique" data-technique="${method.id}"><div class="form-grid"><label class="field full">Connect to a manifestation<select name="manifestationId" data-technique-manifestation><option value="">No project selected</option>${state.manifestations.map(item=>`<option value="${attr(item.id)}" ${session?.manifestationId===item.id?'selected':''}>${esc(item.title)}</option>`).join('')}</select></label>${method.fields.map(([key,label,placeholder])=>`<label class="field full">${esc(label)}<textarea name="${key}" data-technique-field="${key}" rows="${key==='repetitions'?8:4}" placeholder="${attr(placeholder)}">${esc(fields[key]||'')}</textarea>${key==='repetitions'?`<small class="technique-line-count">${lineCount(fields[key])}/55 lines written today</small>`:''}</label>`).join('')}</div><div class="form-actions"><button class="btn" type="submit" data-complete="false">Save draft</button><button class="btn btn-primary" type="submit" data-complete="true">Mark practice complete</button><button class="btn btn-quiet" type="button" data-act="technique-to-action">Add next action →</button></div></form></section></div><section class="panel technique-history"><h3>Other saved sessions</h3>${history.length?history.map(item=>`<article class="history-entry"><div><strong>${fmtDate(item.date)}</strong><small> · ${item.completed?'Completed':'Draft'}</small></div><p>${esc(item.fields?.action||item.fields?.statement||'Saved reflection')}</p><div class="chip-row"><button class="btn btn-quiet" data-act="open-technique-date" data-date="${item.date}">Open</button><button class="icon-btn" data-act="delete-technique" data-id="${attr(item.id)}" aria-label="Delete practice from ${fmtDate(item.date)}">${icon('trash',15)}</button></div></article>`).join(''):'<p>Your saved sessions will appear here.</p>'}</section>`;
    }
    return `${pageHead('Intention, reflection, action','Manifestation Techniques','Choose one practice that fits your day. Each guide ends with a small real-world action.')}<section class="panel technique-intro"><p>Start where you are. You can try a two-minute visualization, a writing practice, or a concrete if–then plan. Your entries stay private in this browser.</p></section><div class="techniques-grid">${TECHNIQUES.map(item=>{const sessions=state.techniqueSessions.filter(session=>session.technique===item.id&&session.completed).length;return `<article class="technique-card"><span class="technique-badge">${esc(item.tag)} · ${esc(item.time)}</span><h2>${esc(item.name)}</h2><p>${esc(item.summary)}</p><ol class="technique-steps">${item.steps.map(step=>`<li class="technique-step"><span>${esc(step)}</span></li>`).join('')}</ol><div class="card-foot"><small>${item.id==='369'?`${state.logs369.filter(log=>log.completed).length} completed days`:`${sessions} completed session${sessions===1?'':'s'}`}</small><button class="btn btn-primary" data-technique="${item.id}">Open guide ${icon('arrow',15)}</button></div></article>`}).join('')}</div>`;
  }
  function render369(){
    const record=state.logs369.find(l=>l.date===selectedDate)||{text:'',morning:'',afternoon:'',evening:''};
    const complete=record.completed===true;
    return `<button class="btn btn-quiet" data-go="techniques">← All techniques</button>${pageHead('Writing rhythm','369 Method','Use three short writing moments to return to your intention, then choose one real action.',`<input type="date" class="date-picker" id="selected-date" value="${selectedDate}" aria-label="Choose a day">`)}${techniqueTabs('369')}${writingFontControl()}<div class="section-grid"><section class="technique-card technique-guide"><span class="technique-badge">Across the day</span><h2>A little guidance</h2><ol class="technique-steps">${TECHNIQUES[0].steps.map(step=>`<li class="technique-step"><span>${esc(step)}</span></li>`).join('')}</ol><p>The number pattern is a writing ritual, not a promise or a scientific multiplier. Let it point you toward action.</p></section><section class="technique-practice"><div class="panel-head"><h2>Your practice · ${fmtDate(selectedDate)}</h2><span class="chip">${complete?'Completed':'In progress'}</span></div><div class="form-grid"><label class="field full">My chosen statement<input data-log369-field="text" value="${attr(record.text)}" placeholder="A grounded phrase you want to return to"></label><label class="field full">Connect to a manifestation<select data-log369-field="manifestationId"><option value="">No project selected</option>${state.manifestations.map(item=>`<option value="${attr(item.id)}" ${record.manifestationId===item.id?'selected':''}>${esc(item.title)}</option>`).join('')}</select></label></div><p class="small-note">Write the statement yourself, one repetition per line. Your words save as you type.</p></section></div><div class="section-grid three ritual-grid">${[['morning',3],['afternoon',6],['evening',9]].map(([key,target])=>`<section class="panel ritual-card"><span class="eyebrow">${key.toUpperCase()} × ${target}</span><h2>${lineCount(record[key])}/${target} lines</h2>${writingFontControl(true)}<textarea data-log369-field="${key}" rows="${Math.min(target+1,10)}" placeholder="One repetition per line">${esc(record[key])}</textarea><div class="progress-track"><span style="--progress:${pct(lineCount(record[key])/target*100)}%"></span></div></section>`).join('')}</div><section class="panel technique-next"><div class="panel-head"><h2>Bring it into today</h2></div><label class="field">One real action<input data-log369-field="oneAction" value="${attr(record.oneAction||'')}" placeholder="What is one small step you can take?"></label><div class="form-actions"><button class="btn" data-act="complete-369">${complete?'Reopen this day':'Mark practice complete'}</button><button class="btn btn-primary" data-act="369-to-action">Add next action ${icon('arrow',15)}</button></div></section>`;
  }
  function renderFuture(){
    const f=state.futureSelf,fields=[['identity','Who am I becoming?'],['dailyActions','What do I do daily?'],['stopDoing','What do I stop doing?'],['environment','Environment'],['money','Money'],['relationships','Relationships'],['career','Career'],['health','Health'],['lifestyle','Lifestyle'],['letter','Letter From Future Me']];
    return `${pageHead('Meet the person you are becoming','Future Self','Describe the life you are practicing, then connect the vision to today’s behavior.')}${writingFontControl()}<div class="section-grid"><section class="panel full"><div class="form-grid">${fields.map(([key,label])=>`<label class="field ${key==='letter'?'full':''}">${label}<textarea data-future-field="${key}" placeholder="${key==='letter'?'Dear me, I’m proud that you…':'Write in your own words…'}">${esc(f[key])}</textarea></label>`).join('')}</div><p class="small-note">Your writing saves when you leave each field.</p></section></div>`;
  }
  function reviewForm(kind){
    const weekly=kind==='weekly',key=weekly?weekStart(selectedDate):monthKey(selectedDate),collection=weekly?state.weeklyReviews:state.monthlyReviews,record=collection.find(r=>(weekly?r.weekStart:r.month)===key)||{},fields=weekly?[['movedForward','What moved forward?'],['worked','What worked?'],['blocked','What blocked me?'],['releasing','What am I releasing?'],['nextWeek','What matters next week?'],['firstAction',"Next week’s first action"]]:[['biggestWin','Biggest win'],['whatChanged','What changed?'],['adjustments','What needs adjustment?'],['nextIntention','Next month intention']];
    const actions=state.actions.filter(a=>a.completedAt&&localDate(new Date(a.completedAt)).startsWith(weekly?key.slice(0,7):key)).length;
    return `${pageHead(weekly?'Reflect and reset':'A wider view',weekly?'Weekly Review':'Monthly Reset',weekly?`Week of ${fmtDate(key)}. Notice your progress and choose next week’s first move.`:`${new Intl.DateTimeFormat('en',{month:'long',year:'numeric'}).format(new Date(`${key}-01T12:00:00`))}. Keep what works, adjust what does not.`,`<button class="btn" data-act="${weekly?'prev-week-review':'prev-month'}">←</button><input type="date" class="date-picker" id="selected-date" value="${selectedDate}" aria-label="Choose a date"><button class="btn" data-act="${weekly?'next-week-review':'next-month'}">→</button>`)}${writingFontControl()}<div class="section-grid"><section class="panel full"><div class="form-grid">${fields.map(([field,label])=>`<label class="field">${label}<textarea data-review-kind="${kind}" data-review-field="${field}" placeholder="Write your honest reflection…">${esc(record[field])}</textarea></label>`).join('')}</div></section>${weekly?panel('Next week’s first action',`<p>${esc(record.firstAction||'Choose one specific, manageable step.')}</p><button class="btn btn-quiet" data-act="review-to-action">${icon('plus',15)} Add it to Action Plan</button>`):panel('This month in your app',`<div class="review-stats"><div><strong>${state.manifestations.filter(m=>m.status==='completed'&&m.completedAt&&localDate(new Date(m.completedAt)).startsWith(key)).length}</strong><small>Goals completed</small></div><div><strong>${actions}</strong><small>Actions completed</small></div><div><strong>${monthlyHabitPercent(key)}%</strong><small>Habit consistency in this month</small></div></div><p class="small-note">Statistics use saved records only.</p>`)}</div>`;
  }
  function renderThemes(){
    const legacy={'rose-clay':'dawn-blush','coastal':'coastal-mist','olive':'desert-clay'};
    const active=THEMES.find(theme=>theme.id===(legacy[state.theme.themeId]||state.theme.themeId))||THEMES[0];
    const appearance=appearanceMode(),finish=APPEARANCES.find(([id])=>id===appearance)[1];
    return `${pageHead('A space that feels like yours','Themes','Choose your finish, then a color palette. Your writing font and menu layout stay yours.',`<button class="btn" data-act="jump-writing">Writing font</button><button class="btn" data-act="jump-menu">Menu layout</button>`)}
      <section class="panel appearance-finish" aria-labelledby="appearance-title"><div class="panel-head"><h2 id="appearance-title">Choose your look</h2></div><p>One planner, three finishes. Use any palette with Normal, 3D Glass, or Sculpted 3D.</p><div class="appearance-mode-grid">${APPEARANCES.map(([id,name,description])=>`<button class="appearance-style-option${appearance===id?' selected':''}" type="button" data-appearance-style="${id}" aria-pressed="${appearance===id}"><span class="appearance-preview" data-appearance-preview="${id}" aria-hidden="true"><span class="preview-side"></span><span class="preview-head"></span><span class="preview-card"></span></span><strong>${name}</strong><small>${description}</small></button>`).join('')}</div></section>
      <div class="theme-palette-heading"><h2>Color palette</h2><span>${finish} · ${THEMES.length} palettes</span></div><div class="themes-grid">${THEMES.map(theme=>`<button class="theme-card ${active.id===theme.id?'selected':''}" type="button" data-theme-id="${theme.id}" aria-pressed="${active.id===theme.id}" style="--theme-main:${theme.main};--theme-accent:${theme.accent};--theme-bg:${theme.bg};--theme-paper:${theme.paper};--theme-ink:${theme.ink}"><span class="theme-preview" aria-hidden="true"><span class="theme-preview-sidebar"></span><span class="theme-preview-hero"></span><span class="theme-preview-tile"></span><span class="theme-preview-title">Dreams need a plan</span><span class="theme-preview-note">One step today</span></span><span class="theme-swatch" aria-hidden="true"><i></i><i></i><i></i></span><strong>${theme.name}</strong><small>${theme.mood}</small></button>`).join('')}</div>
      <section class="panel appearance-writing"><div class="panel-head"><h2>Your writing style</h2></div><p>Choose the default look for journal pages, reflections, and guided writing. Each journal entry can have its own font.</p>${writingFontControl()}</section><section class="panel appearance-menu"><div class="panel-head"><h2>Menu layout</h2></div><p>Choose how to move around your space. Every section stays available on smaller screens.</p><div class="menu-style-grid">${MENU_STYLES.map(([id,name,description])=>`<button class="menu-style-option" type="button" data-menu-style="${id}" aria-pressed="${state.theme.menuStyle===id}"><span class="menu-style-preview" data-menu-preview="${id}" aria-hidden="true"><span class="preview-side"></span><span class="preview-head"></span><span class="preview-card"></span></span><strong>${name}</strong><small>${description}</small></button>`).join("")}</div></section><section class="panel theme-options"><div class="panel-head"><h2>A quieter experience</h2></div><label class="toggle-line"><input type="checkbox" data-theme="extraCalm" ${state.theme.extraCalm?'checked':''}> Extra Calm Mode <small>Reduces decorative movement throughout the app.</small></label></section>`;
  }
  function renderData(){
    return `${pageHead('Keep your work with you','Data & Print','Your entries are saved in this browser. Download a backup before changing devices or clearing browser data.')}<div class="section-grid"><section class="panel"><div class="panel-head"><h2>Backup & restore</h2></div><p>Download one readable JSON file with your projects, calendar notes, dated actions and their times, journal, vision board, habits, reviews, name, and theme choices.</p><div class="chip-row"><button class="btn btn-primary" data-act="backup">${icon('download',16)} Download backup</button><button class="btn upload-label" data-act="restore-backup">${icon('upload',16)} Restore backup</button><input id="restore-file" type="file" accept=".json,application/json" hidden></div><p class="small-note">To move devices: download, send the file to yourself, then restore it on the new device. No account or cloud sync.</p><button class="btn btn-danger" data-act="reset-data">Erase local data</button></section><section class="panel"><div class="panel-head"><h2>Print / PDF Center</h2></div><p>Use your browser’s Print dialog to print or save a PDF of the part you need.</p><div class="print-options">${[['today','Today’s page'],['calendar','Selected calendar day'],['actions','Action plan'],['manifestations','Manifestations'],['journal','Journal entries'],['progress','Progress summary'],['techniques','Technique sessions']].map(([key,label])=>`<button class="btn" data-print="${key}">${icon('print',16)} ${label}</button>`).join('')}</div></section><section class="panel full"><div class="panel-head"><h2>Install & privacy</h2></div><p>Install the app from a secure website for quick access. Your entries remain in this browser’s local storage; installation does not create an account or automatic device sync.</p><button class="btn" data-act="install">Install app</button><p class="small-note">iPhone/iPad: Safari → Share → Add to Home Screen. Android/desktop: browser menu → Install app or Add to Home screen. Installation requires HTTPS or localhost.</p></section></div>`;
  }
  function render(){currentRoute=routeFromHash();applyTheme();let content;switch(currentRoute.page){case 'today':content=renderToday();break;case 'calendar':content=renderCalendar();break;case 'manifestations':content=renderManifestations();break;case 'vision':content=renderVision();break;case 'actions':content=renderActions();break;case 'journal':content=renderJournal();break;case 'habits':content=renderHabits();break;case 'progress':content=renderProgress();break;case 'affirmations':content=renderAffirmations();break;case 'techniques':content=renderTechniques();break;case 'method369':content=render369();break;case 'future':content=renderFuture();break;case 'weekly':content=reviewForm('weekly');break;case 'monthly':content=reviewForm('monthly');break;case 'themes':case 'theme':content=renderThemes();break;case 'data':content=renderData();break;default:content=renderToday();}APP.innerHTML=shell(content);APP.querySelectorAll('textarea').forEach(field=>field.classList.add('writing-input'));const scrim=APP.querySelector('.sidebar-scrim');if(scrim)scrim.hidden=true;updateLiveClock();focusSession?.refreshAppearance();}
  function updateLiveClock(){
    const now=new Date(),date=localDate(now),clock=APP.querySelector('#calendar-live-clock'),dateLabel=APP.querySelector('#calendar-live-date'),zoneLabel=APP.querySelector('#calendar-timezone');
    if(clock){clock.textContent=new Intl.DateTimeFormat('en',{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now);clock.dateTime=now.toISOString();}
    if(dateLabel)dateLabel.textContent=new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(now);
    if(zoneLabel)zoneLabel.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||'Local time';
    if(date!==observedLocalDate){const wasToday=selectedDate===observedLocalDate;observedLocalDate=date;if(wasToday){selectedDate=date;if(calendarMonth===monthKey(addDays(date,-1)))calendarMonth=monthKey(date);}if(currentRoute.page==='today'||currentRoute.page==='calendar')render();}
  }
  function applyTheme(){
    const t=state.theme||{},root=document.documentElement,legacy={'rose-clay':'dawn-blush','coastal':'coastal-mist','olive':'desert-clay'};
    const theme=THEMES.find(item=>item.id===(legacy[t.themeId]||t.themeId))||THEMES[0];
    const appearance=appearanceMode();
    const main=theme.main,rgb=main.match(/[0-9a-f]{2}/gi)?.map(part=>parseInt(part,16)/255)||[.33,.45,.36];
    const luminance=rgb.map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4).reduce((sum,value,i)=>sum+value*[.2126,.7152,.0722][i],0);
    root.style.setProperty('--on-main',luminance>.18?'#1e2922':'#ffffff');
    root.style.setProperty('--sage',theme.main);root.style.setProperty('--sage-dark',theme.main);root.style.setProperty('--accent',theme.accent);root.style.setProperty('--canvas',theme.bg);root.style.setProperty('--paper',theme.paper);root.style.setProperty('--ink',theme.ink);
    root.style.setProperty('--sidebar',`color-mix(in srgb, ${theme.bg} 82%, ${theme.main})`);
    root.style.setProperty('--muted',`color-mix(in srgb, ${theme.ink} ${appearance==='normal'?76:86}%, ${theme.bg})`);
    root.style.setProperty('--line',`color-mix(in srgb, ${theme.main} 15%, ${theme.bg})`);
    root.style.setProperty('--sage-soft',`color-mix(in srgb, ${theme.main} 11%, ${theme.paper})`);
    root.style.setProperty('--cream',`color-mix(in srgb, ${theme.accent} 7%, ${theme.paper})`);
    root.style.setProperty('--hero-shade',theme.hero);
    const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.content=theme.bg;
    root.style.setProperty('--font-body',(appearance!=='normal'||['midnight-ink','coastal-mist','soft-sanctuary','porcelain-garden'].includes(theme.id))?'"Inter", Arial, sans-serif':'"Nunito Sans", Arial, sans-serif');
    root.style.setProperty('--font-display',(appearance!=='normal'||theme.id==='soft-sanctuary'||theme.id==='porcelain-garden')?'"Inter", Arial, sans-serif':theme.id==='midnight-ink'||theme.id==='coastal-mist'?'"Lora", Georgia, serif':'"Cormorant Garamond", Georgia, serif');
    root.style.setProperty('--font-script',`"${({'golden-ember':'Sacramento','dawn-blush':'Dancing Script','pink-bloom':'Dancing Script','desert-clay':'Kalam','coastal-mist':'Caveat','midnight-ink':'Patrick Hand'})[theme.id]||'Caveat'}", cursive`);
    root.dataset.appearance=appearance;root.dataset.theme=theme.id;root.dataset.handwritingScope='accents';root.dataset.night='false';root.dataset.calm=t.extraCalm?'true':'false';
    root.dataset.writingFont=WRITING_FONTS.some(([id])=>id===t.writingFont)?t.writingFont:'nunito';
    root.dataset.menuStyle=MENU_STYLES.some(([id])=>id===t.menuStyle)?t.menuStyle:'sidebar';
  }
  function field(label,name,value='',type='text',opts=''){return `<label class="field">${label}<input name="${name}" type="${type}" value="${attr(value)}" ${opts}></label>`;}
  function textField(label,name,value='',placeholder=''){return `<label class="field">${label}<textarea name="${name}" placeholder="${attr(placeholder)}">${esc(value)}</textarea></label>`;}
  function selectField(label,name,options,value=''){return `<label class="field">${label}<select name="${name}">${options.map(([val,lab])=>`<option value="${attr(val)}" ${value===val?'selected':''}>${esc(lab)}</option>`).join('')}</select></label>`;}
  function closeVisionViewer(restoreFocus=true,clearModal=true){
    if(!visionViewer)return;
    const viewer=visionViewer;visionViewer=null;
    viewer.abort.abort();viewer.resize?.disconnect();
    for(const id of viewer.pointers.keys()){try{viewer.stage.releasePointerCapture(id);}catch{}}
    for(const [property,value] of Object.entries(viewer.bodyStyle))document.body.style[property]=value;
    document.body.classList.remove('vision-viewer-open');
    if(clearModal)MODAL.innerHTML='';
    syncAppInert();
    window.scrollTo({left:viewer.scrollX,top:viewer.scrollY,behavior:'instant'});
    if(restoreFocus&&viewer.opener?.isConnected&&!APP.inert)viewer.opener.focus({preventScroll:true});
  }
  function paintVisionViewer(viewer){
    if(visionViewer!==viewer||!viewer.ready)return;
    const maxX=Math.max(0,(viewer.fitWidth*viewer.zoom-viewer.stage.clientWidth)/2),maxY=Math.max(0,(viewer.fitHeight*viewer.zoom-viewer.stage.clientHeight)/2);
    viewer.x=Math.max(-maxX,Math.min(maxX,viewer.x));viewer.y=Math.max(-maxY,Math.min(maxY,viewer.y));
    Object.assign(viewer.image.style,{width:`${viewer.fitWidth}px`,height:`${viewer.fitHeight}px`,transform:`translate(-50%, -50%) translate(${viewer.x}px, ${viewer.y}px) scale(${viewer.zoom})`});
    viewer.stage.dataset.zoomed=String(viewer.zoom>1);
    viewer.dialog.querySelector('[data-vision-zoom-level]').textContent=`${Math.round(viewer.zoom*100)}%`;
    viewer.dialog.querySelector('[data-vision-zoom="out"]').disabled=viewer.zoom<=1;
    viewer.dialog.querySelector('[data-vision-zoom="in"]').disabled=viewer.zoom>=4;
    viewer.dialog.querySelector('[data-vision-zoom="reset"]').disabled=false;
  }
  function fitVisionImage(viewer){
    if(visionViewer!==viewer||!viewer.image.naturalWidth)return;
    const scale=Math.min(1,viewer.stage.clientWidth/viewer.image.naturalWidth,viewer.stage.clientHeight/viewer.image.naturalHeight);
    viewer.fitWidth=viewer.image.naturalWidth*scale;viewer.fitHeight=viewer.image.naturalHeight*scale;viewer.ready=true;
    viewer.image.hidden=false;viewer.dialog.querySelector('.vision-viewer-loading').hidden=true;
    paintVisionViewer(viewer);
  }
  function zoomVisionImage(value,anchor){
    const viewer=visionViewer;if(!viewer?.ready)return;
    const next=Math.max(1,Math.min(4,value)),ratio=next/viewer.zoom;
    viewer.x=anchor?anchor.x-(anchor.x-viewer.x)*ratio:viewer.x*ratio;
    viewer.y=anchor?anchor.y-(anchor.y-viewer.y)*ratio:viewer.y*ratio;
    viewer.zoom=next;if(next===1){viewer.x=0;viewer.y=0;}
    paintVisionViewer(viewer);
  }
  function visionViewerKeys(event){
    const viewer=visionViewer;if(!viewer)return;
    if(event.key==='Escape'){event.preventDefault();closeVisionViewer();return;}
    if(event.key==='Tab'){
      const focusable=[...viewer.dialog.querySelectorAll('button:not([disabled]),[tabindex="0"]')],first=focusable[0],last=focusable.at(-1),active=document.activeElement;
      if(!focusable.includes(active)||(event.shiftKey&&active===first)||(!event.shiftKey&&active===last)){event.preventDefault();(event.shiftKey?last:first)?.focus();}
      return;
    }
    if(event.target!==viewer.stage)return;
    if(['+','=','-','0'].includes(event.key)){event.preventDefault();zoomVisionImage(event.key==='0'?1:viewer.zoom+(event.key==='-'?-.5:.5));return;}
    if(viewer.zoom>1&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();viewer.x+=event.key==='ArrowLeft'?60:event.key==='ArrowRight'?-60:0;viewer.y+=event.key==='ArrowUp'?60:event.key==='ArrowDown'?-60:0;paintVisionViewer(viewer);}
  }
  function openVisionViewer(id,opener){
    const item=state.visionBoard.find(piece=>piece.id===id);if(!item?.image)return;
    closeVisionViewer(false);
    clearTimeout(toastTimer);TOAST.innerHTML='';
    const title=item.title||'Your vision';
    MODAL.innerHTML=`<div class="modal-backdrop vision-viewer-backdrop"><section class="vision-viewer" role="dialog" aria-modal="true" aria-labelledby="vision-viewer-title" aria-describedby="vision-viewer-help"><header class="vision-viewer-head"><div><span class="eyebrow">Vision Board</span><h2 id="vision-viewer-title">${esc(title)}</h2><p>${esc(item.category||'Your inspiration')}</p></div><button type="button" class="btn vision-viewer-close" data-act="close-vision-viewer" aria-label="Close image viewer">${icon('close',20)}</button></header><div class="vision-viewer-stage" role="region" tabindex="0" aria-label="Image view. Use plus, minus, or zero to zoom. Arrow keys move a zoomed image."><img class="vision-viewer-image" src="${attr(item.image)}" alt="${attr(title)}" draggable="false" hidden><p class="vision-viewer-status vision-viewer-loading" role="status">Loading your image…</p><p class="vision-viewer-status vision-viewer-error" role="status" hidden>This image could not be opened. Try adding it to your board again.</p></div><footer class="vision-viewer-footer"><div class="vision-viewer-controls" aria-label="Image zoom controls"><button type="button" class="btn" data-vision-zoom="out" aria-label="Zoom out" disabled>−</button><output data-vision-zoom-level aria-live="polite" aria-label="Zoom level">100%</output><button type="button" class="btn" data-vision-zoom="in" aria-label="Zoom in" disabled>+</button><button type="button" class="btn" data-vision-zoom="reset" disabled>Fit</button></div><p id="vision-viewer-help">Pinch or use + / − to zoom. Drag to explore; Fit shows the whole image.</p></footer></section></div>`;
    const dialog=MODAL.querySelector('.vision-viewer'),stage=dialog.querySelector('.vision-viewer-stage'),image=dialog.querySelector('img');
    const bodyStyle=Object.fromEntries(['position','top','left','width','overflow','paddingRight'].map(property=>[property,document.body.style[property]]));
    const viewer=visionViewer={dialog,stage,image,opener,bodyStyle,scrollX:window.scrollX,scrollY:window.scrollY,abort:new AbortController(),pointers:new Map(),gesture:null,zoom:1,x:0,y:0,ready:false,fitWidth:0,fitHeight:0};
    const scrollbar=Math.max(0,innerWidth-document.documentElement.clientWidth),padding=parseFloat(getComputedStyle(document.body).paddingRight)||0;
    Object.assign(document.body.style,{position:'fixed',top:`-${viewer.scrollY}px`,left:`-${viewer.scrollX}px`,width:'100%',overflow:'hidden',paddingRight:`${padding+scrollbar}px`});
    document.body.classList.add('vision-viewer-open');APP.inert=true;
    const options={signal:viewer.abort.signal};
    image.addEventListener('load',()=>fitVisionImage(viewer),options);
    const failed=()=>{if(visionViewer!==viewer)return;dialog.querySelector('.vision-viewer-loading').hidden=true;dialog.querySelector('.vision-viewer-error').hidden=false;};
    image.addEventListener('error',failed,options);
    const point=event=>({x:event.clientX,y:event.clientY});
    const beginGesture=()=>{
      const points=[...viewer.pointers.values()],rect=stage.getBoundingClientRect();
      if(points.length>=2){const [a,b]=points;viewer.gesture={type:'pinch',distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),zoom:viewer.zoom,x:viewer.x,y:viewer.y,midX:(a.x+b.x)/2-rect.left-rect.width/2,midY:(a.y+b.y)/2-rect.top-rect.height/2};}
      else if(points.length===1)viewer.gesture={type:'pan',point:points[0],x:viewer.x,y:viewer.y};
      else viewer.gesture=null;
    };
    stage.addEventListener('pointerdown',event=>{if(!viewer.ready||event.button!==0)return;viewer.pointers.set(event.pointerId,point(event));try{stage.setPointerCapture(event.pointerId);}catch{}beginGesture();},options);
    stage.addEventListener('pointermove',event=>{
      if(!viewer.pointers.has(event.pointerId)||!viewer.gesture)return;
      viewer.pointers.set(event.pointerId,point(event));const gesture=viewer.gesture,points=[...viewer.pointers.values()];
      if(gesture.type==='pinch'&&points.length>=2){const [a,b]=points,rect=stage.getBoundingClientRect(),zoom=Math.max(1,Math.min(4,gesture.zoom*Math.hypot(b.x-a.x,b.y-a.y)/gesture.distance)),ratio=zoom/gesture.zoom;viewer.x=(a.x+b.x)/2-rect.left-rect.width/2-(gesture.midX-gesture.x)*ratio;viewer.y=(a.y+b.y)/2-rect.top-rect.height/2-(gesture.midY-gesture.y)*ratio;viewer.zoom=zoom;}
      else if(viewer.zoom>1){viewer.x=gesture.x+points[0].x-gesture.point.x;viewer.y=gesture.y+points[0].y-gesture.point.y;}
      paintVisionViewer(viewer);
    },options);
    const endPointer=event=>{viewer.pointers.delete(event.pointerId);beginGesture();};
    stage.addEventListener('pointerup',endPointer,options);stage.addEventListener('pointercancel',endPointer,options);stage.addEventListener('lostpointercapture',endPointer,options);
    stage.addEventListener('dblclick',event=>{const rect=stage.getBoundingClientRect();zoomVisionImage(viewer.zoom>1?1:2,{x:event.clientX-rect.left-rect.width/2,y:event.clientY-rect.top-rect.height/2});},options);
    stage.addEventListener('wheel',event=>{if(!event.ctrlKey)return;event.preventDefault();const rect=stage.getBoundingClientRect();zoomVisionImage(viewer.zoom*Math.exp(-event.deltaY*.005),{x:event.clientX-rect.left-rect.width/2,y:event.clientY-rect.top-rect.height/2});},{...options,passive:false});
    viewer.resize=new ResizeObserver(()=>fitVisionImage(viewer));viewer.resize.observe(stage);
    if(image.complete){if(image.naturalWidth)fitVisionImage(viewer);else failed();}
    dialog.querySelector('.vision-viewer-close').focus({preventScroll:true});
  }
  function dialog(title,body,form='',submit='Save'){closeVisionViewer(false);MODAL.innerHTML=`<div class="modal-backdrop" data-dismiss="true"><div class="modal-card" role="dialog" aria-modal="true" aria-label="${attr(title)}"><div class="modal-head"><h2>${title}</h2><button data-act="close-modal" aria-label="Close">${icon('close',18)}</button></div>${form?`<form data-form="${form}">${body}<div class="form-actions"><button type="button" class="btn" data-act="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${submit}</button></div></form>`:body}</div></div>`;MODAL.querySelectorAll('textarea').forEach(field=>field.classList.add('writing-input'));MODAL.querySelector('input:not([type="hidden"]),textarea,select,button')?.focus();}
  function openForm(kind,id='',extra='',prefillTitle='',prefillDate=''){
    const m=state.manifestations.find(x=>x.id===id),a=state.actions.find(x=>x.id===id),j=state.journals.find(x=>x.id===id);
    if(kind==='manifestation'){dialog(m?'Edit Manifestation':'New Manifestation',`<input name="id" type="hidden" value="${attr(id)}"><div class="form-grid">${field('Name your manifestation *','title',m?.title,'text','required maxlength="100"')}${selectField('Category','category',CATEGORIES.map(x=>[x,x]),m?.category||'Personal Growth')}${textField('What do I want?','want',m?.want,'Describe the outcome clearly.')}${textField('Why does this matter?','why',m?.why,'Make the reason personal.')}${field('Desired date','targetDate',m?.targetDate,'date')}${field('How will I know it happened?','measure',m?.measure)}${textField('Future-self description','futureSelf',m?.futureSelf)}${field('90-day goal','goal90',m?.goal90)}${field('This week','thisWeek',m?.thisWeek)}</div>`,'manifestation',m?'Save changes':'Create manifestation');}
    if(kind==='action'){const suggestedDate=prefillDate||(currentRoute.page==='calendar'?selectedDate:''),daysAhead=suggestedDate?dayOrdinal(suggestedDate)-dayOrdinal(localDate()):0,suggestedPeriod=daysAhead<=0?'today':daysAhead<=7?'week':monthKey(suggestedDate)===monthKey(localDate())?'month':'later';dialog(a?'Edit Action':'New Action',`<input name="id" type="hidden" value="${attr(id)}"><div class="form-grid">${field('Action *','title',a?.title||prefillTitle,'text','required maxlength="140"')}${selectField('Manifestation','manifestationId',[['','Independent action'],...state.manifestations.map(x=>[x.id,x.title])],a?.manifestationId||extra)}${selectField('When','period',[['today','Today'],['week','This Week'],['month','This Month'],['later','Later'],...(a?.done?[['done','Done']]:[])],a?.period||suggestedPeriod)}${selectField('Priority','priority',[['high','High'],['medium','Medium'],['low','Low']],a?.priority||'medium')}${field('Date','deadline',a?.deadline||suggestedDate,'date')}${field('Local time (optional)','dueTime',a?.dueTime,'time')}${selectField('Time needed','minutes',[['5','5 minutes'],['15','15 minutes'],['30','30 minutes']],String(a?.minutes||5))}${selectField('Energy needed','energy',[['low','Low'],['medium','Medium'],['high','High']],a?.energy||'medium')}</div><p class="small-note">A time belongs to a date and follows this device’s local time zone.</p>`,'action',a?'Save action':'Add action');}
    if(kind==='milestone'){dialog('New milestone',`<input name="manifestationId" type="hidden" value="${attr(id)}">${field('Milestone *','title','','text','required maxlength="120"')}`,'milestone','Add milestone');}
    if(kind==='vision'){dialog('Add to Vision Board',`<input name="manifestationId" type="hidden" value="${attr(extra)}"><div class="form-grid">${field('Title or phrase *','title','','text','required maxlength="100"')}${selectField('Category','category',CATEGORIES.map(x=>[x,x]),'Personal Growth')}<label class="field full">Upload image (optional)<input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small>Choose a personal image, or leave empty to create a word card. Images stay in this browser.</small></label></div>`,'vision','Add to board');}
    if(kind==='journal'){dialog(j?'Edit Journal Entry':'New Journal Entry',`<input name="id" type="hidden" value="${attr(id)}"><div class="form-grid">${selectField('Journal type','type',JOURNAL_TYPES.map(x=>[x,x]),j?.type||(SCRIPTING_PROMPTS.includes(extra)?'Scripting':extra)||'Manifestation Journal')}${field('Date','date',j?.date||selectedDate,'date','required')}${field('Title','title',j?.title,'text','maxlength="120"')}<label class="field">Entry font<select name="font" data-entry-font-select><option value="" ${!j?.font?"selected":""}>Use my writing font</option>${WRITING_FONTS.map(([fontId,label])=>`<option value="${fontId}" ${j?.font===fontId?"selected":""}>${label}</option>`).join("")}</select></label><label class="field full">Your words<textarea name="body" data-entry-font="${attr(j?.font||"")}" rows="10" required placeholder="${attr(extra&&SCRIPTING_PROMPTS.includes(extra)?extra:'Write freely…')}">${esc(j?.body||'')}</textarea></label></div>`,'journal',j?'Save entry':'Save entry');}
    if(kind==='habit'){dialog('Add a habit',`${field('Habit name *','title','','text','required maxlength="60"')}`,'habit','Add habit');}
    if(kind==='evidence'){dialog('Evidence of progress',`<div class="form-grid">${field('What happened? *','title','','text','required maxlength="120"')}${field('Date','date',selectedDate,'date','required')}${textField('A little more about it','note')}</div>`,'evidence','Save evidence');}
    if(kind==='affirmation'){dialog('New affirmation',`<input name="manifestationId" type="hidden" value="${attr(extra)}"><div class="form-grid">${selectField('Category','category',AFFIRMATION_CATEGORIES.map(x=>[x,x]),'General')}<label class="field full">Your affirmation *<textarea name="text" required maxlength="300" placeholder="Write something supportive and believable."></textarea></label></div>`,'affirmation','Save affirmation');}
    if(kind==='profile'){dialog('Your space',`${field('What should we call you?','name',state.profile.name||visitName,'text','maxlength="40" autocomplete="nickname"')}<p class="small-note">Just a first name or nickname. No account needed.</p>`,'profile','Save name');}
  }
  async function imageToDataURL(file){
    if(file.type==='image/gif'){
      if(file.size>800_000)throw new Error('Choose a GIF smaller than 800 KB.');
      return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read this image.'));reader.readAsDataURL(file);});
    }
    const url=URL.createObjectURL(file);
    try{
      const img=new Image();
      img.src=url;
      await img.decode();
      const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const context=canvas.getContext('2d');
      if(!context)throw new Error('Image processing is unavailable.');
      context.imageSmoothingQuality='high';
      context.drawImage(img,0,0,canvas.width,canvas.height);
      const result=canvas.toDataURL('image/webp',.84);
      if(result.length>1_500_000)throw new Error('This image is too large for browser storage. Choose a smaller image.');
      return result;
    }finally{URL.revokeObjectURL(url);}
  }
  function updateTechniqueSession(form,mode='draft'){
    const method=TECHNIQUES.find(item=>item.id===form.dataset.technique);
    if(!method||!method.fields)return null;
    const data=new FormData(form),fields=Object.fromEntries(method.fields.map(([key])=>[key,String(data.get(key)||'').trim()]));
    if(mode==='complete'&&selectedDate>localDate()){toast('Choose today or an earlier date to complete a practice.',true);return null;}
    if(mode==='complete'&&method.fields.some(([key])=>blank(fields[key]))){toast('Fill each guided field before completing this practice.',true);return null;}
    if(mode==='complete'&&method.id==='55x5'&&lineCount(fields.repetitions)<55){toast('Write 55 non-empty lines before completing a 55×5 day.',true);return null;}
    const session=techniqueSession(method.id,selectedDate,true);
    session.fields=fields;session.manifestationId=String(data.get('manifestationId')||'');
    session.completed=mode==='complete'?true:mode==='draft'?false:session.completed;
    session.updatedAt=new Date().toISOString();
    return session;
  }
  async function handleForm(form,submitter){
    const data=new FormData(form),kind=form.dataset.form,id=String(data.get('id')||'');
    if(kind==='technique'){const session=updateTechniqueSession(form,submitter?.dataset.complete==='true'?'complete':'draft');if(!session)return;commit(session.completed?'Practice completed':'Practice draft saved');return;}
    if(kind==='manifestation'){const index=state.manifestations.findIndex(x=>x.id===id);const item=index>=0?{...state.manifestations[index]}:{id:makeId(),milestones:[],images:[],affirmations:[],status:'active',createdAt:new Date().toISOString()};for(const key of ['title','category','want','why','targetDate','measure','futureSelf','goal90','thisWeek'])item[key]=String(data.get(key)||'').trim();if(!item.title)return toast('Give this manifestation a name.',true);if(index>=0)state.manifestations[index]=item;else state.manifestations.push(item);if(commit('Manifestation saved')){MODAL.innerHTML='';go('manifestations',item.id);}return;}
    if(kind==='action'){
      const title=String(data.get('title')||'').trim(),deadline=String(data.get('deadline')||'').trim(),dueTime=String(data.get('dueTime')||'').trim();
      if(!title)return toast('Give this action a name.',true);
      if(dueTime&&!deadline)return toast('Choose a date for a timed action.',true);
      if(dueTime&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime))return toast('Choose a valid local time.',true);
      const item=state.actions.find(x=>x.id===id)||{id:makeId(),done:false,createdAt:new Date().toISOString()};
      for(const key of ['manifestationId','period','priority','energy'])item[key]=String(data.get(key)||'').trim();
      item.title=title;item.deadline=deadline;item.dueTime=dueTime;item.minutes=Number(data.get('minutes')||5);
      if(!id)state.actions.push(item);
      if(commit('Action saved'))MODAL.innerHTML='';return;
    }
    if(kind==='milestone'){
      const m=state.manifestations.find(x=>x.id===String(data.get('manifestationId')));
      if(!m)return toast('Manifestation not found.',true);
      const title=String(data.get('title')||'').trim();
      if(!title)return toast('Name your milestone.',true);
      m.milestones.push({id:makeId(),title,done:false});if(commit('Milestone added'))MODAL.innerHTML='';return;
    }
    if(kind==='vision'){
      const title=String(data.get('title')||'').trim();
      if(!title)return toast('Give this board piece a title.',true);
      const originalLabel=submitter?.textContent;
      if(submitter){submitter.disabled=true;submitter.textContent='Saving…';}
      try{
        let image='';const file=data.get('image');
        if(file instanceof File&&file.size){
          if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type))return toast('Choose a PNG, JPEG, WebP, or GIF image.',true);
          if(file.size>12_000_000)return toast('Choose an image smaller than 12 MB.',true);
          try{image=await imageToDataURL(file)}catch(error){return toast(error.message,true)}
        }
        state.visionBoard.push({id:makeId(),title,category:String(data.get('category')||''),manifestationId:String(data.get('manifestationId')||''),image,createdAt:new Date().toISOString()});
        if(commit('Vision board piece added'))MODAL.innerHTML='';
        return;
      }finally{if(submitter?.isConnected){submitter.disabled=false;submitter.textContent=originalLabel;}}
    }
    if(kind==='journal'){const index=state.journals.findIndex(x=>x.id===id);const item=index>=0?{...state.journals[index]}:{id:makeId(),createdAt:new Date().toISOString()};for(const key of ['type','date','title','body'])item[key]=String(data.get(key)||'').trim();item.font=WRITING_FONTS.some(([fontId])=>fontId===data.get('font'))?String(data.get('font')):'';if(!item.body)return toast('Write a few words before saving.',true);if(index>=0)state.journals[index]=item;else state.journals.push(item);if(commit('Journal entry saved'))MODAL.innerHTML='';return;}
    if(kind==='habit'){if(state.habits.filter(h=>h.active!==false).length>=8)return toast('Eight habits is the maximum.',true);const title=String(data.get('title')||'').trim();if(!title)return toast('Name your habit.',true);state.habits.push({id:makeId(),title,active:true,completions:{},createdAt:new Date().toISOString()});if(commit('Habit added'))MODAL.innerHTML='';return;}
    if(kind==='evidence'){const title=String(data.get('title')||'').trim();if(!title)return toast('Describe what happened.',true);state.evidence.push({id:makeId(),title,date:String(data.get('date')||selectedDate),note:String(data.get('note')||'').trim(),createdAt:new Date().toISOString()});if(commit('Evidence saved'))MODAL.innerHTML='';return;}
    if(kind==='affirmation'){const phrase=String(data.get('text')||'').trim();if(!phrase)return toast('Write an affirmation first.',true);state.affirmations.push({id:makeId(),text:phrase,category:String(data.get('category')||'General'),manifestationId:String(data.get('manifestationId')||''),favorite:false,completedDates:{},createdAt:new Date().toISOString()});if(commit('Affirmation saved'))MODAL.innerHTML='';return;}
    if(kind==='profile'){state.profile.name=String(data.get('name')||'').trim();if(commit('Name saved'))MODAL.innerHTML='';}
  }
  function download(content,filename,type='text/plain'){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function printPage(type){
    const title={today:"Today's page",calendar:'Selected calendar day',actions:'Action plan',manifestations:'Manifestations',journal:'Journal entries',progress:'Progress summary',techniques:'Technique sessions'}[type]||'Planner';
    const s=stats(state),d=state.days[selectedDate]||{};
    const row=(label,value)=>`<div class="print-row"><strong>${esc(label)}</strong><span>${esc(value||'—')}</span></div>`;
    let body='';
    if(type==='today')body=`${row('Date',fmtDate(selectedDate))}${row('Intention',d.intention)}${row('Calling in',d.callingIn)}${row('One small action',d.smallAction)}${row('Mood / Energy',`${d.mood||'—'} / ${d.energy||'—'}`)}${row('Morning affirmation',d.morningAffirmation)}${row('Evening reflection',d.eveningReflection)}${row('Journey',Object.entries(d.journey||{}).filter(([k])=>k!=='completed').map(([k,v])=>`${k}: ${v}`).join(' · '))}`;
    if(type==='calendar')body=`${row('Date',fmtDate(selectedDate))}${row('Day note',d.calendarNote)}${row('Intention',d.intention)}${row('One small action',d.smallAction)}${row('Evening reflection',d.eveningReflection)}${state.actions.filter(a=>a.deadline===selectedDate).map(a=>row(a.title,`${a.dueTime||'Anytime'} · ${a.done?'Done':'Open'} · ${a.minutes} min`)).join('')}${state.journals.filter(j=>j.date===selectedDate).map(j=>row(`${j.type}: ${j.title||'Entry'}`,j.body)).join('')}${state.evidence.filter(w=>w.date===selectedDate).map(w=>row(`Win: ${w.title}`,w.note)).join('')}`;
    if(type==='actions')body=state.actions.map(a=>row(a.title,`${a.done?'Done':a.period} · ${a.priority} priority · ${a.minutes} min · ${a.deadline||'No deadline'}${a.dueTime?` at ${a.dueTime}`:''}`)).join('')||'<p>No actions yet.</p>';
    if(type==='manifestations')body=state.manifestations.map(m=>`${row(m.title,`${s.projectProgress[m.id]}% · ${m.status}`)}${row('Dream',m.want)}${row('Why',m.why)}${row('Desired date',m.targetDate)}`).join('')||'<p>No manifestations yet.</p>';
    if(type==='journal')body=state.journals.map(j=>`${row(`${j.type} · ${j.date}`,j.title)}<p class="writing-preview" data-entry-font="${attr(j.font||'')}">${esc(j.body)}</p>`).join('')||'<p>No journal entries yet.</p>';
    if(type==='progress')body=`${row('Goals',`${s.goalsPercent}%`)}${row('Actions',`${s.actionsPercent}%`)}${row('Habits',`${s.habitsPercent}%`)}${row('Journey',`${s.journeyCompletedDays}/30`)}${row('Wins',s.winsCount)}`;
    if(type==='techniques'){
      const sessions=state.techniqueSessions.map(session=>`${row(`${TECHNIQUES.find(item=>item.id===session.technique)?.name||'Technique'} · ${session.date}`,session.completed?'Completed':'Draft')}${Object.entries(session.fields||{}).map(([key,value])=>row(key,value)).join('')}`).join('');
      const logs=state.logs369.map(log=>`${row(`369 Method · ${log.date}`,log.completed?'Completed':'Draft')}${row('Statement',log.text)}${row('Morning ×3',log.morning)}${row('Afternoon ×6',log.afternoon)}${row('Evening ×9',log.evening)}${row('Next action',log.oneAction)}`).join('');
      body=sessions+logs||'<p>No technique sessions yet.</p>';
    }
    document.getElementById('print-root')?.remove();const el=document.createElement('div');el.id='print-root';el.innerHTML=`<header><img src="assets/logo.svg" alt=""><div><strong>AurelyStudio</strong><small>Manifestation & Action Planner</small></div></header><h1>${title}</h1>${body}<footer>Created in AurelyStudio · Saved in this browser</footer>`;document.body.append(el);window.print();
  }
  async function handleAction(button){
    const act=button.dataset.act,id=button.dataset.id;
    if(act==='calendar-prev'||act==='calendar-next'){const next=new Date(`${calendarMonth}-01T12:00:00`);next.setMonth(next.getMonth()+(act==='calendar-prev'?-1:1));calendarMonth=localDate(next).slice(0,7);render();return;}
    if(act==='calendar-today'){selectedDate=localDate();calendarMonth=monthKey(selectedDate);render();return;}
    if(act==='calendar-add-action')return openForm('action');
    if(act==='calendar-open-day')return go('today','',true);
    if(act==='jump-writing'||act==='jump-menu'){APP.querySelector(act==='jump-writing'?'.appearance-writing':'.appearance-menu')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
    if(act==='menu'){APP.querySelector('.sidebar')?.classList.add('open');APP.querySelector('.sidebar-scrim').hidden=false;APP.querySelector('.mobile-menu')?.setAttribute('aria-expanded','true');APP.querySelector('.sidebar .nav-link')?.focus();return;}
    if(act==='close-menu'){APP.querySelector('.sidebar')?.classList.remove('open');APP.querySelector('.sidebar-scrim').hidden=true;APP.querySelector('.mobile-menu')?.setAttribute('aria-expanded','false');APP.querySelector('.mobile-menu')?.focus();return;}
    if(act==='close-vision-viewer'){closeVisionViewer();return;}
    if(act==='close-modal'){if(visionViewer)closeVisionViewer();else MODAL.innerHTML='';return;}
    if(act==='profile')return openForm('profile');
    if(act==='mobile-search')return dialog('Search your space','<form id="mobile-search-form" role="search"><label class="field">Search all saved records<input type="search" aria-label="Search all saved records" placeholder="Search goals, actions, journal…" required autofocus></label><div class="form-actions"><button class="btn btn-primary" type="submit">Search</button></div></form>');
    if(act==='notification')return dialog("Today's gentle reminder",`<p>Manifest it. Break it down. Take one step today.</p><p class="muted">Your private planner has ${state.actions.filter(a=>!a.done&&a.period==='today').length} action(s) set for today.</p><button class="btn btn-primary" data-go="today">Open today</button>`);
    if(act==='open-technique-date'){selectedDate=button.dataset.date||localDate();render();return;}
    if(act==='complete-369'){
      const record=state.logs369.find(item=>item.date===selectedDate);
      if(!record)return toast('Write your statement and the three sessions first.',true);
      if(!record.completed){
        if(selectedDate>localDate())return toast('Choose today or an earlier date to complete a practice.',true);
        if(blank(record.text)||blank(record.oneAction)||[['morning',3],['afternoon',6],['evening',9]].some(([key,n])=>lineCount(record[key])<n))return toast('Add your statement, 3/6/9 lines, and one real action first.',true);
      }
      record.completed=!record.completed;commit(record.completed?'369 practice completed':'369 practice reopened');return;
    }
    if(act==='369-to-action'){const record=state.logs369.find(item=>item.date===selectedDate),title=String(record?.oneAction||'').trim();if(!title)return toast('Write your next real action first.',true);persist();openForm('action','',record.manifestationId||'',title);return;}
    if(act==='technique-to-action'){const form=document.getElementById('technique-form');if(!form)return;const session=updateTechniqueSession(form,'keep');if(!session)return;const title=String(session.fields.action||'').trim();if(!title)return toast('Write a next action in the practice first.',true);persist();openForm('action','',session.manifestationId,title);return;}
    if(act==='new-manifestation')return openForm('manifestation');
    if(act==='edit-manifestation')return openForm('manifestation',id);
    if(act==='review-to-action'){const review=state.weeklyReviews.find(item=>item.weekStart===weekStart(selectedDate));const title=String(review?.firstAction||'').trim();if(!title)return toast('Write next week’s first action before adding it.',true);persist();return openForm('action','','',title,addDays(weekStart(selectedDate),7));}
    if(act==='new-action')return openForm('action','',button.dataset.manifestation||'');
    if(act==='edit-action')return openForm('action',id);
    if(act==='new-milestone')return openForm('milestone',id);
    if(act==='new-vision')return openForm('vision','',button.dataset.manifestation||'');
    if(act==='new-journal')return openForm('journal');
    if(act==='edit-journal')return openForm('journal',id);
    if(act==='script-prompt')return openForm('journal','',button.dataset.prompt);
    if(act==='new-habit')return openForm('habit');
    if(act==='new-evidence')return openForm('evidence');
    if(act==='new-affirmation')return openForm('affirmation','',button.dataset.manifestation||'');
    if(act==='turn-small-action'){const title=String(dayRecord().smallAction||'').trim();if(!title)return toast('Write your small action first.',true);if(state.actions.some(a=>!a.done&&a.title===title&&a.period==='today'))return toast('This action is already in your plan.');state.actions.push({id:makeId(),title,manifestationId:'',period:'today',priority:'medium',deadline:selectedDate,minutes:5,energy:dayRecord().energy||'low',done:false,createdAt:new Date().toISOString()});commit('Small action added to your plan');return;}
    if(act==='start-journey'){selectedDate=localDate();state.journey.startDate=selectedDate;commit('Your 30 days begin today');return;}
    if(act==='complete-journey'){
      const position=journeyPosition(selectedDate);
      if(position<1||position>30)return toast('Choose a day within your 30-day journey.',true);
      if(selectedDate>localDate())return toast('Return on this date to complete the day.',true);
      const j=dayRecord().journey;
      if(!j.completed&&['intention','visualization','action','gratitude','reflection'].some(key=>blank(j[key])))return toast('Fill all five parts of today’s journey first.',true);
      j.completed=!j.completed;commit(j.completed?'Journey day complete':'Journey day reopened');return;
    }
    if(act==='prev-day'){selectedDate=addDays(selectedDate,-1);render();return;}
    if(act==='next-day'){selectedDate=addDays(selectedDate,1);render();return;}
    if(act==='today-date'){selectedDate=localDate();render();return;}
    if(act==='prev-week'){habitWeek=addDays(habitWeek,-7);render();return;}
    if(act==='next-week'){habitWeek=addDays(habitWeek,7);render();return;}
    if(act==='prev-week-review'){selectedDate=addDays(selectedDate,-7);render();return;}
    if(act==='next-week-review'){selectedDate=addDays(selectedDate,7);render();return;}
    if(act==='prev-month'||act==='next-month'){const d=new Date(`${selectedDate}T12:00:00`);d.setDate(1);d.setMonth(d.getMonth()+(act==='prev-month'?-1:1));selectedDate=localDate(d);render();return;}
    if(act==='preset-habit'){if(state.habits.length>=8)return;state.habits.push({id:makeId(),title:button.dataset.title,active:true,completions:{},createdAt:new Date().toISOString()});commit('Habit added');return;}
    if(act==='toggle-manifestation'){const m=state.manifestations.find(x=>x.id===id);if(!m)return;m.status=m.status==='completed'?'active':'completed';m.completedAt=m.status==='completed'?new Date().toISOString():'';commit('Manifestation updated');return;}
    if(act==='favorite-affirmation'){const a=state.affirmations.find(x=>x.id===id);a.favorite=!a.favorite;commit('Affirmation updated');return;}
    if(act==='complete-affirmation'){const a=state.affirmations.find(x=>x.id===id),today=localDate();a.completedDates||={};a.completedDates[today]=!a.completedDates[today];commit('Affirmation updated');return;}
    if(act==='set-morning-affirmation'){const a=state.affirmations.find(x=>x.id===id);dayRecord(localDate()).morningAffirmation=a.text;selectedDate=localDate();commit('Morning affirmation set');go('today');return;}
    if(act==='focus-timer'){if(focusSession)focusSession.open({title:'One small step',minutes:5});else toast('The timer is getting ready. Try again in a moment.');return;}
    if(act==='focus-action'){const a=state.actions.find(x=>x.id===id);if(!a)return;if(focusSession)focusSession.open({id:a.id,title:a.title,minutes:a.minutes});else toast('The timer is getting ready. Try again in a moment.');return;}
    if(act?.startsWith('delete-')){const map={'delete-manifestation':'manifestations','delete-action':'actions','delete-vision':'visionBoard','delete-journal':'journals','delete-habit':'habits','delete-evidence':'evidence','delete-affirmation':'affirmations','delete-technique':'techniqueSessions'};const key=map[act];if(!key||!confirm('Delete this item? This cannot be undone without a backup.'))return;state[key]=state[key].filter(x=>x.id!==id);if(act==='delete-manifestation'){state.actions=state.actions.map(a=>a.manifestationId===id?{...a,manifestationId:''}:a);go('manifestations');}commit('Item deleted');return;}
    if(act==='restore-backup'){document.getElementById('restore-file')?.click();return;}
    if(act==='backup'){const file=exportBackup(state);download(file.content,file.filename,file.mimeType);toast('Backup downloaded');return;}
    if(act==='reset-data'){if(!confirm('Erase all planner data from this browser? Download a backup first if you want to keep it.'))return;if(!confirm('This will remove your saved projects, journal, habits, and images. Continue?'))return;state=createInitialState();selectedDate=localDate();calendarMonth=monthKey(selectedDate);commit('Local data erased');go('today');return;}
    if(act==='install'){if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;}else dialog('Install this app',`<p>iPhone/iPad: Safari → Share → Add to Home Screen.</p><p>Android/desktop: browser menu → Install app or Add to Home screen.</p><p class="muted">Installation works on HTTPS or localhost. Your data remains in this browser.</p>`);return;}
  }
  document.addEventListener('click',async event=>{
    const target=event.target.closest('button,a,[data-detail],[data-toggle-action],[data-toggle-milestone]');if(!target)return;
    if(target.dataset.openVision){openVisionViewer(target.dataset.openVision,target);return;}
    if(target.dataset.visionZoom){const mode=target.dataset.visionZoom;zoomVisionImage(mode==='reset'?1:(visionViewer?.zoom||1)+(mode==='in'?.5:-.5));return;}
    if(target.dataset.calendarDate){selectedDate=target.dataset.calendarDate;calendarMonth=monthKey(selectedDate);render();return;}
    if(target.dataset.nav){event.preventDefault();go(target.dataset.nav);return;}
    if(target.dataset.go){event.preventDefault();go(target.dataset.go);return;}
    if(target.dataset.detail){go('manifestations',target.dataset.detail);return;}
    if(target.dataset.technique){go('techniques',target.dataset.technique);return;}
    if(target.dataset.sticker){const sticker=STICKERS.find(item=>item[0]===target.dataset.sticker);if(!sticker)return;const [slug,title,category]=sticker;state.visionBoard.push({id:makeId(),title,category,manifestationId:'',image:'assets/stickers/'+slug+'.svg',createdAt:new Date().toISOString()});commit('Sticker added to your Vision Board');return;}
    if(target.dataset.appearanceStyle){const mode=APPEARANCES.find(([id])=>id===target.dataset.appearanceStyle);if(!mode)return;state.theme.appearance=mode[0];commit(`${mode[1]} appearance saved`);APP.querySelector(`[data-appearance-style="${mode[0]}"]`)?.focus({preventScroll:true});return;}
    if(target.dataset.themeId){const theme=THEMES.find(item=>item.id===target.dataset.themeId);if(!theme)return;state.theme.themeId=theme.id;state.theme.preset=theme.id;state.theme.mainColor=theme.main;state.theme.accentColor=theme.accent;state.theme.backgroundColor=theme.bg;state.theme.nightMode=false;commit(`${theme.name} theme saved`);APP.querySelector(`[data-theme-id="${theme.id}"]`)?.focus({preventScroll:true});return;}
    if(target.dataset.menuStyle){const style=MENU_STYLES.find(([id])=>id===target.dataset.menuStyle);if(!style)return;state.theme.menuStyle=style[0];commit(`${style[1]} menu saved`);return;}
    if(target.dataset.act){event.preventDefault();await handleAction(target);return;}
    if(target.dataset.print){printPage(target.dataset.print);return;}
    if(target.dataset.actionFilter){actionFilter=target.dataset.actionFilter;render();return;}
    if(target.dataset.visionFilter){visionFilter=target.dataset.visionFilter;render();return;}
    if(target.dataset.journalFilter){journalFilter=target.dataset.journalFilter;render();return;}
    if(target.dataset.affirmationFilter){affirmationFilter=target.dataset.affirmationFilter;render();return;}
    if(target.dataset.toggleAction){
      const a=state.actions.find(x=>x.id===target.dataset.toggleAction);if(!a)return;
      if(a.done){a.done=false;a.period=['today','week','month','later'].includes(a.previousPeriod)?a.previousPeriod:'today';a.completedAt='';a.status='active';}
      else{a.previousPeriod=['today','week','month','later'].includes(a.period)?a.period:'today';a.done=true;a.period='done';a.completedAt=new Date().toISOString();}
      MODAL.innerHTML='';commit(a.done?'Action completed':'Action reopened');return;
    }
    if(target.dataset.toggleHabit){const h=state.habits.find(x=>x.id===target.dataset.toggleHabit),date=target.dataset.date;if(!h)return;h.completions||={};h.completions[date]=!h.completions[date];commit('Habit updated');return;}
    if(target.dataset.toggleMilestone){const m=state.manifestations.find(x=>x.id===target.dataset.id),ms=m?.milestones.find(x=>x.id===target.dataset.toggleMilestone);if(!ms)return;ms.done=!ms.done;ms.completedAt=ms.done?new Date().toISOString():'';if(!ms.done)ms.status='active';commit('Milestone updated');return;}
  });
  document.addEventListener('submit',async event=>{if(['search-form','mobile-search-form'].includes(event.target.id)){event.preventDefault();const term=event.target.querySelector('input').value.trim().toLowerCase();searchValue=term;if(!term)return;const matches=[...state.manifestations.map(x=>({label:x.title,detail:'Manifestation',page:'manifestations',id:x.id})),...state.actions.map(x=>({label:x.title,detail:'Action',page:'actions',id:x.id})),...state.journals.map(x=>({label:x.title||x.body.slice(0,60),detail:`Journal · ${x.date}`,page:'journal',id:x.id})),...state.evidence.map(x=>({label:x.title,detail:`Evidence · ${x.date}`,page:'progress',id:x.id})),...state.affirmations.map(x=>({label:x.text,detail:'Affirmation',page:'affirmations',id:x.id}))].filter(x=>`${x.label} ${x.detail}`.toLowerCase().includes(term));dialog(`Search: ${esc(term)}`,matches.length?`<div class="search-results">${matches.map(x=>`<button class="search-result" data-search-page="${x.page}" data-search-id="${attr(x.id||'')}"><strong>${esc(x.label)}</strong><small>${esc(x.detail)}</small></button>`).join('')}</div>`:'<p>No saved records matched your search.</p>');return;}if(event.target.dataset.form){event.preventDefault();await handleForm(event.target,event.submitter);}});
  document.addEventListener('click',event=>{
    const result=event.target.closest('[data-search-page]');
    if(result){
      const page=result.dataset.searchPage,id=result.dataset.searchId;
      if(page==='actions')actionFilter='all';
      if(page==='journal')journalFilter='All';
      if(page==='affirmations')affirmationFilter='All';
      go(page,page==='manifestations'?id:'');
      if(id&&page!=='manifestations')setTimeout(()=>{
        const target=[...APP.querySelectorAll('[data-record-id]')].find(item=>item.dataset.recordId===id);
        if(target){target.scrollIntoView({block:'center'});target.focus({preventScroll:true});target.classList.add('search-highlight');}
      },50);
      return;
    }
    if(event.target.matches('.modal-backdrop')){if(visionViewer)closeVisionViewer();else MODAL.innerHTML='';}
  });
  function saveDraft(el){
    const date=selectedDate;
    if(el.hasAttribute('data-calendar-note')){
      dayRecord(date).calendarNote=el.value;
    }else if(el.dataset.dayField){
      dayRecord(date)[el.dataset.dayField]=el.value;
    }else if(el.dataset.journeyField){
      dayRecord(date).journey[el.dataset.journeyField]=el.value;
    }else if(el.dataset.futureField){
      state.futureSelf[el.dataset.futureField]=el.value;
    }else if(el.dataset.log369Field){
      let log=state.logs369.find(item=>item.date===date);
      if(!log){log={id:makeId(),date,text:'',morning:'',afternoon:'',evening:''};state.logs369.push(log);}
      log[el.dataset.log369Field]=el.value;
      log.completed=false;
    }else if(el.dataset.techniqueField||el.hasAttribute('data-technique-manifestation')){
      const session=techniqueSession(currentRoute.id,date,true);
      if(!session)return;
      if(el.dataset.techniqueField)session.fields[el.dataset.techniqueField]=el.value;
      else session.manifestationId=el.value;
      session.completed=false;session.updatedAt=new Date().toISOString();
    }else if(el.dataset.reviewField){
      const weekly=el.dataset.reviewKind==='weekly';
      const key=weekly?weekStart(date):monthKey(date);
      const collection=weekly?state.weeklyReviews:state.monthlyReviews;
      let review=collection.find(item=>(weekly?item.weekStart:item.month)===key);
      if(!review){review={id:makeId(),[weekly?'weekStart':'month']:key};collection.push(review);}
      review[el.dataset.reviewField]=el.value;
    }else return;
    clearTimeout(draftTimer);
  draftTimer=setTimeout(()=>{
    draftTimer=null;
    persist();
    const summary=APP.querySelector('.today-heading .page-head p');
    if(summary){const s=stats(state);summary.textContent=journeyLabel(selectedDate)+' · Current streak: '+s.streakDays+' day'+(s.streakDays===1?'':'s')+' · '+fmtDate(selectedDate);}
  },250);
  }
  function liveInput(event){
    const el=event.target;
    saveDraft(el);
    if(el.dataset.log369Field&&el.dataset.log369Field!=='text'){
      const target={morning:3,afternoon:6,evening:9}[el.dataset.log369Field];
      const card=el.closest('.ritual-card');
      const count=el.value.split('\n').filter(line=>line.trim()).length;
      if(card&&target){
        card.querySelector('h2').textContent=`${count}/${target} lines`;
        card.querySelector('.progress-track span')?.style.setProperty('--progress',`${pct(count/target*100)}%`);
      }
    }
    if(el.dataset.techniqueField==='repetitions'){
      const count=el.closest('.field')?.querySelector('.technique-line-count');
      if(count)count.textContent=`${lineCount(el.value)}/55 lines written today`;
    }
  }
  document.addEventListener('input',liveInput);
  document.addEventListener('change',async event=>{
    const el=event.target;
    if(el.id==='selected-date'){selectedDate=el.value||localDate();render();return;}
    if(el.id==='calendar-month'){if(/^\d{4}-(0[1-9]|1[0-2])$/.test(el.value)){calendarMonth=el.value;render();}return;}
    if(el.hasAttribute('data-calendar-note')){dayRecord().calendarNote=el.value;persist();return;}
    if(el.hasAttribute('data-entry-font-select')){const field=el.closest('form')?.querySelector('textarea[name="body"]');if(field)field.dataset.entryFont=el.value;return;}
    if(el.hasAttribute('data-writing-font')){if(!WRITING_FONTS.some(([id])=>id===el.value))return;const previous=state.theme.writingFont;state.theme.writingFont=el.value;try{state=saveState(state);applyTheme();document.querySelectorAll('[data-writing-font]').forEach(select=>select.value=state.theme.writingFont);toast('Writing font saved');}catch(error){state.theme.writingFont=previous;applyTheme();el.value=previous;toast(`Could not save: ${error.message}`,true);}return;}
    if(el.dataset.dayField){dayRecord()[el.dataset.dayField]=el.value;if(el.tagName==='SELECT')commit('Today’s page saved');else persist();return;}
    if(el.dataset.journeyField){dayRecord().journey[el.dataset.journeyField]=el.value;persist();return;}
    if(el.dataset.futureField){state.futureSelf[el.dataset.futureField]=el.value;persist();return;}
    if(el.dataset.log369Field){let log=state.logs369.find(x=>x.date===selectedDate);if(!log){log={id:makeId(),date:selectedDate,text:'',morning:'',afternoon:'',evening:''};state.logs369.push(log);}log[el.dataset.log369Field]=el.value;log.completed=false;persist();return;}
    if(el.dataset.techniqueField||el.hasAttribute('data-technique-manifestation')){const session=techniqueSession(currentRoute.id,selectedDate,true);if(!session)return;if(el.dataset.techniqueField)session.fields[el.dataset.techniqueField]=el.value;else session.manifestationId=el.value;session.completed=false;session.updatedAt=new Date().toISOString();persist();return;}
    if(el.dataset.reviewField){const kind=el.dataset.reviewKind,weekly=kind==='weekly',key=weekly?weekStart(selectedDate):monthKey(selectedDate),array=weekly?state.weeklyReviews:state.monthlyReviews;let record=array.find(x=>(weekly?x.weekStart:x.month)===key);if(!record){record={id:makeId(),[weekly?'weekStart':'month']:key};array.push(record);}record[el.dataset.reviewField]=el.value;persist();return;}
    if(el.dataset.theme==='extraCalm'){state.theme.extraCalm=el.checked;commit('Theme saved');return;}
    if(el.id==='restore-file'){const file=el.files?.[0];if(!file)return;const parsed=validateBackup(await file.text());el.value='';if(!parsed.ok)return toast(parsed.error,true);if(!confirm('Replace this browser’s planner data with the selected backup?'))return;state=parsed.state;selectedDate=localDate();calendarMonth=monthKey(selectedDate);commit('Backup restored');go('today');return;}
  });
  document.addEventListener('keydown',event=>{if(visionViewer){visionViewerKeys(event);return;}if(event.key==='Escape'){MODAL.innerHTML='';const sidebar=APP.querySelector('.sidebar');const wasOpen=sidebar?.classList.contains('open');sidebar?.classList.remove('open');const scrim=APP.querySelector('.sidebar-scrim');if(scrim)scrim.hidden=true;APP.querySelector('.mobile-menu')?.setAttribute('aria-expanded','false');if(wasOpen)APP.querySelector('.mobile-menu')?.focus();}});
  window.addEventListener('pagehide',()=>{if(draftTimer){clearTimeout(draftTimer);draftTimer=null;persist();}});
  window.addEventListener('hashchange',()=>{closeVisionViewer(false);const previous=currentRoute.page;currentRoute=routeFromHash();if(currentRoute.page==='today'&&previous!=='today')selectedDate=localDate();if(currentRoute.page==='calendar'&&previous!=='calendar')calendarMonth=monthKey(selectedDate);render();});
  window.addEventListener('beforeprint',()=>closeVisionViewer(false));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateLiveClock();});
  setInterval(updateLiveClock,1000);
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
  if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
  render();
  const welcomeRoot=document.getElementById('welcome-root');
  welcomeRoot.querySelector('.welcome-help').textContent='Just a first name or nickname. Saved only in this browser. No account needed.';
  try{
    const {createWelcome}=await import('./src/welcome.js?v=11');
    welcomeController=createWelcome({
      root:welcomeRoot,
      getName:()=>state.profile.name?.trim()||visitName,
      isCalm:()=>state.theme.extraCalm,
      beforeOpen:()=>{if(draftTimer){clearTimeout(draftTimer);draftTimer=null;persist();}closeVisionViewer(false);MODAL.innerHTML='';},
      onBlocking:blocked=>{welcomeBlocking=blocked;syncAppInert();},
      saveName:name=>{const latest=loadState();state=saveState({...latest,profile:{...latest.profile,name}});render();},
      onVisitName:name=>{visitName=name;render();}
    });
  }catch{welcomeRoot.hidden=true;welcomeBlocking=false;syncAppInert();}
  try{
    const {createFocusSession}=await import('./src/focus-session.js?v=11');
    focusSession=createFocusSession({
      root:document.getElementById('focus-root'),
      isCalm:()=>state.theme.extraCalm,
      onNotice:(message,error=false)=>toast(message,error),
      onCompleteTask:id=>{const action=state.actions.find(item=>item.id===id);if(!action){toast('This action is no longer in your plan.',true);return false;}if(action.done){toast('This action is already complete.');return true;}action.previousPeriod=['today','week','month','later'].includes(action.period)?action.period:'today';action.done=true;action.period='done';action.completedAt=new Date().toISOString();return commit('Action completed');}
    });
    syncAppInert();
  }catch{toast('The timer is unavailable. Reload to try again.',true);}
}
appMain();
