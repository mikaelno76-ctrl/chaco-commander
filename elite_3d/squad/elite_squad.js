// === ELITE SQUAD MODULE: DIAMANT-FORMATIONEN v2 (elite_squad.js) ===

window.EliteSquad = {
    members: {
        front: {
            id: 'front',
            role: 'FRAM (Spjutspets / Du)',
            name: 'Teniente Rojas',
            weapon: 'Machete & Enfield-gevär',
            hp: 100,
            maxHp: 100,
            power: 28,
            cooldown: 0,
            status: 'Spanar framåt',
            flashing: 0
        },
        left: {
            id: 'left',
            role: 'VÄNSTER FLANK (-90°)',
            name: 'Payé Arandú (Schaman)',
            weapon: 'Helig rök & Dubbelpipig hagelbössa',
            hp: 90,
            maxHp: 90,
            power: 22,
            cooldown: 0,
            status: 'Täcker vänster sida',
            flashing: 0
        },
        right: {
            id: 'right',
            role: 'HÖGER FLANK (+90°)',
            name: 'Cabo Villalba (Prickskytt)',
            weapon: 'Whitworth-karbin & Bajonett',
            hp: 95,
            maxHp: 95,
            power: 25,
            cooldown: 0,
            status: 'Täcker höger sida',
            flashing: 0
        },
        back: {
            id: 'back',
            role: 'RYGGVAKT (180° / Bloom)',
            name: 'Sargento "Bloom" Brizuela',
            weapon: 'Järnskodda nävar & Tung machete',
            hp: 125,
            maxHp: 125,
            power: 38,
            cooldown: 0,
            status: 'Håller ryggen fri',
            flashing: 0
        }
    },

    audioLogs: [
        { text: "Tät djungeldimma omsluter patrullen. Håll sektorn framåt, så sköter Bloom ryggen!", color: "#d6e8c5", time: Date.now() }
    ],

    addAudioLog: function(msg, color) {
        this.audioLogs.unshift({ text: msg, color: color || '#d6e8c5', time: Date.now() });
        if (this.audioLogs.length > 8) this.audioLogs.pop();
        this.renderHUD();
    },

    getSectorForAngle: function(relAngle) {
        const deg = relAngle * (180 / Math.PI);
        if (deg >= -45 && deg <= 45) return 'front';
        if (deg < -45 && deg >= -135) return 'left';
        if (deg > 45 && deg <= 135) return 'right';
        return 'back';
    },

    updateSquadCombat: function(dt, player, enemies) {
        for (let k in this.members) {
            const m = this.members[k];
            if (m.cooldown > 0) m.cooldown = Math.max(0, m.cooldown - dt);
            if (m.flashing > 0) m.flashing = Math.max(0, m.flashing - dt);
        }

        enemies.forEach(en => {
            if (en.dead) return;
            const dx = en.x - player.x;
            const dy = en.y - player.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 2.2) {
                let angleToEnemy = Math.atan2(dy, dx) - player.angle;
                while (angleToEnemy > Math.PI) angleToEnemy -= Math.PI * 2;
                while (angleToEnemy < -Math.PI) angleToEnemy += Math.PI * 2;

                const sector = this.getSectorForAngle(angleToEnemy);
                const guard = this.members[sector];

                if (sector !== 'front' && guard.hp > 0 && guard.cooldown <= 0) {
                    guard.cooldown = 1.3;
                    guard.flashing = 0.6;
                    en.hp -= guard.power;
                    en.hurtTimer = 0.3;

                    en.x += Math.cos(Math.atan2(dy, dx)) * 0.35;
                    en.y += Math.sin(Math.atan2(dy, dx)) * 0.35;

                    if (sector === 'back') {
                        if (en.hp <= 0) {
                            en.dead = true;
                            this.addAudioLog("🥊 [BAKIFRÅN - FATALITY!] Bloom fångar en " + en.name + " i mörkret och knäcker ryggraden på den med blotta händerna!", "#ff9e80");
                        } else {
                            this.addAudioLog("🥊 [BAKIFRÅN] Köttiga slag och krasande ben! Bloom pucklar på en " + en.name + " som smög i ryggen!", "#ffd180");
                        }
                    } else if (sector === 'left') {
                        if (en.hp <= 0) {
                            en.dead = true;
                            this.addAudioLog("🔥 [VÄNSTER FLANK] Schamanen Arandú fäller en " + en.name + " med en hagelsalva i dimman!", "#b9f6ca");
                        } else {
                            this.addAudioLog("💨 [VÄNSTER FLANK] Svavelrök och skott! Arandú håller tillbaka " + en.name + " på vänsterkanten!", "#e6ee9c");
                        }
                    } else if (sector === 'right') {
                        if (en.hp <= 0) {
                            en.dead = true;
                            this.addAudioLog("🎯 [HÖGER FLANK] Cabo Villalba sätter ett skott rakt genom pannan på " + en.name + " till höger!", "#b3e5fc");
                        } else {
                            this.addAudioLog("⚔️ [HÖGER FLANK] Stål klingar! Villalba parerar en " + en.name + " på högersidan!", "#80d8ff");
                        }
                    }
                    this.renderHUD();
                }

                if (dist < 1.15 && en.attackCooldown <= 0 && !en.dead) {
                    en.attackCooldown = 1.6;
                    guard.hp = Math.max(0, guard.hp - en.dmg);
                    guard.flashing = 0.8;
                    this.addAudioLog("⚠️ [" + guard.role + "] " + guard.name + " träffas av " + en.name + " (-" + en.dmg + " HP)!", "#ff8a80");
                    this.renderHUD();
                }
            }
        });
    },

    renderHUD: function() {
        const container = document.getElementById('squad-cards');
        if (!container) return;

        container.innerHTML = ['front', 'left', 'right', 'back'].map(key => {
            const m = this.members[key];
            const pct = Math.round((m.hp / m.maxHp) * 100);
            const flashClass = m.flashing > 0 ? 'card-flash' : '';
            return `
                <div class="squad-card ${flashClass}">
                    <div class="card-identity"><div class="card-monogram">${m.name.split(/[\s"()]+/).filter(Boolean).slice(0,2).map(w => w[0]).join('')}</div><div class="card-identity-text"><div class="card-role">${m.role}</div>
                    <div class="card-name">${m.name}</div>
                    <div class="card-weap">${m.weapon}</div></div></div>
                    <div class="hp-bar-bg">
                        <div class="hp-bar-fill" style="width:${pct}%; background:${pct > 50 ? '#55a64e' : '#c93b2b'};"></div>
                    </div>
                    <div style="font-size:0.78rem; display:flex; justify-content:space-between;">
                        <span>HP: <strong>${m.hp}/${m.maxHp}</strong></span>
                        <span style="color:#ffd584;">Styrka: ${m.power}</span>
                    </div>
                </div>
            `;
        }).join('');

        const logEl = document.getElementById('audio-ticker');
        if (logEl) {
            logEl.innerHTML = this.audioLogs.map(item =>
                `<div style="color:${item.color}; margin-bottom:4px;">${item.text}</div>`
            ).join('');
        }
    }
};
