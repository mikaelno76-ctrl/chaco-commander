// === DEL 2 AV 4: ELITE MELEE CINEMATICS & CUTSCENES (elite_melee_cinematics.js) ===
window.EliteMelee = window.EliteMelee || {};

Object.assign(window.EliteMelee, {
    pomberoSearchTimer: 0,
    pomberoSearchStep: 0,
    pomberoSmokePuffs: [],
    sakeDiplomacyTimer: 0,
    sakeDiplomacyStep: 0,

    // 1. EL POMBEROS CIGARETT, GUARANÍ-SVORDOMAR & SKELETT-OBDUKTION
    pomberoRibs: 0, pomberoSkullOpen: false, pomberoGrinUntil: 0, pomberoPauseUntil: 0,
    pomberoLine: 0, pomberoHeroReact: false, _pomberoEv: null,
    pomberoDuration: 60,          // total längd (sek) på Pombero-scenen
    horrorCloseupDuration: 5.0,   // längd (sek) på zombie-närbilden innan slakten

    // Undertexter (Guaraní / Spanska / Svenska) – byts av tidslinjen nedan
    pomberoLinesData: [
        { g: '"¡Moõpa oĩ che káña, nde mondaha!"', e: '"¿¡Dónde carajo está mi Caña, ladrón [CENSURADO]!?"', s: 'Var fan är mitt Caña-brännvin, din [CENSURERAT] tjuv?!' },
        { g: '"¡Mba\'eve ndaipóri apépe!"', e: '"¡Hijo de █████! ¡Nada en la cabeza!"', s: 'Din ████! Ingenting i skallen!' },
        { g: '"Moõpa... ¿ha ko\'ápe avei?"', e: '(toc, toc) "¿Tampoco aquí? Hueco, como tu conciencia."', s: '(knack, knack) "Inte här heller? Ihålig, som ditt samvete."' },
        { g: '*risita*  "Je, je, je..."', e: '"La escondiste bien, ¿eh? Pero yo tengo tiempo..."', s: '"Du gömde den bra, va? Men jag har gott om tid..."' },
        { g: '"Peteĩ..."', e: '"Una costilla... (¡KRAK!) ...¿nada? ¡Hijo de la ████!"', s: '"Ett revben... (KNAK!) ...ingenting? Din stora ████!"' },
        { g: '*puff*  "Ñandejára..."', e: '(fuma) "Sin apuro. Un buen trabajo no se apura."', s: '(drar ett bloss) "Ingen brådska. Ett bra jobb ska man ta tid på."' },
        { g: '"Mokõi..."', e: '"Dos. ¡Madre de █████! ¿Dónde está mi botella?"', s: '"Två. Din ████! Var är min flaska?"' },
        { g: '"Mbohapy..."', e: '"Tres. Se me cansan los dedos, pero no me rindo."', s: '"Tre. Fingrarna blir trötta, men jag ger mig inte."' },
        { g: '*risita*  "Iporãiterei..."', e: '"Una más, y otra más... qué lindo trabajo, ¿no?"', s: '"Ett till, och ett till... vilket härligt jobb, eller hur?"' },
        { g: '"Irundy..."', e: '"Cuatro... ¡y todavía nada, desgraciado!"', s: '"Fyra... och fortfarande ingenting, din eländing!"' },
        { g: '*chof* *chof*', e: '"¿En el hígado? ¿En el estómago? ¡Qué asco, pero busco!"', s: '"I levern? I magen? Usch, äckligt, men jag letar ändå!"' },
        { g: '"Po..."', e: '"Cinco. La última. (¡KRAK!) ...¡¿NADA?!"', s: '"Fem. Det sista. (KNAK!) ...INGENTING?!"' },
        { g: '"...Mba\'eve."', e: '"...Ni una gota. Qué injusticia."', s: '"...Inte en droppe. Vilken orättvisa."' },
        { g: '"¡Nde mondaha!"', e: '"¡Ya verás, ladrón! ¡Te voy a encontrar!"', s: '"Du ska få se, tjuv! Jag hittar dig!"' }
    ],

    startPomberoCanaSearchCutscene: function() {
        this.phase = 'takeover_anim';
        this.gauntlet.takeoverTriggeredForWave = true;
        this.pomberoSearchTimer = 0;
        this.pomberoSearchStep = 0;
        this.pomberoSmokePuffs = [];
        this.pomberoRibs = 0; this.pomberoSkullOpen = false; this.pomberoGrinUntil = 0; this.pomberoPauseUntil = 0;
        this.pomberoLine = 0; this.pomberoHeroReact = false;
        this._pomberoEv = this._buildPomberoEvents();
        this.usurper = { who: 'pombero', type: 'pombero', name: 'EL POMBERO', x: 620, y: 432, stage: 'pombero_cana_autopsy', timer: 0 };
        this.playCigarettePuff();
        this.speakLine("Moõpa oĩ che káña, nde mondaha!", "es-PY", 0.25, 0.78);
        this.cinemaBanner = '🚬👹 ¡EL POMBERO BUSCA SU CAÑA!';
        this.cinemaSubBanner = 'El Pombero sätter en tänd cigarett i mungipan – han har ingen brådska...';
        this.addLog('🚬👹 [EL POMBERO DYKER UPP]: Med en glödande cigarett i mungipan kastar sig El Pombero över den ryckande Conquistadoren och morrar på Guaraní efter sin stulna Caña (sockerrörsbrännvin)!', '#ffd54f');
    },

    // Tidslinje för hela scenen (sekunder). Ändra t-värdena för att göra den kortare/längre.
    _buildPomberoEvents: function() {
        const self = this;
        const rib = (n, line, txt, beep) => () => {
            self.pomberoRibs = n; self.pomberoLine = line;
            self.playBoneCrunch(true); if (beep) self.playCensorBeep(0.34);
            self.camShake = 18 + n * 3;
            self.spawnGore(490 + n * 6, 345, 26 + n * 4, true, 1);
            self.addLog(txt, '#ffab40');
        };
        return [
            { t: 2.0, run: () => {
                self.pomberoSkullOpen = true; self.pomberoLine = 1;
                self.playBoneCrunch(true); self.playCensorBeep(0.32); self.camShake = 28;
                self.spawnGore(440, 320, 45, true, -1);
                self.addLog('💀🔍 [KRANIET ÖPPNAS]: El Pombero bänder upp Conquistadorens skalle som ett lock: "¿Moõpa oĩ che Caña? ¡Hijo de █████!"', '#ff5252');
            } },
            { t: 6.0, run: () => {
                self.pomberoLine = 2; self.pomberoPauseUntil = 10;
                self.playBoneCrunch(false);
                self.addLog('🔍🥁 [KNACK, KNACK]: Han knackar på insidan av kraniet med knogen, lyssnar, och skakar det som en melon.', '#ffcc80');
            } },
            { t: 10.0, run: () => {
                self.pomberoLine = 3; self.pomberoGrinUntil = 14.5;
                self.speakLine("je, je, je...", "es-PY", 0.2, 0.7);
                self.addLog('😁 [LEENDET]: Cigaretten gungar i mungipan när han flinar sakta: "Du gömde den bra... men jag har gott om tid."', '#ea80fc');
            } },
            { t: 13.0, run: rib(1, 4, '🦴🍾 [REVBEN #1]: *KNAK!* Det första revbenet viker sig. "¿Nada? ¡Hijo de la gran ████!"', true) },
            { t: 17.0, run: () => {
                self.pomberoLine = 5; self.pomberoPauseUntil = 22;
                self.playCigarettePuff();
                for (let i = 0; i < 7; i++) self.pomberoSmokePuffs.push({ x: 465 + (Math.random() - 0.5) * 14, y: 195, vx: -10 + Math.random() * 40, vy: -30 - Math.random() * 30, r: 8 + Math.random() * 10, alpha: 0.6 });
                self.addLog('🚬😌 [BLOSS]: Han tar ett långt bloss och blåser ut röken rakt in i bröstkorgen. "Ett bra jobb ska man ta tid på."', '#ffd54f');
            } },
            { t: 21.0, run: rib(2, 6, '🦴🍾 [REVBEN #2]: *KRAAK!* "¡Madre de █████! ¿Dónde está mi botella?"', true) },
            { t: 25.0, run: rib(3, 7, '🦴🍾 [REVBEN #3]: *KNAK!* Fingrarna blir trötta, men han ger sig inte.', false) },
            { t: 28.0, run: () => {
                self.pomberoLine = 8; self.pomberoGrinUntil = 33.5;
                if (self.playTendonSnap) self.playTendonSnap();
                self.speakLine("Iporãiterei... je, je.", "es-PY", 0.2, 0.7);
                self.addLog('😁🦴 [NJUTNING]: Han sliter loss en senrest och flinar nöjt: "Ett till, och ett till... vilket härligt jobb."', '#ea80fc');
            } },
            { t: 31.0, run: rib(4, 9, '🦴🍾 [REVBEN #4]: *KRRRAK!* "Cuatro... ¡y todavía nada, desgraciado!"', true) },
            { t: 35.0, run: () => {
                self.pomberoLine = 10; self.pomberoPauseUntil = 38.5;
                if (self.playWetSquelch) self.playWetSquelch();
                self.playGutRipSound(); self.camShake = 14;
                self.spawnGore(500, 350, 40, false, 1);
                self.addLog('🫀🔍 [LETAR I INNANMÄTET]: Han trycker ner handen och rotar runt bland organen. "¿En el hígado? ¡Qué asco, pero busco!"', '#ff8a65');
            } },
            { t: 39.0, run: () => {
                rib(5, 11, '🦴🍾 [REVBEN #5]: *KRAAAK!* Det sista revbenet. "...¡¿NADA?!"', true)();
                self.camShake = 30;
            } },
            { t: 43.0, run: () => {
                self.pomberoHeroReact = true;
                const hKey = self.hero ? self.hero.key : 'bloom';
                if (hKey === 'gomez' || hKey === 'villalba') {
                    self.speakLine("Okej, visst dras jag till killar som inte skäms för vilka de är, men du är inte riktigt min typ ändå.", "sv-SE", 1.05, 0.95);
                    self.addLog('💅💬 ' + self.hero.name + ': "Okej, visst... förvisso dras jag till killar som inte skäms för vilka de är, men ärligt talat, du är inte riktigt min typ ändå!"', '#ea80fc');
                } else {
                    self.addLog('🤨🇮🇳 [TILLÄGNAT SUNDAR PICHAI]: ' + self.hero.name + ' höjer långsamt på ENA ÖGONBRYNET i stum fascination över obduktionen.', '#80deea');
                }
            } },
            { t: 47.0, run: () => {
                self.pomberoLine = 12; self.pomberoPauseUntil = 52;
                self.speakLine("Mba'eve...", "es-PY", 0.2, 0.6);
                self.addLog('😔 [BESVIKELSEN]: Han stirrar ner i den tomma bröstkorgen. Cigaretten hänger slappt. "...Ni una gota."', '#b0bec5');
            } },
            { t: 53.0, run: () => {
                self.pomberoLine = 13;
                self.playCensorBeep(0.4); self.camShake = 26;
                self.speakLine("Nde mondaha!", "es-PY", 0.15, 0.7);
                self.addLog('😡🔥 [RASERIET]: Han fimpar cigaretten mot ett revben och vänder sig mot dig. "¡Ya verás, ladrón!"', '#ff5252');
            } }
        ];
    },

    updatePomberoCanaSearch: function(rawDt, now) {
        this.pomberoSearchTimer += rawDt;
        const t = this.pomberoSearchTimer;
        if (Math.random() < 0.45) {
            this.pomberoSmokePuffs.push({ x: 465 + (Math.random() - 0.5) * 12, y: 195, vx: -15 + Math.random() * 35, vy: -35 - Math.random() * 25, r: 6 + Math.random() * 8, alpha: 0.55 });
        }
        this.pomberoSmokePuffs.forEach(sm => { sm.x += sm.vx * rawDt; sm.y += sm.vy * rawDt; sm.r += 14 * rawDt; sm.alpha = Math.max(0, sm.alpha - rawDt * 0.22); });
        this.pomberoSmokePuffs = this.pomberoSmokePuffs.filter(sm => sm.alpha > 0);

        const ev = this._pomberoEv || (this._pomberoEv = this._buildPomberoEvents());
        while (this.pomberoSearchStep < ev.length && t >= ev[this.pomberoSearchStep].t) {
            const e = ev[this.pomberoSearchStep]; this.pomberoSearchStep++; e.run();
        }

        if (t >= this.pomberoDuration) {
            this.gauntlet.stage = 'pombero_boss';
            this.gauntlet.takeoverTriggeredForWave = false;
            this.enemy = this.createGauntletEnemy('pombero_boss');
            this.enemy.injuries.bloodCoat = 0.85;
            this.usurper = null; this.cinemaBanner = ''; this.cinemaSubBanner = ''; this.phase = 'fighting';
            this.addLog('👹🔥 SLUTSTRID: El Pombero hittade ingen Caña i skelettet – nu ger han sig på DIG! Besegra honom så bjuder Sensei Takeda på Sake!', '#ffd54f');
            this.updateTopBars();
        }
    },

    drawPomberoCanaSearchScene: function(ctx, w, h, now, tex) {
        const t = this.pomberoSearchTimer;
        ctx.save();
        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.55, 30, w * 0.5, h * 0.5, w * 0.65);
        bgGrad.addColorStop(0, '#1e1912'); bgGrad.addColorStop(0.6, '#0b0906'); bgGrad.addColorStop(1, '#020101');
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

        // 1. Ryckande Conquistador-zombie på marken
        ctx.save();
        const twitchX = (Math.sin(now * 0.045) > 0.7) ? (Math.random() - 0.5) * 10 : 0;
        const twitchY = (Math.cos(now * 0.038) > 0.7) ? (Math.random() - 0.5) * 6 : 0;
        ctx.translate(w * 0.52 + twitchX, h * 0.70 + twitchY);
        ctx.fillStyle = tex.goreTex || '#4a0000';
        ctx.beginPath(); ctx.ellipse(0, 28, 175, 28, 0, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#25201c'; ctx.lineWidth = 26; ctx.lineCap = 'round';
        const legJerk = Math.sin(now * 0.03) * 8;
        ctx.beginPath(); ctx.moveTo(45, 5); ctx.lineTo(145, 18 + legJerk); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(45, 15); ctx.lineTo(135, 32 - legJerk); ctx.stroke();

        ctx.fillStyle = tex.rustedArmor || '#2c3236';
        ctx.fillRect(-55, -28, 115, 52);

        const ribsBrokenCount = this.pomberoRibs || 0;
        ctx.fillStyle = '#2b0000'; ctx.beginPath(); ctx.ellipse(5, -4, 46, 22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#e8e0cc'; ctx.lineWidth = 5;
        for (let r = 0; r < 5; r++) {
            const rx = -28 + r * 15, isSnapped = r < ribsBrokenCount;
            ctx.beginPath(); ctx.moveTo(rx, -22); ctx.lineTo(rx + (isSnapped ? 12 : 0), isSnapped ? -48 : 16); ctx.stroke();
        }

        // Skallen som bänds upp
        ctx.save(); ctx.translate(-92, -8);
        ctx.fillStyle = '#7d7258'; ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(-10, 4, 4, 0, Math.PI * 2); ctx.fill();
        if (!this.pomberoSkullOpen) {
            ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(0, -4, 38, Math.PI, 0); ctx.fill();
        } else {
            ctx.fillStyle = '#2b0404'; ctx.beginPath(); ctx.ellipse(0, -4, 32, 12, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#e6dec8'; ctx.lineWidth = 4; ctx.stroke();
            ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(-55, 28, 32, 0, Math.PI); ctx.fill();
        }
        ctx.restore(); ctx.restore();

        // 2. El Pombero med tänd cigarett i mungipan
        ctx.save();
        const pomX = ((this.pomberoRibs || 0) < 1) ? (w * 0.43) : (w * 0.51), digBob = Math.sin(now * 0.022) * (t < (this.pomberoPauseUntil || 0) ? 1.5 : 8);
        ctx.translate(pomX, h * 0.46 + digBob);
        ctx.fillStyle = tex.pomberoFur || '#141311';
        ctx.beginPath(); ctx.ellipse(0, 35, 78, 65, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0e0d0b'; ctx.beginPath(); ctx.arc(-12, -28, 48, 0, Math.PI * 2); ctx.fill();

        for (let ex of [-30, 4]) {
            const eg = ctx.createRadialGradient(ex, -34, 1, ex, -34, 14);
            eg.addColorStop(0, '#ffff8d'); eg.addColorStop(0.45, '#ffab00'); eg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, -34, 14, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = '#1f0808'; ctx.fillRect(-32, -8, 42, 16);
        ctx.fillStyle = '#d7ccc8'; for (let tx = -28; tx <= 4; tx += 8) ctx.fillRect(tx, -8, 4, 6);
        if (t < (this.pomberoGrinUntil || 0)) { // brett, långsamt flin
            ctx.fillStyle = '#1f0808'; ctx.beginPath(); ctx.moveTo(-38, -9); ctx.quadraticCurveTo(-11, 26, 18, -9); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#d7ccc8'; for (let tx = -33; tx <= 8; tx += 7) ctx.fillRect(tx, -8, 4.5, 7);
            for (let tx = -27; tx <= 2; tx += 7) ctx.fillRect(tx, 4 + Math.abs(tx + 12) * -0.1, 4, 5);
            ctx.strokeStyle = '#0a0505'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-38, -9); ctx.quadraticCurveTo(-11, 26, 18, -9); ctx.stroke();
        }

        // Cigaretten i mungipan
        ctx.save(); ctx.translate(-28, -2); ctx.rotate(0.18);
        ctx.fillStyle = '#d7ccc8'; ctx.fillRect(-38, -4, 38, 8);
        ctx.fillStyle = '#5d4037'; ctx.fillRect(-10, -4, 10, 8);
        const emberGlow = 5 + Math.abs(Math.sin(now * 0.015)) * 5;
        ctx.fillStyle = '#ff3d00'; ctx.beginPath(); ctx.arc(-39, 0, emberGlow, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffff00'; ctx.beginPath(); ctx.arc(-39, 0, emberGlow * 0.45, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        const armReachY = 75 + Math.sin(now * 0.035) * 18;
        ctx.strokeStyle = '#1c1a17'; ctx.lineWidth = 24; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-35, 10); ctx.lineTo(-20, armReachY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(35, 10); ctx.lineTo(25, armReachY - 8); ctx.stroke();
        if ((this.pomberoRibs || 0) > 0) {
            ctx.strokeStyle = '#e8e0cc'; ctx.lineWidth = 7;
            ctx.beginPath(); ctx.arc(32, armReachY - 18, 24, -Math.PI * 0.7, 0.2); ctx.stroke();
        }
        ctx.restore();

        this.pomberoSmokePuffs.forEach(sm => {
            ctx.fillStyle = 'rgba(195,205,215,' + sm.alpha + ')';
            ctx.beginPath(); ctx.arc(sm.x, sm.y, sm.r, 0, Math.PI * 2); ctx.fill();
        });
        if (this.drawAnatomicalBonePieces) this.drawAnatomicalBonePieces(ctx);

        // 3. Guaraní + Censurerad Spansk Undertext
        ctx.save();
        ctx.fillStyle = 'rgba(8, 5, 4, 0.92)'; ctx.strokeStyle = '#8d6e32'; ctx.lineWidth = 2.5;
        ctx.fillRect(w * 0.08, h - 108, w * 0.84, 88); ctx.strokeRect(w * 0.08, h - 108, w * 0.84, 88);
        ctx.textAlign = 'center';
        const L = this.pomberoLinesData[Math.min(this.pomberoLine || 0, this.pomberoLinesData.length - 1)];
        ctx.font = 'bold 18px Georgia'; ctx.fillStyle = '#a5d6a7';
        ctx.fillText('🗣️ [GUARANÍ]: ' + L.g, w * 0.5, h - 78);
        ctx.font = 'italic 16px Georgia'; ctx.fillStyle = '#ffffff';
        ctx.fillText('🇪🇸 [SUBTÍTULOS]: ' + L.e, w * 0.5, h - 48);
        ctx.font = '13px monospace'; ctx.fillStyle = '#ffcc80';
        ctx.fillText('(SVENSKA: ' + L.s + ')', w * 0.5, h - 24);
        ctx.restore();

        if (this.pomberoHeroReact) this.drawHeroReactionPiP(ctx, w, h, now);
        ctx.restore();
    },

    drawHeroReactionPiP: function(ctx, w, h, now) {
        const hKey = this.hero ? this.hero.key : 'bloom';
        const isFemale = (hKey === 'gomez' || hKey === 'villalba');
        ctx.save();
        const boxX = 36, boxY = 86, boxW = 365, boxH = 148;
        ctx.fillStyle = 'rgba(16, 22, 28, 0.96)'; ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 3;
        ctx.fillRect(boxX, boxY, boxW, boxH); ctx.strokeRect(boxX, boxY, boxW, boxH);

        const cx = boxX + 68, cy = boxY + 78;
        ctx.fillStyle = (hKey === 'bloom') ? '#4a2c1d' : '#b8835c';
        ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(cx - 14, cy - 6, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 14, cy - 6, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(cx - 12, cy - 6, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 16, cy - 6, 3.5, 0, Math.PI * 2); ctx.fill();

        const browRaise = 12 + Math.sin(now * 0.015) * 3;
        ctx.strokeStyle = '#111'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - 25, cy - 16); ctx.lineTo(cx - 5, cy - 15); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 4, cy - 18 - browRaise * 0.5); ctx.quadraticCurveTo(cx + 15, cy - 26 - browRaise, cx + 26, cy - 16 - browRaise * 0.3); ctx.stroke();

        if (hKey === 'bloom') {
            ctx.fillStyle = '#14100d'; ctx.fillRect(cx - 16, cy + 12, 32, 7);
            ctx.fillStyle = '#141e28'; ctx.fillRect(cx - 38, cy - 52, 76, 22);
        } else {
            ctx.fillStyle = '#120e0c'; ctx.beginPath(); ctx.arc(cx, cy - 12, 42, Math.PI * 0.85, Math.PI * 2.15); ctx.fill();
        }

        ctx.textAlign = 'left';
        if (isFemale) {
            ctx.font = 'bold 13px Georgia'; ctx.fillStyle = '#ff80ab';
            ctx.fillText(this.hero.name.toUpperCase() + ':', boxX + 125, boxY + 32);
            ctx.font = 'italic 13px Georgia'; ctx.fillStyle = '#ffffff';
            ctx.fillText('"Okej, visst... förvisso dras', boxX + 125, boxY + 56);
            ctx.fillText('jag till killar som inte skäms', boxX + 125, boxY + 76);
            ctx.fillText('för vilka de är, men ärligt talat:', boxX + 125, boxY + 96);
            ctx.fillStyle = '#ffd54f'; ctx.fillText('du är INTE riktigt min typ ändå."', boxX + 125, boxY + 118);
        } else {
            ctx.font = 'bold 13px Georgia'; ctx.fillStyle = '#80deea';
            ctx.fillText('🤨 THE SUNDAR PICHAI BROW™:', boxX + 125, boxY + 34);
            ctx.font = 'italic 13px Georgia'; ctx.fillStyle = '#ffffff';
            ctx.fillText(this.hero.name + ' ser på i tystnad', boxX + 125, boxY + 58);
            ctx.fillText('och höjer bara på ena', boxX + 125, boxY + 78);
            ctx.fillStyle = '#ffd54f'; ctx.fillText('ögonbrynet åt Sundar Pichai.', boxX + 125, boxY + 102);
        }
        ctx.restore();
    },

    // 2. SENSEI TAKEDAS SAKE-DIPLOMATI VID 0 HP
    startPomberoSakeDiplomacyCutscene: function() {
        this.phase = 'sake_diplomacy_anim';
        this.sakeDiplomacyTimer = 0;
        this.sakeDiplomacyStep = 0;
        this.enemy.hp = 1;
        this.xrayTimer = 0; this.slowMoTimer = 0; this.targetZoom = 1.0;
        this.cinemaBanner = '🍶👹 ¡EL PACTO DEL SAKE!';
        this.cinemaSubBanner = 'El Pombero dör inte – men Sensei Takeda kliver fram med en flaska Sake från Japan...';
        this.speakLine("Mate, seirei yo. Nihon no Sake ga aru. Kore wo yarou.", "ja-JP", 0.75, 0.88);
        this.addLog('🏮🍶 [SENSEI TAKEDA MEDLAR]: El Pombero kan inte dödas! Men Sensei Takeda kliver fram och säger på japanska: 「待て… 日本の『酒』(Sake)がある。これをやろう。」 ("Hörru, jag har faktiskt en flaska med Sake från Japan. Du kan få den.")', '#ffd54f');
    },

    updatePomberoSakeDiplomacy: function(rawDt, now) {
        this.sakeDiplomacyTimer += rawDt;
        const t = this.sakeDiplomacyTimer;
        if (t >= 3.2 && this.sakeDiplomacyStep === 0) {
            this.sakeDiplomacyStep = 1;
            this.playSakeGulp();
            this.speakLine("Iporãiterei! Kóva iporãve káñagui!", "es-PY", 0.3, 0.85);
            this.addLog('🍶🤩 [EL POMBERO SMAKAR SAKE]: El Pombero klunkar i sig det japanska risbrännvinet med lysande ögon: "¡Iporãiterei! Det här var fan ännu godare än Caña!"', '#69f0ae');
        }
        if (t >= 6.5 && this.sakeDiplomacyStep === 1) {
            this.sakeDiplomacyStep = 2;
            this.gauntlet.artifactClaimed = true;
            this.cinemaBanner = '🏆🍶 ¡TRUEQUE LEGENDARIO COMPLETADO!';
            this.cinemaSubBanner = 'De byter Sake-flaskan mot Guaraní-artefakten!';
            this.addLog('🏆🤝 [ARTEFAKTEN ERÖVRAD GENOM BYTESHANDEL]: El Pombero behåller Sake-flaskan och räcker över Guaraní-artefakten ("El Ídolo de Sangre")! (+250 XP!)', '#ffd54f');
            if (this.enemy && this.enemy.ref) { this.enemy.ref.dead = true; this.enemy.ref.hp = 0; }
            if (window.GameState && window.GameState.data) window.GameState.data.pomberoArtifactClaimed = true;
            if (window.EliteSquad) window.EliteSquad.awardKillXP('back', 250, 'EL POMBERO (SAKE-DEAL)');
        }
        if (t >= 10.2) { this.phase = 'over'; this.victory = true; this.closeMelee(); }
    },

    drawPomberoSakeDiplomacyScene: function(ctx, w, h, now, tex) {
        const t = this.sakeDiplomacyTimer;
        ctx.save();
        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.65);
        bgGrad.addColorStop(0, '#18202c'); bgGrad.addColorStop(1, '#040507');
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

        // Sensei Takeda (vänster)
        ctx.save(); ctx.translate(w * 0.30, h * 0.62);
        ctx.fillStyle = tex.samuraiSilk || '#141926';
        ctx.beginPath(); ctx.moveTo(-45, -120); ctx.lineTo(45, -120); ctx.lineTo(58, 45); ctx.lineTo(-58, 45); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#cfa47e'; ctx.beginPath(); ctx.arc(0, -152, 34, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4a4a4a'; ctx.beginPath(); ctx.arc(-4, -162, 34, Math.PI * 0.8, Math.PI * 2.1); ctx.fill();
        ctx.fillRect(-14, -198, 24, 12);
        ctx.fillStyle = '#141926'; ctx.fillRect(25, -110, 85, 24);
        ctx.restore();

        // El Pombero (höger)
        ctx.save(); ctx.translate(w * 0.68, h * 0.62);
        ctx.fillStyle = tex.pomberoFur || '#141311';
        ctx.beginPath(); ctx.ellipse(0, -45, 68, 85, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0e0d0b'; ctx.beginPath(); ctx.arc(-10, -135, 44, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffff8d'; ctx.beginPath(); ctx.arc(-24, -142, 10, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, -142, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d7ccc8'; ctx.fillRect(-52, -118, 30, 6);
        ctx.fillStyle = '#ff3d00'; ctx.beginPath(); ctx.arc(-54, -115, 5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Sake-flaskan <-> Artefakten byter plats i mitten
        const swap = Math.min(1, Math.max(0, (t - 2.2) / 3.5));
        const sakeX = (w * 0.40) + swap * (w * 0.22), artX = (w * 0.62) - swap * (w * 0.22), itemY = h * 0.44 + Math.sin(now * 0.008) * 6;

        ctx.save(); ctx.translate(sakeX, itemY);
        if (t >= 3.2 && t < 6.0) ctx.rotate(0.45);
        ctx.fillStyle = '#f5f5f5'; ctx.strokeStyle = '#1a237e'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(0, 12, 24, 32, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillRect(-9, -28, 18, 18); ctx.strokeRect(-9, -28, 18, 18);
        ctx.font = 'bold 22px serif'; ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.fillText('酒', 0, 20);
        ctx.restore();

        ctx.save(); ctx.translate(artX, itemY);
        ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(0, -14, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(-11, 0, 22, 26);
        ctx.fillStyle = '#d50000'; ctx.fillRect(-6, -17, 4, 4); ctx.fillRect(2, -17, 4, 4);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(8, 10, 14, 0.94)'; ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2.5;
        ctx.fillRect(w * 0.08, h - 108, w * 0.84, 88); ctx.strokeRect(w * 0.08, h - 108, w * 0.84, 88);
        ctx.textAlign = 'center';
        if (t < 3.4) {
            ctx.font = 'bold 18px serif'; ctx.fillStyle = '#ffd54f';
            ctx.fillText('🏮 SENSEI TAKEDA: 「待て、精霊よ… 日本の銘酒『酒』(Sake)がある。これをやろう。」', w * 0.5, h - 76);
            ctx.font = 'italic 16px Georgia'; ctx.fillStyle = '#ffffff';
            ctx.fillText('"Hörru, jag har faktiskt en flaska med Sake från Japan. Du kan få den i utbyte mot artefakten."', w * 0.5, h - 46);
        } else {
            ctx.font = 'bold 18px Georgia'; ctx.fillStyle = '#69f0ae';
            ctx.fillText('👹 EL POMBERO [GUARANÍ]: "¡Iporãiterei! ¡Kóva iporãve káñagui, che irũ hapone!" (*KLUNK*)', w * 0.5, h - 76);
            ctx.font = 'italic 16px Georgia'; ctx.fillStyle = '#ffd54f';
            ctx.fillText('"Risbrännvin?! Taget! Här, ta den gamla guld-artefakten!"', w * 0.5, h - 46);
        }
        ctx.restore(); ctx.restore();
    },

    // 3. FREDAGEN DEN 13:e SKRÄCK-CLOSEUP & CONQUISTADORENS 2-VINKLARS "MIERDA"
    triggerUsurperTakeover: function(who) {
        if (this.phase === 'takeover_anim') return;
        if (who === 'pombero') {
            this.startPomberoCanaSearchCutscene();
            return;
        }
        this.phase = 'takeover_anim';
        this.gauntlet.takeoverTriggeredForWave = true;
        if (this.enemy.type !== 'assassin') this.enemy = this.createGauntletEnemy('soldiers');

        this.hero.pose = 'idle'; this.hero.x = Math.min(210, this.hero.x);
        this.enemy.x = 520; this.enemy.pose = 'hurt';

        this.usurper = {
            who: 'conquistador', type: 'skeleton', name: 'Odöd Spansk Conquistador',
            x: 780, y: 432, facing: -1, pose: 'idle', variant: (this._forceVariant != null ? this._forceVariant : Math.floor(Math.random() * 4)),
            stage: 'horror_closeup', timer: 0, bloodCoat: 0.45, trophyType: null, injuries: this.freshInjuries()
        };
        this.targetZoom = 1.85; this.camFocusX = this.enemy.x - 10; this.camFocusY = this.enemy.y - 235;
        this.horrorCloseUpProgress = 0; this.darknessAlpha = 0.65;
        this.playZombieDragAndRattle();
        this.cinemaBanner = '👁️ ¡TERROR EN LA PENUMBRA!';
        this.cinemaSubBanner = 'Något ruttnande reser sig och släpar sig fram ur skuggorna bakom soldaten...';
    },

    updateTakeoverSequence: function(rawDt, now) {
        if (!this.usurper) return;
        const u = this.usurper;
        if (u.stage === 'pombero_cana_autopsy') {
            this.updatePomberoCanaSearch(rawDt, now);
            return;
        }
        u.timer += rawDt;
        if (u.stage === 'horror_closeup') {
            this.horrorCloseUpProgress = Math.min(1.0, u.timer / ((this.horrorCloseupDuration || 2.85) - 0.2));
            this.camShake = Math.pow(this.horrorCloseUpProgress, 2) * 8;
            const targetX = this.enemy.x + 72;
            u.x = 780 - (780 - targetX) * this.horrorCloseUpProgress;
            if (u.timer >= (this.horrorCloseupDuration || 2.85)) {
                u.stage = 'slaughter'; u.timer = 0; u.x = targetX; u.pose = 'fatality'; this.horrorCloseUpProgress = 0;
                this.targetZoom = 2.15; this.camFocusX = this.enemy.x + 22; this.camFocusY = this.enemy.y - 195;
                this.slowMoTimer = 3.6; this.slowMoFactor = 0.16; this.camShake = 48;
                this.playChokedAgonyScream(); this.playBoneCrunch(true); this.playGutRipSound();
                this.executeConquistadorUsurperKill(u.variant);
            }
        } else if (u.stage === 'slaughter') {
            if (this.updateSlaughterTimeline) this.updateSlaughterTimeline(rawDt, u);
            else if (Math.random() < 0.8) this.spawnGore(this.enemy.x, this.enemy.y - 185, 9, Math.random() < 0.25, -1);
            if (u.timer > (this.updateSlaughterTimeline ? this.slaughterDuration : 2.65)) {
                u.stage = 'throw_corpse'; u.timer = 0;
                this.corpsePile.push({ x: this.enemy.x - 35, y: 434, type: this.enemy.type, nation: this.enemy.nation });
            }
        } else if (u.stage === 'throw_corpse') {
            this.targetZoom = 1.0; this.darknessAlpha = 0;
            if (u.timer > 1.0) {
                this.gauntlet.takeoverTriggeredForWave = false;
                if (this.campaignBiome === 'pampas') {
                    // FIX #7: Pampas-kampanjen fortsätter till El Lobizón i stället för conquistadorer
                    this.gauntlet.stage = 'lobizon_boss';
                    this.enemy = this.createGauntletEnemy('lobizon_boss');
                    this.boleadorasAnim = null;
                    this.playGurgleScream && this.playGurgleScream(true);
                    this.addLog('🐺🌕 [EL LOBIZÓN]: Fullmånen bryter fram. Den sjunde sonen kastar av sig ponchon och växer till en varg stor som en tjur. Han vill ha DIG nu!', '#ffd54f');
                } else {
                    this.gauntlet.stage = 'conquistadors'; this.gauntlet.conquistadorKills = 0;
                    this.enemy = this.createGauntletEnemy('conquistadors'); this.enemy.x = u.x; this.enemy.injuries.bloodCoat = 0.72;
                }
                this.usurper = null; this.visceraChains = []; this.cinemaBanner = ''; this.cinemaSubBanner = '';
                this.slowMoTimer = 0; this.phase = 'fighting'; this.updateTopBars();
            }
        }
    },

    executeConquistadorUsurperKill: function(variant) {
        if (this.beginSlaughterTimeline) { this.beginSlaughterTimeline(variant); return; }
        this.enemy.hp = 0;
        if (variant === 0) {
            this.enemy.injuries.headSevered = true; this.enemy.injuries.spineSnapped = true;
            this.usurper.trophyType = 'head_spine'; this.xrayTimer = 1.45; this.xrayTargetPart = 'spine';
            this.cinemaBanner = '💀 ¡ARRANCAMIENTO DE COLUMNA!';
            this.cinemaSubBanner = 'Conquistadoren sliter ut skallen och hela ryggraden i slow-motion!';
        } else if (variant === 1) {
            this.enemy.injuries.ribsBroken = true; this.enemy.injuries.heartRipped = true;
            this.usurper.trophyType = 'beating_heart'; this.xrayTimer = 1.45; this.xrayTargetPart = 'ribs';
            this.cinemaBanner = '🫀 ¡CORAZÓN ARRANCADO!';
            this.cinemaSubBanner = 'Pansarhandsken slås rakt genom ryggen och ut genom bröstet med hjärtat i näven!';
        } else if (variant === 2) {
            this.enemy.injuries.splitInHalf = true; this.enemy.injuries.ribsBroken = true;
            this.xrayTimer = 1.45; this.xrayTargetPart = 'skull';
            this.cinemaBanner = '🪓 ¡PARTIDO EN DOS!';
            this.cinemaSubBanner = 'Soldaten klyvs vertikalt rakt itu!';
        } else {
            this.enemy.injuries.jawDislocated = true; this.enemy.injuries.disemboweled = true;
            this.usurper.trophyType = 'viscera_whip'; this.xrayTimer = 1.45; this.xrayTargetPart = 'gut';
            this.spawnVisceraExtraction(this.enemy.x - 10, this.enemy.y - 115, this.usurper.x - 30, this.usurper.y - 190, 'enemy');
            this.cinemaBanner = '🩸 ¡DESOLLADO Y DESTRIPADO!';
            this.cinemaSubBanner = 'Underkäken slits loss och tarmarna dras ut i extrem närbild!';
        }
        this.spawnGore(this.enemy.x, this.enemy.y - 195, 140, true, -1);
    },

    initRottenTrousersParticles: function(w, h) {
        this.clothShreds = []; this.dustMotes = [];
        for (let i = 0; i < 32; i++) {
            this.clothShreds.push({ x: w * 0.5 + (Math.random() - 0.5) * 160, y: h * 0.58 + (Math.random() - 0.5) * 90, vx: (Math.random() - 0.5) * 110, vy: -20 + Math.random() * 95, w: 22 + Math.random() * 32, h: 14 + Math.random() * 24, rot: Math.random() * 6, vrot: (Math.random() - 0.5) * 7, col: i % 2 === 0 ? '#3e2f22' : '#292018' });
        }
        for (let d = 0; d < 55; d++) {
            this.dustMotes.push({ x: w * 0.5 + (Math.random() - 0.5) * 170, y: h * 0.58 + (Math.random() - 0.5) * 90, vx: (Math.random() - 0.5) * 65, vy: -30 + Math.random() * 60, r: 4 + Math.random() * 10, alpha: 0.7 });
        }
    },

    updateEnemyFatalitySequence: function(rawDt) {
        this.enemyFatalityTimer += rawDt;
        if (this.enemyFatalityStage === 'gut_rip') {
            if (this.enemyFatalityTimer >= 2.5 && this.enemy.type === 'skeleton') {
                this.enemyFatalityStage = 'piss_side_stance';
                this.enemyFatalityTimer = 0;
                this.enemy.pose = 'piss_stance';
                this.enemy.x = this.hero.x + 82;
                this.visceraChains = []; this.xrayTimer = 0; this.slowMoTimer = 0;
                this.targetZoom = 1.52; this.camFocusX = this.enemy.x - 25; this.camFocusY = this.enemy.y - 145;
                this.playArmorCreakAndDryPuff();
                this.cinemaBanner = '🚽 ¡LA POSTURA DEL HIDALGO!';
                this.cinemaSubBanner = 'Conquistadoren kastar tarmarna, ställer sig över dig från sidan och intar piss-position...';
            } else if (this.enemyFatalityTimer >= 3.2 && this.enemy.type !== 'skeleton') {
                this.targetZoom = 1.0; this.phase = 'over';
            }
        } else if (this.enemyFatalityStage === 'piss_side_stance') {
            const t = this.enemyFatalityTimer;
            if (t > 2.0 && t < 2.15) this.playArmorCreakAndDryPuff();
            if (t >= 4.6) {
                this.enemyFatalityStage = 'piss_front_closeup';
                this.enemyFatalityTimer = 0;
                this.clothRippedSoundPlayed = false; this.mierdaSpoken = false;
                this.clothShreds = []; this.dustMotes = [];
                this.cinemaBanner = '🎥 [KAMERAN SKIFTAR FRAMIFRÅN]';
                this.cinemaSubBanner = 'Zombien sliter i sina murkna 1500-talsbyxor för att se varför inget kommer...';
            }
        } else if (this.enemyFatalityStage === 'piss_front_closeup') {
            const t = this.enemyFatalityTimer;
            if (t >= 1.15 && !this.clothRippedSoundPlayed) {
                this.clothRippedSoundPlayed = true;
                this.initRottenTrousersParticles(880, 480);
                this.playDryClothRip(); this.camShake = 10;
                this.cinemaBanner = '🍂 ¡TEXTILES PODRIDOS!';
                this.cinemaSubBanner = 'De murkna byxorna faller i bitar... och blottar ett helt tomt bäckenben!';
            }
            if (this.clothRippedSoundPlayed) {
                this.clothShreds.forEach(s => { s.x += s.vx * rawDt * 0.65; s.y += s.vy * rawDt * 0.65; s.vy += 240 * rawDt; s.rot += s.vrot * rawDt * 0.65; });
                this.dustMotes.forEach(d => { d.x += d.vx * rawDt * 0.65; d.y += d.vy * rawDt * 0.65; d.r += 12 * rawDt; d.alpha = Math.max(0, d.alpha - rawDt * 0.22); });
            }
            if (t >= 4.5 && !this.mierdaSpoken) {
                this.mierdaSpoken = true;
                this.playZombieMierdaVoice();
                this.cinemaBanner = '💬 « ...MIERDA. »';
                this.cinemaSubBanner = 'Vissa delar av kroppen ruttnade visst bort betydligt snabbare än andra...';
            }
            if (t >= 7.8) { this.targetZoom = 1.0; this.phase = 'over'; }
        }
    },

    drawZombieGroinFailCloseup: function(ctx, w, h, now, tex) {
        const t = this.enemyFatalityTimer;
        ctx.save();
        const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 40, w * 0.5, h * 0.5, w * 0.65);
        bgGrad.addColorStop(0, '#211b14'); bgGrad.addColorStop(1, '#020101');
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

        ctx.save();
        const headTilt = Math.min(0.62, Math.max(0, (t - 1.4) * 0.35));
        ctx.translate(w * 0.5, h * 0.23);
        ctx.fillStyle = tex.rustedArmor || '#2c3236';
        ctx.beginPath(); ctx.moveTo(-135, -90); ctx.lineTo(135, -90); ctx.lineTo(105, 55); ctx.lineTo(-105, 55); ctx.closePath(); ctx.fill();
        ctx.save(); ctx.translate(0, -35 + headTilt * 45); ctx.rotate(headTilt * 0.22);
        ctx.fillStyle = '#7d7258'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0d0303'; ctx.beginPath(); ctx.arc(-20, 8, 13, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(20, 8, 13, 0, Math.PI * 2); ctx.fill();
        const pupilSize = (t > 2.8) ? 3.2 : 7.5;
        ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(-20, 14, pupilSize, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(20, 14, pupilSize, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(0, -12, 58, Math.PI, 0); ctx.fill();
        ctx.restore(); ctx.restore();

        ctx.save(); ctx.translate(w * 0.5, h * 0.62);
        ctx.strokeStyle = '#cfc5a8'; ctx.lineWidth = 24; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-58, 25); ctx.lineTo(-72, 165); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(58, 25); ctx.lineTo(72, 165); ctx.stroke();
        ctx.fillStyle = '#d8ceb4'; ctx.strokeStyle = '#3e3526'; ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.ellipse(-56, -24, 48, 36, -0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(56, -24, 48, 36, 0.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#090605'; ctx.beginPath(); ctx.arc(0, 12, 34, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#cfc5a8'; ctx.lineWidth = 10; ctx.stroke();

        if (t < 1.15) {
            ctx.fillStyle = '#382a1e'; ctx.fillRect(-105, -62, 210, 130);
        }
        const shrug = Math.min(1, Math.max(0, (t - 3.2) * 1.1));
        ctx.fillStyle = '#37474f';
        ctx.beginPath(); ctx.arc(-48 - shrug * 92, 8 - shrug * 28, 22, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(48 + shrug * 92, 8 - shrug * 28, 22, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        this.clothShreds.forEach(s => { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.fillStyle = s.col; ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h); ctx.restore(); });
        this.dustMotes.forEach(d => { if (d.alpha > 0) { ctx.fillStyle = 'rgba(175,160,130,' + d.alpha + ')'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill(); } });

        if (t >= 4.5) {
            ctx.save();
            ctx.fillStyle = 'rgba(18, 12, 10, 0.94)'; ctx.strokeStyle = '#b5a078'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.ellipse(w * 0.68, h * 0.25, 128, 46, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.font = 'bold italic 34px Georgia'; ctx.textAlign = 'center'; ctx.fillStyle = '#ff8a80';
            ctx.fillText('"...Mierda."', w * 0.68, h * 0.25 + 11);
            ctx.restore();
        }
        ctx.restore();
    },

    drawHorrorFaceCloseup: function(ctx, w, h, now, tex) {
        const p = this.horrorCloseUpProgress;
        const trembleX = (Math.random() - 0.5) * (4 + p * 12), trembleY = (Math.random() - 0.5) * (4 + p * 10);
        ctx.save();
        ctx.fillStyle = '#090404'; ctx.fillRect(0, 0, w, h);

        // Halvruttnat zombieansikte som reser sig bakom soldatens axel
        ctx.save();
        const zScale = 0.72 + p * 0.42;
        ctx.translate(w * 0.66 - p * 48, h * 0.72 - p * 155);
        ctx.scale(zScale, zScale);
        ctx.globalAlpha = Math.min(1, p * 1.35);
        ctx.fillStyle = '#383226'; ctx.beginPath(); ctx.ellipse(0, 0, 78, 96, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#9e9275'; ctx.beginPath(); ctx.arc(20, 0, 58, -Math.PI * 0.5, Math.PI * 0.5); ctx.fill();
        ctx.fillStyle = '#080202'; ctx.beginPath(); ctx.arc(-28, -12, 20, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(28, -12, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(-28, -12, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(0, -28, 86, Math.PI, 0); ctx.fill();
        ctx.restore();

        // Soldatens förvridna ansikte med knäckt näsa
        ctx.save();
        ctx.translate(w * 0.31 + trembleX, h * 0.56 + trembleY);
        ctx.fillStyle = '#9c6c4b'; ctx.beginPath(); ctx.ellipse(0, 0, 108, 134, 0, 0, Math.PI * 2); ctx.fill();
        const eyeLookX = 10 + p * 12;
        for (let ex of [-44, 44]) {
            ctx.fillStyle = '#f5f0eb'; ctx.beginPath(); ctx.ellipse(ex, -28, 28, 19 + p * 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(ex + eyeLookX, -28, 5, 0, Math.PI * 2); ctx.fill();
        }
        // Knäckt näsa i vinkel + blod
        ctx.strokeStyle = '#2e150b'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(-22, -6); ctx.lineTo(14, 18); ctx.stroke();
        ctx.fillStyle = '#8b0000'; ctx.fillRect(-14, 18, 26, 45);
        ctx.fillStyle = '#260303'; ctx.beginPath(); ctx.ellipse(0, 68, 38 + p * 10, 14 + p * 34, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); ctx.restore();
    }
});
