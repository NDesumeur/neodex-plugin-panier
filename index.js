// Panier : du basket en 60 secondes : vise, tire, marque.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Panier</span><span class="hint">Tire la souris en arrière et lâche · ou ← → angle, ↑ ↓ force, Espace tir · P : pause</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="bkCanvas" width="160" height="200" role="img" aria-label="Panier"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="bkStats"></div></div>
      <div class="row"><button class="btn main" id="bkNew">NOUVELLE PARTIE</button><button class="btn" id="bkFs">PLEIN ÉCRAN</button></div>
      <div class="hint">Soixante secondes pour marquer le plus de points. Clique, tire en arrière comme un lance-pierre et lâche : les points blancs montrent le début du tir. Le ballon rebondit sur le cercle et la planche. Un panier vaut 2 points, 3 derrière la ligne, et 1 de plus s'il ne touche rien. Trois paniers d'affilée : EN FEU, les suivants comptent double. Dès 16 points, le panier se met à bouger. Un tir parti avant la sirène compte encore. Le ballon doré vaut 3 fois plus.</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:1 1 360px;min-width:min(100%,320px);position:relative}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{width:min(100vw,calc(100vh * 160 / 200))}
.gameBox canvas{width:min(100%,max(280px,calc((100vh - 170px) * 160 / 200)));height:auto;aspect-ratio:160/200;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}


export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: "PANIER", T: {"k": "#0c0a12", "k2": "#16121e", "fill": "#221c2c", "fillOn": "#2e263a", "hl": "#3a3046", "line": "#62566e", "acc": "#ff8a3a", "accL": "#ffd0a0", "accS": "#c85a1a", "accD": "#3a1a08", "rivet": "#f0f0f8", "btn": "#3a3046", "btnHi": "#62566e", "btnLo": "#16121e", "btnHov": "#443852", "btnHovHi": "#82768e", "text": "#f4f0f8", "muted": "#c0b8cc", "acc2": "#7ee07a", "gold": "#ffd84a", "orange": "#ff8a3a", "red": "#ff4a3a", "green": "#7ee07a", "green2": "#2f8a3a", "bg": "#100c16", "bgDot": "#221c2c", "bgDot2": "#16121e", "spark": "#3a1a08", "spark2": "#ff8a3a", "tile": ["................", "...:............", "................", "..........+.....", "................", "................", ".....:..........", "................", "................", ".............:..", "................", "..+.............", "................", ".........:......", "................", "................"]},
  emblem: ["..kkkkkkkk..", ".kwwwwwwwwk.", ".kwwkkkkwwk.", ".kwwwwwwwwk.", "..koooooook.", "..kkkkkkkk..", "...kwkwkw...", "....kwkw....", "....kooo....", "...kooOok...", "...koooOk...", "....kkkk...."],
  icons: [[/^NOUVELLE/, 'play'], [/^PLEIN/, 'full'], [/^RECORDS/, 'crown']] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (v > (b ?? 0)) {  // un score nul n'est jamais un record
    games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

/* ---------- Panier : du basket en 60 secondes. Tire la souris en arrière pour viser (ou flèches + Espace), le ballon rebondit sur le cercle et la planche.
   2 points, 3 derrière la ligne, +1 sans toucher le cercle ; trois paniers d'affilée : EN FEU, les points comptent double ---------- */
const BK = {W: 160, H: 200, HUD: 12, FLOOR: 186, R: 5, G: .16, LINE3: 64, VMAX: 8, TIME: 3600};
// une nouvelle partie garde le même objet : la boucle du jeu (gameLoop) continue de tourner dessus
const renew = (old, o) => { if (!old) return o; for (const k of Object.keys(old)) if (k !== 'raf') delete old[k]; return Object.assign(old, o); };
const bks = gstore('panier', {games: 0, baskets: 0, streak: 0});
let bk = null, bkac = null, bkMute = false;
function bkBeep(f, d, type = 'square', slide = 0, vol = .04) { if (bkMute) return; try { bkac ??= new AudioContext(); const o = bkac.createOscillator(), g = bkac.createGain(), t = bkac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(bkac.destination); o.start(t); o.stop(t + d); } catch {} }
// le panier : hauteur du cercle (elle bouge de haut en bas à partir de 16 points, plus vite après 40)
const bkHoop = (score, t) => ({y: 84 + (score >= 16 ? Math.round(Math.sin(t / (score >= 40 ? 40 : 70)) * 12) : 0), f: 124, b: 144, board: 146});
function bkSpawn(r) { const x = 14 + Math.floor(r() * 92); return {x, y: BK.FLOOR - 30, gold: r() < .14}; }
function bkNew() {
  const g = bk?.g, rnd = seeded(Date.now() % 1e9);
  bk = renew(bk, {g, mode: 'ready', tick: 0, seen: 0, t: 0, rnd, time: BK.TIME, score: 0, streak: 0, best: 0, made: 0, shots: 0, at: bkSpawn(rnd), ball: null, ang: 55, pow: 5.6, drag: null, pops: [], net: 0, dead: 0, record: false, over: false});
  bkInfo();
}
// un pas de physique : gravité, cercle (deux points), planche, sol ; renvoie 'in' quand le ballon passe dans le cercle par le haut
function bkStep(b, h) {
  const {R, G, FLOOR} = BK, py = b.y;
  b.vy += G; b.x += b.vx; b.y += b.vy; b.spin += b.vx * .12;
  for (const cx of [h.f, h.b]) {
    const dx = b.x - cx, dy = b.y - h.y, d = Math.hypot(dx, dy), m = R + 1.5;
    if (d < m && d > 0) { const nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny; b.x = cx + nx * m; b.y = h.y + ny * m; if (vn < 0) { b.vx -= 1.55 * vn * nx; b.vy -= 1.55 * vn * ny; b.vx *= .92; b.vy *= .92; } if (!b.rim) b.hit = 1; b.rim = 1; }
  }
  if (b.x + R > h.board && b.y > h.y - 28 && b.y < h.y + 6) {  // rien ne passe à travers la planche, même poussé par le cercle
     b.x = h.board - R; b.vx = -Math.abs(b.vx) * .6; b.board = 1; if (!b.rim) b.hit = 2; }
  if (b.x < R) { b.x = R; b.vx = Math.abs(b.vx) * .7; }
  if (b.y + R > FLOOR) { b.y = FLOOR - R; if (b.vy > .6) b.bounce = (b.bounce || 0) + 1; b.vy = -b.vy * .55; b.vx *= .8; if (Math.abs(b.vy) < .5) b.vy = 0; }
  b.age++;
  if (!b.in && py < h.y && b.y >= h.y && b.vy > 0 && b.x > h.f + 1 && b.x < h.b - 1) { b.in = 1; return 'in'; }
  return null;
}
const bkVel = (ang, pow) => ({vx: Math.cos(ang * Math.PI / 180) * pow, vy: -Math.sin(ang * Math.PI / 180) * pow});
function bkShoot(v) {
  if (bk.mode === 'ready') bk.mode = 'play';
  if (bk.mode !== 'play' || bk.ball || bk.over) return;
  bk.ball = {x: bk.at.x + 3, y: bk.at.y, vx: v.vx, vy: v.vy, spin: 0, age: 0, from3: bk.at.x < BK.LINE3, gold: !!bk.at.gold}; bk.shots++;
  bkBeep(240, .08, 'triangle', 420, .05);
}
function bkClap(n) { if (bkMute) return; for (let i = 0; i < n; i++) setTimeout(() => bkBeep(1400 + Math.random() * 1600, .025, 'square', 0, .018), i * 45 + Math.random() * 30); }
function bkUpdate() {
  bk.t++; if (bk.time > 0) bk.time--; if (bk.cheer > 0) bk.cheer--;
  if (bk.streak >= 3 && bk.t % 40 === 0) bkClap(3);  // EN FEU : le public applaudit sans s'arrêter
  for (const p of bk.pops) { p.t--; p.y -= .3; } bk.pops = bk.pops.filter(p => p.t > 0); if (bk.net) bk.net--;
  const b = bk.ball, h = bkHoop(bk.score, bk.t);
  if (b) {
    const was = b.bounce || 0;
    if (bkStep(b, h) === 'in') {
      bk.streak++; bk.best = Math.max(bk.best, bk.streak); bk.made++; bk.net = 30;
      const fire = bk.streak > 3, pts = ((b.from3 ? 3 : 2) + (b.rim || b.board ? 0 : 1)) * (fire ? 2 : 1) * (b.gold ? 3 : 1);
      bk.score += pts; bk.pops.push({text: '+' + pts + (b.gold ? ' DORÉ !' : b.rim || b.board ? '' : ' PROPRE !'), x: h.f + 10, y: h.y - 14, t: 50, c: b.gold ? '#fff4a0' : fire ? '#ff8a3a' : '#ffd84a'});
      bk.cheer = fire || b.gold ? 120 : 60; if (fire || b.gold || bk.streak === 3) bkClap(fire ? 14 : 8);
      [523, 784].forEach((f, i) => setTimeout(() => bkBeep(f, .1), i * 70)); if (bk.streak === 3) setTimeout(() => bkBeep(1047, .25, 'square', 1568), 160);
    }
    if (b.hit === 1) { bkBeep(180, .05, 'square', 0, .05); b.hit = 0; } else if (b.hit === 2) { bkBeep(120, .06, 'triangle', 0, .06); b.hit = 0; }
    if ((b.bounce || 0) > was) bkBeep(90, .05, 'triangle', 0, .05);
    // le tir est fini : ballon au sol après un rebond, sorti de l'écran, ou trop long
    if ((b.bounce && Math.abs(b.vx) < .4) || b.bounce >= 3 || b.x > BK.W + 10 || b.age > 300) {
      if (!b.in) { if (bk.streak >= 3) bk.pops.push({text: 'FINI LE FEU', x: 80, y: 70, t: 50, c: '#a898b8'}); bk.streak = 0; }
      bk.ball = null; bk.at = bkSpawn(bk.rnd);
    }
  }
  if (bk.time <= 0 && !bk.ball && !bk.over) {  // le buzzer : un tir en l'air compte encore
    bk.over = true; bk.mode = 'over'; bk.dead = 0; bks.games++; bks.baskets += bk.made; bks.streak = Math.max(bks.streak, bk.best);
    bk.record = best('panier', bk.score); saveGames(); bkInfo(); bkBeep(440, .5, 'sawtooth', 220, .06);
  }
}
const BK_PLAYER = ['.s.....s.', '.s.kkk.s.', '.skhhhks.', '.sksssks.', '.wkkskkw.', '.wwwnwww.', '..wwnww..', '..wwwww..', '..bbbbb..', '..bb.bb..', '..ss.ss..', '..ss.ss..', '.kkk.kkk.'];  // bras levés, ballon au-dessus de la tête
function bkBall(g, x, y, spin, gold) {
  const rows = ['..kkk..', '.kooook', 'koOoook', 'kooooOk', 'koooook', '.kooook', '..kkk..'];
  x = Math.round(x) - 3; y = Math.round(y) - 3;
  sprite(g, rows, x, y, gold ? {k: '#6a4a08', o: '#ffc83a', O: '#fff4a0'} : {k: '#3a1a08', o: '#e8742a', O: '#ffb070'});
  if (gold && (bk.tick >> 3) % 3 === 0) { px(g, '#ffffff', x + 7, y - 1); px(g, '#ffffff', x - 2, y + 5); }  // il scintille
  const a = spin % (Math.PI * 2), sx = Math.round(Math.cos(a) * 2);  // la couture tourne avec le ballon
  px(g, '#3a1a08', x + 3 + sx, y + 1, 1, 5); px(g, '#3a1a08', x + 1, y + 3, 5, 1);
}
function bkDraw() {
  const g = bk.g, {W, H, HUD, FLOOR} = BK;
  for (; bk.seen < bk.tick; bk.seen++) if (bk.mode !== 'play') { if (bk.mode === 'over') bk.dead++; }
  g.imageSmoothingEnabled = false;
  // la salle : mur en briques peintes, gradins sombres, parquet en lattes
  px(g, '#2a2440', 0, HUD, W, FLOOR - HUD);
  for (let y = HUD + 4; y < 120; y += 6) for (let x = ((y / 6) % 2) * 6; x < W; x += 12) px(g, '#322b4c', x, y, 11, 5);
  px(g, '#1a1630', 0, 120, W, 22);
  const hype = bk.streak >= 3 ? 2 : bk.cheer > 0 ? 1 : 0;
  for (const [row, y0, dx] of [[0, 124, 0], [1, 132, 3]]) for (let x = 3 + dx; x < W; x += 7) {
    const k = (x * 7 + row * 3) % 5, jump = hype && ((bk.tick >> (hype > 1 ? 2 : 3)) + x + row) % 2 ? -2 : 0, y = y0 + jump;
    const shirt = hype ? ['#c83a5a', '#3a7ad8', '#e8c83a', '#3ab87a', '#e8742a'][k] : '#3a3256';
    px(g, shirt, x, y + 2, 4, 6 - jump); px(g, hype ? ['#d8a070', '#8a5a3a', '#f0c8a0', '#6a4028', '#c88a5a'][k] : '#4a4068', x + 1, y - 1, 2, 3);
    if (hype > 1 || hype && jump) { px(g, shirt, x - 1, y - 2, 1, 4); px(g, shirt, x + 4, y - 2, 1, 4); }  // bras en l'air
  }
  px(g, '#5a3a1a', 0, 142, W, 2);
  px(g, '#b87a3a', 0, 144, W, H - 144); for (let y = 144; y < H; y += 5) { px(g, '#a86a2e', 0, y, W, 1); for (let x = (y * 13) % 41; x < W; x += 41) px(g, '#8a521e', x, y + 1, 1, 4); }
  px(g, '#f0e8d8', 0, FLOOR, W, 1);
  px(g, '#f0e8d8', BK.LINE3, 144, 1, H - 144); pxFont(g, '3', BK.LINE3 - 8, 156, '#f0e8d8', 8);
  // le panier : poteau, planche blanche à carré rouge, cercle orange, filet
  const h = bkHoop(bk.score, bk.t);
  px(g, '#5a5a6a', 150, h.y - 6, 4, FLOOR - h.y + 6); px(g, '#3a3a4a', 153, h.y - 6, 1, FLOOR - h.y + 6); px(g, '#3a3a4a', 146, FLOOR - 3, 12, 3);
  px(g, '#1a1018', h.board - 1, h.y - 31, 6, 38); px(g, '#f0f0f8', h.board, h.y - 30, 4, 36); px(g, '#c83a3a', h.board, h.y - 14, 4, 1); px(g, '#c83a3a', h.board, h.y - 4, 4, 1);
  const sway = bk.net ? Math.round(Math.sin(bk.net * .6) * 2 * bk.net / 30) : 0;
  for (let i = 0; i < 5; i++) { const x0 = h.f + 1 + i * 4.5; for (let j = 0; j < 10; j++) px(g, '#e8e8f0', Math.round(x0 + (10 - i * 2.5) * j / 22 + sway * j / 10), h.y + 2 + j, 1, 1); }
  for (let j = 2; j < 11; j += 3) px(g, '#c8c8d8', h.f + 2 + j / 3, h.y + j, h.b - h.f - 3 - j * 2 / 3, 1);
  const ball = bk.ball, behind = ball && ball.y > h.y && ball.x > h.f && ball.x < h.b;
  if (behind) bkBall(g, ball.x, ball.y, ball.spin, ball.gold);
  px(g, '#1a1018', h.f - 2, h.y - 2, h.b - h.f + 4, 4); px(g, '#ff7a1a', h.f - 1, h.y - 1, h.b - h.f + 2, 2); px(g, '#ffb070', h.f - 1, h.y - 1, h.b - h.f + 2, 1);
  // le joueur, et le ballon dans ses mains tant qu'il n'est pas tiré
  const fire = bk.streak >= 3;
  BK_PLAYER.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = {k: '#1a1018', s: '#d8a070', h: '#5a3a1a', w: fire ? '#ff8a3a' : '#e8e8f0', n: fire ? '#ffd84a' : '#3a5ab8', b: '#2a3a7a'}[r[i]]; if (c) px(g, c, bk.at.x - 5 + i * 2, FLOOR - 26 + j * 2, 2, 2); } });
  if (!ball && !bk.over) {
    bkBall(g, bk.at.x + 3, bk.at.y, 0, bk.at.gold);
    const v = bk.drag ? bk.drag.v : bkVel(bk.ang, bk.pow);
    if (!bk.drag || Math.hypot(v.vx, v.vy) > 1.5) { const p = {x: bk.at.x + 3, y: bk.at.y, vx: v.vx, vy: v.vy}; for (let i = 1; i <= 21; i++) { p.vy += BK.G; p.x += p.vx; p.y += p.vy; if (i % 3 === 0) px(g, '#ffffff', p.x, p.y, 1, 1); } }
  }
  if (ball && !behind) bkBall(g, ball.x, ball.y, ball.spin, ball.gold);
  if (!ball && !bk.over && bk.at.gold) pxFont(g, '×3', bk.at.x + 3, bk.at.y - 7, '#fff4a0', 8, 'center');
  for (const p of bk.pops) pxFont(g, p.text, p.x, p.y, p.c, 8, 'center');
  px(g, '#0e0a14', 0, 0, W, HUD);
  pxFont(g, bk.score + ' pts', 4, 9, '#ffffff', 8);
  if (fire) pxFont(g, 'EN FEU ×2', W / 2, 9, (bk.tick >> 3) % 2 ? '#ff8a3a' : '#ffd84a', 8, 'center');
  const s = Math.ceil(bk.time / 60); pxFont(g, s + ' s', W - 4, 9, s <= 10 && (bk.tick >> 4) % 2 ? '#ff4a3a' : '#a898b8', 8, 'right');
  if (bk.mode === 'ready') gameText(g, W, [['PANIER', '#ffd84a', 12], ['Tire en arrière, lâche : tir', '#ffffff'], ['ou flèches + Espace', '#b8b0c8']], 60);
  if (bk.mode === 'pause') gameText(g, W, [['PAUSE', '#ffd84a', 12], ['Entrée : reprendre', '#b8b0c8']], 80);
  if (bk.mode === 'over' && bk.dead > 40) gameText(g, W, [['FIN DU MATCH', '#ffd84a', 12], [bk.score + ' points', '#ffffff'], [bk.made + ' paniers sur ' + bk.shots, '#ffffff'], [bk.record ? 'NOUVEAU RECORD !' : 'Record ' + (games.best.panier || 0), '#7ee07a'], [bk.dead > 70 ? 'Espace : rejouer' : '', '#b8b0c8']], 60);
  if (bk.tick % 20 === 0) g.canvas.setAttribute('aria-label', 'Panier : ' + bk.score + ' points, ' + bk.made + ' paniers sur ' + bk.shots + ' tirs, ' + Math.ceil(bk.time / 60) + ' secondes' + (bk.over ? ', match fini' : '') + '. Angle ' + bk.ang + '°, force ' + bk.pow.toFixed(1) + ', tireur à ' + bk.at.x + (bk.ball ? ', ballon en l’air' : '') + '.');
}
function bkInfo() {
  $('bkStats').replaceChildren(...[['Meilleur score', games.best.panier || 0], ['Matchs', bks.games], ['Paniers', bks.baskets], ['Plus longue série', bks.streak]].flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));
}
document.addEventListener('keydown', e => {
  if (!view.classList.contains('on') || !bk || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key;
  if (bk.mode === 'over') { if ((k === ' ' || k === 'Enter') && bk.dead > 70) { e.preventDefault(); bkNew(); } return; }
  if (k === 'p' || k === 'P' || k === 'Escape') { if (bk.mode === 'play') bk.mode = 'pause'; else if (bk.mode === 'pause') bk.mode = 'play'; return; }
  if (bk.mode === 'pause') { if (k === 'Enter' || k === ' ') { e.preventDefault(); bk.mode = 'play'; } return; }
  if (k === 'ArrowLeft') { e.preventDefault(); bk.ang = Math.min(85, bk.ang + 1); }
  else if (k === 'ArrowRight') { e.preventDefault(); bk.ang = Math.max(20, bk.ang - 1); }
  else if (k === 'ArrowUp') { e.preventDefault(); bk.pow = Math.min(BK.VMAX, +(bk.pow + .1).toFixed(1)); }
  else if (k === 'ArrowDown') { e.preventDefault(); bk.pow = Math.max(2, +(bk.pow - .1).toFixed(1)); }
  else if (k === ' ' || k === 'Enter') { e.preventDefault(); bkShoot(bkVel(bk.ang, bk.pow)); }
});
{ const cv = $('bkCanvas'), at = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * BK.W, y: (e.clientY - r.top) / r.height * BK.H}; };
  // la fronde : tirer en arrière donne la direction et la force (comme un lance-pierre)
  const vel = (a, b) => { let vx = (a.x - b.x) * .09, vy = (a.y - b.y) * .09; const m = Math.hypot(vx, vy); if (m > BK.VMAX) { vx *= BK.VMAX / m; vy *= BK.VMAX / m; } return {vx, vy}; };
  cv.onpointerdown = e => { e.preventDefault(); if (!bk) return; if (bk.mode === 'over') { if (bk.dead > 70) bkNew(); return; } if (bk.mode === 'pause') bk.mode = 'play'; const p = at(e); bk.drag = {a: p, v: {vx: 0, vy: 0}}; cv.setPointerCapture?.(e.pointerId); };
  cv.onpointermove = e => { if (bk?.drag) bk.drag.v = vel(bk.drag.a, at(e)); };
  cv.onpointerup = e => { if (!bk?.drag) return; const v = vel(bk.drag.a, at(e)); bk.drag = null; if (Math.hypot(v.vx, v.vy) > 1.5) bkShoot(v); }; }
$('bkNew').onclick = () => { bkNew(); $('bkNew').blur(); };
$('bkFs').onclick = () => { $('bkFs').blur(); try { document.fullscreenElement ? document.exitFullscreen() : $('bkCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
{  // vérification : de chaque endroit possible, il existe un tir au clavier (angle au degré, force au dixième) qui marque, panier fixe et panier qui bouge ;
   // et un panier compte bien les points
  const bad = [];
  const scores = (x, ang, pow, sc, t0) => { const v = bkVel(ang, pow), b = {x: x + 3, y: BK.FLOOR - 30, vx: v.vx, vy: v.vy, spin: 0, age: 0}; for (let t = 0; t < 300; t++) { if (bkStep(b, bkHoop(sc, t0 + t)) === 'in') return true; if (b.x > BK.W + 10 || b.bounce) return false; } return false; };
  const find = (x, sc, t0) => { for (let ang = 30; ang <= 80; ang += 2) for (let pow = 4; pow <= BK.VMAX; pow = +(pow + .1).toFixed(1)) if (scores(x, ang, pow, sc, t0)) return [ang, pow]; return null; };
  for (const x of [14, 40, 63, 64, 90, 105]) { if (!find(x, 0, 0)) bad.push('fixe ' + x); if (!find(x, 20, 300)) bad.push('bouge ' + x); }
  const keep = bk, keepS = JSON.stringify(bks), keepB = games.best.panier; bk = null; bkMute = true; bkNew();
  bk.at = {x: 90, y: BK.FLOOR - 30}; const s = find(90, 0, 0); bkShoot(bkVel(...s)); bk.mode = 'play'; for (let i = 0; i < 300 && bk.ball; i++) bkUpdate();
  if (bk.made !== 1 || bk.score < 2) bad.push('panier compté : ' + bk.made + ' / ' + bk.score);
  const one = bk.score; bk.at = {x: 90, y: BK.FLOOR - 30, gold: true}; bk.streak = 0; bkShoot(bkVel(...s)); for (let i = 0; i < 300 && bk.ball; i++) bkUpdate();
  if (bk.score - one !== one * 3) bad.push('ballon doré : ' + (bk.score - one) + ' au lieu de ' + one * 3);
  $('bkCanvas').__bk = {st: () => bk, aim: x => find(x, bk.score, bk.t), shoot: a => bkShoot(bkVel(...a))};
  console.assert(!bad.length, 'panier', bad);
  Object.assign(bks, JSON.parse(keepS)); if (keepB === undefined) delete games.best.panier; else games.best.panier = keepB; bk = keep; bkMute = false;
}
ctx.onOpen(() => {
  if (!bk || !bk.g) { bkNew(); bk.g = $('bkCanvas').getContext('2d'); }
  gameLoop(bk, 'panier', bkUpdate, bkDraw); bkInfo();
});
}
