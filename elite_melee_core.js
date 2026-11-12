// === DEL 4 AV 4: ELITE MELEE CORE ENGINE & GAUNTLET (elite_melee_core.js) ===
window.EliteMelee = window.EliteMelee || {};

Object.assign(window.EliteMelee, {
    active: false, phase: 'idle', canvas: null, ctx: null, animId: null, lastTime: 0,
    hero: null, enemy: null, usurper: null,
    gauntlet: { stage: 'soldiers', soldierKills: 0, soldierTarget: 6, conquistadorKills: 0, conquistadorTarget: 3, takeoverTriggeredForWave: false, artifactClaimed: false },
    camShake: 0, camZoom: 1.0, targetZoom: 1.0, camFocusX: 440, camFocusY: 260, slowMoTimer: 0, slowMoFactor: 0.20, darknessAlpha: 0, horrorCloseUpProgress: 0,
    enemyFatalityStage: 'gut_rip', enemyFatalityTimer: 0, clothShreds: [], dustMotes: [], clothRippedSoundPlayed: false, mierdaSpoken: false,
    xrayTimer: 0, xrayTargetPart: null, bloodParticles: [], bloodMist: [], boneParticles: [], severedLimbs: [], visceraChains: [], groundBlood: [], corpsePile: [], combatLog: [], comboBuffer: [], slashArcs: [], sparks: [], cinemaBanner: '', cinemaSubBanner: '',

    freshInjuries: function() {
        return { jawDislocated: false, ribsBroken: false, kneeShattered: false, armSevered: false, headSevered: false, spineSnapped: false, throatRipped: false, splitInHalf: false, disemboweled: false, heartRipped: false, bloodCoat: 0.08, slashMarks: [] };
    },

    createGauntletEnemy: function(stage) {
        // FIX #7: på Pampas blir fotsoldaterna gauchos, och bossen är El Lobizón
        if (stage === 'soldiers' && this.campaignBiome === 'pampas') {
            const num = this.gauntlet.soldierKills + 1;
            return { type: 'assassin', nation: 'arg', subType: 'gaucho', name: 'Gaucho Endemoniado de la Pampa (#' + num + '/' + this.gauntlet.soldierTarget + ')', x: 640, y: 432, hp: 78, maxHp: 78, pose: 'idle', poseTimer: 0, aiCooldown: 0.8, facing: -1, injuries: this.freshInjuries() };
        }
        if (stage === 'lobizon_boss') {
            return { type: 'lobizon', nation: 'myth', name: '🐺 BOSS: EL LOBIZÓN (Séptimo Hijo Varón)', x: 640, y: 432, hp: 240, maxHp: 240, pose: 'idle', poseTimer: 0, aiCooldown: 0.6, facing: -1, injuries: this.freshInjuries() };
        }
        if (stage === 'soldiers') {
            const isArg = Math.random() < 0.5, num = this.gauntlet.soldierKills + 1;
            return { type: 'assassin', nation: isArg ? 'arg' : 'bra', name: (isArg ? 'Argentinsk Spejare' : 'Brasiliansk Corta-Gargantas') + ' (#' + num + '/' + this.gauntlet.soldierTarget + ')', x: 640, y: 432, hp: 68, maxHp: 68, pose: 'idle', poseTimer: 0, aiCooldown: 0.85, facing: -1, injuries: this.freshInjuries() };
        } else if (stage === 'conquistadors') {
            const num = this.gauntlet.conquistadorKills + 1;
            return { type: 'skeleton', nation: 'esp', name: 'Odöd Spansk Conquistador [' + num + '/' + this.gauntlet.conquistadorTarget + ']', x: 620, y: 432, hp: 125, maxHp: 125, pose: 'idle', poseTimer: 0, aiCooldown: 0.78, facing: -1, injuries: this.freshInjuries() };
        } else {
            return { type: 'pombero', nation: 'myth', name: '👹 BOSS: EL POMBERO (Nattens Väktare)', x: 615, y: 432, hp: 220, maxHp: 220, pose: 'idle', poseTimer: 0, aiCooldown: 0.65, facing: -1, injuries: this.freshInjuries() };
        }
    },

    startAmbush: function(preferredHeroKey, enemyObj) {
        if (this.active) return;
        // FIX #1: stoppa alltid en eventuell gammal spelloop innan en ny startas
        if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
        this.active = true; this.phase = 'fighting';
        this.hitStop = 0; this.slowMoTimer = 0; this.xrayTimer = 0; this.camShake = 0; this.amp = null;
        this.boleadorasAnim = null; this.victory = false; this.floatTexts = []; this.enemyFatalityStage = 'gut_rip'; this.enemyFatalityTimer = 0; this.finisher = null;
        this.academicFreezeActive = false; this.activeAcademicCue = null; this._triggeredAcademicKeys = {};
        this.bloodParticles = []; this.bloodMist = []; this.boneParticles = []; this.severedLimbs = []; this.visceraChains = []; this.groundBlood = []; this.corpsePile = []; this.combatLog = []; this.comboBuffer = []; this.usurper = null;
        this.camZoom = 1.0; this.targetZoom = 1.0; this.cinemaBanner = ''; this.cinemaSubBanner = '';
        this.gauntlet = { stage: 'soldiers', soldierKills: 0, soldierTarget: 6, conquistadorKills: 0, conquistadorTarget: 3, takeoverTriggeredForWave: false, artifactClaimed: false };

        let hKey = preferredHeroKey || 'bloom';
        const names = { bloom: 'Sargento "Bloom" Brizuela', gomez: 'Capitana María "La Residente" Gómez', villalba: 'Cabo Juana Villalba', rojas: 'Teniente Emiliano Rojas', arandu: 'Payé Arandú', takeda: '”Sensei” Takeda Hiroshi' };
        this.hero = { key: hKey, name: names[hKey] || names.bloom, portrait: 'portraits/elite/' + hKey + '.jpg', x: 250, y: 432, hp: 170, maxHp: 170, rage: 40, pose: 'idle', poseTimer: 0, facing: 1, injuries: this.freshInjuries() };
        this.enemy = this.createGauntletEnemy('soldiers');
        if (enemyObj) this.enemy.ref = enemyObj;

        this.buildOverlayUI();
        this.bindKeys();
        this.addLog('💀 GAUNTLET STARTAD: Använd testknapparna i toppen för att se alla nya scener direkt!', '#ffd54f');
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    },

    addLog: function(txt, col) {
        this.combatLog.unshift({ txt, col: col || '#e0e0e0' });
        if (this.combatLog.length > 6) this.combatLog.pop();
        const logEl = document.getElementById('mk-log-strip');
        if (logEl) logEl.innerHTML = this.combatLog.map(l => '<div style="color:' + l.col + ';margin-bottom:2px;">' + l.txt + '</div>').join('');
    },

    buildOverlayUI: function() {
        let el = document.getElementById('melee-ui');
        if (!el) {
            el = document.createElement('div'); el.id = 'melee-ui';
            el.style.cssText = 'position:fixed;inset:0;background:rgba(4,2,2,0.96);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Georgia,serif;color:#f5e6d3;user-select:none;padding:8px;';
            document.body.appendChild(el);
        }
        el.style.display = 'flex';
        el.innerHTML = `
            <div style="max-width:930px;width:100%;background:#120b09;border:3px solid #7a1c1c;border-radius:6px;padding:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px;">
                    <div style="flex:1;"><span id="mk-hero-name" style="color:#ffd54f;font-weight:bold;">${this.hero.name}</span> (<span id="mk-hero-hp-txt">${this.hero.hp}</span> HP)<div style="height:12px;background:#260b0b;border:1px solid #b58d58;margin-top:3px;"><div id="mk-hero-bar" style="width:100%;height:100%;background:#2e7d32;"></div></div></div>
                    <div style="font-weight:bold;color:#ff1744;">VS</div>
                    <div style="flex:1;text-align:right;"><span id="mk-en-name" style="color:#ff8a80;font-weight:bold;">${this.enemy.name}</span> (<span id="mk-en-hp-txt">${this.enemy.hp}</span> HP)<div style="height:12px;background:#260b0b;border:1px solid #a84242;margin-top:3px;"><div id="mk-en-bar" style="width:100%;height:100%;background:#d50000;float:right;"></div></div></div>
                </div>
                <div style="position:relative;width:100%;display:flex;justify-content:center;background:#090504;border:2px solid #4a1c1c;overflow:hidden;">
                    <canvas id="mk-canvas" width="880" height="480" style="width:100%;max-width:880px;height:auto;display:block;"></canvas>
                    <div style="position:absolute;top:8px;left:8px;display:flex;gap:4px;flex-wrap:wrap;z-index:5;">
                        <button onclick="EliteMelee.switchFighter('bloom')" style="padding:3px 7px;font-size:0.71rem;background:#1b2836;color:#fff;cursor:pointer;">🥊 Bloom (Sundar-bryn)</button>
                        <button onclick="EliteMelee.switchFighter('gomez')" style="padding:3px 7px;font-size:0.71rem;background:#4a1515;color:#fff;cursor:pointer;">🗡️ Gómez (Tjej-diss)</button>
                        <button onclick="EliteMelee.triggerUsurperTakeover('conquistador')" style="padding:3px 7px;font-size:0.71rem;background:#37474f;color:#80deea;cursor:pointer;font-weight:bold;">🎬 1. Zombie Skräck-CloseUp</button>
                        <button onclick="EliteMelee.startPomberoCanaSearchCutscene()" style="padding:3px 7px;font-size:0.71rem;background:#311b92;color:#ffd54f;cursor:pointer;font-weight:bold;">🚬 2. Pombero Caña & Guaraní</button>
                        <button onclick="EliteMelee.startPomberoSakeDiplomacyCutscene()" style="padding:3px 7px;font-size:0.71rem;background:#1b5e20;color:#fff;cursor:pointer;font-weight:bold;">🍶 3. Takedas Sake-Deal</button>
                        <button onclick="EliteMelee.triggerConquistadorGutRipDemo()" style="padding:3px 7px;font-size:0.71rem;background:#4a0000;color:#ffd54f;cursor:pointer;font-weight:bold;">🚽 4. Långsam Piss + Mierda</button>
                        <button onclick="EliteMelee.startAmputationDemo()" style="padding:3px 7px;font-size:0.71rem;background:#5d0000;color:#fff;cursor:pointer;font-weight:bold;">✂️ 5. Amputation</button>
                        <button onclick="EliteMelee.demoUsurper(0)" style="padding:3px 7px;font-size:0.71rem;background:#263238;color:#e0e0e0;cursor:pointer;font-weight:bold;">🦴 6. Ryggrad ut</button>
                        <button onclick="EliteMelee.demoUsurper(1)" style="padding:3px 7px;font-size:0.71rem;background:#4a0010;color:#fff;cursor:pointer;font-weight:bold;">🫀 7. Hjärtat ut</button>
                        <button onclick="EliteMelee.demoUsurper(3)" style="padding:3px 7px;font-size:0.71rem;background:#4a1a2a;color:#fff;cursor:pointer;font-weight:bold;">🩸 8. Tarmar ut</button>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:10px;">
                    <button onmousedown="EliteMelee.step(-45)" style="padding:10px;background:#2b2018;color:#fff;font-weight:bold;">◄ BAKÅT</button>
                    <button onmousedown="EliteMelee.step(45)" style="padding:10px;background:#2b2018;color:#fff;font-weight:bold;">FRAM ►</button>
                    <button onmousedown="EliteMelee.performAttack('punch')" style="padding:10px;background:#8b0000;color:#fff;font-weight:bold;">👊 SLAG [A]</button>
                    <button onmousedown="EliteMelee.performAttack('kick')" style="padding:10px;background:#b71c1c;color:#fff;font-weight:bold;">🦵 SPARK [S]</button>
                    <button onmousedown="EliteMelee.performAttack('grapple')" style="padding:10px;background:#4a148c;color:#fff;font-weight:bold;">🦴 BRYT BEN [D]</button>
                    <button id="mk-btn-fatality" onmousedown="EliteMelee.performAttack('fatality')" style="padding:10px;background:#212121;color:#ffd54f;font-weight:bold;">💀 LIQUIDAR [X]</button>
                </div>
                <div id="mk-log-strip" style="background:#0a0605;border:1px solid #3d221c;padding:8px;margin-top:8px;height:74px;overflow-y:auto;font-family:monospace;font-size:0.82rem;"></div>
            </div>`;
        this.canvas = document.getElementById('mk-canvas');
        this.ctx = this.canvas.getContext('2d');
    },

    // FIX #1: den gamla loopen avbryts innan en ny startas, annars körs flera loopar parallellt
    switchFighter: function(hKey) {
        this.active = false;
        if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
        this.startAmbush(hKey);
    },
    step: function(dx) { if (this.phase === 'fighting' || this.phase === 'dizzy') this.hero.x = Math.max(110, Math.min(this.enemy.x - 115, this.hero.x + dx)); },
    bindKeys: function() {
        if (this._keyHandler) window.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (!this.active) return;
            if (e.code === 'ArrowLeft') this.step(-45); else if (e.code === 'ArrowRight') this.step(45);
            else if (e.code === 'KeyA') this.performAttack('punch'); else if (e.code === 'KeyS') this.performAttack('kick');
            else if (e.code === 'KeyD') this.performAttack('grapple'); else if (e.code === 'KeyX') this.performAttack('fatality');
        };
        window.addEventListener('keydown', this._keyHandler);
    },

    spawnGore: function(x, y, count, withBones, dirX = 1) {
        for (let i = 0; i < count; i++) {
            const spread = (Math.random() - 0.38) * 1.2, spd = 140 + Math.random() * 380;
            this.bloodParticles.push({ x, y, vx: dirX * Math.cos(spread) * spd, vy: Math.sin(spread) * spd - 95, size: 3 + Math.random() * 5, col: Math.random() > 0.35 ? '#7a0000' : '#c60b0b' });
        }
        if (withBones) {
            const kinds = ['broken_longbone', 'rib_arc', 'jaw_piece'];
            for (let b = 0; b < 3; b++) {
                this.boneParticles.push({ x, y, vx: dirX * (75 + Math.random() * 165), vy: -190 - Math.random() * 140, rot: Math.random() * 6, vrot: (Math.random() - 0.5) * 10, kind: kinds[b], len: 30 + Math.random() * 12, thick: 7.5, bendAngle: 0.45 });
            }
        }
    },

    spawnVisceraExtraction: function(sx, sy, px, py, target) {
        this.visceraChains = [{ anchorTarget: target || 'hero', nodes: Array.from({ length: 10 }, (_, i) => ({ x: sx + (px - sx) * (i / 9), y: sy + (py - sy) * (i / 9), vx: 0, vy: 0, thick: 10, col: '#9e2a2b' })) }];
    },

    triggerConquistadorGutRipDemo: function() {
        this.enemy.type = 'skeleton'; this.enemy.name = 'Odöd Spansk Conquistador';
        this.hero.x = this.enemy.x - 115; this.hero.hp = 1;
        this.executeEnemyFatalitySequence();
    },

    executeEnemyFatalitySequence: function() {
        this.phase = 'enemy_fatality_anim'; this.enemyFatalityStage = 'gut_rip'; this.enemyFatalityTimer = 0;
        this.clothRippedSoundPlayed = false; this.mierdaSpoken = false;
        this.enemy.pose = 'fatality'; this.hero.pose = 'hurt'; this.hero.hp = 0;
        this.hero.injuries.disemboweled = true; this.enemy.x = this.hero.x + 98;
        this.playBoneCrunch(true); this.playGutRipSound(); this.playChokedAgonyScream();
        this.spawnVisceraExtraction(this.hero.x + 22, this.hero.y - 115, this.enemy.x - 42, this.enemy.y - 195, 'hero');
        this.spawnGore(this.hero.x + 24, this.hero.y - 135, 95, true, -1);
    },

    performAttack: function(type) {
        if (this.phase !== 'fighting' && this.phase !== 'dizzy') return;
        const isLastSoldier = (this.gauntlet.stage === 'soldiers' && this.gauntlet.soldierKills === this.gauntlet.soldierTarget - 1);
        const isLastConq = (this.gauntlet.stage === 'conquistadors' && this.gauntlet.conquistadorKills === this.gauntlet.conquistadorTarget - 1);

        this.hero.pose = type; this.hero.poseTimer = 0.34;
        this.enemy.pose = 'hurt'; this.enemy.poseTimer = 0.36;
        let dmg = type === 'grapple' ? 34 : (type === 'kick' ? 28 : 22);
        this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.spawnGore(this.enemy.x - 20, this.enemy.y - 200, 36, type !== 'punch', 1);
        this.playBoneCrunch(type !== 'punch');

        if (isLastSoldier && !this.gauntlet.takeoverTriggeredForWave && this.enemy.hp <= 38) { this.triggerUsurperTakeover('conquistador'); return; }
        if (isLastConq && !this.gauntlet.takeoverTriggeredForWave && this.enemy.hp <= 48) { this.startPomberoCanaSearchCutscene(); return; }

        // Om Bossen El Pombero når 0 HP -> Han dör inte, Sensei Takeda kliver in med Sake!
        if (this.gauntlet.stage === 'pombero_boss' && this.enemy.hp <= 0) {
            this.startPomberoSakeDiplomacyCutscene();
            return;
        }

        // Grapple mot en skadad conquistador => långsam, detaljerad amputation
        if (type === 'grapple' && this.enemy.type === 'skeleton' && !this.enemy.injuries.armSevered && this.enemy.hp > 0 && this.enemy.hp <= 95 && this.startAmputation) {
            this.startAmputation();
            return;
        }

        if (this.enemy.hp <= 0) {
            if (this.gauntlet.stage === 'soldiers') {
                this.gauntlet.soldierKills++;
                this.enemy = this.createGauntletEnemy('soldiers');
            } else if (this.gauntlet.stage === 'conquistadors') {
                this.gauntlet.conquistadorKills++;
                this.enemy = this.createGauntletEnemy('conquistadors');
            }
        }
        this.updateTopBars();
    },

    updateTopBars: function() {
        const hBar = document.getElementById('mk-hero-bar'), eBar = document.getElementById('mk-en-bar');
        const hTxt = document.getElementById('mk-hero-hp-txt'), eTxt = document.getElementById('mk-en-hp-txt'), eName = document.getElementById('mk-en-name');
        if (hBar) hBar.style.width = Math.max(0, Math.round((this.hero.hp / this.hero.maxHp) * 100)) + '%';
        if (eBar) eBar.style.width = Math.max(0, Math.round((this.enemy.hp / this.enemy.maxHp) * 100)) + '%';
        if (hTxt) hTxt.textContent = this.hero.hp;
        if (eTxt) eTxt.textContent = this.enemy.hp;
        if (eName) eName.textContent = this.enemy.name;
    },

    updateParticles: function(dt) {
        const floorY = 436;
        this.bloodParticles.forEach(p => {
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 820 * dt;
            if (p.y >= floorY) { p.y = floorY; this.groundBlood.push({ x: p.x, y: floorY, r: p.size * 2, col: p.col }); p.dead = true; }
        });
        this.bloodParticles = this.bloodParticles.filter(p => !p.dead);
        this.boneParticles.forEach(b => {
            b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 720 * dt; b.rot += b.vrot * dt;
            if (b.y >= floorY - 3) { b.y = floorY - 3; b.vx *= 0.22; b.vrot = 0; }
        });
        // FIX #8: tak på antalet partiklar så att spelet inte blir segare ju längre man spelar
        if (this.bloodParticles.length > 900) this.bloodParticles.splice(0, this.bloodParticles.length - 900);
        if (this.groundBlood.length > 450) this.groundBlood.splice(0, this.groundBlood.length - 450);
        if (this.boneParticles.length > 45) this.boneParticles.splice(0, this.boneParticles.length - 45);
    },

    loop: function(now) {
        if (!this.active) return;
        const rawDt = Math.min(0.1, (now - this.lastTime) / 1000);
        this.lastTime = now;
        this._frameDt = rawDt; // FIX #5: verklig bildrutetid som alla andra moduler använder

        // FIX #3: slow motion och hitstop påverkar nu faktiskt simuleringen (blod, ben, strid)
        let simDt = rawDt;
        if (this.slowMoTimer > 0) { this.slowMoTimer = Math.max(0, this.slowMoTimer - rawDt); simDt *= (this.slowMoFactor || 0.2); }
        if (this.hitStop > 0) { this.hitStop = Math.max(0, this.hitStop - rawDt); simDt = 0; }

        this.camZoom += (this.targetZoom - this.camZoom) * Math.min(1, rawDt * 4.2);
        if (this.camShake > 0) this.camShake = Math.max(0, this.camShake - rawDt * 42);
        if (this.xrayTimer > 0) this.xrayTimer = Math.max(0, this.xrayTimer - rawDt * 1.35);

        if (this.phase === 'takeover_anim') this.updateTakeoverSequence(rawDt, now);
        else if (this.phase === 'sake_diplomacy_anim') this.updatePomberoSakeDiplomacy(rawDt, now);
        else if (this.phase === 'enemy_fatality_anim') this.updateEnemyFatalitySequence(rawDt);
        else if (this.phase === 'amputation_anim' && this.updateAmputation) this.updateAmputation(rawDt, now);

        if (this.updateCombat && !this.academicFreezeActive) this.updateCombat(rawDt, simDt, now);
        if (this.updateGoreExtras) this.updateGoreExtras(simDt, now);
        this.updateParticles(simDt);
        this.renderArena(now);
        this.animId = requestAnimationFrame(t => this.loop(t));
    },

    closeMelee: function() {
        this.active = false;
        if (this.animId) cancelAnimationFrame(this.animId);
        const el = document.getElementById('melee-ui');
        if (el) el.style.display = 'none';
    }
});
