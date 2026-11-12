// === ELITE MELEE: BRUTAL NÄRSTRID v1 ===
// Lost Patrol-stil: plötsliga bakhåll där skjutvapen försvinner.
// Enkel input (punch/kick/block/finish) men extremt visceral och realistiskt gory.

window.EliteMelee = {
    active: false,
    phase: 'idle', // idle | ambush | fighting | finishing | over
    playerHp: 100,
    enemyHp: 100,
    enemy: null,
    lastHit: null,
    bloodLevel: 0,
    shake: 0,
    messages: [],

    // Extremt detaljerade, realistiska träffbeskrivningar
    hitDescriptions: {
        punch_face: [
            "Knogen krossar näsbenet med ett vått knak. Blod och brosk sprutar över handen.",
            "Tänderna lossnar och spottas ut i en röd dimma. Käken hänger snett.",
            "Ögat trycks in. Varm vätska rinner nerför kinden.",
            "Hela ansiktet deformeras under slaget. Näsborrarna spricker."
        ],
        punch_body: [
            "Knogen sjunker djupt i magen. Något spricker inuti. Fienden spyr blod.",
            "Revbenen ger efter med ett torrt knak. Luften pressas ut i en skrikande hostning.",
            "Levern träffas. Fienden bleknar och svajar."
        ],
        kick_groin: [
            "Sparken träffar skrevet. Testiklarna krossas. Ett gurglande skrik.",
            "Knäet i skrevet. Fienden faller dubbelvikt och kräks blod och galla."
        ],
        kick_knee: [
            "Sparken bryter knäskålen bakåt. Benet viker sig i fel vinkel med ett blött knak.",
            "Knäleden exploderar. Benet hänger i senor och hud."
        ],
        machete_slash: [
            "Macheten skär genom kind och käke. Tungan syns genom öppningen. Blod forsar.",
            "Bladet öppnar magen. Tarmar glider ut och hänger mot marken.",
            "Huvudet huggs delvis av. Nacken gapar. Blod sprutar i pulserande skurar.",
            "Handen huggs av vid handleden. Den ligger och rycker på marken medan blod pumpar ut."
        ],
        finish_throat: [
            "Du pressar tummarna in i halsen. Struphuvudet krossas. Fienden kvävs i sitt eget blod.",
            "Macheten sågas genom halsen. Huvudet lossnar delvis. Ögonen rullar fortfarande.",
            "Du biter i halsen och river. Varmt blod fyller munnen. Fienden dör skrikande."
        ],
        finish_eye: [
            "Tummen pressas in i ögonhålan tills det spricker. Fienden skriker och dör.",
            "Du sticker macheten genom ögat in i hjärnan. Kroppen rycker och stillnar."
        ]
    },

    startAmbush: function(soldierId, enemyId) {
        this.active = true;
        this.phase = 'ambush';
        this.bloodLevel = 0;
        this.shake = 0;
        this.messages = [];

        // Hämta soldat från roster
        const soldier = (window.EliteRoster && window.EliteRoster.getById(soldierId)) 
            || { name: "Elitsoldat", hp: 100, portrait: "", fullbody: "" };
        this.player = soldier;
        this.playerHp = soldier.hp || 100;

        // Hämta fiende
        const enemy = (window.EliteEnemies && window.EliteEnemies.getById(enemyId))
            || window.EliteEnemies.getRandom();
        this.enemy = enemy;
        this.enemyHp = enemy.hp || 100;

        this.addMsg("⚠️ BAKHÅLL! Någon kastar sig över " + (victimName || "Bloom") + " bakifrån!", "#ff5252");
        this.addMsg("Skjutvapnen är oanvändbara i närkampen. Bara nävar, machete och desperation.", "#ffcc80");
        this.addMsg("Fienden andas hårt mot nacken. Blodlukt. Nu gäller det.", "#ff8a80");

        this.showUI();
        setTimeout(() => { this.phase = 'fighting'; this.updateUI(); }, 1800);
    },

    addMsg: function(text, color) {
        this.messages.unshift({ text, color: color || '#fff', time: Date.now() });
        if (this.messages.length > 6) this.messages.pop();
    },

    doAction: function(action) {
        if (this.phase !== 'fighting') return;

        const hitChance = action === 'block' ? 0.9 : 0.75;
        const hit = Math.random() < hitChance;

        if (action === 'punch') {
            if (hit) {
                const dmg = 12 + Math.floor(Math.random() * 10);
                this.enemyHp = Math.max(0, this.enemyHp - dmg);
                const desc = this.hitDescriptions.punch_face[Math.floor(Math.random() * this.hitDescriptions.punch_face.length)];
                this.addMsg(desc + " (" + dmg + ")", "#ff6e40");
                this.bloodLevel = Math.min(100, this.bloodLevel + 15);
                this.shake = 8;
            } else {
                this.addMsg("Slaget missar. Fienden duckar och hugger tillbaka.", "#ffcdd2");
                this.takeDamage(8);
            }
        } else if (action === 'kick') {
            if (hit) {
                const dmg = 16 + Math.floor(Math.random() * 12);
                this.enemyHp = Math.max(0, this.enemyHp - dmg);
                const desc = this.hitDescriptions.kick_knee[Math.floor(Math.random() * this.hitDescriptions.kick_knee.length)];
                this.addMsg(desc + " (" + dmg + ")", "#ff3d00");
                this.bloodLevel = Math.min(100, this.bloodLevel + 22);
                this.shake = 12;
            } else {
                this.addMsg("Sparken träffar luft. Fienden hugger dig i sidan.", "#ef9a9a");
                this.takeDamage(12);
            }
        } else if (action === 'machete') {
            if (hit) {
                const dmg = 22 + Math.floor(Math.random() * 15);
                this.enemyHp = Math.max(0, this.enemyHp - dmg);
                const desc = this.hitDescriptions.machete_slash[Math.floor(Math.random() * this.hitDescriptions.machete_slash.length)];
                this.addMsg(desc + " (" + dmg + ")", "#d50000");
                this.bloodLevel = Math.min(100, this.bloodLevel + 30);
                this.shake = 15;
            } else {
                this.addMsg("Macheten fastnar i en gren. Fienden hugger dig över armen.", "#ff8a80");
                this.takeDamage(15);
            }
        } else if (action === 'block') {
            this.addMsg("Du parerar. Blod och svett stänker. Fienden flämtar.", "#90caf9");
            this.takeDamage(3);
        }

        if (this.enemyHp <= 0) {
            this.finishEnemy();
        } else if (this.playerHp <= 0) {
            this.playerDies();
        }

        this.updateUI();
    },

    takeDamage: function(amount) {
        this.playerHp = Math.max(0, this.playerHp - amount);
        this.bloodLevel = Math.min(100, this.bloodLevel + 8);
        this.shake = 10;
    },

    finishEnemy: function() {
        this.phase = 'finishing';
        const finish = this.hitDescriptions.finish_throat[Math.floor(Math.random() * this.hitDescriptions.finish_throat.length)];
        this.addMsg("AVSLUT: " + finish, "#b71c1c");
        this.addMsg("Kroppen rycker. Blodet rinner ut i djungelmyllan. Det är över.", "#7f0000");
        this.bloodLevel = 100;
        setTimeout(() => {
            this.phase = 'over';
            this.active = false;
            this.hideUI();
            if (window.EliteSquad) {
                window.EliteSquad.addAudioLog("Bakhållet avvärjt. " + (this.enemy.name) + " ligger kvar i leran.", "#a5d6a7");
            }
        }, 2500);
    },

    playerDies: function() {
        this.phase = 'over';
        this.addMsg("Du faller. Macheten glider in i magen. Världen blir röd och tyst.", "#b71c1c");
        setTimeout(() => {
            this.active = false;
            this.hideUI();
            if (window.EliteSquad) {
                window.EliteSquad.addAudioLog("Patrullen förlorade en man i bakhållet.", "#ef5350");
            }
        }, 2000);
    },

    showUI: function() {
        let el = document.getElementById('melee-ui');
        if (!el) {
            el = document.createElement('div');
            el.id = 'melee-ui';
            el.style.cssText = `
                position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999;
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                color:#fff; font-family:monospace; text-align:center; padding:20px;
            `;
            document.body.appendChild(el);
        }
        el.style.display = 'flex';
        this.updateUI();
    },

    updateUI: function() {
        const el = document.getElementById('melee-ui');
        if (!el) return;

        const bloodOverlay = `linear-gradient(rgba(120,0,0,${this.bloodLevel/200}), rgba(40,0,0,${this.bloodLevel/300}))`;

        el.innerHTML = `
            <div style="background:${bloodOverlay}; padding:30px; border:3px solid #8b0000; max-width:700px; width:90%;">
                <h2 style="color:#ff1744; margin:0 0 10px;">💀 NÄRSTRID – INGA VAPEN</h2>
                <div style="margin:10px 0; font-size:1.1rem;">
                    Du: <span style="color:#4caf50">${this.playerHp}</span> | 
                    Fiende: <span style="color:#f44336">${this.enemyHp}</span>
                </div>
                <div id="melee-log" style="background:#111; padding:10px; height:160px; overflow-y:auto; text-align:left; font-size:0.9rem; margin:10px 0; border:1px solid #333;">
                    ${this.messages.map(m => `<div style="color:${m.color}; margin:4px 0;">${m.text}</div>`).join('')}
                </div>
                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:15px;">
                    <button onclick="EliteMelee.doAction('punch')" style="padding:12px 20px; background:#b71c1c; color:#fff; border:none; cursor:pointer;">👊 SLAG</button>
                    <button onclick="EliteMelee.doAction('kick')" style="padding:12px 20px; background:#d32f2f; color:#fff; border:none; cursor:pointer;">🦵 SPARK</button>
                    <button onclick="EliteMelee.doAction('machete')" style="padding:12px 20px; background:#8b0000; color:#fff; border:none; cursor:pointer;">🔪 MACHETE</button>
                    <button onclick="EliteMelee.doAction('block')" style="padding:12px 20px; background:#1565c0; color:#fff; border:none; cursor:pointer;">🛡️ PARERA</button>
                </div>
                <div style="margin-top:15px; font-size:0.8rem; color:#ff8a80;">
                    Blodnivå: ${this.bloodLevel}% | Skärmen skakar av varje träff
                </div>
            </div>
        `;

        if (this.shake > 0) {
            el.style.transform = `translate(${(Math.random()-0.5)*this.shake}px, ${(Math.random()-0.5)*this.shake}px)`;
            this.shake = Math.max(0, this.shake - 2);
            setTimeout(() => this.updateUI(), 50);
        }
    },

    hideUI: function() {
        const el = document.getElementById('melee-ui');
        if (el) el.style.display = 'none';
    },

    // Kalla från raycaster när man rör sig
    checkForAmbush: function(moveDistance) {
        if (this.active) return;
        // Låg chans per rörelse, högre i djungel
        const chance = 0.012;
        if (Math.random() < chance && moveDistance > 0.5) {
            const victim = window.EliteSquad ? window.EliteSquad.members.back.name : "ryggvakten";
            this.startAmbush(victim);
        }
    }
};
