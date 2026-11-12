# Elite Melee – ändringar (Claude, nov 2026)

## v7: Legendariska mellansekvenser och naturliga rörelser

### elite_melee_cinema_v7.js – handmålade filmscener (visas likadant i 2D och 3D)
- **El Pombero letar Caña (60 s):** benhus-katakomb med fackelljus, rök, filmkorn och biografband.
  Han tänder cigarren, bänder upp skalltaket, skakar ut en skalbagge, blåser i skalltaket som ett lur,
  bryter revbenen ett och ett och hittar: en sked (kastas), Isabels kärleksbrev (han snyftar),
  en guldtand (han biter i den och stoppar den i hattbandet), ett russinhjärta (slängs) och till sist
  **läderflaskan** – med en enda droppe. Hatten trillar av när han dricker. Sedan raseri.
  Tidslinjen finns i `buildPomberoTimeline`, nya undertexter i `POMBERO_LINES_EXTRA`.
- **Conquistadorens misslyckade urinering:** profil – stålbraguetan har rostat fast, gnisslar, faller med
  en klang; händerna på höfterna, syrsor, en dammpuff, ett frågetecken. Framifrån – byxorna blir damm,
  bäckenet är tomt med spindelväv, en mal flyger ut, en spindel vinkar, "...Mierda.", och till sist sätter han
  tillbaka braguetan. Med värdighet. Tidslinjen finns i `updateEnemyFatalitySequence`.
- Egna ljud för allt (tändsticka, lur, klang, gnissel, syrsor, malvingar, droppe ...).

### Nya expertrepliker (elite_melee_academics.js)
Dr. Claude: skalltaket ("Detta avråds från."), röken ("Jag har sökt."), droppen ("Besvikelse väntas."),
146 000 dygn, "Nästa patient, tack." Prof. Gemini: Isabels brev, kastrationsångest under Filip II.
Experternas ruta ligger uppe i de målade scenerna så undertexterna syns.

### elite_melee_animation.js – naturliga rörelser
- Gemensam poslexikon (`POSES`) med ledvinklar för 2D och 3D, mjuka övergångar, gångcykel,
  andning och fjädrande träffreaktion (`animatePose`).
- 2D: kropparna ritas om med riktiga leder och skuggning (`drawFighterBody`).
- 3D: armar och ben får armbågs- och knäleder, bålen vrids kring höften; conquistadorens ben ledas också.
- 3D-bild: filmisk tonmappning, rätt färgrymd, varmt/kallt fyllnadsljus och kantljus.

---


## Laddordning (viktig!)
audio → render → cinematics → core → gore → overdrive → 3d_textures → 3d_models → webgl_stage →
**animation (ny v7)** → visual_overhaul_v5 → **cinema_v7 (ny v7)** → academics → **combat**

Se `test_arena.html` för ett exempel.

## Buggar som är lagade
1. **Dubbla spelloopar** vid hjältebyte (core: `switchFighter`, `startAmbush`).
2. **WebGL-läcka**: gamla 3D-scener städas bort (`disposeWebGLStage`), fönster-lyssnare läggs bara till en gång.
3. **Slow motion** fungerar nu (core: `loop`). Dessutom ny hitstop (`this.hitStop`).
4. **Fastnade poser**: poser räknas fram varje bildruta i combat-modulen.
5. **Frysbilden gick dubbelt så fort i 3D**: bara academics räknar ner den nu, med verklig bildrutetid (`this._frameDt`).
6. **Blinkande lianer** i djungeln: slumpas en gång och svajar lugnt.
7. **Pampas**: alla fotsoldater är gauchos, Boleadoras är sista gauchons scen, sedan slutboss **El Lobizón** (ny 2D- och 3D-figur).
8. Småfel: `consthatBrim` → `const hatBrim`, tak på blod-/benpartiklar, kommentatorknappen syns i V5-gränssnittet,
   Boleadoras fick inte längre fel expertkommentar.

Övrigt: 3D-blod hamnar där figurerna står, golvet ligger där fötterna är, skarpare 3D på högupplösta skärmar.

## Nytt stridssystem (elite_melee_combat.js)
- Anfall med uppladdning/träff/återhämtning och räckvidd.
- Fiende-AI som laddar synligt (pose `windup` + blinkande !) och slår tillbaka.
- Block (Q / ↓), kontra, combos, combo-brytare, rustning på tunga fiender.
- Furia-mätare → "Golpe de Furia" med röntgen. 0 HP → ¡ACÁBALO! → X för avrättning.
- Förlust: Mierda-slutet mot conquistadorer, annars DERROTA. R = revansch.

**Svårighetsgrad** ställs i tabellerna `HERO_MOVES` och `ENEMY_STATS` överst i combat-filen
(skada, räckvidd, tempo, blockchans). Hjälten får tillbaka 28 HP mellan striderna (`advanceGauntlet`).
