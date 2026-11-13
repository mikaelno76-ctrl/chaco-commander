window.EliteMelee = window.EliteMelee || {};

(function(){
  const TAU = Math.PI * 2;
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

  function injectStyles() {
    if (document.getElementById('mk-v5-style')) return;
    const st = document.createElement('style');
    st.id = 'mk-v5-style';
    st.textContent = `
      #melee-ui{
        background:
          radial-gradient(circle at 50% 12%, rgba(186,41,33,0.18), transparent 38%),
          radial-gradient(circle at 18% 90%, rgba(221,167,63,0.10), transparent 28%),
          linear-gradient(180deg, #100707 0%, #050202 100%);
      }
      .mkv5-shell{
        width:min(1320px, calc(100vw - 20px));
        height:min(900px, calc(100vh - 20px));
        display:grid;
        grid-template-rows:auto auto 1fr auto;
        gap:12px;
        padding:16px;
        border-radius:18px;
        border:1px solid rgba(191,139,68,0.55);
        background:linear-gradient(180deg, rgba(24,11,9,0.96), rgba(8,5,5,0.98));
        box-shadow:0 0 0 1px rgba(255,210,130,0.06) inset, 0 28px 80px rgba(0,0,0,0.72), 0 0 60px rgba(110,20,20,0.34);
        position:relative;
        overflow:hidden;
      }
      .mkv5-shell::before{
        content:'';
        position:absolute; inset:10px;
        border:1px solid rgba(238,194,114,0.16);
        border-radius:12px;
        pointer-events:none;
      }
      .mkv5-header{display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;}
      .mkv5-titleblock{display:flex; flex-direction:column; gap:2px;}
      .mkv5-title{font-size:1.72rem; font-weight:700; color:#f6e6cc; letter-spacing:.04em; text-shadow:0 3px 18px rgba(0,0,0,.55);}
      .mkv5-subtitle{font-size:.78rem; color:#bda88f; letter-spacing:.16em; text-transform:uppercase;}
      .mkv5-pillrow{display:flex; gap:8px; flex-wrap:wrap; align-items:center;}
      .mkv5-pill{padding:7px 12px; border-radius:999px; font-size:.76rem; letter-spacing:.08em; text-transform:uppercase; border:1px solid rgba(255,208,131,0.25); background:rgba(255,255,255,0.03); color:#f2d49c; box-shadow:0 8px 20px rgba(0,0,0,.22) inset;}
      .mkv5-phase{color:#ffcf80;}
      .mkv5-demo-bar{display:flex; gap:8px; flex-wrap:wrap; align-items:center; padding:10px 12px; border:1px solid rgba(167,128,77,0.28); border-radius:12px; background:linear-gradient(180deg, rgba(30,18,15,.78), rgba(15,10,9,.9)); box-shadow:0 8px 25px rgba(0,0,0,.25) inset;}
      .mkv5-demo-label{font-size:.72rem; color:#af9881; text-transform:uppercase; letter-spacing:.12em; margin-right:4px;}
      .mkv5-btn, .mkv5-action, .mkv5-demo-bar button, .mkv5-actions button{
        appearance:none; border:none; outline:none; cursor:pointer; transition:transform .12s ease, filter .12s ease, box-shadow .12s ease;
      }
      .mkv5-demo-bar button, .mkv5-action{
        padding:8px 12px; border-radius:10px; color:#fff4df; font:600 12px/1.15 Georgia,serif; letter-spacing:.02em;
        border:1px solid rgba(255,255,255,0.08); box-shadow:0 10px 18px rgba(0,0,0,.30), 0 0 0 1px rgba(255,255,255,.03) inset;
      }
      .mkv5-demo-bar button:hover, .mkv5-action:hover{ transform:translateY(-1px); filter:brightness(1.06); }
      .mkv5-main{display:grid; grid-template-columns:minmax(240px, 300px) minmax(0,1fr) minmax(240px, 300px); gap:14px; min-height:0;}
      .mkv5-panel{background:linear-gradient(180deg, rgba(31,18,16,.86), rgba(15,10,9,.92)); border:1px solid rgba(172,128,72,.28); border-radius:14px; padding:12px; box-shadow:0 12px 28px rgba(0,0,0,.22) inset, 0 10px 22px rgba(0,0,0,.18); display:flex; flex-direction:column; gap:12px; min-height:0;}
      .mkv5-panel-title{font-size:.78rem; color:#f1dcb2; letter-spacing:.14em; text-transform:uppercase; border-bottom:1px solid rgba(255,210,130,0.16); padding-bottom:8px;}
      .mkv5-fighter-card{display:flex; gap:10px; align-items:center;}
      .mkv5-portrait{width:72px; height:88px; object-fit:cover; border-radius:12px; border:1px solid rgba(255,211,140,0.28); background:linear-gradient(180deg, rgba(80,50,36,0.85), rgba(23,16,14,0.95)); box-shadow:0 0 0 1px rgba(255,255,255,0.03) inset;}
      .mkv5-fighter-meta{flex:1; min-width:0;}
      .mkv5-fighter-name{font-size:1.02rem; color:#f7ebd8; font-weight:700; line-height:1.2;}
      .mkv5-fighter-sub{font-size:.72rem; color:#b8a38c; text-transform:uppercase; letter-spacing:.12em; margin-top:3px;}
      .mkv5-bar-wrap{display:flex; flex-direction:column; gap:6px;}
      .mkv5-bar-label{display:flex; justify-content:space-between; font-size:.74rem; color:#d6c2a0;}
      .mkv5-bar-bg{height:14px; border-radius:999px; overflow:hidden; background:#170d0d; border:1px solid rgba(255,255,255,0.06);}
      .mkv5-bar-fill{height:100%; transition:width .14s ease; box-shadow:0 0 14px rgba(255,255,255,.14) inset;}
      .mkv5-rage{height:10px;}
      .mkv5-miniinfo{display:grid; grid-template-columns:1fr 1fr; gap:8px;}
      .mkv5-miniinfo div{padding:10px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05);}
      .mkv5-miniinfo span{display:block; font-size:.68rem; color:#a58d77; text-transform:uppercase; letter-spacing:.11em; margin-bottom:4px;}
      .mkv5-miniinfo strong{font-size:.90rem; color:#f5e8cf;}
      .mkv5-stage{
        position:relative; min-width:0; display:grid; grid-template-rows:auto 1fr auto; gap:10px;
      }
      .mkv5-vs{display:flex; justify-content:space-between; align-items:center; gap:12px; padding:0 8px;}
      .mkv5-vsname{font-size:.98rem; font-weight:700; color:#f6e7ce; max-width:40%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
      .mkv5-vsmark{font-size:1.3rem; font-weight:900; color:#f25d44; letter-spacing:.18em; text-shadow:0 0 18px rgba(242,93,68,0.28);}
      .mkv5-canvas-wrap{position:relative; min-height:0; display:flex; align-items:center; justify-content:center; overflow:hidden; border-radius:16px; border:1px solid rgba(187,138,75,0.4); background:linear-gradient(180deg, #0d0606, #040202); box-shadow:0 18px 30px rgba(0,0,0,.42), 0 0 0 1px rgba(255,255,255,.02) inset;}
      .mkv5-canvas-wrap::before{content:''; position:absolute; inset:0; background:linear-gradient(180deg, rgba(255,255,255,.03), transparent 20%, transparent 80%, rgba(0,0,0,.2)); pointer-events:none; z-index:0;}
      .mkv5-canvas-wrap::after{content:''; position:absolute; inset:0; box-shadow:inset 0 0 120px rgba(0,0,0,.48); pointer-events:none; z-index:6;}
      #mk-webgl-canvas, #mk-canvas{max-width:100%; width:100%; height:auto; display:block;}
      #mk-canvas{position:relative; z-index:2;}
      .mkv5-frame-corner{position:absolute; width:34px; height:34px; border-color:rgba(250,203,126,0.45); z-index:7; pointer-events:none;}
      .mkv5-c1{top:10px; left:10px; border-top:2px solid; border-left:2px solid; border-top-left-radius:10px;}
      .mkv5-c2{top:10px; right:10px; border-top:2px solid; border-right:2px solid; border-top-right-radius:10px;}
      .mkv5-c3{bottom:10px; left:10px; border-bottom:2px solid; border-left:2px solid; border-bottom-left-radius:10px;}
      .mkv5-c4{bottom:10px; right:10px; border-bottom:2px solid; border-right:2px solid; border-bottom-right-radius:10px;}
      .mkv5-actions{display:grid; grid-template-columns:repeat(6, minmax(0,1fr)); gap:10px;}
      .mkv5-actions button{padding:12px 10px; border-radius:12px; color:#fff7eb; font:700 13px/1.12 Georgia,serif; letter-spacing:.02em; border:1px solid rgba(255,255,255,0.08); box-shadow:0 12px 20px rgba(0,0,0,.28);}
      .mkv5-log{background:linear-gradient(180deg, rgba(8,5,5,.92), rgba(13,8,7,.96)); border:1px solid rgba(176,130,70,0.22); border-radius:12px; padding:10px; height:100%; min-height:160px; overflow:auto; font:400 12px/1.4 Consolas,monospace; color:#e7dbcc; box-shadow:inset 0 0 20px rgba(0,0,0,.2);}
      .mkv5-legend{display:grid; gap:8px;}
      .mkv5-legend-item{padding:10px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); color:#d8c4ab; font-size:.80rem; line-height:1.35;}
      .mkv5-legend-item b{color:#fff0d1;}
      .mkv5-footer{display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap; color:#af9881; font-size:.74rem; letter-spacing:.05em;}
      .mkv5-keycaps{display:flex; gap:6px; flex-wrap:wrap;}
      .mkv5-keycaps span{padding:5px 8px; border-radius:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#f4e7d2;}
      @media (max-width: 1180px){
        .mkv5-main{grid-template-columns:1fr;}
        .mkv5-shell{height:auto; max-height:none; overflow:auto;}
      }
      @media (max-width: 760px){
        .mkv5-actions{grid-template-columns:repeat(2, minmax(0,1fr));}
        .mkv5-title{font-size:1.26rem;}
      }
    `;
    document.head.appendChild(st);
  }

  const oldEnsureTextures = window.EliteMelee.ensureTextures;
  window.EliteMelee.ensureTextures = function(ctx){
    const patterns = oldEnsureTextures ? oldEnsureTextures.call(this, ctx) : {};
    if (patterns.__v5Enhanced) return patterns;
    const makeCanvas = (w,h,fn)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; fn(c.getContext('2d'),w,h); return ctx.createPattern(c,'repeat'); };

    patterns.stoneWall = makeCanvas(256,128,(g,w,h)=>{
      const bg = g.createLinearGradient(0,0,0,h);
      bg.addColorStop(0,'#1a1713'); bg.addColorStop(.55,'#14110e'); bg.addColorStop(1,'#0d0a08');
      g.fillStyle = bg; g.fillRect(0,0,w,h);
      for(let row=0; row<4; row++){
        const y = row*32, off=(row%2)*28;
        for(let col=-1; col<5; col++){
          const x = col*58+off;
          const grad = g.createLinearGradient(x,y,x,y+28);
          grad.addColorStop(0,'#2d2923'); grad.addColorStop(.5,'#1c1a16'); grad.addColorStop(1,'#13110f');
          g.fillStyle=grad; g.fillRect(x+2,y+2,54,28);
          g.strokeStyle='rgba(227,208,174,0.05)'; g.strokeRect(x+2.5,y+2.5,53,27);
        }
      }
      for(let i=0;i<420;i++){
        g.fillStyle = Math.random()<.25 ? 'rgba(58,80,44,0.22)' : Math.random()<.65 ? 'rgba(0,0,0,0.18)' : 'rgba(230,208,182,0.03)';
        g.fillRect(Math.random()*w, Math.random()*h, 2, 2);
      }
      for(let i=0;i<12;i++){
        g.strokeStyle='rgba(32,65,34,0.18)'; g.lineWidth=2+Math.random()*3;
        g.beginPath(); const sx=Math.random()*w; g.moveTo(sx,0); g.bezierCurveTo(sx+20,40,sx-10,90,sx+10,h); g.stroke();
      }
    });

    patterns.mudFloor = makeCanvas(256,128,(g,w,h)=>{
      const bg=g.createLinearGradient(0,0,0,h);
      bg.addColorStop(0,'#2b2117'); bg.addColorStop(.5,'#1b130d'); bg.addColorStop(1,'#0d0907');
      g.fillStyle=bg; g.fillRect(0,0,w,h);
      for(let c=0;c<40;c++){
        const x=Math.random()*w, y=Math.random()*h;
        g.fillStyle=Math.random()>.5?'rgba(66,44,28,0.45)':'rgba(24,16,10,0.55)';
        g.beginPath(); g.ellipse(x,y,10+Math.random()*22,4+Math.random()*8,Math.random()*.6,0,TAU); g.fill();
      }
      for(let i=0;i<520;i++){
        g.fillStyle = Math.random()<.18 ? 'rgba(220,170,110,0.08)' : 'rgba(0,0,0,0.22)';
        g.fillRect(Math.random()*w, Math.random()*h, 2, 1.5);
      }
    });

    patterns.brazilGreen = makeCanvas(32,32,(g,w,h)=>{
      g.fillStyle='#223826'; g.fillRect(0,0,w,h);
      g.fillStyle='rgba(171,138,50,0.14)'; g.fillRect(0,11,w,3);
      g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(0,18,w,2);
      for(let i=0;i<44;i++){
        g.fillStyle=Math.random()>.5?'rgba(0,0,0,0.28)':'rgba(110,88,55,0.18)'; g.fillRect(Math.random()*w,Math.random()*h,2,2);
      }
    });

    patterns.rustedArmor = makeCanvas(48,48,(g,w,h)=>{
      const grad=g.createLinearGradient(0,0,w,h);
      grad.addColorStop(0,'#40484c'); grad.addColorStop(.5,'#262c2f'); grad.addColorStop(1,'#171b1d');
      g.fillStyle=grad; g.fillRect(0,0,w,h);
      for(let i=0;i<120;i++){
        g.fillStyle = Math.random()<.36 ? 'rgba(138,58,23,0.42)' : Math.random()<.72 ? 'rgba(240,240,240,0.08)' : 'rgba(0,0,0,0.35)';
        g.fillRect(Math.random()*w,Math.random()*h,2.5,2.5);
      }
    });

    patterns.__v5Enhanced = true;
    return patterns;
  };

  Object.assign(window.EliteMelee, {
    getVisualTheme: function(){
      return (this.campaignBiome === 'pampas') ? 'pampas' : 'jungle';
    },

    buildOverlayUI: function(){
      injectStyles();
      let el = document.getElementById('melee-ui');
      if (!el) {
        el = document.createElement('div');
        el.id = 'melee-ui';
        document.body.appendChild(el);
      }
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.padding = '10px';

      const heroPortrait = (this.hero && this.hero.portrait) ? this.hero.portrait : '';
      const themeName = this.getVisualTheme() === 'pampas' ? 'Pampas / Corrientes' : 'Paraguay / Djungelkatakomber';
      el.innerHTML = `
        <div class="mkv5-shell">
          <div class="mkv5-header">
            <div class="mkv5-titleblock">
              <div class="mkv5-title">Sangre, Barro y Caña</div>
              <div class="mkv5-subtitle">Cinematic Melee Suite · Visual Overhaul V5</div>
            </div>
            <div class="mkv5-pillrow">
              <div class="mkv5-pill">Tema: <span id="mk-biome-badge">${themeName}</span></div>
              <div class="mkv5-pill mkv5-phase">Fas: <span id="mk-phase-badge">Fighting</span></div>
              <div class="mkv5-pill">Render: <span id="mk-render-badge">2D/3D Hybrid</span></div>
            </div>
          </div>

          <div class="mkv5-demo-bar">
            <span class="mkv5-demo-label">Scenval / Debug:</span>
            <button id="mk-btn-webgl" style="background:#7a251c;border-color:#e0a857;">💀 3D-Oljemålnings-Modeller: PÅ</button>
            <button onclick="EliteMelee.switchFighter('bloom')" style="background:#20364e;">🥊 Bloom</button>
            <button onclick="EliteMelee.switchFighter('gomez')" style="background:#5a2024;">🗡️ Gómez</button>
            <button onclick="EliteMelee.switchFighter('villalba')" style="background:#4b3428;">🔫 Villalba</button>
            <button onclick="EliteMelee.switchFighter('rojas')" style="background:#564220;">⚔️ Rojas</button>
            <button onclick="EliteMelee.switchFighter('arandu')" style="background:#6b3a1f;">🔪 Arandú</button>
            <button onclick="EliteMelee.switchFighter('takeda')" style="background:#352245;">🏮 Takeda</button>
            <button onclick="EliteMelee.gauntlet.stage='conquistadors';EliteMelee.enemy=EliteMelee.createGauntletEnemy('conquistadors');EliteMelee.phase='fighting';EliteMelee.updateTopBars();" style="background:#263238;">⚔️ 3D-Conquistador</button>
            <button onclick="EliteMelee.triggerUsurperTakeover('conquistador')" style="background:#3d5161;">🎬 Zombie Close-Up</button>
            <button onclick="EliteMelee.startPomberoCanaSearchCutscene && EliteMelee.startPomberoCanaSearchCutscene()" style="background:#412168;">🚬 Pombero Caña</button>
            <button onclick="EliteMelee.startPomberoSakeDiplomacyCutscene && EliteMelee.startPomberoSakeDiplomacyCutscene()" style="background:#1f5f3a;">🍶 Sake-Deal</button>
            <button onclick="EliteMelee.triggerConquistadorGutRipDemo && EliteMelee.triggerConquistadorGutRipDemo()" style="background:#5e1717;">🚽 Mierda-Slutet</button>
            <button onclick="EliteMelee.startAmputationDemo && EliteMelee.startAmputationDemo()" style="background:#6a0f0f;">✂️ Amputation</button>
            <button onclick="EliteMelee.demoUsurper && EliteMelee.demoUsurper(0)" style="background:#34454f;">🦴 Ryggrad ut</button>
            <button onclick="EliteMelee.demoUsurper && EliteMelee.demoUsurper(1)" style="background:#5a1630;">🫀 Hjärtat ut</button>
            <button onclick="EliteMelee.demoUsurper && EliteMelee.demoUsurper(3)" style="background:#61243a;">🩸 Tarmar ut</button>
            <button id="mk-btn-pampas" style="background:#0d47a1;">🌾 Växla Pampas/Djungel</button>
            <button onclick="EliteMelee.triggerBoleadorasStrangleDemo && EliteMelee.triggerBoleadorasStrangleDemo()" style="background:#b54a17;">🪃 Boleadoras</button>
          </div>

          <div class="mkv5-main">
            <aside class="mkv5-panel">
              <div class="mkv5-panel-title">Operativ profil</div>
              <div class="mkv5-fighter-card">
                <img class="mkv5-portrait" id="mk-hero-port" src="${heroPortrait}" onerror="this.style.opacity=.25;this.removeAttribute('src');">
                <div class="mkv5-fighter-meta">
                  <div class="mkv5-fighter-name" id="mk-hero-name">${this.hero ? this.hero.name : 'Okänd soldat'}</div>
                  <div class="mkv5-fighter-sub">Spelarkaraktär</div>
                </div>
              </div>
              <div class="mkv5-bar-wrap">
                <div class="mkv5-bar-label"><span>Vitalitet</span><strong id="mk-hero-hp-txt">${this.hero ? this.hero.hp : 0}/${this.hero ? this.hero.maxHp : 0}</strong></div>
                <div class="mkv5-bar-bg"><div class="mkv5-bar-fill" id="mk-hero-bar" style="width:100%;background:linear-gradient(90deg,#206535,#7ed28a);"></div></div>
              </div>
              <div class="mkv5-bar-wrap">
                <div class="mkv5-bar-label"><span>Furia</span><strong id="mk-rage-txt">${this.hero && this.hero.rage ? this.hero.rage : 0}%</strong></div>
                <div class="mkv5-bar-bg mkv5-rage"><div class="mkv5-bar-fill" id="mk-rage-bar" style="width:${this.hero && this.hero.rage ? this.hero.rage : 0}%;background:linear-gradient(90deg,#dc5b19,#ff1744);"></div></div>
              </div>
              <div class="mkv5-miniinfo">
                <div><span>Miljö</span><strong id="mk-left-biome">${themeName}</strong></div>
                <div><span>Status</span><strong id="mk-status-readout">En guardia</strong></div>
              </div>
              <div class="mkv5-panel-title">Taktiska tips</div>
              <div class="mkv5-legend">
                <div class="mkv5-legend-item"><b>Tryck framåt</b> för att hålla press och få plats med slagkedjor.</div>
                <div class="mkv5-legend-item"><b>Växla biome</b> för helt annan stämning mellan djungelkatakomb och pampas.</div>
                <div class="mkv5-legend-item"><b>3D-läget</b> ger skulpterade modeller, medan 2D-läget nu fått en mycket snyggare arena.</div>
              </div>
            </aside>

            <section class="mkv5-stage">
              <div class="mkv5-vs">
                <div class="mkv5-vsname" id="mk-vs-hero">${this.hero ? this.hero.name : 'Hero'}</div>
                <div class="mkv5-vsmark">VS</div>
                <div class="mkv5-vsname" id="mk-vs-enemy" style="text-align:right;">${this.enemy ? this.enemy.name : 'Enemy'}</div>
              </div>
              <div class="mkv5-canvas-wrap">
                <canvas id="mk-canvas" width="880" height="480"></canvas>
                <div class="mkv5-frame-corner mkv5-c1"></div>
                <div class="mkv5-frame-corner mkv5-c2"></div>
                <div class="mkv5-frame-corner mkv5-c3"></div>
                <div class="mkv5-frame-corner mkv5-c4"></div>
              </div>
              <div class="mkv5-actions">
                <button class="mkv5-action" onmousedown="EliteMelee.step(-45)" style="background:linear-gradient(180deg,#4a3624,#281d14);">◄ Kliv bakåt</button>
                <button class="mkv5-action" onmousedown="EliteMelee.step(45)" style="background:linear-gradient(180deg,#4a3624,#281d14);">Kliv fram ►</button>
                <button class="mkv5-action" onmousedown="EliteMelee.performAttack('punch')" style="background:linear-gradient(180deg,#9d231f,#641111);">👊 Käkslag [A]</button>
                <button class="mkv5-action" onmousedown="EliteMelee.performAttack('kick')" style="background:linear-gradient(180deg,#b5342b,#781515);">🦵 Knäspark [S]</button>
                <button class="mkv5-action" onmousedown="EliteMelee.performAttack('grapple')" style="background:linear-gradient(180deg,#6d2b8d,#43115c);">🦴 Grepp / bryt [D]</button>
                <button class="mkv5-action" id="mk-btn-fatality" onmousedown="EliteMelee.performAttack('fatality')" style="background:linear-gradient(180deg,#2b2b2b,#090909); color:#ffd66e; border-color:rgba(255,214,110,.38);">💀 Liquidar [X]</button>
              </div>
            </section>

            <aside class="mkv5-panel">
              <div class="mkv5-panel-title">Motståndare / stridslogg</div>
              <div class="mkv5-fighter-card">
                <div class="mkv5-portrait" style="display:flex;align-items:center;justify-content:center;font-size:1.8rem;">☠️</div>
                <div class="mkv5-fighter-meta">
                  <div class="mkv5-fighter-name" id="mk-en-name">${this.enemy ? this.enemy.name : 'Mål'}</div>
                  <div class="mkv5-fighter-sub">Motståndare</div>
                </div>
              </div>
              <div class="mkv5-bar-wrap">
                <div class="mkv5-bar-label"><span>Vitalitet</span><strong id="mk-en-hp-txt">${this.enemy ? this.enemy.hp : 0}/${this.enemy ? this.enemy.maxHp : 0}</strong></div>
                <div class="mkv5-bar-bg"><div class="mkv5-bar-fill" id="mk-en-bar" style="width:100%;background:linear-gradient(90deg,#8c1414,#ff5d52);"></div></div>
              </div>
              <div class="mkv5-miniinfo">
                <div><span>Typ</span><strong id="mk-enemy-kind">${this.enemy ? (this.enemy.type || 'fiende') : 'fiende'}</strong></div>
                <div><span>Trauma</span><strong id="mk-en-trauma">Intakt</strong></div>
              </div>
              <div class="mkv5-panel-title">Fältrapport</div>
              <div id="mk-log-strip" class="mkv5-log"></div>
            </aside>
          </div>

          <div class="mkv5-footer">
            <div>Visual Overhaul V5 · mörkare paneldesign, tydligare HUD, mer filmisk arena och bättre scenläsbarhet.</div>
            <div class="mkv5-keycaps"><span>A Slag</span><span>S Spark</span><span>D Grepp</span><span>X Liquidar</span><span>←/→ Position</span></div>
          </div>
        </div>`;

      this.canvas = document.getElementById('mk-canvas');
      this.ctx = this.canvas.getContext('2d');

      const webglBtn = document.getElementById('mk-btn-webgl');
      if (webglBtn) {
        webglBtn.onclick = () => this.toggleWebGLMode && this.toggleWebGLMode();
      }
      const pampasBtn = document.getElementById('mk-btn-pampas');
      if (pampasBtn) {
        pampasBtn.onclick = () => this.setCampaignBiome && this.setCampaignBiome(this.campaignBiome === 'pampas' ? 'jungle' : 'pampas');
      }

      this.updateTopBars();
      if (this.initWebGLStage) this.initWebGLStage();
    },

    updateTopBars: function(){
      const hero = this.hero || {hp:0,maxHp:1,rage:0,name:'Hero'};
      const enemy = this.enemy || {hp:0,maxHp:1,name:'Enemy',type:'enemy'};
      const hPct = clamp(Math.round((hero.hp / Math.max(1, hero.maxHp)) * 100), 0, 100);
      const ePct = clamp(Math.round((enemy.hp / Math.max(1, enemy.maxHp)) * 100), 0, 100);
      const ragePct = clamp(Math.round(hero.rage || 0), 0, 100);

      const setText = (id, txt)=>{ const el=document.getElementById(id); if(el) el.textContent = txt; };
      const setWidth = (id, w)=>{ const el=document.getElementById(id); if(el) el.style.width = w + '%'; };

      setWidth('mk-hero-bar', hPct); setWidth('mk-en-bar', ePct); setWidth('mk-rage-bar', ragePct);
      setText('mk-hero-hp-txt', `${hero.hp}/${hero.maxHp}`);
      setText('mk-en-hp-txt', `${enemy.hp}/${enemy.maxHp}`);
      setText('mk-rage-txt', `${ragePct}%`);
      setText('mk-hero-name', hero.name);
      setText('mk-en-name', enemy.name);
      setText('mk-vs-hero', hero.name);
      setText('mk-vs-enemy', enemy.name);
      setText('mk-enemy-kind', enemy.type || 'enemy');
      const themeName = this.getVisualTheme() === 'pampas' ? 'Pampas / Corrientes' : 'Paraguay / Djungelkatakomber';
      setText('mk-biome-badge', themeName);
      setText('mk-left-biome', themeName);
      setText('mk-render-badge', this.webglEnabled && this.webglMode === 'full3d' ? 'Full 3D' : '2D Prestige');
      setText('mk-phase-badge', (this.phase || 'fighting').replace(/_/g,' '));
      const status = this.phase === 'takeover_anim' ? 'Cinematico' : this.phase === 'enemy_fatality_anim' ? 'Extremo' : this.phase === 'sake_diplomacy_anim' ? 'Diplomacia' : 'En guardia';
      setText('mk-status-readout', status);

      let trauma = [];
      const inj = enemy.injuries || {};
      if (inj.armSevered) trauma.push('arm av');
      if (inj.headSevered) trauma.push('halshuggning');
      if (inj.spineSnapped) trauma.push('rygg bruten');
      if (inj.disemboweled) trauma.push('inälvor');
      if (!trauma.length) trauma.push('intakt');
      setText('mk-en-trauma', trauma.join(', '));
    },

    drawBackdropV5: function(ctx, w, h, now, tex){
      const theme = this.getVisualTheme();
      if (theme === 'pampas') return this.drawPampasBackdropV5(ctx, w, h, now, tex);
      return this.drawJungleBackdropV5(ctx, w, h, now, tex);
    },

    drawJungleBackdropV5: function(ctx, w, h, now, tex){
      const bg = ctx.createLinearGradient(0,0,0,h);
      bg.addColorStop(0,'#130b0b'); bg.addColorStop(.45,'#20130f'); bg.addColorStop(1,'#090505');
      ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

      ctx.save();
      ctx.globalAlpha = .95;
      ctx.fillStyle = tex.stoneWall || '#171311';
      ctx.fillRect(-40, 20, w+80, 280);
      ctx.restore();

      for(let i=0;i<5;i++){
        const px = 90 + i * 170;
        const grad = ctx.createLinearGradient(px-24,0,px+24,0);
        grad.addColorStop(0,'#0f0c0a'); grad.addColorStop(.5,'#2f2a24'); grad.addColorStop(1,'#0c0b09');
        ctx.fillStyle = grad;
        ctx.fillRect(px-20, 42, 40, 274);
        ctx.fillStyle = 'rgba(0,0,0,0.34)'; ctx.fillRect(px+12, 42, 8, 274);
      }

      for(let i=0;i<2;i++){
        const tx = i === 0 ? 146 : w-146;
        const ty = 150;
        const flame = 18 + Math.sin(now*0.008 + i*1.7) * 4;
        const glow = ctx.createRadialGradient(tx,ty,6,tx,ty,80);
        glow.addColorStop(0,'rgba(255,218,128,.78)');
        glow.addColorStop(.35,'rgba(255,128,0,.38)');
        glow.addColorStop(1,'rgba(255,128,0,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(tx,ty,82,0,TAU); ctx.fill();
        ctx.fillStyle = '#2a1a13'; ctx.fillRect(tx-4, ty-10, 8, 58);
        ctx.fillStyle = '#ffd366'; ctx.beginPath(); ctx.moveTo(tx, ty-24-flame); ctx.quadraticCurveTo(tx+12, ty-8, tx, ty+6); ctx.quadraticCurveTo(tx-12, ty-8, tx, ty-24-flame); ctx.fill();
        ctx.fillStyle = '#ff6d00'; ctx.beginPath(); ctx.moveTo(tx, ty-18-flame*.66); ctx.quadraticCurveTo(tx+8, ty-2, tx, ty+4); ctx.quadraticCurveTo(tx-8, ty-2, tx, ty-18-flame*.66); ctx.fill();
      }

      // FIX #6: lianerna slumpades om varje bildruta och flimrade. Nu slumpas de en gång och svajar lugnt.
      if (!this._lianas) {
        this._lianas = [];
        for(let i=0;i<12;i++) this._lianas.push({ sx: Math.random()*w, lw: 1+Math.random()*1.5, ph: Math.random()*TAU });
      }
      ctx.strokeStyle='rgba(61,97,53,0.46)';
      this._lianas.forEach(l => {
        const sway = Math.sin(now*0.0009 + l.ph) * 6;
        ctx.lineWidth = l.lw;
        ctx.beginPath(); ctx.moveTo(l.sx,0); ctx.bezierCurveTo(l.sx+18+sway,90,l.sx-32+sway,190,l.sx+10+sway*1.5,320); ctx.stroke();
      });

      const floorGrad = ctx.createLinearGradient(0,320,0,h);
      floorGrad.addColorStop(0,'#2f2118'); floorGrad.addColorStop(.6,'#17100b'); floorGrad.addColorStop(1,'#0b0705');
      ctx.fillStyle = tex.mudFloor || floorGrad;
      ctx.fillRect(0, 320, w, h-320);
      ctx.fillStyle = 'rgba(255,190,110,0.04)';
      for(let i=0;i<20;i++) ctx.fillRect(i*44, 334 + Math.sin(i*0.7+now*0.001)*3, 18, 1.5);

      const haze = ctx.createLinearGradient(0,220,0,360);
      haze.addColorStop(0,'rgba(255,170,95,0.00)'); haze.addColorStop(1,'rgba(255,135,80,0.08)');
      ctx.fillStyle = haze; ctx.fillRect(0,220,w,140);
    },

    drawPampasBackdropV5: function(ctx, w, h, now, tex){
      const sky = ctx.createLinearGradient(0,0,0,h);
      sky.addColorStop(0,'#120f2d'); sky.addColorStop(.36,'#4b2543'); sky.addColorStop(.68,'#8b4930'); sky.addColorStop(1,'#26170d');
      ctx.fillStyle = sky; ctx.fillRect(0,0,w,h);

      const moon = ctx.createRadialGradient(150,96,8,150,96,44);
      moon.addColorStop(0,'rgba(255,244,204,.95)'); moon.addColorStop(.35,'rgba(255,229,173,.55)'); moon.addColorStop(1,'rgba(255,229,173,0)');
      ctx.fillStyle = moon; ctx.beginPath(); ctx.arc(150,96,46,0,TAU); ctx.fill();

      ctx.fillStyle='rgba(45,22,24,0.42)';
      for(let i=0;i<6;i++){
        ctx.beginPath();
        const bx = i*180-60;
        ctx.moveTo(bx, 250);
        ctx.quadraticCurveTo(bx+90, 190 + Math.sin(i)*18, bx+180, 250);
        ctx.lineTo(bx+180, 280); ctx.lineTo(bx, 280); ctx.closePath(); ctx.fill();
      }

      ctx.strokeStyle='rgba(33,16,12,0.55)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(0,280); ctx.lineTo(w,280); ctx.stroke();
      for(let i=0;i<18;i++){
        const fx = i*(w/17);
        ctx.beginPath(); ctx.moveTo(fx, 280); ctx.lineTo(fx+6, 308); ctx.stroke();
      }

      const floorGrad = ctx.createLinearGradient(0,290,0,h);
      floorGrad.addColorStop(0,'#4a2f1d'); floorGrad.addColorStop(.5,'#2d1c12'); floorGrad.addColorStop(1,'#130b07');
      ctx.fillStyle = floorGrad; ctx.fillRect(0, 290, w, h-290);
      for(let i=0;i<80;i++){
        const x = (i * 13) % w;
        const gh = 16 + (i % 5) * 8 + Math.sin(now*0.0015 + i) * 3;
        ctx.strokeStyle = i % 3 === 0 ? 'rgba(87,110,46,0.58)' : 'rgba(126,103,50,0.48)';
        ctx.beginPath(); ctx.moveTo(x, 420); ctx.lineTo(x+2, 420-gh); ctx.stroke();
      }
      ctx.fillStyle='rgba(255,225,170,0.04)';
      for(let i=0;i<50;i++) ctx.fillRect((i*37)%w, 320 + (i%6)*18, 1.5, 1.5);
    },

    drawScreenFXV5: function(ctx,w,h,now){
      const vignette = ctx.createRadialGradient(w/2,h/2,140,w/2,h/2,Math.max(w,h)*0.62);
      vignette.addColorStop(0,'rgba(0,0,0,0)');
      vignette.addColorStop(1,'rgba(0,0,0,0.52)');
      ctx.fillStyle = vignette; ctx.fillRect(0,0,w,h);
      ctx.fillStyle='rgba(255,255,255,0.025)';
      for(let y=0;y<h;y+=4) ctx.fillRect(0,y,w,1);
      ctx.fillStyle = 'rgba(255,130,80,0.025)';
      ctx.fillRect(0,0,w,h);
      if (this.slowMoTimer > 0) {
        ctx.fillStyle = 'rgba(255,210,170,0.04)'; ctx.fillRect(0,0,w,h);
      }
    },

    renderArena: function(now, realNow){
      // Handmålade filmscener (Pombero, Mierda) tar över hela bilden när de spelas
      if (this.renderPaintedCinematic && this.renderPaintedCinematic(now)) return;
      if (this.webglEnabled && this.webglMode === 'full3d' && window.THREE && this.webglRenderer) {
        // FIX #5: frysbild och experter sköts nu enbart av academics-modulen (som anropar oss).
        // Här ritas bara HUD-lagret och 3D-scenen, med verklig bildrutetid i stället för fasta 0.016 s.
        if (this.render3DHUDOverlay && this.updateAndRenderWebGL) {
          const dt = (this._frameDt || 0.016) * (this.slowMoTimer > 0 ? (this.slowMoFactor || 0.2) : 1) * (this.hitStop > 0 ? 0 : 1);
          this.render3DHUDOverlay(now);
          this.updateAndRenderWebGL(dt, realNow || now);
          return;
        }
      }

      if (!this.ctx) return;
      const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, tex = this.ensureTextures(ctx), floorY = 415;

      if (this.phase === 'takeover_anim' && this.usurper) {
        if (this.usurper.stage === 'horror_closeup' && this.drawHorrorFaceCloseup) { this.drawHorrorFaceCloseup(ctx, w, h, now, tex); return; }
        if (this.usurper.stage === 'pombero_cana_autopsy' && this.drawPomberoCanaSearchScene) { this.drawPomberoCanaSearchScene(ctx, w, h, now, tex); return; }
      }
      if (this.phase === 'sake_diplomacy_anim' && this.drawPomberoSakeDiplomacyScene) { this.drawPomberoSakeDiplomacyScene(ctx, w, h, now, tex); return; }
      if (this.phase === 'enemy_fatality_anim' && this.enemyFatalityStage === 'piss_front_closeup' && this.drawZombieGroinFailCloseup) { this.drawZombieGroinFailCloseup(ctx, w, h, now, tex); return; }

      ctx.clearRect(0,0,w,h);
      ctx.save();
      if (Math.abs(this.camZoom - 1.0) > 0.005) {
        ctx.translate(w / 2, h / 2);
        ctx.scale(this.camZoom, this.camZoom);
        ctx.translate(-this.camFocusX, -this.camFocusY);
      }
      if (this.camShake > 0) ctx.translate((Math.random() - 0.5) * this.camShake, (Math.random() - 0.5) * this.camShake);

      this.drawBackdropV5(ctx,w,h,now,tex);

      // markerad spelplan / center stage
      ctx.fillStyle='rgba(255,222,170,0.05)';
      ctx.beginPath(); ctx.ellipse(w/2, floorY+3, 250, 22, 0, 0, TAU); ctx.fill();

      this.groundBlood.forEach(gb => {
        ctx.fillStyle = gb.col || '#650606';
        ctx.beginPath(); ctx.ellipse(gb.x, gb.y, gb.r * 1.9, gb.r * 0.48, 0, 0, TAU); ctx.fill();
      });

      // skuggor under figurerna
      [this.hero, this.enemy, this.usurper].forEach(f => {
        if (!f) return;
        ctx.fillStyle='rgba(0,0,0,0.34)';
        ctx.beginPath(); ctx.ellipse(f.x + (f === this.hero ? 12 : -12), floorY + 2, 62, 14, 0, 0, TAU); ctx.fill();
      });

      if (this.hero) this.drawFighterBody(ctx, this.hero, true, now, tex);
      if (this.enemy) this.drawFighterBody(ctx, this.enemy, false, now, tex);
      if (this.usurper) this.drawFighterBody(ctx, this.usurper, false, now, tex);

      this.drawVisceraChains(ctx);
      this.drawSeveredLimbs(ctx, tex);
      this.bloodParticles.forEach(p => { ctx.fillStyle = p.col; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * (p.stretch || 1), p.size, 0, 0, TAU); ctx.fill(); });
      this.drawAnatomicalBonePieces(ctx);
      if (this.drawGoreWorldOverlays) this.drawGoreWorldOverlays(ctx, now);
      if (this.xrayTimer > 0 && this.drawXRayOverlay && this.enemy) this.drawXRayOverlay(ctx, this.enemy.x, this.enemy.y - 195, this.xrayTargetPart);
      ctx.restore();

      if (this.cinemaBanner) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '700 31px Georgia';
        ctx.fillStyle = '#ffe0a8';
        ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 16;
        ctx.fillText(this.cinemaBanner, w / 2, 52);
        if (this.cinemaSubBanner) {
          ctx.font = 'italic 16px Georgia';
          ctx.fillStyle = '#ffd285';
          ctx.fillText(this.cinemaSubBanner, w / 2, 78);
        }
        ctx.restore();
      }

      this.drawScreenFXV5(ctx,w,h,now);
    }
  });
})();
