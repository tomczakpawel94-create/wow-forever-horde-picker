const supabase = createClient(
  SUPABASE_URL || "https://placeholder.supabase.co",
  SUPABASE_ANON_KEY || "placeholder",
  {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
      flowType: "implicit"
    }
  }
)

let user = null
let marks = {}

const filter = {
  race: "all",
  cls: "all",
  spec: "all",
  sort: "default"
}


// =========================
// AUTH
// =========================

function renderAuth() {
  const a = document.querySelector("#auth")

  if (!a) return

  if (user) {
    a.innerHTML = `
      <span class="user">
        ${user.user_metadata?.full_name || user.email || "Discord user"}
      </span>
      <button id="logout">Wyloguj</button>
    `

    document.querySelector("#logout").onclick = async () => {
      await supabase.auth.signOut()

      user = null
      marks = {}

      renderAuth()
      render()
    }

  } else {

    a.innerHTML = `
      <button id="login">🔵 Zaloguj przez Discord</button>
    `

    document.querySelector("#login").onclick = async () => {

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        console.error("DISCORD LOGIN ERROR:", error)
        alert("Błąd logowania przez Discord: " + error.message)
      }
    }
  }
}


// =========================
// LOAD MARKS
// =========================

async function loadMarks() {

  marks = {}

  if (!user) {
    render()
    return
  }

  const { data, error } = await supabase
    .from("choices")
    .select("character_key, mark")
    .eq("user_id", user.id)

  if (error) {
    console.error("LOAD MARKS ERROR:", error)
    return
  }

  for (const row of data || []) {
    marks[row.character_key] = row.mark
  }

  render()
}


// =========================
// SAVE MARK
// =========================

async function setMark(characterKey, mark) {

  if (!user) {
    alert("Najpierw zaloguj się przez Discord.")
    return
  }

  if (marks[characterKey] === mark) {

    const { error } = await supabase
      .from("choices")
      .delete()
      .eq("user_id", user.id)
      .eq("character_key", characterKey)

    if (error) {
      console.error("DELETE MARK ERROR:", error)
      alert("Nie udało się usunąć wyboru.")
      return
    }

    delete marks[characterKey]

  } else {

    const { error } = await supabase
      .from("choices")
      .upsert(
        {
          user_id: user.id,
          character_key: characterKey,
          mark: mark
        },
        {
          onConflict: "user_id,character_key"
        }
      )

    if (error) {
      console.error("SAVE MARK ERROR:", error)
      alert("Nie udało się zapisać wyboru.")
      return
    }

    marks[characterKey] = mark
  }

  render()
}


// =========================
// FILTERS
// =========================

function getFilteredCharacters() {

  let result = characters.filter(c => {

    if (filter.race !== "all" && c.race !== filter.race)
      return false

    if (filter.cls !== "all" && c.cls !== filter.cls)
      return false

    if (filter.spec !== "all" && c.spec !== filter.spec)
      return false

    return true
  })


  if (filter.sort === "name") {

    result.sort((a, b) =>
      `${a.cls} ${a.spec}`.localeCompare(`${b.cls} ${b.spec}`)
    )

  }

  if (filter.sort === "pve") {

    result.sort((a, b) =>
      (b.pve || 0) - (a.pve || 0)
    )

  }

  if (filter.sort === "pvp") {

    result.sort((a, b) =>
      (b.pvp || 0) - (a.pvp || 0)
    )

  }

  if (filter.sort === "leveling") {

    result.sort((a, b) =>
      (b.leveling || 0) - (a.leveling || 0)
    )

  }

  return result
}


// =========================
// SHELL
// =========================

function shell() {

  const app = document.querySelector("#app")

  if (!app) return

  app.innerHTML = `

    <header>

      <div>
        <h1>WoW Forever — Horde Picker</h1>
        <p>Wybierz swoją klasę, specjalizację i oceń swoje opcje.</p>
      </div>

      <div id="auth"></div>

    </header>


    <div class="toolbar">

      <select id="race">
        <option value="all">Wszystkie rasy</option>
      </select>

      <select id="cls">
        <option value="all">Wszystkie klasy</option>
      </select>

      <select id="spec">
        <option value="all">Wszystkie specy</option>
      </select>

      <select id="sort">

        <option value="default">
          Domyślna kolejność
        </option>

        <option value="name">
          Nazwa A-Z
        </option>

        <option value="pve">
          PvE
        </option>

        <option value="pvp">
          PvP
        </option>

        <option value="leveling">
          Leveling
        </option>

      </select>

      <button id="reset">
        Reset moich wyborów
      </button>

    </div>


    <div class="legend">
      ⭐ Main &nbsp;&nbsp;
      🔥 Bardzo chcę grać &nbsp;&nbsp;
      👍 Rozważam &nbsp;&nbsp;
      ❌ Nie chcę
    </div>


    <div id="summary"></div>

    <div id="list"></div>

  `


  // =========================
  // RACES
  // =========================

  const races = [
    ...new Set(characters.map(c => c.race))
  ].sort()


  const raceSelect = document.querySelector("#race")

  for (const race of races) {

    const option = document.createElement("option")

    option.value = race
    option.textContent = race

    raceSelect.appendChild(option)
  }


  // =========================
  // CLASSES
  // =========================

  const classes = [
    ...new Set(characters.map(c => c.cls))
  ].sort()


  const clsSelect = document.querySelector("#cls")

  for (const cls of classes) {

    const option = document.createElement("option")

    option.value = cls
    option.textContent = cls

    clsSelect.appendChild(option)
  }


  // =========================
  // SPECS
  // =========================

  const specs = [
    ...new Set(characters.map(c => c.spec))
  ].sort()


  const specSelect = document.querySelector("#spec")

  for (const spec of specs) {

    const option = document.createElement("option")

    option.value = spec
    option.textContent = spec

    specSelect.appendChild(option)
  }


  // Przywracamy aktualne filtry

  raceSelect.value = filter.race
  clsSelect.value = filter.cls
  specSelect.value = filter.spec
  document.querySelector("#sort").value = filter.sort
}


// =========================
// RENDER
// =========================

function render() {

  const list = document.querySelector("#list")

  if (!list) return


  const filtered = getFilteredCharacters()


  // =========================
  // SUMMARY
  // =========================

  const summary = document.querySelector("#summary")

  if (summary) {

    const main = Object.values(marks)
      .filter(x => x === "⭐").length

    const fire = Object.values(marks)
      .filter(x => x === "🔥").length

    const like = Object.values(marks)
      .filter(x => x === "👍").length

    const no = Object.values(marks)
      .filter(x => x === "❌").length


    summary.innerHTML = `

      <span>⭐ Main: <b>${main}</b></span>

      <span>🔥 Chcę: <b>${fire}</b></span>

      <span>👍 Rozważam: <b>${like}</b></span>

      <span>❌ Nie chcę: <b>${no}</b></span>

    `
  }


  // =========================
  // CARDS
  // =========================

  list.innerHTML = ""


  for (const c of filtered) {

    const key = c.key ||
      `${c.race}-${c.cls}-${c.spec}`


    const currentMark = marks[key] || ""


    const card = document.createElement("div")

    card.className =
      "card" +
      (currentMark === "⭐" ? " chosen" : "")


    card.innerHTML = `

      <div class="top">

        <div>

          <strong>
            ${c.spec}
          </strong>

          <small>
            ${c.cls} • ${c.race}
          </small>

        </div>

      </div>


      <div class="stats">

        <span>
          PvE
          <b>${c.pve ?? "-"}/10</b>
        </span>

        <span>
          PvP
          <b>${c.pvp ?? "-"}/10</b>
        </span>

        <span>
          Leveling
          <b>${c.leveling ?? "-"}/10</b>
        </span>

        <span>
          Solo
          <b>${c.solo ?? "-"}/10</b>
        </span>

        <span>
          Endgame
          <b>${c.endgame ?? "-"}/10</b>
        </span>

      </div>


      <div class="prof">
        ${c.professions || "Brak danych o profesjach"}
      </div>


      <div class="actions">

        <button
          data-key="${key}"
          data-mark="⭐"
          class="${currentMark === "⭐" ? "active" : ""}">
          ⭐
        </button>

        <button
          data-key="${key}"
          data-mark="🔥"
          class="${currentMark === "🔥" ? "active" : ""}">
          🔥
        </button>

        <button
          data-key="${key}"
          data-mark="👍"
          class="${currentMark === "👍" ? "active" : ""}">
          👍
        </button>

        <button
          data-key="${key}"
          data-mark="❌"
          class="${currentMark === "❌" ? "active" : ""}">
          ❌
        </button>

      </div>

    `


    card.querySelectorAll(".actions button").forEach(button => {

      button.onclick = () => {

        setMark(
          button.dataset.key,
          button.dataset.mark
        )

      }

    })


    list.appendChild(card)
  }


  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="card">
        Brak wyników dla wybranych filtrów.
      </div>
    `
  }
}


// =========================
// INITIALIZE
// =========================

async function initialize() {

  shell()


  // =========================
  // FILTER EVENTS
  // =========================

  document.querySelector("#race").onchange = e => {

    filter.race = e.target.value

    render()
  }


  document.querySelector("#cls").onchange = e => {

    filter.cls = e.target.value

    render()
  }


  document.querySelector("#spec").onchange = e => {

    filter.spec = e.target.value

    render()
  }


  document.querySelector("#sort").onchange = e => {

    filter.sort = e.target.value

    render()
  }


  // =========================
  // RESET
  // =========================

  document.querySelector("#reset").onclick = async () => {

    if (!user) {

      alert("Najpierw zaloguj się przez Discord.")

      return
    }


    const { error } = await supabase
      .from("choices")
      .delete()
      .eq("user_id", user.id)


    if (error) {

      console.error("RESET ERROR:", error)

      alert("Nie udało się wyczyścić wyborów.")

      return
    }


    marks = {}

    render()
  }


  // =========================
  // AUTH STATE
  // =========================

  supabase.auth.onAuthStateChange((event, session) => {

    console.log(
      "AUTH EVENT:",
      event,
      session?.user?.id
    )


    user = session?.user || null

    renderAuth()


    // Ważne:
    // nie robimy tutaj await

    setTimeout(() => {

      loadMarks()

    }, 0)

  })


  // =========================
  // OAUTH HASH
  // =========================

  const hash = new URLSearchParams(
    window.location.hash.substring(1)
  )


  const accessToken = hash.get("access_token")
  const refreshToken = hash.get("refresh_token")


  if (accessToken && refreshToken) {

    console.log("OAUTH TOKENS DETECTED")


    const { data, error } =
      await supabase.auth.setSession({

        access_token: accessToken,

        refresh_token: refreshToken

      })


    if (error) {

      console.error(
        "SET SESSION ERROR:",
        error
      )

    } else {

      console.log(
        "SESSION CREATED:",
        data.session?.user?.id
      )


      user = data.session?.user || null


      // Usuwamy tokeny z adresu

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname +
        window.location.search
      )

    }
  }


  // =========================
  // GET SESSION
  // =========================

  const {
    data,
    error
  } = await supabase.auth.getSession()


  if (error) {

    console.error(
      "SESSION ERROR:",
      error
    )
  }


  user =
    data?.session?.user ||
    user ||
    null


  console.log(
    "FINAL USER:",
    user?.id || "NO USER"
  )


  renderAuth()

  await loadMarks()
}


// =========================
// START
// =========================

initialize()
