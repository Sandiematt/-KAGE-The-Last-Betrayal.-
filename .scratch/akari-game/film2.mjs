// node film2.mjs outdir id:dist:skip:frames:every [...]  -> jobs.json (skip frames after forcing before the first shot)
import fs from 'node:fs';
const outdir = process.argv[2]; fs.mkdirSync(outdir, { recursive: true });
const jobs = [{ q: process.env.Q || 'stage=act2.boss', pre: 60, shots: [] }];
for (const spec of process.argv.slice(3)) {
  const [id, dist, skip, frames, every] = spec.split(':');
  jobs[0].shots.push({ js: `hold(); place(${dist}); adv(40); force('${id}'); adv(${skip})`, out: `${outdir}/${id}_00.png` });
  for (let i = 1; i < +frames; i++) jobs[0].shots.push({ js: `adv(${every})`, out: `${outdir}/${id}_${String(i).padStart(2, '0')}.png` });
}
fs.writeFileSync(`${outdir}/jobs.json`, JSON.stringify(jobs));
