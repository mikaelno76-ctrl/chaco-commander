// === DATABLAD 4: ELIDFÖRBANDETS SPECIALSOLDATER, STATS, LEVELS, FÖRMÅGOR & EXKLUSIVA VAPENKAMMARE (data_elitsoldater.js) ===
// Hanterar dina 6 handplockade specialister, deras porträtt, attribut (Styrka, Smidighet, Prickskytte, Närstrid, Uthållighet, Andlig Kraft / Payé),
// XP, Levels, Färdighetspoäng (Skill Points) och personliga 3-facks Inventory med 1860-talets mest exklusiva vapen och ockulta reliker!

window.DataElitSoldater = {
    // Exklusiv Katalog av Masterwork-vapen, prototyper och schamanska artefakter (Inget dussinkrams!)
    exclusiveArmory: {
        // --- EXKLUSIVA SKJUTVAPEN & PROTOTYPER ---
        whitworth_hex_sniper: {
            id: 'whitworth_hex_sniper',
            name: 'Whitworth Hexagonal Prickskyttegevär (Med Mässingsteleskop)',
            slot: 'primary',
            rarity: 'Legendariskt Mästerverk',
            cost: { gold: 0, modern_weapons: 0 },
            bonuses: { marksmanship: +18, critChance: +15, power: +12 },
            desc: 'Specialimporterat från Manchester via blockadbrytare. Sexkantigt räfflat lopp och kalibrerat kikarsikte i polerad mässing. Träffar en knapp på 800 stegs avstånd.'
        },
        spencer_carbine_gold: {
            id: 'spencer_carbine_gold',
            name: 'Spencer 7-Skotts Repeterkarbin (Guldgraverad Specialutgåva)',
            slot: 'primary',
            rarity: 'Exklusiv Import',
            cost: { gold: 140, modern_weapons: 12 },
            bonuses: { marksmanship: +12, agility: +6, power: +14 },
            desc: 'Amerikansk hävarmrepeter med 7 kopparhylsor i kolven. Låter bäraren tömma en hel salva på några sekunder mitt i djungeldimman.'
        },
        ybycui_compound_bow: {
            id: 'ybycui_compound_bow',
            name: 'Guyrapa-Pytã (Ybycuí-Guaraní Blockbåge med Curare-pilar)',
            slot: 'primary',
            rarity: 'Hemlig Hybrid-Prototyp',
            cost: { gold: 110, modern_weapons: 8 },
            bonuses: { agility: +12, marksmanship: +14, spiritPaye: +8, power: +15 },
            desc: 'Stomme av stenhårt Lapacho-trä kombinerat med excentriska brons-trissor från gjuteriet i Ybycuí. Helt ljudlös och bestruken med lian-curare.'
        },
        lefaucheux_duel_pair: {
            id: 'lefaucheux_duel_pair',
            name: 'Par i Franska Lefaucheux Stiftantändnings-Revolvrar (Silverinlagda)',
            slot: 'primary',
            rarity: 'Officers-Special',
            cost: { gold: 0, modern_weapons: 0 },
            bonuses: { agility: +10, marksmanship: +10, melee: +6, power: +10 },
            desc: 'Dubbla 12 mm officersrevolvrar från Paris med elfenbenskolvar. Dödsbringande i trånga katakomber och flodübergångar.'
        },
        double_elephant_gun: {
            id: 'double_elephant_gun',
            name: 'Dubbelpipig Brittisk Kaliber .577 Express-Studsare ("Jaguardödaren")',
            slot: 'primary',
            rarity: 'Mästerverk',
            cost: { gold: 160, modern_weapons: 15 },
            bonuses: { strength: +8, power: +22, marksmanship: +6 },
            desc: 'Laddad med tunga blykulor och chilenskt salpeterkrut. Slår rakt igenom spanska bröstharnesk och krossar revbenen bakom.'
        },

        // --- EXKLUSIVA NÄRSTRIDSVAPEN ---
        toledo_machete_acacaraya: {
            id: 'toledo_machete_acacaraya',
            name: 'Toledo-Smidd Acá Carayá-Sabelmachete',
            slot: 'secondary',
            rarity: 'Elitvapen',
            cost: { gold: 0, modern_weapons: 0 },
            bonuses: { melee: +15, strength: +6, power: +11 },
            desc: 'Klinga av spanskt fjäderstål med korgfäste i mässing. Klyver en fiendehjälm utan att eggen får en enda skråma.'
        },
        bloom_iron_gauntlets: {
            id: 'bloom_iron_gauntlets',
            name: 'Ybycuí Järnskodda Stridshandskar & Knogjärn ("Los Martillos")',
            slot: 'secondary',
            rarity: 'Unikt Specialsmide',
            cost: { gold: 0, modern_weapons: 0 },
            bonuses: { strength: +18, melee: +20, endurance: +10, power: +16 },
            desc: 'Specialgjutna åt Sargento Bloom i Ybycuí av nedsmälta brasilianska kanonkulor. Varje knytnävsslag träffar som en slägga.'
        },
        residenta_silver_facon: {
            id: 'residenta_silver_facon',
            name: 'Capitana Gómez Dubbla Silver-Facóns (Gaucho-Dolkar)',
            slot: 'secondary',
            rarity: 'Arvegods',
            cost: { gold: 0, modern_weapons: 0 },
            bonuses: { melee: +17, agility: +12, critChance: +14, power: +13 },
            desc: 'Rakbladsvassa paraguayanska stridsknivar med fästen av smitt silver från Potosí. Lätta, blixtsnabba och skoningslösa i närkamp.'
        },
        conquistador_halberd_relic: {
            id: 'conquistador_halberd_relic',
            name: 'Alvarados Förbannade Blodshillebard (1542)',
            slot: 'secondary',
            rarity: 'Mytiskt Krigsbyte',
            cost: { gold: 180, modern_weapons: 10 },
            bonuses: { strength: +14, melee: +18, spiritPaye: +10, power: +19 },
            desc: 'Bärgad ur de odöda conquistadorernas krypta. Eggen glöder svagt i mörkret och dricker fiendens livskraft vid varje hugg.'
        },
        takeda_katana_masamune: {
            id: 'takeda_katana_masamune',
            name: 'Sensei Takedas Katana ("Kuro-Kaze" – Sällsynt Tamahagane-stål)',
            slot: 'secondary',
            rarity: 'Japanskt Mästerverk (Santiago)',
            cost: { gold: 150, modern_weapons: 5 },
            bonuses: { melee: +24, agility: +14, critChance: +18, power: +18 },
            desc: 'Smidd i Edo av vikt Tamahagane-stål och förvärvad från Sensei Takeda Hiroshi i Santiago. Klyver spanska harnesk och brasilianska bajonetter i ett enda snitt.'
        },
        takeda_tanto_pair: {
            id: 'takeda_tanto_pair',
            name: 'Takedas Yoroidoshi Tantō-knivar (Pansarbrytande Stridsknivar)',
            slot: 'secondary',
            rarity: 'Samurajsmide (Santiago)',
            cost: { gold: 120, modern_weapons: 0 },
            bonuses: { melee: +19, agility: +16, critChance: +20, power: +15 },
            desc: 'Ovanliga japanska närstridsknivar med extra tjock rygg som tränger rakt igenom rustningsglipor och ger bonus i man-mot-man-strid.'
        },

        // --- ÖVERNATURLIGA TALISMANER, RELIKER & SPECIALUTRUSTNING ---
        kurupi_jaguar_totem: {
            id: 'kurupi_jaguar_totem',
            name: 'Jaguareté-Avá Blodstotem & Schamanfjädrar',
            slot: 'relic',
            rarity: 'Övernaturlig Guaraní-Relik',
            cost: { gold: 0, modern_weapons: 0 },
            bonuses: { spiritPaye: +24, agility: +10, endurance: +8, power: +12 },
            desc: 'Helig amulett välsignad av Payé Arandú. Framkallar skuggdimma som döljer patrullen och låter bäraren höra fiendens hjärtslag genom sten.'
        },
        tupas_thunder_shard: {
            id: 'tupas_thunder_shard',
            name: 'Skärva av Tupãs Åsksten (Solamulett)',
            slot: 'relic',
            rarity: 'Mytisk Artefakt',
            cost: { gold: 150, modern_weapons: 5 },
            bonuses: { spiritPaye: +20, strength: +10, critChance: +12, power: +15 },
            desc: 'Urladdar elektriska åskblixtar längs bärarens vapen vid kritiska träffar och bränner odöda spanska conquistadorer till aska.'
        },
        cerro_leon_chronometer: {
            id: 'cerro_leon_chronometer',
            name: 'Brittisk Ballistikkronometer & Vindmätare (London City)',
            slot: 'relic',
            rarity: ' Prototyp-Instrument',
            cost: { gold: 120, modern_weapons: 5 },
            bonuses: { marksmanship: +16, agility: +8, critChance: +10 },
            desc: 'Finmekaniskt instrument som beräknar kulbana, luftfuktighet och krutladdning på bråkdelen av en sekund.'
        },
        bolivian_coca_elixir: {
            id: 'bolivian_coca_elixir',
            name: 'Andinskt Koka- & Kinin-Elixir i Silverplunta',
            slot: 'relic',
            rarity: 'Alkemiskt Preparat',
            cost: { gold: 90, modern_weapons: 0 },
            bonuses: { endurance: +22, agility: +10, strength: +6 },
            desc: 'Bedövar all smärta, stoppar träskfeber och ger övermänsklig uthållighet under dygnslånga bakhåll.'
        },
        takeda_kenjutsu_scroll: {
            id: 'takeda_kenjutsu_scroll',
            name: 'Sensei Takedas Kenjutsu-Skriftrulle & Tsuba-Amulett',
            slot: 'relic',
            rarity: 'Samuraj-Relik (Santiago)',
            cost: { gold: 130, modern_weapons: 0 },
            bonuses: { melee: +16, agility: +12, spiritPaye: +12, critChance: +14 },
            desc: 'Hemlig stridskonstmanual från Takeda Hiroshi som skänker övermänsklig parering och dödlig precision med machete, bajonett och svärd.'
        }
    },

    // De 6 Elitsoldaterna med dina porträtt och skräddarsydda stats!
    defaultRoster: {
        rojas: {
            id: 'rojas',
            squadSlot: 'front',
            name: 'Teniente Tomás Rojas',
            title: 'Spjutspets & Patrullbefälhavare',
            roleBadge: '⚔️ SPJUTSPETS (FRAM)',
            portrait: 'portraits/elite/rojas.jpg',
            level: 3,
            xp: 240,
            xpToNext: 300,
            skillPoints: 2,
            hp: 115,
            maxHp: 115,
            stats: {
                strength: 76,      // Styrka
                agility: 78,       // Smidighet
                marksmanship: 82,  // Prickskytte
                melee: 85,         // Närstrid
                endurance: 80,     // Uthållighet
                spiritPaye: 45     // Övernaturlig / Andlig Kraft (Payé)
            },
            abilities: [
                { name: 'Blodig Frontbrytare', desc: '+25% skada med machete och revolvrar när han leder gruppen i spetsen.' },
                { name: 'Järnvilja från Humaitá', desc: 'Immun mot panik; höjer hela diamantformationens träffsäkerhet med +10%.' }
            ],
            equipped: {
                primary: 'lefaucheux_duel_pair',
                secondary: 'toledo_machete_acacaraya',
                relic: 'bolivian_coca_elixir'
            },
            bio: 'Ärrad kavalleri- och elitofficer som personligen svurit trohet till Mariscal López. Leder patrullen i 3D-katakomberna med sabeln i ena handen och revolvern i den andra.'
        },

        arandu: {
            id: 'arandu',
            squadSlot: 'left',
            name: 'Payé Arandú',
            title: 'Guaraní-Schaman & Andeskådare',
            roleBadge: '🔮 SCHAMAN (VÄNSTER FLANK)',
            portrait: 'portraits/elite/arandu.jpg',
            level: 4,
            xp: 360,
            xpToNext: 400,
            skillPoints: 3,
            hp: 100,
            maxHp: 100,
            stats: {
                strength: 62,
                agility: 84,
                marksmanship: 75,
                melee: 70,
                endurance: 78,
                spiritPaye: 98 // Extremt hög övernaturlig kraft!
            },
            abilities: [
                { name: 'Tupãs Heliga Svavelrök (Övernaturlig)', desc: 'Sveper in vänster flank i tät andedimma som förblindar fiender och bränner odöda conquistadorer.' },
                { name: 'Jaguareté-Avás Syn (Övernaturlig)', desc: 'Ser fiender och förbannade reliker rakt genom katakombväggar och läker patrullen efter strid.' },
                { name: 'Curare-Förbannelse', desc: 'Varje träff förgiftar målets blod och sänker dess hastighet och anfallskraft med 40%.' }
            ],
            equipped: {
                primary: 'ybycui_compound_bow',
                secondary: 'toledo_machete_acacaraya',
                relic: 'kurupi_jaguar_totem'
            },
            bio: 'Uråldrig medicinman och krigare från Misiones djupa skogar. Behärskar både Guaraní-folkets blodsmagi (Payé) och Ybycuís dödliga kompositbågar.'
        },

        villalba: {
            id: 'villalba',
            squadSlot: 'right',
            name: 'Cabo Elena Villalba',
            title: 'Mästerskytt från Cerro León',
            roleBadge: '🎯 PRICKSKYTT (HÖGER FLANK)',
            portrait: 'portraits/elite/villalba.jpg',
            level: 3,
            xp: 260,
            xpToNext: 300,
            skillPoints: 2,
            hp: 98,
            maxHp: 98,
            stats: {
                strength: 60,
                agility: 88,
                marksmanship: 97, // Extremt prickskytte!
                melee: 68,
                endurance: 74,
                spiritPaye: 52
            },
            abilities: [
                { name: 'Skott Genom Ögonhålan', desc: '35% chans till omedelbar kritisk fullträff som ignorerar conquistadorernas bröstplåt.' },
                { name: 'Kallblodig Vakthållning', desc: 'Skjuter automatiskt ned fiender som försöker flankera patrullen från höger.' }
            ],
            equipped: {
                primary: 'whitworth_hex_sniper',
                secondary: 'residenta_silver_facon',
                relic: 'cerro_leon_chronometer'
            },
            bio: 'Bästa skarpskytten som någonsin examinerats från Campamento Cerro León. Med sitt sexkantigt räfflade Whitworth-gevär släcker hon en fackla – eller ett glödande skelettöga – på 600 meter.'
        },

        bloom: {
            id: 'bloom',
            squadSlot: 'back',
            name: 'Sargento "Bloom" Brizuela',
            title: 'Järnsmeden & Ryggvakten (1865)',
            roleBadge: '🥊 RYGGVAKT (180° / BLOOM)',
            portrait: 'portraits/elite/bloom.jpg',
            level: 4,
            xp: 380,
            xpToNext: 400,
            skillPoints: 3,
            hp: 155,
            maxHp: 155,
            stats: {
                strength: 99,      // Omänsklig råstyrka!
                agility: 66,
                marksmanship: 64,
                melee: 96,         // Brutal närstridsmästare!
                endurance: 98,
                spiritPaye: 60
            },
            abilities: [
                { name: 'Ryggradsknäckaren (Fatality)', desc: 'Fångar bakhållsfiender bakom ryggen och krossar dem med sina järnskodda nävar.' },
                { name: 'Levande Pansarvägg', desc: 'Tål 40% mer stryk än någon annan soldat och skyddar hela patrullens ryggsektor.' }
            ],
            equipped: {
                primary: 'double_elephant_gun',
                secondary: 'bloom_iron_gauntlets',
                relic: 'tupas_thunder_shard'
            },
            bio: 'Tidigare storsmed vid kanongjuteriet i Ybycuí med rituella halstatueringar och nävar som smidesstäd. Den som smyger på patrullen bakifrån möter Sargento Bloom.'
        },

        gomez: {
            id: 'gomez',
            squadSlot: 'reserve_melee',
            name: 'Capitana María "La Residente" Gómez',
            title: 'Närstridsbefäl & Duellant',
            roleBadge: '🗡️ NÄRSTRIDSSPECIALIST',
            portrait: 'portraits/elite/gomez.jpg',
            level: 3,
            xp: 230,
            xpToNext: 300,
            skillPoints: 2,
            hp: 110,
            maxHp: 110,
            stats: {
                strength: 78,
                agility: 94,      // Blixtsnabb smidighet!
                marksmanship: 74,
                melee: 95,        // Dödlig med kniv & sabel!
                endurance: 82,
                spiritPaye: 64
            },
            abilities: [
                { name: 'Las Residentas Blodsdans', desc: 'Gör dubbel skada i närstrid (Lost Patrol-fighting) och öppnar pulsådror med dubbla Facón-knivar.' },
                { name: 'Akrobatisk Parering', desc: '40% chans att helt undvika fiendens hugg och kontra direkt i strupen.' }
            ],
            equipped: {
                primary: 'spencer_carbine_gold',
                secondary: 'residenta_silver_facon',
                relic: 'bolivian_coca_elixir'
            },
            bio: 'Befälhavare för elitkompaniet ur Las Residentas. Fruktad längs hela Paranáfloden för sin blixtsnabba knivteknik i nattliga räder.'
        },

        acosta: {
            id: 'acosta',
            squadSlot: 'reserve_scout',
            name: 'Soldado Pedro "El Joven" Acosta',
            title: '19-årig Elitspejare & Spion',
            roleBadge: '🦅 ELITSPEJARE (SCOUT)',
            portrait: 'portraits/elite/acosta.jpg',
            level: 2,
            xp: 140,
            xpToNext: 200,
            skillPoints: 2,
            hp: 92,
            maxHp: 92,
            stats: {
                strength: 64,
                agility: 96,      // Smyger ljudlöst överallt!
                marksmanship: 86,
                melee: 74,
                endurance: 84,
                spiritPaye: 58
            },
            abilities: [
                { name: 'Osynlig Skugga i Mato Grosso', desc: 'Upptäcker alla dolda fällor, krutkaggar och hemliga brasilianska ritningar på dubbelt avstånd.' },
                { name: 'Snabbfotad Kurir', desc: 'Ökar hela patrullens marschhastighet i 3D-uppdragen med +20%.' }
            ],
            equipped: {
                primary: 'ybycui_compound_bow',
                secondary: 'toledo_machete_acacaraya',
                relic: 'cerro_leon_chronometer'
            },
            bio: 'Endast 19 år gammal men redan veteran från tre djungelräder. Tar sig ljudlöst förbi brasilianska vaktposter och bärgar hemlig teknologi.'
        },

        takeda: {
            id: 'takeda',
            squadSlot: 'mentor_melee',
            name: '”Sensei” Takeda Hiroshi',
            title: 'Japansk Handelsman & F.d. Samuraj (Santiago)',
            roleBadge: '🏮 SENSEI & VAPENMÄSTARE',
            portrait: 'portraits/takeda.jpg',
            level: 4,
            xp: 350,
            xpToNext: 400,
            skillPoints: 3,
            hp: 130,
            maxHp: 130,
            stats: {
                strength: 84,
                agility: 97,
                marksmanship: 78,
                melee: 100,
                endurance: 88,
                spiritPaye: 82
            },
            abilities: [
                { name: 'Stridskonst: Kenjutsu & Iaijutsu-Mästare', desc: 'Högre parering (45% chans att parera och kontra direkt), +25% skada med machete/bajonett/katana och unik Iaijutsu Finishing Move i melee-scenerna.' },
                { name: 'Tamahagane-Vapensmed', desc: 'Förser elitgruppen med sällsynta japanska svärd, bättre stål och Tantō-knivar som ger bonus i närstrid.' }
            ],
            equipped: {
                primary: 'spencer_carbine_gold',
                secondary: 'takeda_katana_masamune',
                relic: 'takeda_kenjutsu_scroll'
            },
            bio: 'En före detta samuraj som hamnat i Sydamerika via handelsrutter över Stilla havet. Träffas på en krog i Santiago när man bygger allians med Chile och tränar Villalba, La Residente och eliten i dödlig närstrid.'
        }
    }
};
