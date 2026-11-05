/* KAGE — story scenes: pure data (no DOM, canvas or audio), read by Logic and played by StoryPlayer (68-story.js).

   A scene is an ordered list of steps, played one after another:
     { say: speakerId, text }            a dialogue line in the bottom panel: portrait medallion, name, typewriter text.
                                          Speakers are SPEAKERS in 52-story-art.js (kage, rem, takashi, raikon, akari,
                                          witness, narrator, recording, survivor, order). Optional `name` overrides the shown name
                                          (for example 'Young Rem'); optional `memory: true` styles just this line.
     { illus: illustrationId, caption? } shows a full-screen illustration (ILLUSTRATIONS in 52-story-art.js); it stays
                                          behind the following lines until another `illus` or `{ illus: null }`.
                                          With a caption the step waits for a press (the caption reads as narration);
                                          without one the scene moves straight on.
     { video: 'one-line description' }   the full-screen black VIDEO PLACEHOLDER card. Exactly ONE exists in the game,
                                          at the start of the Prologue (tests/story.test.js holds this). Never add another.
     { wait: seconds }                   a silent beat.
     { flag: name }                      records a story flag on the save (Logic.setStoryFlag), for later choices.
   Scene options: `memory: true` plays the whole scene as a flashback (violet tint, softened panel).

   Scenes are attached by id:
     - to a campaign stage (CAMPAIGN in 10-data.js): `scenes: { before, after, defeat }`
         before  plays as the stage starts, before the fight or stretch begins (a `scene`-kind stage, the Epilogue,
                 is only its `before` scene);
         defeat  plays the moment a boss (or any arena foe) is beaten, before the outro;
         after   plays after a won stage, just before the result screen;
     - to a stretch clue: `clues: [{ id, x, label, scene }]` plays when the clue is picked up.
   Logic.stageScene(stageId, hook) and Logic.clueScene(stageId, clueId) answer which scene plays. */
const SCENES = {
  // ---- Prologue: The Man With No Past (stage prologue.1, Hoshimura) ----
  // Canon kept off-screen here: Rem planted the clues from inside the Core, and "he" in the second message is Takashi.
  // The Prologue never says either; it stays a mystery.
  'prologue.open': {
    steps: [
      { video: 'Kage wakes in the ashes of Hoshimura under a red moon, alone, with no memory of the fire.' },
      { illus: 'hoshimura_ruins', caption: 'Hoshimura. What the fire left of it.' },
      { say: 'kage', text: '...Ash. Still warm.' },
      { say: 'kage', text: 'I know these beams. These roofs. I don’t know how I know them.' },
      { say: 'kage', text: 'My name... Kage. That much stayed. The rest is smoke.' },
      { illus: null },
      { say: 'kage', text: 'A sword at my hip. My hands know its weight. They don’t know why.' },
      { say: 'narrator', text: 'The road runs east through the empty village. Something on it is waiting to be found.' }
    ]
  },
  // Clue 1: a broken recorder in a roadside shrine, looping one phrase.
  'prologue.clue.recording': {
    steps: [
      { say: 'narrator', text: 'A cracked recorder sits in the shrine, its light still blinking. It was left here on purpose.' },
      { say: 'recording', text: '...ssss... find the... kssh... Find the Witness.' },
      { say: 'recording', text: 'Find the Witness. Find the... Find the Witness.' },
      { say: 'kage', text: 'Whose voice is that? It knows me. I can hear it knowing me.' },
      { say: 'kage', text: 'The Witness. Witness to what?' },
      { flag: 'prologue.recording_heard' }
    ]
  },
  // Clue 2: inside a burnt-out house, a photograph with every face scratched away except Rem's.
  'prologue.clue.photograph': {
    steps: [
      { say: 'narrator', text: 'Inside the house, one frame hangs straight on a wall that is barely standing.' },
      { illus: 'photograph', caption: 'Three figures: a tall man, and two boys beside him. Every face is scratched out but one.' },
      { say: 'kage', text: 'That boy... Rem. His name is Rem. I know it the way I know the sword.' },
      { say: 'kage', text: 'And the other boy is me. Someone took a blade to my face. And to his.' },
      { say: 'kage', text: 'Only Rem was left untouched. As if someone wanted me to remember him first.' },
      { illus: null },
      { say: 'kage', text: 'Rem. Brother. Where are you?' },
      { flag: 'prologue.photo_found' }
    ]
  },
  // Clue 3: a second message, scratched into a door beside the road's end.
  'prologue.clue.message': {
    steps: [
      { say: 'narrator', text: 'Words cut into a charred door, fresh as the ash. The same careful hand.' },
      { say: 'narrator', text: '"If you remember everything, he will find you."' },
      { say: 'kage', text: 'He. Who is he?' },
      { say: 'kage', text: 'Someone took my past and left me a trail instead. A warning, and a way forward.' },
      { flag: 'prologue.warning_read' }
    ]
  },
  // The road out: Kage follows a trail of violet memory ash. Closes the Prologue; Act I opens after it.
  'prologue.close': {
    steps: [
      { say: 'kage', text: 'That thing wore my stance. It breathed when I breathed.' },
      { say: 'kage', text: 'And when it broke, it turned to this.' },
      { illus: 'memory_ash', caption: 'Violet ash lifts from the road and drifts east, as if something is waiting for him to follow.' },
      { say: 'kage', text: 'Find the Witness. Find Rem. Remember... but not everything.' },
      { say: 'narrator', text: 'Kage left Hoshimura with no past, following the ash.' },
      { illus: null },
      { flag: 'prologue.complete' }
    ]
  },
  // ---- Act I: The Missing Brother (stages act1.stretch1..4, Yomi's outer districts) ----
  // Survivors say Rem was declared dead ten years ago; the Order's official story is that he betrayed Kage and helped
  // erase his memories. Three clues show the story was edited. Nothing here says who edited it, or why.
  'act1.stretch1.before': {
    steps: [
      { say: 'narrator', text: 'Yomi’s outer districts. Shuttered stalls, blank walls, and an Order lantern on every corner.' },
      { say: 'survivor', text: 'Out of the lantern light, stranger. The Order counts faces after dark.' },
      { say: 'kage', text: 'I’m looking for someone. Rem. A swordsman, younger than me.' },
      { say: 'survivor', text: 'Rem? ...Nobody says that name here. He was declared dead ten years ago. The notice went up on every gate.' },
      { say: 'kage', text: 'Dead.' },
      { say: 'survivor', text: 'So the notice said. It also said there never was a war. Walk carefully.' }
    ]
  },
  // Clue 1: half a mission report under a desk in a gutted Order post.
  'act1.clue.report': {
    steps: [
      { say: 'narrator', text: 'Under a smashed desk in a gutted Order post: a mission report, torn in half.' },
      { say: 'narrator', text: '"Silent War, final day. Assigned: Rem. Kage. Objective: the Co—" The rest of the report is gone.' },
      { say: 'kage', text: 'Both our names. On the same mission.' },
      { say: 'kage', text: 'Not burned. Torn, by hand, right where it mattered.' },
      { flag: 'act1.report_found' }
    ]
  },
  'act1.stretch2.before': {
    steps: [
      { say: 'narrator', text: 'A checkpoint gate. Fresh notices pasted over old ones, layer on layer.' },
      { say: 'order', name: 'Order Herald', text: '"By order of Silence: the traitor Rem betrayed his brother and helped erase his memories. Speak neither name."' },
      { say: 'survivor', text: 'They read it out every morning. Ten years, the same words. As if they’re afraid we’ll forget to forget.' },
      { say: 'kage', text: 'Rem took my memories?' },
      { say: 'survivor', text: 'That’s the official story. Nobody here has ever heard another.' }
    ]
  },
  // Clue 2: two sword cuts under the Order's whitewash, where the record allows only one fighter.
  'act1.clue.marks': {
    steps: [
      { say: 'narrator', text: 'A wall where the Order’s whitewash has flaked away. Underneath, old cuts in the plaster.' },
      { say: 'narrator', text: 'Two sword marks, side by side, from two different blades. The plaque beside them names one man.' },
      { say: 'kage', text: 'One of these is mine. I know the angle the way I know my own hand.' },
      { say: 'kage', text: 'The other was cut by someone standing next to me. Somebody scrubbed him out of the story.' },
      { flag: 'act1.marks_found' }
    ]
  },
  'act1.stretch3.before': {
    steps: [
      { say: 'narrator', text: 'The district registry. The Order burned it floor by floor, then posted guards on the ashes.' },
      { say: 'survivor', text: 'My son’s name was in there. Now he never existed.' },
      { say: 'kage', text: 'What are they burning?' },
      { say: 'survivor', text: 'The Silent War. Every page of it. If nobody wrote it down, it never happened. That’s how the Order keeps the silence.' }
    ]
  },
  // Clue 3: a sealed recorder that survived the registry fire. Takashi orders the Core evacuated. Kage knows the
  // voice but not why; who Takashi is stays for later.
  'act1.clue.recording': {
    steps: [
      { say: 'narrator', text: 'In the registry vault, a sealed recorder survived the fire. Its reel still turns.' },
      { say: 'recording', name: 'Takashi (recording)', text: '...kssh... This is Takashi. Core command, all units.' },
      { say: 'recording', name: 'Takashi (recording)', text: 'Evacuate the Core. Now. Every technician, every guard. Leave the machines running.' },
      { say: 'recording', name: 'Takashi (recording)', text: 'Nobody stays behind. That is an order. Nobody... ssss...' },
      { say: 'kage', text: 'Takashi. I know that voice. I don’t know how.' },
      { say: 'kage', text: 'The Order says nothing ever happened in the Core. Then why did he empty it?' },
      { flag: 'act1.evacuation_heard' }
    ]
  },
  'act1.stretch4.before': {
    steps: [
      { say: 'narrator', text: 'The archive road. Rain, and wet Order banners over a road nobody walks.' },
      { say: 'kage', text: 'A torn report. Two sword marks. A voice ordering everyone out of the Core.' },
      { say: 'kage', text: 'The Order didn’t lose the story of the Silent War. They cut it apart, and cut Rem out of it.' },
      { say: 'narrator', text: 'Beyond the last Order line, someone is waiting at the archive door.' }
    ]
  },
  // Act I boss: Raikon blocks the route to the old military archive. He is an Echo copy, bound to guard it against his will.
  'act1.raikon.before': {
    steps: [
      { illus: null },
      { say: 'narrator', text: 'The route to the old military archive. Rain hisses on a sword that is already drawn.' },
      { say: 'raikon', text: 'So. The man who was supposed to stay buried.' },
      { say: 'kage', text: 'You know me.' },
      { say: 'raikon', text: 'I know what you were. I know what they did to make you forget it.' },
      { say: 'raikon', text: 'The Echo System woke me up and chained me to this door. "Guard the archive." As if I asked to be remembered.' },
      { say: 'kage', text: 'Then step aside.' },
      { say: 'raikon', text: 'I can’t. The binding won’t let me. If you want what’s behind me, you’ll have to cut through what’s left of me.' },
      { say: 'raikon', text: 'Draw, shadow. And don’t you dare hold back.' }
    ]
  },
  // Raikon’s dying words, after the finishing slash; then he dissolves into violet ash (FightSession, 60-engine.js).
  'act1.raikon.defeat': {
    steps: [
      { say: 'raikon', text: '...Heh. So that’s what you still have in you.' },
      { say: 'raikon', text: 'Listen, before the echo lets go. Your brother. Rem. He did not die.' },
      { say: 'kage', text: 'Rem is alive?' },
      { say: 'raikon', text: 'The last time anyone saw him, he was walking into the Core. Alone. He never came out.' },
      { say: 'raikon', text: 'And your memories... they weren’t lost in the fire. They were removed. On purpose.' },
      { say: 'kage', text: 'By who? Why?' },
      { say: 'raikon', text: 'I don’t know if Rem did it to betray you... or to save you. I never got to ask him.' },
      { illus: 'access_token', caption: 'Raikon presses something into Kage’s hand: an archive access token, cracked down the middle.' },
      { say: 'raikon', text: 'Take it. It’s damaged, but the archive door still remembers it.' },
      { flag: 'act1.access_token' },
      { illus: null },
      { say: 'raikon', text: 'Losing to you... it broke the binding. For the first time since they woke me, nobody is holding the chain.' },
      { say: 'raikon', text: 'It feels like rain. Go, shadow. Find him.' }
    ]
  },
  // ---- Interlude: Brothers (stage interlude.spar, Takashi's training yard, a memory) ----
  // The question "who won?" is never answered here; the Epilogue pays it off ("So... who won?" / "I did." /
  // "Keep dreaming."), so these scenes must not say those lines.
  'interlude.spar.before': { memory: true,
    steps: [
      { say: 'narrator', text: 'Hoshimura. Takashi’s yard, years before the fire. The light is warmer than Kage remembers it being.' },
      { say: 'rem', name: 'Young Rem', text: 'Yesterday doesn’t count. You slipped on the wet boards.' },
      { say: 'kage', name: 'Young Kage', text: 'You slipped. I just happened to be standing where you fell.' },
      { say: 'rem', name: 'Young Rem', text: 'Then I’ll fall on you again. Faster this time. Father, watch!' },
      { say: 'takashi', text: 'I am watching. Bokken only. Stance first, then the form, the way I taught you. Both of you.' },
      { say: 'rem', name: 'Young Rem', text: 'Stance, dash, rise, spin, land, flow. I could do it asleep.' },
      { say: 'kage', name: 'Young Kage', text: 'You do do it asleep. That’s why you leave your left side open.' },
      { say: 'takashi', text: 'Enough talking. Begin.' }
    ]
  },
  'interlude.spar.after': { memory: true,
    steps: [
      { say: 'takashi', text: 'Rice is getting cold. Swords on the rack. Now.' },
      { say: 'rem', name: 'Young Rem', text: 'But we’re not finished! One more touch and I had him!' },
      { say: 'kage', name: 'Young Kage', text: 'One more touch and you’d be face-down in the dirt.' },
      { say: 'rem', name: 'Young Rem', text: 'Father, tell him. You saw it.' },
      { say: 'takashi', text: 'I saw two boys who still drop their guard when they get angry. Inside.' },
      { say: 'rem', name: 'Young Rem', text: 'This isn’t over. We settle it tomorrow.' },
      { say: 'kage', name: 'Young Kage', text: 'Tomorrow, then.' },
      { say: 'narrator', text: 'They never did settle it. Somewhere in the ash, the question is still waiting.' }
    ]
  },
  // Stub; SAN-44 writes the real Epilogue.
  'epilogue.stub': {
    steps: [
      { illus: 'memory', caption: 'Dawn over the Echo System. The ash has settled.' },
      { say: 'narrator', text: 'The Last Choice is still to be written.' },
      { illus: null }
    ]
  }
};
