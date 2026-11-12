// === ELITE 3D RAYCASTER ENGINE v6 (elite_raycaster.js) ===
// Felsäkrad motor som kontrollerar att alla moduler är laddade, initierar texturer
// och har inbyggd reserv-rendering så att texturer ALLTID syns oavsett filnamn!

window.EliteRaycaster = {
    canvas: null,
    ctx: null,
    miniCanvas: null,
    miniCtx: null,

    currentEnvironment: 'jungle',

    fov: Math.PI / 3,
    numRays: 190,
    zBuffer: [],

    player: {
        x: 4.5,
        y: 8.2,
        angle: -Math.PI / 2,
        moveSpeed: 2.3,
        rotSpeed: 2.2,
        bobPhase: 0,
        weaponAnim: 0,
        muzzleFlash: 0
    },

    keys: {},
    lastTime: 0,
    fallbackWalls: {},

    setKey: function(code, state) {
        this.keys[code] = state;
    },

    ensureFallbackTextures: function() {
        // Om användaren råkat ha en saknad texturfil skapas skarpa 64x64 reservtexturer här
        if (this.fallbackWalls[1]) return;
        for (let t = 1; t <= 3; t++) {
            const c = document.createElement('canvas');
            c.width = c.height = 64;
            const ctx = c.getContext('2d');
            ctx.fillStyle = t === 1 ? '#1e4620' : (t === 2 ? '#5c5852' : '#6b4226');
            ctx.fillRect(0, 0, 64, 64);
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 2;
            for (let y = 0; y < 64; y += 16) {
                ctx.strokeRect(0, y, 64, 16);
                for (let x = (y % 32 === 0 ? 0 : 16); x < 64; x += 32) {
                    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke();
                }
            }
            this.fallbackWalls[t] = c;
        }
    },

    getActiveTextureModule: function() {
        if (this.currentEnvironment === 'andes' && window.BergsTextur) {
            if (!window.BergsTextur.ready) window.BergsTextur.init();
            return window.BergsTextur;
        }
        if (this.currentEnvironment === 'city' && window.StadsTextur) {
            if (!window.StadsTextur.ready) window.StadsTextur.init();
            return window.StadsTextur;
        }
        if (window.DjungelTextur) {
            if (!window.DjungelTextur.ready) window.DjungelTextur.init();
            return window.DjungelTextur;
        }
        return null;
    },

    setEnvironment: function(envKey) {
        this.currentEnvironment = envKey;
        const envNames = {
            jungle: "🌿 Mato Grossos Djungel & Tempelruiner",
            andes: "🏔️ Anderna & Altiplano-passen",
            city: "🏛️ Kolonial Stadsmiljö 1864 (Asunción / Corrientes / Fort)"
        };
        if (window.EliteSquad) {
            window.EliteSquad.addAudioLog("🗺️ Miljö växlad till: " + (envNames[envKey] || envKey), "#ffe082");
        }
        this.updateModuleDiagnostics();
    },

    updateModuleDiagnostics: function() {
        const diagEl = document.getElementById('module-status-bar');
        if (!diagEl) return;
        const checks = [
            { name: 'djungeltextur.js', ok: !!window.DjungelTextur },
            { name: 'bergstextur.js', ok: !!window.BergsTextur },
            { name: 'stadstextur.js', ok: !!window.StadsTextur },
            { name: 'fiender (3 st)', ok: !!(window.EnemyRegistry && window.EnemyRegistry['skeleton']) },
            { name: 'artefakter.js', ok: !!(window.ArtifactRegistry && window.ArtifactRegistry['brazil_tech']) },
            { name: 'vapen_sprites.js', ok: !!window.VapenSinne }
        ];
        diagEl.innerHTML = checks.map(c =>
            `<span style="padding:2px 6px; border-radius:3px; font-size:0.74rem; background:${c.ok ? '#1e4620' : '#6e1b1b'}; color:${c.ok ? '#b9f6ca' : '#ffcdd2'}; border:1px solid ${c.ok ? '#4caf50' : '#ef5350'};">` +
            `${c.ok ? '✔' : '✖ Saknas:'} ${c.name}</span>`
        ).join(' ');
    },

    init: function() {
        this.canvas = document.getElementById('view3d');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;

        this.miniCanvas = document.getElementById('minimap');
        this.miniCtx = this.miniCanvas.getContext('2d');

        this.ensureFallbackTextures();
        this.updateModuleDiagnostics();

        if (window.EliteMap && window.EliteMap.playerStart) {
            this.player.x = window.EliteMap.playerStart.x;
            this.player.y = window.EliteMap.playerStart.y;
            this.player.angle = window.EliteMap.playerStart.angle;
        }

        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.fireFrontWeapon();
            }
            if (e.code === 'Digit1' && window.VapenSinne) window.VapenSinne.selectWeapon('machete');
            if (e.code === 'Digit2' && window.VapenSinne) window.VapenSinne.selectWeapon('rifle');
            if (e.code === 'Digit3' && window.VapenSinne) window.VapenSinne.selectWeapon('pistols');
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });

        this.canvas.addEventListener('mousedown', () => {
            this.fireFrontWeapon();
        });

        if (window.EliteSquad) window.EliteSquad.renderHUD();
        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    },

    fireFrontWeapon: function() {
        let weap = { key: 'rifle', name: 'Enfield-gevär', spread: 0.30, range: 5.5, dmgBonus: 0 };
        if (window.VapenSinne) {
            if (!window.VapenSinne.canFire()) return;
            weap = window.VapenSinne.triggerAttack();
        } else {
            if (this.player.weaponAnim > 0) return;
            this.player.weaponAnim = 0.28;
            this.player.muzzleFlash = 0.12;
        }

        let bestTarget = null;
        let bestDist = 999;

        window.EliteMap.enemies.forEach(en => {
            if (en.dead) return;
            const dx = en.x - this.player.x;
            const dy = en.y - this.player.y;
            const dist = Math.hypot(dx, dy);
            let relAngle = Math.atan2(dy, dx) - this.player.angle;
            while (relAngle > Math.PI) relAngle -= Math.PI * 2;
            while (relAngle < -Math.PI) relAngle += Math.PI * 2;

            if (Math.abs(relAngle) < weap.spread && dist < weap.range && dist < bestDist) {
                bestDist = dist;
                bestTarget = en;
            }
        });

        if (bestTarget) {
            const basePower = (window.EliteSquad && window.EliteSquad.members.front) ? window.EliteSquad.members.front.power : 28;
            const dmg = Math.max(8, basePower + (weap.dmgBonus || 0));
            bestTarget.hp -= dmg;
            bestTarget.hurtTimer = 0.25;
            const verb = weap.key === 'machete' ? "🗡️ [MACHETEHUGG]" : "🔫 [" + weap.name.toUpperCase() + "]";
            if (bestTarget.hp <= 0) {
                bestTarget.dead = true;
                window.EliteSquad.addAudioLog(verb + " Du fällde " + bestTarget.name + "!", "#a7ffeb");
            } else {
                window.EliteSquad.addAudioLog(verb + " Träff på " + bestTarget.name + " (-" + dmg + " HP)!", "#e0f2f1");
            }
            window.EliteSquad.renderHUD();
        }
    },

    loop: function(now) {
        const dt = Math.min(0.1, (now - this.lastTime) / 1000);
        this.lastTime = now;

        this.updateMovement(dt);
        if (window.VapenSinne) window.VapenSinne.update(dt);
        if (window.EliteMap) window.EliteMap.updateEntities(dt, this.player);
        if (window.EliteSquad) window.EliteSquad.updateSquadCombat(dt, this.player, window.EliteMap.enemies);

        this.render3D(now);
        this.renderMinimap();

        requestAnimationFrame(t => this.loop(t));
    },

    updateMovement: function(dt) {
        if (this.player.weaponAnim > 0) this.player.weaponAnim = Math.max(0, this.player.weaponAnim - dt);
        if (this.player.muzzleFlash > 0) this.player.muzzleFlash = Math.max(0, this.player.muzzleFlash - dt);

        if (this.keys['ArrowLeft'] || this.keys['KeyQ']) {
            this.player.angle -= this.player.rotSpeed * dt;
        }
        if (this.keys['ArrowRight'] || this.keys['KeyE']) {
            this.player.angle += this.player.rotSpeed * dt;
        }

        let moveStep = 0;
        let strafeStep = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveStep = this.player.moveSpeed * dt;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveStep = -this.player.moveSpeed * dt;
        if (this.keys['KeyA']) strafeStep = -this.player.moveSpeed * 0.8 * dt;
        if (this.keys['KeyD']) strafeStep = this.player.moveSpeed * 0.8 * dt;

        if (moveStep !== 0 || strafeStep !== 0) {
            this.player.bobPhase += dt * 9;
            // Lost Patrol-stil: risk för bakhåll på ryggvakten
            if (window.EliteMelee && Math.abs(moveStep) + Math.abs(strafeStep) > 0) {
                // Slumpa soldat och fiende
                const soldiers = ['bloom', 'rojas', 'villalba', 'residenta'];
                const sid = soldiers[Math.floor(Math.random() * soldiers.length)];
                const eid = Math.random() < 0.15 ? 'conquistador_zombie' : (Math.random() < 0.3 ? 'pombero' : 'bra_scout');
                
                // Chans för krypskytte-sekvens (Villalba)
                if (Math.random() < 0.08 && window.EliteSniper && !window.EliteSniper.active && !window.EliteMelee.active) {
                    window.EliteSniper.start('villalba');
                    return;
                }
if (window.EliteMeleeEngine) {
                    window.EliteMeleeEngine.start(sid, eid);
                } else if (window.EliteMelee) {
                    window.EliteMelee.startAmbush(sid, eid);
                }
            }
        }

        const nx = this.player.x + Math.cos(this.player.angle) * moveStep + Math.cos(this.player.angle + Math.PI/2) * strafeStep;
        const ny = this.player.y + Math.sin(this.player.angle) * moveStep + Math.sin(this.player.angle + Math.PI/2) * strafeStep;

        if (window.EliteMap.isWall(nx, this.player.y) === 0) this.player.x = nx;
        if (window.EliteMap.isWall(this.player.x, ny) === 0) this.player.y = ny;
    },

    render3D: function(now) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;
        const texMod = this.getActiveTextureModule();

        // 1. Mark & Tak
        if (texMod && texMod.ready) {
            texMod.renderFloorAndCeiling(ctx, w, h, this.player);
        } else {
            ctx.fillStyle = '#0e1f10';
            ctx.fillRect(0, 0, w, h / 2);
            ctx.fillStyle = '#241b12';
            ctx.fillRect(0, h / 2, w, h / 2);
        }

        const stripWidth = w / this.numRays;
        this.zBuffer = new Array(this.numRays);
        const texSize = texMod ? texMod.TEX_SIZE : 64;

        // 2. Väggar med DDA-strålkastning
        for (let i = 0; i < this.numRays; i++) {
            const rayAngle = (this.player.angle - this.fov / 2) + (i / this.numRays) * this.fov;
            const rayDirX = Math.cos(rayAngle);
            const rayDirY = Math.sin(rayAngle);

            let mapX = Math.floor(this.player.x);
            let mapY = Math.floor(this.player.y);

            const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
            const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));

            let stepX, sideDistX;
            let stepY, sideDistY;

            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (this.player.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1.0 - this.player.x) * deltaDistX;
            }

            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (this.player.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1.0 - this.player.y) * deltaDistY;
            }

            let hitWall = 0;
            let side = 0;
            let safety = 0;

            while (hitWall === 0 && safety < 32) {
                safety++;
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                hitWall = window.EliteMap.isWall(mapX, mapY);
            }

            let perpWallDist;
            if (side === 0) perpWallDist = (mapX - this.player.x + (1 - stepX) / 2) / (rayDirX || 0.00001);
            else            perpWallDist = (mapY - this.player.y + (1 - stepY) / 2) / (rayDirY || 0.00001);

            const correctedDist = Math.max(0.12, perpWallDist * Math.cos(rayAngle - this.player.angle));
            this.zBuffer[i] = correctedDist;

            const wallHeight = Math.floor((h * 0.9) / correctedDist);
            const drawY = Math.floor((h - wallHeight) / 2);

            let wallX;
            if (side === 0) wallX = this.player.y + perpWallDist * rayDirY;
            else            wallX = this.player.x + perpWallDist * rayDirX;
            wallX -= Math.floor(wallX);

            const texX = Math.min(texSize - 1, Math.max(0, Math.floor(wallX * texSize)));
            const texCanvas = (texMod && texMod.wallCanvases[hitWall]) ? texMod.wallCanvases[hitWall] : this.fallbackWalls[hitWall || 1];

            if (texCanvas) {
                ctx.drawImage(
                    texCanvas,
                    texX, 0, 1, texSize,
                    Math.floor(i * stripWidth), drawY, Math.ceil(stripWidth) + 1, wallHeight
                );
            }

            const darkness = Math.min(0.82, (correctedDist / 9.5) + (side === 1 ? 0.18 : 0));
            if (darkness > 0.05) {
                ctx.fillStyle = `rgba(6, 10, 14, ${darkness})`;
                ctx.fillRect(Math.floor(i * stripWidth), drawY, Math.ceil(stripWidth) + 1, wallHeight);
            }
        }

        // 3. Fiender & Artefakter (Kompatibel med både v1 och v2 av elite_map.js!)
        const sprites = [];
        if (window.EliteMap.enemies) {
            window.EliteMap.enemies.forEach(en => {
                if (!en.dead) sprites.push({ kind: 'enemy', ref: en, x: en.x, y: en.y });
            });
        }
        if (window.EliteMap.artifacts) {
            window.EliteMap.artifacts.forEach(art => {
                if (!art.collected) sprites.push({ kind: 'artifact', ref: art, x: art.x, y: art.y });
            });
        } else if (window.EliteMap.relicItem && !window.EliteMap.relicItem.collected) {
            sprites.push({ kind: 'artifact', ref: { type: 'relic', x: window.EliteMap.relicItem.x, y: window.EliteMap.relicItem.y }, x: window.EliteMap.relicItem.x, y: window.EliteMap.relicItem.y });
        }

        sprites.forEach(s => {
            s.dist = Math.hypot(s.x - this.player.x, s.y - this.player.y);
        });
        sprites.sort((a, b) => b.dist - a.dist);

        sprites.forEach(sp => {
            const dx = sp.x - this.player.x;
            const dy = sp.y - this.player.y;
            let relAngle = Math.atan2(dy, dx) - this.player.angle;
            while (relAngle > Math.PI) relAngle -= Math.PI * 2;
            while (relAngle < -Math.PI) relAngle += Math.PI * 2;

            if (Math.abs(relAngle) < this.fov * 0.7 && sp.dist > 0.3) {
                const screenX = (0.5 + relAngle / this.fov) * w;
                const spriteSize = Math.min(h * 1.15, Math.floor((h * 0.85) / sp.dist));
                const rayIdx = Math.floor((screenX / w) * this.numRays);

                if (rayIdx >= 0 && rayIdx < this.numRays && this.zBuffer[rayIdx] > sp.dist - 0.25) {
                    let spriteCanvas = null;
                    let labelText = "";

                    if (sp.kind === 'enemy') {
                        const en = sp.ref;
                        labelText = `${en.name} (${en.hp})`;
                        const mod = window.EnemyRegistry && window.EnemyRegistry[en.type];
                        if (mod) spriteCanvas = mod.getSprite(en, now);
                    } else if (sp.kind === 'artifact') {
                        const art = sp.ref;
                        const reg = window.ArtifactRegistry && window.ArtifactRegistry[art.type];
                        if (reg && window.ArtifactSystem) {
                            labelText = reg.name;
                            spriteCanvas = window.ArtifactSystem.getSprite(art.type, now);
                        }
                    }

                    if (spriteCanvas) {
                        ctx.drawImage(
                            spriteCanvas,
                            Math.floor(screenX - spriteSize / 2),
                            Math.floor(h / 2 - spriteSize * 0.42),
                            spriteSize,
                            spriteSize
                        );
                    } else {
                        // Fallback om någon fiendefil saknas
                        ctx.font = `${Math.floor(spriteSize * 0.6)}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.fillText(sp.kind === 'artifact' ? '🗿' : '💀', screenX, h / 2);
                    }

                    if (labelText) {
                        ctx.save();
                        ctx.font = 'bold 12px Georgia';
                        ctx.fillStyle = sp.kind === 'artifact' ? '#ffe082' : '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.shadowColor = '#000';
                        ctx.shadowBlur = 4;
                        ctx.fillText(labelText, screenX, h / 2 - spriteSize * 0.44);
                        ctx.restore();
                    }
                }
            }
        });

        // 4. Siktkors
        ctx.strokeStyle = 'rgba(255, 235, 130, 0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w/2 - 12, h/2); ctx.lineTo(w/2 + 12, h/2);
        ctx.moveTo(w/2, h/2 - 12); ctx.lineTo(w/2, h/2 + 12);
        ctx.stroke();

        // 5. Förstapersonsvapen
        if (window.VapenSinne) {
            window.VapenSinne.renderFirstPersonWeapon(ctx, w, h, this.player.bobPhase);
        }

        // 6. Varningslampor för Flanker & Rygg (Bloom!)
        if (window.EliteSquad && window.EliteSquad.members.back.flashing > 0) {
            ctx.fillStyle = 'rgba(255, 80, 40, 0.55)';
            ctx.fillRect(0, h - 22, w, 22);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Georgia';
            ctx.textAlign = 'center';
            ctx.fillText('🥊 BLOOM SLÅSS MOT BAKHÅLL BAKOM RYGGEN! (180°)', w / 2, h - 6);
        }
        if (window.EliteSquad && window.EliteSquad.members.left.flashing > 0) {
            ctx.fillStyle = 'rgba(120, 255, 140, 0.42)';
            ctx.fillRect(0, 0, 18, h);
        }
        if (window.EliteSquad && window.EliteSquad.members.right.flashing > 0) {
            ctx.fillStyle = 'rgba(100, 210, 255, 0.42)';
            ctx.fillRect(w - 18, 0, 18, h);
        }
    },

    renderMinimap: function() {
        const ctx = this.miniCtx;
        const mw = this.miniCanvas.width;
        const mh = this.miniCanvas.height;
        const cellW = mw / window.EliteMap.width;
        const cellH = mh / window.EliteMap.height;

        ctx.clearRect(0, 0, mw, mh);

        for (let y = 0; y < window.EliteMap.height; y++) {
            for (let x = 0; x < window.EliteMap.width; x++) {
                const v = window.EliteMap.grid[y][x];
                if (v === 0) ctx.fillStyle = '#1d291c';
                else if (v === 1) ctx.fillStyle = '#385c34';
                else if (v === 2) ctx.fillStyle = '#6e6a63';
                else ctx.fillStyle = '#7a4e2d';
                ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
            }
        }

        if (window.EliteMap.artifacts) {
            window.EliteMap.artifacts.forEach(art => {
                if (art.collected) return;
                const colors = { relic: '#e040fb', brazil_tech: '#00e676', ammo_crate: '#ffd54f', yerba_medkit: '#80d8ff' };
                ctx.fillStyle = colors[art.type] || '#e040fb';
                ctx.beginPath();
                ctx.arc(art.x * cellW, art.y * cellH, 4.5, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        if (window.EliteMap.enemies) {
            window.EliteMap.enemies.forEach(en => {
                if (en.dead) return;
                ctx.fillStyle = '#ff5252';
                ctx.beginPath();
                ctx.arc(en.x * cellW, en.y * cellH, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        const px = this.player.x * cellW;
        const py = this.player.y * cellH;

        ctx.strokeStyle = 'rgba(255, 235, 59, 0.6)';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(this.player.angle - this.fov/2) * 28, py + Math.sin(this.player.angle - this.fov/2) * 28);
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(this.player.angle + this.fov/2) * 28, py + Math.sin(this.player.angle + this.fov/2) * 28);
        ctx.stroke();

        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
    }
};
