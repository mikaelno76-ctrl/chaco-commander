// === DATABLAD 2: TRUPPKATALOG, BEFÄLHAVARE & ENHETSSTATISTIK v6 (data_trupper.js) ===
// Expanderad för 1864-start + forskning. Innehåller:
// - Autentiska och påhittade befälhavare med egenskaper
// - Erfarenhetssystem (veteranbonusar efter slag)
// - Rika stats för strateginördar (morale, accuracy, shock, cohesion, etc.)
// - Starttrupper + researchbara för alla huvudfaktioner

window.DataTrupper = {
    commanders: {
        lopez: {
            id: 'lopez',
            name: 'Marskalk Francisco Solano López',
            faction: 'PAR',
            rank: 'Mariscal',
            portrait: 'portraits/commanders/lopez.jpg',
            traits: ['inspirerande', 'envis', 'centraliserad_kommando'],
            bonuses: { morale: +12, cohesion: +8, initiative: +1 },
            desc: 'Paraguays överbefälhavare. Personlig närvaro höjer moralen men kan bli stelbens.'
        },
        diaz: {
            id: 'diaz',
            name: 'General José Eduvigis Díaz',
            faction: 'PAR',
            rank: 'Brigadier',
            portrait: 'portraits/commanders/diaz.jpg',
            traits: ['aggressiv', 'defensiv_mästare', 'artigillerikänsla'],
            bonuses: { defense: +15, artillery_accuracy: +10, morale: +8 },
            desc: 'Hjälte från Curupayty. Utmärkt i försvar och koordinering av artilleri.'
        },
        robles: {
            id: 'robles',
            name: 'General Wenceslao Robles',
            faction: 'PAR',
            rank: 'General',
            portrait: 'portraits/commanders/robles.jpg',
            traits: ['flodkrigare', 'offensiv'],
            bonuses: { movement: +1, shock: +8, naval_support: +5 },
            desc: 'Ledde invasionen av Corrientes. Stark på flodoperationer.'
        },
        barrios: {
            id: 'barrios',
            name: 'Överste Vicente Barrios',
            faction: 'PAR',
            rank: 'Coronel',
            portrait: 'portraits/commanders/barrios.jpg',
            traits: ['djungleexpert', 'snabb_manöver'],
            bonuses: { movement: +1, stealth: +10, guerrilla: +5 },
            desc: 'Ledde kolonnen mot Mato Grosso. Bra i svår terräng.'
        },
        caxias: {
            id: 'caxias',
            name: 'Duque de Caxias',
            faction: 'BRA',
            rank: 'Marechal',
            portrait: 'portraits/commanders/caxias.jpg',
            traits: ['metodisk', 'logistikmästare', 'disciplin'],
            bonuses: { cohesion: +12, supply_efficiency: +10, defense: +5 },
            desc: 'Brasiliens främste fältmarskalk. Långsam men extremt pålitlig.'
        },
        osorio: {
            id: 'osorio',
            name: 'General Osório',
            faction: 'BRA',
            rank: 'General',
            portrait: 'portraits/commanders/osorio.jpg',
            traits: ['kavallerist', 'djärv'],
            bonuses: { shock: +12, cavalry_charge: +15, morale: +6 },
            desc: 'Aggressiv brasiliansk befälhavare, utmärkt med kavalleri.'
        },
        mitre: {
            id: 'mitre',
            name: 'President Bartolomé Mitre',
            faction: 'ARG',
            rank: 'General',
            portrait: 'portraits/commanders/mitre.jpg',
            traits: ['politisk_befälhavare', 'defensiv'],
            bonuses: { morale: +5, defense: +8 },
            desc: 'Argentinas president och överbefälhavare. Mer politiker än ren fältgeneral.'
        },
        flores: {
            id: 'flores',
            name: 'General Venancio Flores',
            faction: 'URU',
            rank: 'General',
            portrait: 'portraits/commanders/flores.jpg',
            traits: ['partisan', 'snabb'],
            bonuses: { movement: +1, initiative: +2, morale: +4 },
            desc: 'Uruguays Colorado-ledare. Liten styrka men rörlig.'
        }
    },

    units: {
        // ==================== PARAGUAY START 1864 ====================
        par_line: {
            id: 'par_line',
            name: 'Batallón de Línea',
            faction: 'PAR',
            availableFromStart: true,
            requiredTech: null,
            requiredBuilding: 'barracks_asuncion',
            category: 'infantry',
            preferredCommander: 'diaz',
            cost: { gold: 50, manpower: 520, food: 40, modern_weapons: 0 },
            stats: {
                men: 480, women: 40,
                muskets: 380, rifles: 100, repeaters: 0,
                machetes: 480, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 3, range: 1,
                defenseBase: 5, attackBase: 4, accuracy: 55, shock: 40,
                cohesion: 70, moraleBase: 75, experienceGain: 8,
                foodConsumptionPerMonth: 15
            },
            desc: 'Ryggraden i armén. Disciplinerade soldater i röda skjortor.'
        },
        par_line_2: {
            id: 'par_line_2',
            name: '2:a Linjebataljonen',
            faction: 'PAR',
            availableFromStart: true,
            requiredTech: null,
            category: 'infantry',
            preferredCommander: 'robles',
            cost: { gold: 48, manpower: 500, food: 38, modern_weapons: 0 },
            stats: {
                men: 460, women: 35,
                muskets: 400, rifles: 60, repeaters: 0,
                machetes: 460, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 3, range: 1,
                defenseBase: 5, attackBase: 4, accuracy: 52, shock: 38,
                cohesion: 68, moraleBase: 72, experienceGain: 8,
                foodConsumptionPerMonth: 14
            },
            desc: 'Ytterligare linjebataljon från mobiliseringen 1864.'
        },
        par_cavalry: {
            id: 'par_cavalry',
            name: 'Regimiento de Caballería',
            faction: 'PAR',
            availableFromStart: true,
            requiredTech: null,
            requiredBuilding: 'cavalry_estancia',
            category: 'cavalry',
            preferredCommander: 'barrios',
            cost: { gold: 70, manpower: 380, food: 55, modern_weapons: 5 },
            stats: {
                men: 360, women: 0,
                muskets: 100, rifles: 80, repeaters: 0,
                machetes: 360, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 5, range: 1,
                defenseBase: 3, attackBase: 6, accuracy: 48, shock: 65,
                cohesion: 60, moraleBase: 78, experienceGain: 10,
                foodConsumptionPerMonth: 20
            },
            desc: 'Reguljärt kavalleri med lansar och machetes. Stark chock.'
        },
        par_aca_caraya: {
            id: 'par_aca_caraya',
            name: 'Regimiento Acá Carayá',
            faction: 'PAR',
            availableFromStart: true,
            requiredTech: null,
            requiredBuilding: 'cavalry_estancia',
            category: 'cavalry',
            preferredCommander: 'lopez',
            cost: { gold: 90, manpower: 320, food: 60, modern_weapons: 10 },
            stats: {
                men: 320, women: 0,
                muskets: 80, rifles: 160, repeaters: 0,
                machetes: 320, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 5, range: 1,
                defenseBase: 4, attackBase: 7, accuracy: 58, shock: 75,
                cohesion: 80, moraleBase: 85, experienceGain: 12,
                foodConsumptionPerMonth: 22
            },
            desc: 'Elitkavalleri och presidentens eskort med vrålapshjälmar.'
        },
        par_militia: {
            id: 'par_militia',
            name: 'Guardia Nacional / Milis',
            faction: 'PAR',
            availableFromStart: true,
            requiredTech: null,
            category: 'militia',
            preferredCommander: null,
            cost: { gold: 25, manpower: 600, food: 30, modern_weapons: 0 },
            stats: {
                men: 420, women: 180,
                muskets: 350, rifles: 20, repeaters: 0,
                machetes: 600, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 2, range: 1,
                defenseBase: 3, attackBase: 3, accuracy: 40, shock: 30,
                cohesion: 45, moraleBase: 60, experienceGain: 6,
                foodConsumptionPerMonth: 12
            },
            desc: 'Mobiliserad milis. Billig men svagare än linjen. Kan bli veteraner.'
        },
        par_artillery: {
            id: 'par_artillery',
            name: 'Artilleribatteri Ybycuí',
            faction: 'PAR',
            availableFromStart: true,
            requiredTech: 'smoothbore_foundry',
            requiredBuilding: 'ybycui_foundry',
            category: 'artillery',
            preferredCommander: 'diaz',
            cost: { gold: 120, manpower: 165, food: 30, modern_weapons: 15 },
            stats: {
                men: 140, women: 25,
                muskets: 60, rifles: 20, repeaters: 0,
                machetes: 100, cannons: 12, whitworths: 2, gatlings: 0,
                movePoints: 2, range: 3,
                defenseBase: 3, attackBase: 8, accuracy: 62, shock: 20,
                cohesion: 65, moraleBase: 70, experienceGain: 9,
                foodConsumptionPerMonth: 12
            },
            desc: 'Inhemskt gjutna kanoner inklusive jättekanonen El Cristiano.'
        },
        par_ironclad: {
            id: 'par_ironclad',
            name: 'Ångkorvetten Tacuarí',
            faction: 'PAR',
            availableFromStart: true,
            requiredTech: 'river_steamers',
            requiredBuilding: 'asuncion_shipyard',
            category: 'naval',
            preferredCommander: 'robles',
            cost: { gold: 180, manpower: 180, food: 35, modern_weapons: 25 },
            stats: {
                men: 180, women: 0,
                muskets: 60, rifles: 80, repeaters: 0,
                machetes: 150, cannons: 8, whitworths: 2, gatlings: 0,
                movePoints: 4, range: 2,
                navalOnly: true,
                defenseBase: 7, attackBase: 6, accuracy: 60, shock: 15,
                cohesion: 75, moraleBase: 80, experienceGain: 7,
                foodConsumptionPerMonth: 14
            },
            desc: 'Paraguays flaggskepp på floden.'
        },

        // ==================== PARAGUAY RESEARCHBARA ====================
        par_residentas: {
            id: 'par_residentas',
            name: 'Batallón Las Residentas',
            faction: 'PAR',
            availableFromStart: false,
            requiredTech: 'womens_agrarian_brigades',
            requiredBuilding: 'mechanized_estancia',
            category: 'militia',
            cost: { gold: 30, manpower: 450, food: 25, modern_weapons: 0 },
            stats: {
                men: 90, women: 360,
                muskets: 210, rifles: 40, repeaters: 0,
                machetes: 450, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 3, range: 1,
                defenseBase: 6, attackBase: 4, accuracy: 50, shock: 35,
                cohesion: 70, moraleBase: 82, experienceGain: 10,
                foodConsumptionPerMonth: 10
            },
            desc: 'Kvinnliga försvarare och milis. Hög moral i hemlandet.'
        },
        par_whitworth_battery: {
            id: 'par_whitworth_battery',
            name: 'Whitworth- & Kruppbatteri',
            faction: 'PAR',
            availableFromStart: false,
            requiredTech: 'whitworth_rifled_artillery',
            requiredBuilding: 'arsenal_asuncion',
            category: 'artillery',
            cost: { gold: 200, manpower: 160, food: 35, modern_weapons: 40 },
            stats: {
                men: 145, women: 15,
                muskets: 0, rifles: 80, repeaters: 0,
                machetes: 80, cannons: 4, whitworths: 12, gatlings: 0,
                movePoints: 2, range: 4,
                defenseBase: 4, attackBase: 10, accuracy: 78, shock: 25,
                cohesion: 72, moraleBase: 75, experienceGain: 11,
                foodConsumptionPerMonth: 14
            },
            desc: 'Räfflade precisionskanoner med lång räckvidd.'
        },
        par_repeater_cavalry: {
            id: 'par_repeater_cavalry',
            name: 'Escuadrón Andino (Spencer)',
            faction: 'PAR',
            availableFromStart: false,
            requiredTech: 'spencer_repeating_rifles',
            requiredBuilding: 'cavalry_estancia',
            category: 'cavalry',
            cost: { gold: 160, manpower: 300, food: 55, modern_weapons: 35 },
            stats: {
                men: 300, women: 0,
                muskets: 0, rifles: 50, repeaters: 250,
                machetes: 300, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 5, range: 1,
                defenseBase: 5, attackBase: 8, accuracy: 70, shock: 70,
                cohesion: 75, moraleBase: 80, experienceGain: 12,
                foodConsumptionPerMonth: 20
            },
            desc: 'Kavalleri med repeterkarbiner. Extrem eldkraft.'
        },
        par_torpedo_canoes: {
            id: 'par_torpedo_canoes',
            name: 'Torpedkanoter & Chatas',
            faction: 'PAR',
            availableFromStart: false,
            requiredTech: 'spar_torpedoes',
            requiredBuilding: 'asuncion_shipyard',
            category: 'naval',
            cost: { gold: 85, manpower: 120, food: 20, modern_weapons: 15 },
            stats: {
                men: 120, women: 0,
                muskets: 20, rifles: 40, repeaters: 0,
                machetes: 120, cannons: 2, whitworths: 0, gatlings: 0,
                movePoints: 4, range: 1,
                navalOnly: true,
                defenseBase: 5, attackBase: 9, accuracy: 55, shock: 40,
                cohesion: 68, moraleBase: 78, experienceGain: 10,
                foodConsumptionPerMonth: 8
            },
            desc: 'Nattliga pansarskeppsjägare med stångtorpeder.'
        },
        par_gatling_battery: {
            id: 'par_gatling_battery',
            name: 'Gatling-kulsprutekompaniet',
            faction: 'PAR',
            availableFromStart: false,
            requiredTech: 'gatling_gun_tech',
            requiredBuilding: 'arsenal_asuncion',
            category: 'artillery',
            cost: { gold: 240, manpower: 140, food: 30, modern_weapons: 55 },
            stats: {
                men: 120, women: 20,
                muskets: 0, rifles: 60, repeaters: 60,
                machetes: 100, cannons: 0, whitworths: 2, gatlings: 10,
                movePoints: 3, range: 2,
                defenseBase: 6, attackBase: 12, accuracy: 65, shock: 30,
                cohesion: 70, moraleBase: 76, experienceGain: 10,
                foodConsumptionPerMonth: 12
            },
            desc: 'Experimentell eldmur. Förödande i försvar.'
        },

        // ==================== BRASILIEN ====================
        bra_line: {
            id: 'bra_line',
            name: 'Batalhão de Fuzileiros',
            faction: 'BRA',
            availableFromStart: true,
            requiredTech: null,
            category: 'infantry',
            preferredCommander: 'caxias',
            cost: { gold: 65, manpower: 600, food: 50, modern_weapons: 20 },
            stats: {
                men: 550, women: 0,
                muskets: 150, rifles: 400, repeaters: 0,
                machetes: 200, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 3, range: 1,
                defenseBase: 5, attackBase: 5, accuracy: 65, shock: 42,
                cohesion: 72, moraleBase: 70, experienceGain: 7,
                foodConsumptionPerMonth: 18
            },
            desc: 'Brasilianskt linjeinfanteri med Minié-gevär.'
        },
        bra_cacadores: {
            id: 'bra_cacadores',
            name: 'Batalhão de Caçadores',
            faction: 'BRA',
            availableFromStart: true,
            requiredTech: null,
            category: 'infantry',
            preferredCommander: 'osorio',
            cost: { gold: 70, manpower: 480, food: 45, modern_weapons: 25 },
            stats: {
                men: 450, women: 0,
                muskets: 50, rifles: 400, repeaters: 0,
                machetes: 150, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 3, range: 1,
                defenseBase: 4, attackBase: 6, accuracy: 70, shock: 45,
                cohesion: 68, moraleBase: 72, experienceGain: 8,
                foodConsumptionPerMonth: 16
            },
            desc: 'Lätt infanteri / skarpskyttar. Bra precision.'
        },
        bra_cavalry: {
            id: 'bra_cavalry',
            name: 'Regimento de Cavalaria',
            faction: 'BRA',
            availableFromStart: true,
            requiredTech: null,
            category: 'cavalry',
            preferredCommander: 'osorio',
            cost: { gold: 85, manpower: 400, food: 65, modern_weapons: 15 },
            stats: {
                men: 380, women: 0,
                muskets: 80, rifles: 120, repeaters: 0,
                machetes: 380, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 5, range: 1,
                defenseBase: 3, attackBase: 7, accuracy: 50, shock: 72,
                cohesion: 65, moraleBase: 75, experienceGain: 9,
                foodConsumptionPerMonth: 24
            },
            desc: 'Brasilianskt kavalleri från Rio Grande do Sul.'
        },

        // ==================== ARGENTINA ====================
        arg_line: {
            id: 'arg_line',
            name: 'Batallón de Línea Argentino',
            faction: 'ARG',
            availableFromStart: true,
            requiredTech: null,
            category: 'infantry',
            preferredCommander: 'mitre',
            cost: { gold: 55, manpower: 450, food: 40, modern_weapons: 10 },
            stats: {
                men: 420, women: 0,
                muskets: 200, rifles: 220, repeaters: 0,
                machetes: 200, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 3, range: 1,
                defenseBase: 4, attackBase: 4, accuracy: 58, shock: 38,
                cohesion: 60, moraleBase: 65, experienceGain: 7,
                foodConsumptionPerMonth: 15
            },
            desc: 'Argentinskt linjeinfanteri. Begränsad styrka 1864.'
        },

        // ==================== URUGUAY ====================
        uru_colorado: {
            id: 'uru_colorado',
            name: 'División Colorada de Flores',
            faction: 'URU',
            availableFromStart: true,
            requiredTech: null,
            category: 'infantry',
            preferredCommander: 'flores',
            cost: { gold: 40, manpower: 280, food: 25, modern_weapons: 5 },
            stats: {
                men: 260, women: 0,
                muskets: 120, rifles: 140, repeaters: 0,
                machetes: 200, cannons: 0, whitworths: 0, gatlings: 0,
                movePoints: 3, range: 1,
                defenseBase: 4, attackBase: 4, accuracy: 55, shock: 40,
                cohesion: 55, moraleBase: 70, experienceGain: 8,
                foodConsumptionPerMonth: 10
            },
            desc: 'Liten men motiverad uruguaysk styrka under Flores.'
        }
    },

    // Erfarenhetssystem
    experienceLevels: [
        { level: 0, name: 'Rekryt', bonus: 0 },
        { level: 1, name: 'Tränad', bonus: 5 },
        { level: 2, name: 'Erfaren', bonus: 12 },
        { level: 3, name: 'Veteran', bonus: 20 },
        { level: 4, name: 'Elit', bonus: 30 },
        { level: 5, name: 'Legendarisk', bonus: 42 }
    ],

    getExperienceBonus: function(xp) {
        const thresholds = [0, 30, 80, 160, 280, 450];
        let level = 0;
        for (let i = thresholds.length - 1; i >= 0; i--) {
            if (xp >= thresholds[i]) { level = i; break; }
        }
        return this.experienceLevels[level] || this.experienceLevels[0];
    }
};
