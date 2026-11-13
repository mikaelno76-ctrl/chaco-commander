// === DATABLAD 3: FABRIKER, KRIGSINDUSTRI & JORDBRUK (data_industri_jordbruk.js) ===
// Styr Paraguays unika statsägda ekonomi, fabriker och jordbruk:
// - Vilka industrier och jordbruk som fanns från början i november 1864
// - Vilka som tillkom under kriget (t.ex. när blockaden tvingade fram inhemsk produktion)
// - Vilka avancerade fabriker man kan bygga om man satsar hårt på teknologiutveckling!

window.DataIndustriJordbruk = {
    // =========================================================================
    // A. FABRIKER & MILITÄR INFRASTRUKTUR
    // =========================================================================
    factories: {
        // --- FANNS REDAN VID KRIGSUTBROTTET 1864 ---
        ybycui_foundry: {
            id: 'ybycui_foundry',
            name: 'Järnbruket & Kanongjuteriet La Rosada i Ybycuí',
            location: 'asuncion',
            builtAtStart: true,
            maxLevel: 3,
            startLevel: 1,
            requiredTech: 'smoothbore_foundry',
            buildCost: { gold: 180, yerba: 60 },
            monthlyOutput: { modern_weapons: 8, cannons_cast: 2, researchPoints: 10 },
            desc: 'Grundat av Carlos Antonio López med hjälp av brittiska ingenjörer (Whytehead & गोडwin). Smälter inhemsk järnmalm och kyrkklockor till kanoner och kulor!'
        },
        arsenal_asuncion: {
            id: 'arsenal_asuncion',
            name: 'Arsenalen & Vapenverkstäderna i Asunción',
            location: 'asuncion',
            builtAtStart: true,
            maxLevel: 3,
            startLevel: 1,
            requiredTech: null,
            buildCost: { gold: 160, yerba: 50 },
            monthlyOutput: { modern_weapons: 10, rifles_repaired: 35, researchPoints: 12 },
            desc: 'Tillverkar lavetter, sablar, lansar och konverterar flintlåsmusköter till slaglås och räfflade lopp.'
        },
        asuncion_shipyard: {
            id: 'asuncion_shipyard',
            name: 'Skeppsvarvet & Ångmaskinsverkstaden (Astillero de Asunción)',
            location: 'asuncion',
            builtAtStart: true,
            maxLevel: 3,
            startLevel: 1,
            requiredTech: 'river_steamers',
            buildCost: { gold: 170, yerba: 70 },
            monthlyOutput: { gold: 20, naval_repair: 1, researchPoints: 8 },
            desc: 'Bygger och bestyckar flodångare och kanonpråmar (Chatas) av oförstörbart paraguayanskt Lapacho- och Quebracho-trä.'
        },
        valenzuela_powder_works: {
            id: 'valenzuela_powder_works',
            name: 'Svartkrutsbruket & Svavelgruvan i Valenzuela',
            location: 'asuncion',
            builtAtStart: true,
            maxLevel: 3,
            startLevel: 1,
            requiredTech: null,
            buildCost: { gold: 140, yerba: 50 },
            monthlyOutput: { ammo_supply: 20, modern_weapons: 5 },
            desc: 'Producerar krut av inhemskt svavel och träkol för arméns musköter och batterierna vid Humaitá.'
        },

        // --- TILLKOM UNDER KRIGET / KAN BYGGAS UT ---
        textile_arsenal: {
            id: 'textile_arsenal',
            name: 'Textil-, Uniforms- & Majspappersfabriken (Caraguatá)',
            location: 'asuncion',
            builtAtStart: false,
            maxLevel: 2,
            startLevel: 0,
            requiredTech: 'corn_paper_and_textiles',
            buildCost: { gold: 150, yerba: 80 },
            monthlyOutput: { gold: 45, moraleBonus: 5 },
            desc: 'Ersätter importerat europeiskt kläde och papper under blockaden genom att väva uniformer av vild ananasfiber och bomull.'
        },
        modern_powder_mill: {
            id: 'modern_powder_mill',
            name: 'Kemiskt Salpeter- & Tändhattsverk (Atacama-import)',
            location: 'chaco_bolivia',
            builtAtStart: false,
            maxLevel: 2,
            startLevel: 0,
            requiredTech: 'chilean_saltpeter_powder',
            buildCost: { gold: 220, yerba: 100 },
            monthlyOutput: { modern_weapons: 18, ammo_supply: 45, researchPoints: 15 },
            desc: 'Förädlar chilensk salpeter och bolivianskt kvicksilver till högexplosivt artillerikrut och knallkvicksilver-tändhattar!'
        },
        ironclad_shipyard: {
            id: 'ironclad_shipyard',
            name: 'Pansarskeppsvarv & Valsverk för Pansarplåt',
            location: 'asuncion',
            builtAtStart: false,
            maxLevel: 2,
            startLevel: 0,
            requiredTech: 'ironclad_hulls',
            buildCost: { gold: 320, yerba: 120 },
            monthlyOutput: { modern_weapons: 20, researchPoints: 20 },
            desc: 'Avancerad anläggning som valsar tjocka järnplåtar för att bygga våra egna pansrade monitorer på Río Paraguay.'
        },
        military_rail_network: {
            id: 'military_rail_network',
            name: 'Pansarjärnväg & Lokomotivverkstad (Asunción–Paraguarí–Humaitá)',
            location: 'asuncion',
            builtAtStart: false,
            maxLevel: 2,
            startLevel: 0,
            requiredTech: 'armored_war_trains',
            buildCost: { gold: 350, yerba: 140 },
            monthlyOutput: { gold: 50, modern_weapons: 15, researchPoints: 18 },
            desc: 'Förlänger järnvägen hela vägen till södra fronten och bygger bepansrade artilleritåg.'
        },
        cerro_leon_academy: {
            id: 'cerro_leon_academy',
            name: 'Campamento Cerro León (Prickskytte- & Befälsskola)',
            location: 'asuncion',
            builtAtStart: true,
            maxLevel: 3,
            startLevel: 1,
            requiredTech: 'cerro_leon_sharpshooters',
            buildCost: { gold: 140, yerba: 50 },
            monthlyOutput: { researchPoints: 14, unitTrainingXP: 10 },
            desc: 'Paraguays stora träningsläger i Pirayú-dalen. Varje utbyggnad ökar träffsäkerheten och disciplinen hos alla våra trupper med +10%!'
        },
        kaaguy_guerrilla_school: {
            id: 'kaaguy_guerrilla_school',
            name: 'Ka\'aguy-Akademin & Bågmakeriet i Ybycuí (Guaraní-Hybrid)',
            location: 'matogrosso_sur',
            builtAtStart: false,
            maxLevel: 3,
            startLevel: 0,
            requiredTech: 'guarani_shadow_doctrine',
            buildCost: { gold: 170, yerba: 70 },
            monthlyOutput: { modern_weapons: 12, researchPoints: 15, guerrillaSkillBonus: 15 },
            desc: 'Där Guaraní-mästare och metallurger smider fjäderståls- och Lapacho-compoundbågar och tränar elitspejare i total osynlighet och nattlig infiltration!'
        }
    },

    // =========================================================================
    // B. JORDBRUK, BOSKAPSSKÖTSEL & LIVSMEDELSFÖRSÖRJNING
    // =========================================================================
    agriculture: {
        estancias_patria: {
            id: 'estancias_patria',
            name: 'Estancias de la Patria (64 Statliga Boskapsgods)',
            location: 'matogrosso_sur',
            builtAtStart: true,
            maxLevel: 3,
            startLevel: 1,
            requiredTech: 'state_estancias',
            buildCost: { gold: 120, yerba: 40 },
            monthlyOutput: { food: 120, manpower: 25, gold: 20 },
            desc: 'Enorma hjordar med tiotusentals nötkreatur och hästar i Mato Grosso del Sur och Misiones som förser armén med färskt kött och remonter.'
    