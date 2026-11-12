// === TEXTURE MODULE: SYDAMERIKANSK STADSMILJÖ 1864-1870 (stadstextur.js) ===
// Skapar autentiska 1860-talstexturer för Asunción, Corrientes, Humaitá och Montevideo:
// 1. Vitkalkade kolonialfasader (Adobe) med smidesjärnsgallrade fönster och taktegel.
// 2. 1860-tals tegelarkader och regeringspalats (El Cabildo / Palacio de los López).
// 3. Portar i ädelträ (Quebracho) med mässingsbeslag, lyktor och kullerstensgator!

window.StadsTextur = {
    TEX_SIZE: 64,
    wallCanvases: {},
    ready: false,

    customImageFiles: {
        1: null, // t.ex. 'kolonial_fasad.png'
        2: null, // t.ex. 'tegel_palats.png'
        3: null  // t.ex. 'stadsport_1864.png'
    },

    init: function() {
        this.wallCanvases[1] = this.createColonialFacadeTexture();
        this.wallCanvases[2] = this.createBrickPalaceTexture();
        this.wallCanvases[3] = this.createHeavyGateTexture();

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

    // --- VÄGG 1: Kolonial Adobe-fasad (Asunción/Corrientes 1864) med taktegel & fönstergaller ---
    createColonialFacadeTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        // Varm vitkalkad/gulockra putsad vägg
        ctx.fillStyle = '#dfd3be';
        ctx.fillRect(0, 0, 64, 64);

        // Puts-slitage & krutrök från belägringar
        for (let i = 0; i < 160; i++) {
            const x = (i * 29) % 64;
            const y = (i * 43) % 64;
            ctx.fillStyle = (i % 2 === 0) ? '#cfc1a9' : '#e8decb';
            ctx.fillRect(x, y, 3, 3);
        }

        // Spanskt rött tegeltak (Tejas coloniales) högst upp
        ctx.fillStyle = '#8c3726';
        ctx.fillRect(0, 0, 64, 9);
        for (let tx = 0; tx < 64; tx += 8) {
            ctx.fillStyle = '#a84430';
            ctx.beginPath();
            ctx.arc(tx + 4, 8, 4, Math.PI, 0);
            ctx.fill();
        }

        // Mörkgrå fuktsockel längs kullerstensgatan
        ctx.fillStyle = '#6e6559';
        ctx.fillRect(0, 54, 64, 10);

        // Kolonialt fönster med gröna träfönsterluckor och smidesgaller (Rejas)
        ctx.fillStyle = '#1f3d2b'; // Träram/luckor
        ctx.fillRect(16, 18, 32, 28);
        ctx.fillStyle = '#14181d'; // Mörkt rum innanför
        ctx.fillRect(22, 20, 20, 24);

        // Varmljus från fotogenlampa inifrån fönstret
        ctx.fillStyle = 'rgba(255, 195, 85, 0.35)';
        ctx.fillRect(24, 24, 16, 18);

        // Smidesjärnsgaller (Rejas coloniales)
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1.5;
        for (let gx = 24; gx <= 40; gx += 4) {
            ctx.beginPath();
            ctx.moveTo(gx, 19);
            ctx.lineTo(gx, 45);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(21, 28); ctx.lineTo(43, 28);
        ctx.moveTo(21, 37); ctx.lineTo(43, 37);
        ctx.stroke();

        return c;
    },

    // --- VÄGG 2: 1860-tals Tegelarkad & Fästningsmur (Humaitá / El Cabildo / Arsenalen) ---
    createBrickPalaceTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        // Bränt sydamerikanskt rödtegel
        ctx.fillStyle = '#7a3324';
        ctx.fillRect(0, 0, 64, 64);

        // Kalkbruksfogar
        ctx.strokeStyle = '#9e8f7c';
        ctx.lineWidth = 1;
        for (let y = 0; y < 64; y += 6) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(64, y);
            ctx.stroke();

            const shift = ((y / 6) % 2) * 6;
            for (let x = shift; x < 64; x += 12) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + 6);
                ctx.stroke();
            }
        }

        // Vitkalkade neoklassiska pilastrar på sidorna (typiskt för 1860-talets Asunción)
        ctx.fillStyle = '#d8cbb8';
        ctx.fillRect(0, 0, 8, 64);
        ctx.fillRect(56, 0, 8, 64);

        // Valvbåge och gatlykta i smidesjärn som lyser upp muren
        ctx.fillStyle = '#2b2623';
        ctx.fillRect(28, 22, 8, 12);
        ctx.fillStyle = '#ffcc4d';
        ctx.fillRect(30, 24, 4, 8);

        return c;
    },

    // --- VÄGG 3: Tung Port i Quebracho-trä med mässingsnaglar och kolonial överliggare ---
    createHeavyGateTexture: function() {
        const c = document.createElement('canvas');
        c.width = c.height = this.TEX_SIZE;
        const ctx = c.getContext('2d');

        // Steninfattning runt porten
        ctx.fillStyle = '#bfb29f';
        ctx.fillRect(0, 0, 64, 64);

        // Själva dubbelporten i mörkt Quebracho-trä
        ctx.fillStyle = '#3d2414';
        ctx.fillRect(8, 10, 48, 54);

        // Planklinjer och speglar
        ctx.strokeStyle = '#1f1108';
        ctx.lineWidth = 2;
        ctx.strokeRect(12, 14, 18, 20);
        ctx.strokeRect(34, 14, 18, 20);
        ctx.strokeRect(12, 38, 18, 22);
        ctx.strokeRect(34, 38, 18, 22);

        // Mittspringa mellan porthalvorna
        ctx.beginPath();
        ctx.moveTo(32, 10);
        ctx.lineTo(32, 64);
        ctx.stroke();

        // Mässingsbultar och dörrringar (1860-talsstil)
        ctx.fillStyle = '#c9a23f';
        for (let bx = 14; bx <= 50; bx += 6) {
            ctx.fillRect(bx, 11, 2, 2);
            ctx.fillRect(bx, 35, 2, 2);
        }
        ctx.beginPath();
        ctx.arc(27, 36, 3, 0, Math.PI * 2);
        ctx.arc(37, 36, 3, 0, Math.PI * 2);
        ctx.fill();

        return c;
    },

    // --- MARK & HIMMEL: Kullerstensgator (Empedrado) och 1860-talets kvällshimmel med krutrök ---
    renderFloorAndCeiling: function(ctx, w, h, player) {
        const halfH = h / 2;

        // 1. HIMMEL: Kvällshimmel över staden med silhuetter av kyrktorn/kupoler och kanonrök
        const skyGrad = ctx.createLinearGradient(0, 0, 0, halfH);
        skyGrad.addColorStop(0, '#181424');
        skyGrad.addColorStop(0.6, '#382633');
        skyGrad.addColorStop(1, '#7a4938');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, halfH);

        const angleOffset = (player.angle / (Math.PI * 2)) * w * 2;
        const moveOffset = (player.x + player.y) * 18;

        // Silhuetter av koloniala kyrkokupoler (t.ex. Oratorio de la Virgen / Katedralen i Asunción)
        ctx.fillStyle = '#120e17';
        for (let i = -1; i < 6; i++) {
            const domeX = ((i * 210 - angleOffset * 0.4) % (w + 210) + (w + 210)) % (w + 210) - 80;
            ctx.fillRect(domeX - 30, halfH - 28, 60, 28);
            ctx.beginPath();
            ctx.arc(domeX, halfH - 28, 24, Math.PI, 0);
            ctx.fill();
            // Kyrktorn bredvid kupolen
            ctx.fillRect(domeX + 28, halfH - 48, 12, 48);
        }

        // 2. MARKEN: Kullerstensgata (Empedrado colonial) och röd jord med gatlyktors sken
        const floorGrad = ctx.createLinearGradient(0, halfH, 0, h);
        floorGrad.addColorStop(0, '#241c18');
        floorGrad.addColorStop(0.4, '#3d332c');
        floorGrad.addColorStop(1, '#52463d');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, halfH, w, halfH);

        for (let row = halfH + 8; row < h; row += 7) {
            const depth = (row - halfH) / halfH;
            const step = Math.max(14, Math.floor(64 * depth));
            const rowSeed = row * 19;

            for (let i = 0; i < w / step + 2; i++) {
                const baseX = i * step + (rowSeed % 24);
                const screenX = ((baseX - angleOffset * (0.6 + depth * 0.6) + moveOffset * depth * 2) % w + w) % w;

                // Kullerstenar (ljusa/mörka stenblock i rader)
                ctx.fillStyle = ((i + row) % 2 === 0)
                    ? `rgba(110, 98, 86, ${depth * 0.55})`
                    : `rgba(38, 30, 24, ${depth * 0.65})`;
                ctx.fillRect(screenX, row, 11 * depth + 2, 4 * depth + 1);
            }
        }
    }
};

window.StadsTextur.init();
