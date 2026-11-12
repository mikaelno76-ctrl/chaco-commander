// === DATABLAD 1: TEKNOLOGIER, FORSKNING & HANDEL 1864-1870+ (data_teknologi.js) ===
// Styr hela teknologiträdet i bakgrunden:
// - Vilka teknologier som fanns 1864 och hur de utvecklades (eller kan påskyndas!)
// - Vilka länder som sitter på vilka teknologier (för handel, allianser i diplomati.html eller stöld i elituppdrag.html)
// - Vad varje teknologi låser upp i form av nya trupper (data_trupper.js) och fabriker/jordbruk (data_industri_jordbruk.js)

window.DataTeknologi = {
    // Vilka teknologier respektive land startar med i november 1864
    countryStartingTechs: {
        PAR: ['flintlock_muskets', 'smoothbore_foundry', 'optical_telegraph', 'river_steamers', 'state_estancias'],
        BRA: ['minie_rifles', 'whitworth_rifled_artillery', 'ironclad_hulls', 'morse_telegraph', 'observation_balloons'],
        ARG: ['minie_rifles', 'krupp_steel_artillery', 'morse_telegraph', 'barbed_wire_fencing', 'railroad_logistics'],
        CHL: ['chilean_saltpeter_powder', 'mountain_howitzers', 'spencer_repeating_rifles', 'pacific_steam_fleet'],
        BOL: ['andean_mule_logistics', 'quicksilver_fulminate', 'high_altitude_warfare', 'cinchona_quinine'],
        PER: ['ironclad_turret_ships', 'callao_heavy_coastal_guns', 'guano_fertilizer'],
        EUR_USA: ['gatling_gun_tech', 'breechloading_rifles', 'bessemer_steel', 'spar_torpedoes', 'liebig_meat_extract', 'submersible_prototype']
    },

    // Komplett katalog över alla teknologier (Historiska 1864-1870 + Allians/Handel + Experimentella "What-If")
    catalog: {
        // === BAS-TEKNOLOGIER (1864 START FÖR PARAGUAY) ===
        flintlock_muskets: {
            id: 'flintlock_muskets',
            name: 'Flintlås- & Slaglåsmusköter (Chispa)',
            era: 1864,
            category: 'infantry',
            origin: 'PAR',
            researchCost: 0,
            desc: 'Slätborrade musköter. Kort räckvidd och känsliga för regn i träsken, men kan tillverkas lokalt.',
            effects: { infantryRange: 1, infantryFirepower: 1.0 }
        },
        smoothbore_foundry: {
            id: 'smoothbore_foundry',
            name: 'Brons- & Järngjuteriet i Ybycuí',
            era: 1864,
            category: 'artillery',
            origin: 'PAR',
            researchCost: 0,
            desc: 'Låter oss gjuta tunga slätborrade kanoner (inklusive 80-pundaren El Cristiano av kyrkklockor).',
            effects: { unlocksUnits: ['par_artillery'], factoryBonus: 1.1 }
        },
        river_steamers: {
            id: 'river_steamers',
            name: ' Beväpnade Hjulångare (Vapor Tacuarí)',
            era: 1864,
            category: 'naval',
            origin: 'PAR',
            researchCost: 0,
            desc: 'Ombyggda post- och passagerarångare i trä med kanondäck. Snabba på Río Paraguay men sårbara för pansarskepp.',
            effects: { unlocksUnits: ['par_ironclad'] }
        },
        state_estancias: {
            id: 'state_estancias',
            name: 'Estancias de la Patria (Statliga Storgods)',
            era: 1864,
            category: 'agriculture',
            origin: 'PAR',
            researchCost: 0,
            desc: 'Staten äger jorden och boskapshjordarna. Grunden för arméns kött-, maniok- och Yerba Mate-försörjning.',
            effects: { foodProduction: 1.0 }
        },

        // === MILITÄR UTVECKLING (1865-1868) ===
        minie_rifles: {
            id: 'minie_rifles',
            name: 'Räfflade Minié- & Enfieldgevär (M1853)',
            era: 1865,
            category: 'infantry',
            origin: 'BRA/ARG/EUR',
            prereq: ['flintlock_muskets'],
            researchCost: 180,
            desc: 'Konisk Minié-kula som expanderar i det räfflade loppet. Tredubblar träffsäkerheten mot slätborrade musköter!',
            effects: { rifleConversionRate: 0.35, infantryFirepower: 1.35 }
        },
        morse_telegraph: {
            id: 'morse_telegraph',
            name: 'Elektrisk Fälttelegraf (Fischer von Treuenfeld)',
            era: 1865,
            category: 'command',
            origin: 'PAR/EUR',
            researchCost: 140,
            desc: 'Kopplar ihop Asunción, Humaitá och frontlinjen vid Paso Pucú i realtid. Ger enormt övertag i samordning!',
            effects: { initiativeBonus: 2, artilleryAccuracy: 1.15 }
        },
        whitworth_rifled_artillery: {
            id: 'whitworth_rifled_artillery',
            name: 'Sexkantigt Räfflade Whitworth-kanoner',
            era: 1866,
            category: 'artillery',
            origin: 'BRA/UK',
            prereq: ['smoothbore_foundry'],
            researchCost: 260,
            canStealFrom: 'BRA',
            desc: 'Brittiskt bakladdat/räfflat precisionsartilleri med sexkantiga granater. Skjuter längre och slår igenom skansar!',
            effects: { artilleryRangeBonus: 1, unlocksUnits: ['par_whitworth_battery'] }
        },
        spar_torpedoes: {
            id: 'spar_torpedoes',
            name: 'Flodminor & Stångtorpeder (Torpedos de Botalón)',
            era: 1866,
            category: 'naval',
            origin: 'PAR/USA',
            prereq: ['river_steamers'],
            researchCost: 200,
            desc: 'Flytande krutminor och kanoter med sprängladdningar på långa stänger. Kan sänka brasilianska pansarskepp som Rio de Janeiro!',
            effects: { unlocksUnits: ['par_torpedo_canoes'], blockadeBreakChance: 0.25 }
        },
        ironclad_hulls: {
            id: 'ironclad_hulls',
            name: 'Pansarklädda Flodmonitorer (Encorazados)',
            era: 1866,
            category: 'naval',
            origin: 'BRA/EUR',
            prereq: ['river_steamers', 'smoothbore_foundry'],
            researchCost: 340,
            canStealFrom: 'BRA',
            desc: 'Valsade järnplåtar från Ybycuí och varvet i Asunción gör att vi kan bygga egna äkta pansarskepp (som Cándido López-projekten)!',
            effects: { unlocksUnits: ['par_true_ironclad'], unlocksBuildings: ['ironclad_shipyard'] }
        },
        observation_balloons: {
            id: 'observation_balloons',
            name: 'Förtöjda Spaningsballonger & Rökridåer',
            era: 1867,
            category: 'command',
            origin: 'BRA/USA',
            researchCost: 190,
            canStealFrom: 'BRA',
            desc: 'Vätgasballonger (som bröderna Allens ballong vid Tuyutí) samt paraguayanska eldar som lägger ut tät rök för att blända dem!',
            effects: { fogOfWarVision: 2, entrenchmentDefenseBonus: 0.15 }
        },

        // === CHILE, BOLIVIA & PERU-TEKNOLOGIER (FÅS VIA ALLIANS/HANDEL I DIPLOMATI.HTML) ===
        chilean_saltpeter_powder: {
            id: 'chilean_saltpeter_powder',
            name: 'Chilensk Salpeter & Högexplosivt Krut (Atacama)',
            era: 1865,
            category: 'industry',
            origin: 'CHL',
            allyRequired: 'chile',
            researchCost: 160,
            desc: 'Ren natriumnitrat från Chiles öken gruvor. Fördubblar krutproduktionen i Valenzuela och ger artilleriet +25% sprängkraft!',
            effects: { ammoPerTurnBonus: 3, artilleryFirepower: 1.25, unlocksBuildings: ['modern_powder_mill'] }
        },
        spencer_repeating_rifles: {
            id: 'spencer_repeating_rifles',
            name: 'Spencer & Henry Repeterkarbiner (7-skotts magasin)',
            era: 1866,
            category: 'infantry',
            origin: 'CHL/USA',
            allyRequired: 'chile',
            prereq: ['minie_rifles'],
            researchCost: 300,
            desc: 'Importerade via Valparaíso. En ryttare i Acá Carayá kan skjuta 14 skott i minuten istället för 2!',
            effects: { cavalryFirepower: 1.60, unlocksUnits: ['par_repeater_cavalry'] }
        },
        andean_mule_logistics: {
            id: 'andean_mule_logistics',
            name: 'Andinsk Högbergslogistik & Koka-ransoner',
            era: 1865,
            category: 'logistics',
            origin: 'BOL',
            allyRequired: 'bolivia',
            researchCost: 130,
            desc: 'Boliviansk expertis i att föra kanoner och trupper över 4 000 meters höjd utan utmattning.',
            effects: { mountainMoveCostReduction: 1, staminaRegenBonus: 15 }
        },
        cinchona_quinine: {
            id: 'cinchona_quinine',
            name: 'Bolivianskt Kinin (Cinchona-bark mot Malaria & Kolera)',
            era: 1865,
            category: 'agriculture',
            origin: 'BOL',
            allyRequired: 'bolivia',
            researchCost: 150,
            desc: 'Räddar tusentals soldater från träskfeber, dysenteri och kolera i lägren vid Humaitá och Corrientes!',
            effects: { monthlyDiseaseAttritionReduction: 0.75, manpowerRetention: 1.25 }
        },

        // === JORDBRUK, LIVSMEDEL & INDUSTRI (HEMMAFRONTEN) ===
        womens_agrarian_brigades: {
            id: 'womens_agrarian_brigades',
            name: 'Las Destinadas & Mekaniserat Jordbruk',
            era: 1866,
            category: 'agriculture',
            origin: 'PAR',
            prereq: ['state_estancias'],
            researchCost: 140,
            desc: 'Organiserar kvinnokooperativ med järnplogar från Ybycuí för tre skördar per år av majs, maniok (mandioca) och bönor när männen är vid fronten.',
            effects: { foodProduction: 1.50, unlocksUnits: ['par_residentas'], unlocksBuildings: ['mechanized_estancia'] }
        },
        corn_paper_and_textiles: {
            id: 'corn_paper_and_textiles',
            name: 'Inhemsk Textil- & Majspappersindustri (Caraguatá)',
            era: 1866,
            category: 'industry',
            origin: 'PAR',
            researchCost: 120,
            desc: 'När blockaden stoppar tyg och papper spinner vi uniformer av vild ananasfiber (Caraguatá) och bomull samt kokar papper av majsblad!',
            effects: { goldMaintenanceReduction: 0.25, unlocksBuildings: ['textile_arsenal'] }
        },
        liebig_meat_extract: {
            id: 'liebig_meat_extract',
            name: 'Konserverat Köttextrakt & Charqui-fabriker',
            era: 1867,
            category: 'agriculture',
            origin: 'URU/EUR',
            prereq: ['womens_agrarian_brigades'],
            researchCost: 210,
            desc: 'Industriell konservering av paraguayanskt nötkött (som i Fray Bentos). Gör att arméer kan marschera djupt in i Brasilien utan att svälta!',
            effects: { supplyRangeBonus: 2, unitHpRecoveryInField: 15, unlocksBuildings: ['meat_cannery'] }
        },

        // === SENA & EXPERIMENTELLA "TÄNK OM"-TEKNOLOGIER (1868-1870+ OM DU SPELAR KORTEN RÄTT!) ===
        breechloading_rifles: {
            id: 'breechloading_rifles',
            name: 'Bakladdade Chassepot- & Dreyse-gevär',
            era: 1867,
            category: 'infantry',
            origin: 'FRA/EUR',
            prereq: ['minie_rifles'],
            researchCost: 350,
            desc: 'Soldaterna kan ladda liggande i skydd i skyttegravarna vid Curupayty istället för att stå upp med laddstake!',
            effects: { infantryFirepower: 1.75, entrenchmentDefenseBonus: 0.25, unlocksUnits: ['par_guardia_elite'] }
        },
        gatling_gun_tech: {
            id: 'gatling_gun_tech',
            name: 'Kulsprutor: Gatling & Fransk Mitrailleuse',
            era: 1868,
            category: 'artillery',
            origin: 'USA/FRA',
            prereq: ['breechloading_rifles', 'smoothbore_foundry'],
            researchCost: 450,
            desc: 'Vevdrivna flerskottskanoner (200 skott/minut). Gör slarvsylta av brasilianska massanfall genom träskpassen!',
            effects: { unlocksUnits: ['par_gatling_battery'], suppressionMultiplier: 2.0 }
        },
        armored_war_trains: {
            id: 'armored_war_trains',
            name: 'Bepansrade Järnvägsbatterier (Ferrocarril de Asunción)',
            era: 1868,
            category: 'artillery',
            origin: 'PAR',
            prereq: ['ironclad_hulls', 'whitworth_rifled_artillery'],
            researchCost: 420,
            desc: 'Vi bygger ut Paraguays järnväg (Sydamerikas äldsta!) ända ner till fronten och monterar pansarplåt och tunga kanoner på tågvagnarna!',
            effects: { unlocksUnits: ['par_armored_train'], unlocksBuildings: ['military_rail_network'] }
        },
        congreve_Hale_rockets: {
            id: 'congreve_hale_rockets',
            name: 'Rotationsstabiliserade Hale-raketer & Djungelbrandbomber',
            era: 1869,
            category: 'artillery',
            origin: 'PAR/UK',
            prereq: ['chilean_saltpeter_powder'],
            researchCost: 380,
            desc: 'Vidareutveckling av 1860-talets krigsraketer med chilensk salpeter. Sätter eld på fiendens läger och skrämmer deras kavallerihästar i sken!',
            effects: { unlocksUnits: ['par_rocket_corps'], moraleShockDamage: 25 }
        },

        // === MÄNSKLIG UTVECKLING, TRÄNING & GUARANÍ-VÄSTERLÄNDSK HYBRIDTEKNIK ===
        cerro_leon_sharpshooters: {
            id: 'cerro_leon_sharpshooters',
            name: 'Prickskytteskolan i Cerro León (Ballistik & Avståndsbedömning)',
            era: 1865,
            category: 'training',
            origin: 'PAR',
            prereq: ['flintlock_muskets'],
            researchCost: 150,
            desc: 'Systematisk skjutträning där rekryterna lär sig vindavdrift, kulbanor och att krama avtryckaren. Gör underverk även med äldre vapen!',
            effects: { accuracyMultiplier: 1.25, unlocksBuildings: ['cerro_leon_academy'] }
        },
        guarani_shadow_doctrine: {
            id: 'guarani_shadow_doctrine',
            name: 'Ka\'aguy Póra (Guaraní Skogsvandring & Akustisk Krigföring)',
            era: 1865,
            category: 'hybrid',
            origin: 'PAR (Guaraní)',
            researchCost: 160,
            desc: 'Uråldrig Guaraní-kunskap om djungelns ljud, fågellätes-signaler och osynlig förflyttning kombineras med modern militär spaning.',
            effects: { stealthInfiltration: true, unlocksBuildings: ['kaaguy_guerrilla_school'] }
        },
        ybycui_compound_bows: {
            id: 'ybycui_compound_bows',
            name: 'Ybycuí-Guaraní Komposit- & Blockbåge (Guyraпа-Пятã)',
            era: 1866,
            category: 'hybrid',
            origin: 'PAR (Guaraní + Ybycuí)',
            prereq: ['guarani_shadow_doctrine', 'smoothbore_foundry'],
            researchCost: 240,
            desc: 'Guaraní-folkets legendariska långbågar i ultra-hårt Lapacho- och Yvyrapytã-trä förenas med brittisk ingenjörskonst från Ybycuí: excentriska brons-trissor (cam-hjul) och fjäderstål! Ljudlös, opåverkad av blött krut i regnskogen och med genomslagskraft som ett gevär!',
            effects: { silentLethality: 1.50, unlocksUnits: ['par_kaaguy_ghosts'] }
        },
        botanical_curare_alchemy: {
            id: 'botanical_curare_alchemy',
            name: 'Kemisk Växtalkemi & Curare-spetsar (Payé & Modern Kemi)',
            era: 1867,
            category: 'hybrid',
            origin: 'PAR/BOL',
            prereq: ['ybycui_compound_bows'],
            researchCost: 220,
            desc: 'Schamanernas kunskap om neurotoxiska lianer (Strychnos) och pilgiftsgrodor destilleras i kemiska laboratorier till dödliga stålpilspetsar och ljudlösa blåsrör.',
            effects: { guerrillaAttritionDamageBonus: 0.45 }
        }
    }
};