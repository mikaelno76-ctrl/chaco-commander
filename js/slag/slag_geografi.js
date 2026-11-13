// === SLAGFÄLTSMODUL 2: GEOGRAFI, HEX-MATEMATIK & 5 SYDAMERIKANSKA KRIGSTEATRAR (slag_geografi.js) ===
// Panzer General II Edition – med 5 unika sydamerikanska miljöer:
// 1. CORRIENTES & ESTERO BELLACO (Träskmarker, Río Paraná, Jordskansar & Curupayty)
// 2. BRASILIEN: MATO GROSSO & HÖGLANDET (Tät regnskog, Terra Roxa & Fort Coimbra)
// 3. ANDERNA: BOLIVIA-PARAGUAYS SAMMANSTRÅLNING (Snöklädda bergspass & Altiplano)
// 4. GRAN CHACO & BOQUERÓN (Quebracho-snår, Pilcomayo-floden & Toba-träsk)
// 5. URUGUAY & RÍO DE LA PLATA (Paysandú, Montevideo & Banda Orientals kullar)

window.SlagGeografi = {
    cols: 12,
    rows: 8,
    currentTheaterKey: 'corrientes',

    terrainTypes: {
        plain:    { id: 'plain',    name: 'Öppen Slätt / Pampas',     moveCost: 1, defenseBonus: 0.05, closeCombatBonus: false },
        swamp:    { id: 'swamp',    name: 'Träskmark (Estero)',       moveCost: 2, defenseBonus: 0.25, closeCombatBonus: true  },
        jungle:   { id: 'jungle',   name: 'Tät Regnskog / Monte',     moveCost: 2, defenseBonus: 0.30, closeCombatBonus: true  },
        river:    { id: 'river',    name: 'Segelbar Flod (Paraná)',   moveCost: 2, defenseBonus: 0.00, navalPassable: true     },
        hill:     { id: 'hill',     name: 'Högland / Ås (Lomas)',     moveCost: 2, defenseBonus: 0.25, closeCombatBonus: false },
        mountain: { id: 'mountain', name: 'Andinskt Bergspass',       moveCost: 3, defenseBonus: 0.45, closeCombatBonus: true  },
        fort:     { id: 'fort',     name: 'Fästning / Skans (Trinchera)', moveCost: 1, defenseBonus: 0.50, isObjective: true, closeCombatBonus: true }
    },

    theaters: {
        corrientes: {
            key: 'corrientes',
            bgImage: 'maps/pg2_corrientes.jpg',
            title: 'Slaget vid Estero Bellaco & Corrientes (Träsk & Flod)',
            subtitle: 'Försvara jordskansarna vid Curupayty och krossa Mitres och Brasiliens framryckning genom träsken!',
            map: [
                ['river','river','swamp','plain','plain','fort','plain','swamp','plain','plain','hill','plain'],
                ['plain','river','river','swamp','swamp','plain','plain','swamp','swamp','plain','plain','plain'],
                ['plain','plain','river','swamp','fort','swamp','plain','plain','swamp','jungle','plain','plain'],
                ['plain','swamp','river','river','swamp','swamp','plain','fort','plain','jungle','plain','plain'],
                ['plain','swamp','swamp','river','river','plain','swamp','swamp','plain','plain','plain','plain'],
                ['plain','plain','swamp','plain','river','river','swamp','plain','plain','hill','fort','plain'],
                ['plain','plain','plain','plain','plain','river','river','plain','plain','plain','plain','plain'],
                ['plain','plain','plain','plain','plain','plain','river','river','plain','plain','plain','plain']
            ],
            initialUnits: [
                { id: 'u1', type: 'par_line',       col: 4, row: 2, entrench: 3 },
                { id: 'u2', type: 'par_residentas', col: 5, row: 0, entrench: 4 },
                { id: 'u3', type: 'par_artillery',  col: 5, row: 1, entrench: 3 },
                { id: 'u4', type: 'par_aca_caraya', col: 6, row: 2, entrench: 1 },
                { id: 'u5', type: 'par_ironclad',   col: 2, row: 2, entrench: 0 },
                { id: 'u6', type: 'par_kaaguy_ghosts', col: 6, row: 3, entrench: 2 },

                { id: 'e1', type: 'bra_line',       col: 7, row: 3, entrench: 1 },
                { id: 'e2', type: 'arg_line',       col: 8, row: 4, entrench: 1 },
                { id: 'e3', type: 'bra_cacadores',  col: 9, row: 4, entrench: 1 },
                { id: 'e4', type: 'bra_cavalry',    col: 8, row: 2, entrench: 0 },
                { id: 'e5', type: 'uru_colorado',   col: 10,row: 5, entrench: 2 }
            ]
        },

        brazil_jungle: {
            key: 'brazil_jungle',
            bgImage: 'maps/pg2_brazil.jpg',
            title: 'Offensiven i Mato Grosso & Brasiliens Högland (Regnskog & Fort)',
            subtitle: 'Kämpa genom den täta regnskogen och storma de brasilianska krutfästningarna vid Coimbra!',
            map: [
                ['jungle','jungle','hill','plain','jungle','fort','jungle','jungle','hill','hill','fort','jungle'],
                ['jungle','plain','plain','jungle','jungle','plain','jungle','plain','plain','hill','plain','jungle'],
                ['river','river','plain','plain','fort','plain','plain','plain','jungle','plain','plain','jungle'],
                ['jungle','river','river','jungle','jungle','plain','hill','plain','plain','fort','jungle','jungle'],
                ['jungle','jungle','river','river','plain','plain','hill','hill','plain','plain','plain','jungle'],
                ['hill','jungle','jungle','river','river','plain','plain','jungle','jungle','plain','fort','hill'],
                ['hill','hill','jungle','jungle','river','river','plain','jungle','plain','plain','plain','hill'],
                ['jungle','hill','hill','jungle','jungle','river','river','plain','plain','jungle','jungle','hill']
            ],
            initialUnits: [
                { id: 'u1', type: 'par_line',       col: 3, row: 2, entrench: 2 },
                { id: 'u2', type: 'par_aca_caraya', col: 5, row: 2, entrench: 1 },
                { id: 'u3', type: 'par_artillery',  col: 4, row: 2, entrench: 2 },
                { id: 'u4', type: 'par_residentas', col: 5, row: 0, entrench: 3 },
                { id: 'u5', type: 'par_ironclad',   col: 2, row: 3, entrench: 0 },
                { id: 'u6', type: 'par_kaaguy_ghosts', col: 7, row: 2, entrench: 2 },

                { id: 'e1', type: 'bra_line',       col: 8, row: 2, entrench: 2 },
                { id: 'e2', type: 'bra_cacadores',  col: 9, row: 3, entrench: 3 },
                { id: 'e3', type: 'bra_cavalry',    col: 10,row: 3, entrench: 2 },
                { id: 'e4', type: 'bra_line',       col: 10,row: 5, entrench: 3 }
            ]
        },

        andes_bolivia: {
            key: 'andes_bolivia',
            bgImage: 'maps/pg2_andes.jpg',
            title: 'Slaget i Anderna (Paraguay & Bolivia mot Kejsardömet)',
            subtitle: 'Paraguayanska och bolivianska trupper sammanstrålar i de snöklädda bergspassen!',
            map: [
                ['mountain','mountain','hill','plain','fort','mountain','mountain','hill','plain','mountain','fort','mountain'],
                ['mountain','hill','plain','plain','hill','mountain','hill','plain','plain','hill','plain','mountain'],
                ['hill','plain','fort','plain','plain','hill','plain','plain','hill','fort','plain','mountain'],
                ['mountain','hill','plain','mountain','mountain','hill','plain','mountain','mountain','hill','plain','hill'],
                ['mountain','mountain','plain','plain','hill','plain','plain','hill','plain','plain','hill','mountain'],
                ['mountain','hill','plain','fort','plain','plain','hill','plain','plain','fort','plain','mountain'],
                ['mountain','mountain','hill','plain','plain','mountain','mountain','plain','hill','plain','mountain','mountain'],
                ['mountain','mountain','mountain','hill','plain','mountain','mountain','hill','mountain','mountain','mountain','mountain']
            ],
            initialUnits: [
                { id: 'u1', type: 'par_line',       col: 2, row: 2, entrench: 3 },
                { id: 'u2', type: 'par_aca_caraya', col: 4, row: 2, entrench: 1 },
                { id: 'u3', type: 'par_artillery',  col: 3, row: 2, entrench: 2 },
                { id: 'u4', type: 'par_residentas', col: 3, row: 5, entrench: 3 },
                { id: 'u5', type: 'par_kaaguy_ghosts', col: 6, row: 2, entrench: 2 },

                { id: 'e1', type: 'bra_line',       col: 7, row: 2, entrench: 2 },
                { id: 'e2', type: 'arg_line',       col: 9, row: 2, entrench: 3 },
                { id: 'e3', type: 'bra_cavalry',    col: 8, row: 1, entrench: 2 },
                { id: 'e4', type: 'arg_line',       col: 9, row: 5, entrench: 3 }
            ]
        },

        chaco_war: {
            key: 'chaco_war',
            bgImage: 'maps/pg2_chaco.jpg',
            title: 'Bakhållet i Gran Chaco & Boquerón (Quebracho & Träsk)',
            subtitle: 'Locka in alliansens kolonner i Chacos ogenomträngliga Quebracho-snår och träskmarker!',
            map: [
                ['jungle','swamp','plain','jungle','fort','swamp','jungle','plain','hill','plain','fort','jungle'],
                ['swamp','jungle','swamp','plain','plain','swamp','swamp','jungle','plain','hill','plain','jungle'],
                ['river','swamp','plain','fort','swamp','jungle','plain','plain','swamp','fort','plain','plain'],
                ['river','river','swamp','swamp','jungle','jungle','swamp','plain','plain','swamp','jungle','plain'],
                ['plain','river','river','plain','swamp','plain','plain','swamp','jungle','plain','plain','plain'],
                ['plain','plain','river','river','plain','fort','swamp','jungle','plain','plain','fort','plain'],
                ['jungle','plain','plain','river','river','plain','plain','swamp','plain','plain','plain','jungle'],
                ['jungle','jungle','plain','plain','river','river','plain','plain','jungle','jungle','plain','jungle']
            ],
            initialUnits: [
                { id: 'u1', type: 'par_line',       col: 3, row: 2, entrench: 3 },
                { id: 'u2', type: 'par_kaaguy_ghosts', col: 5, row: 3, entrench: 2 },
                { id: 'u3', type: 'par_aca_caraya', col: 4, row: 4, entrench: 1 },
                { id: 'u4', type: 'par_artillery',  col: 5, row: 5, entrench: 3 },
                { id: 'u5', type: 'par_ironclad',   col: 2, row: 4, entrench: 0 },

                { id: 'e1', type: 'arg_line',       col: 7, row: 2, entrench: 1 },
                { id: 'e2', type: 'bra_cacadores',  col: 9, row: 2, entrench: 2 },
                { id: 'e3', type: 'bra_cavalry',    col: 8, row: 4, entrench: 1 },
                { id: 'e4', type: 'uru_colorado',   col: 10,row: 5, entrench: 2 }
            ]
        },

        uruguay_plata: {
            key: 'uruguay_plata',
            bgImage: 'maps/pg2_uruguay.jpg',
            title: 'Undsättningen av Paysandú & Montevideo (Río de la Plata)',
            subtitle: 'Bryt belägringen av våra Blanco-allierade längs Río Uruguays stränder och krossa Flores & Brasilien!',
            map: [
                ['plain','hill','plain','plain','fort','plain','plain','hill','plain','plain','fort','plain'],
                ['plain','plain','hill','plain','plain','plain','hill','plain','plain','plain','plain','plain'],
                ['river','plain','plain','fort','plain','plain','plain','plain','hill','fort','plain','plain'],
                ['river','river','plain','plain','hill','plain','plain','fort','plain','plain','plain','plain'],
                ['river','river','river','plain','plain','plain','swamp','plain','plain','plain','hill','plain'],
                ['river','river','river','river','swamp','fort','plain','plain','plain','fort','plain','plain'],
                ['river','river','river','river','river','river','plain','plain','plain','plain','plain','plain'],
                ['river','river','river','river','river','river','river','river','plain','plain','plain','plain']
            ],
            initialUnits: [
                { id: 'u1', type: 'par_line',       col: 3, row: 2, entrench: 3 },
                { id: 'u2', type: 'par_aca_caraya', col: 4, row: 3, entrench: 1 },
                { id: 'u3', type: 'par_artillery',  col: 5, row: 5, entrench: 3 },
                { id: 'u4', type: 'par_ironclad',   col: 2, row: 4, entrench: 0 },
                { id: 'u5', type: 'par_line_2',     col: 4, row: 0, entrench: 2 },

                { id: 'e1', type: 'uru_colorado',   col: 7, row: 3, entrench: 2 },
                { id: 'e2', type: 'bra_line',       col: 9, row: 2, entrench: 2 },
                { id: 'e3', type: 'bra_cavalry',    col: 8, row: 4, entrench: 1 },
                { id: 'e4', type: 'arg_line',       col: 9, row: 5, entrench: 2 }
            ]
        }
    },

    getTerrainAt: function(col, row) {
        const th = this.theaters[this.currentTheaterKey];
        if (!th || row < 0 || row >= this.rows || col < 0 || col >= this.cols) return null;
        const key = th.map[row][col];
        return this.terrainTypes[key] || this.terrainTypes.plain;
    },

    offsetToCube: function(col, row) {
        const x = col;
        const z = row - (col - (col & 1)) / 2;
        const y = -x - z;
        return { x, y, z };
    },

    getHexDistance: function(c1, r1, c2, r2) {
        const a = this.offsetToCube(c1, r1);
        const b = this.offsetToCube(c2, r2);
        return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
    },

    getNeighbors: function(col, row) {
        const parity = col & 1;
        const dirs = parity === 0
            ? [[+1, 0], [+1, -1], [0, -1], [-1, -1], [-1, 0], [0, +1]]
            : [[+1, +1], [+1, 0], [0, -1], [-1, 0], [-1, +1], [0, +1]];
        const res = [];
        dirs.forEach(([dc, dr]) => {
            const nc = col + dc;
            const nr = row + dr;
            if (nc >= 0 && nc < this.cols && nr >= 0 && nr < this.rows) {
                res.push({ col: nc, row: nr });
            }
        });
        return res;
    },

    getReachableHexes: function(unit, allUnits) {
        const reachable = {};
        const queue = [{ col: unit.col, row: unit.row, moveLeft: unit.moveLeft }];
        reachable[`${unit.col},${unit.row}`] = unit.moveLeft;

        while (queue.length > 0) {
            const curr = queue.shift();
            this.getNeighbors(curr.col, curr.row).forEach(nb => {
                const terr = this.getTerrainAt(nb.col, nb.row);
                if (!terr) return;

                if (unit.navalOnly && !terr.navalPassable) return;
                if (!unit.navalOnly && terr.navalPassable) return;

                const sameHexUnits = allUnits.filter(u => window.SlagData.getTotalPersonnel(u) > 0 && u.col === nb.col && u.row === nb.row);
                if (!unit.stealthGuerrilla) {
                    if (sameHexUnits.length > 0) return;
                } else {
                    if (sameHexUnits.some(u => u.faction === unit.faction || u.stealthGuerrilla)) return;
                }

                const actualCost = unit.stealthGuerrilla ? 1 : terr.moveCost;
                const nextMove = curr.moveLeft - actualCost;
                const key = `${nb.col},${nb.row}`;
                if (nextMove >= 0 && (reachable[key] === undefined || nextMove > reachable[key])) {
                    reachable[key] = nextMove;
                    queue.push({ col: nb.col, row: nb.row, moveLeft: nextMove });
                }
            });
        }
        delete reachable[`${unit.col},${unit.row}`];
        return reachable;
    }
};
