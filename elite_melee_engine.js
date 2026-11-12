// === ELITE MELEE ENGINE v2 ===
// Lost Patrol-stil närstrid. Enkel input, råa konsekvenser.
// Canvas-blod, skakningar, detaljerade skador.
// Importera och anropa EliteMeleeEngine.start(playerId, enemyId)

window.EliteMeleeEngine = {
    active: false,
    canvas: null,
    ctx: null,
    player: null,
    enemy: null,
    playerHp: 100,
    enemyHp: 100,
    blood: [],
    shake: 0,
    log: [],
    turn: 'player',
    round: 0,

    start: function(playerId, enemyId) {
        this.player = (window.EliteRoster && window.EliteRoster.getCombatant(playerId)) || { name: 'Elitsoldat', hp: 110, fullbody: '' };
        this.enemy = (window.EliteEnemies && window.EliteEnemies.getById(enemyId)) || { name: 'Fiende', hp: 100, fullbody: '' };
        this.playerHp = this.player.hp || 100;
        this.enemyHp = this.enemy.hp || 100;
        this.blood = [];
        this.shake = 0;
        this.log = [];
        this.turn = 'player';
        this.round = 1;
        this.active = true;

        this.createUI();
        this.addLog(`${this.enemy.name} kastar sig över dig bakifrån. Gevären faller. Bara knivar och nävar.`);
        this.loop();
    },

    createUI: function() {
        let root = document.getElementById('melee-root');
        if (root) root.remove();
        root = document.createElement('div');
        root.id = 'melee-root';
        root.style.cssText = 'position:fixed;inset:0;background:#000;z-index:10000;color:#ccc;font-family:monospace;display:flex;flex-direction:column;';
        root.innerHTML = `
            <canvas id="melee-canvas" style="flex:1;width:100%;background:#111;"></canvas>
            <div id="melee-hud" style="padding:12px;background:#0a0a0a;border-top:1px solid #333;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span>${this.player.name}: <b id="p-hp">${this.playerHp}</b></span>
                    <span>${this.enemy.name}: <b id="e-hp">${this.enemyHp}</b></span>
                </div>
                <div id="melee-log" style="height:90px;overflow:auto;background:#000;padding:6px;font-size:13px;line-height:1.4;"></div>
                <div id="melee-actions" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;"></div>
            </div>
        `;
        document.body.appendChild(root);
        this.canvas = document.getElementById('melee-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.updateActions();
    },

    resize: function() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
    },

    updateActions: function() {
        const el = document.getElementById('melee-actions');
        if (!el || this.turn !== 'player') { if (el) el.innerHTML = ''; return; }
        el.innerHTML = `
            <button onclick="EliteMeleeEngine.act('punch')">Slag</button>
            <button onclick="EliteMeleeEngine.act('kick')">Spark</button>
            <button onclick="EliteMeleeEngine.act('machete')">Machete</button>
            <button onclick="EliteMeleeEngine.act('parry')">Parera</button>
        `;
    },

    act: function(type) {
        if (!this.active || this.turn !== 'player') return;
        this.resolvePlayer(type);
        if (this.enemyHp > 0 && this.playerHp > 0) {
            this.turn = 'enemy';
            setTimeout(() => this.enemyTurn(), 700);
        } else {
            this.end();
        }
    },

    resolvePlayer: function(type) {
        let dmg = 0, text = '';
        const skill = this.player.skill || 75;
        const hit = Math.random() < (skill / 100 + 0.15);

        if (type === 'punch') {
            dmg = hit ? 8 + Math.floor(Math.random() * 10) : 0;
            text = hit ? this.punchText() : 'Slaget missar. Han duckar.';
        } else if (type === 'kick') {
            dmg = hit ? 12 + Math.floor(Math.random() * 12) : 0;
            text = hit ? this.kickText() : 'Sparken träffar luften.';
        } else if (type === 'machete') {
            dmg = hit ? 18 + Math.floor(Math.random() * 16) : 0;
            text = hit ? this.macheteText() : 'Bladet skär bara i jackan.';
        } else if (type === 'parry') {
            this.parrying = true;
            text = 'Du höjer armarna och tar emot.';
            dmg = 0;
        }

        if (dmg > 0) {
            this.enemyHp = Math.max(0, this.enemyHp - dmg);
            this.spawnBlood(dmg);
            this.shake = Math.min(18, dmg);
        }
        this.addLog(text);
        this.updateHUD();
    },

    enemyTurn: function() {
        if (!this.active) return;
        const types = ['punch', 'kick', 'machete'];
        const type = types[Math.floor(Math.random() * types.length)];
        let dmg = 6 + Math.floor(Math.random() * 14);
        if (this.parrying) {
            dmg = Math.floor(dmg * 0.4);
            this.addLog('Du parerar det mesta. Smällen landar ändå.');
            this.parrying = false;
        } else {
            this.addLog(this.enemyHitText(type));
        }
        this.playerHp = Math.max(0, this.playerHp - dmg);
        this.spawnBlood(dmg * 0.7);
        this.shake = Math.min(14, dmg);
        this.updateHUD();
        this.turn = 'player';
        this.round++;
        this.updateActions();
        if (this.playerHp <= 0 || this.enemyHp <= 0) this.end();
    },

    punchText: function() {
        const t = [
            'Näven landar i käken. Tänder spricker. Han spottar blod och emalj.',
            'Du träffar näsan. Brosket krossas. Blodet rinner rakt ner i munnen på honom.',
            'Hårt slag mot tinningen. Ögat svullnar omedelbart.',
            'Du krossar läppen mot tänderna. Blod och saliv flyger.'
        ];
        return t[Math.floor(Math.random() * t.length)];
    },

    kickText: function() {
        const t = [
            'Sparken tar i knäet. Det ger ifrån sig ett torrt knak. Han faller.',
            'Du sparkar honom i revbenen. Något knäcks. Han kippar efter luft.',
            'Spark i skrevet. Han viker sig och kräks.',
            'Hård spark mot höften. Han snubblar och tar emot med händerna.'
        ];
        return t[Math.floor(Math.random() * t.length)];
    },

    macheteText: function() {
        const t = [
            'Macheten hugger djupt i underarmen. Senor syns. Blodet sprutar i pulser.',
            'Du skär upp magen. Tarmarna tränger fram. Han försöker hålla ihop det.',
            'Bladet tar i sidan av halsen. Blodet sprutar i en båge.',
            'Du hugger i låret. Muskeln öppnas. Han skriker och faller på knä.',
            'Macheten klyver kinden. Tänder och käkben syns.'
        ];
        return t[Math.floor(Math.random() * t.length)];
    },

    enemyHitText: function(type) {
        if (type === 'machete') return 'Hans machete skär dig över bröstet. Skjortan färgas röd omedelbart.';
        if (type === 'kick') return 'Han sparkar dig i magen. Du tappar luften och smakar blod.';
        return 'Hans näve träffar dig hårt i ansiktet. Du ser stjärnor.';
    },

    spawnBlood: function(amount) {
        for (let i = 0; i < amount * 2; i++) {
            this.blood.push({
                x: this.canvas.width * 0.4 + Math.random() * this.canvas.width * 0.2,
                y: this.canvas.height * 0.4 + Math.random() * 80,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * -6 - 2,
                life: 40 + Math.random() * 40,
                size: 2 + Math.random() * 5
            });
        }
    },

    addLog: function(msg) {
        this.log.push(msg);
        if (this.log.length > 6) this.log.shift();
        const el = document.getElementById('melee-log');
        if (el) el.innerHTML = this.log.map(m => `<div>• ${m}</div>`).join('');
    },

    updateHUD: function() {
        const p = document.getElementById('p-hp');
        const e = document.getElementById('e-hp');
        if (p) p.textContent = Math.max(0, Math.floor(this.playerHp));
        if (e) e.textContent = Math.max(0, Math.floor(this.enemyHp));
    },

    loop: function() {
        if (!this.active) return;
        this.draw();
        requestAnimationFrame(() => this.loop());
    },

    draw: function() {
        if (!this.ctx) return;
        const w = this.canvas.width, h = this.canvas.height;
        this.ctx.fillStyle = '#0c0c0c';
        this.ctx.fillRect(0, 0, w, h);

        // Shake
        this.ctx.save();
        if (this.shake > 0) {
            this.ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
            this.shake *= 0.85;
        }

        // Simple figures (placeholder for fullbody images)
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(w * 0.25, h * 0.35, 80, 160);
        this.ctx.fillRect(w * 0.6, h * 0.35, 80, 160);
        this.ctx.fillStyle = '#888';
        this.ctx.font = '14px monospace';
        this.ctx.fillText(this.player.name, w * 0.25, h * 0.32);
        this.ctx.fillText(this.enemy.name, w * 0.6, h * 0.32);

        // Blood particles
        this.blood.forEach((b, i) => {
            b.x += b.vx;
            b.y += b.vy;
            b.vy += 0.3;
            b.life--;
            this.ctx.fillStyle = `rgba(140,10,10,${b.life / 80})`;
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            this.ctx.fill();
            if (b.life <= 0) this.blood.splice(i, 1);
        });

        this.ctx.restore();
    },

    end: function() {
        this.active = false;
        const win = this.enemyHp <= 0;
        this.addLog(win ? 'Han rör sig inte längre. Du står kvar, andfådd och blodig.' : 'Du faller. Mörkret kommer.');
        setTimeout(() => {
            const root = document.getElementById('melee-root');
            if (root) root.remove();
            if (window.EliteRaycaster && window.EliteRaycaster.onMeleeEnd) {
                window.EliteRaycaster.onMeleeEnd(win);
            }
        }, 2800);
    }
};
