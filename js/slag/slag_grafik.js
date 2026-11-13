// === SLAGFÄLTSMODUL 3: PANZER GENERAL II GRAPHICS ENGINE (slag_grafik.js) ===
// Renderar organiska, fotorealistiska/målade PG2-kartor för Sydamerika kombinerat med
// isometriska flermanna-truppsprites (infanterigrupper, kavallerister, kanonbatterier, pansarskepp)
// och klassiska Panzer General II-styrkeskyltar med 1864-flaggor!

window.SlagGrafik = {
    canvas: null,
    ctx: null,
    hexRadius: 42,
    originX: 62,
    originY: 56,
    showHexGrid: true,
    bgImages: {},
    unitSpriteCache: {},
    effects: [], // Krutröks- och explosionspartiklar vid strid!

    init: function(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.preloadTheaterMaps();
    },

    preloadTheaterMaps: function() {
        if (!window.SlagGeografi || !window.SlagGeografi.theaters) return;
        for (let k in window.SlagGeografi.theaters) {
            const th = window.SlagGeografi.theaters[k];
            if (th.bgImage && !this.bgImages[k]) {
                const img = new Image();
                img.onload = () => {
                    if (window.BattleController) window.BattleController.updateUI();
                };
                img.src = th.bgImage;
                this.bgImages[k] = img;
            }
        }
    },

    spawnCombatEffect: function(col, row) {
        const { x, y } = this.getHexCenter(col, row);
        this.effects.push({ x, y, frame: 0, maxFrames: 24 });
        const step = () => {
            if (this.effects.length === 0) return;
            this.effects.forEach(ef => ef.frame++);
            this.effects = this.effects.filter(ef => ef.frame < ef.maxFrames);
            if (window.BattleController) window.SlagGrafik.renderBoard(window.BattleController);
            if (this.effects.length > 0) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    },

    getHexCenter: function(col, row) {
        const r = this.hexRadius;
        const w = r * Math.sqrt(3);
        const x = this.originX + col * (r * 1.5);
        const y = this.originY + row * w + (col & 1 ? w / 2 : 0);
        return { x, y };
    },

    pixelToHex: function(px, py) {
        let best = null;
        let bestDist = 9999;
        for (let r = 0; r < window.SlagGeografi.rows; r++) {
            for (let c = 0; c < window.SlagGeografi.cols; c++) {
                const center = this.getHexCenter(c, r);
                const d = Math.hypot(px - center.x, py - center.y);
                if (d < this.hexRadius * 0.95 && d < bestDist) {
                    bestDist = d;
                    best = { col: c, row: r };
                }
            }
        }
        return best;
    },

    drawHexPolygon: function(ctx, cx, cy, radius) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const vx = cx + radius * Math.cos(angle);
            const vy = cy + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
    },

    renderBoard: function(state) {
        const ctx = this.ctx;
        const thKey = window.SlagGeografi.currentTheaterKey;
        const bgImg = this.bgImages[thKey];

        // 1. Rita den högupplösta organiska PG2-kartan i botten!
        if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
            ctx.drawImage(bgImg, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            ctx.fillStyle = '#344227';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 2. Rita subtilt Panzer General II hex-nät + aktiva förflyttnings- och eldgivningsrutor
        for (let row = 0; row < window.SlagGeografi.rows; row++) {
            for (let col = 0; col < window.SlagGeografi.cols; col++) {
                const { x, y } = this.getHexCenter(col, row);
                const key = `${col},${row}`;

                if (this.showHexGrid) {
                    this.drawHexPolygon(ctx, x, y, this.hexRadius);
                    ctx.strokeStyle = 'rgba(20, 18, 12, 0.22)';
                    ctx.lineWidth = 1.0;
                    ctx.stroke();
                }

                // PG2-stil: om en enhet är vald, skugga ner rutor som INTE kan nås svagt så de nåbara rutorna lyser upp naturligt!
                if (state.selectedUnit && state.selectedUnit.faction === 'PAR') {
                    const isSelectedHex = (state.selectedHex && state.selectedHex.col === col && state.selectedHex.row === row);
                    const isReachable = (state.reachableHexes && state.reachableHexes[key] !== undefined);
                    const isAttackable = (state.attackableHexes && state.attackableHexes[key]);

                    if (!isSelectedHex && !isReachable && !isAttackable) {
                        this.drawHexPolygon(ctx, x, y, this.hexRadius);
                        ctx.fillStyle = 'rgba(8, 10, 8, 0.36)';
                        ctx.fill();
                    }

                    if (isReachable) {
                        this.drawHexPolygon(ctx, x, y, this.hexRadius - 2);
                        ctx.strokeStyle = 'rgba(235, 225, 175, 0.55)';
                        ctx.lineWidth = 1.6;
                        ctx.stroke();
                    }

                    if (isAttackable) {
                        this.drawHexPolygon(ctx, x, y, this.hexRadius - 2);
                        ctx.fillStyle = 'rgba(200, 25, 15, 0.22)';
                        ctx.fill();
                        ctx.strokeStyle = '#ff3d00';
                        ctx.lineWidth = 2.5;
                        ctx.stroke();
                    }
                }

                // Klassisk skarp Panzer General II hex-markör runt den valda rutan!
                if (state.selectedHex && state.selectedHex.col === col && state.selectedHex.row === row) {
                    this.drawHexPolygon(ctx, x, y, this.hexRadius - 1);
                    ctx.strokeStyle = '#111111';
                    ctx.lineWidth = 3.5;
                    ctx.stroke();
                    this.drawHexPolygon(ctx, x, y, this.hexRadius - 2);
                    ctx.strokeStyle = '#e6c875';
                    ctx.lineWidth = 1.8;
                    ctx.stroke();
                }
            }
        }

        // 3. Rita ut alla enheter som isometriska Panzer General II-miniatyrer (med skugga, flaggbricka och PG-styrka)
        const alive = window.SlagData.activeUnits.filter(u => window.SlagData.getTotalPersonnel(u) > 0);
        alive.sort((a, b) => (a.stealthGuerrilla ? 1 : 0) - (b.stealthGuerrilla ? 1 : 0));

        alive.forEach(u => {
            const { x, y } = this.getHexCenter(u.col, u.row);
            const sharingEnemy = u.stealthGuerrilla && alive.some(other => other.id !== u.id && other.col === u.col && other.row === u.row);
            this.drawPG2UnitSprite(ctx, x, y, u, sharingEnemy);
        });

        // 4. Rita krutrök och krevader om en strid just utkämpats
        this.effects.forEach(ef => {
            const prog = ef.frame / ef.maxFrames;
            const rad = 10 + prog * 32;
            ctx.save();
            ctx.fillStyle = `rgba(255, 160, 40, ${(1 - prog) * 0.7})`;
            ctx.beginPath(); ctx.arc(ef.x, ef.y, rad * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = `rgba(190, 185, 175, ${(1 - prog) * 0.65})`;
            ctx.beginPath(); ctx.arc(ef.x - 6, ef.y - prog * 18, rad, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
    },

    // Ritar detaljerade isometriska Panzer General II-truppsprites (utan klumpig fyrkantig ram runt soldaterna!)
    drawPG2UnitSprite: function(ctx, x, y, u, isSharingHex) {
        if (isSharingHex) {
            x -= 14;
            y -= 10;
        }
        ctx.save();

        const isPar = u.faction === 'PAR';
        // Paraguay vänder sig åt höger (österut mot fienden), Alliansen vänder sig åt vänster!
        const dir = isPar ? 1 : -1;

        // Markskugga under förbandet (exakt som i PG2)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.beginPath();
        ctx.ellipse(x, y + 6, 24, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Om enheten har grävt skyttegravar (entrenchment > 0), rita sandsäckar/jordvall framför dem!
        if (u.entrenchment > 0 && !u.navalOnly) {
            ctx.fillStyle = '#6d5438';
            ctx.strokeStyle = '#382818';
            ctx.lineWidth = 1.2;
            for (let sb = -12; sb <= 12; sb += 8) {
                ctx.beginPath();
                ctx.ellipse(x + dir * 14, y + sb * 0.5, 4, 6, 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        // Rita själva 3D/isometriska figuren beroende på kategori
        ctx.save();
        ctx.translate(x, y - 4);
        ctx.scale(dir, 1);

        if (u.category === 'naval') {
            this.drawNavalSprite(ctx, u, isPar);
        } else if (u.category === 'artillery') {
            this.drawArtillerySprite(ctx, u, isPar);
        } else if (u.category === 'cavalry') {
            this.drawCavalrySprite(ctx, u, isPar);
        } else if (u.category === 'guerrilla') {
            this.drawGuerrillaSprite(ctx, u);
        } else {
            this.drawInfantrySquadSprite(ctx, u, isPar);
        }
        ctx.restore();

        // === PANZER GENERAL II STYRKESKYLT & NATIONALITETSFLAGGA UNDER ENHETEN ===
        const badgeY = y + 17;
        const pgStr = window.SlagData.getPGStrengthBadge(u);

        // Liten flagga till vänster om siffran (11x8 px)
        this.drawMiniFlag(ctx, x - 18, badgeY - 5, u.faction);

        // Styrkesiffra i PG2-stil (mörk metallram, vit/gul siffra beroende på om enheten redan agerat)
        ctx.fillStyle = u.hasAttacked ? 'rgba(35, 35, 35, 0.88)' : 'rgba(20, 18, 14, 0.92)';
        ctx.strokeStyle = u.suppression > 0 ? '#ff7043' : '#b8a678';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(x - 5, badgeY - 6, 20, 12, 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = u.hasAttacked ? '#9e9e9e' : '#ffffff';
        ctx.font = 'bold 10px Tahoma, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pgStr, x + 5, badgeY + 3);

        // Om nedhållen eller väl nedgrävd, visa liten indikator till höger
        if (u.entrenchment > 0) {
            ctx.fillStyle = '#ffd54f';
            ctx.font = 'bold 9px Tahoma, sans-serif';
            ctx.fillText('+' + u.entrenchment, x + 22, badgeY + 3);
        }

        ctx.restore();
    },

    drawMiniFlag: function(ctx, fx, fy, faction) {
        ctx.save();
        if (faction === 'PAR') {
            // Paraguay: Röd, Vit, Blå trikolor
            ctx.fillStyle = '#d32f2f'; ctx.fillRect(fx, fy, 11, 3);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(fx, fy+3, 11, 2.5);
            ctx.fillStyle = '#1976d2'; ctx.fillRect(fx, fy+5.5, 11, 3);
        } else if (faction === 'BRA') {
            // Kejsardömet Brasilien: Grön med gul diamant
            ctx.fillStyle = '#2e7d32'; ctx.fillRect(fx, fy, 11, 8.5);
            ctx.fillStyle = '#fdd835';
            ctx.beginPath();
            ctx.moveTo(fx+5.5, fy+1); ctx.lineTo(fx+10, fy+4.2); ctx.lineTo(fx+5.5, fy+7.5); ctx.lineTo(fx+1, fy+4.2);
            ctx.closePath(); ctx.fill();
        } else if (faction === 'ARG') {
            // Argentina: Ljusblå, Vit, Ljusblå
            ctx.fillStyle = '#4fc3f7'; ctx.fillRect(fx, fy, 11, 3);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(fx, fy+3, 11, 2.5);
            ctx.fillStyle = '#4fc3f7'; ctx.fillRect(fx, fy+5.5, 11, 3);
        } else {
            // Uruguay / Allierad
            ctx.fillStyle = '#ffffff'; ctx.fillRect(fx, fy, 11, 8.5);
            ctx.fillStyle = '#1565c0';
            ctx.fillRect(fx, fy+2, 11, 2);
            ctx.fillRect(fx, fy+5, 11, 2);
        }
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(fx, fy, 11, 8.5);
        ctx.restore();
    },

    // 1. INFANTERI: 4 detaljerade 1864-soldater i stridsformation med gevär & bajonetter (som i PG2!)
    drawInfantrySquadSprite: function(ctx, u, isPar) {
        const coatCol = isPar ? '#b71c1c' : (u.faction === 'ARG' ? '#1e3a5f' : '#1b4d2e'); // Paraguays berömda röda "blusa" vs Alliansens mörkblå/gröna
        const pantsCol = isPar ? '#f5f5f5' : '#cfd8dc';
        const offsets = [[-10, -5], [-2, -8], [-6, 4], [5, 1]];

        offsets.forEach(([ox, oy]) => {
            // Ben/byxor
            ctx.fillStyle = pantsCol;
            ctx.fillRect(ox - 2, oy + 2, 2, 6);
            ctx.fillRect(ox + 1, oy + 2, 2, 6);
            // Uniformsrock
            ctx.fillStyle = coatCol;
            ctx.fillRect(ox - 3, oy - 5, 6, 7);
            // Ansikte & Kepi/Shako-mössa
            ctx.fillStyle = '#d7a98c';
            ctx.beginPath(); ctx.arc(ox, oy - 7, 2.3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#22201e';
            ctx.fillRect(ox - 2.5, oy - 10, 5.5, 2.2);
            // Gevär med blänkande bajonett riktad framåt
            ctx.strokeStyle = '#4e342e';
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(ox - 2, oy - 1); ctx.lineTo(ox + 9, oy - 4); ctx.stroke();
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(ox + 9, oy - 4); ctx.lineTo(ox + 14, oy - 5.5); ctx.stroke();
        });
    },

    // 2. KAVALLERI: Detaljerade ryttare på galopperande hästar med sabel/lans (Acá Carayá!)
    drawCavalrySprite: function(ctx, u, isPar) {
        const horseCols = ['#5d4037', '#3e2723'];
        const offsets = [[-6, -3], [4, 3]];

        offsets.forEach(([ox, oy], idx) => {
            // Hästkropp, hals & huvud
            ctx.fillStyle = horseCols[idx % 2];
            ctx.beginPath(); ctx.ellipse(ox, oy + 2, 10, 4.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(ox + 6, oy + 1); ctx.lineTo(ox + 12, oy - 7); ctx.lineTo(ox + 15, oy - 5); ctx.lineTo(ox + 9, oy + 3);
            ctx.closePath(); ctx.fill();
            // Hästben
            ctx.strokeStyle = horseCols[idx % 2];
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(ox - 7, oy + 4); ctx.lineTo(ox - 10, oy + 10);
            ctx.moveTo(ox - 4, oy + 4); ctx.lineTo(ox - 3, oy + 10);
            ctx.moveTo(ox + 6, oy + 4); ctx.lineTo(ox + 9, oy + 10);
            ctx.moveTo(ox + 8, oy + 4); ctx.lineTo(ox + 12, oy + 9);
            ctx.stroke();

            // Ryttare (Röd Acá Carayá-uniform eller Allianskavalleri)
            ctx.fillStyle = isPar ? '#c62828' : '#1565c0';
            ctx.fillRect(ox - 3, oy - 8, 5, 7);
            ctx.fillStyle = '#d7a98c';
            ctx.beginPath(); ctx.arc(ox, oy - 10, 2.2, 0, Math.PI * 2); ctx.fill();
            // Kask / Vrålapshjälm med mässingskam
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(ox - 2.5, oy - 13, 5, 2.2);
            // Höjd kavallerisabel / lans
            ctx.strokeStyle = '#eceff1';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(ox + 2, oy - 6); ctx.lineTo(ox + 14, oy - 13); ctx.stroke();
        });
    },

    // 3. ARTILLERI: Isometrisk 1864-kanon (Ybycuí / Whitworth) med träekrade hjul, bronseldrör & servis
    drawArtillerySprite: function(ctx, u, isPar) {
        // Kanonlavett i trä (svans)
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-14, 6); ctx.lineTo(4, 0);
        ctx.stroke();

        // Kanonens eldrör (Brons för Ybycuí eller mörkt stål för Whitworth/Gatling)
        ctx.strokeStyle = (u.whitworths > 4) ? '#37474f' : '#d4af37';
        ctx.lineWidth = 5.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-2, -3); ctx.lineTo(15, -6);
        ctx.stroke();

        // Stora ekerhjul med järnring
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 2, 7.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#795548';
        ctx.lineWidth = 1;
        for (let a = 0; a < Math.PI; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(Math.cos(a)*7, 2 + Math.sin(a)*7);
            ctx.lineTo(-Math.cos(a)*7, 2 - Math.sin(a)*7);
            ctx.stroke();
        }

        // Artillerist bredvid pjäsen
        ctx.fillStyle = isPar ? '#b71c1c' : '#1b4d2e';
        ctx.fillRect(-12, -6, 5, 7);
        ctx.fillStyle = '#d7a98c';
        ctx.beginPath(); ctx.arc(-9.5, -8, 2.2, 0, Math.PI * 2); ctx.fill();
    },

    // 4. FLOTTA: Paddelångaren Tacuarí / Brasiliansk Pansarmonitor med skorstensrök
    drawNavalSprite: function(ctx, u, isPar) {
        // Skrov i stål/trä
        ctx.fillStyle = isPar ? '#3e2723' : '#263238';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-18, 2); ctx.lineTo(16, 2); ctx.lineTo(22, -3); ctx.lineTo(-16, -3);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Pansarkasematt / överbyggnad + hjulhus
        ctx.fillStyle = isPar ? '#d7ccc8' : '#546e7a';
        ctx.fillRect(-8, -7, 16, 4);
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath(); ctx.arc(0, 1, 5, Math.PI, 0); ctx.fill();

        // Skorsten med rökpelare
        ctx.fillStyle = '#212121';
        ctx.fillRect(-2, -14, 4, 7);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.65)';
        ctx.beginPath(); ctx.arc(-5, -16, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-9, -18, 4.5, 0, Math.PI * 2); ctx.fill();
    },

    // 5. GUARANÍ-GERILLA (Ka'aguy-Spökena): Smygande spejare med Ybycuí-compoundbågar
    drawGuerrillaSprite: function(ctx, u) {
        const offsets = [[-7, -3], [3, 2], [-2, -7]];
        offsets.forEach(([ox, oy]) => {
            ctx.fillStyle = '#2e4d23'; // Djungelkamouflage
            ctx.fillRect(ox - 3, oy - 4, 5, 7);
            ctx.fillStyle = '#c49068';
            ctx.beginPath(); ctx.arc(ox, oy - 6, 2.2, 0, Math.PI * 2); ctx.fill();
            // Spänd compoundbåge i stål/trä
            ctx.strokeStyle = '#ffd54f';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(ox + 4, oy - 2, 5, -Math.PI*0.45, Math.PI*0.45); ctx.stroke();
        });
    }
};

// ============================================================================
// === HISTORISKA STRIDSVINJETTER / MINIFILMER (window.SlagVignette) ===
// ============================================================================
// Visar en atmosfärisk 3,5-sekunders animerad 1860-talssekvens (i stil med Cándido López
// slagfältsmålningar) när artilleri, infanteri, kavalleri, flotta eller gerilla anfaller!
// Balanserad ton: varken glättigt underhållningsvåld eller överdrivet splatter, utan
// historiskt allvar med krutrök, salveld, kanonrekyl, lanschock och fallande soldater.

window.SlagVignette = {
    enabled: true,
    active: false,
    timer: 0,
    duration: 3.6,
    animId: null,
    lastTime: 0,
    sceneData: null,
    audioCtx: null,

    initAudio: function() {
        if (!this.audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.audioCtx = new AC();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
    },

    playSound: function(kind) {
        try {
            this.initAudio();
            if (!this.audioCtx) return;
            const now = this.audioCtx.currentTime;

            if (kind === 'cannon') {
                // Tungt dovt kanondunder + ekande rullning
                const osc = this.audioCtx.createOscillator();
                const g = this.audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(95, now);
                osc.frequency.exponentialRampToValueAtTime(22, now + 0.65);
                g.gain.setValueAtTime(0.55, now);
                g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
                osc.connect(g); g.connect(this.audioCtx.destination);
                osc.start(now); osc.stop(now + 0.72);

                const len = Math.floor(this.audioCtx.sampleRate * 0.55);
                const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate);
                const d = buf.getChannelData(0);
                for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioCtx.sampleRate * 0.18));
                const n = this.audioCtx.createBufferSource(); n.buffer = buf;
                const f = this.audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 340;
                const ng = this.audioCtx.createGain(); ng.gain.value = 0.5;
                n.connect(f); f.connect(ng); ng.connect(this.audioCtx.destination);
                n.start(now);
            } else if (kind === 'volley') {
                // Knattrande muskötsalva (flera skott tätt inpå varandra)
                for (let s = 0; s < 6; s++) {
                    const t0 = now + s * 0.035 + Math.random() * 0.02;
                    const len = Math.floor(this.audioCtx.sampleRate * 0.14);
                    const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate);
                    const d = buf.getChannelData(0);
                    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioCtx.sampleRate * 0.04));
                    const n = this.audioCtx.createBufferSource(); n.buffer = buf;
                    const f = this.audioCtx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 820 + Math.random() * 300;
                    const ng = this.audioCtx.createGain(); ng.gain.value = 0.22;
                    n.connect(f); f.connect(ng); ng.connect(this.audioCtx.destination);
                    n.start(t0);
                }
            } else if (kind === 'bugle') {
                // Kort signalhorn / trumpetstöt vid anfall eller kavallerichock
                const notes = [293.66, 440.0, 587.33];
                notes.forEach((freq, idx) => {
                    const osc = this.audioCtx.createOscillator();
                    const g = this.audioCtx.createGain();
                    osc.type = 'sawtooth';
                    const t0 = now + idx * 0.13;
                    osc.frequency.setValueAtTime(freq, t0);
                    const f = this.audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1100;
                    g.gain.setValueAtTime(0.12, t0);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
                    osc.connect(f); f.connect(g); g.connect(this.audioCtx.destination);
                    osc.start(t0); osc.stop(t0 + 0.24);
                });
            } else if (kind === 'hooves') {
                // Dova hovslag i marken
                for (let h = 0; h < 8; h++) {
                    const t0 = now + h * 0.11;
                    const osc = this.audioCtx.createOscillator();
                    const g = this.audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(110 + (h % 2) * 25, t0);
                    osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.06);
                    g.gain.setValueAtTime(0.18, t0);
                    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
                    osc.connect(g); g.connect(this.audioCtx.destination);
                    osc.start(t0); osc.stop(t0 + 0.08);
                }
            }
        } catch (e) {}
    },

    ensureOverlayDOM: function() {
        let modal = document.getElementById('vignette-modal');
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = 'vignette-modal';
        modal.style.cssText = `
            display: none; position: fixed; inset: 0; z-index: 2500;
            background: rgba(8, 6, 4, 0.72);
            align-items: center; justify-content: center;
            font-family: 'Georgia', serif; color: #f3e5ab;
            user-select: none;
        `;
        modal.innerHTML = `
            <div style="background: linear-gradient(145deg, #2a2017, #17110c); border: 3px solid #9c7a44; outline: 2px solid #1a120b; border-radius: 8px; padding: 12px 16px; width: 690px; max-width: 95vw; box-shadow: 0 18px 55px rgba(0,0,0,0.95);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #5c4528; padding-bottom:6px; margin-bottom:8px;">
                    <div>
                        <span id="vig-badge" style="background:#7a1c1c; color:#ffeb99; border:1px solid #d4af37; padding:2px 8px; border-radius:3px; font-size:0.75rem; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">STRIDSVINJETT</span>
                        <strong id="vig-title" style="font-size:1.05rem; color:#f3cf8a; margin-left:8px;">Anfall vid Estero Bellaco</strong>
                    </div>
                    <button onclick="window.SlagVignette.close()" style="background:#4a3520; border:1px solid #b58d58; color:#fff3db; padding:3px 10px; font-size:0.78rem; border-radius:4px; cursor:pointer;">Stäng [ESC / Klick]</button>
                </div>

                <div style="position:relative; border:2px solid #3d2b18; border-radius:4px; overflow:hidden; background:#120e0a;">
                    <canvas id="vig-canvas" width="650" height="270" style="width:100%; height:auto; display:block;"></canvas>
                    <div id="vig-subtitle" style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(transparent, rgba(10,7,5,0.92) 45%); padding:18px 14px 8px 14px; font-size:0.86rem; color:#e8dcc5; text-align:center; font-style:italic;"></div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:0.82rem; color:#cbb999;">
                    <div id="vig-casualties" style="font-weight:bold; color:#ffcc80;"></div>
                    <label style="cursor:pointer; display:flex; align-items:center; gap:5px; font-size:0.78rem;">
                        <input type="checkbox" id="vig-auto-chk" checked onchange="window.SlagVignette.setEnabled(this.checked)">
                        Visa minifilm automatiskt vid strid
                    </label>
                </div>
            </div>
        `;
        modal.addEventListener('mousedown', (e) => {
            if (e.target === modal) this.close();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.active) this.close();
        });
        document.body.appendChild(modal);
        return modal;
    },

    setEnabled: function(val) {
        this.enabled = !!val;
        const hdrChk = document.getElementById('hdr-vig-chk');
        if (hdrChk) hdrChk.checked = this.enabled;
        const modChk = document.getElementById('vig-auto-chk');
        if (modChk) modChk.checked = this.enabled;
    },

    // Kan anropas antingen automatiskt vid en riktig strid ELLER som förhandsvisning av en kategori!
    playCombatFilm: function(attacker, defender, terrainObj, res, forceShow) {
        if (!this.enabled && !forceShow) return;

        const modal = this.ensureOverlayDOM();
        modal.style.display = 'flex';
        this.active = true;
        this.timer = 0;
        this.lastTime = performance.now();

        const cat = attacker.category || 'infantry';
        const terrId = (terrainObj && terrainObj.id) ? terrainObj.id : 'plain';

        let badgeTxt = 'INFANTERISTRID (1864–1868)';
        let subTxt = 'Täta linjer ger eld genom krutröken innan befälen beordrar framryckning med fälld bajonett och machete.';
        if (cat === 'artillery') {
            badgeTxt = 'ARTILLERIDUELL & BOMBARDEMANG';
            subTxt = 'Tunga pjäser slungar granater och druvhagel i vida bågar över fältet medan servisen sliter i krutröken.';
        } else if (cat === 'cavalry') {
            badgeTxt = 'KAVALLERICHOCK MED LANS & SABEL';
            subTxt = 'Skvadronerna går från trav till full galopp genom röken med fällda lansar och höjda sablar.';
        } else if (cat === 'naval') {
            badgeTxt = 'FLODSTRID PÅ RÍO PARAGUAY';
            subTxt = 'Ångkorvetter och pansrade monitorer utväxlar bredsidor över det bruna flodvattnet.';
        } else if (cat === 'guerrilla') {
            badgeTxt = 'NATTLIG INFILTRATION I SKOG & TRÄSK';
            subTxt = 'Ljudlösa skuggor med Ybycuí-kompositbågar och machetes slår till inifrån fiendens egen gruppering.';
        }

        document.getElementById('vig-badge').textContent = badgeTxt;
        document.getElementById('vig-title').textContent = `${attacker.name} ⚔️ ${defender.name}`;
        document.getElementById('vig-subtitle').textContent = subTxt;
        document.getElementById('vig-casualties').innerHTML =
            `⚔️ Förluster i sammandrabbningen: <span style="color:#ff8a80;">-${res.defLoss} (${defender.name})</span> &nbsp;|&nbsp; <span style="color:#ffe082;">-${res.attLoss} (${attacker.name})</span> &nbsp;•&nbsp; <span style="color:#b3e5fc;">+${res.suppAdded} nedhållna i skydd</span>`;

        // Bygg partiklar och soldatpositioner för filmen
        this.sceneData = {
            cat: cat,
            terrId: terrId,
            attFaction: attacker.faction || 'PAR',
            defFaction: defender.faction || 'BRA',
            defEntrench: defender.entrenchment || 0,
            defLoss: res.defLoss || 25,
            attLoss: res.attLoss || 10,
            smokePuffs: [],
            projectiles: [],
            explosions: [],
            soundFlags: {}
        };

        // Ljud vid start
        if (cat === 'artillery' || cat === 'naval') {
            this.playSound('cannon');
        } else if (cat === 'cavalry') {
            this.playSound('bugle');
            this.playSound('hooves');
        } else {
            this.playSound('bugle');
        }

        if (this.animId) cancelAnimationFrame(this.animId);
        this.loop(this.lastTime);
    },

    // Snabbknapp för att provköra minifilmerna när som helst
    playDemoFilm: function(catType) {
        const demoAtt = {
            artillery: { name: 'Artilleribatteri Ybycuí (El Cristiano)', faction: 'PAR', category: 'artillery' },
            infantry:  { name: 'Batallón de Línea (Röda Blusar)', faction: 'PAR', category: 'infantry' },
            cavalry:   { name: 'Regimiento Acá Carayá (Elitkavalleri)', faction: 'PAR', category: 'cavalry' },
            naval:     { name: 'Ångkorvetten Tacuarí', faction: 'PAR', category: 'naval' },
            guerrilla: { name: "Ka'aguy-Spökena (Guaraní-gerilla)", faction: 'PAR', category: 'guerrilla' }
        }[catType] || { name: 'Batallón de Línea', faction: 'PAR', category: 'infantry' };

        const demoDef = { name: 'Kejsardömets Linhebataljon', faction: 'BRA', category: 'infantry', entrenchment: 2 };
        const terr = window.SlagGeografi ? window.SlagGeografi.getTerrainAt(4, 2) : { id: 'swamp', name: 'Estero Bellaco' };
        this.playCombatFilm(demoAtt, demoDef, terr, { defLoss: 42, attLoss: 12, suppAdded: 28 }, true);
    },

    close: function() {
        this.active = false;
        if (this.animId) cancelAnimationFrame(this.animId);
        const modal = document.getElementById('vignette-modal');
        if (modal) modal.style.display = 'none';
    },

    loop: function(now) {
        if (!this.active) return;
        const dt = Math.min(0.08, (now - this.lastTime) / 1000);
        this.lastTime = now;
        this.timer += dt;

        const canvas = document.getElementById('vig-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            this.renderScene(ctx, canvas.width, canvas.height, this.timer, dt);
        }

        if (this.timer >= this.duration) {
            this.close();
            return;
        }
        this.animId = requestAnimationFrame((t) => this.loop(t));
    },

    renderScene: function(ctx, w, h, t, dt) {
        const sd = this.sceneData;
        if (!sd) return;

        ctx.save();

        // Subtil kameraskakning vid explosioner eller salvor
        if ((sd.cat === 'artillery' && ((t > 0.2 && t < 0.5) || (t > 1.5 && t < 2.2))) ||
            (sd.cat === 'infantry' && t > 0.7 && t < 1.1) ||
            (sd.cat === 'cavalry' && t > 1.6 && t < 2.5)) {
            ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3);
        }

        // 1. HIMMEL & HORISONT (Cándido López oljemålnings-atmosfär)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.62);
        if (sd.cat === 'guerrilla') {
            skyGrad.addColorStop(0, '#0a1218');
            skyGrad.addColorStop(1, '#1e2f28');
        } else if (sd.terrId === 'mountain') {
            skyGrad.addColorStop(0, '#2c3e50');
            skyGrad.addColorStop(1, '#8fa3b0');
        } else {
            skyGrad.addColorStop(0, '#3a2d24');
            skyGrad.addColorStop(0.55, '#7a5a40');
            skyGrad.addColorStop(1, '#c99e67');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Sol / Måne i disen
        ctx.fillStyle = sd.cat === 'guerrilla' ? 'rgba(210, 230, 255, 0.22)' : 'rgba(255, 210, 130, 0.28)';
        ctx.beginPath();
        ctx.arc(w * 0.52, h * 0.32, 42, 0, Math.PI * 2);
        ctx.fill();

        // Bakgrundssilhuetter (Palmskog i Chaco/Mato Grosso, Andernas toppar eller flodbank)
        ctx.fillStyle = sd.terrId === 'mountain' ? '#263238' : '#1e2618';
        ctx.beginPath();
        ctx.moveTo(0, h * 0.62);
        for (let x = 0; x <= w; x += 40) {
            const peak = sd.terrId === 'mountain'
                ? Math.sin(x * 0.015) * 38 + Math.cos(x * 0.04) * 18
                : Math.sin(x * 0.03) * 8 + Math.cos(x * 0.08) * 5;
            ctx.lineTo(x, h * 0.56 - peak);
        }
        ctx.lineTo(w, h * 0.62);
        ctx.closePath();
        ctx.fill();

        // Yatay-palmer i horisonten om subtropisk terräng
        if (sd.terrId !== 'mountain') {
            ctx.strokeStyle = '#182013';
            ctx.lineWidth = 2;
            [90, 145, 290, 460, 535].forEach(px => {
                ctx.beginPath();
                ctx.moveTo(px, h * 0.56);
                ctx.lineTo(px + 3, h * 0.43);
                ctx.stroke();
                ctx.fillStyle = '#182013';
                ctx.beginPath();
                ctx.arc(px + 3, h * 0.43, 9, Math.PI, 0);
                ctx.fill();
            });
        }

        // 2. MARK / FLODVATTEN
        const groundY = h * 0.60;
        const grdGrad = ctx.createLinearGradient(0, groundY, 0, h);
        if (sd.cat === 'naval' || sd.terrId === 'river') {
            grdGrad.addColorStop(0, '#1e3c4c');
            grdGrad.addColorStop(1, '#0f222b');
        } else if (sd.terrId === 'swamp') {
            grdGrad.addColorStop(0, '#333d24');
            grdGrad.addColorStop(0.5, '#252e1b');
            grdGrad.addColorStop(1, '#1a1f14');
        } else {
            grdGrad.addColorStop(0, '#4a3b26');
            grdGrad.addColorStop(1, '#261d12');
        }
        ctx.fillStyle = grdGrad;
        ctx.fillRect(0, groundY, w, h - groundY);

        // Om försvararen har skyttegravar / jordskans (Trinchera) på högra sidan
        if (sd.defEntrench > 0 && sd.cat !== 'naval') {
            ctx.fillStyle = '#3e2c1c';
            ctx.strokeStyle = '#1f150c';
            ctx.lineWidth = 1.5;
            for (let sy = groundY + 18; sy < h - 18; sy += 16) {
                ctx.beginPath();
                ctx.ellipse(485, sy, 8, 10, -0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }

        // 3. RITA SJÄLVA STRIDSSEKVENSEN BEROENDE PÅ VAPENSLAG
        if (sd.cat === 'artillery') {
            this.renderArtillerySequence(ctx, w, h, groundY, t, sd);
        } else if (sd.cat === 'cavalry') {
            this.renderCavalrySequence(ctx, w, h, groundY, t, sd);
        } else if (sd.cat === 'naval') {
            this.renderNavalSequence(ctx, w, h, groundY, t, sd);
        } else if (sd.cat === 'guerrilla') {
            this.renderGuerrillaSequence(ctx, w, h, groundY, t, sd);
        } else {
            this.renderInfantrySequence(ctx, w, h, groundY, t, sd);
        }

        // 4. UPPDATERA OCH RITA KRUTRÖK & GRANATKREVADER
        sd.smokePuffs.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += p.grow * dt;
            p.alpha = Math.max(0, p.alpha - dt * 0.28);
            ctx.fillStyle = `rgba(${p.col}, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // 5. VINJETTRAM (Oljemålningsskugga i kanterna)
        const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.32, w / 2, h / 2, w * 0.58);
        vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vigGrad.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = vigGrad;
        ctx.fillRect(0, 0, w, h);

        ctx.restore();
    },

    spawnSmoke: function(sd, x, y, count, isFire) {
        for (let i = 0; i < count; i++) {
            sd.smokePuffs.push({
                x: x + (Math.random() - 0.5) * 14,
                y: y + (Math.random() - 0.5) * 10,
                vx: 12 + Math.random() * 22,
                vy: -8 - Math.random() * 14,
                r: 5 + Math.random() * 8,
                grow: 10 + Math.random() * 12,
                alpha: 0.65,
                col: (isFire && i === 0) ? '255, 165, 50' : '205, 198, 185'
            });
        }
    },

    // --- SEKVENS 1: ARTILLERIBOMBARDEMANG ---
    renderArtillerySequence: function(ctx, w, h, groundY, t, sd) {
        const isParAtt = sd.attFaction === 'PAR';
        const attCol = isParAtt ? '#b71c1c' : '#1b4d2e';
        const defCol = sd.defFaction === 'PAR' ? '#b71c1c' : (sd.defFaction === 'ARG' ? '#1e3a5f' : '#1b4d2e');

        // 3 kanoner på vänstra sidan som skjuter i sekvens vid t=0.25, t=0.55, t=0.85
        const fireTimes = [0.22, 0.52, 0.82];
        [0, 1, 2].forEach(idx => {
            const cy = groundY + 28 + idx * 30;
            const fireT = fireTimes[idx];
            const sinceFire = t - fireT;

            // Kanonrekyl bakåt precis efter skottet
            const recoil = (sinceFire > 0 && sinceFire < 0.35) ? Math.sin((sinceFire / 0.35) * Math.PI) * 14 : 0;
            const cx = 95 - recoil;

            if (sinceFire >= 0 && !sd.soundFlags['shot_' + idx]) {
                sd.soundFlags['shot_' + idx] = true;
                this.spawnSmoke(sd, cx + 28, cy - 8, 8, true);
                if (idx > 0) this.playSound('cannon');
            }

            // Rita kanonlavett, bronseldrör & hjul
            ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(cx - 18, cy + 8); ctx.lineTo(cx + 4, cy); ctx.stroke();
            ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 22, cy - 8); ctx.stroke();
            ctx.strokeStyle = '#2d1c10'; ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(cx + 2, cy + 3, 9, 0, Math.PI * 2); ctx.stroke();

            // Mynningseld
            if (sinceFire > 0 && sinceFire < 0.12) {
                ctx.fillStyle = '#ffeb3b';
                ctx.beginPath(); ctx.arc(cx + 28, cy - 8, 12, 0, Math.PI * 2); ctx.fill();
            }

            // 2 artillerister vid varje pjäs
            this.drawMiniSoldier(ctx, cx - 22, cy + 4, attCol, false, false, false);
            this.drawMiniSoldier(ctx, cx - 10, cy - 6, attCol, false, false, false);

            // Granatbana i luften (från t = fireT till t = fireT + 1.15)
            const flightDur = 1.15;
            const impactX = 525 + (idx - 1) * 28;
            const impactY = groundY + 32 + idx * 26;

            if (sinceFire > 0 && sinceFire < flightDur) {
                const p = sinceFire / flightDur;
                const sx = (cx + 24) + (impactX - (cx + 24)) * p;
                const sy = (cy - 8) + (impactY - (cy - 8)) * p - Math.sin(p * Math.PI) * 115;

                // Rökstrimma bakom granaten
                ctx.strokeStyle = 'rgba(220,210,195,0.45)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(sx - 18, sy + (p < 0.5 ? 8 : -8));
                ctx.stroke();

                // Granaten
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2); ctx.fill();
            } else if (sinceFire >= flightDur && sinceFire < flightDur + 0.6) {
                if (!sd.soundFlags['imp_' + idx]) {
                    sd.soundFlags['imp_' + idx] = true;
                    this.spawnSmoke(sd, impactX, impactY - 6, 12, true);
                    this.playSound('cannon');
                }
                // Uppslungade jordkockor och eld vid nedslaget!
                const ep = (sinceFire - flightDur) / 0.6;
                ctx.fillStyle = `rgba(255, 110, 20, ${1 - ep})`;
                ctx.beginPath();
                ctx.arc(impactX, impactY - ep * 18, 22 * (1 - ep * 0.4), 0, Math.PI * 2);
                ctx.fill();

                // Jordfontän
                ctx.fillStyle = '#2b1e12';
                for (let cl = -2; cl <= 2; cl++) {
                    ctx.fillRect(impactX + cl * 12 * ep, impactY - Math.sin(ep * Math.PI) * (35 - Math.abs(cl) * 6), 4, 4);
                }
            }
        });

        // Försvarande trupp på högra sidan som tar skydd / faller när granaterna slår ned (t > 1.45)
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 6; c++) {
                const dx = 510 + r * 26 + (c % 2) * 6;
                const dy = groundY + 20 + c * 15;
                const isHit = (t > 1.45 + r * 0.25) && ((c + r) % 3 === 0);
                const isCrouching = (t > 1.35) && !isHit;
                this.drawMiniSoldier(ctx, dx, dy, defCol, true, isHit, isCrouching);
            }
        }
    },

    // --- SEKVENS 2: INFANTERISALVA & BAJONETTFRAMRYCKNING ---
    renderInfantrySequence: function(ctx, w, h, groundY, t, sd) {
        const isParAtt = sd.attFaction === 'PAR';
        const attCol = isParAtt ? '#b71c1c' : '#1b4d2e';
        const defCol = sd.defFaction === 'PAR' ? '#b71c1c' : (sd.defFaction === 'ARG' ? '#1e3a5f' : '#1b4d2e');

        // Fas 1 (0 - 0.75s): Anfallarna marscherar fram och fäller gevär
        // Fas 2 (0.75s): Samlad muskötsalva! Krutrök sveper längs linjen
        // Fas 3 (1.35s): Försvararna besvarar elden
        // Fas 4 (1.85s - 3.5s): Anfallarna rycker fram genom röken i språngmarsch

        if (t >= 0.72 && !sd.soundFlags['att_volley']) {
            sd.soundFlags['att_volley'] = true;
            this.playSound('volley');
            for (let i = 0; i < 6; i++) {
                this.spawnSmoke(sd, 165, groundY + 22 + i * 15, 4, true);
            }
        }
        if (t >= 1.40 && !sd.soundFlags['def_volley']) {
            sd.soundFlags['def_volley'] = true;
            this.playSound('volley');
            for (let i = 0; i < 5; i++) {
                this.spawnSmoke(sd, 485, groundY + 24 + i * 16, 4, true);
            }
        }

        const chargeAdvance = t < 0.7 ? (t * 35) : (t > 1.75 ? 24 + (t - 1.75) * 115 : 24);

        // Rita fanbärare med Paraguays/Alliansens fana i täten!
        const flagX = 115 + chargeAdvance;
        const flagY = groundY + 48 + Math.sin(t * 10) * 2;
        this.drawMiniSoldier(ctx, flagX, flagY, attCol, false, false, false);
        ctx.strokeStyle = '#d4af37'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(flagX + 4, flagY); ctx.lineTo(flagX + 4, flagY - 34); ctx.stroke();
        if (isParAtt) {
            ctx.fillStyle = '#d32f2f'; ctx.fillRect(flagX + 4, flagY - 34, 18, 4);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(flagX + 4, flagY - 30, 18, 4);
            ctx.fillStyle = '#1976d2'; ctx.fillRect(flagX + 4, flagY - 26, 18, 4);
        } else {
            ctx.fillStyle = '#2e7d32'; ctx.fillRect(flagX + 4, flagY - 34, 18, 12);
        }

        // Anfallande 2 linjer (12 soldater)
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 6; c++) {
                const sx = 95 + r * 32 + chargeAdvance + (c % 2) * 5;
                const sy = groundY + 20 + c * 15;
                const fallen = (t > 1.50 && r === 1 && (c === 1 || c === 4));
                const actualX = fallen ? (95 + r * 32 + 24) : sx;
                const bob = (!fallen && (t < 0.7 || t > 1.75)) ? Math.sin(t * 16 + c) * 2 : 0;
                this.drawMiniSoldier(ctx, actualX, sy + bob, attCol, false, fallen, false);

                // Mynningsblixt vid salvan
                if (t > 0.72 && t < 0.85 && r === 1) {
                    ctx.fillStyle = '#ffd54f';
                    ctx.fillRect(actualX + 14, sy - 7, 10, 3);
                }
            }
        }

        // Försvarande linje på högersidan
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 6; c++) {
                const dx = 505 + r * 26;
                const dy = groundY + 20 + c * 15;
                const fallen = (t > 0.85 && (c === 0 || c === 2 || (t > 2.3 && c === 4)) && r === 0);
                this.drawMiniSoldier(ctx, dx, dy, defCol, true, fallen, sd.defEntrench > 0 && !fallen);
                if (t > 1.40 && t < 1.52 && r === 0 && !fallen) {
                    ctx.fillStyle = '#ffd54f';
                    ctx.fillRect(dx - 22, dy - 7, 10, 3);
                }
            }
        }
    },

    // --- SEKVENS 3: KAVALLERICHOCK (ACÁ CARAYÁ / LANSAR & SABLAR) ---
    renderCavalrySequence: function(ctx, w, h, groundY, t, sd) {
        const isParAtt = sd.attFaction === 'PAR';
        const attCol = isParAtt ? '#c62828' : '#1565c0';
        const defCol = sd.defFaction === 'PAR' ? '#b71c1c' : '#1b4d2e';

        // Försvararna ger en desperat salva vid t = 0.9s när ryttarna dundrar fram
        if (t >= 0.95 && !sd.soundFlags['def_shot']) {
            sd.soundFlags['def_shot'] = true;
            this.playSound('volley');
            for (let i = 0; i < 4; i++) {
                this.spawnSmoke(sd, 480, groundY + 25 + i * 18, 4, true);
            }
        }

        // Sammanstötning vid t = 1.75s
        if (t >= 1.75 && !sd.soundFlags['clash']) {
            sd.soundFlags['clash'] = true;
            this.playSound('volley');
        }

        // 5 galopperande kavallerister i kilformation
        const horseColors = ['#4e342e', '#3e2723', '#5d4037', '#2b1b12', '#6d4c41'];
        for (let i = 0; i < 5; i++) {
            const speed = 175 + (i % 2) * 18;
            const hx = 45 + (i % 2) * 35 + t * speed;
            const hy = groundY + 24 + i * 18;
            const gallopY = Math.sin(t * 22 + i * 1.4) * 3.5;

            // Dammoln bakom hovarna
            if (Math.random() < 0.35 && hx < 520) {
                sd.smokePuffs.push({
                    x: hx - 14, y: hy + 8, vx: -15, vy: -4, r: 4, grow: 6, alpha: 0.35, col: '150, 125, 95'
                });
            }

            ctx.save();
            ctx.translate(Math.min(545, hx), hy + gallopY);

            // Häst
            ctx.fillStyle = horseColors[i];
            ctx.beginPath(); ctx.ellipse(0, 0, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(8, -2); ctx.lineTo(16, -11); ctx.lineTo(20, -8); ctx.lineTo(12, 2); ctx.fill();

            // Galopperande ben
            const legPhase = Math.sin(t * 22 + i) * 6;
            ctx.strokeStyle = horseColors[i]; ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-9, 4); ctx.lineTo(-13 - legPhase, 12);
            ctx.moveTo(-5, 4); ctx.lineTo(-4 + legPhase, 12);
            ctx.moveTo(7, 4);  ctx.lineTo(11 + legPhase, 12);
            ctx.moveTo(10, 4); ctx.lineTo(14 - legPhase, 11);
            ctx.stroke();

            // Ryttare med Acá Carayá-kask och fälld lans/sabel
            ctx.fillStyle = attCol;
            ctx.fillRect(-4, -12, 7, 9);
            ctx.fillStyle = '#d7a98c';
            ctx.beginPath(); ctx.arc(0, -15, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#d4af37';
            ctx.fillRect(-3, -19, 6, 2.5);

            // Lans med röd-vit-blå vimpel eller blänkande sabel
            ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(2, -8); ctx.lineTo(24, -10); ctx.stroke();
            ctx.fillStyle = '#d32f2f';
            ctx.fillRect(16, -10, 5, 3);

            ctx.restore();
        }

        // Försvarande linje som bryts upp när kavalleriet slår in vid t > 1.75
        for (let c = 0; c < 6; c++) {
            const scatter = (t > 1.75) ? (t - 1.75) * ((c % 2 === 0) ? 32 : 14) : 0;
            const dx = 490 + (c % 2) * 18 + scatter;
            const dy = groundY + 20 + c * 15;
            const fallen = (t > 1.75 && (c === 1 || c === 2 || c === 4));
            this.drawMiniSoldier(ctx, dx, dy, defCol, true, fallen, false);
        }
    },

    // --- SEKVENS 4: SJÖSLAG PÅ FLODEN (TACUARÍ MOT MONITOR) ---
    renderNavalSequence: function(ctx, w, h, groundY, t, sd) {
        // Vattenkrusningar
        ctx.strokeStyle = 'rgba(180, 220, 240, 0.2)';
        ctx.lineWidth = 1.2;
        for (let wy = groundY + 12; wy < h; wy += 16) {
            ctx.beginPath();
            ctx.moveTo(40 + Math.sin(t * 2 + wy) * 15, wy);
            ctx.lineTo(w - 40, wy);
            ctx.stroke();
        }

        // Vänster fartyg (Paraguays hjulångare Tacuarí)
        const s1x = 135 + t * 14;
        const s1y = groundY + 52 + Math.sin(t * 3) * 2;
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.moveTo(s1x - 55, s1y); ctx.lineTo(s1x + 55, s1y); ctx.lineTo(s1x + 68, s1y - 14); ctx.lineTo(s1x - 50, s1y - 14);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#d7ccc8'; ctx.fillRect(s1x - 22, s1y - 24, 44, 10);
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(s1x - 4, s1y - 44, 8, 20);
        ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.arc(s1x, s1y - 2, 14, Math.PI, 0); ctx.fill();

        // Höger fartyg (Brasiliansk Pansarmonitor)
        const s2x = 505 - t * 8;
        const s2y = groundY + 56 + Math.cos(t * 3) * 2;
        ctx.fillStyle = '#263238';
        ctx.beginPath();
        ctx.moveTo(s2x - 60, s2y); ctx.lineTo(s2x + 60, s2y); ctx.lineTo(s2x + 50, s2y - 10); ctx.lineTo(s2x - 50, s2y - 10);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#37474f'; ctx.fillRect(s2x - 24, s2y - 22, 48, 12);
        ctx.fillStyle = '#111'; ctx.fillRect(s2x + 8, s2y - 38, 7, 16);

        // Bredsidor och vattenkaskader
        if (t > 0.35 && !sd.soundFlags['nav1']) {
            sd.soundFlags['nav1'] = true;
            this.spawnSmoke(sd, s1x + 35, s1y - 16, 10, true);
        }
        if (t > 1.35 && !sd.soundFlags['nav2']) {
            sd.soundFlags['nav2'] = true;
            this.playSound('cannon');
            this.spawnSmoke(sd, s2x - 25, s2y - 14, 12, true);
        }
        // Vattenpelare nära skroven
        if (t > 1.1 && t < 1.9) {
            const wp = 1 - Math.abs(t - 1.5) * 2.5;
            ctx.fillStyle = `rgba(220, 245, 255, ${Math.max(0, wp)})`;
            ctx.fillRect(s2x - 45, s2y - 35 * wp, 8, 35 * wp);
        }
    },

    // --- SEKVENS 5: GUARANÍ-GERILLA (LJUDLÖSA PILAR UR DIMMAN) ---
    renderGuerrillaSequence: function(ctx, w, h, groundY, t, sd) {
        // Lägereld hos fienden till höger
        const fx = 495, fy = groundY + 58;
        const fGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, 55 + Math.sin(t * 18) * 6);
        fGrad.addColorStop(0, 'rgba(255, 220, 100, 0.9)');
        fGrad.addColorStop(0.4, 'rgba(255, 90, 15, 0.45)');
        fGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = fGrad;
        ctx.beginPath(); ctx.arc(fx, fy, 60, 0, Math.PI * 2); ctx.fill();

        // Smygande Guaraní-krigare till vänster som skjuter salvor av stålpilar
        for (let i = 0; i < 5; i++) {
            const gx = 120 + (i % 2) * 28 + Math.min(45, t * 18);
            const gy = groundY + 22 + i * 16;
            this.drawMiniSoldier(ctx, gx, gy, '#2e4d23', false, false, true);

            // Flygande pilar
            const arrowStart = 0.3 + i * 0.18;
            const dtArr = t - arrowStart;
            if (dtArr > 0 && dtArr < 0.65) {
                const p = dtArr / 0.65;
                const ax = gx + (480 - gx) * p;
                const ay = gy - 8 - Math.sin(p * Math.PI) * 28;
                ctx.strokeStyle = '#ffd54f';
                ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(ax - 10, ay); ctx.lineTo(ax + 4, ay); ctx.stroke();
            }
        }

        // Fiendevakter runt lägerelden som överrumplas
        for (let c = 0; c < 5; c++) {
            const dx = 475 + (c % 2) * 32;
            const dy = groundY + 22 + c * 16;
            const fallen = t > (0.95 + c * 0.22);
            this.drawMiniSoldier(ctx, dx, dy, '#1b4d2e', true, fallen, false);
        }
    },

    drawMiniSoldier: function(ctx, x, y, coatCol, faceLeft, isFallen, isCrouching) {
        ctx.save();
        ctx.translate(x, y);
        if (faceLeft) ctx.scale(-1, 1);

        if (isFallen) {
            // Liggande/fallen soldat på marken (värdigt, utan splatt)
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.fillRect(-8, 2, 18, 4);
            ctx.fillStyle = coatCol;
            ctx.fillRect(-6, -1, 12, 5);
            ctx.fillStyle = '#d7a98c';
            ctx.beginPath(); ctx.arc(8, 1, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            return;
        }

        const crouchOff = isCrouching ? 4 : 0;
        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(0, 6, 5, 2, 0, 0, Math.PI * 2); ctx.fill();

        // Byxor
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(-2.5, 0 + crouchOff * 0.5, 2, 6 - crouchOff * 0.5);
        ctx.fillRect(0.5, 0 + crouchOff * 0.5, 2, 6 - crouchOff * 0.5);

        // Uniformsrock
        ctx.fillStyle = coatCol;
        ctx.fillRect(-3.5, -8 + crouchOff, 7, 8);

        // Huvud & Kepi
        ctx.fillStyle = '#d7a98c';
        ctx.beginPath(); ctx.arc(0, -10.5 + crouchOff, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1c1a17';
        ctx.fillRect(-3, -13.5 + crouchOff, 6.5, 2.2);

        // Gevär & bajonett
        ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-1, -4 + crouchOff); ctx.lineTo(10, -5 + crouchOff); ctx.stroke();
        ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(10, -5 + crouchOff); ctx.lineTo(15, -5.5 + crouchOff); ctx.stroke();

        ctx.restore();
    }
};
