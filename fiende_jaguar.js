// === FIENDEMODUL 2: JAGUARETÉ-AVÁ / MYTISK VARJAGUAR (fiende_jaguar.js) ===
// Registrerar sig i window.EnemyRegistry['jaguar']!
// En skräckinjagande halvmänniska/halvjaguar ur Guaraní-mytologin med lysande gula ögon,
// fläckig päls och blodiga klor.

window.EnemyRegistry = window.EnemyRegistry || {};

window.EnemyRegistry['jaguar'] = {
    name: "Jaguareté-Avá (Varjaguar)",
    defaultHp: 65,
    defaultDmg: 16,
    defaultSpeed: 0.72,
    frames: [],

    init: function() {
        this.frames[0] = this.drawFrame(0); // Smyger 1
        this.frames[1] = this.drawFrame(1); // Smyger 2
        this.frames[2] = this.drawFrame(2); // Klosprång (Attack!)
        this.frames[3] = this.drawFrame(3); // Skadad
    },

    drawFrame: function(pose) {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const ctx = c.getContext('2d');

        const crouch = (pose === 1) ? 3 : (pose === 2 ? -3 : 0);

        // Skugga
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(32, 60, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Muskulös jaguar-kropp och ben
        const furColor = (pose === 3) ? '#ff7043' : '#d48b28';
        ctx.fillStyle = furColor;
        // Bakben
        ctx.fillRect(20, 40 + crouch, 7, 18);
        ctx.fillRect(37, 40 + crouch, 7, 18);
        // Bringa / Torso
        ctx.fillRect(18, 20 + crouch, 28, 23);

        // Ljusare buk
        ctx.fillStyle = '#f0cf85';
        ctx.fillRect(25, 24 + crouch, 14, 16);

        // Svarta jaguar-rosetter (fläckar) på pälsen
        ctx.fillStyle = '#1c1309';
        const spots = [[20,24],[40,25],[21,33],[39,34],[22,44],[39,45],[20,18],[41,18]];
        spots.forEach(([sx, sy]) => {
            ctx.fillRect(sx, sy + crouch, 3, 3);
        });

        // Jaguarhuvud med bakåtstrukna öron och käftar
        ctx.fillStyle = furColor;
        ctx.fillRect(22, 8 + crouch, 20, 14);
        ctx.fillRect(21, 5 + crouch, 5, 4); // Vänster öra
        ctx.fillRect(38, 5 + crouch, 5, 4); // Höger öra

        // Glödande gula rovdjursögon
        ctx.fillStyle = '#ffee58';
        ctx.fillRect(25, 11 + crouch, 4, 3);
        ctx.fillRect(35, 11 + crouch, 4, 3);

        // Öppet vrålande gap med vita huggtänder
        ctx.fillStyle = '#6e1414';
        ctx.fillRect(26, 16 + crouch, 12, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(27, 16 + crouch, 2, 3);
        ctx.fillRect(35, 16 + crouch, 2, 3);

        // Armar & Klor
        ctx.fillStyle = furColor;
        if (pose === 2) {
            // Attack: Klorna utsträckta framåt i ett språng!
            ctx.fillRect(8, 12, 12, 7);
            ctx.fillRect(44, 12, 12, 7);
            ctx.fillStyle = '#ffffff'; // Sylvassa klor
            ctx.fillRect(5, 11, 4, 2); ctx.fillRect(5, 15, 4, 2);
            ctx.fillRect(55, 11, 4, 2); ctx.fillRect(55, 15, 4, 2);
        } else {
            ctx.fillRect(12, 22 + crouch, 6, 15);
            ctx.fillRect(46, 22 + crouch, 6, 15);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(12, 37 + crouch, 5, 2);
            ctx.fillRect(47, 37 + crouch, 5, 2);
        }

        return c;
    },

    getSprite: function(enemy, now) {
        if (enemy.hurtTimer > 0) return this.frames[3];
        if (enemy.attackCooldown > 1.1) return this.frames[2];
        const walkFrame = Math.floor(now / 200) % 2;
        return this.frames[walkFrame];
    }
};

window.EnemyRegistry['jaguar'].init();
