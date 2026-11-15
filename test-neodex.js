// lancé par le test « local » de NeoDex : vise au clavier, tire, puis tire à la souris (fronde) et vérifie que les tirs sont comptés ;
// puis des paniers marqués (le public se lève), le ballon doré, EN FEU, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const key = k => pj(`document.dispatchEvent(new KeyboardEvent('keydown', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('bkCanvas').getAttribute('aria-label')`);
  const C = code => pj(`(() => { const cv = document.getElementById('bkCanvas'), T = cv.__bk, bk = T.st(); ${code} })()`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('bkCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'panier-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  const ptr = (type, x, y) => pj(`(() => { const c = document.getElementById('bkCanvas'), r = c.getBoundingClientRect(); c.dispatchEvent(new PointerEvent('${type}', {bubbles: true, pointerId: 1, clientX: r.left + ${x} / 160 * r.width, clientY: r.top + ${y} / 200 * r.height})); return 0; })()`);
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  await sleep(500); await shot('0-depart');
  await C(`bk.at.gold = false; return 0;`);  // l'angle et la force sont lus dans la description du canevas : un tir normal
  for (let i = 0; i < 6; i++) await key('ArrowLeft');
  await key('ArrowUp'); await sleep(200);
  if (!/Angle 61°, force 5\.7/.test(await label())) throw new Error('visée au clavier : « ' + (await label()) + ' »');
  await key(' '); await sleep(450); await shot('1-vol');
  await sleep(4500);
  await ptr('pointerdown', 60, 150); await ptr('pointermove', 30, 185); await sleep(200); await shot('2-fronde'); await ptr('pointerup', 30, 185);
  await sleep(5000);
  const l = await label();
  if (!/sur 2 tirs/.test(l)) throw new Error('deux tirs attendus : « ' + l + ' »');
  // un tir sûr d'un endroit fixe, ballon normal puis doré : le doré vaut 3 fois plus ; quatre d'affilée : EN FEU et le public debout
  await pj(`document.getElementById('bkNew').click(), 0`); await sleep(300);
  const fire = async gold => { await C(`bk.mode = 'play'; bk.at = {x: 90, y: 156, gold: ${gold}}; T.shoot(T.aim(90)); return 0;`); for (let i = 0; i < 20 && await C('return !!bk.ball;'); i++) await sleep(250); };
  await fire(false); const s1 = await C('return bk.score;'); await sleep(100); await shot('3-public');
  await C(`bk.at = {x: 90, y: 156, gold: true}; return 0;`); await sleep(300); await shot('4-dore');
  await fire(true); const s2 = await C('return bk.score;');
  if (s1 < 2 || s2 - s1 !== s1 * 3) throw new Error('points : ' + s1 + ' puis ' + s2);
  await fire(false); await fire(false); await sleep(200); await shot('5-en-feu');
  if (await C('return bk.streak;') < 3) throw new Error('pas EN FEU : série ' + await C('return bk.streak;'));
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  await pj(`document.getElementById('bkFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('bkCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('bkCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('bkCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('le jeu dépasse la fenêtre ou reste petit : ' + JSON.stringify(L));
  return l + ' · paniers ' + s1 + ' puis doré +' + (s2 - s1) + ' · EN FEU · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};
