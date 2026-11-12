// === DEL 3 AV 4: ELITE MELEE RENDERER, TEXTURER & ANATOMISKA BEN (elite_melee_render.js) ===
window.EliteMelee = window.EliteMelee || {};

Object.assign(window.EliteMelee, {
    texPatterns: null,

    ensureTextures: function(ctx) {
        if (this.texPatterns) return this.texPatterns;
        const patterns = {};
        const makeCanvas = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return ctx.createPattern(c, 'repeat'); };

        patterns.stoneWall = makeCanvas(128, 64, (g, w, h) => {
            g.fillStyle = '#11130e'; g.fillRect(0, 0, w, h);
            g.fillStyle = '#1e2018'; g.fillRect(2, 2, 60, 28); g.fillRect(66, 2, 60, 28); g.fillRect(34, 34, 60, 28);
        });
        patterns.pillarStone = makeCanvas(64, 64, (g, w, h) => { g.fillStyle = '#23261d'; g.fillRect(0, 0, w, h); });
        patterns.mudFloor = makeCanvas(128, 64, (g, w, h) => { g.fillStyle = '#1b140e'; g.fillRect(0, 0, w, h); });
        patterns.redWool = makeCanvas(24, 24, (g, w, h) => { g.fillStyle = '#7a1814'; g.fillRect(0, 0, w, h); });
        patterns.blueUniform = makeCanvas(24, 24, (g, w, h) => { g.fillStyle = '#182430'; g.fillRect(0, 0, w, h); });
        patterns.brazilGreen = makeCanvas(24, 24, (g, w, h) => { g.fillStyle = '#1d3321'; g.fillRect(0, 0, w, h); });
        patterns.ponchoStripe = makeCanvas(32, 32, (g, w, h) => { g.fillStyle = '#7c241b'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8b698'; g.fillRect(0, 8, w, 5); });
        patterns.samuraiSilk = makeCanvas(16, 16, (g, w, h) => { g.fillStyle = '#141926'; g.fillRect(0, 0, w, h); });
        patterns.dirtyLinen = makeCanvas(24, 24, (g, w, h) => { g.fillStyle = '#b5a895'; g.fillRect(0, 0, w, h); });
        patterns.wornLeather = makeCanvas(24, 24, (g, w, h) => { g.fillStyle = '#25201c'; g.fillRect(0, 0, w, h); });
        patterns.goreTex = makeCanvas(32, 32, (g, w, h) => { g.fillStyle = '#6e0404'; g.fillRect(0, 0, w, h); });
        patterns.pomberoFur = makeCanvas(24, 24, (g, w, h) => { g.fillStyle = '#141311'; g.fillRect(0, 0, w, h); });
        patterns.rustedArmor = makeCanvas(32, 32, (g, w, h) => { g.fillStyle = '#2c3236'; g.fillRect(0, 0, w, h); });

        this.texPatterns = patterns;
        return patterns;
    },

    // RITAR HELARE, REJÄLA SKELETTDELAR (Knäckta rörben på mitten med ledknutor & benmärg, revbensbågar & käkhalvor)
    drawAnatomicalBonePieces: function(ctx) {
        this.boneParticles.forEach(b => {
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.rot);
            ctx.fillStyle = '#e6dec8'; ctx.strokeStyle = '#2b2318'; ctx.lineWidth = 1.6;

            if (b.kind === 'broken_longbone') {
                const half = b.len * 0.5;
                ctx.beginPath(); ctx.arc(-half, -3, b.thick * 0.55, 0, Math.PI * 2); ctx.arc(-half, 3, b.thick * 0.55, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillRect(-half, -b.thick * 0.42, half - 2, b.thick * 0.84); ctx.strokeRect(-half, -b.thick * 0.42, half - 2, b.thick * 0.84);
                ctx.fillStyle = '#8b0000'; ctx.beginPath(); ctx.arc(0, 0, b.thick * 0.55, 0, Math.PI * 2); ctx.fill();
                ctx.rotate(b.bendAngle || 0.48);
                ctx.fillStyle = '#dfd5bc';
                ctx.fillRect(2, -b.thick * 0.42, half - 2, b.thick * 0.84); ctx.strokeRect(2, -b.thick * 0.42, half - 2, b.thick * 0.84);
                ctx.beginPath(); ctx.arc(half, -3, b.thick * 0.52, 0, Math.PI * 2); ctx.arc(half, 3, b.thick * 0.52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (b.kind === 'rib_arc') {
                ctx.strokeStyle = '#e6dec8'; ctx.lineWidth = b.thick; ctx.lineCap = 'round';
                ctx.beginPath(); ctx.arc(0, b.len * 0.4, b.len * 0.65, -Math.PI * 0.82, -Math.PI * 0.18); ctx.stroke();
            } else {
                ctx.fillStyle = '#e0d6be'; ctx.fillRect(-14, -4, 28, 9); ctx.strokeRect(-14, -4, 28, 9);
                ctx.fillStyle = '#ffffff';
                for (let tx = -10; tx <= 8; tx += 6) { ctx.fillRect(tx, -10, 4, 6); }
            }
            ctx.restore();
        });
    },

    drawAnatomicalLimb: function(ctx, x1, y1, x2, y2, w1, w2, fillStyle, bloodAmount) {
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ang = Math.atan2(dy, dx);
        ctx.save(); ctx.translate(x1, y1); ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(0, -w1 / 2); ctx.quadraticCurveTo(len * 0.45, -Math.max(w1, w2) * 0.58, len, -w2 / 2);
        ctx.arc(len, 0, w2 / 2, -Math.PI / 2, Math.PI / 2);
        ctx.quadraticCurveTo(len * 0.45, Math.max(w1, w2) * 0.58, 0, w1 / 2);
        ctx.arc(0, 0, w1 / 2, Math.PI / 2, -Math.PI / 2); ctx.closePath();
        ctx.fillStyle = fillStyle; ctx.fill();
        if (bloodAmount > 0.05) {
            ctx.fillStyle = 'rgba(115, 5, 5, ' + Math.min(0.88, bloodAmount) + ')';
            ctx.beginPath(); ctx.ellipse(len * 0.55, 0, len * 0.35, w2 * 0.38, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = '#0a0705'; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.restore();
    },

    drawVisceraChains: function(ctx) {
        if (!this.visceraChains || !this.visceraChains.length) return;
        ctx.save();
        this.visceraChains.forEach(chain => {
            ctx.strokeStyle = '#9e2a2b'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath();
            chain.nodes.forEach((n, idx) => { if (idx === 0) ctx.moveTo(n.x, n.y); else ctx.lineTo(n.x, n.y); });
            ctx.stroke();
        });
        ctx.restore();
    },

    drawSeveredLimbs: function(ctx, tex) {
        this.severedLimbs.forEach(limb => {
            ctx.save(); ctx.translate(limb.x, limb.y); ctx.rotate(limb.rot);
            this.drawAnatomicalLimb(ctx, 0, 0, 48, 8, 22, 16, tex.rustedArmor || '#2e3438', 0.9);
            ctx.fillStyle = '#ece6d8'; ctx.fillRect(-10, -3, 10, 6);
            ctx.restore();
        });
    },

    drawFighterBody: function(ctx, f, isHero, now, tex) {
        ctx.save();
        const x = f.x, y = f.y, dir = isHero ? 1 : -1;
        const isPissSideStance = (!isHero && f === this.enemy && this.phase === 'enemy_fatality_anim' && this.enemyFatalityStage === 'piss_side_stance');
        const isEnemyKneeling = (!isHero && f === this.enemy && (this.phase === 'dizzy' || this.phase === 'fatality_anim' || (this.phase === 'over' && this.enemy.hp <= 0)));
        const isHeroKneeling = (isHero && (this.phase === 'enemy_fatality_anim' || (this.phase === 'over' && this.hero.hp <= 0)));
        const isKneeling = isEnemyKneeling || isHeroKneeling;
        const isPombero = (!isHero && f.type === 'pombero');
        const isLobizon = (!isHero && f.type === 'lobizon');
        const isBeast = isPombero || isLobizon;
        const breath = Math.sin(now * 0.005 + (isHero ? 0 : 2)) * 3;
        const kneeCollapse = isKneeling ? 76 : (isPombero ? 34 : (isLobizon ? 14 : 0));
        const pelvisThrustX = isPissSideStance ? (-18 - Math.sin(now * 0.012) * 5) : 0;

        ctx.translate(x + pelvisThrustX, y + kneeCollapse);
        ctx.scale(dir, 1);
        if (isLobizon) ctx.scale(1.18, 1.12); // varulven är större

        const bloodCoat = (f.injuries && f.injuries.bloodCoat !== undefined) ? f.injuries.bloodCoat : 0.2;
        const skinCol = isHero ? (f.key === 'bloom' ? '#4a2c1d' : '#b8835c') : (isPombero ? '#1c1a17' : (isLobizon ? '#2a231d' : (f.type === 'skeleton' ? '#6e6854' : '#a67856')));
        const torsoTex = isHero ? (f.key === 'gomez' ? tex.redWool : (f.key === 'arandu' ? tex.ponchoStripe : tex.blueUniform)) : (isBeast ? tex.pomberoFur : (f.type === 'skeleton' ? tex.rustedArmor : (f.subType === 'gaucho' ? tex.ponchoStripe : tex.brazilGreen)));
        const pantsTex = isBeast ? tex.pomberoFur : tex.wornLeather;
        const hipY = -148 + breath * 0.5;

        // Ben
        this.drawAnatomicalLimb(ctx, -22, hipY, -38, -78, 34, 24, pantsTex, bloodCoat * 0.6);
        this.drawAnatomicalLimb(ctx, -38, -78, -46, -8, 24, 18, '#14100d', bloodCoat * 0.8);
        if (f.pose === 'kick') {
            this.drawAnatomicalLimb(ctx, 14, hipY, 36, -118, 36, 25, pantsTex, bloodCoat);
            this.drawAnatomicalLimb(ctx, 36, -118, 108, -105, 25, 19, '#120e0b', bloodCoat);
        } else {
            this.drawAnatomicalLimb(ctx, 16, hipY, 28, -76, 36, 25, pantsTex, bloodCoat);
            this.drawAnatomicalLimb(ctx, 28, -76, 36, -8, 25, 19, '#14100d', bloodCoat);
        }

        // Torso
        const shoulderY = -246 + breath;
        let torsoLean = isPissSideStance ? -0.26 : ((f.pose === 'punch' || f.pose === 'grapple' || f.pose === 'fatality') ? 0.16 : (f.pose === 'windup' ? -0.14 : (f.pose === 'hurt' ? -0.1 : 0.05)));
        ctx.save(); ctx.translate(0, hipY); ctx.rotate(torsoLean);
        ctx.beginPath(); ctx.moveTo(-26, 6); ctx.lineTo(-36, -62); ctx.lineTo(-28, -108); ctx.lineTo(28, -108); ctx.lineTo(36, -62); ctx.lineTo(26, 6); ctx.closePath();
        ctx.fillStyle = torsoTex; ctx.fill(); ctx.strokeStyle = '#0d0907'; ctx.lineWidth = 2; ctx.stroke();

        if (f.injuries && f.injuries.disemboweled) {
            ctx.fillStyle = '#7a0000'; ctx.beginPath(); ctx.ellipse(8, -36, 18, 25, 0, 0, Math.PI * 2); ctx.fill();
        }
        if (this.drawGoreTorso) this.drawGoreTorso(ctx, f, isHero, now);

        // Huvud
        const neckY = -114;
        if (!(!isHero && f.injuries && f.injuries.headSevered)) {
            ctx.save();
            const sideLookDown = (isPissSideStance && this.enemyFatalityTimer > 2.1) ? Math.min(0.58, (this.enemyFatalityTimer - 2.1) * 0.45) : 0;
            ctx.translate(3, neckY - 26); ctx.rotate(sideLookDown);
            ctx.fillStyle = skinCol; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
            if (!isHero && f.type === 'skeleton') {
                ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(11, -5, 3.5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#37474f'; ctx.beginPath(); ctx.arc(0, -10, 23, Math.PI, 0); ctx.fill();
                if (this.drawZombieHeadDecay) this.drawZombieHeadDecay(ctx, now);
                if (isPissSideStance && this.enemyFatalityTimer > 2.4) {
                    ctx.save(); ctx.scale(-1, 1); ctx.font = 'bold 30px Georgia'; ctx.fillStyle = '#ffd54f'; ctx.fillText('?', -6, -42); ctx.restore();
                }
            } else if (isPombero) {
                ctx.fillStyle = '#ffab00'; ctx.beginPath(); ctx.arc(10, -4, 6, 0, Math.PI * 2); ctx.fill();
            } else if (isLobizon) {
                // Vargnos, öron, gula ögon och huggtänder
                ctx.fillStyle = skinCol;
                ctx.beginPath(); ctx.moveTo(14, -10); ctx.lineTo(48, 2); ctx.lineTo(44, 12); ctx.lineTo(12, 14); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#0a0706'; ctx.beginPath(); ctx.arc(47, 4, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = skinCol;
                ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(-6, -40); ctx.lineTo(2, -16); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(10, -42); ctx.lineTo(16, -14); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#ffea00'; ctx.beginPath(); ctx.arc(12, -6, 3.6, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#efe6cf';
                ctx.beginPath(); ctx.moveTo(30, 10); ctx.lineTo(33, 19); ctx.lineTo(36, 10); ctx.fill();
                ctx.beginPath(); ctx.moveTo(38, 9); ctx.lineTo(40, 16); ctx.lineTo(43, 9); ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();

        // Främre arm
        if (!isHero && f.injuries && f.injuries.armSevered && this.drawArmStump) this.drawArmStump(ctx, f, shoulderY, now);
        if (!(!isHero && f.injuries && f.injuries.armSevered)) {
            const isAttacking = (f.pose === 'punch' || f.pose === 'grapple' || f.pose === 'fatality');
            const isBlock = (f.pose === 'block');
            const isWindup = (f.pose === 'windup');
            const jiggleY = isPissSideStance ? Math.sin(now * 0.03) * 4 : 0;
            let fElbX = isPissSideStance ? 8 : (isAttacking ? 54 : 26);
            let fElbY = isPissSideStance ? (shoulderY + 55) : (shoulderY + 28);
            let fHandX = isPissSideStance ? 28 : (isAttacking ? 108 : 62);
            let fHandY = isPissSideStance ? (-135 + jiggleY) : (shoulderY + 14);
            if (isBlock) { fElbX = 40; fElbY = shoulderY + 6; fHandX = 46; fHandY = shoulderY - 52; }      // garden uppe
            if (isWindup) { fElbX = -6; fElbY = shoulderY + 24; fHandX = -40; fHandY = shoulderY - 8; }   // drar tillbaka
            this.drawAnatomicalLimb(ctx, 12, shoulderY + 4, fElbX, fElbY, 26, 20, torsoTex, bloodCoat * 0.7);
            this.drawAnatomicalLimb(ctx, fElbX, fElbY, fHandX, fHandY, 20, 15, skinCol, bloodCoat * 0.9);
            if (!isPissSideStance && (isHero || !isBeast)) {
                ctx.fillStyle = '#cfd8dc';
                if (isBlock) ctx.fillRect(fHandX - 4, fHandY - 50, 8, 65);       // klingan lodrätt som skydd
                else ctx.fillRect(fHandX, fHandY - 5, 65, 8);
            } else if (isLobizon && !isPissSideStance) {
                ctx.strokeStyle = '#1a1512'; ctx.lineWidth = 3; ctx.lineCap = 'round';
                for (let c = 0; c < 3; c++) { ctx.beginPath(); ctx.moveTo(fHandX + 4, fHandY - 6 + c * 6); ctx.lineTo(fHandX + 22, fHandY - 10 + c * 7); ctx.stroke(); }
            }
            if (f.hitFlash > 0) { // vit blixt på den som träffas
                ctx.save(); ctx.globalAlpha = Math.min(0.55, f.hitFlash * 4); ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.ellipse(10, shoulderY + 60, 48, 120, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            }
        }
        ctx.restore();
    },

    drawXRayOverlay: function(ctx, x, y, part) {
        ctx.save();
        const r = 92; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
        ctx.fillStyle = 'rgba(4, 15, 24, 0.94)'; ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.strokeStyle = '#e0f7fa'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(x, y - 15, 32, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#ff1744'; ctx.lineWidth = 4.5;
        ctx.beginPath(); ctx.moveTo(x - 32, y - 18); ctx.lineTo(x + 8, y + 6); ctx.lineTo(x + 34, y - 14); ctx.stroke();
        ctx.restore();
    },

    renderArena: function(now) {
        if (!this.ctx) return;
        const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, tex = this.ensureTextures(ctx), floorY = 415;

        if (this.phase === 'takeover_anim' && this.usurper) {
            if (this.usurper.stage === 'horror_closeup') { this.drawHorrorFaceCloseup(ctx, w, h, now, tex); return; }
            if (this.usurper.stage === 'pombero_cana_autopsy') { this.drawPomberoCanaSearchScene(ctx, w, h, now, tex); return; }
        }
        if (this.phase === 'sake_diplomacy_anim') { this.drawPomberoSakeDiplomacyScene(ctx, w, h, now, tex); return; }
        if (this.phase === 'enemy_fatality_anim' && this.enemyFatalityStage === 'piss_front_closeup') { this.drawZombieGroinFailCloseup(ctx, w, h, now, tex); return; }

        ctx.save();
        if (Math.abs(this.camZoom - 1.0) > 0.005) {
            ctx.translate(w / 2, h / 2); ctx.scale(this.camZoom, this.camZoom); ctx.translate(-this.camFocusX, -this.camFocusY);
        }
        if (this.camShake > 0) ctx.translate((Math.random() - 0.5) * this.camShake, (Math.random() - 0.5) * this.camShake);

        ctx.fillStyle = tex.stoneWall || '#140f0c'; ctx.fillRect(-180, -180, w + 360, floorY + 180);
        ctx.fillStyle = tex.mudFloor || '#1f1510'; ctx.fillRect(-180, floorY, w + 360, h - floorY + 200);

        this.groundBlood.forEach(gb => { ctx.fillStyle = gb.col; ctx.beginPath(); ctx.ellipse(gb.x, gb.y, gb.r * 1.8, gb.r * 0.45, 0, 0, Math.PI * 2); ctx.fill(); });

        this.drawFighterBody(ctx, this.hero, true, now, tex);
        if (this.enemy) this.drawFighterBody(ctx, this.enemy, false, now, tex);
        if (this.usurper) this.drawFighterBody(ctx, this.usurper, false, now, tex);

        this.drawVisceraChains(ctx);
        this.drawSeveredLimbs(ctx, tex);
        this.bloodParticles.forEach(p => { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); });
        this.drawAnatomicalBonePieces(ctx);
        if (this.drawGoreWorldOverlays) this.drawGoreWorldOverlays(ctx, now);

        if (this.xrayTimer > 0) this.drawXRayOverlay(ctx, this.enemy.x, this.enemy.y - 195, this.xrayTargetPart);
        ctx.restore();

        if (this.cinemaBanner) {
            ctx.save(); ctx.textAlign = 'center'; ctx.font = 'bold 30px Georgia'; ctx.fillStyle = '#ff1744';
            ctx.fillText(this.cinemaBanner, w / 2, 54);
            if (this.cinemaSubBanner) { ctx.font = 'italic 16px Georgia'; ctx.fillStyle = '#ffd54f'; ctx.fillText(this.cinemaSubBanner, w / 2, 80); }
            ctx.restore();
        }
    }
});
