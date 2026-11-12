// === DEL 5: ELITE MELEE GORE-DETALJER (elite_melee_gore.js) ===
// Ladda DENNA fil SIST (efter core), den lägger sig över de andra filerna.
// Innehåller: realistisk ryggrad, bultande hjärta, tarmar, ruttnande conquistador,
// bröstkorgshål, delad kropp samt en långsam, detaljerad amputation.
window.EliteMelee = window.EliteMelee || {};

(function () {
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    Object.assign(window.EliteMelee, {
        boneChips: [],
        amp: null,
        _neckT: 0, _chestT: 0,
        amputationSpeed: 0.55,   // 1 = original (~11 s), 0.55 = ~20 s. Lägre = längre
        slaughterDuration: 16,

        // ───────────────────────── LJUD ─────────────────────────
        _noiseBurst: function (dur, type, f0, f1, gain) {
            this.initAudio(); if (!this.audioCtx) return;
            const ac = this.audioCtx, now = ac.currentTime, len = Math.floor(ac.sampleRate * dur);
            const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.45));
            const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
            n.buffer = buf; f.type = type; f.frequency.setValueAtTime(f0, now); f.frequency.linearRampToValueAtTime(f1, now + dur);
            g.gain.setValueAtTime(gain, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
            n.connect(f); f.connect(g); g.connect(ac.destination); n.start(now);
        },
        playFleshSlice: function () { this._noiseBurst(0.32, 'bandpass', 3200, 900, 0.5); },
        playWetSquelch: function () { this._noiseBurst(0.5, 'lowpass', 700, 150, 0.7); },
        playArterialSpurt: function () { this._noiseBurst(0.22, 'lowpass', 1400, 380, 0.55); },
        playTendonSnap: function () {
            this.initAudio(); if (!this.audioCtx) return;
            const ac = this.audioCtx, now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
            o.type = 'triangle'; o.frequency.setValueAtTime(1500, now); o.frequency.exponentialRampToValueAtTime(240, now + 0.07);
            g.gain.setValueAtTime(0.45, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.1);
        },
        playLimbThud: function () {
            this.initAudio(); if (!this.audioCtx) return;
            const ac = this.audioCtx, now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(95, now); o.frequency.exponentialRampToValueAtTime(34, now + 0.2);
            g.gain.setValueAtTime(0.8, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 0.26);
            this._noiseBurst(0.2, 'lowpass', 500, 120, 0.4);
        },

        // ───────────────────────── RYGGRAD ─────────────────────────
        // Kotpelare med kotkroppar, diskar, taggutskott, tvärutskott, ryggmärg och fransig avrivning.
        drawSpine: function (ctx, x1, y1, x2, y2, now, count, opts) {
            opts = opts || {};
            const n = count || 12;
            const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
            const ux = dx / len, uy = dy / len, px = -uy, py = ux;
            const sag = (opts.sag != null ? opts.sag : 0.07) * len;
            const sway = Math.sin(now * 0.004) * (opts.sway || 0);
            const pos = t => { const k = Math.sin(t * Math.PI) * sag + sway * t; return { x: x1 + dx * t + px * k, y: y1 + dy * t + py * k }; };
            const trace = (a, b, steps) => { ctx.beginPath(); for (let i = 0; i <= steps; i++) { const p = pos(a + (b - a) * i / steps); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } };
            ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';

            // Ryggmärg (blekt rosa sladd) bakom kotorna
            ctx.strokeStyle = '#e2c3b8'; ctx.lineWidth = 3.4; trace(0, 1, 24); ctx.stroke();
            // Diskar (brosk) mellan kotorna
            ctx.strokeStyle = '#7e3a44'; ctx.lineWidth = 8; trace(0.02, 0.98, 24); ctx.stroke();

            for (let i = 0; i < n; i++) {
                const t = (i + 0.5) / n, p = pos(t), p2 = pos(Math.min(1, t + 0.02)), p0 = pos(Math.max(0, t - 0.02));
                const ang = Math.atan2(p2.y - p0.y, p2.x - p0.x);
                const sz = 5.2 + t * 4.2, th = (len / n) * 0.36;
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang);
                // tvärutskott
                ctx.fillStyle = '#d2c8ac'; ctx.strokeStyle = '#2b2318'; ctx.lineWidth = 1.1;
                ctx.beginPath(); ctx.moveTo(-th * 0.5, -sz); ctx.lineTo(th * 0.2, -sz - 6); ctx.lineTo(th * 0.6, -sz); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-th * 0.5, sz); ctx.lineTo(th * 0.2, sz + 6); ctx.lineTo(th * 0.6, sz); ctx.closePath(); ctx.fill(); ctx.stroke();
                // kotkropp
                const g = ctx.createLinearGradient(0, -sz, 0, sz);
                g.addColorStop(0, '#f2ecd6'); g.addColorStop(0.5, '#e0d6b8'); g.addColorStop(1, '#bfb394');
                ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, th, sz, 0, 0, TAU); ctx.fill(); ctx.stroke();
                // ringformig kotbåge + taggutskott
                ctx.fillStyle = '#6b1520'; ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, TAU); ctx.fill();
                ctx.strokeStyle = '#8e8368'; ctx.beginPath(); ctx.moveTo(-th * 0.4, 0); ctx.lineTo(-th - 3, 0); ctx.stroke();
                ctx.restore();
            }

            // Blodtäckning mot nedre delen
            ctx.strokeStyle = 'rgba(120,6,10,' + (opts.blood != null ? opts.blood : 0.5) + ')'; ctx.lineWidth = 11; trace(0.55, 1, 12); ctx.stroke();

            // Fransig ryggmärg + nervtrådar där den slitits av
            const e = pos(1);
            ctx.lineWidth = 2;
            for (let s = -2; s <= 2; s++) {
                const wob = Math.sin(now * 0.006 + s) * 3;
                ctx.strokeStyle = s % 2 ? '#e6cbc0' : '#c99a90';
                ctx.beginPath(); ctx.moveTo(e.x, e.y);
                ctx.quadraticCurveTo(e.x + px * (s * 6 + wob) + ux * 10, e.y + py * (s * 6 + wob) + uy * 10, e.x + px * (s * 9 + wob) + ux * (20 + Math.abs(s) * 5), e.y + py * (s * 9 + wob) + uy * (20 + Math.abs(s) * 5));
                ctx.stroke();
            }
            // Droppar
            const dr = (now * 0.09) % 34;
            ctx.fillStyle = '#9a0a12'; ctx.beginPath(); ctx.arc(e.x + ux * (22 + dr), e.y + uy * (22 + dr) + dr * 0.6, 2.4, 0, TAU); ctx.fill();
            ctx.restore();
        },

        // Kranium med hängande käke + hela ryggraden under (troféhållning)
        drawSkullWithSpine: function (ctx, x, y, now, scale, prog) {
            const s = scale || 1, swing = Math.sin(now * 0.004) * 0.12;
            ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(swing);
            const pr = (prog == null ? 1 : prog);
            if (pr > 0.04) this.drawSpine(ctx, 0, 14, 0, 14 + 146 * pr, now, Math.max(2, Math.round(15 * pr)), { sag: 0.05, sway: 6 * pr, blood: 0.6 });
            // skalle
            ctx.fillStyle = '#e8e0c8'; ctx.strokeStyle = '#2b2318'; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(0, 0, 15, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#0a0202'; ctx.beginPath(); ctx.arc(-5.5, 0, 4.2, 0, TAU); ctx.arc(5.5, 0, 4.2, 0, TAU); ctx.fill();
            ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(-2.4, 10); ctx.lineTo(2.4, 10); ctx.closePath(); ctx.fill();
            // hängande underkäke
            const jaw = 0.4 + Math.sin(now * 0.008) * 0.15;
            ctx.save(); ctx.translate(-9, 12); ctx.rotate(jaw);
            ctx.fillStyle = '#d6cdb2'; ctx.fillRect(0, -2, 19, 5); ctx.strokeRect(0, -2, 19, 5);
            ctx.fillStyle = '#f5f0de'; for (let k = 0; k < 4; k++) ctx.fillRect(2 + k * 4.2, -5, 2.6, 3.4);
            ctx.restore();
            // blodiga trasor av hals
            ctx.fillStyle = '#7a0a12'; ctx.beginPath(); ctx.ellipse(0, 15, 7, 3.2, 0, 0, TAU); ctx.fill();
            ctx.restore();
        },

        // ───────────────────────── HJÄRTA ─────────────────────────
        drawBeatingHeart: function (ctx, x, y, now, s) {
            s = s || 1;
            const ph = (now % 950) / 950;
            const beat = Math.pow(Math.max(0, Math.sin(ph * TAU)), 6) * 0.11 + Math.pow(Math.max(0, Math.sin(ph * TAU - 1.2)), 6) * 0.06;
            ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 + beat), s * (1 + beat * 0.8)); ctx.lineCap = 'round';

            // avslitna kärl (aorta, lungartär, hålvener)
            ctx.strokeStyle = '#6a0c18'; ctx.lineWidth = 10;
            ctx.beginPath(); ctx.moveTo(7, -15); ctx.quadraticCurveTo(12, -36, 24, -45); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-5, -16); ctx.quadraticCurveTo(-13, -34, -24, -38); ctx.stroke();
            ctx.strokeStyle = '#3b4f7e'; ctx.lineWidth = 7;
            ctx.beginPath(); ctx.moveTo(-14, -12); ctx.quadraticCurveTo(-26, -26, -34, -22); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(15, -10); ctx.quadraticCurveTo(28, -18, 33, -8); ctx.stroke();
            // sönderrivna öppningar
            ctx.fillStyle = '#2b0207';
            [[24, -45, 5.2], [-24, -38, 4.8], [-34, -22, 3.8], [33, -8, 3.6]].forEach(c => { ctx.beginPath(); ctx.arc(c[0], c[1], c[2], 0, TAU); ctx.fill(); });
            ctx.fillStyle = '#c41a2c';
            [[24, -45], [-24, -38]].forEach(c => { ctx.beginPath(); ctx.arc(c[0], c[1], 2.3 + beat * 12, 0, TAU); ctx.fill(); });

            // hjärtmuskeln
            const g = ctx.createRadialGradient(-8, -4, 3, 0, 8, 38);
            g.addColorStop(0, '#d9424f'); g.addColorStop(0.5, '#9a1424'); g.addColorStop(1, '#4a050e');
            ctx.fillStyle = g; ctx.strokeStyle = '#2a0308'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, -14);
            ctx.bezierCurveTo(-8, -27, -35, -19, -31, 6);
            ctx.bezierCurveTo(-28, 23, -10, 33, 0, 46);
            ctx.bezierCurveTo(10, 33, 29, 21, 31, 3);
            ctx.bezierCurveTo(33, -19, 8, -27, 0, -14);
            ctx.closePath(); ctx.fill(); ctx.stroke();

            // gult fett överst
            ctx.fillStyle = 'rgba(226,196,98,0.85)';
            ctx.beginPath(); ctx.moveTo(-26, -8); ctx.quadraticCurveTo(-10, -22, 0, -12); ctx.quadraticCurveTo(14, -24, 27, -6); ctx.quadraticCurveTo(10, -14, 0, -4); ctx.quadraticCurveTo(-12, -12, -26, -8); ctx.fill();
            // kranskärl
            ctx.strokeStyle = '#4a0a12'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-4, -8); ctx.quadraticCurveTo(-22, 4, -14, 22); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(4, -6); ctx.quadraticCurveTo(24, 6, 16, 26); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -4); ctx.quadraticCurveTo(2, 16, 0, 36); ctx.stroke();
            // glansig fuktreflex
            ctx.fillStyle = 'rgba(255,200,200,0.5)';
            ctx.beginPath(); ctx.ellipse(-14, 2, 5, 11, -0.4, 0, TAU); ctx.fill();
            // droppar
            for (let i = 0; i < 3; i++) {
                const dp = ((now * 0.12) + i * 23) % 70;
                ctx.fillStyle = '#a0000f'; ctx.beginPath(); ctx.ellipse(-8 + i * 9, 40 + dp, 2.2, 3.4, 0, 0, TAU); ctx.fill();
            }
            ctx.restore();
        },

        // ───────────────────────── TARMAR ─────────────────────────
        spawnVisceraExtraction: function (sx, sy, px, py, target) {
            const mk = (count, off) => Array.from({ length: count }, (_, i) => {
                const t = i / (count - 1);
                return { x: sx + (px - sx) * t, y: sy + (py - sy) * t + off, vx: 0, vy: 0, thick: 10, col: '#9e2a2b' };
            });
            this.visceraChains = [
                { anchorTarget: target || 'hero', w: 17, nodes: mk(28, 0), kind: 'gut', off: 0 },
                { anchorTarget: target || 'hero', w: 11, nodes: mk(22, 9), kind: 'gut', off: 9 },
                { anchorTarget: target || 'hero', w: 5, nodes: mk(18, -7), kind: 'mesentery', off: -7 }
            ];
            this.playWetSquelch();
        },

        drawVisceraChains: function (ctx) {
            if (!this.visceraChains || !this.visceraChains.length) return;
            const now = performance.now();
            ctx.save(); ctx.lineJoin = 'round';
            this.visceraChains.forEach((chain, ci) => {
                const n = chain.nodes; if (!n || n.length < 2) return;
                const a = n[0], b = n[n.length - 1], dist = Math.hypot(b.x - a.x, b.y - a.y);
                const slack = Math.max(0.15, 1.5 - dist / 230), W = chain.w || 16;
                const pts = n.map((p, i) => {
                    const t = i / (n.length - 1), env = Math.sin(t * Math.PI);
                    return { x: p.x + Math.sin(now * 0.004 + i * 0.7 + ci) * 3 * env, y: p.y + env * slack * (60 + ci * 12) + Math.sin(now * 0.005 + i + ci * 2) * 2 * env };
                });
                const path = () => {
                    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
                    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
                };
                if (chain.kind === 'mesentery') {
                    ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(230,196,120,0.85)'; ctx.lineWidth = W; path(); ctx.stroke();
                    ctx.strokeStyle = 'rgba(150,40,40,0.8)'; ctx.lineWidth = 1.5; path(); ctx.stroke();
                    return;
                }
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#2a0509'; ctx.lineWidth = W + 4; path(); ctx.stroke();           // kontur
                ctx.strokeStyle = ci ? '#b25a60' : '#a8434f'; ctx.lineWidth = W; path(); ctx.stroke(); // tarmvägg
                ctx.lineCap = 'butt'; ctx.setLineDash([3, 8 + ci * 2]);                              // segmentering
                ctx.strokeStyle = '#74222f'; ctx.lineWidth = W; path(); ctx.stroke(); ctx.setLineDash([]);
                ctx.lineCap = 'round';
                ctx.save(); ctx.translate(-W * 0.18, -W * 0.22);                                     // vått ljus
                ctx.strokeStyle = 'rgba(255,200,200,0.55)'; ctx.lineWidth = Math.max(2, W * 0.2); path(); ctx.stroke(); ctx.restore();
                // tarmvindlingar (bulor)
                for (let i = 2; i < pts.length - 2; i += 4) {
                    const p = pts[i];
                    ctx.fillStyle = ci ? '#bf6a70' : '#b34f5b'; ctx.strokeStyle = '#3a0a10'; ctx.lineWidth = 1.4;
                    ctx.beginPath(); ctx.ellipse(p.x, p.y, W * 0.78, W * 0.62, Math.sin(i) * 0.6, 0, TAU); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = 'rgba(255,210,210,0.5)'; ctx.beginPath(); ctx.ellipse(p.x - 3, p.y - 3, W * 0.22, W * 0.12, -0.5, 0, TAU); ctx.fill();
                }
                // droppar från lägsta punkten
                let low = pts[0]; pts.forEach(p => { if (p.y > low.y) low = p; });
                const dd = ((now * 0.1) + ci * 17) % 46;
                ctx.fillStyle = '#8a0810'; ctx.beginPath(); ctx.ellipse(low.x, low.y + W * 0.5 + dd, 2.4, 3.8, 0, 0, TAU); ctx.fill();
            });
            ctx.restore();
        },

        // ───────────────────────── ZOMBIE-DETALJER ─────────────────────────
        // Anropas i huvudets lokala koordinater (skallen = cirkel r22 vid 0,0)
        drawZombieHeadDecay: function (ctx, now) {
            const pulse = 0.55 + 0.45 * Math.sin(now * 0.01 + 1.3), flick = Math.random() < 0.03 ? 0.25 : 1;
            // ruttna fläckar
            ctx.fillStyle = 'rgba(70,96,48,0.4)';
            ctx.beginPath(); ctx.arc(-12, 7, 7, 0, TAU); ctx.arc(15, 9, 5, 0, TAU); ctx.fill();
            // sprickor i kraniet
            ctx.strokeStyle = '#2a2118'; ctx.lineWidth = 1.3; ctx.beginPath();
            ctx.moveTo(-15, -9); ctx.lineTo(-10, -3); ctx.lineTo(-13, 3); ctx.lineTo(-9, 8);
            ctx.moveTo(15, -8); ctx.lineTo(11, -2); ctx.lineTo(14, 4); ctx.stroke();
            // ögonhålor med glödande röd glöd
            for (const ex of [-5, 10]) {
                ctx.fillStyle = '#050101'; ctx.beginPath(); ctx.arc(ex, -4, 5.8, 0, TAU); ctx.fill();
                const g = ctx.createRadialGradient(ex, -4, 0.5, ex, -4, 8);
                g.addColorStop(0, 'rgba(255,70,70,' + (0.95 * pulse * flick) + ')'); g.addColorStop(1, 'rgba(255,0,0,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, -4, 8, 0, TAU); ctx.fill();
            }
            // näshål
            ctx.fillStyle = '#080202'; ctx.beginPath(); ctx.moveTo(3, 2); ctx.lineTo(0, 10); ctx.lineTo(7, 10); ctx.closePath(); ctx.fill();
            // hängande ögonglob på synnerven
            const sw = Math.sin(now * 0.004) * 3;
            ctx.strokeStyle = '#6a2a2a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.quadraticCurveTo(-8 + sw, 8, -9 + sw, 17); ctx.stroke();
            ctx.fillStyle = '#e8e2d2'; ctx.beginPath(); ctx.arc(-9 + sw, 19, 4.2, 0, TAU); ctx.fill();
            ctx.fillStyle = '#a01020'; ctx.beginPath(); ctx.arc(-9 + sw, 19.4, 2, 0, TAU); ctx.fill();
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(-9 + sw, 19.6, 0.9, 0, TAU); ctx.fill();
            // munhåla + övre tänder
            ctx.fillStyle = '#0b0303'; ctx.beginPath(); ctx.ellipse(5, 14, 13, 4.5, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#efe8d0'; for (let k = 0; k < 5; k++) ctx.fillRect(-4 + k * 4.4, 10.5, 2.8, 4.2);
            // hängande underkäke
            const ang = 0.5 + Math.sin(now * 0.004) * 0.1;
            ctx.save(); ctx.translate(-12, 11); ctx.rotate(ang);
            ctx.fillStyle = '#d9cfb4'; ctx.strokeStyle = '#2b2318'; ctx.lineWidth = 1; ctx.fillRect(0, -3, 29, 6.5); ctx.strokeRect(0, -3, 29, 6.5);
            ctx.fillStyle = '#f2ecd8'; for (let k = 0; k < 5; k++) ctx.fillRect(3 + k * 5, -6.6, 3, 4);
            ctx.restore();
            // saliv/slem
            ctx.strokeStyle = 'rgba(130,150,110,0.6)'; ctx.lineWidth = 1.6;
            for (let k = 0; k < 2; k++) {
                const dl = 8 + Math.sin(now * 0.006 + k) * 4;
                ctx.beginPath(); ctx.moveTo(8 + k * 6, 16); ctx.lineTo(10 + k * 6, 26 + dl); ctx.stroke();
            }
            // maskar i kinden
            ctx.strokeStyle = '#ebe5cc'; ctx.lineWidth = 1.8;
            for (let i = 0; i < 3; i++) {
                const x0 = 13 + i * 3.4, y0 = 11 + i * 1.5, w = Math.sin(now * 0.02 + i * 2) * 2.2;
                ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + 2 + w, y0 - 3, x0 + 4.5, y0 + w * 0.3); ctx.stroke();
            }
        },

        // Anropas i torsons lokala koordinater (origo = höft, y negativt uppåt)
        drawGoreTorso: function (ctx, f, isHero, now) {
            const inj = f.injuries || {};
            const isZ = (!isHero && f.type === 'skeleton');
            const pulse = 0.5 + 0.5 * Math.sin(now * 0.006);

            // — Trasiga trasor nederst —
            if (isZ) {
                ctx.fillStyle = '#3a2c20';
                for (let i = 0; i < 5; i++) {
                    const sx = -24 + i * 12, sw = Math.sin(now * 0.003 + i) * 3;
                    ctx.beginPath(); ctx.moveTo(sx, 3); ctx.lineTo(sx + 9, 3); ctx.lineTo(sx + 5 + sw, 20 + (i % 2) * 8); ctx.closePath(); ctx.fill();
                }
            }

            const open = inj.ribsBroken || inj.heartRipped;
            // — Frilagda revben på ruttnande conquistador —
            if (isZ && !open && !inj.splitInHalf) {
                const hole = [[-22, -92], [-8, -98], [10, -90], [20, -76], [14, -54], [2, -46], [-14, -52], [-24, -68]];
                ctx.save();
                ctx.beginPath(); hole.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
                ctx.fillStyle = '#1a0606'; ctx.fill(); ctx.clip();
                ctx.fillStyle = '#3a1212'; ctx.beginPath(); ctx.ellipse(-2, -64, 9, 6, 0.3, 0, TAU); ctx.fill();
                ctx.strokeStyle = '#d8cfb6'; ctx.lineWidth = 4.2; ctx.lineCap = 'round';
                for (let i = 0; i < 5; i++) { const y = -92 + i * 9; ctx.beginPath(); ctx.moveTo(-26, y + 5); ctx.quadraticCurveTo(0, y - 8, 26, y + 5); ctx.stroke(); }
                ctx.strokeStyle = '#b3a98c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-1, -100); ctx.lineTo(-1, -44); ctx.stroke();
                ctx.restore();
                ctx.beginPath(); hole.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
                ctx.strokeStyle = '#5a2e22'; ctx.lineWidth = 3; ctx.stroke();
                ctx.strokeStyle = '#4a2a22'; ctx.lineWidth = 4; ctx.lineCap = 'round';
                for (let i = 0; i < 3; i++) {
                    const sx = -10 + i * 11, sw = Math.sin(now * 0.003 + i * 1.3) * 4;
                    ctx.beginPath(); ctx.moveTo(sx, -50); ctx.quadraticCurveTo(sx + sw, -38, sx + sw * 1.6, -26 - i * 3); ctx.stroke();
                }
            }

            // — Uppsliten bröstkorg / bortrivet hjärta —
            if (open) {
                ctx.save();
                ctx.fillStyle = '#3a0409'; ctx.beginPath(); ctx.ellipse(0, -70, 25, 32, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#7a0a14'; ctx.beginPath(); ctx.ellipse(0, -66, 17, 22, 0, 0, TAU); ctx.fill();
                // utfällda revben
                ctx.strokeStyle = '#e9e1c8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
                for (let i = 0; i < 4; i++) {
                    const y = -90 + i * 12;
                    ctx.beginPath(); ctx.moveTo(-6, y); ctx.quadraticCurveTo(-24, y - 8, -36, y - 3 + i * 2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(6, y); ctx.quadraticCurveTo(24, y - 8, 36, y - 3 + i * 2); ctx.stroke();
                }
                // bröstbenet splittrat i mitten
                ctx.strokeStyle = '#cfc6a8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -96); ctx.lineTo(1, -44); ctx.stroke();
                if (inj.heartRipped) {
                    ctx.fillStyle = '#b00018';
                    ctx.beginPath(); ctx.arc(-7, -74, 3 + pulse * 3, 0, TAU); ctx.arc(8, -76, 3 + pulse * 3, 0, TAU); ctx.fill();
                    ctx.fillStyle = 'rgba(255,200,200,0.35)'; ctx.beginPath(); ctx.ellipse(-4, -58, 6, 3, 0, 0, TAU); ctx.fill();
                }
                ctx.restore();
            }

            // — Delad i två halvor —
            if (inj.splitInHalf) {
                const gap = 6 + Math.min(10, (f._splitT = (f._splitT || 0) + 0.012));
                ctx.fillStyle = '#220206'; ctx.beginPath(); ctx.moveTo(-1, -108); ctx.lineTo(gap * 0.5, -60); ctx.lineTo(gap, 6); ctx.lineTo(-gap, 6); ctx.lineTo(-gap * 0.5, -60); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = '#e4dcc2'; ctx.lineWidth = 4;
                for (let y = -100; y < -4; y += 9) { ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(3, y); ctx.stroke(); }
                ctx.fillStyle = '#a8434f';
                for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-gap * 0.5 + i * (gap * 0.35), -14 - (i % 2) * 6, 6, 0, TAU); ctx.fill(); }
                ctx.strokeStyle = '#6a0a12'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-gap, 6); ctx.lineTo(-gap * 0.5, -60); ctx.lineTo(-1, -108); ctx.moveTo(gap, 6); ctx.lineTo(gap * 0.5, -60); ctx.stroke();
            }

            // — Uppskuren buk —
            if (inj.disemboweled) {
                ctx.fillStyle = '#5a1a1a'; ctx.strokeStyle = '#2a0508'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(-6, -52); ctx.lineTo(8, -38); ctx.lineTo(-4, -30); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(22, -50); ctx.lineTo(10, -36); ctx.lineTo(24, -26); ctx.closePath(); ctx.fill(); ctx.stroke();
                for (let i = 0; i < 6; i++) {
                    const cx = 6 + Math.sin(i * 1.7) * 8, cy = -34 + i * 5 + Math.sin(now * 0.004 + i) * 1.5;
                    ctx.fillStyle = i % 2 ? '#b35560' : '#a8434f'; ctx.strokeStyle = '#3a0a10'; ctx.lineWidth = 1.3;
                    ctx.beginPath(); ctx.ellipse(cx, cy, 10, 6, Math.sin(i) * 0.6, 0, TAU); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = 'rgba(255,210,210,0.45)'; ctx.beginPath(); ctx.ellipse(cx - 3, cy - 2, 3.4, 1.7, -0.4, 0, TAU); ctx.fill();
                }
            }

            // — Avskuret huvud: halsstump med blottad ryggrad —
            if (!isHero && inj.neckTorn && !inj.headSevered) {
                ctx.fillStyle = '#7a0a14'; ctx.beginPath(); ctx.ellipse(3, -110, 14, 6, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#c4525c'; ctx.beginPath(); ctx.ellipse(2, -111, 9, 3.6, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#e4dcc2'; ctx.fillRect(-2, -113, 4, 3);
            }
            if (!isHero && inj.headSevered) {
                ctx.fillStyle = '#7a0a14'; ctx.beginPath(); ctx.ellipse(3, -112, 13, 6, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#c4525c'; ctx.beginPath(); ctx.ellipse(3, -113, 8, 3.6, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#e8dcdc'; ctx.beginPath(); ctx.arc(-3, -114, 2.6, 0, TAU); ctx.fill();
                ctx.fillStyle = '#080102'; ctx.beginPath(); ctx.arc(-3, -114, 1.2, 0, TAU); ctx.fill();
                this.drawSpine(ctx, 5, -111, 5, -138, now, 3, { sag: 0.02, sway: 2, blood: 0.7 });
                ctx.strokeStyle = '#c0101f'; ctx.lineWidth = 3 + pulse * 3;
                ctx.beginPath(); ctx.moveTo(8, -113); ctx.lineTo(13, -126 - pulse * 10); ctx.stroke();
            }
        },

        // Stump där armen skurits av (framarmen, fighter-lokala koordinater)
        drawArmStump: function (ctx, f, shoulderY, now) {
            const tex = this.texPatterns || {};
            const sx = 12, sy = shoulderY + 4, ex = 24, ey = shoulderY + 22, ang = Math.atan2(ey - sy, ex - sx);
            this.drawAnatomicalLimb(ctx, sx, sy, ex, ey, 26, 22, tex.rustedArmor || '#2c3236', 0.95);
            ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
            ctx.fillStyle = '#6a0c14'; ctx.beginPath(); ctx.ellipse(1, 0, 5.5, 12.5, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#bc4350'; ctx.beginPath(); ctx.ellipse(2, 0, 4, 9.4, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#efe8d4'; ctx.beginPath(); ctx.ellipse(3, 0, 2.8, 4.4, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = '#7a1a1a'; ctx.beginPath(); ctx.arc(3.2, 0, 1.3, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#e9d0c4'; ctx.lineWidth = 1.5;
            for (let i = -1; i <= 1; i++) { const sw = Math.sin(now * 0.006 + i * 2) * 2.2; ctx.beginPath(); ctx.moveTo(4, i * 5); ctx.quadraticCurveTo(10, i * 7 + sw, 14 + sw, i * 9 + 6); ctx.stroke(); }
            const bleed = f.injuries && f.injuries.stumpBleed || 0;
            if (bleed > 0.02) {
                ctx.fillStyle = 'rgba(190,0,20,' + (0.5 * bleed) + ')'; ctx.beginPath(); ctx.ellipse(2, 0, 5.4, 12, 0, 0, TAU); ctx.fill();
            }
            ctx.restore();
            // Blodstrimma nedåt längs armen
            ctx.strokeStyle = 'rgba(120,4,8,0.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(ex + 1, ey + 8); ctx.lineTo(ex + 5, ey + 30 + ((now * 0.03) % 8)); ctx.stroke();
        },

        // ───────────────────────── PARTIKLAR / UPPDATERING ─────────────────────────
        _spawnChips: function (x, y, n) {
            for (let i = 0; i < n; i++) this.boneChips.push({ x, y, vx: -60 - Math.random() * 190, vy: -220 - Math.random() * 160, rot: Math.random() * 6, vrot: (Math.random() - 0.5) * 20, s: 1.8 + Math.random() * 2.6, life: 2.2 });
        },

        _stumpWorld: function () {
            const e = this.enemy; return { x: e.x - 22, y: e.y - 226 };
        },

        updateGoreExtras: function (dt, now) {
            const uu = this.usurper;
            if (uu && uu.visStart && uu.pullProg != null && this.visceraChains && this.visceraChains.length) {
                const s0 = uu.visStart, en = uu.visEnd, pp = uu.pullProg;
                const ex = s0.x + (en.x - s0.x) * pp, ey = s0.y + (en.y - s0.y) * pp;
                this.visceraChains.forEach(ch => { const n = ch.nodes.length; ch.nodes.forEach((nd, i) => { const k = i / (n - 1); nd.x = s0.x + (ex - s0.x) * k; nd.y = s0.y + (ey - s0.y) * k + (ch.off || 0); }); });
            }
            // benflisor
            this.boneChips.forEach(c => { c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 900 * dt; c.rot += c.vrot * dt; c.life -= dt; if (c.y > 434) { c.y = 434; c.vy *= -0.2; c.vx *= 0.5; c.vrot = 0; } });
            this.boneChips = this.boneChips.filter(c => c.life > 0);

            // avskurna lemmar
            this.severedLimbs.forEach(l => {
                l.twitch = Math.max(0, (l.twitch || 0) - dt * 0.14);
                if (l.rest) { l.pool = Math.min(1, (l.pool || 0) + dt * 0.22); return; }
                l.x += l.vx * dt; l.y += l.vy * dt; l.vy += 950 * dt; l.rot += l.vrot * dt;
                if (l.y >= 430) {
                    l.y = 430; l.bounces = (l.bounces || 0) + 1;
                    this.playLimbThud(); this.camShake = Math.max(this.camShake, 9);
                    for (let k = 0; k < 8; k++) this.groundBlood.push({ x: l.x + (Math.random() - 0.5) * 50, y: 436, r: 2 + Math.random() * 5, col: '#6a0000' });
                    l.vy *= -0.28; l.vx *= 0.5; l.vrot *= 0.4;
                    if (Math.abs(l.vy) < 45 || l.bounces > 3) { l.rest = true; l.vx = l.vy = l.vrot = 0; l.pool = 0.1; }
                }
            });

            // pulserande blodsprut ur stympar/halsstumpar/bröstkorgshål på fienden
            const e = this.enemy;
            if (e && e.injuries) {
                const inj = e.injuries;
                if (inj.headSevered && this.phase !== 'idle') {
                    this._neckT += dt;
                    if (this._neckT < 6 && Math.random() < dt * 10 * (1 - this._neckT / 6)) this.spawnGore(e.x - 3, e.y - 262, 5, false, Math.random() < 0.5 ? -1 : 1);
                } else this._neckT = 0;
                if (inj.heartRipped) {
                    this._chestT += dt;
                    if (this._chestT < 5 && Math.random() < dt * 8 * (1 - this._chestT / 5)) this.spawnGore(e.x - 4, e.y - 215, 4, false, -1);
                } else this._chestT = 0;
                if (inj.armSevered && inj.stumpBleed > 0) {
                    inj.stumpBleed = Math.max(0, inj.stumpBleed - dt * 0.07);
                    inj._spurtT = (inj._spurtT || 0) + dt;
                    const period = 0.55 + (1 - inj.stumpBleed) * 0.9;
                    if (inj._spurtT >= period) {
                        inj._spurtT = 0; const w = this._stumpWorld();
                        this.spawnGore(w.x, w.y, Math.round(8 + 14 * inj.stumpBleed), false, -1);
                        this.playArterialSpurt();
                    }
                }
            }
        },

        // ───────────────────────── AMPUTATION ─────────────────────────
        startAmputationDemo: function () {
            if (!this.active) return;
            if (this.phase !== 'fighting' && this.phase !== 'dizzy') return;
            if (!this.enemy || this.enemy.type !== 'skeleton') {
                this.gauntlet.stage = 'conquistadors';
                this.enemy = this.createGauntletEnemy('conquistadors');
            }
            this.enemy.injuries.armSevered = false; this.enemy.injuries.stumpBleed = 0;
            this.severedLimbs = [];
            this.startAmputation();
        },

        startAmputation: function () {
            if (this.phase === 'amputation_anim') return;
            this.phase = 'amputation_anim';
            this.amp = { t: 0, step: 0, chops: 0, spurtT: 0, spurts: 0 };
            this.hero.pose = 'idle'; this.hero.x = this.enemy.x - 135;
            this.enemy.pose = 'hurt'; this.enemy.hp = Math.max(1, this.enemy.hp);
            const w = this._stumpWorld();
            this.targetZoom = 2.6; this.camFocusX = w.x - 6; this.camFocusY = w.y + 6;
            this.cinemaBanner = '✂️ ¡AMPUTACIÓN LENTA!';
            this.cinemaSubBanner = 'Klingan lyfts över conquistadorens högra överarm...';
            this.addLog('✂️🦴 [AMPUTATION]: Du griper tag i conquistadorens arm och lyfter klingan – det här kommer ta ett tag.', '#ff8a80');
            this.updateTopBars();
        },

        updateAmputation: function (dt, now) {
            const a = this.amp; if (!a) return;
            a.t += dt * (this.amputationSpeed || 1); const t = a.t, w = this._stumpWorld();
            this.camFocusX += ((w.x - 6) - this.camFocusX) * Math.min(1, dt * 3);
            this.camFocusY += ((w.y + 6) - this.camFocusY) * Math.min(1, dt * 3);

            if (a.step === 0 && t >= 0.5) {
                a.step = 1; this.playFleshSlice(); this.camShake = 10;
                this.spawnGore(w.x, w.y, 8, false, -1);
                this.cinemaSubBanner = 'Första snittet – huden ger vika...';
            }
            if (a.step === 1 && t >= 1.2) {
                a.step = 2; this.playWetSquelch(); this.spawnGore(w.x, w.y, 14, false, -1);
                this.cinemaSubBanner = 'Såret gapar upp. Blodet välver upp ur snittet.';
            }
            if (a.step === 2 && t >= 2.0) {
                a.step = 3; this.playFleshSlice(); this.camShake = 8;
                this.cinemaSubBanner = 'Klingan skär sig genom muskelfibrerna, en och en...';
            }
            if (a.step === 3 && t >= 2.8) {
                a.step = 4; this.playTendonSnap();
                this.cinemaSubBanner = 'Senorna sträcks – och släpper med ett *SNAP*.';
                this.enemy.x += 4;
            }
            if (a.step === 4 && t >= 3.5) {
                a.step = 5; this.playTendonSnap();
                this.cinemaSubBanner = 'Benet ligger bart. Vitt och glänsande.';
                this.xrayTimer = 1.2; this.xrayTargetPart = 'arm';
            }
            const chopTimes = [3.9, 4.7, 5.5];
            if (a.chops < 3 && t >= chopTimes[a.chops]) {
                a.chops++; this.playBoneCrunch(true); this.camShake = 18 + a.chops * 5;
                this._spawnChips(w.x, w.y, 8 + a.chops * 3); this.spawnGore(w.x, w.y, 18, false, -1);
                this.cinemaSubBanner = ['*KNAK!* Första hugget sprickar benet.', '*KRRRK!* Benet flisas och benmärgen sprutar.', '*KNASK!* Bara en tunn bit kvar...'][a.chops - 1];
            }
            if (a.step === 5 && t >= 6.3) {
                a.step = 6;
                this.playTendonSnap(); this.playBoneCrunch(true); this.playGurgleScream(true); this.camShake = 34;
                this.enemy.injuries.armSevered = true; this.enemy.injuries.stumpBleed = 1.0;
                this.severedLimbs.push({ x: w.x, y: w.y, vx: -170 - Math.random() * 60, vy: -300, rot: 2.3, vrot: -7, twitch: 1, rest: false, pool: 0, bounces: 0 });
                this._spawnChips(w.x, w.y, 14); this.spawnGore(w.x, w.y, 70, true, -1);
                this.cinemaBanner = '💀 ¡BRAZO ARRANCADO!';
                this.cinemaSubBanner = 'Armen lossnar och singlar iväg medan blodet sprutar i takt med pulsen.';
                this.addLog('🩸🦾 [ARMEN AV]: *SNAP!* Armen lossnar och landar med en blöt duns. Conquistadoren stirrar på stumpen.', '#ff5252');
            }
            if (a.step === 6 && t >= 8.2) {
                a.step = 7;
                this.speakLine('mi... brazo...', 'es-ES', 0.1, 0.5);
                this.cinemaBanner = '💬 « ...MI BRAZO. »';
                this.cinemaSubBanner = 'Han tittar på stumpen. Sedan på dig. Sedan på armen på marken.';
            }
            if (t >= 10.8) {
                this.targetZoom = 1.0; this.cinemaBanner = ''; this.cinemaSubBanner = '';
                this.camFocusX = 440; this.camFocusY = 260;
                this.phase = 'fighting'; this.amp = null; this.updateTopBars();
            }
        },

        // ───────────────────────── VÄRLDS-OVERLAYS ─────────────────────────
        _drawBlade: function (ctx, cx, cy, off) {
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.62);
            const g = ctx.createLinearGradient(-130, 0, 0, 0);
            g.addColorStop(0, 'rgba(207,216,220,0)'); g.addColorStop(0.7, '#cfd8dc'); g.addColorStop(1, '#ffffff');
            ctx.fillStyle = g; ctx.translate(-off, -off * 0.8);
            ctx.beginPath(); ctx.moveTo(-130, -3); ctx.lineTo(-4, -3); ctx.lineTo(4, 0); ctx.lineTo(-4, 3); ctx.lineTo(-130, 3); ctx.closePath(); ctx.fill();
            ctx.restore();
        },

        _drawAmputationWound: function (ctx, now) {
            const a = this.amp; if (!a) return;
            const t = a.t, w = this._stumpWorld();
            const open = clamp((t - 1.2) * 3.0, 0, 7) + (a.chops * 1.3);
            // klinga (svepet in, hugg, tillbaka)
            if (t < 0.9) {
                const u = clamp(t / 0.5, 0, 1); this._drawBlade(ctx, w.x, w.y, 70 * (1 - u));
            } else if (t >= 2.0 && t < 3.0) {
                this._drawBlade(ctx, w.x, w.y, 6 + Math.sin((t - 2) * 6) * 14);
            } else {
                const times = [3.9, 4.7, 5.5, 6.3];
                for (const t0 of times) {
                    const d = t - (t0 - 0.25);
                    if (d > 0 && d < 0.65) { const off = d < 0.25 ? 60 * (1 - d / 0.25) : (d < 0.4 ? 0 : 60 * ((d - 0.4) / 0.25)); this._drawBlade(ctx, w.x, w.y, off); }
                }
            }
            if (t < 0.5) return;
            ctx.save(); ctx.translate(w.x, w.y); ctx.rotate(2.1 + Math.PI / 2);
            if (open > 0.2) {
                ctx.fillStyle = '#4a060c'; ctx.beginPath(); ctx.ellipse(0, 0, 13.5, open + 1.5, 0, 0, TAU); ctx.fill();
                ctx.strokeStyle = '#c47a70'; ctx.lineWidth = 1.4; ctx.stroke();
                if (t > 1.6) { // muskel
                    ctx.fillStyle = '#a3202c'; ctx.beginPath(); ctx.ellipse(0, 0, 11, open * 0.82, 0, 0, TAU); ctx.fill();
                    ctx.strokeStyle = 'rgba(232,150,150,0.8)'; ctx.lineWidth = 1;
                    for (let k = -4; k <= 4; k++) { const bow = Math.sin(now * 0.004 + k) * 0.6 + (t > 2.0 ? 2 : 0); ctx.beginPath(); ctx.moveTo(k * 2.4, -open * 0.78); ctx.quadraticCurveTo(k * 2.4 + bow, 0, k * 2.4, open * 0.78); ctx.stroke(); }
                }
                if (t > 2.6 && t < 3.5) { // sträckta senor
                    ctx.strokeStyle = '#f3ead8'; ctx.lineWidth = 1.6;
                    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 4, -open * 0.6); ctx.lineTo(k * 4 + (t - 2.6) * 2, open * 0.6); ctx.stroke(); }
                }
                if (t > 3.5) { // blottat ben
                    const crack = a.chops;
                    ctx.fillStyle = '#efe8d4'; ctx.beginPath(); ctx.ellipse(0, 0, 6.2, Math.max(2, open * 0.5), 0, 0, TAU); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(-2, -1, 1.8, open * 0.22, 0, 0, TAU); ctx.fill();
                    if (crack) { ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-5, -1); ctx.lineTo(-1, 1); ctx.lineTo(2, -1.5); if (crack > 1) { ctx.lineTo(5, 1); ctx.moveTo(-1, 1); ctx.lineTo(-2, 4); } ctx.stroke(); }
                    if (crack >= 2) { ctx.fillStyle = '#7a1a1a'; ctx.beginPath(); ctx.ellipse(0, 0, 2.6, open * 0.3, 0, 0, TAU); ctx.fill(); }
                }
                // blod som väller över kanterna + rinner nedåt
                ctx.fillStyle = 'rgba(160,0,18,' + (0.35 + 0.2 * Math.sin(now * 0.01)) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, 13, open * 0.9, 0, 0, TAU); ctx.fill();
            }
            ctx.restore();
            ctx.strokeStyle = 'rgba(110,4,8,0.9)'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(w.x - 4, w.y + 10); ctx.lineTo(w.x - 7, w.y + 10 + Math.min(34, (t - 1.2) * 12)); ctx.stroke();
        },

        drawGoreWorldOverlays: function (ctx, now) {
            // trofé i erövrarens hand
            const u = this.usurper;
            if (u && u.trophyType && u.stage !== 'horror_closeup' && u.pose === 'fatality') {
                const hx = u.x - 108, hy = u.y - 232, k = clamp(((u.timer || 0) - (u.trophyT0 || 0)) * 2, 0, 1);
                ctx.save(); ctx.globalAlpha = k;
                if (u.trophyType === 'beating_heart') this.drawBeatingHeart(ctx, hx - 4, hy - 8, now, 1.1);
                else if (u.trophyType === 'head_spine') this.drawSkullWithSpine(ctx, hx - 6, hy - 6, now, 1.0, u.spineProg != null ? u.spineProg : 1);
                ctx.restore();
            }
            // benflisor
            this.boneChips.forEach(c => { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.fillStyle = '#efe8d4'; ctx.fillRect(-c.s, -c.s * 0.6, c.s * 2, c.s * 1.2); ctx.restore(); });
            // amputationsdetaljer
            if (this.phase === 'amputation_anim') this._drawAmputationWound(ctx, now);
        },

        // Avskuren arm med skadad skarv, benstump, senor och ryckande fingrar
        drawSeveredLimbs: function (ctx, tex) {
            const now = performance.now();
            this.severedLimbs.forEach(limb => {
                if (limb.pool > 0) {
                    ctx.fillStyle = 'rgba(90,3,6,0.92)'; ctx.beginPath(); ctx.ellipse(limb.x, 436, 12 + limb.pool * 62, 3 + limb.pool * 8, 0, 0, TAU); ctx.fill();
                    ctx.fillStyle = 'rgba(190,20,30,0.25)'; ctx.beginPath(); ctx.ellipse(limb.x - 6, 435, 8 + limb.pool * 34, 2 + limb.pool * 4, 0, 0, TAU); ctx.fill();
                }
                ctx.save(); ctx.translate(limb.x, limb.y); ctx.rotate(limb.rot);
                this.drawAnatomicalLimb(ctx, 0, 0, 24, 6, 22, 20, tex.rustedArmor || '#2e3438', 0.9);
                this.drawAnatomicalLimb(ctx, 24, 6, 62, 12, 20, 15, '#6e6854', 0.75);
                ctx.fillStyle = '#6e6854'; ctx.strokeStyle = '#0a0705'; ctx.lineWidth = 1.4;
                ctx.beginPath(); ctx.ellipse(70, 13, 9, 7, 0, 0, TAU); ctx.fill(); ctx.stroke();
                const tw = limb.twitch || 0;
                for (let k = 0; k < 4; k++) {
                    const curl = limb.rest ? (0.5 + Math.sin(now * 0.022 + k * 1.7) * 0.4 * tw) : 0.6 + Math.sin(now * 0.02 + k) * 0.2;
                    ctx.save(); ctx.translate(76, 9 + k * 3.3); ctx.rotate(-0.2 + curl); ctx.fillStyle = '#6e6854'; ctx.fillRect(0, -1.3, 10, 2.8); ctx.strokeRect(0, -1.3, 10, 2.8); ctx.restore();
                }
                // snittytan: blottad muskel + ben som sticker ut
                ctx.fillStyle = '#6a0c14'; ctx.beginPath(); ctx.ellipse(0, 0, 5.2, 11.5, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#bc4350'; ctx.beginPath(); ctx.ellipse(-0.5, 0, 3.8, 8.6, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#efe8d4'; ctx.strokeStyle = '#2b2318'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(1, -3.2); ctx.lineTo(-9, -2.2); ctx.lineTo(-12, 0.4); ctx.lineTo(-8, 2.2); ctx.lineTo(1, 3.2); ctx.closePath(); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#7a1a1a'; ctx.beginPath(); ctx.arc(-3, 0, 1.2, 0, TAU); ctx.fill();
                ctx.strokeStyle = '#e9d0c4'; ctx.lineWidth = 1.5;
                for (let i = -1; i <= 1; i++) { const sw = Math.sin(now * 0.007 + i * 2) * 3; ctx.beginPath(); ctx.moveTo(0, i * 4.5); ctx.quadraticCurveTo(-8, i * 6 + sw, -14 + sw, i * 8 + 5); ctx.stroke(); }
                ctx.restore();
            });
        },

        // ───────────────────────── DEMO-KNAPPAR ─────────────────────────
        // ───────────── LÅNGSAMMA USURPER-FATALITIES (tidslinje, sekunder) ─────────────
        beginSlaughterTimeline: function (variant) {
            const u = this.usurper, e = this.enemy, inj = e.injuries, self = this;
            e.hp = 0; u.tlIdx = 0; u.spineProg = 0; u.pullProg = null; u.trophyT0 = 0; u._lastSnap = 0;
            const sh = n => { self.camShake = Math.max(self.camShake, n); };
            const sub = txt => { self.cinemaSubBanner = txt; };
            const xr = part => { self.xrayTimer = 1.3; self.xrayTargetPart = part; };
            const neck = () => [e.x - 3, e.y - 262], chest = () => [e.x - 4, e.y - 215], belly = () => [e.x - 10, e.y - 115];
            const gore = (pt, n, bones) => self.spawnGore(pt[0], pt[1], n, !!bones, -1);
            const crunch = n => { self.playBoneCrunch(true); sh(n); };
            let tl = [];

            if (variant === 0) {            // RYGGRADEN UT
                this.slaughterDuration = 18;
                this.cinemaBanner = '💀 ¡ARRANCAMIENTO DE COLUMNA!';
                sub('Pansarhanden knyter sig runt nacken...');
                tl = [
                    { t: 1.5, fn: () => { inj.neckTorn = true; self.playWetSquelch(); gore(neck(), 22); sh(12); sub('Huden på halsen spricker upp...'); } },
                    { t: 3.5, fn: () => { self.playFleshSlice(); self.playTendonSnap(); gore(neck(), 26); sh(14); sub('Muskler och senor slits av, en efter en.'); } },
                    { t: 5.5, fn: () => { inj.spineSnapped = true; xr('spine'); crunch(24); self._spawnChips(neck()[0], neck()[1], 8); sub('*KNAK!* Första kotan ger vika.'); } },
                    { t: 6.9, fn: () => { crunch(28); self._spawnChips(neck()[0], neck()[1], 10); gore(neck(), 20, true); sub('*KRRRK!* Nästa kota knäcks. Ryggmärgen sträcks.'); } },
                    { t: 8.2, fn: () => { crunch(32); self.playTendonSnap(); sub('*KNASK!* Bara en tunn tråd av märg håller kvar.'); } },
                    { t: 9.5, fn: () => {
                        inj.headSevered = true; u.trophyType = 'head_spine'; u.trophyT0 = 9.5; xr('spine');
                        self.playGurgleScream(true); sh(44); gore(neck(), 90, true);
                        self.cinemaBanner = '🦴 ¡COLUMNA ARRANCADA!';
                        sub('Huvudet lossnar – och hela ryggraden följer med, kota för kota.');
                    } }
                ];
            } else if (variant === 1) {     // HJÄRTAT UT
                this.slaughterDuration = 18;
                this.cinemaBanner = '🫀 ¡MANO A TRAVÉS DE LA ESPALDA!';
                sub('Pansarhandsken trycks mot ryggen med full kraft...');
                tl = [
                    { t: 1.5, fn: () => { crunch(20); gore(chest(), 24, true); sub('*KNAK!* Första revbenet viker sig.'); } },
                    { t: 3.2, fn: () => { crunch(24); gore(chest(), 24, true); sub('*KRAAK!* Det andra. Hon flåsar, han stönar.'); } },
                    { t: 4.9, fn: () => { inj.ribsBroken = true; xr('ribs'); crunch(30); self._spawnChips(chest()[0], chest()[1], 12); gore(chest(), 40, true); sub('Bröstkorgen öppnas som en ruttnande kista.'); } },
                    { t: 6.5, fn: () => { self.playWetSquelch(); sh(14); gore(chest(), 22); sub('Handsken tränger in och känner sig för...'); } },
                    { t: 8.5, fn: () => { self.playGutRipSound(); sh(16); gore(chest(), 30); sub('Fingrarna sluter sig runt hjärtat. Det slår fortfarande.'); } },
                    { t: 10.5, fn: () => { self.playTendonSnap(); sh(18); gore(chest(), 26); sub('Första kärlet slits av. Blodet sprutar i pulsen.'); } },
                    { t: 11.7, fn: () => { self.playTendonSnap(); self.playWetSquelch(); sh(22); gore(chest(), 34); sub('Det andra. Han vrider handen ett halvt varv.'); } },
                    { t: 13.0, fn: () => {
                        inj.heartRipped = true; u.trophyType = 'beating_heart'; u.trophyT0 = 13;
                        self.playGurgleScream(true); sh(40); gore(chest(), 80, true);
                        self.cinemaBanner = '🫀 ¡CORAZÓN ARRANCADO!';
                        sub('Hjärtat lyfts upp – fortfarande bultande i näven.');
                    } }
                ];
            } else if (variant === 2) {     // PARTAD I TVÅ
                this.slaughterDuration = 15;
                this.cinemaBanner = '🪓 ¡PARTIDO EN DOS!';
                sub('Klingan lyfts högt över soldatens huvud...');
                tl = [
                    { t: 2.0, fn: () => { xr('skull'); crunch(34); gore(neck(), 40, true); sub('Klingan klyver skallen med ett vått knak.'); } },
                    { t: 4.0, fn: () => { inj.ribsBroken = true; crunch(30); self.playGutRipSound(); gore(chest(), 40, true); sub('Den drivs ner genom bröstbenet, revben för revben.'); } },
                    { t: 6.5, fn: () => { crunch(36); self.playTendonSnap(); gore(chest(), 40, true); sub('*KNASK!* Ryggraden går av i höjd med magen.'); } },
                    { t: 8.0, fn: () => { inj.splitInHalf = true; self.playGurgleScream(true); sh(40); gore(chest(), 100, true); sub('...och de två halvorna börjar sakta glida isär.'); } },
                    { t: 10.5, fn: () => { self.playWetSquelch(); sh(16); gore(belly(), 40); sub('Innanmätet pyser ut över golvet.'); } }
                ];
            } else {                        // TARMARNA UT
                this.slaughterDuration = 17;
                this.cinemaBanner = '🩸 ¡DESOLLADO Y DESTRIPADO!';
                sub('Han tar ett fast grepp om soldatens mage...');
                tl = [
                    { t: 1.8, fn: () => { inj.jawDislocated = true; crunch(24); gore(neck(), 30, true); sub('Underkäken vrids ur led med ett knak.'); } },
                    { t: 3.8, fn: () => { inj.disemboweled = true; xr('gut'); self.playFleshSlice(); self.playWetSquelch(); sh(22); gore(belly(), 50); sub('Buken skärs upp. Ångan stiger i den kalla luften.'); } },
                    { t: 5.5, fn: () => {
                        u.visStart = { x: e.x - 10, y: e.y - 115 }; u.visEnd = { x: u.x - 30, y: u.y - 190 };
                        u.trophyType = 'viscera_whip'; u.trophyT0 = 5.5; u.pullProg = 0.03; u._lastSnap = 0;
                        self.spawnVisceraExtraction(u.visStart.x, u.visStart.y, u.visStart.x + 4, u.visStart.y + 2, 'enemy');
                        sub('Tarmarna dras ut. Meter efter meter...');
                    } }
                ];
            }
            u.tl = tl;
            this.xrayTimer = 1.3; this.xrayTargetPart = (variant === 1 ? 'ribs' : variant === 2 ? 'skull' : variant === 3 ? 'gut' : 'spine');
            this.spawnGore(e.x, e.y - 195, 30, true, -1);
        },

        updateSlaughterTimeline: function (dt, u) {
            const t = u.timer, tl = u.tl || [];
            while (u.tlIdx < tl.length && t >= tl[u.tlIdx].t) { const ev = tl[u.tlIdx++]; ev.fn(); }
            if (u.variant === 0 && u.trophyType === 'head_spine') {
                const p = clamp((t - u.trophyT0) / 7, 0, 1); u.spineProg = p;
                const snap = Math.floor(p * 9);
                if (snap > u._lastSnap) { u._lastSnap = snap; this.playTendonSnap(); this._noiseBurst(0.18, 'lowpass', 900, 200, 0.4); this.spawnGore(u.x - 100, u.y - 230, 10, false, -1); }
            }
            if (u.variant === 3 && u.visStart) {
                const p = clamp((t - u.trophyT0) / 9, 0.03, 1); u.pullProg = p;
                const snap = Math.floor(p * 7);
                if (snap > u._lastSnap) { u._lastSnap = snap; this.playWetSquelch(); this.camShake = Math.max(this.camShake, 10); this.spawnGore(this.enemy.x - 10, this.enemy.y - 115, 14, false, -1); }
            }
            if (Math.random() < 0.25) this.spawnGore(this.enemy.x, this.enemy.y - 185, 6, false, -1);
        },

        demoUsurper: function (variant) {
            if (!this.active || this.phase === 'takeover_anim') return;
            this._forceVariant = variant;
            this.triggerUsurperTakeover('conquistador');
            this._forceVariant = null;
        }
    });
})();
