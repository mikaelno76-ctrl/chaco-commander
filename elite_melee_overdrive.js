// === DEL 6 AV 7: ELITE MELEE OVERDRIVE & PAMPAS EXPANSION (elite_melee_overdrive.js) ===
// Laddas efter elite_melee_gore.js!
// Innehåller:
// 1. Äkta grov Guaraní ("tembo", "nde rakóre", "añamemby", "tévi ro'o", "japiro") i Pomberos 60s-scen.
// 2. Riktig kirurgisk 3-stegs Humerus X-Ray när överarmsbenet huggs av under 20s-amputationen.
// 3. Fysisk V-delning när kroppar klyvs på mitten (halvorna tippar isär med blottad ryggmärg & glidande organ).
// 4. Peristaltiska tarmryckningar, gulgrön galla och spyflugor som cirklar runt utslitna inälvor.
// 5. KAMPANJ- & BIOMVÄXLARE: Växla mellan Djungel/Katakomb och PAMPAS / ARGENTINA (Gauchos med
//    stryp-boleadoras som får ögonen att ploppa ut + Pampas-varulven EL LOBIZÓN som slutboss!).

window.EliteMelee = window.EliteMelee || {};

(function () {
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const AUTHENTIC_POMBERO_LINES = [
        { g: '"¡Mba\'e TEMBO piko kóva! ¿Moõpa oĩ che káña, nde mondaha?!"', e: '"¿¡Qué [PIJA] es esto!? ¿¡Dónde carajo está mi Caña, ladrón [CENSURADO]!?"', s: 'Vad i [HELVETES KUK] är det här?! Var fan är mitt Caña-brännvin, din tjuv?!' },
        { g: '"¡Nde rakóre! ¡Mba\'eve ndaipóri ko akã tajasúpe!"', e: '"¡La [CONCHA] de tu madre! ¡Nada en esta cabeza de cerdo!"', s: 'Din mors [FITTA]! Ingenting i den här grisskallen!' },
        { g: '"(Toc, toc) ¡Cháke, nandi vera nde akã, nde añamemby!"', e: '(toc, toc) "¡Más hueco que promesa de político, hijo de █████!"', s: '(knack, knack) "Tommare än skallen på en politiker, din djävulsavföda!"' },
        { g: '*risita* "Je, je, je... nde tembo\'i, che areko ára..."', e: '"Je, je... pedazo de ████, escondiste bien mi botella, pero tengo toda la noche..."', s: '"He, he... din lilla [KUK], du gömde flaskan bra, men jag har hela natten på mig..."' },
        { g: '"Peteĩ... (¡KRAK!) ¡Nde rakóre, ikãve che symi revígui!"', e: '"Una costilla... (¡KRAK!) ¡La ████, más seco que culo de momia!"', s: '"Ett revben... (KNAK!) Dra åt ████, torrare än en mumieröv här inne!"' },
        { g: '*puff* "Ñandejára... tembiapo porã ndojapói pya\'e."', e: '(fuma) "Sin apuro. Una buena autopsia se disfruta con tabaco negro."', s: '(drar ett djupt bloss) "Ingen brådska. En bra obduktion ska avnjutas med svarttobak."' },
        { g: '"Mokõi... (¡KRAAK!) ¡Moõpa remokañy che káña, nde kurepi tajasu!"', e: '"Dos... (¡KRAAK!) ¿¡Dónde metiste mi Caña, extranjero de █████!?"', s: '"Två... (KRAAK!) Var fan stoppade du min Caña, din utländska █████?!"' },
        { g: '"Mbohapy... che kuã ikane\'õma, hákatu che kũ ikãvéntema!"', e: '"Tres... se me cansan las garras, ¡pero tengo la garganta más seca que el Chaco!"', s: '"Tre... klorna blir trötta, men min strupe är torrare än Chaco-öknen!"' },
        { g: '*risita* "Iporãiterei... ko\'ágã jahecháta mba\'épa oĩ hyepýpe..."', e: '"Qué lindo cruje... ahora vamos a ver qué tenés podrido acá adentro..."', s: '"Så vackert det krasar... nu ska vi se vad som ruttnar här inne..."' },
        { g: '"Irundy... (¡KRRRAK!) ¡Tévi ro\'o! ¡Ndaipóri mba\'eve gueteri!"', e: '"Cuatro... (¡KRRRAK!) ¡Pedazo de [CULO] podrido, todavía nada!"', s: '"Fyra... (KRRRAK!) Ruttnande [RÖVKÖTT], fortfarande inte en droppe!"' },
        { g: '*chof, chof* "¡Guácala, tévi rague! ¿Ígadope piko? ¡Mba\'eichagua tembo!"', e: '"¿En el hígado? ¿En las tripas? ¡Puaj, puro [CULO PELUDO], pero sigo buscando!"', s: '"I levern? I tarmarna? Usch, rena [HÅRIGA RÖVEN], men jag letar vidare!"' },
        { g: '"Po... (¡KRAAAK!) ¡¿MBA\'EVE?! ¡Nde añamemby mondaha!"', e: '"Cinco. La última. (¡KRAK!) ...¡¿NADA?! ¡Hijo de mil █████!"', s: '"Fem. Det sista. (KNAK!) ...INGENTING?! Din tusenfaldiga [HORUNGE]!"' },
        { g: '"...Mba\'eve. Ni peteĩ tyky. Tembo rei."', e: '"...Ni una maldita gota. Todo este trabajo al [PEDO]."', s: '"...Inte en förbannad droppe. Allt detta slit helt i onödan."' },
        { g: '"¡JAPIRO, nde mondaha! ¡Ko\'ágã rojukáta ndeve!"', e: '"¡Ándate a la [MIERDA], ladrón! ¡Ahora vas a pagar vos con tu sangre!"', s: '"[SKIT NER DIG], tjuv! Nu får DU betala med ditt blod istället!"' }
    ];

    Object.assign(window.EliteMelee, {
        campaignBiome: 'jungle',
        pomberoLinesData: AUTHENTIC_POMBERO_LINES,
        carrionFlies: [],
        bileDrops: [],
        boleadorasAnim: null,

        setCampaignBiome: function (biome) {
            this.campaignBiome = biome || 'jungle';
            this.texPatterns = null;
            // Avbryt pågående mellansekvens så att bytet inte lämnar spelet i ett halvt tillstånd
            this.phase = 'fighting'; this.usurper = null; this.amp = null; this.boleadorasAnim = null;
            this.visceraChains = []; this.targetZoom = 1.0; this.slowMoTimer = 0; this.xrayTimer = 0;
            this.academicFreezeActive = false; this.activeAcademicCue = null;
            if (this.hero) { this.hero.injuries = this.freshInjuries(); this.hero.hp = Math.max(this.hero.hp, 60); }
            if (biome === 'pampas') {
                this.gauntlet.stage = 'soldiers';
                this.gauntlet.soldierKills = 0;
                this.gauntlet.takeoverTriggeredForWave = false;
                this.enemy = this.createGauntletEnemy('soldiers'); // FIX #7: gauchos hela vägen fram till El Lobizón
                this.cinemaBanner = '🌾🇦🇷 ¡CAMPAÑA DE LAS PAMPAS!';
                this.cinemaSubBanner = 'Cortadera-gräset vajar i blodvinden – akta dig för Gaucho-boleadoras och El Lobizón!';
                this.addLog('🌾🩸 [BIOM VÄXLAD TILL PAMPAS / CORRIENTES]: Nu väntar fanatiska Pampas-gauchos med stryp-boleadoras, följt av Pampas-varulven EL LOBIZÓN!', '#80deea');
            } else {
                this.gauntlet.stage = 'soldiers';
                this.gauntlet.soldierKills = 0;
                this.gauntlet.takeoverTriggeredForWave = false;
                this.enemy = this.createGauntletEnemy('soldiers');
                this.cinemaBanner = '🌴🇵🇾 ¡SELVA Y CATACUMBAS!';
                this.cinemaSubBanner = 'Tillbaka i Paraguays mörka katakomber och djungelruiner!';
                this.addLog('🌴💀 [BIOM VÄXLAD TILL DJUNGEL/KATAKOMB]: Conquistador-zombier och El Pombero väntar i mörkret!', '#ffd54f');
            }
            this.updateTopBars();
        },

        triggerBoleadorasStrangleDemo: function () {
            if (!this.active) return;
            // Behåll den nuvarande gauchon om vi redan är på Pampas (annars nollställdes vågen)
            if (this.campaignBiome !== 'pampas' || !this.enemy || this.enemy.subType !== 'gaucho') this.setCampaignBiome('pampas');
            this.gauntlet.takeoverTriggeredForWave = true;
            this.enemy.hp = 0;
            this.phase = 'takeover_anim';
            this.enemy.x = 520;
            this.enemy.pose = 'hurt';

            this.usurper = {
                who: 'conquistador',
                type: 'skeleton',
                name: 'El Gaucho Degollador (Boleadoras)',
                x: 680, y: 432, facing: -1, pose: 'fatality',
                stage: 'slaughter', timer: 0, variant: 99,
                trophyType: 'head_spine', trophyT0: 8.5, spineProg: 0,
                injuries: this.freshInjuries()
            };
            this.slaughterDuration = 14.5;
            this.targetZoom = 2.25;
            this.camFocusX = this.enemy.x + 10;
            this.camFocusY = this.enemy.y - 230;
            this.boleadorasAnim = { active: true, wraps: 0, eyePop: 0 };

            this.playChokedAgonyScream();
            this.cinemaBanner = '🪃🩸 ¡BOLEADORAS DE PLOMO!';
            this.cinemaSubBanner = 'Tre blykulor på råläderremmar snor sig fem varv runt strupen och dras åt...';
            this.addLog('🪃👀 [PAMPAS-FATALITY – BOLEADORAS]: Tre tunga sten- och blyklot piskar runt halsen på offret! Remmarna dras åt så struphuvudet krossas och båda ögonen ploppar ut på synnerverna innan skallen slits loss!', '#ff1744');

            const e = this.enemy, inj = e.injuries, self = this;
            this.usurper.tlIdx = 0;
            this.usurper.tl = [
                { t: 1.0, fn: () => { self.boleadorasAnim.wraps = 1; self.playTendonSnap(); self.camShake = 16; self.cinemaSubBanner = '*SVISCH!* Första blykulan slår in i käkbenet och låser läderremmen runt halsen...'; } },
                { t: 2.8, fn: () => { self.boleadorasAnim.wraps = 3; self.playBoneCrunch(false); self.camShake = 22; self.cinemaSubBanner = '*KNAK!* Alla tre läderremmarna korsas och dras åt med råstyrka. Ansiktet blir blåsvart!'; } },
                { t: 5.0, fn: () => { self.boleadorasAnim.eyePop = 1; self.playWetSquelch(); self.playTendonSnap(); self.spawnGore(e.x, e.y - 255, 35, false, -1); self.cinemaSubBanner = '*PLOPP!* Trycket i kraniet blir så extremt att båda ögongloberna skjuter ut ur ögonhålorna!'; } },
                { t: 7.5, fn: () => { inj.neckTorn = true; inj.spineSnapped = true; self.xrayTimer = 1.4; self.xrayTargetPart = 'spine'; self.playBoneCrunch(true); self.camShake = 34; self.cinemaSubBanner = '*KRRRK!* Blykulorna skär rakt genom halspulsådern och nackkotorna!'; } },
                { t: 9.2, fn: () => {
                    inj.headSevered = true; self.boleadorasAnim.active = false;
                    self.playGurgleScream(true); self.camShake = 46;
                    self.spawnGore(e.x, e.y - 250, 110, true, -1);
                    self.cinemaBanner = '💀 ¡DEGOLLADO EN LA PAMPA!';
                    self.cinemaSubBanner = 'Ett sista ryck i läderremmen sliter loss huvudet och hela nackryggraden!';
                } }
            ];
        }
    });

    const origBuildUI = window.EliteMelee.buildOverlayUI;
    window.EliteMelee.buildOverlayUI = function () {
        if (origBuildUI) origBuildUI.apply(this, arguments);
        const btnBar = document.querySelector('#melee-ui canvas')?.parentElement?.querySelector('div');
        if (btnBar && !document.getElementById('mk-btn-pampas')) {
            const b1 = document.createElement('button');
            b1.id = 'mk-btn-pampas';
            b1.style.cssText = 'padding:3px 7px;font-size:0.71rem;background:#0d47a1;color:#ffd54f;cursor:pointer;font-weight:bold;border:1px solid #ffd54f;';
            b1.textContent = '🌾 9. Växla Pampas/Djungel';
            b1.onclick = () => window.EliteMelee.setCampaignBiome(window.EliteMelee.campaignBiome === 'pampas' ? 'jungle' : 'pampas');

            const b2 = document.createElement('button');
            b2.style.cssText = 'padding:3px 7px;font-size:0.71rem;background:#bf360c;color:#fff;cursor:pointer;font-weight:bold;';
            b2.textContent = '🪃 10. Boleadoras Ögon-Plopp';
            b2.onclick = () => window.EliteMelee.triggerBoleadorasStrangleDemo();

            btnBar.appendChild(b1);
            btnBar.appendChild(b2);
        }
    };

    const origDrawXRay = window.EliteMelee.drawXRayOverlay;
    window.EliteMelee.drawXRayOverlay = function (ctx, x, y, part) {
        if (part === 'arm') {
            ctx.save();
            const w = this._stumpWorld ? this._stumpWorld() : { x, y };
            const rx = w.x, ry = w.y, r = 88;
            ctx.beginPath(); ctx.arc(rx, ry, r, 0, TAU); ctx.clip();
            ctx.fillStyle = 'rgba(3, 14, 22, 0.95)';
            ctx.fillRect(rx - r, ry - r, r * 2, r * 2);

            const chops = (this.amp && this.amp.chops) ? this.amp.chops : 1;
            ctx.strokeStyle = '#e0f7fa'; ctx.fillStyle = '#ece6d8'; ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.moveTo(rx - 45, ry - 48); ctx.lineTo(rx - 4, ry - 6);
            ctx.lineTo(rx - 14, ry + 6); ctx.lineTo(rx - 55, ry - 36);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            ctx.save();
            ctx.translate(rx - 6, ry);
            ctx.rotate(chops * 0.18);
            ctx.beginPath();
            ctx.moveTo(4, -6); ctx.lineTo(52, 34);
            ctx.lineTo(42, 46); ctx.lineTo(-6, 6);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.restore();

            ctx.fillStyle = '#d50000';
            ctx.beginPath(); ctx.arc(rx - 6, ry, 5 + chops * 3, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 3.5;
            for (let c = 0; c <= chops; c++) {
                ctx.beginPath();
                ctx.moveTo(rx - 6, ry);
                ctx.lineTo(rx - 22 + c * 14, ry - 18 + (c % 2) * 34);
                ctx.stroke();
            }

            ctx.restore();
            ctx.strokeStyle = '#00e5ff'; ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.arc(rx, ry, r, 0, TAU); ctx.stroke();
            return;
        }
        if (origDrawXRay) origDrawXRay.apply(this, arguments);
    };

    const origDrawViscera = window.EliteMelee.drawVisceraChains;
    window.EliteMelee.drawVisceraChains = function (ctx) {
        if (origDrawViscera) origDrawViscera.apply(this, arguments);
        if (!this.visceraChains || !this.visceraChains.length) return;
        const now = performance.now();
        ctx.save();
        this.visceraChains.forEach((ch, ci) => {
            if (!ch.nodes || ch.nodes.length < 4) return;
            const mid = ch.nodes[Math.floor(ch.nodes.length / 2)];
            const bileY = (now * 0.08 + ci * 19) % 52;
            ctx.fillStyle = 'rgba(155, 185, 35, 0.82)';
            ctx.beginPath();
            ctx.ellipse(mid.x + 6, mid.y + 12 + bileY, 2.5, 4.5, 0, 0, TAU);
            ctx.fill();

            for (let f = 0; f < 3; f++) {
                const ang = now * 0.012 + f * 2.1 + ci;
                const fx = mid.x + Math.cos(ang) * (24 + f * 8);
                const fy = mid.y + Math.sin(ang * 1.7) * 16;
                ctx.fillStyle = '#0d1a0d';
                ctx.beginPath(); ctx.arc(fx, fy, 2.2, 0, TAU); ctx.fill();
                ctx.fillStyle = 'rgba(220, 240, 255, 0.6)';
                ctx.beginPath(); ctx.ellipse(fx - 2, fy - 2, 2.8, 1.2, Math.sin(now * 0.08), 0, TAU); ctx.fill();
            }
        });
        ctx.restore();
    };

    const origDrawGoreTorso = window.EliteMelee.drawGoreTorso;
    window.EliteMelee.drawGoreTorso = function (ctx, f, isHero, now) {
        if (origDrawGoreTorso) origDrawGoreTorso.apply(this, arguments);
        const inj = f.injuries || {};

        if (inj.splitInHalf) {
            const splitAng = Math.min(0.42, (f._splitT || 0.1) * 0.035);
            ctx.save();
            for (let side of [-1, 1]) {
                ctx.save();
                ctx.rotate(side * splitAng);
                ctx.fillStyle = '#4a060c';
                ctx.fillRect(side * 8 - 6, -98, 12, 88);
                ctx.fillStyle = '#b84855';
                ctx.beginPath();
                ctx.ellipse(side * 14, -68, 9, 20, side * 0.15, 0, TAU);
                ctx.fill();
                ctx.restore();
            }
            ctx.restore();
        }

        if (!isHero && f === this.enemy && this.boleadorasAnim && this.boleadorasAnim.active) {
            const b = this.boleadorasAnim;
            ctx.save();
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 3.5;
            for (let w = 0; w < b.wraps; w++) {
                ctx.beginPath();
                ctx.moveTo(-14, -110 - w * 3);
                ctx.lineTo(15, -112 - w * 3);
                ctx.stroke();
            }
            for (let k = 0; k < 3; k++) {
                const sw = Math.sin(now * 0.015 + k * 2) * 8;
                const bx = -18 + k * 18 + sw, by = -82 + (k % 2) * 12;
                ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(0, -112); ctx.lineTo(bx, by); ctx.stroke();
                ctx.fillStyle = '#455a64'; ctx.strokeStyle = '#111';
                ctx.beginPath(); ctx.arc(bx, by, 7.5, 0, TAU); ctx.fill(); ctx.stroke();
            }
            if (b.eyePop > 0) {
                for (let ex of [14, 22]) {
                    const drop = 12 + Math.sin(now * 0.02 + ex) * 3;
                    ctx.strokeStyle = '#b71c1c'; ctx.lineWidth = 2.2;
                    ctx.beginPath(); ctx.moveTo(10, -142); ctx.quadraticCurveTo(ex + 8, -138, ex + 6, -142 + drop); ctx.stroke();
                    ctx.fillStyle = '#f5f5f5';
                    ctx.beginPath(); ctx.arc(ex + 6, -142 + drop, 5.5, 0, TAU); ctx.fill();
                    ctx.fillStyle = '#111';
                    ctx.beginPath(); ctx.arc(ex + 8, -142 + drop, 2.2, 0, TAU); ctx.fill();
                }
            }
            ctx.restore();
        }
    };
})();
