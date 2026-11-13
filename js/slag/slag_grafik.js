// === SLAGFÄLTSMODUL 3: VISUELL RENDERING AV MILJÖER & TRUPPER (slag_grafik.js) ===
// Den här filen sköter enbart grafiken! Den läser slag_geografi.js och slag_data.js
// och ritar ut helt olika färgpaletter och terrängdetaljer beroende på om slaget står i:
// - Corrientes träskmarker (Estero Bellaco)
// - Brasiliens regnskog & röda jord
// - Andernas snöklädda högplatå

window.SlagGrafik = {
    canvas: null,
    ctx: null,
    hexRadius: 42,
    originX: 62,
    originY: 56,

    palettes: {
        corrientes: {
            bg: '#1c2419',
            plain: '#6e7d4e',
            swamp: '#3b5749',
            jungle: '#2d4a28',
            river: '#24527a',
            hill: '#7d7049',
            mountain: '#5c5852',
            fort: '#6b4930'
        },
        brazil_jungle: {
            bg: '#142111',
            plain: '#7a5c38', // Rödbrun brasiliansk terra roxa
            swamp: '#2f4f3e',
            jungle: '#1e421a', // Djup tropisk regnskog
            river: '#1e5a70',
            hill: '#6e5233',
            mountain: '#4f483f',
            fort: '#783c26'
        },
        andes_bolivia: {
            bg: '#131924',
            plain: '#7a7566', //Karg Altiplano-platå
            swamp: '#47595c',
            jungle: '#384d34',
            river: '#2d688f',
            hill: '#635d54',
            mountain: '#475059', // Skiffer och snöklädda Andinska toppar
            fort: '#5c5346'
        }
    },

    init: function(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
    },

    // Hjälpfunktion för att ljusa upp hex-färger
    lighten: function(hex, amount) {
        let r = parseInt(hex.slice(1,3), 16);
        let g = parseInt(hex.slice(3,5), 16);
        let b = parseInt(hex.slice(5,7), 16);
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
        return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    },

    getHexCenter: function(col, row) {
        const r = this.hexRadius;
        const w = r * Math.sqrt(3);
        const x = this.originX + col * (r * 1.5);
        const y = this.originY + row * w + (col & 1 ? w / 2 : 0);
        return { x, y };
    },

    pixelToHex: function(px, py) {
        let best = null;
        let bestDist = 9999;
        for (let r = 0; r < window.SlagGeografi.rows; r++) {
            for (let c = 0; c < window.SlagGeografi.cols; c++) {
                const center = this.getHexCenter(c, r);
                const d = Math.hypot(px - center.x, py - center.y);
                if (d < this.hexRadius * 0.95 && d < bestDist) {
                    bestDist = d;
                    best = { col: c, row: r };
                }
            }
        }
        return best;
    },

    drawHexPolygon: function(ctx, cx, cy, radius) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const vx = cx + radius * Math.cos(angle);
            const vy = cy + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
    },

    renderBoard: function(state) {
        const ctx = this.ctx;
        const thKey = window.SlagGeografi.currentTheaterKey;
        const pal = this.palettes[thKey] || this.palettes.corrientes;

        ctx.fillStyle = pal.bg;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Rita alla Hex-rutor med miljöspecifik terrängkonst
        for (let row = 0; row < window.SlagGeografi.rows; row++) {
            for (let col = 0; col < window.SlagGeografi.cols; col++) {
                const { x, y } = this.getHexCenter(col, row);
                const terr = window.SlagGeografi.getTerrainAt(col, row);
                const key = `${col},${row}`;

                this.drawHexPolygon(ctx, x, y, this.hexRadius - 1);
                // Mjuk gradient per terräng
                const base = pal[terr.id] || pal.plain;
                const grad = ctx.createRadialGradient(x, y, 4, x, y, this.hexRadius);
                grad.addColorStop(0, this.lighten(base, 18));
                grad.addColorStop(1, base);
                ctx.fillStyle = grad;
                ctx.fill();

                ctx.strokeStyle = 'rgba(0,0,0,0.55)';
                ctx.lineWidth = 1.8;
                ctx.stroke();

                // Rita terrängdetaljer inne i hex-rutan
                this.drawTerrainDetails(ctx, x, y, terr.id, thKey);

                // Markera giltiga förflyttningsrutor (Grön kant)
                if (state.reachableHexes && state.reachableHexes[key] !== undefined) {
                    this.drawHexPolygon(ctx, x, y, this.hexRadius - 3);
                    ctx.fillStyle = 'rgba(105, 240, 174, 0.22)';
                    ctx.fill();
                    ctx.strokeStyle = '#69f0ae';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                }

                // Markera giltiga attackmål (Rött sikte!)
                if (state.attackableHexes && state.attackableHexes[key]) {
                    this.drawHexPolygon(ctx, x, y, this.hexRadius - 3);
                    ctx.strokeStyle = '#ff5252';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                // Markera vald ruta (Guldram)
                if (state.selectedHex && state.selectedHex.col === col && state.selectedHex.row === row) {
                    this.drawHexPolygon(ctx, x, y, this.hexRadius - 2);
                    ctx.strokeStyle = '#ffd54f';
                    ctx.lineWidth = 3.5;
                    ctx.stroke();
                }
            }
        }

        // 2. Rita ut alla vanliga enheter först, och Guaraní-gerillan överst (med förskjutning om den infiltrerar en fienderuta!)
        const alive = window.SlagData.activeUnits.filter(u => window.SlagData.getTotalPersonnel(u) > 0);
        alive.sort((a, b) => (a.stealthGuerrilla ? 1 : 0) - (b.stealthGuerrilla ? 1 : 0));

        alive.forEach(u => {
            const { x, y } = this.getHexCenter(u.col, u.row);
            const sharingEnemy = u.stealthGuerrilla && alive.some(other => other.id !== u.id && other.col === u.col && other.row === u.row);
            this.drawUnitToken(ctx, x, y, u, sharingEnemy);
        });
    },

    drawTerrainDetails: function(ctx, x, y, terrId, thKey) {
        ctx.save();
        // Mjuk skugga under terrängdetaljer
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        if (terrId === 'swamp') {
            // Vattenspeglar, vass och mörka pölar
            const grad = ctx.createLinearGradient(x-18, y-6, x+18, y+10);
            grad.addColorStop(0, 'rgba(20, 90, 120, 0.7)');
            grad.addColorStop(1, 'rgba(40, 130, 160, 0.4)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(x, y+3, 18, 7, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.strokeStyle = '#9ccc65';
            ctx.lineWidth = 1.8;
            for (let sx = -14; sx <= 14; sx += 6) {
                ctx.beginPath();
                ctx.moveTo(x + sx, y + 9);
                ctx.quadraticCurveTo(x + sx - 1, y + 1, x + sx - 3, y - 7);
                ctx.stroke();
            }
            // Små bubblor
            ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
            ctx.beginPath(); ctx.arc(x-6, y+2, 1.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+8, y+5, 1.2, 0, Math.PI*2); ctx.fill();
        } else if (terrId === 'jungle') {
            // Mer detaljerade trädkronor med höjdpunkter
            const drawTree = (tx, ty, r, col1, col2) => {
                const g = ctx.createRadialGradient(tx-2, ty-2, 2, tx, ty, r);
                g.addColorStop(0, col2);
                g.addColorStop(1, col1);
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(tx, ty, r, 0, Math.PI*2); ctx.fill();
            };
            drawTree(x - 12, y - 2, 12, '#0d2a0a', '#2e7d32');
            drawTree(x + 10, y + 3, 11, '#1b5e20', '#43a047');
            drawTree(x, y - 10, 10, '#1b5e20', '#66bb6a');
            // Lianer
            ctx.strokeStyle = '#558b2f';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x-8, y-14); ctx.bezierCurveTo(x-4, y-6, x-12, y+4, x-6, y+12); ctx.stroke();
        } else if (terrId === 'mountain') {
            // Skarpare Andinska toppar med snö och skugga
            ctx.fillStyle = '#2c333a';
            ctx.beginPath();
            ctx.moveTo(x - 26, y + 18); ctx.lineTo(x - 2, y - 20); ctx.lineTo(x + 22, y + 18);
            ctx.closePath(); ctx.fill();
            // Skuggad sida
            ctx.fillStyle = '#1e252b';
            ctx.beginPath();
            ctx.moveTo(x - 2, y - 20); ctx.lineTo(x + 22, y + 18); ctx.lineTo(x + 4, y + 18);
            ctx.closePath(); ctx.fill();
            // Snöhätta med gradient
            const snow = ctx.createLinearGradient(x-12, y-18, x+6, y-4);
            snow.addColorStop(0, '#ffffff');
            snow.addColorStop(1, '#e3f2fd');
            ctx.fillStyle = snow;
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 4); ctx.lineTo(x - 2, y - 20); ctx.lineTo(x + 6, y - 3);
            ctx.closePath(); ctx.fill();
        } else if (terrId === 'hill') {
            const hillGrad = ctx.createLinearGradient(x, y-4, x, y+14);
            hillGrad.addColorStop(0, 'rgba(90, 70, 40, 0.2)');
            hillGrad.addColorStop(1, 'rgba(50, 35, 20, 0.45)');
            ctx.fillStyle = hillGrad;
            ctx.beginPath();
            ctx.arc(x, y + 8, 20, Math.PI, 0);
            ctx.fill();
        } else if (terrId === 'river') {
            ctx.strokeStyle = 'rgba(180, 220, 255, 0.55)';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x - 16, y - 3); ctx.quadraticCurveTo(x, y - 11, x + 16, y - 3);
            ctx.moveTo(x - 14, y + 7); ctx.quadraticCurveTo(x, y + 2, x + 14, y + 7);
            ctx.stroke();
            // Vattenytans glans
            ctx.strokeStyle = 'rgba(255,255,255,0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - 10, y - 5); ctx.quadraticCurveTo(x, y - 8, x + 10, y - 5);
            ctx.stroke();
        } else if (terrId === 'fort') {
            // Bättre stjärnskans / fort med torn
            ctx.fillStyle = '#4e342e';
            ctx.fillRect(x - 18, y - 16, 36, 28);
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(x - 14, y - 12, 28, 20);
            // Torn
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(x - 20, y - 20, 8, 12);
            ctx.fillRect(x + 12, y - 20, 8, 12);
            ctx.strokeStyle = '#ffd54f';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 18, y - 16, 36, 28);
            // Flagga
            ctx.fillStyle = '#c62828';
            ctx.beginPath();
            ctx.moveTo(x + 16, y - 20); ctx.lineTo(x + 24, y - 16); ctx.lineTo(x + 16, y - 12);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    },

    drawUnitToken: function(ctx, x, y, u, isSharingHex) {
        if (isSharingHex) {
            ctx.save();
            this.drawHexPolygon(ctx, x, y, this.hexRadius - 4);
            ctx.strokeStyle = '#00e676';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 4]);
            ctx.stroke();
            ctx.restore();
            x -= 12;
            y -= 12;
        }
        ctx.save();

        const isPar = u.faction === 'PAR';
        // Bättre fraktionsfärger: Paraguay karmosinröd med guld, Alliansen djupgrön/blå
        const bodyColor = isPar ? '#c62828' : '#1b5e20';
        const accent = isPar ? '#ffd54f' : '#81c784';

        // Skugga under brickan
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = bodyColor;
        ctx.strokeStyle = u.hasAttacked ? '#757575' : '#fff8e1';
        ctx.lineWidth = 2.5;

        // Avrundad bricka med lätt gradient
        const tokenGrad = ctx.createLinearGradient(x-22, y-20, x+22, y+12);
        tokenGrad.addColorStop(0, isPar ? '#e53935' : '#2e7d32');
        tokenGrad.addColorStop(1, bodyColor);
        ctx.fillStyle = tokenGrad;
        ctx.beginPath();
        ctx.roundRect(x - 23, y - 22, 46, 34, 6);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = 'transparent';

        // Ritad truppsymbol istället för bara emoji
        this.drawUnitIcon(ctx, x, y - 6, u.category, isPar);

        // Styrkesiffra
        const pgStr = window.SlagData.getPGStrengthBadge(u);
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(x - 15, y + 5, 30, 15, 3);
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffeb3b';
        ctx.font = 'bold 11px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText(pgStr, x, y + 16);

        // Entrenchment
        if (u.entrenchment > 0) {
            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.roundRect(x + 10, y - 26, 18, 13, 2);
            ctx.fill();
            ctx.fillStyle = '#ffd54f';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('⛏' + u.entrenchment, x + 19, y - 16);
        }

        ctx.restore();
    },

    // Enkel ritad ikon per truppslag
    drawUnitIcon: function(ctx, x, y, category, isPar) {
        ctx.save();
        ctx.strokeStyle = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';

        if (category === 'artillery') {
            // Kanon
            ctx.beginPath();
            ctx.arc(x - 6, y + 2, 5, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x - 2, y); ctx.lineTo(x + 10, y - 3);
            ctx.stroke();
            ctx.fillRect(x - 1, y - 4, 4, 3);
        } else if (category === 'cavalry') {
            // Häst + ryttare förenklad
            ctx.beginPath();
            ctx.ellipse(x, y + 2, 10, 5, 0, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + 6, y - 2, 3.5, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x - 8, y + 4); ctx.lineTo(x - 10, y + 8);
            ctx.moveTo(x + 4, y + 5); ctx.lineTo(x + 6, y + 9);
            ctx.stroke();
        } else if (category === 'naval') {
            // Ångbåt / kanonbåt
            ctx.beginPath();
            ctx.moveTo(x - 10, y + 4); ctx.lineTo(x + 10, y + 4); ctx.lineTo(x + 8, y + 8); ctx.lineTo(x - 8, y + 8);
            ctx.closePath(); ctx.fill();
            ctx.fillRect(x - 4, y - 4, 8, 8);
            ctx.beginPath();
            ctx.moveTo(x + 6, y - 4); ctx.lineTo(x + 6, y - 10);
            ctx.stroke();
            ctx.fillStyle = '#ffcc80';
            ctx.fillRect(x + 5, y - 12, 3, 4);
        } else if (category === 'militia' || category === 'guerrilla') {
            // Sköld eller båge
            if (category === 'guerrilla') {
                ctx.beginPath();
                ctx.arc(x, y, 9, 0.2, Math.PI - 0.2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - 2, y - 2); ctx.lineTo(x + 6, y + 4);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(x, y - 8); ctx.lineTo(x + 7, y - 2); ctx.lineTo(x + 5, y + 6); ctx.lineTo(x - 5, y + 6); ctx.lineTo(x - 7, y - 2);
                ctx.closePath(); ctx.stroke();
                ctx.fillStyle = isPar ? '#ffcdd2' : '#c8e6c9';
                ctx.fill();
            }
        } else {
            // Standard infanteri: gevär + bajonett
            ctx.beginPath();
            ctx.moveTo(x - 8, y + 4); ctx.lineTo(x + 6, y - 6);
            ctx.stroke();
            ctx.fillRect(x - 10, y + 2, 4, 6);
            ctx.beginPath();
            ctx.moveTo(x + 6, y - 6); ctx.lineTo(x + 9, y - 10);
            ctx.stroke();
        }
        ctx.restore();
    }
