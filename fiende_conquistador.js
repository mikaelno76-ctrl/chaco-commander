// === FIENDEMODUL 1: ODÖD SPANSK CONQUISTADOR - CINEMATIC DARK FANTASY EDITION (fiende_conquistador.js) ===
// En extremt detaljerad 128x128-sprite med 6 animerade bildrutor som matchar den
// tunga, cinematiska och vegetationsövervuxna skräckstilen från originalbilden (image_2.png).
// Mörkt oxiderat stål, fastvuxen djungelmossa, halvt flådd askgrå skalle och intensivt glödande röda ögon!

window.EnemyRegistry = window.EnemyRegistry || {};

window.EnemyRegistry['skeleton'] = {
    name: "Odöd Conquistador",
    defaultHp: 65,
    defaultDmg: 16,
    defaultSpeed: 0.58,
    frames: [],

    init: function() {
        // 6 rutor för en skräckinjagande och atmosfärisk animation:
        // 0-3: Haltande, ryckig och olycksbådande marsch ur djungeldunklet
        // 4:   ATTACKVRÅL (Kastar sig framåt, höjer det rostiga Toledosvärdet, gapar groteskt)
        // 5:   TRÄFFAD / SÖNDERSKJUTEN (Blodkaskader, trasigt pansar och gnistor)
        for (let i = 0; i < 6; i++) {
            this.frames[i] = this.drawNightmareFrame(i);
        }
    },

    drawNightmareFrame: function(pose) {
        const c = document.createElement('canvas');
        c.width = c.height = 128; // Hög upplösning för optimal detaljrikedom
        const ctx = c.getContext('2d');

        const isAttack = (pose === 4);
        const isHurt = (pose === 5);

        // Obehaglig ryckig gång-förskjutning
        const limpY = [0, 3, 1, 4, -2, 2][pose];
        const headTilt = [-0.10, 0.06, -0.15, 0.12, 0.0, 0.25][pose];
        const legL = (pose % 2 === 0) ? -3 : 3;
        const legR = -legL;

        // 1. Mörk, flytande skugga + pöl av intorkat och koagulerat blod
        ctx.fillStyle = 'rgba(8, 2, 2, 0.7)';
        ctx.beginPath();
        ctx.ellipse(64, 118, 32, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(70, 8, 8, 0.45)';
        ctx.beginPath();
        ctx.ellipse(64 + legL, 119, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Ben & Spanska stövlar (ena helt trasig - blottat mörkt ben och senor!)
        // Vänster ben (Mörkt rutten stövel)
        ctx.fillStyle = '#615843'; // Nedsmutsat ruttet ben
        ctx.fillRect(46 + legL, 80 + limpY, 7, 34);
        ctx.fillStyle = '#1c130d'; // Mörkt slitet och fuktigt läder
        ctx.fillRect(43 + legL, 93 + limpY, 13, 23);
        ctx.fillStyle = '#3a0c0c'; // Svartnat blod och lera
        ctx.fillRect(44 + legL, 95 + limpY, 8, 12);

        // Höger ben (Sönderfrätt skenben med kvarhängande sliten tygflik)
        ctx.fillStyle = '#4f483a';
        ctx.fillRect(74 + legR, 80 + limpY, 4, 34); // Skenben
        ctx.fillRect(80 + legR, 82 + limpY, 2, 30); // Sidosplitter
        ctx.fillStyle = '#4a0808'; // Koagulerat fäste
        ctx.fillRect(75 + legR, 84 + limpY, 5, 12);
        ctx.fillStyle = '#141414';
        ctx.fillRect(72 + legR, 111 + limpY, 12, 5); // Skelettfot

        // 3. Trasiga Spanska Puffbyxor (Mörkt, jordigt scharlakansrött och möglat guld-oliv)
        ctx.fillStyle = '#260606';
        ctx.fillRect(41, 68 + limpY, 46, 17);
        for (let sx = 44; sx <= 82; sx += 6) {
            ctx.fillStyle = (sx % 2 === 0) ? '#4a3610' : '#3b0d0d';
            ctx.fillRect(sx, 69 + limpY, 3, 14);
        }

        // Fastvuxen fuktig djungelmossa och sly som hänger från höfterna
        ctx.fillStyle = '#192b11';
        ctx.fillRect(40, 71 + limpY, 48, 6);
        ctx.fillStyle = '#2d4a22';
        for (let mx = 42; mx <= 82; mx += 8) {
            ctx.fillRect(mx, 74 + limpY, 4, 8 + (mx % 3));
        }

        // Hängande ruttna trossar och inälvsliknande strängar
        ctx.strokeStyle = '#4a0b10';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(58, 67 + limpY);
        ctx.bezierCurveTo(53, 75 + limpY, 65, 80 + limpY, 59, 88 + limpY);
        ctx.stroke();

        // 4. Sönderrostat, mörkt spanskt bröstharnesk (Coraza) med fastvuxen skogsvegetation
        // Vi matchar det djupt skuggade, ärgade metallmönstret från image_2.png
        ctx.fillStyle = '#24292e'; // Mörkt oxiderat stål
        ctx.beginPath();
        ctx.moveTo(35, 36 + limpY);
        ctx.lineTo(93, 36 + limpY);
        ctx.lineTo(85, 70 + limpY);
        ctx.lineTo(43, 70 + limpY);
        ctx.closePath();
        ctx.fill();

        // Riklig mörk mossa och vegetation som klänger på pansaret
        ctx.fillStyle = '#1e3615';
        ctx.fillRect(38, 38 + limpY, 16, 14);
        ctx.fillRect(72, 42 + limpY, 18, 16);
        ctx.fillStyle = '#2d4a22'; // Ljusare gröna accenter på mossan
        ctx.fillRect(40, 44 + limpY, 8, 6);
        ctx.fillRect(78, 48 + limpY, 10, 8);

        // Rost, gravmögel och blodspår (matchar den röda patinan på image_2.png)
        ctx.fillStyle = '#421a0e';
        ctx.fillRect(52, 38 + limpY, 6, 28);
        ctx.fillStyle = '#2a0a06';
        ctx.fillRect(66, 36 + limpY, 5, 32);

        // Det uppsprättade, mörka hålet i bröstkorgen där revbenen sticker ut
        ctx.fillStyle = '#0a0303';
        ctx.beginPath();
        ctx.ellipse(63, 56 + limpY, 13, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Spruckna, grådaskiga revben ur djupet
        ctx.strokeStyle = '#756c5a';
        ctx.lineWidth = 2;
        for (let ry = 47; ry <= 65; ry += 5) {
            ctx.beginPath();
            ctx.moveTo(52, ry + limpY);
            ctx.quadraticCurveTo(58, ry + 1 + limpY, 61, ry + limpY);
            ctx.moveTo(74, ry + limpY);
            ctx.quadraticCurveTo(68, ry + 1 + limpY, 65, ry + limpY);
            ctx.stroke();
        }

        // 5. HUVUDET: Ruttnande spöklikt kranium i mörka djungelskuggor
        ctx.save();
        ctx.translate(64, 30 + limpY);
        ctx.rotate(headTilt);

        // Askgrå/jordig fuktig hud
        ctx.fillStyle = isHurt ? '#cc3b3b' : '#575e4e';
        ctx.beginPath();
        ctx.arc(0, -4, 14, 0, Math.PI * 2);
        ctx.fill();

        // Kraniumblottad högersida i dämpat gul-benvit
        ctx.fillStyle = '#8f856f';
        ctx.beginPath();
        ctx.arc(4, -4, 11, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        // Djupa mörka ögonhålor
        ctx.fillStyle = '#030000';
        ctx.beginPath();
        ctx.ellipse(-6, -5, 4.5, 4.5, 0.1, 0, Math.PI * 2);
        ctx.ellipse(6, -5, 4.5, 4.5, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // INTENSIVT GLÖDANDE RÖDA ÖGON (Nightmare/Cinematic-effekt från image_2.png!)
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ff0d0d';
        const eyePulse = (pose % 2 === 0) ? 2.3 : 1.7;
        ctx.beginPath();
        ctx.arc(-6, -5, eyePulse, 0, Math.PI * 2);
        ctx.arc(6, -5, eyePulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Naturliga blodstrimmor
        ctx.fillStyle = '#520408';
        ctx.fillRect(-7, 0, 2, 7);
        ctx.fillRect(5, 0, 2, 8);

        // Svart hålighet för näsan
        ctx.fillStyle = '#050101';
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(-2.5, 1.5);
        ctx.lineTo(2.5, 1.5);
        ctx.closePath();
        ctx.fill();

        // URHAKAD KÄKE (Groteskt gapande, matchar den desperata attackstilen)
        const jawDrop = isAttack ? 13 : (3 + (pose % 3) * 2);
        ctx.fillStyle = '#7a6f58';
        ctx.fillRect(-9, 3, 18, 5 + jawDrop);

        // Mörkt gap
        ctx.fillStyle = '#120002';
        ctx.fillRect(-7, 4, 14, 3 + jawDrop);

        // Smutsiga, slitna tänder
        ctx.fillStyle = '#a89c7c';
        for (let tx = -6; tx <= 5; tx += 3) {
            ctx.fillRect(tx, 3, 1.5, 2.5);
            ctx.fillRect(tx, 4.5 + jawDrop, 1.5, 2.5);
        }

        // Blod och galla
        ctx.strokeStyle = '#5c0309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-3, 6 + jawDrop);
        ctx.lineTo(-4, 14 + jawDrop);
        ctx.moveTo(3, 5 + jawDrop);
        ctx.lineTo(4, 16 + jawDrop);
        ctx.stroke();

        // Mörk oxiderad Morion-hjälm med ärgade kanter
        ctx.fillStyle = '#222629'; // Oxiderat stål
        ctx.beginPath();
        ctx.arc(0, -10, 15, Math.PI, 0);
        ctx.fill();

        // Hög, ärgad mässings- och rostkam
        ctx.fillStyle = '#54411a';
        ctx.beginPath();
        ctx.moveTo(-2.5, -27);
        ctx.lineTo(2.5, -27);
        ctx.lineTo(5.5, -12);
        ctx.lineTo(-5.5, -12);
        ctx.closePath();
        ctx.fill();

        // Svängt sprucket Morion-brätte
        ctx.strokeStyle = '#3e4447';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-19, -13);
        ctx.quadraticCurveTo(0, -6, 19, -13);
        ctx.stroke();

        // Smutsigt gråsvart hår och mossa som väller fram under brättet
        ctx.strokeStyle = '#12110f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-12, -8); ctx.lineTo(-15, 5);
        ctx.moveTo(-10, -6); ctx.lineTo(-13, 9);
        ctx.moveTo(12, -8);  ctx.lineTo(16, 4);
        ctx.stroke();

        ctx.restore();

        // 6. ARMAR & VAPEN: Släpande, blodigt Toledosvärd + anfrätta plåtar
        if (isAttack) {
            // ATTACKPOSITION: Rusar framåt, svingar svärdet diagonalt
            ctx.fillStyle = '#2a2f33';
            ctx.fillRect(14, 25, 20, 10); // Vänster arm framåt
            ctx.fillStyle = '#8f856f';
            ctx.fillRect(4, 19, 11, 11); // Skelettklo utsträckt
            ctx.strokeStyle = '#9c917a';
            ctx.lineWidth = 2;
            for (let f = -5; f <= 5; f += 4) {
                ctx.beginPath();
                ctx.moveTo(10, 24);
                ctx.lineTo(1, 22 + f);
                ctx.stroke();
            }

            // Höger arm med Toledosvärdet i ett hugg
            ctx.fillStyle = '#2a2f33';
            ctx.fillRect(87, 23, 16, 11);
            // Parerstång
            ctx.fillStyle = '#7a5a12';
            ctx.fillRect(93, 11, 17, 4);
            // Blodigt, oxiderat svärd
            ctx.fillStyle = '#5c666b';
            ctx.beginPath();
            ctx.moveTo(99, 13);
            ctx.lineTo(123, 56);
            ctx.lineTo(115, 60);
            ctx.lineTo(95, 13);
            ctx.closePath();
            ctx.fill();
            // Intorkat mörkt blod
            ctx.fillStyle = '#6e070d';
            ctx.beginPath();
            ctx.moveTo(102, 21);
            ctx.lineTo(121, 55);
            ctx.lineTo(117, 57);
            ctx.closePath();
            ctx.fill();
        } else {
            // MARSCHPOSITIONER (Skelettarme som kramar Toledosvärdet, axelplåtar med spikar)
            ctx.fillStyle = '#24292e'; // Axelplåtar (Pauldrons)
            ctx.fillRect(25, 36 + limpY, 12, 11);
            ctx.fillRect(91, 36 + limpY, 12, 11);

            // Vänster arm (Ruttna köttrester)
            ctx.fillStyle = '#3a0808';
            ctx.fillRect(28, 47 + limpY, 5, 16);
            ctx.fillStyle = '#827966';
            ctx.fillRect(26, 63 + limpY, 7, 7);

            // Höger arm + släpande Toledosvärd
            ctx.fillStyle = '#827966';
            ctx.fillRect(94, 47 + limpY, 5, 18);

            // Mörkt korgfäste i ärgat guld
            ctx.fillStyle = '#614811';
            ctx.beginPath();
            ctx.arc(96, 64 + limpY, 6, 0, Math.PI * 2);
            ctx.fill();

            // Sönderhackat och mörknat Toledosvärd
            ctx.fillStyle = '#5c666b';
            ctx.beginPath();
            ctx.moveTo(95, 64 + limpY);
            ctx.lineTo(115, 19 + limpY);
            ctx.lineTo(120, 23 + limpY);
            ctx.lineTo(99, 67 + limpY);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#4a0509'; // Rost och gammalt blod
            ctx.beginPath();
            ctx.moveTo(101, 49 + limpY);
            ctx.lineTo(115, 19 + limpY);
            ctx.lineTo(118, 22 + limpY);
            ctx.lineTo(104, 51 + limpY);
            ctx.closePath();
            ctx.fill();
        }

        // 7. Atmosfäriska glödande sporer och mörka flugor i djungelluften
        ctx.fillStyle = '#0a0a0a';
        const flyPositions = [
            [28 + (pose * 6) % 18, 18 + (pose * 4) % 12],
            [92 - (pose * 7) % 15, 23 + (pose * 8) % 14],
            [43 + (pose * 10) % 22, 54 - (pose * 3) % 11]
        ];
        flyPositions.forEach(([fx, fy]) => {
            ctx.fillRect(fx, fy, 2, 2);
            // Glödande partiklar
            ctx.fillStyle = 'rgba(255, 60, 40, 0.45)';
            ctx.fillRect(fx - 1, fy - 1, 1.5, 1.5);
            ctx.fillStyle = '#0a0a0a';
        });

        // 8. Träffeffekt (pose 5): Blod, gnistor och splittrat pansar
        if (isHurt) {
            ctx.fillStyle = '#800202';
            for (let b = 0; b < 16; b++) {
                const bx = 30 + ((b * 17) % 64);
                const by = 18 + ((b * 21) % 68);
                ctx.beginPath();
                ctx.arc(bx, by, 1.5 + (b % 4), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        return c;
    },

    getSprite: function(enemy, now) {
        if (enemy.hurtTimer > 0) return this.frames[5];
        if (enemy.attackCooldown > 1.05) return this.frames[4];
        // Ryckig framfart
        const walkFrame = Math.floor((now || performance.now()) / 190) % 4;
        return this.frames[walkFrame];
    }
};

window.EnemyRegistry['skeleton'].init();
