// node film.mjs <ability> <placeDist> <frames> <every> <outdir> [more abilities as id:dist:frames:every]
import fs from 'node:fs';
const specs = process.argv.slice(2, -1).map(s => s.split(':'));
const outdir = process.argv[process.argv.length - 1];
fs.mkdirSync(outdir, { recursive: true });
const jobs = [{ q: 'stage=act2.boss', pre: 60, shots: [] }];
for (const [id, dist, frames, every] of specs) {
  jobs[0].shots.push({ js: `hold(); place(${dist}); s.player.setState&&s.player.setState('idle'); adv(30)`, out: `${outdir}/${id}_00.png` });
  for (let i = 1; i <= +frames; i++) jobs[0].shots.push({ js: i === 1 ? `force('${id}'); adv(${every})` : `adv(${every})`, out: `${outdir}/${id}_${String(i).padStart(2, '0')}.png` });
}
fs.writeFileSync(`${outdir}/jobs.json`, JSON.stringify(jobs));
