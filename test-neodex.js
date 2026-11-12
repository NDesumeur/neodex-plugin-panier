// lancé par le test « local » de NeoDex : vise au clavier, tire, puis tire à la souris (fronde) et vérifie que les tirs sont comptés
// (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème)
module.exports = async ({ pj, sleep }) => {
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('bkCanvas').getAttribute('aria-label')`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('bkCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'panier-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  const ptr = (type, x, y) => pj(`(() => { const c = document.getElementById('bkCanvas'), r = c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('${type}', {bubbles: true, pointerId: 1, clientX: r.left + ${x} / 160 * r.width, clientY: r.top + ${y} / 200 * r.height})); return 0; })()`);
  await sleep(500); await shot('0-depart');
  for (let i = 0; i < 6; i++) await key('ArrowLeft');
  await key('ArrowUp'); await sleep(200);
  if (!/Angle 61°, force 5\.7/.test(await label())) throw new Error('visée au clavier : « ' + (await label()) + ' »');
  await key(' '); await sleep(450); await shot('1-vol');
  await sleep(4500);
  await ptr('pointerdown', 60, 150); await ptr('pointermove', 30, 185); await sleep(200); await shot('2-fronde'); await ptr('pointerup', 30, 185);
  await sleep(5000); await shot('3-suite');
  const l = await label();
  if (!/sur 2 tirs/.test(l)) throw new Error('deux tirs attendus : « ' + l + ' »');
  if (process.env.NEO_SHOTS) {  // un vrai panier : calcule un tir qui marque avec la physique du jeu, règle angle et force au clavier, tire
    const src = require('fs').readFileSync(require('path').join(process.env.NEO_LOCAL || __dirname, 'index.js'), 'utf8');
    const BK = eval('(' + src.match(/const BK = (\{[^;]*\});/)[1] + ')'), bkHoop = eval('(' + src.match(/const bkHoop = ([^\n]*);/)[1] + ')'), bkVel = eval('(' + src.match(/const bkVel = ([^\n]*);/)[1] + ')');
    const bkStep = eval('(' + src.match(/function bkStep[\s\S]*?\n}\n/)[0] + ')');
    const m = /Angle (\d+)°, force ([\d.]+), tireur à (\d+)/.exec(await label()), x = +m[3];
    let best = null;
    for (let a = 30; a <= 80 && !best; a++) for (let p = 40; p <= 80 && !best; p++) { const v = bkVel(a, p / 10), b = {x: x + 3, y: BK.FLOOR - 30, vx: v.vx, vy: v.vy, spin: 0, age: 0}; for (let t = 0; t < 300; t++) { if (bkStep(b, bkHoop(0, t)) === 'in') { best = [a, p]; break; } if (b.x > BK.W + 10 || b.bounce) break; } }
    if (best) {
      for (let a = +m[1]; a !== best[0]; a += a < best[0] ? 1 : -1) await key(a < best[0] ? 'ArrowLeft' : 'ArrowRight');
      for (let p = Math.round(+m[2] * 10); p !== best[1]; p += p < best[1] ? 1 : -1) await key(p < best[1] ? 'ArrowUp' : 'ArrowDown');
      await sleep(150); await shot('4-visee'); await key(' ');
      for (let i = 0; i < 40; i++) { await sleep(100); if (/[1-9]\d* paniers? sur|1 paniers/.test(await label())) break; }
      await sleep(100); await shot('5-panier');
    }
  }
  return l;
};
