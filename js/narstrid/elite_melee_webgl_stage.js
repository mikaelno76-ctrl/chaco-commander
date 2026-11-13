// === MODUL: FULL 3D-SCEN, 3D-GORE-KOREOGRAFI & TRANSPARENT HUD-LAGER (elite_melee_webgl_stage.js) ===
// v4.0 FULL 3D IN ALL SLOW BRUTAL SEQUENCES:
// 1. ALLA kämpar (Bloom, Gómez, Soldat, Gaucho, Conquistador, El Pombero, Sensei Takeda) är nu
//    skulpterade, ledade 3D-figurer med oljemålnings-texturer!
// 2. ALLA långsamma, brutala sekvenser (Amputation, Ryggrad ut, Hjärta ut, Klyvning, Tarmar ut,
//    Zombie Skräck-CloseUp, Pomberos 60s Caña-obduktion, Takedas Sake-deal, Långsam Piss + Mierda
//    och Boleadoras Ögon-Plopp) utspelas nu i ÄKTA 3D med de texturerade 3D-modellerna!
// 3. 2D-canvasen ligger nu som ett rent, genomskinligt HUD-lager (z-index: 3) ovanpå 3D-scenen
//    och ritar ENBART röntgen-luppen, undertexter, banners samt Dr. Claude & Prof. Gemini!
//    Därmed syns de texturerade 3D-figurerna hela tiden utan att någonsin skära igenom pratbubblorna!

window.EliteMelee = window.EliteMelee || {};

(function () {
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    Object.assign(window.EliteMelee, {
        webglEnabled: true,
        webglMode: 'full3d', // 'full3d' | 'classic2d'
        webglScene: null,
        webglCam: null,
        webglRenderer: null,
        webglHeroRig: null,
        webglEnemyRig: null,
        webglConqRig: null,
        webglUsurperRig: null,
        webglTakedaRig: null,
        webglPropsRig: null,
        webglWallMesh: null,
        webglFloorMesh: null,
        webglBloodDrops: [],
        webglBoneChunks: [],
        webglSmokePuffs: [],
        webglClothShreds: [],
        webglTorch1: null,
        webglTorch2: null,
        webglGoreLight: null,
        webglUserOrbitX: 0,
        webglUserOrbitY: 0,
        webglIsDragging: false,
        webglDragStartX: 0,
        webglDragStartY: 0,

        toggleWebGLMode: function () {
            if (this.webglMode === 'full3d') {
                this.webglMode = 'classic2d';
                this.webglEnabled = false;
            } else {
                this.webglMode = 'full3d';
                this.webglEnabled = true;
            }

            const glCanvas = document.getElementById('mk-webgl-canvas');
            const btn = document.getElementById('mk-btn-webgl');

            if (glCanvas) {
                glCanvas.style.display = this.webglEnabled ? 'block' : 'none';
            }
            if (btn) {
                if (this.webglMode === 'full3d') {
                    btn.textContent = '💀 3D-Oljemålnings-Modeller: PÅ';
                    btn.style.background = '#b71c1c';
                } else {
                    btn.textContent = '🖼️ 2D Klassisk: PÅ';
                    btn.style.background = '#37474f';
                }
            }
        },

        // FIX #2: städar bort den gamla WebGL-scenen helt. Förut skapades en ny WebGL-kontext vid varje
        // hjältebyte utan att den gamla stängdes, och webbläsaren ger upp efter ungefär 16 stycken.
        disposeWebGLStage: function () {
            if (this.webglScene) {
                this.webglScene.traverse(o => {
                    if (o.geometry && o.geometry.dispose) o.geometry.dispose();
                    const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
                    mats.forEach(m => { if (m && m.dispose) m.dispose(); });
                });
            }
            if (this.webglRenderer) {
                try { this.webglRenderer.dispose(); } catch (e) {}
                try { if (this.webglRenderer.forceContextLoss) this.webglRenderer.forceContextLoss(); } catch (e) {}
            }
            this.webglRenderer = null; this.webglScene = null; this.webglCam = null;
        },

        initWebGLStage: function () {
            if (!window.THREE || !this.canvas) return;
            const wrap = this.canvas.parentElement;
            if (!wrap) return;

            // Redan initierad för just det här gränssnittet? (buildOverlayUI kan anropa oss två gånger)
            if (this.webglRenderer && this.webglRenderer.domElement && this.webglRenderer.domElement.parentElement === wrap) return;
            this.disposeWebGLStage();

            let glCanvas = document.getElementById('mk-webgl-canvas');
            if (glCanvas) glCanvas.remove();

            glCanvas = document.createElement('canvas');
            glCanvas.id = 'mk-webgl-canvas';
            glCanvas.width = 880;
            glCanvas.height = 480;
            // WebGL-canvasen ligger på z-index 1, 2D-HUD-canvasen ligger ovanpå (z-index 2) med genomskinlig bakgrund!
            glCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;z-index:1;cursor:grab;';
            wrap.insertBefore(glCanvas, this.canvas);

            this.canvas.style.position = 'relative';
            this.canvas.style.zIndex = '2';
            this.canvas.style.background = 'transparent';
            this.canvas.style.cursor = 'grab';

            // Mus-rotation (360° Orbit) lyssnar på container-elementet så både 3D och HUD-klick fungerar sömlöst
            wrap.addEventListener('pointerdown', (e) => {
                if (e.target && e.target.tagName === 'BUTTON') return;
                if (this.academicFreezeActive && this.skipAcademicFreeze) {
                    this.skipAcademicFreeze();
                    return;
                }
                this.webglIsDragging = true;
                this.webglDragStartX = e.clientX;
                this.webglDragStartY = e.clientY;
                this.canvas.style.cursor = 'grabbing';
            });
            // FIX #2: fönster-lyssnarna läggs bara till EN gång (förut en ny uppsättning per hjältebyte)
            if (!this._webglWinBound) {
            this._webglWinBound = true;
            window.addEventListener('pointermove', (e) => {
                if (!this.webglIsDragging) return;
                const dx = (e.clientX - this.webglDragStartX) * 0.007;
                const dy = (e.clientY - this.webglDragStartY) * 0.004;
                this.webglUserOrbitX = clamp(this.webglUserOrbitX + dx, -1.6, 1.6);
                this.webglUserOrbitY = clamp(this.webglUserOrbitY + dy, -0.45, 0.75);
                this.webglDragStartX = e.clientX;
                this.webglDragStartY = e.clientY;
            });
            window.addEventListener('pointerup', () => {
                this.webglIsDragging = false;
                if (this.canvas) this.canvas.style.cursor = 'grab';
            });
            }
            wrap.addEventListener('dblclick', (e) => {
                if (e.target && e.target.tagName === 'BUTTON') return;
                this.webglUserOrbitX = 0;
                this.webglUserOrbitY = 0;
            });

            const THREE = window.THREE;
            const tex = this.get3DPaintedTextures(THREE);
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x080403);
            scene.fog = new THREE.FogExp2(0x090403, 0.042);

            const camera = new THREE.PerspectiveCamera(38, 880 / 480, 0.1, 100);
            camera.position.set(0, 0.15, 7.2);

            let renderer = null;
            try {
                renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, powerPreference: 'high-performance' });
                // Skarpare bild på högupplösta skärmar (canvasen ritas internt i 2x och skalas ner)
                renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
                renderer.setSize(880, 480, false);
                renderer.shadowMap.enabled = false; // skuggor var påslagna men inget kastade skugga = bara kostnad
                // Filmisk tonmappning och rätt färgrymd: mjukare högdagrar och djupare skuggor
                if (THREE.ACESFilmicToneMapping !== undefined) { renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25; }
                if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
                else if (THREE.sRGBEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
            } catch (err) {
                console.warn('WebGL fallback till 2D:', err);
                glCanvas.remove();
                this.webglEnabled = false;
                return;
            }

            // 1. 3D-LERGOLV & KATAKOMB-MURVÄGG MED OLJEMÅLNINGS-BUMP
            const floorMat = new THREE.MeshStandardMaterial({
                map: tex.wornLeather,
                bumpMap: tex.impastoBump,
                bumpScale: 0.16,
                roughness: 0.35,
                metalness: 0.15
            });
            const floor = new THREE.Mesh(new THREE.PlaneGeometry(32, 22, 24, 24), floorMat);
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = -2.4; // figurernas fötter står på -2.4 (förut sjönk de igenom golvet)
            scene.add(floor);
            this.webglFloorMesh = floor;

            // 3D-Murvägg i bakgrunden
            const wallCanvas = document.createElement('canvas');
            wallCanvas.width = 512; wallCanvas.height = 256;
            const wctx = wallCanvas.getContext('2d');
            wctx.fillStyle = '#12140e';
            wctx.fillRect(0, 0, 512, 256);
            for (let row = 0; row < 8; row++) {
                const y = row * 32;
                const off = (row % 2) * 32;
                for (let col = -1; col < 9; col++) {
                    wctx.fillStyle = (row + col) % 2 === 0 ? '#1d2118' : '#171a13';
                    wctx.fillRect(col * 64 + off + 2, y + 2, 60, 28);
                }
            }
            const wallTex = new THREE.CanvasTexture(wallCanvas);
            wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
            wallTex.repeat.set(3, 2);

            const wallMat = new THREE.MeshStandardMaterial({
                map: wallTex,
                bumpMap: tex.impastoBump,
                bumpScale: 0.12,
                roughness: 0.72,
                metalness: 0.1
            });
            const backWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 11), wallMat);
            backWall.position.set(0, 1.8, -2.6);
            scene.add(backWall);
            this.webglWallMesh = backWall;

            // 3D-katakombpelare med facklor
            const pillarGeo = new THREE.CylinderGeometry(0.42, 0.50, 8, 12);
            const pillarMat = new THREE.MeshStandardMaterial({
                map: tex.rustedSteel,
                bumpMap: tex.impastoBump,
                bumpScale: 0.14,
                roughness: 0.68
            });
            [-5.2, -2.3, 2.3, 5.2].forEach((px, idx) => {
                const p = new THREE.Mesh(pillarGeo, pillarMat);
                p.position.set(px, 1.2, -2.1 - (idx % 2) * 0.4);
                scene.add(p);
            });

            // 2. SKAPA ALLA SKULPTERADE 3D-KARAKTÄRER
            const hKey = (this.hero && this.hero.key) ? this.hero.key : 'bloom';
            this.webglHeroRig = this.createSculptedHumanoid3D(THREE, hKey, true);
            this.webglHeroRig.position.set(-1.7, -0.35, 0.2);
            this.webglHeroRig.rotation.y = 0.22;
            scene.add(this.webglHeroRig);

            this.webglEnemyRig = this.createSculptedHumanoid3D(THREE, 'soldier', false);
            this.webglEnemyRig.position.set(1.7, -0.35, 0.2);
            this.webglEnemyRig.rotation.y = -0.22;
            scene.add(this.webglEnemyRig);

            this.webglConqRig = this.createUndeadConquistador3D(THREE);
            this.webglConqRig.position.set(1.7, -0.28, 0.25);
            this.webglConqRig.rotation.y = -0.25;
            this.webglConqRig.visible = false;
            scene.add(this.webglConqRig);

            // Separat 3D-Usurper-rigg (för El Pombero eller Conquistadoren när de kliver in bakom soldaten/zombien!)
            this.webglUsurperRig = this.createSculptedHumanoid3D(THREE, 'pombero', false);
            this.webglUsurperRig.visible = false;
            scene.add(this.webglUsurperRig);

            // Sensei Takeda 3D-rigg (för Sake-diplomatin i 3D!)
            this.webglTakedaRig = this.createSculptedHumanoid3D(THREE, 'takeda', true);
            this.webglTakedaRig.visible = false;
            scene.add(this.webglTakedaRig);

            // 3. 3D-TROFÉER, 3D-TARMAR, AVHUGGEN 3D-ARM & SAKE/IDOL
            this.webglPropsRig = this.create3DGorePropsRig(THREE);
            scene.add(this.webglPropsRig);

            // 4. CHIAROSCURO OLJEMÅLNINGS-BELYSNING
            scene.add(new THREE.AmbientLight(0xffdfc2, 0.75));
            if (THREE.HemisphereLight) scene.add(new THREE.HemisphereLight(0xffcf9a, 0x1a1020, 0.55)); // varmt ovanifrån, kallt underifrån
            const rimLight = new THREE.DirectionalLight(0x8fb4ff, 0.6); rimLight.position.set(2, 3, -5); scene.add(rimLight); // kallt kantljus bakifrån

            const torch1 = new THREE.PointLight(0xff8f00, 2.4, 22);
            torch1.position.set(-3.8, 2.4, 3.8);
            scene.add(torch1);

            const torch2 = new THREE.PointLight(0xff6d00, 2.4, 22);
            torch2.position.set(3.8, 2.4, 3.8);
            scene.add(torch2);

            const goreLight = new THREE.SpotLight(0xff1744, 2.8, 20, Math.PI / 3, 0.45);
            goreLight.position.set(0, 3.8, 5.2);
            scene.add(goreLight);

            // 5. 3D-BLODPARTIKLAR, 3D-BENFLISOR, 3D-CIGARETTRÖK & 3D-TYGTRASOR
            const dropGeo = new THREE.SphereGeometry(0.036, 7, 7);
            const dropMat = new THREE.MeshStandardMaterial({ color: 0x9e0008, roughness: 0.12, metalness: 0.25 });
            this.webglBloodDrops = [];
            for (let i = 0; i < 85; i++) {
                const m = new THREE.Mesh(dropGeo, dropMat);
                m.visible = false;
                scene.add(m);
                this.webglBloodDrops.push({ mesh: m, vx: 0, vy: 0, vz: 0, active: false });
            }

            const boneChunkGeo = new THREE.CylinderGeometry(0.032, 0.028, 0.30, 8);
            const boneChunkMat = new THREE.MeshStandardMaterial({ map: tex.agedBone, roughness: 0.45 });
            this.webglBoneChunks = [];
            for (let i = 0; i < 18; i++) {
                const bm = new THREE.Mesh(boneChunkGeo, boneChunkMat);
                bm.visible = false;
                scene.add(bm);
                this.webglBoneChunks.push({ mesh: bm, vx: 0, vy: 0, vz: 0, vrx: 0, vrz: 0, active: false });
            }

            // 3D-rökbollar för El Pomberos cigarett
            const smokeGeo = new THREE.SphereGeometry(0.09, 8, 8);
            const smokeMat = new THREE.MeshBasicMaterial({ color: 0xcfd8dc, transparent: true, opacity: 0.45 });
            this.webglSmokePuffs = [];
            for (let i = 0; i < 18; i++) {
                const sm = new THREE.Mesh(smokeGeo, smokeMat.clone());
                sm.visible = false;
                scene.add(sm);
                this.webglSmokePuffs.push({ mesh: sm, vx: 0, vy: 0, vz: 0, life: 0, active: false });
            }

            // 3D-tygtrasor när Conquistadorens murkna byxor slits sönder i Mierda-scenen
            const shredGeo = new THREE.BoxGeometry(0.22, 0.15, 0.02);
            const shredMat = new THREE.MeshStandardMaterial({ map: tex.wornLeather, roughness: 0.75 });
            this.webglClothShreds = [];
            for (let i = 0; i < 22; i++) {
                const sh = new THREE.Mesh(shredGeo, shredMat);
                sh.visible = false;
                scene.add(sh);
                this.webglClothShreds.push({ mesh: sh, vx: 0, vy: 0, vz: 0, vrx: 0, vrz: 0, active: false });
            }

            this.webglScene = scene;
            this.webglCam = camera;
            this.webglRenderer = renderer;
            this.webglTorch1 = torch1;
            this.webglTorch2 = torch2;
            this.webglGoreLight = goreLight;
        },

        // Tar nu 3D-världskoordinater direkt (samma skala som figurerna: 3.8) och en riktning
        spawnWebGL3DGore: function (wx, wy, count, withBones, dirX) {
            const dir = (dirX === -1) ? -1 : 1;
            if (!this.webglBloodDrops || !this.webglBloodDrops.length) return;
            let spawned = 0;
            for (let i = 0; i < this.webglBloodDrops.length && spawned < count; i++) {
                const d = this.webglBloodDrops[i];
                if (!d.active) {
                    d.active = true;
                    d.mesh.visible = true;
                    const s = 0.65 + Math.random() * 1.15;
                    d.mesh.scale.set(s, s, s * 1.3);
                    d.mesh.position.set(wx, wy, 0.55);
                    d.vx = dir * (0.4 + Math.random() * 3.6) + (Math.random() - 0.5) * 1.5;
                    d.vy = 2.2 + Math.random() * 4.8;
                    d.vz = (Math.random() - 0.3) * 3.2;
                    spawned++;
                }
            }
            if (withBones && this.webglBoneChunks) {
                let bSpawned = 0;
                for (let j = 0; j < this.webglBoneChunks.length && bSpawned < 4; j++) {
                    const b = this.webglBoneChunks[j];
                    if (!b.active) {
                        b.active = true;
                        b.mesh.visible = true;
                        b.mesh.position.set(wx, wy, 0.65);
                        b.vx = dir * (0.5 + Math.random() * 3.2);
                        b.vy = 2.8 + Math.random() * 4.2;
                        b.vz = (Math.random() - 0.3) * 2.8;
                        b.vrx = (Math.random() - 0.5) * 14;
                        b.vrz = (Math.random() - 0.5) * 14;
                        bSpawned++;
                    }
                }
            }
        },

        // Applicerar alla 3D-skador (Ryggrad av, Hjärta ut, Klyvning itu, Buk-tarmar, Boleadoras Ögon-Plopp) på en 3D-humanoid!
        applyHumanoid3DGore: function (rig, f, now) {
            if (!rig || !rig.userData || !f) return;
            const ud = rig.userData;
            const inj = f.injuries || {};

            // 1. Huvud avslitet + blottad 3D-halsstump
            const headGone = Boolean(inj.headSevered);
            if (ud.headGroup) ud.headGroup.visible = !headGone;
            if (ud.neckStumpGroup) ud.neckStumpGroup.visible = headGone || Boolean(inj.neckTorn);

            // 2. Öppen bröstkorg med utstickande 3D-revben & bultande 3D-hjärta
            if (ud.chestWoundGroup) {
                ud.chestWoundGroup.visible = Boolean(inj.ribsBroken || inj.heartRipped);
                if (ud.internalHeart) {
                    ud.internalHeart.visible = !inj.heartRipped;
                    const beat = 1 + Math.pow(Math.max(0, Math.sin(now * 0.009)), 6) * 0.28;
                    ud.internalHeart.scale.set(beat, beat, beat);
                }
            }

            // 3. Öppen buk med utvällda 3D-tarmar
            if (ud.gutWoundGroup) {
                ud.gutWoundGroup.visible = Boolean(inj.disemboweled);
            }

            // 4. Sagittal klyvning ("Partido en dos") – halvorna av 3D-kroppen viker fysiskt isär!
            if (inj.splitInHalf) {
                const splitAng = Math.min(0.42, (f._splitT = (f._splitT || 0.08) + 0.008));
                if (ud.chestL && ud.chestR) {
                    ud.chestL.position.z = -0.18 - splitAng * 0.65;
                    ud.chestL.rotation.x = -splitAng * 0.85;
                    ud.chestR.position.z = 0.18 + splitAng * 0.65;
                    ud.chestR.rotation.x = splitAng * 0.85;
                }
                if (ud.leftHalfGroup && ud.rightHalfGroup) {
                    ud.leftHalfGroup.position.z = -splitAng * 0.45;
                    ud.rightHalfGroup.position.z = splitAng * 0.45;
                }
            } else {
                if (ud.chestL && ud.chestR) {
                    ud.chestL.position.z = -0.14;
                    ud.chestL.rotation.x = 0;
                    ud.chestR.position.z = 0.14;
                    ud.chestR.rotation.x = 0;
                }
                if (ud.leftHalfGroup && ud.rightHalfGroup) {
                    ud.leftHalfGroup.position.z = 0;
                    ud.rightHalfGroup.position.z = 0;
                }
            }

            // 5. Pampas Boleadoras runt halsen + 3D-ögon som ploppar ut på synnerverna!
            const bolActive = (!ud.isHero && f === this.enemy && this.boleadorasAnim && this.boleadorasAnim.active);
            if (ud.boleadorasGroup) {
                ud.boleadorasGroup.visible = Boolean(bolActive && this.boleadorasAnim.wraps > 0);
            }
            if (ud.poppedEyesGroup) {
                ud.poppedEyesGroup.visible = Boolean(bolActive && this.boleadorasAnim.eyePop > 0);
            }
        },

        // Animerar en skulpterad 3D-humanoid (Hjälte, Soldat, Gaucho, Pombero, Takeda)
        animateHumanoidRig: function (rig, f, isHero, now) {
            if (!rig || !rig.userData || !f) return;
            const ud = rig.userData;
            const dir = isHero ? 1 : -1;
            const breath = Math.sin(now * 0.005 + (isHero ? 0 : 1.7)) * 0.035;

            this.applyHumanoid3DGore(rig, f, now);

            const isKneeling = (
                (!isHero && f === this.enemy && (this.phase === 'dizzy' || this.phase === 'fatality_anim' || (this.phase === 'over' && this.enemy.hp <= 0))) ||
                (isHero && (this.phase === 'enemy_fatality_anim' || (this.phase === 'over' && this.hero.hp <= 0)))
            );

            const wx = ((f.x - 440) / 440) * 3.8;
            rig.position.x += (wx - rig.position.x) * 0.28;
            rig.position.y = (isKneeling ? -0.92 : -0.35) + breath;
            rig.position.z = isHero ? 0.25 : 0.20;
            rig.rotation.x = 0;
            rig.rotation.z = 0;
            rig.rotation.y = isHero ? 0.24 : -0.24;

            if (ud.torsoGroup) {
                // Nollställ ledvinklar som bara vissa poser sätter, annars fastnar de
                if (ud.legs && ud.legs[1] && f.pose !== 'kick') ud.legs[1].rotation.z = 0;
                ud.backArmGroup.rotation.z = 0;
                if (f.pose === 'block') {
                    // Garden uppe: båda underarmarna framför ansiktet
                    ud.torsoGroup.rotation.z = dir * 0.04;
                    ud.frontArmGroup.rotation.z = dir * 1.45;
                    ud.backArmGroup.rotation.z = dir * 1.2;
                } else if (f.pose === 'windup') {
                    // Laddar slaget – lutar sig bakåt och drar tillbaka armen (synlig varning till spelaren)
                    ud.torsoGroup.rotation.z = dir * 0.22;
                    ud.frontArmGroup.rotation.z = -dir * 0.7;
                    ud.backArmGroup.rotation.z = -dir * 0.3;
                } else if (f.pose === 'punch' || f.pose === 'grapple' || f.pose === 'fatality') {
                    ud.torsoGroup.rotation.z = -dir * 0.18;
                    ud.frontArmGroup.rotation.z = dir * (0.85 + Math.sin(now * 0.04) * 0.25);
                    ud.backArmGroup.rotation.z = dir * 0.45;
                } else if (f.pose === 'kick') {
                    ud.torsoGroup.rotation.z = dir * 0.14;
                    if (ud.legs && ud.legs[1]) ud.legs[1].rotation.z = dir * 1.15;
                } else if (f.pose === 'hurt') {
                    ud.torsoGroup.rotation.z = dir * 0.16;
                    ud.frontArmGroup.rotation.z = -dir * 0.25;
                } else {
                    ud.torsoGroup.rotation.z = Math.sin(now * 0.004) * 0.03;
                    ud.frontArmGroup.rotation.z = Math.sin(now * 0.005) * 0.06;
                    ud.backArmGroup.rotation.z = Math.cos(now * 0.005) * 0.05;
                    if (ud.legs && ud.legs[1]) ud.legs[1].rotation.z = 0;
                }
            }
        },

        updateAndRenderWebGL: function (rawDt, now) {
            if (!this.webglEnabled) return;
            if (!this.webglRenderer && window.THREE && this.canvas) {
                this.initWebGLStage();
            }
            if (!this.webglRenderer || !this.webglScene || !this.webglCam) return;

            const THREE = window.THREE;
            const props = this.webglPropsRig ? this.webglPropsRig.userData : {};

            // Nollställ 3D-rekvisita inför framen (aktiveras av respektive scen nedan)
            if (props.spineTrophy) props.spineTrophy.visible = false;
            if (props.heartTrophy) props.heartTrophy.visible = false;
            if (props.visceraRopeGroup) props.visceraRopeGroup.visible = false;
            if (props.sakeBottle3D) props.sakeBottle3D.visible = false;
            if (props.idol3D) props.idol3D.visible = false;
            if (this.webglTakedaRig) this.webglTakedaRig.visible = false;
            if (this.webglUsurperRig) this.webglUsurperRig.visible = false;

            // Synka rätt 3D-hjälte-modell om man bytt mellan Bloom & Gómez
            const desiredHeroKey = (this.hero && this.hero.key) ? this.hero.key : 'bloom';
            if (this.webglHeroRig && this.webglHeroRig.userData.roleKey !== desiredHeroKey) {
                this.webglScene.remove(this.webglHeroRig);
                this.webglHeroRig = this.createSculptedHumanoid3D(THREE, desiredHeroKey, true);
                this.webglScene.add(this.webglHeroRig);
            }

            // Synka rätt 3D-fiende-modell (Soldat, Gaucho, Pombero eller Conquistador)
            const en = this.enemy;
            const isEnemyConq = Boolean(en && en.type === 'skeleton');
            const desiredEnemyKey = (en && en.type === 'pombero') ? 'pombero' : ((en && en.type === 'lobizon') ? 'lobizon' : ((en && en.subType === 'gaucho') ? 'gaucho' : 'soldier'));
            if (this.webglEnemyRig && !isEnemyConq && this.webglEnemyRig.userData.roleKey !== desiredEnemyKey) {
                this.webglScene.remove(this.webglEnemyRig);
                this.webglEnemyRig = this.createSculptedHumanoid3D(THREE, desiredEnemyKey, false);
                this.webglScene.add(this.webglEnemyRig);
            }

            // Standard kameramål (kan överskrivas av närbilds- och slaktscenerna nedan!)
            let camTargetX = 0, camTargetY = 0.12, camTargetZ = 7.0;
            let lookX = 0, lookY = 0.05, lookZ = 0;

            // =========================================================================
            // SCEN A: EL POMBEROS 60-SEKUNDERS CAÑA-OBDUKTION I FULL 3D!
            // =========================================================================
            if (this.phase === 'takeover_anim' && this.usurper && this.usurper.stage === 'pombero_cana_autopsy') {
                const t = this.pomberoSearchTimer || 0;
                this.webglHeroRig.visible = Boolean(this.pomberoHeroReact);
                if (this.webglHeroRig.visible) {
                    // Hjälten står i bakgrunden/sidan och höjer på ena 3D-ögonbrynet (Sundar Pichai Brow)!
                    this.webglHeroRig.position.set(-2.3, -0.35, -0.3);
                    this.webglHeroRig.rotation.y = 0.45;
                    const brows = this.webglHeroRig.userData.browMeshes;
                    if (brows && brows[1]) brows[1].position.y = 0.15 + Math.sin(now * 0.015) * 0.02;
                }
                this.webglEnemyRig.visible = false;

                // 3D-Conquistadoren ligger ryckande på rygg på 3D-lergolvet!
                this.webglConqRig.visible = true;
                const twitch = (Math.sin(now * 0.045) > 0.7) ? (Math.random() - 0.5) * 0.06 : 0;
                this.webglConqRig.position.set(0.2 + twitch, -1.55, 0.45);
                this.webglConqRig.rotation.set(0, 0, Math.PI / 2);

                const cRig = this.webglConqRig.userData;
                // Skallen bänds upp vid t >= 2.0s!
                if (cRig.helmetGroup) {
                    if (this.pomberoSkullOpen) {
                        cRig.helmetGroup.position.set(-0.65, -0.35, 0.3);
                        cRig.helmetGroup.rotation.z = 1.2;
                    } else {
                        cRig.helmetGroup.position.set(0, 0.14, 0);
                        cRig.helmetGroup.rotation.z = 0;
                    }
                }
                // De 5 3D-revbenen bryts upp ett efter ett i 3D!
                if (cRig.ribMeshes) {
                    const brokenCount = this.pomberoRibs || 0;
                    cRig.ribMeshes.forEach((rm, idx) => {
                        if (idx < brokenCount) {
                            rm.rotation.z = -0.15;
                            rm.position.z = 0.22;
                        } else {
                            rm.rotation.z = -Math.PI * 0.78;
                            rm.position.z = -0.04;
                        }
                    });
                }

                // 3D-El Pombero sitter hukad över liket med glödande cigarett och rotar i bröstkorgen!
                if (this.webglUsurperRig.userData.roleKey !== 'pombero') {
                    this.webglScene.remove(this.webglUsurperRig);
                    this.webglUsurperRig = this.createSculptedHumanoid3D(THREE, 'pombero', false);
                    this.webglScene.add(this.webglUsurperRig);
                }
                this.webglUsurperRig.visible = true;
                const digX = (this.pomberoRibs || 0) < 1 ? -0.35 : 0.15;
                const digBob = Math.sin(now * 0.022) * (t < (this.pomberoPauseUntil || 0) ? 0.02 : 0.09);
                this.webglUsurperRig.position.set(digX, -0.75 + digBob, 0.15);
                this.webglUsurperRig.rotation.set(0.28, 0.15, 0);
                this.webglUsurperRig.userData.frontArmGroup.rotation.z = -1.15 + Math.sin(now * 0.035) * 0.25;
                this.webglUsurperRig.userData.backArmGroup.rotation.z = -0.95 + Math.cos(now * 0.035) * 0.25;

                // Spawna 3D-cigarettrök från Pomberos cigarett
                if (Math.random() < 0.28 && this.webglSmokePuffs) {
                    const sp = this.webglSmokePuffs.find(s => !s.active);
                    if (sp) {
                        sp.active = true;
                        sp.life = 1.0;
                        sp.mesh.visible = true;
                        sp.mesh.position.set(digX - 0.15, 0.15, 0.45);
                        sp.vx = (Math.random() - 0.4) * 0.4;
                        sp.vy = 0.55 + Math.random() * 0.35;
                        sp.vz = (Math.random() - 0.5) * 0.3;
                    }
                }

                camTargetX = 0.0; camTargetY = -0.25; camTargetZ = 4.65;
                lookX = 0.05; lookY = -0.85; lookZ = 0.3;
            }
            // =========================================================================
            // SCEN B: ZOMBIE SKRÄCK-CLOSEUP I FULL 3D (Knapp 1)
            // =========================================================================
            else if (this.phase === 'takeover_anim' && this.usurper && this.usurper.stage === 'horror_closeup') {
                const p = this.horrorCloseUpProgress || 0;
                this.webglHeroRig.visible = false;

                // Den darrande 3D-soldaten i förgrunden
                this.webglEnemyRig.visible = true;
                const tremble = (Math.random() - 0.5) * 0.035 * (1 + p);
                this.webglEnemyRig.position.set(-0.35 + tremble, -0.45, 1.35);
                this.webglEnemyRig.rotation.set(0, 0.12, 0);

                // Den 3D-skulpterade Conquistadoren reser sig långsamt ur mörkret precis bakom soldatens axel!
                this.webglConqRig.visible = true;
                this.webglConqRig.position.set(0.55 - p * 0.32, -1.25 + p * 0.92, 0.65 + p * 0.35);
                this.webglConqRig.rotation.set(0, -0.25, 0);

                camTargetX = 0.0; camTargetY = 0.42; camTargetZ = 3.55;
                lookX = 0.02; lookY = 0.38; lookZ = 1.0;
            }
            // =========================================================================
            // SCEN C: LÅNGSAMMA BRUTALA SLAKT-SEKVENSER I FULL 3D (Ryggrad, Hjärta, Klyvning, Tarmar, Boleadoras)
            // =========================================================================
            else if (this.phase === 'takeover_anim' && this.usurper && (this.usurper.stage === 'slaughter' || this.usurper.stage === 'throw_corpse')) {
                const u = this.usurper;
                this.webglHeroRig.visible = true;
                this.animateHumanoidRig(this.webglHeroRig, this.hero, true, now);
                this.webglHeroRig.position.x = -2.35;

                // 3D-offret (Soldaten / Gauchon) som slaktas i slow-motion!
                this.webglEnemyRig.visible = true;
                this.animateHumanoidRig(this.webglEnemyRig, this.enemy, false, now);
                this.webglEnemyRig.position.set(0.35, -0.38, 0.35);

                // 3D-Conquistadoren står precis bakom offret och utför slakten i 3D!
                this.webglConqRig.visible = true;
                this.webglConqRig.position.set(1.05, -0.28, 0.42);
                this.webglConqRig.rotation.set(0, -0.35, 0);
                const cRig = this.webglConqRig.userData;
                cRig.rightArmGroup.rotation.z = -0.85 + Math.sin(now * 0.02) * 0.12;
                cRig.leftArmGroup.rotation.z = -0.65;

                // Visa 3D-trofén som dras ut ur 3D-offret!
                if (u.trophyType === 'head_spine' && props.spineTrophy) {
                    props.spineTrophy.visible = true;
                    const prog = u.spineProg != null ? u.spineProg : 1;
                    props.spineTrophy.position.set(0.42, 0.65 + prog * 0.55, 0.58);
                    props.spineTrophy.rotation.z = Math.sin(now * 0.006) * 0.12;
                    const visCount = Math.max(2, Math.round(prog * props.vertebrae.length));
                    props.vertebrae.forEach((v, idx) => { v.visible = idx < visCount; });
                } else if (u.trophyType === 'beating_heart' && props.heartTrophy) {
                    props.heartTrophy.visible = true;
                    props.heartTrophy.position.set(0.45, 0.38, 0.62);
                    const beat = 1 + Math.pow(Math.max(0, Math.sin(now * 0.012)), 4) * 0.32;
                    props.hMesh.scale.set(0.95 * beat, 1.22 * beat, 0.88 * beat);
                } else if (u.trophyType === 'viscera_whip' && props.visceraRopeGroup) {
                    props.visceraRopeGroup.visible = true;
                    const pp = u.pullProg != null ? u.pullProg : 0.8;
                    const sx = 0.35, sy = -0.15, ex = 0.35 + pp * 0.65, ey = 0.25;
                    props.gutSegments.forEach((seg, idx) => {
                        const frac = idx / (props.gutSegments.length - 1);
                        const sag = Math.sin(frac * Math.PI) * 0.32;
                        seg.position.set(
                            sx + (ex - sx) * frac,
                            sy + (ey - sy) * frac - sag,
                            0.58 + Math.sin(now * 0.008 + idx) * 0.03
                        );
                    });
                }

                camTargetX = 0.45; camTargetY = 0.18; camTargetZ = 4.55;
                lookX = 0.52; lookY = 0.12; lookZ = 0.35;
            }
            // =========================================================================
            // SCEN D: LÅNGSAM DETALJERAD 3D-AMPUTATION (Knapp 5)
            // =========================================================================
            else if (this.phase === 'amputation_anim' && this.amp) {
                const a = this.amp;
                const t = a.t;
                this.webglHeroRig.visible = true;
                this.webglEnemyRig.visible = false;
                this.webglConqRig.visible = true;

                this.webglHeroRig.position.set(-0.35, -0.35, 0.38);
                this.webglHeroRig.rotation.y = 0.28;

                this.webglConqRig.position.set(0.85, -0.28, 0.38);
                this.webglConqRig.rotation.y = -0.28;

                const hUd = this.webglHeroRig.userData;
                const cUd = this.webglConqRig.userData;

                // Hjältens 3D-sabel sågar och hugger mot Conquistadorens högra överarm!
                const chopMotion = Math.sin(now * 0.035) * 0.35;
                hUd.frontArmGroup.rotation.z = 0.95 + chopMotion;

                const severed = Boolean(this.enemy && this.enemy.injuries && this.enemy.injuries.armSevered);
                cUd.intactRightArm.visible = !severed;
                cUd.stumpGroup.visible = (t > 1.2) || severed;

                if (t >= 6.3 && t < 9.5) {
                    // Conquistadoren tittar ner på sin blodiga 3D-armstump ("...mi brazo")!
                    cUd.headGroup.rotation.z = 0.38;
                } else {
                    cUd.headGroup.rotation.z = 0;
                }

                camTargetX = 0.32; camTargetY = 0.25; camTargetZ = 4.15;
                lookX = 0.45; lookY = 0.18; lookZ = 0.38;
            }
            // =========================================================================
            // SCEN E: LÅNGSAM PISS-STANCE + 3D-BÄCKENBENS-"MIERDA" (Knapp 4)
            // =========================================================================
            else if (this.phase === 'enemy_fatality_anim') {
                const st = this.enemyFatalityStage;
                const t = this.enemyFatalityTimer || 0;
                this.webglEnemyRig.visible = false;
                this.webglConqRig.visible = true;
                const cUd = this.webglConqRig.userData;

                if (st === 'gut_rip') {
                    this.webglHeroRig.visible = true;
                    this.animateHumanoidRig(this.webglHeroRig, this.hero, true, now);
                    this.webglHeroRig.position.set(-0.45, -0.88, 0.3);

                    this.webglConqRig.position.set(0.45, -0.28, 0.35);
                    this.webglConqRig.rotation.y = -0.25;

                    if (props.visceraRopeGroup) {
                        props.visceraRopeGroup.visible = true;
                        props.gutSegments.forEach((seg, idx) => {
                            const frac = idx / (props.gutSegments.length - 1);
                            seg.position.set(-0.25 + frac * 0.65, -0.55 + frac * 0.55 - Math.sin(frac * Math.PI) * 0.25, 0.52);
                        });
                    }
                    camTargetX = 0.0; camTargetY = -0.15; camTargetZ = 4.8;
                    lookX = 0.0; lookY = -0.35; lookZ = 0.3;
                } else if (st === 'piss_side_stance') {
                    this.webglHeroRig.visible = true;
                    this.webglHeroRig.position.set(-0.55, -0.95, 0.25);

                    // Conquistadoren lutar sig bakåt i profil och försöker kissa
                    this.webglConqRig.position.set(0.35, -0.28, 0.35);
                    this.webglConqRig.rotation.set(0, -0.22, -0.18);
                    cUd.headGroup.rotation.z = (t > 2.0) ? 0.42 : 0;
                    cUd.rightArmGroup.rotation.z = -0.45 + Math.sin(now * 0.03) * 0.08;

                    camTargetX = 0.05; camTargetY = -0.1; camTargetZ = 4.6;
                    lookX = 0.15; lookY = -0.25; lookZ = 0.3;
                } else if (st === 'piss_front_closeup') {
                    // KAMERAN SVÄNGER RUNT FRAMIFRÅN I 3D!
                    this.webglHeroRig.visible = false;
                    this.webglConqRig.position.set(0, -0.15, 0.85);
                    this.webglConqRig.rotation.set(0, Math.PI * 0.5, 0); // Vänd rakt mot kameran!

                    // Vid t >= 1.15s slits de murkna 1500-talsbyxorna i bitar i 3D och blottar det tomma 3D-bäckenbenet!
                    const ripped = Boolean(this.clothRippedSoundPlayed);
                    if (cUd.rottenTrousersMesh) {
                        cUd.rottenTrousersMesh.visible = !ripped;
                    }
                    if (ripped && t < 1.35 && this.webglClothShreds) {
                        this.webglClothShreds.forEach((sh, idx) => {
                            if (!sh.active) {
                                sh.active = true;
                                sh.mesh.visible = true;
                                sh.mesh.position.set((Math.random() - 0.5) * 0.5, -0.55 + (Math.random() - 0.5) * 0.3, 1.15);
                                sh.vx = (Math.random() - 0.5) * 2.8;
                                sh.vy = 0.8 + Math.random() * 2.2;
                                sh.vz = 0.5 + Math.random() * 1.8;
                                sh.vrx = (Math.random() - 0.5) * 10;
                                sh.vrz = (Math.random() - 0.5) * 10;
                            }
                        });
                    }
                    // Han tittar ner i sitt tomma 3D-bäckenben och slår ut med armarna ("...Mierda.")!
                    cUd.headGroup.rotation.z = Math.min(0.55, Math.max(0, (t - 1.3) * 0.35));
                    const shrug = Math.min(1, Math.max(0, (t - 3.0) * 1.1));
                    cUd.rightArmGroup.rotation.x = shrug * 0.65;
                    cUd.leftArmGroup.rotation.x = -shrug * 0.65;

                    camTargetX = 0.0; camTargetY = -0.32; camTargetZ = 3.85;
                    lookX = 0.0; lookY = -0.38; lookZ = 0.85;
                }
            }
            // =========================================================================
            // SCEN F: SENSEI TAKEDAS SAKE-DIPLOMATI MED EL POMBERO I FULL 3D (Knapp 3)
            // =========================================================================
            else if (this.phase === 'sake_diplomacy_anim') {
                const t = this.sakeDiplomacyTimer || 0;
                this.webglHeroRig.visible = false;
                this.webglConqRig.visible = false;

                // Sensei Takeda till vänster i 3D
                this.webglTakedaRig.visible = true;
                this.webglTakedaRig.position.set(-1.35, -0.35, 0.35);
                this.webglTakedaRig.rotation.y = 0.28;

                // El Pombero till höger i 3D
                if (this.webglEnemyRig.userData.roleKey !== 'pombero') {
                    this.webglScene.remove(this.webglEnemyRig);
                    this.webglEnemyRig = this.createSculptedHumanoid3D(THREE, 'pombero', false);
                    this.webglScene.add(this.webglEnemyRig);
                }
                this.webglEnemyRig.visible = true;
                this.webglEnemyRig.position.set(1.35, -0.35, 0.35);
                this.webglEnemyRig.rotation.y = -0.28;

                // 3D-Sakeflaskan och 3D-Guldidolen byter plats i luften mellan dem!
                const swap = clamp((t - 2.2) / 3.5, 0, 1);
                if (props.sakeBottle3D && props.idol3D) {
                    props.sakeBottle3D.visible = true;
                    props.idol3D.visible = true;
                    props.sakeBottle3D.position.set(-0.65 + swap * 1.3, 0.15 + Math.sin(now * 0.008) * 0.05, 0.55);
                    props.sakeBottle3D.rotation.z = (t >= 3.2 && t < 6.0) ? 0.55 : 0;
                    props.idol3D.position.set(0.65 - swap * 1.3, 0.15 + Math.cos(now * 0.008) * 0.05, 0.55);
                    props.idol3D.rotation.y = now * 0.003;
                }

                camTargetX = 0.0; camTargetY = 0.08; camTargetZ = 5.6;
                lookX = 0.0; lookY = 0.05; lookZ = 0.35;
            }
            // =========================================================================
            // SCEN G: VANLIG 3D-STRID (Alltid med skulpterade, texturerade 3D-modeller!)
            // =========================================================================
            else {
                this.webglHeroRig.visible = true;
                this.animateHumanoidRig(this.webglHeroRig, this.hero, true, now);

                if (isEnemyConq) {
                    this.webglEnemyRig.visible = false;
                    this.webglConqRig.visible = true;
                    const ex = ((en.x - 440) / 440) * 3.8;
                    this.webglConqRig.position.x += (ex - this.webglConqRig.position.x) * 0.25;
                    const conqDown = (this.phase === 'dizzy' || (this.phase === 'over' && en.hp <= 0));
                    this.webglConqRig.position.y = (conqDown ? -0.85 : -0.28) + Math.sin(now * 0.005 + 1.2) * 0.04;
                    this.webglConqRig.position.z = 0.25;
                    this.webglConqRig.rotation.set(0, -0.24, 0);

                    const cUd = this.webglConqRig.userData;
                    const inj = en.injuries || {};
                    if (cUd.rottenTrousersMesh) cUd.rottenTrousersMesh.visible = true;
                    if (cUd.helmetGroup) {
                        cUd.helmetGroup.position.set(0, 0.14, 0);
                        cUd.helmetGroup.rotation.z = 0;
                    }
                    if (cUd.heartMesh) {
                        const beat = 1 + Math.pow(Math.max(0, Math.sin(now * 0.008)), 6) * 0.30;
                        cUd.heartMesh.scale.set(beat, beat, beat);
                        cUd.heartMesh.visible = !inj.heartRipped;
                    }
                    if (cUd.intactRightArm && cUd.stumpGroup) {
                        const sev = Boolean(inj.armSevered);
                        cUd.intactRightArm.visible = !sev;
                        cUd.stumpGroup.visible = sev;
                    }
                    if (this.animateConquistadorRig && cUd.jointedConq) {
                        this.animateConquistadorRig(this.webglConqRig, en, now); // naturliga rörelser (animationsmodulen)
                    } else if (en.pose === 'hurt') {
                        this.webglConqRig.rotation.z = 0.14;
                    } else if (en.pose === 'windup') {
                        this.webglConqRig.rotation.z = -0.1;
                        cUd.rightArmGroup.rotation.z = 0.55;
                        cUd.leftArmGroup.rotation.z = 0.7; // svärdet lyfts bakåt
                    } else if (en.pose === 'block') {
                        cUd.rightArmGroup.rotation.z = -1.1;
                        cUd.leftArmGroup.rotation.z = -1.35;
                    } else if (en.pose === 'punch' || en.pose === 'kick' || en.pose === 'fatality') {
                        cUd.rightArmGroup.rotation.z = -0.65;
                        cUd.leftArmGroup.rotation.z = -0.85;
                    } else {
                        cUd.rightArmGroup.rotation.z = Math.sin(now * 0.004) * 0.06;
                        cUd.leftArmGroup.rotation.z = Math.cos(now * 0.004) * 0.06;
                    }
                } else {
                    this.webglConqRig.visible = false;
                    this.webglEnemyRig.visible = Boolean(en);
                    if (en) this.animateHumanoidRig(this.webglEnemyRig, en, false, now);
                }
            }

            // Visa avhuggen 3D-arm på marken om någon fått armen amputerad
            if (props.severedArm3D) {
                if (this.severedLimbs && this.severedLimbs.length > 0) {
                    const sl = this.severedLimbs[0];
                    props.severedArm3D.visible = true;
                    props.severedArm3D.position.set(((sl.x - 440) / 440) * 3.8, -2.39 + (432 - sl.y) * 0.0105 + 0.12, 0.55);
                    props.severedArm3D.rotation.z = sl.rot || 0;
                } else {
                    props.severedArm3D.visible = false;
                }
            }

            // Uppdatera 3D-facklor
            if (this.webglTorch1 && this.webglTorch2) {
                this.webglTorch1.intensity = 2.4 + Math.sin(now * 0.018) * 0.4;
                this.webglTorch2.intensity = 2.4 + Math.cos(now * 0.021) * 0.4;
            }

            // Uppdatera 3D-blodpartiklar, benflisor, cigarettrök & tygtrasor (frys-pausas under akademisk analys!)
            if (!this.academicFreezeActive) {
                this.webglBloodDrops.forEach(d => {
                    if (!d.active) return;
                    d.mesh.position.x += d.vx * rawDt;
                    d.mesh.position.y += d.vy * rawDt;
                    d.mesh.position.z += d.vz * rawDt;
                    d.vy -= 14.5 * rawDt;
                    if (d.mesh.position.y <= -2.36) {
                        d.mesh.position.y = -2.36;
                        d.vx *= 0.28;
                        d.vz *= 0.28;
                        if (Math.abs(d.vy) < 0.8) {
                            d.active = false;
                            d.mesh.visible = false;
                        } else {
                            d.vy *= -0.25;
                        }
                    }
                });
                this.webglBoneChunks.forEach(b => {
                    if (!b.active) return;
                    b.mesh.position.x += b.vx * rawDt;
                    b.mesh.position.y += b.vy * rawDt;
                    b.mesh.position.z += b.vz * rawDt;
                    b.mesh.rotation.x += b.vrx * rawDt;
                    b.mesh.rotation.z += b.vrz * rawDt;
                    b.vy -= 15.0 * rawDt;
                    if (b.mesh.position.y <= -2.34) {
                        b.mesh.position.y = -2.34;
                        b.vx *= 0.35;
                        b.vz *= 0.35;
                        if (Math.abs(b.vy) < 1.0) {
                            b.active = false;
                            b.mesh.visible = false;
                        } else {
                            b.vy *= -0.3;
                        }
                    }
                });
                this.webglSmokePuffs.forEach(sp => {
                    if (!sp.active) return;
                    sp.mesh.position.x += sp.vx * rawDt;
                    sp.mesh.position.y += sp.vy * rawDt;
                    sp.mesh.position.z += sp.vz * rawDt;
                    sp.life -= rawDt * 0.45;
                    const s = 1 + (1 - sp.life) * 2.2;
                    sp.mesh.scale.set(s, s, s);
                    sp.mesh.material.opacity = Math.max(0, sp.life * 0.45);
                    if (sp.life <= 0) {
                        sp.active = false;
                        sp.mesh.visible = false;
                    }
                });
                this.webglClothShreds.forEach(sh => {
                    if (!sh.active) return;
                    sh.mesh.position.x += sh.vx * rawDt;
                    sh.mesh.position.y += sh.vy * rawDt;
                    sh.mesh.position.z += sh.vz * rawDt;
                    sh.mesh.rotation.x += sh.vrx * rawDt;
                    sh.mesh.rotation.z += sh.vrz * rawDt;
                    sh.vy -= 9.5 * rawDt;
                    if (sh.mesh.position.y <= -2.34) {
                        sh.active = false;
                        sh.mesh.visible = false;
                    }
                });
            }

            // 3D-KAMERAREGI: Under akademisk frysning sveper kameran mjukt i Bullet-Time runt den frysta 3D-scenen!
            const cam = this.webglCam;
            if (this.academicFreezeActive) {
                const orbit = Math.sin(now * 0.0018) * 0.95 + this.webglUserOrbitX;
                const lift = Math.cos(now * 0.0014) * 0.22 + this.webglUserOrbitY;
                cam.position.x += ((camTargetX + orbit) - cam.position.x) * 0.08;
                cam.position.y += ((camTargetY + lift) - cam.position.y) * 0.08;
                cam.position.z += ((camTargetZ - 0.35) - cam.position.z) * 0.08;
                cam.lookAt(lookX, lookY, lookZ);
            } else {
                const shakeX = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake * 0.008 : 0;
                const shakeY = this.camShake > 0 ? (Math.random() - 0.5) * this.camShake * 0.008 : 0;
                cam.position.x += ((camTargetX + this.webglUserOrbitX + shakeX) - cam.position.x) * 0.14;
                cam.position.y += ((camTargetY + this.webglUserOrbitY + shakeY) - cam.position.y) * 0.14;
                cam.position.z += (camTargetZ - cam.position.z) * 0.12;
                cam.lookAt(lookX, lookY, lookZ);
            }

            this.webglRenderer.render(this.webglScene, cam);
        },

        // Ritar ENBART det transparenta HUD-lagret (Röntgen-luppen, undertexter, banners & PiP) när 3D är på!
        render3DHUDOverlay: function (now) {
            if (!this.ctx || !this.canvas) return;
            const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
            ctx.clearRect(0, 0, w, h);

            // 1. Om El Pomberos Caña-obduktion körs i 3D: Rita Guaraní-undertextrutan + PiP-rutan i HUD-lagret!
            if (this.phase === 'takeover_anim' && this.usurper && this.usurper.stage === 'pombero_cana_autopsy') {
                ctx.save();
                ctx.fillStyle = 'rgba(8, 5, 4, 0.90)';
                ctx.strokeStyle = '#8d6e32';
                ctx.lineWidth = 2.5;
                ctx.fillRect(w * 0.08, h - 108, w * 0.84, 88);
                ctx.strokeRect(w * 0.08, h - 108, w * 0.84, 88);
                ctx.textAlign = 'center';
                const L = this.pomberoLinesData[Math.min(this.pomberoLine || 0, this.pomberoLinesData.length - 1)];
                ctx.font = 'bold 18px Georgia'; ctx.fillStyle = '#a5d6a7';
                ctx.fillText('🗣️ [GUARANÍ]: ' + L.g, w * 0.5, h - 78);
                ctx.font = 'italic 16px Georgia'; ctx.fillStyle = '#ffffff';
                ctx.fillText('🇪🇸 [SUBTÍTULOS]: ' + L.e, w * 0.5, h - 48);
                ctx.font = '13px monospace'; ctx.fillStyle = '#ffcc80';
                ctx.fillText('(SVENSKA: ' + L.s + ')', w * 0.5, h - 24);
                ctx.restore();

                if (this.pomberoHeroReact && this.drawHeroReactionPiP) {
                    this.drawHeroReactionPiP(ctx, w, h, now);
                }
            }

            // 2. Om Sensei Takedas Sake-deal körs i 3D: Rita den japanska/guaraní-undertextrutan i HUD-lagret!
            if (this.phase === 'sake_diplomacy_anim') {
                const t = this.sakeDiplomacyTimer || 0;
                ctx.save();
                ctx.fillStyle = 'rgba(8, 10, 14, 0.92)';
                ctx.strokeStyle = '#ffd54f';
                ctx.lineWidth = 2.5;
                ctx.fillRect(w * 0.08, h - 108, w * 0.84, 88);
                ctx.strokeRect(w * 0.08, h - 108, w * 0.84, 88);
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
                ctx.restore();
            }

            // 3. Om Mierda-scenen är framme vid repliken: Rita "...Mierda."-pratbubblan i HUD-lagret!
            if (this.phase === 'enemy_fatality_anim' && this.enemyFatalityStage === 'piss_front_closeup' && this.enemyFatalityTimer >= 4.5) {
                ctx.save();
                ctx.fillStyle = 'rgba(18, 12, 10, 0.92)';
                ctx.strokeStyle = '#b5a078';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(w * 0.68, h * 0.25, 128, 46, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.font = 'bold italic 34px Georgia';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ff8a80';
                ctx.fillText('"...Mierda."', w * 0.68, h * 0.25 + 11);
                ctx.restore();
            }

            // 4. Röntgen-luppen (placerad uppe i högra kvadranten i 3D-läget så att 3D-kropparna syns helt fritt i mitten!)
            if (this.xrayTimer > 0 && this.drawXRayOverlay) {
                this.drawXRayOverlay(ctx, w * 0.76, h * 0.34, this.xrayTargetPart);
            }

            // 5. Cinema-banners i överkant
            if (this.cinemaBanner) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 8;
                ctx.font = 'bold 28px Georgia';
                ctx.fillStyle = '#ff1744';
                ctx.fillText(this.cinemaBanner, w / 2, 54);
                if (this.cinemaSubBanner) {
                    ctx.font = 'italic 16px Georgia';
                    ctx.fillStyle = '#ffd54f';
                    ctx.fillText(this.cinemaSubBanner, w / 2, 80);
                }
                ctx.restore();
            }
        }
    });

    // Koppla in 3D-blodstänk & 3D-benflisor när gore spawnas
    const origSpawnGore = window.EliteMelee.spawnGore;
    window.EliteMelee.spawnGore = function (x, y, count, withBones, dirX) {
        if (origSpawnGore) origSpawnGore.apply(this, arguments);
        if (this.webglEnabled && this.spawnWebGL3DGore) {
            // FIX: blodet hamnar nu där figurerna står (samma x-skala 3.8, y-mappning mot golv och huvudhöjd)
            const wx = (((x == null ? 440 : x) - 440) / 440) * 3.8;
            const wy = -2.39 + (432 - (y == null ? 240 : y)) * 0.0105;
            this.spawnWebGL3DGore(wx, wy, Math.min(24, Math.ceil((count || 10) * 0.45)), withBones, dirX);
        }
    };

    // Lägg till 3D-knappar i Desktop-UI:t
    const origBuildUI = window.EliteMelee.buildOverlayUI;
    window.EliteMelee.buildOverlayUI = function () {
        if (origBuildUI) origBuildUI.apply(this, arguments);
        const btnBar = document.querySelector('#melee-ui canvas')?.parentElement?.querySelector('div');
        if (btnBar && !document.getElementById('mk-btn-webgl')) {
            const btn = document.createElement('button');
            btn.id = 'mk-btn-webgl';
            btn.style.cssText = 'padding:3px 8px;font-size:0.72rem;background:#b71c1c;color:#ffd54f;border:1px solid #ffd54f;cursor:pointer;font-weight:bold;';
            btn.textContent = '💀 3D-Oljemålnings-Modeller: PÅ';
            btn.onclick = () => window.EliteMelee.toggleWebGLMode();
            btnBar.insertBefore(btn, btnBar.firstChild);

            const btnConq = document.createElement('button');
            btnConq.style.cssText = 'padding:3px 8px;font-size:0.72rem;background:#263238;color:#80deea;border:1px solid #80deea;cursor:pointer;font-weight:bold;';
            btnConq.textContent = '⚔️ Spawna 3D-Conquistador';
            btnConq.onclick = () => {
                window.EliteMelee.gauntlet.stage = 'conquistadors';
                window.EliteMelee.enemy = window.EliteMelee.createGauntletEnemy('conquistadors');
                window.EliteMelee.phase = 'fighting';
                window.EliteMelee.updateTopBars();
            };
            btnBar.insertBefore(btnConq, btnBar.firstChild);
        }
        if (window.EliteMelee && window.EliteMelee.initWebGLStage) {
            window.EliteMelee.initWebGLStage();
        }
    };

    // Överskriv renderArena så att när 3D är PÅ ritas hela striden och alla långsamma brutala scener
    // i äkta 3D på WebGL-canvasen, medan 2D-canvasen ovanpå ENBART ritar transparent HUD + Dr. Claude & Prof. Gemini!
    const origRender = window.EliteMelee.renderArena;
    window.EliteMelee.renderArena = function (now, realNow) {
        if (this.renderPaintedCinematic && this.renderPaintedCinematic(now)) return;
        if (this.webglEnabled && this.webglMode === 'full3d' && window.THREE && this.webglRenderer) {
            // FIX #5: frysbild/experter sköts bara av academics-modulen. Verklig bildrutetid används.
            const dt = (this._frameDt || 0.016) * (this.slowMoTimer > 0 ? (this.slowMoFactor || 0.2) : 1) * (this.hitStop > 0 ? 0 : 1);
            this.render3DHUDOverlay(now);
            if (this.updateAndRenderWebGL) this.updateAndRenderWebGL(dt, realNow || now);
            return;
        }
        if (origRender) origRender.apply(this, arguments);
    };
})();
