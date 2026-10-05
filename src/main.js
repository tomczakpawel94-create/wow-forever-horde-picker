import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
// Prefer Supabase's current publishable key; keep the legacy anon variable
// working for projects that have not migrated yet.
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

const app = document.querySelector('#app')

const data = [
  ['Troll','Warlock','Affliction',9.6,9.7,9.8,8.0,9.1,9.6,'Engineering + Tailoring'],
  ['Undead','Warlock','Affliction',9.5,9.6,9.7,8.1,9.1,9.5,'Engineering + Tailoring'],
  ['Orc','Warlock','Affliction',9.4,9.5,9.5,8.1,9.0,9.5,'Engineering + Tailoring'],
  ['Troll','Warlock','Destruction',9.5,9.5,9.6,8.2,8.9,9.5,'Engineering + Tailoring'],
  ['Undead','Rogue','Subtlety',9.5,8.6,9.9,8.1,9.6,8.4,'Engineering + Mining'],
  ['Troll','Rogue','Subtlety',9.5,8.6,9.9,8.1,9.6,8.4,'Engineering + Mining'],
  ['Troll','Mage','Frost',9.4,8.9,9.9,8.9,9.2,8.9,'Engineering + Tailoring'],
  ['Troll','Shaman','Enhancement',9.4,9.2,9.5,9.0,9.3,9.0,'Engineering + Blacksmithing'],
  ['Orc','Shaman','Enhancement',9.4,9.2,9.5,9.0,9.3,9.0,'Engineering + Blacksmithing'],
  ['Undead','Priest','Shadow',9.4,9.2,9.5,8.5,8.8,9.1,'Engineering + Tailoring'],
  ['Troll','Priest','Shadow',9.5,9.2,9.5,8.5,8.8,9.1,'Engineering + Tailoring'],
  ['Orc','Warrior','Fury',9.3,9.7,8.8,8.5,8.9,9.5,'Engineering + Blacksmithing'],
  ['Troll','Warrior','Fury',9.3,9.5,8.8,8.6,8.9,9.5,'Engineering + Blacksmithing'],
  ['Tauren','Druid','Feral',9.2,9.0,9.3,9.0,9.5,8.8,'Engineering + Leatherworking'],
  ['Tauren','Druid','Restoration',9.2,9.4,9.1,8.3,8.8,9.3,'Alchemy + Herbalism'],
  ['Tauren','Warrior','Protection',9.2,9.0,7.7,7.5,9.3,9.1,'Engineering + Blacksmithing'],
  ['Undead','Paladin','Retribution',9.1,8.8,9.1,8.9,9.2,8.8,'Engineering + Blacksmithing'],
  ['Orc','Rogue','Subtlety',9.4,8.7,9.7,8.1,9.5,8.3,'Engineering + Mining'],
  ['Orc','Shaman','Elemental',9.3,9.2,9.5,8.5,8.9,9.0,'Engineering + Mining'],
  ['Skyborne — Windshaper','Shaman','Restoration',9.3,9.4,9.2,8.4,8.6,9.4,'Alchemy + Herbalism'],
  ['Skyborne — Windshaper','Rogue','Subtlety',9.2,8.6,9.7,8.0,9.3,8.3,'Engineering + Mining'],
  ['Troll','Hunter','Beast Mastery',9.2,9.3,9.1,9.6,9.7,9.0,'Engineering + Skinning'],
  ['Troll','Hunter','Marksmanship',9.1,9.4,9.3,8.7,8.9,9.5,'Engineering + Leatherworking'],
  ['Orc','Hunter','Beast Mastery',9.1,9.2,8.9,9.5,9.5,8.8,'Engineering + Skinning'],
  ['Tauren','Hunter','Beast Mastery',8.8,9.0,8.7,9.5,9.5,8.8,'Engineering + Skinning'],
  ['Undead','Mage','Frost',9.3,8.9,9.8,8.9,9.2,8.8,'Engineering + Tailoring'],
  ['Orc','Mage','Frost',9.0,8.7,9.5,8.8,9.0,8.6,'Engineering + Tailoring'],
  ['Tauren','Shaman','Restoration',9.1,9.5,9.2,8.3,8.5,9.5,'Alchemy + Herbalism'],
  ['Troll','Shaman','Restoration',9.3,9.6,9.3,8.4,8.6,9.6,'Alchemy + Herbalism'],
  ['Undead','Priest','Discipline',9.3,9.3,9.5,8.0,8.0,9.3,'Engineering + Tailoring'],
  ['Troll','Priest','Discipline',9.2,9.2,9.5,8.0,8.0,9.3,'Engineering + Tailoring'],
  ['Orc','Warrior','Arms',9.0,8.8,9.4,7.8,8.4,8.8,'Engineering + Blacksmithing'],
  ['Troll','Warrior','Arms',9.0,8.8,9.4,7.8,8.4,8.8,'Engineering + Blacksmithing']
]

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        flowType: 'implicit'
      }
    })
  : null

let user = null
let marks = {}
let filter = {race:'', cls:'', spec:'', sort:'avg', search:'', chosenOnly:false}

const races=[...new Set(data.map(x=>x[0]))], classes=[...new Set(data.map(x=>x[1]))], specs=[...new Set(data.map(x=>x[2]))]

const raceInfo={
  'Orc':{
    description:'Lud z Draenoru, który wyrwał się spod wpływu Płonącego Legionu. W Hordzie orki szukają wolności i honoru, a ich tradycja jest mocno związana z szamanizmem.',
    classes:['Hunter','Mage','Rogue','Shaman','Warlock','Warrior']
  },
  'Undead':{
    description:'Forsaken odzyskali wolę po wyrwaniu się spod kontroli Króla Lisza. Walczą o przetrwanie i miejsce w świecie, który często widzi w nich wyłącznie zagrożenie.',
    classes:['Mage','Paladin','Priest','Rogue','Warlock','Warrior']
  },
  'Tauren':{
    description:'Spokojny, wspólnotowy lud związany z naturą i duchowością. Taureni cenią równowagę, ale potrafią stanąć w obronie swojej ziemi i sprzymierzeńców.',
    classes:['Druid','Hunter','Shaman','Warrior']
  },
  'Troll':{
    description:'Darkspearowie dołączyli do Hordy po tym, jak orki pomogły im w potrzebie. Są zaradni i wytrwali, a ich kultura łączy walkę z pradawnymi tradycjami.',
    classes:['Hunter','Mage','Priest','Rogue','Shaman','Warlock','Warrior']
  },
  'Skyborne — Windshaper':{
    description:'Wiatrowi Skyborne dołączają do Hordy i podążają za tradycją żywiołów. Wybór tej strony otwiera im drogę szamana; mogą też być druidami, łowcami, łotrzykami i wojownikami.',
    classes:['Druid','Hunter','Rogue','Shaman','Warrior']
  }
}

function shell(){
app.innerHTML=`<main class="wrap">
<header><div><h1>⚔ WoW Forever — Horde Picker</h1><p>Wybierz swojego maina. Każdy użytkownik Discorda ma własne wybory.</p></div><div id="auth"></div></header>
<section class="intro-section">
  <h2 class="section-title">Horda czy Sojusz?</h2>
  <div class="faction-grid">
    <article class="faction-card horde-card"><span class="eyebrow">HORDA</span><h3>Siła, wolność i wspólnota</h3><p>Różne ludy łączą się, by przetrwać i samodzielnie kształtować swoją przyszłość. W tym rankingu skupiamy się na rasach Hordy.</p></article>
    <article class="faction-card alliance-card"><span class="eyebrow">SOJUSZ</span><h3>Tradycja, obowiązek i współpraca</h3><p>Sojusz skupia królestwa i ludy, które wspólnie bronią swoich domów. Skyborne po stronie Sojuszu zostają High Order i mogą wybrać maga.</p></article>
  </div>
  <p class="faction-note">Frakcja wpływa na to, z kim możesz tworzyć grupy. Rasy mają własne dostępne klasy, a WoW Forever dodaje nowe połączenia.</p>
</section>
<section class="races-section">
  <h2 class="section-title">Rasy Hordy</h2>
  <p class="section-lead">Wybierz rasę, poznaj jej charakter i zobacz klasy dostępne w WoW Forever.</p>
  <div class="race-grid">${Object.entries(raceInfo).map(([race,info])=>`<article class="race-card"><div class="race-card-heading"><h3>${race}</h3><button type="button" class="race-jump" data-race-select="${race}">Pokaż rankingi</button></div><p>${info.description}</p><div class="class-list"><span>Dostępne klasy</span><div>${info.classes.map(cls=>`<span class="class-chip">${cls}</span>`).join('')}</div></div></article>`).join('')}</div>
</section>
<section class="picker-section"><h2 class="section-title">Oceny klas i specjalizacji</h2><p class="section-lead">Poniżej znajdziesz oceniane zestawy rasy, klasy i specjalizacji.</p>
<section class="toolbar">
<select id="race"><option value="">Wszystkie rasy</option>${races.map(x=>`<option>${x}</option>`).join('')}</select>
<select id="cls"><option value="">Wszystkie klasy</option>${classes.map(x=>`<option>${x}</option>`).join('')}</select>
<select id="spec"><option value="">Wszystkie specy</option>${specs.map(x=>`<option>${x}</option>`).join('')}</select>
<select id="sort"><option value="avg">Najwyższa ocena</option><option value="pvp">PvP</option><option value="pve">PvE</option><option value="level">Leveling</option><option value="solo">Solo / World</option><option value="end">Endgame</option></select>
<button id="reset">Wyczyść moje wybory</button>
<input id="search" type="search" placeholder="Szukaj rasy, klasy, specy lub profesji…" aria-label="Szukaj postaci">
<label class="chosen-filter"><input id="chosen-only" type="checkbox"> Pokaż tylko moje wybory</label>
</section>
<div class="legend">⭐ Must play &nbsp; 🔥 Bardzo chcę &nbsp; 👍 Może być &nbsp; ❌ Odpada</div>
<div id="summary"></div><div id="results-count" aria-live="polite"></div><section id="cards"></section>
</section>
</main>`
}

function render(){
const idx={avg:3,pve:4,pvp:5,level:6,solo:7,end:8}[filter.sort]
const query=filter.search.trim().toLocaleLowerCase('pl')
let rows=data.filter(x=>(!filter.race||x[0]===filter.race)&&(!filter.cls||x[1]===filter.cls)&&(!filter.spec||x[2]===filter.spec))
if(query)rows=rows.filter(x=>[x[0],x[1],x[2],x[9]].some(value=>value.toLocaleLowerCase('pl').includes(query)))
if(filter.chosenOnly)rows=rows.filter(x=>marks[x.slice(0,3).join('|')])
rows.sort((a,b)=>b[idx]-a[idx])
document.querySelector('#results-count').textContent=`Widoczne postacie: ${rows.length} z ${data.length}`
document.querySelector('#cards').innerHTML=rows.length?rows.map(x=>{
const k=x.slice(0,3).join('|'), m=marks[k]||''
return `<article class="card ${m?'chosen':''}">
<div class="top"><div><small>${x[0]}</small><h2>${x[1]} — ${x[2]}</h2></div><strong>${x[3].toFixed(1)}<small>/10</small></strong></div>
<div class="stats">${[['PvE',x[4]],['PvP',x[5]],['Level',x[6]],['Solo',x[7]],['Endgame',x[8]]].map(y=>`<span>${y[0]}<b>${y[1]}</b></span>`).join('')}</div>
<div class="prof">🛠 ${x[9]}</div>
<div class="actions">${[['⭐','Must play'],['🔥','Bardzo chcę'],['👍','Może być'],['❌','Odpada']].map(([e,label])=>`<button type="button" class="${m===e?'active':''}" data-k="${k}" data-mark="${e}" aria-label="${label}: ${x[0]} ${x[1]} ${x[2]}" title="${label}">${e}</button>`).join('')}</div>
</article>`}).join(''):'<div class="empty-state">Nie znaleziono postaci. Zmień wyszukiwanie lub filtry.</div>'
document.querySelector('#summary').innerHTML=`<b>Moje wybory: ${Object.keys(marks).length}</b> <span>⭐ ${Object.values(marks).filter(x=>x==='⭐').length}</span> <span>🔥 ${Object.values(marks).filter(x=>x==='🔥').length}</span> <span>👍 ${Object.values(marks).filter(x=>x==='👍').length}</span> <span>❌ ${Object.values(marks).filter(x=>x==='❌').length}</span>`
document.querySelectorAll('.actions button').forEach(b=>b.onclick=()=>setMark(b.dataset.k,b.dataset.mark))
}

async function loadMarks(){
if(!user){marks={};render();return}
const {data,error}=await supabase.from('choices').select('character_key,mark').eq('user_id',user.id)
if(error){console.error('LOAD MARKS ERROR:',error);return}
marks=Object.fromEntries((data||[]).map(x=>[x.character_key,x.mark]))
render()
}
async function setMark(k,mark){
if(!user){alert('Najpierw zaloguj się przez Discord.');return}
if(marks[k]===mark){
const {error}=await supabase.from('choices').delete().eq('user_id',user.id).eq('character_key',k)
if(error){console.error('DELETE MARK ERROR:',error);alert('Nie udało się usunąć wyboru.');return}
delete marks[k]
} else {
const {error}=await supabase.from('choices').upsert({user_id:user.id,character_key:k,mark},{onConflict:'user_id,character_key'})
if(error){console.error('SAVE MARK ERROR:',error);alert('Nie udało się zapisać wyboru.');return}
marks[k]=mark
}
render()
}
function renderAuth(){
const a=document.querySelector('#auth')
a.innerHTML=!supabase
  ? '<span class="user">Logowanie niedostępne — brak konfiguracji Supabase.</span>'
  : user
    ? `<span class="user"></span><button id="logout">Wyloguj</button>`
    : `<button id="login">🔵 Zaloguj przez Discord</button>`
if(user){
  a.querySelector('.user').textContent=user.user_metadata?.full_name||user.email||'Discord user'
  a.querySelector('#logout').onclick=async()=>{
    const {error}=await supabase.auth.signOut()
    if(error){console.error('SIGN OUT ERROR:',error);alert('Nie udało się wylogować.');return}
    user=null;marks={};renderAuth();render()
  }
}
const login=a.querySelector('#login')
if(login)login.onclick=async()=>{
  const {error}=await supabase.auth.signInWithOAuth({provider:'discord',options:{redirectTo:location.origin}})
  if(error){console.error('DISCORD LOGIN ERROR:',error);alert('Błąd logowania przez Discord: '+error.message)}
}
}
shell()
;['race','cls','spec','sort'].forEach(id=>document.querySelector('#'+id).onchange=e=>{filter[{race:'race',cls:'cls',spec:'spec',sort:'sort'}[id]]=e.target.value;render()})
document.querySelector('#search').oninput=e=>{filter.search=e.target.value;render()}
document.querySelector('#chosen-only').onchange=e=>{filter.chosenOnly=e.target.checked;render()}
document.querySelectorAll('[data-race-select]').forEach(button=>button.onclick=()=>{
  filter.race=button.dataset.raceSelect
  document.querySelector('#race').value=filter.race
  render()
  document.querySelector('.picker-section').scrollIntoView({behavior:'smooth',block:'start'})
})
document.querySelector('#reset').onclick=async()=>{
if(!user)return alert('Zaloguj się.')
const {error}=await supabase.from('choices').delete().eq('user_id',user.id)
if(error){console.error('RESET MARKS ERROR:',error);alert('Nie udało się wyczyścić wyborów.');return}
marks={};render()
}
renderAuth()
render()

async function initialize(){
  if(!supabase)return

  // Supabase normally processes the OAuth URL itself. This fallback also
  // handles an implicit-flow callback if the URL still contains both tokens.
  const hash=new URLSearchParams(window.location.hash.slice(1))
  const access_token=hash.get('access_token')
  const refresh_token=hash.get('refresh_token')
  if(access_token&&refresh_token){
    const {data,error}=await supabase.auth.setSession({access_token,refresh_token})
    if(error)console.error('SET SESSION ERROR:',error)
    else window.history.replaceState({},document.title,window.location.pathname+window.location.search)
    user=data?.session?.user||null
  }else{
    const {data,error}=await supabase.auth.getSession()
    if(error)console.error('SESSION ERROR:',error)
    user=data?.session?.user||null
  }
  renderAuth()
  await loadMarks()

  // Keep this callback synchronous; Supabase warns against awaiting auth calls
  // from inside onAuthStateChange callbacks.
  supabase.auth.onAuthStateChange((_event,session)=>{
    user=session?.user||null
    renderAuth()
    void loadMarks()
  })
}

void initialize().catch(error=>{
  console.error('APP INITIALIZATION ERROR:',error)
  const a=document.querySelector('#auth')
  if(a)a.textContent='Nie udało się uruchomić logowania. Sprawdź konfigurację Supabase.'
})
