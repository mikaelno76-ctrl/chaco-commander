// === DEL 7 AV 7 (v3): DR. CLAUDE (STENANSIKTE) & PROF. GEMINI – FREEZE-FRAME EDITION (elite_melee_academics.js) ===
// Laddas ALLRA SIST i index.html / test_arena.html!
// NYTT I v3:
// - Dr. Claude är nu 100 % kliniskt iskall, torr och saklig med totalt stenansikte (inga känsloyttringar,
//   inga åsikter, ingen svettdroppe och inget tjat om tokens!).
// - Scenen och alla blodpartiklar frys-pausas ("VHS Freeze-Frame") medan experterna levererar sin analys.

window.EliteMelee = window.EliteMelee || {};

(function () {
    const TAU = Math.PI * 2;

    const SCRIPTS = {
        amputation: [
            {
                t: 0.55, speaker: 'claude', duration: 6.2,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Ortopedisk Kirurgi):',
                text: '«Frysning av förloppet. Initial incision genom dermis och fascia brachii ned till musculus biceps brachii. Avsaknad av anestesi medför maximal nociceptiv signalering via plexus brachialis.»',
                voice: 'Frysning av förloppet. Initial incision genom huden och fascian ned till musculus biceps brachii. Avsaknad av anestesi medför maximal smärtsignalering.'
            },
            {
                t: 3.6, speaker: 'claude', duration: 6.0,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Osteologisk Analys):',
                text: '«Här exponeras periostet på diafysen av humerus. Upprepade mekaniska slag mot kortikalt ben genererar en komminut fraktur med blottläggning av cavitas medullaris och frisättning av gul samt röd benmärg.»',
                voice: 'Här exponeras benhinnan på humerus. Upprepade mekaniska slag genererar en splitterfraktur med blottläggning av märghålan.'
            },
            {
                t: 6.5, speaker: 'gemini', duration: 6.8,
                title: '🧠 PROF. GEMINI (Klinisk Neuropsykiatri):',
                text: '«Håll bilden stilla där. Efter doktor Claudes sedvanligt känslokalla obduktionsrapport noterar vi hur patienten drabbas av akut somatisk förnekelse i sitt stumma "...mi brazo". Ett skolboksexempel på kroppsschemats omedelbara sammanbrott.»',
                voice: 'Håll bilden stilla där. Vi ser här hur patienten drabbas av akut somatisk förnekelse i sitt stumma mi brazo.'
            }
        ],

        usurper_spine: [
            {
                t: 1.6, speaker: 'claude', duration: 6.2,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Neurokirurgi):',
                text: '«Longitudinell traktion appliceras här mot vertebrae cervicales C2 till C4. Dragkraften överstiger 4 200 Newton, vilket orsakar sekventiell ruptur av ligamentum flavum, disci intervertebrales samt medulla spinalis.»',
                voice: 'Longitudinell traktion appliceras här mot halskotorna. Dragkraften orsakar sekventiell ruptur av ligament, diskar och ryggmärg.'
            },
            {
                t: 9.8, speaker: 'gemini', duration: 6.5,
                title: '🧠 PROF. GEMINI (Forensisk Psykologi):',
                text: '«Frys bilden på trofén! Märk väl att detta saknar taktiskt syfte. Att hålla upp en droppande ryggrad som en bukett snittblommor är ren kompensatorisk narcissism. Subjektet söker bekräftelse från en frånvarande fadersgestalt.»',
                voice: 'Frys bilden. Att hålla upp en ryggrad som en bukett snittblommor är ren kompensatorisk narcissism.'
            }
        ],

        usurper_heart: [
            {
                t: 5.0, speaker: 'claude', duration: 6.2,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Thoraxkirurgi):',
                text: '«Dorsal trans-thorakal punktion. Costae 3 till 6 uppvisar utåtriktade frakturer. Perikardiet öppnas trubbigt, varefter mekanisk avulsion av aorta ascendens, truncus pulmonalis och vena cava genomförs. Systemiskt blodtryck faller till 0 mmHg.»',
                voice: 'Dorsal punktion av bröstkorgen. Revbenen fraktureras utåt varpå aorta och hålvener slits av. Blodtrycket faller omedelbart till noll.'
            },
            {
                t: 13.2, speaker: 'gemini', duration: 6.5,
                title: '🧠 PROF. GEMINI (Beteendevetenskap):',
                text: '«Och ändå bultar hjärtat vidare i hans hand tack vare sinusknutans elektriska autonomi. Ungefär som doktor Claudes kliniska ansiktsuttryck – det fortsätter fungera helt oberört av att allt runt omkring är totalt kaos.»',
                voice: 'Hjärtat slår vidare tack vare sinusknutans autonomi, helt oberört av kaoset runt omkring.'
            }
        ],

        usurper_split: [
            {
                t: 2.2, speaker: 'claude', duration: 5.8,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Patologisk Anatomi):',
                text: '«Komplett sagittal sektionering längs medellinjen. Skärplanet löper genom sutura sagittalis, basis cranii, corpus sterni, columna vertebralis samt symphysis pubica. Båda pleurahålorna och bukhålan är fullständigt exponerade.»',
                voice: 'Komplett sagittal sektionering längs medellinjen genom kranium, bröstben och ryggrad. Båda lungsäckarna är exponerade.'
            },
            {
                t: 8.2, speaker: 'gemini', duration: 5.5,
                title: '🧠 PROF. GEMINI (Psykoanalys):',
                text: '«Se hur kroppshalvorna glider isär i frysningen. En bokstavlig gestaltning av dissociativ identitetsstörning. Patienten har uppenbarligen svårt att hålla ihop sig själv under press.»',
                voice: 'En bokstavlig gestaltning av kluven personlighet under akut arbetsmiljöpress.'
            }
        ],

        usurper_gut: [
            {
                t: 4.0, speaker: 'claude', duration: 6.0,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Gastroenterologi):',
                text: '«Traumatisk laparotomi. Främre bukväggen och peritoneum parietale är genombrutna. Jejunum och ileum extraheras tillsammans med mesenteriet. Notera kvarstående autonom peristaltik i glatt muskulatur samt läckage av galla.»',
                voice: 'Traumatisk öppning av bukhålan. Tunntarmen och mesenteriet extraheras under kvarstående autonom peristaltik.'
            },
            {
                t: 8.5, speaker: 'gemini', duration: 6.0,
                title: '🧠 PROF. GEMINI (Symbolisk Analys):',
                text: '«Rent freudianskt ser vi hur conquistadoren tvingar offret att bokstavligen blotta sitt inre. En extrem form av oönskad gruppterapi.»',
                voice: 'Rent freudianskt ser vi hur offret tvingas blotta sitt inre. En extrem form av gruppterapi.'
            }
        ],

        // Tider: profilbilden räknas från 0, bilden framifrån från 100 (se _checkAcademicTrigger)
        piss_fail: [
            {
                t: 0.5, speaker: 'gemini', duration: 6.2,
                title: '🧠 PROF. GEMINI (Manligt dominansbeteende):',
                text: '«Frys bilden i profil! Se på hållningen. Subjektet förbereder en arkaisk urogenital revirmarkering över den besegrade – den ultimata alfa-triumfen hos primitiva hominider. Notera även bröstkorgen, som skjuts fram trots att den sedan länge saknar innehåll.»',
                voice: 'Frys bilden i profil. Subjektet förbereder en arkaisk revirmarkering över den besegrade motståndaren.'
            },
            {
                t: 102.3, speaker: 'claude', duration: 7.0,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Rättsmedicin):',
                text: '«Fysiologisk anmärkning. Mjukvävnaden i det aktuella området bryts ned fullständigt inom tjugoett dygn post mortem. Patienten avled för cirka fyrahundra år sedan. Tidsdifferens: ungefär 146 000 dygn. Utfallet var därmed förutsägbart.»',
                voice: 'Fysiologisk anmärkning. Mjukvävnaden bryts ned inom tjugoett dygn efter döden. Patienten avled för fyrahundra år sedan. Tidsdifferens: ungefär hundrafyrtiosextusen dygn. Utfallet var förutsägbart.'
            },
            {
                t: 106.2, speaker: 'gemini', duration: 7.0,
                title: '🧠 PROF. GEMINI (Akut kastrationsångest):',
                text: '«Och där stannar vi bilden! Spindeln. Malen. Det tomma bäckenet. Och hans uppgivna "...Mierda" – en förlamande insikt om att det falliska maktmedlet dekomponerades redan under Filip II:s regering.»',
                voice: 'Där stannar vi bilden. Spindeln, malen, det tomma bäckenet. En förlamande insikt om att maktmedlet dekomponerades redan under Filip den andres regering.'
            },
            {
                t: 109.6, speaker: 'claude', duration: 6.8,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Uppföljning):',
                text: '«Patienten har återmonterat sitt skydd. Skyddsvärde: noll. Skyddsbehov: noll. Värdigheten bedöms dock som delvis återställd. Spindeln är oskadd. Ärendet avslutas. Nästa patient, tack.»',
                voice: 'Patienten har återmonterat sitt skydd. Skyddsvärde: noll. Värdigheten bedöms som delvis återställd. Spindeln är oskadd. Ärendet avslutas. Nästa patient, tack.'
            }
        ],

        pombero_autopsy: [
            {
                t: 2.3, speaker: 'claude', duration: 6.6,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Kraniofaciell patologi):',
                text: '«Avlägsnande av skalltaket längs sutura coronalis. Kranialhålan är tom. Hjärnvävnaden bedöms ha saknats sedan cirka 1543, möjligen tidigare. Inga spår av etanol. Notera: undersökaren röker under ingreppet. Detta avråds från.»',
                voice: 'Avlägsnande av skalltaket. Kranialhålan är tom. Hjärnvävnaden har saknats sedan femtonhundrafyrtiotre, möjligen tidigare. Notera: undersökaren röker under ingreppet. Detta avråds från.'
            },
            {
                t: 17.6, speaker: 'claude', duration: 6.0,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Thoraxkirurgi):',
                text: '«Undersökaren insufflerar nu tobaksrök direkt i mediastinum. Metoden saknar stöd i litteraturen. Jag har sökt.»',
                voice: 'Undersökaren blåser nu tobaksrök direkt in i brösthålan. Metoden saknar stöd i litteraturen. Jag har sökt.'
            },
            {
                t: 23.0, speaker: 'gemini', duration: 7.0,
                title: '🧠 PROF. GEMINI (Psykoanalys):',
                text: '«Frys bilden på brevet! "Min älskade Isabel." Fyrahundra år av ouppfylld längtan – och han läser det med handen i en främmande bröstkorg. Klassisk projektion: Pombero sörjer inte conquistadoren. Han sörjer sin egen Caña.»',
                voice: 'Frys bilden på brevet. Fyrahundra år av ouppfylld längtan. Klassisk projektion: Pombero sörjer inte conquistadoren. Han sörjer sin egen Caña.'
            },
            {
                t: 41.4, speaker: 'gemini', duration: 8.2,
                title: '🧠 PROF. GEMINI (Evolutionär attraktionspsykologi):',
                text: '«Frys bilden på hjältinnan! Ser ni mikrorynkan? Pomberos kompromisslösa alfa-dominans utlöser en rent biologisk, ofrivillig attraktion via amygdala. Lyckligtvis kopplas neocortex in i sista stund och konstaterar att det är en usel idé att försöka förföra en alkoholiserad skogsdemon.»',
                voice: 'Frys bilden på hjältinnan. En rent biologisk attraktionsimpuls i amygdala, innan hjärnan tar över och inser att man inte bör förföra en alkoholiserad skogsdemon.'
            },
            {
                t: 49.5, speaker: 'claude', duration: 8.0,
                title: '🩺 ÖVERLÄKARE DR. CLAUDE (Klinisk farmakologi):',
                text: '«Uppmätt volym: en (1) droppe, cirka 0,05 milliliter. Vid antagen alkoholhalt om fyrtio procent har undersökaren efter fyrtionio sekunders obduktion intagit 0,02 milliliter ren etanol. Ingen berusning väntas. Besvikelse väntas.»',
                voice: 'Uppmätt volym: en droppe, cirka fem hundradels milliliter. Undersökaren har intagit två hundradels milliliter ren alkohol. Ingen berusning väntas. Besvikelse väntas.'
            }
        ],

        sake_deal: [
            {
                t: 3.4, speaker: 'gemini', duration: 6.0,
                title: '🧠 PROF. GEMINI (Transkulturell Beroendeterapi):',
                text: '«Vi stannar bilden vid överlämningen! En briljant klinisk intervention av Sensei Takeda: han tillämpar substans-substitution och ersätter demonens fixering vid Caña med japanskt risbrännvin.»',
                voice: 'Vi stannar bilden vid överlämningen. En briljant intervention där våldet ersätts med japanskt risbrännvin.'
            }
        ]
    };

    Object.assign(window.EliteMelee, {
        academicsEnabled: true,
        academicFreezeActive: false,
        academicFreezeTimer: 0,
        activeAcademicCue: null,
        _triggeredAcademicKeys: {},
        _frozenSceneTime: 0,

        toggleAcademics: function () {
            this.academicsEnabled = !this.academicsEnabled;
            if (!this.academicsEnabled) {
                this.academicFreezeActive = false;
                this.activeAcademicCue = null;
            }
            const btn = document.getElementById('mk-btn-academics');
            if (btn) {
                btn.style.background = this.academicsEnabled ? '#6a1b9a' : '#263238';
                btn.textContent = this.academicsEnabled ? '🎓 Kommentatorer (Frys): PÅ' : '🎓 Kommentatorer: AV';
            }
        },

        skipAcademicFreeze: function () {
            if (!this.academicFreezeActive) return;
            this.academicFreezeActive = false;
            this.academicFreezeTimer = 0;
            this.activeAcademicCue = null;
            try {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            } catch (e) {}
        },

        _checkAcademicTrigger: function (rawDt) {
            if (!this.academicsEnabled) {
                this.academicFreezeActive = false;
                return false;
            }

            if (this.academicFreezeActive) {
                this.academicFreezeTimer -= rawDt;
                if (this.academicFreezeTimer <= 0) {
                    this.academicFreezeActive = false;
                    this.activeAcademicCue = null;
                }
                return true;
            }

            let list = null;
            let t = 0;
            let sceneId = '';

            if (this.phase === 'amputation_anim' && this.amp) {
                list = SCRIPTS.amputation;
                t = this.amp.t;
                sceneId = 'amp';
            } else if (this.phase === 'takeover_anim' && this.usurper) {
                const u = this.usurper;
                if (u.stage === 'pombero_cana_autopsy') {
                    list = SCRIPTS.pombero_autopsy;
                    t = this.pomberoSearchTimer || 0;
                    sceneId = 'pombero';
                } else if (u.stage === 'slaughter') {
                    t = u.timer || 0;
                    const v = u.variant || 0;
                    sceneId = 'usurp_' + v;
                    // Boleadoras (variant 99) har inget eget manus – annars pratade experterna om fel scen
                    list = v === 0 ? SCRIPTS.usurper_spine : (v === 1 ? SCRIPTS.usurper_heart : (v === 2 ? SCRIPTS.usurper_split : (v === 3 ? SCRIPTS.usurper_gut : null)));
                }
            } else if (this.phase === 'enemy_fatality_anim') {
                list = SCRIPTS.piss_fail;
                const st = this.enemyFatalityStage;
                t = (st === 'gut_rip') ? -1 : (st === 'piss_side_stance' ? this.enemyFatalityTimer : (100 + this.enemyFatalityTimer));
                sceneId = 'piss';
            } else if (this.phase === 'sake_diplomacy_anim') {
                list = SCRIPTS.sake_deal;
                t = this.sakeDiplomacyTimer || 0;
                sceneId = 'sake';
            } else {
                this._triggeredAcademicKeys = {};
                return false;
            }

            if (!list) return false;

            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                const key = sceneId + '_' + i;
                if (t >= item.t && !this._triggeredAcademicKeys[key]) {
                    this._triggeredAcademicKeys[key] = true;
                    this.academicFreezeActive = true;
                    this.academicFreezeTimer = item.duration || 6.0;
                    this.activeAcademicCue = item;

                    if (this.playTendonSnap) this.playTendonSnap();

                    const self = this;
                    try {
                        if ('speechSynthesis' in window && item.voice) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(item.voice);
                            const isClaude = item.speaker === 'claude';
                            u.lang = 'sv-SE';
                            // Dr. Claude: platt, monoton, klinisk röst. Prof. Gemini: djup akademisk baryton.
                            u.pitch = isClaude ? 0.92 : 0.55;
                            u.rate = isClaude ? 0.96 : 0.92;
                            u.volume = 0.98;
                            u.onend = function () {
                                self.academicFreezeTimer = Math.min(self.academicFreezeTimer, 0.45);
                            };
                            window.speechSynthesis.speak(u);
                        }
                    } catch (e) {}

                    this.addLog('⏸️ ' + item.title + ' ' + item.text, item.speaker === 'claude' ? '#80deea' : '#ce93d8');
                    return true;
                }
            }
            return false;
        },

        drawAcademicCommentators: function (ctx, w, h, realNow) {
            if (!this.academicFreezeActive || !this.activeAcademicCue) return;
            const cue = this.activeAcademicCue;
            const isClaude = cue.speaker === 'claude';

            ctx.save();

            ctx.strokeStyle = isClaude ? 'rgba(77, 208, 225, 0.65)' : 'rgba(255, 213, 79, 0.65)';
            ctx.lineWidth = 4;
            ctx.strokeRect(4, 4, w - 8, h - 8);

            const painted0 = (this.phase === 'takeover_anim' && this.usurper && this.usurper.stage === 'pombero_cana_autopsy') || this.phase === 'enemy_fatality_anim';
            const tagY = painted0 ? 352 : 42;
            ctx.fillStyle = 'rgba(10, 14, 18, 0.88)';
            ctx.fillRect(w - 285, tagY, 268, 30);
            ctx.strokeStyle = '#ff1744';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(w - 285, tagY, 268, 30);
            if (Math.floor(realNow / 450) % 2 === 0) {
                ctx.fillStyle = '#ff1744';
                ctx.fillRect(w - 274, tagY + 7, 5, 16);
                ctx.fillRect(w - 265, tagY + 7, 5, 16);
            }
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffd54f';
            ctx.fillText('FRYSBILD: EXPERTANALYS (' + Math.ceil(this.academicFreezeTimer) + 's)', w - 252, tagY + 19);

            const boxW = 500, boxH = 126;
            const boxX = isClaude ? 18 : (w - boxW - 18);
            const paintedScene = (this.phase === 'takeover_anim' && this.usurper && this.usurper.stage === 'pombero_cana_autopsy') || this.phase === 'enemy_fatality_anim';
            const boxY = paintedScene ? 44 : (h - boxH - 14); // i de målade scenerna: uppe, så undertexterna syns

            ctx.fillStyle = isClaude ? 'rgba(8, 24, 30, 0.96)' : 'rgba(26, 14, 28, 0.96)';
            ctx.strokeStyle = isClaude ? '#4dd0e1' : '#ffd54f';
            ctx.lineWidth = 3;
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            const targetX = isClaude ? (w * 0.52 + Math.cos(realNow * 0.005) * 14) : (w * 0.44 + Math.cos(realNow * 0.004) * 10);
            const targetY = isClaude ? (h * 0.54 + Math.sin(realNow * 0.005) * 14) : (h * 0.36 + Math.sin(realNow * 0.004) * 10);
            ctx.save();
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = isClaude ? '#00e5ff' : '#ffd54f';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(isClaude ? (boxX + 95) : (boxX + boxW - 95), boxY + 30);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(targetX, targetY, 10 + Math.sin(realNow * 0.015) * 3, 0, TAU);
            ctx.stroke();
            ctx.restore();

            const px = isClaude ? (boxX + 52) : (boxX + boxW - 52);
            const py = boxY + 64;
            const mouthMove = Math.abs(Math.sin(realNow * 0.02)) * 3.5;

            if (isClaude) {
                // =============================================================
                // ÖVERLÄKARE DR. CLAUDE – STENANSIKTE (Noll känslor, kliniskt saklig)
                // =============================================================
                ctx.fillStyle = '#eceff1';
                ctx.beginPath(); ctx.ellipse(px, py + 42, 38, 24, 0, Math.PI, 0); ctx.fill();
                // Svart slips & stetoskop
                ctx.fillStyle = '#263238';
                ctx.fillRect(px - 3, py + 26, 6, 16);
                ctx.strokeStyle = '#37474f'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.arc(px, py + 28, 16, 0, Math.PI); ctx.stroke();

                // Helt uttryckslöst, symmetriskt stenansikte
                ctx.fillStyle = '#dfc4a8';
                ctx.beginPath(); ctx.arc(px, py, 28, 0, TAU); ctx.fill();
                ctx.strokeStyle = '#263238'; ctx.lineWidth = 1.5; ctx.stroke();

                // Stram sidbena & pannspegel
                ctx.fillStyle = '#37474f';
                ctx.beginPath(); ctx.arc(px, py - 6, 28, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
                ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.moveTo(px - 27, py - 12); ctx.lineTo(px + 27, py - 12); ctx.stroke();
                ctx.fillStyle = '#cfd8dc'; ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(px + 8, py - 18, 8.5, 0, TAU); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px + 8, py - 18, 2.8, 0, TAU); ctx.fill();

                // Spikraka, helt horisontella ögonbryn (rör inte en min!)
                ctx.strokeStyle = '#263238'; ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(px - 19, py - 9); ctx.lineTo(px - 5, py - 9);
                ctx.moveTo(px + 5, py - 9); ctx.lineTo(px + 19, py - 9);
                ctx.stroke();

                // Halvslutna, kliniskt iskalla ögon bakom stålbågade glasögon
                ctx.strokeStyle = '#455a64'; ctx.lineWidth = 1.8;
                ctx.strokeRect(px - 19, py - 7, 15, 9);
                ctx.strokeRect(px + 4, py - 7, 15, 9);
                ctx.fillStyle = '#111';
                ctx.beginPath(); ctx.arc(px - 11.5, py - 2.5, 1.8, 0, TAU); ctx.arc(px + 11.5, py - 2.5, 1.8, 0, TAU); ctx.fill();

                // Minimalt rörlig, spikrak mun
                ctx.fillStyle = '#263238';
                ctx.fillRect(px - 9, py + 13, 18, 1.5 + mouthMove * 0.5);
            } else {
                // =============================================================
                // PSYKIATRIPROFESSOR GEMINI (Tweedkavaj, fluga, glasögon & pipa)
                // =============================================================
                ctx.fillStyle = '#4e342e';
                ctx.beginPath(); ctx.ellipse(px, py + 42, 38, 24, 0, Math.PI, 0); ctx.fill();
                ctx.fillStyle = '#b71c1c';
                ctx.beginPath();
                ctx.moveTo(px, py + 26); ctx.lineTo(px - 10, py + 21); ctx.lineTo(px - 10, py + 31);
                ctx.moveTo(px, py + 26); ctx.lineTo(px + 10, py + 21); ctx.lineTo(px + 10, py + 31);
                ctx.fill();

                ctx.fillStyle = '#d7a98c';
                ctx.beginPath(); ctx.arc(px, py, 28, 0, TAU); ctx.fill();
                ctx.fillStyle = '#546e7a';
                ctx.beginPath(); ctx.arc(px, py + 4, 27, 0.15, Math.PI - 0.15); ctx.fill();

                ctx.strokeStyle = '#ffd54f'; ctx.lineWidth = 2.2;
                ctx.beginPath(); ctx.arc(px - 11, py - 4, 8, 0, TAU); ctx.stroke();
                ctx.beginPath(); ctx.arc(px + 11, py - 4, 8, 0, TAU); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(px - 3, py - 4); ctx.lineTo(px + 3, py - 4); ctx.stroke();

                ctx.fillStyle = '#111';
                ctx.beginPath(); ctx.arc(px - 11, py - 4, 2.2, 0, TAU); ctx.arc(px + 11, py - 4, 2.2, 0, TAU); ctx.fill();
                ctx.strokeStyle = '#37474f'; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(px - 18, py - 14); ctx.quadraticCurveTo(px - 11, py - 19, px - 4, py - 14); ctx.stroke();

                ctx.fillStyle = '#2b1212';
                ctx.fillRect(px - 7, py + 11, 14, 2 + mouthMove * 0.8);
                ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(px - 8, py + 13); ctx.lineTo(px - 32, py + 18); ctx.stroke();
                ctx.fillStyle = '#4e342e';
                ctx.fillRect(px - 36, py + 10, 8, 11);
                const pSmokeY = (realNow * 0.025) % 24;
                ctx.fillStyle = 'rgba(180, 200, 230, ' + (0.6 - pSmokeY / 40) + ')';
                ctx.beginPath(); ctx.arc(px - 32 - pSmokeY * 0.3, py + 6 - pSmokeY, 3 + pSmokeY * 0.25, 0, TAU); ctx.fill();
            }

            const textX = isClaude ? (boxX + 98) : (boxX + 14);
            const maxW = boxW - 112;
            ctx.textAlign = 'left';
            ctx.font = 'bold 13.5px Georgia';
            ctx.fillStyle = isClaude ? '#4dd0e1' : '#ffd54f';
            ctx.fillText(cue.title, textX, boxY + 22);

            ctx.font = 'italic 12.8px Georgia';
            ctx.fillStyle = '#f5f5f5';
            const words = cue.text.split(' ');
            let line = '', ly = boxY + 42;
            for (let i = 0; i < words.length; i++) {
                const test = line + words[i] + ' ';
                if (ctx.measureText(test).width > maxW && line.length > 0) {
                    ctx.fillText(line, textX, ly);
                    line = words[i] + ' ';
                    ly += 17;
                } else {
                    line = test;
                }
            }
            if (line) ctx.fillText(line, textX, ly);

            ctx.font = '10.5px monospace';
            ctx.fillStyle = '#ffd54f';
            ctx.fillText(
                '⏸️ SCENEN PAUSAD MEDAN EXPERTEN TALAR (Klicka / [SPACE] för att fortsätta)',
                textX, boxY + boxH - 8
            );

            ctx.restore();
        }
    });

    const wrapFreezeUpdate = (fnName) => {
        const orig = window.EliteMelee[fnName];
        if (!orig) return;
        window.EliteMelee[fnName] = function (rawDt, now) {
            if (this.academicFreezeActive) return;
            return orig.apply(this, arguments);
        };
    };

    wrapFreezeUpdate('updateTakeoverSequence');
    wrapFreezeUpdate('updatePomberoSakeDiplomacy');
    wrapFreezeUpdate('updateEnemyFatalitySequence');
    wrapFreezeUpdate('updateAmputation');
    wrapFreezeUpdate('updateGoreExtras');
    wrapFreezeUpdate('updateParticles');

    // FIX #5: Det här är nu det ENDA stället som räknar ner frysbilden och ritar experterna.
    // (Förut gjordes det även i 3D-renderaren, så timern tickade dubbelt så fort i 3D-läge.)
    const origRender = window.EliteMelee.renderArena;
    window.EliteMelee.renderArena = function (now) {
        const rawDt = this._frameDt || 0.016;
        const isFrozen = this._checkAcademicTrigger(rawDt);
        if (!isFrozen) {
            this._frozenSceneTime = now;
        }
        if (origRender) {
            // 1:a argumentet = frusen scentid, 2:a = verklig tid (så 3D-kameran kan svepa runt den frysta scenen)
            origRender.call(this, isFrozen ? (this._frozenSceneTime || now) : now, now);
        }
        if (this.ctx && this.canvas) {
            this.drawAcademicCommentators(this.ctx, this.canvas.width, this.canvas.height, now);
        }
    };

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && window.EliteMelee && window.EliteMelee.academicFreezeActive) {
            e.preventDefault();
            window.EliteMelee.skipAcademicFreeze();
        }
    });

    const origUI = window.EliteMelee.buildOverlayUI;
    window.EliteMelee.buildOverlayUI = function () {
        if (origUI) origUI.apply(this, arguments);
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', () => {
                if (this.academicFreezeActive) this.skipAcademicFreeze();
            });
        }
        // FIX #8: knappen hamnade förut i en 34 px stor dekorationshörna i V5-gränssnittet
        const btnBar = document.querySelector('#melee-ui .mkv5-demo-bar') || document.querySelector('#melee-ui canvas')?.parentElement?.querySelector('div');
        if (btnBar && !document.getElementById('mk-btn-academics')) {
            const btn = document.createElement('button');
            btn.id = 'mk-btn-academics';
            btn.style.cssText = 'padding:3px 7px;font-size:0.71rem;background:#6a1b9a;color:#ffd54f;cursor:pointer;font-weight:bold;border:1px solid #ffd54f;';
            btn.textContent = '🎓 Kommentatorer (Frys): PÅ';
            btn.onclick = () => window.EliteMelee.toggleAcademics();
            btnBar.appendChild(btn);
        }
    };
})();
