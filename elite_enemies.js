// === ELITE ENEMIES: FIENDROSTER FÖR NÄRSTRID v1 ===
// Vanliga soldater + övernaturliga hot.
// Conquistador-zombien är medvetet extrem.

window.EliteEnemies = {
    enemies: {
        bra_scout: {
            id: 'bra_scout',
            name: 'Brasiliansk jägarscout',
            faction: 'BRA',
            type: 'human',
            hp: 90,
            skill: 70,
            portrait: 'portraits/enemies/bra_scout.jpg',
            fullbody: 'portraits/enemies_fullbody/bra_scout_fight.jpg',
            bio: 'Lätt utrustad scout från Mato Grosso-gränsen. Snabb och tyst.',
            combatStyle: 'Bajonett och machete. Försöker sticka snabbt.'
        },
        bra_veteran: {
            id: 'bra_veteran',
            name: 'Brasiliansk veteran',
            faction: 'BRA',
            type: 'human',
            hp: 120,
            skill: 80,
            portrait: 'portraits/enemies/bra_veteran.jpg',
            fullbody: 'portraits/enemies_fullbody/bra_veteran_fight.jpg',
            bio: 'Erfaren soldat från Rio Grande. Har sett för mycket.',
            combatStyle: 'Tung och metodisk. Bryter armar och krossar.'
        },
        arg_gaucho: {
            id: 'arg_gaucho',
            name: 'Argentinsk gaucho',
            faction: 'ARG',
            type: 'human',
            hp: 100,
            skill: 75,
            portrait: 'portraits/enemies/arg_gaucho.jpg',
            fullbody: 'portraits/enemies_fullbody/arg_gaucho_fight.jpg',
            bio: 'Ryttare från pampas som tvingats till fots. Farlig med kniv.',
            combatStyle: 'Snabba hugg och sparkar. Rörlig.'
        },
        conquistador_zombie: {
            id: 'conquistador_zombie',
            name: 'Conquistador-zombien',
            faction: 'UNDEAD',
            type: 'supernatural',
            hp: 180,
            skill: 65,
            portrait: 'portraits/enemies/conquistador.jpg',
            fullbody: 'portraits/enemies_fullbody/conquistador_fight.jpg',
            bio: 'En spansk conquistador från 1500-talet som vägrar dö. Rustningen är rostig och full av hål. Köttet under är förmultnat och rör sig fortfarande. Han luktar grav och gammalt blod. Ögonen lyser svagt i mörkret.',
            combatStyle: 'Långsam men omöjlig att stoppa. Hugger med rostigt svärd tills motståndaren är i bitar. Känner ingen smärta.'
        },
        pombero: {
            id: 'pombero',
            name: 'Pombero',
            faction: 'MYTH',
            type: 'supernatural',
            hp: 110,
            skill: 85,
            portrait: 'portraits/enemies/pombero.jpg',
            fullbody: 'portraits/enemies_fullbody/pombero_fight.jpg',
            bio: 'Guaraní-ande. Liten, hårig, med förvridet ansikte och klor. Smyger i skuggorna och stjäl andetag.',
            combatStyle: 'Snabba klösningar. Försvinner och dyker upp bakom dig.'
        },
        mbói_tu_i: {
            id: 'mboi',
            name: 'Mbói Tu\'ĩ',
            faction: 'MYTH',
            type: 'supernatural',
            hp: 140,
            skill: 72,
            portrait: 'portraits/enemies/mboi.jpg',
            fullbody: 'portraits/enemies_fullbody/mboi_fight.jpg',
            bio: 'Jätteorm med papegojhuvud från Guaraní-mytologin. Giftig och enorm.',
            combatStyle: 'Slingrar sig runt offret och biter. Giftet bränner.'
        }
    },

    getRandom: function(type) {
        const list = Object.values(this.enemies).filter(e => !type || e.type === type);
        return list[Math.floor(Math.random() * list.length)];
    },

    getById: function(id) {
        return this.enemies[id] || null;
    }
};
