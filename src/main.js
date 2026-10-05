import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const app = document.querySelector('#app')

const data = [
  ['Troll', 'Warlock', 'Affliction', 9.6, 9.7, 9.8, 8.0, 9.1, 9.6, 'Engineering + Tailoring'],
  ['Undead', 'Warlock', 'Affliction', 9.5, 9.6, 9.7, 8.1, 9.1, 9.5, 'Engineering + Tailoring'],
  ['Orc', 'Warlock', 'Affliction', 9.4, 9.5, 9.5, 8.1, 9.0, 9.5, 'Engineering + Tailoring'],
  ['Troll', 'Warlock', 'Destruction', 9.5, 9.5, 9.6, 8.2, 8.9, 9.5, 'Engineering + Tailoring'],
  ['Undead', 'Rogue', 'Subtlety', 9.5, 8.6, 9.9, 8.1, 9.6, 8.4, 'Engineering + Mining'],
  ['Troll', 'Rogue', 'Subtlety', 9.5, 8.6, 9.9, 8.1, 9.6, 8.4, 'Engineering + Mining'],
  ['Troll', 'Mage', 'Frost', 9.4, 8.9, 9.9, 8.9, 9.2, 8.9, 'Engineering + Tailoring'],
  ['Troll', 'Shaman', 'Enhancement', 9.4, 9.2, 9.5, 9.0, 9.3, 9.0, 'Engineering + Blacksmithing'],
  ['Orc', 'Shaman', 'Enhancement', 9.4, 9.2, 9.5, 9.0, 9.3, 9.0, 'Engineering + Blacksmithing'],
  ['Undead', 'Priest', 'Shadow', 9.4, 9.2, 9.5, 8.5, 8.8, 9.1, 'Engineering + Tailoring'],
  ['Troll', 'Priest', 'Shadow', 9.5, 9.2, 9.5, 8.5, 8.8, 9.1, 'Engineering + Tailoring'],
  ['Orc', 'Warrior', 'Fury', 9.3, 9.7, 8.8, 8.5, 8.9, 9.5, 'Engineering + Blacksmithing'],
  ['Troll', 'Warrior', 'Fury', 9.3, 9.5, 8.8, 8.6, 8.9, 9.5, 'Engineering + Blacksmithing'],
  ['Tauren', 'Druid', 'Feral', 9.2, 9.0, 9.3, 9.0, 9.5, 8.8, 'Engineering + Leatherworking'],
  ['Tauren', 'Druid', 'Restoration', 9.2, 9.4, 9.1, 8.3, 8.8, 9.3, 'Alchemy + Herbalism'],
  ['Tauren', 'Warrior', 'Protection', 9.2, 9.0, 7.7, 7.5, 9.3, 9.1, 'Engineering + Blacksmithing'],
  ['Undead', 'Paladin', 'Retribution', 9.1, 8.8, 9.1, 8.9, 9.2, 8.8, 'Engineering + Blacksmithing'],
  ['Orc', 'Rogue', 'Subtlety', 9.4, 8.7, 9.7, 8.1, 9.5, 8.3, 'Engineering + Mining'],
  ['Orc', 'Shaman', 'Elemental', 9.3, 9.2, 9.5, 8.5, 8.9, 9.0, 'Engineering + Mining'],
  ['Skyborne — Windshaper', 'Shaman', 'Restoration', 9.3, 9.4, 9.2, 8.4, 8.6, 9.4, 'Alchemy + Herbalism'],
  ['Skyborne — Windshaper', 'Rogue', 'Subtlety', 9.2, 8.6, 9.7, 8.0, 9.3, 8.3, 'Engineering + Mining'],
  ['Troll', 'Hunter', 'Beast Mastery', 9.2, 9.3, 9.1, 9.6, 9.7, 9.0, 'Engineering + Skinning'],
  ['Troll', 'Hunter', 'Marksmanship', 9.1, 9.4, 9.3, 8.7, 8.9, 9.5, 'Engineering + Leatherworking'],
  ['Orc', 'Hunter', 'Beast Mastery', 9.1, 9.2, 8.9, 9.5, 9.5, 8.8, 'Engineering + Skinning'],
  ['Tauren', 'Hunter', 'Beast Mastery', 8.8, 9.0, 8.7, 9.5, 9.5, 8.8, 'Engineering + Skinning'],
  ['Undead', 'Mage', 'Frost', 9.3, 8.9, 9.8, 8.9, 9.2, 8.8, 'Engineering + Tailoring'],
  ['Orc', 'Mage', 'Frost', 9.0, 8.7, 9.5, 8.8, 9.0, 8.6, 'Engineering + Tailoring'],
  ['Tauren', 'Shaman', 'Restoration', 9.1, 9.5, 9.2, 8.3, 8.5, 9.5, 'Alchemy + Herbalism'],
  ['Troll', 'Shaman', 'Restoration', 9.3, 9.6, 9.3, 8.4, 8.6, 9.6, 'Alchemy + Herbalism'],
  ['Undead', 'Priest', 'Discipline', 9.3, 9.3, 9.5, 8.0, 8.0, 9.3, 'Engineering + Tailoring'],
  ['Troll', 'Priest', 'Discipline', 9.2, 9.2, 9.5, 8.0, 8.0, 9.3, 'Engineering + Tailoring'],
  ['Orc', 'Warrior', 'Arms', 9.0, 8.8, 9.4, 7.8, 8.4, 8.8, 'Engineering + Blacksmithing'],
  ['Troll', 'Warrior', 'Arms', 9.0, 8.8, 9.4, 7.8, 8.4, 8.8, 'Engineering + Blacksmithing']
]

const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

let user = null
let marks = {}
let filter = { race: '', cls: '', spec: '', sort: 'avg' }

const races = [...new Set(data.map(x => x[0]))]
const classes = [...new Set(data.map(x => x[1]))]
const specs = [...new Set(data.map(x => x[2]))]

function shell() {
  app.innerHTML = `<main class="wrap">
    <header>
      <div>
        <h1>⚔ WoW Forever — Horde Picker</h1>
        <p>Wybierz swojego maina. Każdy użytkownik Discorda ma własne wybory.</p>
      </div>
      <div id="auth"></div>
    </header>

    <section class="toolbar">
      <select id="race"><option value="">Wszystkie rasy</option>${races.map(x => `<option>${x}</option>`).join('')}</select>
      <select id="cls"><option value="">Wszystkie klasy</option>${classes.map(x => `<option>${x}</option>`).join('')}</select>
      <select id="spec"><option value="">Wszystkie specy</option>${specs.map(x => `<option>${x}</option>`).join('')}</select>
      <select id="sort">
        <option value="avg">Najwyższa ocena</option>
        <option value="pvp">PvP</option>
        <option value="pve">PvE</option>
        <option value="level">Leveling</option>
        <option value="solo">Solo / World</option>
        <option value="end">Endgame</option>
      </select>
      <button id="reset">Wyczyść moje wybory</button>
    </section>

    <div class="legend">⭐ Must play &nbsp; 🔥 Bardzo chcę &nbsp; 👍 Może być &nbsp; ❌ Odpada</div>
    <div id="summary"></div>
    <section id="cards"></section>
  </main>`
}

function render() {
  const idx = { avg: 3, pve: 4, pvp: 5, level: 6, solo: 7, end: 8 }[filter.sort]

  const rows = data.filter(x =>
    (!filter.race || x[0] === filter.race) &&
    (!filter.cls || x[1] === filter.cls) &&
    (!filter.spec || x[2] === filter.spec)
  )

  rows.sort((a, b) => b[idx] - a[idx])

  document.querySelector('#cards').innerHTML = rows.map(x => {
    const k = x.slice(0, 3).join('|')
    const m = marks[k] || ''

    return `<article class="card ${m ? 'chosen' : ''}">
      <div class="top">
        <div><small>${x[0]}</small><h2>${x[1]} — ${x[2]}</h2></div>
        <strong>${x[3].toFixed(1)}<small>/10</small></strong>
      </div>
      <div class="stats">${[['PvE', x[4]], ['PvP', x[5]], ['Level', x[6]], ['Solo', x[7]], ['Endgame', x[8]]].map(y => `<span>${y[0]}<b>${y[1]}</b></span>`).join('')}</div>
      <div class="prof">🛠 ${x[9]}</div>
      <div class="actions">${['⭐', '🔥', '👍', '❌'].map(e => `<button class="${m === e ? 'active' : ''}" data-k="${k}" data-mark="${e}">${e}</button>`).join('')}</div>
    </article>`
  }).join('')

  document.querySelector('#summary').innerHTML =
    `<b>Moje wybory: ${Object.keys(marks).length}</b> <span>⭐ ${Object.values(marks).filter(x => x === '⭐').length}</span> <span>🔥 ${Object.values(marks).filter(x => x === '🔥').length}</span> <span>👍 ${Object.values(marks).filter(x => x === '👍').length}</span>`

  document.querySelectorAll('.actions button').forEach(button => {
    button.onclick = () => setMark(button.dataset.k, button.dataset.mark)
  })
}

async function loadMarks() {
  if (!user) {
    marks = {}
    render()
    return
  }

  const { data: rows, error } = await supabase
    .from('choices')
    .select('character_key,mark')
    .eq('user_id', user.id)

  if (!error && rows) {
    marks = Object.fromEntries(rows.map(x => [x.character_key, x.mark]))
  }

  render()
}

async function setMark(k, mark) {
  if (!user) {
    alert('Najpierw zaloguj się przez Discord.')
    return
  }

  if (marks[k] === mark) {
    delete marks[k]
    await supabase.from('choices').delete().eq('user_id', user.id).eq('character_key', k)
  } else {
    marks[k] = mark
    await supabase.from('choices').upsert(
      { user_id: user.id, character_key: k, mark },
      { onConflict: 'user_id,character_key' }
    )
  }

  render()
}

function renderAuth() {
  const authElement = document.querySelector('#auth')
  if (!authElement) return

  authElement.innerHTML = user
    ? `<span class="user">${user.user_metadata?.full_name || user.email || 'Discord user'}</span><button id="logout">Wyloguj</button>`
    : `<button id="login">🔵 Zaloguj przez Discord</button>`

  const loginButton = document.querySelector('#login')
  if (loginButton) {
    loginButton.onclick = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: { redirectTo: location.origin }
      })

      if (error) {
        console.error('Błąd logowania Discord:', error)
        alert(`Nie udało się rozpocząć logowania: ${error.message}`)
      }
    }
  }

  const logoutButton = document.querySelector('#logout')
  if (logoutButton) {
    logoutButton.onclick = async () => {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Błąd wylogowania:', error)
        alert(`Nie udało się wylogować: ${error.message}`)
      }
    }
  }
}

function getTokensFromHash() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''))
  const accessToken = hash.get('access_token')
  const refreshToken = hash.get('refresh_token')

  if (!accessToken || !refreshToken) return null
  return { access_token: accessToken, refresh_token: refreshToken }
}

async function initializeAuth() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    renderAuth()
    return
  }

  const tokens = getTokensFromHash()

  if (tokens) {
    const { data: sessionData, error } = await supabase.auth.setSession(tokens)

    if (error) {
      console.error('Nie udało się ustawić sesji z tokenów URL:', error)
    } else {
      user = sessionData.session?.user || null
    }

    // Usuń tokeny z paska adresu po ich zapisaniu w sesji Supabase.
    history.replaceState(null, document.title, location.pathname + location.search)
  }

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error('Nie udało się odczytać sesji Supabase:', error)
  }

  user = data?.session?.user || user
  renderAuth()
}

shell()

;['race', 'cls', 'spec', 'sort'].forEach(id => {
  document.querySelector(`#${id}`).onchange = event => {
    filter[id] = event.target.value
    render()
  }
})

document.querySelector('#reset').onclick = async () => {
  if (!user) return alert('Zaloguj się.')

  await supabase.from('choices').delete().eq('user_id', user.id)
  marks = {}
  render()
}

supabase.auth.onAuthStateChange((_event, session) => {
  user = session?.user || null
  renderAuth()
  loadMarks()
})

await initializeAuth()
await loadMarks()
