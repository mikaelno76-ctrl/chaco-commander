// === DEL 10: NATURLIGA RÖRELSER (elite_melee_animation.js) ===
// Laddas efter elite_melee_webgl_stage.js och FÖRE elite_melee_visual_overhaul_v5.js.
//
// Ett gemensamt rörelsesystem för både 2D och 3D:
//  • Poser beskrivs som ledvinklar (axel, armbåge, höft, knä, bål, huvud) – samma tabell för 2D och 3D.
//  • Mjuka övergångar: varje led glider mot målposen med egen hastighet (snabbt i slag, lugnt i vila).
//  • Gångcykel när kämparna förflyttar sig, andning och viktförskjutning i vila.
//  • Träffreaktion med fjädring: kroppen viker sig bakåt och studsar tillbaka.
//  • 2D: kropparna ritas om med riktiga leder (framåtkinematik) och skuggning per kroppsdel.
//  • 3D: armar och ben byggs om med armbågs- och knäleder så att de faktiskt kan böjas.
//
// Vinklar i radianer. Arm/ben: 0 = rakt ner, positivt = framåt (mot motståndaren).
// Armbåge: positivt = underarmen viks framåt/uppåt. Knä: negativt = underbenet viks bakåt.

window.EliteMelee = window.EliteMelee || {};

(function () {
    const TAU = Math.PI * 2;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const EM = window.EliteMelee;

    // ───────────────────────── POSLEXIKON ─────────────────────────
    const JOINTS = ['dy', 'lean', 'head', 'fs', 'fe', 'bs', 'be', 'fh', 'fk', 'bh', 'bk', 'wpn'];
    const POSES = {
        idle:     { dy: 4,  lean: 0.08,  head: 0.04, fs: 0.55, fe: 1.45, bs: 0.25, be: 1.25, fh: 0.28, fk: -0.38, bh: -0.26, bk: -0.22, wpn: 0.0 },
        windup:   { dy: 8,  lean: -0.2,  head: 0.1,  fs: -0.75, fe: 1.9, bs: 0.6, be: 1.1,  fh: 0.32, fk: -0.5,  bh: -0.34, bk: -0.32, wpn: -0.6 },
        punch:    { dy: 6,  lean: 0.3,   head: 0.08, fs: 1.55, fe: 0.12, bs: -0.2, be: 1.5,  fh: 0.45, fk: -0.25, bh: -0.5,  bk: -0.1, wpn: 0.25 },
        kick:     { dy: 0,  lean: -0.22, head: 0.12, fs: 0.2,  fe: 1.6,  bs: -0.5, be: 1.0,  fh: 1.55, fk: -0.12, bh: -0.08, bk: -0.25, wpn: 0.0 },
        grapple:  { dy: 14, lean: 0.38,  head: 0.15, fs: 1.25, fe: 0.7,  bs: 1.05, be: 0.8,  fh: 0.5,  fk: -0.6,  bh: -0.42, bk: -0.4, wpn: 0.3 },
        block:    { dy: 10, lean: -0.06, head: 0.2,  fs: 0.85, fe: 2.35, bs: 0.7,  be: 2.2,  fh: 0.3,  fk: -0.5,  bh: -0.3,  bk: -0.35, wpn: -1.2 },
        hurt:     { dy: 6,  lean: -0.38, head: -0.35, fs: -0.35, fe: 0.5, bs: -0.6, be: 0.4, fh: 0.15, fk: -0.45, bh: -0.38, bk: -0.3, wpn: 0.5 },
        fatality: { dy: 2,  lean: 0.22,  head: 0.0,  fs: 2.7,  fe: 0.35, bs: 0.4,  be: 1.4,  fh: 0.4,  fk: -0.3,  bh: -0.45, bk: -0.15, wpn: 0.2 },
        kneel:    { dy: 70, lean: 0.45,  head: 0.5,  fs: 0.12, fe: 0.15, bs: -0.1, be: 0.15, fh: 1.45, fk: -2.35, bh: 0.05, bk: -1.55, wpn: 1.2 },
        piss_stance: { dy: 0, lean: -0.25, head: 0.25, fs: 0.3, fe: 0.9, bs: 0.2, be: 0.9, fh: 0.38, fk: -0.1, bh: -0.38, bk: -0.1, wpn: 0.6 },
        idle_beast: { dy: 30, lean: 0.35, head: -0.15, fs: 0.45, fe: 0.6, bs: 0.3, be: 0.5, fh: 0.6, fk: -0.9, bh: -0.15, bk: -0.7, wpn: 0 }
    };
    // Hur snabbt varje pose nås (högre = snabbare)
    const RATE = { idle: 9, windup: 16, punch: 34, kick: 26, grapple: 22, block: 26, hurt: 30, fatality: 18, kneel: 6, piss_stance: 8, idle_beast: 8 };

    function poseKeyFor(EMs, f, isHero) {
        const kneel = (!isHero && f === EMs.enemy && (EMs.phase === 'dizzy' || EMs.phase === 'fatality_anim' || (EMs.phase === 'over' && EMs.enemy.hp <= 0)))
            || (isHero && (EMs.phase === 'enemy_fatality_anim' || (EMs.phase === 'over' && EMs.hero.hp <= 0)));
        if (kneel) return 'kneel';
        const p = f.pose || 'idle';
        if (p === 'idle' && (f.type === 'pombero')) return 'idle_beast';
        return POSES[p] ? p : 'idle';
    }

    // ───────────────────────── ANIMATORN ─────────────────────────
    // Lagrar aktuell pose per kämpe och glider mot målet. Returnerar en färdig pose (med gång, andning, fjädring).
    EM.animatePose = function (f, isHero, now) {
        let a = f._anim;
        if (!a) {
            const base = POSES[poseKeyFor(this, f, isHero)];
            a = f._anim = { cur: Object.assign({}, base), t: now, lastX: f.x, walkPh: 0, walkAmt: 0, spring: 0, springV: 0, lastFlash: 0, lastKey: 'idle' };
        }
        let dt = (now - a.t) / 1000; a.t = now;
        if (!(dt > 0)) dt = 0; dt = Math.min(dt, 0.05);
        if (this.hitStop > 0) dt *= 0.05;                     // hitstop fryser även kroppen
        else if (this.slowMoTimer > 0) dt *= (this.slowMoFactor || 0.2);
        if (this.academicFreezeActive) dt = 0;

        const key = poseKeyFor(this, f, isHero);
        const target = POSES[key];
        const k = 1 - Math.exp(-(RATE[key] || 12) * dt);
        JOINTS.forEach(j => { a.cur[j] += (target[j] - a.cur[j]) * k; });

        // träffreaktion: fjäder som knuffar bålen bakåt och studsar tillbaka
        if ((f.hitFlash || 0) > a.lastFlash + 0.05) a.springV -= 9;
        a.lastFlash = f.hitFlash || 0;
        a.springV += (-a.spring * 160 - a.springV * 14) * dt;
        a.spring += a.springV * dt;

        // gångcykel utifrån hur fort kämpen faktiskt rör sig
        const vx = dt > 0 ? (f.x - a.lastX) / dt : 0; a.lastX = f.x;
        const moving = Math.abs(vx) > 25 && (key === 'idle' || key === 'idle_beast' || key === 'block');
        a.walkAmt += ((moving ? 1 : 0) - a.walkAmt) * (1 - Math.exp(-10 * dt));
        const dirSign = (isHero ? 1 : -1) * Math.sign(vx || 1);
        a.walkPh += Math.abs(vx) * dt * 0.045 * (dirSign >= 0 ? 1 : -1);

        const out = Object.assign({}, a.cur);
        const w = a.walkAmt, ph = a.walkPh;
        if (w > 0.01) {
            out.fh += Math.sin(ph) * 0.55 * w;  out.bh -= Math.sin(ph) * 0.55 * w;
            out.fk -= Math.max(0, Math.cos(ph)) * 0.75 * w;  out.bk -= Math.max(0, -Math.cos(ph)) * 0.75 * w;
            out.dy -= Math.abs(Math.sin(ph * 2)) * 3 * w;
            out.fs -= Math.sin(ph) * 0.25 * w;  out.bs += Math.sin(ph) * 0.25 * w;
        }
        // andning och viktförskjutning
        const br = Math.sin(now * 0.004 + (isHero ? 0 : 2));
        out.dy += br * 1.6; out.lean += br * 0.015; out.fe += br * 0.05; out.head += Math.sin(now * 0.0023 + (isHero ? 1 : 3)) * 0.03;
        out.lean += a.spring * 0.06; out.head += a.spring * 0.05;
        out._key = key;
        return out;
    };

    // ───────────────────────── 2D: KROPP MED LEDER ─────────────────────────
    function limbPath(ctx, len, w1, w2) {
        ctx.beginPath();
        ctx.moveTo(0, -w1 / 2); ctx.quadraticCurveTo(len * 0.45, -Math.max(w1, w2) * 0.6, len, -w2 / 2);
        ctx.arc(len, 0, w2 / 2, -Math.PI / 2, Math.PI / 2);
        ctx.quadraticCurveTo(len * 0.45, Math.max(w1, w2) * 0.6, 0, w1 / 2);
        ctx.arc(0, 0, w1 / 2, Math.PI / 2, Math.PI * 1.5);
        ctx.closePath();
    }
    // Ritar ett segment från (x,y) i vinkel ang (0 = ner, + framåt) med längd len; returnerar ändpunkten
    function seg(ctx, x, y, ang, len, w1, w2, fill, blood, dark) {
        const ex = x + Math.sin(ang) * len, ey = y + Math.cos(ang) * len;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(ey - y, ex - x));
        limbPath(ctx, len, w1, w2);
        ctx.fillStyle = fill; ctx.fill();
        // skuggning: ljus uppifrån-vänster, mörkt nedtill
        const g = ctx.createLinearGradient(0, -w1 / 2, 0, w1 / 2);
        g.addColorStop(0, dark ? 'rgba(255,230,200,0.05)' : 'rgba(255,230,200,0.22)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, dark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.4)');
        ctx.fillStyle = g; ctx.fill();
        if (blood > 0.05) { ctx.fillStyle = 'rgba(115,5,5,' + Math.min(0.85, blood) + ')'; ctx.beginPath(); ctx.ellipse(len * 0.55, 0, len * 0.32, w2 * 0.36, 0, 0, TAU); ctx.fill(); }
        limbPath(ctx, len, w1, w2); ctx.strokeStyle = 'rgba(8,5,3,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        return [ex, ey];
    }

    EM.drawFighterBody = function (ctx, f, isHero, now, tex) {
        const dir = isHero ? 1 : -1;
        const isPombero = (!isHero && f.type === 'pombero');
        const isLobizon = (!isHero && f.type === 'lobizon');
        const isBeast = isPombero || isLobizon;
        const isSkel = (!isHero && f.type === 'skeleton');
        const P = this.animatePose(f, isHero, now);
        if (this.phase === 'enemy_fatality_anim' && !isHero && this.enemyFatalityStage !== 'gut_rip') P._key = 'piss_stance';

        const bloodCoat = (f.injuries && f.injuries.bloodCoat !== undefined) ? f.injuries.bloodCoat : 0.2;
        const skinCol = isHero ? (f.key === 'bloom' ? '#5a3524' : '#b8835c') : (isPombero ? '#2a211a' : (isLobizon ? '#2e261f' : (isSkel ? '#cbbd98' : '#a67856')));
        const torsoTex = isHero ? (f.key === 'gomez' ? tex.redWool : (f.key === 'arandu' ? tex.ponchoStripe : (f.key === 'takeda' ? tex.samuraiSilk : tex.blueUniform))) : (isBeast ? tex.pomberoFur : (isSkel ? tex.rustedArmor : (f.subType === 'gaucho' ? tex.ponchoStripe : tex.brazilGreen)));
        const pantsTex = isBeast ? tex.pomberoFur : tex.wornLeather;
        const bootCol = isBeast ? '#1c1612' : '#15100c';
        const limbCol = isSkel ? '#cbbd98' : null; // conquistadorens ben är ben

        ctx.save();
        ctx.translate(f.x, f.y + P.dy);
        ctx.scale(dir, 1);
        if (isLobizon) ctx.scale(1.16, 1.1);

        const hipY = -150;
        const TH = 74, SH = 72, UA = 56, FA = 54;
        // ── bakre ben ──
        const bk = seg(ctx, -10, hipY, P.bh, TH, 30, 22, limbCol || pantsTex, bloodCoat * 0.5, true);
        const bf = seg(ctx, bk[0], bk[1], P.bh + P.bk, SH, 22, 16, limbCol || bootCol, bloodCoat * 0.6, true);
        ctx.fillStyle = bootCol; ctx.beginPath(); ctx.ellipse(bf[0] + 8, bf[1] + 2, 16, 7, 0, 0, TAU); ctx.fill();

        // ── bål (roterar kring höften) ──
        ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.lean);
        const shY = -98;
        // bakre arm bakom bålen
        if (!(f.injuries && f.injuries.armSeveredBack)) {
            const be = seg(ctx, -6, shY + 4, P.bs, UA, 22, 18, torsoTex, bloodCoat * 0.5, true);
            const bh = seg(ctx, be[0], be[1], P.bs + P.be, FA, 18, 14, limbCol || skinCol, bloodCoat * 0.6, true);
            ctx.fillStyle = limbCol || skinCol; ctx.beginPath(); ctx.arc(bh[0], bh[1], 7.5, 0, TAU); ctx.fill();
        }
        // själva bålen
        ctx.beginPath(); ctx.moveTo(-26, 6); ctx.bezierCurveTo(-40, -30, -38, -80, -30, -108); ctx.lineTo(30, -108); ctx.bezierCurveTo(40, -80, 42, -30, 26, 6); ctx.closePath();
        ctx.fillStyle = torsoTex; ctx.fill();
        const tg = ctx.createLinearGradient(-36, 0, 36, 0);
        tg.addColorStop(0, 'rgba(0,0,0,0.45)'); tg.addColorStop(0.4, 'rgba(255,230,200,0.08)'); tg.addColorStop(0.7, 'rgba(255,230,200,0.14)'); tg.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = tg; ctx.fill();
        ctx.strokeStyle = '#0d0907'; ctx.lineWidth = 2; ctx.stroke();
        // bälte
        if (!isBeast) { ctx.fillStyle = '#2a1c12'; ctx.fillRect(-30, -10, 60, 9); ctx.fillStyle = '#c9a24a'; ctx.fillRect(-6, -10, 10, 9); }
        if (isSkel) { // harneskens kant och nitar
            ctx.strokeStyle = '#9a7a2a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-30, -106); ctx.quadraticCurveTo(0, -116, 30, -106); ctx.stroke();
        }
        if (f.injuries && f.injuries.disemboweled) { ctx.fillStyle = '#7a0000'; ctx.beginPath(); ctx.ellipse(8, -36, 18, 25, 0, 0, TAU); ctx.fill(); }
        if (this.drawGoreTorso) this.drawGoreTorso(ctx, f, isHero, now);

        // huvud
        if (!(!isHero && f.injuries && f.injuries.headSevered)) {
            ctx.save(); ctx.translate(3, -140); ctx.rotate(P.head);
            // hals
            ctx.fillStyle = limbCol || skinCol; ctx.fillRect(-7, 10, 14, 22);
            const hg = ctx.createRadialGradient(-6, -8, 4, 0, 0, 24);
            hg.addColorStop(0, isSkel ? '#efe4c4' : 'rgba(255,220,190,0.0)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = skinCol; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(255,225,190,0.18)'; ctx.beginPath(); ctx.arc(-6, -8, 13, 0, TAU); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(4, 6, 18, 0.1, Math.PI * 0.9); ctx.fill();
            if (isSkel) {
                ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(11, -5, 3.5, 0, TAU); ctx.fill();
                ctx.fillStyle = '#4a5156'; ctx.beginPath(); ctx.arc(0, -10, 24, Math.PI, 0); ctx.fill();
                ctx.fillStyle = '#3a4044'; ctx.beginPath(); ctx.ellipse(0, -10, 34, 6, 0, 0, TAU); ctx.fill();
                if (this.drawZombieHeadDecay) this.drawZombieHeadDecay(ctx, now);
            } else if (isPombero) {
                ctx.fillStyle = '#ffab00'; ctx.beginPath(); ctx.arc(10, -4, 6, 0, TAU); ctx.fill();
                ctx.fillStyle = '#b08a52'; ctx.beginPath(); ctx.ellipse(0, -18, 46, 8, -0.1, 0, TAU); ctx.fill(); // stråhatt
                ctx.beginPath(); ctx.ellipse(-2, -28, 18, 14, 0, Math.PI, 0); ctx.fill();
            } else if (isLobizon) {
                ctx.fillStyle = skinCol;
                ctx.beginPath(); ctx.moveTo(14, -10); ctx.lineTo(48, 2); ctx.lineTo(44, 12); ctx.lineTo(12, 14); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#0a0706'; ctx.beginPath(); ctx.arc(47, 4, 4, 0, TAU); ctx.fill();
                ctx.fillStyle = skinCol;
                ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(-6, -40); ctx.lineTo(2, -16); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(10, -42); ctx.lineTo(16, -14); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#ffea00'; ctx.beginPath(); ctx.arc(12, -6, 3.6, 0, TAU); ctx.fill();
                ctx.fillStyle = '#efe6cf';
                ctx.beginPath(); ctx.moveTo(30, 10); ctx.lineTo(33, 19); ctx.lineTo(36, 10); ctx.fill();
                ctx.beginPath(); ctx.moveTo(38, 9); ctx.lineTo(40, 16); ctx.lineTo(43, 9); ctx.fill();
            } else {
                // människa: öga, ögonbryn, näsa, hår/mössa
                ctx.fillStyle = '#f2ebe0'; ctx.beginPath(); ctx.ellipse(11, -3, 4.2, 3, 0, 0, TAU); ctx.fill();
                ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.arc(12.5, -3, 1.8, 0, TAU); ctx.fill();
                ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(6, -10); ctx.lineTo(17, -9 + (P._key === 'windup' || P._key === 'punch' ? 2 : 0)); ctx.stroke();
                ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.moveTo(20, -2); ctx.lineTo(25, 6); ctx.lineTo(19, 7); ctx.fill();
                ctx.strokeStyle = 'rgba(40,15,10,0.8)'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(11, 12); ctx.lineTo(18, P._key === 'hurt' ? 15 : 11); ctx.stroke();
                const hair = '#140f0c';
                if (f.key === 'bloom') { ctx.fillStyle = '#1b2836'; ctx.fillRect(-22, -26, 40, 12); ctx.fillStyle = '#14100d'; ctx.fillRect(10, -16, 14, 4); ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(4, 14, 14, 9, 0, 0, Math.PI); ctx.fill(); }
                else if (f.key === 'gomez' || f.key === 'villalba') { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(-4, -6, 23, Math.PI * 0.75, Math.PI * 1.95); ctx.fill(); ctx.beginPath(); ctx.moveTo(-20, -4); ctx.quadraticCurveTo(-34, 24, -22, 42); ctx.lineTo(-12, 20); ctx.fill(); ctx.fillStyle = '#7a1814'; ctx.fillRect(-22, -14, 40, 5); }
                else if (f.key === 'takeda') { ctx.fillStyle = '#3a3a3a'; ctx.beginPath(); ctx.arc(-2, -6, 22, Math.PI, Math.PI * 1.9); ctx.fill(); ctx.fillRect(-8, -34, 12, 10); }
                else if (f.subType === 'gaucho') { ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.ellipse(0, -16, 32, 6, 0, 0, TAU); ctx.fill(); ctx.fillRect(-16, -32, 32, 16); ctx.fillStyle = hair; ctx.beginPath(); ctx.ellipse(6, 14, 15, 8, 0, 0, Math.PI); ctx.fill(); }
                else { ctx.fillStyle = hair; ctx.beginPath(); ctx.arc(-2, -6, 22, Math.PI * 0.95, Math.PI * 1.9); ctx.fill(); }
            }
            ctx.restore();
        }

        // främre arm (framför bålen) med vapen
        if (!isHero && f.injuries && f.injuries.armSevered && this.drawArmStump) this.drawArmStump(ctx, f, shY, now);
        if (!(!isHero && f.injuries && f.injuries.armSevered)) {
            const fe = seg(ctx, 10, shY + 4, P.fs, UA, 26, 20, torsoTex, bloodCoat * 0.6);
            const fa = P.fs + P.fe;
            const fh = seg(ctx, fe[0], fe[1], fa, FA, 20, 15, limbCol || skinCol, bloodCoat * 0.8);
            // axelskydd / epålett
            ctx.fillStyle = isSkel ? '#4a5156' : 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(10, shY + 4, 17, 13, 0, Math.PI, 0); ctx.fill();
            ctx.fillStyle = limbCol || skinCol; ctx.beginPath(); ctx.arc(fh[0], fh[1], 8.5, 0, TAU); ctx.fill();
            ctx.strokeStyle = 'rgba(8,5,3,0.9)'; ctx.lineWidth = 1.4; ctx.stroke();
            if (!isBeast) {
                // vapnet vinkelrätt mot underarmen, framåt (som när man håller ett svärd)
                const wa = fa + Math.PI / 2 + P.wpn;
                const bl = isHero ? 74 : 86;
                ctx.save(); ctx.translate(fh[0], fh[1]); ctx.rotate(Math.atan2(Math.cos(wa), Math.sin(wa)));
                ctx.fillStyle = '#c9a24a'; ctx.fillRect(-4, -6, 6, 12);                 // parerstång
                const bg = ctx.createLinearGradient(0, -3, 0, 3); bg.addColorStop(0, '#f0f4f6'); bg.addColorStop(0.5, '#a9b4ba'); bg.addColorStop(1, '#5c666c');
                ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(2, -3); ctx.lineTo(bl, -1.5); ctx.lineTo(bl + 8, 0); ctx.lineTo(bl, 1.5); ctx.lineTo(2, 3); ctx.closePath(); ctx.fill();
                if (bloodCoat > 0.3) { ctx.fillStyle = 'rgba(120,5,8,0.7)'; ctx.fillRect(bl * 0.55, -2, bl * 0.45, 3); }
                ctx.restore();
            } else if (isLobizon) {
                ctx.strokeStyle = '#1a1512'; ctx.lineWidth = 3; ctx.lineCap = 'round';
                for (let c = 0; c < 3; c++) { const ca = fa + (c - 1) * 0.3; ctx.beginPath(); ctx.moveTo(fh[0], fh[1]); ctx.lineTo(fh[0] + Math.sin(ca) * 20, fh[1] + Math.cos(ca) * 20); ctx.stroke(); }
            }
        }
        if (f.hitFlash > 0) { ctx.save(); ctx.globalAlpha = Math.min(0.5, f.hitFlash * 4); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, -55, 46, 70, 0, 0, TAU); ctx.fill(); ctx.restore(); }
        ctx.restore(); // bål

        // ── främre ben (sist = närmast kameran) ──
        const fk = seg(ctx, 12, hipY, P.fh, TH, 32, 24, limbCol || pantsTex, bloodCoat * 0.7);
        const ff = seg(ctx, fk[0], fk[1], P.fh + P.fk, SH, 24, 18, limbCol || bootCol, bloodCoat * 0.8);
        const footA = P.fh + P.fk;
        ctx.save(); ctx.translate(ff[0], ff[1]); ctx.rotate(-footA * 0.6);
        ctx.fillStyle = bootCol; ctx.beginPath(); ctx.ellipse(8, 2, 17, 7.5, 0, 0, TAU); ctx.fill();
        ctx.restore();
        ctx.restore();
    };

    // ───────────────────────── 3D: LEDADE RIGGAR ─────────────────────────
    // Bygger om armar och ben i den befintliga modellen till kedjor av leder (axel→armbåge→hand, höft→knä→fot).
    const origCreate = EM.createSculptedHumanoid3D;
    EM.createSculptedHumanoid3D = function (THREE, roleKey, isHero) {
        const root = origCreate.call(this, THREE, roleKey, isHero);
        try { rejoint(THREE, root, isHero); } catch (e) { console.warn('Kunde inte leda om riggen:', e); }
        return root;
    };

    function reparent(child, newParent) {
        // flytta ett objekt till en ny förälder utan att det hoppar (behåller världsläge)
        child.parent && child.parent.updateMatrixWorld(true);
        newParent.updateMatrixWorld(true);
        if (newParent.attach) newParent.attach(child);
        else { const m = child.matrixWorld.clone(); newParent.add(child); }
    }

    function rejoint(THREE, root, isHero) {
        const ud = root.userData;
        const fd = isHero ? 1 : -1;
        root.updateMatrixWorld(true);

        // BEN: varje legGroup har lår, knä, stövel, fot. Lägg knä/stövel/fot i en knäled.
        ud.knees = [];
        (ud.legs || []).forEach(leg => {
            const kids = leg.children.slice();
            const knee = new THREE.Group(); knee.position.set(0, -0.84, 0); leg.add(knee);
            kids.forEach(m => { if (m.position.y <= -0.8) { m.position.y += 0.84; knee.add(m); } });
            ud.knees.push(knee);
        });

        // ARMAR: överarm hänger rakt ner från axeln; armbågsled med underarm, hand och vapen
        const buildArm = (armGroup, isFront) => {
            if (!armGroup) return null;
            const kids = armGroup.children.slice();
            // kända delar (i ordning de skapades): [axel], överarm, underarm, hand, vapen
            const meshes = kids.filter(k => k.isMesh);
            const weapon = isFront ? ud.weaponGroup : null;
            const upper = isFront ? meshes[1] : meshes[0];
            const fore = isFront ? meshes[2] : meshes[1];
            const hand = isFront ? meshes[3] : null;
            if (!upper || !fore) return null;
            upper.position.set(0, -0.28, 0); upper.rotation.set(0, 0, 0);
            const elbow = new THREE.Group(); elbow.position.set(0, -0.56, 0); armGroup.add(elbow);
            armGroup.remove(fore); elbow.add(fore); fore.position.set(0, -0.29, 0); fore.rotation.set(0, 0, 0);
            const wrist = new THREE.Group(); wrist.position.set(0, -0.58, 0); elbow.add(wrist);
            if (hand) { armGroup.remove(hand); wrist.add(hand); hand.position.set(0, 0, 0); }
            if (weapon) { armGroup.remove(weapon); wrist.add(weapon); weapon.position.set(0, 0, 0); weapon.rotation.set(0, 0, -fd * Math.PI / 2); }
            // klor (varulv) följer med handleden
            kids.filter(k => k.isMesh && k.geometry && k.geometry.type === 'ConeGeometry' && k !== upper && k !== fore && k !== hand).forEach(c => { armGroup.remove(c); wrist.add(c); c.position.set(0, -0.06, 0.04); c.rotation.set(0, 0, Math.PI); });
            elbow.rotation.z = fd * 0.5;
            return { elbow, wrist };
        };
        const fa = buildArm(ud.frontArmGroup, true), ba = buildArm(ud.backArmGroup, false);
        ud.frontElbow = fa && fa.elbow; ud.backElbow = ba && ba.elbow;

        // RYGG: låt bålen vrida sig kring höften i stället för kring bröstets mitt
        const torso = ud.torsoGroup;
        if (torso && torso.parent === root) {
            const spine = new THREE.Group(); spine.position.set(0, -0.42, 0); root.add(spine);
            root.remove(torso); spine.add(torso); torso.position.set(0, 0.64, 0);
            ud.spineGroup = spine;
        }
        ud.jointed = true;
    }

    // Tillämpa en pose (samma vinklar som 2D) på en ledad 3D-rigg
    function applyPose3D(ud, P, fd) {
        if (!ud.jointed) return;
        if (ud.spineGroup) ud.spineGroup.rotation.z = -fd * P.lean;
        if (ud.torsoGroup) ud.torsoGroup.rotation.z = 0;
        if (ud.headGroup) ud.headGroup.rotation.z = -fd * P.head * 0.8;
        if (ud.frontArmGroup) ud.frontArmGroup.rotation.z = fd * P.fs;
        if (ud.frontElbow) ud.frontElbow.rotation.z = fd * P.fe;
        if (ud.backArmGroup) ud.backArmGroup.rotation.z = fd * P.bs;
        if (ud.backElbow) ud.backElbow.rotation.z = fd * P.be;
        if (ud.legs && ud.legs[1]) ud.legs[1].rotation.z = fd * P.fh;
        if (ud.legs && ud.legs[0]) ud.legs[0].rotation.z = fd * P.bh;
        if (ud.knees && ud.knees[1]) ud.knees[1].rotation.z = fd * P.fk;
        if (ud.knees && ud.knees[0]) ud.knees[0].rotation.z = fd * P.bk;
    }

    // Ersätter den stela 3D-animeringen: samma poser och övergångar som i 2D
    const origAnimateRig = EM.animateHumanoidRig;
    EM.animateHumanoidRig = function (rig, f, isHero, now) {
        if (!rig || !rig.userData || !f) return;
        const ud = rig.userData;
        if (!ud.jointed) return origAnimateRig && origAnimateRig.call(this, rig, f, isHero, now);
        this.applyHumanoid3DGore(rig, f, now);
        const P = this.animatePose(f, isHero, now);
        const wx = ((f.x - 440) / 440) * 3.8;
        rig.position.x += (wx - rig.position.x) * 0.35;
        rig.position.y = -0.35 - P.dy * 0.0105;              // samma skala som 2D (px → 3D-enheter)
        rig.position.z = isHero ? 0.25 : 0.20;
        rig.rotation.set(0, isHero ? 0.24 : -0.24, 0);
        applyPose3D(ud, P, isHero ? 1 : -1);
    };
    EM._applyPose3D = applyPose3D;
    EM._POSES = POSES;

    // Conquistadoren i 3D: ben i ledgrupper + samma poser (armarna är hela stycken, roteras i axeln)
    const origConq = EM.createUndeadConquistador3D;
    EM.createUndeadConquistador3D = function (THREE) {
        const root = origConq.call(this, THREE);
        try {
            const ud = root.userData;
            const legMeshes = root.children.filter(c => c.isMesh && Math.abs(c.position.z) > 0.2);
            ud.cLegs = []; ud.cKnees = [];
            [-0.25, 0.25].forEach(lz => {
                const parts = legMeshes.filter(m => Math.abs(m.position.z - lz) < 0.01);
                if (!parts.length) return;
                const hip = new THREE.Group(); hip.position.set(parts[0].position.x, -0.62, lz); root.add(hip);
                const knee = new THREE.Group(); knee.position.set(0, -0.9, 0); hip.add(knee);
                parts.forEach(m => {
                    root.remove(m);
                    const ly = m.position.y - (-0.62);
                    if (ly <= -0.85) { knee.add(m); m.position.set(0, ly + 0.9, 0); } else { hip.add(m); m.position.set(0, ly, 0); }
                });
                ud.cLegs.push(hip); ud.cKnees.push(knee);
            });
            ud.jointedConq = true;
        } catch (e) { console.warn('Kunde inte leda om conquistadoren:', e); }
        return root;
    };

    // Kallas varje bildruta från 3D-scenen när conquistadoren slåss (ersätter de fasta armvinklarna)
    EM.animateConquistadorRig = function (rig, f, now) {
        const ud = rig.userData; if (!ud) return;
        const P = this.animatePose(f, false, now);
        rig.position.y = -0.28 - P.dy * 0.0105;
        if (ud.torsoGroup) ud.torsoGroup.rotation.z = P.lean * 1.0;           // vänd åt vänster: positiv lutning framåt
        if (ud.headGroup) ud.headGroup.rotation.z = P.head * 0.6;
        // conquistadorens armar pekar redan snett framåt i viloläget, så vi lägger till skillnaden från idle
        const I = POSES.idle;
        if (ud.rightArmGroup) ud.rightArmGroup.rotation.z = -(P.fs - I.fs) * 0.9;
        if (ud.leftArmGroup) ud.leftArmGroup.rotation.z = -(P.bs - I.bs) * 0.9 - (P.fe - I.fe) * 0.2;
        if (ud.cLegs && ud.cLegs.length === 2) {
            ud.cLegs[1].rotation.z = -P.fh; ud.cLegs[0].rotation.z = -P.bh;
            ud.cKnees[1].rotation.z = -P.fk; ud.cKnees[0].rotation.z = -P.bk;
        }
    };
})();
