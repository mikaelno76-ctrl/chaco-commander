// === ARTEFAKT- & BONUSMODUL (artefakter.js) ===
// Registrerar alla uppdragsföremål, reliker, ammunitionslådor, Yerba Mate-kit och
// Brasiliansk teknologi (från fort-räder) i window.ArtifactRegistry!
// Varje artefakt har 2 animerade frames (svävande/glimmande) i 64x64 pixelkonst.

window.ArtifactRegistry = window.ArtifactRegistry || {};

window.ArtifactSystem = {
    init: function() {
        this.registerAll();
    },

    registerAll: function() {
        // 1. MYTISK UPPDRAGSRELIK: Tupãs Åsksten / Solsköld
        window.ArtifactRegistry['relic'] = {
            name: "Tupãs Åsksten (Uppdragsrelik)",
            frames: [this.drawRelic(0), this.drawRelic(1)],
            onPickup: function(squad, gameState) {
                if (gameState && gameState.addRelic) {
                    gameState.addRelic({
                        id: 'tupas_thunder',
                        name: 'Tupãs Åsksten',
                        bonus: '+30% Artillerichock & Åskväder i slag.html'
                    });
                }
                squad.addAudioLog("🗿✨ [UPPDRAGSRELIK BÄRGAD!] Tupãs Åsksten pulserar av uråldrig kraft! (+30% Artillerichock i fältslag)", "#ea80fc");
            }
        };

        // 2. AMMUNITION & KRUTKAGGAR
        window.ArtifactRegistry['ammo_crate'] = {
            name: "Krutkagge & Minie-kulor",
            frames: [this.drawAmmoCrate(0), this.drawAmmoCrate(1)],
            onPickup: function(squad, gameState) {
                if (window.VapenSinne) {
                    window.VapenSinne.weapons.rifle.ammo += 10;
                    window.VapenSinne.weapons.pistols.ammo += 12;
                }
                if (gameState && gameState.data && gameState.data.eliteSquad) {
                    gameState.data.eliteSquad.ammo += 10;
                    gameState.save();
                }
                squad.addAudioLog("弹 [AMMUNITION] Ni bröt upp en ammunitionslåda! (+10 Gevärspatroner, +12 Pistolskott)", "#ffe082");
            }
        };

        // 3. BRASILIANSK TEKNOLOGI (Ritningar, Telegrafkoder & Whitworth-sikten från Fort-räd!)
        window.ArtifactRegistry['brazil_tech'] = {
            name: "Brasiliansk Teknologi (Pansarskepps-ritning & Rörsikte)",
            frames: [this.drawBrazilTech(0), this.drawBrazilTech(1)],
            onPickup: function(squad, gameState) {
                squad.members.front.power += 8;
                squad.members.right.power += 6;
                if (gameState && gameState.data) {
                    gameState.data.resources.modern_weapons += 15;
                    gameState.data.resources.gold += 100;
                    gameState.addLog("TEKNOLOGIRÄD: Elitstyrkan stal brasilianska pansarskeppsritningar och brittiska optiska sikten (+15 Moderna Vapen, +100 Guld)!");
                    gameState.save();
                }
                squad.addAudioLog("⚙️🇧🇷 [BRASILIANSK TEKNOLOGI STULEN!] Optiska mässingssikten & hemliga ritningar! (+8 Skada för gruppen, +15 Moderna Vapen till Asunción!)", "#69f0ae");
            }
        };

        // 4. YERBA MATE & FÄLTKIRURGI (Hälsa & Uthållighet för hela Diamantformationen)
        window.ArtifactRegistry['yerba_medkit'] = {
            name: "Yerba Mate & Fältförband",
            frames: [this.drawYerbaKit(0), this.drawYerbaKit(1)],
            onPickup: function(squad, gameState) {
                for (let k in squad.members) {
                    const m = squad.members[k];
                    m.hp = Math.min(m.maxHp, m.hp + 30);
                }
                squad.addAudioLog("🧉❤️ [YERBA MATE & FÖRBAND] Hela patrullen inklusive Bloom återfår +30 HP!", "#b9f6ca");
            }
        };
    },

    getSprite: function(type, now) {
        const entry = window.ArtifactRegistry[type] || window.ArtifactRegistry['relic'];
        const idx = Math.floor((now || performance.now()) / 320) % 2;
        return entry.frames[idx];
    },

    // --- PIXEL ART 1: Uppdragsrelik (Altare med svävande åsksten & guldsol) ---
    drawRelic: function(frame) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');
        const floatY = frame === 1 ? -3 : 0;

        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(32, 58, 16, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Stenpiedestal
        ctx.fillStyle = '#5c5346';
        ctx.fillRect(18, 42, 28, 16);
        ctx.fillStyle = '#786d5c';
        ctx.fillRect(15, 39, 34, 5);

        // Magisk aura
        ctx.fillStyle = frame === 0 ? 'rgba(224, 64, 251, 0.35)' : 'rgba(0, 229, 255, 0.45)';
        ctx.beginPath();
        ctx.arc(32, 24 + floatY, 16, 0, Math.PI * 2);
        ctx.fill();

        // Gyllene solram + kristallkärna
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        ctx.arc(32, 24 + floatY, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#aa00ff';
        ctx.fillRect(28, 20 + floatY, 8, 8);
        return c;
    },

    // --- PIXEL ART 2: Ammunitionslåda & Krutkagge ---
    drawAmmoCrate: function(frame) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.ellipse(32, 58, 18, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Trälåda för gevärspatroner
        ctx.fillStyle = '#6d4c2d';
        ctx.fillRect(12, 36, 30, 20);
        ctx.strokeStyle = '#382513';
        ctx.lineWidth = 2;
        ctx.strokeRect(12, 36, 30, 20);

        // Krutkagge bredvid
        ctx.fillStyle = '#4a3222';
        ctx.fillRect(36, 32, 16, 24);
        ctx.fillStyle = '#9e9e9e'; // Järnband på kaggen
        ctx.fillRect(36, 36, 16, 2);
        ctx.fillRect(36, 48, 16, 2);

        // Blänkande mässingspatroner ovanpå lådan
        ctx.fillStyle = frame === 0 ? '#ffd54f' : '#ffff8d';
        for (let x = 16; x <= 34; x += 5) {
            ctx.fillRect(x, 30, 3, 6);
        }
        return c;
    },

    // --- PIXEL ART 3: Brasiliansk Teknologi (Mässingskugghjul, Telegraf/Kikarsikte & Kejsarritning) ---
    drawBrazilTech: function(frame) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');
        const glow = frame === 1 ? 2 : 0;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath(); ctx.ellipse(32, 58, 18, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Grön/gul kejsardömes-portfölj / instrumentlåda
        ctx.fillStyle = '#1b5e20';
        ctx.fillRect(14, 34, 36, 22);
        ctx.strokeStyle = '#fbc02d';
        ctx.lineWidth = 2;
        ctx.strokeRect(14, 34, 36, 22);

        // Blå teknisk ritning (Blueprint på pansarskepp) som sticker upp
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(18, 20 - glow, 22, 16);
        ctx.strokeStyle = '#b3e5fc';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 22 - glow, 18, 12);

        // Mässingsinstrument / Telegrafspole & Kikarsikte
        ctx.fillStyle = frame === 0 ? '#d4af37' : '#ffe082';
        ctx.beginPath();
        ctx.arc(42, 28 - glow, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#263238';
        ctx.beginPath();
        ctx.arc(42, 28 - glow, 3, 0, Math.PI * 2);
        ctx.fill();

        return c;
    },

    // --- PIXEL ART 4: Yerba Mate Guampa/Bombilla & Fältkirurgväska ---
    drawYerbaKit: function(frame) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');

        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.ellipse(32, 58, 16, 4, 0, 0, Math.PI * 2); ctx.fill();

        // Vit fältkirurgväska med rött kors
        ctx.fillStyle = '#e8e0d5';
        ctx.fillRect(14, 36, 24, 18);
        ctx.fillStyle = '#c62828';
        ctx.fillRect(24, 39, 4, 12);
        ctx.fillRect(20, 43, 12, 4);

        // Yerba Mate-kalebass (Guampa) med silver-bombilla
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.arc(44, 46, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#33691e'; // Grön yerba i toppen
        ctx.fillRect(39, 38, 10, 3);
        ctx.strokeStyle = '#e0e0e0'; // Bombilla-sugrör i silver
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(44, 39);
        ctx.lineTo(50, 26 - (frame * 2));
        ctx.stroke();

        return c;
    }
};

window.ArtifactSystem.init();
