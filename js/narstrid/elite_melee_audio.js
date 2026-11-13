// === DEL 1 AV 7: ELITE MELEE AUDIO & DIALOG (elite_melee_audio.js) ===
window.EliteMelee = window.EliteMelee || {};

Object.assign(window.EliteMelee, {
    audioCtx: null,
    initAudio: function() {
        if (!this.audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.audioCtx = new AC();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume();
    },
    speakLine: function(text, lang = 'es-ES', pitch = 0.6, rate = 0.85) {
        try {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(text);
                u.lang = lang; u.pitch = pitch; u.rate = rate; u.volume = 0.95;
                window.speechSynthesis.speak(u);
            }
        } catch (e) {}
    },
    playCensorBeep: function(dur = 0.28) {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const o = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(1000, now);
        g.gain.setValueAtTime(0.28, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
        o.connect(g); g.connect(this.audioCtx.destination);
        o.start(now); o.stop(now + dur + 0.02);
    },
    playCigarettePuff: function() {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime, len = Math.floor(this.audioCtx.sampleRate * 0.5);
        const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.05 ? 2.2 : 0.4) * Math.sin((i / len) * Math.PI);
        const n = this.audioCtx.createBufferSource(), f = this.audioCtx.createBiquadFilter(), g = this.audioCtx.createGain();
        n.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1800; g.gain.value = 0.35;
        n.connect(f); f.connect(g); g.connect(this.audioCtx.destination); n.start(now);
    },
    playSakeGulp: function() {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        for (let i = 0; i < 3; i++) {
            const t0 = now + i * 0.28, o = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(220, t0); o.frequency.exponentialRampToValueAtTime(480, t0 + 0.14);
            g.gain.setValueAtTime(0.4, t0); g.gain.exponentialRampToValueAtTime(0.01, t0 + 0.18);
            o.connect(g); g.connect(this.audioCtx.destination); o.start(t0); o.stop(t0 + 0.2);
        }
    },
    playZombieDragAndRattle: function() {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        for (let s = 0; s < 3; s++) {
            const t0 = now + s * 0.62, len = Math.floor(this.audioCtx.sampleRate * 0.4);
            const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate), d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
            const n = this.audioCtx.createBufferSource(), f = this.audioCtx.createBiquadFilter(), g = this.audioCtx.createGain();
            n.buffer = buf; f.type = 'bandpass'; f.frequency.value = 160 + s * 45;
            g.gain.setValueAtTime(0.45 + s * 0.15, t0); g.gain.exponentialRampToValueAtTime(0.01, t0 + 0.39);
            n.connect(f); f.connect(g); g.connect(this.audioCtx.destination); n.start(t0);
        }
    },
    playChokedAgonyScream: function() {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;
        const o1 = this.audioCtx.createOscillator(), o2 = this.audioCtx.createOscillator(), lfo = this.audioCtx.createOscillator();
        const lg = this.audioCtx.createGain(), f = this.audioCtx.createBiquadFilter(), mg = this.audioCtx.createGain();
        o1.type = 'sawtooth'; o2.type = 'square';
        o1.frequency.setValueAtTime(520, now); o1.frequency.exponentialRampToValueAtTime(640, now + 0.22);
        o1.frequency.exponentialRampToValueAtTime(165, now + 0.75); o1.frequency.linearRampToValueAtTime(58, now + 1.6);
        o2.frequency.setValueAtTime(537, now); o2.frequency.exponentialRampToValueAtTime(148, now + 0.75);
        lfo.frequency.value = 24; lg.gain.value = 38; lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
        f.type = 'bandpass'; f.frequency.setValueAtTime(1150, now); f.frequency.exponentialRampToValueAtTime(340, now + 0.85); f.Q.value = 3.0;
        mg.gain.setValueAtTime(0.5, now); mg.gain.exponentialRampToValueAtTime(0.001, now + 1.65);
        o1.connect(f); o2.connect(f); f.connect(mg); mg.connect(this.audioCtx.destination);
        o1.start(now); o2.start(now); lfo.start(now); o1.stop(now + 1.68); o2.stop(now + 1.68); lfo.stop(now + 1.68);
    },
    playDryClothRip: function() {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime, len = Math.floor(this.audioCtx.sampleRate * 0.6);
        const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.sin(i * 0.08) > 0 ? 1 : 0.2) * Math.exp(-i / (this.audioCtx.sampleRate * 0.3));
        const n = this.audioCtx.createBufferSource(), f = this.audioCtx.createBiquadFilter(), g = this.audioCtx.createGain();
        n.buffer = buf; f.type = 'highpass'; f.frequency.value = 900; g.gain.setValueAtTime(0.6, now); g.gain.exponentialRampToValueAtTime(0.01, now + 0.58);
        n.connect(f); f.connect(g); g.connect(this.audioCtx.destination); n.start(now);
    },
    playArmorCreakAndDryPuff: function() {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime, o = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(140, now); o.frequency.linearRampToValueAtTime(195, now + 0.25); o.frequency.linearRampToValueAtTime(110, now + 0.55);
        g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
        o.connect(g); g.connect(this.audioCtx.destination); o.start(now); o.stop(now + 0.6);
    },
    playZombieMierdaVoice: function() {
        this.initAudio();
        if (this.audioCtx) {
            const now = this.audioCtx.currentTime, o = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
            o.type = 'sawtooth'; o.frequency.setValueAtTime(78, now); o.frequency.linearRampToValueAtTime(60, now + 0.55);
            o.frequency.setValueAtTime(50, now + 0.65); o.frequency.linearRampToValueAtTime(34, now + 1.35);
            g.gain.setValueAtTime(0.45, now); g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
            o.connect(g); g.connect(this.audioCtx.destination); o.start(now); o.stop(now + 1.45);
        }
        this.speakLine('mierda...', 'es-ES', 0.1, 0.48);
    },
    playBoneCrunch: function(heavy) {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime, o = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(heavy ? 105 : 145, now); o.frequency.exponentialRampToValueAtTime(24, now + (heavy ? 0.32 : 0.18));
        g.gain.setValueAtTime(heavy ? 0.75 : 0.45, now); g.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.34 : 0.20));
        o.connect(g); g.connect(this.audioCtx.destination); o.start(now); o.stop(now + (heavy ? 0.35 : 0.21));
    },
    playGutRipSound: function() {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime, len = Math.floor(this.audioCtx.sampleRate * 0.65);
        const buf = this.audioCtx.createBuffer(1, len, this.audioCtx.sampleRate), d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.sin(i * 0.015) * 0.5 + 0.5) * Math.exp(-i / (this.audioCtx.sampleRate * 0.35));
        const n = this.audioCtx.createBufferSource(), f = this.audioCtx.createBiquadFilter(), g = this.audioCtx.createGain();
        n.buffer = buf; f.type = 'lowpass'; f.frequency.setValueAtTime(640, now); f.frequency.linearRampToValueAtTime(180, now + 0.6); g.gain.value = 0.8;
        n.connect(f); f.connect(g); g.connect(this.audioCtx.destination); n.start(now);
    },
    playGurgleScream: function(demonic) {
        this.initAudio(); if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime, o = this.audioCtx.createOscillator(), g = this.audioCtx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(demonic ? 115 : 185, now); o.frequency.linearRampToValueAtTime(demonic ? 42 : 68, now + (demonic ? 0.95 : 0.6));
        g.gain.setValueAtTime(demonic ? 0.5 : 0.35, now); g.gain.exponentialRampToValueAtTime(0.001, now + (demonic ? 0.98 : 0.64));
        o.connect(g); g.connect(this.audioCtx.destination); o.start(now); o.stop(now + (demonic ? 1.0 : 0.65));
    }
});
