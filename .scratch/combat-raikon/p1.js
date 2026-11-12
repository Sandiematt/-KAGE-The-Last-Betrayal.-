const { loadSim } = require('../../tests/helpers/load-sim');
const DT=1/60;
function fight(stage, seed){
  const S = loadSim({ seed: seed || 11, exports: ['FIGHT_STYLES', 'Budo'] });
  S.SaveManager.data = S.Logic.defaultSave();
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  S.Game.finishFight = () => {};
  const s = new S.FightSession(S.Logic.stageConfig(S.SaveManager.data, stage));
  for (let i = 0; i < 900 && s.phase !== 'fight'; i++) { s.phaseT = Math.max(s.phaseT, 4); s.step(DT); }
  const e = s.enemy, p = s.player;
  e.ai.decide = () => {}; e.ai.tryAbility = () => false; e.ai.respond = () => {}; e.ai.spamPunish = () => false; e.ai.update = () => {};
  return {S,s,e,p};
}
for (const [stage,id] of [['act1.boss','ichiNoTachi'],['core.echo1','hollowIchi']]) {
  const {S,s,e,p}=fight(stage);
  e.x=0;p.x=330;e.facing=1;p.facing=-1;e.setState('idle');p.setState('idle');s.step(DT);
  p.maxHp=p.hp=1000;
  S.BOSS_ABILITIES[id].run(e,s,e.ai,p);
  let t=0,at=null;
  for(let i=0;i<120;i++){t+=DT;if(at==null&&e.abil&&e.abil.go)at=t;s.step(DT);}
  console.log(stage,id,'at',at,'dealt',1000-p.hp,'dmgMul',e.dmgMul,'maxhp',e.maxHp,'crit',!!s.lastCrit, 'p.hp',p.hp, 'windup', e.ai.p.windup);
}
for (const [stage,id] of [['act1.boss','ichiNoTachi'],['core.echo1','hollowIchi']]) {
  const {S,s,e,p}=fight(stage);
  e.x=0;p.x=330;e.facing=1;p.facing=-1;e.setState('idle');p.setState('idle');s.step(DT);
  p.maxHp=p.hp=1000;
  const o=S.Combat.area; S.Combat.area=function(w,f,b,opt){console.log(' area',JSON.stringify({dmg:opt.dmg,gb:opt.gb})); return o.apply(this,arguments)};
  S.BOSS_ABILITIES[id].run(e,s,e.ai,p);
  for(let i=0;i<120;i++){s.step(DT);}
  console.log(stage,'p.hp',p.hp,'armor?',p.armor,p.defense,p.dmgTaken);
}
