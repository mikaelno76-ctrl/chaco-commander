# Paraguay 1864 – Tredubbelalliansens krig (chaco-commander)

Strategispel där du leder Paraguay: storkarta, diplomati, slag, teknik/industri,
elitsoldater och elituppdrag med närstrid (Sangre, Barro y Caña).

## Starta spelet
Öppna `storkarta.html` (eller `index.html`, som skickar dig dit).

## Sidorna (ligger i rotmappen)
| Fil | Vad |
|---|---|
| `storkarta.html` | Storkartan – navet som länkar till allt annat |
| `diplomati.html` | Diplomati |
| `slag.html` | Slagscener |
| `teknologi_industri.html` | Teknik, industri och jordbruk |
| `elitsoldater_trupper.html` | Armérulla och specialsoldater |
| `elituppdrag.html` | Elituppdrag i 3D – bakhåll startar närstriden |
| `test_arena.html` | Testar närstriden fristående, utan resten av spelet |

## Mappar
| Mapp | Innehåll |
|---|---|
| `js/state.js` | Kampanjens gemensamma speltillstånd |
| `js/data/` | Trupper, teknologi, industri/jordbruk |
| `js/slag/` | Slagscenernas data, geografi och grafik |
| `js/texturer/` | Berg-, djungel- och stadstexturer |
| `js/uppdrag/` | Elituppdragens världsmotor, fiender, artefakter, vapen och soldatgrupp |
| `js/narstrid/` | Närstriden (14 filer). **`ladda_narstrid.js` är enda stället med laddordningen** |
| `portraits/`, `assets/` | Bilder |
| `docs/` | Anteckningar om närstriden |
| `arkiv/` | Gamla versioner som inte längre används (behålls ifall något ska plockas tillbaka) |

## Närstriden är nu en del av spelet
`elituppdrag.html` och `test_arena.html` laddar båda `js/narstrid/ladda_narstrid.js`,
så det är exakt samma stridskod i spelet och i testarenan.
Ska en ny stridsfil in: lägg den i listan i `ladda_narstrid.js`.

## Saknas i repot (hänvisas till av koden men finns inte uppladdat)
- `js/data/data_elitsoldater.js` – behövs av `elitsoldater_trupper.html`
- `karta1864.jpg` – storkartans bakgrund
- Befälhavarporträtt `portraits/commanders/`: diaz, robles, barrios, caxias, osorio
- `portraits/elite/` och `portraits/elite_fullbody/` (hjältarna) samt fiendebilderna

## Trasiga filer (avklippta i slutet)
- `js/data/data_industri_jordbruk.js` – slutar mitt i en post
- `js/slag/slag_grafik.js` – slutar mitt i en funktion
