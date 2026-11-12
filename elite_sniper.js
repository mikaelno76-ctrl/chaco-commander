// === ELITE SNIPER / CRAWL SEQUENCE v1 ===
// Krypskytte där Elena Villalba får glänsa.
// Lost Patrol-inspirerad: kryp, sikta, skjut, undvik upptäckt.

window.EliteSniper = {
    active: false,
    phase: 'idle', // crawl, aim, shoot, result
    progress: 0,
    detection: 0,
    shots: 0,
    hits: 0,
    maxShots: 3,
    soldier: null,

    start: function(soldierId) {
        this.soldier = (window.EliteRoster && window.EliteRoster.getById(soldierId)) || 
                       { name: 'Elena Villalba', role: 'Prickskytt' };
        this.active = true;
        this.phase = 'crawl';
        this.progress = 0;
        this.detection = 0;
        this.shots = 0;
        this.hits = 0;
        this.showUI();
        this.log('Elena andas långsamt. Geväret är redan laddat.');
        this.log('Hon kryper fram. Varje kvist kan avslöja henne.');
    },

    showUI: function() {
        let ui = document.getElementById('sniper-ui');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'sniper-ui';
            ui.style.cssText = `
                position:fixed; top:0; left:0; width:100%; height:100%;
                background:rgba(0,0,0,0.85); color:#ddd; z-index:9999;
                font-family:monospace; padding:20px; display:flex; flex-direction:column;
            `;
            document.body.appendChild(ui);
        }
        this.updateUI();
    },

    updateUI: function() {
        const ui = document.getElementById('sniper-ui');
        if (!ui) return;
        const s = this.soldier || {};
        ui.innerHTML = `
            <div style="display:flex; gap:20px; height:100%;">
                <div style="flex:1;">
                    <h2 style="color:#c9a227;">KRYPSKYTTE – ${s.name || 'Elena'}</h2>
                    <p>Fas: ${this.phase.toUpperCase()}</p>
                    <p>Framsteg: ${Math.floor(this.progress)}%</p>
                    <p>Upptäckt: ${Math.floor(this.detection)}%</p>
                    <p>Skott: ${this.shots}/${this.maxShots} | Träffar: ${this.hits}</p>
                    <div id="sniper-log" style="margin-top:20px; height:200px; overflow:auto; background:#111; padding:10px;"></div>
                    <div style="margin-top:20px;">
                        ${this.phase === 'crawl' ? '<button onclick="EliteSniper.crawl()">Kryp fram</button>' : ''}
                        ${this.phase === 'aim' ? '<button onclick="EliteSniper.aim()">Sikta</button>' : ''}
                        ${this.phase === 'shoot' ? '<button onclick="EliteSniper.shoot()">Skjut</button>' : ''}
                        <button onclick="EliteSniper.abort()">Avbryt</button>
                    </div>
                </div>
                <div style="width:300px;">
                    <img src="${s.portrait || ''}" style="width:100%; border:2px solid #c9a227;" onerror="this.style.display='none'">
                    <p style="font-size:0.9em; margin-top:10px;">${s.bio || ''}</p>
                </div>
            </div>
        `;
        this.renderLog();
    },

    log: function(msg) {
        if (!this.messages) this.messages = [];
        this.messages.push(msg);
        if (this.messages.length > 8) this.messages.shift();
        this.renderLog();
    },

    renderLog: function() {
        const el = document.getElementById('sniper-log');
        if (el && this.messages) el.innerHTML = this.messages.map(m => `<div>• ${m}</div>`).join('');
    },

    crawl: function() {
        if (this.phase !== 'crawl') return;
        const gain = 15 + Math.random() * 20;
        this.progress += gain;
        this.detection += Math.random() * 8;
        this.log(`Kryper... +${Math.floor(gain)}% framsteg.`);
        if (this.detection > 70) {
            this.log('Någon hörde något...');
        }
        if (this.progress >= 100) {
            this.phase = 'aim';
            this.log('Position nådd. Sikta.');
        }
        this.updateUI();
    },

    aim: function() {
        if (this.phase !== 'aim') return;
        this.phase = 'shoot';
        this.log('Andas ut... sikte låst.');
        this.updateUI();
    },

    shoot: function() {
        if (this.phase !== 'shoot' || this.shots >= this.maxShots) return;
        this.shots++;
        const skill = (this.soldier && this.soldier.skill) || 88;
        const coldBonus = (this.soldier && this.soldier.traits && this.soldier.traits.includes('kall')) ? 0.1 : 0;
        const hitChance = Math.min(0.95, (skill / 100 + coldBonus) * (1 - this.detection / 180));
        const hit = Math.random() < hitChance;
        const dist = 80 + Math.floor(Math.random() * 120);
        if (hit) {
            this.hits++;
            const hits = [
                `Träff i bröstet på ${dist} meter. Han faller utan ett ljud.`,
                `Kulan tar i halsen. Blodet sprutar. Han hinner inte ens skrika.`,
                `Huvudskott. Hjälmen flyger av. Kroppen blir liggande.`,
                `Träff i magen. Han viker sig dubbel och kräks blod.`
            ];
            this.log(hits[Math.floor(Math.random() * hits.length)]);
        } else {
            const misses = [
                'Miss. Kulan slår i en stam och flisorna yr.',
                'För högt. Den visslar över huvudet.',
                'Han rörde sig. Kulan tar i marken framför honom.'
            ];
            this.log(misses[Math.floor(Math.random() * misses.length)]);
            this.detection += 12 + Math.random() * 10;
        }
        if (this.shots >= this.maxShots || this.hits >= 2) {
            this.end();
        } else {
            this.phase = 'crawl';
            this.progress = Math.max(0, this.progress - 20);
            this.log('Ompositionera...');
        }
        this.updateUI();
    },

    end: function() {
        this.phase = 'result';
        const success = this.hits >= 2 && this.detection < 90;
        this.log(success ? 'Uppdraget lyckades. Elena drar sig tillbaka.' : 'Upptäckt. Reträtt under eld.');
        setTimeout(() => {
            this.active = false;
            const ui = document.getElementById('sniper-ui');
            if (ui) ui.remove();
            if (window.EliteRaycaster && window.EliteRaycaster.onSequenceEnd) {
                window.EliteRaycaster.onSequenceEnd(success);
            }
        }, 2500);
    },

    abort: function() {
        this.end();
    }
};
