// === ELITE ROSTER: PATRULLEN & STRIDISAR v1 ===
// Fullständig lista över elitsoldater man kan skicka på uppdrag.
// Porträtt + helkroppsbeskrivningar för fightscener.
// Autentisk känsla + påhittade men troliga karaktärer.

window.EliteRoster = {
    soldiers: {
        rojas: {
            id: 'rojas',
            name: 'Teniente Tomás Rojas',
            role: 'Spjutspets / Patrullchef',
            gender: 'man',
            age: 29,
            origin: 'Asunción',
            portrait: 'portraits/elite/rojas.jpg',
            fullbody: 'portraits/elite_fullbody/rojas_fight.jpg',
            hp: 110,
            skill: 85,
            traits: ['kallblodig', 'ledare', 'macheteexpert'],
            bio: 'Uppvuxen i Asuncións fattigare kvarter. Tjänstgjorde under Solano López personliga garde innan han handplockades till elitpatrullerna. Tyst, effektiv och beredd att göra vad som krävs. Har överlevt tre bakhåll hittills.',
            combatStyle: 'Snabb machete + korta, hårda slag. Föredrar att avsluta snabbt.',
            appearance: 'Mörkt hår, kort skägg, ärr över vänster ögonbryn. Röda skjortor under mörk jacka.'
        },
        bloom: {
            id: 'bloom',
            name: 'Sargento "Bloom" Brizuela',
            role: 'Ryggvakt',
            gender: 'man',
            age: 34,
            origin: 'Humaitá',
            portrait: 'portraits/elite/bloom.jpg',
            fullbody: 'portraits/elite_fullbody/bloom_fight.jpg',
            hp: 140,
            skill: 78,
            traits: ['tung', 'uthållig', 'nävkämpe'],
            bio: 'Stor, tyst man från Humaitá. Tidigare båtsman på floden. Hans nävar är järnskodda och hans machete är tyngre än de andras. Ryggvakten ingen vill ha bakom sig – eller framför sig.',
            combatStyle: 'Tunga slag och grepp. Bryter ben och krossar revben.',
            appearance: 'Bred, mörkhyad, kortklippt, tatueringar från flodlivet.'
        },
        arandu: {
            id: 'arandu',
            name: 'Payé Arandú',
            role: 'Schaman / Vänster flank',
            gender: 'man',
            age: 41,
            origin: 'Chaco',
            portrait: 'portraits/elite/arandu.jpg',
            fullbody: 'portraits/elite_fullbody/arandu_fight.jpg',
            hp: 95,
            skill: 70,
            traits: ['spårare', 'giftkunnig', 'tyst'],
            bio: 'Guaraní-schaman som följer med patrullen. Känner djungeln bättre än någon annan. Använder curare och rök för att desorientera fiender innan närstriden.',
            combatStyle: 'Smygande, giftade blad, och plötsliga bakhåll.',
            appearance: 'Långt mörkt hår, fjädrar, målade linjer i ansiktet.'
        },
        villalba: {
            id: 'villalba',
            name: 'Cabo Elena Villalba',
            role: 'Prickskytt / Höger flank',
            gender: 'woman',
            age: 26,
            origin: 'Encarnación',
            portrait: 'portraits/elite/villalba.jpg',
            fullbody: 'portraits/elite_fullbody/villalba_fight.jpg',
            hp: 90,
            skill: 88,
            traits: ['prickskytt', 'kall', 'bajonett'],
            bio: 'En av de få kvinnor som officiellt tjänstgjorde i frontlinjen. Tidigare jägare. Hennes Whitworth-karbin är legendarisk, men i närstrid använder hon bajonetten med iskall precision. Har dödat fler på avstånd än de flesta män i armén.',
            combatStyle: 'Precision. Sticker och skär där det gör mest ont.',
            appearance: 'Kort mörkt hår, smal, ärr på kinden, bär mansuniform med egna justeringar.'
        },
        residenta: {
            id: 'residenta',
            name: 'Capitana María "La Residente" Gómez',
            role: 'Närstridsspecialist',
            gender: 'woman',
            age: 32,
            origin: 'Asunción',
            portrait: 'portraits/elite/residenta.jpg',
            fullbody: 'portraits/elite_fullbody/residenta_fight.jpg',
            hp: 105,
            skill: 82,
            traits: ['vild', 'machete', 'moralhöjare'],
            bio: 'Ledare för en av de kvinnliga milisförbanden som senare blev kända som Las Residentas. Hård, högljudd och extremt farlig med machete. Männen i patrullen lyssnar när hon skriker order.',
            combatStyle: 'Vild och brutal. Hugger och sparkar tills motståndaren inte rör sig.',
            appearance: 'Långt hår i fläta, röda skjortor, machete alltid i handen.'
        },
        joven: {
            id: 'joven',
            name: 'Soldado Pedro "El Joven" Acosta',
            role: 'Scout / Reserv',
            gender: 'man',
            age: 19,
            origin: 'Villa Rica',
            portrait: 'portraits/elite/joven.jpg',
            fullbody: 'portraits/elite_fullbody/joven_fight.jpg',
            hp: 85,
            skill: 65,
            traits: ['snabb', 'tyst', 'läraktig'],
            bio: 'Yngst i patrullen. Rekryterades från milisen. Snabb på fötterna och bra på att smyga. Blir bättre för varje uppdrag han överlever.',
            combatStyle: 'Undviker och sticker. Lär sig av de äldre.',
            appearance: 'Ungt ansikte, kort hår, fortfarande lite för stora uniformer.'
        }
    },

    getAll: function() {
        return Object.values(this.soldiers);
    },

    getById: function(id) {
        return this.soldiers[id] || null;
    },

    // För fightscener: välj slumpmässig eller specifik
    getCombatant: function(id) {
        const s = this.getById(id);
        if (!s) return null;
        return {
            ...s,
            currentHp: s.hp,
            stance: 'ready'
        };
    }
};
