// === LADDARE FÖR NÄRSTRIDEN (Sangre, Barro y Caña) ===
// Här står laddordningen på ETT ställe. Både elituppdrag.html (själva spelet)
// och test_arena.html (testarenan) använder den här filen, så de kan aldrig
// komma ur synk. Ordningen spelar roll: varje fil bygger vidare på de tidigare.
// Lägger du till en ny närstridsfil: lägg in den i listan nedan på rätt plats.
(function () {
    var base = document.currentScript.src.replace(/[^\/]*$/, '');
    var filer = [
        'elite_melee_audio.js',
        'elite_melee_render.js',
        'elite_melee_cinematics.js',
        'elite_melee_core.js',
        'elite_melee_gore.js',
        'elite_melee_overdrive.js',
        'elite_melee_3d_textures.js',
        'elite_melee_3d_models.js',
        'elite_melee_webgl_stage.js',
        'elite_melee_animation.js',
        'elite_melee_visual_overhaul_v5.js',
        'elite_melee_cinema_v7.js',
        'elite_melee_academics.js',
        'elite_melee_combat.js'
    ];
    filer.forEach(function (f) {
        document.write('<script src="' + base + f + '"><\/script>');
    });
})();
