// === MODUL: PROCEDURALA OLJEMÅLNINGS-TEXTURER FÖR 3D-FIGURER (elite_melee_3d_textures.js) ===
// Skapar högupplösta, oljemålnings-inspirerade PBR-texturer (diffus + bump/roughness) så att de
// skulpterade 3D-modellerna har samma mörka, skitiga, blodstänkta Chiaroscuro-känsla som porträtten!

window.EliteMelee = window.EliteMelee || {};

Object.assign(window.EliteMelee, {
    _3dTexCache: null,

    get3DPaintedTextures: function (THREE) {
        if (this._3dTexCache) return this._3dTexCache;

        const makePaintedTex = (w, h, drawFn, repeatX = 1, repeatY = 1) => {
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            const ctx = c.getContext('2d');
            drawFn(ctx, w, h);
            const tex = new THREE.CanvasTexture(c);
            // färgtexturer i sRGB (annars blir de bleka med filmisk tonmappning); bump-kartan är data och lämnas linjär
            if (drawFn.__isColor !== false) {
                if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
                else if (THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
            }
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            tex.repeat.set(repeatX, repeatY);
            return tex;
        };

        // Helper: Lägg till oljemålnings-penseldrag (Impasto) + smuts & torkat blod
        const addOilImpasto = (ctx, w, h, baseHex, darkHex, highlightHex, bloodChance = 0.25) => {
            ctx.fillStyle = baseHex;
            ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 420; i++) {
                const x = Math.random() * w, y = Math.random() * h;
                const len = 10 + Math.random() * 28, thick = 3 + Math.random() * 7;
                const ang = (Math.random() - 0.5) * 0.5;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(ang);
                ctx.fillStyle = (i % 3 === 0) ? highlightHex : darkHex;
                ctx.globalAlpha = 0.16 + Math.random() * 0.22;
                ctx.fillRect(-len / 2, -thick / 2, len, thick);
                ctx.restore();
            }
            if (bloodChance > 0) {
                for (let b = 0; b < Math.floor(65 * bloodChance); b++) {
                    ctx.fillStyle = (b % 2 === 0) ? 'rgba(95, 6, 8, 0.45)' : 'rgba(35, 18, 10, 0.45)';
                    ctx.beginPath();
                    ctx.arc(Math.random() * w, Math.random() * h, 2 + Math.random() * 11, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        // 1. Bump-map med penseldrag och grova porer/repor
        const bumpDraw = (ctx, w, h) => { addOilImpasto(ctx, w, h, '#808080', '#484848', '#c8c8c8', 0); };
        bumpDraw.__isColor = false;
        const impastoBump = makePaintedTex(256, 256, bumpDraw, 2, 2);

        // 2. Sargento Blooms mörka väderbitna hud (med oljemålnings-schatteringar, ärr och svett)
        const skinBloom = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#593422', '#381e11', '#7d4d36', 0.25);
        });

        // 3. Soldat / Gómez / Rojas solbrända & smutsiga hud
        const skinTan = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#9e6b49', '#6e4429', '#c28c69', 0.28);
        });

        // 4. Blooms paraguayanska mörkblå/slitna fältuniform med mässingsknappar & lerstänk
        const uniformBlue = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#1b2836', '#0e161f', '#2f4359', 0.45);
            // Slitna tygveck & mässingsdetaljer
            ctx.strokeStyle = 'rgba(180, 140, 60, 0.65)';
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(w * 0.5, 0); ctx.lineTo(w * 0.5, h); ctx.stroke();
        });

        // 5. Capitana María Gómez blodröda uniform / schabrak
        const uniformCrimson = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#6e1414', '#3d0707', '#992424', 0.5);
        });

        // 6. Brasiliansk / Argentinsk spejar-uniform (olivgrön/jordbrun fältrock med remtyg)
        const uniformScout = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#2c3824', '#182013', '#46573b', 0.55);
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 18;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, h); ctx.stroke();
        });

        // 7. Pampas Gaucho Poncho (Mörkröd med traditionella vävda ränder & lera)
        const ponchoGaucho = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#6b1d16', '#3b0d09', '#8f2c22', 0.4);
            ctx.fillStyle = 'rgba(210, 185, 140, 0.75)';
            for (let y = 24; y < h; y += 64) {
                ctx.fillRect(0, y, w, 10);
                ctx.fillStyle = 'rgba(30, 15, 10, 0.8)';
                ctx.fillRect(0, y + 10, w, 6);
                ctx.fillStyle = 'rgba(210, 185, 140, 0.75)';
            }
        });

        // 8. Rostigt, blodstänkt 1500-tals Conquistador-stål (Damaskerat & sprucket)
        const rustedSteel = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#383e42', '#1b1f22', '#5c666e', 0.65);
            for (let r = 0; r < 40; r++) {
                ctx.fillStyle = 'rgba(130, 52, 16, 0.45)';
                ctx.beginPath();
                ctx.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 14, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // 9. Åldrat kranium & benpipor (med sprickor och torkat blod)
        const agedBone = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#d6ccb2', '#998e73', '#ede6d3', 0.3);
        });

        // 10. Vått muskelkött, organ & inälvor
        const wetViscera = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#7a0c14', '#3d0206', '#b82532', 0.8);
        });

        // 11. Slitet läder (stövlar, bälten, byxor)
        const wornLeather = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#2b1e16', '#140d09', '#473325', 0.4);
        });

        // 12. El Pomberos raggiga nattsvarta päls & torkad lera
        const pomberoFur = makePaintedTex(256, 256, (ctx, w, h) => {
            addOilImpasto(ctx, w, h, '#171412', '#080706', '#2e2722', 0.35);
        });

        this._3dTexCache = {
            impastoBump,
            skinBloom,
            skinTan,
            uniformBlue,
            uniformCrimson,
            uniformScout,
            ponchoGaucho,
            rustedSteel,
            agedBone,
            wetViscera,
            wornLeather,
            pomberoFur
        };
        return this._3dTexCache;
    }
});
