// === DEL 9: HANDMÅLADE FILMSCENER (elite_melee_cinema_v7.js) ===
// Laddas efter elite_melee_visual_overhaul_v5.js och FÖRE elite_melee_academics.js.
//
// Två legendariska mellansekvenser målas om från grunden i oljemålningsstil, med eget ljus,
// rök, filmkorn och biografformat (svarta band uppe och nere):
//
//  1. EL POMBERO LETAR CAÑA (60 s): skallen bänds upp, blåses i som ett horn, revbenen bryts ett
//     och ett, och han hittar en sked, ett kärleksbrev till Isabel, en guldtand, ett russinhjärta
//     och till sist en läderflaska ... med EN droppe i.
//  2. CONQUISTADORENS MISSLYCKADE URINERING: profil med rostig stålbragueta som vägrar släppa,
//     syrsor, ingenting – sedan framifrån: byxorna blir damm, bäckenet är tomt, en mal flyger ut,
//     en spindel vinkar. "...Mierda." Han sätter tillbaka braguetan. Med värdighet.
//
// Scenerna visas likadant i 2D- och 3D-läge (3D-canvasen göms medan de spelas).

window.EliteMelee = window.EliteMelee || {};

(function () {
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
    const W = 880, H = 480, BAR_T = 34, BAR_B = 392; // biografband: bild mellan 34 och 392

    // Fast slump (samma varje bildruta = inget flimmer)
    function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

    function offscreen(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return c; }

    // Mjuk sluten kurva genom punkter (Catmull-Rom)
    function blobPath(ctx, pts) {
        const n = pts.length;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
            if (i === 0) ctx.moveTo(p1[0], p1[1]);
            ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
        }
        ctx.closePath();
    }
    // Tvåleds-IK: armbåge/knä mellan led a och slutpunkt b
    function ik2(ax, ay, bx, by, l1, l2, bend) {
        const dx = bx - ax, dy = by - ay; let d = Math.hypot(dx, dy) || 1;
        const dd = Math.min(d, l1 + l2 - 0.01);
        const a = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1));
        const base = Math.atan2(dy, dx) + a * (bend || 1);
        return [ax + Math.cos(base) * l1, ay + Math.sin(base) * l1];
    }
    // Avsmalnande lem (kapselform) med enkel skuggning
    function limb(ctx, x1, y1, x2, y2, w1, w2, fill, edge) {
        const ang = Math.atan2(y2 - y1, x2 - x1), len = Math.hypot(x2 - x1, y2 - y1);
        ctx.save(); ctx.translate(x1, y1); ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, -w1 / 2); ctx.quadraticCurveTo(len * 0.5, -Math.max(w1, w2) * 0.6, len, -w2 / 2);
        ctx.arc(len, 0, w2 / 2, -Math.PI / 2, Math.PI / 2);
        ctx.quadraticCurveTo(len * 0.5, Math.max(w1, w2) * 0.6, 0, w1 / 2);
        ctx.arc(0, 0, w1 / 2, Math.PI / 2, Math.PI * 1.5);
        ctx.closePath();
        ctx.fillStyle = fill; ctx.fill();
        if (edge) { ctx.strokeStyle = edge; ctx.lineWidth = 1.5; ctx.stroke(); }
        ctx.restore();
    }
    function bone(ctx, x1, y1, x2, y2, th) {
        const g = ctx.createLinearGradient(x1, y1 - th, x1, y1 + th);
        g.addColorStop(0, '#efe6cc'); g.addColorStop(0.55, '#cbbd98'); g.addColorStop(1, '#8a7b5a');
        limb(ctx, x1, y1, x2, y2, th, th * 0.85, g, '#3b3122');
        ctx.fillStyle = '#e6dcc0';
        [[x1, y1], [x2, y2]].forEach(p => { ctx.beginPath(); ctx.arc(p[0], p[1], th * 0.62, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3b3122'; ctx.lineWidth = 1.2; ctx.stroke(); });
    }

    // ───────────────────────── GEMENSAMMA FILMVERKTYG ─────────────────────────
    const FX = {
        grain: null,
        getGrain() {
            if (this.grain) return this.grain;
            this.grain = offscreen(256, 256, (g, w, h) => {
                const id = g.createImageData(w, h), r = rng(7);
                for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
                g.putImageData(id, 0, 0);
            });
            return this.grain;
        },
        finish(ctx, now, opts) {
            opts = opts || {};
            // vinjett
            const v = ctx.createRadialGradient(W * 0.5, H * 0.48, 120, W * 0.5, H * 0.48, 560);
            v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,' + (opts.vignette || 0.7) + ')');
            ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
            // filmkorn
            ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay';
            const gr = this.getGrain(), ox = Math.floor(Math.random() * 256), oy = Math.floor(Math.random() * 256);
            ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(gr, 'repeat'); ctx.fillRect(ox, oy, W, H);
            ctx.restore();
            // biografband
            ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR_T); ctx.fillRect(0, BAR_B, W, H - BAR_B);
        },
        fitText(ctx, txt, x, y, maxW, font, size, color, minSize) {
            let s = size; ctx.font = font.replace('{s}', s);
            while (ctx.measureText(txt).width > maxW && s > (minSize || 9)) { s -= 0.5; ctx.font = font.replace('{s}', s); }
            ctx.fillStyle = color; ctx.fillText(txt, x, y);
        },
        subtitles(ctx, L) {
            if (!L) return;
            ctx.save(); ctx.textAlign = 'center'; ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
            if (L.g) this.fitText(ctx, L.g, W / 2, BAR_B + 26, W - 60, 'bold {s}px Georgia', 17, '#b9e4a8');
            if (L.e) this.fitText(ctx, L.e, W / 2, BAR_B + 49, W - 60, 'italic {s}px Georgia', 15, '#f4efe6');
            if (L.s) this.fitText(ctx, L.s.charAt(0) === '(' ? L.s : '(' + L.s + ')', W / 2, BAR_B + 70, W - 60, '{s}px Georgia', 13, '#e8b878');
            ctx.restore();
        },
        title(ctx, txt, sub) {
            if (!txt) return;
            ctx.save(); ctx.textAlign = 'center';
            this.fitText(ctx, txt, W / 2, 23, W - 40, 'bold {s}px Georgia', 18, '#e8c88a');
            ctx.restore();
        },
        torch(ctx, x, y, now, scale) {
            const s = scale || 1, fl = Math.sin(now * 0.013) * 0.5 + Math.sin(now * 0.031) * 0.3 + Math.sin(now * 0.007) * 0.2;
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glow = ctx.createRadialGradient(x, y - 10 * s, 4, x, y - 10 * s, 220 * s * (1 + fl * 0.05));
            glow.addColorStop(0, 'rgba(255,190,90,0.55)'); glow.addColorStop(0.3, 'rgba(255,120,30,0.18)'); glow.addColorStop(1, 'rgba(255,100,0,0)');
            ctx.fillStyle = glow; ctx.fillRect(x - 240 * s, y - 250 * s, 480 * s, 480 * s);
            ctx.restore();
            // hållare
            ctx.fillStyle = '#1b130d'; ctx.fillRect(x - 3 * s, y, 6 * s, 34 * s);
            ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x - 7 * s, y - 2 * s, 14 * s, 8 * s);
            // låga
            const h = (30 + fl * 6) * s;
            [['#ff6a00', 1], ['#ffb347', 0.7], ['#fff3c0', 0.38]].forEach(([c, k]) => {
                ctx.fillStyle = c; ctx.beginPath();
                ctx.moveTo(x, y - h * k - 4 * s);
                ctx.bezierCurveTo(x + 10 * s * k + fl * 3, y - h * k * 0.45, x + 8 * s * k, y, x, y + 2);
                ctx.bezierCurveTo(x - 8 * s * k, y, x - 10 * s * k + fl * 3, y - h * k * 0.45, x, y - h * k - 4 * s);
                ctx.fill();
            });
        }
    };

    // Katakomb med benhus-nischer (målas EN gång till en dold canvas)
    let _catacomb = null;
    function catacomb() {
        if (_catacomb) return _catacomb;
        _catacomb = offscreen(W, H, (g) => {
            const r = rng(1543);
            const bg = g.createLinearGradient(0, 0, 0, H);
            bg.addColorStop(0, '#120d09'); bg.addColorStop(0.62, '#21170f'); bg.addColorStop(0.63, '#1a120c'); bg.addColorStop(1, '#0b0705');
            g.fillStyle = bg; g.fillRect(0, 0, W, H);
            // stenblock
            for (let row = 0; row < 9; row++) {
                const y = 20 + row * 30, off = (row % 2) * 34;
                for (let x = -60 + off; x < W + 60; x += 68) {
                    const l = 22 + r() * 16;
                    g.fillStyle = 'rgb(' + (l + 8) + ',' + (l + 2) + ',' + (l - 6) + ')';
                    g.beginPath(); g.roundRect ? g.roundRect(x + 2, y + 2, 64, 26, 4) : g.rect(x + 2, y + 2, 64, 26); g.fill();
                    g.fillStyle = 'rgba(255,220,170,0.05)'; g.fillRect(x + 4, y + 3, 60, 3);
                    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 4, y + 23, 60, 4);
                    if (r() < 0.25) { g.fillStyle = 'rgba(60,80,40,0.25)'; g.beginPath(); g.ellipse(x + r() * 60, y + 20, 10 + r() * 14, 5, 0, 0, TAU); g.fill(); }
                }
            }
            // bågformade nischer med skallar (benhus)
            [[300, 70], [560, 70], [760, 82]].forEach(([nx, ny], ni) => {
                g.fillStyle = '#070504';
                g.beginPath(); g.moveTo(nx - 58, ny + 130); g.lineTo(nx - 58, ny + 40); g.arc(nx, ny + 40, 58, Math.PI, 0); g.lineTo(nx + 58, ny + 130); g.closePath(); g.fill();
                for (let k = 0; k < 14; k++) {
                    const sx = nx - 44 + (k % 5) * 22 + (Math.floor(k / 5) % 2) * 11, sy = ny + 118 - Math.floor(k / 5) * 22;
                    if (sy < ny + 30) continue;
                    const sg = g.createRadialGradient(sx - 3, sy - 4, 1, sx, sy, 11);
                    sg.addColorStop(0, '#8e8166'); sg.addColorStop(1, '#3a3123');
                    g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, 10, 0, TAU); g.fill();
                    g.fillStyle = '#0a0705'; g.beginPath(); g.arc(sx - 3.5, sy, 2.6, 0, TAU); g.arc(sx + 3.5, sy, 2.6, 0, TAU); g.fill();
                }
                g.strokeStyle = 'rgba(200,170,120,0.12)'; g.lineWidth = 3;
                g.beginPath(); g.arc(nx, ny + 40, 60, Math.PI, 0); g.stroke();
            });
            // golvplattor i perspektiv
            g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 1.5;
            for (let i = 0; i < 7; i++) { const y = 300 + i * i * 4 + i * 6; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
            for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 40, 298); g.lineTo(W / 2 + i * 120, H); g.stroke(); }
            for (let i = 0; i < 600; i++) { g.fillStyle = r() < 0.5 ? 'rgba(0,0,0,0.18)' : 'rgba(200,160,110,0.05)'; g.fillRect(r() * W, 298 + r() * 190, 2, 2); }
            // kedja som hänger från taket
            g.strokeStyle = '#2a2018'; g.lineWidth = 3;
            for (let y = 34; y < 150; y += 10) { g.beginPath(); g.ellipse(820, y, 3.5, 6, (y / 10) % 2 ? 0 : Math.PI / 2, 0, TAU); g.stroke(); }
        });
        return _catacomb;
    }

    // Belysning: mörka ner allt långt från facklan (multiply), sedan varm glöd
    function lightPass(ctx, lx, ly, radius, now, cold) {
        const fl = 1 + Math.sin(now * 0.013) * 0.03 + Math.sin(now * 0.029) * 0.02;
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        const g = ctx.createRadialGradient(lx, ly, 30, lx, ly, radius * fl);
        g.addColorStop(0, 'rgb(255,240,215)'); g.addColorStop(0.5, 'rgb(205,160,122)'); g.addColorStop(1, cold ? 'rgb(58,62,84)' : 'rgb(62,46,38)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.restore();
    }

    // Rökpartiklar
    function smokeStep(list, dt) {
        list.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.99; p.r += 12 * dt; p.a -= dt * 0.16; });
        for (let i = list.length - 1; i >= 0; i--) if (list[i].a <= 0) list.splice(i, 1);
    }
    function smokeDraw(ctx, list) {
        list.forEach(p => {
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            g.addColorStop(0, 'rgba(170,168,160,' + (p.a * 0.42) + ')'); g.addColorStop(1, 'rgba(170,168,160,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill();
        });
    }

    // ───────────────────────── LJUD ─────────────────────────
    const SFX = {
        ac(EM) { EM.initAudio(); return EM.audioCtx; },
        tone(EM, type, f0, f1, dur, gain, delay) {
            const ac = this.ac(EM); if (!ac) return;
            const t0 = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
            o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
            g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + dur + 0.05);
        },
        noise(EM, dur, type, f0, f1, gain, delay) {
            const ac = this.ac(EM); if (!ac) return;
            const t0 = ac.currentTime + (delay || 0), len = Math.floor(ac.sampleRate * dur);
            const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.5));
            const n = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
            n.buffer = buf; f.type = type; f.frequency.setValueAtTime(f0, t0); f.frequency.linearRampToValueAtTime(f1, t0 + dur);
            g.gain.value = gain; n.connect(f); f.connect(g); g.connect(ac.destination); n.start(t0);
        },
        match(EM) { this.noise(EM, 0.35, 'highpass', 2500, 1200, 0.5); this.noise(EM, 0.6, 'bandpass', 900, 400, 0.18, 0.12); },
        horn(EM) { // Pombero blåser i skallen
            const ac = this.ac(EM); if (!ac) return;
            const t0 = ac.currentTime, o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), f = ac.createBiquadFilter(), g = ac.createGain();
            o.type = 'sawtooth'; o.frequency.setValueAtTime(92, t0); o.frequency.linearRampToValueAtTime(84, t0 + 1.6); o.frequency.linearRampToValueAtTime(62, t0 + 2.0);
            lfo.frequency.value = 5.5; lg.gain.value = 3; lfo.connect(lg); lg.connect(o.frequency);
            f.type = 'lowpass'; f.frequency.value = 520; f.Q.value = 4;
            g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.25); g.gain.setValueAtTime(0.35, t0 + 1.5); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.1);
            o.connect(f); f.connect(g); g.connect(ac.destination); o.start(t0); lfo.start(t0); o.stop(t0 + 2.2); lfo.stop(t0 + 2.2);
        },
        clatter(EM) { for (let i = 0; i < 4; i++) { this.tone(EM, 'triangle', 1900 - i * 220, 1300 - i * 150, 0.07, 0.12 / (i + 1), 0.1 + i * 0.11 + Math.random() * 0.03); } },
        paper(EM) { this.noise(EM, 0.5, 'highpass', 3000, 5000, 0.12); },
        bite(EM) { this.tone(EM, 'square', 2400, 1800, 0.05, 0.08); this.tone(EM, 'sine', 3800, 3400, 0.4, 0.05, 0.05); },
        squelch(EM) { this.noise(EM, 0.45, 'lowpass', 700, 140, 0.6); },
        sting(EM) { [523, 659, 784, 1047].forEach((f, i) => this.tone(EM, 'triangle', f, f, 0.5, 0.12, i * 0.07)); },
        uncork(EM) { this.tone(EM, 'sine', 380, 900, 0.09, 0.4); this.noise(EM, 0.15, 'bandpass', 1500, 800, 0.15, 0.05); },
        plip(EM) { this.tone(EM, 'sine', 1500, 520, 0.18, 0.3); },
        clang(EM) { [523, 1187, 1843, 2711].forEach((f, i) => this.tone(EM, 'triangle', f, f * 0.97, 1.4 - i * 0.25, 0.14 / (i + 1))); this.noise(EM, 0.12, 'highpass', 3000, 2000, 0.3); },
        squeak(EM) { const ac = this.ac(EM); if (!ac) return; for (let i = 0; i < 3; i++) this.tone(EM, 'sawtooth', 1100 + Math.random() * 300, 700, 0.2, 0.05, i * 0.26); },
        cricket(EM, n) { for (let k = 0; k < (n || 3); k++) for (let i = 0; i < 3; i++) this.tone(EM, 'sine', 4300, 4250, 0.035, 0.045, k * 0.7 + i * 0.06); },
        flutter(EM) { for (let i = 0; i < 10; i++) this.noise(EM, 0.04, 'bandpass', 320, 300, 0.12, i * 0.06); },
        dust(EM) { this.noise(EM, 1.1, 'lowpass', 900, 200, 0.35); }
    };

    // ═════════════════════════════════════════════════════════════════════
    //  1. EL POMBERO LETAR CAÑA
    // ═════════════════════════════════════════════════════════════════════
    const POMBERO_LINES_EXTRA = [
        /*14*/ { g: '*BUUUUUUUUH*', e: '(Sopla dentro del cráneo como si fuera un cuerno. Hace eco. Está vacío.)', s: 'Han blåser i skallen som i ett lur. Det ekar. Den är tom.' },
        /*15*/ { g: '"¿Mba\'e piko kóva?"', e: '"¿Una cuchara? ¿Quién [CARAJO] se lleva una cuchara a la tumba?"', s: 'En sked? Vem i [HELVETE] tar med sig en sked i graven?' },
        /*16*/ { g: '"...Isabel..."', e: '"«Mi querida Isabel: volveré rico antes del verano.» ...*snif*"', s: '"Min älskade Isabel: jag kommer hem rik före sommaren." ...snyft' },
        /*17*/ { g: '*snif* "...Pobre gallego."', e: '"Nunca volviste, ¿eh? Cuatrocientos años de verano, desgraciado."', s: 'Du kom aldrig hem, va? Fyrahundra år lång sommar, din stackare.' },
        /*18*/ { g: '*ÑAKÃ* "...iporã."', e: '"Un diente de oro. Este me lo quedo. Por las molestias."', s: 'En guldtand. Den behåller jag. För besväret.' },
        /*19*/ { g: '"¡Puaj!"', e: '"¿Y esto? ¿Un corazón? Más seco que una pasa de uva. Ni sangre tiene, el [██████]."', s: 'Och det här? Ett hjärta? Torrare än ett russin. Inte ens blod har han, den [██████].' },
        /*20*/ { g: '"¡¡KÁÑA!! ¡¡CHE KÁÑA!!"', e: '"¡¡LA BOTA!! ¡¡SABÍA QUE LA TENÍAS ESCONDIDA, LADRÓN!!"', s: 'FLASKAN!! JAG VISSTE ATT DU HADE GÖMT DEN, TJUV!!' },
        /*21*/ { g: '...', e: '(Una sola gota.)', s: 'En enda droppe.' }
    ];

    // Föremål han hittar: ritas i handen eller i luften när de kastas
    function drawItem(ctx, kind, x, y, rot, s, now) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s || 1, s || 1);
        if (kind === 'beetle') {
            ctx.fillStyle = '#1a2a1a'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 4, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#111'; ctx.lineWidth = 1; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 3, 0); ctx.lineTo(i * 4, 6); ctx.stroke(); }
        } else if (kind === 'spoon') {
            ctx.fillStyle = '#7d6a4a'; ctx.fillRect(-2, -2, 30, 4);
            ctx.fillStyle = '#8f7a55'; ctx.beginPath(); ctx.ellipse(-8, 0, 9, 6, 0, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(140,60,20,0.6)'; ctx.beginPath(); ctx.arc(14, 0, 3, 0, TAU); ctx.fill();
        } else if (kind === 'letter') {
            ctx.fillStyle = '#d8c79a'; ctx.beginPath(); ctx.moveTo(-26, -18); ctx.lineTo(24, -20); ctx.lineTo(27, 18); ctx.lineTo(-24, 20); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(80,50,20,0.65)'; ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-19, -12 + i * 5.5); for (let k = 0; k < 8; k++) ctx.lineTo(-19 + k * 5.5, -12 + i * 5.5 + Math.sin(k * 2.3 + i) * 1.2); ctx.stroke(); }
            ctx.fillStyle = '#8b1a1a'; ctx.beginPath(); ctx.arc(14, 12, 4, 0, TAU); ctx.fill(); // vaxsigill
        } else if (kind === 'tooth') {
            const g = ctx.createLinearGradient(-5, -7, 5, 7); g.addColorStop(0, '#fff2a8'); g.addColorStop(1, '#b8860b');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-5, -6); ctx.lineTo(5, -6); ctx.lineTo(4, 3); ctx.lineTo(2, 8); ctx.lineTo(0, 3); ctx.lineTo(-2, 8); ctx.lineTo(-4, 3); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-3, -4, 1.5, 4);
        } else if (kind === 'heart') {
            ctx.fillStyle = '#4a2a20'; ctx.beginPath(); ctx.moveTo(0, -6); ctx.bezierCurveTo(-4, -14, -16, -10, -13, 2); ctx.bezierCurveTo(-11, 9, -4, 12, 0, 18); ctx.bezierCurveTo(4, 12, 11, 9, 13, 2); ctx.bezierCurveTo(16, -10, 4, -14, 0, -6); ctx.fill();
            ctx.strokeStyle = '#2a140e'; ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-9 + i * 5, -4); ctx.quadraticCurveTo(-7 + i * 5, 4, -10 + i * 5, 10); ctx.stroke(); }
        } else if (kind === 'flask' || kind === 'flask_open') {
            const g = ctx.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#3a1e0e'); g.addColorStop(0.5, '#7a4523'); g.addColorStop(1, '#2a150a');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-4, -22); ctx.lineTo(4, -22); ctx.quadraticCurveTo(18, -10, 15, 10); ctx.quadraticCurveTo(0, 22, -15, 10); ctx.quadraticCurveTo(-18, -10, -4, -22); ctx.fill();
            ctx.strokeStyle = '#1a0d05'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.strokeStyle = 'rgba(255,220,160,0.35)'; ctx.beginPath(); ctx.moveTo(-9, -6); ctx.quadraticCurveTo(-11, 4, -6, 12); ctx.stroke();
            ctx.fillStyle = '#c9a24a'; ctx.fillRect(-5, -27, 10, 6);
            if (kind === 'flask') { ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-3.5, -33, 7, 7); }
        }
        ctx.restore();
    }

    // Conquistador-liket, liggande. Huvud till vänster.
    function drawCorpse(ctx, st, now) {
        const twitch = (Math.sin(now * 0.045) > 0.86) ? Math.sin(now * 0.9) * 2.5 : 0;
        // blodpöl och smuts
        ctx.save();
        const pool = ctx.createRadialGradient(400, 350, 10, 400, 350, 260);
        pool.addColorStop(0, 'rgba(70,6,8,0.85)'); pool.addColorStop(0.6, 'rgba(45,6,6,0.55)'); pool.addColorStop(1, 'rgba(30,6,6,0)');
        ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(410, 352, 280, 36, 0, 0, TAU); ctx.fill();
        ctx.restore();

        // ben (lårben/skenben med stövlar) – till höger
        bone(ctx, 498, 330, 590, 340 + twitch, 9);
        bone(ctx, 590, 340 + twitch, 668, 334, 8);
        bone(ctx, 494, 340, 582, 356, 9);
        bone(ctx, 582, 356, 660, 360 - twitch, 8);
        [[668, 334], [660, 360 - twitch]].forEach(([bx, by]) => {
            const g = ctx.createLinearGradient(bx, by - 14, bx, by + 14); g.addColorStop(0, '#3a2a1c'); g.addColorStop(1, '#140d08');
            ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(bx - 6, by - 12); ctx.lineTo(bx + 30, by - 14); ctx.quadraticCurveTo(bx + 40, by, bx + 32, by + 10); ctx.lineTo(bx - 4, by + 12); ctx.closePath(); ctx.fill();
        });
        // trasiga byxor över bäckenet
        ctx.fillStyle = '#2e2218'; blobPath(ctx, [[440, 312], [505, 318], [512, 352], [470, 362], [432, 350]]); ctx.fill();
        // bortre arm (slapp mot golvet)
        bone(ctx, 320, 318, 300, 356, 7); bone(ctx, 300, 356, 252, 372, 6);
        for (let f = 0; f < 4; f++) { ctx.strokeStyle = '#cbbd98'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(252, 372); ctx.lineTo(236 - f * 2, 368 + f * 4); ctx.stroke(); }

        // bålen: rostig harnesk som ligger på rygg, bröstkorgen öppen uppåt
        const cx = 375, cy = 322;
        const arm = ctx.createLinearGradient(0, cy - 30, 0, cy + 30);
        arm.addColorStop(0, '#5a6166'); arm.addColorStop(0.45, '#33393d'); arm.addColorStop(1, '#151819');
        ctx.fillStyle = arm; blobPath(ctx, [[290, cy - 8], [330, cy - 24], [410, cy - 24], [452, cy - 10], [456, cy + 20], [410, cy + 32], [320, cy + 30], [286, cy + 16]]); ctx.fill();
        // rostfläckar
        const r = rng(91);
        for (let i = 0; i < 26; i++) { ctx.fillStyle = 'rgba(130,52,18,' + (0.25 + r() * 0.35) + ')'; ctx.beginPath(); ctx.ellipse(296 + r() * 152, cy - 18 + r() * 44, 3 + r() * 7, 2 + r() * 4, r() * 3, 0, TAU); ctx.fill(); }
        // bröstkorgshålan
        const cav = ctx.createRadialGradient(372, cy - 6, 4, 372, cy - 6, 60);
        cav.addColorStop(0, '#120203'); cav.addColorStop(0.7, '#2c0608'); cav.addColorStop(1, '#4a0d0e');
        ctx.fillStyle = cav; ctx.beginPath(); ctx.ellipse(372, cy - 8, 66, 20, 0, 0, TAU); ctx.fill();
        // ryggrad i botten av hålan
        for (let v = 0; v < 8; v++) { ctx.fillStyle = '#7c6f53'; ctx.beginPath(); ctx.ellipse(318 + v * 15, cy - 4, 5, 3.5, 0, 0, TAU); ctx.fill(); }
        // revben: hela bågar över hålan, brutna böjs upp och ut
        for (let i = 0; i < 5; i++) {
            const rx = 322 + i * 25, broken = i < st.ribs;
            ctx.strokeStyle = '#e2d7b8'; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
            ctx.beginPath();
            if (!broken) { ctx.moveTo(rx - 8, cy + 10); ctx.quadraticCurveTo(rx, cy - 34, rx + 10, cy + 8); }
            else { ctx.moveTo(rx - 8, cy + 10); ctx.quadraticCurveTo(rx - 14, cy - 14, rx - 20, cy - 44); }
            ctx.stroke();
            ctx.strokeStyle = 'rgba(80,60,30,0.6)'; ctx.lineWidth = 1.2; ctx.stroke();
            if (broken) { ctx.fillStyle = '#7a1a1a'; ctx.beginPath(); ctx.arc(rx - 20, cy - 44, 3, 0, TAU); ctx.fill(); }
        }
        ctx.lineCap = 'butt';
        // mässingskant på harnesken
        ctx.strokeStyle = '#8a6a22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(296, cy + 18); ctx.quadraticCurveTo(370, cy + 36, 450, cy + 16); ctx.stroke();

        // huvudet: kranium + morionhjälm, skalltaket kan lyftas
        const hx = 252, hy = 318;
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.25);
        const sk = ctx.createRadialGradient(-6, -10, 3, 0, 0, 36);
        sk.addColorStop(0, '#efe5c8'); sk.addColorStop(0.7, '#b3a580'); sk.addColorStop(1, '#5c5038');
        ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(0, 0, 34, 30, 0, 0, TAU); ctx.fill();
        // ögonhåla med glöd
        ctx.fillStyle = '#0a0303'; ctx.beginPath(); ctx.ellipse(-14, 2, 8, 9, 0, 0, TAU); ctx.fill();
        const eg = ctx.createRadialGradient(-14, 3, 0, -14, 3, 9);
        eg.addColorStop(0, 'rgba(255,40,40,' + (0.45 + 0.4 * Math.sin(now * 0.008)) + ')'); eg.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(-14, 3, 9, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0a0303'; ctx.beginPath(); ctx.moveTo(-28, 10); ctx.lineTo(-24, 16); ctx.lineTo(-31, 16); ctx.closePath(); ctx.fill();
        // tandrad + hängande käke
        ctx.fillStyle = '#e8ddc0'; for (let k = 0; k < 6; k++) ctx.fillRect(-30 + k * 5.5, 18, 4, 6);
        ctx.save(); ctx.translate(-8, 26); ctx.rotate(0.28 + Math.sin(now * 0.004) * 0.05);
        ctx.fillStyle = '#c9bc98'; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(10, -2); ctx.lineTo(8, 9); ctx.lineTo(-24, 10); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#efe6cc'; for (let k = 0; k < 5; k++) ctx.fillRect(-22 + k * 5.5, -4, 4, 5);
        ctx.restore();
        // skalltak / hjälm
        if (!st.skullOpen) {
            ctx.fillStyle = '#3c4448'; ctx.beginPath(); ctx.ellipse(6, -12, 40, 26, 0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#2a3034'; ctx.beginPath(); ctx.ellipse(6, -12, 52, 8, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(6, -12, 34, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        } else {
            ctx.fillStyle = '#1a0606'; ctx.beginPath(); ctx.ellipse(4, -14, 28, 9, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#d9cdae'; ctx.lineWidth = 4; ctx.stroke();
        }
        ctx.restore();
        if (st.skullOpen && !st.lidHidden) {
            // det avlyfta skalltaket (med hjälmen) ligger bredvid
            ctx.save(); ctx.translate(st.lidX, st.lidY); ctx.rotate(st.lidRot);
            ctx.fillStyle = '#3c4448'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 26, 0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#2a3034'; ctx.beginPath(); ctx.ellipse(0, 0, 52, 8, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 34, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
            ctx.restore();
        }
    }

    // El Pombero: liten, raggig, bred stråhatt, glödande ögon under brättet, cigarr i mungipan
    function drawPombero(ctx, p, now) {
        const bx = p.x, by = p.y;
        const lean = p.lean || 0;
        ctx.save();
        // fötter/knän (hukande)
        ctx.fillStyle = '#16110d';
        blobPath(ctx, [[bx - 60, by + 92], [bx - 20, by + 70], [bx + 30, by + 74], [bx + 70, by + 96], [bx + 20, by + 104], [bx - 40, by + 104]]); ctx.fill();
        // kroppen (pälsboll)
        ctx.translate(bx, by); ctx.rotate(lean); ctx.translate(-bx, -by);
        const body = ctx.createRadialGradient(bx - 30, by - 10, 10, bx, by + 10, 95);
        body.addColorStop(0, '#3a2c22'); body.addColorStop(0.6, '#1d1612'); body.addColorStop(1, '#0c0907');
        ctx.fillStyle = body;
        blobPath(ctx, [[bx - 62, by - 30], [bx - 30, by - 66], [bx + 30, by - 66], [bx + 66, by - 26], [bx + 72, by + 40], [bx + 30, by + 86], [bx - 40, by + 84], [bx - 76, by + 30]]);
        ctx.fill();
        // päls: tovor som faller nedåt, ljusare på facklans sida (samma varje bildruta)
        const r = rng(4242);
        ctx.lineCap = 'round';
        const sway = Math.sin(now * 0.0016) * 0.05;
        const furTones = ['rgba(12,8,6,0.75)', 'rgba(40,28,20,0.7)', 'rgba(78,55,38,0.65)', 'rgba(128,92,60,0.6)'];
        for (let layer = 0; layer < 3; layer++) {
            for (let i = 0; i < 150; i++) {
                const a = r() * TAU, rad = Math.sqrt(r()) * 0.95;
                const fx = bx + Math.cos(a) * 66 * rad, fy = by + 6 + Math.sin(a) * 72 * rad;
                const side = (fx - bx) / 70;                    // -1 vänster … +1 höger
                const ang = Math.PI / 2 + side * 0.55 + (r() - 0.5) * 0.5 + sway;
                const len = 10 + r() * 14 + layer * 3;
                const lit = clamp(0.55 - side * 0.5 - (fy - by) / 220, 0, 1); // facklan till vänster/ovanför
                const tone = Math.min(3, Math.floor(lit * 3.2 + r() * 0.9));
                ctx.strokeStyle = furTones[layer === 0 ? Math.max(0, tone - 1) : tone];
                ctx.lineWidth = 2.6 - layer * 0.6;
                const ex = fx + Math.cos(ang) * len, ey = fy + Math.sin(ang) * len;
                ctx.beginPath(); ctx.moveTo(fx, fy); ctx.quadraticCurveTo(fx + Math.cos(ang - 0.4) * len * 0.5, fy + Math.sin(ang - 0.4) * len * 0.5, ex, ey); ctx.stroke();
            }
        }
        // ragg som bryter silhuetten
        for (let i = 0; i < 70; i++) {
            const a = Math.PI * 1.05 + r() * Math.PI * 1.9;
            const ex0 = bx + Math.cos(a) * 68, ey0 = by + 8 + Math.sin(a) * 76;
            const ang = Math.atan2(Math.sin(a) * 0.6 + 0.8, Math.cos(a)) + (r() - 0.5) * 0.4;
            ctx.strokeStyle = Math.cos(a) < -0.3 ? 'rgba(120,86,56,0.7)' : 'rgba(16,11,8,0.85)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(ex0, ey0); ctx.lineTo(ex0 + Math.cos(ang) * (8 + r() * 10), ey0 + Math.sin(ang) * (8 + r() * 10)); ctx.stroke();
        }
        ctx.restore();

        // huvudet
        const hx = bx - 18 + (p.headDX || 0), hy = by - 78 + (p.headDY || 0);
        ctx.save(); ctx.translate(hx, hy); ctx.rotate(p.headTilt || 0);
        // öron som sticker ut under hatten
        ctx.fillStyle = '#5e3f2a';
        ctx.beginPath(); ctx.ellipse(38, 4, 9, 14, 0.3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#3a2618'; ctx.beginPath(); ctx.ellipse(39, 5, 4, 8, 0.3, 0, TAU); ctx.fill();
        const face = ctx.createRadialGradient(-18, 2, 4, -4, 8, 48);
        face.addColorStop(0, '#a87650'); face.addColorStop(0.55, '#6e4a30'); face.addColorStop(1, '#2a1b12');
        ctx.fillStyle = face; ctx.beginPath(); ctx.ellipse(0, 6, 40, 38, 0, 0, TAU); ctx.fill();
        // rynkor
        ctx.strokeStyle = 'rgba(40,24,14,0.6)'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(-36, 0); ctx.quadraticCurveTo(-30, 8, -34, 16); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(14, 16); ctx.quadraticCurveTo(22, 20, 26, 14); ctx.stroke();
        // stubbigt skägg kring hakan
        const r2 = rng(77);
        ctx.fillStyle = 'rgba(28,20,14,0.85)';
        blobPath(ctx, [[-36, 22], [-26, 42], [-4, 50], [20, 44], [34, 26], [24, 30], [0, 36], [-22, 32]]); ctx.fill();
        for (let i = 0; i < 46; i++) { const sx = -32 + r2() * 62, sy = 26 + r2() * 20; ctx.strokeStyle = r2() < 0.4 ? 'rgba(110,80,55,0.6)' : 'rgba(15,10,7,0.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (r2() - 0.5) * 5, sy + 6 + r2() * 7); ctx.stroke(); }
        // stor potatisnäsa med glans
        const ng = ctx.createRadialGradient(-32, 2, 2, -26, 8, 17);
        ng.addColorStop(0, '#d8996a'); ng.addColorStop(0.6, '#8c5a38'); ng.addColorStop(1, '#4a2e1c');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.ellipse(-26, 8, 15, 12, -0.3, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,230,200,0.45)'; ctx.beginPath(); ctx.ellipse(-31, 3, 4, 2.5, -0.4, 0, TAU); ctx.fill();
        ctx.fillStyle = '#2a170e'; ctx.beginPath(); ctx.ellipse(-30, 15, 3, 2, 0, 0, TAU); ctx.fill();
        // buskiga ögonbryn (rör sig med humöret)
        const browY = p.rage >= 0 ? 4 : (p.sad ? -4 : 0), browA = p.rage >= 0 ? 0.35 : (p.sad ? -0.3 : 0);
        ctx.fillStyle = '#120c08';
        [[-24, -22], [4, -24]].forEach(([ex, ey], i) => {
            ctx.save(); ctx.translate(ex, ey + browY); ctx.rotate(i === 0 ? browA : -browA);
            ctx.beginPath(); ctx.ellipse(0, 0, 13, 4.5, 0, 0, TAU); ctx.fill();
            for (let k = 0; k < 8; k++) { ctx.fillRect(-12 + k * 3, -6 + (k % 2) * 2, 2, 5); }
            ctx.restore();
        });
        // mun: neutral, flin eller öppen
        if (p.grin) {
            ctx.fillStyle = '#1a0605'; ctx.beginPath(); ctx.moveTo(-34, 22); ctx.quadraticCurveTo(-6, 44, 22, 20); ctx.quadraticCurveTo(-6, 30, -34, 22); ctx.fill();
            ctx.fillStyle = '#e9dcb6'; for (let k = 0; k < 7; k++) ctx.fillRect(-28 + k * 7, 24 + Math.sin(k * 0.6) * 2, 4.5, 5);
            if (p.goldTooth) { ctx.fillStyle = '#ffd34d'; ctx.fillRect(-7, 26, 4.5, 5); }
        } else if (p.mouthOpen) {
            ctx.fillStyle = '#1a0605'; ctx.beginPath(); ctx.ellipse(-12, 28, 9, 7 * p.mouthOpen, 0, 0, TAU); ctx.fill();
        } else {
            ctx.strokeStyle = '#0a0505'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-30, 26); ctx.quadraticCurveTo(-14, p.sad ? 22 : 30, 4, 26); ctx.stroke();
        }
        // ögon under brättet
        const glow = p.eyeGlow == null ? 1 : p.eyeGlow;
        [[-22, -11], [4, -13]].forEach(([ex, ey], i) => {
            const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, 14 * glow);
            g.addColorStop(0, 'rgba(255,250,170,' + glow + ')'); g.addColorStop(0.35, 'rgba(255,170,0,' + (0.8 * glow) + ')'); g.addColorStop(1, 'rgba(255,120,0,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ex, ey, 14 * glow + 0.1, 0, TAU); ctx.fill();
            ctx.fillStyle = '#1a0a00'; ctx.beginPath(); ctx.ellipse(ex - 2 + (p.look || 0), ey + 1, 1.6, 3, 0, 0, TAU); ctx.fill();
        });
        if (p.tear) { ctx.fillStyle = 'rgba(180,220,255,0.85)'; ctx.beginPath(); ctx.ellipse(-24, -2 + p.tear * 22, 2.2, 3.4, 0, 0, TAU); ctx.fill(); }
        // stråhatt (sombrero piri)
        if (!p.hatOff) {
        ctx.save(); ctx.translate(2, -26); ctx.rotate(p.hatTilt || -0.08);
        const brim = ctx.createLinearGradient(0, -12, 0, 12);
        brim.addColorStop(0, '#c9a465'); brim.addColorStop(0.5, '#9a7642'); brim.addColorStop(1, '#4a3418');
        ctx.fillStyle = brim; ctx.beginPath(); ctx.ellipse(0, 0, 92, 15, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = 'rgba(60,40,15,0.6)'; ctx.lineWidth = 1;
        for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(0, 0, 30 + k * 13, 4 + k * 2.2, 0, 0, TAU); ctx.stroke(); }
        const crown = ctx.createLinearGradient(-30, -50, 30, 0);
        crown.addColorStop(0, '#d8b77a'); crown.addColorStop(1, '#6e5128');
        ctx.fillStyle = crown; ctx.beginPath(); ctx.moveTo(-34, -2); ctx.bezierCurveTo(-36, -48, 36, -50, 34, -2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3a1b10'; ctx.fillRect(-34, -12, 68, 8); // hattband
        if (p.toothInHat) { ctx.fillStyle = '#ffd34d'; ctx.fillRect(20, -11, 5, 6); }
        // brättets slagskugga över ansiktet
        ctx.restore();
        } else {
            // utan hatt: en tovig kalufs
            ctx.fillStyle = '#120c08';
            blobPath(ctx, [[-36, -18], [-20, -40], [8, -44], [34, -30], [38, -10], [10, -24], [-14, -22]]); ctx.fill();
            ctx.strokeStyle = 'rgba(90,64,42,0.7)'; ctx.lineWidth = 2;
            for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.moveTo(-28 + k * 7, -30); ctx.lineTo(-30 + k * 7 + Math.sin(k) * 6, -48 - (k % 3) * 4); ctx.stroke(); }
        }
        const sh = ctx.createLinearGradient(0, -34, 0, p.hatOff ? -30 : -6);
        sh.addColorStop(0, 'rgba(0,0,0,0.5)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = sh; ctx.globalCompositeOperation = 'multiply'; ctx.beginPath(); ctx.ellipse(0, -8, 46, 16, 0, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        // cigarren
        if (p.cig) {
            ctx.save(); ctx.translate(-30, 26); ctx.rotate(p.cigAngle || 0.35);
            const cg = ctx.createLinearGradient(0, -4, 0, 4); cg.addColorStop(0, '#c49a62'); cg.addColorStop(0.5, '#8a5f33'); cg.addColorStop(1, '#4a2f17');
            ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(-40, -3.5); ctx.lineTo(-40, 3.5); ctx.lineTo(0, 4); ctx.fill();
            ctx.fillStyle = '#7a7470'; ctx.fillRect(-44, -3.3, 5, 6.6); // aska
            if (p.cigLit) {
                const em = 4 + Math.abs(Math.sin(now * 0.012)) * 2 + (p.puff || 0) * 3;
                const eg = ctx.createRadialGradient(-44, 0, 0, -44, 0, em * 2.6);
                eg.addColorStop(0, 'rgba(255,240,150,1)'); eg.addColorStop(0.3, 'rgba(255,90,0,0.9)'); eg.addColorStop(1, 'rgba(255,60,0,0)');
                ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(-44, 0, em * 2.6, 0, TAU); ctx.fill();
            } else { ctx.fillStyle = '#333'; ctx.fillRect(-42, -3, 3, 6); }
            ctx.restore();
        }
        ctx.restore();
    }

    function drawHatAlone(ctx, x, y, rot, toothIn) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        const brim = ctx.createLinearGradient(0, -12, 0, 12); brim.addColorStop(0, '#c9a465'); brim.addColorStop(1, '#4a3418');
        ctx.fillStyle = brim; ctx.beginPath(); ctx.ellipse(0, 0, 92, 15, 0, 0, TAU); ctx.fill();
        const crown = ctx.createLinearGradient(-30, -50, 30, 0); crown.addColorStop(0, '#d8b77a'); crown.addColorStop(1, '#6e5128');
        ctx.fillStyle = crown; ctx.beginPath(); ctx.moveTo(-34, -2); ctx.bezierCurveTo(-36, -48, 36, -50, 34, -2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#3a1b10'; ctx.fillRect(-34, -12, 68, 8);
        if (toothIn) { ctx.fillStyle = '#ffd34d'; ctx.fillRect(20, -11, 5, 6); }
        ctx.restore();
    }
    // Skalltaket som ett lur (horn-scenen)
    function drawLidHorn(ctx, x, y, rot) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(1.35, 1.35);
        const mg = ctx.createLinearGradient(-30, -20, 30, 0); mg.addColorStop(0, '#9aa3a8'); mg.addColorStop(0.5, '#5a6266'); mg.addColorStop(1, '#262b2e');
        ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(0, 0, 30, 20, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#1a0606'; ctx.beginPath(); ctx.ellipse(0, 0, 26, 7, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#d9cdae'; ctx.lineWidth = 3; ctx.stroke();
        ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 25, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        ctx.restore();
    }

    function drawPomberoArm(ctx, sx, sy, hx, hy, bend, now) {
        const el = ik2(sx, sy, hx, hy, 74, 70, bend);
        const g = ctx.createLinearGradient(sx - 30, sy - 30, sx + 30, sy + 30); g.addColorStop(0, '#5a4130'); g.addColorStop(1, '#16100c');
        limb(ctx, sx, sy, el[0], el[1], 26, 20, g);
        limb(ctx, el[0], el[1], hx, hy, 20, 15, g);
        // hand med klolika fingrar
        ctx.fillStyle = '#2a1d15'; ctx.beginPath(); ctx.ellipse(hx, hy, 11, 9, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = '#1b120c'; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
        for (let f = 0; f < 4; f++) { const a = Math.atan2(hy - el[1], hx - el[0]) + (f - 1.5) * 0.35; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * 14, hy + Math.sin(a) * 14); ctx.stroke(); }
        // päls på armen (båda segmenten)
        const r = rng(Math.floor(sx * 7 + sy));
        ctx.lineCap = 'round';
        [[sx, sy, el[0], el[1], 13], [el[0], el[1], hx, hy, 10]].forEach(([x1, y1, x2, y2, rad]) => {
            const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang), ny = Math.cos(ang);
            for (let i = 0; i < 34; i++) {
                const k = r(), side = (r() - 0.5) * 2, px = lerp(x1, x2, k) + nx * side * rad, py = lerp(y1, y2, k) + ny * side * rad;
                const fa = Math.PI / 2 + (r() - 0.5) * 0.7, len = 6 + r() * 7;
                ctx.strokeStyle = r() < 0.35 ? 'rgba(130,95,62,0.55)' : 'rgba(14,10,7,0.7)'; ctx.lineWidth = 1.6;
                ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(fa) * len, py + Math.sin(fa) * len); ctx.stroke();
            }
        });
        return el;
    }

    const EM = window.EliteMelee;

    // Tidslinjen (sekunder). Varje steg sätter undertext och rörelse.
    function buildPomberoTimeline(self) {
        const S = self, ps = () => S._pomb;
        const rib = (n, line, txt, beep) => () => {
            S.pomberoRibs = n; S.pomberoLine = line;
            S.playBoneCrunch(true); if (beep) S.playCensorBeep(0.34);
            S.camShake = 10 + n * 3; ps().dig = 0.5;
            ps().splats.push({ x: 300 + n * 25, y: 290, t: 0 });
            S.addLog(txt, '#ffab40');
        };
        const find = (kind, line, log, holdFor) => () => {
            const st = ps(); st.held = kind; st.heldT = 0; st.holdFor = holdFor || 1.6; S.pomberoLine = line;
            S.addLog(log, '#ffcc80');
        };
        return [
            { t: 0.6, run: () => { ps().cigLit = true; SFX.match(S); ps().puff = 1; } },
            { t: 2.0, run: () => {
                S.pomberoSkullOpen = true; S.pomberoLine = 1; ps().lidT = 0;
                S.playBoneCrunch(true); S.playCensorBeep(0.32); S.camShake = 18;
                S.addLog('💀🔍 [KRANIET ÖPPNAS]: El Pombero bänder upp skalltaket som locket på en burk.', '#ff5252');
            } },
            { t: 4.6, run: () => { ps().held = 'skull_shake'; ps().heldT = 0; ps().holdFor = 2.0; S.addLog('🪲 Han vänder på skallen och skakar. Ut ramlar en död skalbagge och lite damm.', '#ffcc80'); } },
            { t: 5.4, run: () => { ps().tossed.push({ kind: 'beetle', x: 250, y: 312, vx: -30, vy: -60, rot: 0, vr: 6, t: 0 }); } },
            { t: 7.0, run: () => { S.pomberoLine = 2; S.pomberoPauseUntil = 9; S.playBoneCrunch(false); setTimeout(() => S.playBoneCrunch(false), 220); } },
            { t: 9.0, run: () => { S.pomberoLine = 14; ps().horn = 0; SFX.horn(S); S.addLog('📯 [BUUUUH]: Han blåser i skallen som i ett lur. Det ekar tomt i hela katakomben.', '#ffcc80'); } },
            { t: 11.5, run: () => { S.pomberoLine = 3; S.pomberoGrinUntil = 15; S.speakLine && S.speakLine('je, je, je...', 'es-PY', 0.2, 0.7); } },
            { t: 13.0, run: rib(1, 4, '🦴 [REVBEN #1]: *KNAK!* "¡Nde rakóre!"', true) },
            { t: 15.0, run: find('spoon', 15, '🥄 [FYND #1]: En rostig sked från 1540-talet. Han kastar den över axeln.', 1.5) },
            { t: 17.0, run: () => { S.pomberoLine = 5; S.pomberoPauseUntil = 19.5; S.playCigarettePuff(); ps().blowSmoke = 1.6; S.addLog('🚬 [BLOSS]: Han blåser ut röken rakt ner i bröstkorgen. "Ingen brådska."', '#ffd54f'); } },
            { t: 19.5, run: rib(2, 6, '🦴 [REVBEN #2]: *KRAAK!* "¿Dónde metiste mi Caña?"', true) },
            { t: 21.5, run: () => { find('letter', 16, '💌 [FYND #2]: Ett kärleksbrev, aldrig skickat: "Min älskade Isabel..." El Pombero läser. Han snyftar.', 4.6)(); SFX.paper(S); } },
            { t: 24.4, run: () => { ps().tearT = 0; } },
            { t: 26.0, run: () => { S.pomberoLine = 17; } },
            { t: 27.5, run: rib(3, 7, '🦴 [REVBEN #3]: *KNAK!* Klorna blir trötta.', false) },
            { t: 29.5, run: () => { S.pomberoLine = 8; S.pomberoGrinUntil = 32; S.playTendonSnap && S.playTendonSnap(); } },
            { t: 31.0, run: rib(4, 9, '🦴 [REVBEN #4]: *KRRRAK!* "¡Ndaipóri mba\'eve gueteri!"', true) },
            { t: 33.0, run: () => { find('tooth', 18, '🦷 [FYND #3]: En guldtand. Han biter i den för att se att den är äkta – och stoppar den i hattbandet.', 2.3)(); } },
            { t: 34.0, run: () => SFX.bite(S) },
            { t: 35.8, run: () => { S.pomberoLine = 10; S.pomberoPauseUntil = 37.2; SFX.squelch(S); S.camShake = 8; ps().dig = 1.2; } },
            { t: 37.2, run: () => { find('heart', 19, '🫀 [FYND #4]: Ett hjärta, intorkat som ett russin. Han luktar på det och slänger det.', 1.4)(); } },
            { t: 39.6, run: rib(5, 11, '🦴 [REVBEN #5]: *KRAAAK!* "...¡¿MBA\'EVE?!"', true) },
            { t: 41.0, run: () => {
                S.pomberoHeroReact = true;
                const hKey = S.hero ? S.hero.key : 'bloom';
                if (hKey === 'gomez' || hKey === 'villalba') S.speakLine && S.speakLine('Okej, visst dras jag till killar som inte skäms för vilka de är, men du är inte riktigt min typ ändå.', 'sv-SE', 1.05, 0.95);
            } },
            { t: 44.0, run: () => {
                S.pomberoHeroReact = false; S.pomberoLine = 20; ps().held = 'flask'; ps().heldT = 0; ps().holdFor = 99; ps().triumph = 0;
                SFX.sting(S); S.camShake = 6;
                S.cinemaBanner = '🍶 ¡LA BOTA!'; S.addLog('🍶‼️ [FYND #5]: Längst in, under det sista revbenet: en läderflaska!', '#69f0ae');
            } },
            { t: 46.6, run: () => { ps().held = 'flask_open'; SFX.uncork(S); ps().drink = 0; ps().hatFall = 0; } },
            { t: 47.6, run: () => { S.pomberoLine = 21; ps().drop = 0; } },
            { t: 49.25, run: () => { SFX.plip(S); ps().drop = -1; } },
            { t: 50.4, run: () => {
                S.pomberoLine = 12; S.pomberoPauseUntil = 54; ps().held = null; ps().sad = true;
                ps().tossed.push({ kind: 'flask_open', x: 470, y: 150, vx: 30, vy: 20, rot: 0.4, vr: 2, t: 0 });
                S.speakLine && S.speakLine("Mba'eve...", 'es-PY', 0.2, 0.6);
                S.cinemaBanner = '';
                S.addLog('😔 [EN DROPPE]: En enda droppe. Cigarren hänger. "...Ni una gota."', '#b0bec5');
            } },
            { t: 54.5, run: () => {
                S.pomberoLine = 13; ps().sad = false; ps().rage = 0; ps().hatFall = -1; // smäller på sig hatten igen
                S.playCensorBeep(0.4); S.camShake = 22;
                S.speakLine && S.speakLine('Nde mondaha!', 'es-PY', 0.15, 0.7);
                S.addLog('😡🔥 [RASERIET]: Han fimpar cigarren mot ett revben och vänder sig mot dig.', '#ff5252');
            } },
            { t: 55.6, run: () => { ps().cigLit = false; SFX.noise(S, 0.3, 'highpass', 4000, 2000, 0.2); } }
        ];
    }

    Object.assign(EM, {
        pomberoDuration: 60,

        startPomberoCanaSearchCutscene: function () {
            this.phase = 'takeover_anim';
            this.gauntlet.takeoverTriggeredForWave = true;
            this.pomberoSearchTimer = 0; this.pomberoSearchStep = 0; this.pomberoSmokePuffs = [];
            this.pomberoRibs = 0; this.pomberoSkullOpen = false; this.pomberoGrinUntil = 0; this.pomberoPauseUntil = 0;
            this.pomberoLine = 0; this.pomberoHeroReact = false;
            this._pomb = { cigLit: false, puff: 0, held: null, heldT: 0, holdFor: 0, tossed: [], splats: [], lidT: -1, dig: 0, horn: -1, tearT: -1, blowSmoke: 0, drop: -2, drink: -1, triumph: -1, sad: false, rage: -1, toothInHat: false, hatFall: -1 };
            this._pomberoEv = buildPomberoTimeline(this);
            this.usurper = { who: 'pombero', type: 'pombero', name: 'EL POMBERO', x: 620, y: 432, stage: 'pombero_cana_autopsy', timer: 0 };
            this.speakLine && this.speakLine('Moõpa oĩ che káña, nde mondaha!', 'es-PY', 0.25, 0.78);
            this.cinemaBanner = '🚬 ¡EL POMBERO BUSCA SU CAÑA!';
            this.cinemaSubBanner = '';
            this.addLog('🚬👹 [EL POMBERO]: Han sätter sig på huk över den ryckande conquistadoren och tänder en cigarr. Han har ingen brådska.', '#ffd54f');
        },
        _buildPomberoEvents: function () { return buildPomberoTimeline(this); },

        updatePomberoCanaSearch: function (rawDt) {
            if (!this._pomb) this.startPomberoCanaSearchCutscene();
            const st = this._pomb;
            this.pomberoSearchTimer += rawDt;
            const t = this.pomberoSearchTimer;
            const ev = this._pomberoEv || (this._pomberoEv = buildPomberoTimeline(this));
            while (this.pomberoSearchStep < ev.length && t >= ev[this.pomberoSearchStep].t) { const e = ev[this.pomberoSearchStep++]; e.run(); }

            // cigarrök
            if (st.cigLit && Math.random() < 0.22) this.pomberoSmokePuffs.push({ x: st.cigTipX || 400, y: st.cigTipY || 200, vx: -14 + Math.random() * 12, vy: -18 - Math.random() * 12, r: 3 + Math.random() * 4, a: 0.32 });
            if (st.blowSmoke > 0) { st.blowSmoke -= rawDt; if (Math.random() < 0.5) this.pomberoSmokePuffs.push({ x: 390 + Math.random() * 20, y: 232, vx: -50 + Math.random() * 30, vy: 34 + Math.random() * 26, r: 6 + Math.random() * 8, a: 0.38 }); }
            smokeStep(this.pomberoSmokePuffs, rawDt);
            if (this.pomberoSmokePuffs.length > 160) this.pomberoSmokePuffs.splice(0, this.pomberoSmokePuffs.length - 160);
            st.puff = Math.max(0, st.puff - rawDt * 1.5);
            st.dig = Math.max(0, st.dig - rawDt);
            if (st.lidT >= 0) st.lidT += rawDt;
            if (st.horn >= 0) { st.horn += rawDt; if (st.horn > 2.2) st.horn = -1; }
            if (st.tearT >= 0) st.tearT += rawDt;
            if (st.held) {
                st.heldT += rawDt;
                if (st.heldT > st.holdFor && st.held !== 'skull_shake') {
                    if (st.held === 'tooth') { st.toothInHat = true; }
                    else if (st.held !== 'flask' && st.held !== 'flask_open') {
                        // kastas över axeln
                        st.tossed.push({ kind: st.held, x: st.handX || 470, y: st.handY || 200, vx: 140 + Math.random() * 60, vy: -260, rot: 0, vr: st.held === 'letter' ? 1.5 : 9, t: 0, flutter: st.held === 'letter' });
                        SFX.clatter(this);
                    }
                    st.held = null;
                } else if (st.held === 'skull_shake' && st.heldT > st.holdFor) st.held = null;
            }
            if (st.triumph >= 0) st.triumph += rawDt;
            if (st.drink >= 0) st.drink += rawDt;
            if (st.drop >= 0) st.drop += rawDt;
            if (st.rage >= 0) st.rage += rawDt;
            if (st.hatFall >= 0) st.hatFall += rawDt;
            st.tossed.forEach(o => {
                o.t += rawDt;
                if (o.flutter) { o.vx *= 0.98; o.vy = Math.min(o.vy + 320 * rawDt, 75); o.x += Math.sin(o.t * 5) * 1.2; }
                else o.vy += 700 * rawDt;
                o.x += o.vx * rawDt; o.y += o.vy * rawDt; o.rot += o.vr * rawDt;
                if (o.y > 372 && !o.landed) { o.y = 372; o.landed = true; o.vx = 0; o.vy = 0; o.vr = 0; if (!o.flutter) SFX.clatter(this); }
            });
            st.splats.forEach(s => s.t += rawDt);

            if (t >= this.pomberoDuration) {
                this._pomb = null;
                this.gauntlet.stage = 'pombero_boss';
                this.gauntlet.takeoverTriggeredForWave = false;
                this.enemy = this.createGauntletEnemy('pombero_boss');
                this.enemy.injuries.bloodCoat = 0.85;
                this.usurper = null; this.cinemaBanner = ''; this.cinemaSubBanner = ''; this.phase = 'fighting';
                this.addLog('👹🔥 SLUTSTRID: El Pombero hittade bara en droppe Caña. Nu ger han sig på DIG! Besegra honom så bjuder Sensei Takeda på Sake.', '#ffd54f');
                this.updateTopBars();
            }
        },

        drawPomberoCanaSearchScene: function (ctx, w, h, now) {
            const st = this._pomb; if (!st) return;
            const t = this.pomberoSearchTimer;
            ctx.save();
            // långsam kameraåkning in mot liket under hela scenen + skak
            const zoom = 1 + clamp(t / 60, 0, 1) * 0.12 + (st.triumph >= 0 && st.triumph < 0.6 ? (0.6 - st.triumph) * 0.08 : 0);
            const shx = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake * 0.5 : 0, shy = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake * 0.5 : 0;
            ctx.translate(W / 2 + shx, 250 + shy); ctx.scale(zoom, zoom); ctx.translate(-W / 2, -250);

            ctx.drawImage(catacomb(), 0, 0);
            FX.torch(ctx, 118, 128, now, 1);

            drawCorpse(ctx, {
                ribs: this.pomberoRibs || 0, skullOpen: this.pomberoSkullOpen,
                lidHidden: st.horn >= 0,
                lidX: lerp(258, 186, ease(st.lidT * 2)), lidY: lerp(300, 362, ease(st.lidT * 2)), lidRot: lerp(-0.25, -0.9, ease(st.lidT * 2))
            }, now);
            // blodstänk från revbenen
            st.splats.forEach(s => { if (s.t < 0.6) { ctx.fillStyle = 'rgba(140,10,15,' + (0.8 - s.t) + ')'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(s.x + Math.cos(i) * s.t * 70, s.y - Math.abs(Math.sin(i * 1.7)) * s.t * 90 + s.t * s.t * 120, 3, 0, TAU); ctx.fill(); } } });

            // ── El Pomberos pose beror på vad han gör ──
            const paused = t < (this.pomberoPauseUntil || 0);
            const digBob = st.dig > 0 ? Math.sin(now * 0.04) * 6 * st.dig : Math.sin(now * 0.004) * 2;
            const P = { x: 440, y: 222 + digBob, lean: -0.12, cig: true, cigLit: st.cigLit, puff: st.puff, grin: t < (this.pomberoGrinUntil || 0), goldTooth: st.toothInHat, toothInHat: st.toothInHat, eyeGlow: 1, look: -2, sad: st.sad };
            let hl = [330 + Math.sin(now * 0.02) * 10, 300], hr = [400 + Math.cos(now * 0.02) * 12, 302]; // händerna rotar i bröstet
            let bendL = 1, bendR = -1;
            if (t < 2.0) { hl = [262, 300]; hr = [300, 296]; P.headTilt = -0.15; }                   // greppar skalltaket
            if (st.held === 'skull_shake') { const s = Math.sin(now * 0.05) * 10; hl = [268 + s, 250]; hr = [300 + s, 252]; P.headTilt = -0.25; }
            if (st.horn >= 0) { hl = [362, 196]; hr = [392, 214]; P.headDX = -4; P.headTilt = -0.12; P.mouthOpen = 0.8; P.cig = false; P.eyeGlow = 0.8 + Math.sin(now * 0.02) * 0.3; }
            if (st.held === 'letter') { hl = [380, 250]; hr = [420, 258]; P.headTilt = 0.32; P.headDX = -8; P.headDY = 6; P.look = -1; P.lean = -0.06; P.sad = true; }
            if (st.held === 'tooth') { hl = [436, 200]; hr = [430, 258]; P.headTilt = 0.05; P.grin = st.heldT > 1.0 && st.heldT < 1.8; P.mouthOpen = st.heldT > 0.8 && st.heldT <= 1.0 ? 0.8 : 0; }
            if (st.held === 'heart') { hl = [436, 206]; hr = [400, 300]; P.headTilt = 0.18; P.look = 2; }
            if (st.held === 'spoon') { hl = [420, 220]; hr = [400, 300]; P.headTilt = 0.1; }
            if (st.held === 'flask') { const k = ease(st.heldT / 0.6); hr = [lerp(400, 476, k), lerp(300, 110, k)]; hl = [372, 286]; P.headTilt = -0.2; P.eyeGlow = 1.35; P.grin = true; P.lean = 0.05; }
            if (st.held === 'flask_open') {
                const k = ease((st.drink || 0) / 0.9);
                hr = [lerp(476, 431, k), lerp(110, 74, k)]; hl = [372, 286]; P.headTilt = lerp(-0.2, -0.25, k); P.headDY = -6 * k; P.mouthOpen = 1.6; P.cig = false; P.eyeGlow = 0.95; P.look = 0;
            }
            if (st.sad) { P.cigAngle = -0.95; P.eyeGlow = 0.55; P.headTilt = 0.22; hl = [360, 300]; hr = [420, 304]; }
            if (st.rage >= 0) { P.eyeGlow = 1.9; P.headTilt = -0.05; P.look = -3; hr = [340, 286]; P.cigAngle = 0.9; P.grin = true; P.rage = st.rage; }
            if (st.sad) P.sad = true;
            P.hatOff = st.hatFall >= 0;
            if (this.pomberoHeroReact) { P.look = 4; }
            if (paused && !st.held && st.horn < 0 && !st.sad && st.rage < 0) { hl[1] -= 4; hr[1] -= 6; }

            // bortre arm bakom kroppen, kroppen, främre arm
            const sL = [P.x - 46, P.y - 34], sR = [P.x + 30, P.y - 30];
            const flaskUp = (st.held === 'flask' || st.held === 'flask_open');
            if (!flaskUp) drawPomberoArm(ctx, sR[0], sR[1], hr[0], hr[1], bendR, now);
            drawPombero(ctx, P, now);
            if (flaskUp) drawPomberoArm(ctx, sR[0] + 8, sR[1] + 6, hr[0] + 10, hr[1] + 6, -1, now); // armen som lyfter flaskan, framför kroppen
            drawPomberoArm(ctx, sL[0], sL[1], hl[0], hl[1], bendL, now);
            st.handX = hl[0]; st.handY = hl[1];
            // cigarrens glödspets (för röken)
            st.cigTipX = P.x - 18 - 30 - Math.cos(P.cigAngle || 0.35) * 41; st.cigTipY = P.y - 78 + 26 - Math.sin(P.cigAngle || 0.35) * 41;

            // föremål i handen
            if (st.horn >= 0) drawLidHorn(ctx, 376, 168, -1.25);
            if (st.held === 'skull_shake') { /* skallen är redan i liket – händerna skakar den */ }
            else if (st.held === 'letter') drawItem(ctx, 'letter', 396, 240, -0.18, 1.3, now);
            else if (st.held === 'flask' || st.held === 'flask_open') {
                const kd = ease((st.drink || 0) / 0.9);
                const rot = st.held === 'flask_open' ? lerp(0, Math.PI, kd) : Math.sin(now * 0.01) * 0.12;
                drawItem(ctx, st.held, hr[0] + lerp(4, -14, kd), hr[1] - 14 * (1 - kd), rot, 1.25, now);
                if (st.held === 'flask' && st.heldT < 2.4) { // glimt av ljus
                    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const gl = ctx.createRadialGradient(hr[0] + 4, hr[1] - 20, 0, hr[0] + 4, hr[1] - 20, 70);
                    gl.addColorStop(0, 'rgba(255,230,150,' + (0.5 * (1 - st.heldT / 2.4)) + ')'); gl.addColorStop(1, 'rgba(255,200,100,0)'); ctx.fillStyle = gl; ctx.fillRect(hr[0] - 70, hr[1] - 90, 140, 140); ctx.restore();
                }
            }
            else if (st.held) drawItem(ctx, st.held, hl[0], hl[1] - 6, 0.3, 1.3, now);

            // den enda droppen
            if (st.drop >= 0) {
                const k = clamp(st.drop / 1.6, 0, 1);
                const sx = 417, sy = 110, ey = 166; // från flaskhalsen ner i den öppna munnen
                const y = st.drop < 0.5 ? sy + Math.sin(st.drop * 14) * 1.2 : lerp(sy, ey, ease((st.drop - 0.5) / 1.15));
                const sz = st.drop < 0.5 ? 2.5 + st.drop * 6 : 5.5;
                ctx.save(); ctx.globalCompositeOperation = 'lighter';
                const dg = ctx.createRadialGradient(sx, y, 0, sx, y, 22); dg.addColorStop(0, 'rgba(255,225,150,0.75)'); dg.addColorStop(1, 'rgba(255,200,120,0)');
                ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(sx, y, 22, 0, TAU); ctx.fill(); ctx.restore();
                ctx.fillStyle = 'rgba(230,200,140,0.95)'; ctx.beginPath(); ctx.moveTo(sx, y - sz * 1.8); ctx.quadraticCurveTo(sx + sz, y, sx, y + sz); ctx.quadraticCurveTo(sx - sz, y, sx, y - sz * 1.8); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(sx - sz * 0.3, y - sz * 0.2, sz * 0.25, 0, TAU); ctx.fill();
                if (k >= 1) st.drop = -1;
            }

            // kastade föremål
            st.tossed.forEach(o => drawItem(ctx, o.kind, o.x, o.y, o.rot, 1.1, now));
            // hatten som trillat av när han lutade sig bakåt för att dricka
            if (st.hatFall >= 0) { const k = ease(st.hatFall / 0.7); drawHatAlone(ctx, lerp(440, 560, k), lerp(110, 360, k) - Math.sin(k * Math.PI) * 40, lerp(-0.4, 0.25, k) + k * 6.28, st.toothInHat); }
            smokeDraw(ctx, this.pomberoSmokePuffs);

            // "BUUUH"-ringar ur skallen
            if (st.horn >= 0) {
                for (let i = 0; i < 4; i++) { const k = ((st.horn * 1.6 + i * 0.25) % 1); ctx.strokeStyle = 'rgba(255,230,180,' + (0.4 * (1 - k)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(350, 190, 20 + k * 110, -0.6, 0.6); ctx.stroke(); }
            }

            lightPass(ctx, 200, 160, 900, now);
            // varm kantljus från facklan på Pomberos vänstra sida
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            const rim = ctx.createRadialGradient(400, 180, 10, 400, 180, 120); rim.addColorStop(0, 'rgba(255,140,50,0.10)'); rim.addColorStop(1, 'rgba(255,140,50,0)');
            ctx.fillStyle = rim; ctx.fillRect(280, 60, 240, 240);
            // cigarrens glöd lyser upp ansiktet
            if (st.cigLit) { const cg = ctx.createRadialGradient(st.cigTipX, st.cigTipY, 0, st.cigTipX, st.cigTipY, 60 + st.puff * 40); cg.addColorStop(0, 'rgba(255,90,20,' + (0.25 + st.puff * 0.3) + ')'); cg.addColorStop(1, 'rgba(255,60,0,0)'); ctx.fillStyle = cg; ctx.fillRect(st.cigTipX - 100, st.cigTipY - 100, 200, 200); }
            ctx.restore();
            ctx.restore();

            // ── utanför kameran: filmeffekter, titel, undertexter ──
            FX.finish(ctx, now, { vignette: 0.75 });
            FX.title(ctx, this.cinemaBanner);
            FX.subtitles(ctx, this.pomberoLinesData[Math.min(this.pomberoLine || 0, this.pomberoLinesData.length - 1)]);
            if (this.pomberoHeroReact && this.drawHeroReactionPiP) { ctx.save(); ctx.translate(560, 222); ctx.scale(0.8, 0.8); ctx.translate(-36, -86); this.drawHeroReactionPiP(ctx, w, h, now); ctx.restore(); } // nere till höger, ur vägen för liket och experterna
        }
    });

    // De nya replikerna hakas på de autentiska Guaraní-replikerna (index 14–21)
    const base = (EM.pomberoLinesData || []).slice(0, 14);
    EM.pomberoLinesData = base.concat(POMBERO_LINES_EXTRA);

    // ───────────── Kopplingen in i renderingen ─────────────
    // Anropas först i renderArena. Returnerar true om en målad scen ritades (då hoppas 2D/3D-arenan över).
    EM.renderPaintedCinematic = function (now) {
        const glc = typeof document !== 'undefined' ? document.getElementById('mk-webgl-canvas') : null;
        let painted = false;
        if (this.ctx && this.canvas) {
            if (this.phase === 'takeover_anim' && this.usurper && this.usurper.stage === 'pombero_cana_autopsy') {
                this.drawPomberoCanaSearchScene(this.ctx, this.canvas.width, this.canvas.height, now); painted = true;
            } else if (this.phase === 'enemy_fatality_anim' && this.drawMierdaPainted && (this.enemyFatalityStage === 'piss_side_stance' || this.enemyFatalityStage === 'piss_front_closeup')) {
                this.drawMierdaPainted(this.ctx, now); painted = true;
            } else if (this.phase === 'over' && this.enemyFatalityStage === 'piss_front_closeup' && this.hero && this.hero.hp <= 0 && this.drawMierdaPainted) {
                this.drawMierdaPainted(this.ctx, now); painted = true; // sista bilden står kvar bakom DERROTA
            }
        }
        if (glc && glc.style) { const v = painted ? 'hidden' : 'visible'; if (glc.style.visibility !== v) glc.style.visibility = v; }
        return painted;
    };

    // Exporteras för Mierda-delen nedan
    EM._cine = { FX, SFX, rng, offscreen, blobPath, ik2, limb, bone, catacomb, lightPass, smokeStep, smokeDraw, lerp, ease, clamp, W, H, BAR_T, BAR_B, TAU };
})();

// ═════════════════════════════════════════════════════════════════════
//  2. CONQUISTADORENS MISSLYCKADE URINERING
// ═════════════════════════════════════════════════════════════════════
(function () {
    const EM = window.EliteMelee;
    const C = EM._cine;
    const { FX, SFX, rng, blobPath, limb, bone, catacomb, lightPass, lerp, ease, clamp, W, BAR_T, BAR_B, TAU } = C;

    const LINES = [
        /*0*/ { g: '"Y ahora... la marca del vencedor."', e: '(El hidalgo se planta sobre el vencido, como dicta la tradición.)', s: '"Och nu... segrarens märke." Hidalgon ställer sig över den besegrade, som traditionen bjuder.' },
        /*1*/ { g: '*ÑIIIK* *ÑIIIK* *ÑIIIK*', e: '(La bragueta de acero lleva cuatrocientos años oxidada.)', s: 'Stålbraguetan har suttit fastrostad i fyrahundra år.' },
        /*2*/ { g: '*¡CLANG!*', e: '"¡Por fin, coño!"', s: '"Äntligen, för fan!"' },
        /*3*/ { g: '...', e: '(Grillos.)', s: '(Syrsor.)' },
        /*4*/ { g: '*pfff*', e: '(Sale un poquito de polvo.)', s: '(Det kommer lite damm.)' },
        /*5*/ { g: '"¿Qué...?"', e: '(Los calzones del siglo XVI se deshacen en polvo.)', s: 'Byxorna från 1500-talet förvandlas till damm.' },
        /*6*/ { g: '...', e: '(Una polilla sale volando. Vivía allí desde 1611.)', s: 'En mal flyger ut. Den har bott där sedan 1611.' },
        /*7*/ { g: '...', e: '(Una araña lo saluda desde su tela.)', s: 'En spindel vinkar från sitt nät.' },
        /*8*/ { g: '"...Mierda."', e: '', s: '"...Skit också."' },
        /*9*/ { g: '*clank*', e: '(Se vuelve a poner la bragueta. Con dignidad.)', s: 'Han sätter tillbaka braguetan. Med värdighet.' }
    ];

    const SIDE_LEN = 7.2, FRONT_LEN = 11.2;

    function freshState() {
        return { line: 0, codT: -1, codFall: -1, hips: -1, cricket: -1, puff: -1, q: -1, crumble: -1, moth: -1, spider: -1, pupils: -1, mierda: -1, dignity: -1, dust: [], shards: [] };
    }

    // ───────── Ritverktyg för rustning ─────────
    function steel(ctx, x0, y0, x1, y1) {
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, '#8d969b'); g.addColorStop(0.35, '#4f575c'); g.addColorStop(0.7, '#2a3034'); g.addColorStop(1, '#141719');
        return g;
    }
    function rust(ctx, seed, x, y, w, h, n) {
        const r = rng(seed);
        for (let i = 0; i < (n || 18); i++) { ctx.fillStyle = 'rgba(' + (120 + r() * 30 | 0) + ',' + (45 + r() * 20 | 0) + ',16,' + (0.25 + r() * 0.4) + ')'; ctx.beginPath(); ctx.ellipse(x + r() * w, y + r() * h, 2 + r() * 6, 1.5 + r() * 4, r() * 3, 0, TAU); ctx.fill(); }
    }
    function rivet(ctx, x, y) { ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(x, y, 2.3, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,240,200,0.7)'; ctx.beginPath(); ctx.arc(x - 0.7, y - 0.7, 0.9, 0, TAU); ctx.fill(); }

    // Braguetan (stålskål i rustningens skrev) – ritas centrerad kring (0,0)
    function codpiece(ctx, x, y, rot, s, profile) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s || 1, s || 1);
        if (profile) {
            ctx.fillStyle = steel(ctx, -10, -14, 12, 14);
            ctx.beginPath(); ctx.moveTo(4, -16); ctx.bezierCurveTo(-20, -14, -22, 10, 2, 16); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 2; ctx.stroke();
        } else {
            ctx.fillStyle = steel(ctx, -16, -18, 16, 18);
            ctx.beginPath(); ctx.moveTo(-15, -16); ctx.lineTo(15, -16); ctx.quadraticCurveTo(18, 6, 0, 22); ctx.quadraticCurveTo(-18, 6, -15, -16); ctx.fill();
            ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 2.2; ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-6, -4, 3, 9, 0.2, 0, TAU); ctx.fill();
            rivet(ctx, -11, -12); rivet(ctx, 11, -12); rivet(ctx, 0, 12);
        }
        rust(ctx, 77, -12, -14, 24, 28, 6);
        ctx.restore();
    }

    // Morionhjälm + kranium i profil (tittar åt vänster)
    function skullProfile(ctx, x, y, tilt, now, st) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
        const sk = ctx.createRadialGradient(-8, -6, 4, 0, 0, 34);
        sk.addColorStop(0, '#efe4c4'); sk.addColorStop(0.7, '#b4a47c'); sk.addColorStop(1, '#5e5034');
        ctx.fillStyle = sk;
        ctx.beginPath(); ctx.moveTo(18, -22); ctx.bezierCurveTo(22, 8, 14, 22, 2, 26); ctx.lineTo(-18, 26); ctx.lineTo(-26, 16); ctx.lineTo(-30, 4); ctx.bezierCurveTo(-30, -16, -10, -30, 18, -22); ctx.fill();
        // ögonhåla med röd glöd
        ctx.fillStyle = '#0a0303'; ctx.beginPath(); ctx.ellipse(-14, -2, 7, 8, 0.1, 0, TAU); ctx.fill();
        const glow = st && st.q >= 0 ? 0.5 : 0.85;
        const eg = ctx.createRadialGradient(-15, -1, 0, -15, -1, 8);
        eg.addColorStop(0, 'rgba(255,50,50,' + (glow * (0.7 + 0.3 * Math.sin(now * 0.008))) + ')'); eg.addColorStop(1, 'rgba(255,0,0,0)');
        ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(-15, -1, 8, 0, TAU); ctx.fill();
        ctx.fillStyle = '#0a0303'; ctx.beginPath(); ctx.moveTo(-28, 8); ctx.lineTo(-24, 14); ctx.lineTo(-31, 14); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e8ddc0'; for (let k = 0; k < 5; k++) ctx.fillRect(-28 + k * 5, 19, 3.6, 6);
        // käke
        ctx.fillStyle = '#c4b590'; ctx.beginPath(); ctx.moveTo(-26, 26); ctx.lineTo(6, 26); ctx.lineTo(10, 36); ctx.lineTo(-20, 38); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#efe6cc'; for (let k = 0; k < 4; k++) ctx.fillRect(-22 + k * 5, 23, 3.6, 4);
        // morion: kupol + kam + uppvikt brätte
        ctx.fillStyle = steel(ctx, -20, -50, 20, -14);
        ctx.beginPath(); ctx.ellipse(-2, -22, 30, 22, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#5c6468'; ctx.beginPath(); ctx.moveTo(-26, -40); ctx.quadraticCurveTo(-2, -66, 22, -38); ctx.lineTo(18, -36); ctx.quadraticCurveTo(-2, -58, -22, -38); ctx.fill();
        ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = steel(ctx, -50, -24, 46, -14);
        ctx.beginPath(); ctx.moveTo(-52, -32); ctx.quadraticCurveTo(-30, -18, -2, -20); ctx.quadraticCurveTo(26, -18, 46, -34); ctx.quadraticCurveTo(28, -12, -2, -13); ctx.quadraticCurveTo(-32, -12, -52, -32); ctx.fill();
        rust(ctx, 12, -40, -44, 70, 28, 10);
        ctx.restore();
    }

    // Kranium framifrån
    function skullFront(ctx, x, y, tilt, now, st) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(tilt.r || 0); ctx.translate(0, tilt.dy || 0);
        const sk = ctx.createRadialGradient(-10, -10, 6, 0, 0, 52);
        sk.addColorStop(0, '#f2e8c9'); sk.addColorStop(0.7, '#b4a47c'); sk.addColorStop(1, '#5e5034');
        ctx.fillStyle = sk; ctx.beginPath(); ctx.ellipse(0, 0, 44, 50, 0, 0, TAU); ctx.fill();
        // kindben
        ctx.fillStyle = 'rgba(80,64,40,0.4)'; ctx.beginPath(); ctx.ellipse(-26, 18, 10, 6, 0.4, 0, TAU); ctx.ellipse(26, 18, 10, 6, -0.4, 0, TAU); ctx.fill();
        // ögonhålor; pupillerna krymper av chock
        const pup = st.pupils >= 0 ? lerp(6, 2.2, ease(st.pupils / 0.5)) : 6;
        const lookDown = st.lookDown || 0;
        [-17, 17].forEach(ex => {
            ctx.fillStyle = '#080202'; ctx.beginPath(); ctx.ellipse(ex, -2, 13, 14, 0, 0, TAU); ctx.fill();
            const eg = ctx.createRadialGradient(ex, 2 + lookDown * 5, 0, ex, 2 + lookDown * 5, pup * 2.4);
            eg.addColorStop(0, 'rgba(255,90,80,1)'); eg.addColorStop(0.4, 'rgba(255,23,68,0.9)'); eg.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, 2 + lookDown * 5, pup * 2.4, 0, TAU); ctx.fill();
        });
        // näshåla
        ctx.fillStyle = '#0a0303'; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(-6, 26); ctx.lineTo(6, 26); ctx.closePath(); ctx.fill();
        // tänder och käke
        ctx.fillStyle = '#e9dfc2'; for (let k = 0; k < 8; k++) ctx.fillRect(-19 + k * 4.8, 34, 3.8, 7);
        const jaw = st.mierda >= 0 && st.mierda < 1.4 ? Math.abs(Math.sin(st.mierda * 9)) * 5 : 0;
        ctx.fillStyle = '#c4b590'; ctx.beginPath(); ctx.moveTo(-28, 42 + jaw); ctx.quadraticCurveTo(0, 62 + jaw, 28, 42 + jaw); ctx.lineTo(22, 40 + jaw); ctx.lineTo(-22, 40 + jaw); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#efe6cc'; for (let k = 0; k < 7; k++) ctx.fillRect(-17 + k * 4.8, 41 + jaw, 3.6, 5);
        // morion framifrån: kupol + kam + båtformat brätte
        ctx.fillStyle = steel(ctx, -40, -80, 40, -28);
        ctx.beginPath(); ctx.ellipse(0, -30, 44, 34, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#6a7276'; ctx.beginPath(); ctx.moveTo(-5, -96); ctx.lineTo(5, -96); ctx.lineTo(7, -32); ctx.lineTo(-7, -32); ctx.fill();
        ctx.fillStyle = steel(ctx, -80, -40, 80, -24);
        ctx.beginPath(); ctx.moveTo(-86, -48); ctx.quadraticCurveTo(-50, -24, 0, -26); ctx.quadraticCurveTo(50, -24, 86, -48); ctx.quadraticCurveTo(60, -16, 0, -18); ctx.quadraticCurveTo(-60, -16, -86, -48); ctx.fill();
        ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 2; ctx.stroke();
        rust(ctx, 31, -40, -64, 80, 40, 14);
        ctx.restore();
    }

    // ───────── PROFILBILDEN ─────────
    function drawSide(EM, ctx, now, st, t) {
        ctx.drawImage(catacomb(), 0, 0);
        FX.torch(ctx, 118, 128, now, 1);

        // den besegrade hjälten ligger på marken (enkel silhuett)
        const hp = ctx.createRadialGradient(250, 372, 10, 250, 372, 170);
        hp.addColorStop(0, 'rgba(80,6,8,0.9)'); hp.addColorStop(1, 'rgba(40,6,6,0)');
        ctx.fillStyle = hp; ctx.beginPath(); ctx.ellipse(250, 374, 180, 22, 0, 0, TAU); ctx.fill();
        const uni = EM.hero && EM.hero.key === 'gomez' ? '#5a1414' : (EM.hero && EM.hero.key === 'arandu' ? '#6b2a1c' : '#1b2836');
        ctx.fillStyle = uni; blobPath(ctx, [[150, 360], [250, 350], [340, 356], [350, 372], [250, 378], [150, 376]]); ctx.fill();
        ctx.fillStyle = '#3a2418'; ctx.beginPath(); ctx.ellipse(132, 364, 22, 15, 0.2, 0, TAU); ctx.fill(); // huvud
        ctx.fillStyle = '#14100d'; blobPath(ctx, [[340, 360], [400, 364], [404, 376], [342, 376]]); ctx.fill(); // ben

        // conquistadoren i profil, vänd åt vänster
        const X = 470, FLOOR = 382;
        const breathe = Math.sin(now * 0.003) * 1.5;
        const hipsUp = st.hips >= 0 ? ease(st.hips / 0.6) : 0; // händerna på höfterna, bröstet ut
        // bortre ben
        bone(ctx, X + 10, 272, X - 6, 326, 12); bone(ctx, X - 6, 326, X + 2, 372, 10);
        ctx.fillStyle = '#1a120c'; blobPath(ctx, [[X - 14, 360], [X + 14, 360], [X + 16, 382], [X - 30, 384], [X - 32, 374]]); ctx.fill();
        // främre ben (bredbent)
        bone(ctx, X - 4, 272, X - 30, 326, 12.5); bone(ctx, X - 30, 326, X - 40, 372, 10.5);
        ctx.fillStyle = '#21170f'; blobPath(ctx, [[X - 54, 362], [X - 26, 362], [X - 24, 384], [X - 76, 386], [X - 76, 376]]); ctx.fill();
        // pösiga trasiga byxor (gregüescos)
        const br = ctx.createLinearGradient(X - 40, 240, X + 40, 300); br.addColorStop(0, '#5a4430'); br.addColorStop(1, '#22180f');
        ctx.fillStyle = br; blobPath(ctx, [[X - 46, 234], [X + 40, 234], [X + 52, 270], [X + 28, 298], [X - 18, 306], [X - 56, 286]]); ctx.fill();
        ctx.strokeStyle = 'rgba(140,40,30,0.55)'; ctx.lineWidth = 4; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X - 30 + k * 16, 240); ctx.quadraticCurveTo(X - 34 + k * 16, 266, X - 26 + k * 14, 294); ctx.stroke(); }
        // braguetan sitter fast i skrevet (framåt = vänster)
        if (st.codFall < 0) {
            const wig = st.codT >= 0 && st.codFall < 0 ? Math.sin(now * 0.06) * 0.15 : 0;
            codpiece(ctx, X - 52, 264, wig, 1.3, true);
        }
        // bål: harnesk med spets fram (peascod)
        ctx.save(); ctx.translate(X, 236); ctx.rotate(-0.06 * hipsUp);
        ctx.fillStyle = steel(ctx, -40, -110, 40, 0);
        ctx.beginPath(); ctx.moveTo(36, -108); ctx.quadraticCurveTo(50, -50, 40, 0); ctx.lineTo(-40, 2); ctx.quadraticCurveTo(-74 - hipsUp * 8, -34, -48, -104); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-48, -104); ctx.quadraticCurveTo(-74 - hipsUp * 8, -34, -40, 2); ctx.stroke();
        const sheen = ctx.createLinearGradient(-60, 0, 40, 0); sheen.addColorStop(0, 'rgba(255,220,170,0.0)'); sheen.addColorStop(0.25, 'rgba(255,220,170,0.22)'); sheen.addColorStop(0.45, 'rgba(255,220,170,0)');
        ctx.fillStyle = sheen; ctx.beginPath(); ctx.moveTo(-48, -104); ctx.quadraticCurveTo(-74, -34, -40, 2); ctx.lineTo(0, 2); ctx.lineTo(0, -106); ctx.fill();
        rust(ctx, 5, -44, -100, 70, 100, 22);
        // tassets (lamellkjol)
        for (let k = 0; k < 3; k++) { ctx.fillStyle = steel(ctx, -40, k * 10, 40, k * 10 + 10); ctx.beginPath(); ctx.moveTo(-42 + k * 2, k * 10); ctx.lineTo(42, k * 10 - 2); ctx.lineTo(44, k * 10 + 10); ctx.lineTo(-40 + k * 2, k * 10 + 12); ctx.fill(); rivet(ctx, -30 + k * 2, k * 10 + 5); rivet(ctx, 30, k * 10 + 4); }
        ctx.restore();
        // bortre arm
        let hand = [X - 30, 262], hand2 = [X - 22, 266];
        if (st.codT >= 0 && st.codFall < 0) { const f = Math.sin(now * 0.05) * 4; hand = [X - 44 + f, 262]; hand2 = [X - 34 - f, 270]; }
        if (hipsUp > 0) { hand = [lerp(hand[0], X + 36, hipsUp), lerp(hand[1], 232, hipsUp)]; hand2 = [lerp(hand2[0], X - 44, hipsUp), lerp(hand2[1], 234, hipsUp)]; }
        const sh1 = [X + 14, 146], sh2 = [X - 8, 150];
        const el1 = C.ik2(sh1[0], sh1[1], hand[0], hand[1], 62, 60, -1);
        bone(ctx, sh1[0], sh1[1], el1[0], el1[1], 10); bone(ctx, el1[0], el1[1], hand[0], hand[1], 9);
        ctx.fillStyle = steel(ctx, hand[0] - 10, hand[1] - 8, hand[0] + 10, hand[1] + 8); ctx.beginPath(); ctx.ellipse(hand[0], hand[1], 12, 10, 0, 0, TAU); ctx.fill();
        // svärdet i bältet
        ctx.fillStyle = '#9a7a2a'; ctx.fillRect(X + 26, 226, 22, 6);
        ctx.fillStyle = steel(ctx, X + 30, 230, X + 120, 330);
        ctx.save(); ctx.translate(X + 40, 232); ctx.rotate(0.95); ctx.fillRect(0, -3, 120, 6); ctx.restore();
        // huvud
        const tilt = (st.hips >= 0 && st.q < 0 ? -0.28 * hipsUp : 0) + (st.q >= 0 ? lerp(-0.28, 0.32, ease(st.q / 0.8)) : 0);
        skullProfile(ctx, X - 4, 106 + breathe, tilt, now, st);
        // främre arm med pauldron
        const el2 = C.ik2(sh2[0], sh2[1], hand2[0], hand2[1], 62, 60, -1);
        ctx.fillStyle = steel(ctx, sh2[0] - 24, sh2[1] - 20, sh2[0] + 24, sh2[1] + 20);
        bone(ctx, sh2[0], sh2[1] + 10, el2[0], el2[1], 11); bone(ctx, el2[0], el2[1], hand2[0], hand2[1], 10);
        ctx.fillStyle = steel(ctx, sh2[0] - 30, sh2[1] - 24, sh2[0] + 30, sh2[1] + 24);
        ctx.beginPath(); ctx.ellipse(sh2[0], sh2[1] + 6, 34, 28, 0.2, Math.PI * 0.85, Math.PI * 2.15); ctx.fill();
        for (let k = 0; k < 2; k++) { ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sh2[0], sh2[1] + 12 + k * 9, 30 - k * 3, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke(); }
        rust(ctx, 44, sh2[0] - 28, sh2[1] - 20, 56, 40, 8);
        ctx.fillStyle = steel(ctx, hand2[0] - 12, hand2[1] - 10, hand2[0] + 12, hand2[1] + 10); ctx.beginPath(); ctx.ellipse(hand2[0], hand2[1], 14, 11, 0, 0, TAU); ctx.fill();

        // braguetan som faller och studsar
        if (st.codFall >= 0) {
            const k = st.codFall;
            let cx = X - 52 - k * 40, cy = 264, rot = k * 9;
            if (k < 0.45) cy = 262 + 0.5 * 1500 * k * k; else { const k2 = k - 0.45; cy = FLOOR - 8 - Math.max(0, 70 * k2 - 260 * k2 * k2); rot = 4 + k2 * 4; if (k > 1.2) { cx = X - 58; rot = 6.1; } }
            cy = Math.min(cy, FLOOR - 8); if (k > 1.2) cy = FLOOR - 8;
            codpiece(ctx, cx, cy, rot, 1, false);
        }
        // dammpuff ur bäckenet
        st.dust.forEach(d => { const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r); g.addColorStop(0, 'rgba(190,170,130,' + d.a + ')'); g.addColorStop(1, 'rgba(190,170,130,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill(); });
        // frågetecken
        if (st.q >= 0) { const a = clamp(st.q * 2, 0, 1); ctx.save(); ctx.globalAlpha = a; ctx.font = 'bold 44px Georgia'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.strokeText('?', X - 6, 40 + Math.sin(now * 0.004) * 3); ctx.fillStyle = '#ffd54f'; ctx.fillText('?', X - 6, 40 + Math.sin(now * 0.004) * 3); ctx.restore(); }
        // syrsorna: små noter i mörkret till höger
        if (st.cricket >= 0) { ctx.save(); ctx.font = '16px Georgia'; ctx.fillStyle = 'rgba(200,220,170,' + (0.5 + 0.5 * Math.sin(now * 0.02)) * clamp(1.6 - st.cricket * 0.4, 0, 1) + ')'; ctx.fillText('♪', 700 + Math.sin(st.cricket * 3) * 10, 300 - st.cricket * 12); ctx.fillText('♫', 760, 280 - st.cricket * 9); ctx.restore(); }

        lightPass(ctx, 200, 160, 920, now);
    }

    // ───────── FRAMIFRÅN (grodperspektiv) ─────────
    function drawFront(EM, ctx, now, st, t) {
        // mörk bakgrund med fackelsken bakifrån
        const bg = ctx.createRadialGradient(W * 0.5, 170, 30, W * 0.5, 220, 520);
        bg.addColorStop(0, '#3a2a1c'); bg.addColorStop(0.5, '#1a120c'); bg.addColorStop(1, '#070504');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, W, 480);
        ctx.save(); ctx.globalAlpha = 0.35; ctx.filter = 'blur(3px)'; ctx.drawImage(catacomb(), -60, -40, W * 1.15, 480 * 1.15); ctx.restore();

        const cx = 440;
        ctx.save(); ctx.translate(440, 300); ctx.scale(0.84, 0.84); ctx.translate(-440, -300); // hela figuren lite mindre så hjälmen får plats
        const stoop = st.dignity >= 0 ? Math.sin(clamp(st.dignity / 1.4, 0, 1) * Math.PI) : 0;   // böjer sig efter braguetan
        const shrug = st.mierda >= 0 ? ease(clamp((st.mierda - 0.5) / 0.6, 0, 1)) * (1 - clamp((st.mierda - 2.6) / 0.6, 0, 1)) : 0;
        st.lookDown = st.crumble >= 0 ? ease(st.crumble / 1.2) : 0;

        // ben (lårben) som går ner ur bilden
        bone(ctx, cx - 52, 300, cx - 70, 420, 13); bone(ctx, cx + 52, 300, cx + 70, 420, 13);

        // BÄCKENET (syns när byxorna fallit)
        const reveal = st.crumble >= 0 ? ease((st.crumble - 0.3) / 0.9) : 0;
        if (reveal > 0) {
            ctx.save(); ctx.globalAlpha = reveal;
            // höftbensvingar
            [[-1], [1]].forEach(([sd]) => {
                const g = ctx.createRadialGradient(cx + sd * 50, 240, 6, cx + sd * 50, 250, 60);
                g.addColorStop(0, '#efe4c4'); g.addColorStop(0.7, '#b8a77e'); g.addColorStop(1, '#6a5a3c');
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.moveTo(cx + sd * 14, 218); ctx.quadraticCurveTo(cx + sd * 92, 196, cx + sd * 88, 250); ctx.quadraticCurveTo(cx + sd * 70, 290, cx + sd * 34, 296); ctx.quadraticCurveTo(cx + sd * 30, 256, cx + sd * 14, 218); ctx.fill();
                ctx.strokeStyle = '#4a3c26'; ctx.lineWidth = 1.5; ctx.stroke();
                // ledskål
                ctx.fillStyle = '#5a4a30'; ctx.beginPath(); ctx.arc(cx + sd * 52, 292, 10, 0, TAU); ctx.fill();
            });
            // korsben
            ctx.fillStyle = '#c9b88f'; ctx.beginPath(); ctx.moveTo(cx - 16, 214); ctx.lineTo(cx + 16, 214); ctx.lineTo(cx + 6, 262); ctx.lineTo(cx - 6, 262); ctx.closePath(); ctx.fill();
            for (let k = 0; k < 4; k++) { ctx.fillStyle = '#4a3c26'; ctx.beginPath(); ctx.arc(cx - 7, 224 + k * 10, 2, 0, TAU); ctx.arc(cx + 7, 224 + k * 10, 2, 0, TAU); ctx.fill(); }
            // blygdbensbåge och det TOMMA hålet
            ctx.fillStyle = '#0a0705'; ctx.beginPath(); ctx.ellipse(cx, 286, 30, 22, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#d6c7a0'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(cx, 278, 34, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
            // spindelväv över hålet
            ctx.strokeStyle = 'rgba(230,230,220,0.55)'; ctx.lineWidth = 0.8;
            for (let a = 0; a < 8; a++) { const an = a / 8 * TAU; ctx.beginPath(); ctx.moveTo(cx, 286); ctx.lineTo(cx + Math.cos(an) * 30, 286 + Math.sin(an) * 22); ctx.stroke(); }
            for (let rr = 6; rr < 30; rr += 6) { ctx.beginPath(); for (let a = 0; a <= 8; a++) { const an = a / 8 * TAU; const px = cx + Math.cos(an) * rr, py = 286 + Math.sin(an) * rr * 0.73; if (a) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke(); }
            ctx.restore();
        }

        // BYXORNA (smulas sönder)
        if (st.crumble < 0.35) {
            const tug = (t > 0.4 && t < 1.0) ? Math.sin(now * 0.05) * 3 : 0;
            const br = ctx.createLinearGradient(cx - 100, 200, cx + 100, 320);
            br.addColorStop(0, '#6a5038'); br.addColorStop(0.5, '#3e2c1e'); br.addColorStop(1, '#1e150d');
            ctx.fillStyle = br;
            blobPath(ctx, [[cx - 96, 214 + tug], [cx, 206], [cx + 96, 214 + tug], [cx + 104, 280], [cx + 70, 330], [cx + 10, 320], [cx - 10, 320], [cx - 70, 330], [cx - 104, 280]]); ctx.fill();
            ctx.strokeStyle = 'rgba(150,45,35,0.6)'; ctx.lineWidth = 7;
            for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(cx + k * 28, 214); ctx.quadraticCurveTo(cx + k * 32, 270, cx + k * 26, 322); ctx.stroke(); }
            rust(ctx, 3, cx - 90, 214, 180, 100, 10);
        }
        // byxbitar och damm i luften
        st.shards.forEach(s => { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.rot); ctx.globalAlpha = clamp(s.a, 0, 1); ctx.fillStyle = s.col; ctx.beginPath(); ctx.moveTo(-s.w / 2, -s.h / 2); ctx.lineTo(s.w / 2, -s.h / 3); ctx.lineTo(s.w / 3, s.h / 2); ctx.lineTo(-s.w / 2, s.h / 3); ctx.fill(); ctx.restore(); });
        st.dust.forEach(d => { const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r); g.addColorStop(0, 'rgba(180,160,120,' + d.a + ')'); g.addColorStop(1, 'rgba(180,160,120,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, TAU); ctx.fill(); });

        // BÅL: harnesk framifrån
        ctx.save(); ctx.translate(cx, 214); ctx.rotate(stoop * 0.0);
        ctx.fillStyle = steel(ctx, -100, -150, 100, 0);
        ctx.beginPath(); ctx.moveTo(-92, -140); ctx.quadraticCurveTo(0, -164, 92, -140); ctx.quadraticCurveTo(102, -60, 84, 0); ctx.lineTo(-84, 0); ctx.quadraticCurveTo(-102, -60, -92, -140); ctx.fill();
        // mittrygg (köl)
        const kg = ctx.createLinearGradient(-10, 0, 10, 0); kg.addColorStop(0, 'rgba(0,0,0,0.25)'); kg.addColorStop(0.5, 'rgba(255,255,255,0.18)'); kg.addColorStop(1, 'rgba(0,0,0,0.25)');
        ctx.fillStyle = kg; ctx.beginPath(); ctx.moveTo(-6, -150); ctx.lineTo(6, -150); ctx.lineTo(10, 0); ctx.lineTo(-10, 0); ctx.fill();
        ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-92, -140); ctx.quadraticCurveTo(0, -164, 92, -140); ctx.stroke();
        rust(ctx, 9, -90, -150, 180, 150, 34);
        for (let k = 0; k < 6; k++) { rivet(ctx, -80 + k * 32, -134 + Math.abs(k - 2.5) * 3); }
        // tassets
        for (let k = 0; k < 2; k++) { ctx.fillStyle = steel(ctx, -90, k * 12, 90, k * 12 + 12); ctx.beginPath(); ctx.moveTo(-90, k * 12 - 2); ctx.lineTo(90, k * 12 - 2); ctx.lineTo(92, k * 12 + 12); ctx.lineTo(-92, k * 12 + 12); ctx.fill(); }
        ctx.restore();

        // ARMAR
        const armY = 96;
        [-1, 1].forEach(sd => {
            const sx = cx + sd * 104, sy = armY;
            let hx = cx + sd * 70, hy = 230;                                   // vid höften
            if (t > 0.3 && t < 1.05) { hx = cx + sd * 54; hy = 236 + Math.sin(now * 0.05 + sd) * 4; } // drar i byxorna
            if (shrug > 0) { hx = lerp(hx, cx + sd * 210, shrug); hy = lerp(hy, 150, shrug); }  // slår ut med armarna
            if (stoop > 0) { hx = lerp(hx, cx + sd * 30, stoop); hy = lerp(hy, 330, stoop); }
            const el = C.ik2(sx, sy, hx, hy, 92, 88, sd === -1 ? 1 : -1);
            ctx.fillStyle = steel(ctx, sx - 34, sy - 30, sx + 34, sy + 30);
            ctx.beginPath(); ctx.ellipse(sx, sy, 38, 32, 0, 0, TAU); ctx.fill(); rust(ctx, 40 + sd, sx - 30, sy - 26, 60, 50, 8);
            bone(ctx, sx, sy + 16, el[0], el[1], 15); bone(ctx, el[0], el[1], hx, hy, 13);
            // armskena (vambrace) på underarmen
            ctx.save(); const va = Math.atan2(hy - el[1], hx - el[0]), vl = Math.hypot(hx - el[0], hy - el[1]);
            ctx.translate(el[0], el[1]); ctx.rotate(va);
            ctx.fillStyle = steel(ctx, 0, -12, 0, 12); ctx.beginPath(); ctx.moveTo(vl * 0.3, -12); ctx.lineTo(vl * 0.85, -10); ctx.lineTo(vl * 0.85, 10); ctx.lineTo(vl * 0.3, 12); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
            ctx.fillStyle = '#5a5f62'; ctx.beginPath(); ctx.arc(el[0], el[1], 12, 0, TAU); ctx.fill();
            ctx.fillStyle = steel(ctx, hx - 16, hy - 14, hx + 16, hy + 14);
            ctx.beginPath(); ctx.ellipse(hx, hy, 17, 14, 0, 0, TAU); ctx.fill();
            if (shrug > 0.6) { ctx.strokeStyle = '#c9b88f'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (let f = 0; f < 4; f++) { ctx.beginPath(); ctx.moveTo(hx + sd * 10, hy - 4); ctx.lineTo(hx + sd * (18 + f * 2), hy - 18 + f * 7); ctx.stroke(); } }
        });

        // braguetan på plats igen (med värdighet)
        if (st.dignity >= 0) {
            const k = ease(clamp((st.dignity - 0.7) / 0.7, 0, 1));
            codpiece(ctx, cx, lerp(360, 268, k), lerp(0.6, 0, k), 1.6, false);
        }

        // HUVUD
        const headDy = stoop * 30 + st.lookDown * 10;
        skullFront(ctx, cx, 56 + headDy, { r: st.lookDown * 0.08 - shrug * 0.05, dy: 0 }, now, st);

        ctx.restore(); // slut på figurens skalning
        // kallt ljus underifrån + varmt bakifrån
        ctx.save(); ctx.globalCompositeOperation = 'multiply';
        const lg = ctx.createRadialGradient(cx, 230, 60, cx, 230, 480);
        lg.addColorStop(0, 'rgb(255,240,220)'); lg.addColorStop(0.6, 'rgb(150,120,100)'); lg.addColorStop(1, 'rgb(40,32,30)');
        ctx.fillStyle = lg; ctx.fillRect(0, 0, W, 480); ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const rimL = ctx.createLinearGradient(0, 0, W, 0); rimL.addColorStop(0, 'rgba(255,140,60,0.12)'); rimL.addColorStop(0.4, 'rgba(255,140,60,0)'); rimL.addColorStop(1, 'rgba(90,110,160,0.08)');
        ctx.fillStyle = rimL; ctx.fillRect(0, 0, W, 480); ctx.restore();

        // Detaljer som ska synas tydligt ritas EFTER ljuset
        ctx.save(); ctx.translate(440, 300); ctx.scale(0.84, 0.84); ctx.translate(-440, -300);
        const reveal2 = reveal;
        // spindeln på sin tråd
        if (st.spider >= 0 && reveal2 > 0.5 && !(st.dignity > 1.0)) {
            const k = st.spider, drop = Math.min(26, k * 22), sx = cx + 6, sy = 270 + drop;
            ctx.strokeStyle = 'rgba(240,240,230,0.7)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(sx, 266); ctx.lineTo(sx, sy); ctx.stroke();
            ctx.save(); ctx.translate(sx, sy); ctx.scale(1.7, 1.7); ctx.translate(-sx, -sy);
            ctx.fillStyle = '#2a1c16'; ctx.beginPath(); ctx.ellipse(sx, sy + 4, 5, 6, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(sx, sy - 2, 3.4, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(255,220,180,0.35)'; ctx.beginPath(); ctx.ellipse(sx - 1.5, sy + 2, 1.5, 2.5, 0, 0, TAU); ctx.fill();
            ctx.strokeStyle = '#2a1c16'; ctx.lineWidth = 1.2;
            for (let l = 0; l < 4; l++) for (const sd of [-1, 1]) {
                let a = (l - 1.5) * 0.45, wave = 0;
                if (sd === 1 && l === 0 && k > 0.9) { wave = Math.sin(now * 0.025) * 0.7 - 0.9; } // vinkar
                ctx.beginPath(); ctx.moveTo(sx, sy + 2);
                ctx.quadraticCurveTo(sx + sd * 8, sy - 4 + l * 3 + wave * 8, sx + sd * (12 + Math.abs(wave) * 2), sy + 4 + l * 4 + a * 6 + wave * 12); ctx.stroke();
            }
            ctx.fillStyle = '#ff3b3b'; ctx.beginPath(); ctx.arc(sx - 1.2, sy - 3, 0.8, 0, TAU); ctx.arc(sx + 1.2, sy - 3, 0.8, 0, TAU); ctx.fill();
            ctx.restore();
        }

        // malen som flyger ut ur bäckenet
        if (st.moth >= 0) {
            const k = st.moth, mx = cx + Math.sin(k * 3) * 30 + k * 90, my = 286 - k * 120 + Math.sin(k * 11) * 8, flap = Math.abs(Math.sin(now * 0.06));
            ctx.save(); ctx.translate(mx, my); ctx.scale(1.8, 1.8);
            ctx.fillStyle = 'rgba(225,205,170,0.95)';
            ctx.beginPath(); ctx.ellipse(-6, -2, 9, 6 * flap + 1, -0.5, 0, TAU); ctx.ellipse(6, -2, 9, 6 * flap + 1, 0.5, 0, TAU); ctx.fill();
            ctx.fillStyle = '#4a3a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 2.2, 6, 0, 0, TAU); ctx.fill();
            ctx.restore();
        }

        ctx.restore();
        // pratbubblan
        if (st.mierda >= 0 && st.dignity < 0) {
            const a = clamp(st.mierda * 3, 0, 1);
            ctx.save(); ctx.globalAlpha = a;
            ctx.fillStyle = 'rgba(245,236,214,0.96)'; ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.ellipse(650, 90, 120, 44, 0, 0, TAU); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(560, 116); ctx.lineTo(520, 150); ctx.lineTo(590, 124); ctx.fill();
            ctx.font = 'bold italic 34px Georgia'; ctx.textAlign = 'center'; ctx.fillStyle = '#3a1410';
            ctx.fillText('...Mierda.', 650, 102);
            ctx.restore();
        }

    }

    Object.assign(EM, {
        // Ny tidslinje för den misslyckade urineringen (ersätter den gamla)
        updateEnemyFatalitySequence: function (rawDt) {
            this.enemyFatalityTimer += rawDt;
            const t = this.enemyFatalityTimer;
            if (this.enemyFatalityStage === 'gut_rip') {
                if (t >= 2.5 && this.enemy.type === 'skeleton') {
                    this.enemyFatalityStage = 'piss_side_stance'; this.enemyFatalityTimer = 0;
                    this._mier = freshState();
                    this.enemy.pose = 'piss_stance'; this.visceraChains = []; this.xrayTimer = 0; this.slowMoTimer = 0; this.targetZoom = 1.0;
                    this.cinemaBanner = '🚽 ¡LA POSTURA DEL HIDALGO!';
                    this.playArmorCreakAndDryPuff();
                } else if (t >= 3.2 && this.enemy.type !== 'skeleton') { this.targetZoom = 1.0; this.phase = 'over'; }
                return;
            }
            const st = this._mier || (this._mier = freshState());
            // partiklar
            st.dust.forEach(d => { d.x += d.vx * rawDt; d.y += d.vy * rawDt; d.r += 18 * rawDt; d.a -= rawDt * 0.22; });
            st.dust = st.dust.filter(d => d.a > 0);
            st.shards.forEach(s => { s.x += s.vx * rawDt; s.y += s.vy * rawDt; s.vy += 260 * rawDt; s.rot += s.vr * rawDt; s.a -= rawDt * 0.45; });
            st.shards = st.shards.filter(s => s.a > 0 && s.y < 520);
            ['codT', 'codFall', 'hips', 'cricket', 'puff', 'q', 'crumble', 'moth', 'spider', 'pupils', 'mierda', 'dignity'].forEach(k => { if (st[k] >= 0) st[k] += rawDt; });

            const S = this;
            const at = (time, key, fn) => { if (t >= time && !st['_' + key]) { st['_' + key] = true; fn(); } };
            if (this.enemyFatalityStage === 'piss_side_stance') {
                at(0.9, 'fumble', () => { st.codT = 0; st.line = 1; SFX.squeak(S); setTimeout(() => SFX.squeak(S), 700); setTimeout(() => SFX.squeak(S), 1300); });
                at(2.8, 'fall', () => { st.codFall = 0; st.line = 2; SFX.clang(S); S.camShake = 6; });
                at(3.6, 'hips', () => { st.hips = 0; st.line = 0; S.playArmorCreakAndDryPuff(); });
                at(4.2, 'crickets', () => { st.cricket = 0; st.line = 3; SFX.cricket(S, 3); });
                at(5.6, 'puff', () => {
                    st.puff = 0; st.line = 4; SFX.dust(S);
                    for (let i = 0; i < 6; i++) st.dust.push({ x: 430 + Math.random() * 10, y: 266, vx: -40 - Math.random() * 30, vy: 20 + Math.random() * 20, r: 4 + Math.random() * 4, a: 0.55 });
                });
                at(6.2, 'q', () => { st.q = 0; });
                if (t >= SIDE_LEN) {
                    this.enemyFatalityStage = 'piss_front_closeup'; this.enemyFatalityTimer = 0;
                    const keep = this._mier; this._mier = freshState(); this._mier.line = 5; this._mier.codOff = keep.codFall >= 0;
                    this.cinemaBanner = '🎥 [CONTRAPICADO]';
                }
            } else if (this.enemyFatalityStage === 'piss_front_closeup') {
                at(1.0, 'crumble', () => {
                    st.crumble = 0; st.line = 5; SFX.dust(S); S.playDryClothRip(); S.camShake = 5;
                    S.cinemaBanner = '🍂 ¡TEXTILES DEL SIGLO XVI!';
                    const r = Math.random;
                    for (let i = 0; i < 34; i++) st.shards.push({ x: 344 + r() * 192, y: 214 + r() * 110, vx: (r() - 0.5) * 120, vy: -30 + r() * 60, rot: r() * 6, vr: (r() - 0.5) * 6, w: 10 + r() * 22, h: 8 + r() * 16, a: 1, col: r() < 0.5 ? '#4a3626' : '#6a3a2a' });
                    for (let i = 0; i < 26; i++) st.dust.push({ x: 350 + r() * 180, y: 220 + r() * 100, vx: (r() - 0.5) * 50, vy: -10 + r() * 30, r: 8 + r() * 14, a: 0.6 });
                });
                at(2.6, 'moth', () => { st.moth = 0; st.line = 6; SFX.flutter(S); });
                at(3.4, 'spider', () => { st.spider = 0; st.line = 7; });
                at(4.6, 'pupils', () => { st.pupils = 0; S.playBoneCrunch(false); });
                at(5.4, 'mierda', () => { st.mierda = 0; st.line = 8; S.cinemaBanner = '💬 « ...MIERDA. »'; S.playZombieMierdaVoice(); });
                at(7.4, 'dignity', () => { st.dignity = 0; st.line = 9; S.cinemaBanner = 'Con dignidad.'; setTimeout(() => SFX.clang(S), 1100); });
                if (t >= FRONT_LEN) { this.targetZoom = 1.0; this.phase = 'over'; }
            }
        },

        drawMierdaPainted: function (ctx, now) {
            const st = this._mier || (this._mier = freshState());
            const t = this.enemyFatalityTimer;
            ctx.save();
            const shx = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake * 0.6 : 0, shy = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake * 0.6 : 0;
            ctx.translate(shx, shy);
            if (this.enemyFatalityStage === 'piss_side_stance') {
                // långsam inzoomning mot hidalgon
                const z = 1 + clamp(t / SIDE_LEN, 0, 1) * 0.08;
                ctx.translate(470, 250); ctx.scale(z, z); ctx.translate(-470, -250);
                drawSide(this, ctx, now, st, t);
            } else {
                drawFront(this, ctx, now, st, t);
            }
            ctx.restore();
            FX.finish(ctx, now, { vignette: 0.72 });
            FX.title(ctx, this.cinemaBanner);
            FX.subtitles(ctx, LINES[st.line] || LINES[0]);
        },

        // Hjälp för testning: hoppa till en viss tid (sekunder från profilbildens början)
        startMierdaDebug: function (T) {
            this.phase = 'enemy_fatality_anim'; this.enemyFatalityStage = 'gut_rip'; this.enemyFatalityTimer = 2.5;
            this.enemy.type = 'skeleton'; this.hero.hp = 0;
            this.updateEnemyFatalitySequence(0.0001);
            let acc = 0; while (acc < T) { this.updateEnemyFatalitySequence(1 / 60); acc += 1 / 60; this.camShake = Math.max(0, this.camShake - 0.7); }
        }
    });
})();
