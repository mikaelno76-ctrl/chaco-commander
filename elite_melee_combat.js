// === DEL 8: ELITE MELEE – RIKTIGT STRIDSSYSTEM (elite_melee_combat.js) ===
// Laddas ALLRA SIST, efter elite_melee_academics.js.
//
// Gör om gore-visaren till ett riktigt fightingspel:
//  • Varje anfall har uppladdning, träffögonblick och återhämtning (startup / active / recovery).
//  • Räckvidd: man måste stå nära nog för att träffa. Missar syns och straffas.
//  • Fienden anfaller tillbaka. Den laddar synligt (lutar sig bakåt, drar tillbaka armen) innan slaget,
//    så man hinner blockera. Varje fiendetyp har eget tempo, egen skada och egen blockvilja.
//  • Block [Q eller ↓]: håll in för att ta emot slag (bara liten skada). Grepp [D] går inte att blockera.
//  • Kontra: träffar man fienden medan den laddar blir skadan större och dess anfall avbryts.
//  • Combos: slå en ny attack när den förra träffar, så kedjas de ihop med stigande skada.
//  • Hitstop och skärmskak: spelet fryser några hundradelar vid varje träff så att slagen känns tunga.
//  • Furia: fylls när du slår och blir slagen. Full mätare + X = "Golpe de Furia" med röntgen.
//  • ¡ACÁBALO!: när fienden når 0 HP knäar den. Tryck X i tid för en avrättning, annars faller den själv.
//  • Förlorar du: mot conquistadorer spelas Mierda-slutet, annars DERROTA. Tryck R för revansch.
//  • Alla gamla mellansekvenser (zombie-närbild, Pombero, Sake, amputation, Boleadoras) triggas som förut.

window.EliteMelee = window.EliteMelee || {};

(function () {
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const EM = window.EliteMelee;

    // ───────── Hjältens anfall (sekunder, skada, räckvidd i pixlar) ─────────
    const HERO_MOVES = {
        punch:   { startup: 0.07, active: 0.08, recovery: 0.17, dmg: 9,  range: 168, rage: 6,  blockable: true,  knock: 14, stun: 0.26, name: 'Käkslag' },
        kick:    { startup: 0.13, active: 0.09, recovery: 0.27, dmg: 13, range: 198, rage: 8,  blockable: true,  knock: 28, stun: 0.32, name: 'Knäspark' },
        grapple: { startup: 0.10, active: 0.07, recovery: 0.38, dmg: 17, range: 138, rage: 10, blockable: false, knock: 10, stun: 0.42, name: 'Grepp' },
        furia:   { startup: 0.20, active: 0.10, recovery: 0.42, dmg: 32, range: 195, rage: 0,  blockable: false, knock: 46, stun: 0.6,  name: 'Golpe de Furia' }
    };

    // ───────── Fiendetyper ─────────
    // speed = gånghastighet, cd = vila mellan anfall, block = chans att parera ditt slag
    const ENEMY_STATS = {
        assassin: { speed: 115, cd: 0.95, block: 0.18, moves: {
            punch: { startup: 0.34, active: 0.08, recovery: 0.32, dmg: 8,  range: 168 },
            kick:  { startup: 0.46, active: 0.10, recovery: 0.40, dmg: 12, range: 198 } } },
        gaucho:   { speed: 125, cd: 0.9, block: 0.2, moves: {
            punch: { startup: 0.32, active: 0.08, recovery: 0.30, dmg: 9,  range: 175 },
            kick:  { startup: 0.48, active: 0.10, recovery: 0.42, dmg: 13, range: 205 } } },
        skeleton: { speed: 80, cd: 1.15, block: 0.28, moves: {
            punch: { startup: 0.42, active: 0.10, recovery: 0.40, dmg: 11, range: 190 },
            kick:  { startup: 0.56, active: 0.12, recovery: 0.50, dmg: 16, range: 220 } } },
        pombero:  { speed: 135, cd: 0.8, block: 0.3, moves: {
            punch: { startup: 0.30, active: 0.08, recovery: 0.30, dmg: 12, range: 172 },
            kick:  { startup: 0.44, active: 0.10, recovery: 0.40, dmg: 16, range: 200 } } },
        lobizon:  { speed: 175, cd: 0.7, block: 0.18, moves: {
            punch: { startup: 0.28, active: 0.09, recovery: 0.30, dmg: 13, range: 185 },
            kick:  { startup: 0.40, active: 0.11, recovery: 0.38, dmg: 18, range: 215 } } }
    };
    // Tunga fiender kan inte avbrytas mitt i sin uppladdning (rustning) och tar kortare stun
    const HEAVY = { skeleton: true, pombero: true, lobizon: true };
    const statsFor = (e) => (e && e.subType === 'gaucho') ? ENEMY_STATS.gaucho : (ENEMY_STATS[e && e.type] || ENEMY_STATS.assassin);

    const MIN_GAP = 100;      // hur nära kämparna kan stå varandra
    const WALK_SPEED = 230;   // hjältens gånghastighet (px/s) när piltangenten hålls in

    Object.assign(EM, {
        comboHits: 0,
        _comboIdle: 0,
        floatTexts: [],
        dizzyTimer: 0,
        finisher: null,
        victory: false,
        _held: { left: false, right: false, block: false },

        // ───────────────────────── LJUD ─────────────────────────
        playBlockClang: function () {
            this.initAudio(); if (!this.audioCtx) return;
            const ac = this.audioCtx, now = ac.currentTime;
            [880, 1320].forEach((f0, i) => {
                const o = ac.createOscillator(), g = ac.createGain();
                o.type = i ? 'triangle' : 'square';
                o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(f0 * 0.6, now + 0.16);
                g.gain.setValueAtTime(i ? 0.12 : 0.08, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.22);
            });
        },
        playWhoosh: function () {
            if (this._noiseBurst) this._noiseBurst(0.16, 'bandpass', 500, 2600, 0.16);
        },

        // ───────────────────────── FLYTANDE TEXT ─────────────────────────
        addFloat: function (x, y, txt, col, size) {
            this.floatTexts.push({ x, y, txt, col: col || '#fff', size: size || 22, t: 0, life: 0.95 });
            if (this.floatTexts.length > 24) this.floatTexts.shift();
        },

        // ───────────────────────── INMATNING ─────────────────────────
        bindKeys: function () {
            if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
            if (this._keyUpHandler) window.removeEventListener('keyup', this._keyUpHandler);
            this._held = { left: false, right: false, block: false };
            this._keyHandler = (e) => {
                if (!this.active) return;
                const c = e.code;
                if (c === 'ArrowLeft' || c === 'ArrowRight' || c === 'ArrowDown') e.preventDefault();
                if (c === 'ArrowLeft') this._held.left = true;
                else if (c === 'ArrowRight') this._held.right = true;
                else if (c === 'KeyQ' || c === 'ArrowDown') this._held.block = true;
                else if (e.repeat) return; // håller man in A ska det inte bli kulspruta
                else if (c === 'KeyA') this.performAttack('punch');
                else if (c === 'KeyS') this.performAttack('kick');
                else if (c === 'KeyD') this.performAttack('grapple');
                else if (c === 'KeyX') this.performAttack('fatality');
                else if (c === 'KeyR' && this.phase === 'over') this.restartGauntlet();
            };
            this._keyUpHandler = (e) => {
                const c = e.code;
                if (c === 'ArrowLeft') this._held.left = false;
                else if (c === 'ArrowRight') this._held.right = false;
                else if (c === 'KeyQ' || c === 'ArrowDown') this._held.block = false;
            };
            window.addEventListener('keydown', this._keyHandler);
            window.addEventListener('keyup', this._keyUpHandler);
            // Släpper man fönstret ska inga tangenter "fastna"
            if (!this._blurBound) { this._blurBound = true; window.addEventListener('blur', () => { this._held = { left: false, right: false, block: false }; }); }
        },

        setBlockHeld: function (on) { this._held.block = !!on; },

        restartGauntlet: function () {
            const key = (this.hero && this.hero.key) || 'bloom';
            this.switchFighter(key);
        },

        // ───────────────────────── HJÄLTENS ANFALL ─────────────────────────
        performAttack: function (type) {
            const hero = this.hero, enemy = this.enemy;
            if (!hero || !enemy) return;

            if (this.phase === 'dizzy') {
                if (type === 'fatality') this.startHeroFinisher();
                return;
            }
            if (this.phase !== 'fighting') return;

            if (type === 'fatality') {
                if ((hero.rage || 0) >= 100) type = 'furia';
                else { this.addFloat(hero.x, hero.y - 300, 'FURIA ' + Math.floor(hero.rage || 0) + '%', '#ff8a65', 16); return; }
            }
            if ((hero.stun || 0) > 0) return;

            const atk = hero.atk;
            if (atk) {
                // Combo: när förra slaget träffat får man avbryta återhämtningen med nästa slag
                if (atk.landed && atk.phase !== 'startup' && this.comboHits < 5) {
                    hero.atk = null;
                } else {
                    hero.buffer = { type, age: 0 }; // sparas en kort stund och körs när det går
                    return;
                }
            }
            const move = HERO_MOVES[type];
            if (!move) return;
            hero.atk = { type, move, phase: 'startup', t: move.startup, landed: false };
            if (type === 'furia') {
                hero.rage = 0;
                this.cinemaBanner = '🔥 ¡GOLPE DE FURIA!';
                this.cinemaSubBanner = 'Allt raseri samlat i ett enda slag...';
                this._bannerUntil = 1.4;
                this.updateTopBars();
            }
        },

        _resolveHeroHit: function (atk) {
            const hero = this.hero, e = this.enemy, move = atk.move;
            const dist = e.x - hero.x;
            if (dist > move.range) { this.addFloat(hero.x + 60, hero.y - 250, 'miss', '#9e9e9e', 15); return; }

            const st = statsFor(e);
            const ai = this._ensureAI(e);
            const isLastSoldier = (this.gauntlet.stage === 'soldiers' && this.gauntlet.soldierKills === this.gauntlet.soldierTarget - 1);
            const isLastConq = (this.gauntlet.stage === 'conquistadors' && this.gauntlet.conquistadorKills === this.gauntlet.conquistadorTarget - 1);

            // Fienden parerar ibland – bara om den inte redan är mitt i ett eget anfall.
            // Direkt efter en stun är den på sin vakt (mycket högre blockchans), så man kan inte bara mosa A.
            const blockChance = ai.wake > 0 ? Math.min(0.7, st.block * 2.6) : st.block;
            if (move.blockable && ai.state === 'idle' && Math.random() < blockChance) {
                ai.state = 'block'; ai.t = 0.35;
                const chip = Math.max(1, Math.round(move.dmg * 0.15));
                e.hp = Math.max(1, e.hp - chip);
                e.x += 12;
                this.playBlockClang(); this.camShake = Math.max(this.camShake, 4);
                this.addFloat(e.x - 20, e.y - 270, 'PARERAT', '#80deea', 18);
                this.comboHits = 0;
                this.updateTopBars();
                return;
            }

            let mult = 1;
            const heavy = !!HEAVY[e.type];
            let armored = false;
            if (ai.state === 'windup') {
                mult *= 1.3;
                this.addFloat(e.x - 10, e.y - 300, '¡CONTRA!', '#ffd54f', 20);
                // Lätta fiender avbryts; tunga har rustning under uppladdningen och slår ändå
                if (heavy && atk.type !== 'furia') { armored = true; this.addFloat(e.x + 30, e.y - 330, 'RUSTNING', '#b0bec5', 15); }
                else { ai.state = 'idle'; ai.cd = 0.5; }
            }
            mult *= 1 + 0.15 * this.comboHits;
            this.comboHits++;
            this._comboIdle = 0;
            atk.landed = true;

            const dmg = Math.round(move.dmg * mult);
            e.hp = Math.max(0, e.hp - dmg);
            if (!armored) { e.stun = move.stun * (heavy ? 0.6 : 1); ai.state = 'stun'; }
            e.hitFlash = 0.14;
            e.x += move.knock;
            if (e.injuries) e.injuries.bloodCoat = Math.min(0.9, (e.injuries.bloodCoat || 0) + 0.035);
            hero.rage = clamp((hero.rage || 0) + move.rage, 0, 100);

            const big = atk.type !== 'punch';
            this.spawnGore(e.x - 20, e.y - 200, big ? 22 : 12, big && Math.random() < 0.45, 1);
            this.playBoneCrunch(big);
            this.hitStop = atk.type === 'furia' ? 0.16 : (big ? 0.08 : 0.05);
            this.camShake = Math.max(this.camShake, atk.type === 'furia' ? 22 : (big ? 10 : 6));
            this.addFloat(e.x - 10, e.y - 250, '-' + dmg, mult > 1.25 ? '#ffd54f' : '#ff5252', mult > 1.25 ? 28 : 22);
            if (this.comboHits >= 2) this.addFloat(e.x + 40, e.y - 320, this.comboHits + ' HIT COMBO', '#ff9100', 20 + this.comboHits * 2);

            if (atk.type === 'furia') {
                this.xrayTimer = 1.25; this.xrayTargetPart = 'skull';
                this.slowMoTimer = 0.9; this.slowMoFactor = 0.3;
                if (this.playTendonSnap) this.playTendonSnap();
            }

            // ── De gamla scenerna triggas precis som förut ──
            if (isLastSoldier && !this.gauntlet.takeoverTriggeredForWave && e.hp <= 38) {
                this._clearCombatState();
                if (this.campaignBiome === 'pampas' && this.triggerBoleadorasStrangleDemo) this.triggerBoleadorasStrangleDemo();
                else this.triggerUsurperTakeover('conquistador');
                return;
            }
            if (isLastConq && !this.gauntlet.takeoverTriggeredForWave && e.hp <= 48) { this._clearCombatState(); this.startPomberoCanaSearchCutscene(); return; }
            if (this.gauntlet.stage === 'pombero_boss' && e.hp <= 0) { this._clearCombatState(); this.startPomberoSakeDiplomacyCutscene(); return; }
            if (atk.type === 'grapple' && e.type === 'skeleton' && !e.injuries.armSevered && !e._ampDone && e.hp > 0 && e.hp <= 95 && this.startAmputation) {
                e._ampDone = true; this._clearCombatState(); this.startAmputation(); return;
            }
            if (e.hp <= 0) { this.enterDizzy(); return; }

            // Combo-brytare: efter 4 träffar i rad (bossar 3) sliter sig fienden loss och knuffar bort dig
            const maxChain = (e.type === 'pombero' || e.type === 'lobizon') ? 3 : 4;
            if (this.comboHits >= maxChain && atk.type !== 'furia') {
                this.comboHits = 0;
                e.stun = 0; ai.state = 'idle'; ai.cd = 0.15; ai.wake = 0.7;
                hero.atk = null; hero.buffer = null; hero.stun = 0.3; hero.x -= 46;
                this.camShake = Math.max(this.camShake, 8);
                this.addFloat(e.x - 20, e.y - 290, 'SLITER SIG LOSS!', '#ff8a65', 18);
            }
            this.updateTopBars();
        },

        // ───────────────────────── FIENDENS AI ─────────────────────────
        _ensureAI: function (e) {
            if (!e.ai) e.ai = { state: 'idle', t: 0, cd: statsFor(e).cd * 0.9, moveKey: null, wake: 0 };
            return e.ai;
        },

        _updateEnemyAI: function (dt) {
            const e = this.enemy, hero = this.hero;
            const st = statsFor(e), ai = this._ensureAI(e);
            const armMult = (e.injuries && e.injuries.armSevered) ? 1.25 : 1;

            if (ai.wake > 0) ai.wake -= dt;
            if ((e.stun || 0) > 0) { e.stun -= dt; ai.state = 'stun'; return; }
            if (ai.state === 'stun') { ai.state = 'idle'; ai.cd = Math.min(ai.cd, 0.3); ai.wake = 0.55; }

            const dist = e.x - hero.x;
            const pr = st.moves.punch.range, kr = st.moves.kick.range;
            switch (ai.state) {
                case 'idle': {
                    ai.cd -= dt;
                    if (dist > pr - 12) e.x -= st.speed * dt;                     // gå fram
                    else if (dist < MIN_GAP + 18) e.x += st.speed * 0.4 * dt;    // ta ett halvt steg bakåt
                    if (ai.cd <= 0 && dist <= kr) {
                        ai.moveKey = (dist > pr || Math.random() < 0.38) ? 'kick' : 'punch';
                        ai.state = 'windup';
                        ai.t = st.moves[ai.moveKey].startup * armMult;
                        this.playWhoosh();
                    }
                    break;
                }
                case 'windup':
                    ai.t -= dt;
                    if (ai.t <= 0) {
                        ai.state = 'active';
                        const mv = st.moves[ai.moveKey];
                        ai.t = mv.active + mv.recovery * armMult;
                        this._resolveEnemyHit(e, mv);
                    }
                    break;
                case 'active':
                case 'block':
                    ai.t -= dt;
                    if (ai.t <= 0) { ai.state = 'idle'; ai.cd = st.cd * (0.7 + Math.random() * 0.6) * armMult; }
                    break;
            }
        },

        _resolveEnemyHit: function (e, mv) {
            const hero = this.hero;
            if (this.phase !== 'fighting') return;
            const dist = e.x - hero.x;
            if (dist > mv.range + 10) return; // hjälten backade undan i tid

            let dmg = mv.dmg * ((e.injuries && e.injuries.armSevered) ? 0.6 : 1);
            if (hero.blocking) {
                const chip = Math.max(1, Math.round(dmg * 0.12));
                hero.hp = Math.max(0, hero.hp - chip);
                hero.x -= 18;
                hero.rage = clamp((hero.rage || 0) + 4, 0, 100);
                this.playBlockClang(); this.camShake = Math.max(this.camShake, 4);
                this.addFloat(hero.x + 20, hero.y - 270, 'BLOCK', '#80deea', 18);
            } else {
                if (hero.atk && hero.atk.phase === 'startup') { dmg *= 1.25; this.addFloat(hero.x, hero.y - 300, 'KONTRAD!', '#ff8a80', 18); }
                dmg = Math.round(dmg);
                hero.hp = Math.max(0, hero.hp - dmg);
                hero.stun = 0.32; hero.atk = null; hero.buffer = null;
                hero.hitFlash = 0.14;
                hero.x -= 24;
                hero.rage = clamp((hero.rage || 0) + 9, 0, 100);
                if (hero.injuries) hero.injuries.bloodCoat = Math.min(0.9, (hero.injuries.bloodCoat || 0) + 0.05);
                this.comboHits = 0;
                this.spawnGore(hero.x + 20, hero.y - 200, 14, false, -1);
                this.playBoneCrunch(false);
                this.hitStop = 0.06; this.camShake = Math.max(this.camShake, 9);
                this.addFloat(hero.x + 10, hero.y - 250, '-' + dmg, '#ff5252', 22);
            }
            if (hero.hp <= 0) this.heroDefeated();
            this.updateTopBars();
        },

        // ───────────────────────── 0 HP: ¡ACÁBALO! ─────────────────────────
        enterDizzy: function () {
            this._clearCombatState();
            this.phase = 'dizzy';
            this.dizzyTimer = 3.2;
            this.enemy.hp = 0;
            this.slowMoTimer = 0.5; this.slowMoFactor = 0.3;
            this.cinemaBanner = '💀 ¡ACÁBALO!';
            this.cinemaSubBanner = 'Tryck X (💀 Liquidar) för att avsluta – annars segnar han ner av sig själv';
            this.speakLine && this.speakLine('¡Acábalo!', 'es-ES', 0.4, 0.8);
            this.updateTopBars();
        },

        startHeroFinisher: function () {
            const hero = this.hero, e = this.enemy;
            if (e.x - hero.x > 230) hero.x = e.x - 135;
            this.phase = 'hero_finisher';
            this.finisher = { t: 0, step: 0 };
            this.targetZoom = 1.9; this.camFocusX = e.x - 20; this.camFocusY = e.y - 230;
            this.cinemaBanner = '💀 ¡LIQUIDACIÓN!';
            this.cinemaSubBanner = e.type === 'lobizon' ? 'Silverbladet höjs mot den sjunde sonen...' : 'Klingan höjs långsamt...';
            this.updateTopBars();
        },

        _updateFinisher: function (dt) {
            const f = this.finisher, e = this.enemy, inj = e.injuries || (e.injuries = this.freshInjuries());
            f.t += dt;
            const neck = [e.x - 3, e.y - 262];
            if (f.step === 0 && f.t >= 0.35) {
                f.step = 1; this.playFleshSlice && this.playFleshSlice(); inj.neckTorn = true;
                this.spawnGore(neck[0], neck[1], 20, false, 1); this.camShake = 10;
                this.cinemaSubBanner = 'Eggen går in under käkbenet...';
            }
            if (f.step === 1 && f.t >= 1.0) {
                f.step = 2; this.xrayTimer = 1.2; this.xrayTargetPart = 'spine';
                this.playBoneCrunch(true); this.camShake = 24; inj.spineSnapped = true;
                this.cinemaSubBanner = '*KNAK!* Halskotorna ger vika.';
            }
            if (f.step === 2 && f.t >= 1.7) {
                f.step = 3; inj.headSevered = true;
                this.playGurgleScream(e.type !== 'assassin'); this.camShake = 36;
                this.spawnGore(neck[0], neck[1], 70, true, 1);
                this.slowMoTimer = 1.2; this.slowMoFactor = 0.25;
                this.cinemaBanner = e.type === 'lobizon' ? '🌕 ¡LA BESTIA CAE!' : '💀 ¡DEGOLLADO!';
                this.cinemaSubBanner = e.type === 'skeleton' ? 'Fyrahundra år gammalt damm yr ur halsstumpen.' : 'Huvudet rullar iväg över den blodiga leran.';
            }
            if (f.t >= 3.6) {
                this.finisher = null; this.targetZoom = 1.0;
                this.camFocusX = 440; this.camFocusY = 260;
                this.advanceGauntlet();
            }
        },

        // Nästa motståndare (eller seger)
        advanceGauntlet: function () {
            const g = this.gauntlet, hero = this.hero;
            this.cinemaBanner = ''; this.cinemaSubBanner = '';
            hero.hp = Math.min(hero.maxHp, hero.hp + 28); // andhämtning mellan striderna
            this.comboHits = 0;
            if (this.enemy) this.corpsePile.push({ x: this.enemy.x, y: 434, type: this.enemy.type, nation: this.enemy.nation });
            if (g.stage === 'lobizon_boss') {
                this.phase = 'over'; this.victory = true;
                this.cinemaBanner = '🏆 ¡PAMPA LIBERADA!';
                this.cinemaSubBanner = 'El Lobizón är besegrad. Gauchona återvänder hem före gryningen.';
                if (window.GameState && window.GameState.data) window.GameState.data.lobizonDefeated = true;
                if (window.EliteSquad && window.EliteSquad.awardKillXP) window.EliteSquad.awardKillXP('back', 300, 'EL LOBIZÓN');
                this.updateTopBars();
                return;
            }
            if (g.stage === 'conquistadors') { g.conquistadorKills++; this.enemy = this.createGauntletEnemy('conquistadors'); }
            else if (g.stage === 'pombero_boss') { this.startPomberoSakeDiplomacyCutscene(); return; }
            else { g.soldierKills++; this.enemy = this.createGauntletEnemy('soldiers'); }
            this.enemy.x = 790; // nästa kliver in från höger
            this.phase = 'fighting';
            this.addLog('⚔️ Ny motståndare: ' + this.enemy.name, '#ffcc80');
            this.updateTopBars();
        },

        heroDefeated: function () {
            const hero = this.hero, e = this.enemy;
            hero.hp = 0;
            this._clearCombatState();
            if (e && e.type === 'skeleton' && this.executeEnemyFatalitySequence) {
                this.executeEnemyFatalitySequence(); // Conquistadorens Mierda-slut
                return;
            }
            this.phase = 'over'; this.victory = false;
            this.cinemaBanner = '☠️ DERROTA';
            this.cinemaSubBanner = e && e.type === 'pombero' ? 'El Pombero tänder en ny cigarett och letar Caña i DIN bröstkorg nu...'
                : (e && e.type === 'lobizon' ? 'Ylandet ekar över pampan. Ingen hittar dig före gryningen.' : 'Du segnar ner i leran.');
            this.playGurgleScream && this.playGurgleScream(false);
            this.updateTopBars();
        },

        _clearCombatState: function () {
            if (this.hero) { this.hero.atk = null; this.hero.buffer = null; this.hero.stun = 0; this.hero.blocking = false; }
            if (this.enemy) { this.enemy.ai = null; this.enemy.stun = 0; }
            this.comboHits = 0;
        },

        // ───────────────────────── HUVUDUPPDATERING ─────────────────────────
        // rawDt = verklig tid, simDt = tid efter slow motion/hitstop (0 under hitstop)
        updateCombat: function (rawDt, simDt, now) {
            const hero = this.hero, e = this.enemy;
            if (!hero || !e) return;

            this.floatTexts.forEach(ft => { ft.t += rawDt; });
            this.floatTexts = this.floatTexts.filter(ft => ft.t < ft.life);
            [hero, e].forEach(f => { if (f.hitFlash > 0) f.hitFlash = Math.max(0, f.hitFlash - rawDt); });
            if (this._bannerUntil > 0) { this._bannerUntil -= rawDt; if (this._bannerUntil <= 0 && this.phase === 'fighting') { this.cinemaBanner = ''; this.cinemaSubBanner = ''; } }
            this._syncFuriaButton();

            if (this.phase === 'hero_finisher') {
                hero.pose = 'fatality'; e.pose = 'hurt';
                this._updateFinisher(rawDt);
                return;
            }
            if (this.phase === 'dizzy') {
                hero.atk = null; hero.pose = 'idle'; e.pose = 'hurt';
                this._walkHero(simDt);
                this.dizzyTimer -= rawDt;
                if (this.dizzyTimer <= 0) {
                    this.addLog('💤 ' + e.name + ' segnar ner i leran.', '#bdbdbd');
                    this.advanceGauntlet();
                }
                return;
            }
            if (this.phase !== 'fighting') { hero.atk = null; hero.blocking = false; return; }

            const dt = simDt;
            if (dt <= 0) return; // hitstop – allt står still ett ögonblick

            // Hjälten: rörelse, block, återhämtning
            if ((hero.stun || 0) > 0) hero.stun -= dt;
            hero.blocking = this._held.block && !hero.atk && (hero.stun || 0) <= 0;
            if (!hero.atk && !hero.blocking && (hero.stun || 0) <= 0) this._walkHero(dt);

            if (hero.atk) {
                const a = hero.atk;
                a.t -= dt;
                if (a.t <= 0) {
                    if (a.phase === 'startup') {
                        a.phase = 'active'; a.t = a.move.active;
                        this.playWhoosh();
                        this._resolveHeroHit(a);
                        if (this.phase !== 'fighting') return; // en mellansekvens tog över
                    } else if (a.phase === 'active') {
                        a.phase = 'recovery'; a.t = a.move.recovery;
                    } else {
                        hero.atk = null;
                    }
                }
            } else {
                this._comboIdle += dt;
                if (this._comboIdle > 0.55) this.comboHits = 0;
            }
            if (hero.buffer) {
                hero.buffer.age += dt;
                const b = hero.buffer;
                if (b.age > 0.25) hero.buffer = null;
                else if (!hero.atk || (hero.atk.landed && hero.atk.phase !== 'startup')) { hero.buffer = null; this.performAttack(b.type); }
            }

            this._updateEnemyAI(dt);
            if (this.phase !== 'fighting') return;

            // Avstånd och arenagränser
            e.x = clamp(e.x, hero.x + MIN_GAP, 800);
            hero.x = clamp(hero.x, 110, e.x - MIN_GAP);
            e.x = clamp(e.x, hero.x + MIN_GAP, 800);

            // Poser räknas fram varje bildruta (FIX #4: förut fastnade de i slagposen)
            hero.pose = hero.atk ? (hero.atk.type === 'furia' ? 'fatality' : hero.atk.type)
                : ((hero.stun || 0) > 0 ? 'hurt' : (hero.blocking ? 'block' : 'idle'));
            const ai = this._ensureAI(e);
            e.pose = ai.state === 'windup' ? 'windup' : (ai.state === 'active' ? ai.moveKey
                : (ai.state === 'stun' ? 'hurt' : (ai.state === 'block' ? 'block' : 'idle')));
            hero.poseTimer = 0; e.poseTimer = 0;
        },

        _walkHero: function (dt) {
            const hero = this.hero, e = this.enemy;
            const dir = (this._held.right ? 1 : 0) - (this._held.left ? 1 : 0);
            if (dir) hero.x = clamp(hero.x + dir * WALK_SPEED * dt, 110, e.x - MIN_GAP);
        },

        _syncFuriaButton: function () {
            const ready = this.hero && (this.hero.rage || 0) >= 100;
            if (ready === this._furiaShown) return;
            this._furiaShown = ready;
            const btn = document.getElementById('mk-btn-fatality');
            if (btn) {
                btn.style.boxShadow = ready ? '0 0 18px 4px rgba(255,90,40,0.85)' : '';
                btn.textContent = ready ? '🔥 FURIA! [X]' : '💀 Liquidar [X]';
            }
        },

        // ───────────────────────── RITNING OVANPÅ SCENEN ─────────────────────────
        _toScreen: function (x, y) {
            const w = this.canvas.width, h = this.canvas.height;
            if (this.webglEnabled && this.webglMode === 'full3d' && this.webglCam && this.webglRenderer && window.THREE) {
                const v = new window.THREE.Vector3(((x - 440) / 440) * 3.8, -2.39 + (432 - y) * 0.0105, 0.3);
                v.project(this.webglCam);
                return { x: (v.x + 1) / 2 * w, y: (1 - v.y) / 2 * h };
            }
            if (Math.abs((this.camZoom || 1) - 1) > 0.005) {
                const z = this.camZoom;
                return { x: (x - this.camFocusX) * z + w / 2, y: (y - this.camFocusY) * z + h / 2 };
            }
            return { x, y };
        },

        drawCombatOverlay: function (now) {
            const ctx = this.ctx; if (!ctx || !this.canvas) return;
            const w = this.canvas.width, h = this.canvas.height;
            ctx.save();
            ctx.textAlign = 'center';

            // Skadesiffror, BLOCK, COMBO
            this.floatTexts.forEach(ft => {
                const p = this._toScreen(ft.x, ft.y);
                const k = ft.t / ft.life;
                ctx.globalAlpha = 1 - k * k;
                ctx.font = 'bold ' + Math.round(ft.size * (1 + 0.25 * (1 - k))) + 'px Georgia';
                ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
                ctx.strokeText(ft.txt, p.x, p.y - k * 40);
                ctx.fillStyle = ft.col; ctx.fillText(ft.txt, p.x, p.y - k * 40);
            });
            ctx.globalAlpha = 1;

            // Nedräkning för ¡ACÁBALO!
            if (this.phase === 'dizzy') {
                const k = clamp(this.dizzyTimer / 3.2, 0, 1);
                ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(w / 2 - 130, 92, 260, 10);
                ctx.fillStyle = k > 0.35 ? '#ffd54f' : '#ff1744'; ctx.fillRect(w / 2 - 130, 92, 260 * k, 10);
            }

            // Fiendens uppladdning blir tydlig i 2D: liten varningsblinkning över huvudet
            if (this.phase === 'fighting' && this.enemy && this.enemy.ai && this.enemy.ai.state === 'windup') {
                const p = this._toScreen(this.enemy.x, this.enemy.y - 320);
                ctx.font = 'bold 26px Georgia'; ctx.fillStyle = (Math.floor(now / 90) % 2) ? '#ffea00' : '#ff6d00';
                ctx.fillText('!', p.x, p.y);
            }

            // Slutskärm
            if (this.phase === 'over' && (this.victory || (this.hero && this.hero.hp <= 0))) {
                const t = this.enemyFatalityStage === 'piss_front_closeup' ? 0 : 1;
                if (t) { ctx.fillStyle = 'rgba(5,2,2,0.55)'; ctx.fillRect(0, 0, w, h); }
                ctx.font = 'bold 54px Georgia';
                ctx.fillStyle = this.victory ? '#ffd54f' : '#ff1744';
                ctx.lineWidth = 6; ctx.strokeStyle = '#000';
                const title = this.victory ? 'VICTORIA' : 'DERROTA';
                ctx.strokeText(title, w / 2, h / 2); ctx.fillText(title, w / 2, h / 2);
                ctx.font = 'italic 18px Georgia'; ctx.fillStyle = '#f5e6d3';
                ctx.fillText('Tryck R för revansch', w / 2, h / 2 + 40);
            }
            ctx.restore();
        }
    });

    // Rita stridstexterna sist, ovanpå allt annat (även experterna)
    const origRender = EM.renderArena;
    EM.renderArena = function (now, realNow) {
        if (origRender) origRender.apply(this, arguments);
        if (this.active) this.drawCombatOverlay(realNow || now);
    };

    // Lägg till Blockera-knapp och uppdatera kontrollhjälpen i gränssnittet
    const origBuildUI = EM.buildOverlayUI;
    EM.buildOverlayUI = function () {
        if (origBuildUI) origBuildUI.apply(this, arguments);
        this._furiaShown = undefined;
        const fat = document.getElementById('mk-btn-fatality');
        if (fat && !document.getElementById('mk-btn-block')) {
            const grid = fat.parentElement;
            const b = document.createElement('button');
            b.id = 'mk-btn-block';
            b.className = fat.className;
            b.textContent = '🛡️ Blockera [Q]';
            b.style.cssText = 'background:linear-gradient(180deg,#2c4a5e,#16262f);color:#e0f7fa;padding:10px;font-weight:bold;';
            const on = (ev) => { ev.preventDefault(); this.setBlockHeld(true); };
            const off = () => this.setBlockHeld(false);
            b.addEventListener('mousedown', on); b.addEventListener('touchstart', on, { passive: false });
            ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(ev => b.addEventListener(ev, off));
            grid.appendChild(b);
            grid.style.gridTemplateColumns = 'repeat(7, minmax(0,1fr))';
        }
        const keys = document.querySelector('#melee-ui .mkv5-keycaps');
        if (keys) keys.innerHTML = '<span>←/→ Gå</span><span>A Slag</span><span>S Spark</span><span>D Grepp</span><span>Q/↓ Blockera</span><span>X Furia / Liquidar</span><span>R Revansch</span>';
        const legend = document.querySelector('#melee-ui .mkv5-legend');
        if (legend) legend.innerHTML =
            '<div class="mkv5-legend-item"><b>Blinkande ! över fienden</b> betyder att den laddar. Blockera [Q] – eller slå först för en <b>kontra</b>.</div>' +
            '<div class="mkv5-legend-item"><b>Kedja slag</b> när de träffar: varje slag i en combo gör mer skada.</div>' +
            '<div class="mkv5-legend-item"><b>Grepp [D]</b> går inte att blockera, men är långsamt och kort. Mot en skadad conquistador blir det amputation.</div>' +
            '<div class="mkv5-legend-item"><b>Full Furia</b> + X ger ett röntgenslag. När fienden knäar: <b>X</b> avrättar.</div>';
    };
})();
