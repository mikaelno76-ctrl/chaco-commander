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

    startAmbush: function(victimName) {
        this.active = true;
        this.phase = 'ambush';
        this.playerHp = 100;
        this.enemyHp = 100;
        this.bloodLevel = 0;
        this.shake = 0;
        this.messages = [];
        this.enemy = {
            name: "Brasiliansk jägarscout",
            weapon: "Machete & bajonett"
        };

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

    // Grafik v2: filmisk miljö, responsiv HUD och verkliga klickbara kontroller.
    _uiStyles: function() {
        if (document.getElementById('elite-melee-v2-style')) return;
        const css = document.createElement('style');
        css.id = 'elite-melee-v2-style';
        css.textContent = `
          #melee-ui {position:fixed;inset:0;z-index:9999;display:flex;align-items:stretch;justify-content:center;background:#070a08;color:#f5e9d1;font-family:Georgia,serif;padding:0;isolation:isolate;overflow:auto;}
          #melee-ui *{box-sizing:border-box}
          #melee-ui .em-scene{position:absolute;inset:0;background-image:linear-gradient(180deg,rgba(5,8,8,.8),transparent 30%,rgba(7,8,7,.10) 51%,rgba(5,7,5,.88) 91%),url('assets/melee_jungle.jpg');background-position:center;background-size:cover;filter:saturate(.91) contrast(1.09);z-index:-2;}
          #melee-ui .em-scene:after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse,transparent 28%,rgba(0,0,0,.62) 100%);pointer-events:none;}
          #melee-ui .em-vignette{position:absolute;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.48) 100%)}
          #melee-ui .em-frame{width:min(100%,1800px);min-height:100dvh;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(12px,2.3vw,35px);gap:18px}
          #melee-ui .em-title{background:linear-gradient(90deg,transparent,#171914ef 19%,#171914f5 81%,transparent);width:min(640px,100%);align-self:center;text-align:center;color:#f8e4ab;letter-spacing:.16em;font-weight:bold;font-size:clamp(18px,2.4vw,33px);padding:13px 10px;border-bottom:2px solid #ab8548;text-shadow:0 3px 8px #000;}
          #melee-ui .em-heading{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:15px;align-items:start}
          #melee-ui .em-hud{background:linear-gradient(110deg,rgba(10,16,13,.93),rgba(10,14,12,.66));border:1px solid #96784b;box-shadow:0 4px 20px #000b,inset 0 0 0 2px #2c241a;padding:12px 15px;max-width:400px;min-width:0}
          #melee-ui .em-hud.enemy{justify-self:end;width:100%;text-align:right;}
          #melee-ui .em-label{font-size:12px;letter-spacing:.23em;color:#dcc393;text-transform:uppercase}
          #melee-ui .em-name{font-size:clamp(15px,1.7vw,22px);margin:5px 0 10px;text-shadow:1px 2px 4px #000;}
          #melee-ui .em-hp{height:14px;position:relative;background:#211716;border:1px solid #a37d47;box-shadow:inset 0 2px 7px #000;border-radius:2px;overflow:hidden}
          #melee-ui .em-hp-fill{height:100%;background:linear-gradient(180deg,#dd6555,#911c22 66%,#541319);transition:width .4s ease}
          #melee-ui .em-hp-text{font-size:13px;color:#f1dcc1;margin-top:4px;font-variant-numeric:tabular-nums}
          #melee-ui .em-bottom{margin-top:auto;display:grid;grid-template-columns:minmax(240px,375px) minmax(0,1fr);gap:18px;align-items:end}
          #melee-ui .em-log{background:linear-gradient(120deg,rgba(10,15,13,.96),rgba(11,12,11,.88));border:1px solid #b28c4c;box-shadow:0 7px 25px #000b,inset 0 0 0 3px #242019;padding:14px 15px;min-height:170px;}
          #melee-ui .em-log-title{font-size:17px;letter-spacing:.09em;color:#f2d69d;border-bottom:1px solid #735a35;padding-bottom:8px;margin-bottom:10px}
          #melee-ui .em-entries{max-height:168px;overflow:auto;display:grid;gap:8px;font-size:clamp(12px,1.15vw,15px);line-height:1.35}
          #melee-ui .em-entry{padding:5px 4px;border-left:2px solid #78613a;padding-left:10px;background:#04070755}
          #melee-ui .em-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
          #melee-ui .em-action{min-width:0;min-height:105px;padding:10px 4px;color:#f3dfaa;background:linear-gradient(145deg,#24332b,#0d1713 65%,#2b2417);border:2px solid #b28b52;border-radius:4px;font:700 clamp(12px,1.7vw,21px) Georgia,serif;letter-spacing:.06em;cursor:pointer;box-shadow:inset 0 0 0 3px #1b1d17,0 6px 13px #000a;text-shadow:1px 2px 3px #000;transition:transform .13s,filter .13s,box-shadow .13s}
          #melee-ui .em-action span{display:block;font-size:clamp(25px,3vw,38px);margin-bottom:8px}
          #melee-ui .em-action:hover:not(:disabled),#melee-ui .em-action:focus-visible{transform:translateY(-4px);filter:brightness(1.22);outline:2px solid #ead49b;outline-offset:2px}
          #melee-ui .em-action:active:not(:disabled){transform:translateY(2px)}
          #melee-ui .em-action.machete{background:linear-gradient(135deg,#632521,#230c0d 75%);border-color:#dcac6d}
          #melee-ui .em-action:disabled{opacity:.55;cursor:default}
          #melee-ui .em-status{text-align:right;font-size:12px;margin-top:8px;letter-spacing:.08em;color:#dec49d;text-shadow:1px 2px 4px #000}
          #melee-ui .em-hit{animation:em-hit .28s ease-out}
          @keyframes em-hit{0%{filter:brightness(1.9);transform:translateX(-5px)}35%{transform:translateX(5px)}70%{transform:translateX(-3px)}100%{filter:brightness(1);transform:none}}
          @media(max-width:800px){#melee-ui .em-frame{gap:8px}#melee-ui .em-bottom{grid-template-columns:1fr}#melee-ui .em-log{min-height:0}#melee-ui .em-entries{max-height:100px}#melee-ui .em-actions{gap:5px}#melee-ui .em-action{min-height:75px}#melee-ui .em-title{letter-spacing:.06em}}
          @media(prefers-reduced-motion:reduce){#melee-ui *,#melee-ui *:after{animation:none!important;transition:none!important}}
        `;
        document.head.appendChild(css);
    },

    showUI: function() {
        this._uiStyles();
        let el = document.getElementById('melee-ui');
        if (!el) { el = document.createElement('div'); el.id = 'melee-ui'; document.body.appendChild(el); }
        el.style.display = 'flex';
        el.style.transform = '';
        this.updateUI();
    },

    updateUI: function() {
        const el = document.getElementById('melee-ui');
        if (!el) return;
        const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        const php = Math.max(0,Math.min(100,this.playerHp));
        const ehp = Math.max(0,Math.min(100,this.enemyHp));
        const disabled = this.phase !== 'fighting' ? 'disabled' : '';
        const log = this.messages.map(m => `<div class="em-entry" style="color:${/^#[0-9a-f]{3,8}$/i.test(m.color) ? m.color : '#f5e9d1'}">${esc(m.text)}</div>`).join('');
        // Bevara DOM under slag så att inga knappar stjäl fokus vid en rendering.
        if (!el.querySelector('.em-frame')) {
          el.innerHTML = `<div class="em-scene"></div><div class="em-vignette"></div><div class="em-frame">
            <div><div class="em-title">⚔ NÄRSTRID · INGA SKJUTVAPEN</div><div class="em-heading">
              <div class="em-hud"><div class="em-label">Din soldat</div><div class="em-name">Sargento “Bloom” Brizuela</div><div class="em-hp"><div id="em-player-fill" class="em-hp-fill"></div></div><div id="em-player-text" class="em-hp-text"></div></div>
              <div class="em-hud enemy"><div class="em-label">Fiende</div><div class="em-name">Brasiliansk jägarscout</div><div class="em-hp"><div id="em-enemy-fill" class="em-hp-fill"></div></div><div id="em-enemy-text" class="em-hp-text"></div></div>
            </div></div>
            <div class="em-bottom"><div class="em-log" aria-live="polite"><div class="em-log-title">⚔ Stridslogg</div><div class="em-entries" id="em-entries"></div></div>
            <div><div class="em-actions">
              <button class="em-action" data-action="punch" type="button"><span>✊</span>SLAG</button>
              <button class="em-action" data-action="kick" type="button"><span>🥾</span>SPARK</button>
              <button class="em-action machete" data-action="machete" type="button"><span>🗡</span>MACHETE</button>
              <button class="em-action" data-action="block" type="button"><span>🛡</span>PARERA</button>
            </div><div class="em-status" id="em-status"></div></div></div></div>`;
          el.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', () => this.doAction(btn.dataset.action)));
        }
        el.querySelector('#em-player-fill').style.width = php + '%';
        el.querySelector('#em-enemy-fill').style.width = ehp + '%';
        el.querySelector('#em-player-text').textContent = `${this.playerHp} / 100 HP`;
        el.querySelector('#em-enemy-text').textContent = `${this.enemyHp} / 100 HP`;
        el.querySelector('#em-entries').innerHTML = log;
        el.querySelector('#em-status').textContent = this.phase === 'ambush' ? 'BAKHÅLL · FÖRBERED DIG!' : (this.phase === 'fighting' ? 'VÄLJ DITT NÄSTA DRAG' : 'STRIDEN AVGÖRS');
        el.querySelectorAll('[data-action]').forEach(btn => btn.disabled = !!disabled);
        if (this.shake > 0) {
            const frame = el.querySelector('.em-frame');
            frame.classList.remove('em-hit'); void frame.offsetWidth; frame.classList.add('em-hit');
            this.shake = 0;
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
