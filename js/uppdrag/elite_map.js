// === ELITE MAP, ENEMIES & ARTIFACTS MODULE v2 (elite_map.js) ===
// Innehåller minikartan (10x10), väggtyper, fiender och en lista på ARTEFAKTER/BONUSAR (window.ArtifactRegistry)!

window.EliteMap = {
    width: 10,
    height: 10,
    // 0 = Fri stig, 1 = Djungel/Klippa/Kolonialfasad, 2 = Tempelsten/Inkamur/Tegelpalats, 3 = Palisad/Port
    grid: [
        [1, 1, 1, 1, 2, 2, 2, 1, 1, 1],
        [1, 0, 0, 0, 2, 0, 2, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 0, 1, 0, 2, 0, 2, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 3, 0, 1],
        [1, 3, 3, 0, 1, 1, 0, 3, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],

    playerStart: { x: 4.5, y: 8.2, angle: -Math.PI / 2 },

    artifacts: [],
    enemies: [],

    resetEnemies: function() {
        // Utplacerade artefakter och bonusar på kartan!
        this.artifacts = [
            { id: 'a1', type: 'relic',       x: 5.5, y: 1.5, collected: false }, // Uppdragsreliken i templet i norr
            { id: 'a2', type: 'brazil_tech', x: 8.5, y: 4.5, collected: false }, // Brasiliansk teknologi bakom palisaden i öster!
            { id: 'a3', type: 'ammo_crate',  x: 1.5, y: 4.5, collected: false }, // Krutkagge & ammunition i väster
            { id: 'a4', type: 'yerba_medkit',x: 7.5, y: 6.5, collected: false }  // Yerba Mate & fältförband i sydost
        ];

        this.enemies = [
            { id: 1, name: "Odöd Conquistador", type: "skeleton", x: 4.5, y: 4.5, hp: 55, maxHp: 55, dmg: 12, speed: 0.55, dead: false, hurtTimer: 0, attackCooldown: 0 },
            { id: 2, name: "Brasiliansk Lönnmördare", type: "assassin", x: 4.5, y: 8.8, hp: 40, maxHp: 40, dmg: 10, speed: 0.75, dead: false, hurtTimer: 0, attackCooldown: 0 },
            { id: 3, name: "Jaguareté-Avá (Varjaguar)", type: "jaguar", x: 1.5, y: 6.5, hp: 65, maxHp: 65, dmg: 15, speed: 0.70, dead: false, hurtTimer: 0, attackCooldown: 0 },
            { id: 4, name: "Conquistador-Kapten", type: "skeleton", x: 5.5, y: 2.3, hp: 75, maxHp: 75, dmg: 16, speed: 0.50, dead: false, hurtTimer: 0, attackCooldown: 0 }
        ];
    },

    spawnBehindPlayer: function(player) {
        const bx = player.x - Math.cos(player.angle) * 1.7;
        const by = player.y - Math.sin(player.angle) * 1.7;
        this.enemies.push({
            id: Date.now(),
            name: "Smygande Strypare",
            type: "assassin",
            x: bx,
            y: by,
            hp: 38,
            maxHp: 38,
            dmg: 10,
            speed: 0.8,
            dead: false,
            hurtTimer: 0,
            attackCooldown: 0
        });
        window.EliteSquad.addAudioLog("👣 Prassel RAKT BAKOM ER! En fiende rusar mot Blooms ryggsektor!", "#ffab91");
    },

    isWall: function(x, y) {
        const gx = Math.floor(x);
        const gy = Math.floor(y);
        if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return 1;
        return this.grid[gy][gx];
    },

    updateEntities: function(dt, player) {
        this.enemies.forEach(en => {
            if (en.dead) return;
            if (en.hurtTimer > 0) en.hurtTimer = Math.max(0, en.hurtTimer - dt);
            if (en.attackCooldown > 0) en.attackCooldown = Math.max(0, en.attackCooldown - dt);

            const dx = player.x - en.x;
            const dy = player.y - en.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0.85 && dist < 6.5) {
                const vx = (dx / dist) * en.speed * dt;
                const vy = (dy / dist) * en.speed * dt;
                if (this.isWall(en.x + vx, en.y) === 0) en.x += vx;
                if (this.isWall(en.x, en.y + vy) === 0) en.y += vy;
            }
        });

        // Kolla om spelaren plockar upp någon av artefakterna/bonusarna!
        this.artifacts.forEach(art => {
            if (art.collected) return;
            const dist = Math.hypot(player.x - art.x, player.y - art.y);
            if (dist < 0.72) {
                art.collected = true;
                const reg = window.ArtifactRegistry && window.ArtifactRegistry[art.type];
                if (reg && reg.onPickup) {
                    reg.onPickup(window.EliteSquad, window.GameState);
                }
                window.EliteSquad.renderHUD();
            }
        });
    }
};

window.EliteMap.resetEnemies();
