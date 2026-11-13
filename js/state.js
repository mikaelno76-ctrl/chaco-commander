// === MASTER STATE: PARAGUAY 1864 v5 (state.js) ===
// Integrerar Storkartan, Diplomatin, Elituppdragen, Slagfältet samt Teknologi, Fabriker & Jordbruk!
const STORAGE_KEY = 'PARAGUAY_CAMPAIGN_1864';

const DEFAULT_STATE = {
    date: { month: 11, year: 1864, turn: 1 },
    resources: {
        gold: 650,
        yerba: 420,
        food: 500,
        manpower: 1200,
        modern_weapons: 45,
        researchPoints: 220
    },
    unlockedTechs: [
        'flintlock_muskets',
        'smoothbore_foundry',
        'optical_telegraph',
        'river_steamers',
        'state_estancias'
    ],
    buildings: {
        ybycui_foundry: 1,
        arsenal_asuncion: 1,
        asuncion_shipyard: 1,
        valenzuela_powder_works: 1,
        textile_arsenal: 0,
        modern_powder_mill: 0,
        ironclad_shipyard: 0,
        military_rail_network: 0,
        estancias_patria: 1,
        chacras_mandioca: 1,
        yerba_mate_forests: 1,
        mechanized_estancia: 0,
        meat_cannery: 0
    },
    blockadeRioDeLaPlata: true,
    pacificRouteOpen: false,
    britishInterventionRisk: 15,
    britishIntervened: false,
    diplomacy: {
        bolivia: { name: "Bolivia", relation: 55, treaty: false, desc: "Granne i nordväst. Nyckeln genom Chaco och upp i Anderna." },
        chile: { name: "Chile", relation: 65, treaty: false, desc: "Utkämpade krig mot Spanien (Chincha-öarna). Kontrollerar Stilla havshamnarna." },
        peru: { name: "Peru", relation: 60, treaty: false, desc: "Stark Stilla havsflotta (Huáscar). Vänligt sinnad mot Paraguay." },
        ecuador: { name: "Ecuador", relation: 50, treaty: false, desc: "Andinsk stat längs Stilla havskusten." },
        colombia: { name: "Colombias Förenta Stater", relation: 45, treaty: false, desc: "Nordlig stormakt (Rionegro-konstitutionen 1863). Kan öppna kaparkrig mot Brasilien." },
        venezuela: { name: "Venezuela", relation: 40, treaty: false, desc: "Kontrollerar Orinoco-bäckenet och Karibiska kusten." },
        uk: { name: "Storbritannien (London City)", relation: 40, treaty: false, desc: "Säljer Whitworth-kanoner, men finansierar samtidigt Brasilien." },
        france: { name: "Frankrike", relation: 45, treaty: false, desc: "Säljer räfflade gevär, uniformer och skickar militära rådgivare." },
        usa: { name: "Nordamerika (USA)", relation: 50, treaty: false, desc: "Kan åberopa Monroedoktrinen och leverera Gatling-kulsprutor & Spencer-karbiner." }
    },
    covert: {
        urquiza_loyalty: 45,
        urquiza_rebelled: false,
        chaco_tribes_armed: false,
        mato_grosso_tribes_armed: false,
        corrientes_spy_ring: false
    },
    provinces: {
        colombia: {
            name: "Colombias Förenta Stater (Bogotá)", owner: "COL", garrison: 350, fort: 2,
            resources: "Kaffe, Guld & Karibiska hamnar", unrest: "Federala spänningar",
            desc: "Styrs enligt 1863 års Rionegro-konstitution."
        },
        venezuela: {
            name: "Venezuela (Caracas & Orinoco)", owner: "VEN", garrison: 280, fort: 2,
            resources: "Kakao, Boskap & Kaparhamnar", unrest: "Efterdyningar av Federala kriget",
            desc: "Gränsar mot norra Brasilien genom regnskogen."
        },
        ecuador: {
            name: "Ecuador (Quito & Guayaquil)", owner: "ECU", garrison: 200, fort: 2,
            resources: "Skeppsvarv i Guayaquil & Kakao", unrest: "Hotas av spanska flottan",
            desc: "Allierad med Peru och Chile i Stilla havet."
        },
        peru: {
            name: "Peru (Lima & Callao)", owner: "PER", garrison: 420, fort: 3,
            resources: "Guano-rikedomar & Pansarfregatter", unrest: "Spanska flottan vid Chincha-öarna",
            desc: "Sympatiserar djupt med Paraguay."
        },
        amazonas: {
            name: "Amazonas & Grão-Pará (Manaus/Belém)", owner: "BRA", garrison: 160, fort: 1,
            resources: "Gummi, Flodleder & Djungel", unrest: "Fria stammar i regnskogen",
            desc: "Enorm regnskog som skiljer Colombia och Peru från Brasiliens hjärta."
        },
        bahia_nordeste: {
            name: "Nordöstra Brasilien (Bahia & Recife)", owner: "BRA", garrison: 320, fort: 2,
            resources: "Sockerplantager & Rekryter", unrest: "Slavuppror & krigströtthet",
            desc: "Kejsardömet Brasiliens plantagekust."
        },
        rio_janeiro: {
            name: "Rio de Janeiro & Minas Gerais", owner: "BRA", garrison: 600, fort: 4,
            resources: "Kejsarhovet, Guld & Brittiska lån", unrest: "Londonbankernas högborg",
            desc: "Kejsar Pedro II:s huvudstad."
        },
        chaco_bolivia: {
            name: "Bolivia (La Paz, Sucre & Santa Cruz)", owner: "BOL", garrison: 240, fort: 2,
            resources: "Silvergruvor (Potosí) & Andinska pass", unrest: "Smuggelleder mot Stilla havet",
            desc: "Paraguays livlina västerut över Anderna."
        },
        chile: {
            name: "Chile (Santiago, Valparaíso & Antofagasta)", owner: "CHL", garrison: 380, fort: 3,
            resources: "Koppar, Salpeter & Stilla havshamnar", unrest: "Spansk blockad vid Valparaíso",
            desc: "Kontrollerar handelshamnarna vid Stilla havet."
        },
        matogrosso_nor: {
            name: "Norra Mato Grosso (Cuiabá & Coimbra)", owner: "BRA", garrison: 180, fort: 2,
            resources: "Guld & Krutförråd (Forte Novo de Coimbra)", unrest: "Rebelliska stammar i djungeln!",
            desc: "Brasiliansk provins med rika krutförråd."
        },
        matogrosso_sur: {
            name: "Mato Grosso del Sur (Paraguayanskt 1864!)", owner: "PAR", garrison: 200, fort: 1,
            resources: "Boskap & Yerba Mate (+45 Varor)", unrest: "Guaraní/Guaicurú-spejare",
            desc: "Omtvistat gränsområde mellan Río Apa och Río Miranda."
        },
        formosa: {
            name: "Formosa & Gran Chaco (Paraguayanskt 1864!)", owner: "PAR", garrison: 150, fort: 1,
            resources: "Quebracho-timmer & Vildmark (+25 Varor)", unrest: "Toba/Guaicurú-krigare",
            desc: "Paraguayanskt territorium mellan Río Pilcomayo och Río Bermejo."
        },
        asuncion: {
            name: "Asunción, Ybycuí & Humaitá (Paraguay)", owner: "PAR", garrison: 450, fort: 3,
            resources: "Järnbruk (Ybycuí), Varv & Arsenaler", unrest: "Lugnt (Total mobilisering)",
            desc: "Republikens hjärta med järngjuteriet i Ybycuí och flodlåset vid Humaitá."
        },
        misiones: {
            name: "Misiones (Paraguayanskt 1864!)", owner: "PAR", garrison: 250, fort: 1,
            resources: "Yerba Mate-plantager (+40 Varor)", unrest: "Gränspatruller vid Río Uruguay",
            desc: "Strategisk korridor söder om Río Paraná."
        },
        corrientes: {
            name: "Corrientes (Argentina)", owner: "ARG", garrison: 320, fort: 2,
            resources: "Flodhamnar & Kavallerihästar", unrest: "Federala rebeller (Anti-Mitre)",
            desc: "Argentinsk provins som kontrollerar flodkröken vid Paraná."
        },
        entrerios: {
            name: "Entre Ríos (General Urquiza)", owner: "ARG", garrison: 380, fort: 2,
            resources: "Elitkavalleri & Boskap", unrest: "Urquiza vacklar (Lojalitet: 45%)",
            desc: "Styrs av caudillon Justo José de Urquiza."
        },
        riogrande: {
            name: "Rio Grande do Sul (Porto Alegre & Uruguaiana)", owner: "BRA", garrison: 400, fort: 2,
            resources: "Krigskassa, Boskap & Förråd", unrest: "Farrapos-republikens arv",
            desc: "Brasiliens södra militära uppmarschområde."
        },
        uruguay: {
            name: "Uruguay (Montevideo & Paysandú)", owner: "ALLY", garrison: 300, fort: 3,
            resources: "Atlantkust & Flodmynning", unrest: "Blanco-regeringen under belägring!",
            desc: "Våra allierade i Blanco-partiet försvarar Paysandú och Montevideo."
        },
        buenos_aires: {
            name: "Buenos Aires & Pampas (Bartolomé Mitre)", owner: "ARG", garrison: 520, fort: 3,
            resources: "Tullintäkter, Handelsflotta & Brittiskt kapital", unrest: "Mapuche/Ranquel-räder i söder",
            desc: "President Bartolomé Mitres fäste vid Río de la Plata."
        }
    },
    customPolygonPoints: {},
    mapBgImage: "karta1864.jpg",
    relics: [],
    eliteSquad: {
        hp: 100,
        maxHp: 100,
        stamina: 100,
        ammo: 12,
        veterancy: 1
    },
    activeBattle: null,
    activeEliteMission: {
        id: "amazon_weapons",
        title: "Djungelstigen till Mato Grosso",
        description: "Frakta gevär genom djungeln till rebelliska stammar, spräng brasilianska depåer och undersök den uråldriga ruinen i bergen.",
        weaponsCarried: 15
    },
    log: [
        "November 1864: Alla 5 huvudvyer (Storkarta, Diplomati, Teknologi/Industri, Elituppdrag 3D och Slagfältet) är nu sammankopplade!",
        "Tips: Besök 'Teknologi & Industri' för att forska fram nya vapen och låsa upp elitförband till Slagfältet."
    ]
};

window.GameState = {
    data: null,

    init: function() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.data = Object.assign({}, DEFAULT_STATE, parsed);
                this.data.resources = Object.assign({}, DEFAULT_STATE.resources, parsed.resources || {});
                this.data.buildings = Object.assign({}, DEFAULT_STATE.buildings, parsed.buildings || {});
                this.data.provinces = Object.assign({}, DEFAULT_STATE.provinces, parsed.provinces || {});
                for (let pk in DEFAULT_STATE.provinces) {
                    if (!this.data.provinces[pk]) {
                        this.data.provinces[pk] = JSON.parse(JSON.stringify(DEFAULT_STATE.provinces[pk]));
                    }
                }
                this.data.covert = Object.assign({}, DEFAULT_STATE.covert, parsed.covert || {});
                this.data.diplomacy = Object.assign({}, DEFAULT_STATE.diplomacy, parsed.diplomacy || {});
                this.data.eliteSquad = Object.assign({}, DEFAULT_STATE.eliteSquad, parsed.eliteSquad || {});
                this.data.customPolygonPoints = parsed.customPolygonPoints || {};
                if (!Array.isArray(this.data.relics)) this.data.relics = [];
                if (!Array.isArray(this.data.unlockedTechs)) {
                    this.data.unlockedTechs = [...DEFAULT_STATE.unlockedTechs];
                }
            } catch (e) {
                this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
            }
        } else {
            this.data = JSON.parse(JSON.stringify(DEFAULT_STATE));
            this.save();
        }
        this.updateTradeRouteStatus();
        return this.data;
    },

    save: function() {
        this.updateTradeRouteStatus();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    },

    reset: function() {
        localStorage.removeItem(STORAGE_KEY);
        this.init();
        window.location.reload();
    },

    updateTradeRouteStatus: function() {
        if (!this.data) return;
        const bolOk = this.data.diplomacy.bolivia && (this.data.diplomacy.bolivia.treaty || this.data.diplomacy.bolivia.relation >= 75);
        const pacOk = (this.data.diplomacy.chile && (this.data.diplomacy.chile.treaty || this.data.diplomacy.chile.relation >= 80)) ||
                      (this.data.diplomacy.peru && (this.data.diplomacy.peru.treaty || this.data.diplomacy.peru.relation >= 80));
        this.data.pacificRouteOpen = (bolOk && pacOk) || !this.data.blockadeRioDeLaPlata;
        if (this.data.provinces.entrerios) {
            if (this.data.covert.urquiza_rebelled) {
                this.data.provinces.entrerios.unrest = "ALLIERAD (Urquiza i uppror mot Mitre!)";
            } else {
                this.data.provinces.entrerios.unrest = "Urquiza (" + this.data.covert.urquiza_loyalty + "% mot uppror)";
            }
        }
    },

    addRelic: function(relicObj) {
        if (!this.data.relics.some(r => r.id === relicObj.id)) {
            this.data.relics.push(relicObj);
            this.addLog("MYTISK RELIK BÄRGAD: " + relicObj.name + " (" + relicObj.bonus + ")!");
            this.save();
            return true;
        }
        return false;
    },

    addLog: function(msg) {
        const mNames = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
        const stamp = mNames[this.data.date.month - 1] + " " + this.data.date.year;
        this.data.log.unshift(stamp + ": " + msg);
        if (this.data.log.length > 35) this.data.log.pop();
        this.save();
    },

    nextTurn: function() {
        this.data.date.month++;
        if (this.data.date.month > 12) {
            this.data.date.month = 1;
            this.data.date.year++;
        }
        this.data.date.turn++;

        let parCount = 0;
        for (let k in this.data.provinces) {
            if (this.data.provinces[k].owner === "PAR") parCount++;
        }

        const b = this.data.buildings || {};
        const goldGain = parCount * 25 + (b.asuncion_shipyard || 1) * 20 + (b.textile_arsenal || 0) * 45 + (b.military_rail_network || 0) * 50;
        const yerbaGain = parCount * 25 + (b.yerba_mate_forests || 1) * 40;
        const foodGain = (b.estancias_patria || 1) * 60 + (b.chacras_mandioca || 1) * 70 + (b.mechanized_estancia || 0) * 120 + (b.meat_cannery || 0) * 140;
        const weapGain = (b.ybycui_foundry || 1) * 6 + (b.arsenal_asuncion || 1) * 8 + (b.modern_powder_mill || 0) * 15 + (b.ironclad_shipyard || 0) * 15;
        const rpGain = 25 + (b.ybycui_foundry || 1) * 10 + (b.arsenal_asuncion || 1) * 12 + (b.asuncion_shipyard || 1) * 8 + (b.ironclad_shipyard || 0) * 20;
        const manGain = parCount * 20 + (b.mechanized_estancia || 0) * 35;

        this.data.resources.gold += goldGain;
        this.data.resources.yerba += yerbaGain;
        this.data.resources.food = (this.data.resources.food || 400) + foodGain;
        this.data.resources.modern_weapons += weapGain;
        this.data.resources.researchPoints = (this.data.resources.researchPoints || 150) + rpGain;
        this.data.resources.manpower += manGain;

        this.data.eliteSquad.hp = Math.min(this.data.eliteSquad.maxHp, this.data.eliteSquad.hp + 20);
        this.data.eliteSquad.stamina = 100;

        let extraMsg = ` Industri & Jordbruk: +${weapGain} Vapen, +${rpGain} Forskning, +${foodGain} Mat.`;
        if (this.data.pacificRouteOpen) {
            this.data.resources.gold += 45;
            extraMsg += " Andinska leden: +45 Guld.";
        }
        if (this.data.covert.mato_grosso_tribes_armed && this.data.provinces.matogrosso_nor.owner === "BRA") {
            this.data.provinces.matogrosso_nor.garrison = Math.max(30, this.data.provinces.matogrosso_nor.garrison - 25);
            extraMsg += " Stamräder i Mato Grosso (-25 BRA)!";
        }
        if (this.data.covert.chaco_tribes_armed && this.data.provinces.corrientes.owner === "ARG") {
            this.data.provinces.corrientes.garrison = Math.max(40, this.data.provinces.corrientes.garrison - 20);
            extraMsg += " Guaicurú-räder i Corrientes (-20 ARG)!";
        }

        if (parCount >= 5 || this.data.covert.urquiza_rebelled) {
            this.data.britishInterventionRisk = Math.min(100, (this.data.britishInterventionRisk || 15) + 8);
            if (this.data.britishInterventionRisk >= 70 && !this.data.britishIntervened) {
                extraMsg += " [VARNING: London Citys bankirer hotar med brittisk intervention (" + this.data.britishInterventionRisk + "%)]";
            }
        }

        this.addLog("Ny månad. +" + goldGain + " Guld, +" + yerbaGain + " Varor." + extraMsg);
        this.save();
    }
};

window.GameState.init();
