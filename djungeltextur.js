// === TEXTURE MODULE: DJUNGEL, TEMPEL, MARK & TAK (djungeltextur.js) ===
// Skapar pixeltexturer (64x64) för väggar, mark och lövtak direkt i minnet,
// samt låter dig enkelt byta ut dem mot egna bildfiler (.png/.jpg) om du lägger dem i mappen!

window.DjungelTextur = {
    TEX_SIZE: 64,
    wallCanvases: {},
    floorPattern: null,
    ceilPattern: null,
    ready: false,

    // Om du vill använda egna bilder: lägg bilderna i samma mapp och skriv filnamnen här!
    customImageFiles: {
        1: null, // t.ex. 'min_djungelvagg.png'
        2: null, // t.ex. 'min_tempelsten.png'
        3: null  // t.ex. 'min_palisad.png'
    },

    init: function() {
        // 1. Generera procedur-texturer direkt så spelet alltid har grafik utan externa filer
        this.wallCanvases[1] = this.createJungleWallTexture();
        this.wallCanvases[2] = this.createTempleStoneTexture();
        this.wallCanvases[3] = this.createPalisadeTexture();

        this.floorCanvas = this.createMudFloorTexture();
        this.ceilCanvas = this.createCanopyCeilingTexture();

        // 2. Om egna bildfiler har angetts, ladda in dem ovanpå
        for (let type in this.customImageFiles) {
            const filename = this.customImageFiles[type];
            if (filename) {
                const img = new Image();
                img.onload = () => {
                    const c = document.createElement('canvas');
                    c.width = this.TEX_SIZE;
                    c.height = this.TEX_SIZE;
                    c.getContext('2d').drawImage(img, 0, 0, this.TEX_SIZE, this.TEX_SIZE);
                    this.wallCanvases[type] = c;
                };
                img.src = filename;
            }
        }

        this.ready = true;
    },

    // --- VÄGG 1: Tät Djungelvägg med stammar, bladverk och lianer ---
    createJungleWallTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        // Mörk djungelbas
        ctx.fillStyle = '#112411';
        ctx.fillRect(0, 0, 64, 64);

        // Bambu/trädstammar i bakgrunden
        const trunks = [8, 24, 42, 56];
        trunks.forEach(tx => {
            ctx.fillStyle = '#2d2216';
            ctx.fillRect(tx, 0, 6, 64);
            ctx.fillStyle = '#3d2f1f';
            ctx.fillRect(tx + 1, 0, 2, 64);
        });

        // Tät bladmassa i olika gröna nyanser
        const greens = ['#1b3b1a', '#254f23', '#2f632b', '#163015', '#3b7534'];
        for (let i = 0; i < 220; i++) {
            const x = (i * 19) % 64;
            const y = (i * 31) % 64;
            const r = 3 + (i % 5);
            ctx.fillStyle = greens[i % greens.length];
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // Hängande lianer
        ctx.strokeStyle = '#435929';
        ctx.lineWidth = 2;
        for (let lx = 6; lx < 64; lx += 14) {
            ctx.beginPath();
            ctx.moveTo(lx, 0);
            ctx.bezierCurveTo(lx + 4, 20, lx - 4, 44, lx + 2, 64);
            ctx.stroke();
        }

        // Tropiska röda/gula små orkidéer i lövverket
        ctx.fillStyle = '#d94b38';
        ctx.fillRect(18, 22, 3, 3);
        ctx.fillRect(49, 44, 3, 3);
        ctx.fillStyle = '#ebb83b';
        ctx.fillRect(33, 14, 2, 2);

        return c;
    },

    // --- VÄGG 2: Uråldrig Mossbelupen Tempelsten (Inka / Guaraní-ruin) ---
    createTempleStoneTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        // Stenbas
        ctx.fillStyle = '#4f4d46';
        ctx.fillRect(0, 0, 64, 64);

        // Skrovlig stenstruktur
        for (let i = 0; i < 300; i++) {
            const x = (i * 23) % 64;
            const y = (i * 41) % 64;
            ctx.fillStyle = (i % 2 === 0) ? '#5e5b52' : '#3d3b35';
            ctx.fillRect(x, y, 2, 2);
        }

        // Murfogar (Stenblock)
        ctx.strokeStyle = '#22201c';
        ctx.lineWidth = 2;
        const rows = [0, 16, 32, 48, 64];
        rows.forEach((ry, idx) => {
            ctx.beginPath();
            ctx.moveTo(0, ry);
            ctx.lineTo(64, ry);
            ctx.stroke();

            const offset = (idx % 2) * 16;
            for (let rx = offset; rx < 64; rx += 32) {
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx, ry + 16);
                ctx.stroke();
            }
        });

        // Inristad uråldrig solfris i mitten
        ctx.strokeStyle = '#8c7847';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 20, 24, 24);
        ctx.beginPath();
        ctx.arc(32, 32, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Grön mossa som klättrar i fogarna
        ctx.fillStyle = '#2d5724';
        for (let m = 0; m < 45; m++) {
            const mx = (m * 17) % 64;
            const my = ((m % 4) * 16) + ((m * 3) % 5) - 2;
            ctx.fillRect(mx, my, 4, 3);
        }

        return c;
    },

    // --- VÄGG 3: Brasiliansk Träpalisad (Spetsade stockar & rep) ---
    createPalisadeTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        for (let x = 0; x < 64; x += 8) {
            ctx.fillStyle = '#5c3a21';
            ctx.fillRect(x, 0, 7, 64);

            ctx.fillStyle = '#734a2b';
            ctx.fillRect(x + 2, 0, 2, 64);

            ctx.fillStyle = '#24150b';
            ctx.fillRect(x + 7, 0, 1, 64);
        }

        ctx.fillStyle = '#967c52';
        ctx.fillRect(0, 18, 64, 4);
        ctx.fillRect(0, 48, 64, 4);

        ctx.fillStyle = '#2e2216';
        ctx.fillRect(0, 56, 64, 8);

        return c;
    },

    createMudFloorTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#241c14';
        ctx.fillRect(0, 0, 128, 128);
        return c;
    },

    createCanopyCeilingTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#0b170c';
        ctx.fillRect(0, 0, 128, 128);
        return c;
    },

    // Ritar ut marken och lövtaket med texturkänsla och djupdimma
    renderFloorAndCeiling: function(ctx, w, h, player) {
        const halfH = h / 2;

        // 1. TAKET: Lövvalv med rörliga bladskuggor när man vrider blicken
        const ceilGrad = ctx.createLinearGradient(0, 0, 0, halfH);
        ceilGrad.addColorStop(0, '#0d1c0f');
        ceilGrad.addColorStop(0.65, '#132615');
        ceilGrad.addColorStop(1, '#050a05');
        ctx.fillStyle = ceilGrad;
        ctx.fillRect(0, 0, w, halfH);

        const angleOffset = (player.angle / (Math.PI * 2)) * w * 2;
        const moveOffset = (player.x + player.y) * 18;

        for (let row = 0; row < halfH - 12; row += 10) {
            const depth = 1 - (row / halfH);
            const alpha = Math.min(0.45, depth * 0.45);
            ctx.fillStyle = `rgba(28, 58, 26, ${alpha})`;

            const step = Math.max(18, Math.floor(65 * depth));
            for (let x = -step; x < w + step; x += step) {
                const shiftX = ((x - angleOffset + moveOffset * depth) % w + w) % w;
                ctx.beginPath();
                ctx.ellipse(shiftX, row, step * 0.45, 6 * depth + 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 2. MARKEN: Lerig djungelstig med grästuvor och rötter
        const floorGrad = ctx.createLinearGradient(0, halfH, 0, h);
        floorGrad.addColorStop(0, '#070a06');
        floorGrad.addColorStop(0.35, '#1f1912');
        floorGrad.addColorStop(1, '#2e2419');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, halfH, w, halfH);

        for (let row = halfH + 10; row < h; row += 8) {
            const depth = (row - halfH) / halfH;
            const step = Math.max(16, Math.floor(80 * depth));
            const rowSeed = row * 13;

            for (let i = 0; i < w / step + 2; i++) {
                const baseX = i * step + (rowSeed % 35);
                const screenX = ((baseX - angleOffset * (0.6 + depth * 0.6) + moveOffset * depth * 2) % w + w) % w;

                if ((i + row) % 3 === 0) {
                    ctx.fillStyle = `rgba(38, 66, 30, ${depth * 0.55})`;
                    ctx.fillRect(screenX, row, 10 * depth + 2, 4 * depth + 1);
                } else {
                    ctx.fillStyle = `rgba(22, 16, 10, ${depth * 0.6})`;
                    ctx.fillRect(screenX, row, 14 * depth + 3, 3 * depth + 1);
                }
            }
        }
    }
};

window.DjungelTextur.init();
