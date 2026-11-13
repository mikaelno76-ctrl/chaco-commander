// === MODUL: FULLT SKULPTERADE & LEDADE 3D-KARAKTÄRER MED OLJEMÅLNINGS-TEXTURER (elite_melee_3d_models.js) ===
// v4.0 FULL 3D SCULPTED CHARACTERS & GORE RIGS:
// - INGA platta 2D-tavlor längre! Sargento Bloom, Capitana María Gómez, Soldaterna, Pampas-Gauchos,
//   El Pombero, Sensei Takeda och Conquistador-zombierna är nu ALLA äkta, skulpterade, ledade 3D-modeller
//   byggda med oljemålningarna som förlaga och klädda i oljemålade Impasto-texturer!
// - Fullt stöd för 3D-gore direkt på 3D-kropparna under de långsamma, brutala sekvenserna:
//   * 3D-ryggrad med kranium som slits ur halsen kota för kota
//   * 3D-bröstkorg som bänds upp med utstickande revben och bultande 3D-hjärta
//   * 3D-buköppning med utdragna 3D-tarmar mellan kämparna
//   * 3D-sagittal klyvning (kroppen delas fysiskt i två 3D-halvor som tippar isär)
//   * 3D-armamputation med synlig Humerus-benpipa och avhuggen 3D-arm på marken
//   * 3D-Boleadoras runt strupen med utploppande 3D-ögonglober

window.EliteMelee = window.EliteMelee || {};

Object.assign(window.EliteMelee, {

    // Skapar en skulpterad, fullt ledad 3D-kämpe (Hjälte, Soldat, Gaucho, Pombero eller Takeda)
    // med oljemålningarna som anatomisk och stilmässig modell!
    createSculptedHumanoid3D: function (THREE, roleKey, isHero) {
        const tex = this.get3DPaintedTextures(THREE);
        const root = new THREE.Group();
        const facingDir = isHero ? 1 : -1;

        const isBloom = (roleKey === 'bloom');
        const isGomez = (roleKey === 'gomez' || roleKey === 'villalba');
        const isPombero = (roleKey === 'pombero');
        const isGaucho = (roleKey === 'gaucho');
        const isTakeda = (roleKey === 'takeda');
        const isLobizon = (roleKey === 'lobizon');
        const isBeast = isPombero || isLobizon; // inga vapen, päls i stället för kläder

        const skinTex = isBeast ? tex.pomberoFur : (isBloom ? tex.skinBloom : tex.skinTan);
        const coatTex = isBeast ? tex.pomberoFur : (
            isGomez ? tex.uniformCrimson : (
                isGaucho ? tex.ponchoGaucho : (
                    isBloom ? tex.uniformBlue : tex.uniformScout
                )
            )
        );

        const skinMat = new THREE.MeshStandardMaterial({
            map: skinTex,
            bumpMap: tex.impastoBump,
            bumpScale: 0.045,
            roughness: 0.48,
            metalness: 0.08
        });
        const coatMat = new THREE.MeshStandardMaterial({
            map: coatTex,
            bumpMap: tex.impastoBump,
            bumpScale: 0.07,
            roughness: 0.58,
            metalness: 0.12
        });
        const pantsMat = new THREE.MeshStandardMaterial({
            map: tex.wornLeather,
            bumpMap: tex.impastoBump,
            bumpScale: 0.06,
            roughness: 0.52,
            metalness: 0.12
        });
        const boneMat = new THREE.MeshStandardMaterial({
            map: tex.agedBone,
            bumpMap: tex.impastoBump,
            bumpScale: 0.05,
            roughness: 0.45,
            metalness: 0.05
        });
        const visceraMat = new THREE.MeshStandardMaterial({
            map: tex.wetViscera,
            bumpMap: tex.impastoBump,
            bumpScale: 0.06,
            roughness: 0.15,
            metalness: 0.25
        });
        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xc59b27,
            roughness: 0.28,
            metalness: 0.85
        });
        const steelMat = new THREE.MeshStandardMaterial({
            map: tex.rustedSteel,
            bumpMap: tex.impastoBump,
            bumpScale: 0.04,
            roughness: 0.22,
            metalness: 0.88
        });

        // För att stödja vertikal klyvning ("Partido en dos") lägger vi vänster/höger sida i varsin sub-grupp
        const leftHalfGroup = new THREE.Group();
        const rightHalfGroup = new THREE.Group();
        const centerGoreGroup = new THREE.Group();
        root.add(leftHalfGroup);
        root.add(rightHalfGroup);
        root.add(centerGoreGroup);

        // 1. BÄCKEN & BEN (Skulpterade lår, knän, stövlar)
        const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.38, 12), pantsMat);
        pelvis.position.set(0, -0.52, 0);
        pelvis.scale.set(0.95, 1, 0.78);
        centerGoreGroup.add(pelvis);

        const legs = [];
        [-0.22, 0.22].forEach((lz, idx) => {
            const legGroup = new THREE.Group();
            legGroup.position.set(idx === 0 ? -0.1 : 0.1, -0.65, lz);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.86, 10), pantsMat);
            thigh.position.set(0, -0.40, 0);
            legGroup.add(thigh);

            const knee = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 10), pantsMat);
            knee.position.set(0, -0.84, 0);
            legGroup.add(knee);

            const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.115, 0.88, 10), pantsMat);
            boot.position.set(0, -1.28, 0);
            legGroup.add(boot);

            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.20), pantsMat);
            foot.position.set(facingDir * 0.08, -1.72, 0);
            legGroup.add(foot);

            if (idx === 0) leftHalfGroup.add(legGroup);
            else rightHalfGroup.add(legGroup);
            legs.push(legGroup);
        });

        // 2. MUSKULÖS SKULPTERAD TORSO (Bröstkorg, axlar, krage/poncho & 3D-skador)
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, 0.22, 0);
        root.add(torsoGroup);

        const chestL = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.25, 1.15, 10), coatMat);
        chestL.position.set(0, 0, -0.14);
        chestL.scale.set(0.95, 1, 0.85);
        torsoGroup.add(chestL);

        const chestR = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.25, 1.15, 10), coatMat);
        chestR.position.set(0, 0, 0.14);
        chestR.scale.set(0.95, 1, 0.85);
        torsoGroup.add(chestR);

        // Krage / Poncho / Bandoljär-detaljer från oljemålningarna
        if (isGaucho) {
            const ponchoCone = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.92, 14, 1, true), coatMat);
            ponchoCone.position.set(0, 0.12, 0);
            torsoGroup.add(ponchoCone);
        } else if (!isBeast) {
            // Korslagd läderrem över bröstet & mässingsknappar som i målningarna
            const strap = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.12, 0.58), pantsMat);
            strap.rotation.z = 0.65 * facingDir;
            strap.position.set(0, 0.06, 0);
            torsoGroup.add(strap);

            for (let b = 0; b < 4; b++) {
                const btn = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), brassMat);
                btn.position.set(facingDir * 0.34, 0.36 - b * 0.22, 0);
                torsoGroup.add(btn);
            }
        }

        // 3D-GORE I TORSON: Öppen bröstkorg med utstickande 3D-revben & bultande hjärta + Öppen buk med 3D-tarmar
        const chestWoundGroup = new THREE.Group();
        chestWoundGroup.visible = false;
        chestWoundGroup.position.set(facingDir * 0.24, 0.12, 0);
        const woundCavity = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), visceraMat);
        woundCavity.scale.set(0.55, 1.15, 0.95);
        chestWoundGroup.add(woundCavity);

        for (let r = 0; r < 4; r++) {
            [-1, 1].forEach(side => {
                const brokenRib = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.032, 0.28, 7), boneMat);
                brokenRib.position.set(facingDir * 0.08, 0.22 - r * 0.14, side * 0.18);
                brokenRib.rotation.x = side * 0.65;
                brokenRib.rotation.z = -facingDir * 0.45;
                chestWoundGroup.add(brokenRib);
            });
        }
        const internalHeart = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), visceraMat);
        internalHeart.position.set(facingDir * 0.06, 0.05, 0.04);
        chestWoundGroup.add(internalHeart);
        torsoGroup.add(chestWoundGroup);

        // 3D-buköppning med utvällda 3D-tarmar
        const gutWoundGroup = new THREE.Group();
        gutWoundGroup.visible = false;
        gutWoundGroup.position.set(facingDir * 0.26, -0.28, 0);
        for (let g = 0; g < 5; g++) {
            const coil = new THREE.Mesh(new THREE.TorusGeometry(0.11 + (g % 2) * 0.03, 0.052, 8, 14), visceraMat);
            coil.position.set(facingDir * (0.06 + (g % 2) * 0.05), -g * 0.07, (g - 2) * 0.05);
            coil.rotation.y = Math.PI / 2 + (g - 2) * 0.25;
            gutWoundGroup.add(coil);
        }
        torsoGroup.add(gutWoundGroup);

        // 3D-halsstump med utstickande halskota när huvudet slitits av
        const neckStumpGroup = new THREE.Group();
        neckStumpGroup.visible = false;
        neckStumpGroup.position.set(0, 0.62, 0);
        const neckMeat = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.14, 10), visceraMat);
        neckStumpGroup.add(neckMeat);
        const neckBone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.065, 0.24, 8), boneMat);
        neckBone.position.y = 0.08;
        neckStumpGroup.add(neckBone);
        torsoGroup.add(neckStumpGroup);

        // 3D-BOLEADORAS RUNT HALSEN (för Pampas Boleadoras-fatality)
        const boleadorasGroup = new THREE.Group();
        boleadorasGroup.visible = false;
        boleadorasGroup.position.set(0, 0.60, 0);
        for (let w = 0; w < 3; w++) {
            const cord = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.024, 7, 16), pantsMat);
            cord.rotation.x = Math.PI / 2;
            cord.position.y = w * 0.04;
            boleadorasGroup.add(cord);

            const leadBall = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), steelMat);
            leadBall.position.set(Math.cos(w * 2.1) * 0.34, -0.14 - (w % 2) * 0.08, Math.sin(w * 2.1) * 0.34);
            boleadorasGroup.add(leadBall);
        }
        torsoGroup.add(boleadorasGroup);

        // 3. SKULPTERAT 3D-HUVUD (Anatomisk skalle, käke, näsa, ögonbryn, hår/skägg/hatt som i oljemålningarna!)
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.88, 0);
        torsoGroup.add(headGroup);

        const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.29, 16, 16), skinMat);
        cranium.scale.set(0.96, 1.10, 0.92);
        headGroup.add(cranium);

        // Skulpterad käke & kindben
        const jawMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.15, 0.24, 10), skinMat);
        jawMesh.position.set(facingDir * 0.05, -0.14, 0);
        headGroup.add(jawMesh);

        // Skulpterad näsrygg
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.18, 6), skinMat);
        nose.rotation.z = -facingDir * (Math.PI / 2 - 0.25);
        nose.position.set(facingDir * 0.29, -0.02, 0);
        headGroup.add(nose);

        // Ögon + Utploppande 3D-ögonglober (för Boleadoras & skräck-närbild!)
        const eyeMat = new THREE.MeshBasicMaterial({ color: isLobizon ? 0xffea00 : (isPombero ? 0xffab00 : 0xf5f5f5) });
        const pupilMat = new THREE.MeshBasicMaterial({ color: isBeast ? 0xff1744 : 0x111111 });
        const poppedEyesGroup = new THREE.Group();
        poppedEyesGroup.visible = false;
        headGroup.add(poppedEyesGroup);

        const browMeshes = [];
        [-0.10, 0.10].forEach((ez, idx) => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 8), eyeMat);
            eye.position.set(facingDir * 0.24, 0.04, ez);
            headGroup.add(eye);

            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), pupilMat);
            pupil.position.set(facingDir * 0.275, 0.04, ez);
            headGroup.add(pupil);

            // Ögonbryn (så Bloom kan höja ena ögonbrynet i 3D!)
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.028, 0.095), pantsMat);
            brow.position.set(facingDir * 0.26, 0.11, ez);
            headGroup.add(brow);
            browMeshes.push(brow);

            // Utploppande ögonglob på blodig synnerv
            const nerve = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 6), visceraMat);
            nerve.rotation.z = Math.PI / 2;
            nerve.position.set(facingDir * 0.34, 0.02, ez * 1.15);
            poppedEyesGroup.add(nerve);

            const popBall = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            popBall.position.set(facingDir * 0.45, 0.01, ez * 1.2);
            poppedEyesGroup.add(popBall);
        });

        // Karaktärsspecifikt hår, skägg, kepi-mössa eller hatt (efter oljemålningarna!)
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x140f0c, roughness: 0.75 });
        if (isBloom) {
            // Blooms grova skägg, mustasch & paraguayanska fältmössa (Kepi)
            const beard = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), hairMat);
            beard.position.set(facingDir * 0.07, -0.14, 0);
            beard.scale.set(1.05, 0.95, 0.98);
            headGroup.add(beard);

            const kepiCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.29, 0.22, 14), coatMat);
            kepiCrown.position.set(-facingDir * 0.02, 0.24, 0);
            kepiCrown.rotation.z = -facingDir * 0.12;
            headGroup.add(kepiCrown);

            const kepiVisor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.32), pantsMat);
            kepiVisor.position.set(facingDir * 0.22, 0.16, 0);
            kepiVisor.rotation.z = -facingDir * 0.15;
            headGroup.add(kepiVisor);
        } else if (isGomez) {
            // María Gómez mörka svepande hår & stridsband
            const hairMain = new THREE.Mesh(new THREE.SphereGeometry(0.31, 14, 14), hairMat);
            hairMain.position.set(-facingDir * 0.05, 0.06, 0);
            hairMain.scale.set(1.05, 1.12, 1.05);
            headGroup.add(hairMain);

            const headband = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.035, 8, 18), coatMat);
            headband.rotation.x = Math.PI / 2;
            headband.position.set(0, 0.14, 0);
            headGroup.add(headband);
        } else if (isPombero) {
            // El Pomberos raggiga man, bredbrättade stråhatt (Sombrero Pirí) & glödande cigarett i mungipan!
            const hatBrim = new THREE.Mesh(
                new THREE.CylinderGeometry(0.58, 0.62, 0.04, 18),
                new THREE.MeshStandardMaterial({ color: 0x8d6e38, roughness: 0.85 })
            );
            hatBrim.position.set(0, 0.24, 0);
            headGroup.add(hatBrim);

            const hatCone = new THREE.Mesh(
                new THREE.CylinderGeometry(0.22, 0.32, 0.26, 14),
                new THREE.MeshStandardMaterial({ color: 0x785c2a, roughness: 0.85 })
            );
            hatCone.position.set(0, 0.36, 0);
            headGroup.add(hatCone);

            // Glödande cigarett i mungipan i 3D!
            const cigGroup = new THREE.Group();
            cigGroup.position.set(facingDir * 0.28, -0.10, 0.06);
            cigGroup.rotation.z = -facingDir * 0.22;
            const cigPaper = new THREE.Mesh(
                new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8),
                new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.6 })
            );
            cigPaper.rotation.z = Math.PI / 2;
            cigPaper.position.x = facingDir * 0.12;
            cigGroup.add(cigPaper);

            const cigEmber = new THREE.Mesh(
                new THREE.SphereGeometry(0.028, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0xff3d00 })
            );
            cigEmber.position.x = facingDir * 0.25;
            cigGroup.add(cigEmber);
            headGroup.add(cigGroup);
        } else if (isLobizon) {
            // EL LOBIZÓN: vargnos med huggtänder, spetsiga öron och ragg längs nacken
            const furMat = new THREE.MeshStandardMaterial({ map: tex.pomberoFur, bumpMap: tex.impastoBump, bumpScale: 0.08, roughness: 0.9 });
            const snout = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.42, 8), furMat);
            snout.rotation.z = -facingDir * Math.PI / 2;
            snout.position.set(facingDir * 0.36, -0.08, 0);
            headGroup.add(snout);
            const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0x0a0807, roughness: 0.3 }));
            noseTip.position.set(facingDir * 0.56, -0.07, 0);
            headGroup.add(noseTip);
            const fangMat = new THREE.MeshStandardMaterial({ color: 0xefe6cf, roughness: 0.4 });
            [-0.05, 0.05].forEach(fz => {
                const fang = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.1, 6), fangMat);
                fang.rotation.z = Math.PI;
                fang.position.set(facingDir * 0.42, -0.2, fz);
                headGroup.add(fang);
            });
            [-0.13, 0.13].forEach(ez => {
                const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 6), furMat);
                ear.position.set(-facingDir * 0.04, 0.33, ez);
                ear.rotation.x = ez > 0 ? 0.25 : -0.25;
                headGroup.add(ear);
            });
            const mane = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), furMat);
            mane.position.set(-facingDir * 0.12, -0.12, 0);
            mane.scale.set(0.9, 1.15, 1.1);
            headGroup.add(mane);
        } else if (isTakeda) {
            // Sensei Takedas samuraj-knut (Chonmage)
            const topKnot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.24, 10), hairMat);
            topKnot.position.set(-facingDir * 0.06, 0.32, 0);
            topKnot.rotation.z = facingDir * 0.45;
            headGroup.add(topKnot);
        } else {
            // Soldat / Spejare / Gaucho: rufsigt svart hår, skäggstubb & pannband/hatt
            const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.305, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
            hairCap.position.y = 0.03;
            headGroup.add(hairCap);

            const beardStub = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 10), hairMat);
            beardStub.position.set(facingDir * 0.06, -0.15, 0);
            headGroup.add(beardStub);
        }

        // 4. SKULPTERADE 3D-ARMAR & 3D-VAPEN (Machete / Sablar / Knogar)
        const frontArmGroup = new THREE.Group();
        frontArmGroup.position.set(0, 0.44, 0.38);
        torsoGroup.add(frontArmGroup);

        const shoulderF = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), coatMat);
        frontArmGroup.add(shoulderF);

        const upperArmF = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.56, 10), coatMat);
        upperArmF.position.set(facingDir * 0.20, -0.22, 0.05);
        upperArmF.rotation.z = facingDir * 0.65;
        frontArmGroup.add(upperArmF);

        const foreArmF = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.58, 10), skinMat);
        foreArmF.position.set(facingDir * 0.52, -0.26, 0.10);
        foreArmF.rotation.z = facingDir * 1.25;
        frontArmGroup.add(foreArmF);

        const handF = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), skinMat);
        handF.position.set(facingDir * 0.80, -0.22, 0.12);
        frontArmGroup.add(handF);

        // 3D-Sabel / Machete / Facón-kniv i handen (som i oljemålningarna!)
        const weaponGroup = new THREE.Group();
        weaponGroup.position.set(facingDir * 0.82, -0.20, 0.12);
        if (!isBeast) {
            const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.28, 8), brassMat);
            weaponGroup.add(hilt);

            const guard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.09), brassMat);
            guard.position.y = 0.12;
            weaponGroup.add(guard);

            const bladeLen = isBloom ? 0.95 : 1.25;
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.09, bladeLen, 0.024), steelMat);
            blade.position.set(facingDir * 0.08, 0.14 + bladeLen * 0.5, 0);
            blade.rotation.z = -facingDir * 0.14;
            weaponGroup.add(blade);

            // Blodrand längs eggen
            const bloodEdge = new THREE.Mesh(new THREE.BoxGeometry(0.035, bladeLen * 0.85, 0.028), visceraMat);
            bloodEdge.position.set(facingDir * 0.11, 0.18 + bladeLen * 0.5, 0);
            bloodEdge.rotation.z = -facingDir * 0.14;
            weaponGroup.add(bloodEdge);
        }
        frontArmGroup.add(weaponGroup);
        if (isLobizon) {
            // Klor i stället för vapen
            const clawMat = new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 0.35, metalness: 0.2 });
            for (let c = 0; c < 3; c++) {
                const claw = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.18, 6), clawMat);
                claw.rotation.z = -facingDir * Math.PI / 2;
                claw.position.set(facingDir * 0.94, -0.18 - c * 0.04, 0.08 + c * 0.04);
                frontArmGroup.add(claw);
            }
        }

        // Bakre arm
        const backArmGroup = new THREE.Group();
        backArmGroup.position.set(0, 0.42, -0.38);
        torsoGroup.add(backArmGroup);

        const upperArmB = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.105, 0.55, 10), coatMat);
        upperArmB.position.set(facingDir * 0.16, -0.24, -0.04);
        upperArmB.rotation.z = facingDir * 0.52;
        backArmGroup.add(upperArmB);

        const foreArmB = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.085, 0.54, 10), skinMat);
        foreArmB.position.set(facingDir * 0.44, -0.30, -0.06);
        foreArmB.rotation.z = facingDir * 1.05;
        backArmGroup.add(foreArmB);

        root.scale.setScalar(isLobizon ? 1.02 : 0.86); // varulven är större än en människa

        root.userData = {
            roleKey,
            isHero,
            torsoGroup,
            chestL,
            chestR,
            leftHalfGroup,
            rightHalfGroup,
            headGroup,
            browMeshes,
            poppedEyesGroup,
            frontArmGroup,
            backArmGroup,
            weaponGroup,
            legs,
            chestWoundGroup,
            internalHeart,
            gutWoundGroup,
            neckStumpGroup,
            boleadorasGroup
        };
        return root;
    },

    // Skapar den skulpterade 3D-Conquistadoren med oljemålade stål-, ben- och ruttet-kött-texturer
    // OCH 3D-bäckenben för "Mierda"-närbilden samt 3D-bröstkorg för El Pomberos Caña-obduktion!
    createUndeadConquistador3D: function (THREE) {
        const tex = this.get3DPaintedTextures(THREE);
        const root = new THREE.Group();

        const rustedSteelMat = new THREE.MeshStandardMaterial({
            map: tex.rustedSteel,
            bumpMap: tex.impastoBump,
            bumpScale: 0.08,
            roughness: 0.38,
            metalness: 0.80
        });
        const brassTrimMat = new THREE.MeshStandardMaterial({
            color: 0xb88e28,
            roughness: 0.32,
            metalness: 0.85
        });
        const boneMat = new THREE.MeshStandardMaterial({
            map: tex.agedBone,
            bumpMap: tex.impastoBump,
            bumpScale: 0.05,
            roughness: 0.50,
            metalness: 0.06
        });
        const rottenFleshMat = new THREE.MeshStandardMaterial({
            map: tex.wetViscera,
            bumpMap: tex.impastoBump,
            bumpScale: 0.06,
            roughness: 0.22,
            metalness: 0.18
        });
        const trousersMat = new THREE.MeshStandardMaterial({
            map: tex.wornLeather,
            bumpMap: tex.impastoBump,
            bumpScale: 0.06,
            roughness: 0.65
        });
        const glowingEyeMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });

        // 1. ANATOMISKT 3D-BÄCKENBEN + MURKNA 1500-TALSBYXOR (Kan slitas bort i 3D under Mierda-scenen!)
        const pelvisGroup = new THREE.Group();
        pelvisGroup.position.set(0, -0.52, 0);
        root.add(pelvisGroup);

        const iliumL = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 8, 14), boneMat);
        iliumL.position.set(-0.18, 0.04, 0.08);
        iliumL.rotation.y = 0.4;
        pelvisGroup.add(iliumL);

        const iliumR = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 8, 14), boneMat);
        iliumR.position.set(0.18, 0.04, -0.08);
        iliumR.rotation.y = -0.4;
        pelvisGroup.add(iliumR);

        const sacrum = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 8), boneMat);
        sacrum.rotation.x = Math.PI;
        sacrum.position.set(0, -0.04, 0);
        pelvisGroup.add(sacrum);

        // Murkna tygbyxor utanpå bäckenbenet (döljs när byxorna slits sönder i Mierda-scenen!)
        const rottenTrousersMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.42, 0.48, 12), trousersMat);
        pelvisGroup.add(rottenTrousersMesh);

        [-0.25, 0.25].forEach((lz, idx) => {
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.90, 10), boneMat);
            thigh.position.set(idx === 0 ? -0.06 : 0.06, -1.08, lz);
            root.add(thigh);

            const knee = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), rustedSteelMat);
            knee.position.set(idx === 0 ? -0.06 : 0.06, -1.52, lz);
            root.add(knee);

            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.095, 0.90, 10), boneMat);
            shin.position.set(idx === 0 ? -0.06 : 0.06, -1.96, lz);
            root.add(shin);
        });

        // 2. BRÖSTKORG, RYGGRAD, INDIVIDUELLA 3D-REVBEN (Kan brytas ett och ett av El Pombero!)
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, 0.28, 0);
        root.add(torsoGroup);

        for (let v = 0; v < 7; v++) {
            const vert = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.14, 8), boneMat);
            vert.position.set(0, -0.56 + v * 0.19, -0.1);
            torsoGroup.add(vert);
        }

        const ribMeshes = [];
        for (let r = 0; r < 5; r++) {
            const ribGeo = new THREE.TorusGeometry(0.41 - r * 0.025, 0.038, 8, 16, Math.PI * 1.55);
            const rib = new THREE.Mesh(ribGeo, boneMat);
            rib.position.set(0, 0.36 - r * 0.18, -0.04);
            rib.rotation.x = Math.PI / 2 + 0.12;
            rib.rotation.z = -Math.PI * 0.78;
            torsoGroup.add(rib);
            ribMeshes.push(rib);
        }

        const heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), rottenFleshMat);
        heartMesh.position.set(-0.06, 0.1, 0.06);
        torsoGroup.add(heartMesh);

        const cuirassBack = new THREE.Mesh(
            new THREE.CylinderGeometry(0.56, 0.44, 1.16, 14, 1, false, Math.PI * 0.32, Math.PI * 1.35),
            rustedSteelMat
        );
        cuirassBack.scale.set(1.06, 1.0, 0.72);
        torsoGroup.add(cuirassBack);

        const breastRim = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.10, 0.1), brassTrimMat);
        breastRim.position.set(0.32, 0, 0.26);
        breastRim.rotation.z = 0.1;
        torsoGroup.add(breastRim);

        // 3. 3D-KRANIUM & SPANSK MORION-HJÄLM (Öppningsbart skalltak för El Pomberos Caña-obduktion!)
        const headGroup = new THREE.Group();
        headGroup.position.set(-0.06, 0.98, 0.08);
        torsoGroup.add(headGroup);

        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), boneMat);
        skull.scale.set(0.92, 1.06, 1.02);
        headGroup.add(skull);

        const jawGroup = new THREE.Group();
        jawGroup.position.set(-0.04, -0.26, 0.04);
        const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.13, 10, 1, false, 0, Math.PI), boneMat);
        jaw.rotation.y = -Math.PI / 2;
        jaw.position.set(-0.08, -0.05, 0.08);
        jawGroup.add(jaw);
        headGroup.add(jawGroup);

        [-0.11, 0.11].forEach(ez => {
            const socket = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), new THREE.MeshBasicMaterial({ color: 0x050101 }));
            socket.position.set(-0.27, 0.02, ez);
            headGroup.add(socket);

            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), glowingEyeMat);
            eye.position.set(-0.31, 0.02, ez);
            headGroup.add(eye);
        });

        const helmetGroup = new THREE.Group();
        helmetGroup.position.set(0, 0.14, 0);
        headGroup.add(helmetGroup);

        const helmetDome = new THREE.Mesh(
            new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
            rustedSteelMat
        );
        helmetDome.scale.set(1.08, 1.14, 0.95);
        helmetGroup.add(helmetDome);

        const crest = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI), brassTrimMat);
        crest.scale.set(1.12, 1.32, 0.42);
        crest.position.set(0, 0.06, 0);
        helmetGroup.add(crest);

        const brim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.05, 8, 20), rustedSteelMat);
        brim.rotation.x = Math.PI / 2;
        brim.rotation.y = -0.16;
        brim.scale.set(1.26, 1.0, 1.70);
        brim.position.set(-0.03, -0.02, 0);
        helmetGroup.add(brim);

        // 4. HÖGER FRAMARM (Med 3D-amputations-sår & Humerus-benstump!) + VÄNSTER SVÄRDSARM
        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set(-0.12, 0.46, 0.44);
        torsoGroup.add(rightArmGroup);

        const pauldronGeo = new THREE.SphereGeometry(0.26, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const pauldronR = new THREE.Mesh(pauldronGeo, rustedSteelMat);
        pauldronR.rotation.z = 0.42;
        rightArmGroup.add(pauldronR);

        // Detaljerad 3D-stump med blottat muskelkött och vit Humerus-benpipa som huggs av i 3D!
        const stumpGroup = new THREE.Group();
        stumpGroup.visible = false;
        const stumpFlesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.30, 10), rottenFleshMat);
        stumpFlesh.rotation.z = 0.8;
        stumpFlesh.position.set(-0.14, -0.14, 0);
        stumpGroup.add(stumpFlesh);

        const humerusStump = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.058, 0.48, 8), boneMat);
        humerusStump.rotation.z = 0.8;
        humerusStump.position.set(-0.24, -0.24, 0);
        stumpGroup.add(humerusStump);
        rightArmGroup.add(stumpGroup);

        const intactRightArm = new THREE.Group();
        const upperArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.64, 10), rustedSteelMat);
        upperArmR.position.set(-0.22, -0.25, 0.06);
        upperArmR.rotation.z = -0.62;
        intactRightArm.add(upperArmR);

        const foreArmR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.66, 10), boneMat);
        foreArmR.position.set(-0.60, -0.35, 0.14);
        foreArmR.rotation.z = -1.22;
        intactRightArm.add(foreArmR);

        const gauntletR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.18), rustedSteelMat);
        gauntletR.position.set(-0.94, -0.29, 0.18);
        intactRightArm.add(gauntletR);
        rightArmGroup.add(intactRightArm);

        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(0.12, 0.44, -0.44);
        torsoGroup.add(leftArmGroup);

        const pauldronL = new THREE.Mesh(pauldronGeo, rustedSteelMat);
        pauldronL.rotation.z = -0.32;
        leftArmGroup.add(pauldronL);

        const upperArmL = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.66, 10), rustedSteelMat);
        upperArmL.position.set(-0.26, -0.28, -0.08);
        upperArmL.rotation.z = -0.72;
        leftArmGroup.add(upperArmL);

        const swordGroup = new THREE.Group();
        swordGroup.position.set(-0.60, -0.35, -0.12);
        swordGroup.rotation.z = 0.32;
        const crossGuard = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.50, 0.1), brassTrimMat);
        swordGroup.add(crossGuard);
        const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(1.50, 0.09, 0.025), rustedSteelMat);
        swordBlade.position.set(-0.78, 0, 0);
        swordGroup.add(swordBlade);
        leftArmGroup.add(swordGroup);

        root.scale.set(0.86, 0.86, 0.86);

        root.userData = {
            torsoGroup,
            headGroup,
            jawGroup,
            helmetGroup,
            rightArmGroup,
            intactRightArm,
            stumpGroup,
            leftArmGroup,
            swordGroup,
            heartMesh,
            ribMeshes,
            pelvisGroup,
            rottenTrousersMesh
        };
        return root;
    },

    // Skapar 3D-troféer, 3D-tarmkedja, avhuggen 3D-arm på marken samt 3D-Sakeflaska & Guld-idol!
    create3DGorePropsRig: function (THREE) {
        const tex = this.get3DPaintedTextures(THREE);
        const root = new THREE.Group();

        const boneMat = new THREE.MeshStandardMaterial({
            map: tex.agedBone,
            bumpMap: tex.impastoBump,
            bumpScale: 0.05,
            roughness: 0.45
        });
        const visceraMat = new THREE.MeshStandardMaterial({
            map: tex.wetViscera,
            bumpMap: tex.impastoBump,
            bumpScale: 0.06,
            roughness: 0.12,
            metalness: 0.25
        });
        const steelMat = new THREE.MeshStandardMaterial({
            map: tex.rustedSteel,
            bumpMap: tex.impastoBump,
            bumpScale: 0.06,
            roughness: 0.35,
            metalness: 0.82
        });

        // 1. 3D-KRANIUM MED HÄNGANDE RYGGRAD (Slits upp kota för kota!)
        const spineTrophy = new THREE.Group();
        spineTrophy.visible = false;
        const skull = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 14), boneMat);
        spineTrophy.add(skull);

        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0x090202 }));
        eyeL.position.set(-0.18, 0.02, 0.11);
        spineTrophy.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.z = -0.11;
        spineTrophy.add(eyeR);

        const vertebrae = [];
        for (let i = 0; i < 14; i++) {
            const vGroup = new THREE.Group();
            const body = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.09, 8), boneMat);
            vGroup.add(body);
            const wings = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.035, 0.06), boneMat);
            vGroup.add(wings);
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.035, 8), visceraMat);
            disc.position.y = -0.05;
            vGroup.add(disc);
            vGroup.position.set(0, -0.26 - i * 0.12, 0);
            spineTrophy.add(vGroup);
            vertebrae.push(vGroup);
        }
        root.add(spineTrophy);

        // 2. 3D-BULTANDE HJÄRTA MED AVSLITNA AORTAKÄRL
        const heartTrophy = new THREE.Group();
        heartTrophy.visible = false;
        const hMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 14), visceraMat);
        hMesh.scale.set(0.95, 1.22, 0.88);
        heartTrophy.add(hMesh);
        const aorta = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.28, 8), visceraMat);
        aorta.position.set(0.08, 0.28, 0);
        aorta.rotation.z = -0.35;
        heartTrophy.add(aorta);
        root.add(heartTrophy);

        // 3. 3D-TARMKEDJA (Dras ut meter för meter mellan offrets buk och angriparens hand!)
        const visceraRopeGroup = new THREE.Group();
        visceraRopeGroup.visible = false;
        const gutSegments = [];
        for (let s = 0; s < 16; s++) {
            const seg = new THREE.Mesh(new THREE.SphereGeometry(0.11 + (s % 2) * 0.025, 10, 10), visceraMat);
            seg.scale.set(1.35, 0.9, 0.9);
            visceraRopeGroup.add(seg);
            gutSegments.push(seg);
        }
        root.add(visceraRopeGroup);

        // 4. AVHUGGEN 3D-ARM PÅ GOLVET (med utstickande Humerus-benpipa & ryckande fingrar)
        const severedArm3D = new THREE.Group();
        severedArm3D.visible = false;
        const sevUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.45, 10), steelMat);
        sevUpper.rotation.z = Math.PI / 2;
        severedArm3D.add(sevUpper);
        const sevBone = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.28, 8), boneMat);
        sevBone.rotation.z = Math.PI / 2;
        sevBone.position.x = -0.26;
        severedArm3D.add(sevBone);
        const sevMeat = new THREE.Mesh(new THREE.SphereGeometry(0.125, 10, 10), visceraMat);
        sevMeat.position.x = -0.18;
        severedArm3D.add(sevMeat);
        const sevFore = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.09, 0.55, 10), boneMat);
        sevFore.rotation.z = Math.PI / 2 - 0.25;
        sevFore.position.set(0.42, 0.06, 0);
        severedArm3D.add(sevFore);
        root.add(severedArm3D);

        // 5. 3D-SAKEFLASKA & 3D-GUARANÍ-IDOL (för Sensei Takedas Sake-diplomati i 3D!)
        const sakeBottle3D = new THREE.Group();
        sakeBottle3D.visible = false;
        const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.2, metalness: 0.1 });
        const blueNeckMat = new THREE.MeshStandardMaterial({ color: 0x1a237e, roughness: 0.25 });
        const bottleBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), ceramicMat);
        bottleBody.scale.set(1, 1.35, 1);
        sakeBottle3D.add(bottleBody);
        const bottleNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.24, 10), blueNeckMat);
        bottleNeck.position.y = 0.34;
        sakeBottle3D.add(bottleNeck);
        root.add(sakeBottle3D);

        const idol3D = new THREE.Group();
        idol3D.visible = false;
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.22, metalness: 0.92 });
        const idolBody = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.38, 12), goldMat);
        idol3D.add(idolBody);
        const idolHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), goldMat);
        idolHead.position.y = 0.28;
        idol3D.add(idolHead);
        root.add(idol3D);

        root.userData = {
            spineTrophy,
            vertebrae,
            heartTrophy,
            hMesh,
            visceraRopeGroup,
            gutSegments,
            severedArm3D,
            sakeBottle3D,
            idol3D
        };
        return root;
    }
});
