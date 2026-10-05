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
let planSelection = null
let playerPlans = []
let selectedStartRace = 'Undead'
let mapZoom = 1
let mapDrag = null

const primaryProfessions = ['Alchemy','Blacksmithing','Enchanting','Engineering','Herbalism','Leatherworking','Mining','Skinning','Tailoring']
const secondaryProfessions = ['Cooking','Fishing','First Aid']

// Starting regions used by WoW: Forever's Horde races. Marker positions are
// approximate world-map locations; the zone names are the useful destination.
const raceStartInfo = {
  'Orc':{zone:'Durotar · Valley of Trials',continent:'Kalimdor',x:34,y:35},
  'Troll':{zone:'Durotar · Valley of Trials',continent:'Kalimdor',x:34,y:35},
  'Tauren':{zone:'Mulgore · Camp Narache',continent:'Kalimdor',x:22,y:48},
  'Undead':{zone:'Tirisfal Glades · Deathknell',continent:'Eastern Kingdoms',x:69,y:17},
  'Skyborne — Windshaper':{zone:'Zephras Isle',continent:'Wielkie Morze',x:51,y:37}
  'Orc':{zone:'Durotar · Valley of Trials',continent:'Kalimdor'},
  'Troll':{zone:'Durotar · Valley of Trials',continent:'Kalimdor'},
  'Tauren':{zone:'Mulgore · Camp Narache',continent:'Kalimdor'},
  'Undead':{zone:'Tirisfal Glades · Deathknell',continent:'Eastern Kingdoms'},
  'Skyborne — Windshaper':{zone:'Zephras Isle',continent:'Wielkie Morze'}
}

const professionInfo = {
  Alchemy:{type:'Główna · wytwarzanie',what:'Warzy mikstury zdrowia i many, eliksiry wzmacniające statystyki lub odporności, oleje oraz — zależnie od dostępnych recept — transmutacje materiałów. Mikstury są zużywalne: używasz ich przed walką lub w jej trakcie, zgodnie z ograniczeniami przedmiotów.',materials:'Najważniejsze są zioła z Herbalism. Do tego dochodzą fiolki od sprzedawców, części potworów i inne składniki wymagane przez konkretny przepis.',how:'Naucz się profesji i recept u alchemika-trenera. Sprawdzaj koszt przepisu przed wytwarzaniem; zioła możesz zbierać samodzielnie albo kupić. Różne recepty mają progi umiejętności, a nowe wzory bywają u trenerów, sprzedawców lub w świecie.',good:'Pomaga każdej klasie: leczące i przywracające manę mikstury ułatwiają levelowanie, a eliksiry przydają się w PvE i PvP. Dobre źródło zarobku, jeśli sprzedajesz mikstury potrzebne innym.',pair:'Herbalism — zbierasz składniki do własnych mikstur.',start:'Na początek wybierz Herbalism razem z Alchemy, zbieraj każde napotkane zioło i rób mikstury, których naprawdę używasz. Nie wydawaj całego złota na rzadkie składniki; część recept może być droga.'},
  Blacksmithing:{type:'Główna · wytwarzanie',what:'Pracuje z metalem, by tworzyć wybrane bronie, zbroje, tarcze, klucze i ulepszenia ekwipunku, takie jak kamienie ostrzące. Konkretna broń lub zbroja zależy od recepty, umiejętności i wymagań przedmiotu — profesja nie daje automatycznie wyposażenia dla każdej klasy.',materials:'Głównie rudy i kamień wydobywane przez Mining, przetopione sztabki oraz dodatki, takie jak skóra, tkaniny, topniki i kleje od sprzedawców lub z łupów.',how:'Wydobywaj rudę, przetapiaj ją w sztabki, kupuj potrzebne dodatki i wytwarzaj przy kowadle, używając kowalskiego młotka. Ucz się recept u trenerów i ze schematów; przed kosztownym craftem sprawdź poziom postaci i typ pancerza/broni.',good:'Dla graczy chcących samodzielnie robić metalowe wyposażenie lub sprzedawać je. Najwięcej naturalnych recept dotyczy użytkowników zbroi i broni metalowej, ale przydatność konkretnego przedmiotu zależy od jego wymagań.',pair:'Mining — dostarcza rudy, kamień i metal do przetopienia.',start:'Zacznij od Mining i zbieraj miedź podczas questów. Nie przetapiaj ani nie zużywaj wszystkich sztabek od razu: przepisy potrzebują też kamieni i dodatkowych komponentów. Kowalstwo wymaga miejsca w torbach.'},
  Enchanting:{type:'Główna · wytwarzanie i rozkładanie',what:'Nakłada trwałe ulepszenia na broń i elementy pancerza: mogą zwiększać statystyki albo dodawać użyteczne efekty. Enchanter potrafi też rozkładać magiczne przedmioty na pył, esencje i odłamki potrzebne do zaklinania.',materials:'Składniki pochodzą głównie z rozkładania zielonych, niebieskich i lepszych magicznych przedmiotów. Potrzebne są także specjalne różdżki (rods) oraz reagenty wymagane przez przepis.',how:'Disenchanting niszczy przedmiot i nie da się go odzyskać — rozkładaj tylko rzeczy, których nie chcesz używać ani sprzedać. Ucz się enchantów i recept u trenerów lub ze schematów; część zaklęć wymaga różdżki z odpowiedniego materiału.',good:'Ulepszenia przydają się niemal każdej postaci, ale rozwój może być kosztowny, bo materiały konkurują z wartością sprzedawanego ekwipunku. Możesz zaklinać przedmioty innych graczy, jeśli spełnione są warunki użycia recepty.',pair:'Tailoring — szyje przedmioty, które można rozłożyć, choć na składniki nadal trzeba zdobyć materiały.',start:'Zanim rozłożysz przedmiot, porównaj jego cenę u sprzedawcy/Auction House z możliwymi materiałami. Trzymaj potrzebne różdżki. Nie zakładaj, że każdy przedmiot da konkretny pył lub esencję — wynik zależy od przedmiotu.'},
  Engineering:{type:'Główna · wytwarzanie',what:'Tworzy znacznie więcej niż gadżety: także broń palną, amunicję — w tym pociski, a według danych recept Forever również specjalne strzały — lunety, gogle, bomby i dynamit. Są też urządzenia użytkowe: manekiny odciągające uwagę potworów, mechaniczne zwierzaki, narzędzia i transportery. Wiele gadżetów wymaga odpowiedniego poziomu Engineering także do użycia.',materials:'Podstawą są rudy, sztabki i kamienie z Mining: metal tworzy części, a kamień służy m.in. do prochu wybuchowego. Niektóre recepty wymagają też tkanin, skór, klejnotów, esencji i innych składników.',how:'Trener uczy podstaw, ale mocniejsze przedmioty wymagają schematów znalezionych u sprzedawców, w łupach lub w innych źródłach. Zbieraj rudę i kamień, przetapiaj sztabki, wytwarzaj części, a dopiero potem urządzenie końcowe. Zawsze sprawdź wymagany skill, kto może używać przedmiotu i czy recepta jest dostępna w aktualnej wersji Forever.',good:'Bardzo wszechstronna profesja do PvP, questów i grup: bomba może zadać obrażenia lub kontrolować przeciwnika, manekin dać chwilę na ucieczkę, a broń/amunicja/luneta wesprzeć postać dystansową. Nie każdy gadżet działa na każdej postaci; wymagania i ładunki sprawdzaj w opisie przedmiotu.',pair:'Mining — dostarcza większości metalu i kamienia, więc mocno obniża koszt rozwoju.',start:'Na początku oszczędzaj sztabki i kamień na kolejne komponenty, miej przy sobie Arclight Spanner i sprawdzaj skład recept przed craftem. Jeśli grasz Hunterem, Engineering może dostarczać amunicję i broń palną, ale porównaj ich wymagania i statystyki z łupami/sklepem. Nie każda recepta z klasycznego WoW musi być dostępna identycznie w Forever.'},
  Herbalism:{type:'Główna · zbieranie',what:'Pozwala wykrywać i zbierać rosnące w świecie zioła. To profesja zbieracka: sama nie przerabia roślin na mikstury, lecz dostarcza surowce Alchemy i przedmioty do sprzedaży.',materials:'Zbierasz rośliny bezpośrednio z węzłów w strefach świata. Różne zioła rosną w różnych terenach i wymagają odpowiednio wysokiego poziomu umiejętności.',how:'Naucz się Herbalism u trenera, włącz śledzenie ziół na minimapie i zbieraj węzły, gdy je mijasz. Skill rośnie przez zbieranie odpowiednich dla Ciebie roślin; nadwyżki możesz zachować dla Alchemy albo sprzedać.',good:'Dobry wybór na pierwszą postać: nie wymaga warsztatu ani inwestowania w przepisy, a zioła można sprzedawać. Taureni mają rasową Cultivation, która w Forever może zmieniać zbieranie — sprawdź jej aktualny tooltip.',pair:'Alchemy — zużywa zioła do mikstur i eliksirów.',start:'Kup umiejętność u trenera i włącz śledzenie ziół. Nie sprzedawaj automatycznie wszystkiego: zioła potrzebne do mikstur leczenia/many bywają cenne także dla Twojej postaci.'},
  Leatherworking:{type:'Główna · wytwarzanie',what:'Wyrabia ze skór lekkie zbroje, część kolczug dostępnych w receptach, pancerze ochronne oraz inne przedmioty ze skóry. To nie jest profesja do robienia dowolnego ekwipunku — sprawdzaj typ pancerza i wymagania konkretnego przedmiotu.',materials:'Skóry, scraps i hides zbierane przez Skinning lub kupowane od graczy. Recepty zużywają też nici, sól, barwniki i inne dodatki od sprzedawców, a czasem rzadkie materiały z potworów.',how:'Najpierw zbieraj skóry ze stworzeń, które można oskórować; część niższych skór można przerabiać w wyższe komponenty. Używaj Leatherworking trainerów i schematów, a kosztowne wzory wybieraj pod konkretny cel.',good:'Przydatna, gdy chcesz tworzyć własny skórzany ekwipunek lub sprzedawać go innym. Część recept trafia w potrzeby Rogue, Hunter, Druid i niektórych użytkowników mail, ale zawsze sprawdzaj typ pancerza.',pair:'Skinning — zapewnia skóry bez kupowania ich na rynku.',start:'Zbieraj skórę z bestii przy okazji questów i pilnuj wolnego miejsca w torbach. Przed przerabianiem skór sprawdź kolejne recepty, bo wyższe materiały bywają potrzebne później.'},
  Mining:{type:'Główna · zbieranie i przetapianie',what:'Wykrywa i wydobywa złoża rudy, kamienia i niektórych klejnotów. Umiejętność obejmuje też przetapianie rudy w sztabki; surowce można sprzedać albo przekazać profesjom wytwórczym.',materials:'Złoża znajdują się m.in. w górach, jaskiniach i wzdłuż skalistych tras. Potrzebujesz kilofa, a każde złoże wymaga właściwego poziomu Mining.',how:'Ucz się kolejnych rang u trenera, noś Mining Pick, włącz śledzenie minerałów na minimapie i obiegaj trasy ze złożami. Rudę przetapiaj przy kuźni, jeśli recepta potrzebuje sztabek. Sprawdzaj kolor/nazwę węzła — zbyt wysoki poziom blokuje wydobycie.',good:'Jedna z najłatwiejszych profesji do monetyzowania, bo surowce są używane przez wiele craftów. Świetna dla graczy, którzy chcą finansować trening lub własne recepty.',pair:'Blacksmithing lub Engineering — obie zużywają sztabki i kamień.',start:'Kup kilof i naucz się Mining, zanim ruszysz na questy. Włącz śledzenie złóż; zapamiętaj, że rudej wartości nie tracisz, gdy sprzedajesz ją zamiast od razu wytapiać — wybierz, co daje większy pożytek.'},
  Skinning:{type:'Główna · zbieranie',what:'Pozwala zdjąć skóry i hides z pokonanych stworzeń oznaczonych jako możliwe do oskórowania. Nie tworzy przedmiotów samodzielnie — surowce trafiają do Leatherworking albo na rynek.',materials:'Skóry z bestii i innych odpowiednich stworzeń. Zwykle musisz najpierw zabić i ograbić zwierzę; poziom stworzenia musi pasować do Twojego skilla.',how:'Naucz się Skinning u trenera, miej Skinning Knife i wolne miejsce w torbach. Po ograbieniu celu użyj umiejętności skinning na jego zwłokach. Wraz ze wzrostem poziomu postaci przenoś się do stref z trudniejszymi zwierzętami.',good:'Wygodna dla początkujących, bo rozwija się podczas zwykłego questowania i zamienia dodatkowe zabójstwa w surowce. Możesz sprzedawać skóry albo zużywać je we własnym craftingu.',pair:'Leatherworking — wykorzysta zebrane materiały; nie jest konieczne, jeśli chcesz sprzedawać skóry.',start:'Ograbić cel trzeba przed oskórowaniem. Noś nóż, zbieraj skóry po drodze i kontroluj torby; jeśli zbierasz tylko na sprzedaż, nie musisz brać Leatherworking.'},
  Tailoring:{type:'Główna · wytwarzanie',what:'Szyje ubrania i pancerze typu cloth, torby oraz inne tekstylne przedmioty. Tkaniny zdobywa się głównie z humanoidów, więc Tailoring nie wymaga osobnej profesji zbierackiej.',materials:'Cloth z humanoidów, nici i barwniki od sprzedawców oraz inne reagenty, zależnie od recepty. Rzadsze wzory mogą wymagać składników z instancji, potworów lub rynku.',how:'Zbieraj tkaniny z humanoidów podczas questów, kupuj potrzebne nici/barwniki i szyj przedmioty według recept poznanych u trenera lub ze schematów. Recepty wymagają konkretnych poziomów Tailoring; szycie odbywa się bez kuźni.',good:'Naturalna dla postaci noszących cloth, takich jak Mage, Priest i Warlock, ale torby przydają się każdej klasie. Można sprzedawać torby i wybrane elementy ekwipunku.',pair:'Enchanting — niepotrzebne uszyte przedmioty można rozłożyć; to jednak nie gwarantuje opłacalności.',start:'Zbieraj Linen i inne tkaniny z humanoidów, ale zostaw część na bandage dla First Aid. Torby są praktyczne, lecz materiały także mają cenę — policz koszt przed craftem.'},
  Cooking:{type:'Poboczna · wytwarzanie',what:'Przygotowuje posiłki, które po walce odnawiają zdrowie, a wybrane potrawy dają też czasowe premie. Jedzenie często pozwala początkującemu szybciej wrócić do questów zamiast długo czekać na regenerację.',materials:'Mięso z potworów, ryby z Fishing oraz przyprawy i dodatki od sprzedawców lub z łupów. Każdy przepis wskazuje wymagane składniki i poziom umiejętności.',how:'Naucz się Cooking u trenera i zdobywaj kolejne przepisy u trenerów, sprzedawców lub w świecie. Do gotowania potrzebujesz ognia/stanowiska; używaj przepisów odpowiednich do poziomu skillu i trzymaj zapas składników.',good:'Przydatna każdej klasie, zwłaszcza solo podczas levelowania. Żywność może też być potrzebna innym graczom, więc wybrane recepty mają wartość handlową.',pair:'Fishing — dostarcza ryb, ale można też gotować mięso bez łowienia.',start:'Naucz się Cooking wcześnie, zachowuj mięso z questów zamiast je wyrzucać i gotuj jedzenie na swoim poziomie. Sprawdź, czy masz ognisko oraz czy przepis wymaga dodatkowego składnika od vendora.'},
  Fishing:{type:'Poboczna · zbieranie',what:'Łowi ryby z wody, a także zależne od strefy przedmioty i materiały. Ryby można ugotować, sprzedać lub wykorzystać w innych receptach; łowienie jest spokojnym sposobem na zbieranie.',materials:'Potrzebujesz wędki; przynęty zwiększają tymczasowo skill łowienia. Połów zależy od łowiska, strefy i poziomu Fishing, a nie od walki z potworami.',how:'Naucz się Fishing u trenera, kup wędkę, wyposaż ją i użyj umiejętności przy wodzie. Ćwicz w łowiskach pasujących do poziomu, używaj przynęty, gdy ryby uciekają lub chcesz łowić trudniejszy obszar.',good:'Dobra dla graczy, którzy potrzebują składników do Cooking, polują na określone połowy albo chcą spokojnie zbierać i sprzedawać ryby. Nie wymaga zabijania potworów.',pair:'Cooking — pozwala przerabiać część połowu na posiłki.',start:'Kup zwykłą wędkę i poćwicz przy łatwym łowisku. Załóż wędkę jako broń, nie zapomnij jej ponownie zmienić przed walką; na start nie kupuj drogiej przynęty.'},
  'First Aid':{type:'Poboczna · leczenie poza walką',what:'Zamienia tkaniny w bandaże do leczenia siebie lub sojuszników. Bandaż nie zastępuje czaru healera, ale pozwala odzyskać część zdrowia bez many, gdy możesz na chwilę przerwać walkę.',materials:'Tkaniny z humanoidów; niektóre warianty świata mogą mieć dodatkowe recepty na antidotum i wymagać innych składników. Sprawdź opis przepisu dostępnego u trenera.',how:'Zbieraj cloth, ucz się kolejnych rang First Aid u trenerów lub z książek i wytwarzaj bandaże odpowiednie do poziomu umiejętności. Używaj ich, gdy nie jesteś atakowany — obrażenia mogą przerwać leczenie.',good:'Świetne dla nowych graczy i każdej klasy: zmniejsza zużycie jedzenia, mikstur i many. Jako profesja poboczna nie zabiera miejsca na dwie główne profesje.',pair:'Brak wymaganej pary; Tailoring może zużywać te same tkaniny, więc planuj ich podział.',start:'Zbieraj tkaniny z humanoidów i naucz się bandaży jak najwcześniej. Pamiętaj, że First Aid konkuruje o cloth z Tailoring — jeśli masz obie, zdecyduj, które materiały zachowujesz.'}
}

// Guide text is editorial advice. The ratings and the listed builds remain the site's existing data.
const specGuides = {
  'Warlock|Affliction': {role:'DPS — ranged, damage over time', description:'Nakłada klątwy i efekty obrażeń w czasie, a potem utrzymuje przeciwników pod presją. Dobrze radzi sobie z długimi walkami i solo dzięki petowi oraz narzędziom kontroli.', early:'Sprawne questowanie; pet pomaga utrzymać przeciwników z dala.', mid:'Rośnie siła klątw i kontrola w dungeonach oraz PvP.', late:'Mocny w długich walkach i na wielu celach; wymaga pilnowania efektów.', pros:'Samowystarczalność, kontrola i stałe obrażenia.', cons:'Przygotowanie efektów zajmuje czas; obrażenia nie zawsze są natychmiastowe.'},
  'Warlock|Destruction': {role:'DPS — ranged, obrażenia bezpośrednie i burst', description:'Skupia się na mocnych zaklęciach bezpośrednich i szybkich oknach obrażeń. Przydaje się, gdy ważne jest szybkie wykończenie celu.', early:'Prosty, czytelny styl zaklęć; pilnuj many i zagrożenia.', mid:'Silny burst w dungeonach i potyczkach PvP.', late:'Mocne okna obrażeń, ale trzeba uważać na threat i koszt many.', pros:'Wysokie obrażenia w krótkim czasie.', cons:'Mniej mobilny podczas rzucania czarów; threat i mana wymagają uwagi.'},
  'Rogue|Subtlety': {role:'DPS — melee, skradanie, kontrola i burst', description:'Wykorzystuje skradanie, otwarcie walki i kontrolę przeciwnika. Szczególnie wygodny w PvP i podczas wybierania pojedynczych celów w świecie.', early:'Skradanie daje kontrolę nad rozpoczęciem walki, ale wymaga planowania.', mid:'Dużo narzędzi do kontroli i mocne otwarcia w PvP.', late:'Wysoki potencjał burstu; efektywność zależy od sprzętu i wykonania.', pros:'Skradanie, kontrola, mobilność i wybór starć.', cons:'Mniej wygodny przeciw wielu celom i wymaga dobrego zarządzania energią.'},
  'Mage|Frost': {role:'DPS — ranged, kontrola i spowalnianie', description:'Łączy obrażenia z zamrażaniem, spowalnianiem i utrzymywaniem dystansu. To bezpieczny wybór do levelowania i bardzo mocny styl kontroli w PvP.', early:'Kontrola pomaga bezpiecznie levelować i uciekać z trudnych sytuacji.', mid:'Silny w dungeonach i PvP dzięki spowolnieniom oraz AoE.', late:'Wysoka użyteczność i kontrola; obrażenia zależą od spotkania i sprzętu.', pros:'Kontrola, AoE, mobilność i narzędzia defensywne.', cons:'Krucha postać; trzeba utrzymywać dystans i pilnować many.'},
  'Shaman|Enhancement': {role:'DPS — melee, totemy i wsparcie grupy', description:'Walka wręcz wspierana totemami, bronią i zaklęciami. Daje grupie użyteczne wzmocnienia, a w świecie ma elastyczne narzędzia.', early:'Elastyczny w questach, choć wymaga dbania o many i totemy.', mid:'Przynosi wsparcie grupie i może zmieniać tempo walki.', late:'Użyteczny dzięki wsparciu i specyficznym oknom obrażeń; sprawdź aktualne Forever zmiany.', pros:'Wsparcie, totemy i różnorodne narzędzia.', cons:'Pozycjonowanie totemów i zasoby wymagają uwagi.'},
  'Priest|Shadow': {role:'DPS — ranged, obrażenia magiczne', description:'Zadaje obrażenia zaklęciami i efektami w czasie. Zachowuje część narzędzi kapłańskich, ale w grupie najczęściej pełni rolę DPS.', early:'Dobre narzędzia do questowania i utrzymywania się przy życiu.', mid:'Użyteczny w dungeonach i PvP dzięki presji oraz kontroli.', late:'Może wnosić obrażenia i wsparcie; porównaj konkretne Forever zmiany speca.', pros:'Samowystarczalność, presja i przydatne zaklęcia wspierające.', cons:'Mana i dobór zaklęć mogą ograniczać długie walki.'},
  'Warrior|Fury': {role:'DPS — melee, szybkie ataki', description:'Agresywny styl walki wręcz, który nagradza stały kontakt z celem i dobry sprzęt.', early:'Może być wymagający solo, bo przeżywalność i sprzęt mają duże znaczenie.', mid:'Lepiej rozwija skrzydła wraz z bronią i wsparciem grupy.', late:'Potrafi zadawać wysokie obrażenia przy dobrym wyposażeniu.', pros:'Silne obrażenia wręcz i dobry potencjał wraz z ekwipunkiem.', cons:'Zależny od broni, leczenia i utrzymywania kontaktu z celem.'},
  'Druid|Feral': {role:'DPS — melee; narzędzia druida do przemian', description:'Walka w formie zwierzęcej, z mobilnością i użytecznymi narzędziami druida. Może wspomagać grupę zależnie od sytuacji.', early:'Przemiany pomagają dopasować się do questów i eksploracji.', mid:'Wszechstronność i mobilność przydają się w dungeonach oraz PvP.', late:'Wartość wynika także z użyteczności druida; sprawdź balans Forever.', pros:'Mobilność, elastyczność i narzędzia poza samym DPS.', cons:'Więcej form i umiejętności oznacza więcej decyzji.'},
  'Druid|Restoration': {role:'Healer — leczenie grupy', description:'Leczy sojuszników i wnosi użytkowe zaklęcia druida. Dobre dopasowanie do grup, które cenią mobilność i elastyczność.', early:'Levelowanie jest bezpieczniejsze, choć zabijanie może być wolniejsze.', mid:'Leczenie w dungeonach i wsparcie grupy.', late:'Rola healera pozostaje ważna; skuteczność konkretnych zaklęć zależy od zmian Forever.', pros:'Leczenie, wszechstronność i użytkowe zaklęcia.', cons:'Trzeba planować manę i priorytety leczenia.'},
  'Warrior|Protection': {role:'Tank — melee, utrzymywanie uwagi przeciwników', description:'Przyjmuje ciosy i pilnuje, by przeciwnicy atakowali jego zamiast sojuszników. Wymaga zarządzania zagrożeniem i defensywami.', early:'Tankowanie wymaga tarczy, sprzętu i uważnego pullowania.', mid:'Naturalna rola tanka w dungeonach i grupach.', late:'Wytrzymałość i kontrola przeciwników są kluczowe; porównaj aktualne zmiany Forever.', pros:'Czytelna rola, mocna defensywa i zapotrzebowanie grup.', cons:'Levelowanie może być wolniejsze, a błędy w pullu kosztowne.'},
  'Paladin|Retribution': {role:'DPS — melee, z błogosławieństwami i wsparciem', description:'Zadaje obrażenia wręcz i zapewnia grupie błogosławieństwa oraz narzędzia defensywne. Forever rozwija role klas, więc warto sprawdzać aktualne zmiany.', early:'Wytrzymałość i leczenie pomagają w świecie.', mid:'Wnosi wsparcie do dungeonów obok obrażeń.', late:'Sprawdź opis aktualnego balansu Forever — nie zakładaj klasycznego ograniczenia speca.', pros:'Wsparcie grupowe, defensywy i samoleczenie.', cons:'Tempo i zasoby mogą być inne niż u czystych DPS.'},
  'Shaman|Elemental': {role:'DPS — ranged, żywioły i totemy', description:'Rzuca zaklęcia żywiołów na dystans i zapewnia grupie totemy. Ważne są pozycja, mana i wykorzystanie okien obrażeń.', early:'Zaklęcia dystansowe są wygodne, ale koszt many ma znaczenie.', mid:'Dobre obrażenia i grupowe wsparcie w dungeonach.', late:'Przydatność zależy od aktualnych zaklęć i zmian Forever.', pros:'Dystans, burst i totemy wspierające drużynę.', cons:'Mana i dłuższe czasy rzucania ograniczają mobilność.'},
  'Shaman|Restoration': {role:'Healer — leczenie grupy, totemy i wsparcie', description:'Leczy sojuszników i wspiera grupę totemami oraz zaklęciami użytkowymi. Wybór dla gracza, który chce pilnować zdrowia drużyny i reagować na przebieg walki.', early:'Bezpieczne narzędzia do gry w świecie; warto pilnować many.', mid:'Leczenie i totemy są przydatne w dungeonach i grupowych zadaniach.', late:'Rola healera pozostaje ważna; szczegóły skuteczności zależą od zmian Forever.', pros:'Leczenie, totemy i wsparcie kilku osób naraz.', cons:'Wymaga obserwowania grupy i gospodarowania maną.'},
  'Hunter|Beast Mastery': {role:'DPS — ranged, pet jako partner walki', description:'Pet tankuje część przeciwników, a łowca zadaje obrażenia z dystansu. To jeden z wygodniejszych stylów gry solo.', early:'Pet ułatwia questy i walkę z wieloma przeciwnikami.', mid:'Mobilny DPS do świata i dungeonów.', late:'Wartość wynika z ciągłych obrażeń i kontroli petem.', pros:'Bardzo wygodne solo, mobilność i pet.', cons:'Trzeba dbać o peta i zarządzanie zagrożeniem.'},
  'Hunter|Marksmanship': {role:'DPS — ranged, strzały i burst', description:'Skupia się na celnych atakach dystansowych, pułapkach i kontroli. Pozwala rozgrywać walki z dystansu.', early:'Bezpieczny dystans, ale pet często pomaga w utrzymaniu przeciwników.', mid:'Dobre narzędzia do kontroli i obrażeń.', late:'Wynik zależy od broni i aktualnych zmian Forever.', pros:'Zasięg, pułapki i możliwość wyboru celu.', cons:'Walka wręcz i przerwane strzały osłabiają skuteczność.'},
  'Priest|Discipline': {role:'Healer / wsparcie — tarcze i prewencja', description:'Chroni grupę i leczy, zanim obrażenia staną się krytyczne. Wymaga przewidywania nadchodzących ciosów.', early:'Dobre narzędzia ochronne, ważne gospodarowanie maną.', mid:'Wsparcie w dungeonach przez tarcze i leczenie.', late:'Przydatny, gdy grupa potrzebuje prewencji i stabilizacji.', pros:'Tarcze, leczenie i wsparcie grupy.', cons:'Wymaga przewidywania i sprawnego zarządzania maną.'},
  'Warrior|Arms': {role:'DPS — melee, ciężkie uderzenia i kontrola', description:'Wolniejsze, mocne ataki wręcz i narzędzia do pojedynków. Dobrze pasuje do graczy lubiących bezpośrednią walkę.', early:'Wymaga dobrego doboru broni i ostrożnego prowadzenia walk.', mid:'Silne pojedyncze uderzenia i użyteczność w PvP.', late:'Rośnie z jakością broni; sprawdź aktualne talenty i zmiany Forever.', pros:'Mocne uderzenia i dobra kontrola przeciwnika.', cons:'Zależność od broni i słabsza mobilność w części starć.'}
}

const races=[...new Set(data.map(x=>x[0]))], classes=[...new Set(data.map(x=>x[1]))], specs=[...new Set(data.map(x=>x[2]))]

const raceInfo={
  'Orc':{
    description:'Pochodzą z Draenoru. Ten lud o szamańskich korzeniach został zniewolony przez Płonący Legion, ale odzyskał wolność i dziś walczy o honor oraz własne miejsce na Azeroth. Ich historia łączy surową wojowniczość z więzią z żywiołami.',
    classes:['Hunter','Mage','Rogue','Shaman','Warlock','Warrior'],
    active:[['Blood Fury','Zwiększa Attack Power i Spell Power.'],['Shatter Curse','Zwiększa szybkość ruchu członków drużyny o 20%.']],
    passive:[['Axe Specialization','Zwiększa szansę na critical strike o 1% podczas używania axes.'],['Hardiness','Skraca czas trwania stunów o 20%.']]
  },
  'Undead':{
    description:'Forsaken uwolnili się spod kontroli Króla Lisza i zwrócili przeciw Pladze. Ludzie nadal chcą ich wytępić, a oni sami nie zawsze ufają nawet swoim sprzymierzeńcom. To wybór dla osób, którym odpowiada mroczna, niezależna historia.',
    classes:['Mage','Paladin','Priest','Rogue','Warlock','Warrior'],
    active:[['Will of the Forsaken','Natychmiast usuwa efekty Charm, Fear i Sleep.'],['Cannibalize','Pozwala zjadać zwłoki Humanoid lub Undead, aby przez 10 s odzyskiwać Health i Mana.']],
    passive:[['Underwater Breathing','Pozwala oddychać pod wodą 300% dłużej.'],['Touch of the Grave','Ataki mogą wysysać Health z celu. Szansa aktywacji zależy od klasy.']],
    classNotes:{
      Warrior:'Touch of the Grave ma 5% szansy aktywacji dla Warrior, Paladin i Rogue; dla Mage, Priest i Warlock to 10% według danych klienta beta.',
      Paladin:'Touch of the Grave ma 5% szansy aktywacji dla Warrior, Paladin i Rogue; dla Mage, Priest i Warlock to 10% według danych klienta beta.',
      Rogue:'Touch of the Grave ma 5% szansy aktywacji dla Warrior, Paladin i Rogue; dla Mage, Priest i Warlock to 10% według danych klienta beta.',
      Mage:'Touch of the Grave ma 10% szansy aktywacji dla Mage, Priest i Warlock; dla Warrior, Paladin i Rogue to 5% według danych klienta beta.',
      Priest:'Touch of the Grave ma 10% szansy aktywacji dla Mage, Priest i Warlock; dla Warrior, Paladin i Rogue to 5% według danych klienta beta.',
      Warlock:'Touch of the Grave ma 10% szansy aktywacji dla Mage, Priest i Warlock; dla Warrior, Paladin i Rogue to 5% według danych klienta beta.'
    },
    priestSpells:[['Touch of Weakness · level 10','Osłabia atakującego, gdy uderzy kapłana wręcz.'],['Dark Sacrifice · level 20','Poświęca część Health, aby odzyskać Mana.']]
  },
  'Tauren':{
    description:'Taureni czczą Matkę Ziemię i starają się chronić równowagę natury. Gdy centaury zagroziły ich przetrwaniu, orki pomogły im odeprzeć atak — ten dług krwi połączył oba ludy. Spokojni z natury, walczą zaciekle w obronie swojej ziemi.',
    classes:['Druid','Hunter','Shaman','Warrior'],
    active:[['War Stomp','Ogłusza do 5 pobliskich przeciwników na 2 s.'],['Cultivation','Pozwala zbierać specjalne bonusowe zioła bez Herbalism.']],
    passive:[['Plainsrunning','Zwiększa szybkość ruchu Twoją i grupy o 2%.'],['Endurance','Zwiększa maksymalne Health o 5% i Hit Chance o 1%.']]
  },
  'Troll':{
    description:'Darkspearowie zostali wypędzeni z dżungli Stranglethorn. Po tym, jak orki pomogły im w potrzebie, ruszyli z Hordą do Kalimdoru. Zachowują własne pradawne i mroczne tradycje, a w Hordzie zdobyli szanowane miejsce.',
    classes:['Hunter','Mage','Priest','Rogue','Shaman','Warlock','Warrior'],
    active:[['Berserking','Zwiększa szybkość ataku i rzucania zaklęć o 10%.'],['Rapid Regeneration','Odnawia 50% maksymalnego Health w ciągu 6 s.']],
    passive:[['Beast Slaying','Zwiększa obrażenia zadawane Beasts o 5%.'],['Regeneration','Zwiększa regenerację Health o 10%; część regeneracji działa także w walce.']],
    priestSpells:[['Hex of Weakness · level 10','Osłabia atak przeciwnika wręcz i ogranicza otrzymywane przez niego leczenie.'],['Shadowguard · level 20','Otacza kapłana cieniem, który rani napastników.']]
  },
  'Skyborne — Windshaper':{
    description:'Windshaperzy są potomkami Shen’dorei, którym duchy wiatru powierzyły dar widzenia żywiołów. Przybywają na Azeroth, by odnaleźć zaginionych mentorów i ocalić swoją tradycję. Po stronie Hordy mogą zostać szamanami, a także druidami, łowcami, łotrzykami lub wojownikami.',
    classes:['Druid','Hunter','Rogue','Shaman','Warrior'],
    active:[['Walk on Air','Pozwala bezpiecznie szybować w dół przez 10 s.'],['Skysight','Błogosławieństwo żywiołów zwiększa szybkość ruchu o 10% na 5 min.']],
    passive:[['Wind Blessed','Zwiększa Haste o 1%.'],['Elemental Insight','Zwiększa obrażenia zadawane Elementals o 5%.']]
  }
}

function shell(){
app.innerHTML=`<main class="wrap">
<header><div><h1>⚔ WoW Forever — Horde Picker</h1><p>Wybierz swojego maina. Każdy użytkownik Discorda ma własne wybory.</p></div><div id="auth"></div></header>
<nav class="page-tabs" role="tablist" aria-label="Sekcje strony"><button type="button" class="page-tab active" data-tab="picker-view" role="tab" aria-selected="true">Postacie</button><button type="button" class="page-tab" data-tab="profession-view" role="tab" aria-selected="false">Profesje</button><button type="button" class="page-tab" data-tab="map-view" role="tab" aria-selected="false">Mapa startów</button></nav>
<div id="picker-view" class="page-view">
<section class="intro-section">
  <h2 class="section-title">Horda czy Alliance?</h2>
  <div class="faction-grid">
    <article class="faction-card horde-card"><span class="eyebrow">HORDA</span><h3>Wolność, honor i przetrwanie</h3><p>Jej ludy zjednoczyły się w nieprzyjaznym świecie, by bronić prawa do własnej przyszłości. Horda ceni siłę i honor, choć jej narody mają różne tradycje i cele. Ten ranking pokazuje rasy Hordy.</p></article>
    <article class="faction-card alliance-card"><span class="eyebrow">ALLIANCE</span><h3>Tradycja, wiara i obrona wspólnoty</h3><p>Alliance łączy ludy, które wspólnie bronią swoich domów i dążą do sprawiedliwego pokoju. Skyborne, którzy dołączają do Alliance jako High Order, mogą wybrać maga.</p></article>
  </div>
  <p class="faction-note">Frakcja określa, z kim możesz tworzyć grupy. Rasy mają różne dostępne klasy, a WoW Forever rozszerza część klasycznych połączeń.</p>
</section>
<section class="races-section">
  <h2 class="section-title">Rasy Hordy</h2>
  <p class="section-lead">Wybierz rasę, poznaj jej charakter i zobacz klasy dostępne w WoW Forever.</p>
  <div class="race-grid">${Object.entries(raceInfo).map(([race,info])=>`<article class="race-card"><div class="race-card-heading"><h3>${race}</h3><button type="button" class="race-jump" data-race-select="${race}">Pokaż rankingi</button></div><p>${info.description}</p><div class="class-list"><span>Dostępne klasy</span><div>${info.classes.map(cls=>`<span class="class-chip">${cls}</span>`).join('')}</div></div>${racialDetailsHtml(race)}</article>`).join('')}</div>
</section>
<section class="picker-section"><h2 class="section-title">Oceny klas i specjalizacji</h2><p class="section-lead">Rasa daje własne aktywne i pasywne umiejętności; klasa i spec określają Twoją rolę, np. tank, healer albo DPS. Rozwiń oba opisy na karcie.</p>
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
<section class="plans-section" id="plans-section">
  <h2 class="section-title">Mój plan gry</h2>
  <p class="section-lead">Wybierz zestaw rasa–klasa–specjalizacja z rankingu i przypisz mu profesje.</p>
  <div class="plan-editor" id="plan-editor">
    <p id="plan-choice" class="plan-choice">Najpierw wybierz „Dodaj do mojego planu” na karcie postaci.</p>
    <label>Imię widoczne na liście <input id="plan-name" maxlength="40" autocomplete="nickname"></label>
    <label>Profesja główna 1<select id="profession-one"><option value="">Wybierz profesję</option>${primaryProfessions.map(x=>`<option>${x}</option>`).join('')}</select></label>
    <label>Profesja główna 2<select id="profession-two"><option value="">Wybierz profesję</option>${primaryProfessions.map(x=>`<option>${x}</option>`).join('')}</select></label>
    <fieldset class="secondary-picks"><legend>Profesje poboczne — wybierz wszystkie, które planujesz</legend>${secondaryProfessions.map(name=>`<label><input type="checkbox" data-secondary-profession value="${name}"> ${name}</label>`).join('')}</fieldset>
    <label class="share-choice"><input id="plan-public" type="checkbox" checked> Pokaż mój plan na publicznej liście graczy</label>
    <button id="save-plan" type="button" disabled>Zapisz plan</button>
    <p class="data-note">Wybierasz dwie profesje główne. Cooking, Fishing i First Aid to profesje poboczne i nie zajmują tych miejsc. Lista bazuje na klasycznym zestawie WoW; szczegóły zmian Forever oznaczamy jako wymagające potwierdzenia.</p>
  </div>
  <h3 class="roster-title">Kto czym chce grać</h3>
  <p class="section-lead">Publiczne plany graczy. Zaloguj się, żeby dodać własny.</p>
  <div id="roster-status" class="roster-status" aria-live="polite"></div>
  <div id="player-roster" class="player-roster"></div>
</section>
</div>
<section id="map-view" class="page-view map-view" role="tabpanel" hidden>
  <h2 class="section-title">Gdzie zaczyna każda rasa?</h2>
  <p class="section-lead">Wybierz rasę albo kliknij znacznik. Mapa pokazuje przybliżone położenie strefy startowej na Azeroth. Orc i Troll zaczynają w tej samej strefie.</p>
  <h2 class="section-title">Strefy startowe ras</h2>
  <p class="section-lead">Wybierz rasę, aby zobaczyć jej strefę startową. Nie pokazujemy pinezek na poglądowym podkładzie, żeby nie sugerować niedokładnej lokalizacji.</p>
  <div class="map-race-picker" id="map-race-picker"></div>
  <div class="start-map-toolbar"><button type="button" id="map-zoom-out" aria-label="Pomniejsz mapę">−</button><button type="button" id="map-zoom-in" aria-label="Powiększ mapę">+</button><button type="button" id="map-reset">Pokaż całą mapę</button><span>Możesz też przeciągać mapę.</span></div>
  <div class="start-map-viewport" id="start-map-viewport" aria-label="Interaktywna mapa świata Azeroth">
    <div class="start-map-image" id="start-map-image" role="img" aria-label="Mapa świata Azeroth, Kalimdor po lewej i Eastern Kingdoms po prawej">
      <span class="map-continent kalimdor-label">KALIMDOR</span><span class="map-continent kingdoms-label">EASTERN KINGDOMS</span>
      <div id="start-map-markers"></div>
    </div>
  </div>
  <article class="start-location-card" id="start-location-card" aria-live="polite"></article>
  <p class="profession-source-note">Podkład przedstawia klasyczną mapę świata; znaczniki wskazują przybliżone położenie stref, a nie dokładny punkt wejścia. Windshaperowie zaczynają na Zephras Isle, osobnej wyspie WoW: Forever. <a href="https://forever.azerpug.com/" target="_blank" rel="noreferrer">Interaktywna mapa stref Forever</a> · <a href="https://www.warcrafttavern.com/community/art-resources/high-resolution-terrain-maps-of-azeroth" target="_blank" rel="noreferrer">Źródło mapy świata</a>.</p>
  <p class="profession-source-note">Orc i Troll zaczynają w Durotarze; Tauren w Mulgore. Dokładne krainy, miasta i zakresy poziomów sprawdzisz w pełnym atlasie poniżej.</p>
  <section class="profession-intro full-atlas-intro"><h3>Pełny atlas świata WoW: Forever</h3><p>Przeglądaj krainy, sprawdzaj ich orientacyjne przedziały poziomów, miasta, lochy, flight masterów i połączenia statków. Atlas ma filtr poziomu postaci oraz wyszukiwarkę.</p><p><a href="https://theforeverera.com/en/map/" target="_blank" rel="noreferrer">Otwórz pełny interaktywny atlas WoW: Forever ↗</a></p></section>
</section>
<section id="profession-view" class="page-view profession-view" role="tabpanel" hidden>
  <h2 class="section-title">Profesje w WoW: Forever</h2>
  <p class="section-lead">Główne profesje zbierają materiały lub wytwarzają przedmioty. Poboczne możesz rozwijać obok nich i nie zajmują dwóch głównych miejsc.</p>
  <div class="profession-intro"><b>Co wnosi Forever?</b><p>Profesje zachowują znajome recepty, ale dochodzą nowe przedmioty obozowe i użyteczność. Blizzard zapowiada po trzy obiekty do rozstawienia, uczone na różnych poziomach umiejętności, oraz premię lub narzędzie związane z każdą profesją. Szczegóły recept i efektów mogą zmieniać się w becie.</p><a href="https://worldofwarcraft.blizzard.com/en-us/news/24303313" target="_blank" rel="noreferrer">Oficjalny przegląd WoW: Forever</a></div>
  <h3 class="profession-group-title">Główne — wybierasz maksymalnie dwie</h3>
  <p class="section-lead">Trzy profesje zbierackie dostarczają surowców; sześć profesji wytwórczych zużywa je, by tworzyć przedmioty.</p>
  <div id="primary-profession-list" class="profession-grid"></div>
  <h3 class="profession-group-title">Poboczne — rozwijaj obok głównych</h3>
  <p class="section-lead">Cooking, Fishing i First Aid nie zajmują miejsc na profesje główne. Najczęściej można nauczyć się wszystkich trzech.</p>
  <div id="secondary-profession-list" class="profession-grid"></div>
  <p class="profession-source-note">Opisy zbierania i materiałów bazują na klasycznym systemie oraz publicznych danych klienta beta. Dokładne recepty, progi umiejętności i obiekty obozowe mogą się zmienić przed premierą. <a href="https://theforeverera.com/en/guides/professions/" target="_blank" rel="noreferrer">Recepty i materiały z bety</a> · <a href="https://www.icy-veins.com/wow-forever/professions-overview/" target="_blank" rel="noreferrer">Przewodnik dla graczy</a>.</p>
</section>
</main>`
}

function renderProfessionList(){
const renderGroup=(names,target)=>{
const container=document.querySelector(target)
container.innerHTML=names.map(name=>{
  const item=professionInfo[name]
  return `<article class="profession-card"><div class="profession-card-head"><h4>${escapeHtml(name)}</h4><span>${escapeHtml(item.type)}</span></div><p>${escapeHtml(item.what)}</p><div class="profession-facts"><section><b>Skąd brać materiały</b><p>${escapeHtml(item.materials)}</p></section><section><b>Jak rozwijać</b><p>${escapeHtml(item.how)}</p></section><section><b>Dla kogo i po co</b><p>${escapeHtml(item.good)}</p></section><section><b>Szybki start dla początkujących</b><p>${escapeHtml(item.start)}</p></section></div><p class="profession-pair"><b>Dobra para:</b> ${escapeHtml(item.pair)}</p></article>`
}).join('')
}
renderGroup(primaryProfessions,'#primary-profession-list')
renderGroup(secondaryProfessions,'#secondary-profession-list')
}

function switchTab(tabId){
document.querySelectorAll('.page-view').forEach(view=>{view.hidden=view.id!==tabId})
document.querySelectorAll('.page-tab').forEach(button=>{
  const active=button.dataset.tab===tabId
  button.classList.toggle('active',active)
  button.setAttribute('aria-selected',String(active))
})
}

function renderStartMap(){
  const picker=document.querySelector('#map-race-picker')
  const markers=document.querySelector('#start-map-markers')
  const detail=document.querySelector('#start-location-card')
  if(!picker||!markers||!detail)return
  if(!picker||!detail)return
  picker.innerHTML=Object.keys(raceStartInfo).map(race=>`<button type="button" class="map-race-chip ${selectedStartRace===race?'active':''}" data-start-race="${escapeHtml(race)}">${escapeHtml(race)}</button>`).join('')
  markers.innerHTML=Object.entries(raceStartInfo).map(([race,info])=>`<button type="button" class="map-marker ${selectedStartRace===race?'selected':''}" style="left:${info.x}%;top:${info.y}%" data-start-race="${escapeHtml(race)}" aria-label="${escapeHtml(race)} — ${escapeHtml(info.zone)}" title="${escapeHtml(race)}: ${escapeHtml(info.zone)}"><span>●</span></button>`).join('')
  const info=raceStartInfo[selectedStartRace]
  detail.innerHTML=`<small>START: ${escapeHtml(info.continent)}</small><h3>${escapeHtml(selectedStartRace)}</h3><p>${escapeHtml(info.zone)}</p><p>Wybór klasy i specjalizacji nie zmienia strefy startowej tej rasy.</p>`
  document.querySelectorAll('[data-start-race]').forEach(button=>button.onclick=()=>{selectedStartRace=button.dataset.startRace;renderStartMap()})
}

function applyMapZoom(){
  const map=document.querySelector('#start-map-image')
  if(map)map.style.transform=`translate(${mapDrag?.x||0}px,${mapDrag?.y||0}px) scale(${mapZoom})`
}

function selectMapRace(race){
  if(!raceStartInfo[race])return
  selectedStartRace=race
  switchTab('map-view')
  renderStartMap()
  document.querySelector('#map-view')?.scrollIntoView({behavior:'smooth',block:'start'})
}

function escapeHtml(value){
return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
}

function getDiscordName(){
return user?.user_metadata?.global_name||user?.user_metadata?.full_name||user?.user_metadata?.name||user?.user_metadata?.preferred_username||user?.email?.split('@')[0]||''
}

function racialDetailsHtml(race,cls=''){
const info=raceInfo[race]
if(!info)return ''
const list=items=>items.map(([name,description])=>`<li><b>${escapeHtml(name)}</b> — ${escapeHtml(description)}</li>`).join('')
const classNote=info.classNotes?.[cls]
const classDifferences=!cls&&info.classNotes?[...new Set(Object.values(info.classNotes))]:[]
const priestSpells=(!cls||cls==='Priest')?info.priestSpells:null
return `<details class="racial-guide"><summary>Umiejętności rasy ${escapeHtml(race)}</summary><div class="racial-content"><b>Aktywne</b><ul>${list(info.active)}</ul><b>Pasywne</b><ul>${list(info.passive)}</ul>${classNote?`<p class="racial-class-note"><b>Dla klasy ${escapeHtml(cls)}:</b> ${escapeHtml(classNote)}</p>`:''}${classDifferences.length?`<div class="racial-class-note"><b>Efekt zależny od klasy</b>${classDifferences.map(note=>`<p>${escapeHtml(note)}</p>`).join('')}</div>`:''}${priestSpells?`<div class="priest-spells"><b>Zaklęcia tylko dla Priest tej rasy</b><ul>${list(priestSpells)}</ul></div>`:''}<p class="data-note">Nie wszystkie rasowe skille są dostępne od 1. poziomu; dokładny poziom i pełny tooltip sprawdź u trenera lub w księdze zaklęć. Efekty odczytano z klienta beta; mogą się zmienić. <a href="https://wowforeverhq.com/racials/" target="_blank" rel="noreferrer">Rasowe umiejętności z bety</a> · <a href="https://theforeverera.com/en/races/" target="_blank" rel="noreferrer">zmiany i zależności klasowe</a> · <a href="https://worldofwarcraft.blizzard.com/en-us/news/24303313" target="_blank" rel="noreferrer">Blizzard o zmianach</a>.</p></div></details>`
}

function showPlanEditor(characterKey){
planSelection=data.find(row=>row.slice(0,3).join('|')===characterKey)||null
const choice=document.querySelector('#plan-choice')
choice.textContent=planSelection?`${planSelection[0]} ${planSelection[1]} — ${planSelection[2]}${user?'':' · Zaloguj się przez Discord, aby zapisać plan.'}`:'Najpierw wybierz postać z rankingu.'
document.querySelector('#save-plan').disabled=!planSelection||!user
document.querySelector('#plan-name').value=getDiscordName()
const existing=playerPlans.find(plan=>user?.id===plan.user_id&&plan.character_key===characterKey)
document.querySelector('#profession-one').value=existing?.profession_one||''
document.querySelector('#profession-two').value=existing?.profession_two||''
document.querySelector('#plan-public').checked=existing?.is_public??true
document.querySelectorAll('[data-secondary-profession]').forEach(input=>{input.checked=(existing?.secondary_professions||[]).includes(input.value)})
document.querySelector('#plan-editor').scrollIntoView({behavior:'smooth',block:'center'})
}

function renderRoster(){
const list=document.querySelector('#player-roster')
const status=document.querySelector('#roster-status')
if(!list||!status)return
if(!supabase){status.textContent='Publiczna lista wymaga konfiguracji Supabase.';list.innerHTML='';return}
if(!playerPlans.length){status.textContent='Nie ma jeszcze publicznych planów. Zaloguj się i dodaj swój!';list.innerHTML='';return}
status.textContent=`Plany widoczne dla Ciebie: ${playerPlans.length}`
list.innerHTML=playerPlans.map(plan=>{
  const character=data.find(row=>row.slice(0,3).join('|')===plan.character_key)
  if(!character)return ''
  const own=user?.id===plan.user_id
  const primary=[plan.profession_one,plan.profession_two].filter(Boolean).join(' + ')||'nie wybrano'
  const secondary=(plan.secondary_professions||[]).join(', ')||'nie wybrano'
  return `<article class="player-plan"><div><strong>${escapeHtml(plan.display_name)}</strong>${own&&!plan.is_public?'<small class="private-label">Prywatny — widzisz tylko Ty</small>':''}<h4>${escapeHtml(character[0])} ${escapeHtml(character[1])} — ${escapeHtml(character[2])}</h4><p><b>Główne:</b> ${escapeHtml(primary)}</p><p><b>Poboczne:</b> ${escapeHtml(secondary)}</p></div>${own?`<button type="button" class="remove-plan" data-remove-plan="${encodeURIComponent(plan.character_key)}" aria-label="Usuń plan ${escapeHtml(character[0])} ${escapeHtml(character[1])}">Usuń</button>`:''}</article>`
}).join('')
list.querySelectorAll('[data-remove-plan]').forEach(button=>button.onclick=()=>deletePlan(decodeURIComponent(button.dataset.removePlan)))
}

async function loadRoster(){
if(!supabase){renderRoster();return}
const {data:rows,error}=await supabase.from('player_plans').select('user_id,character_key,display_name,profession_one,profession_two,secondary_professions,is_public,updated_at').order('updated_at',{ascending:false})
if(error){
 console.error('LOAD PLAYER PLANS ERROR:',error)
 document.querySelector('#roster-status').textContent='Nie udało się odczytać planów. Wykonaj aktualizację „supabase-secondary-professions.sql” w Supabase → SQL Editor, a potem odśwież stronę.'
 document.querySelector('#player-roster').innerHTML=''
 return
}
playerPlans=rows||[]
renderRoster()
}

async function savePlan(){
if(!user){alert('Zaloguj się przez Discord, aby dodać plan.');return}
if(!planSelection)return
const professionOne=document.querySelector('#profession-one').value||null
const professionTwo=document.querySelector('#profession-two').value||null
if(professionOne&&professionOne===professionTwo){alert('Wybierz dwie różne profesje.');return}
const displayName=document.querySelector('#plan-name').value.trim()||getDiscordName()||'Gracz'
const secondary=document.querySelectorAll('[data-secondary-profession]:checked')
const plan={user_id:user.id,character_key:planSelection.slice(0,3).join('|'),display_name:displayName,profession_one:professionOne,profession_two:professionTwo,secondary_professions:[...secondary].map(input=>input.value),is_public:document.querySelector('#plan-public').checked}
const {error}=await supabase.from('player_plans').upsert(plan,{onConflict:'user_id,character_key'})
if(error){console.error('SAVE PLAYER PLAN ERROR:',error);alert('Nie udało się zapisać planu. Sprawdź konfigurację tabeli player_plans w Supabase.');return}
await loadRoster()
 document.querySelector('#plans-section')?.scrollIntoView({behavior:'smooth',block:'start'})
}

async function deletePlan(characterKey){
if(!user)return
const {error}=await supabase.from('player_plans').delete().eq('user_id',user.id).eq('character_key',characterKey)
if(error){console.error('DELETE PLAYER PLAN ERROR:',error);alert('Nie udało się usunąć planu.');return}
await loadRoster()
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
const guide=specGuides[`${x[1]}|${x[2]}`]||{role:'Rola zależy od wybranej specjalizacji',description:'Opis tej kombinacji jest w przygotowaniu.',early:'Sprawdź aktualne umiejętności i talenty w grze.',mid:'Sprawdź aktualne umiejętności i talenty w grze.',late:'Sprawdź aktualne zmiany WoW: Forever.',pros:'Do uzupełnienia.',cons:'Do uzupełnienia.'}
return `<article class="card ${m?'chosen':''}">
<div class="top"><div><small>${x[0]}</small><h2>${x[1]} — ${x[2]}</h2></div><strong>${x[3].toFixed(1)}<small>/10</small></strong></div>
<button type="button" class="map-jump-button" data-map-race="${encodeURIComponent(x[0])}">📍 Pokaż start rasy</button>
<div class="stats">${[['PvE',x[4]],['PvP',x[5]],['Level',x[6]],['Solo',x[7]],['Endgame',x[8]]].map(y=>`<span>${y[0]}<b>${y[1]}</b></span>`).join('')}</div>
<div class="prof">🛠 ${x[9]}</div>
<details class="spec-guide"><summary>Rola i opis specjalizacji</summary><div class="guide-content"><p><b>Rola:</b> ${guide.role}</p><p>${guide.description}</p><div class="phase-grid"><section><b>Early game</b><p>${guide.early}</p></section><section><b>Mid game</b><p>${guide.mid}</p></section><section><b>Late game</b><p>${guide.late}</p></section></div><p><b>Mocne strony:</b> ${guide.pros}</p><p><b>Warto pamiętać:</b> ${guide.cons}</p></div></details>
${racialDetailsHtml(x[0],x[1])}
<button type="button" class="plan-button" data-plan="${encodeURIComponent(k)}">Dodaj do mojego planu</button>
<div class="actions">${[['⭐','Must play'],['🔥','Bardzo chcę'],['👍','Może być'],['❌','Odpada']].map(([e,label])=>`<button type="button" class="${m===e?'active':''}" data-k="${k}" data-mark="${e}" aria-label="${label}: ${x[0]} ${x[1]} ${x[2]}" title="${label}">${e}</button>`).join('')}</div>
</article>`}).join(''):'<div class="empty-state">Nie znaleziono postaci. Zmień wyszukiwanie lub filtry.</div>'
document.querySelector('#summary').innerHTML=`<b>Moje wybory: ${Object.keys(marks).length}</b> <span>⭐ ${Object.values(marks).filter(x=>x==='⭐').length}</span> <span>🔥 ${Object.values(marks).filter(x=>x==='🔥').length}</span> <span>👍 ${Object.values(marks).filter(x=>x==='👍').length}</span> <span>❌ ${Object.values(marks).filter(x=>x==='❌').length}</span>`
document.querySelectorAll('.actions button').forEach(b=>b.onclick=()=>setMark(b.dataset.k,b.dataset.mark))
document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>showPlanEditor(decodeURIComponent(b.dataset.plan)))
document.querySelectorAll('[data-map-race]').forEach(b=>b.onclick=()=>selectMapRace(decodeURIComponent(b.dataset.mapRace)))
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
const saveButton=document.querySelector('#save-plan')
if(saveButton)saveButton.disabled=!planSelection||!user
const nameInput=document.querySelector('#plan-name')
if(nameInput&&!nameInput.value)nameInput.value=getDiscordName()
}
shell()
document.querySelectorAll('.page-tab').forEach(button=>button.onclick=()=>switchTab(button.dataset.tab))
renderProfessionList()
renderStartMap()
document.querySelector('#map-zoom-in').onclick=()=>{mapZoom=Math.min(2.5,mapZoom+.2);applyMapZoom()}
document.querySelector('#map-zoom-out').onclick=()=>{mapZoom=Math.max(1,mapZoom-.2);if(mapZoom===1)mapDrag=null;applyMapZoom()}
document.querySelector('#map-reset').onclick=()=>{mapZoom=1;mapDrag=null;applyMapZoom()}
const mapViewport=document.querySelector('#start-map-viewport')
mapViewport.addEventListener('pointerdown',event=>{if(event.target.closest('.map-marker'))return;mapViewport.setPointerCapture(event.pointerId);mapDrag={startX:event.clientX,startY:event.clientY,x:mapDrag?.x||0,y:mapDrag?.y||0}})
mapViewport.addEventListener('pointermove',event=>{if(!mapDrag||mapDrag.startX===undefined)return;const bounds=mapViewport.getBoundingClientRect();mapDrag.x=Math.max(-bounds.width*.45,Math.min(bounds.width*.45,(mapDrag.x||0)+event.movementX));mapDrag.y=Math.max(-bounds.height*.45,Math.min(bounds.height*.45,(mapDrag.y||0)+event.movementY));applyMapZoom()})
mapViewport.addEventListener('pointerup',()=>{if(mapDrag){delete mapDrag.startX;delete mapDrag.startY}})
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
document.querySelector('#save-plan').onclick=savePlan
renderAuth()
render()
renderRoster()

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
  await loadRoster()

  // Keep this callback synchronous; Supabase warns against awaiting auth calls
  // from inside onAuthStateChange callbacks.
  supabase.auth.onAuthStateChange((_event,session)=>{
    user=session?.user||null
    renderAuth()
    void loadMarks()
    void loadRoster()
  })
}

void initialize().catch(error=>{
  console.error('APP INITIALIZATION ERROR:',error)
  const a=document.querySelector('#auth')
  if(a)a.textContent='Nie udało się uruchomić logowania. Sprawdź konfigurację Supabase.'
})
