// === FIENDEMODUL 3: BRASILIANSK SMYGANDE LÖNNMÖRDARE / SPEJARE (fiende_lonnmordare.js) ===
// Registrerar sig i window.EnemyRegistry['assassin']!
// Klädd i mörk poncho, bredbrättad hatt och beväpnad med lång kniv (Facón) och pistol.

window.EnemyRegistry = window.EnemyRegistry || {};

window.EnemyRegistry['assassin'] = {
    name: "Brasiliansk Lönnmördare",
    defaultHp: 42,
    defaultDmg: 11,
    defaultSpeed: 0.80,
    frames: [],

    init: function() {
        this.frames[0] = this.drawFrame(0); // Smyger 1
        this.frames[1] = this.drawFrame(1); // Smyger 2
        this.frames[2] = this.drawFrame(2); // Knivhugg / Pistolskott
        this.frames[3] = this.drawFrame(3); // Skadad
    },

    drawFrame: function(pose) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');

        const bob = (pose === 1) ? 2 : 0;
        const stride = (pose === 0) ? -2 : 2;

        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(32, 60, 13, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mörka byxor och stövlar
        ctx.fillStyle = '#1f2b38';
        ctx.fillRect(24 + stride, 42, 6, 16);
        ctx.fillRect(34 - stride, 42, 6, 16);

        // Mörkgrön/svart 1860-tals poncho med ränder
        ctx.fillStyle = (pose === 3) ? '#c62828' : '#1b3626';
        ctx.beginPath();
        ctx.moveTo(16, 44 + bob);
        ctx.lineTo(22, 18 + bob);
        ctx.lineTo(42, 18 + bob);
        ctx.lineTo(48, 44 + bob);
        ctx.closePath();
        ctx.fill();

        // Gula/gröna kejsardömes-detaljer på ponchon
        ctx.fillStyle = '#c9a227';
        ctx.fillRect(24, 22 + bob, 2, 20);
        ctx.fillRect(38, 22 + bob, 2, 20);

        // Ansikte i skugga + röd snusnäsduk/mask över munnen
        ctx.fillStyle = '#c49a76';
        ctx.fillRect(26, 10 + bob, 12, 8);
        ctx.fillStyle = '#8f1d1d';
        ctx.fillRect(25, 14 + bob, 14, 5);
        // Smala vaksamma ögon
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(27, 12 + bob, 3, 2);
        ctx.fillRect(34, 12 + bob, 3, 2);

        // Bredbrättad sydamerikansk slokhatt
        ctx.fillStyle = '#241c15';
        ctx.fillRect(18, 8 + bob, 28, 3);
        ctx.fillRect(24, 3 + bob, 16, 6);

        // Vapen: Lång gaucho-kniv (Facón) som blänker
        if (pose === 2) {
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(44, 18, 15, 3);
            ctx.fillStyle = '#ffd54f';
            ctx.fillRect(42, 16, 3, 7);
        } else {
            ctx.fillStyle = '#cfd8dc';
            ctx.fillRect(45, 28 + bob, 10, 3);
        }

        return c;
    },

    getSprite: function(enemy, now) {
        if (enemy.hurtTimer > 0) return this.frames[3];
        if (enemy.attackCooldown > 1.1) return this.frames[2];
        const walkFrame = Math.floor(now / 220) % 2;
        return this.frames[walkFrame];
    }
};

window.EnemyRegistry['assassin'].init();
