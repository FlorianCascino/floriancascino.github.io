(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia('(pointer: coarse)').matches;

  var cursor = document.getElementById('custom-cursor');
  if (cursor && !isCoarse) {
    document.addEventListener('mousemove', function (e) {
      cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
    });
    var sel = 'a, button, input, [role="button"], [tabindex]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(sel)) cursor.classList.add('hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(sel)) cursor.classList.remove('hover');
    });
  }

  var heroSvg = document.getElementById('hero-line');
  var heroPath = document.getElementById('hero-path');
  var pts = [], lineLen = 0, lineDrawn = false, breathPhase = 0, frag = 0;
  var lastMX = null, lastMY = null;
  function buildLine() {
    var r = heroSvg.getBoundingClientRect();
    var w = r.width, h = r.height;
    heroSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var y0 = h * 0.52, mY = h * 0.42, n = 60;
    pts = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n, x = t * w;
      var by = t < 0.48 ? y0 + (mY - y0) * (t / 0.48) : mY + (y0 - mY) * ((t - 0.48) / 0.52);
      pts.push({ x: x, by: by, w: Math.sin(i * 2.7) * 2.5 + Math.cos(i * 1.3) * 1.5 });
    }
    setSVG(0);
    lineLen = heroPath.getTotalLength();
    if (!lineDrawn && !reduced) {
      heroPath.style.strokeDasharray = lineLen;
      heroPath.style.strokeDashoffset = lineLen;
    }
  }
  function setSVG(b) {
    var d = 'M';
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      d += (i ? ' L' : '') + p.x.toFixed(1) + ' ' + (p.by + p.w + b * Math.sin(i * 0.35)).toFixed(1);
    }
    heroPath.setAttribute('d', d);
  }
  if (heroSvg && heroPath) {
    buildLine();
    if (reduced) {
      heroPath.style.strokeDasharray = 'none';
      heroPath.style.strokeDashoffset = '0';
      heroPath.style.opacity = '0.35';
      lineDrawn = true;
    } else {
      var t0 = null;
      (function draw(ts) {
        if (!t0) t0 = ts;
        var t = Math.min((ts - t0) / 4500, 1);
        var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        heroPath.style.strokeDashoffset = lineLen * (1 - e);
        heroPath.style.opacity = 0.15 + e * 0.2;
        if (t < 1) requestAnimationFrame(draw);
        else { lineDrawn = true; heroPath.style.strokeDasharray = 'none'; }
      })(performance.now());
      (function breathe() {
        breathPhase += 0.015;
        setSVG(Math.sin(breathPhase) * 3);
        frag *= 0.96;
        if (lineDrawn) {
          if (frag > 0.02) {
            heroPath.style.strokeDasharray = (12 + (1 - frag) * 40) + ' ' + (frag * 18);
            heroPath.style.strokeDashoffset = '0';
          } else heroPath.style.strokeDasharray = 'none';
        }
        requestAnimationFrame(breathe);
      })();
      if (!isCoarse) {
        var hero = document.getElementById('hero');
        hero.addEventListener('mousemove', function (e) {
          if (lastMX !== null) {
            var dx = e.clientX - lastMX, dy = e.clientY - lastMY;
            frag = Math.min(1, frag + Math.sqrt(dx * dx + dy * dy) * 0.008);
          }
          lastMX = e.clientX; lastMY = e.clientY;
        });
        hero.addEventListener('mouseleave', function () { lastMX = null; });
      }
    }
    window.addEventListener('resize', function () {
      buildLine();
      if (lineDrawn) {
        heroPath.style.strokeDasharray = 'none';
        heroPath.style.strokeDashoffset = '0';
        heroPath.style.opacity = '0.35';
      }
    });
  }

  var sentences = [
    "Wie is iedereen, als we zeggen \u2018iedereen\u2019?",
    "Wat vraagt het van een samenleving om samen iets te beslissen?",
    "Wat doe je als een vraag iedereen tegelijk aangaat?",
    "Welk gesprek moet er vandaag plaatsvinden om morgen een besluit te kunnen nemen?",
    "Wie staat morgen aan de keukentafel te wachten op dit antwoord?"
  ];
  var idx = 2, wiensOn = false;
  var sEl = document.getElementById('act1-sentence');
  var bB = document.getElementById('btn-breder');
  var bS = document.getElementById('btn-scherper');
  var bW = document.getElementById('btn-wiens');
  var labelsEl = document.getElementById('act1-labels');
  function setAct1() {
    if (!sEl) return;
    sEl.classList.add('fading');
    setTimeout(function () {
      sEl.textContent = sentences[idx];
      sEl.classList.remove('fading');
    }, reduced ? 0 : 200);
    bB.classList.toggle('disabled', idx <= 0);
    bB.setAttribute('aria-disabled', idx <= 0);
    bS.classList.toggle('disabled', idx >= sentences.length - 1);
    bS.setAttribute('aria-disabled', idx >= sentences.length - 1);
  }
  if (bB) bB.addEventListener('click', function (e) { e.preventDefault(); if (idx > 0) { idx--; setAct1(); } });
  if (bS) bS.addEventListener('click', function (e) { e.preventDefault(); if (idx < sentences.length - 1) { idx++; setAct1(); } });
  if (bW) bW.addEventListener('click', function (e) {
    e.preventDefault(); wiensOn = !wiensOn;
    labelsEl.classList.toggle('active', wiensOn);
    labelsEl.setAttribute('aria-hidden', !wiensOn);
    bW.setAttribute('aria-pressed', wiensOn);
  });
  setAct1();

  var ranges = [
    { m: 15, t: "Alles staat open. Er wordt veel gepraat. Er ligt nog niets." },
    { m: 35, t: "Iedereen voelt de vraag. Niemand durft haar te formuleren." },
    { m: 60, t: "Er ligt een richting. Niet iedereen herkent haar al." },
    { m: 85, t: "De koers ligt. Wie twijfelt, blijft stil." },
    { m: 100, t: "De koers is een feit. De ruimte is gesloten." }
  ];
  var slider = document.getElementById('act2-slider');
  var a2s = document.getElementById('act2-sentence');
  var curText = '';
  function a2Update() {
    if (!slider || !a2s) return;
    var v = +slider.value, txt = ranges[ranges.length - 1].t;
    for (var i = 0; i < ranges.length; i++) { if (v <= ranges[i].m) { txt = ranges[i].t; break; } }
    if (txt === curText) return;
    curText = txt;
    if (reduced) { a2s.textContent = txt; return; }
    a2s.classList.add('fading');
    setTimeout(function () { a2s.textContent = txt; a2s.classList.remove('fading'); }, 125);
  }
  if (slider) { slider.addEventListener('input', a2Update); a2Update(); }

  var obsMap = {
    'vraag-vakmanschap': "\u201CEen scherpe vraag zonder vakmanschap is een wens. Vakmanschap zonder scherpe vraag is een oplossing voor niets.\u201D",
    'vraag-ervaring': "\u201CWie een vraag al ooit zonder woorden heeft gesteld, kent haar beter dan wie haar bedenkt.\u201D",
    'vraag-durven': "\u201CEen vraag stellen is kiezen wat je niet doet.\u201D",
    'vakmanschap-ervaring': "\u201CVakmanschap verklaart. Ervaring weegt.\u201D",
    'vakmanschap-durven': "\u201CHoe meer je weet, hoe beter je weet wat kan mislukken. Durven begint daar.\u201D",
    'ervaring-durven': "\u201CWie het een keer heeft meegemaakt, weet wat het kost om er opnieuw aan te beginnen.\u201D"
  };
  var obsEl = document.getElementById('act3-observation');
  var svg3 = document.getElementById('act3-svg');
  var curObs = '';
  var nms = ['vraag', 'vakmanschap', 'ervaring', 'durven'];
  var rp = { vraag: [100, 80], vakmanschap: [300, 80], ervaring: [100, 280], durven: [300, 280] };
  var nd = {}, ne = {};
  var edg = [['vraag','vakmanschap'],['vraag','ervaring'],['vraag','durven'],['vakmanschap','ervaring'],['vakmanschap','durven'],['ervaring','durven']];
  var rl = {};
  nms.forEach(function (n) {
    var r = rp[n];
    nd[n] = { x: r[0], y: r[1], vx: 0, vy: 0, rx: r[0], ry: r[1], drag: false };
    ne[n] = svg3 ? svg3.querySelector('[data-node="' + n + '"]') : null;
  });
  edg.forEach(function (e) {
    var a = rp[e[0]], b = rp[e[1]];
    rl[e[0] + '-' + e[1]] = Math.sqrt((a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]));
  });
  var vL = svg3 ? svg3.querySelectorAll('#act3-lines line') : [];
  var hL = svg3 ? svg3.querySelectorAll('#act3-hitlines line') : [];
  function step() {
    edg.forEach(function (e) {
      var a = nd[e[0]], b = nd[e[1]];
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx*dx + dy*dy) || 1;
      var f = (d - rl[e[0]+'-'+e[1]]) * 0.003, fx = (dx/d)*f, fy = (dy/d)*f;
      if (!a.drag) { a.vx += fx; a.vy += fy; }
      if (!b.drag) { b.vx -= fx; b.vy -= fy; }
    });
    nms.forEach(function (n) {
      var o = nd[n]; if (o.drag) return;
      o.vx += (o.rx - o.x) * 0.02; o.vy += (o.ry - o.y) * 0.02;
    });
    for (var i = 0; i < 4; i++) for (var j = i+1; j < 4; j++) for (var k = j+1; k < 4; k++) {
      [i,j,k].forEach(function (mi, idx2) {
        var oi = [i,j,k].filter(function(_,ii){return ii!==idx2;});
        var m = nd[nms[mi]], a = nd[nms[oi[0]]], b = nd[nms[oi[1]]];
        if (m.drag) return;
        var abx = b.x-a.x, aby = b.y-a.y, al = Math.sqrt(abx*abx+aby*aby)||1;
        var dot = ((m.x-a.x)*abx + (m.y-a.y)*aby) / (al*al);
        if (dot < 0 || dot > 1) return;
        var px = m.x - (a.x+dot*abx), py = m.y - (a.y+dot*aby);
        var pd = Math.sqrt(px*px+py*py) || 0.1;
        if (pd < 40) { var p = 0.015*(40-pd); m.vx += (px/pd)*p; m.vy += (py/pd)*p; }
      });
    }
    nms.forEach(function (n) {
      var o = nd[n]; if (o.drag) { o.vx = 0; o.vy = 0; return; }
      o.vx *= 0.88; o.vy *= 0.88; o.x += o.vx; o.y += o.vy;
      o.x = Math.max(30, Math.min(370, o.x)); o.y = Math.max(30, Math.min(330, o.y));
    });
  }
  function render() {
    nms.forEach(function (n) {
      var o = nd[n], g = ne[n]; if (!g) return;
      g.querySelector('circle').setAttribute('cx', o.x);
      g.querySelector('circle').setAttribute('cy', o.y);
      var t = g.querySelector('text'); t.setAttribute('x', o.x); t.setAttribute('y', o.y + 4);
    });
    edg.forEach(function (e, i) {
      var a = nd[e[0]], b = nd[e[1]];
      [vL[i], hL[i]].forEach(function (l) {
        if (!l) return;
        l.setAttribute('x1', a.x); l.setAttribute('y1', a.y);
        l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
      });
    });
  }
  var phys = true;
  function loop() {
    if (!phys) return;
    if (!reduced) step();
    render();
    requestAnimationFrame(loop);
  }
  if (svg3) {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        phys = en[0].isIntersecting;
        if (phys) requestAnimationFrame(loop);
      }, { threshold: 0 }).observe(document.getElementById('act-3'));
    }
    requestAnimationFrame(loop);
    var dragN = null, svgPt = svg3.createSVGPoint();
    function toSVG(e) {
      var tc = e.touches ? e.touches[0] : e;
      svgPt.x = tc.clientX; svgPt.y = tc.clientY;
      var ctm = svg3.getScreenCTM();
      return ctm ? svgPt.matrixTransform(ctm.inverse()) : { x: 0, y: 0 };
    }
    nms.forEach(function (n) {
      var el = ne[n];
      function start(e) { e.preventDefault(); dragN = n; nd[n].drag = true; if (!phys) { phys = true; requestAnimationFrame(loop); } }
      el.addEventListener('mousedown', start);
      el.addEventListener('touchstart', start, { passive: false });
    });
    document.addEventListener('mousemove', function (e) {
      if (!dragN) return;
      var p = toSVG(e);
      nd[dragN].x = Math.max(30, Math.min(370, p.x));
      nd[dragN].y = Math.max(30, Math.min(330, p.y));
    });
    document.addEventListener('touchmove', function (e) {
      if (!dragN) return;
      var p = toSVG(e);
      nd[dragN].x = Math.max(30, Math.min(370, p.x));
      nd[dragN].y = Math.max(30, Math.min(330, p.y));
    }, { passive: false });
    document.addEventListener('mouseup', function () { if (dragN) { nd[dragN].drag = false; dragN = null; } });
    document.addEventListener('touchend', function () { if (dragN) { nd[dragN].drag = false; dragN = null; } });
    function showObs(pair) {
      var t = obsMap[pair] || '';
      if (t === curObs) return; curObs = t;
      if (reduced || !t) { obsEl.textContent = t || '\u00A0'; return; }
      obsEl.classList.add('fading');
      setTimeout(function () { obsEl.textContent = t; obsEl.classList.remove('fading'); }, 150);
    }
    function clearObs() {
      if (!curObs) return; curObs = '';
      if (reduced) { obsEl.innerHTML = '&nbsp;'; return; }
      obsEl.classList.add('fading');
      setTimeout(function () { obsEl.innerHTML = '&nbsp;'; obsEl.classList.remove('fading'); }, 150);
    }
    hL.forEach(function (hl) {
      var pair = hl.getAttribute('data-pair');
      var vl = svg3.querySelector('#act3-lines line[data-pair="' + pair + '"]');
      hl.addEventListener('mouseenter', function () { vl.classList.add('highlight'); showObs(pair); });
      hl.addEventListener('mouseleave', function () { vl.classList.remove('highlight'); clearObs(); });
      hl.addEventListener('touchstart', function (e) {
        e.preventDefault();
        if (isCoarse) { vl.classList.add('tap-feedback'); setTimeout(function () { vl.classList.remove('tap-feedback'); }, 300); }
        if (curObs === obsMap[pair]) { vl.classList.remove('highlight'); clearObs(); }
        else { vL.forEach(function (l) { l.classList.remove('highlight'); }); vl.classList.add('highlight'); showObs(pair); }
      }, { passive: false });
      hl.setAttribute('tabindex', '0');
      hl.setAttribute('role', 'button');
      var nn = pair.split('-');
      hl.setAttribute('aria-label', 'Verbinding tussen ' + nn[0] + ' en ' + nn[1]);
      hl.addEventListener('focus', function () { vl.classList.add('highlight'); showObs(pair); });
      hl.addEventListener('blur', function () { vl.classList.remove('highlight'); clearObs(); });
    });
  }

  if (!reduced) {
    var fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length && 'IntersectionObserver' in window) {
      var fo = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); fo.unobserve(e.target); } });
      }, { threshold: 0.1 });
      fadeEls.forEach(function (el) { fo.observe(el); });
    } else if (fadeEls.length) fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  if (isCoarse) {
    document.addEventListener('touchstart', function (e) {
      var t = e.target.closest('a, button, [role="button"]');
      if (t) { t.classList.add('tap-feedback'); setTimeout(function () { t.classList.remove('tap-feedback'); }, 300); }
    }, { passive: true });
  }
})();
