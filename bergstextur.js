// === TEXTURE MODULE: ANDERNA & HÖGBERGSPLATÅN (bergstextur.js) ===
// Skapar 64x64-pixeltexturer för Andernas klippväggar, förhistoriska Inka-terrasser (Pirca),
// snöklädda bergspass och stjärnklar/blåsig Altiplano-himmel!

window.BergsTextur = {
    TEX_SIZE: 64,
    wallCanvases: {},
    ready: false,

    customImageFiles: {
        1: null, // t.ex. 'anderna_klippa.png'
        2: null, // t.ex. 'inka_mur.png'
        3: null  // t.ex. 'bergspass_is.png'
    },

    init: function() {
        this.wallCanvases[1] = this.createAndeanCliffTexture();
        this.wallCanvases[2] = this.createIncaMasonryTexture();
        this.wallCanvases[3] = this.createSnowyPassBarricadeTexture();

        for (let type in this.customImageFiles) {
            const filename = this.customImageFiles[type];
            if (filename) {
                const img = new Image();
                img.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = c.height = this.TEX_SIZE;
                    c.getContext('2d').drawImage(img, 0, 0, this.TEX_SIZE, this.TEX_SIZE);
                    this.wallCanvases[type] = c;
                };
                img.src = filename;
            }
        }
        this.ready = true;
    },

    // --- VÄGG 1: Skrovlig Andinsk Granitklippa med snöhyllor och silverådror ---
    createAndeanCliffTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        // Bas i mörk skiffer/granit
        ctx.fillStyle = '#3b4047';
        ctx.fillRect(0, 0, 64, 64);

        // Diagonala klippformationer och sprickor
        const shades = ['#2c3036', '#4a5059', '#565d66', '#23272b'];
        for (let i = 0; i < 280; i++) {
            const x = (i * 17) % 64;
            const y = (i * 29) % 64;
            const w = 3 + (i % 6);
            const h = 2 + (i % 4);
            ctx.fillStyle = shades[i % shades.length];
            ctx.fillRect(x, y, w, h);
        }

        // Djupa bergssprickor
        ctx.strokeStyle = '#181a1d';
        ctx.lineWidth = 1.5;
        for (let cy = 10; cy < 60; cy += 18) {
            ctx.beginPath();
            ctx.moveTo(0, cy);
            ctx.lineTo(22, cy + 4);
            ctx.lineTo(44, cy - 3);
            ctx.lineTo(64, cy + 2);
            ctx.stroke();
        }

        // Snö- och isavlagringar på klipphyllorna (hög höjd i Anderna)
        ctx.fillStyle = '#dce6f2';
        ctx.fillRect(0, 0, 64, 4);
        for (let sx = 0; sx < 64; sx += 7) {
            const sh = 2 + (sx % 4);
            ctx.fillRect(sx, 4, 5, sh);
            if (sx % 2 === 0) {
                ctx.fillRect(sx, 28, 6, 2);
                ctx.fillRect(sx + 2, 46, 5, 2);
            }
        }

        // Glimrande silver-/kopparmalmsådror (Potosí/Anderna-känsla)
        ctx.fillStyle = '#9bb5c9';
        ctx.fillRect(14, 19, 3, 2);
        ctx.fillRect(48, 37, 4, 2);

        return c;
    },

    // --- VÄGG 2: Uråldrig Polygonal Inka-stenmur med Andinsk Solsymbol ---
    createIncaMasonryTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#5c5346';
        ctx.fillRect(0, 0, 64, 64);

        // Stenstruktur
        for (let i = 0; i < 260; i++) {
            const x = (i * 23) % 64;
            const y = (i * 37) % 64;
            ctx.fillStyle = (i % 2 === 0) ? '#6b6152' : '#4a4237';
            ctx.fillRect(x, y, 3, 2);
        }

        //Tätt passade Inka-stenblock
        ctx.strokeStyle = '#26211b';
        ctx.lineWidth = 2;
        const rows = [0, 14, 30, 46, 64];
        rows.forEach((ry, idx) => {
            ctx.beginPath();
            ctx.moveTo(0, ry);
            ctx.lineTo(64, ry);
            ctx.stroke();

            const nextY = rows[idx + 1] || 64;
            const offset = (idx % 2) * 14;
            for (let rx = offset; rx < 64; rx += 22) {
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx + ((idx % 2 === 0) ? 3 : -3), nextY);
                ctx.stroke();
            }
        });

        // Chakana (Andinskt trappkors / Inka-relikfäste) i guldfärg
        ctx.fillStyle = '#c99e32';
        ctx.fillRect(26, 20, 12, 24);
        ctx.fillRect(20, 26, 24, 12);
        ctx.fillStyle = '#33291a';
        ctx.beginPath();
        ctx.arc(32, 32, 4, 0, Math.PI * 2);
        ctx.fill();

        return c;
    },

    // --- VÄGG 3: Andinskt Gränspass / Smugglarbarrikad med istappar och packlådor ---
    createSnowyPassBarricadeTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        // Kall trä- och stenbarrikad
        ctx.fillStyle = '#2d3338';
        ctx.fillRect(0, 0, 64, 64);

        for (let y = 8; y < 64; y += 12) {
            ctx.fillStyle = '#4f3b28';
            ctx.fillRect(0, y, 64, 9);
            ctx.fillStyle = '#634b34';
            ctx.fillRect(0, y + 1, 64, 3);
        }

        // Vertikala stöttor
        ctx.fillStyle = '#382819';
        ctx.fillRect(10, 0, 7, 64);
        ctx.fillRect(46, 0, 7, 64);

        // Snötäcke och istappar upptill
        ctx.fillStyle = '#e8f1f8';
        ctx.fillRect(0, 0, 64, 6);
        for (let ix = 4; ix < 64; ix += 9) {
            ctx.beginPath();
            ctx.moveTo(ix, 6);
            ctx.lineTo(ix + 4, 6);
            ctx.lineTo(ix + 2, 13 + (ix % 5));
            ctx.closePath();
            ctx.fill();
        }

        return c;
    },

    // --- MARK & HIMMEL: Högplatån (Altiplano) med snöfläckar, klippblock och Andernas bergstoppar ---
    renderFloorAndCeiling: function(ctx, w, h, player) {
        const halfH = h / 2;

        // 1. HIMMEL: Kristallklar, iskall bergshimmel över Anderna med snöklädda toppar vid horisonten
        const skyGrad = ctx.createLinearGradient(0, 0, 0, halfH);
        skyGrad.addColorStop(0, '#0b162c');
        skyGrad.addColorStop(0.55, '#1d3557');
        skyGrad.addColorStop(1, '#5c7a99');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, halfH);

        const angleOffset = (player.angle / (Math.PI * 2)) * w * 2;
        const moveOffset = (player.x + player.y) * 18;

        // Avlägsna snöklädda Andinska vulkaner och bergstoppar längs horisonten
        ctx.fillStyle = '#2b3a4a';
        for (let i = -2; i < 8; i++) {
            const peakX = ((i * 140 - angleOffset * 0.5) % (w + 140) + (w + 140)) % (w + 140) - 70;
            const peakH = 42 + ((i * 29) % 28);
            ctx.beginPath();
            ctx.moveTo(peakX - 80, halfH);
            ctx.lineTo(peakX, halfH - peakH);
            ctx.lineTo(peakX + 80, halfH);
            ctx.closePath();
            ctx.fill();

            // Snötopp
            ctx.fillStyle = '#dce8f2';
            ctx.beginPath();
            ctx.moveTo(peakX - 24, halfH - peakH * 0.7);
            ctx.lineTo(peakX, halfH - peakH);
            ctx.lineTo(peakX + 24, halfH - peakH * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#2b3a4a';
        }

        // 2. MARKEN: Stenigt bergspass med grus, frost och snöfläckar
        const floorGrad = ctx.createLinearGradient(0, halfH, 0, h);
        floorGrad.addColorStop(0, '#262b30');
        floorGrad.addColorStop(0.4, '#3d434a');
        floorGrad.addColorStop(1, '#525861');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, halfH, w, halfH);

        for (let row = halfH + 10; row < h; row += 8) {
            const depth = (row - halfH) / halfH;
            const step = Math.max(16, Math.floor(80 * depth));
            const rowSeed = row * 17;

            for (let i = 0; i < w / step + 2; i++) {
                const baseX = i * step + (rowSeed % 35);
                const screenX = ((baseX - angleOffset * (0.6 + depth * 0.6) + moveOffset * depth * 2) % w + w) % w;

                if ((i + row) % 4 === 0) {
                    // Snödriva på bergsstigen
                    ctx.fillStyle = `rgba(225, 238, 250, ${depth * 0.65})`;
                    ctx.fillRect(screenX, row, 14 * depth + 3, 4 * depth + 1);
                } else {
                    // Skarp skiffersten & bergsgrus
                    ctx.fillStyle = `rgba(30, 34, 38, ${depth * 0.7})`;
                    ctx.fillRect(screenX, row, 10 * depth + 2, 3 * depth + 1);
                }
            }
        }
    }
};

window.BergsTextur.init();
