// === SLAGFÄLTSMODUL 1: ENHETSDATA, TRÄNING & GUARANÍ-GERILLAMEKANIK v3 (slag_data.js) ===
// Stöder nu:
// - Träningsbonusar från Campamento Cerro León & Ka'aguy-akademin
// - Compoundbågar (compoundBows) och Guaraní-gerillans infiltrationsmekanik (stealthGuerrilla: true)
// - Decimering av fiendeförband när gerillan står på SAMMA HEX-RUTA som fienden!

window.SlagData = {
    activeUnits: [],

    getTemplate: function(templateKey) {
        if (window.DataTrupper && window.DataTrupper.units && window.DataTrupper.units[templateKey]) {
            const u = window.DataTrupper.units[templateKey];
            return {
                type: u.id,
                name: u.name,
                faction: u.faction,
                category: u.category,
                men: u.stats.men,
                women: u.stats.women,
                muskets: u.stats.muskets,
                rifles: u.stats.rifles,
                repeaters: u.stats.repeaters || 0,
                compoundBows: u.stats.compoundBows || 0,
                machetes: u.stats.machetes,
                cannons: u.stats.cannons,
                whitworths: u.stats.whitworths,
                gatlings: u.stats.gatlings || 0,
                movePoints: u.stats.movePoints,
                range: u.stats.range,
                navalOnly: !!u.stats.navalOnly,
                stealthGuerrilla: !!u.stats.stealthGuerrilla,
                guerrillaSkill: u.stats.guerrillaSkill || 0,
                defenseBase: u.stats.defenseBase
            };
        }
        return {
            type: templateKey, name: templateKey, faction: 'PAR', category: 'infantry',
            men: 450, women: 30, muskets: 300, rifles: 150, repeaters: 0, compoundBows: 0, machetes: 450,
            cannons: 0, whitworths: 0, gatlings: 0, movePoints: 3, range: 1, defenseBase: 5
        };
    },

    createUnit: function(id, templateKey, col, row, entrenchment) {
        const t = this.getTemplate(templateKey);
        const s = (window.GameState && window.GameState.data) ? window.GameState.data : null;
        const unlocked = (s && Array.isArray(s.unlockedTechs)) ? s.unlockedTechs : [];
        const bld = (s && s.buildings) ? s.buildings : {};

        let extraRifles = 0;
        let extraWhitworths = 0;

        if (t.faction === 'PAR' && s) {
            if (unlocked.includes('minie_rifles') || (s.resources.modern_weapons || 0) >= 50) {
                extraRifles = Math.min(t.muskets, 120);
            }
            if (unlocked.includes('whitworth_rifled_artillery') && t.category === 'artillery') {
                extraWhitworths = 3;
            }
        }

        // Räkna ut förbandets Skicklighet / Träningsnivå (från Cerro León & Ka'aguy-skolan!)
        const cerroLvl = (t.faction === 'PAR') ? (bld.cerro_leon_academy || 1) : 1;
        const kaaguyLvl = (t.faction === 'PAR') ? (bld.kaaguy_guerrilla_school || 1) : 0;
        const sharpBonus = (t.faction === 'PAR' && unlocked.includes('cerro_leon_sharpshooters')) ? 20 : 0;
        const skillScore = 50 + cerroLvl * 12 + kaaguyLvl * 18 + sharpBonus;

        // Befälhavare
        let commander = null;
        if (window.DataTrupper && window.DataTrupper.commanders && t.preferredCommander) {
            commander = window.DataTrupper.commanders[t.preferredCommander] || null;
        }

        const xp = 0;
        const expInfo = (window.DataTrupper && window.DataTrupper.getExperienceBonus) 
            ? window.DataTrupper.getExperienceBonus(xp) : { level: 0, name: 'Rekryt', bonus: 0 };

        return {
            id: id,
            type: t.type,
            name: t.name,
            faction: t.faction,
            category: t.category,
            col: col,
            row: row,
            men: t.men,
            women: t.women,
            maxPersonnel: t.men + t.women,
            muskets: Math.max(0, t.muskets - extraRifles),
            rifles: t.rifles + extraRifles,
            repeaters: t.repeaters || 0,
            compoundBows: t.compoundBows || 0,
            machetes: t.machetes,
            cannons: t.cannons,
            whitworths: t.whitworths + extraWhitworths,
            gatlings: t.gatlings || 0,
            moveLeft: t.movePoints,
            maxMove: t.movePoints,
            range: t.range,
            navalOnly: !!t.navalOnly,
            stealthGuerrilla: !!t.stealthGuerrilla,
            skill: skillScore + (expInfo.bonus || 0),
            defenseBase: t.defenseBase || 5,
            attackBase: t.attackBase || 4,
            accuracy: t.accuracy || 50,
            shock: t.shock || 40,
            cohesion: t.cohesion || 60,
            moraleBase: t.moraleBase || 70,
            experience: xp,
            experienceLevel: expInfo.name,
            commander: commander,
            entrenchment: entrenchment || 0,
            suppression: 0,
            ammo: (unlocked.includes('chilean_saltpeter_powder') && t.faction === 'PAR') ? 11 : 8,
            morale: t.moraleBase || 100,
            hasAttacked: false,
            animFlash: 0
        };
    },

    // Uppdatera erfarenhet efter seger
    awardExperience: function(unit, victoryMargin) {
        if (!unit) return;
        const gain = Math.max(5, Math.round((victoryMargin || 10) * 0.8));
        unit.experience = (unit.experience || 0) + gain;
        if (window.DataTrupper && window.DataTrupper.getExperienceBonus) {
            const info = window.DataTrupper.getExperienceBonus(unit.experience);
            unit.experienceLevel = info.name;
            unit.skill = Math.min(120, (unit.skill || 50) + Math.round(info.bonus * 0.3));
        }
    },

    getTotalPersonnel: function(u) {
        return Math.max(0, u.men + u.women);
    },

    getPGStrengthBadge: function(u) {
        const total = this.getTotalPersonnel(u);
        if (total <= 0) return 0;
        return Math.max(1, Math.ceil((total / u.maxPersonnel) * 10));
    },

    // === SPECIALMEKANIK: GUARANÍ-GERILLAN DECIMERAR FIENDEN PÅ SAMMA RUTA! ===
    executeSameHexGuerrillaDecimation: function(guerrillaUnit, enemyUnit, terrainObj) {
        const s = (window.GameState && window.GameState.data) ? window.GameState.data : null;
        const unlocked = (s && Array.isArray(s.unlockedTechs)) ? s.unlockedTechs : [];

        const activeGhosts = this.getTotalPersonnel(guerrillaUnit);
        if (activeGhosts <= 0 || this.getTotalPersonnel(enemyUnit) <= 0) return null;

        // Bas-decimering från de ljudlösa Ybycuí-Guaraní compoundbågarna och machetes
        const bowPower = (guerrillaUnit.compoundBows || 150) * 0.52;
        const skillMult = (guerrillaUnit.skill || 80) / 75;
        const curareMult = unlocked.includes('botanical_curare_alchemy') ? 1.45 : 1.0;

        // Gerillan är extremt dödlig i skog, träsk och berg, men lite mer exponerad på öppen slätt
        const coverTerrain = (terrainObj && (terrainObj.id === 'jungle' || terrainObj.id === 'swamp' || terrainObj.id === 'mountain' || terrainObj.id === 'hill'));
        const terrainMult = coverTerrain ? 1.35 : 0.85;

        const variance = 0.88 + Math.random() * 0.25;
        const enemyDecimated = Math.min(
            this.getTotalPersonnel(enemyUnit),
            Math.round(bowPower * skillMult * curareMult * terrainMult * variance)
        );

        // Gerillan tar minimala förluster i skog/träsk tack vare sitt kamouflage och ljudlösa bågar
        const ownLoss = coverTerrain ? Math.floor(Math.random() * 5) : Math.floor(4 + Math.random() * 10);

        this.applyCasualtiesToUnit(enemyUnit, enemyDecimated);
        this.applyCasualtiesToUnit(guerrillaUnit, ownLoss);

        // Sänker dessutom fiendens moral, förstör deras skyttegravar inifrån och skapar panik (suppression)!
        const panicAdded = Math.round(enemyDecimated * 0.85);
        enemyUnit.suppression = Math.min(this.getTotalPersonnel(enemyUnit), enemyUnit.suppression + panicAdded);
        enemyUnit.morale = Math.max(10, enemyUnit.morale - 18);
        if (enemyUnit.entrenchment > 0) enemyUnit.entrenchment = Math.max(0, enemyUnit.entrenchment - 1);

        return {
            enemyDecimated,
            ownLoss,
            panicAdded,
            usedCurare: unlocked.includes('botanical_curare_alchemy')
        };
    },

    calculateFirepower: function(u, distanceHexes, terrainDefObj) {
        const activeCrew = Math.max(0, this.getTotalPersonnel(u) - u.suppression);
        if (activeCrew <= 0 || u.ammo <= 0) return 0;

        const crewRatio = Math.min(1, activeCrew / Math.max(1, u.maxPersonnel));
        const s = (window.GameState && window.GameState.data) ? window.GameState.data : null;
        const unlocked = (s && Array.isArray(s.unlockedTechs)) ? s.unlockedTechs : [];

        // Tränings- och prickskyttebonus från Cerro León!
        const trainingMult = 1 + ((u.skill || 60) - 50) * 0.004;

        let rawPower = 0;
        if (distanceHexes > 1) {
            rawPower = (u.cannons * 14 + u.whitworths * 26 + (u.gatlings || 0) * 18) * crewRatio * trainingMult;
            if (u.faction === 'PAR' && unlocked.includes('chilean_saltpeter_powder')) {
                rawPower *= 1.25;
            }
        } else {
            const riflePower = u.rifles * (unlocked.includes('breechloading_rifles') && u.faction === 'PAR' ? 0.58 : 0.42);
            const repeaterPower = (u.repeaters || 0) * 0.78;
            const bowPower = (u.compoundBows || 0) * 0.55;
            const musketPower = u.muskets * 0.22;
            const closeMelee = (terrainDefObj && terrainDefObj.closeCombatBonus) ? (u.machetes * 0.28) : (u.machetes * 0.12);
            const canisterPower = (u.cannons * 12 + u.whitworths * 18 + (u.gatlings || 0) * 32);
            rawPower = (riflePower + repeaterPower + bowPower + musketPower + closeMelee + canisterPower) * crewRatio * trainingMult;
        }

        if (u.faction === 'PAR' && s && Array.isArray(s.relics)) {
            if (s.relics.some(r => r.id === 'tupas_thunder') && u.category === 'artillery') {
                rawPower *= 1.30;
            }
        }

        return Math.round(rawPower);
    },

    predictCombat: function(attacker, defender, dist, defTerrain) {
        const attPower = this.calculateFirepower(attacker, dist, defTerrain);
        const defEntrenchBonus = defender.entrenchment * 0.14;
        const terrainProt = defTerrain ? defTerrain.defenseBonus : 0;
        const totalDefProtection = Math.min(0.78, terrainProt + defEntrenchBonus);

        let estDefenderLosses = Math.round(attPower * (1 - totalDefProtection));
        let suppMult = (attacker.category === 'artillery' || (attacker.gatlings || 0) > 0) ? 0.65 : 0.20;
        let estSuppression = Math.round(attPower * suppMult);

        let estAttackerLosses = 0;
        if (dist <= defender.range && defender.category !== 'artillery') {
            const defCounterPower = this.calculateFirepower(defender, dist, null) * 0.65;
            estAttackerLosses = Math.round(defCounterPower * (attacker.category === 'cavalry' ? 0.75 : 0.85));
        }

        return {
            estDefenderLosses: Math.min(this.getTotalPersonnel(defender), estDefenderLosses),
            estAttackerLosses: Math.min(this.getTotalPersonnel(attacker), estAttackerLosses),
            estSuppression: estSuppression
        };
    },

    executeCombat: function(attacker, defender, dist, defTerrain) {
        const pred = this.predictCombat(attacker, defender, dist, defTerrain);
        const variance = () => 0.85 + Math.random() * 0.30;

        const defLoss = Math.min(this.getTotalPersonnel(defender), Math.round(pred.estDefenderLosses * variance()));
        const attLoss = Math.min(this.getTotalPersonnel(attacker), Math.round(pred.estAttackerLosses * variance()));

        this.applyCasualtiesToUnit(defender, defLoss);
        this.applyCasualtiesToUnit(attacker, attLoss);

        defender.suppression = Math.min(this.getTotalPersonnel(defender), defender.suppression + pred.estSuppression);
        if (attacker.category === 'artillery' && defender.entrenchment > 0) {
            defender.entrenchment = Math.max(0, defender.entrenchment - 1);
        }

        attacker.ammo = Math.max(0, attacker.ammo - 1);
        attacker.hasAttacked = true;
        attacker.moveLeft = 0;
        attacker.animFlash = 0.5;
        defender.animFlash = 0.5;

        return { defLoss, attLoss, suppAdded: pred.estSuppression };
    },

    applyCasualtiesToUnit: function(u, lostCount) {
        const beforeTotal = this.getTotalPersonnel(u);
        if (beforeTotal <= 0 || lostCount <= 0) return;

        const lossRatio = Math.min(1, lostCount / beforeTotal);
        const menLost = Math.round(u.men * lossRatio);
        const womenLost = Math.min(u.women, lostCount - menLost);

        u.men = Math.max(0, u.men - menLost);
        u.women = Math.max(0, u.women - Math.max(0, womenLost));

        u.muskets = Math.max(0, Math.round(u.muskets * (1 - lossRatio * 0.85)));
        u.rifles = Math.max(0, Math.round(u.rifles * (1 - lossRatio * 0.80)));
        u.repeaters = Math.max(0, Math.round((u.repeaters || 0) * (1 - lossRatio * 0.75)));
        u.compoundBows = Math.max(0, Math.round((u.compoundBows || 0) * (1 - lossRatio * 0.70)));
        u.machetes = Math.max(0, Math.round(u.machetes * (1 - lossRatio * 0.90)));

        if (lossRatio > 0.28 && u.cannons > 0) u.cannons = Math.max(0, u.cannons - 1);
        if (lossRatio > 0.38 && u.whitworths > 0) u.whitworths = Math.max(0, u.whitworths - 1);
        if (lossRatio > 0.35 && (u.gatlings || 0) > 0) u.gatlings = Math.max(0, u.gatlings - 1);
        u.morale = Math.max(15, u.morale - Math.round(lossRatio * 45));
    }
};
