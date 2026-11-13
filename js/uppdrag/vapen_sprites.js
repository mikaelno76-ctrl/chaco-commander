// === FÖRSTAPERSONSVAPEN & ANIMATIONSMODUL (vapen_sprites.js) ===
// Hanterar spelarens (Spjutspetsens) 3 vapen som riktas framåt:
// [1] TUNG PARAGUAYANSK MACHETE (Närstrid, oändlig, 4-frames hugg-animation med blodstänk)
// [2] ENFIELD / WHITWORTH RÄFFLAT GEVÄR (Långdistans, mässing & valnötsträ, mynningseld & krutrök)
// [3] DUBBLA KAVALLERI-REVOLVRAR (Snabbeld med växelvis vänster/höger pipa!)

window.VapenSinne = {
    currentKey: 'rifle',
    animTimer: 0,
    animDuration: 0.35,
    altBarrel: 0, // Växlar vänster/höger pistol

    weapons: {
        machete: {
            key: 'machete',
            slot: '1',
            name: 'Tung Acá Carayá-Machete',
            range: 2.3,
            spread: 0.45,
            dmgBonus: 8,
            ammo: Infinity,
            cooldown: 0.32
        },
        rifle: {
            key: 'rifle',
            slot: '2',
            name: 'Enfield M1853 Gevär',
            range: 6.5,
            spread: 0.28,
            dmgBonus: 0,
            ammo: 24,
            cooldown: 0.42
        },
        pistols: {
            key: 'pistols',
            slot: '3',
            name: 'Dubbla Lefaucheux-Revolvrar',
            range: 4.8,
            spread: 0.35,
            dmgBonus: -4,
            ammo: 30,
            cooldown: 0.18
        }
    },

    selectWeapon: function(key) {
        if (!this.weapons[key]) return;
        this.currentKey = key;
        this.animTimer = 0;
        if (window.EliteSquad) {
            window.EliteSquad.addAudioLog("🗡️ Växlade vapen till: " + this.weapons[key].name, "#b3e5fc");
        }
    },

    getCurrent: function() {
        return this.weapons[this.currentKey];
    },

    canFire: function() {
        const w = this.getCurrent();
        if (this.animTimer > 0) return false;
        if (w.ammo <= 0) {
            if (window.EliteSquad) {
                window.EliteSquad.addAudioLog("⚠️ Slut på ammunition till " + w.name + "! Växlar till Machete (Tryck 1)!", "#ff8a80");
            }
            this.currentKey = 'machete';
            return true;
        }
        return true;
    },

    triggerAttack: function() {
        const w = this.getCurrent();
        this.animDuration = w.cooldown;
        this.animTimer = w.cooldown;
        if (w.ammo !== Infinity) w.ammo--;
        this.altBarrel = 1 - this.altBarrel;
        return w;
    },

    update: function(dt) {
        if (this.animTimer > 0) {
            this.animTimer = Math.max(0, this.animTimer - dt);
        }
    },

    // Ritar det valda vapnet med detaljtextur och flerstegsanimation längst ner i 3D-vyn
    renderFirstPersonWeapon: function(ctx, w, h, bobPhase) {
        const weap = this.getCurrent();
        const bobX = Math.cos(bobPhase) * 8;
        const bobY = Math.abs(Math.sin(bobPhase)) * 6;

        // Hur långt i attackanimationen vi är (0 = vila, 0.01..1.0 = aktiv attack)
        const progress = this.animTimer > 0 ? (1 - this.animTimer / this.animDuration) : 0;

        ctx.save();

        if (this.currentKey === 'machete') {
            this.drawMacheteAnim(ctx, w, h, bobX, bobY, progress);
        } else if (this.currentKey === 'rifle') {
            this.drawRifleAnim(ctx, w, h, bobX, bobY, progress);
        } else if (this.currentKey === 'pistols') {
            this.drawDualPistolsAnim(ctx, w, h, bobX, bobY, progress);
        }

        // Rita vapen- & ammunitions-status nere i högra hörnet av 3D-skärmen
        ctx.fillStyle = 'rgba(16, 22, 16, 0.82)';
        ctx.fillRect(w - 235, h - 38, 225, 30);
        ctx.strokeStyle = '#8ab068';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w - 235, h - 38, 225, 30);

        ctx.fillStyle = '#fff3cf';
        ctx.font = 'bold 12px Georgia';
        ctx.textAlign = 'left';
        const ammoStr = weap.ammo === Infinity ? '∞' : weap.ammo;
        ctx.fillText(`[${weap.slot}] ${weap.name} | Skott: ${ammoStr}`, w - 226, h - 19);

        ctx.restore();
    },

    // --- VAPEN 1: TUNG PARAGUAYANSK MACHETE (Med svingbåge & stålblänk) ---
    drawMacheteAnim: function(ctx, w, h, bobX, bobY, progress) {
        let pivotX = w * 0.68 + bobX;
        let pivotY = h - 15 + bobY;
        let angle = -0.25;

        if (progress > 0) {
            if (progress < 0.35) {
                // Fas 1: Lyfter macheten högt för hugg
                angle = -0.65;
                pivotY -= 25;
            } else if (progress < 0.75) {
                // Fas 2: Brutalt diagonalt hugg över skärmen!
                angle = -1.35;
                pivotX -= 95;
                pivotY += 15;

                // Rita vit/röd hugg-båge (Slash trail) i luften
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(w / 2, h / 2 + 20, 90, -0.8, 0.5);
                ctx.stroke();
            } else {
                // Fas 3: Återgång
                angle = -0.45;
                pivotX -= 30;
            }
        }

        ctx.translate(pivotX, pivotY);
        ctx.rotate(angle);

        // Hand & Uniformsärm (Paraguayansk röd rockärm)
        ctx.fillStyle = '#9e241b';
        ctx.fillRect(-16, -10, 34, 45);
        ctx.fillStyle = '#d4a373'; // Hand
        ctx.fillRect(-14, -28, 28, 22);

        // Machetens trähandtag med mässingsnitar
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(-9, -46, 18, 28);
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(-12, -48, 24, 5); // Parerstång i mässing

        // Själva machete-bladet (Breddat mot spetsen, stålspegling & blodränna)
        ctx.fillStyle = '#b0bec5';
        ctx.beginPath();
        ctx.moveTo(-7, -48);
        ctx.lineTo(-12, -165);
        ctx.lineTo(4, -182);
        ctx.lineTo(11, -155);
        ctx.lineTo(8, -48);
        ctx.closePath();
        ctx.fill();

        // Slipad glänsande egg
        ctx.fillStyle = '#eceff1';
        ctx.beginPath();
        ctx.moveTo(-11, -162);
        ctx.lineTo(4, -182);
        ctx.lineTo(9, -155);
        ctx.lineTo(5, -48);
        ctx.lineTo(1, -48);
        ctx.closePath();
        ctx.fill();
    },

    // --- VAPEN 2: ENFIELD / WHITWORTH RÄFFLAT GEVÄR (Valnötskolv, mässingsbeslag, rekyl & rök) ---
    drawRifleAnim: function(ctx, w, h, bobX, bobY, progress) {
        let recoilY = 0;
        let recoilX = 0;

        if (progress > 0) {
            if (progress < 0.25) {
                // Mynningsflamma & eldklot!
                recoilY = 38;
                recoilX = 6;
                const fx = w / 2 + 22 + bobX;
                const fy = h - 135 + bobY;

                const grad = ctx.createRadialGradient(fx, fy, 4, fx, fy, 48);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.35, '#ffeb3b');
                grad.addColorStop(0.7, '#ff5722');
                grad.addColorStop(1, 'rgba(255,87,34,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(fx, fy, 48, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Rekyl-återhämtning & stigande krutrök
                recoilY = (1 - progress) * 32;
                const smokeY = h - 135 - (progress * 55);
                ctx.fillStyle = `rgba(200, 200, 200, ${(1 - progress) * 0.55})`;
                ctx.beginPath();
                ctx.arc(w / 2 + 22 + bobX, smokeY, 18 + progress * 20, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const bx = w / 2 + 20 + bobX + recoilX;
        const by = h + bobY + recoilY;

        // Gevärspipa i blånerat stål (siktar in mot skärmens mitt)
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.moveTo(bx - 6, by - 145);
        ctx.lineTo(bx + 8, by - 145);
        ctx.lineTo(bx + 26, by - 55);
        ctx.lineTo(bx + 2, by - 55);
        ctx.closePath();
        ctx.fill();

        // Ljusreflektion längs pipan + korn längst fram
        ctx.fillStyle = '#78909c';
        ctx.fillRect(bx - 1, by - 145, 3, 90);
        ctx.fillStyle = '#ffd54f'; // Mässingskorn
        ctx.fillRect(bx, by - 150, 3, 6);

        // Mässingsband som håller pipan
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(bx - 4, by - 120, 14, 4);
        ctx.fillRect(bx, by - 88, 18, 4);

        // Slaglås & Hane (Slår ner vid skott!)
        ctx.fillStyle = '#90a4ae';
        const hammerDrop = (progress > 0 && progress < 0.5) ? 8 : 0;
        ctx.fillRect(bx + 18, by - 78 + hammerDrop, 8, 14);

        // Valnötskolv med träådring
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.moveTo(bx - 2, by - 95);
        ctx.lineTo(bx + 22, by - 95);
        ctx.lineTo(bx + 54, by);
        ctx.lineTo(bx + 8, by);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.moveTo(bx + 4, by - 85);
        ctx.lineTo(bx + 14, by - 85);
        ctx.lineTo(bx + 40, by);
        ctx.lineTo(bx + 26, by);
        ctx.closePath();
        ctx.fill();
    },

    // --- VAPEN 3: DUBBLA KAVALLERI-REVOLVRAR (Växelvis eldgivning vänster/höger) ---
    drawDualPistolsAnim: function(ctx, w, h, bobX, bobY, progress) {
        const leftFiring = (progress > 0 && this.altBarrel === 1);
        const rightFiring = (progress > 0 && this.altBarrel === 0);

        this.drawSingleRevolver(ctx, w * 0.34 + bobX, h + bobY, -1, leftFiring ? progress : 0);
        this.drawSingleRevolver(ctx, w * 0.66 + bobX, h + bobY, 1, rightFiring ? progress : 0);
    },

    drawSingleRevolver: function(ctx, x, y, side, progress) {
        const recY = (progress > 0 && progress < 0.4) ? 26 : 0;
        const py = y + recY;

        if (progress > 0 && progress < 0.25) {
            ctx.fillStyle = 'rgba(255, 215, 64, 0.85)';
            ctx.beginPath();
            ctx.arc(x, py - 115, 30, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pipa & Trumma (Cylinder)
        ctx.fillStyle = '#455a64';
        ctx.fillRect(x - 6, py - 112, 12, 48);
        ctx.fillStyle = '#263238';
        ctx.fillRect(x - 10, py - 76, 20, 22); // Revolvertrumma
        ctx.fillStyle = '#cfd8dc';
        ctx.fillRect(x - 2, py - 112, 3, 45);

        // Kolv & Hand
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(x - 9 + (side * 4), py - 56, 18, 56);
        ctx.fillStyle = '#d4af37'; // Mässingsknopp
        ctx.fillRect(x - 9 + (side * 4), py - 16, 18, 6);
    }
};
