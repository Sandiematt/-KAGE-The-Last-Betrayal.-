const path=require('path');const {loadSim}=require(path.resolve('tests/helpers/load-sim.js'));
const S=loadSim({seed:1,exports:['CAMPAIGN','FIGHT_STYLES','BUDO','Budo','AIController','DIR_FORMS','weaponMul']});
for (const wid of ['raikon_tachi','echo_tachi']){const w=S.WEAPONS[wid];console.log(wid,JSON.stringify({moves:w.moves,dirs:w.dirs,counter:w.counter,air:w.air}));}
for (const id of ['c1','c2','c3','ca','c1_fwd','c2_up','c3_down','c2_diagUp','c1_diagDown','c1_dash','ca_airUp','ca_airDown']){const m=S.MOVES[id];if(!m){console.log(id,'none');continue;}console.log(id,JSON.stringify({kind:m.kind,aim:m.aim,t:m.t,dmg:m.dmg,gb:m.gb,kd:m.kd,imp:m.imp,box:m.box,lunge:m.lunge,up:m.up,spike:m.spike,next:m.next}));}
console.log(S.weaponMul('raikon_tachi',1),S.weaponMul('raikon_tachi',3));
const save=S.SaveManager.data=S.Logic.defaultSave();const cfg=S.Logic.stageConfig(save,'act1.boss');console.log(JSON.stringify(cfg).slice(0,400));
const s=new S.FightSession(cfg);const e=s.enemy;console.log('hp',e.maxHp,'dmgMul',e.dmgMul,'wlvl',e.wlvl,'def',e.defense,'scale',e.scale,'speed',e.def.speed);console.log(JSON.stringify(e.ai.p));
